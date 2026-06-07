// ──────────────────────────────────────────────
// Project Snapshot — Template v3
// Kimi-inspired Vertical Layout · Teal Green
// Full-page scroll · Glass cards · Hero section
// ──────────────────────────────────────────────

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
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Mono:wght@300;400;500&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
${CSS}
  </style>
</head>
<body>
  <!-- Navigation -->
  <nav class="top-nav">
    <div class="nav-brand">📸 Project Snapshot</div>
    <div class="nav-links">
      <a href="#overview" class="nav-link active">Overview</a>
      <a href="#tracks" class="nav-link">Tracks</a>
      <a href="#clips" class="nav-link">Clips</a>
      <a href="#devices" class="nav-link">Devices</a>
      <a href="#scenes" class="nav-link">Scenes</a>
      <a href="#notes" class="nav-link">Notes</a>
      <a href="#insights" class="nav-link">Insights</a>
    </div>
    <button class="nav-print" onclick="window.print()">🖨️ Print</button>
  </nav>

  ${renderHero(data)}

  <div class="page-content">
    ${renderOverviewSection(data)}
    ${renderTracksSection(data)}
    ${renderClipsSection(data)}
    ${renderDevicesSection(data)}
    ${renderScenesSection(data)}
    ${renderNotesSection()}
    ${renderInsightsSection(data)}
    ${renderFooter(data)}
  </div>

<script>
${JS}
</script>
</body>
</html>`;
}

// ══════════════════════════════════════
// CSS — Teal Green · Kimi-inspired Layout
// ══════════════════════════════════════

const CSS = `
:root {
  --bg-0: #0a1e26;
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
  --purple:   #a07aff;
  --purple-bg:rgba(160,122,255,0.08);
  --green:    #52f0a0;
  --green-bg: rgba(82,240,160,0.08);
  --red:      #ff6b7a;
  --red-bg:   rgba(255,107,122,0.08);
  --yellow:   #ffe066;
  --yellow-bg:rgba(255,224,102,0.08);
  --line:     rgba(160,224,232,0.10);
  --line-2:   rgba(160,224,232,0.18);
  --glass:    rgba(14,42,52,0.70);
  --radius:   12px;
  --radius-lg:16px;
  --sans:     'DM Sans', system-ui, -apple-system, sans-serif;
  --mono:     'DM Mono', ui-monospace, 'Cascadia Code', monospace;
  --display:  'Playfair Display', Georgia, serif;
}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
html{background:var(--bg-0);scroll-behavior:smooth;}
body{font-family:var(--sans);color:var(--fg);background:var(--bg-0);-webkit-font-smoothing:antialiased;line-height:1.6;}
a{color:inherit;text-decoration:none;}
button{font:inherit;color:inherit;background:none;border:none;cursor:pointer;}
::-webkit-scrollbar{width:6px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--fg-5);border-radius:3px;}
::-webkit-scrollbar-thumb:hover{background:var(--fg-4);}

/* ── TOP NAVIGATION ── */
.top-nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;gap:24px;
  padding:14px 32px;
  background:rgba(10,30,38,0.85);backdrop-filter:blur(16px);
  border-bottom:1px solid var(--line);
}
.nav-brand{font-weight:700;font-size:17px;color:var(--fg);white-space:nowrap;}
.nav-links{display:flex;gap:4px;flex:1;overflow-x:auto;}
.nav-link{
  font-size:14px;font-weight:500;color:var(--fg-4);
  padding:6px 14px;border-radius:8px;
  transition:all 0.15s;white-space:nowrap;
}
.nav-link:hover{color:var(--fg);background:rgba(160,224,232,0.06);}
.nav-link.active{color:var(--accent);background:var(--accent-bg);}
.nav-print{
  font-size:13px;padding:6px 14px;border-radius:8px;
  background:rgba(160,224,232,0.08);color:var(--fg-3);
  border:1px solid var(--line);transition:all 0.15s;white-space:nowrap;
}
.nav-print:hover{background:rgba(160,224,232,0.14);color:var(--fg);}

