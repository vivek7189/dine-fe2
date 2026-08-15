// Corporate Meal module — design tokens + reusable style helpers.
// Uses DineOpen's OWN brand palette (red primary, no purple) so the module feels native while
// living in its own self-contained folder. Every corporate page/component styles through this,
// so the look stays consistent and rich without repetition.

export const C = {
  // Brand
  primary: '#dc2626',
  primaryLight: '#ef4444',
  grad: 'linear-gradient(135deg, #ef4444, #dc2626)',
  gradSoft: 'linear-gradient(135deg, #fff5f5, #ffffff)',
  primarySoft: '#fef2f2',
  primaryBorder: '#fecaca',

  // Ink / text
  ink: '#111827',
  ink2: '#1f2937',
  muted: '#6b7280',
  faint: '#9ca3af',

  // Surfaces
  surface: '#ffffff',
  surface2: '#f8fafc',
  surface3: '#f1f5f9',
  border: '#e5e7eb',
  borderSoft: '#f1f5f9',

  // Semantic accents
  green: '#16a34a', greenSoft: '#f0fdf4', greenBorder: '#bbf7d0',
  amber: '#d97706', amberSoft: '#fffbeb', amberBorder: '#fde68a',
  blue: '#2563eb', blueSoft: '#eff6ff', blueBorder: '#bfdbfe',
  slate: '#475569',

  // Shape
  radius: 16,
  radiusSm: 10,
  radiusPill: 999,
  shadow: '0 2px 12px rgba(0,0,0,0.06)',
  shadowLg: '0 16px 40px rgba(0,0,0,0.14)',
  ring: '0 0 0 3px rgba(220,38,38,0.12)',
};

// ── Reusable style objects ─────────────────────────────────────────
export const S = {
  page: { padding: '24px 28px', maxWidth: 1180, margin: '0 auto' },

  card: {
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.radius,
    boxShadow: C.shadow,
  },
  cardPad: { padding: 20 },

  h1: { fontSize: 24, fontWeight: 800, color: C.ink, margin: 0, letterSpacing: '-0.01em' },
  h2: { fontSize: 17, fontWeight: 700, color: C.ink, margin: 0 },
  sub: { fontSize: 13.5, color: C.muted, margin: '4px 0 0' },
  label: { fontSize: 12.5, fontWeight: 600, color: C.ink2, marginBottom: 6, display: 'block' },
  eyebrow: { fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.faint },

  input: {
    width: '100%', padding: '11px 13px', borderRadius: C.radiusSm, border: `1px solid ${C.border}`,
    fontSize: 14, background: C.surface2, outline: 'none', color: C.ink, boxSizing: 'border-box',
  },

  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '11px 18px', borderRadius: C.radiusSm, border: 'none', cursor: 'pointer',
    background: C.grad, color: '#fff', fontWeight: 700, fontSize: 14,
    boxShadow: '0 4px 14px rgba(220,38,38,0.28)',
  },
  btnGhost: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '10px 16px', borderRadius: C.radiusSm, border: `1px solid ${C.border}`, cursor: 'pointer',
    background: C.surface, color: C.ink2, fontWeight: 600, fontSize: 13.5,
  },
  btnDanger: {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: C.radiusSm,
    border: `1px solid ${C.primaryBorder}`, cursor: 'pointer', background: C.primarySoft, color: C.primary,
    fontWeight: 600, fontSize: 12.5,
  },
};

// Status pill styling (active / inactive / booked / consumed / etc.)
export function statusPill(kind) {
  const map = {
    active: [C.green, C.greenSoft, C.greenBorder],
    consumed: [C.green, C.greenSoft, C.greenBorder],
    booked: [C.blue, C.blueSoft, C.blueBorder],
    inactive: [C.muted, C.surface3, C.border],
    cancelled: [C.primary, C.primarySoft, C.primaryBorder],
    pending: [C.amber, C.amberSoft, C.amberBorder],
  };
  const [color, bg, border] = map[kind] || map.inactive;
  return {
    display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: C.radiusPill,
    fontSize: 11.5, fontWeight: 700, color, background: bg, border: `1px solid ${border}`,
    textTransform: 'capitalize',
  };
}

export const money = (n, sym = '₹') => `${sym}${(Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
