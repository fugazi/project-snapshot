// ──────────────────────────────────────────────
// Project Snapshot — AI Suggestions Module
// Sends project data to the AI Worker and retrieves
// creative suggestions for the producer
// ──────────────────────────────────────────────

import type { ProjectSnapshot, AISuggestion } from "./types.js";

// The Cloudflare Worker endpoint
// Users can self-host their own worker if needed
const AI_WORKER_URL = "https://project-snapshot-ai.ableton-snapshot.workers.dev/suggestions";

// Timeout for the AI request (8 seconds)
const AI_TIMEOUT_MS = 8000;

/**
 * Compact the project snapshot data to only what the AI needs.
 * We don't send full parameter data — keeps payload small and fast.
 */
function compactProjectData(snapshot: ProjectSnapshot) {
  const o = snapshot.overview;

  // Collect unique device names across all tracks
  const deviceNames = new Set<string>();
  for (const track of snapshot.tracks) {
    for (const device of track.devices) {
      deviceNames.add(device.name);
    }
  }

  return {
    tempo: o.tempo,
    signatureNumerator: o.signatureNumerator,
    signatureDenominator: o.signatureDenominator,
    scaleName: o.scaleName,
    rootNote: o.rootNote,
    trackCount: o.trackCount,
    audioTrackCount: o.audioTrackCount,
    midiTrackCount: o.midiTrackCount,
    totalClipCount: o.totalClipCount,
    totalDeviceCount: o.totalDeviceCount,
    sceneCount: o.sceneCount,
    cuePointCount: o.cuePointCount,
    deviceNames: Array.from(deviceNames).slice(0, 30), // limit to 30 device names
    trackSummary: snapshot.tracks.map(t => ({
      name: t.name,
      type: t.type,
      clipCount: t.clipCount,
      deviceCount: t.deviceCount,
      armed: t.arm,
      muted: t.mute,
      soloed: t.solo,
    })),
  };
}

/**
 * Fetch AI suggestions from the Cloudflare Worker.
 * Returns null if the request fails or times out —
 * the caller should handle this gracefully with fallback suggestions.
 */
export async function fetchAISuggestions(
  snapshot: ProjectSnapshot
): Promise<AISuggestion[] | null> {
  const payload = compactProjectData(snapshot);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    const response = await fetch(AI_WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`📸 AI suggestions: HTTP ${response.status}`);
      return null;
    }

    const data = await response.json() as { suggestions?: AISuggestion[] };

    if (!data.suggestions || !Array.isArray(data.suggestions) || data.suggestions.length === 0) {
      console.warn("📸 AI suggestions: empty or invalid response");
      return null;
    }

    // Validate each suggestion has required fields
    const valid = data.suggestions.filter(
      s => s && typeof s.title === "string" && typeof s.description === "string"
    );

    if (valid.length === 0) {
      return null;
    }

    console.log(`📸 AI suggestions: received ${valid.length} suggestions`);
    return valid.slice(0, 5);
  } catch (error: any) {
    if (error?.name === "AbortError") {
      console.warn("📸 AI suggestions: request timed out");
    } else {
      console.warn("📸 AI suggestions: request failed:", error?.message ?? error);
    }
    return null;
  }
}

/**
 * Generate local fallback suggestions based on project data.
 * Used when the AI service is unavailable.
 */
export function getLocalFallbackSuggestions(snapshot: ProjectSnapshot): AISuggestion[] {
  const o = snapshot.overview;
  const suggestions: AISuggestion[] = [];

  // Genre/structure suggestions based on maturity
  if (o.totalClipCount < 5) {
    suggestions.push({
      icon: "🌱",
      title: "Build your foundation",
      description: `Start with a drum pattern and bassline at ${o.tempo} BPM. Layer melodies on top once the groove is solid.`,
    });
  } else if (o.totalClipCount > 20) {
    suggestions.push({
      icon: "🏗️",
      title: "Map your arrangement",
      description: `With ${o.totalClipCount} clips, try organizing scenes into intro-build-drop-breakdown-outro sections.`,
    });
  } else {
    suggestions.push({
      icon: "🎵",
      title: "Expand your ideas",
      description: `You have ${o.totalClipCount} clips. Try duplicating and varying them to create contrast between sections.`,
    });
  }

  // Device-based suggestion
  if (o.totalDeviceCount > 20) {
    suggestions.push({
      icon: "❄️",
      title: "Freeze CPU-heavy tracks",
      description: `${o.totalDeviceCount} devices is a lot. Freeze tracks you're happy with to reclaim CPU for new elements.`,
    });
  } else if (o.totalDeviceCount === 0) {
    suggestions.push({
      icon: "🔌",
      title: "Add your first devices",
      description: "No devices detected. Start with a Reverb and Saturator on your return tracks for instant depth.",
    });
  } else {
    suggestions.push({
      icon: "🎛️",
      title: "Experiment with effects",
      description: `Try automating parameters on your ${o.totalDeviceCount} device${o.totalDeviceCount > 1 ? "s" : ""} — filter sweeps and delay throws add movement.`,
    });
  }

  // MIDI vs Audio balance
  if (o.midiTrackCount > o.audioTrackCount + 3) {
    suggestions.push({
      icon: "🎙️",
      title: "Resample to audio",
      description: `Lots of MIDI tracks (${o.midiTrackCount}). Resample some to audio for creative manipulation and CPU savings.`,
    });
  } else if (o.audioTrackCount > o.midiTrackCount + 3) {
    suggestions.push({
      icon: "🎹",
      title: "Add MIDI flexibility",
      description: `Predominantly audio tracks. Consider recreating key melodies in MIDI for easy transposition and variation.`,
    });
  } else {
    suggestions.push({
      icon: "🎚️",
      title: "Balance your layers",
      description: `Good mix of MIDI and audio. Focus on EQ carving to give each element its own frequency space.`,
    });
  }

  // Scene suggestion
  if (o.sceneCount === 0) {
    suggestions.push({
      icon: "🎬",
      title: "Create your first scenes",
      description: "Scenes let you trigger multiple clips simultaneously — perfect for building arrangement variations.",
    });
  } else if (o.sceneCount < 3) {
    suggestions.push({
      icon: "🎬",
      title: "Expand your scenes",
      description: `Only ${o.sceneCount} scene${o.sceneCount > 1 ? "s" : ""}. Add more to represent different song sections (verse, chorus, bridge).`,
    });
  }

  // Creativity wildcard
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const rootName = o.rootNote >= 0 && o.rootNote <= 11 ? noteNames[o.rootNote] : "C";
  suggestions.push({
    icon: "🎨",
    title: `Explore ${rootName} ${o.scaleName || "Minor"}`,
    description: `Your project is in ${rootName} ${o.scaleName || "a scale"}. Try modal interchange — borrow chords from the parallel major/minor for emotional contrast.`,
  });

  return suggestions.slice(0, 5);
}
