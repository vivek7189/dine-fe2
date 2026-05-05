export const metadata = {
  title: 'Enterprise Pricing — DineOpen | Multi-Outlet Restaurant POS',
  description: 'DineOpen enterprise plans for restaurant chains with 3+ outlets. All features included, zero transaction fees, dedicated support. Starting at ₹4,999/month.',
  openGraph: {
    title: 'Enterprise Pricing — DineOpen',
    description: 'Restaurant chain POS plans for 3+ outlets. All features included. Zero hidden costs.',
  },
};

import EnterpriseClient from './EnterpriseClient';

export default function EnterprisePricingPage() {
  return <EnterpriseClient />;
}