/* ── HERO ── */
.hero{
  min-height:80vh;display:flex;align-items:center;justify-content:center;
  text-align:center;padding:120px 32px 80px;position:relative;overflow:hidden;
}
.hero-bg{
  position:absolute;inset:0;
  background:radial-gradient(ellipse at 50% 0%,rgba(62,240,224,0.08) 0%,transparent 60%),
             radial-gradient(ellipse at 80% 80%,rgba(255,143,92,0.05) 0%,transparent 50%),
             var(--bg-0);
}
.hero-content{position:relative;z-index:2;max-width:800px;}
.hero-badge{
  display:inline-flex;align-items:center;gap:8px;
  padding:6px 16px;border-radius:99px;
  background:var(--accent-bg);border:1px solid rgba(62,240,224,0.15);
  font-size:14px;font-weight:500;color:var(--accent);
  margin-bottom:24px;
  animation:fadeInDown 0.6s ease both;
}
.hero-title{
  font-family:var(--display);font-weight:800;
  font-size:clamp(40px,7vw,72px);line-height:1.1;
  color:var(--fg);margin-bottom:16px;
  letter-spacing:-0.02em;
  animation:fadeInDown 0.6s 0.1s ease both;
}
.hero-title .grad{
  background:linear-gradient(135deg,var(--accent),var(--hot));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;
}
.hero-sub{
  font-size:18px;color:var(--fg-3);max-width:560px;margin:0 auto 20px;
  line-height:1.7;
  animation:fadeInDown 0.6s 0.2s ease both;
}
.hero-sub strong{color:var(--accent);font-weight:600;}
.hero-meta{
  display:flex;justify-content:center;flex-wrap:wrap;gap:10px;margin-bottom:32px;
  animation:fadeInDown 0.6s 0.3s ease both;
}
.hero-chip{
  display:inline-flex;align-items:center;gap:6px;
  font-size:14px;color:var(--fg-3);
  padding:6px 14px;border-radius:8px;
  background:rgba(14,42,52,0.6);border:1px solid var(--line);
  backdrop-filter:blur(8px);
}
.hero-chip .v{color:var(--fg);font-weight:600;}
.hero-chip .e{font-size:16px;}
.hero-stats{
  display:grid;grid-template-columns:repeat(4,1fr);gap:12px;max-width:600px;margin:0 auto;
  animation:fadeInDown 0.6s 0.4s ease both;
}
.hero-stat{
  background:var(--glass);border:1px solid var(--line);
  border-radius:var(--radius);padding:16px 12px;
  backdrop-filter:blur(12px);text-align:center;
  transition:border-color 0.2s,transform 0.2s;
}
.hero-stat:hover{border-color:var(--accent);transform:translateY(-2px);}
.hero-stat-val{font-weight:800;font-size:28px;line-height:1;margin-bottom:4px;}
.hero-stat-val.teal{color:var(--accent);}
.hero-stat-val.hot{color:var(--hot);}
.hero-stat-val.fg{color:var(--fg);}
.hero-stat-val.green{color:var(--green);}
.hero-stat-lbl{font-family:var(--mono);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--fg-4);}
.hero-scroll{
  position:absolute;bottom:24px;left:50%;transform:translateX(-50%);
  color:var(--fg-4);font-size:24px;
  animation:bounce 2s infinite;
}
/* decorative blobs */
.blob{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;}
.blob-1{width:300px;height:300px;background:rgba(62,240,224,0.12);top:10%;left:-5%;}
.blob-2{width:350px;height:350px;background:rgba(255,143,92,0.08);bottom:5%;right:-5%;}
.blob-3{width:200px;height:200px;background:rgba(160,122,255,0.06);top:60%;left:50%;}

/* ── PAGE CONTENT ── */
.page-content{max-width:960px;margin:0 auto;padding:0 32px 80px;}

