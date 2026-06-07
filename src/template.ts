// ──────────────────────────────────────────────
// Project Snapshot — Redesigned Template v2
// Teal Green Dashboard · High Contrast · Accessible
// ══════════════════════════════════════

import type { ProjectSnapshot, SnapshotTrack, SnapshotClip, SnapshotDevice, SnapshotParameter } from "./types.js";
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
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Mono:wght@300;400;500&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
  <style>
${CSS}
  </style>
</head>
<body>
  <div class="app">
    ${renderSidebar(data)}
    <main class="main">
      ${renderHeader(data)}
      <div class="panel active" id="panel-overview">${renderOverview(data)}</div>
      <div class="panel" id="panel-tracks">${renderTracksPanel(data)}</div>
      <div class="panel" id="panel-clips">${renderClipsPanel(data)}</div>
      <div class="panel" id="panel-devices">${renderDevicesPanel(data)}</div>
      <div class="panel" id="panel-scenes">${renderScenesPanel(data)}</div>
      <div class="panel" id="panel-notes">${renderNotesPanel()}</div>
      <div class="panel" id="panel-insights">${renderInsightsPanel(data)}</div>
    </main>
  </div>
<script>
${JS}
</script>
</body>
</html>`;
}

// ══════════════════════════════════════
// CSS — Teal Green Dashboard · High Contrast
// ══════════════════════════════════════

const CSS = `
:root {
  /* ── Teal Green Palette ── */
  --bg-0: #0a2028;
  --bg-1: #0e2a34;
  --bg-2: #13343b;
  --bg-3: #184248;
  --bg-4: #1e5258;
  --fg:       #f0fffe;
  --fg-2:     #d3f7ff;
  --fg-3:     #a0e0e8;
  --fg-4:     #6abac4;
  --fg-5:     #3a8a96;
  --accent:   #3ef0e0;
  --accent-2: #60f5d0;
  --accent-bg:rgba(62,240,224,0.08);
  --accent-g: rgba(62,240,224,0.25);
  --hot:      #ff8f5c;
  --hot-2:    #ffb347;
  --hot-bg:   rgba(255,143,92,0.08);
  --hot-g:    rgba(255,143,92,0.20);
  --green:    #52f0a0;
  --red:      #ff6b7a;
  --yellow:   #ffe066;
  --line:     rgba(160,224,232,0.12);
  --line-2:   rgba(160,224,232,0.22);
  --radius:   10px;
  --radius-lg:16px;
  --sans:     'DM Sans', system-ui, -apple-system, sans-serif;
  --mono:     'DM Mono', ui-monospace, 'Cascadia Code', monospace;
  --display:  'Playfair Display', Georgia, serif;
  --sidebar-w: 240px;
}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
html{background:var(--bg-0);scroll-behavior:smooth;}
body{font-family:var(--sans);color:var(--fg);background:var(--bg-0);-webkit-font-smoothing:antialiased;line-height:1.6;overflow:hidden;height:100vh;}
a{color:inherit;text-decoration:none;}
button{font:inherit;color:inherit;background:none;border:none;cursor:pointer;}
::-webkit-scrollbar{width:6px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--fg-5);border-radius:3px;}
::-webkit-scrollbar-thumb:hover{background:var(--fg-4);}

/* ── APP LAYOUT ── */
.app{display:flex;height:100vh;overflow:hidden;}

/* ── SIDEBAR ── */
.sidebar{
  width:var(--sidebar-w);min-width:var(--sidebar-w);
  background:var(--bg-1);border-right:1px solid var(--line);
  display:flex;flex-direction:column;padding:0;
  overflow-y:auto;
}
.sidebar-brand{
  padding:24px 20px 18px;display:flex;align-items:center;gap:12px;
  border-bottom:1px solid var(--line);
}
.sidebar-brand-icon{font-size:26px;}
.sidebar-brand-text{font-weight:700;font-size:17px;color:var(--fg);}
.sidebar-brand-ver{font-family:var(--mono);font-size:11px;color:var(--fg-4);margin-top:2px;}

