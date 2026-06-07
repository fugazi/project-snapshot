# 📸 Project Snapshot — Ableton Live Extension

## Plan de Implementación

**Autor:** Douglas Fugazi  
**Co-creador:** Conito 🍦  
**Fecha:** 2025-06-07  
**Versión:** 1.0.0  
**Web:** https://www.douglasfugazi.co

---

## 1. Resumen del Proyecto

**Project Snapshot** es una extensión para Ableton Live que genera un reporte HTML interactivo y profesional con un resumen completo del proyecto actual. Diseñado para productores que retoman proyectos después de semanas o meses y necesitan entrar en contexto rápidamente.

**Problema:** "Project amnesia" — abres un proyecto viejo y no sabes dónde ibas.  
**Solución:** Un snapshot detallado del estado completo del proyecto en un HTML hermoso.

---

## 2. Arquitectura

```
project-snapshot/
├── manifest.json              # Metadatos de la extensión
├── package.json               # Dependencies y scripts
├── build.ts                   # esbuild config
├── tsconfig.json              # TypeScript config
├── .env                       # EXTENSION_HOST_PATH
├── src/
│   ├── extension.ts           # Entry point - activate()
│   ├── extractor.ts           # Extracción de datos del Live Set
│   ├── generator.ts           # Generación del HTML
│   ├── template.ts            # Template Deep Ink Luxury
│   └── utils.ts               # Helpers (formato, cálculos)
└── vendor/
    ├── ableton-extensions-sdk-1.0.0-beta.0.tgz
    └── ableton-extensions-cli-1.0.0-beta.0.tgz
```

---

## 3. Flujo de la Extensión

```
Usuario hace Right-Click en Live
         │
         ▼
"📸 Generate Project Snapshot"
         │
         ▼
Progress Dialog: "Analyzing project..."
         │
         ▼
extractor.ts recorre TODO el Set:
  ├── Song (tempo, time sig, scale, scenes, cue points)
  ├── Tracks (audio, MIDI, return, master)
  │   ├── Clips (nombre, tipo, duración, warp, loop)
  │   ├── Devices (nombre, tipo, parámetros + valores)
  │   └── Mixer (mute, solo, arm, volumen)
  ├── Drum Racks & Simplers
  └── MIDI Clips (notas, rango, densidad)
         │
         ▼
generator.ts + template.ts construyen el HTML
         │
         ▼
Se guarda en storageDirectory como:
  project-snapshot-YYYY-MM-DD-HHMMSS.html
         │
         ▼
Console log con la ruta del archivo
```

---

## 4. Datos a Extraer

### 4.1 Overview (Song Level)
| Dato | Fuente API |
|------|-----------|
| Tempo | `song.tempo` |
| Time Signature | `song.signatureNumerator` / `song.signatureDenominator` |
| Grid Quantization | `song.gridQuantization` |
| Grid Is Triplet | `song.gridIsTriplet` |
| Root Note | `song.rootNote` |
| Scale Name | `song.scaleName` |
| Scale Mode | `song.scaleMode` |
| Scale Intervals | `song.scaleIntervals` |
| # Tracks | `song.tracks.length` |
| # Scenes | `song.scenes.length` |
| # Cue Points | `song.cuePoints.length` |
| Main Track | `song.mainTrack` |

### 4.2 Tracks
| Dato | Fuente API |
|------|-----------|
| Nombre | `track.name` |
| Tipo | `instanceof AudioTrack / MidiTrack` |
| Arm | `track.arm` |
| Mute | `track.mute` |
| Solo | `track.solo` |
| Muted Via Solo | `track.mutedViaSolo` |
| # Clip Slots | `track.clipSlots.length` |
| # Devices | `track.devices.length` |
| Group Track | `track.groupTrack` |
| Arrangement Clips | `track.arrangementClips` |
| Mixer | `track.mixer` (volumen, pan, sends) |
| Take Lanes | `track.takeLanes` |

