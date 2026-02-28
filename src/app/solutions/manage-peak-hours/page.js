import ManagePeakHoursClient from './ManagePeakHoursClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Manage Restaurant Peak Hours | DineOpen',
  description: 'Handle lunch rush and dinner crowds with ease. Kitchen display prioritization, prep alerts, staff scheduling, and rush analytics for restaurants with DineOpen.',
  keywords: 'peak hour management, restaurant rush hour, kitchen display system, staff scheduling, order prioritization, DineOpen, restaurant operations',
  openGraph: {
    title: 'Manage Restaurant Peak Hours | DineOpen',
    description: 'Handle lunch rush and dinner crowds with ease. Kitchen display prioritization, prep alerts, staff scheduling, and rush analytics for restaurants with DineOpen.',
    url: 'https://www.dineopen.com/solutions/manage-peak-hours',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Manage Restaurant Peak Hours | DineOpen',
    description: 'Handle lunch rush and dinner crowds with ease. Kitchen display prioritization, prep alerts, staff scheduling, and rush analytics for restaurants with DineOpen.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/solutions/manage-peak-hours',
  },
};

export default function ManagePeakHoursPage() {
  return <ManagePeakHoursClient />;
}
