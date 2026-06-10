// Shared mobile detection logic
// Electron desktop POS terminals always use desktop layout regardless of screen size

/**
 * Returns true if the current environment should never use mobile layout.
 * Currently: Electron desktop apps (POS terminals with small screens).
 */
export function isForceDesktop() {
  return typeof window !== 'undefined' && !!window.electronAPI;
}

/**
 * Standard mobile breakpoint check, with Electron override.
 * Use this in useEffect for resize-based mobile detection.
 */
export function checkIsMobile(breakpoint = 768) {
  if (isForceDesktop()) return false;
  return typeof window !== 'undefined' && window.innerWidth <= breakpoint;
}
