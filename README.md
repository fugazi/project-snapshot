# 📸 Project Snapshot — Ableton Live Extension

**Never lose context of your music projects again.**

Project Snapshot is an Ableton Live extension that generates a beautiful, interactive HTML report of your entire Live Set — tracks, clips, devices, parameters, scenes, and more. Perfect for retaking projects after weeks or months away.

---

## ✨ What It Does

When you open an old project and can't remember where you left off, Project Snapshot gives you:

- 🎯 **Overview** — Tempo, time signature, key/scale, track & clip counts
- 📊 **Quick Stats** — Visual dashboard of your project's composition
- 🎵 **Tracks** — Every track with type, state (arm/mute/solo), clip & device counts
- 🎹 **Clips** — Detailed clip info: name, type, warp mode, loop settings, MIDI note ranges
- 🔌 **Devices & Parameters** — Expandable accordions showing every device and its current parameter values
- 🎬 **Scenes & Cue Points** — All your arrangement markers at a glance
- 📝 **Notes** — Editable notepad to write down where you left off (saved in browser)
- 💡 **Suggested Next Steps** — Smart tips based on your project's current state

The report is generated as a standalone HTML file with the **Deep Ink Luxury** design — dark, premium, and easy on the eyes.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 24.14.1
- **Ableton Live** — Beta build with Extensions support
- **Extensions SDK** — Downloaded from Ableton's Centercode

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/douglasfugazi/project-snapshot.git
   cd project-snapshot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your Live path in `.env`:
   ```
   EXTENSION_HOST_PATH=/path/to/Ableton Live Beta.app
   ```
   
   On Windows:
   ```
   EXTENSION_HOST_PATH=C:\ProgramData\Ableton\Live Beta\Program\Ableton Live Beta.exe
   ```

4. Enable **Developer Mode** in Ableton Live:
   - Open Live → Preferences → Extensions → Enable Developer Mode

5. Run the extension:
   ```bash
   npm start
   ```

### Usage

1. With the extension running, open any Live Set in Ableton Live
2. **Right-click** on almost any element (track, clip, scene, arrangement selection)
3. Click **📸 Generate Project Snapshot**
4. Wait for the progress bar to complete
5. Check the console log for the file path
6. Open the generated HTML file in your browser

---

## 📁 Project Structure

```
project-snapshot/
├── manifest.json          # Extension metadata
├── package.json           # Dependencies & scripts
├── build.ts               # esbuild bundler config
├── tsconfig.json          # TypeScript configuration
├── .env                   # Live Beta path
├── .gitignore
├── src/
│   ├── extension.ts       # Entry point — activate + commands
│   ├── extractor.ts       # Data extraction from the Live Set
│   ├── generator.ts       # HTML file generation
│   ├── template.ts        # Deep Ink Luxury HTML/CSS/JS template
│   └── types.ts           # TypeScript interfaces & utilities
└── vendor/
    ├── ableton-extensions-sdk-1.0.0-beta.0.tgz
    └── ableton-extensions-cli-1.0.0-beta.0.tgz
```

---

## 🎨 Design

The generated HTML report uses the **Deep Ink Luxury** design system:

- **Palette:** Deep ink backgrounds (`#00131a`, `#041f2a`) with warm cream text (`#fcf1e5`)
- **Accents:** Teal (`#48d0ce`) + Flame (`#fc6b3c`)
- **Fonts:** Nunito, Space Grotesk, JetBrains Mono, Instrument Serif
- **Effects:** Glassmorphism nav, gradient cards, animated progress bars, accordion devices
- **Features:** Sticky navigation, scroll-to-top/bottom, share button, localStorage notes

---

## 🛠️ Available Context Menu Scopes

The extension is accessible from these right-click locations:

| Scope | Where |
|-------|-------|
| `ClipSlot` | Session View clip slots |
| `AudioTrack` | Audio tracks |
| `MidiTrack` | MIDI tracks |
| `AudioClip` | Audio clips |
| `MidiClip` | MIDI clips |
| `Scene` | Scene launcher |
| `AudioTrack.ArrangementSelection` | Arrangement View (audio) |
| `MidiTrack.ArrangementSelection` | Arrangement View (MIDI) |

---

## 🧠 Smart Suggestions

The extension analyzes your project and provides contextual tips:

- 🧹 Empty tracks that could be removed
- 🏷️ Unnamed clips that need renaming
- 🔴 Armed tracks ready for recording
- 🔇 Muted tracks to check before mixing
- 🎧 Soloed tracks to unsolo
- ⏱️ Default tempo (120 BPM) suggestion
- 📍 Missing cue points
- ⚙️ High device count → freeze suggestion

---

## 📋 Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Build and run the extension in Live |
| `npm run build` | Build without running |
| `npm run package` | Production build (minified) |

---

## ⚠️ Limitations

- Extensions run in a **Node.js process** — not real-time
- No access to VST plugin names (only native Live devices and basic info)
- No waveform visualization
- No automation/envelope data
- Requires Ableton Live **Beta** with Extensions support
- The SDK is in **beta** — APIs may change

---

## 👤 Author

**Douglas Fugazi**  
Senior QA Automation Engineer & Electronic Music Producer  
🌐 [douglasfugazi.co](https://www.douglasfugazi.co)

---

## 📄 License

This project is provided as-is for educational and personal use.  
Built with the [Ableton Extensions SDK](https://www.ableton.com) (beta).

---

*📸 Project Snapshot — Because your music projects deserve a map.*
