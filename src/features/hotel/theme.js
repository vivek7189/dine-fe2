// Shared visual language for the hotel PMS — warm editorial palette, serif
// display, brass accent. Matches the approved "Cardamom House" front-desk design.
// Kept as class-string tokens so every hotel page stays consistent.

export const T = {
  canvas: 'bg-[#F6F3EC]',
  card: 'rounded-2xl border border-[#EBE4D6] bg-white shadow-[0_1px_2px_rgba(40,33,20,0.05)]',
  cardHover: 'hover:border-[#DFD4BE] hover:shadow-[0_4px_16px_rgba(40,33,20,0.06)]',
  serif: 'font-serif',
  h1: 'font-serif text-[28px] font-semibold leading-tight tracking-[-0.01em] text-[#2A241B]',
  h2: 'font-serif text-[19px] font-semibold text-[#2A241B]',
  sub: 'text-[13.5px] text-[#9A9081]',
  label: 'text-[11px] font-medium uppercase tracking-[0.08em] text-[#A79C88]',
  ink: 'text-[#2A241B]',
  muted: 'text-[#6E6656]',
  faint: 'text-[#A79C88]',
  brass: '#9A7B45',
  brassBtn: 'bg-[#9A7B45] text-white hover:bg-[#876A3A] shadow-sm',
  brassText: 'text-[#9A7B45]',
  ghostBtn: 'border border-[#DDD4C2] bg-white text-[#4A4335] hover:bg-[#F3EFE6]',
};

// status → { bar (solid), soft chip bg+text, dot }
export const STATUS = {
  occupied:     { solid: '#4E6E8E', chip: 'bg-[#EAF0F5] text-[#3F5C79]', dot: 'bg-[#4E6E8E]', label: 'Occupied' },
  available:    { solid: '#3E7C5A', chip: 'bg-[#E7F1EA] text-[#356B4E]', dot: 'bg-[#3E7C5A]', label: 'Vacant · clean' },
  dirty:        { solid: '#B58836', chip: 'bg-[#F6EEDD] text-[#8A6721]', dot: 'bg-[#B58836]', label: 'Vacant · dirty' },
  arriving:     { solid: '#6D5B9A', chip: 'bg-[#EEEAF6] text-[#5A4A85]', dot: 'bg-[#6D5B9A]', label: 'Arriving' },
  'out-of-order': { solid: '#9B4A3A', chip: 'bg-[#F5E6E2] text-[#8A3F31]', dot: 'bg-[#9B4A3A]', label: 'Out of order' },
};

// reservation/folio state chips
export const CHIP = {
  confirmed:  'bg-[#EEEAF6] text-[#5A4A85]',
  guaranteed: 'bg-[#EEEAF6] text-[#5A4A85]',
  checked_in: 'bg-[#EAF0F5] text-[#3F5C79]',
  in_house:   'bg-[#EAF0F5] text-[#3F5C79]',
  settled:    'bg-[#E7F1EA] text-[#356B4E]',
  checked_out:'bg-[#EFEAE0] text-[#7A6F58]',
  city_ledger:'bg-[#F1E8D6] text-[#876A3A]',
  cancelled:  'bg-[#F0EBE1] text-[#9A9081]',
  balance:    'bg-[#F5E6E2] text-[#8A3F31]',
};

export function Chip({ tone, children }) {
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${CHIP[tone] || 'bg-[#EFEAE0] text-[#7A6F58]'}`}>{children}</span>;
}
