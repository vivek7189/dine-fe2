// Platform detection for Capacitor (Android), Tauri (Desktop), and Web
// Used to conditionally enable native features (printing, etc.)

/** Capacitor (Android phone/tablet) */
export function isCapacitor() {
  return typeof window !== 'undefined' &&
    window.Capacitor !== undefined &&
    window.Capacitor.isNativePlatform();
}

/** Tauri v2 (Windows/Mac desktop) */
export function isTauri() {
  return typeof window !== 'undefined' &&
    window.__TAURI_INTERNALS__ !== undefined;
}

/** Standard web browser (not wrapped in native shell) */
export function isWeb() {
  return !isCapacitor() && !isTauri();
}

/** Returns 'capacitor' | 'tauri' | 'web' */
export function getPlatform() {
  if (isCapacitor()) return 'capacitor';
  if (isTauri()) return 'tauri';
  return 'web';
}
