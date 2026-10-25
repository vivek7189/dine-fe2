// Review star page (one per restaurant) — not for search engines.
export const metadata = {
  title: 'How was your visit?',
  robots: { index: false, follow: false },
};

export default function ReviewPageLayout({ children }) {
  return children;
}
