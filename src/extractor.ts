// ──────────────────────────────────────────────
// Project Snapshot — Data Extractor (v2 — Performance Optimized)
// Reads the Live Set and produces a ProjectSnapshot
//
// Performance strategy:
// 1. Batch parallel async getValue() calls with concurrency control
// 2. Process tracks/devices/mixer concurrently where possible
// 3. Reduce progress update frequency (every N tracks, not every track)
// 4. Skip valueItems for non-quantized params (avoid unnecessary processing)
// ──────────────────────────────────────────────

import type {
  ProjectSnapshot,
  SnapshotOverview,
  SnapshotTrack,
  SnapshotClip,
  SnapshotDevice,
  SnapshotParameter,
  SnapshotChain,
  SnapshotScene,
  SnapshotCuePoint,
  SnapshotMidiInfo,
  SnapshotSuggestion,
} from "./types.js";
import {
  midiNoteToName,
  getWarpModeName,
} from "./types.js";

import {
  type ExtensionContext,
  AudioTrack,
  MidiTrack,
  AudioClip,
  MidiClip,
  RackDevice,
  Simpler,
  DrumRack,
} from "@ableton-extensions/sdk";

// ── Concurrency-limited batch executor ──
// Runs async tasks in parallel with a max concurrency limit
// to avoid overwhelming the Ableton Live API

async function batchParallel<T>(
  items: T[],
  fn: (item: T) => Promise<void>,
  concurrency: number = 20,
): Promise<void> {
  let index = 0;
  const workers: Promise<void>[] = [];

  for (let w = 0; w < Math.min(concurrency, items.length); w++) {
    workers.push((async () => {
      while (index < items.length) {
        const i = index++;
        if (i >= items.length) break;
        try { await fn(items[i]); } catch { /* skip failed item */ }
      }
    })());
  }

  await Promise.all(workers);
}

// ── Safe async value reader ──

async function safeGetValue(param: any, fallback: number = 0): Promise<number> {
  try {
    if (param && typeof param.getValue === "function") {
      const raw = await param.getValue();
      if (typeof raw === "number") return raw;
    }
  } catch { /* default */ }
  return fallback;
}

function safeSync(prop: any, fallback: any): any {
  try { const v = prop; return (v !== undefined && v !== null) ? v : fallback; }
  catch { return fallback; }
}

function formatDb(raw: number): string {
  const db = 20 * Math.log10(raw / 0.75);
  return (db >= 0 ? "+" : "") + db.toFixed(1) + " dB";
}

// ── Main extraction ──

export async function extractSnapshot(
  context: ExtensionContext<"1.0.0">,
  updateProgress: (msg: string, pct: number) => Promise<void>,
  projectName: string = "Project Snapshot",
): Promise<ProjectSnapshot> {
  const song = context.application.song;

  await updateProgress("Extracting overview...", 5);
  const overview = extractOverview(song);

  const totalTracks = song.tracks.length + (song.returnTracks?.length ?? 0) + 1;
  const tracks: SnapshotTrack[] = [];

  // ── Process regular tracks in parallel batches ──
  await updateProgress("Analyzing tracks...", 15);

  const regularTrackResults: (SnapshotTrack | null)[] = new Array(song.tracks.length).fill(null);

  await batchParallel(
    Array.from(song.tracks),
    async (track) => {
      const i = song.tracks.indexOf(track);
      // Update progress every 3 tracks instead of every single one
      if (i % 3 === 0 || i === song.tracks.length - 1) {
        const pct = 15 + Math.round((i / totalTracks) * 50);
        try { await updateProgress(`Analyzing track ${i + 1}: ${track.name}`, pct); } catch { /* skip */ }
      }
      regularTrackResults[i] = await extractTrack(track);
    },
    4, // concurrency: 4 tracks at a time
  );

  tracks.push(...regularTrackResults.filter((t): t is SnapshotTrack => t !== null));

  // ── Return tracks (parallel) ──
  if (song.returnTracks) {
    const returnResults = await Promise.allSettled(
      song.returnTracks.map(async (rt) => {
        try { return await extractTrack(rt, "return"); } catch { return null; }
      })
    );
    for (const r of returnResults) {
      if (r.status === "fulfilled" && r.value) tracks.push(r.value);
    }
  }

  // ── Master track ──
  if (song.mainTrack) {
    try { tracks.push(await extractTrack(song.mainTrack, "master")); } catch { /* skip */ }
  }

  await updateProgress("Extracting scenes & cue points...", 70);
  const scenes = extractScenes(song);
  const cuePoints = extractCuePoints(song);

  await updateProgress("Generating suggestions...", 80);
  const suggestions = generateSuggestions(overview, tracks, scenes, cuePoints);

  const now = new Date();
  const generatedAt = now.toISOString();
  const generatedDate = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    generatedAt,
    generatedDate,
    projectName,
    overview,
    tracks,
    scenes,
    cuePoints,
    suggestions,
  };
}

