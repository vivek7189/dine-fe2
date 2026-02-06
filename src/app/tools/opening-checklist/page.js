import OpeningChecklistClient from './OpeningChecklistClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Opening Checklist | Start a Restaurant | DineOpen',
  description: 'Complete checklist for opening a restaurant in India. Step-by-step guide covering licenses, equipment, staff, and launch preparation.',
  keywords: 'restaurant opening checklist, how to open restaurant india, restaurant startup checklist, new restaurant checklist, restaurant launch checklist',
  openGraph: {
    title: 'Restaurant Opening Checklist | DineOpen',
    description: 'Complete step-by-step checklist for opening a restaurant in India.',
    url: 'https://www.dineopen.com/tools/opening-checklist',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/opening-checklist' },
};

export default function OpeningChecklistPage() {
  return <OpeningChecklistClient />;
}
