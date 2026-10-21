import FoodicsAlternativeClient from './FoodicsAlternativeClient';
import { FAQS } from './content';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Foodics Alternative UAE: DineOpen from AED 75/month',
  description: 'Comparing Foodics in the UAE? DineOpen starts at AED 75/month with Talabat orders built in and a 7-day free trial. An honest look at when each one fits.',
  keywords: 'Foodics alternative, Foodics alternative UAE, Foodics competitor, restaurant POS UAE',
  openGraph: {
    title: 'Foodics Alternative UAE: DineOpen from AED 75/month',
    description: 'DineOpen starts at AED 75/month with Talabat orders built in and a 7-day free trial.',
    url: 'https://www.dineopen.com/alternatives/foodics',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Foodics Alternative UAE: DineOpen from AED 75/month',
    description: 'DineOpen starts at AED 75/month with Talabat orders built in and a 7-day free trial.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/alternatives/foodics',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
};

export default function FoodicsAlternativePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <FoodicsAlternativeClient />
    </>
  );
}
