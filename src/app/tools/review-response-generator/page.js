import ReviewResponseGeneratorClient from './ReviewResponseGeneratorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'AI Review Response Generator | Reply to Restaurant Reviews | DineOpen',
  description: 'Free AI tool to generate professional responses to restaurant reviews. Reply to Zomato, Google, Swiggy reviews in seconds. Handle positive and negative feedback.',
  keywords: 'review response generator, reply to restaurant review, Zomato review reply, Google review response, negative review response, restaurant review template',
  openGraph: {
    title: 'AI Review Response Generator | Restaurant Reviews | DineOpen',
    description: 'Generate professional responses to restaurant reviews with AI. Handle any feedback gracefully.',
    url: 'https://www.dineopen.com/tools/review-response-generator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/review-response-generator' },
};

export default function ReviewResponseGeneratorPage() {
  return <ReviewResponseGeneratorClient />;
}
