// ──────────────────────────────────────────────
// Project Snapshot — Data Extractor
// Reads the Live Set and produces a ProjectSnapshot
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
  Device,
  RackDevice,
  Simpler,
  DrumRack,
  Track,
  DataModelObject,
  type Handle,
} from "@ableton-extensions/sdk";

// ── Main extraction ──

export async function extractSnapshot(
  context: ExtensionContext<"1.0.0">,
  updateProgress: (msg: string, pct: number) => Promise<void>,
): Promise<ProjectSnapshot> {
  const song = context.application.song;

  await updateProgress("Extracting overview...", 5);
  const overview = extractOverview(song);

  await updateProgress("Extracting tracks...", 15);
  const tracks: SnapshotTrack[] = [];

  for (let i = 0; i < song.tracks.length; i++) {
    const track = song.tracks[i]!;
    const pct = 15 + Math.round((i / song.tracks.length) * 50);
    await updateProgress(`Analyzing track ${i + 1}/${song.tracks.length}: ${track.name}`, pct);
    tracks.push(extractTrack(track));
  }

  await updateProgress("Extracting scenes...", 70);
  const scenes = extractScenes(song);

  await updateProgress("Extracting cue points...", 75);
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

  return {
    tempo: song.tempo,
    signatureNumerator: song.signatureNumerator,
    signatureDenominator: song.signatureDenominator,
    gridQuantization: String(song.gridQuantization ?? "N/A"),
    gridIsTriplet: song.gridIsTriplet ?? false,
    rootNote: song.rootNote ?? 0,
    scaleName: song.scaleName ?? "None",
    scaleMode: song.scaleMode ?? 0,
    scaleIntervals: song.scaleIntervals ?? [],
    trackCount: song.tracks.length,
    sceneCount: song.scenes.length,
    cuePointCount: song.cuePoints.length,
    audioTrackCount,
    midiTrackCount,
    totalClipCount,
    totalDeviceCount,
  };
}

function countClipsInTrack(track: any): number {
  let count = 0;
  if (track.clipSlots) {
    for (const slot of track.clipSlots) {
      try {
        if (slot.clip) count++;
      } catch { /* empty slot */ }
    }
  }
  if (track.arrangementClips) {
    count += track.arrangementClips.length;
  }
  return count;
}

// ── Track ──

function extractTrack(track: any): SnapshotTrack {
  let type: "audio" | "midi" | "return" | "master" = "audio";
  if (track instanceof AudioTrack) type = "audio";
  else if (track instanceof MidiTrack) type = "midi";
  else type = "return";

  let groupTrackName: string | null = null;
  let hasGroupTrack = false;
  try {
    const gt = track.groupTrack;
    if (gt) {
      hasGroupTrack = true;
      groupTrackName = gt.name;
    }
  } catch { /* no group track */ }

  const clips = extractClips(track);
  const devices = extractDevices(track);

  return {
    name: track.name,
    type,
    arm: track.arm ?? false,
    mute: track.mute ?? false,
    solo: track.solo ?? false,
    mutedViaSolo: track.mutedViaSolo ?? false,
    clipCount: clips.length,
    deviceCount: devices.length,
    hasGroupTrack,
    groupTrackName,
    clips,
    devices,
  };
}

// ── Clips ──

function extractClips(track: any): SnapshotClip[] {
  const clips: SnapshotClip[] = [];

  // Session View clips (clipSlots)
  if (track.clipSlots) {
    for (const slot of track.clipSlots) {
      try {
        const clip = slot.clip;
        if (clip) {
          clips.push(extractClipData(clip));
        }
      } catch { /* empty slot */ }
    }
  }

  // Arrangement View clips
  if (track.arrangementClips) {
    for (const clip of track.arrangementClips) {
      try {
        clips.push(extractClipData(clip));
      } catch { /* skip */ }
    }
  }

  return clips;
}

