# DineOpen POS — Build Guide

## Electron Desktop App (macOS DMG)

```bash
cd dine-frontend
npm run electron:build
```

**Output:** `dist-electron/DineOpen POS-{version}-arm64.dmg`

**Key files:**
- `electron/main.js` — Main process
- `electron/preload.js` — Context bridge
- `electron-builder.yml` — Build config
- `scripts/build-electron.js` — Pre-build script (static export)

**Version:** Set in `package.json` → `version` field

---

## Capacitor Android App (APK / AAB for Play Store)

### Prerequisites
- Android SDK installed (`~/Library/Android/sdk`)
- Java 17+

### Build APK (for direct install / testing)

```bash
cd dine-frontend
npx cap sync android
cd android && ./gradlew assembleRelease
```

**Output:** `android/app/build/outputs/apk/release/app-release.apk`

### Build AAB (for Google Play Store)

```bash
cd dine-frontend
npx cap sync android
cd android && ./gradlew bundleRelease
```

**Output:** `android/app/build/outputs/bundle/release/app-release.aab`

### Signing Key

**Location:** `android/dineopen-upload-key.jks`
- **Alias:** `dineopen`
- **Password:** `dineopen2026`
- **SHA1:** `F0:70:0F:CD:6B:A9:16:68:40:2F:9D:71:03:2A:71:7E:AB:CB:0D:22`

This is the same key registered with Google Play. DO NOT lose this file.
A backup copy is at `/Users/vivek/misc/dineopen-upload-key.jks`.

**Configured in:** `android/app/build.gradle` → `signingConfigs.release`

### Key files:
- `capacitor.config.ts` — App ID, server URL, Android config
- `android/app/build.gradle` — Version, signing, dependencies
- `android/app/src/main/AndroidManifest.xml` — Permissions
- `android/app/src/main/java/com/dineopen/pos/MainActivity.java` — Plugin registration
- `plugins/capacitor-dine-printer/` — Custom Bluetooth/USB thermal printer plugin

### Version
Set in `android/app/build.gradle`:
- `versionCode` — Integer, must increment each Play Store upload
- `versionName` — Display version (e.g., "1.5.0")

### Play Store
- **Package ID:** `com.dineopen.pos`
- **Console:** https://play.google.com/console
- Upload AAB to **Testing > Internal testing** for testers

---

## Project Structure (native apps)

```
dine-frontend/
├── electron/              # Electron desktop app (macOS/Windows)
│   ├── main.js
│   ├── preload.js
│   └── offline.js
├── android/               # Capacitor Android app
│   ├── app/build.gradle
│   ├── dineopen-upload-key.jks  (git-ignored)
│   └── app/src/main/
├── plugins/
│   └── capacitor-dine-printer/  # Custom printer plugin
│       ├── android/             # Java implementation
│       └── src/                 # TypeScript definitions
├── src-tauri/             # Tauri desktop (legacy, moved to Electron)
├── capacitor.config.ts    # Capacitor config
├── electron-builder.yml   # Electron builder config
└── package.json           # Version for Electron
```

## NOTE: dine-app is a SEPARATE project
`dine-app/` under `dine/` is a different app (React Native KOT printer).
It has its own `release.keystore` and is NOT related to this build.
