// India plans (Nov 2026). Prices include GST, per outlet. One source for the website pricing
// sections and the in-app Billing page; the backend has the same ids/amounts in payment.js.
// Café Lite is sold via WhatsApp for now (self-serve once the 1-device limit is enforced).

export const INDIA_WHATSAPP = '919004459951'; // same sales number the pricing page used
export const indiaWaLink = (msg = 'Hi DineOpen, I want to know about your plans') => `https://wa.me/${INDIA_WHATSAPP}?text=${encodeURIComponent(msg)}`;

export const INDIA_PLANS = [
  {
    key: 'billing',
    name: 'Billing',
    tagline: 'For cafés and small restaurants',
    monthly: 799,
    yearly: 7999,
    features: [
      'GST bills: print or send on WhatsApp',
      'KOT to kitchen printers',
      'QR menu & QR ordering',
      'Inventory & stock alerts',
      'Daily, item-wise & payment reports',
      'Unlimited staff & devices',
      'AI assistant',
      'Free menu setup + online support',
    ],
  },
  {
    key: 'operations',
    name: 'Operations',
    tagline: 'For busy restaurants with tables & a kitchen team',
    monthly: 1299,
    yearly: 12999,
    popular: true,
    features: [
      'Everything in Billing, plus:',
      'Captain / waiter app',
      'Kitchen display (KDS)',
      'Table management & reservations',
      'Recipes & advanced inventory',
      'AC / non-AC / takeaway pricing',
      'Loyalty & khata (customer credit)',
      'Own ordering website + WhatsApp ordering',
      'AI voice ordering',
      'Swiggy / Zomato sales in reports',
      'Priority phone support',
    ],
  },
  {
    key: 'suite',
    name: 'Growth Suite',
    tagline: 'For brands that market & run more than one outlet',
    monthly: 1999,
    yearly: 19999,
    features: [
      'Everything in Operations, plus:',
      'WhatsApp marketing: 4,000 messages/year',
      'Customer campaigns & birthday offers',
      'Feedback collection',
      'Multi-outlet dashboard',
      'Outlet-wise profit & loss',
      'Central menu & staff control',
      'API access',
      'Dedicated onboarding call',
    ],
  },
  {
    key: 'complete',
    name: 'Complete',
    tagline: 'Every feature, and a person who looks after your account',
    monthly: 3499,
    yearly: 35000,
    premium: true,
    badge: 'Everything + dedicated support',
    features: [
      'Everything in Growth Suite, plus:',
      'Dedicated account manager',
      'We set it up for you: menu, printers, staff, tables',
      'Staff training on video call',
      '24x7 priority phone support',
      'WhatsApp marketing: 10,000 messages/year',
      'Monthly sales review with your account manager',
      'Custom reports on request',
      'First in line for new features',
    ],
  },
];

export const INDIA_LITE = {
  key: 'lite',
  name: 'Café Lite',
  monthly: 299,
  yearly: 3500,
  headline: 'Running a tea stall, juice counter or one-counter café?',
  description: 'GST billing on 1 device, owner + 1 staff login, up to 100 menu items, daily sales report. No kitchen printer, QR ordering or inventory. Upgrade any time.',
};

export const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

// Plan id used by the backend / Razorpay, e.g. 'operations-yearly'.
export const indiaPlanId = (key, cycle) => `${key}-${cycle === 'monthly' ? 'monthly' : 'yearly'}`;

// Yearly saving vs paying monthly for 12 months.
export const yearlySaving = (p) => p.monthly * 12 - p.yearly;