### 4.3 Clips
| Dato | Fuente API |
|------|-----------|
| Nombre | `clip.name` |
| Tipo | `instanceof AudioClip / MidiClip` |
| Warp Mode | `audioClip.warpMode` (AudioClip only) |
| Loop Settings | `clip.loopSettings` (looping, startMarker, endMarker, loopStart, loopEnd) |
| Duración | calculada de loop settings o clipSlot position |
| Notas MIDI | `midiClip.getNotes()` (MidiClip only) |

### 4.4 Devices & Parámetros
| Dato | Fuente API |
|------|-----------|
| Nombre | `device.name` |
| Tipo | `instanceof RackDevice / Simpler / Device` |
| Parámetros | `device.parameters` (nombre, valor, min, max, default, isQuantized) |
| Parent Track | `device.parent` |
| Chains (Rack) | `rackDevice.chains` (RackDevice only) |
| Chains (DrumRack) | `drumRack.chains` (DrumRack only) |

### 4.5 Escenas
| Dato | Fuente API |
|------|-----------|
| Nombre | `scene.name` |
| Tempo | `scene.tempo` |
| Time Signature | `scene.signatureNumerator` / `scene.signatureDenominator` |

### 4.6 Cue Points
| Dato | Fuente API |
|------|-----------|
| Nombre | `cuePoint.name` |

---

## 5. Template HTML — Deep Ink Luxury

### 5.1 Estructura del Reporte

```
┌─────────────────────────────────────┐
│ 📸 PROJECT SNAPSHOT                 │
│ Generated: YYYY-MM-DD HH:MM        │
│ ─────────────────────────────────── │
│ 🎯 OVERVIEW                        │  ← Nav menu (sticky)
│ Tempo | Key | Time Sig | Tracks    │
│ ─────────────────────────────────── │
│ 📊 QUICK STATS                     │
│ [Cards con estadísticas visuales]   │
│ ─────────────────────────────────── │
│ 🎵 TRACKS                          │
│ [Tabla/lista de tracks con estado]  │
│ ─────────────────────────────────── │
│ 🎹 CLIPS DETAIL                    │
│ [Por track, clips con propiedades]  │
│ ─────────────────────────────────── │
│ 🔌 DEVICES & PARAMETERS            │
│ [Devices por track con params]      │
│ ─────────────────────────────────── │
│ 🥁 RACKS & SAMPLERS               │
│ [Drum racks, Simplers, chains]      │
│ ─────────────────────────────────── │
│ 🎼 MIDI NOTES                      │
│ [Resumen de notas por MIDI clip]    │
│ ─────────────────────────────────── │
│ 📍 SCENES & CUE POINTS             │
│ [Escenas y marcadores]             │
│ ─────────────────────────────────── │
│ 📝 NOTES                           │
│ [Campo de notas editable]           │
│ ─────────────────────────────────── │
│ 💡 SUGGESTED NEXT STEPS            │
│ [Recomendaciones basadas en el Set] │
│ ─────────────────────────────────── │
│ ── Scroll to Top / Bottom ──       │
│ Share button (copy path)            │
│ ─────────────────────────────────── │
│ Created by Douglas Fugazi           │
│ https://www.douglasfugazi.co        │
└─────────────────────────────────────┘
```

### 5.2 Paleta Deep Ink Luxury
- **Fondos:** `#00131a`, `#041f2a`, `#0a2d3b`
- **Texto:** `#fcf1e5` (warm cream)
- **Acentos:** Teal `#48d0ce` + Flame `#fc6b3c`
- **Fuentes:** Nunito (títulos), Space Grotesk (cuerpo), JetBrains Mono (código/labels)

### 5.3 Componentes UI
- **Sticky nav** con scroll spy a cada sección
- **Stats cards** con iconos y gradientes
- **Track cards** con estado visual (arm = rojo, mute = gris, solo = amarillo)
- **Device accordions** expandibles
- **Progress bars** para parámetros (valor vs rango)
- **Notes textarea** con localStorage para persistir
- **Share button** (copia la ruta del archivo al clipboard)
- **Scroll to top/bottom** buttons flotantes
- **Footer** con firma Douglas Fugazi

