// ──────────────────────────────────────────────
// Project Snapshot — Modal Dialog
// Deep Ink Luxury styled webview for Ableton Live
// ──────────────────────────────────────────────

export function buildModalHtml(quickInfo: {
  tempo: number;
  trackCount: number;
  clipCount: number;
  deviceCount: number;
  sceneCount: number;
  audioTrackCount: number;
  midiTrackCount: number;
  signatureNumerator: number;
  signatureDenominator: number;
  scaleName: string;
  rootNote: number;
  storageDir: string;
}): string {
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

  /* Filename input */
  .filename-group { margin-bottom: 12px; }
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

  /* Save location box */
  .save-location {
    background: rgba(72, 208, 206, 0.04);
    border: 1px solid rgba(72, 208, 206, 0.10);
    border-radius: 10px;
    padding: 10px 14px;
    margin-bottom: 4px;
  }
  .save-location-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #48d0ce;
    margin-bottom: 4px;
  }
  .save-location-path {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: rgba(252, 241, 229, 0.60);
    word-break: break-all;
    line-height: 1.4;
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

  <!-- Output File -->
  <div class="section-label">📝 Output File</div>
  <div class="filename-group">
    <label class="filename-label">Filename</label>
    <input type="text" id="filename" class="filename-input" value="project-snapshot" placeholder="Enter filename...">
  </div>

  <!-- Save Location -->
  <div class="save-location">
    <div class="save-location-label">📁 Save Location</div>
    <div class="save-location-path" id="savePath">${quickInfo.storageDir}/<span id="previewName">project-snapshot</span>-<span id="previewTimestamp">YYYY-MM-DD</span>.html</div>
  </div>

  <!-- Buttons -->
  <button class="btn-generate" onclick="generate()">
    📸 Generate Project Snapshot
  </button>
  <button class="btn-cancel" onclick="cancel()">Cancel</button>

  <!-- Footer -->
  <div class="footer">
    Created by Douglas Fugazi · douglasfugazi.co
  </div>

  <script>
    var isWebKit = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.live;
    var isWebView2 = window.chrome && window.chrome.webview;
    var storageDir = ${JSON.stringify(quickInfo.storageDir)};

    function postMessage(msg) {
      if (isWebKit) {
        window.webkit.messageHandlers.live.postMessage(msg);
      } else if (isWebView2) {
        window.chrome.webview.postMessage(msg);
      }
    }

    function updatePreview() {
      var filename = document.getElementById('filename').value.trim() || 'project-snapshot';
      if (filename.toLowerCase().endsWith('.html')) filename = filename.slice(0, -5);
      document.getElementById('previewName').textContent = filename;
      var now = new Date();
      var ts = now.getFullYear() + '-' +
        String(now.getMonth()+1).padStart(2,'0') + '-' +
        String(now.getDate()).padStart(2,'0');
      document.getElementById('previewTimestamp').textContent = ts;
    }

    document.getElementById('filename').addEventListener('input', updatePreview);
    updatePreview();

    function generate() {
      var filename = document.getElementById('filename').value.trim();
      if (!filename) filename = 'project-snapshot';
      if (filename.toLowerCase().endsWith('.html')) filename = filename.slice(0, -5);
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

// ── Success Modal ──

export function buildSuccessModalHtml(outputPath: string, summary: { tracks: number; clips: number; devices: number; tempo: number }): string {
  return `data:text/html;charset=utf-8,${encodeURIComponent(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Project Snapshot — Success</title>
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html { background: #00131a; }
  body {
    font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #00131a;
    color: #fcf1e5;
    padding: 28px;
    user-select: none;
    -webkit-user-select: none;
    text-align: center;
  }

  .icon { font-size: 48px; margin-bottom: 12px; }
  .title {
    font-family: 'Nunito', sans-serif;
    font-weight: 700;
    font-size: 22px;
    color: #48d0ce;
    margin-bottom: 6px;
  }
  .subtitle {
    font-size: 13px;
    color: rgba(252, 241, 229, 0.50);
    margin-bottom: 24px;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 24px;
  }
  .summary-box {
    background: rgba(252, 241, 229, 0.04);
    border: 1px solid rgba(252, 241, 229, 0.08);
    border-radius: 10px;
    padding: 10px;
    text-align: center;
  }
  .summary-num {
    font-family: 'Nunito', sans-serif;
    font-weight: 700;
    font-size: 20px;
    color: #fcf1e5;
  }
  .summary-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(252, 241, 229, 0.40);
  }

  .path-box {
    background: rgba(72, 208, 206, 0.04);
    border: 1px solid rgba(72, 208, 206, 0.10);
    border-radius: 10px;
    padding: 14px;
    margin-bottom: 20px;
  }
  .path-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #48d0ce;
    margin-bottom: 6px;
  }
  .path-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }
  .path-value {
    flex: 1;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: rgba(252, 241, 229, 0.72);
    word-break: break-all;
    line-height: 1.4;
    user-select: text;
    -webkit-user-select: text;
  }
  .btn-copy {
    flex-shrink: 0;
    padding: 6px 10px;
    border-radius: 8px;
    background: rgba(72, 208, 206, 0.08);
    border: 1px solid rgba(72, 208, 206, 0.15);
    color: #48d0ce;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
    line-height: 1;
  }
  .btn-copy:hover { background: rgba(72, 208, 206, 0.15); transform: scale(1.05); }
  .btn-copy:active { transform: scale(0.95); }
  .btn-copy.copied { background: rgba(61,214,140,0.12); border-color: rgba(61,214,140,0.2); color: #3dd68c; }

  .btn-done {
    width: 100%;
    padding: 12px 24px;
    border-radius: 999px;
    background: linear-gradient(135deg, #48d0ce, #2dd4bf);
    color: #00131a;
    font-family: 'Nunito', sans-serif;
    font-weight: 700;
    font-size: 14px;
    border: none;
    cursor: pointer;
    transition: transform 0.2s;
  }
  .btn-done:hover { transform: translateY(-1px); }
</style>
</head>
<body>

  <div class="icon">✅</div>
  <div class="title">Snapshot Generated!</div>
  <div class="subtitle">Your project report is ready</div>

  <div class="summary-grid">
    <div class="summary-box">
      <div class="summary-num">${summary.tracks}</div>
      <div class="summary-label">Tracks</div>
    </div>
    <div class="summary-box">
      <div class="summary-num">${summary.clips}</div>
      <div class="summary-label">Clips</div>
    </div>
    <div class="summary-box">
      <div class="summary-num">${summary.devices}</div>
      <div class="summary-label">Devices</div>
    </div>
  </div>

  <div class="path-box">
    <div class="path-label">📁 Saved to</div>
    <div class="path-row">
      <div class="path-value" id="filePath">${outputPath}</div>
      <button class="btn-copy" id="copyBtn" onclick="copyPath()" title="Copy path to clipboard">📋</button>
    </div>
  </div>

  <button class="btn-done" onclick="closeDialog()">Done</button>

  <script>
    var isWebKit = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.live;
    var isWebView2 = window.chrome && window.chrome.webview;
    function closeDialog() {
      var msg = { method: 'close_and_send', params: ['done'] };
      if (isWebKit) window.webkit.messageHandlers.live.postMessage(msg);
      else if (isWebView2) window.chrome.webview.postMessage(msg);
    }
    function copyPath() {
      var pathEl = document.getElementById('filePath');
      var btn = document.getElementById('copyBtn');
      if (!pathEl) return;
      var text = pathEl.textContent || pathEl.innerText;
      function onSuccess() {
        btn.textContent = '✅';
        btn.classList.add('copied');
        setTimeout(function() { btn.textContent = '📋'; btn.classList.remove('copied'); }, 2000);
      }
      function fallbackCopy() {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.top = '-9999px';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        try { document.execCommand('copy'); onSuccess(); } catch(e) { btn.textContent = '❌'; setTimeout(function() { btn.textContent = '📋'; }, 2000); }
        document.body.removeChild(ta);
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(onSuccess).catch(fallbackCopy);
      } else {
        fallbackCopy();
      }
    }
    document.addEventListener('keydown', function(e) { if (e.key === 'Enter' || e.key === 'Escape') closeDialog(); });
  </script>
</body>
</html>`)}`;
}

const noteNames = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
