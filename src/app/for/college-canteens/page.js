import CollegeCanteensClient from './CollegeCanteensClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for College Canteens | Student Billing | DineOpen',
  description: 'Best billing software for college and university canteens. Student ID integration, wallet system, fast billing for rush hours, and analytics.',
  keywords: 'college canteen software, university canteen POS, student canteen billing, campus canteen management, college mess software, student cafeteria POS',
  openGraph: {
    title: 'POS Software for College Canteens | DineOpen',
    description: 'Manage college canteen operations with student ID integration and fast billing.',
    url: 'https://www.dineopen.com/for/college-canteens',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/for/college-canteens' },
};

export default function CollegeCanteensPage() {
  return <CollegeCanteensClient />;
}
