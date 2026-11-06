// Partner portal (src/modules/partners). Private pages — not for search engines.
export const metadata = {
  title: 'DineOpen Partners',
  robots: { index: false, follow: false },
};

export default function PartnerLayout({ children }) {
  return children;
}
