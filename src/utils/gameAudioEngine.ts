import { GAME_TRACKS, GameTrack, RepeatMode, AudioSettings } from '../types/music';
import {
  storeTrackAudio,
  getTrackAudio,
  getAllStoredTrackIds,
  getAllStoredTrackMetadataMap,
  getAllCustomTrackMetadata,
  deleteTrackAudio,
} from './audioStorage';
import { INDIVIDUAL_TRACK_COMPOSITIONS, TrackComposition } from './trackSynthesisData';

// Note frequencies for procedural music synthesis fallback
const FREQS: Record<string, number> = {
  G1: 49.00, A1: 55.00, B1: 61.74,
  C2: 65.41, 'C#2': 69.30, D2: 73.42, 'D#2': 77.78, Eb2: 77.78, E2: 82.41, F2: 87.31, 'F#2': 92.50, G2: 98.00, 'G#2': 103.83, Ab2: 103.83, A2: 110.00, Bb2: 116.54, B2: 123.47,
  C3: 130.81, 'C#3': 138.59, D3: 146.83, 'D#3': 155.56, Eb3: 155.56, E3: 164.81, F3: 174.61, 'F#3': 185.00, G3: 196.00, 'G#3': 207.65, Ab3: 207.65, A3: 220.00, Bb3: 233.08, B3: 246.94,
  C4: 261.63, 'C#4': 277.18, D4: 293.66, 'D#4': 311.13, Eb4: 311.13, E4: 329.63, F4: 349.23, 'F#4': 369.99, G4: 392.00, 'G#4': 415.30, Ab4: 415.30, A4: 440.00, Bb4: 466.16, B4: 493.88,
  C5: 523.25, 'C#5': 554.37, D5: 587.33, 'D#5': 622.25, Eb5: 622.25, E5: 659.25, F5: 698.46, 'F#5': 739.99, G5: 783.99, 'G#5': 830.61, Ab5: 830.61, A5: 880.00, Bb5: 932.33, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51,
};

function getFreq(note: string): number {
  if (FREQS[note]) return FREQS[note];
  // Strip non-standard chord markers like "Em2", "Am2", "Dm2"
  const cleaned = note.replace(/^(Am|Em|Dm|Bm|Fm|Gm|Cm)/i, (m) => m[0]);
  return FREQS[cleaned] || 440;
}

const FAVORITES_KEY = 'euchre_music_favorites_v4';
const DOWNLOADS_KEY = 'euchre_music_downloads_v4';
const SETTINGS_KEY = 'euchre_music_settings_v4';

export interface PlaybackState {
  currentTrack: GameTrack;
  isPlaying: boolean;
  currentTimeSec: number;
  durationSec: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  queue: GameTrack[];
  likedTrackIds: Set<string>;
  downloadedTrackIds: Set<string>;
  settings: AudioSettings;
  activePlaylistName: string;
  allTracks: GameTrack[];
  hasRealAudio: boolean;
}

/**
 * Normalizes strings for robust fuzzy song-name matching.
 * e.g. "01 - Deal_Me_Something_True.mp3" -> "deal me something true"
 */
export function normalizeTrackName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '') // strip extension
    .replace(/^(\d+[\s._-]+|track[\s._-]*\d+[\s._-]*)/i, '') // strip leading "01 -", "track_01_", etc.
    .replace(/[^a-z0-9]/g, ' ') // replace non-alphanumeric with spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Creates a valid Audio ObjectURL with normalized MIME type for WAV, MP3, OGG, etc.
 * Ensures WAV files with empty or non-standard MIME types play natively.
 */