// ── Overview ──

function extractOverview(song: any): SnapshotOverview {
  let audioTrackCount = 0;
  let midiTrackCount = 0;
  let totalClipCount = 0;
  let totalDeviceCount = 0;

  for (const track of song.tracks) {
    if (track instanceof AudioTrack) audioTrackCount++;
    if (track instanceof MidiTrack) midiTrackCount++;
    totalClipCount += countClipsInTrack(track);
    totalDeviceCount += track.devices.length;
  }

  let tempo = 120, sigNum = 4, sigDen = 4, rootNote = 0;
  let scaleName = "None", scaleMode = 0, scaleIntervals: number[] = [];
  let gridQuantization = "N/A", gridIsTriplet = false;

  try { tempo = song.tempo ?? 120; } catch { /* default */ }
  try { if (song.scenes?.length > 0) { sigNum = (song.scenes[0] as any).signatureNumerator ?? 4; sigDen = (song.scenes[0] as any).signatureDenominator ?? 4; } } catch { /* default */ }
  try { rootNote = song.rootNote ?? 0; } catch { /* default */ }
  try { scaleName = song.scaleName ?? "None"; } catch { /* default */ }
  try { scaleMode = song.scaleMode ? 1 : 0; } catch { /* default */ }
  try { scaleIntervals = song.scaleIntervals ?? []; } catch { /* default */ }
  try { gridQuantization = String(song.gridQuantization ?? "N/A"); } catch { /* default */ }
  try { gridIsTriplet = song.gridIsTriplet ?? false; } catch { /* default */ }

  return {
    tempo, signatureNumerator: sigNum, signatureDenominator: sigDen,
    gridQuantization, gridIsTriplet, rootNote, scaleName, scaleMode, scaleIntervals,
    trackCount: song.tracks.length + (song.returnTracks?.length ?? 0) + 1,
    sceneCount: song.scenes.length,
    cuePointCount: song.cuePoints.length,
    audioTrackCount, midiTrackCount, totalClipCount, totalDeviceCount,
  };
}

function countClipsInTrack(track: any): number {
  let count = 0;
  if (track.clipSlots) { for (const slot of track.clipSlots) { try { if (slot.clip) count++; } catch {} } }
  if (track.arrangementClips) { count += track.arrangementClips.length; }
  return count;
}

// ── Track (parallel: clips + devices + mixer) ──

async function extractTrack(track: any, forceType?: "return" | "master"): Promise<SnapshotTrack> {
  let type: "audio" | "midi" | "return" | "master" = "audio";
  if (forceType === "master") type = "master";
  else if (forceType === "return") type = "return";
  else if (track instanceof AudioTrack) type = "audio";
  else if (track instanceof MidiTrack) type = "midi";
  else type = "return";

  let groupTrackName: string | null = null;
  let hasGroupTrack = false;
  try { const gt = track.groupTrack; if (gt) { hasGroupTrack = true; groupTrackName = gt.name; } } catch {}

  // ── Run clips, devices, and mixer extraction IN PARALLEL ──
  const [clips, devices, mixer] = await Promise.all([
    Promise.resolve().then(() => extractClips(track)),
    extractDevices(track.devices),
    extractMixer(track),
  ]);

  return {
    name: track.name, type,
    arm: type === "master" ? false : (track.arm ?? false),
    mute: type === "master" ? false : (track.mute ?? false),
    solo: type === "master" ? false : (track.solo ?? false),
    mutedViaSolo: track.mutedViaSolo ?? false,
    clipCount: clips.length, deviceCount: devices.length,
    hasGroupTrack, groupTrackName, clips, devices, mixer,
  };
}

