// ──────────────────────────────────────────────
// Project Snapshot — Ableton Live Extension
// Entry point — activate + commands
// ──────────────────────────────────────────────

import {
  initialize,
  AudioTrack,
  MidiTrack,
  type ActivationContext,
} from "@ableton-extensions/sdk";
import { extractSnapshot } from "./extractor.js";
import { generateReport } from "./generator.js";
import { buildModalHtml, buildSuccessModalHtml } from "./modal.js";

export function activate(activation: ActivationContext) {
  const context = initialize(activation, "1.0.0");

  // Register the main command — shows modal dialog first
  context.commands.registerCommand(
    "project-snapshot.showModal",
    () => {
      // Quick scan of the project for the modal preview
      const song = context.application.song;
      let audioTrackCount = 0;
      let midiTrackCount = 0;
      let clipCount = 0;

      for (const track of song.tracks) {
        if (track instanceof AudioTrack) audioTrackCount++;
        if (track instanceof MidiTrack) midiTrackCount++;
        if (track.clipSlots) {
          for (const slot of track.clipSlots) {
            try { if (slot.clip) clipCount++; } catch { /* empty */ }
          }
        }
        if (track.arrangementClips) {
          clipCount += track.arrangementClips.length;
        }
      }

      let deviceCount = 0;
      for (const track of song.tracks) {
        deviceCount += track.devices.length;
      }

      let scaleName = "None";
      let rootNote = 0;
      let sigNum = 4;
      let sigDen = 4;
      try { scaleName = song.scaleName ?? "None"; } catch { /* default */ }
      try { rootNote = song.rootNote ?? 0; } catch { /* default */ }
      // Song doesn't have signatureNumerator/signatureDenominator in SDK 1.0.0-beta
      // Those properties belong to Scene; use defaults for the modal preview
      try {
        if (song.scenes.length > 0) {
          sigNum = (song.scenes[0] as any).signatureNumerator ?? 4;
          sigDen = (song.scenes[0] as any).signatureDenominator ?? 4;
        }
      } catch { /* default */ }

      const storageDir = context.environment.storageDirectory;

      const quickInfo = {
        tempo: song.tempo,
        trackCount: song.tracks.length,
        clipCount,
        deviceCount,
        sceneCount: song.scenes.length,
        audioTrackCount,
        midiTrackCount,
        signatureNumerator: sigNum,
        signatureDenominator: sigDen,
        scaleName,
        rootNote,
        storageDir: storageDir ?? "",
      };

      const modalHtml = buildModalHtml(quickInfo);

      void context.ui.showModalDialog(modalHtml, 480, 580).then((resultStr: string) => {
        try {
          const result = JSON.parse(resultStr);
          if (result.action === "generate") {
            void runGeneration(context, result.filename || "project-snapshot", result.projectname || result.filename || "Ableton Project");
          }
        } catch (e) {
          console.error("Modal result parse error:", e);
        }
      }).catch(() => {
        console.log("📸 Project Snapshot modal closed.");
      });
    },
  );

  // Register context menu actions
  const scopes = [
    "ClipSlot",
    "AudioTrack",
    "MidiTrack",
    "AudioClip",
    "MidiClip",
    "Scene",
    "AudioTrack.ArrangementSelection",
    "MidiTrack.ArrangementSelection",
  ] as const;

  for (const scope of scopes) {
    context.ui.registerContextMenuAction(
      scope,
      "📸 Project Snapshot...",
      "project-snapshot.showModal",
    );
  }

  console.log("📸 Project Snapshot extension loaded. Right-click anywhere to open the snapshot dialog!");
}

async function runGeneration(
  context: any,
  filename: string,
  projectName: string,
): Promise<void> {
  await context.ui.withinProgressDialog(
    "📸 Project Snapshot — Analyzing your project...",
    { progress: 5 },
    async (update: (msg: string, pct: number) => Promise<void>, signal: AbortSignal) => {
      try {
        const snapshot = await extractSnapshot(context, async (msg, pct) => {
          await update(msg, pct);
          signal.throwIfAborted();
        }, projectName);

        if (signal.aborted) return;

        await update("Generating HTML report...", 85);

        const storageDir = context.environment.storageDirectory;
        const outputPath = await generateReport(snapshot, storageDir, filename);

        await update("Done! ✅", 100);

        console.log(`\n📸 Project Snapshot generated successfully!`);
        console.log(`📄 File: ${outputPath}`);
        console.log(`📊 ${snapshot.overview.trackCount} tracks, ${snapshot.overview.totalClipCount} clips, ${snapshot.overview.totalDeviceCount} devices`);
        console.log(`⏱️  ${snapshot.overview.tempo} BPM | 🎵 ${snapshot.overview.scaleName || "None"}`);

        // Show success modal with the file path
        const successHtml = buildSuccessModalHtml(outputPath, {
          tracks: snapshot.overview.trackCount,
          clips: snapshot.overview.totalClipCount,
          devices: snapshot.overview.totalDeviceCount,
          tempo: snapshot.overview.tempo,
        });

        void context.ui.showModalDialog(successHtml, 420, 400).catch(() => {});
      } catch (e) {
        if (signal.aborted) return;
        console.error("❌ Project Snapshot error:", e);
        throw e;
      }
    },
  );
}