/* ── SECTION ── */
.section{padding:64px 0;position:relative;}
.section:first-child{padding-top:32px;}
.section-head{text-align:center;margin-bottom:40px;}
.section-badge{
  display:inline-flex;align-items:center;gap:6px;
  padding:5px 14px;border-radius:99px;
  font-family:var(--mono);font-size:12px;font-weight:500;letter-spacing:0.08em;
  margin-bottom:14px;
}
.section-badge.teal{background:var(--accent-bg);color:var(--accent);border:1px solid rgba(62,240,224,0.15);}
.section-badge.hot{background:var(--hot-bg);color:var(--hot);border:1px solid rgba(255,143,92,0.15);}
.section-badge.purple{background:var(--purple-bg);color:var(--purple);border:1px solid rgba(160,122,255,0.15);}
.section-badge.green{background:var(--green-bg);color:var(--green);border:1px solid rgba(82,240,160,0.15);}
.section-title{
  font-family:var(--display);font-weight:700;
  font-size:clamp(28px,4vw,44px);color:var(--fg);
  letter-spacing:-0.01em;margin-bottom:10px;
}
.section-title .grad{
  background:linear-gradient(135deg,var(--accent),var(--hot));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;
}
.section-desc{font-size:16px;color:var(--fg-4);max-width:560px;margin:0 auto;line-height:1.7;}

/* ── GLASS CARD ── */
.card{
  background:var(--glass);border:1px solid var(--line);
  border-radius:var(--radius-lg);padding:24px;
  backdrop-filter:blur(12px);
  transition:border-color 0.2s,transform 0.15s,box-shadow 0.2s;
}
.card:hover{border-color:var(--line-2);}
.card-accent{border-color:rgba(62,240,224,0.15);}
.card-accent:hover{border-color:rgba(62,240,224,0.35);box-shadow:0 0 24px var(--accent-bg);}
.card-hot{border-color:rgba(255,143,92,0.12);}
.card-hot:hover{border-color:rgba(255,143,92,0.30);box-shadow:0 0 24px var(--hot-bg);}
.card-header{display:flex;align-items:center;gap:12px;margin-bottom:16px;}
.card-icon{
  width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;
  font-size:20px;
}
.card-icon.teal{background:var(--accent-bg);border:1px solid rgba(62,240,224,0.12);}
.card-icon.hot{background:var(--hot-bg);border:1px solid rgba(255,143,92,0.12);}
.card-icon.purple{background:var(--purple-bg);border:1px solid rgba(160,122,255,0.12);}
.card-icon.green{background:var(--green-bg);border:1px solid rgba(82,240,160,0.12);}
.card-title{font-weight:700;font-size:17px;color:var(--fg);}
.card-subtitle{font-family:var(--mono);font-size:12px;color:var(--fg-4);}

/* ── STAT GRID ── */
.stats-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-bottom:12px;}
.stat-card{
  background:var(--glass);border:1px solid var(--line);
  border-radius:var(--radius);padding:20px 16px;text-align:center;
  backdrop-filter:blur(12px);transition:all 0.2s;
}
.stat-card:hover{border-color:var(--accent);transform:translateY(-2px);box-shadow:0 8px 24px var(--accent-bg);}
.stat-val{font-weight:800;font-size:36px;line-height:1;margin-bottom:6px;}
.stat-val.teal{color:var(--accent);}
.stat-val.hot{color:var(--hot);}
.stat-val.fg{color:var(--fg);}
.stat-val.green{color:var(--green);}
.stat-val.purple{color:var(--purple);}
.stat-lbl{font-family:var(--mono);font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--fg-3);}

