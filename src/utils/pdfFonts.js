/**
 * Shared PDF font registration for @react-pdf/renderer.
 *
 * Noto Sans ('all' subset) covers Latin, Cyrillic, Greek, Vietnamese and Devanagari (Hindi) only.
 * Tamil and Telugu live in their own Noto families, so those are
 * registered separately and used as FALLBACKS: react-pdf picks, per character, the first font in
 * the list that has the glyph. Without them Tamil item names print as garbage (e.g. "¤ËšÈ").
 * Arabic, Kannada and Malayalam are intentionally NOT in the stack: tested with react-pdf 4.3 glyph
 * fallback they render with dropped / wrong letters, which is worse than leaving them as they were.
 *
 * Usage: import { PDF_FONT_STACK } from '.../utils/pdfFonts'; then `fontFamily: PDF_FONT_STACK`
 * (with fontWeight: 700 for bold).
 */
import { Font } from '@react-pdf/renderer';

const CDN = 'https://cdn.jsdelivr.net/npm/@fontsource';

Font.register({
  family: 'NotoSans',
  fonts: [
    { src: `${CDN}/noto-sans/files/noto-sans-all-400-normal.woff`, fontWeight: 400 },
    { src: `${CDN}/noto-sans/files/noto-sans-all-700-normal.woff`, fontWeight: 700 },
  ],
});

// Script fallbacks — [family name, fontsource package/subset]
const SCRIPT_FONTS = [
  ['NotoSansTamil', 'tamil'],
  ['NotoSansTelugu', 'telugu'],
];

for (const [family, script] of SCRIPT_FONTS) {
  Font.register({
    family,
    fonts: [
      { src: `${CDN}/noto-sans-${script}/files/noto-sans-${script}-${script}-400-normal.woff`, fontWeight: 400 },
      { src: `${CDN}/noto-sans-${script}/files/noto-sans-${script}-${script}-700-normal.woff`, fontWeight: 700 },
    ],
  });
}

// Primary font first, then the per-script fallbacks.
export const PDF_FONT_STACK = ['NotoSans', ...SCRIPT_FONTS.map(([family]) => family)];

// Disable word hyphenation — prevents breaking non-Latin words incorrectly
Font.registerHyphenationCallback(word => [word]);
