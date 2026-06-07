// ──────────────────────────────────────────────
// Project Snapshot — Ableton Live Extension
// Entry point — activate + commands
// ──────────────────────────────────────────────

import { initialize, type ActivationContext } from "@ableton-extensions/sdk";
import { extractSnapshot } from "./extractor.js";
import { generateReport } from "./generator.js";

export function activate(activation: ActivationContext) {
  const context = initialize(activation, "1.0.0");

  // Register the main command
  context.commands.registerCommand(
    "project-snapshot.generate",
    () => {
      void context.ui.withinProgressDialog(
        "📸 Project Snapshot — Analyzing your project...",
        { progress: 5 },
        async (update, signal) => {
          try {
            // Phase 1: Extract all data from the Live Set
            const snapshot = await extractSnapshot(context, async (msg, pct) => {
              await update(msg, pct);
              signal.throwIfAborted();
            });

            if (signal.aborted) return;

            await update("Generating HTML report...", 85);

            // Phase 2: Generate the HTML report
            const storageDir = context.environment.storageDirectory;
            const outputPath = await generateReport(snapshot, storageDir);

            await update("Done! ✅", 100);

            // Log the output path so the user can find it
            console.log(`\n📸 Project Snapshot generated successfully!`);
            console.log(`📄 File: ${outputPath}`);
            console.log(`📊 Summary: ${snapshot.overview.trackCount} tracks, ${snapshot.overview.totalClipCount} clips, ${snapshot.overview.totalDeviceCount} devices`);
            console.log(`⏱️  Tempo: ${snapshot.overview.tempo} BPM | 🎵 Key: ${snapshot.overview.scaleName || "None"}`);
          } catch (e) {
            if (signal.aborted) return;
            console.error("❌ Project Snapshot error:", e);
            throw e;
          }
        },
      );
    },
  );

  // Register context menu actions — available from multiple scopes
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
      "📸 Generate Project Snapshot",
      "project-snapshot.generate",
    );
  }

  console.log("📸 Project Snapshot extension loaded. Right-click anywhere to generate a snapshot!");
}
