'use client';

// Pick a time from a list (every 15 minutes, shown as 9:00 AM …) instead of typing it — typed times
// went wrong (MFC). The value stays 'HH:MM' (24 h). A stored value that isn't on a 15-minute step is
// kept as its own option so editing never silently changes it.
const pad = (n) => String(n).padStart(2, '0');
export const time12 = (hhmm) => {
  const [h, m] = String(hhmm || '').split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm || '';
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${pad(m)} ${period}`;
};
const STEPS = Array.from({ length: 96 }, (_, i) => `${pad(Math.floor(i / 4))}:${pad((i % 4) * 15)}`);

export default function TimeSelect({ value, onChange, style, disabled, required, ariaLabel }) {
  const v = /^([01]\d|2[0-3]):[0-5]\d$/.test(value || '') ? value : '';
  const options = v && !STEPS.includes(v) ? [...STEPS, v].sort() : STEPS;
  return (
    <select value={v} onChange={(e) => onChange(e.target.value)} style={style} disabled={disabled} required={required} aria-label={ariaLabel}>
      {!v && <option value="">Select time</option>}
      {options.map((t) => <option key={t} value={t}>{time12(t)}</option>)}
    </select>
  );
}