export function createAudioBlobUrl(blobOrFile: Blob | File, filename?: string): string {
  let type = blobOrFile.type;
  const name = (filename || (blobOrFile as File).name || '').toLowerCase();

  if (!type || type === 'application/octet-stream' || type === 'binary/octet-stream') {
    if (name.endsWith('.wav')) type = 'audio/wav';
    else if (name.endsWith('.mp3')) type = 'audio/mpeg';
    else if (name.endsWith('.ogg')) type = 'audio/ogg';
    else if (name.endsWith('.m4a') || name.endsWith('.mp4')) type = 'audio/mp4';
    else if (name.endsWith('.flac')) type = 'audio/flac';
    else if (name.endsWith('.aac')) type = 'audio/aac';
    else type = 'audio/wav';
  }

  const typedBlob = new Blob([blobOrFile], { type });
  return URL.createObjectURL(typedBlob);
}

class GameAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private audioBlobUrls: Map<string, string> = new Map();
  private isUsingRealAudio: boolean = false;

  private allTracks: GameTrack[] = GAME_TRACKS.map((t) => ({ ...t }));
  private currentTrackIndex: number = 0;
  private isPlaying: boolean = false;
  private currentTimeSec: number = 0;
  private volume: number = 0.75;
  private isMuted: boolean = false;
  private isShuffle: boolean = false;
  private repeatMode: RepeatMode = 'all';
  private queue: GameTrack[] = [];
  private likedTrackIds: Set<string> = new Set();
  private downloadedTrackIds: Set<string> = new Set();
  private activePlaylistName: string = 'Euchre Saloon: Official Sessions';

  private settings: AudioSettings = {
    musicVolume: 0.75,
    sfxVolume: 0.8,
    isMuted: false,
    crossfadeSec: 2,
    normalizeVolume: true,
    pauseOnBlur: false,
  };

  private playbackTimer: ReturnType<typeof setInterval> | null = null;
  private synthLoopTimeout: ReturnType<typeof setTimeout> | null = null;
  private listeners: Set<(state: PlaybackState) => void> = new Set();
  private currentMelodyStep: number = 0;
  private currentChordIndex: number = 0;

  constructor() {
    this.loadPersistedData();
    this.setupWindowEvents();
    this.initAudioElement();
    this.restoreStoredAudioFromDB();
  }

  private initAudioElement() {
    if (typeof window !== 'undefined') {
      this.audioElement = new Audio();
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
      this.audioElement.preload = 'auto';

      this.audioElement.addEventListener('ended', () => {
        if (this.repeatMode === 'one') {
          this.currentTimeSec = 0;
          this.audioElement!.currentTime = 0;
          this.audioElement!.play().catch(() => {});
        } else {
          this.next();
        }
      });

      this.audioElement.addEventListener('timeupdate', () => {
        if (this.audioElement && this.isUsingRealAudio) {
          this.currentTimeSec = Math.floor(this.audioElement.currentTime);
          this.emit();
        }
      });

      this.audioElement.addEventListener('loadedmetadata', () => {
        if (this.audioElement && this.audioElement.duration && !isNaN(this.audioElement.duration)) {
          const track = this.allTracks[this.currentTrackIndex];
          if (track) {
            track.durationSec = Math.floor(this.audioElement.duration);
            const m = Math.floor(track.durationSec / 60);
            const s = track.durationSec % 60;
            track.duration = `${m}:${s < 10 ? '0' : ''}${s}`;
          }
        }
      });

      this.audioElement.addEventListener('error', () => {
        // Fallback to procedural synth if audio URL fails
        this.isUsingRealAudio = false;
        if (this.isPlaying) {
          this.runSynthCycle();
        }
      });
    }
  }

  /**
   * Loads all audio blobs and custom tracks stored in IndexedDB across reboots.
   */
  private async restoreStoredAudioFromDB() {
    try {
      const storedIds = await getAllStoredTrackIds();
      const metaMap = await getAllStoredTrackMetadataMap();
      const customTracks = await getAllCustomTrackMetadata();

      // Merge custom tracks if not already present
      const existingIdSet = new Set(this.allTracks.map((t) => t.id));
      for (const ct of customTracks) {
        if (!existingIdSet.has(ct.id)) {
          this.allTracks.push(ct);
          existingIdSet.add(ct.id);
        }
      }

      // Check and attach audio blobs for all existing tracks
      for (const track of this.allTracks) {
        if (storedIds.includes(track.id)) {
          const blob = await getTrackAudio(track.id);
          if (blob) {
            const url = createAudioBlobUrl(blob, track.customFileName || `${track.title}.wav`);
            this.audioBlobUrls.set(track.id, url);
            track.hasCustomAudio = true;
            track.downloaded = true;
            this.downloadedTrackIds.add(track.id);

            const meta = metaMap[track.id];
            if (meta) {
              if (meta.customFileName) track.customFileName = meta.customFileName;
              if (meta.customFileSize) track.customFileSize = meta.customFileSize;
              if (meta.durationSec) {
                track.durationSec = meta.durationSec;
                const m = Math.floor(track.durationSec / 60);
                const s = track.durationSec % 60;
                track.duration = `${m}:${s < 10 ? '0' : ''}${s}`;
              }
            }
          }
        }
      }

      this.emit();
    } catch {
      // ignore
    }
  }

  private loadPersistedData() {
    try {
      const favs = localStorage.getItem(FAVORITES_KEY);
      if (favs) {
        this.likedTrackIds = new Set(JSON.parse(favs));
      } else {
        this.likedTrackIds = new Set(['track_01', 'track_02', 'track_03', 'track_07', 'track_11']);
      }

      const dls = localStorage.getItem(DOWNLOADS_KEY);
      if (dls) {
        this.downloadedTrackIds = new Set(JSON.parse(dls));
      } else {
        this.downloadedTrackIds = new Set(['track_01', 'track_02', 'track_03']);
      }

      const sett = localStorage.getItem(SETTINGS_KEY);
      if (sett) {
        this.settings = { ...this.settings, ...JSON.parse(sett) };
        this.volume = this.settings.musicVolume;
        this.isMuted = this.settings.isMuted;
      }
    } catch {
      // ignore
    }
  }

  private savePersistedData() {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(this.likedTrackIds)));
      localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(Array.from(this.downloadedTrackIds)));
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch {
      // ignore
    }
  }

  private setupWindowEvents() {
    if (typeof window !== 'undefined') {
      window.addEventListener('blur', () => {
        if (this.settings.pauseOnBlur && this.isPlaying) {
          this.pause();
        }
      });
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public subscribe(listener: (state: PlaybackState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
  }

  public getState(): PlaybackState {
    const rawTrack = this.allTracks[this.currentTrackIndex] || this.allTracks[0] || GAME_TRACKS[0];
    const currentTrack: GameTrack = {
      ...rawTrack,
      liked: this.likedTrackIds.has(rawTrack.id),
      downloaded: this.downloadedTrackIds.has(rawTrack.id),
    };

    return {
      currentTrack,
      isPlaying: this.isPlaying,
      currentTimeSec: this.currentTimeSec,
      durationSec: rawTrack.durationSec,
      volume: this.volume,
      isMuted: this.isMuted,
      isShuffle: this.isShuffle,
      repeatMode: this.repeatMode,
      queue: this.queue,
      likedTrackIds: this.likedTrackIds,
      downloadedTrackIds: this.downloadedTrackIds,
      settings: this.settings,
      activePlaylistName: this.activePlaylistName,
      allTracks: this.allTracks,
      hasRealAudio: this.isUsingRealAudio,
    };
  }

  public async playTrack(trackId: string) {
    const idx = this.allTracks.findIndex((t) => t.id === trackId);
    if (idx !== -1) {
      this.currentTrackIndex = idx;
      this.currentTimeSec = 0;
      this.currentMelodyStep = 0;
      this.currentChordIndex = 0;
      await this.startPlayback();
    }
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.startPlayback();
    }
  }

  public pause() {
    this.isPlaying = false;
    if (this.audioElement) {
      this.audioElement.pause();
    }
    if (this.playbackTimer) {
      clearInterval(this.playbackTimer);
      this.playbackTimer = null;
    }
    if (this.synthLoopTimeout) {
      clearTimeout(this.synthLoopTimeout);
      this.synthLoopTimeout = null;
    }
    this.emit();
  }

  public resume() {
    if (!this.isPlaying) {
      this.startPlayback();
    }
  }

  private async startPlayback() {
    this.initCtx();
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch {
        // ignore
      }
    }
    this.isPlaying = true;
    this.emit();

    const track = this.allTracks[this.currentTrackIndex];
    if (!track) return;

    // Check if real audio blob is stored in memory or in IndexedDB
    let audioSrc: string | null = null;
    let audioBlob: Blob | null = null;

    if (this.audioBlobUrls.has(track.id)) {
      audioSrc = this.audioBlobUrls.get(track.id)!;
    } else {
      audioBlob = await getTrackAudio(track.id);
      if (audioBlob) {
        const url = createAudioBlobUrl(audioBlob, track.customFileName || `${track.title}.wav`);
        this.audioBlobUrls.set(track.id, url);
        audioSrc = url;
        track.hasCustomAudio = true;
      } else if (track.audioUrl) {
        audioSrc = track.audioUrl;
      }
    }

    if (this.synthLoopTimeout) {
      clearTimeout(this.synthLoopTimeout);
      this.synthLoopTimeout = null;
    }

    if (audioSrc && this.audioElement) {
      try {
        const fullTargetUrl = new URL(audioSrc, window.location.origin).href;
        if (this.audioElement.src !== fullTargetUrl && this.audioElement.src !== audioSrc) {
          this.audioElement.src = audioSrc;
          this.audioElement.load();
        }
        if (Math.abs(this.audioElement.currentTime - this.currentTimeSec) > 1) {
          this.audioElement.currentTime = this.currentTimeSec;
        }
        this.audioElement.volume = this.isMuted ? 0 : this.volume;
        await this.audioElement.play();
        this.isUsingRealAudio = true;
        this.emit();
        return;
      } catch (err) {
        console.warn('Real audio HTML5 playback failed, attempting Web Audio API buffer playback:', err);
      }
    }

    // Try Web Audio API decodeAudioData if HTML5 Audio failed
    if (audioBlob && this.ctx) {
      try {
        const arrayBuf = await audioBlob.arrayBuffer();
        const audioBuf = await this.ctx.decodeAudioData(arrayBuf);
        const sourceNode = this.ctx.createBufferSource();
        sourceNode.buffer = audioBuf;
        sourceNode.connect(this.masterGain || this.ctx.destination);
        sourceNode.start(0, this.currentTimeSec);
        this.isUsingRealAudio = true;
        this.emit();
        return;
      } catch (err) {
        console.warn('Web Audio buffer decode failed:', err);
      }
    }

    // Procedural Bespoke Synth Playback Fallback
    this.isUsingRealAudio = false;
    if (this.playbackTimer) clearInterval(this.playbackTimer);
    this.playbackTimer = setInterval(() => {
      if (!this.isPlaying || this.isUsingRealAudio) return;
      const current = this.allTracks[this.currentTrackIndex];
      this.currentTimeSec += 1;

      if (this.currentTimeSec >= current.durationSec) {
        if (this.repeatMode === 'one') {
          this.currentTimeSec = 0;
          this.emit();
        } else {
          this.next();
        }
      } else {
        this.emit();
      }
    }, 1000);

    this.runSynthCycle();
  }

  /**
   * Synthesizes the unique melodic and harmonic arrangement tailored for this exact track.
   */
  private runSynthCycle() {
    if (!this.isPlaying || this.isUsingRealAudio || !this.ctx || !this.masterGain) return;

    const track = this.allTracks[this.currentTrackIndex] || this.allTracks[0];
    const comp: TrackComposition = INDIVIDUAL_TRACK_COMPOSITIONS[track.id] || {
      tempo: track.tempo || 120,
      timeSignature: '4/4',
      instrument: 'acoustic_guitar',
      chords: [['C3', 'G3', 'C4', 'E4'], ['G2', 'D3', 'G3', 'B3'], ['A2', 'E3', 'A3', 'C4'], ['F2', 'C3', 'F3', 'A3']],
      leadMelody: [{ note: 'C4', duration: 0.5 }, { note: 'E4', duration: 0.5 }, { note: 'G4', duration: 0.5 }, { note: 'C5', duration: 0.5 }],
      bassLine: ['C2', 'G2', 'A2', 'F2'],
    };

    const melody = comp.leadMelody;
    const currentMelodyNote = melody[this.currentMelodyStep % melody.length];
    const chords = comp.chords;
    const currentChord = chords[this.currentChordIndex % chords.length];
    const currentBassNote = comp.bassLine[this.currentMelodyStep % comp.bassLine.length] || 'C2';

    const now = this.ctx.currentTime;
    const melodyFreq = getFreq(currentMelodyNote.note);
    const bassFreq = getFreq(currentBassNote);

    // 1. Lead Melody Note Synthesizer
    const leadOsc = this.ctx.createOscillator();
    const leadGain = this.ctx.createGain();
    const leadFilter = this.ctx.createBiquadFilter();

    // Instrument timbre simulation
    if (comp.instrument === 'banjo') {
      leadOsc.type = 'triangle';
      leadFilter.type = 'bandpass';
      leadFilter.frequency.setValueAtTime(2200, now);
      leadGain.gain.setValueAtTime(0.001, now);
      leadGain.gain.exponentialRampToValueAtTime(0.22, now + 0.015);
      leadGain.gain.exponentialRampToValueAtTime(0.0001, now + currentMelodyNote.duration * 0.8);
    } else if (comp.instrument === 'ragtime_piano' || comp.instrument === 'saloon_piano') {
      leadOsc.type = 'triangle';
      leadFilter.type = 'lowpass';
      leadFilter.frequency.setValueAtTime(2800, now);
      leadGain.gain.setValueAtTime(0.001, now);
      leadGain.gain.exponentialRampToValueAtTime(0.24, now + 0.02);
      leadGain.gain.exponentialRampToValueAtTime(0.0001, now + currentMelodyNote.duration * 0.9);
    } else if (comp.instrument === 'trumpet') {
      leadOsc.type = 'sawtooth';
      leadFilter.type = 'lowpass';
      leadFilter.frequency.setValueAtTime(1600, now);
      leadGain.gain.setValueAtTime(0.001, now);
      leadGain.gain.exponentialRampToValueAtTime(0.18, now + 0.04);
      leadGain.gain.exponentialRampToValueAtTime(0.0001, now + currentMelodyNote.duration * 0.95);
    } else if (comp.instrument === 'slide_guitar') {
      leadOsc.type = 'sawtooth';
      leadFilter.type = 'lowpass';
      leadFilter.frequency.setValueAtTime(1400, now);
      leadGain.gain.setValueAtTime(0.001, now);
      leadGain.gain.exponentialRampToValueAtTime(0.20, now + 0.03);
      leadGain.gain.exponentialRampToValueAtTime(0.0001, now + currentMelodyNote.duration * 0.9);
    } else {
      // Acoustic Guitar / Strings
      leadOsc.type = 'sine';
      leadFilter.type = 'lowpass';
      leadFilter.frequency.setValueAtTime(1800, now);
      leadGain.gain.setValueAtTime(0.001, now);
      leadGain.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
      leadGain.gain.exponentialRampToValueAtTime(0.0001, now + currentMelodyNote.duration * 0.85);
    }

    leadOsc.frequency.setValueAtTime(melodyFreq, now);
    leadOsc.connect(leadFilter);
    leadFilter.connect(leadGain);
    leadGain.connect(this.masterGain);

    leadOsc.start(now);
    leadOsc.stop(now + currentMelodyNote.duration + 0.05);

    // 2. Warm Bass Note
    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bassOsc.type = 'triangle';
    bassOsc.frequency.setValueAtTime(bassFreq, now);
    bassGain.gain.setValueAtTime(0.001, now);
    bassGain.gain.exponentialRampToValueAtTime(0.16, now + 0.02);
    bassGain.gain.exponentialRampToValueAtTime(0.0001, now + currentMelodyNote.duration * 0.85);

    bassOsc.connect(bassGain);
    bassGain.connect(this.masterGain);
    bassOsc.start(now);
    bassOsc.stop(now + currentMelodyNote.duration + 0.05);

    // 3. Subtle Chord Harmonic Layer (every 2nd step)
    if (this.currentMelodyStep % 2 === 0 && currentChord.length > 0) {
      const chordNote = currentChord[Math.floor(Math.random() * currentChord.length)];
      const chordFreq = getFreq(chordNote);
      const chordOsc = this.ctx.createOscillator();
      const chordGain = this.ctx.createGain();
      chordOsc.type = 'sine';
      chordOsc.frequency.setValueAtTime(chordFreq, now);
      chordGain.gain.setValueAtTime(0.001, now);
      chordGain.gain.exponentialRampToValueAtTime(0.07, now + 0.05);
      chordGain.gain.exponentialRampToValueAtTime(0.0001, now + currentMelodyNote.duration * 1.2);

      chordOsc.connect(chordGain);
      chordGain.connect(this.masterGain);
      chordOsc.start(now);
      chordOsc.stop(now + currentMelodyNote.duration * 1.2 + 0.05);
    }

    this.currentMelodyStep++;
    if (this.currentMelodyStep % 4 === 0) {
      this.currentChordIndex++;
    }

    const stepDurationMs = (currentMelodyNote.duration * (60 / comp.tempo)) * 1000;
    this.synthLoopTimeout = setTimeout(() => {
      this.runSynthCycle();
    }, Math.max(80, stepDurationMs));
  }

  public next() {
    if (this.queue.length > 0) {
      const nextTrack = this.queue.shift()!;
      const idx = this.allTracks.findIndex((t) => t.id === nextTrack.id);
      if (idx !== -1) {
        this.currentTrackIndex = idx;
      }
    } else if (this.isShuffle) {
      let nextIdx = Math.floor(Math.random() * this.allTracks.length);
      if (nextIdx === this.currentTrackIndex && this.allTracks.length > 1) {
        nextIdx = (nextIdx + 1) % this.allTracks.length;
      }
      this.currentTrackIndex = nextIdx;
    } else {
      this.currentTrackIndex = (this.currentTrackIndex + 1) % this.allTracks.length;
    }

    this.currentTimeSec = 0;
    this.currentMelodyStep = 0;
    this.currentChordIndex = 0;
    if (this.audioElement) {
      this.audioElement.pause();
    }
    if (this.isPlaying) {
      this.startPlayback();
    } else {
      this.emit();
    }
  }

  public prev() {
    if (this.currentTimeSec > 4) {
      this.currentTimeSec = 0;
      if (this.audioElement && this.isUsingRealAudio) {
        this.audioElement.currentTime = 0;
      }
    } else {
      this.currentTrackIndex = (this.currentTrackIndex - 1 + this.allTracks.length) % this.allTracks.length;
      this.currentTimeSec = 0;
      if (this.audioElement) {
        this.audioElement.pause();
      }
    }
    this.currentMelodyStep = 0;
    this.currentChordIndex = 0;
    if (this.isPlaying) {
      this.startPlayback();
    } else {
      this.emit();
    }
  }

  public seek(seconds: number) {
    const track = this.allTracks[this.currentTrackIndex];
    if (!track) return;
    this.currentTimeSec = Math.max(0, Math.min(track.durationSec, seconds));
    if (this.audioElement && this.isUsingRealAudio) {
      this.audioElement.currentTime = this.currentTimeSec;
    }
    this.emit();
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    this.settings.musicVolume = this.volume;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
    }
    this.savePersistedData();
    this.emit();
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    this.settings.isMuted = this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
    }
    this.savePersistedData();
    this.emit();
  }

  public toggleShuffle() {
    this.isShuffle = !this.isShuffle;
    this.emit();
  }

  public cycleRepeat() {
    if (this.repeatMode === 'off') {
      this.repeatMode = 'all';
    } else if (this.repeatMode === 'all') {
      this.repeatMode = 'one';
    } else {
      this.repeatMode = 'off';
    }
    this.emit();
  }

  public toggleFavorite(trackId: string) {
    if (this.likedTrackIds.has(trackId)) {
      this.likedTrackIds.delete(trackId);
    } else {
      this.likedTrackIds.add(trackId);
    }
    this.savePersistedData();
    this.emit();
  }

  public toggleDownload(trackId: string) {
    if (this.downloadedTrackIds.has(trackId)) {
      this.downloadedTrackIds.delete(trackId);
    } else {
      this.downloadedTrackIds.add(trackId);
    }
    this.savePersistedData();
    this.emit();
  }

  public downloadAll() {
    this.allTracks.forEach((t) => this.downloadedTrackIds.add(t.id));
    this.savePersistedData();
    this.emit();
  }

  public addToQueue(track: GameTrack) {
    this.queue.push(track);
    this.emit();
  }

  public playNextInQueue(track: GameTrack) {
    this.queue.unshift(track);
    this.emit();
  }

  public removeFromQueue(index: number) {
    if (index >= 0 && index < this.queue.length) {
      this.queue.splice(index, 1);
      this.emit();
    }
  }

  public clearQueue() {
    this.queue = [];
    this.emit();
  }

  public setSettings(newSettings: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    if (newSettings.musicVolume !== undefined) {
      this.volume = newSettings.musicVolume;
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      }
      if (this.audioElement) {
        this.audioElement.volume = this.isMuted ? 0 : this.volume;
      }
    }
    this.savePersistedData();
    this.emit();
  }

  public getTrackById(id: string): GameTrack | undefined {
    return this.allTracks.find((t) => t.id === id);
  }

  // =========================================================================
  // Intelligent Audio File Matching & Persistent Binding
  // =========================================================================

  /**
   * Matches a single file to an existing track in the library by title, number, or fuzzy name.
   */
  public findMatchingTrack(file: File): GameTrack | null {
    const rawFileName = file.name;
    const normFileName = normalizeTrackName(rawFileName);

    // 1. Exact match on normalized title
    for (const track of this.allTracks) {
      const normTitle = normalizeTrackName(track.title);
      if (normFileName === normTitle) {
        return track;
      }
    }

    // 2. Substring match
    for (const track of this.allTracks) {
      const normTitle = normalizeTrackName(track.title);
      if (normFileName.includes(normTitle) || normTitle.includes(normFileName)) {
        return track;
      }
    }

    // 3. Track number match (e.g. "01 - song.mp3" or "Track 1")
    const matchNumber = rawFileName.match(/^(?:track\s*)?0?(\d+)/i);
    if (matchNumber) {
      const trackNum = parseInt(matchNumber[1], 10);
      const matched = this.allTracks.find((t) => t.trackNumber === trackNum);
      if (matched) return matched;
    }

    return null;
  }

  /**
   * Takes a batch of uploaded files (drag & drop or file dialog), matches them to existing tracks,
   * stores audio in IndexedDB, and updates playback state.
   */
  public async uploadAndMatchFiles(
    files: FileList | File[]
  ): Promise<{
    matchedCount: number;
    matchedTitles: string[];
    createdCount: number;
  }> {
    const fileArray = Array.from(files);
    let matchedCount = 0;
    const matchedTitles: string[] = [];
    let createdCount = 0;

    for (const file of fileArray) {
      if (!file.type.startsWith('audio/') && !/\.(mp3|wav|m4a|ogg|aac|flac)$/i.test(file.name)) {
        continue;
      }

      const existingTrack = this.findMatchingTrack(file);
      if (existingTrack) {
        // Attach audio to this existing official track
        await this.attachAudioToTrack(existingTrack.id, file);
        matchedCount++;
        matchedTitles.push(existingTrack.title);
        // Immediately play the matched track
        await this.playTrack(existingTrack.id);
      } else {
        // Create new custom track
        await this.importCustomTrack(file);
        createdCount++;
      }
    }

    this.emit();
    return { matchedCount, matchedTitles, createdCount };
  }

  /**
   * Attaches an audio file to an existing track and saves to IndexedDB.
   */
  public async attachAudioToTrack(trackId: string, file: File): Promise<void> {
    const track = this.allTracks.find((t) => t.id === trackId);
    if (!track) return;

    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    track.hasCustomAudio = true;
    track.customFileName = file.name;
    track.customFileSize = `${sizeMb} MB`;
    track.downloaded = true;
    this.downloadedTrackIds.add(trackId);

    // Save to IndexedDB
    await storeTrackAudio(trackId, file, {
      hasCustomAudio: true,
      customFileName: file.name,
      customFileSize: `${sizeMb} MB`,
    });

    // Create memory URL
    const blobUrl = createAudioBlobUrl(file, file.name);
    this.audioBlobUrls.set(trackId, blobUrl);

    this.savePersistedData();
    this.emit();

    // If this track is currently active, immediately play with real sound
    const current = this.allTracks[this.currentTrackIndex];
    if (current && current.id === trackId && this.isPlaying) {
      await this.startPlayback();
    }
  }

  /**
   * Resets track audio back to procedural synthesis
   */
  public async removeCustomAudioFromTrack(trackId: string): Promise<void> {
    await deleteTrackAudio(trackId);
    this.audioBlobUrls.delete(trackId);

    const track = this.allTracks.find((t) => t.id === trackId);
    if (track) {
      track.hasCustomAudio = false;
      track.customFileName = undefined;
      track.customFileSize = undefined;
    }

    this.emit();

    const current = this.allTracks[this.currentTrackIndex];
    if (current && current.id === trackId && this.isPlaying) {
      await this.startPlayback();
    }
  }

  public async importCustomTrack(file: File, customTitle?: string, customArtist?: string): Promise<GameTrack> {
    const trackId = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    const title = customTitle || cleanName;
    const artist = customArtist || 'Custom Artist';
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);

    const newTrack: GameTrack = {
      id: trackId,
      trackNumber: this.allTracks.length + 1,
      title,
      artist,
      album: 'My Custom Jukebox Collection',
      duration: '3:20',
      durationSec: 200,
      genre: 'Custom Track',
      category: 'saloon',
      coverEmoji: '🎵',
      coverBg: 'from-amber-600 via-rose-900 to-stone-950',
      coverSubtext: 'User Upload',
      tempo: 120,
      downloadSizeMb: +sizeMb,
      isCustom: true,
      hasCustomAudio: true,
      customFileName: file.name,
      customFileSize: `${sizeMb} MB`,
      liked: true,
      downloaded: true,
    };

    // Store in IndexedDB
    await storeTrackAudio(trackId, file, newTrack);

    // Create memory URL
    const blobUrl = createAudioBlobUrl(file, file.name);
    this.audioBlobUrls.set(trackId, blobUrl);

    // Add to track list
    this.allTracks.push(newTrack);
    this.likedTrackIds.add(trackId);
    this.downloadedTrackIds.add(trackId);
    this.savePersistedData();
    this.emit();

    // Auto-play the imported track
    await this.playTrack(trackId);
    return newTrack;
  }

  public async removeCustomTrack(trackId: string): Promise<void> {
    await deleteTrackAudio(trackId);
    this.audioBlobUrls.delete(trackId);
    this.likedTrackIds.delete(trackId);
    this.downloadedTrackIds.delete(trackId);

    const idx = this.allTracks.findIndex((t) => t.id === trackId);
    if (idx !== -1) {
      if (this.currentTrackIndex === idx) {
        this.next();
      }
      this.allTracks.splice(idx, 1);
    }

    this.savePersistedData();
    this.emit();
  }
}

export const gameAudio = new GameAudioEngine();
