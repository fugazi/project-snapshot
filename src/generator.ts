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
  filename?: string,
): Promise<string> {
  // Render the HTML
  const html = renderTemplate(data);

  // Build filename
  const baseName = filename || "project-snapshot";
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .slice(0, 19);

  const finalFilename = `${baseName}-${timestamp}.html`;
  const outputPath = path.join(storageDir, finalFilename);

  // Ensure directory exists
  fs.mkdirSync(storageDir, { recursive: true });

  // Write the file
  fs.writeFileSync(outputPath, html, "utf-8");

  return outputPath;
}
