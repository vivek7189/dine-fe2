import IceCreamParlorsClient from './IceCreamParlorsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Ice Cream Parlors India | Gelato & Frozen Desserts | DineOpen',
  description: 'Best POS for ice cream parlors, gelato shops & frozen dessert stores in India. Scoop billing, combo offers, loyalty programs, seasonal menu management. ₹999/month.',
  keywords: 'ice cream parlor POS India, gelato shop software, frozen dessert billing, scoop billing software, ice cream shop management, dessert parlor POS',
  openGraph: {
    title: 'POS Software for Ice Cream Parlors India | DineOpen',
    description: 'Best POS for ice cream parlors with scoop billing, combo offers, and loyalty programs.',
    url: 'https://www.dineopen.com/for/ice-cream-parlors',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/for/ice-cream-parlors' },
};

export default function IceCreamParlorsPage() {
  return <IceCreamParlorsClient />;
}
