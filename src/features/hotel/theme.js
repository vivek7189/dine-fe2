// Shared visual language for the hotel PMS — warm editorial palette, serif
// display, brass accent. Matches the approved "Cardamom House" front-desk design.
// Kept as class-string tokens so every hotel page stays consistent.

export const T = {
  canvas: 'bg-[var(--h-canvas)]',
  card: 'rounded-2xl border border-[var(--h-border)] bg-white shadow-[0_1px_2px_rgba(40,33,20,0.05)]',
  cardHover: 'hover:border-[var(--h-brand-tint2)] hover:shadow-[0_4px_16px_rgba(40,33,20,0.06)]',
  serif: 'font-serif',
  h1: 'font-serif text-[28px] font-bold leading-tight tracking-[-0.01em] text-[var(--h-ink)]',
  h2: 'font-serif text-[18px] font-bold text-[var(--h-ink)]',
  sub: 'text-[13.5px] text-[var(--h-text)]',
  label: 'text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--h-muted)]',
  ink: 'text-[var(--h-ink)]',
  muted: 'text-[var(--h-text)]',
  faint: 'text-[var(--h-faint)]',
  brass: 'var(--h-brand)',
  brassBtn: 'bg-[var(--h-brand)] text-white hover:bg-[var(--h-brand-ink)] shadow-sm',
  brassText: 'text-[var(--h-brand)]',
  ghostBtn: 'border border-[var(--h-border2)] bg-white text-[var(--h-ink2)] hover:bg-[var(--h-hover)]',
};

// status → { bar (solid), soft chip bg+text, dot }. Clean, modern palette.
export const STATUS = {
  occupied:     { solid: '#2563EB', chip: 'bg-[#EFF5FF] text-[#1D4ED8]', dot: 'bg-[#2563EB]', label: 'Occupied' },
  available:    { solid: '#059669', chip: 'bg-[#ECFDF5] text-[#047857]', dot: 'bg-[#059669]', label: 'Vacant · clean' },
  dirty:        { solid: '#D97706', chip: 'bg-[#FFF7ED] text-[#B45309]', dot: 'bg-[#D97706]', label: 'Vacant · dirty' },
  arriving:     { solid: '#7C3AED', chip: 'bg-[#F5F3FF] text-[#6D28D9]', dot: 'bg-[#7C3AED]', label: 'Arriving' },
  'out-of-order': { solid: '#E11D48', chip: 'bg-[#FFF1F2] text-[#BE123C]', dot: 'bg-[#E11D48]', label: 'Out of order' },
};

// reservation/folio state chips
export const CHIP = {
  confirmed:  'bg-[#EEEAF6] text-[#5A4A85]',
  guaranteed: 'bg-[#EEEAF6] text-[#5A4A85]',
  checked_in: 'bg-[#EAF0F5] text-[#3F5C79]',
  in_house:   'bg-[#EAF0F5] text-[#3F5C79]',
  settled:    'bg-[#E7F1EA] text-[#356B4E]',
  checked_out:'bg-[var(--h-chip)] text-[var(--h-text2)]',
  city_ledger:'bg-[var(--h-brand-tint)] text-[var(--h-brand-ink)]',
  cancelled:  'bg-[var(--h-canvas2)] text-[var(--h-muted2)]',
  balance:    'bg-[#F5E6E2] text-[#8A3F31]',
};

export function Chip({ tone, children }) {
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${CHIP[tone] || 'bg-[var(--h-chip)] text-[var(--h-text2)]'}`}>{children}</span>;
}
