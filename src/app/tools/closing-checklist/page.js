import ClosingChecklistClient from './ClosingChecklistClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Closing Checklist | End-of-Day Tasks | DineOpen',
  description: 'Free restaurant closing checklist. Daily end-of-day tasks for kitchen, front-of-house, cash handling, and security. Never miss a closing task again.',
  keywords: 'restaurant closing checklist, end of day checklist restaurant, restaurant closing duties, restaurant closing procedures, closing shift checklist',
  openGraph: {
    title: 'Restaurant Closing Checklist | DineOpen',
    description: 'Complete end-of-day checklist for restaurants. Kitchen, FOH, cash, and security tasks.',
    url: 'https://www.dineopen.com/tools/closing-checklist',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/closing-checklist' },
};

export default function ClosingChecklistPage() {
  return <ClosingChecklistClient />;
}
