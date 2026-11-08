import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Card, GameActionLog, GameStage, Player, TownLocation } from '../types/poker';
import { CardView } from './CardView';
import { PlayerSeat } from './PlayerSeat';
import { BettingControls } from './BettingControls';
import { HandStrengthHUD } from './HandStrengthHUD';
import { ThreePokerTable3D } from './ThreePokerTable3D';
import { calculateAiDecision } from '../utils/pokerAi';
import { compareHands, createDeck, evaluateHand } from '../utils/pokerEvaluator';
import { sounds } from '../utils/soundEffects';
import { BOT_NAMES } from '../data/gameData';
import { Trophy, ChevronLeft, FastForward, Play, RefreshCw, Volume2, VolumeX, Sparkles, Eye, Video } from 'lucide-react';

interface PokerTableProps {
  town: TownLocation;
  mode: 'cash' | 'tournament' | 'boss_duel';
  playerChips: number;
  playerHat: string;
  onLeaveTable: () => void;
  onUpdateCareer: (chipsWon: number, xpGained: number, isConquered?: boolean) => void;
}

export const PokerTable: React.FC<PokerTableProps> = ({
  town,
  mode,
  playerChips,
  playerHat,
  onLeaveTable,
  onUpdateCareer,
}) => {
  // Game Table States
  const [players, setPlayers] = useState<Player[]>([]);
  const [communityCards, setCommunityCards] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [pot, setPot] = useState<number>(0);
  const [currentHighBet, setCurrentHighBet] = useState<number>(0);
  const [minRaise, setMinRaise] = useState<number>(town.bigBlind);
  const [stage, setStage] = useState<GameStage>('idle');
  const [activePlayerIdx, setActivePlayerIdx] = useState<number>(-1);
  const [dealerIdx, setDealerIdx] = useState<number>(0);
  const [handNumber, setHandNumber] = useState<number>(1);
  const [actionLogs, setActionLogs] = useState<GameActionLog[]>([]);
  const [winners, setWinners] = useState<Player[]>([]);
  const [winnerMessage, setWinnerMessage] = useState<string>('');
  const [soundMuted, setSoundMuted] = useState<boolean>(!sounds.isEnabled());
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [tournamentRank, setTournamentRank] = useState<number | null>(null);
  const [cameraPreset, setCameraPreset] = useState<'cinematic' | 'overhead' | 'player_pov'>('overhead');
  const [is3DView, setIs3DView] = useState<boolean>(true);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [isDealingCards, setIsDealingCards] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<'logs' | 'strength' | 'leaderboard' | 'leave' | null>(null);

  // Turn management ref to prevent race conditions
  const isProcessingTurn = useRef(false);
  const nextHandTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Players based on mode and town
  const initTable = useCallback(() => {
    const tablePlayers: Player[] = [];

    // Human player (Seat 0, bottom)
    const humanBuyIn = Math.min(playerChips, town.buyIn);
    tablePlayers.push({
      id: 'human-p1',
      name: 'You (Gunslinger)',
      avatar: '🤠',
      hatId: playerHat,
      chips: humanBuyIn > 0 ? humanBuyIn : town.buyIn,
      currentBet: 0,
      totalRoundBet: 0,
      holeCards: [],
      isFolded: false,
      isAllIn: false,
      isSittingOut: false,
      isHuman: true,
      team: 1,
    });

    if (mode === 'boss_duel') {
      // Boss Duel: 1 on 1 Heads-Up with Town Boss
      tablePlayers.push({
        id: `boss-${town.id}`,
        name: town.bossName,
        avatar: town.bossAvatar,
        hatId: town.bossHat,
        chips: town.buyIn * 2,
        currentBet: 0,
        totalRoundBet: 0,
        holeCards: [],
        isFolded: false,
        isAllIn: false,
        isSittingOut: false,
        isHuman: false,
        talkBubble: town.bossQuote,
        team: 2,
      });
    } else {
      // Regular Cash game or Tournament with multiple bots
      const totalSeats = Math.min(town.maxPlayers, 6);
      const shuffledBots = [...BOT_NAMES].sort(() => Math.random() - 0.5);

      for (let i = 1; i < totalSeats; i++) {
        const botTemplate = shuffledBots[i % shuffledBots.length];
        tablePlayers.push({
          id: `bot-${i}`,
          name: botTemplate.name,
          avatar: botTemplate.avatar,
          hatId: botTemplate.hat,
          chips: town.buyIn,
          currentBet: 0,
          totalRoundBet: 0,
          holeCards: [],
          isFolded: false,
          isAllIn: false,
          isSittingOut: false,
          isHuman: false,
          personality: botTemplate.personality,
          team: (i % 2 === 0 ? 1 : 2) as 1 | 2,
        });
      }
    }

    setPlayers(tablePlayers);
    setDealerIdx(0);
    setHandNumber(1);
    setCommunityCards([]);
    setPot(0);
    setStage('idle');
    setWinners([]);
    setWinnerMessage('');
  }, [mode, playerChips, playerHat, town]);

  useEffect(() => {
    initTable();
  }, [initTable]);

  const addLog = (text: string, type: 'action' | 'deal' | 'win' | 'info' = 'info') => {
    setActionLogs((prev) => [
      {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        text,
        type,
      },
      ...prev.slice(0, 30),
    ]);
  };

  // Start a new poker hand
  const startNewHand = useCallback(() => {
    if (nextHandTimeoutRef.current) {
      clearTimeout(nextHandTimeoutRef.current);
      nextHandTimeoutRef.current = null;
    }

    // Filter out busted bots or rebuy
    setPlayers((prev) => {
      const activeEligible = prev.map((p) => {
        if (p.chips <= 0) {
          if (p.isHuman) {
            return { ...p, isSittingOut: true };
          }
          // Rebuy bot for cash games, or eliminate in tournaments
          if (mode === 'tournament') {
            return { ...p, isSittingOut: true };
          }
          return { ...p, chips: town.buyIn, isSittingOut: false };
        }
        return { ...p, isSittingOut: false };
      });

      const remainingInTourney = activeEligible.filter((p) => !p.isSittingOut);
      if (mode === 'tournament' && remainingInTourney.length === 1 && remainingInTourney[0].isHuman) {
        // Tournament Won!
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        sounds.playWin();
        onUpdateCareer(town.tournamentPrize, 500, true);
        setTournamentRank(1);
      }

      return activeEligible;
    });

    const newDeck = createDeck();
    setCommunityCards([]);
    setPot(0);
    setWinners([]);
    setWinnerMessage('');

    // Play Shuffling animation and sound effect
    setIsShuffling(true);
    setIsDealingCards(false);
    sounds.playShuffle();

    // Advance Dealer button
    setDealerIdx((prev) => (prev + 1) % players.length);

    // After 700ms shuffle, start card deal sequence
    setTimeout(() => {
      setIsShuffling(false);
      setIsDealingCards(true);
      sounds.playCardDeal();

      setPlayers((currentPlayers) => {
        const eligible = currentPlayers.filter((p) => !p.isSittingOut);
        if (eligible.length < 2) return currentPlayers;

        const nextDealer = (dealerIdx + 1) % currentPlayers.length;
        const smallBlindIdx = (nextDealer + 1) % currentPlayers.length;
        const bigBlindIdx = (nextDealer + 2) % currentPlayers.length;

        const deckCopy = [...newDeck];
        const updated = currentPlayers.map((p, idx) => {
          if (p.isSittingOut) {
            return { ...p, holeCards: [], isFolded: true, isAllIn: false, currentBet: 0, totalRoundBet: 0, isWinner: false, lastAction: undefined };
          }

          const c1 = deckCopy.pop()!;
          const c2 = deckCopy.pop()!;

          let bet = 0;
          let action: 'blind' | undefined = undefined;

          if (idx === smallBlindIdx) {
            bet = Math.min(p.chips, town.smallBlind);
            action = 'blind';
          } else if (idx === bigBlindIdx) {
            bet = Math.min(p.chips, town.bigBlind);
            action = 'blind';
          }

          return {
            ...p,
            holeCards: [c1, c2],
            chips: p.chips - bet,
            currentBet: bet,
            totalRoundBet: bet,
            isFolded: false,
            isAllIn: p.chips - bet <= 0,
            isWinner: false,
            lastAction: action,
            lastActionAmount: bet > 0 ? bet : undefined,
            talkBubble: undefined,
          };
        });

        setDeck(deckCopy);
        const blindsPot = updated.reduce((sum, p) => sum + p.currentBet, 0);
        setPot(blindsPot);
        setCurrentHighBet(town.bigBlind);
        setMinRaise(town.bigBlind);
        setStage('preflop');

        // Action starts left of Big Blind
        const firstActionIdx = (bigBlindIdx + 1) % currentPlayers.length;
        setActivePlayerIdx(firstActionIdx);

        addLog(`Hand #${handNumber} dealt. Blinds posted ($${town.smallBlind}/$${town.bigBlind}).`, 'deal');

        return updated;
      });

      setTimeout(() => {
        setIsDealingCards(false);
      }, 800);
    }, 700);
  }, [dealerIdx, handNumber, mode, onUpdateCareer, players.length, town]);

  // Evaluate winners and distribute pot at showdown or fold-out
  const resolveShowdown = useCallback((currentPlayers: Player[], commCards: Card[], currentPot: number) => {
    setStage('showdown');
    setActivePlayerIdx(-1);

    const nonFolded = currentPlayers.filter((p) => !p.isFolded && !p.isSittingOut);

    if (nonFolded.length === 1) {
      // Everyone else folded!
      const winner = nonFolded[0];
      const winAmount = currentPot;

      sounds.playWin();
      if (winner.isHuman) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
        onUpdateCareer(winAmount, 80);
      }

      setWinners([winner]);
      setWinnerMessage(`${winner.name} wins $${winAmount.toLocaleString()} (All opponents folded)`);
      addLog(`${winner.name} collected pot of $${winAmount.toLocaleString()}!`, 'win');

      setPlayers((prev) =>
        prev.map((p) => (p.id === winner.id ? { ...p, chips: p.chips + winAmount, isWinner: true, winAmount } : p))
      );
      setPot(0);
      setStage('ended');
      return;
    }

    // Compare 5-card best hands among all showdown players
    const evaluatedPlayers = nonFolded.map((p) => {
      const evaluation = evaluateHand(p.holeCards, commCards);
      return {
        player: p,
        evaluation,
      };
    });

    // Sort descending by hand evaluation
    evaluatedPlayers.sort((a, b) => compareHands(b.evaluation, a.evaluation));

    // Find all players with the top score (could be a split pot)
    const bestScore = evaluatedPlayers[0].evaluation.score;
    const winningEntries = evaluatedPlayers.filter((e) => e.evaluation.score === bestScore);
    const splitAmount = Math.floor(currentPot / winningEntries.length);

    sounds.playWin();
    const humanWon = winningEntries.some((w) => w.player.isHuman);
    if (humanWon) {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.65 } });
      onUpdateCareer(splitAmount, 150, mode === 'boss_duel');
    }

    const winnerNames = winningEntries.map((w) => w.player.name).join(' & ');
    const bestHandDesc = winningEntries[0].evaluation.description;

    setWinners(winningEntries.map((w) => w.player));
    setWinnerMessage(`${winnerNames} win with ${bestHandDesc}!`);
    addLog(`Showdown: ${winnerNames} take pot of $${currentPot.toLocaleString()} with ${bestHandDesc}`, 'win');

    setPlayers((prev) =>
      prev.map((p) => {
        const winningEntry = winningEntries.find((w) => w.player.id === p.id);
        const evalForPlayer = evaluatedPlayers.find((e) => e.player.id === p.id);
        if (winningEntry) {
          return {
            ...p,
            chips: p.chips + splitAmount,
            isWinner: true,
            winAmount: splitAmount,
            handResult: winningEntry.evaluation,
            talkBubble: p.personality?.catchphrases.win ? p.personality.catchphrases.win[0] : 'Yeehaw!',
          };
        }
        return {
          ...p,
          handResult: evalForPlayer?.evaluation,
        };
      })
    );

    setPot(0);
    setStage('ended');
  }, [mode, onUpdateCareer]);

  // Transition to next street (Flop, Turn, River, Showdown)
  const advanceToNextStreet = useCallback((currentPlayers: Player[], nextDeck: Card[], currentComm: Card[], potTotal: number) => {
    // Reset players' current round bets
    const resetPlayers = currentPlayers.map((p) => ({
      ...p,
      currentBet: 0,
      lastAction: undefined,
    }));

    setCurrentHighBet(0);
    setMinRaise(town.bigBlind);

    const activeInHand = resetPlayers.filter((p) => !p.isFolded && !p.isSittingOut && !p.isAllIn);
    const nonFolded = resetPlayers.filter((p) => !p.isFolded && !p.isSittingOut);

    // If only one player left or all remaining players are all-in
    if (nonFolded.length <= 1) {
      resolveShowdown(resetPlayers, currentComm, potTotal);
      return;
    }

    if (stage === 'preflop') {
      // Deal Flop (3 cards)
      const deckCopy = [...nextDeck];
      deckCopy.pop(); // Burn card
      const c1 = deckCopy.pop()!;
      const c2 = deckCopy.pop()!;
      const c3 = deckCopy.pop()!;
      const newComm = [c1, c2, c3];

      setDeck(deckCopy);
      setCommunityCards(newComm);
      setStage('flop');
      sounds.playCardDeal();
      addLog(`Flop dealt: ${c1.rank}${c1.suit} ${c2.rank}${c2.suit} ${c3.rank}${c3.suit}`, 'deal');

      if (activeInHand.length <= 1) {
        // Run out remaining streets automatically
        setTimeout(() => advanceToNextStreet(resetPlayers, deckCopy, newComm, potTotal), 800);
      } else {
        const firstAction = (dealerIdx + 1) % resetPlayers.length;
        setActivePlayerIdx(firstAction);
      }
    } else if (stage === 'flop') {
      // Deal Turn (1 card)
      const deckCopy = [...nextDeck];
      deckCopy.pop(); // Burn card
      const c4 = deckCopy.pop()!;
      const newComm = [...currentComm, c4];

      setDeck(deckCopy);
      setCommunityCards(newComm);
      setStage('turn');
      sounds.playCardDeal();
      addLog(`Turn dealt: ${c4.rank}${c4.suit}`, 'deal');

      if (activeInHand.length <= 1) {
        setTimeout(() => advanceToNextStreet(resetPlayers, deckCopy, newComm, potTotal), 800);
      } else {
        const firstAction = (dealerIdx + 1) % resetPlayers.length;
        setActivePlayerIdx(firstAction);
      }
    } else if (stage === 'turn') {
      // Deal River (1 card)
      const deckCopy = [...nextDeck];
      deckCopy.pop(); // Burn card
      const c5 = deckCopy.pop()!;
      const newComm = [...currentComm, c5];

      setDeck(deckCopy);
      setCommunityCards(newComm);
      setStage('river');
      sounds.playCardDeal();
      addLog(`River dealt: ${c5.rank}${c5.suit}`, 'deal');

      if (activeInHand.length <= 1) {
        setTimeout(() => resolveShowdown(resetPlayers, newComm, potTotal), 800);
      } else {
        const firstAction = (dealerIdx + 1) % resetPlayers.length;
        setActivePlayerIdx(firstAction);
      }
    } else if (stage === 'river') {
      // Go to Showdown
      resolveShowdown(resetPlayers, currentComm, potTotal);
    }
  }, [dealerIdx, resolveShowdown, stage, town.bigBlind]);

  // Handle Player / Bot Action
  const handlePlayerAction = useCallback((
    action: 'fold' | 'check' | 'call' | 'raise' | 'all-in',
    amount: number,
    phrase?: string
  ) => {
    if (activePlayerIdx < 0 || activePlayerIdx >= players.length) return;

    const actingPlayer = players[activePlayerIdx];
    let addedToPot = 0;
    let newHighBet = currentHighBet;
    let newMinRaise = minRaise;

    const updatedPlayers = players.map((p, idx) => {
      if (idx !== activePlayerIdx) return p;

      let updatedP = { ...p, lastAction: action, talkBubble: phrase };

      if (action === 'fold') {
        updatedP.isFolded = true;
        addLog(`${p.name} folded`, 'action');
      } else if (action === 'check') {
        addLog(`${p.name} checked`, 'action');
      } else if (action === 'call') {
        const callNeeded = currentHighBet - p.currentBet;
        const actualCall = Math.min(p.chips, callNeeded);
        updatedP.chips -= actualCall;
        updatedP.currentBet += actualCall;
        updatedP.totalRoundBet += actualCall;
        updatedP.lastActionAmount = actualCall;
        if (updatedP.chips <= 0) updatedP.isAllIn = true;
        addedToPot = actualCall;
        addLog(`${p.name} called $${actualCall.toLocaleString()}`, 'action');
      } else if (action === 'raise' || action === 'all-in') {
        const totalBet = amount;
        const additionalChips = totalBet - p.currentBet;
        const actualAdd = Math.min(p.chips, additionalChips);
        updatedP.chips -= actualAdd;
        updatedP.currentBet += actualAdd;
        updatedP.totalRoundBet += actualAdd;
        updatedP.lastActionAmount = updatedP.currentBet;
        if (updatedP.chips <= 0) updatedP.isAllIn = true;
        addedToPot = actualAdd;

        if (updatedP.currentBet > currentHighBet) {
          const raiseDiff = updatedP.currentBet - currentHighBet;
          newMinRaise = Math.max(town.bigBlind, raiseDiff);
          newHighBet = updatedP.currentBet;
        }
        addLog(`${p.name} ${action === 'all-in' ? 'shoved ALL-IN for' : 'raised to'} $${updatedP.currentBet.toLocaleString()}`, 'action');
      }

      return updatedP;
    });

    const newPot = pot + addedToPot;
    setPot(newPot);
    setCurrentHighBet(newHighBet);
    setMinRaise(newMinRaise);
    setPlayers(updatedPlayers);

    // Check if only 1 player remains unfolded
    const activeUnfolded = updatedPlayers.filter((p) => !p.isFolded && !p.isSittingOut);
    if (activeUnfolded.length === 1) {
      resolveShowdown(updatedPlayers, communityCards, newPot);
      return;
    }

    // Determine next active player
    // A round ends when all players who are not folded/all-in have matched the currentHighBet
    const needsToAct = updatedPlayers.some((p, i) => {
      if (p.isFolded || p.isSittingOut || p.isAllIn) return false;
      if (p.lastAction === undefined) return true;
      if (p.currentBet < newHighBet) return true;
      return false;
    });

    if (!needsToAct) {
      // Advance to next street
      setTimeout(() => advanceToNextStreet(updatedPlayers, deck, communityCards, newPot), 600);
      return;
    }

    // Find next eligible player
    let nextIdx = (activePlayerIdx + 1) % updatedPlayers.length;
    let loopCount = 0;
    while (
      (updatedPlayers[nextIdx].isFolded ||
        updatedPlayers[nextIdx].isSittingOut ||
        updatedPlayers[nextIdx].isAllIn) &&
      loopCount < updatedPlayers.length
    ) {
      nextIdx = (nextIdx + 1) % updatedPlayers.length;
      loopCount++;
    }

    setActivePlayerIdx(nextIdx);
  }, [activePlayerIdx, advanceToNextStreet, communityCards, currentHighBet, deck, minRaise, players, pot, resolveShowdown, town.bigBlind]);

  // AI Turn Execution Effect
  useEffect(() => {
    if (stage === 'idle' || stage === 'ended' || stage === 'showdown') return;
    if (activePlayerIdx < 0 || activePlayerIdx >= players.length) return;

    const currentPlayer = players[activePlayerIdx];
    if (!currentPlayer || currentPlayer.isHuman || currentPlayer.isFolded || currentPlayer.isSittingOut || currentPlayer.isAllIn) {
      return;
    }

    if (isProcessingTurn.current) return;
    isProcessingTurn.current = true;

    const botDelay = 800 + Math.random() * 700;

    const timer = setTimeout(() => {
      const activeCount = players.filter((p) => !p.isFolded && !p.isSittingOut).length;
      const decision = calculateAiDecision(
        currentPlayer,
        communityCards,
        pot,
        currentHighBet,
        minRaise,
        stage,
        activeCount
      );

      if (decision.action === 'fold') sounds.playFold();
      else if (decision.action === 'check') sounds.playCheckKnock();
      else if (decision.action === 'all-in') sounds.playAllIn();
      else sounds.playChipSound();

      handlePlayerAction(decision.action, decision.amount, decision.phrase);
      isProcessingTurn.current = false;
    }, botDelay);

    return () => {
      clearTimeout(timer);
      isProcessingTurn.current = false;
    };
  }, [activePlayerIdx, communityCards, currentHighBet, handlePlayerAction, minRaise, players, pot, stage]);

  // Auto-advance next hand when hand ends
  useEffect(() => {
    if (stage === 'ended' && autoAdvance && !isPaused) {
      nextHandTimeoutRef.current = setTimeout(() => {
        setHandNumber((h) => h + 1);
        startNewHand();
      }, 4000);
    }
    return () => {
      if (nextHandTimeoutRef.current) clearTimeout(nextHandTimeoutRef.current);
    };
  }, [autoAdvance, isPaused, stage, startNewHand]);

  const humanPlayer = players.find((p) => p.isHuman) || players[0];
  const isHumanTurn = activePlayerIdx >= 0 && players[activePlayerIdx]?.isHuman && stage !== 'ended' && stage !== 'showdown';

  // Toggle audio
  const toggleMute = () => {
    const newVal = !soundMuted;
    setSoundMuted(newVal);
    sounds.setEnabled(!newVal);
  };

  return (
    <div
      id="poker-table-container"
      className="relative w-full h-full min-h-[600px] flex flex-col justify-between bg-stone-950 overflow-hidden select-none"
    >
      {/* Background Saloon Texture & Vignette */}
      <div className="absolute inset-0 bg-radial from-stone-900 via-stone-950 to-black opacity-90 pointer-events-none" />

      {/* Top Left Saloon Info Badge */}
      <div className="fixed top-3 left-3 sm:top-4 sm:left-4 z-40 flex items-center gap-2">
        <button
          id="saloon-back-btn"
          onClick={() => setActiveModal('leave')}
          className="flex items-center gap-1.5 bg-stone-950/85 border border-amber-600/60 text-amber-300 font-serif font-bold text-xs sm:text-sm px-3.5 py-1.5 rounded-xl shadow-2xl backdrop-blur-md hover:bg-stone-900 transition active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{town.name} Saloon</span>
        </button>
        <span className="hidden sm:inline-block text-[11px] text-stone-400 font-medium bg-stone-900/80 px-2.5 py-1 rounded-lg border border-stone-800">
          Hand #{handNumber} • Blinds: ${town.smallBlind}/${town.bigBlind}
        </span>
      </div>

      {/* Top Right Dropdown Menu Button */}
      <button
        id="top-right-menu-btn"
        onClick={() => {
          sounds.playClick();
          setIsMenuOpen(!isMenuOpen);
        }}
        className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 flex items-center gap-2 bg-gradient-to-r from-amber-800 via-yellow-800 to-amber-900 text-amber-100 font-serif font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-2xl border border-amber-400/80 hover:brightness-110 transition active:scale-95"
      >
        <span>⚙️ Menu</span>
      </button>

      {/* Top Right Dropdown Menu List (Stacked Buttons) */}
      {isMenuOpen && (
        <div className="fixed top-14 right-3 sm:top-16 sm:right-4 z-50 w-64 bg-stone-950/95 border-2 border-amber-600/90 rounded-2xl p-3 shadow-2xl backdrop-blur-2xl flex flex-col gap-1.5 animate-fade-in">
          {/* Camera Angles Group inside Menu */}
          <div className="text-[10px] font-black uppercase text-amber-500/80 tracking-widest px-1 pt-1">
            🎥 Camera View Angles
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              setIs3DView(true);
              setCameraPreset('cinematic');
              setIsMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
              is3DView && cameraPreset === 'cinematic'
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/60'
                : 'text-stone-300 hover:bg-stone-800/80'
            }`}
          >
            <span>🎬 3D Cinematic Action</span>
            {is3DView && cameraPreset === 'cinematic' && <span className="text-amber-400 font-bold">✓</span>}
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setIs3DView(true);
              setCameraPreset('overhead');
              setIsMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
              is3DView && cameraPreset === 'overhead'
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/60'
                : 'text-stone-300 hover:bg-stone-800/80'
            }`}
          >
            <span>🚁 3D Overhead TV</span>
            {is3DView && cameraPreset === 'overhead' && <span className="text-amber-400 font-bold">✓</span>}
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setIs3DView(true);
              setCameraPreset('player_pov');
              setIsMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
              is3DView && cameraPreset === 'player_pov'
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/60'
                : 'text-stone-300 hover:bg-stone-800/80'
            }`}
          >
            <span>🤠 3D Player POV</span>
            {is3DView && cameraPreset === 'player_pov' && <span className="text-amber-400 font-bold">✓</span>}
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setIs3DView(false);
              setIsMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
              !is3DView
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/60'
                : 'text-stone-300 hover:bg-stone-800/80'
            }`}
          >
            <span>🃏 2D Classic Felt</span>
            {!is3DView && <span className="text-amber-400 font-bold">✓</span>}
          </button>

          <div className="h-px bg-amber-900/40 my-1" />

          {/* Tools / Info Modals */}
          <button
            onClick={() => {
              sounds.playClick();
              setActiveModal('logs');
              setIsMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-stone-200 hover:bg-stone-800/80 hover:text-amber-300 transition flex items-center gap-2"
          >
            <span>📜 Action History & Logs</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveModal('strength');
              setIsMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-stone-200 hover:bg-stone-800/80 hover:text-amber-300 transition flex items-center gap-2"
          >
            <span>📊 Hand Strength & Odds</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveModal('leaderboard');
              setIsMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-stone-200 hover:bg-stone-800/80 hover:text-amber-300 transition flex items-center gap-2"
          >
            <span>🏆 Town Standings & Ranks</span>
          </button>

          <div className="h-px bg-amber-900/40 my-1" />

          {/* Audio Toggle */}
          <button
            onClick={() => {
              toggleMute();
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-stone-200 hover:bg-stone-800/80 hover:text-amber-300 transition flex items-center justify-between"
          >
            <span>🔊 Sound Effects</span>
            <span className="text-[11px] font-black text-amber-400">{soundMuted ? 'MUTED' : 'ON'}</span>
          </button>

          {/* Leave Table */}
          <button
            onClick={() => {
              sounds.playClick();
              setActiveModal('leave');
              setIsMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 transition flex items-center gap-2"
          >
            <span>🚪 Return to Texas Town</span>
          </button>
        </div>
      )}

      {/* Middle-of-Screen Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-lg bg-stone-950 border-2 border-amber-500/80 rounded-3xl p-5 shadow-2xl text-stone-100 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-amber-900/50">
              <h3 className="text-base sm:text-lg font-serif font-bold text-amber-300 flex items-center gap-2">
                {activeModal === 'logs' && '📜 Hand Action History & Logs'}
                {activeModal === 'strength' && '📊 Live Hand Strength & Odds'}
                {activeModal === 'leaderboard' && '🏆 Regional Standings & Chip Ranks'}
                {activeModal === 'leave' && '🚪 Leave Saloon Table?'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center text-sm font-bold transition"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto py-4 flex-1">
              {activeModal === 'logs' && (
                <div className="flex flex-col gap-1.5 font-mono text-xs">
                  {actionLogs.length === 0 ? (
                    <div className="text-stone-500 italic text-center py-4">No action logs yet this hand.</div>
                  ) : (
                    actionLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-2 rounded-lg border ${
                          log.type === 'win'
                            ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 font-bold'
                            : log.type === 'deal'
                            ? 'bg-emerald-950/40 border-emerald-600/30 text-emerald-300'
                            : 'bg-stone-900 border-stone-800 text-stone-300'
                        }`}
                      >
                        <span className="text-stone-500 mr-2">[{log.timestamp}]</span>
                        {log.message}
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeModal === 'strength' && (
                <div className="flex flex-col gap-3">
                  {humanPlayer && humanPlayer.holeCards.length === 2 ? (
                    <HandStrengthHUD holeCards={humanPlayer.holeCards} communityCards={communityCards} />
                  ) : (
                    <div className="text-stone-400 italic text-center py-4">
                      Deal a hand to analyze strength and odds.
                    </div>
                  )}
                </div>
              )}

              {activeModal === 'leaderboard' && (
                <div className="flex flex-col gap-2">
                  <div className="text-xs text-amber-400 font-bold mb-1">
                    {town.name} Table Chip Standings
                  </div>
                  {players.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2.5 bg-stone-900 rounded-xl border border-stone-800"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{p.avatar}</span>
                        <div>
                          <div className="text-xs font-bold text-stone-200">
                            {p.name} {p.isHuman && '(You)'}
                          </div>
                          <div className="text-[10px] text-stone-400">
                            {p.isFolded ? 'Folded' : p.isAllIn ? 'ALL-IN' : 'Active'}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-amber-300">${p.chips.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}

              {activeModal === 'leave' && (
                <div className="flex flex-col items-center gap-4 text-center py-2">
                  <p className="text-sm text-stone-300">
                    Are you sure you want to exit the {town.name} Saloon table and return to town?
                  </p>
                  <div className="flex items-center gap-3 w-full mt-2">
                    <button
                      onClick={() => setActiveModal(null)}
                      className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold py-2.5 rounded-xl text-xs transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setActiveModal(null);
                        onLeaveTable();
                      }}
                      className="flex-1 bg-gradient-to-r from-rose-600 to-red-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg transition"
                    >
                      Confirm & Leave
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Table Area (SINGLE TABLE RENDERING, NO DOUBLE TABLE OR OVERLAY) */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {/* Deal / Next Hand Action Floating Banner */}
        {(stage === 'idle' || stage === 'ended') && (
          <div className="absolute top-16 z-30 flex items-center gap-2">
            {stage === 'idle' && (
              <button
                id="deal-first-hand-btn"
                onClick={startNewHand}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-stone-950 font-black text-xs px-5 py-2.5 rounded-full shadow-2xl border-2 border-yellow-200 animate-bounce active:scale-95"
              >
                <Play className="w-4 h-4 fill-stone-950" /> Deal Cards
              </button>
            )}
            {stage === 'ended' && (
              <button
                id="deal-next-hand-btn"
                onClick={() => {
                  setHandNumber((h) => h + 1);
                  startNewHand();
                }}
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs px-5 py-2.5 rounded-full shadow-2xl border-2 border-emerald-300 hover:brightness-110 active:scale-95 animate-pulse"
              >
                <RefreshCw className="w-4 h-4" /> Next Hand
              </button>
            )}
          </div>
        )}

        {/* 3D MODE: Full 3D Saloon Poker Table */}
        {is3DView ? (
          <div className="w-full h-full relative">
            <ThreePokerTable3D
              players={players}
              communityCards={communityCards}
              pot={pot}
              activePlayerIdx={activePlayerIdx}
              dealerIdx={dealerIdx}
              winners={winners}
              cameraPreset={cameraPreset}
            />

            {/* Winner Announcement Banner */}
            {winnerMessage && (
              <div className="absolute top-28 left-1/2 -translate-x-1/2 z-30 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-stone-950 text-xs sm:text-sm font-black px-4 py-1.5 rounded-full shadow-2xl border border-yellow-200 animate-pulse text-center max-w-md">
                {winnerMessage}
              </div>
            )}
          </div>
        ) : (
          /* 2D MODE: Classic 2D Felt Oval Table */
          <div className="relative w-full max-w-4xl aspect-[1.75/1] sm:aspect-[2/1] rounded-[100px] sm:rounded-[180px] p-3 sm:p-4 shadow-[0_20px_60px_rgba(0,0,0,0.95)] bg-gradient-to-b from-amber-950 via-amber-900 to-yellow-950 border-4 sm:border-8 border-amber-800/80 flex items-center justify-center">
            <div className="absolute inset-1.5 sm:inset-2.5 rounded-[90px] sm:rounded-[170px] border-2 border-dashed border-amber-500/30 pointer-events-none" />

            <div className="relative w-full h-full rounded-[85px] sm:rounded-[160px] bg-gradient-to-b from-emerald-800 via-emerald-900 to-teal-950 shadow-inner border border-emerald-700/50 flex flex-col items-center justify-center p-2 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                <span className="text-6xl sm:text-9xl font-serif font-black text-amber-400">GOP</span>
              </div>

              {/* Center Pot & Community Board */}
              <div className="relative z-10 flex flex-col items-center gap-1 sm:gap-2">
                <div className="flex items-center gap-1.5 bg-stone-950/80 border border-amber-500/50 px-3 sm:px-4 py-1 rounded-full shadow-2xl backdrop-blur-md">
                  <span className="text-base sm:text-lg">🪙</span>
                  <span className="text-xs sm:text-sm font-serif font-black text-amber-300 tracking-wide">
                    POT: ${pot.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 mt-0.5">
                  {[0, 1, 2, 3, 4].map((idx) => {
                    const card = communityCards[idx];
                    const isWinningCard = winners.some((w) =>
                      w.handResult?.winningCards?.some(
                        (wc) => card && wc.suit === card.suit && wc.rank === card.rank
                      )
                    );
                    return (
                      <div key={idx}>
                        {card ? (
                          <CardView card={card} isWinning={isWinningCard && stage === 'ended'} size="md" />
                        ) : (
                          <div className="w-13 h-19 sm:w-15 sm:h-22 rounded-md border-2 border-dashed border-emerald-600/40 bg-emerald-950/40 flex items-center justify-center shadow-inner">
                            <span className="text-[10px] font-bold text-emerald-500/40 font-serif">
                              {idx < 3 ? 'FLOP' : idx === 3 ? 'TURN' : 'RIVER'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {winnerMessage && (
                  <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-stone-950 text-xs sm:text-sm font-black px-3.5 py-1 rounded-full shadow-2xl border border-yellow-200 animate-pulse text-center max-w-sm mt-1">
                    {winnerMessage}
                  </div>
                )}
              </div>

              {/* 2D Player Seats */}
              <div className="absolute bottom-1 sm:bottom-2 left-1/2 -translate-x-1/2 z-20">
                {players[0] && (
                  <PlayerSeat
                    player={players[0]}
                    isActive={activePlayerIdx === 0}
                    isDealer={dealerIdx === 0}
                    isSmallBlind={(dealerIdx + 1) % players.length === 0}
                    isBigBlind={(dealerIdx + 2) % players.length === 0}
                    isHuman={true}
                    showCards={true}
                    seatPosition="bottom"
                    isDealingCards={isDealingCards}
                  />
                )}
              </div>

              {players[1] && (
                <div className="absolute bottom-6 sm:bottom-10 left-3 sm:left-6 z-20">
                  <PlayerSeat
                    player={players[1]}
                    isActive={activePlayerIdx === 1}
                    isDealer={dealerIdx === 1}
                    isSmallBlind={(dealerIdx + 1) % players.length === 1}
                    isBigBlind={(dealerIdx + 2) % players.length === 1}
                    isHuman={false}
                    showCards={stage === 'showdown' || stage === 'ended'}
                    seatPosition="bottom-left"
                    isDealingCards={isDealingCards}
                  />
                </div>
              )}

              {players[2] && (
                <div className="absolute top-2 sm:top-3 left-6 sm:left-14 z-20">
                  <PlayerSeat
                    player={players[2]}
                    isActive={activePlayerIdx === 2}
                    isDealer={dealerIdx === 2}
                    isSmallBlind={(dealerIdx + 1) % players.length === 2}
                    isBigBlind={(dealerIdx + 2) % players.length === 2}
                    isHuman={false}
                    showCards={stage === 'showdown' || stage === 'ended'}
                    seatPosition="top-left"
                    isDealingCards={isDealingCards}
                  />
                </div>
              )}

              {players[3] && (
                <div className="absolute top-1 sm:top-2 left-1/2 -translate-x-1/2 z-20">
                  <PlayerSeat
                    player={players[3]}
                    isActive={activePlayerIdx === 3}
                    isDealer={dealerIdx === 3}
                    isSmallBlind={(dealerIdx + 1) % players.length === 3}
                    isBigBlind={(dealerIdx + 2) % players.length === 3}
                    isHuman={false}
                    showCards={stage === 'showdown' || stage === 'ended'}
                    seatPosition="top-center"
                    isDealingCards={isDealingCards}
                  />
                </div>
              )}

              {players[4] && (
                <div className="absolute top-2 sm:top-3 right-6 sm:right-14 z-20">
                  <PlayerSeat
                    player={players[4]}
                    isActive={activePlayerIdx === 4}
                    isDealer={dealerIdx === 4}
                    isSmallBlind={(dealerIdx + 1) % players.length === 4}
                    isBigBlind={(dealerIdx + 2) % players.length === 4}
                    isHuman={false}
                    showCards={stage === 'showdown' || stage === 'ended'}
                    seatPosition="top-right"
                    isDealingCards={isDealingCards}
                  />
                </div>
              )}

              {players[5] && (
                <div className="absolute bottom-6 sm:bottom-10 right-3 sm:right-6 z-20">
                  <PlayerSeat
                    player={players[5]}
                    isActive={activePlayerIdx === 5}
                    isDealer={dealerIdx === 5}
                    isSmallBlind={(dealerIdx + 1) % players.length === 5}
                    isBigBlind={(dealerIdx + 2) % players.length === 5}
                    isHuman={false}
                    showCards={stage === 'showdown' || stage === 'ended'}
                    seatPosition="bottom-right"
                    isDealingCards={isDealingCards}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Floating Hand Strength HUD, Emote Celebrations & Betting Action Panel */}
      <div className="relative z-30 w-full flex flex-col sm:flex-row items-center sm:items-end justify-between px-2 sm:px-6 pb-2 gap-2">
        {/* Live Hand Strength Meter for Human + Emote Bar */}
        <div className="flex flex-col gap-1.5 self-start sm:self-end">
          {/* Quick Emote & Celebration Selector Bar */}
          <div className="flex items-center gap-1 bg-stone-950/85 border border-amber-600/50 p-1 rounded-2xl backdrop-blur-md shadow-xl">
            <span className="text-[10px] font-black uppercase text-amber-400 px-1.5">EMOTES:</span>
            {[
              { emote: '🤠', name: 'Hat Tip', sound: () => sounds.playClick() },
              { emote: '🎉', name: 'Celebrate', sound: () => { sounds.playWin(); confetti({ particleCount: 35, spread: 50 }); } },
              { emote: '🔥', name: 'On Fire', sound: () => sounds.playAllIn() },
              { emote: '💵', name: 'Make It Rain', sound: () => { sounds.playChipSound(); confetti({ particleCount: 25, spread: 40 }); } },
              { emote: '👏', name: 'Applause', sound: () => sounds.playWin() },
              { emote: '🍺', name: 'Cheers', sound: () => sounds.playBell() },
              { emote: '😤', name: 'Tilt', sound: () => sounds.playFold() },
            ].map((e) => (
              <button
                key={e.emote}
                onClick={() => {
                  e.sound();
                  addLog(`🤠 ${humanPlayer?.name || 'You'} used ${e.name} ${e.emote}!`, 'action');
                }}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-stone-900 hover:bg-amber-600/40 text-sm sm:text-base flex items-center justify-center border border-stone-800 hover:border-amber-400/80 transition active:scale-90"
                title={e.name}
              >
                {e.emote}
              </button>
            ))}
          </div>

          {humanPlayer && humanPlayer.holeCards.length === 2 && !humanPlayer.isFolded && (
            <HandStrengthHUD
              holeCards={humanPlayer.holeCards}
              communityCards={communityCards}
            />
          )}
        </div>

        {/* Action Controls for User Turn */}
        {humanPlayer && (
          <BettingControls
            player={humanPlayer}
            currentHighBet={currentHighBet}
            minRaise={minRaise}
            potTotal={pot}
            onAction={handlePlayerAction}
            disabled={!isHumanTurn || humanPlayer.isFolded || humanPlayer.isAllIn}
          />
        )}
      </div>
    </div>
  );
};
