import FssaiRegistrationClient from './FssaiRegistrationClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'FSSAI Registration for Restaurants | Step-by-Step Guide 2024 | DineOpen',
  description: 'Complete guide to FSSAI registration for restaurants in India. Learn about Basic, State, and Central licenses, fees, documents required, and step-by-step online process.',
  keywords: 'FSSAI registration, FSSAI license for restaurant, food license India, FSSAI online registration, restaurant FSSAI, food safety license, FSSAI fees, FSSAI documents',
  openGraph: {
    title: 'FSSAI Registration for Restaurants | Complete Guide',
    description: 'Everything you need to know about FSSAI registration for your restaurant - types, fees, documents, and process.',
    url: 'https://www.dineopen.com/resources/fssai-registration',
    siteName: 'DineOpen',
    type: 'article',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/resources/fssai-registration',
  },
};

export default function FssaiRegistrationPage() {
  return <FssaiRegistrationClient />;
}
