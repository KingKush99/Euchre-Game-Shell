// Web Audio API sound generator and Western Saloon music synthesizer for Governor of Poker
export interface MusicTrack {
  id: string;
  name: string;
  tempo: number; // BPM
  notes: Array<{ note: string; duration: number; octave?: number }>;
}

const NOTE_FREQS: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
  C6: 1046.5,
};

export const SALOON_TRACKS: MusicTrack[] = [
  {
    id: 'shuffle_up_and_deal',
    name: 'Shuffle Up and Deal (Official Theme)',
    tempo: 124,
    notes: [
      { note: 'D4', duration: 0.25 }, { note: 'G4', duration: 0.25 }, { note: 'B4', duration: 0.5 }, { note: 'D5', duration: 0.5 },
      { note: 'D4', duration: 0.35 }, { note: 'D4', duration: 0.35 }, { note: 'G4', duration: 0.35 }, { note: 'G4', duration: 0.35 }, { note: 'G4', duration: 0.35 }, { note: 'A4', duration: 0.35 }, { note: 'B4', duration: 0.6 },
      { note: 'B4', duration: 0.4 }, { note: 'A4', duration: 0.4 }, { note: 'G4', duration: 0.4 }, { note: 'E4', duration: 0.8 },
      { note: 'E4', duration: 0.35 }, { note: 'G4', duration: 0.35 }, { note: 'A4', duration: 0.35 }, { note: 'B4', duration: 0.7 },
      { note: 'A4', duration: 0.35 }, { note: 'G4', duration: 0.35 }, { note: 'E4', duration: 0.35 }, { note: 'D4', duration: 0.8 },
      { note: 'D4', duration: 0.4 }, { note: 'G4', duration: 0.4 }, { note: 'B4', duration: 0.6 },
      { note: 'B4', duration: 0.4 }, { note: 'A4', duration: 0.4 }, { note: 'G4', duration: 0.6 },
      { note: 'E4', duration: 0.35 }, { note: 'G4', duration: 0.35 }, { note: 'A4', duration: 0.35 }, { note: 'B4', duration: 0.6 },
      { note: 'A4', duration: 0.4 }, { note: 'G4', duration: 0.4 }, { note: 'G4', duration: 1.0 },
      { note: 'D4', duration: 0.4 }, { note: 'G4', duration: 0.4 }, { note: 'B4', duration: 0.4 }, { note: 'D5', duration: 0.8 },
      { note: 'D5', duration: 0.3 }, { note: 'C5', duration: 0.3 }, { note: 'B4', duration: 0.3 }, { note: 'A4', duration: 0.3 }, { note: 'G4', duration: 0.8 },
      { note: 'G4', duration: 0.35 }, { note: 'B4', duration: 0.35 }, { note: 'D5', duration: 0.35 }, { note: 'E5', duration: 0.8 },
      { note: 'E5', duration: 0.35 }, { note: 'D5', duration: 0.35 }, { note: 'B4', duration: 0.35 }, { note: 'A4', duration: 0.8 },
      { note: 'G4', duration: 0.4 }, { note: 'B4', duration: 0.4 }, { note: 'D5', duration: 0.7 },
      { note: 'D5', duration: 0.3 }, { note: 'E5', duration: 0.3 }, { note: 'D5', duration: 0.3 }, { note: 'B4', duration: 0.3 }, { note: 'A4', duration: 0.3 }, { note: 'G4', duration: 0.8 },
      { note: 'G4', duration: 0.35 }, { note: 'A4', duration: 0.35 }, { note: 'B4', duration: 0.35 }, { note: 'D5', duration: 0.7 },
      { note: 'B4', duration: 0.4 }, { note: 'A4', duration: 0.4 }, { note: 'G4', duration: 0.4 }, { note: 'G4', duration: 1.5 },
    ],
  },
  {
    id: 'ragtime_entertainer',
    name: 'The Entertainer (Saloon Ragtime)',
    tempo: 128,
    notes: [
      { note: 'D4', duration: 0.25 }, { note: 'E4', duration: 0.25 }, { note: 'C5', duration: 0.5 },
      { note: 'A4', duration: 0.25 }, { note: 'B4', duration: 0.25 }, { note: 'G4', duration: 0.5 },
      { note: 'D4', duration: 0.25 }, { note: 'E4', duration: 0.25 }, { note: 'C5', duration: 0.5 },
      { note: 'A4', duration: 0.25 }, { note: 'B4', duration: 0.25 }, { note: 'G4', duration: 0.75 },
      { note: 'G4', duration: 0.25 }, { note: 'A4', duration: 0.25 }, { note: 'B4', duration: 0.25 },
      { note: 'C5', duration: 0.5 }, { note: 'E5', duration: 0.5 }, { note: 'D5', duration: 0.5 },
      { note: 'C5', duration: 0.5 }, { note: 'D5', duration: 0.5 }, { note: 'E5', duration: 0.75 },
    ],
  },
  {
    id: 'maple_leaf_rag',
    name: 'Frontier Saloon Bounce',
    tempo: 136,
    notes: [
      { note: 'C4', duration: 0.25 }, { note: 'E4', duration: 0.25 }, { note: 'G4', duration: 0.25 }, { note: 'C5', duration: 0.5 },
      { note: 'B4', duration: 0.25 }, { note: 'A4', duration: 0.25 }, { note: 'G4', duration: 0.5 },
      { note: 'E4', duration: 0.25 }, { note: 'G4', duration: 0.25 }, { note: 'C5', duration: 0.5 },
      { note: 'D5', duration: 0.25 }, { note: 'E5', duration: 0.25 }, { note: 'C5', duration: 0.75 },
      { note: 'A4', duration: 0.25 }, { note: 'C5', duration: 0.25 }, { note: 'F5', duration: 0.5 },
      { note: 'G4', duration: 0.25 }, { note: 'B4', duration: 0.25 }, { note: 'E5', duration: 0.5 },
      { note: 'C5', duration: 0.75 },
    ],
  },
  {
    id: 'cowboy_strum',
    name: 'Dusty Trail Guitar',
    tempo: 100,
    notes: [
      { note: 'E3', duration: 0.5 }, { note: 'B3', duration: 0.25 }, { note: 'E4', duration: 0.5 }, { note: 'G4', duration: 0.75 },
      { note: 'A3', duration: 0.5 }, { note: 'E4', duration: 0.25 }, { note: 'A4', duration: 0.5 }, { note: 'C5', duration: 0.75 },
      { note: 'B3', duration: 0.5 }, { note: 'F4', duration: 0.25 }, { note: 'B4', duration: 0.5 }, { note: 'D5', duration: 0.75 },
      { note: 'E3', duration: 0.5 }, { note: 'G4', duration: 0.5 }, { note: 'E4', duration: 1.0 },
    ],
  },
];

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private musicEnabled: boolean = false;
  private volume: number = 0.6;
  private musicVolume: number = 0.4;
  private currentTrackIndex: number = 0;
  private musicTimeout: ReturnType<typeof setTimeout> | null = null;
  private isMusicPlaying: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
  }

  public getVolume(): number {
    return this.volume;
  }

  public setMusicVolume(val: number) {
    this.musicVolume = Math.max(0, Math.min(1, val));
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  public isMusicOn(): boolean {
    return this.musicEnabled;
  }

  public getCurrentTrack(): MusicTrack {
    return SALOON_TRACKS[this.currentTrackIndex];
  }

  public setTrack(index: number) {
    this.currentTrackIndex = Math.max(0, Math.min(SALOON_TRACKS.length - 1, index));
    if (this.isMusicPlaying) {
      this.stopMusic();
      this.startMusic();
    }
  }

  public toggleMusic(): boolean {
    if (this.musicEnabled) {
      this.stopMusic();
      this.musicEnabled = false;
    } else {
      this.musicEnabled = true;
      this.startMusic();
    }
    return this.musicEnabled;
  }

  public startMusic() {
    this.initCtx();
    if (!this.ctx) return;
    this.stopMusic();
    this.isMusicPlaying = true;
    this.playMusicLoop(0);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimeout) {
      clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
  }

  private playMusicLoop(noteIdx: number) {
    if (!this.isMusicPlaying || !this.musicEnabled || !this.ctx) return;

    const track = SALOON_TRACKS[this.currentTrackIndex];
    const currentNote = track.notes[noteIdx % track.notes.length];
    const freq = NOTE_FREQS[currentNote.note] || 440;
    const durationSec = (currentNote.duration * (60 / track.tempo)) * 1.5;

    // Synthesize Honky-tonk piano / banjo string timbre
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Detuned dual oscillators for vintage saloon piano sound
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(freq * 1.004, t); // Honky-tonk slightly out-of-tune chorus

    const noteVolume = this.musicVolume * 0.15;
    gain.gain.setValueAtTime(noteVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + durationSec * 0.95);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc2.start(t);
    osc.stop(t + durationSec);
    osc2.stop(t + durationSec);

    // Schedule next note
    this.musicTimeout = setTimeout(() => {
      this.playMusicLoop(noteIdx + 1);
    }, durationSec * 1000);
  }

  // Card slide / deal sound
  public playCardDeal() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

    gain.gain.setValueAtTime(this.volume * 0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  // Card throw / whoosh flick sound
  public playCardThrow() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Aerodynamic whoosh using bandpass-filtered noise + oscillator sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(580, t);
    osc.frequency.exponentialRampToValueAtTime(160, t + 0.12);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.Q.setValueAtTime(1.8, t);

    gain.gain.setValueAtTime(this.volume * 0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  // Card landing on cloth felt sound (muffled crisp slap)
  public playCardDrop() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.05);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);

    gain.gain.setValueAtTime(this.volume * 0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  // Chip clink sound
  public playChipSound() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800 + Math.random() * 400, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.07);

    gain.gain.setValueAtTime(this.volume * 0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.07);

    // Second bounce
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2200 + Math.random() * 300, t + 0.03);
    osc2.frequency.exponentialRampToValueAtTime(1000, t + 0.09);

    gain2.gain.setValueAtTime(this.volume * 0.25, t + 0.03);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);

    osc2.start(t + 0.03);
    osc2.stop(t + 0.09);
  }

  // Check / Table Knock sound
  public playCheckKnock() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [0, 0.09].forEach((delay) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, t + delay);
      osc.frequency.exponentialRampToValueAtTime(40, t + delay + 0.06);

      gain.gain.setValueAtTime(this.volume * 0.5, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + delay);
      osc.stop(t + delay + 0.06);
    });
  }

  // Card riffle shuffle sound sequence
  public playShuffle() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    for (let i = 0; i < 12; i++) {
      const delay = i * 0.035;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(500 + Math.random() * 300, t + delay);
      osc.frequency.exponentialRampToValueAtTime(150, t + delay + 0.04);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400 + Math.random() * 400, t + delay);

      gain.gain.setValueAtTime(this.volume * 0.3, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.04);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + delay);
      osc.stop(t + delay + 0.04);
    }
  }

  // Fold sound
  public playFold() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.14);

    gain.gain.setValueAtTime(this.volume * 0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  // All-In Western Stinger
  public playAllIn() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [293.66, 369.99, 440.0, 587.33]; // D major chord
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);

      gain.gain.setValueAtTime(this.volume * 0.25, t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.04);
      osc.stop(t + 0.45);
    });
  }

  // Win Fanfare
  public playWin() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const melody = [
      { f: 523.25, d: 0.1 }, // C5
      { f: 659.25, d: 0.1 }, // E5
      { f: 783.99, d: 0.1 }, // G5
      { f: 1046.5, d: 0.35 }, // C6
    ];

    let current = t;
    melody.forEach((note) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, current);

      gain.gain.setValueAtTime(this.volume * 0.4, current);
      gain.gain.exponentialRampToValueAtTime(0.001, current + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(current);
      osc.stop(current + note.d);
      current += note.d * 0.85;
    });
  }

  // Wheel tick
  public playWheelTick() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.02);

    gain.gain.setValueAtTime(this.volume * 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.02);
  }

  // Button click
  public playClick() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.03);

    gain.gain.setValueAtTime(this.volume * 0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.03);
  }

  // Western Saloon Bell / Sheriff Badge ding
  public playBell() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.35);

    gain.gain.setValueAtTime(this.volume * 0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.35);
  }

  // Vintage vehicle squeeze horn (Honk honk!)
  public playHorn() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(420, t);
    osc2.frequency.setValueAtTime(520, t);

    gain.gain.setValueAtTime(this.volume * 0.25, t);
    gain.gain.setValueAtTime(this.volume * 0.28, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.28);
    osc2.stop(t + 0.28);
  }

  // Vehicle ignition / enter
  public playVehicleIgnition() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.linearRampToValueAtTime(220, t + 0.2);
    osc.frequency.linearRampToValueAtTime(140, t + 0.4);

    gain.gain.setValueAtTime(this.volume * 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.45);
  }

  // Object collision impact thud
  public playCollisionThud() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.16);

    gain.gain.setValueAtTime(this.volume * 0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  // NPC bump reaction
  public playNpcBump() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(480, t + 0.12);

    gain.gain.setValueAtTime(this.volume * 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Realistic wooden dice clatter / roll sound
  public playDiceRoll() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Series of quick wooden impacts
    [0, 0.06, 0.13, 0.21, 0.29].forEach((offset, idx) => {
      if (!this.ctx) return;
      const hitTime = t + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const baseFreq = 220 + idx * 45 + Math.random() * 60;
      osc.frequency.setValueAtTime(baseFreq, hitTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.45, hitTime + 0.04);

      const amp = this.volume * (0.28 - idx * 0.04);
      gain.gain.setValueAtTime(Math.max(0.01, amp), hitTime);
      gain.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(hitTime);
      osc.stop(hitTime + 0.05);
    });
  }

  // Convenience aliases for EuchreTable and games
  public playChip() {
    this.playChipSound();
  }

  public playCoin() {
    this.playChipSound();
  }

  public playRiffle() {
    this.playShuffle();
  }

  public playCheer() {
    this.playWin();
  }
}

export const sounds = new SoundEffectsManager();