// ── Mixer (parallel: volume + pan + sends) ──

async function extractMixer(track: any): Promise<import("./types.js").SnapshotMixer> {
  try {
    const mx = track.mixer;
    if (!mx) return { volume: 0.75, volumeDb: "0.0 dB", panning: 0, sends: [] };

    // ── Read volume, panning, and ALL sends in parallel ──
    const [volRaw, panRaw, sendRaws] = await Promise.all([
      safeGetValue(mx.volume, 0.75),
      safeGetValue(mx.panning, 0),
      extractSends(mx.sends),
    ]);

    return {
      volume: volRaw,
      volumeDb: volRaw < 0.001 ? "-∞ dB" : formatDb(volRaw),
      panning: panRaw,
      sends: sendRaws,
    };
  } catch {
    return { volume: 0.75, volumeDb: "0.0 dB", panning: 0, sends: [] };
  }
}

async function extractSends(sendParams: any): Promise<import("./types.js").SnapshotSend[]> {
  if (!sendParams || !Array.isArray(sendParams)) return [];

  const rawValues = await Promise.all(sendParams.map((s: any) => safeGetValue(s, 0)));

  return rawValues.map((raw, i) => ({
    name: String.fromCharCode(65 + i),
    value: raw,
    valueDb: raw < 0.001 ? "-∞ dB" : formatDb(raw),
  }));
}

// ── Clips ──

function extractClips(track: any): SnapshotClip[] {
  const clips: SnapshotClip[] = [];
  if (track.clipSlots) { for (const slot of track.clipSlots) { try { if (slot.clip) clips.push(extractClipData(slot.clip)); } catch {} } }
  if (track.arrangementClips) { for (const clip of track.arrangementClips) { try { clips.push(extractClipData(clip)); } catch {} } }
  return clips;
}

function extractClipData(clip: any): SnapshotClip {
  let type: "audio" | "midi" = "audio";
  let warpMode: string | null = null;
  let midiInfo: SnapshotMidiInfo | null = null;

  if (clip instanceof AudioClip) {
    type = "audio";
    try { warpMode = getWarpModeName(clip.warpMode); } catch {}
  } else if (clip instanceof MidiClip) {
    type = "midi";
    midiInfo = extractMidiInfo(clip);
  }

  let loopSettings: any = null;
  try { loopSettings = clip.loopSettings; } catch {}

  return {
    name: clip.name || "Untitled", type, warpMode,
    isLooping: loopSettings?.looping ?? null,
    startMarker: loopSettings?.startMarker ?? null,
    endMarker: loopSettings?.endMarker ?? null,
    loopStart: loopSettings?.loopStart ?? null,
    loopEnd: loopSettings?.loopEnd ?? null,
    midiInfo,
  };
}

function extractMidiInfo(midiClip: any): SnapshotMidiInfo | null {
  try {
    const notes = midiClip.getNotes();
    if (!notes || notes.length === 0) {
      return { noteCount: 0, lowestNote: 0, highestNote: 0, velocityRange: [0, 0], noteNames: [] };
    }

    let lowestNote = 127, highestNote = 0, minVelocity = 127, maxVelocity = 0;
    const noteNameSet = new Set<string>();

    for (const note of notes) {
      const pitch = note.pitch ?? note.note ?? 60;
      const velocity = note.velocity ?? 100;
      if (pitch < lowestNote) lowestNote = pitch;
      if (pitch > highestNote) highestNote = pitch;
      if (velocity < minVelocity) minVelocity = velocity;
      if (velocity > maxVelocity) maxVelocity = velocity;
      noteNameSet.add(midiNoteToName(pitch));
    }

    return { noteCount: notes.length, lowestNote, highestNote, velocityRange: [minVelocity, maxVelocity], noteNames: [...noteNameSet].sort() };
  } catch { return null; }
}