/* ── TRACK CARDS ── */
.track-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;}
.track-card{
  background:var(--glass);border:1px solid var(--line);
  border-radius:var(--radius);padding:18px;
  backdrop-filter:blur(12px);transition:all 0.2s;
  display:flex;align-items:center;gap:14px;
}
.track-card:hover{border-color:var(--accent);transform:translateY(-2px);box-shadow:0 8px 20px var(--accent-bg);}
.track-emoji{font-size:28px;flex-shrink:0;}
.track-info{flex:1;min-width:0;}
.track-name{font-weight:600;font-size:16px;color:var(--fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.track-type{font-family:var(--mono);font-size:12px;color:var(--fg-4);}
.track-nums{display:flex;gap:12px;margin-top:6px;}
.track-num{font-family:var(--mono);font-size:12px;color:var(--fg-3);}
.track-num .n{color:var(--accent);font-weight:600;}
.track-badges{display:flex;gap:5px;margin-top:8px;flex-wrap:wrap;}
.badge{font-family:var(--mono);font-size:11px;padding:3px 8px;border-radius:5px;font-weight:500;}
.badge-arm{color:var(--red);background:var(--red-bg);border:1px solid rgba(255,107,122,0.15);}
.badge-mute{color:var(--fg-4);background:rgba(160,224,232,0.06);border:1px solid var(--line);}
.badge-solo{color:var(--yellow);background:var(--yellow-bg);border:1px solid rgba(255,224,102,0.15);}

/* ── CLIP TABLE ── */
.clip-group{margin-bottom:20px;}
.clip-group-title{font-weight:600;font-size:17px;margin-bottom:12px;display:flex;align-items:center;gap:8px;color:var(--fg);}
.table-card{
  background:var(--glass);border:1px solid var(--line);
  border-radius:var(--radius);overflow:hidden;
  backdrop-filter:blur(12px);
}
table{width:100%;border-collapse:collapse;font-size:14px;}
thead{background:rgba(19,52,59,0.6);}
th{font-family:var(--mono);font-size:11px;letter-spacing:0.10em;text-transform:uppercase;color:var(--fg-3);text-align:left;padding:12px 16px;border-bottom:1px solid var(--line);}
td{padding:10px 16px;border-bottom:1px solid var(--line);color:var(--fg-2);}
tr:last-child td{border-bottom:none;}
tbody tr{transition:background 0.1s;}
tbody tr:hover{background:rgba(62,240,224,0.04);}

/* ── DEVICE RACK ── */
.dev-group{margin-bottom:16px;}
.dev-group-title{font-weight:600;font-size:17px;margin-bottom:10px;display:flex;align-items:center;gap:8px;color:var(--fg);}
.dev-rack{
  background:var(--glass);border:1px solid var(--line);
  border-radius:var(--radius);overflow:hidden;margin-bottom:8px;
  backdrop-filter:blur(12px);
}
.dev-header{
  padding:14px 18px;display:flex;align-items:center;justify-content:space-between;
  cursor:pointer;transition:background 0.15s;
}
.dev-header:hover{background:rgba(62,240,224,0.04);}
.dev-h-left{display:flex;align-items:center;gap:12px;}
.dev-emoji{font-size:20px;}
.dev-name{font-weight:600;font-size:15px;color:var(--fg);}
.dev-type{font-family:var(--mono);font-size:11px;padding:3px 10px;border-radius:6px;background:var(--accent-bg);color:var(--accent);border:1px solid rgba(62,240,224,0.12);}
.dev-count{font-family:var(--mono);font-size:11px;color:var(--fg-4);}
.dev-chevron{color:var(--fg-4);transition:transform 0.2s;font-size:13px;}
.dev-rack.open .dev-chevron{transform:rotate(180deg);}
.dev-body{max-height:0;overflow:hidden;transition:max-height 0.3s ease-out;}
.dev-rack.open .dev-body{max-height:5000px;}

/* Switches */
.dev-switches{display:flex;flex-wrap:wrap;gap:5px;padding:14px 18px;border-bottom:1px solid var(--line);}
.sw{display:flex;align-items:center;gap:6px;font-family:var(--mono);font-size:11px;padding:4px 10px;border-radius:5px;}
.sw-on{background:var(--green-bg);color:var(--green);}
.sw-off{background:rgba(160,224,232,0.06);color:var(--fg-4);}
.sw-other{background:var(--hot-bg);color:var(--hot);}
.sw-dot{width:6px;height:6px;border-radius:50%;}
.sw-on .sw-dot{background:var(--green);box-shadow:0 0 6px var(--green);}
.sw-off .sw-dot{background:var(--fg-4);}
.sw-other .sw-dot{background:var(--hot);}

/* Knobs */
.dev-knobs{display:flex;flex-wrap:wrap;gap:4px;padding:14px 12px;}
.knob{
  width:72px;text-align:center;padding:8px 4px 6px;border-radius:8px;
  transition:background 0.15s;
}
.knob:hover{background:rgba(62,240,224,0.04);}
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
.dev-chains{padding:10px 18px;border-top:1px solid var(--line);display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
.chain-lbl{font-family:var(--mono);font-size:10px;letter-spacing:0.12em;color:var(--fg-4);}
.chain-badge{font-family:var(--mono);font-size:10px;padding:3px 9px;border-radius:5px;background:var(--accent-bg);color:var(--accent);border:1px solid rgba(62,240,224,0.12);}

/* ── SCENES ── */
.scene-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;}
.scene-card{
  background:var(--glass);border:1px solid var(--line);
  border-radius:var(--radius);padding:16px;
  backdrop-filter:blur(12px);transition:all 0.2s;
}
.scene-card:hover{border-color:var(--accent);transform:translateY(-2px);}
.scene-num{font-family:var(--mono);font-size:11px;color:var(--fg-4);margin-bottom:4px;}
.scene-name{font-weight:600;font-size:16px;color:var(--fg);}

/* ── NOTES ── */
.notes-box{
  width:100%;min-height:200px;padding:18px;
  font-family:var(--sans);font-size:16px;color:var(--fg);
  background:var(--glass);border:1px solid var(--line-2);
  border-radius:var(--radius-lg);outline:none;resize:vertical;
  line-height:1.7;transition:border-color 0.2s,box-shadow 0.2s;
  backdrop-filter:blur(12px);
}
.notes-box::placeholder{color:var(--fg-4);}
.notes-box:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-bg);}
.notes-hint{font-family:var(--mono);font-size:12px;color:var(--fg-4);margin-top:10px;}

