// Content for /resources/business-plan. FAQs here also feed the FAQPage schema in page.js,
// so the schema always matches what the page shows.

export const PLAN_SECTIONS = [
  {
    title: '1. Executive summary',
    prompts: [
      'Restaurant name, format (café, cloud kitchen, QSR, casual dining) and cuisine',
      'Location and why it suits your customers',
      'Total investment needed, how much you bring in, how much you need (loan or partner)',
      'Expected monthly revenue and when you expect to break even',
    ],
  },
  {
    title: '2. Concept and menu',
    prompts: [
      'What you sell and the price range (average bill per person)',
      'Number of menu items; your 5 hero dishes',
      'Food cost target per dish (most Indian restaurants aim for 28-35%)',
      'Dine-in, takeaway, delivery: share you expect from each',
    ],
  },
  {
    title: '3. Market and competition',
    prompts: [
      'Who your customers are (students, office crowd, families) and what they spend',
      '5 nearby competitors: their prices, ratings, what they do badly',
      'Why customers will choose you',
    ],
  },
  {
    title: '4. Location and premises',
    prompts: [
      'Area (sq ft), seats, rent per month, security deposit',
      'Footfall or delivery radius; parking; visibility from the road',
      'Fit-out work needed: kitchen, exhaust, gas line, fire safety',
    ],
  },
  {
    title: '5. Operations and team',
    prompts: [
      'Opening hours and days',
      'Staff by role (chef, helpers, waiters, cashier) and monthly salary for each',
      'Suppliers for vegetables, dairy, meat, packaging; payment terms',
      'Licences: FSSAI, trade licence, fire NOC, GST, eating-house licence where needed',
      'Billing and kitchen system (POS, KOT printer, inventory tracking)',
    ],
  },
  {
    title: '6. Marketing plan',
    prompts: [
      'Launch plan for the first 30 days',
      'Google Business Profile, Instagram, Swiggy/Zomato listing',
      'How you will bring customers back (loyalty, WhatsApp offers)',
    ],
  },
  {
    title: '7. Financial plan',
    prompts: [
      'Startup cost list (one-time) and where the money comes from',
      'Monthly revenue: customers per day × average bill × days open',
      'Monthly costs: food, staff, rent, utilities, commissions, marketing, other',
      'Monthly profit, break-even month, and a 3-year projection',
    ],
  },
];

// Typical Indian startup ranges, kept consistent with our cloud kitchen, café and food truck guides.
export const STARTUP_RANGES = [
  { format: 'Home bakery / tiffin service', cost: '₹10,000 - 2 lakh', guide: '/hi/blog/tiffin-service-kaise-shuru-kare' },
  { format: 'Cloud kitchen (delivery only)', cost: '₹5 - 15 lakh', guide: '/blog/cloud-kitchen-guide-2026' },
  { format: 'Food truck', cost: '₹5 - 15 lakh', guide: '/blog/how-to-start-food-truck-india.html' },
  { format: 'Quick-service café', cost: '₹5 - 12 lakh', guide: '/blog/how-to-start-cafe-coffee-shop-india.html' },
  { format: 'Dine-in restaurant', cost: '₹30 - 50 lakh', guide: '/blog/restaurant-profit-margin-increase-guide.html' },
];

// Worked example: casual dining, ₹12 lakh/month. Net 12% sits inside the 8-12% casual-dining
// range used on our profit guide.
export const SAMPLE_PL = [
  { label: 'Revenue', monthly: 1200000, note: '' },
  { label: 'Food cost (30%)', monthly: -360000, note: '' },
  { label: 'Staff (25%)', monthly: -300000, note: '' },
  { label: 'Rent and utilities', monthly: -200000, note: '' },
  { label: 'Other: marketing, maintenance, POS, delivery commission (8%)', monthly: -96000, note: '' },
  { label: 'Net profit (12%)', monthly: 144000, note: 'total' },
];

export const FAQS = [
  {
    q: 'What should a restaurant business plan include?',
    a: 'Seven parts: executive summary, concept and menu, market and competition, location, operations and team, marketing plan, and a financial plan with startup costs, monthly profit and break-even. The template on this page walks through each one.',
  },
  {
    q: 'Do I need a business plan for a restaurant loan in India?',
    a: 'Yes. Banks, NBFCs and government schemes such as PMMY (Mudra) ask for a business plan or project report showing your investment, expected revenue, costs and repayment ability. Keep the numbers realistic and show your own contribution.',
  },
  {
    q: 'How much does it cost to open a restaurant in India?',
    a: 'It depends on the format: a home bakery or tiffin service can start under ₹2 lakh, a cloud kitchen or food truck usually needs ₹5-15 lakh, a quick-service café ₹5-12 lakh, and a dine-in restaurant ₹30-50 lakh in most metros.',
  },
  {
    q: 'What profit margin should I put in my plan?',
    a: 'Most Indian restaurants earn a 5-12% net margin; casual dining is usually 8-12% and fine dining 12-18%. Cloud kitchens target 15-25% but platform commissions often pull that down. Banks trust conservative numbers more than optimistic ones.',
  },
  {
    q: 'How long does it take to write a restaurant business plan?',
    a: 'One to two weeks if you collect real quotes for rent, equipment and salaries first. Our free generator gives you a first draft in minutes that you can then correct with your own numbers.',
  },
];