// ── Devices (parallel: all devices at once) ──

async function extractDevices(deviceList: any): Promise<SnapshotDevice[]> {
  if (!deviceList) return [];

  const results = await Promise.allSettled(
    deviceList.map((device: any) => extractDeviceData(device))
  );

  const devices: SnapshotDevice[] = [];
  for (const r of results) { if (r.status === "fulfilled") devices.push(r.value); }
  return devices;
}

async function extractDeviceData(device: any): Promise<SnapshotDevice> {
  let type: "device" | "rack" | "simpler" | "drumRack" = "device";
  if (device instanceof DrumRack) type = "drumRack";
  else if (device instanceof RackDevice) type = "rack";
  else if (device instanceof Simpler) type = "simpler";

  // ── Extract parameters and chains in parallel ──
  const [parameters, chains] = await Promise.all([
    extractParameters(device.parameters),
    extractChains(device),
  ]);

  return { name: device.name || "Unknown Device", type, className: device.constructor?.name ?? "Device", parameters, chains };
}

async function extractChains(device: any): Promise<SnapshotChain[]> {
  const chains: SnapshotChain[] = [];
  if (!(device instanceof RackDevice || device instanceof DrumRack)) return chains;
  if (!device.chains) return chains;

  const results = await Promise.allSettled(
    device.chains.map(async (chain: any, idx: number) => {
      let volume = 0;
      try {
        const chainMixer = chain.mixer;
        if (chainMixer?.volume && typeof chainMixer.volume.getValue === "function") {
          volume = await chainMixer.volume.getValue();
        }
      } catch {}
      const chainName = (chain as any).name || `Chain ${idx + 1}`;
      return { name: chainName, mixerVolume: volume };
    })
  );

  for (const r of results) { if (r.status === "fulfilled") chains.push(r.value); }
  return chains;
}

// ── Parameters (batched parallel getValue — THE critical path) ──

async function extractParameters(paramList: any): Promise<SnapshotParameter[]> {
  if (!paramList) return [];

  const params: SnapshotParameter[] = new Array(paramList.length);

  await batchParallel(
    Array.from(paramList),
    async (param: any) => {
      const i = paramList.indexOf(param);

      // Read value asynchronously (the main bottleneck)
      const value = await safeGetValue(param, 0);

      // Read sync properties (no API call)
      const minValue = safeSync(param.min, 0);
      const maxValue = safeSync(param.max, 1);
      const defaultValue = safeSync(param.defaultValue, 0);
      const isQuantized = !!safeSync(param.isQuantized, false);

      // Only process valueItems for quantized params (skip expensive processing)
      let valueItems: string[] = [];
      if (isQuantized) {
        try {
          const items = param.valueItems;
          if (items && Array.isArray(items)) {
            valueItems = items.map((item: any) => {
              if (item == null) return "";
              if (typeof item === "string") return item;
              if (typeof item === "number") return String(item);
              if (typeof item === "object") return item.display ?? item.name ?? item.label ?? item.value ?? String(item);
              return String(item);
            });
          }
        } catch {}
      }

      params[i] = { name: param.name || "Unnamed", value, minValue, maxValue, defaultValue, isQuantized, valueItems };
    },
    50, // concurrency: 50 params at a time
  );

  return params;
}

// ── Scenes ──

function extractScenes(song: any): SnapshotScene[] {
  const scenes: SnapshotScene[] = [];
  if (!song.scenes) return scenes;
  for (const scene of song.scenes) {
    try {
      scenes.push({
        name: scene.name || `Scene ${scenes.length + 1}`,
        tempo: scene.tempo ?? null,
        signatureNumerator: scene.signatureNumerator ?? null,
        signatureDenominator: scene.signatureDenominator ?? null,
      });
    } catch {}
  }
  return scenes;
}

// ── Cue Points ──

