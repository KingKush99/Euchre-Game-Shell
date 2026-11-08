import { Card, HandEvaluation, HandRank, Rank, Suit } from '../types/poker';

export const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const RANK_VALUES: Record<Rank, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13,
  'A': 14,
};

export const VALUE_TO_RANK: Record<number, Rank> = {
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K',
  14: 'A',
};

export const RANK_NAMES: Record<number, string> = {
  2: 'Deuces',
  3: 'Threes',
  4: 'Fours',
  5: 'Fives',
  6: 'Sixes',
  7: 'Sevens',
  8: 'Eights',
  9: 'Nines',
  10: 'Tens',
  11: 'Jacks',
  12: 'Queens',
  13: 'Kings',
  14: 'Aces',
};

export const RANK_NAMES_SINGULAR: Record<number, string> = {
  2: 'Two',
  3: 'Three',
  4: 'Four',
  5: 'Five',
  6: 'Six',
  7: 'Seven',
  8: 'Eight',
  9: 'Nine',
  10: 'Ten',
  11: 'Jack',
  12: 'Queen',
  13: 'King',
  14: 'Ace',
};

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    const color = suit === '♥' || suit === '♦' ? 'red' : 'black';
    for (const rank of RANKS) {
      deck.push({
        suit,
        rank,
        value: RANK_VALUES[rank],
        color,
      });
    }
  }
  return shuffle(deck);
}

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate all combinations of k items from array
function getCombinations<T>(array: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (array.length === 0) return [];
  const head = array[0];
  const tail = array.slice(1);
  const withHead = getCombinations(tail, k - 1).map((c) => [head, ...c]);
  const withoutHead = getCombinations(tail, k);
  return [...withHead, ...withoutHead];
}