/* ── INSIGHTS ── */
.insight-list{display:flex;flex-direction:column;gap:12px;}
.insight{
  padding:16px 20px;border-radius:var(--radius-lg);
  border-left:3px solid;display:flex;gap:14px;align-items:flex-start;
  background:var(--glass);backdrop-filter:blur(12px);
}
.insight.tip{border-color:var(--accent);background:linear-gradient(135deg,var(--accent-bg),var(--glass));}
.insight.warn{border-color:var(--hot);background:linear-gradient(135deg,var(--hot-bg),var(--glass));}
.insight.info{border-color:var(--fg-4);background:linear-gradient(135deg,rgba(160,224,232,0.04),var(--glass));}
.insight-icon{font-size:24px;flex-shrink:0;}
.insight-text{font-size:15px;color:var(--fg-2);line-height:1.7;}

/* ── FOOTER ── */
.report-footer{
  text-align:center;padding:48px 0 24px;
  border-top:1px solid var(--line);margin-top:48px;
}
.footer-brand{font-family:var(--display);font-weight:700;font-size:20px;color:var(--fg);margin-bottom:8px;}
.footer-sub{font-family:var(--mono);font-size:13px;color:var(--fg-4);line-height:1.8;}
.footer-sub a{color:var(--accent);transition:color 0.15s;}
.footer-sub a:hover{color:var(--fg);}

/* ── DIVIDER ── */
.section-divider{
  border:none;height:1px;margin:0;
  background:linear-gradient(90deg,transparent,var(--accent),transparent);
  opacity:0.15;
}

/* ── ANIMATIONS ── */
@keyframes fadeInDown{from{opacity:0;transform:translateY(-16px);}to{opacity:1;transform:translateY(0);}}
@keyframes bounce{0%,20%,50%,80%,100%{transform:translateX(-50%) translateY(0);}40%{transform:translateX(-50%) translateY(-10px);}60%{transform:translateX(-50%) translateY(-5px);}}

