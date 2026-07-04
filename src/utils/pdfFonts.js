/**
 * Shared PDF font registration for @react-pdf/renderer.
 *
 * Registers Noto Sans which covers Latin, Tamil, Hindi, Arabic, Bengali,
 * Telugu, Kannada, Malayalam, Gujarati, and many other scripts.
 *
 * Usage: import this file once at the top of any PDF component.
 *   import '../../../utils/pdfFonts';
 *
 * Then use fontFamily: 'NotoSans' in styles, with fontWeight: 700 for bold.
 */
import { Font } from '@react-pdf/renderer';

Font.register({
  family: 'NotoSans',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans/files/noto-sans-all-400-normal.woff', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans/files/noto-sans-all-700-normal.woff', fontWeight: 700 },
  ],
});

// Disable word hyphenation — prevents breaking non-Latin words incorrectly
Font.registerHyphenationCallback(word => [word]);
