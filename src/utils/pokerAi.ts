import { Card, GameStage, Player } from '../types/poker';
import { estimateHandStrength } from './pokerEvaluator';

export interface AiDecision {
  action: 'fold' | 'check' | 'call' | 'raise' | 'all-in';
  amount: number;
  phrase?: string;
}

export function calculateAiDecision(
  bot: Player,
  communityCards: Card[],
  potTotal: number,
  currentHighBet: number,
  minRaise: number,
  stage: GameStage,
  activePlayersCount: number
): AiDecision {
  const callAmount = currentHighBet - bot.currentBet;
  const personality = bot.personality || {
    type: 'pro',
    aggression: 0.5,
    bluffRate: 0.2,
    looseness: 0.4,
    catchphrases: {
      fold: ["I'm out, partner.", "Ain't worth a copper.", "Fold 'em!"],
      call: ["I'll see that bet.", "Count me in.", "Fair enough."],
      raise: ["Time to raise the stakes!", "Let's make this interestin'!", "Giddy up!"],
      allIn: ["All in! Don't push your luck!", "Everything on the table!", "Yeehaw! All chips!"],
      win: ["Read 'em and weep!", "Texas luck is with me!", "Pay up, stranger!"],
    },
  };

  const { strengthScore } = estimateHandStrength(bot.holeCards, communityCards);
  const potOdds = callAmount > 0 ? callAmount / (potTotal + callAmount) : 0;
  const isBluffing = Math.random() < personality.bluffRate;

  // Helper to pick random phrase
  const pickPhrase = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  // If already all-in or sitting out
  if (bot.isAllIn || bot.chips <= 0) {
    return { action: 'check', amount: 0 };
  }

  // If no cost to stay in hand (callAmount === 0)
  if (callAmount <= 0) {
    // Check or Raise
    const shouldRaise =
      (strengthScore > 65 && Math.random() < personality.aggression) ||
      (isBluffing && Math.random() < 0.4 && stage !== 'preflop');

    if (shouldRaise && bot.chips > minRaise) {
      // Calculate raise size
      let targetRaise = minRaise;
      if (strengthScore > 85) {
        targetRaise = Math.max(minRaise, Math.floor(potTotal * (0.5 + personality.aggression * 0.5)));
      } else {
        targetRaise = Math.max(minRaise, Math.floor(potTotal * 0.35));
      }

      targetRaise = Math.min(targetRaise, bot.chips);
      if (targetRaise >= bot.chips) {
        return {
          action: 'all-in',
          amount: bot.chips,
          phrase: pickPhrase(personality.catchphrases.allIn),
        };
      }

      return {
        action: 'raise',
        amount: targetRaise,
        phrase: pickPhrase(personality.catchphrases.raise),
      };
    }

    return {
      action: 'check',
      amount: 0,
      phrase: Math.random() < 0.25 ? pickPhrase(personality.catchphrases.call) : undefined,
    };
  }

  // Facing a bet (callAmount > 0)
  // Check if callAmount is greater than or equal to bot stack
  if (callAmount >= bot.chips) {
    // All-in decision
    if (strengthScore >= 70 || (isBluffing && strengthScore >= 45)) {
      return {
        action: 'all-in',
        amount: bot.chips,
        phrase: pickPhrase(personality.catchphrases.allIn),
      };
    }
    return {
      action: 'fold',
      amount: 0,
      phrase: pickPhrase(personality.catchphrases.fold),
    };
  }

  // Calculate required threshold based on looseness and pot odds
  let threshold = 35 + potOdds * 40 - personality.looseness * 20;
  if (isBluffing) threshold -= 25;

  // Decide between Fold, Call, Raise
  if (strengthScore < threshold) {
    return {
      action: 'fold',
      amount: 0,
      phrase: pickPhrase(personality.catchphrases.fold),
    };
  }

  // Monster hand or aggressive re-raise
  const shouldReRaise =
    bot.chips > callAmount + minRaise &&
    ((strengthScore >= 78 && Math.random() < personality.aggression + 0.3) ||
      (isBluffing && Math.random() < 0.35));

  if (shouldReRaise) {
    let raiseAmount = Math.floor(callAmount * 2 + potTotal * 0.4);
    raiseAmount = Math.max(callAmount + minRaise, raiseAmount);
    raiseAmount = Math.min(raiseAmount, bot.chips);

    if (raiseAmount >= bot.chips) {
      return {
        action: 'all-in',
        amount: bot.chips,
        phrase: pickPhrase(personality.catchphrases.allIn),
      };
    }

    return {
      action: 'raise',
      amount: raiseAmount,
      phrase: pickPhrase(personality.catchphrases.raise),
    };
  }

  // Default to Call
  return {
    action: 'call',
    amount: callAmount,
    phrase: Math.random() < 0.4 ? pickPhrase(personality.catchphrases.call) : undefined,
  };
}