.sidebar-nav{padding:14px 12px;flex:1;}
.nav-item{
  display:flex;align-items:center;gap:12px;
  padding:11px 14px;border-radius:8px;
  font-size:15px;font-weight:500;color:var(--fg-3);
  transition:all 0.15s;cursor:pointer;margin-bottom:3px;
}
.nav-item:hover{color:var(--fg);background:rgba(160,224,232,0.06);}
.nav-item.active{color:var(--accent);background:var(--accent-bg);font-weight:600;}
.nav-icon{font-size:17px;width:24px;text-align:center;}

.sidebar-footer{
  padding:18px 20px;border-top:1px solid var(--line);
  font-family:var(--mono);font-size:11px;color:var(--fg-4);
  line-height:1.7;
}
.sidebar-footer a{color:var(--accent);}

/* ── MAIN ── */
.main{flex:1;overflow-y:auto;padding:0;position:relative;}
.panel{display:none;padding:32px 36px 56px;animation:fadeIn 0.25s ease;}
.panel.active{display:block;}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}

/* ── HEADER BAR ── */
.header-bar{
  padding:18px 36px;border-bottom:1px solid var(--line);
  display:flex;align-items:center;justify-content:space-between;
  background:rgba(10,32,40,0.85);backdrop-filter:blur(12px);
  position:sticky;top:0;z-index:10;
}
.header-left{display:flex;align-items:center;gap:16px;}
.header-title{font-weight:700;font-size:18px;color:var(--fg);}
.header-badge{
  font-family:var(--mono);font-size:12px;
  padding:4px 12px;border-radius:99px;
  background:var(--accent-bg);color:var(--accent);
  border:1px solid rgba(62,240,224,0.15);
}
.header-right{display:flex;align-items:center;gap:12px;}
.btn-scroll{
  font-size:13px;padding:6px 16px;border-radius:99px;
  background:rgba(160,224,232,0.08);color:var(--fg-3);border:1px solid var(--line);
  transition:all 0.15s;
}
.btn-scroll:hover{background:rgba(160,224,232,0.14);color:var(--fg);}

/* ── SECTION TITLES ── */
.section-head{
  display:flex;align-items:center;gap:12px;margin-bottom:24px;
}
.section-eyebrow{
  font-family:var(--mono);font-size:12px;letter-spacing:0.18em;
  text-transform:uppercase;color:var(--fg-4);
}
.section-title{
  font-family:var(--display);font-weight:700;font-size:30px;color:var(--fg);
  letter-spacing:-0.01em;
}
.section-title .a{color:var(--accent);}

/* ── STAT CARDS ── */
.stats-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px;margin-bottom:32px;}
.stat{
  background:var(--bg-2);border:1px solid var(--line);
  border-radius:var(--radius);padding:18px 16px;
  transition:border-color 0.2s,box-shadow 0.2s;
}
.stat:hover{border-color:var(--accent);box-shadow:0 0 16px var(--accent-bg);}
.stat-val{font-weight:800;font-size:34px;line-height:1;margin-bottom:6px;}
.stat-val.accent{color:var(--accent);}
.stat-val.hot{color:var(--hot);}
.stat-val.fg{color:var(--fg);}
.stat-val.green{color:var(--green);}
.stat-lbl{font-family:var(--mono);font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--fg-3);}

/* ── META CHIPS ── */
.meta-row{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:28px;}
.chip{
  display:flex;align-items:center;gap:7px;
  font-size:14px;color:var(--fg-3);
  padding:7px 14px;border-radius:8px;
  background:var(--bg-2);border:1px solid var(--line);
}
.chip .v{color:var(--fg);font-weight:600;}
.chip .e{font-size:16px;}

