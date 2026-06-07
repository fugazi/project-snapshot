// ──────────────────────────────────────────────
// Project Snapshot — Modal Dialog
// Deep Ink Luxury styled webview for Ableton Live
// ──────────────────────────────────────────────

export function buildModalHtml(quickInfo: { tempo: number; trackCount: number; clipCount: number; deviceCount: number; sceneCount: number; audioTrackCount: number; midiTrackCount: number; signatureNumerator: number; signatureDenominator: number; scaleName: string; rootNote: number; }): string {
  const scaleDisplay = quickInfo.scaleName && quickInfo.scaleName !== "None"
    ? noteNames[quickInfo.rootNote] + " " + quickInfo.scaleName
    : "No scale set";

  return `data:text/html;charset=utf-8,${encodeURIComponent(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Project Snapshot</title>
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html { background: #00131a; }
  body {
    font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #00131a;
    color: #fcf1e5;
    padding: 24px;
    user-select: none;
    -webkit-user-select: none;
    line-height: 1.5;
  }

  /* Header */
  .header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 6px;
  }
  .header-icon { font-size: 28px; }
  .header-title {
    font-family: 'Nunito', sans-serif;
    font-weight: 700;
    font-size: 20px;
    color: #fcf1e5;
    letter-spacing: -0.01em;
  }
  .header-sub {
    font-size: 12px;
    color: rgba(252, 241, 229, 0.50);
    margin-bottom: 24px;
    padding-left: 40px;
  }

  /* Divider */
  .divider {
    border: none;
    height: 1px;
    background: linear-gradient(90deg, transparent, #48d0ce, transparent);
    margin: 20px 0;
    opacity: 0.3;
  }

  /* Quick Stats */
  .stats-title {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.20em;
    text-transform: uppercase;
    color: rgba(252, 241, 229, 0.40);
    margin-bottom: 12px;
  }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 8px;
  }
  .stat-box {
    background: rgba(252, 241, 229, 0.04);
    border: 1px solid rgba(252, 241, 229, 0.08);
    border-radius: 10px;
    padding: 12px 10px;
    text-align: center;
  }
  .stat-num {
    font-family: 'Nunito', sans-serif;
    font-weight: 700;
    font-size: 22px;
    line-height: 1;
    margin-bottom: 4px;
  }
  .stat-num.teal { color: #48d0ce; }
  .stat-num.flame { color: #fc6b3c; }
  .stat-num.paper { color: #fcf1e5; }
  .stat-num.flame2 { color: #f98d27; }
  .stat-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(252, 241, 229, 0.40);
  }

  /* Section Label */
  .section-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.20em;
    text-transform: uppercase;
    color: rgba(252, 241, 229, 0.40);
    margin-bottom: 10px;
    margin-top: 4px;
  }

  /* Info row */
  .info-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 4px;
  }
  .info-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: rgba(252, 241, 229, 0.72);
  }
  .info-item .emoji { font-size: 15px; }
  .info-item .value {
    color: #fcf1e5;
    font-weight: 600;
    font-family: 'Nunito', sans-serif;
  }

  /* Filename input */
  .filename-group { margin-top: 4px; }
  .filename-label {
    display: block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(252, 241, 229, 0.40);
    margin-bottom: 8px;
  }
  .filename-input {
    width: 100%;
    padding: 10px 14px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    color: #fcf1e5;
    background: rgba(252, 241, 229, 0.03);
    border: 1px solid rgba(252, 241, 229, 0.12);
    border-radius: 10px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .filename-input::placeholder { color: rgba(252, 241, 229, 0.25); }
  .filename-input:focus {
    border-color: #48d0ce;
    box-shadow: 0 0 0 3px rgba(72, 208, 206, 0.08);
  }
  .filename-hint {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: rgba(252, 241, 229, 0.30);
    margin-top: 6px;
  }

  /* Generate Button */
  .btn-generate {
    width: 100%;
    margin-top: 20px;
    padding: 14px 24px;
    border-radius: 999px;
    background: linear-gradient(135deg, #48d0ce, #2dd4bf);
    color: #00131a;
    font-family: 'Nunito', sans-serif;
    font-weight: 700;
    font-size: 15px;
    letter-spacing: -0.01em;
    border: none;
    cursor: pointer;
    transition: transform 0.2s cubic-bezier(0.2, 0.7, 0.2, 1), box-shadow 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .btn-generate:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(72, 208, 206, 0.25), 0 4px 12px rgba(72, 208, 206, 0.15);
  }
  .btn-generate:active { transform: translateY(0); }

  /* Cancel Button */
  .btn-cancel {
    width: 100%;
    margin-top: 8px;
    padding: 10px 24px;
    border-radius: 999px;
    background: transparent;
    color: rgba(252, 241, 229, 0.40);
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 500;
    font-size: 12px;
    border: 1px solid rgba(252, 241, 229, 0.10);
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
  }
  .btn-cancel:hover {
    color: rgba(252, 241, 229, 0.72);
    border-color: rgba(252, 241, 229, 0.20);
  }

  /* Footer */
  .footer {
    text-align: center;
    margin-top: 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: rgba(252, 241, 229, 0.20);
    letter-spacing: 0.08em;
  }
  .footer a { color: #48d0ce; text-decoration: none; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(252, 241, 229, 0.10); border-radius: 2px; }
</style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <span class="header-icon">📸</span>
    <span class="header-title">Project Snapshot</span>
  </div>
  <div class="header-sub">Generate a detailed HTML report of your Ableton Live project</div>

  <hr class="divider">

  <!-- Quick Stats -->
  <div class="stats-title">📊 Project Overview</div>
  <div class="stats-grid">
    <div class="stat-box">
      <div class="stat-num flame">${quickInfo.tempo}</div>
      <div class="stat-label">BPM</div>
    </div>
    <div class="stat-box">
      <div class="stat-num teal">${quickInfo.trackCount}</div>
      <div class="stat-label">Tracks</div>
    </div>
    <div class="stat-box">
      <div class="stat-num paper">${quickInfo.clipCount}</div>
      <div class="stat-label">Clips</div>
    </div>
    <div class="stat-box">
      <div class="stat-num flame2">${quickInfo.deviceCount}</div>
      <div class="stat-label">Devices</div>
    </div>
  </div>

  <!-- Info Row -->
  <div class="info-row">
    <div class="info-item">
      <span class="emoji">🎵</span>
      <span class="value">${quickInfo.signatureNumerator}/${quickInfo.signatureDenominator}</span>
    </div>
    <div class="info-item">
      <span class="emoji">🎹</span>
      <span class="value">${scaleDisplay}</span>
    </div>
    <div class="info-item">
      <span class="emoji">🎙️</span>
      <span>${quickInfo.audioTrackCount} audio</span>
    </div>
    <div class="info-item">
      <span class="emoji">🎹</span>
      <span>${quickInfo.midiTrackCount} MIDI</span>
    </div>
    <div class="info-item">
      <span class="emoji">🎬</span>
      <span>${quickInfo.sceneCount} scenes</span>
    </div>
  </div>

  <hr class="divider">

  <!-- Filename -->
  <div class="section-label">📝 Output File</div>
  <div class="filename-group">
    <label class="filename-label">Filename</label>
    <input type="text" id="filename" class="filename-input" value="project-snapshot" placeholder="Enter filename...">
    <div class="filename-hint">.html extension added automatically · Saved to extension storage directory</div>
  </div>

  <!-- Buttons -->
  <button class="btn-generate" onclick="generate()">
    📸 Generate Project Snapshot
  </button>
  <button class="btn-cancel" onclick="cancel()">Cancel</button>

  <!-- Footer -->
  <div class="footer">
    Created by <a href="#">Douglas Fugazi</a> · douglasfugazi.co
  </div>

  <script>
    var isWebKit = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.live;
    var isWebView2 = window.chrome && window.chrome.webview;

    function postMessage(msg) {
      if (isWebKit) {
        window.webkit.messageHandlers.live.postMessage(msg);
      } else if (isWebView2) {
        window.chrome.webview.postMessage(msg);
      }
    }

    function generate() {
      var filename = document.getElementById('filename').value.trim();
      if (!filename) filename = 'project-snapshot';
      // Remove .html if user typed it
      if (filename.toLowerCase().endsWith('.html')) {
        filename = filename.slice(0, -5);
      }
      postMessage({ method: 'close_and_send', params: [JSON.stringify({ action: 'generate', filename: filename })] });
    }

    function cancel() {
      postMessage({ method: 'close_and_send', params: [JSON.stringify({ action: 'cancel' })] });
    }

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') generate();
      if (e.key === 'Escape') cancel();
    });
  </script>
</body>
</html>`)}`;
}

const noteNames = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