// Evaluates exactly 5 cards
export function evaluate5Cards(cards: Card[]): HandEvaluation {
  if (cards.length !== 5) {
    throw new Error('evaluate5Cards requires exactly 5 cards');
  }

  // Sort descending by card value
  const sorted = [...cards].sort((a, b) => b.value - a.value);
  const values = sorted.map((c) => c.value);
  const suits = sorted.map((c) => c.suit);

  const isFlush = suits.every((s) => s === suits[0]);

  // Check straight
  let isStraight = false;
  let straightHigh = 0;

  // Normal straight check
  if (
    values[0] - values[1] === 1 &&
    values[1] - values[2] === 1 &&
    values[2] - values[3] === 1 &&
    values[3] - values[4] === 1
  ) {
    isStraight = true;
    straightHigh = values[0];
  } else if (
    // Ace-low straight: A-5-4-3-2 -> values: 14, 5, 4, 3, 2
    values[0] === 14 &&
    values[1] === 5 &&
    values[2] === 4 &&
    values[3] === 3 &&
    values[4] === 2
  ) {
    isStraight = true;
    straightHigh = 5; // 5-high straight
  }

  // Count value frequencies
  const counts: Record<number, number> = {};
  values.forEach((v) => {
    counts[v] = (counts[v] || 0) + 1;
  });

  const countEntries = Object.entries(counts).map(([v, count]) => ({
    value: Number(v),
    count,
  }));

  // Sort by count desc, then value desc
  countEntries.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return b.value - a.value;
  });

  // Calculate score representation: rank * 10,000,000 + kickers
  const buildScore = (baseRank: number, kickers: number[]): number => {
    let score = baseRank * 100000000;
    kickers.forEach((k, i) => {
      score += k * Math.pow(15, 4 - i);
    });
    return score;
  };

  // 1. Royal Flush & Straight Flush
  if (isFlush && isStraight) {
    if (straightHigh === 14) {
      return {
        rank: HandRank.ROYAL_FLUSH,
        name: 'Royal Flush',
        score: buildScore(HandRank.ROYAL_FLUSH, [14]),
        kickers: [14],
        winningCards: sorted,
        description: `Royal Flush in ${suits[0]}! Unbeatable western hand!`,
      };
    }
    return {
      rank: HandRank.STRAIGHT_FLUSH,
      name: 'Straight Flush',
      score: buildScore(HandRank.STRAIGHT_FLUSH, [straightHigh]),
      kickers: [straightHigh],
      winningCards: sorted,
      description: `${RANK_NAMES_SINGULAR[straightHigh]}-high Straight Flush`,
    };
  }

  // 2. Four of a Kind
  if (countEntries[0].count === 4) {
    const quadVal = countEntries[0].value;
    const kickerVal = countEntries[1].value;
    return {
      rank: HandRank.FOUR_OF_A_KIND,
      name: 'Four of a Kind',
      score: buildScore(HandRank.FOUR_OF_A_KIND, [quadVal, kickerVal]),
      kickers: [quadVal, kickerVal],
      winningCards: sorted,
      description: `Four of a Kind, ${RANK_NAMES[quadVal]}`,
    };
  }

  // 3. Full House
  if (countEntries[0].count === 3 && countEntries[1].count === 2) {
    const tripVal = countEntries[0].value;
    const pairVal = countEntries[1].value;
    return {
      rank: HandRank.FULL_HOUSE,
      name: 'Full House',
      score: buildScore(HandRank.FULL_HOUSE, [tripVal, pairVal]),
      kickers: [tripVal, pairVal],
      winningCards: sorted,
      description: `Full House, ${RANK_NAMES[tripVal]} full of ${RANK_NAMES[pairVal]}`,
    };
  }

  // 4. Flush
  if (isFlush) {
    return {
      rank: HandRank.FLUSH,
      name: 'Flush',
      score: buildScore(HandRank.FLUSH, values),
      kickers: values,
      winningCards: sorted,
      description: `${RANK_NAMES_SINGULAR[values[0]]}-high Flush`,
    };
  }

  // 5. Straight
  if (isStraight) {
    return {
      rank: HandRank.STRAIGHT,
      name: 'Straight',
      score: buildScore(HandRank.STRAIGHT, [straightHigh]),
      kickers: [straightHigh],
      winningCards: sorted,
      description: `${RANK_NAMES_SINGULAR[straightHigh]}-high Straight`,
    };
  }

  // 6. Three of a Kind
  if (countEntries[0].count === 3) {
    const tripVal = countEntries[0].value;
    const kickers = countEntries.slice(1).map((e) => e.value);
    return {
      rank: HandRank.THREE_OF_A_KIND,
      name: 'Three of a Kind',
      score: buildScore(HandRank.THREE_OF_A_KIND, [tripVal, ...kickers]),
      kickers: [tripVal, ...kickers],
      winningCards: sorted,
      description: `Three of a Kind, ${RANK_NAMES[tripVal]}`,
    };
  }

  // 7. Two Pair
  if (countEntries[0].count === 2 && countEntries[1].count === 2) {
    const highPair = countEntries[0].value;
    const lowPair = countEntries[1].value;
    const kicker = countEntries[2].value;
    return {
      rank: HandRank.TWO_PAIR,
      name: 'Two Pair',
      score: buildScore(HandRank.TWO_PAIR, [highPair, lowPair, kicker]),
      kickers: [highPair, lowPair, kicker],
      winningCards: sorted,
      description: `Two Pair, ${RANK_NAMES[highPair]} and ${RANK_NAMES[lowPair]}`,
    };
  }

  // 8. One Pair
  if (countEntries[0].count === 2) {
    const pairVal = countEntries[0].value;
    const kickers = countEntries.slice(1).map((e) => e.value);
    return {
      rank: HandRank.ONE_PAIR,
      name: 'One Pair',
      score: buildScore(HandRank.ONE_PAIR, [pairVal, ...kickers]),
      kickers: [pairVal, ...kickers],
      winningCards: sorted,
      description: `Pair of ${RANK_NAMES[pairVal]}`,
    };
  }

  // 9. High Card
  return {
    rank: HandRank.HIGH_CARD,
    name: 'High Card',
    score: buildScore(HandRank.HIGH_CARD, values),
    kickers: values,
    winningCards: sorted,
    description: `High Card, ${RANK_NAMES_SINGULAR[values[0]]}`,
  };
}

