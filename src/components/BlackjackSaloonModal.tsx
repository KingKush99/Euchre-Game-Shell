import React, { useState } from 'react';
import { Card } from '../types/poker';
import { CardView } from './CardView';
import { createDeck } from '../utils/pokerEvaluator';
import { sounds } from '../utils/soundEffects';
import { X, Play, Hand, ShieldAlert, Sparkles, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BlackjackSaloonModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerChips: number;
  onUpdateChips: (diff: number) => void;
}

export const BlackjackSaloonModal: React.FC<BlackjackSaloonModalProps> = ({
  isOpen,
  onClose,
  playerChips,
  onUpdateChips,
}) => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [bet, setBet] = useState<number>(100);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealerTurn' | 'ended'>('betting');
  const [message, setMessage] = useState<string>('Place your bet to start');

  if (!isOpen) return null;

  const calculateScore = (cards: Card[]) => {
    let score = 0;
    let aces = 0;

    cards.forEach((c) => {
      if (c.rank === 'A') {
        aces += 1;
        score += 11;
      } else if (['K', 'Q', 'J', '10'].includes(c.rank)) {
        score += 10;
      } else {
        score += Number(c.rank);
      }
    });

    while (score > 21 && aces > 0) {
      score -= 10;
      aces -= 1;
    }

    return score;
  };

  const startDeal = () => {
    if (playerChips < bet) return;

    sounds.playChipSound();
    onUpdateChips(-bet);

    const newDeck = createDeck();
    const p1 = newDeck.pop()!;
    const d1 = newDeck.pop()!;
    const p2 = newDeck.pop()!;
    const d2 = newDeck.pop()!;

    const pHand = [p1, p2];
    const dHand = [d1, d2];

    setDeck(newDeck);
    setPlayerHand(pHand);
    setDealerHand(dHand);
    setGameState('playing');
    sounds.playCardDeal();

    const pScore = calculateScore(pHand);
    if (pScore === 21) {
      // Natural Blackjack!
      endGame(pHand, dHand, 'blackjack');
    } else {
      setMessage('Hit or Stand?');
    }
  };

  const hit = () => {
    if (gameState !== 'playing') return;
    sounds.playCardDeal();

    const deckCopy = [...deck];
    const newCard = deckCopy.pop()!;
    const updatedHand = [...playerHand, newCard];

    setDeck(deckCopy);
    setPlayerHand(updatedHand);

    const score = calculateScore(updatedHand);
    if (score > 21) {
      // Bust
      sounds.playFold();
      endGame(updatedHand, dealerHand, 'bust');
    } else if (score === 21) {
      stand(updatedHand);
    }
  };

  const stand = (currHand = playerHand) => {
    setGameState('dealerTurn');
    sounds.playCheckKnock();

    let dHand = [...dealerHand];
    let deckCopy = [...deck];

    let dScore = calculateScore(dHand);
    while (dScore < 17) {
      const card = deckCopy.pop()!;
      dHand.push(card);
      dScore = calculateScore(dHand);
    }

    setDealerHand(dHand);
    setDeck(deckCopy);

    const pScore = calculateScore(currHand);

    if (dScore > 21) {
      endGame(currHand, dHand, 'dealerBust');
    } else if (pScore > dScore) {
      endGame(currHand, dHand, 'win');
    } else if (pScore < dScore) {
      endGame(currHand, dHand, 'lose');
    } else {
      endGame(currHand, dHand, 'push');
    }
  };

  const endGame = (pHand: Card[], dHand: Card[], result: 'blackjack' | 'win' | 'dealerBust' | 'lose' | 'bust' | 'push') => {
    setGameState('ended');
    const pScore = calculateScore(pHand);
    const dScore = calculateScore(dHand);

    if (result === 'blackjack') {
      const winAmt = Math.floor(bet * 2.5);
      sounds.playWin();
      confetti({ particleCount: 80, spread: 60 });
      onUpdateChips(winAmt);
      setMessage(`Blackjack 21! Won $${winAmt.toLocaleString()}!`);
    } else if (result === 'win' || result === 'dealerBust') {
      const winAmt = bet * 2;
      sounds.playWin();
      confetti({ particleCount: 50, spread: 50 });
      onUpdateChips(winAmt);
      setMessage(result === 'dealerBust' ? `Dealer Busts (${dScore})! Won $${winAmt.toLocaleString()}!` : `You Win (${pScore} vs ${dScore})! Won $${winAmt.toLocaleString()}!`);
    } else if (result === 'push') {
      onUpdateChips(bet);
      setMessage(`Push (${pScore} to ${dScore}). Bet returned.`);
    } else if (result === 'bust') {
      setMessage(`Busted with ${pScore}! House wins.`);
    } else {
      setMessage(`House wins (${dScore} vs ${pScore}).`);
    }
  };

  const playerScore = calculateScore(playerHand);
  const dealerScore = calculateScore(dealerHand);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        id="blackjack-saloon-modal"
        className="relative w-full max-w-xl bg-stone-950 border-2 border-amber-500/50 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center text-center overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-100 border border-stone-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-1 text-amber-400">
          <span className="text-2xl">🃏</span>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-amber-200">
            SALOON 21 BLACKJACK
          </h2>
        </div>
        <p className="text-xs text-amber-400/80 mb-4 font-medium">
          Beat the dealer's hand without busting over 21. Blackjack pays 3:2.
        </p>

        {/* Dealer Area */}
        <div className="w-full bg-emerald-950/60 border border-emerald-700/50 rounded-2xl p-3 my-2 flex flex-col items-center">
          <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
            Barkeep / Dealer {gameState !== 'betting' && gameState !== 'playing' ? `(${dealerScore})` : ''}
          </div>
          <div className="flex items-center gap-2 min-h-[85px]">
            {dealerHand.map((card, idx) => (
              <CardView
                key={idx}
                card={card}
                hidden={idx === 1 && gameState === 'playing'}
                size="sm"
              />
            ))}
          </div>
        </div>

        {/* Center Game Result Message */}
        <div className="text-xs sm:text-sm font-black text-yellow-300 bg-stone-900/90 border border-amber-500/30 px-4 py-1.5 rounded-full my-2">
          {message}
        </div>

        {/* Player Area */}
        <div className="w-full bg-emerald-950/60 border border-emerald-700/50 rounded-2xl p-3 my-2 flex flex-col items-center">
          <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
            Your Hand {playerHand.length > 0 ? `(${playerScore})` : ''}
          </div>
          <div className="flex items-center gap-2 min-h-[85px]">
            {playerHand.map((card, idx) => (
              <CardView key={idx} card={card} size="sm" />
            ))}
          </div>
        </div>

        {/* Controls */}
        {gameState === 'playing' ? (
          <div className="grid grid-cols-2 gap-3 w-full mt-3">
            <button
              onClick={hit}
              className="py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-lg border border-blue-400 active:scale-95 transition"
            >
              HIT
            </button>
            <button
              onClick={() => stand()}
              className="py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-extrabold text-sm rounded-xl shadow-lg border border-emerald-400 active:scale-95 transition"
            >
              STAND
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 w-full mt-3">
            {/* Bet Quick Selectors */}
            <div className="flex items-center justify-center gap-2">
              {[50, 100, 250, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    sounds.playChipSound();
                    setBet(amt);
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition ${
                    bet === amt
                      ? 'bg-amber-500 text-stone-950 border-yellow-300'
                      : 'bg-stone-900 text-stone-300 border-stone-700'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            <button
              onClick={startDeal}
              disabled={playerChips < bet}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-black text-sm rounded-xl shadow-xl border border-yellow-200 transition active:scale-95 disabled:opacity-40"
            >
              DEAL HAND (${bet.toLocaleString()})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
