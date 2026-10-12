// When may a REQUIRED desktop update restart the app by itself? (DesktopUpdatePrompt)
// Only when: the update is downloaded, the grace time (or one 15-min postpone) is over, and nobody
// has touched the till for a full minute. Never otherwise.
export const IDLE_MS = 60 * 1000;

export function updateDeadline({ firstSeen, graceMinutes, snoozedUntil }) {
  const grace = (Number(graceMinutes) > 0 ? Number(graceMinutes) : 30) * 60000;
  return Math.max(Number(firstSeen) + grace, Number(snoozedUntil) || 0);
}

export function shouldAutoRestart({ state, now, deadline, lastInput, idleMs = IDLE_MS }) {
  return state === 'ready' && now >= deadline && now - lastInput >= idleMs;
}
