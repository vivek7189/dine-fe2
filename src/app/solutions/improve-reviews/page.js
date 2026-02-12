import ImproveReviewsClient from './ImproveReviewsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'How to Improve Restaurant Reviews | Get More 5-Star Ratings | DineOpen',
  description: 'Proven strategies to improve your restaurant reviews on Google, Zomato, and Swiggy. Get more positive reviews and handle negative feedback professionally.',
  keywords: 'improve restaurant reviews, get more google reviews, restaurant reputation management, respond to negative reviews, increase restaurant ratings',
  openGraph: {
    title: 'How to Improve Restaurant Reviews | DineOpen',
    description: 'Proven strategies to get more positive reviews and boost your restaurant ratings.',
    url: 'https://www.dineopen.com/solutions/improve-reviews',
    siteName: 'DineOpen',
    type: 'article',
  },
  alternates: { canonical: 'https://www.dineopen.com/solutions/improve-reviews' },
};

export default function ImproveReviewsPage() {
  return <ImproveReviewsClient />;
}