/* ── TRACK LIST ── */
.track-grid{display:flex;flex-direction:column;gap:8px;}
.track-row{
  display:grid;grid-template-columns:44px 1fr auto auto auto;gap:12px;align-items:center;
  padding:14px 18px;border-radius:var(--radius);
  background:var(--bg-2);border:1px solid var(--line);
  transition:border-color 0.15s,transform 0.1s;
}
.track-row:hover{border-color:var(--accent);transform:translateX(3px);}
.track-ico{font-size:24px;text-align:center;}
.track-name{font-weight:600;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.track-sub{font-family:var(--mono);font-size:12px;color:var(--fg-4);}
.track-stats{display:flex;gap:10px;}
.track-stat{font-family:var(--mono);font-size:12px;color:var(--fg-3);white-space:nowrap;}
.track-stat .n{color:var(--fg);font-weight:500;}
.track-badges{display:flex;gap:6px;}
.badge{font-family:var(--mono);font-size:11px;padding:3px 8px;border-radius:4px;letter-spacing:0.04em;}
.badge-arm{color:var(--red);background:rgba(255,107,122,0.10);border:1px solid rgba(255,107,122,0.20);}
.badge-mute{color:var(--fg-4);background:rgba(160,224,232,0.06);border:1px solid var(--line);}
.badge-solo{color:var(--yellow);background:rgba(255,224,102,0.10);border:1px solid rgba(255,224,102,0.20);}

/* ── CLIPS TABLE ── */
.clip-section{margin-bottom:24px;}
.clip-track-name{font-weight:600;font-size:16px;margin-bottom:10px;display:flex;align-items:center;gap:8px;color:var(--fg);}
.table-wrap{border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;}
table{width:100%;border-collapse:collapse;font-size:14px;}
thead{background:var(--bg-2);}
th{font-family:var(--mono);font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--fg-3);text-align:left;padding:12px 16px;border-bottom:1px solid var(--line);}
td{padding:10px 16px;border-bottom:1px solid var(--line);color:var(--fg-2);}
tr:last-child td{border-bottom:none;}
tbody tr{transition:background 0.1s;}
tbody tr:hover{background:var(--bg-2);}

/* ── DEVICE RACK ── */
.dev-group{margin-bottom:20px;}
.dev-group-name{font-weight:600;font-size:16px;margin-bottom:10px;display:flex;align-items:center;gap:8px;color:var(--fg);}
.dev-rack{border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;margin-bottom:8px;}
.dev-header{
  padding:12px 18px;display:flex;align-items:center;justify-content:space-between;
  cursor:pointer;background:var(--bg-2);transition:background 0.15s;
}
.dev-header:hover{background:var(--bg-3);}
.dev-h-left{display:flex;align-items:center;gap:12px;}
.dev-emoji{font-size:18px;}
.dev-name{font-weight:600;font-size:15px;}
.dev-type{font-family:var(--mono);font-size:11px;padding:3px 9px;border-radius:5px;background:var(--accent-bg);color:var(--accent);border:1px solid rgba(62,240,224,0.12);}
.dev-count{font-family:var(--mono);font-size:11px;color:var(--fg-4);}
.dev-chevron{color:var(--fg-4);transition:transform 0.2s;font-size:13px;}
.dev-rack.open .dev-chevron{transform:rotate(180deg);}
.dev-body{max-height:0;overflow:hidden;transition:max-height 0.3s ease-out;background:var(--bg-1);}
.dev-rack.open .dev-body{max-height:5000px;}

/* Switches row */
.dev-switches{display:flex;flex-wrap:wrap;gap:5px;padding:12px 16px;border-bottom:1px solid var(--line);}
.sw{display:flex;align-items:center;gap:6px;font-family:var(--mono);font-size:11px;padding:4px 10px;border-radius:5px;}
.sw-on{background:rgba(82,240,160,0.10);color:var(--green);}
.sw-off{background:rgba(160,224,232,0.06);color:var(--fg-4);}
.sw-other{background:var(--hot-bg);color:var(--hot);}
.sw-dot{width:6px;height:6px;border-radius:50%;}
.sw-on .sw-dot{background:var(--green);box-shadow:0 0 6px var(--green);}
.sw-off .sw-dot{background:var(--fg-4);}
.sw-other .sw-dot{background:var(--hot);}