/* ── RESPONSIVE ── */
@media(max-width:768px){
  .top-nav{padding:12px 16px;gap:12px;}
  .nav-links{gap:2px;}
  .nav-link{font-size:13px;padding:5px 10px;}
  .hero{min-height:70vh;padding:100px 16px 60px;}
  .hero-title{font-size:clamp(32px,6vw,52px);}
  .hero-stats{grid-template-columns:repeat(2,1fr);}
  .page-content{padding:0 16px 60px;}
  .section{padding:40px 0;}
  .stats-grid{grid-template-columns:repeat(2,1fr);}
  .track-grid{grid-template-columns:1fr;}
  .scene-grid{grid-template-columns:repeat(2,1fr);}
}
`;

// ══════════════════════════════════════
// JS
// ══════════════════════════════════════

const JS = `
  // Scroll-spy for nav links
  const sections = document.querySelectorAll('.section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateNav() {
    let current = '';
    sections.forEach(s => {
      const top = s.offsetTop - 120;
      if (window.scrollY >= top) current = s.id;
    });
    navLinks.forEach(l => {
      l.classList.remove('active');
      if (l.getAttribute('href') === '#' + current) l.classList.add('active');
    });
  }
  window.addEventListener('scroll', updateNav, {passive: true});
  updateNav();

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
// HERO
// ══════════════════════════════════════

function renderHero(data: ProjectSnapshot): string {
  const o = data.overview;
  const scaleDisplay = o.scaleName && o.scaleName !== "None"
    ? `${NOTE_NAMES[o.rootNote]} ${o.scaleName}` : "No scale set";

  return `<section class="hero" id="hero">
  <div class="hero-bg"></div>
  <div class="blob blob-1"></div>
  <div class="blob blob-2"></div>
  <div class="blob blob-3"></div>
  <div class="hero-content">
    <div class="hero-badge">📸 Project Snapshot</div>
    <h1 class="hero-title">
      ${o.tempo} <span class="grad">BPM</span>
    </h1>
    <p class="hero-sub">
      Generated on <strong>${data.generatedDate}</strong> ·
      <strong>${o.trackCount}</strong> tracks ·
      <strong>${o.totalClipCount}</strong> clips ·
      <strong>${o.totalDeviceCount}</strong> devices
    </p>
    <div class="hero-meta">
      <div class="hero-chip"><span class="e">🎵</span> <span class="v">${scaleDisplay}</span></div>
      <div class="hero-chip"><span class="e">⏱️</span> <span class="v">${o.signatureNumerator}/${o.signatureDenominator}</span></div>
      <div class="hero-chip"><span class="e">🎹</span> <span class="v">${o.midiTrackCount}</span> MIDI</div>
      <div class="hero-chip"><span class="e">🎙️</span> <span class="v">${o.audioTrackCount}</span> Audio</div>
      <div class="hero-chip"><span class="e">🎬</span> <span class="v">${o.sceneCount}</span> scenes</div>
    </div>
    <div class="hero-stats">
      <div class="hero-stat">
        <div class="hero-stat-val hot">${o.tempo}</div>
        <div class="hero-stat-lbl">BPM</div>
      </div>
      <div class="hero-stat">
        <div class="hero-stat-val teal">${o.trackCount}</div>
        <div class="hero-stat-lbl">Tracks</div>
      </div>
      <div class="hero-stat">
        <div class="hero-stat-val fg">${o.totalClipCount}</div>
        <div class="hero-stat-lbl">Clips</div>
      </div>
      <div class="hero-stat">
        <div class="hero-stat-val green">${o.totalDeviceCount}</div>
        <div class="hero-stat-lbl">Devices</div>
      </div>
    </div>
  </div>
  <div class="hero-scroll">↓</div>
</section>`;
}

// ══════════════════════════════════════
// OVERVIEW SECTION
// ══════════════════════════════════════

