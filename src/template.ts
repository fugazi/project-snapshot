// ──────────────────────────────────────────────
// Project Snapshot — Deep Ink Luxury Template
// Generates the full HTML report
// ──────────────────────────────────────────────

import type { ProjectSnapshot, SnapshotTrack, SnapshotClip, SnapshotDevice, SnapshotParameter, SnapshotSuggestion } from "./types.js";
import { getTrackTypeName, getTrackTypeEmoji, midiNoteToName } from "./types.js";

export function renderTemplate(data: ProjectSnapshot): string {
  const o = data.overview;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>📸 Project Snapshot — ${o.tempo} BPM</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
  <style>
${CSS}
  </style>
</head>
<body>

${renderNav(data)}
${renderHero(data)}
${renderStats(data)}
${renderTracks(data)}
${renderClips(data)}
${renderDevices(data)}
${renderScenes(data)}
${renderNotes()}
${renderSuggestions(data)}
${renderFooter(data)}

<!-- Floating buttons -->
<div class="floating-buttons">
  <button class="fab" onclick="window.scrollTo({top:0,behavior:'smooth'})" title="Scroll to top">⬆</button>
  <button class="fab" onclick="window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'})" title="Scroll to bottom">⬇</button>
  <button class="fab fab-share" onclick="shareReport()" title="Share">📋</button>
</div>

<script>
${JS}
</script>
</body>
</html>`;
}

// ══════════════════════════════════════
// CSS
// ══════════════════════════════════════

const CSS = `
    :root {
      --ink:      #00131a;
      --ink-2:    #041f2a;
      --ink-3:    #0a2d3b;
      --ink-4:    #103847;
      --paper:       #fcf1e5;
      --paper-dim:   rgba(252, 241, 229, 0.72);
      --paper-mute:  rgba(252, 241, 229, 0.50);
      --paper-faint: rgba(252, 241, 229, 0.30);
      --paper-ghost: rgba(252, 241, 229, 0.08);
      --teal:     #48d0ce;
      --teal-dim: #2dd4bf;
      --teal-bg:  rgba(72, 208, 206, 0.08);
      --teal-glow:rgba(72, 208, 206, 0.15);
      --flame:     #fc6b3c;
      --flame-2:   #f98d27;
      --flame-bg:  rgba(252, 107, 60, 0.08);
      --flame-glow:rgba(252, 107, 60, 0.15);
      --line:   rgba(252, 241, 229, 0.10);
      --line-2: rgba(252, 241, 229, 0.16);
      --line-3: rgba(252, 241, 229, 0.22);
      --display: 'Nunito', sans-serif;
      --sans:     'Space Grotesk', system-ui, sans-serif;
      --mono:     'JetBrains Mono', ui-monospace, monospace;
      --serif:    'Instrument Serif', Georgia, serif;
      --max-width: 1200px;
      --wrap-pad: 40px;
      --radius-sm: 8px;
      --radius-md: 16px;
      --radius-lg: 20px;
      --radius-pill: 999px;
      --ease-out: cubic-bezier(0.2, 0.7, 0.2, 1);
    }
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; background: var(--ink); }
    body {
      font-family: var(--sans);
      color: var(--paper);
      background: var(--ink);
      -webkit-font-smoothing: antialiased;
      line-height: 1.5;
      overflow-x: hidden;
    }
    a { color: inherit; text-decoration: none; }
    button { font: inherit; color: inherit; background: none; border: none; cursor: pointer; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--ink); }
    ::-webkit-scrollbar-thumb { background: var(--paper-faint); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--paper-mute); }
    h1 { font-family: var(--display); font-weight: 700; font-size: clamp(36px, 5vw, 64px); line-height: 0.98; letter-spacing: -0.008em; }
    h1 .teal { color: var(--teal); }
    h2 { font-family: var(--display); font-weight: 600; font-size: clamp(28px, 3.5vw, 44px); line-height: 1.0; letter-spacing: -0.01em; margin-bottom: 32px; }
    h2 .teal { color: var(--teal); }
    h3 { font-family: var(--display); font-weight: 600; font-size: 18px; line-height: 1.2; }
    h4 { font-family: var(--display); font-weight: 600; font-size: 15px; line-height: 1.3; }
    .mono { font-family: var(--mono); letter-spacing: 0.02em; }
    .eyebrow { font-family: var(--mono); font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--paper-mute); display: inline-flex; align-items: center; gap: 10px; }
    .eyebrow-dot::before { content: ""; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--teal); box-shadow: 0 0 0 3px var(--teal-glow); }
    .wrap { max-width: var(--max-width); margin: 0 auto; padding: 0 var(--wrap-pad); position: relative; }
    .section { padding: 80px 0; position: relative; border-top: 1px solid var(--line); }
    .section.no-border { border-top: none; }

    /* NAV */
    .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(0, 19, 26, 0.82); backdrop-filter: blur(12px) saturate(130%); -webkit-backdrop-filter: blur(12px) saturate(130%); border-bottom: 1px solid var(--line); }
    .nav-inner { max-width: var(--max-width); margin: 0 auto; padding: 12px var(--wrap-pad); display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
    .nav-brand { font-family: var(--display); font-weight: 700; font-size: 18px; color: var(--paper); display: flex; align-items: center; gap: 10px; }
    .nav-brand-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--teal); animation: pulse 2s infinite; }
    .nav-links { display: flex; gap: 20px; align-items: center; font-size: 13px; color: var(--paper-dim); list-style: none; flex-wrap: wrap; }
    .nav-links a { transition: color 0.2s; padding: 4px 0; white-space: nowrap; }
    .nav-links a:hover { color: var(--paper); }

    /* HERO */
    .hero { min-height: 50vh; display: flex; align-items: center; padding-top: 80px; position: relative; overflow: hidden; }
    .hero-content { max-width: 700px; position: relative; }
    .hero .glow-teal { position: absolute; top: -100px; right: -50px; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(72,208,206,0.15), transparent 70%); pointer-events: none; animation: glow-pulse 4s ease-in-out infinite; }
    .hero .glow-flame { position: absolute; bottom: -80px; left: -100px; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, rgba(252,107,60,0.12), transparent 70%); pointer-events: none; animation: glow-pulse 5s ease-in-out infinite; }
    .hero-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 32px; }
    .hero-meta-item { display: flex; align-items: center; gap: 8px; font-size: 15px; color: var(--paper-dim); }
    .hero-meta-item .emoji { font-size: 20px; }
    .hero-meta-item .value { color: var(--paper); font-weight: 600; }

    /* STATS */
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
    .stat-card { text-align: center; padding: 24px 16px; border: 1px solid var(--line); border-radius: var(--radius-md); background: linear-gradient(180deg, rgba(72,208,206,0.035), rgba(4,31,42,0.3)); transition: border-color 0.3s, transform 0.3s var(--ease-out); }
    .stat-card:hover { border-color: var(--line-3); transform: translateY(-2px); }
    .stat-num { font-family: var(--display); font-size: 36px; font-weight: 700; line-height: 1; margin-bottom: 8px; }
    .stat-label { font-family: var(--mono); font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--paper-mute); }

    /* TRACK CARDS */
    .track-list { display: flex; flex-direction: column; gap: 12px; }
    .track-card { border: 1px solid var(--line); border-radius: var(--radius-md); padding: 20px 24px; background: linear-gradient(180deg, rgba(72,208,206,0.02), rgba(4,31,42,0.2)); transition: border-color 0.3s, transform 0.2s var(--ease-out); display: grid; grid-template-columns: auto 1fr auto; gap: 16px; align-items: center; }
    .track-card:hover { border-color: var(--line-3); transform: translateY(-1px); }
    .track-icon { font-size: 28px; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; background: var(--paper-ghost); border: 1px solid var(--line); }
    .track-info { min-width: 0; }
    .track-name { font-family: var(--display); font-weight: 600; font-size: 16px; color: var(--paper); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .track-sub { font-family: var(--mono); font-size: 11px; color: var(--paper-mute); margin-top: 4px; }
    .track-badges { display: flex; gap: 8px; flex-wrap: wrap; }
    .badge { font-family: var(--mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 10px; border-radius: var(--radius-pill); border: 1px solid; }
    .badge-arm { color: #ff6b6b; border-color: rgba(255,107,107,0.3); background: rgba(255,107,107,0.08); }
    .badge-mute { color: var(--paper-mute); border-color: var(--line-2); background: var(--paper-ghost); }
    .badge-solo { color: #ffd43b; border-color: rgba(255,212,59,0.3); background: rgba(255,212,59,0.08); }
    .badge-teal { color: var(--teal); border-color: rgba(72,208,206,0.2); background: var(--teal-bg); }
    .badge-flame { color: var(--flame); border-color: rgba(252,107,60,0.2); background: var(--flame-bg); }
    .badge-paper { color: var(--paper-dim); background: var(--paper-ghost); border-color: var(--line-2); }

    /* CLIP TABLE */
    .clip-group { margin-bottom: 24px; }
    .clip-group-title { font-family: var(--display); font-weight: 600; font-size: 16px; color: var(--paper); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .table-wrap { border: 1px solid var(--line); border-radius: var(--radius-md); overflow: hidden; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead { background: var(--ink-2); }
    th { font-family: var(--mono); font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--paper-mute); text-align: left; padding: 12px 16px; border-bottom: 1px solid var(--line); }
    td { padding: 10px 16px; border-bottom: 1px solid var(--line); color: var(--paper-dim); }
    tr:last-child td { border-bottom: none; }
    tbody tr { transition: background 0.2s; }
    tbody tr:hover { background: var(--paper-ghost); }

    /* DEVICE ACCORDION */
    .device-group { margin-bottom: 24px; }
    .device-group-title { font-family: var(--display); font-weight: 600; font-size: 16px; color: var(--paper); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .device-accordion { border: 1px solid var(--line); border-radius: var(--radius-md); overflow: hidden; margin-bottom: 8px; }
    .device-header { padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; background: linear-gradient(180deg, rgba(72,208,206,0.02), transparent); transition: background 0.2s; }
    .device-header:hover { background: rgba(252,241,229,0.04); }
    .device-header-left { display: flex; align-items: center; gap: 12px; }
    .device-type-icon { font-size: 18px; }
    .device-name { font-family: var(--display); font-weight: 600; font-size: 14px; color: var(--paper); }
    .device-tag { font-family: var(--mono); font-size: 10px; padding: 2px 8px; border-radius: var(--radius-pill); background: var(--teal-bg); color: var(--teal); border: 1px solid rgba(72,208,206,0.15); }
    .device-chevron { color: var(--paper-mute); transition: transform 0.2s; font-size: 12px; }
    .device-accordion.open .device-chevron { transform: rotate(180deg); }
    .device-body { max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out; background: var(--ink-2); }
    .device-accordion.open .device-body { max-height: 2000px; }
    .device-params { padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; }
    .param-row { display: grid; grid-template-columns: 140px 1fr 60px; gap: 12px; align-items: center; }
    .param-name { font-family: var(--mono); font-size: 11px; color: var(--paper-mute); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .param-bar-track { height: 4px; background: var(--paper-ghost); border-radius: 2px; overflow: hidden; }
    .param-bar-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, var(--teal), var(--flame)); }
    .param-value { font-family: var(--mono); font-size: 11px; color: var(--paper-dim); text-align: right; }

    /* SCENES */
    .scene-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
    .scene-card { border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 14px 18px; background: linear-gradient(180deg, rgba(72,208,206,0.02), transparent); }
    .scene-num { font-family: var(--mono); font-size: 10px; color: var(--paper-faint); margin-bottom: 4px; }
    .scene-name { font-family: var(--display); font-weight: 600; font-size: 14px; color: var(--paper); }

    /* NOTES */
    .notes-area { width: 100%; min-height: 140px; padding: 18px; font-family: var(--sans); font-size: 15px; color: var(--paper); background: rgba(252,241,229,0.03); border: 1px solid var(--line-2); border-radius: var(--radius-md); outline: none; resize: vertical; transition: border-color 0.2s, box-shadow 0.2s; line-height: 1.6; }
    .notes-area::placeholder { color: var(--paper-faint); }
    .notes-area:focus { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(72,208,206,0.08); }
    .notes-hint { font-family: var(--mono); font-size: 10px; color: var(--paper-faint); margin-top: 8px; }

    /* SUGGESTIONS */
    .suggestion-list { display: flex; flex-direction: column; gap: 12px; }
    .suggestion-card { padding: 16px 20px; border-radius: var(--radius-md); border-left: 3px solid; display: flex; gap: 12px; align-items: flex-start; }
    .suggestion-card.s-tip { background: rgba(72,208,206,0.06); border-color: var(--teal); }
    .suggestion-card.s-warning { background: rgba(252,107,60,0.06); border-color: var(--flame); }
    .suggestion-card.s-info { background: rgba(252,241,229,0.04); border-color: var(--paper-mute); }
    .suggestion-icon { font-size: 20px; flex-shrink: 0; margin-top: 2px; }
    .suggestion-text { font-size: 14px; color: var(--paper-dim); line-height: 1.5; }

    /* FOOTER */
    .footer { padding: 48px 0; border-top: 1px solid var(--line); color: var(--paper-mute); font-size: 13px; text-align: center; }
    .footer a { color: var(--teal); transition: color 0.2s; }
    .footer a:hover { color: var(--paper); }
    .footer .brand { font-family: var(--display); font-weight: 700; font-size: 16px; color: var(--paper); margin-bottom: 8px; }
    .footer .sub { font-family: var(--mono); font-size: 11px; color: var(--paper-faint); margin-top: 12px; }

    /* FLOATING BUTTONS */
    .floating-buttons { position: fixed; bottom: 24px; right: 24px; display: flex; flex-direction: column; gap: 10px; z-index: 90; }
    .fab { width: 44px; height: 44px; border-radius: 50%; background: var(--ink-3); border: 1px solid var(--line-2); color: var(--paper-dim); font-size: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s, background 0.2s, border-color 0.2s; }
    .fab:hover { transform: translateY(-2px); background: var(--ink-4); border-color: var(--line-3); color: var(--paper); }
    .fab-share { background: var(--teal-bg); border-color: rgba(72,208,206,0.2); }
    .fab-share:hover { background: rgba(72,208,206,0.15); border-color: rgba(72,208,206,0.4); }

    /* ANIMATIONS */
    @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(72,208,206,0.6); } 70% { box-shadow: 0 0 0 10px rgba(72,208,206,0); } 100% { box-shadow: 0 0 0 0 rgba(72,208,206,0); } }
    @keyframes glow-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
    @keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-up { animation: fade-up 0.6s var(--ease-out) both; }

    /* DIVIDER */
    .divider-glow { border: none; height: 1px; background: linear-gradient(90deg, transparent, var(--teal), transparent); margin: 48px 0; opacity: 0.4; }

    @media (max-width: 768px) {
      .wrap { padding: 0 20px; }
      .section { padding: 48px 0; }
      .track-card { grid-template-columns: auto 1fr; }
      .track-badges { grid-column: 1 / -1; }
      .param-row { grid-template-columns: 100px 1fr 50px; }
      .nav-links { display: none; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
`;

// ══════════════════════════════════════
// JS
// ══════════════════════════════════════

const JS = `
  // Accordion toggle
  document.querySelectorAll('.device-header').forEach(header => {
    header.addEventListener('click', () => {
      const accordion = header.parentElement;
      accordion.classList.toggle('open');
    });
  });

  // Notes localStorage
  const notesArea = document.getElementById('project-notes');
  if (notesArea) {
    const saved = localStorage.getItem('project-snapshot-notes');
    if (saved) notesArea.value = saved;
    notesArea.addEventListener('input', () => {
      localStorage.setItem('project-snapshot-notes', notesArea.value);
    });
  }

  // Share report (copy file path hint)
  function shareReport() {
    const text = 'Project Snapshot — Generated with Project Snapshot for Ableton Live by Douglas Fugazi';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
      });
    }
  }

  // Smooth reveal on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.section').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
`;

// ══════════════════════════════════════
// RENDER SECTIONS
// ══════════════════════════════════════

function renderNav(data: ProjectSnapshot): string {
  return `  <nav class="nav">
    <div class="nav-inner">
      <div class="nav-brand">
        <span class="nav-brand-dot"></span>
        📸 Project Snapshot
      </div>
      <ul class="nav-links">
        <li><a href="#overview">Overview</a></li>
        <li><a href="#tracks">Tracks</a></li>
        <li><a href="#clips">Clips</a></li>
        <li><a href="#devices">Devices</a></li>
        <li><a href="#scenes">Scenes</a></li>
        <li><a href="#notes">Notes</a></li>
        <li><a href="#suggestions">Next Steps</a></li>
      </ul>
    </div>
  </nav>`;
}

function renderHero(data: ProjectSnapshot): string {
  const o = data.overview;
  const scaleDisplay = o.scaleName && o.scaleName !== "None"
    ? `${NOTE_NAMES[o.rootNote]} ${o.scaleName}`
    : "No scale set";

  return `  <header id="overview" class="hero section no-border">
    <div class="wrap">
      <div class="hero-content">
        <div class="glow-teal"></div>
        <div class="glow-flame"></div>
        <p class="eyebrow eyebrow-dot animate-fade-up">📸 Project Snapshot</p>
        <h1 style="margin-top:24px;">
          Your <span class="teal">Live</span><br>Project at a Glance
        </h1>
        <div class="hero-meta animate-fade-up" style="animation-delay:0.2s;">
          <div class="hero-meta-item">
            <span class="emoji">⏱️</span>
            <span class="value">${o.tempo}</span> BPM
          </div>
          <div class="hero-meta-item">
            <span class="emoji">🎵</span>
            <span class="value">${o.signatureNumerator}/${o.signatureDenominator}</span>
          </div>
          <div class="hero-meta-item">
            <span class="emoji">🎹</span>
            <span class="value">${scaleDisplay}</span>
          </div>
          <div class="hero-meta-item">
            <span class="emoji">📊</span>
            <span class="value">${o.trackCount}</span> tracks
          </div>
          <div class="hero-meta-item">
            <span class="emoji">🎞️</span>
            <span class="value">${o.totalClipCount}</span> clips
          </div>
          <div class="hero-meta-item">
            <span class="emoji">🔌</span>
            <span class="value">${o.totalDeviceCount}</span> devices
          </div>
        </div>
        <p style="margin-top:20px; font-family:var(--mono); font-size:12px; color:var(--paper-faint);">
          Generated on ${data.generatedDate}
        </p>
      </div>
    </div>
  </header>`;
}

const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

function renderStats(data: ProjectSnapshot): string {
  const o = data.overview;
  const stats = [
    { num: o.tempo, label: "Tempo (BPM)", color: "var(--flame)" },
    { num: o.audioTrackCount, label: "Audio Tracks", color: "var(--teal)" },
    { num: o.midiTrackCount, label: "MIDI Tracks", color: "var(--teal)" },
    { num: o.totalClipCount, label: "Total Clips", color: "var(--paper)" },
    { num: o.totalDeviceCount, label: "Devices", color: "var(--flame-2)" },
    { num: o.sceneCount, label: "Scenes", color: "var(--teal-dim)" },
    { num: o.cuePointCount, label: "Cue Points", color: "var(--paper-dim)" },
    { num: `${o.signatureNumerator}/${o.signatureDenominator}`, label: "Time Sig", color: "var(--flame)" },
  ];

  return `  <section class="section">
    <div class="wrap">
      <p class="eyebrow eyebrow-dot" style="margin-bottom:32px;">📊 Quick Stats</p>
      <div class="stats-grid">
        ${stats.map(s => `
        <div class="stat-card">
          <div class="stat-num" style="color:${s.color};">${s.num}</div>
          <div class="stat-label">${s.label}</div>
        </div>`).join("")}
      </div>
    </div>
  </section>`;
}

function renderTracks(data: ProjectSnapshot): string {
  if (data.tracks.length === 0) return "";
  return `  <section id="tracks" class="section">
    <div class="wrap">
      <p class="eyebrow eyebrow-dot" style="margin-bottom:16px;">🎵 Tracks</p>
      <h2>Your <span class="teal">Tracks</span></h2>
      <div class="track-list">
        ${data.tracks.map(t => renderTrackCard(t)).join("")}
      </div>
    </div>
  </section>`;
}

function renderTrackCard(track: SnapshotTrack): string {
  const emoji = getTrackTypeEmoji(track.type);
  const typeName = getTrackTypeName(track.type);
  const badges: string[] = [];
  if (track.arm) badges.push(`<span class="badge badge-arm">🔴 ARM</span>`);
  if (track.mute) badges.push(`<span class="badge badge-mute">🔇 MUTE</span>`);
  if (track.solo) badges.push(`<span class="badge badge-solo">🎧 SOLO</span>`);
  badges.push(`<span class="badge badge-teal">${track.clipCount} clip${track.clipCount !== 1 ? "s" : ""}</span>`);
  badges.push(`<span class="badge badge-paper">${track.deviceCount} device${track.deviceCount !== 1 ? "s" : ""}</span>`);
  if (track.hasGroupTrack && track.groupTrackName) {
    badges.push(`<span class="badge badge-flame">📁 ${track.groupTrackName}</span>`);
  }

  return `        <div class="track-card">
          <div class="track-icon">${emoji}</div>
          <div class="track-info">
            <div class="track-name">${esc(track.name)}</div>
            <div class="track-sub">${typeName}</div>
          </div>
          <div class="track-badges">${badges.join("")}</div>
        </div>`;
}

function renderClips(data: ProjectSnapshot): string {
  const tracksWithClips = data.tracks.filter(t => t.clips.length > 0);
  if (tracksWithClips.length === 0) return "";

  return `  <section id="clips" class="section">
    <div class="wrap">
      <p class="eyebrow eyebrow-dot" style="margin-bottom:16px;">🎹 Clips</p>
      <h2>Clip <span class="teal">Details</span></h2>
      ${tracksWithClips.map(t => renderClipGroup(t)).join("")}
    </div>
  </section>`;
}

function renderClipGroup(track: SnapshotTrack): string {
  return `      <div class="clip-group">
        <div class="clip-group-title">${getTrackTypeEmoji(track.type)} ${esc(track.name)}</div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Warp Mode</th>
                <th>Loop</th>
                <th>Range</th>
              </tr>
            </thead>
            <tbody>
              ${track.clips.map(c => renderClipRow(c)).join("")}
            </tbody>
          </table>
        </div>
      </div>`;
}

function renderClipRow(clip: SnapshotClip): string {
  const typeEmoji = clip.type === "audio" ? "🎙️" : "🎹";
  const loopText = clip.isLooping !== null ? (clip.isLooping ? "🔁 On" : "➡️ Off") : "—";
  const rangeText = clip.startMarker !== null && clip.endMarker !== null
    ? `${clip.startMarker} → ${clip.endMarker}`
    : "—";
  const warpText = clip.warpMode ?? (clip.type === "midi" ? "N/A" : "—");
  const midiExtra = clip.midiInfo && clip.midiInfo.noteCount > 0
    ? ` | 🎵 ${clip.midiInfo.noteCount} notes (${midiNoteToName(clip.midiInfo.lowestNote)}–${midiNoteToName(clip.midiInfo.highestNote)})`
    : "";

  return `              <tr>
                <td style="color:var(--paper);">${esc(clip.name)}</td>
                <td>${typeEmoji} ${clip.type.toUpperCase()}</td>
                <td>${warpText}</td>
                <td>${loopText}</td>
                <td>${rangeText}${midiExtra}</td>
              </tr>`;
}

function renderDevices(data: ProjectSnapshot): string {
  const tracksWithDevices = data.tracks.filter(t => t.devices.length > 0);
  if (tracksWithDevices.length === 0) return "";

  return `  <section id="devices" class="section">
    <div class="wrap">
      <p class="eyebrow eyebrow-dot" style="margin-bottom:16px;">🔌 Devices</p>
      <h2>Devices & <span class="teal">Parameters</span></h2>
      ${tracksWithDevices.map(t => renderDeviceGroup(t)).join("")}
    </div>
  </section>`;
}

function renderDeviceGroup(track: SnapshotTrack): string {
  return `      <div class="device-group">
        <div class="device-group-title">${getTrackTypeEmoji(track.type)} ${esc(track.name)}</div>
        ${track.devices.map(d => renderDeviceAccordion(d)).join("")}
      </div>`;
}

function renderDeviceAccordion(device: SnapshotDevice): string {
  const typeEmoji: Record<string, string> = {
    device: "🔌", rack: "🎛️", simpler: "🎵", drumRack: "🥁",
  };
  const emoji = typeEmoji[device.type] ?? "🔌";
  const tagEmoji: Record<string, string> = {
    device: "Device", rack: "Rack", simpler: "Simpler", drumRack: "Drum Rack",
  };
  const tag = tagEmoji[device.type] ?? device.className;

  const chainInfo = device.chains.length > 0
    ? `<div style="margin-top:12px; padding-top:12px; border-top:1px solid var(--line);">
        <span class="mono" style="font-size:11px; color:var(--paper-mute);">CHAINS:</span>
        ${device.chains.map(c => `<span class="badge badge-teal" style="margin-left:6px;">${esc(c.name)}</span>`).join("")}
      </div>`
    : "";

  return `        <div class="device-accordion">
          <div class="device-header">
            <div class="device-header-left">
              <span class="device-type-icon">${emoji}</span>
              <span class="device-name">${esc(device.name)}</span>
              <span class="device-tag">${tag}</span>
              <span class="mono" style="font-size:11px; color:var(--paper-faint);">${device.parameters.length} params</span>
            </div>
            <span class="device-chevron">▼</span>
          </div>
          <div class="device-body">
            <div class="device-params">
              ${device.parameters.slice(0, 30).map(p => renderParam(p)).join("")}
              ${device.parameters.length > 30 ? `<div class="mono" style="font-size:11px;color:var(--paper-faint);">... and ${device.parameters.length - 30} more parameters</div>` : ""}
              ${chainInfo}
            </div>
          </div>
        </div>`;
}

function renderParam(param: SnapshotParameter): string {
  const range = param.maxValue - param.minValue;
  const pct = range > 0 ? Math.round(((param.value - param.minValue) / range) * 100) : 0;
  const displayValue = param.isQuantized && param.valueItems.length > 0
    ? param.valueItems[param.value] ?? param.value
    : typeof param.value === "number" ? param.value.toFixed(2) : param.value;

  return `              <div class="param-row">
                <div class="param-name" title="${esc(param.name)}">${esc(param.name)}</div>
                <div class="param-bar-track"><div class="param-bar-fill" style="width:${pct}%"></div></div>
                <div class="param-value">${displayValue}</div>
              </div>`;
}

function renderScenes(data: ProjectSnapshot): string {
  if (data.scenes.length === 0 && data.cuePoints.length === 0) return "";

  return `  <section id="scenes" class="section">
    <div class="wrap">
      ${data.scenes.length > 0 ? `
      <p class="eyebrow eyebrow-dot" style="margin-bottom:16px;">🎬 Scenes & Cue Points</p>
      <h2>Scenes & <span class="teal">Markers</span></h2>
      <div class="scene-list">
        ${data.scenes.map((s, i) => `
        <div class="scene-card">
          <div class="scene-num">SCENE ${i + 1}</div>
          <div class="scene-name">${esc(s.name)}</div>
        </div>`).join("")}
      </div>
      ` : ""}
      ${data.cuePoints.length > 0 ? `
      <div style="margin-top:32px;">
        <p class="eyebrow eyebrow-dot" style="margin-bottom:16px;">📍 Cue Points</p>
        <div class="scene-list">
          ${data.cuePoints.map((cp, i) => `
          <div class="scene-card">
            <div class="scene-num">CUE ${i + 1}</div>
            <div class="scene-name">📍 ${esc(cp.name)}</div>
          </div>`).join("")}
        </div>
      </div>
      ` : ""}
    </div>
  </section>`;
}

function renderNotes(): string {
  return `  <section id="notes" class="section">
    <div class="wrap">
      <p class="eyebrow eyebrow-dot" style="margin-bottom:16px;">📝 Notes</p>
      <h2>Your <span class="teal">Notes</span></h2>
      <p style="color:var(--paper-dim); font-size:14px; margin-bottom:16px;">
        Write down where you left off, what's working, what needs work, or any ideas for next session.
      </p>
      <textarea id="project-notes" class="notes-area" placeholder="e.g. 'The bass line in Track 3 needs variation. Try adding a filter sweep on the drop. The pad sounds great — keep that. Need to finish the arrangement...'"></textarea>
      <div class="notes-hint">💾 Notes are saved locally in your browser and will persist between sessions.</div>
    </div>
  </section>`;
}

function renderSuggestions(data: ProjectSnapshot): string {
  if (data.suggestions.length === 0) return "";
  return `  <section id="suggestions" class="section">
    <div class="wrap">
      <p class="eyebrow eyebrow-dot" style="margin-bottom:16px;">💡 Next Steps</p>
      <h2>Suggested <span class="teal">Next Steps</span></h2>
      <div class="suggestion-list">
        ${data.suggestions.map(s => `
        <div class="suggestion-card s-${s.type}">
          <div class="suggestion-icon">${s.icon}</div>
          <div class="suggestion-text">${esc(s.text)}</div>
        </div>`).join("")}
      </div>
    </div>
  </section>`;
}

function renderFooter(data: ProjectSnapshot): string {
  return `  <footer class="footer">
    <div class="wrap">
      <hr class="divider-glow">
      <div class="brand">📸 Project Snapshot</div>
      <div>Created by <a href="https://www.douglasfugazi.co" target="_blank" rel="noopener">Douglas Fugazi</a></div>
      <div class="sub">
        An Ableton Live Extension · Generated on ${data.generatedDate}
      </div>
    </div>
  </footer>`;
}

// ── Helper ──

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
