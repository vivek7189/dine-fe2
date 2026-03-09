import GoogleReviewClient from './GoogleReviewClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Google Review Rating Calculator [Free] — How Many 5-Star Reviews Needed | DineOpen',
  description: 'Calculate how many 5-star Google reviews you need to reach your target rating. Free calculator for restaurant owners — no login required.',
  keywords: 'google review calculator, google rating calculator, how many reviews to reach 4.5 stars, restaurant google reviews calculator, google star rating calculator',
  openGraph: {
    title: 'Google Review Rating Calculator [Free] | DineOpen',
    description: 'Calculate how many 5-star reviews you need to reach your target Google rating.',
    url: 'https://www.dineopen.com/tools/google-review-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/google-review-calculator' },
};

export default function GoogleReviewCalculatorPage() {
  return <GoogleReviewClient />;
}
