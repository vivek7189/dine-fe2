import StaffManagementClient from './StaffManagementClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Staff Management Software | DineOpen',
  description: 'Simplify staff scheduling, attendance tracking, and performance reports for your restaurant. Manage shifts, clock-ins, and team performance in one place.',
  keywords: 'staff management software, restaurant scheduling, employee attendance tracking, shift management, restaurant workforce management',
  openGraph: {
    title: 'Restaurant Staff Management | DineOpen',
    description: 'Simplify staff scheduling, attendance tracking, and performance reports for your restaurant.',
    url: 'https://www.dineopen.com/features/staff-management',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant Staff Management | DineOpen',
    description: 'Simplify staff scheduling, attendance tracking, and performance reports for your restaurant.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/features/staff-management',
  },
};

export default function StaffManagementPage() {
  return <StaffManagementClient />;
}
