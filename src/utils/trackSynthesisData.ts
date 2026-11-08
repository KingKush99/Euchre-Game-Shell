// Comprehensive bespoke musical compositions for every single track in Euchre Saloon

export interface TrackComposition {
  tempo: number;
  timeSignature: '4/4' | '3/4' | '2/4';
  instrument: 'banjo' | 'ragtime_piano' | 'acoustic_guitar' | 'slide_guitar' | 'accordion' | 'fiddle' | 'trumpet' | 'saloon_piano';
  chords: string[][];
  leadMelody: Array<{ note: string; duration: number }>;
  bassLine: string[];
}

export const INDIVIDUAL_TRACK_COMPOSITIONS: Record<string, TrackComposition> = {
  // 1. Shuffle Up and Deal - Official Theme Song (Acoustic Western Swing)
  track_01: {
    tempo: 124,
    timeSignature: '4/4',
    instrument: 'acoustic_guitar',
    chords: [
      ['G2', 'D3', 'G3', 'B3', 'D4'],
      ['E2', 'B2', 'E3', 'G3', 'B3'],
      ['C3', 'G3', 'C4', 'E4'],
      ['D3', 'A3', 'D4', 'F#4'],
      ['G2', 'D3', 'G3', 'B3'],
      ['C3', 'G3', 'C4', 'E4'],
      ['D3', 'A3', 'D4', 'F#4'],
      ['G2', 'D3', 'G3', 'B3', 'D4'],
    ],
    leadMelody: [
      // Intro
      { note: 'D4', duration: 0.25 }, { note: 'G4', duration: 0.25 }, { note: 'B4', duration: 0.5 }, { note: 'D5', duration: 0.5 },
      // "We sit down at the table, as the night comes on"
      { note: 'D4', duration: 0.35 }, { note: 'D4', duration: 0.35 }, { note: 'G4', duration: 0.35 }, { note: 'G4', duration: 0.35 }, { note: 'G4', duration: 0.35 }, { note: 'A4', duration: 0.35 }, { note: 'B4', duration: 0.6 },
      { note: 'B4', duration: 0.4 }, { note: 'A4', duration: 0.4 }, { note: 'G4', duration: 0.4 }, { note: 'E4', duration: 0.8 },
      // "Dealer's on the left, and the crowd feels strong"
      { note: 'E4', duration: 0.35 }, { note: 'G4', duration: 0.35 }, { note: 'A4', duration: 0.35 }, { note: 'B4', duration: 0.7 },
      { note: 'A4', duration: 0.35 }, { note: 'G4', duration: 0.35 }, { note: 'E4', duration: 0.35 }, { note: 'D4', duration: 0.8 },
      // "Four cards down, then one more round"
      { note: 'D4', duration: 0.4 }, { note: 'G4', duration: 0.4 }, { note: 'B4', duration: 0.6 },
      { note: 'B4', duration: 0.4 }, { note: 'A4', duration: 0.4 }, { note: 'G4', duration: 0.6 },
      // "That's how we do it, in this Euchre town"
      { note: 'E4', duration: 0.35 }, { note: 'G4', duration: 0.35 }, { note: 'A4', duration: 0.35 }, { note: 'B4', duration: 0.6 },
      { note: 'A4', duration: 0.4 }, { note: 'G4', duration: 0.4 }, { note: 'G4', duration: 1.0 },
      // Chorus: "Shuffle up and deal, let the Euchre roll"
      { note: 'D4', duration: 0.4 }, { note: 'G4', duration: 0.4 }, { note: 'B4', duration: 0.4 }, { note: 'D5', duration: 0.8 },
      { note: 'D5', duration: 0.3 }, { note: 'C5', duration: 0.3 }, { note: 'B4', duration: 0.3 }, { note: 'A4', duration: 0.3 }, { note: 'G4', duration: 0.8 },
      // "Call your trump loud or keep it on the low"
      { note: 'G4', duration: 0.35 }, { note: 'B4', duration: 0.35 }, { note: 'D5', duration: 0.35 }, { note: 'E5', duration: 0.8 },
      { note: 'E5', duration: 0.35 }, { note: 'D5', duration: 0.35 }, { note: 'B4', duration: 0.35 }, { note: 'A4', duration: 0.8 },
      // "Hearts or clubs, maybe diamonds revealed"
      { note: 'G4', duration: 0.4 }, { note: 'B4', duration: 0.4 }, { note: 'D5', duration: 0.7 },
      { note: 'D5', duration: 0.3 }, { note: 'E5', duration: 0.3 }, { note: 'D5', duration: 0.3 }, { note: 'B4', duration: 0.3 }, { note: 'A4', duration: 0.3 }, { note: 'G4', duration: 0.8 },
      // "We play all night when we shuffle up and deal"
      { note: 'G4', duration: 0.35 }, { note: 'A4', duration: 0.35 }, { note: 'B4', duration: 0.35 }, { note: 'D5', duration: 0.7 },
      { note: 'B4', duration: 0.4 }, { note: 'A4', duration: 0.4 }, { note: 'G4', duration: 0.4 }, { note: 'G4', duration: 1.5 },
    ],
    bassLine: ['G2', 'D3', 'E2', 'B2', 'C3', 'G2', 'D3', 'A2', 'G2', 'D3', 'C3', 'G2', 'D3', 'A2', 'G2', 'D3'],
  },

  // 2. Go Alone Tonight - Fast Bluegrass Banjo Stomp
  track_02: {
    tempo: 136,
    timeSignature: '2/4',
    instrument: 'banjo',
    chords: [
      ['G2', 'D3', 'G3', 'B3', 'D4'],
      ['C3', 'G3', 'C4', 'E4'],
      ['D3', 'A3', 'D4', 'F#4'],
      ['G2', 'D3', 'G3', 'B3'],
    ],
    leadMelody: [
      { note: 'D4', duration: 0.25 }, { note: 'B3', duration: 0.25 }, { note: 'D4', duration: 0.25 }, { note: 'G4', duration: 0.5 },
      { note: 'B4', duration: 0.25 }, { note: 'A4', duration: 0.25 }, { note: 'G4', duration: 0.5 },
      { note: 'E4', duration: 0.25 }, { note: 'G4', duration: 0.25 }, { note: 'A4', duration: 0.5 },
      { note: 'D4', duration: 0.25 }, { note: 'F#4', duration: 0.25 }, { note: 'G4', duration: 0.75 },
    ],
    bassLine: ['G2', 'D3', 'C2', 'G2', 'D2', 'A2', 'G2', 'D3'],
  },

  // 3. Hold the Jack - Mellow Country Soul & Bower Anthem
  track_03: {
    tempo: 98,
    timeSignature: '4/4',
    instrument: 'saloon_piano',
    chords: [
      ['E2', 'B2', 'E3', 'G3', 'B3'],
      ['A2', 'E3', 'A3', 'C4'],
      ['D2', 'A2', 'D3', 'F3', 'A3'],
      ['B2', 'F#3', 'B3', 'D#4'],
    ],
    leadMelody: [
      { note: 'B3', duration: 0.5 }, { note: 'E4', duration: 0.75 }, { note: 'G4', duration: 0.5 },
      { note: 'F#4', duration: 0.5 }, { note: 'E4', duration: 0.5 }, { note: 'D4', duration: 0.75 },
      { note: 'C4', duration: 0.5 }, { note: 'B3', duration: 0.5 }, { note: 'A3', duration: 0.75 },
      { note: 'B3', duration: 1.5 },
    ],
    bassLine: ['E2', 'B2', 'A2', 'E2', 'D2', 'A2', 'B2', 'F#2'],
  },

  // 4. Jack on the Rail - Midwest Country Rock
  track_04: {
    tempo: 120,
    timeSignature: '4/4',
    instrument: 'slide_guitar',
    chords: [
      ['A2', 'E3', 'A3', 'C#4', 'E4'],
      ['D3', 'A3', 'D4', 'F#4'],
      ['E3', 'B3', 'E4', 'G#4'],
      ['A2', 'E3', 'A3', 'C#4'],
    ],
    leadMelody: [
      { note: 'A4', duration: 0.5 }, { note: 'G4', duration: 0.25 }, { note: 'E4', duration: 0.5 },
      { note: 'D4', duration: 0.5 }, { note: 'C4', duration: 0.25 }, { note: 'A3', duration: 0.75 },
      { note: 'C4', duration: 0.5 }, { note: 'D4', duration: 0.5 }, { note: 'E4', duration: 0.5 },
      { note: 'A4', duration: 1.25 },
    ],
    bassLine: ['A2', 'E3', 'D2', 'A2', 'E2', 'B2', 'A2', 'E3'],
  },

  // 5. Kitty by the Lamplight - Acoustic Porchlight Night Ballad
  track_05: {
    tempo: 92,
    timeSignature: '3/4',
    instrument: 'acoustic_guitar',
    chords: [
      ['D3', 'A3', 'D4', 'F#4'],
      ['B2', 'F#3', 'B3', 'D4'],
      ['G2', 'D3', 'G3', 'B3'],
      ['A2', 'E3', 'A3', 'C#4'],
    ],
    leadMelody: [
      { note: 'F#4', duration: 0.75 }, { note: 'E4', duration: 0.25 }, { note: 'D4', duration: 0.5 },
      { note: 'B3', duration: 0.75 }, { note: 'D4', duration: 0.25 }, { note: 'E4', duration: 0.5 },
      { note: 'G4', duration: 0.75 }, { note: 'F#4', duration: 0.25 }, { note: 'E4', duration: 0.5 },
      { note: 'D4', duration: 1.5 },
    ],
    bassLine: ['D2', 'A2', 'B2', 'F#2', 'G2', 'D2', 'A2', 'E2'],
  },

  // 6. Left Bower Highway - Upbeat Country Americana Swing
  track_06: {
    tempo: 138,
    timeSignature: '4/4',
    instrument: 'fiddle',
    chords: [
      ['G2', 'B2', 'D3', 'G3'],
      ['E2', 'G2', 'B2', 'E3'],
      ['C3', 'E3', 'G3', 'C4'],
      ['D3', 'F#3', 'A3', 'D4'],
    ],
    leadMelody: [
      { note: 'G4', duration: 0.25 }, { note: 'B4', duration: 0.25 }, { note: 'D5', duration: 0.5 },
      { note: 'E5', duration: 0.25 }, { note: 'D5', duration: 0.25 }, { note: 'B4', duration: 0.5 },
      { note: 'A4', duration: 0.25 }, { note: 'G4', duration: 0.25 }, { note: 'E4', duration: 0.5 },
      { note: 'G4', duration: 1.0 },
    ],
    bassLine: ['G2', 'D3', 'E2', 'B2', 'C3', 'G3', 'D3', 'A3'],
  },

  // 7. Pick It Up If You Dare - High Energy Bluegrass Stomp
  track_07: {
    tempo: 144,
    timeSignature: '2/4',
    instrument: 'banjo',
    chords: [
      ['D2', 'A2', 'D3', 'F#3'],
      ['G2', 'D3', 'G3', 'B3'],
      ['A2', 'E3', 'A3', 'C#4'],
      ['D2', 'A2', 'D3', 'F#3'],
    ],
    leadMelody: [
      { note: 'A4', duration: 0.25 }, { note: 'F#4', duration: 0.25 }, { note: 'D4', duration: 0.25 }, { note: 'F#4', duration: 0.25 },
      { note: 'G4', duration: 0.25 }, { note: 'B4', duration: 0.25 }, { note: 'A4', duration: 0.5 },
      { note: 'C#5', duration: 0.25 }, { note: 'A4', duration: 0.25 }, { note: 'D5', duration: 0.75 },
    ],
    bassLine: ['D2', 'A2', 'G2', 'D3', 'A2', 'E2', 'D2', 'A2'],
  },

  // 8. Play It Where It Lands - Warm Country Wisdom
  track_08: {
    tempo: 106,
    timeSignature: '4/4',
    instrument: 'saloon_piano',
    chords: [
      ['F2', 'C3', 'F3', 'A3'],
      ['C3', 'G3', 'C4', 'E4'],
      ['D2', 'A2', 'D3', 'F3'],
      ['Bb2', 'F3', 'Bb3', 'D4'],
    ],
    leadMelody: [
      { note: 'A4', duration: 0.5 }, { note: 'C5', duration: 0.5 }, { note: 'G4', duration: 0.75 },
      { note: 'F4', duration: 0.5 }, { note: 'E4', duration: 0.5 }, { note: 'D4', duration: 0.75 },
      { note: 'F4', duration: 0.5 }, { note: 'G4', duration: 0.5 }, { note: 'A4', duration: 1.0 },
    ],
    bassLine: ['F2', 'C3', 'C2', 'G2', 'D2', 'A2', 'Bb2', 'F2'],
  },

  // 9. Porchlight Game to 10 - Traditional Folk Epic
  track_09: {
    tempo: 96,
    timeSignature: '4/4',
    instrument: 'acoustic_guitar',
    chords: [
      ['A2', 'E3', 'A3', 'C4'],
      ['G2', 'D3', 'G3', 'B3'],
      ['F2', 'C3', 'F3', 'A3'],
      ['E2', 'B2', 'E3', 'G#3'],
    ],
    leadMelody: [
      { note: 'A3', duration: 0.5 }, { note: 'C4', duration: 0.5 }, { note: 'E4', duration: 0.75 },
      { note: 'D4', duration: 0.5 }, { note: 'B3', duration: 0.5 }, { note: 'G3', duration: 0.75 },
      { note: 'A3', duration: 0.5 }, { note: 'C4', duration: 0.5 }, { note: 'B3', duration: 1.0 },
      { note: 'A3', duration: 1.5 },
    ],
    bassLine: ['A2', 'E2', 'G2', 'D2', 'F2', 'C2', 'E2', 'B1'],
  },

  // 10. Deal Me Something True - Warm Acoustic Porchlight Folk
  track_10: {
    tempo: 104,
    timeSignature: '4/4',
    instrument: 'acoustic_guitar',
    chords: [
      ['C3', 'G3', 'C4', 'E4'],
      ['A2', 'E3', 'A3', 'C4'],
      ['F2', 'C3', 'F3', 'A3'],
      ['G2', 'D3', 'G3', 'B3'],
    ],
    leadMelody: [
      { note: 'E4', duration: 0.5 }, { note: 'G4', duration: 0.5 }, { note: 'A4', duration: 1.0 },
      { note: 'G4', duration: 0.5 }, { note: 'E4', duration: 0.5 }, { note: 'D4', duration: 1.0 },
      { note: 'C4', duration: 0.5 }, { note: 'D4', duration: 0.5 }, { note: 'E4', duration: 0.75 }, { note: 'D4', duration: 0.25 },
      { note: 'C4', duration: 1.5 },
    ],
    bassLine: ['C2', 'G2', 'A2', 'E2', 'F2', 'C2', 'G2', 'G2'],
  },

  // 11. Trump That Feeling - Soulful Country Blues
  track_11: {
    tempo: 114,
    timeSignature: '4/4',
    instrument: 'slide_guitar',
    chords: [
      ['E2', 'B2', 'E3', 'G#3', 'B3'],
      ['A2', 'E3', 'A3', 'C#4'],
      ['B2', 'F#3', 'B3', 'D#4'],
      ['E2', 'B2', 'E3', 'G#3'],
    ],
    leadMelody: [
      { note: 'E4', duration: 0.5 }, { note: 'G4', duration: 0.25 }, { note: 'G#4', duration: 0.5 },
      { note: 'B4', duration: 0.5 }, { note: 'A4', duration: 0.5 }, { note: 'E4', duration: 0.5 },
      { note: 'D4', duration: 0.25 }, { note: 'E4', duration: 1.25 },
    ],
    bassLine: ['E2', 'B2', 'A2', 'E2', 'B2', 'F#2', 'E2', 'B2'],
  },

  // 12. Trump on the Turn - Honky-Tonk Brass & Tournament Twang
  track_12: {
    tempo: 130,
    timeSignature: '4/4',
    instrument: 'trumpet',
    chords: [
      ['D2', 'A2', 'D3', 'F#3'],
      ['B2', 'F#3', 'B3', 'D4'],
      ['G2', 'D3', 'G3', 'B3'],
      ['A2', 'E3', 'A3', 'C#4'],
    ],
    leadMelody: [
      { note: 'D4', duration: 0.25 }, { note: 'F#4', duration: 0.25 }, { note: 'A4', duration: 0.5 },
      { note: 'D5', duration: 0.5 }, { note: 'C#5', duration: 0.25 }, { note: 'B4', duration: 0.5 },
      { note: 'A4', duration: 0.25 }, { note: 'G4', duration: 0.25 }, { note: 'F#4', duration: 0.5 },
      { note: 'E4', duration: 0.25 }, { note: 'D4', duration: 0.75 },
    ],
    bassLine: ['D2', 'A2', 'B2', 'F#2', 'G2', 'D2', 'A2', 'E2'],
  },

  // 13. Pine Hollow Morning Strings - Pine Hollow Theme
  track_13: {
    tempo: 108,
    timeSignature: '3/4',
    instrument: 'acoustic_guitar',
    chords: [
      ['G2', 'D3', 'G3', 'B3'],
      ['Em2', 'B2', 'E3', 'G3'],
      ['C3', 'G3', 'C4', 'E4'],
      ['D3', 'A3', 'D4', 'F#4'],
    ],
    leadMelody: [
      { note: 'B3', duration: 0.5 }, { note: 'D4', duration: 0.5 }, { note: 'G4', duration: 0.75 },
      { note: 'E4', duration: 0.5 }, { note: 'G4', duration: 0.5 }, { note: 'B4', duration: 0.75 },
      { note: 'A4', duration: 0.5 }, { note: 'G4', duration: 0.5 }, { note: 'F#4', duration: 0.5 },
      { note: 'G4', duration: 1.5 },
    ],
    bassLine: ['G2', 'D3', 'E2', 'B2', 'C3', 'G3', 'D3', 'A2'],
  },

  // 14. Riverbend Dockside Banjo - Riverbend Theme
  track_14: {
    tempo: 134,
    timeSignature: '2/4',
    instrument: 'banjo',
    chords: [
      ['C3', 'E3', 'G3', 'C4'],
      ['F2', 'A2', 'C3', 'F3'],
      ['G2', 'B2', 'D3', 'G3'],
      ['C3', 'E3', 'G3', 'C4'],
    ],
    leadMelody: [
      { note: 'G4', duration: 0.25 }, { note: 'E4', duration: 0.25 }, { note: 'C4', duration: 0.25 }, { note: 'E4', duration: 0.25 },
      { note: 'F4', duration: 0.25 }, { note: 'A4', duration: 0.25 }, { note: 'C5', duration: 0.5 },
      { note: 'B4', duration: 0.25 }, { note: 'G4', duration: 0.25 }, { note: 'D4', duration: 0.25 }, { note: 'F4', duration: 0.25 },
      { note: 'E4', duration: 0.25 }, { note: 'C4', duration: 0.75 },
    ],
    bassLine: ['C3', 'G2', 'F2', 'C3', 'G2', 'D3', 'C3', 'G2'],
  },

  // 15. Maple Crossing Autumn Waltz - Maple Crossing Theme
  track_15: {
    tempo: 102,
    timeSignature: '3/4',
    instrument: 'accordion',
    chords: [
      ['F2', 'A2', 'C3', 'F3'],
      ['Dm2', 'F2', 'A2', 'D3'],
      ['Bb2', 'D3', 'F3', 'Bb3'],
      ['C3', 'E3', 'G3', 'C4'],
    ],
    leadMelody: [
      { note: 'A4', duration: 0.75 }, { note: 'C5', duration: 0.5 }, { note: 'F4', duration: 0.5 },
      { note: 'D4', duration: 0.75 }, { note: 'F4', duration: 0.5 }, { note: 'A4', duration: 0.5 },
      { note: 'G4', duration: 0.75 }, { note: 'F4', duration: 0.25 }, { note: 'E4', duration: 0.5 },
      { note: 'F4', duration: 1.5 },
    ],
    bassLine: ['F2', 'C3', 'D2', 'A2', 'Bb2', 'F2', 'C3', 'G2'],
  },

  // 16. Iron Junction Steam & Steel - Iron Junction Theme
  track_16: {
    tempo: 116,
    timeSignature: '4/4',
    instrument: 'slide_guitar',
    chords: [
      ['D2', 'A2', 'D3', 'F3'],
      ['G2', 'D3', 'G3', 'Bb3'],
      ['A2', 'E3', 'A3', 'C4'],
      ['D2', 'A2', 'D3', 'F3'],
    ],
    leadMelody: [
      { note: 'D4', duration: 0.5 }, { note: 'F4', duration: 0.25 }, { note: 'G4', duration: 0.5 },
      { note: 'Ab4', duration: 0.25 }, { note: 'A4', duration: 0.75 }, { note: 'C5', duration: 0.5 },
      { note: 'A4', duration: 0.5 }, { note: 'F4', duration: 0.5 }, { note: 'D4', duration: 1.25 },
    ],
    bassLine: ['D2', 'A2', 'G2', 'D2', 'A2', 'E2', 'D2', 'A2'],
  },

  // 17. Grand Club City Champion Anthem - Grand Club City Theme
  track_17: {
    tempo: 126,
    timeSignature: '4/4',
    instrument: 'trumpet',
    chords: [
      ['Bb2', 'F3', 'Bb3', 'D4'],
      ['Eb2', 'Bb2', 'Eb3', 'G3'],
      ['F2', 'C3', 'F3', 'A3'],
      ['Bb2', 'F3', 'Bb3', 'D4'],
    ],
    leadMelody: [
      { note: 'F4', duration: 0.5 }, { note: 'Bb4', duration: 0.5 }, { note: 'D5', duration: 0.75 },
      { note: 'Eb5', duration: 0.25 }, { note: 'D5', duration: 0.5 }, { note: 'C5', duration: 0.5 },
      { note: 'Bb4', duration: 0.5 }, { note: 'C5', duration: 0.5 }, { note: 'D5', duration: 0.75 },
      { note: 'Bb4', duration: 1.5 },
    ],
    bassLine: ['Bb2', 'F2', 'Eb2', 'Bb1', 'F2', 'C2', 'Bb2', 'F2'],
  },

  // 18. Crown Capital Sovereign Symphony - Crown Capital Theme
  track_18: {
    tempo: 104,
    timeSignature: '4/4',
    instrument: 'saloon_piano',
    chords: [
      ['C3', 'G3', 'C4', 'E4', 'G4'],
      ['G2', 'D3', 'G3', 'B3', 'D4'],
      ['Am2', 'E3', 'A3', 'C4', 'E4'],
      ['F2', 'C3', 'F3', 'A3', 'C4'],
    ],
    leadMelody: [
      { note: 'G4', duration: 0.5 }, { note: 'E4', duration: 0.5 }, { note: 'C5', duration: 0.75 },
      { note: 'B4', duration: 0.5 }, { note: 'G4', duration: 0.5 }, { note: 'A4', duration: 0.75 },
      { note: 'F4', duration: 0.5 }, { note: 'A4', duration: 0.5 }, { note: 'G4', duration: 0.5 },
      { note: 'C5', duration: 1.5 },
    ],
    bassLine: ['C2', 'G2', 'G1', 'D2', 'A1', 'E2', 'F1', 'C2'],
  },
};
