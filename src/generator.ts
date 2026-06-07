// ──────────────────────────────────────────────
// Project Snapshot — HTML Generator
// Assembles data + template into the final HTML file
// ──────────────────────────────────────────────

import * as fs from "node:fs";
import * as path from "node:path";
import type { ProjectSnapshot } from "./types.js";
import { renderTemplate } from "./template.js";

export async function generateReport(
  data: ProjectSnapshot,
  storageDir: string,
): Promise<string> {
  // Render the HTML
  const html = renderTemplate(data);

  // Generate filename with timestamp
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .slice(0, 19);

  const filename = `project-snapshot-${timestamp}.html`;
  const outputPath = path.join(storageDir, filename);

  // Ensure directory exists
  fs.mkdirSync(storageDir, { recursive: true });

  // Write the file
  fs.writeFileSync(outputPath, html, "utf-8");

  return outputPath;
}