function renderOverviewSection(data: ProjectSnapshot): string {
  const o = data.overview;

  return `<div class="section-divider"></div>
<section class="section" id="overview">
  <div class="section-head">
    <div class="section-badge teal">🎯 Overview</div>
    <h2 class="section-title">Project <span class="grad">Overview</span></h2>
    <p class="section-desc">A complete breakdown of your Ableton Live project at a glance</p>
  </div>
  <div class="stats-grid">
    <div class="stat-card"><div class="stat-val hot">${o.tempo}</div><div class="stat-lbl">BPM</div></div>
    <div class="stat-card"><div class="stat-val teal">${o.audioTrackCount}</div><div class="stat-lbl">Audio Tracks</div></div>
    <div class="stat-card"><div class="stat-val teal">${o.midiTrackCount}</div><div class="stat-lbl">MIDI Tracks</div></div>
    <div class="stat-card"><div class="stat-val fg">${o.totalClipCount}</div><div class="stat-lbl">Total Clips</div></div>
    <div class="stat-card"><div class="stat-val hot">${o.totalDeviceCount}</div><div class="stat-lbl">Devices</div></div>
    <div class="stat-card"><div class="stat-val teal">${o.sceneCount}</div><div class="stat-lbl">Scenes</div></div>
    <div class="stat-card"><div class="stat-val fg">${o.cuePointCount}</div><div class="stat-lbl">Cue Points</div></div>
    <div class="stat-card"><div class="stat-val purple">${o.signatureNumerator}/${o.signatureDenominator}</div><div class="stat-lbl">Time Signature</div></div>
  </div>
</section>`;
}

// ══════════════════════════════════════
// TRACKS SECTION
// ══════════════════════════════════════

function renderTracksSection(data: ProjectSnapshot): string {
  return `<div class="section-divider"></div>
<section class="section" id="tracks">
  <div class="section-head">
    <div class="section-badge hot">🎵 Tracks</div>
    <h2 class="section-title">Your <span class="grad">Tracks</span></h2>
    <p class="section-desc">${data.tracks.length} tracks in your project — audio, MIDI, return, and master</p>
  </div>
  <div class="track-grid">
    ${data.tracks.map(t => renderTrackCard(t)).join("")}
  </div>
</section>`;
}

function renderTrackCard(t: SnapshotTrack): string {
  const emoji = getTrackTypeEmoji(t.type);
  const typeName = getTrackTypeName(t.type);
  const badges: string[] = [];
  if (t.arm) badges.push(`<span class="badge badge-arm">🔴 ARM</span>`);
  if (t.mute) badges.push(`<span class="badge badge-mute">🔇 MUTE</span>`);
  if (t.solo) badges.push(`<span class="badge badge-solo">🎧 SOLO</span>`);

  return `<div class="track-card">
    <div class="track-emoji">${emoji}</div>
    <div class="track-info">
      <div class="track-name">${esc(t.name)}</div>
      <div class="track-type">${typeName}</div>
      <div class="track-nums">
        <span class="track-num">🎹 <span class="n">${t.clipCount}</span></span>
        <span class="track-num">🔌 <span class="n">${t.deviceCount}</span></span>
      </div>
      ${badges.length > 0 ? `<div class="track-badges">${badges.join("")}</div>` : ""}
    </div>
  </div>`;
}

// ══════════════════════════════════════
// CLIPS SECTION
// ══════════════════════════════════════

function renderClipsSection(data: ProjectSnapshot): string {
  const tracksWithClips = data.tracks.filter(t => t.clips.length > 0);
  return `<div class="section-divider"></div>
<section class="section" id="clips">
  <div class="section-head">
    <div class="section-badge purple">🎹 Clips</div>
    <h2 class="section-title">Clip <span class="grad">Details</span></h2>
    <p class="section-desc">${data.overview.totalClipCount} clips across your project — expand to see warp, loop, and MIDI info</p>
  </div>
  ${tracksWithClips.map(t => renderClipGroup(t)).join("")}
</section>`;
}

