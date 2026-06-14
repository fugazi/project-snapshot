// ──────────────────────────────────────────────
// Project Snapshot — Type Definitions
// ──────────────────────────────────────────────

export interface SnapshotOverview {
  tempo: number;
  signatureNumerator: number;
  signatureDenominator: number;
  gridQuantization: string;
  gridIsTriplet: boolean;
  rootNote: number;
  scaleName: string;
  scaleMode: number;
  scaleIntervals: number[];
  trackCount: number;
  sceneCount: number;
  cuePointCount: number;
  audioTrackCount: number;
  midiTrackCount: number;
  totalClipCount: number;
  totalDeviceCount: number;
}

export interface SnapshotTrack {
  name: string;
  type: "audio" | "midi" | "return" | "master";
  arm: boolean;
  mute: boolean;
  solo: boolean;
  mutedViaSolo: boolean;
  clipCount: number;
  deviceCount: number;
  hasGroupTrack: boolean;
  groupTrackName: string | null;
  clips: SnapshotClip[];
  devices: SnapshotDevice[];
  mixer: SnapshotMixer;
}

export interface SnapshotClip {
  name: string;
  type: "audio" | "midi";
  warpMode: string | null;
  isLooping: boolean | null;
  startMarker: number | null;
  endMarker: number | null;
  loopStart: number | null;
  loopEnd: number | null;
  midiInfo: SnapshotMidiInfo | null;
}

export interface SnapshotMidiInfo {
  noteCount: number;
  lowestNote: number;
  highestNote: number;
  velocityRange: [number, number];
  noteNames: string[];
}

export interface SnapshotDevice {
  name: string;
  type: "device" | "rack" | "simpler" | "drumRack";
  className: string;
  parameters: SnapshotParameter[];
  chains: SnapshotChain[];
}

export interface SnapshotParameter {
  name: string;
  value: number;
  minValue: number;
  maxValue: number;
  defaultValue: number;
  isQuantized: boolean;
  valueItems: string[];
}

export interface SnapshotChain {
  name: string;
  mixerVolume: number;
}

export interface SnapshotMixer {
  volume: number;       // 0.0 - 1.0 normalized
  volumeDb: string;     // display value like "-3.2 dB"
  panning: number;      // -1.0 to 1.0
  sends: SnapshotSend[];
}

export interface SnapshotSend {
  name: string;         // e.g. "A", "B", "C"
  value: number;        // 0.0 - 1.0
  valueDb: string;      // display value
}

export interface SnapshotScene {
  name: string;
  tempo: number | null;
  signatureNumerator: number | null;
  signatureDenominator: number | null;
}

export interface SnapshotCuePoint {
  name: string;
}

export interface SnapshotSuggestion {
  icon: string;
  text: string;
  type: "info" | "warning" | "tip";
}

export interface AISuggestion {
  icon: string;
  title: string;
  description: string;
}

export interface ProjectSnapshot {
  generatedAt: string;
  generatedDate: string;
  projectName: string;
  overview: SnapshotOverview;
  tracks: SnapshotTrack[];
  scenes: SnapshotScene[];
  cuePoints: SnapshotCuePoint[];
  suggestions: SnapshotSuggestion[];
  aiSuggestions?: AISuggestion[];
}

// ── Utility types ──

export const NOTE_NAMES = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
];

export function midiNoteToName(note: number): string {
  const octave = Math.floor(note / 12) - 1;
  const name = NOTE_NAMES[note % 12];
  return `${name}${octave}`;
}

export function getWarpModeName(mode: number): string {
  const modes = ["Beats", "Tones", "Texture", "Repitch", "Complex", "Complex Pro"];
  return modes[mode] ?? `Unknown (${mode})`;
}

export function getTrackTypeName(type: "audio" | "midi" | "return" | "master"): string {
  const names: Record<string, string> = {
    audio: "Audio Track",
    midi: "MIDI Track",
    return: "Return Track",
    master: "Master Track",
  };
  return names[type] ?? type;
}

export function getTrackTypeEmoji(type: "audio" | "midi" | "return" | "master"): string {
  const emojis: Record<string, string> = {
    audio: "🎙️",
    midi: "🎹",
    return: "🔀",
    master: "🎛️",
  };
  return emojis[type] ?? "🎵";
}
