import { Noto_Sans_Devanagari } from 'next/font/google';
import CommonHeader from '../../components/CommonHeader';
import Footer from '../../components/Footer';

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-noto-devanagari',
});

export default function HindiLayout({ children }) {
  return (
    <div lang="hi" dir="ltr" className={notoDevanagari.variable}
         style={{ fontFamily: 'var(--font-noto-devanagari), Inter, sans-serif' }}>
      <CommonHeader />
      {children}
      <Footer />
    </div>
  );
}