function extractClipData(clip: any): SnapshotClip {
  let type: "audio" | "midi" = "audio";
  let warpMode: string | null = null;
  let midiInfo: SnapshotMidiInfo | null = null;

  if (clip instanceof AudioClip) {
    type = "audio";
    try { warpMode = getWarpModeName(clip.warpMode); } catch { /* no warp */ }
  } else if (clip instanceof MidiClip) {
    type = "midi";
    midiInfo = extractMidiInfo(clip);
  }

  let loopSettings: any = null;
  try { loopSettings = clip.loopSettings; } catch { /* no loop settings */ }

  return {
    name: clip.name || "Untitled",
    type,
    warpMode,
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
      return {
        noteCount: 0,
        lowestNote: 0,
        highestNote: 0,
        velocityRange: [0, 0],
        noteNames: [],
      };
    }

    let lowestNote = 127;
    let highestNote = 0;
    let minVelocity = 127;
    let maxVelocity = 0;
    const noteNames: string[] = [];

    for (const note of notes) {
      const pitch = note.pitch ?? note.note ?? 60;
      const velocity = note.velocity ?? 100;

      if (pitch < lowestNote) lowestNote = pitch;
      if (pitch > highestNote) highestNote = pitch;
      if (velocity < minVelocity) minVelocity = velocity;
      if (velocity > maxVelocity) maxVelocity = velocity;

      const name = midiNoteToName(pitch);
      if (!noteNames.includes(name)) noteNames.push(name);
    }

    return {
      noteCount: notes.length,
      lowestNote,
      highestNote,
      velocityRange: [minVelocity, maxVelocity],
      noteNames: noteNames.sort(),
    };
  } catch {
    return null;
  }
}

// ── Devices ──

function extractDevices(track: any): SnapshotDevice[] {
  const devices: SnapshotDevice[] = [];

  if (!track.devices) return devices;

  for (const device of track.devices) {
    try {
      devices.push(extractDeviceData(device));
    } catch { /* skip broken device */ }
  }

  return devices;
}

function extractDeviceData(device: any): SnapshotDevice {
  let type: "device" | "rack" | "simpler" | "drumRack" = "device";
  if (device instanceof DrumRack) type = "drumRack";
  else if (device instanceof RackDevice) type = "rack";
  else if (device instanceof Simpler) type = "simpler";

  const parameters = extractParameters(device);

  const chains: SnapshotChain[] = [];
  if ((device instanceof RackDevice || device instanceof DrumRack) && device.chains) {
    for (const chain of device.chains) {
      try {
        let volume = 0;
        try { volume = chain.mixer?.volume ?? 0; } catch { /* no mixer */ }
        chains.push({ name: chain.name || "Unnamed Chain", mixerVolume: volume });
      } catch { /* skip */ }
    }
  }

  return {
    name: device.name || "Unknown Device",
    type,
    className: device.constructor?.name ?? "Device",
    parameters,
    chains,
  };
}

function extractParameters(device: any): SnapshotParameter[] {
  const params: SnapshotParameter[] = [];

  if (!device.parameters) return params;

  for (const param of device.parameters) {
    try {
      const valueItems: string[] = [];
      try {
        const items = param.valueItems;
        if (items) {
          for (const item of items) {
            valueItems.push(String(item));
          }
        }
      } catch { /* no value items */ }

      params.push({
        name: param.name || "Unnamed",
        value: param.value ?? 0,
        minValue: param.min ?? 0,
        maxValue: param.max ?? 1,
        defaultValue: param.defaultValue ?? 0,
        isQuantized: param.isQuantized ?? false,
        valueItems,
      });
    } catch { /* skip param */ }
  }

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
    } catch { /* skip */ }
  }

  return scenes;
}

// ── Cue Points ──