function extractCuePoints(song: any): SnapshotCuePoint[] {
  const points: SnapshotCuePoint[] = [];
  if (!song.cuePoints) return points;
  for (const cp of song.cuePoints) {
    try { points.push({ name: cp.name || `Cue ${points.length + 1}` }); } catch {}
  }
  return points;
}

// ── Suggestions Engine ──

function generateSuggestions(
  overview: SnapshotOverview,
  tracks: SnapshotTrack[],
  scenes: SnapshotScene[],
  cuePoints: SnapshotCuePoint[],
): SnapshotSuggestion[] {
  const suggestions: SnapshotSuggestion[] = [];

  const emptyTracks = tracks.filter(t => t.clipCount === 0 && t.type !== "master");
  if (emptyTracks.length > 0) {
    suggestions.push({ icon: "🧹", text: `You have ${emptyTracks.length} empty track${emptyTracks.length > 1 ? "s" : ""}. Consider removing or populating ${emptyTracks.length > 1 ? "them" : "it"} to keep your project organized.`, type: "tip" });
  }

  let unnamedClips = 0;
  for (const track of tracks) { unnamedClips += track.clips.filter(c => c.name === "Untitled" || c.name === "").length; }
  if (unnamedClips > 0) {
    suggestions.push({ icon: "🏷️", text: `Found ${unnamedClips} unnamed clip${unnamedClips > 1 ? "s" : ""}. Renaming clips helps with organization and navigation.`, type: "tip" });
  }

  const armedTracks = tracks.filter(t => t.arm);
  if (armedTracks.length > 0) {
    suggestions.push({ icon: "🔴", text: `Track${armedTracks.length > 1 ? "s" : ""} armed for recording: ${armedTracks.map(t => t.name).join(", ")}. Ready to lay down some new material?`, type: "warning" });
  }

  const mutedTracks = tracks.filter(t => t.mute);
  if (mutedTracks.length > 0) {
    suggestions.push({ icon: "🔇", text: `${mutedTracks.length} track${mutedTracks.length > 1 ? "s are" : " is"} muted. Remember to check ${mutedTracks.length > 1 ? "them" : "it"} before your final mix.`, type: "info" });
  }

  const soloedTracks = tracks.filter(t => t.solo);
  if (soloedTracks.length > 0) {
    suggestions.push({ icon: "🎧", text: `${soloedTracks.length} track${soloedTracks.length > 1 ? "s are" : " is"} soloed. Don't forget to unsolo when you're done inspecting.`, type: "warning" });
  }

  if (scenes.length === 0) {
    suggestions.push({ icon: "🎬", text: "No scenes found. Adding scenes can help organize your Session View and create arrangement variations.", type: "tip" });
  }

  if (Math.abs(overview.tempo - 120) < 0.1) {
    suggestions.push({ icon: "⏱️", text: "Tempo is set to the default 120 BPM. Consider experimenting with different tempos to find the right groove.", type: "tip" });
  }

  if (cuePoints.length === 0) {
    suggestions.push({ icon: "📍", text: "No cue points set. Adding cue points at key sections makes navigation much faster.", type: "tip" });
  }

  if (!overview.scaleName || overview.scaleName === "None") {
    suggestions.push({ icon: "🎵", text: "No scale is set. Defining a scale can help with music theory and note selection.", type: "info" });
  }

  if (overview.totalDeviceCount > 20) {
    suggestions.push({ icon: "⚙️", text: `This project has ${overview.totalDeviceCount} devices. Consider freezing or flattening tracks you're happy with to save CPU.`, type: "tip" });
  }

  const totalContent = overview.totalClipCount + overview.totalDeviceCount;
  if (totalContent > 0) {
    suggestions.push({ icon: "💡", text: `This project has ${overview.totalClipCount} clip${overview.totalClipCount !== 1 ? "s" : ""} across ${overview.trackCount} track${overview.trackCount !== 1 ? "s" : ""} with ${overview.totalDeviceCount} device${overview.totalDeviceCount !== 1 ? "s" : ""}. ${overview.totalClipCount > 10 ? "Great progress! Keep building on what you have." : "A solid foundation to build upon. Try adding more layers and variations."}`, type: "info" });
  }

  return suggestions;
}