/* Knob grid */
.dev-knobs{display:flex;flex-wrap:wrap;gap:4px;padding:14px 12px;}
.knob{
  width:72px;text-align:center;padding:8px 4px 6px;border-radius:8px;
  transition:background 0.15s;
}
.knob:hover{background:rgba(160,224,232,0.04);}
.knob-ring-wrap{position:relative;width:36px;height:36px;margin:0 auto 5px;}
.knob-ring{
  position:absolute;top:2px;left:2px;right:2px;bottom:2px;
  border-radius:50%;border:1.5px solid var(--line-2);
  background:radial-gradient(circle at 40% 35%,var(--bg-4),var(--bg-2));
  box-shadow:inset 0 2px 6px rgba(0,0,0,0.5);
}
.knob-needle{
  position:absolute;top:4px;left:50%;width:2px;height:12px;
  margin-left:-1px;transform-origin:bottom center;
  background:linear-gradient(to top,var(--accent),var(--hot));
  border-radius:1px;
}
.knob-lbl{font-family:var(--mono);font-size:9px;color:var(--fg-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.knob-val{font-family:var(--mono);font-size:10px;color:var(--fg-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}

/* Chains */
.dev-chains{padding:10px 16px;border-top:1px solid var(--line);display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
.chain-lbl{font-family:var(--mono);font-size:10px;letter-spacing:0.12em;color:var(--fg-4);}
.chain-badge{font-family:var(--mono);font-size:10px;padding:3px 9px;border-radius:5px;background:var(--accent-bg);color:var(--accent);border:1px solid rgba(62,240,224,0.12);}

/* ── SCENES ── */
.scene-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;}
.scene-card{
  padding:14px 16px;border-radius:var(--radius);
  background:var(--bg-2);border:1px solid var(--line);
  transition:border-color 0.15s;
}
.scene-card:hover{border-color:var(--accent);}
.scene-num{font-family:var(--mono);font-size:11px;color:var(--fg-4);margin-bottom:3px;}
.scene-name{font-weight:600;font-size:15px;color:var(--fg);}

/* ── NOTES ── */
.notes-box{
  width:100%;min-height:200px;padding:18px;
  font-family:var(--sans);font-size:16px;color:var(--fg);
  background:var(--bg-2);border:1px solid var(--line-2);
  border-radius:var(--radius);outline:none;resize:vertical;
  line-height:1.7;transition:border-color 0.2s,box-shadow 0.2s;
}
.notes-box::placeholder{color:var(--fg-4);}
.notes-box:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-bg);}
.notes-hint{font-family:var(--mono);font-size:11px;color:var(--fg-4);margin-top:8px;}

/* ── INSIGHTS ── */
.insight-list{display:flex;flex-direction:column;gap:10px;}
.insight{
  padding:14px 18px;border-radius:var(--radius);
  border-left:3px solid;display:flex;gap:12px;align-items:flex-start;
}
.insight.tip{background:var(--accent-bg);border-color:var(--accent);}
.insight.warn{background:var(--hot-bg);border-color:var(--hot);}
.insight.info{background:rgba(160,224,232,0.04);border-color:var(--fg-4);}
.insight-icon{font-size:22px;flex-shrink:0;}
.insight-text{font-size:15px;color:var(--fg-2);line-height:1.6;}

/* ── FOOTER ── */
.report-footer{
  text-align:center;padding:36px 0 18px;
  border-top:1px solid var(--line);margin-top:36px;
  font-family:var(--mono);font-size:12px;color:var(--fg-4);
}
.report-footer a{color:var(--accent);transition:color 0.15s;}
.report-footer a:hover{color:var(--fg);}
.report-footer .name{font-family:var(--sans);font-weight:600;font-size:14px;color:var(--fg-2);margin-bottom:5px;}

/* ── RESPONSIVE ── */
@media(max-width:900px){
  .sidebar{display:none;}
  .panel{padding:24px 18px 44px;}
  .track-row{grid-template-columns:36px 1fr auto;}
  .track-stats,.track-badges{display:none;}
  .stats-row{grid-template-columns:repeat(2,1fr);}
}
`;

// ══════════════════════════════════════
// JS
// ══════════════════════════════════════

const JS = `
  // Navigation
  const navItems = document.querySelectorAll('.nav-item');
  const panels = document.querySelectorAll('.panel');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.dataset.panel;
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      panels.forEach(p => p.classList.remove('active'));
      document.getElementById('panel-' + target).classList.add('active');
    });
  });

  // Device accordion
  document.querySelectorAll('.dev-header').forEach(h => {
    h.addEventListener('click', () => h.parentElement.classList.toggle('open'));
  });

  // Notes localStorage
  const notes = document.getElementById('project-notes');
  if(notes){
    const s = localStorage.getItem('ps-notes');
    if(s) notes.value = s;
    notes.addEventListener('input', () => localStorage.setItem('ps-notes', notes.value));
  }
