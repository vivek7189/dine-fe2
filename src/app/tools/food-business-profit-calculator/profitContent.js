// Data and text for /tools/food-business-profit-calculator, shared by the page and its FAQPage JSON-LD.
// Benchmarks are the site-wide standard (see /blog/restaurant-profit-margins-india-guide). Presets are
// tuned so each one lands inside its own benchmark range. Money is monthly, in rupees, before GST.

// v: ordersPerDay, avgBill, daysOpen, foodPct, staff, rent, utilities, deliveryShare, commissionPct, packaging, other, setup
export const FORMATS = [
  {
    id: 'cafe', name: 'Café', noun: 'café', unit: 'customers',
    v: { ordersPerDay: 100, avgBill: 280, daysOpen: 30, foodPct: 30, staff: 160000, rent: 125000, utilities: 50000, deliveryShare: 15, commissionPct: 25, packaging: 5, other: 105000, setup: 1000000 },
    bench: [10, 15], benchText: 'Most cafés and quick-service places in India keep 10–15%.',
    setupText: 'A quick-service café usually costs ₹5–12 lakh to set up.',
    guide: ['/blog/how-to-start-cafe-coffee-shop-india.html', 'How to start a café in India'],
  },
  {
    id: 'cloud', name: 'Cloud kitchen', noun: 'cloud kitchen', unit: 'orders',
    v: { ordersPerDay: 80, avgBill: 350, daysOpen: 30, foodPct: 32, staff: 85000, rent: 45000, utilities: 35000, deliveryShare: 85, commissionPct: 25, packaging: 25, other: 60000, setup: 800000 },
    bench: [8, 15], benchText: 'Most cloud kitchens in India keep 8–15%. Only those with strong direct ordering reach 15–25%.',
    setupText: 'A cloud kitchen usually costs ₹5–15 lakh to set up.',
    guide: ['/blog/cloud-kitchen-guide-2026', 'Cloud kitchen guide'],
  },
  {
    id: 'bakery', name: 'Bakery', noun: 'home bakery', unit: 'orders',
    v: { ordersPerDay: 15, avgBill: 600, daysOpen: 26, foodPct: 35, staff: 18000, rent: 0, utilities: 8000, deliveryShare: 30, commissionPct: 22, packaging: 40, other: 20000, setup: 150000 },
    bench: [25, 35], benchText: 'There is no separate benchmark for home bakeries. The closest is a home tiffin service with no rent, which keeps 25–35%. A bakery shop paying rent is closer to a café’s 10–15%.',
    setupText: 'A home bakery usually costs ₹10,000–2 lakh to set up.',
    guide: ['/blog/how-to-start-bakery-india.html', 'How to start a bakery in India'],
  },
  {
    id: 'tiffin', name: 'Tiffin service', noun: 'tiffin service', unit: 'meals',
    v: { ordersPerDay: 60, avgBill: 110, daysOpen: 26, foodPct: 36, staff: 14000, rent: 0, utilities: 9000, deliveryShare: 10, commissionPct: 20, packaging: 12, other: 10000, setup: 60000 },
    bench: [25, 35], benchText: 'Home tiffin services usually keep 25–35%, mostly because there is no rent.',
    setupText: 'A home tiffin service usually costs ₹10,000–2 lakh to set up.',
    guide: ['/hi/blog/tiffin-service-kaise-shuru-kare', 'Tiffin service kaise shuru kare (Hindi guide)'],
  },
  {
    id: 'truck', name: 'Food truck', noun: 'food truck', unit: 'orders',
    v: { ordersPerDay: 100, avgBill: 150, daysOpen: 28, foodPct: 33, staff: 65000, rent: 15000, utilities: 40000, deliveryShare: 5, commissionPct: 25, packaging: 6, other: 45000, setup: 800000 },
    bench: [15, 25], benchText: 'Food trucks, dhabas and street food usually keep 15–25%.',
    setupText: 'A food truck usually costs ₹5–15 lakh to set up.',
    guide: ['/blog/how-to-start-food-truck-india.html', 'How to start a food truck in India'],
  },
  {
    id: 'casual', name: 'Casual dining restaurant', noun: 'casual dining restaurant', unit: 'bills',
    v: { ordersPerDay: 70, avgBill: 1100, daysOpen: 30, foodPct: 35, staff: 440000, rent: 280000, utilities: 140000, deliveryShare: 20, commissionPct: 25, packaging: 12, other: 270000, setup: 4000000 },
    bench: [8, 12], benchText: 'Most casual dining restaurants in India keep 8–12%.',
    setupText: 'A dine-in restaurant usually costs ₹30–50 lakh to set up.',
    guide: ['/resources/business-plan', 'Restaurant business plan template'],
  },
];

