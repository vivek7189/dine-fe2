// Shared mobile detection logic
// Electron desktop POS terminals always use desktop layout regardless of screen size

/**
 * Returns true if the current environment should never use mobile layout.
 * Currently: Electron desktop apps and tablet POS terminals (e.g. Foodics).
 */
export function isForceDesktop() {
  if (typeof window === 'undefined') return false;
  return !!window.electronAPI || !!window.__DINEOPEN_FORCE_DESKTOP__;
}

/**
 * Standard mobile breakpoint check, with Electron override.
 * Use this in useEffect for resize-based mobile detection.
 */
export function checkIsMobile(breakpoint = 768) {
  if (isForceDesktop()) return false;
  return typeof window !== 'undefined' && window.innerWidth <= breakpoint;
}