`;

// ══════════════════════════════════════
// RENDER SECTIONS
// ══════════════════════════════════════

function renderSidebar(data: ProjectSnapshot): string {
  const o = data.overview;
  return `<aside class="sidebar">
    <div class="sidebar-brand">
      <span class="sidebar-brand-icon">📸</span>
      <div>
        <div class="sidebar-brand-text">Snapshot</div>
        <div class="sidebar-brand-ver">${o.tempo} BPM · ${o.trackCount} tracks</div>
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-item active" data-panel="overview"><span class="nav-icon">🎯</span> Overview</div>
      <div class="nav-item" data-panel="tracks"><span class="nav-icon">🎵</span> Tracks <span style="margin-left:auto;font-family:var(--mono);font-size:12px;color:var(--fg-4)">${o.trackCount}</span></div>
      <div class="nav-item" data-panel="clips"><span class="nav-icon">🎹</span> Clips <span style="margin-left:auto;font-family:var(--mono);font-size:12px;color:var(--fg-4)">${o.totalClipCount}</span></div>
      <div class="nav-item" data-panel="devices"><span class="nav-icon">🔌</span> Devices <span style="margin-left:auto;font-family:var(--mono);font-size:12px;color:var(--fg-4)">${o.totalDeviceCount}</span></div>
      <div class="nav-item" data-panel="scenes"><span class="nav-icon">🎬</span> Scenes <span style="margin-left:auto;font-family:var(--mono);font-size:12px;color:var(--fg-4)">${o.sceneCount}</span></div>
      <div class="nav-item" data-panel="notes"><span class="nav-icon">📝</span> Notes</div>
      <div class="nav-item" data-panel="insights"><span class="nav-icon">💡</span> Insights <span style="margin-left:auto;font-family:var(--mono);font-size:12px;color:var(--fg-4)">${data.suggestions.length}</span></div>
    </nav>
    <div class="sidebar-footer">
      <div style="color:var(--fg-3);margin-bottom:4px;">Created by <a href="https://www.douglasfugazi.co" target="_blank">Douglas Fugazi</a></div>
      ${data.generatedDate}
    </div>
  </aside>`;
}

function renderHeader(data: ProjectSnapshot): string {
  const o = data.overview;
  return `<div class="header-bar">
    <div class="header-left">
      <span class="header-title">📸 Project Snapshot</span>
      <span class="header-badge">${o.tempo} BPM</span>
      <span class="header-badge">${o.signatureNumerator}/${o.signatureDenominator}</span>
    </div>
    <div class="header-right">
      <button class="btn-scroll" onclick="window.print()">🖨️ Print</button>
    </div>
  </div>`;
}

function renderOverview(data: ProjectSnapshot): string {
  const o = data.overview;
  const scaleDisplay = o.scaleName && o.scaleName !== "None"
    ? `${NOTE_NAMES[o.rootNote]} ${o.scaleName}` : "No scale set";

  return `<div class="section-head">
    <span class="section-eyebrow">PROJECT OVERVIEW</span>
  </div>

  <div class="stats-row">
    <div class="stat"><div class="stat-val hot">${o.tempo}</div><div class="stat-lbl">BPM</div></div>
    <div class="stat"><div class="stat-val accent">${o.audioTrackCount}</div><div class="stat-lbl">Audio Tracks</div></div>
    <div class="stat"><div class="stat-val accent">${o.midiTrackCount}</div><div class="stat-lbl">MIDI Tracks</div></div>
    <div class="stat"><div class="stat-val fg">${o.totalClipCount}</div><div class="stat-lbl">Total Clips</div></div>
    <div class="stat"><div class="stat-val hot">${o.totalDeviceCount}</div><div class="stat-lbl">Devices</div></div>
    <div class="stat"><div class="stat-val accent">${o.sceneCount}</div><div class="stat-lbl">Scenes</div></div>
    <div class="stat"><div class="stat-val fg">${o.cuePointCount}</div><div class="stat-lbl">Cue Points</div></div>
    <div class="stat"><div class="stat-val green">${o.signatureNumerator}/${o.signatureDenominator}</div><div class="stat-lbl">Time Sig</div></div>
  </div>

  <div class="meta-row">
    <div class="chip"><span class="e">🎵</span> <span class="v">${scaleDisplay}</span></div>
    <div class="chip"><span class="e">⏱️</span> ${o.tempo} BPM</div>
    <div class="chip"><span class="e">🎹</span> <span class="v">${o.midiTrackCount}</span> MIDI</div>
    <div class="chip"><span class="e">🎙️</span> <span class="v">${o.audioTrackCount}</span> Audio</div>
    <div class="chip"><span class="e">🎬</span> <span class="v">${o.sceneCount}</span> scenes</div>
  </div>

  <p style="font-size:15px;color:var(--fg-3);max-width:640px;margin-top:18px;line-height:1.7;">
    This snapshot was generated on <strong style="color:var(--fg)">${data.generatedDate}</strong>.
    Navigate using the sidebar to explore tracks, clips, devices, scenes, and personalized insights for your project.
  </p>`;
}

function renderTracksPanel(data: ProjectSnapshot): string {
  return `<div class="section-head">
    <span class="section-eyebrow">TRACKS</span>
    <span class="section-title">Your <span class="a">Tracks</span></span>
  </div>
  <div class="track-grid">
    ${data.tracks.map(t => renderTrackRow(t)).join("")}
  </div>`;
}

function renderTrackRow(t: SnapshotTrack): string {
  const emoji = getTrackTypeEmoji(t.type);
  const typeName = getTrackTypeName(t.type);
  const badges: string[] = [];
  if (t.arm) badges.push(`<span class="badge badge-arm">🔴 ARM</span>`);
  if (t.mute) badges.push(`<span class="badge badge-mute">🔇 MUTE</span>`);
  if (t.solo) badges.push(`<span class="badge badge-solo">🎧 SOLO</span>`);

  return `<div class="track-row">
    <div class="track-ico">${emoji}</div>
    <div>
      <div class="track-name">${esc(t.name)}</div>
      <div class="track-sub">${typeName}</div>
    </div>
    <div class="track-stats">
      <span class="track-stat">🎹 <span class="n">${t.clipCount}</span></span>
      <span class="track-stat">🔌 <span class="n">${t.deviceCount}</span></span>
    </div>
    <div class="track-badges">${badges.join("")}</div>
  </div>`;
}

function renderClipsPanel(data: ProjectSnapshot): string {
  const tracksWithClips = data.tracks.filter(t => t.clips.length > 0);
  return `<div class="section-head">
    <span class="section-eyebrow">CLIPS</span>
    <span class="section-title">Clip <span class="a">Details</span></span>
  </div>
  ${tracksWithClips.map(t => renderClipSection(t)).join("")}`;
}

function renderClipSection(track: SnapshotTrack): string {
  return `<div class="clip-section">
    <div class="clip-track-name">${getTrackTypeEmoji(track.type)} ${esc(track.name)}</div>
    <div class="table-wrap"><table>
      <thead><tr><th>Name</th><th>Type</th><th>Warp</th><th>Loop</th><th>MIDI</th></tr></thead>
      <tbody>${track.clips.map(c => renderClipRow(c)).join("")}</tbody>
    </table></div>
  </div>`;
}

function renderClipRow(c: SnapshotClip): string {
  const typeE = c.type === "audio" ? "🎙️" : "🎹";
  const loop = c.isLooping !== null ? (c.isLooping ? "🔁" : "➡️") : "—";
  const warp = c.warpMode ?? (c.type === "midi" ? "—" : "—");
  const midi = c.midiInfo && c.midiInfo.noteCount > 0
    ? `${c.midiInfo.noteCount} notes (${midiNoteToName(c.midiInfo.lowestNote)}–${midiNoteToName(c.midiInfo.highestNote)})`
    : "—";
  return `<tr>
    <td style="color:var(--fg)">${esc(c.name)}</td>
    <td>${typeE} ${c.type.toUpperCase()}</td>
    <td>${warp}</td><td>${loop}</td><td>${midi}</td>
  </tr>`;
}

function renderDevicesPanel(data: ProjectSnapshot): string {
  const tracksWithDevices = data.tracks.filter(t => t.devices.length > 0);
  return `<div class="section-head">
    <span class="section-eyebrow">DEVICES</span>
    <span class="section-title">Devices & <span class="a">Parameters</span></span>
  </div>
  ${tracksWithDevices.map(t => renderDevGroup(t)).join("")}`;
}

function renderDevGroup(track: SnapshotTrack): string {
  return `<div class="dev-group">
    <div class="dev-group-name">${getTrackTypeEmoji(track.type)} ${esc(track.name)}</div>
    ${track.devices.map(d => renderDevRack(d)).join("")}
  </div>`;
}

function renderDevRack(device: SnapshotDevice): string {
  const emojiMap: Record<string,string> = {device:"🔌",rack:"🎛️",simpler:"🎵",drumRack:"🥁"};
  const tagMap: Record<string,string> = {device:"Device",rack:"Rack",simpler:"Simpler",drumRack:"Drum Rack"};
  const emoji = emojiMap[device.type] ?? "🔌";
  const tag = tagMap[device.type] ?? device.className;

  const knobs: SnapshotParameter[] = [];
  const switches: SnapshotParameter[] = [];
  for (const p of device.parameters) {
    if (p.isQuantized && p.valueItems.length <= 2) switches.push(p);
    else knobs.push(p);
  }

  const chainsHtml = device.chains.length > 0
    ? `<div class="dev-chains"><span class="chain-lbl">CHAINS</span>${device.chains.map(c => `<span class="chain-badge">${esc(c.name)}</span>`).join("")}</div>`
    : "";

  return `<div class="dev-rack">
    <div class="dev-header">
      <div class="dev-h-left">
        <span class="dev-emoji">${emoji}</span>
        <span class="dev-name">${esc(device.name)}</span>
        <span class="dev-type">${tag}</span>
        <span class="dev-count">${device.parameters.length} params</span>
      </div>
      <span class="dev-chevron">▼</span>
    </div>
    <div class="dev-body">
      ${switches.length > 0 ? `<div class="dev-switches">${switches.map(p => renderSwitch(p)).join("")}</div>` : ""}
      <div class="dev-knobs">
        ${knobs.slice(0, 40).map(p => renderKnob(p)).join("")}
        ${knobs.length > 40 ? `<div style="font-family:var(--mono);font-size:11px;color:var(--fg-4);padding:10px;">+${knobs.length - 40} more</div>` : ""}
      </div>
      ${chainsHtml}
    </div>
  </div>`;
}

function getParamInfo(param: SnapshotParameter): { display: string; pct: number } {
  const numValue = typeof param.value === "number" ? param.value : 0;
  const numMin = typeof param.minValue === "number" ? param.minValue : 0;
  const numMax = typeof param.maxValue === "number" ? param.maxValue : 1;
  const range = numMax - numMin;
  const pct = range > 0 ? Math.round(((numValue - numMin) / range) * 100) : 0;

  let display: string;
  if (param.isQuantized && param.valueItems.length > 0) {
    const idx = Math.max(0, Math.min(param.valueItems.length - 1, Math.round(numValue)));
    const item = param.valueItems[idx];
    display = (item && item !== "" && item !== "undefined") ? item
      : (numValue % 1 === 0 ? String(numValue) : numValue.toFixed(2));
  } else if (typeof param.value === "number") {
    display = param.value % 1 === 0 ? String(param.value) : param.value.toFixed(2);
  } else if (typeof param.value === "object" && param.value !== null) {
    const obj = param.value as any;
    display = obj.display ?? obj.name ?? obj.value ?? obj.label ?? "—";
  } else {
    display = String(param.value ?? "—");
  }
  return { display, pct };
}

function renderKnob(param: SnapshotParameter): string {
  const { display, pct } = getParamInfo(param);
  const angle = -135 + (pct / 100) * 270;
  return `<div class="knob">
    <div class="knob-ring-wrap">
      <div class="knob-ring"></div>
      <div class="knob-needle" style="transform:rotate(${angle}deg)"></div>
    </div>
    <div class="knob-lbl">${esc(param.name)}</div>
    <div class="knob-val">${esc(String(display))}</div>
  </div>`;
}

function renderSwitch(param: SnapshotParameter): string {
  const { display } = getParamInfo(param);
  const isOn = ["on","true","yes","1","active"].includes(String(display).toLowerCase());
  const isOff = ["off","false","no","0","inactive"].includes(String(display).toLowerCase());
  const cls = isOn ? "sw-on" : isOff ? "sw-off" : "sw-other";
  return `<div class="sw ${cls}"><div class="sw-dot"></div>${esc(param.name)}</div>`;
}

function renderScenesPanel(data: ProjectSnapshot): string {
  let html = `<div class="section-head">
    <span class="section-eyebrow">SCENES & MARKERS</span>
    <span class="section-title">Scenes & <span class="a">Cue Points</span></span>
  </div>`;

  if (data.scenes.length > 0) {
    html += `<div class="scene-grid">
      ${data.scenes.map((s, i) => `<div class="scene-card">
        <div class="scene-num">SCENE ${i + 1}</div>
        <div class="scene-name">${esc(s.name)}</div>
      </div>`).join("")}
    </div>`;
  }

  if (data.cuePoints.length > 0) {
    html += `<div style="margin-top:24px;"><div class="section-eyebrow" style="margin-bottom:12px;">📍 CUE POINTS</div>
    <div class="scene-grid">
      ${data.cuePoints.map((cp, i) => `<div class="scene-card">
        <div class="scene-num">CUE ${i + 1}</div>
        <div class="scene-name">📍 ${esc(cp.name)}</div>
      </div>`).join("")}
    </div></div>`;
  }

  if (data.scenes.length === 0 && data.cuePoints.length === 0) {
    html += `<p style="color:var(--fg-3);font-size:15px;">No scenes or cue points found in this project.</p>`;
  }

  return html;
}

function renderNotesPanel(): string {
  return `<div class="section-head">
    <span class="section-eyebrow">NOTES</span>
    <span class="section-title">Your <span class="a">Notes</span></span>
  </div>
  <p style="color:var(--fg-3);font-size:15px;margin-bottom:16px;line-height:1.7;">
    Write down where you left off, what's working, what needs work, or any ideas for your next session.
  </p>
  <textarea id="project-notes" class="notes-box" placeholder="e.g. 'The bass line in Track 3 needs variation. Try adding a filter sweep on the drop. The pad sounds great — keep that. Need to finish the arrangement...'"></textarea>
  <div class="notes-hint">💾 Notes are saved in your browser and persist between sessions.</div>`;
}

function renderInsightsPanel(data: ProjectSnapshot): string {
  return `<div class="section-head">
    <span class="section-eyebrow">INSIGHTS</span>
    <span class="section-title">Suggested <span class="a">Next Steps</span></span>
  </div>
  <div class="insight-list">
    ${data.suggestions.map(s => `<div class="insight ${s.type === "tip" ? "tip" : s.type === "warning" ? "warn" : "info"}">
      <div class="insight-icon">${s.icon}</div>
      <div class="insight-text">${esc(s.text)}</div>
    </div>`).join("")}
  </div>

  <div class="report-footer">
    <div class="name">📸 Project Snapshot</div>
    <div>Created by <a href="https://www.douglasfugazi.co" target="_blank">Douglas Fugazi</a></div>
    <div style="margin-top:5px;">Generated on ${data.generatedDate}</div>
  </div>`;
}

// ══════════════════════════════════════
// HELPERS
// ══════════════════════════════════════

const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

function esc(str: string): string {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}