function extractCuePoints(song: any): SnapshotCuePoint[] {
  const points: SnapshotCuePoint[] = [];
  if (!song.cuePoints) return points;

  for (const cp of song.cuePoints) {
    try {
      points.push({ name: cp.name || `Cue ${points.length + 1}` });
    } catch { /* skip */ }
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

  // Empty tracks
  const emptyTracks = tracks.filter(t => t.clipCount === 0 && t.type !== "master");
  if (emptyTracks.length > 0) {
    suggestions.push({
      icon: "🧹",
      text: `You have ${emptyTracks.length} empty track${emptyTracks.length > 1 ? "s" : ""}. Consider removing or populating ${emptyTracks.length > 1 ? "them" : "it"} to keep your project organized.`,
      type: "tip",
    });
  }

  // Unnamed clips
  let unnamedClips = 0;
  for (const track of tracks) {
    unnamedClips += track.clips.filter(c => c.name === "Untitled" || c.name === "").length;
  }
  if (unnamedClips > 0) {
    suggestions.push({
      icon: "🏷️",
      text: `Found ${unnamedClips} unnamed clip${unnamedClips > 1 ? "s" : ""}. Renaming clips helps with organization and navigation.`,
      type: "tip",
    });
  }

  // Armed tracks
  const armedTracks = tracks.filter(t => t.arm);
  if (armedTracks.length > 0) {
    const names = armedTracks.map(t => t.name).join(", ");
    suggestions.push({
      icon: "🔴",
      text: `Track${armedTracks.length > 1 ? "s" : ""} armed for recording: ${names}. Ready to lay down some new material?`,
      type: "warning",
    });
  }

  // Muted tracks
  const mutedTracks = tracks.filter(t => t.mute);
  if (mutedTracks.length > 0) {
    suggestions.push({
      icon: "🔇",
      text: `${mutedTracks.length} track${mutedTracks.length > 1 ? "s are" : " is"} muted. Remember to check ${mutedTracks.length > 1 ? "them" : "it"} before your final mix.`,
      type: "info",
    });
  }

  // Soloed tracks
  const soloedTracks = tracks.filter(t => t.solo);
  if (soloedTracks.length > 0) {
    suggestions.push({
      icon: "🎧",
      text: `${soloedTracks.length} track${soloedTracks.length > 1 ? "s are" : " is"} soloed. Don't forget to unsolo when you're done inspecting.`,
      type: "warning",
    });
  }

  // No scenes
  if (scenes.length === 0) {
    suggestions.push({
      icon: "🎬",
      text: "No scenes found. Adding scenes can help organize your Session View and create arrangement variations.",
      type: "tip",
    });
  }

  // Default tempo
  if (Math.abs(overview.tempo - 120) < 0.1) {
    suggestions.push({
      icon: "⏱️",
      text: "Tempo is set to the default 120 BPM. Consider experimenting with different tempos to find the right groove.",
      type: "tip",
    });
  }

  // No cue points
  if (cuePoints.length === 0) {
    suggestions.push({
      icon: "📍",
      text: "No cue points set. Adding cue points at key sections makes navigation much faster.",
      type: "tip",
    });
  }

  // No scale set
  if (!overview.scaleName || overview.scaleName === "None") {
    suggestions.push({
      icon: "🎵",
      text: "No scale is set. Defining a scale can help with music theory and note selection.",
      type: "info",
    });
  }

  // Lots of devices → complexity hint
  if (overview.totalDeviceCount > 20) {
    suggestions.push({
      icon: "⚙️",
      text: `This project has ${overview.totalDeviceCount} devices. Consider freezing or flattening tracks you're happy with to save CPU.`,
      type: "tip",
    });
  }

  // Generic encouraging message
  const totalContent = overview.totalClipCount + overview.totalDeviceCount;
  if (totalContent > 0) {
    suggestions.push({
      icon: "💡",
      text: `This project has ${overview.totalClipCount} clip${overview.totalClipCount !== 1 ? "s" : ""} across ${overview.trackCount} track${overview.trackCount !== 1 ? "s" : ""} with ${overview.totalDeviceCount} device${overview.totalDeviceCount !== 1 ? "s" : ""}. ${overview.totalClipCount > 10 ? "Great progress! Keep building on what you have." : "A solid foundation to build upon. Try adding more layers and variations."}`,
      type: "info",
    });
  }

  return suggestions;
}
