import QRMenuMakerClient from './QRMenuMakerClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Free QR Menu Maker Online — Create & Download in 30 Sec [No Login] | DineOpen',
  description: 'Free QR menu maker for restaurants — create, customize & download QR code menus instantly. Add your restaurant name, logo colors & menu link. Print-ready QR codes. No signup, no watermark, 100% free.',
  keywords: 'free qr menu maker, qr menu maker online free, qr code menu maker, restaurant qr code maker, free qr menu maker for restaurant, qr menu generator free, digital menu qr code, qr code for restaurant menu free, menu qr code generator, qr menu card maker',
  openGraph: {
    title: 'Free QR Menu Maker — Create & Download in 30 Sec [No Login] | DineOpen',
    description: 'Create free QR code menus for your restaurant. Customize colors, add your brand. Download print-ready QR instantly. No signup needed.',
    url: 'https://www.dineopen.com/tools/qr-menu-maker',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free QR Menu Maker [No Login, No Watermark] | DineOpen',
    description: 'Create restaurant QR menus in 30 seconds. Customize & download free. No signup.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/qr-menu-maker',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I make a QR code for my restaurant menu for free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Use DineOpen's free QR menu maker: 1) Enter your restaurant name, 2) Paste your menu link or website URL, 3) Choose your brand color, 4) Click Generate and download. No signup, no watermark, no fees. The QR code is print-ready at 1024x1024 pixels."
      }
    },
    {
      "@type": "Question",
      "name": "Is this QR menu maker really free with no watermark?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, 100% free with no watermark, no login required, and no limits on how many QR codes you generate. The QR code is generated entirely in your browser — your data never leaves your device."
      }
    },
    {
      "@type": "Question",
      "name": "Can I customize the QR code color to match my restaurant brand?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, you can choose any color for your QR code using the color picker. Match it to your restaurant's brand colors for a professional look on table tents, menu cards, and signage."
      }
    },
    {
      "@type": "Question",
      "name": "What size QR code should I print for restaurant tables?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "For table tents and menu cards, print at 2-3 inches (5-8 cm). For wall posters or standees, print at 6-8 inches. DineOpen generates high-resolution QR codes (1024x1024 pixels) that look sharp at any print size."
      }
    },
    {
      "@type": "Question",
      "name": "Do customers need an app to scan the QR menu?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No app needed. Customers simply open their phone camera, point it at the QR code, and tap the link that appears. Works on all modern iPhones (iOS 11+) and Android phones. The menu opens directly in their browser."
      }
    }
  ]
};

export default function QRMenuMakerPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <QRMenuMakerClient />
    </>
  );
}
