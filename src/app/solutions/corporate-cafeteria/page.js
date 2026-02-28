import CorporateCafeteriaClient from './CorporateCafeteriaClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Corporate Cafeteria POS Software | DineOpen',
  description: 'Streamline corporate cafeteria operations with employee ID-based ordering, meal plans, payroll integration, and consumption analytics. Go cashless with DineOpen.',
  keywords: 'corporate cafeteria POS, employee meal management, cafeteria software, payroll meal deduction, cashless cafeteria, DineOpen, office cafeteria system',
  openGraph: {
    title: 'Corporate Cafeteria POS Software | DineOpen',
    description: 'Streamline corporate cafeteria operations with employee ID-based ordering, meal plans, payroll integration, and consumption analytics. Go cashless with DineOpen.',
    url: 'https://www.dineopen.com/solutions/corporate-cafeteria',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Corporate Cafeteria POS Software | DineOpen',
    description: 'Streamline corporate cafeteria operations with employee ID-based ordering, meal plans, payroll integration, and consumption analytics. Go cashless with DineOpen.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/solutions/corporate-cafeteria',
  },
};

export default function CorporateCafeteriaPage() {
  return <CorporateCafeteriaClient />;
}