function renderClipGroup(track: SnapshotTrack): string {
  return `<div class="clip-group">
    <div class="clip-group-title">${getTrackTypeEmoji(track.type)} ${esc(track.name)}</div>
    <div class="table-card"><table>
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

// ══════════════════════════════════════
// DEVICES SECTION
// ══════════════════════════════════════

function renderDevicesSection(data: ProjectSnapshot): string {
  const tracksWithDevices = data.tracks.filter(t => t.devices.length > 0);
  return `<div class="section-divider"></div>
<section class="section" id="devices">
  <div class="section-head">
    <div class="section-badge teal">🔌 Devices</div>
    <h2 class="section-title">Devices & <span class="grad">Parameters</span></h2>
    <p class="section-desc">${data.overview.totalDeviceCount} devices with their parameters — click to expand</p>
  </div>
  ${tracksWithDevices.map(t => renderDevGroup(t)).join("")}
</section>`;
}

function renderDevGroup(track: SnapshotTrack): string {
  return `<div class="dev-group">
    <div class="dev-group-title">${getTrackTypeEmoji(track.type)} ${esc(track.name)}</div>
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

// ══════════════════════════════════════
// SCENES SECTION
// ══════════════════════════════════════

function renderScenesSection(data: ProjectSnapshot): string {
  let html = `<div class="section-divider"></div>
<section class="section" id="scenes">
  <div class="section-head">
    <div class="section-badge green">🎬 Scenes</div>
    <h2 class="section-title">Scenes & <span class="grad">Cue Points</span></h2>
    <p class="section-desc">Arrangement markers and scene names in your project</p>
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
    html += `<h3 style="font-weight:600;font-size:18px;margin:28px 0 14px;color:var(--fg-3);">📍 Cue Points</h3>
    <div class="scene-grid">
      ${data.cuePoints.map((cp, i) => `<div class="scene-card">
        <div class="scene-num">CUE ${i + 1}</div>
        <div class="scene-name">📍 ${esc(cp.name)}</div>
      </div>`).join("")}
    </div>`;
  }

  if (data.scenes.length === 0 && data.cuePoints.length === 0) {
    html += `<p style="color:var(--fg-4);font-size:16px;text-align:center;">No scenes or cue points found in this project.</p>`;
  }

  html += `</section>`;
  return html;
}

// ══════════════════════════════════════
// NOTES SECTION
// ══════════════════════════════════════

function renderNotesSection(): string {
  return `<div class="section-divider"></div>
<section class="section" id="notes">
  <div class="section-head">
    <div class="section-badge hot">📝 Notes</div>
    <h2 class="section-title">Your <span class="grad">Notes</span></h2>
    <p class="section-desc">Write down ideas, progress, or anything you want to remember for next session</p>
  </div>
  <textarea id="project-notes" class="notes-box" placeholder="e.g. 'The bass line in Track 3 needs variation. Try adding a filter sweep on the drop. The pad sounds great — keep that. Need to finish the arrangement...'"></textarea>
  <div class="notes-hint">💾 Notes are saved in your browser and persist between sessions.</div>
</section>`;
}

// ══════════════════════════════════════
// INSIGHTS SECTION
// ══════════════════════════════════════

function renderInsightsSection(data: ProjectSnapshot): string {
  return `<div class="section-divider"></div>
<section class="section" id="insights">
  <div class="section-head">
    <div class="section-badge purple">💡 Insights</div>
    <h2 class="section-title">Suggested <span class="grad">Next Steps</span></h2>
    <p class="section-desc">Personalized tips and recommendations based on your project</p>
  </div>
  <div class="insight-list">
    ${data.suggestions.map(s => `<div class="insight ${s.type === "tip" ? "tip" : s.type === "warning" ? "warn" : "info"}">
      <div class="insight-icon">${s.icon}</div>
      <div class="insight-text">${esc(s.text)}</div>
    </div>`).join("")}
  </div>
</section>`;
}

// ══════════════════════════════════════
// FOOTER
// ══════════════════════════════════════

function renderFooter(data: ProjectSnapshot): string {
  return `<div class="report-footer">
    <div class="footer-brand">📸 Project Snapshot</div>
    <div class="footer-sub">
      Created by <a href="https://www.douglasfugazi.co" target="_blank">Douglas Fugazi</a><br>
      Generated on ${data.generatedDate}
    </div>
  </div>`;
}

// ══════════════════════════════════════
// HELPERS
// ══════════════════════════════════════

const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

function esc(str: string): string {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}