### 5.4 Next Steps (Inteligencia básica)
El reporte generará sugerencias basadas en el estado del proyecto:
- Si hay tracks vacíos → "Consider removing empty tracks to clean up"
- Si hay clips sin nombre → "Rename your clips for better organization"
- Si hay tracks armados → "⚠️ Tracks are armed — ready to record?"
- Si no hay escenas → "Add scenes to organize your Session View"
- Si hay muchos devices sin parámetros modificados → "Tweak device parameters for unique sounds"
- Si el tempo es default (120) → "Consider experimenting with different tempos"
- Si no hay cue points → "Add cue points for easy navigation"
- Si hay tracks muted/solo → "Review muted and soloed tracks"

---

## 6. Plan de Implementación por Pasos

### Paso 1: Setup del proyecto ✅
- Crear estructura de carpetas
- Configurar `package.json`, `manifest.json`, `tsconfig.json`, `build.ts`
- Copiar vendor tgz del SDK

### Paso 2: Extractor de datos (extractor.ts)
- Crear interfaces TypeScript para los datos extraídos
- Implementar funciones de extracción por categoría:
  - `extractOverview(song)` → tempo, key, time sig, stats
  - `extractTracks(song)` → tracks con propiedades
  - `extractClips(track)` → clips con detalles
  - `extractDevices(track)` → devices con parámetros
  - `extractScenes(song)` → escenas
  - `extractCuePoints(song)` → cue points
  - `extractMidiInfo(midiClip)` → notas, rango, densidad
  - `extractRacks(device)` → drum racks, chains, simplers

### Paso 3: Generador HTML (generator.ts + template.ts)
- Template Deep Ink Luxury inline en TypeScript
- Sistema de componentes (header, stats, tracks, devices, etc.)
- Renderizado del HTML completo con datos inyectados
- Emojis apropiados por sección
- JavaScript embebido para:
  - Notes textarea con localStorage
  - Share button (clipboard API)
  - Scroll to top/bottom
  - Accordion para devices
  - Smooth scroll nav

### Paso 4: Entry point (extension.ts)
- Función `activate()` con SDK
- Registrar comando `project-snapshot.generate`
- Registrar context menu en múltiples scopes
- Progress dialog durante análisis
- Guardar HTML en storageDirectory
- Logging de la ruta del archivo

### Paso 5: Build & Packaging
- esbuild config para bundling
- Script de build y start
- Testing manual en Live

---

## 7. Archivos a Crear

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | `manifest.json` | Nombre, autor, entry point, versión |
| 2 | `package.json` | Dependencies, scripts |
| 3 | `tsconfig.json` | TypeScript config |
| 4 | `build.ts` | esbuild bundler |
| 5 | `.env` | EXTENSION_HOST_PATH (vacío, usuario lo configura) |
| 6 | `src/extension.ts` | Entry point - activate + commands |
| 7 | `src/extractor.ts` | Extracción de datos del Live Set |
| 8 | `src/types.ts` | Interfaces TypeScript para los datos |
| 9 | `src/generator.ts` | Generación del HTML con datos |
| 10 | `src/template.ts` | Template Deep Ink Luxury HTML/CSS/JS |

---

## 8. Estimación de Complejidad

| Componente | Complejidad | Notas |
|-----------|-------------|-------|
| Setup proyecto | Baja | Template del SDK |
| extractor.ts | Media | Recorrer el árbol del Live Set |
| template.ts | Media-Alta | HTML/CSS/JS embebido, Deep Ink Luxury |
| generator.ts | Media | Ensamblar datos + template |
| extension.ts | Baja | Pegar todo con el SDK |
| **Total** | **Media** | ~500-700 líneas de código |

---

## 9. Notas Importantes

- **Idioma:** UI de la extensión en inglés (menus, labels)
- **Template:** Deep Ink Luxury (template 3) para el HTML
- **Firma:** "Created by Douglas Fugazi" + https://www.douglasfugazi.co
- **SDK:** v1.0.0-beta.0 (puede haber cambios en futuras versiones)
- **Node.js:** Requiere ≥ 24.14.1
- **Ableton Live:** Requiere Live Beta con Developer Mode habilitado