// Evaluates any 5, 6, or 7 card set to return the absolute best 5-card hand
export function evaluateHand(holeCards: Card[], communityCards: Card[]): HandEvaluation {
  const allCards = [...holeCards, ...communityCards];

  if (allCards.length < 5) {
    // If fewer than 5 cards (e.g. preflop), evaluate what we have
    if (allCards.length === 2) {
      if (allCards[0].value === allCards[1].value) {
        return {
          rank: HandRank.ONE_PAIR,
          name: 'Pocket Pair',
          score: 20000000 + allCards[0].value * 100,
          kickers: [allCards[0].value],
          winningCards: allCards,
          description: `Pocket ${RANK_NAMES[allCards[0].value]}`,
        };
      }
      const high = Math.max(allCards[0].value, allCards[1].value);
      const low = Math.min(allCards[0].value, allCards[1].value);
      const isSuited = allCards[0].suit === allCards[1].suit;
      return {
        rank: HandRank.HIGH_CARD,
        name: 'High Card',
        score: 10000000 + high * 15 + low,
        kickers: [high, low],
        winningCards: allCards,
        description: `${RANK_NAMES_SINGULAR[high]} High ${isSuited ? 'Suited' : 'Offsuit'}`,
      };
    }
    // 3 or 4 cards evaluation (rarely directly used without community)
    return {
      rank: HandRank.HIGH_CARD,
      name: 'High Card',
      score: 10000000,
      kickers: allCards.map((c) => c.value).sort((a, b) => b - a),
      winningCards: allCards,
      description: 'High Card',
    };
  }

  const combinations = getCombinations(allCards, 5);
  let bestEval: HandEvaluation | null = null;

  for (const combo of combinations) {
    const currentEval = evaluate5Cards(combo);
    if (!bestEval || currentEval.score > bestEval.score) {
      bestEval = currentEval;
    }
  }

  return (
    bestEval || {
      rank: HandRank.HIGH_CARD,
      name: 'High Card',
      score: 0,
      kickers: [],
      winningCards: [],
      description: '',
    }
  );
}

// Compare two hand evaluations: > 0 if A wins, < 0 if B wins, 0 if tie
export function compareHands(a: HandEvaluation, b: HandEvaluation): number {
  return a.score - b.score;
}

// Estimate Hand Strength / Equity (0 to 100%) for live HUD meter
export function estimateHandStrength(holeCards: Card[], communityCards: Card[]): {
  strengthScore: number; // 0 to 100
  tier: 'Weak' | 'Medium' | 'Strong' | 'Monster';
  handName: string;
} {
  if (!holeCards || holeCards.length < 2) {
    return { strengthScore: 0, tier: 'Weak', handName: 'None' };
  }

  const currentEval = evaluateHand(holeCards, communityCards);

  // Pre-flop logic
  if (communityCards.length === 0) {
    const c1 = holeCards[0];
    const c2 = holeCards[1];
    const high = Math.max(c1.value, c2.value);
    const low = Math.min(c1.value, c2.value);
    const isPair = c1.value === c2.value;
    const isSuited = c1.suit === c2.suit;
    const gap = high - low;

    let score = 20;

    if (isPair) {
      score = 45 + high * 3.8; // Pocket 2s ~ 52%, Pocket Aces ~ 98%
    } else {
      score = high * 2.5 + low * 1.5;
      if (isSuited) score += 6;
      if (gap === 1) score += 4; // Connectors
      if (high >= 13 && low >= 10) score += 12; // Big Broadway cards
    }

    score = Math.min(99, Math.max(15, Math.round(score)));

    let tier: 'Weak' | 'Medium' | 'Strong' | 'Monster' = 'Weak';
    if (score >= 80) tier = 'Monster';
    else if (score >= 60) tier = 'Strong';
    else if (score >= 40) tier = 'Medium';

    return {
      strengthScore: score,
      tier,
      handName: currentEval.description || 'Pre-Flop Hand',
    };
  }

  // Post-flop evaluation
  let score = 30;
  switch (currentEval.rank) {
    case HandRank.ROYAL_FLUSH:
    case HandRank.STRAIGHT_FLUSH:
    case HandRank.FOUR_OF_A_KIND:
      score = 99;
      break;
    case HandRank.FULL_HOUSE:
      score = 92 + (currentEval.kickers[0] || 0) * 0.4;
      break;
    case HandRank.FLUSH:
      score = 82 + (currentEval.kickers[0] || 0) * 0.5;
      break;
    case HandRank.STRAIGHT:
      score = 75 + (currentEval.kickers[0] || 0) * 0.4;
      break;
    case HandRank.THREE_OF_A_KIND:
      score = 64 + (currentEval.kickers[0] || 0) * 0.6;
      break;
    case HandRank.TWO_PAIR:
      score = 52 + (currentEval.kickers[0] || 0) * 0.5;
      break;
    case HandRank.ONE_PAIR:
      score = 35 + (currentEval.kickers[0] || 0) * 0.8;
      break;
    case HandRank.HIGH_CARD:
    default:
      score = 15 + (currentEval.kickers[0] || 0) * 0.6;
      break;
  }

  score = Math.min(99, Math.max(10, Math.round(score)));
  let tier: 'Weak' | 'Medium' | 'Strong' | 'Monster' = 'Weak';
  if (score >= 80) tier = 'Monster';
  else if (score >= 60) tier = 'Strong';
  else if (score >= 40) tier = 'Medium';

  return {
    strengthScore: score,
    tier,
    handName: currentEval.description,
  };
}
