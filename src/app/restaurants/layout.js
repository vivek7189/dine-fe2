// The public directory is hidden from search: it listed every account (including
// test/demo ones) and links to ordering pages that robots.txt blocks.
export const metadata = {
  title: 'Restaurants | DineOpen',
  robots: { index: false, follow: false },
};

export default function RestaurantsLayout({ children }) {
  return children;
}
