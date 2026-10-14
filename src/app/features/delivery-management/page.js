import DeliveryManagementClient from './DeliveryManagementClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Delivery Order Management Software | DineOpen',
  description: 'Manage direct delivery orders and record Zomato/Swiggy orders on the POS so every platform shows up in one set of reports. Route to kitchen and analyze platform revenue with DineOpen.',
  keywords: 'delivery management software, restaurant delivery system, Zomato Swiggy sales tracking, delivery order tracking, commission-free online ordering',
  openGraph: {
    title: 'Delivery Order Management | DineOpen',
    description: 'Direct delivery orders plus Zomato/Swiggy sales tracked by channel in your reports.',
    url: 'https://www.dineopen.com/features/delivery-management',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Delivery Order Management | DineOpen',
    description: 'Direct delivery orders plus Zomato/Swiggy sales tracked by channel in your reports.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/features/delivery-management',
  },
};

export default function DeliveryManagementPage() {
  return <DeliveryManagementClient />;
}
