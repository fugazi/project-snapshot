// ──────────────────────────────────────────────
// Project Snapshot AI — Cloudflare Worker
// Proxy endpoint that receives project data,
// builds a prompt, calls Workers AI, returns suggestions
// ──────────────────────────────────────────────

export interface ProjectData {
  tempo: number;
  signatureNumerator: number;
  signatureDenominator: number;
  scaleName: string;
  rootNote: number;
  trackCount: number;
  audioTrackCount: number;
  midiTrackCount: number;
  totalClipCount: number;
  totalDeviceCount: number;
  sceneCount: number;
  cuePointCount: number;
  deviceNames: string[];
  trackSummary: {
    name: string;
    type: string;
    clipCount: number;
    deviceCount: number;
    armed: boolean;
    muted: boolean;
    soloed: boolean;
  }[];
}

export interface AISuggestion {
  icon: string;
  title: string;
  description: string;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const MODEL = "@cf/zai-org/glm-4.7-flash";

export default {
  async fetch(request: Request, env: Record<string, string>): Promise<Response> {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    try {
      const data: ProjectData = await request.json();

      // Basic validation
      if (!data || typeof data.tempo !== "number") {
        return new Response(JSON.stringify({ error: "Invalid project data" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        });
      }

      // Build the prompt
      const prompt = buildPrompt(data);

      // Call Workers AI
      const aiResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/ai/run/${MODEL}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.CF_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: prompt },
            ],
            max_tokens: 1200,
            temperature: 0.8,
            response_format: { type: "json_object" },
          }),
        }
      );

      if (!aiResponse.ok) {
        const errText = await aiResponse.text();
        console.error("Workers AI error:", aiResponse.status, errText);
        // Fallback to local suggestions
        return new Response(JSON.stringify({ suggestions: getFallbackSuggestions(data) }), {
          headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        });
      }

      const aiResult = await aiResponse.json() as any;
      const rawText = aiResult?.result?.response ?? "";

      // Parse the JSON response
      let suggestions: AISuggestion[];
      try {
        const parsed = JSON.parse(rawText);
        suggestions = parsed.suggestions ?? parsed.ideas ?? parsed;
        if (!Array.isArray(suggestions)) {
          throw new Error("Not an array");
        }
      } catch {
        // If parsing fails, use fallback
        suggestions = getFallbackSuggestions(data);
      }

      // Limit to 5 suggestions
      suggestions = suggestions.slice(0, 5);

      return new Response(JSON.stringify({ suggestions }), {
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    } catch (error) {
      console.error("Worker error:", error);
      return new Response(JSON.stringify({ error: "Internal error" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }
  },
};

// ── System Prompt ──

const SYSTEM_PROMPT = `You are a professional music production advisor with deep expertise in electronic music production, sound design, mixing, and creative workflow. You specialize in helping producers overcome creative blocks and develop their projects further.

Your task: Analyze the provided Ableton Live Set data and generate exactly 5 creative, specific, and actionable suggestions to help the producer develop this project.

Rules:
- Be specific to the project data (reference BPM, devices, track count, etc.)
- Focus on creativity, arrangement, sound design, and workflow
- Each suggestion must have: icon (emoji), title (max 60 chars), description (max 200 chars)
- Vary the types of suggestions (arrangement, sound design, mixing, creativity, workflow)
- Be encouraging but practical
- Respond ONLY with valid JSON: {"suggestions": [{"icon": "🎵", "title": "...", "description": "..."}]}`;

// ── Prompt Builder ──

function buildPrompt(data: ProjectData): string {
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const rootNoteName = data.rootNote >= 0 && data.rootNote <= 11
    ? noteNames[data.rootNote]
    : "Unknown";

  // Infer genre hint from BPM
  let genreHint = "Unknown";
  const bpm = data.tempo;
  if (bpm >= 60 && bpm < 80) genreHint = "Downtempo / Trip-hop / Lo-fi";
  else if (bpm >= 80 && bpm < 100) genreHint = "Hip-hop / Chill / Breakbeat";
  else if (bpm >= 100 && bpm < 115) genreHint = "Breakbeat / UK Garage / Future Bass";
  else if (bpm >= 115 && bpm < 125) genreHint = "House / Deep House / Tech House";
  else if (bpm >= 125 && bpm < 135) genreHint = "Techno / House / Trance";
  else if (bpm >= 135 && bpm < 145) genreHint = "Drum & Bass / Trance / Hard Dance";
  else if (bpm >= 145 && bpm < 160) genreHint = "Drum & Bass / Jungle";
  else if (bpm >= 160) genreHint = "Breakcore / Speedcore / Experimental";

  // Determine project maturity
  const totalContent = data.totalClipCount + data.totalDeviceCount;
  let maturity = "Early stage";
  if (totalContent > 30) maturity = "Well-developed";
  else if (totalContent > 15) maturity = "Developing";
  else if (totalContent > 5) maturity = "Early stage";

  // Track details
  const armedTracks = data.trackSummary.filter(t => t.armed).map(t => t.name);
  const mutedTracks = data.trackSummary.filter(t => t.muted).map(t => t.name);
  const soloedTracks = data.trackSummary.filter(t => t.soloed).map(t => t.name);
  const emptyTracks = data.trackSummary.filter(t => t.clipCount === 0 && t.type !== "master" && t.type !== "return");

  return `Analyze this Ableton Live Set and provide 5 creative suggestions:

PROJECT OVERVIEW:
- BPM: ${data.tempo}
- Time Signature: ${data.signatureNumerator}/${data.signatureDenominator}
- Key: ${rootNoteName} ${data.scaleName || "Unknown scale"}
- Genre hint: ${genreHint}
- Tracks: ${data.trackCount} total (${data.audioTrackCount} audio, ${data.midiTrackCount} MIDI)
- Clips: ${data.totalClipCount} total
- Devices: ${data.totalDeviceCount} total
- Scenes: ${data.sceneCount}
- Cue Points: ${data.cuePointCount}
- Project maturity: ${maturity}

DEVICES USED:
${data.deviceNames.length > 0 ? data.deviceNames.join(", ") : "None detected"}

TRACK DETAILS:
${data.trackSummary.map(t => `- ${t.name} (${t.type}): ${t.clipCount} clips, ${t.deviceCount} devices${t.armed ? " [ARMED]" : ""}${t.muted ? " [MUTED]" : ""}${t.soloed ? " [SOLOED]" : ""}`).join("\n")}

${armedTracks.length > 0 ? `Tracks armed: ${armedTracks.join(", ")}\n` : ""}
${emptyTracks.length > 0 ? `Empty tracks: ${emptyTracks.length}\n` : ""}

Provide 5 varied, specific, creative suggestions as JSON.`;
}

// ── Fallback suggestions (if AI fails) ──

function getFallbackSuggestions(data: ProjectData): AISuggestion[] {
  const suggestions: AISuggestion[] = [];

  if (data.totalClipCount < 5) {
    suggestions.push({
      icon: "🌱",
      title: "Build your foundation",
      description: `You have ${data.totalClipCount} clips. Start by layering a solid drum pattern and bassline at ${data.tempo} BPM to establish your groove.`,
    });
  } else {
    suggestions.push({
      icon: "🏗️",
      title: "Develop your arrangement",
      description: `With ${data.totalClipCount} clips across ${data.trackCount} tracks, try mapping out an intro-build-drop-outro structure in Session View.`,
    });
  }

  if (data.midiTrackCount > 0 && data.audioTrackCount > 0) {
    suggestions.push({
      icon: "🎚️",
      title: "Balance MIDI and audio",
      description: `You have ${data.midiTrackCount} MIDI and ${data.audioTrackCount} audio tracks. Consider resampling MIDI parts to audio for more creative processing.`,
    });
  }

  if (data.totalDeviceCount > 15) {
    suggestions.push({
      icon: "❄️",
      title: "Freeze CPU-heavy tracks",
      description: `${data.totalDeviceCount} devices detected. Freeze tracks you're happy with to free up CPU and focus on new elements.`,
    });
  }

  if (data.sceneCount === 0) {
    suggestions.push({
      icon: "🎬",
      title: "Create scenes for variations",
      description: "No scenes yet. Scenes let you trigger clip combinations and build arrangement variations quickly.",
    });
  }

  suggestions.push({
    icon: "🎨",
    title: "Experiment with sound design",
    description: `Try applying ${data.deviceNames.length > 0 ? data.deviceNames[0] : "a new effect"} creatively — automate parameters over time for evolving textures.`,
  });

  return suggestions.slice(0, 5);
}
