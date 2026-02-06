import StaffCalculatorClient from './StaffCalculatorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Staff Calculator | How Many Employees Needed | DineOpen',
  description: 'Calculate how many staff you need for your restaurant. Based on covers, service style, and hours. Get kitchen, FOH, and management staffing recommendations.',
  keywords: 'restaurant staff calculator, how many waiters needed, restaurant employee calculator, kitchen staff requirements, FOH staffing, restaurant labor planning',
  openGraph: {
    title: 'Restaurant Staff Calculator | Employee Planning | DineOpen',
    description: 'Calculate optimal staffing levels for your restaurant based on covers and service style.',
    url: 'https://www.dineopen.com/tools/staff-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/staff-calculator' },
};

export default function StaffCalculatorPage() {
  return <StaffCalculatorClient />;
}