// [key, label, hint, kind] kind: 'n' count, 'rs' rupees, 'pct' percent
export const FIELDS = [
  ['ordersPerDay', 'Customers or orders per day', 'Bills you ring up on an average day.', 'n'],
  ['avgBill', 'Average bill (₹)', 'Per order, before GST.', 'rs'],
  ['daysOpen', 'Days open per month', '', 'n'],
  ['foodPct', 'Food cost (% of sales)', 'Typical: 28–38%.', 'pct'],
  ['staff', 'Staff salaries, total (₹/month)', 'Add your own pay if you draw one.', 'rs'],
  ['rent', 'Rent (₹/month)', 'Zero if you run from home.', 'rs'],
  ['utilities', 'Electricity, gas, water (₹/month)', '', 'rs'],
  ['deliveryShare', 'Share of sales from delivery apps (%)', '', 'pct'],
  ['commissionPct', 'Delivery-app commission (%)', 'Typical: 18–30%.', 'pct'],
  ['packaging', 'Packaging per order (₹)', 'Average across all orders.', 'rs'],
  ['other', 'Other costs (₹/month)', 'Marketing, repairs, software, licences, wastage.', 'rs'],
  ['setup', 'One-time setup cost (₹)', 'Interiors, kitchen equipment, deposit, licences.', 'rs'],
];

export function calc(v) {
  const n = (k) => Math.max(0, Number(v[k]) || 0);
  const orders = n('ordersPerDay') * n('daysOpen');
  const revenue = orders * n('avgBill');
  const costs = [
    ['Food and ingredients', revenue * n('foodPct') / 100],
    ['Staff salaries', n('staff')],
    ['Rent', n('rent')],
    ['Electricity, gas, water', n('utilities')],
    ['Delivery-app commission', revenue * n('deliveryShare') / 100 * n('commissionPct') / 100],
    ['Packaging', orders * n('packaging')],
    ['Other costs', n('other')],
  ];
  const total = costs.reduce((s, [, c]) => s + c, 0);
  const profit = revenue - total;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
  const payback = profit > 0 && n('setup') > 0 ? n('setup') / profit : null;
  return { orders, revenue, costs, total, profit, margin, payback, setup: n('setup') };
}

export const BENCHMARKS = [
  ['Average restaurant (all types)', '5–12%'],
  ['Casual dining', '8–12%'],
  ['Quick service / café', '10–15%'],
  ['Cloud kitchen', '8–15% (15–25% with strong direct ordering)'],
  ['Fine dining', '12–18%'],
  ['Dhaba, street food, food truck', '15–25%'],
  ['Home tiffin service (no rent)', '25–35%'],
];

export const FAQ = [
  ['What is a good profit margin for a food business in India?',
    'Net profit after every cost, including rent and salaries, is usually 5–12% for an average restaurant. Casual dining keeps 8–12%, cafés and quick-service places 10–15%, cloud kitchens 8–15%, fine dining 12–18%, and dhabas, street food and food trucks 15–25%. Home tiffin services often keep 25–35% because they pay no rent.'],
  ['How long does it take to recover the setup cost?',
    'Divide your one-time setup cost by your monthly profit. A café that cost ₹10 lakh to open and makes ₹1 lakh a month takes about 10 months. Setup costs usually run ₹10,000–2 lakh for a home bakery or tiffin service, ₹5–15 lakh for a cloud kitchen or food truck, ₹5–12 lakh for a quick-service café and ₹30–50 lakh for a dine-in restaurant.'],
  ['What food cost percentage should I aim for?',
    'Most Indian food businesses run a food cost of 28–38% of sales. Below 28% usually means high prices or small portions. Above 38% leaves little room for rent and salaries, so check your recipe costs and wastage.'],
  ['How much do Swiggy and Zomato commissions cut into profit?',
    'Delivery-app commission is usually 18–30% of the order value. If half your sales come through the apps at 25%, that is 12.5% of all your sales gone before rent and salaries. Moving even some regulars to direct orders by phone, WhatsApp or your own QR menu lifts your margin.'],
];
