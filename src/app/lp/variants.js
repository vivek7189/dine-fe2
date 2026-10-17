// Google Ads landing pages (noindex). One page per market/keyword group; ads point here so
// the visitor sees exactly what they searched for, one price and one action (free trial).
// Keep claims in line with /pricing: 7-day trial, ₹899/month India, AED 75 UAE.
const COMMON_FEATURES = [
  ['receipt', 'Fast billing', 'Dine-in, takeaway and delivery bills in a few taps. Split bills and discounts.'],
  ['kitchen', 'KOT to kitchen', 'Orders print or show in the kitchen instantly, sent to the right station.'],
  ['tables', 'Tables & waiter app', 'See every table live. Waiters take orders on their phone.'],
  ['qr', 'QR menu ordering', 'Guests scan, order, and the order lands on your POS.'],
  ['box', 'Inventory & recipes', 'Stock goes down with every sale. Low-stock alerts and purchase orders.'],
  ['chart', 'Reports on your phone', 'Daily sales, item-wise, staff-wise and payment-wise reports.'],
  ['users', 'Staff & attendance', 'Roles and permissions, attendance and payroll in one place.'],
  ['star', 'Customers & loyalty', 'Customer history, credit (udhaar) and loyalty points.'],
];

export const LP_VARIANTS = {
  'restaurant-billing-software': {
    market: 'IN',
    dial: 'IN',
    title: 'Restaurant Billing Software — ₹899/month | DineOpen',
    description: 'Simple restaurant billing software with GST bills, KOT, table management, inventory and reports. Works on Android, iPhone, Windows and browser. Start a 7-day free trial.',
    eyebrow: 'Restaurant billing software for India',
    h1: 'Restaurant billing software your staff learns in 10 minutes',
    sub: 'GST bills, KOT, tables, stock, QR and WhatsApp orders. Runs on the phone, tablet or computer you already have.',
    ticks: ['7-day free trial', 'No card needed', 'Free menu setup', 'GST-ready bills'],
    price: '₹899', per: '/month', priceNote: 'or ₹8,988/year (₹749/month) · cafés, restaurants, bars, cloud kitchens',
    benefits: [
      ['Bill in seconds', 'Tap the dishes, GST is added for you. Print the bill or send it on WhatsApp.'],
      ['No more lost KOTs', 'Every order reaches the right kitchen printer or screen the moment it is placed.'],
      ['Know your sales anywhere', 'Today’s sales, best sellers and cash vs UPI, live on your phone.'],
    ],
    features: [
      ['gst', 'GST-ready bills', 'CGST/SGST invoices, inclusive or exclusive tax. Print or send on WhatsApp.'],
      ...COMMON_FEATURES,
    ],
    bill: {
      title: 'Table 4 · Dine-in', currency: '₹',
      items: [['Paneer Butter Masala', 1, 310], ['Butter Naan', 2, 60], ['Dal Makhani', 1, 240], ['Masala Chaas', 2, 60]],
      taxes: [['CGST 2.5%', 0.025], ['SGST 2.5%', 0.025]],
      kot: ['KOT #128 · Kitchen', '1 × Paneer Butter Masala', '2 × Butter Naan', '1 × Dal Makhani'],
      pay: ['Cash', 'UPI', 'Card'],
    },
    whatsapp: '919528632779',
    whatsappText: 'Hi DineOpen, I want a demo of the restaurant billing software',
    faqs: [
      ['How long is the free trial?', 'You get 7 days free with all features, and no card is needed. Set up your menu and start billing on day one.'],
      ['Which devices does it work on?', 'Android phones and tablets, iPhone and iPad, Windows computers and any web browser. Bluetooth, USB and network thermal printers are supported.'],
      ['Can I print KOT and bills on my existing printer?', 'Yes. Most 58 mm and 80 mm thermal printers work. KOTs can go to different kitchen printers by station.'],
      ['Does it handle GST?', 'Yes. Bills show CGST/SGST correctly, with tax-inclusive or exclusive pricing per item, and GST reports for your accountant.'],
      ['Can you help me set up my menu?', 'Yes. Send us your menu (photo, PDF or Excel) on WhatsApp and our team helps you load it, free.'],
      ['What happens after the trial?', 'Choose a plan from ₹899/month to keep going. Your menu, orders and reports stay as they are.'],
    ],
  },
  // Same offer for the "restaurant POS software" ad group, with the headline matching that search.
  'restaurant-pos-software': null,
  'restaurant-pos-uae': {
    market: 'AE',
    dial: 'AE',
    title: 'Restaurant POS System UAE — AED 75/month | DineOpen',
    description: 'Cloud restaurant POS for UAE restaurants and cafés: VAT invoices, KOT, table management, inventory, Talabat orders and reports. Start a 7-day free trial.',
    eyebrow: 'Restaurant POS for the UAE',
    h1: 'A restaurant POS for UAE cafés and restaurants',
    sub: 'VAT invoices, kitchen orders, tables, inventory and Talabat orders in one system, on tablet, phone, Windows or browser.',
    ticks: ['7-day free trial', 'No card needed', 'Free menu setup', 'VAT-ready invoices'],
    price: 'AED 75', per: '/month', priceNote: 'or AED 790/year · cafés, restaurants, cloud kitchens',
    benefits: [
      ['Bill in seconds', 'Tap the items and 5% VAT is added for you. Print or send the invoice.'],
      ['Talabat orders in one place', 'Talabat orders arrive on your POS and in your kitchen automatically.'],
      ['Know your sales anywhere', 'Today’s sales and best sellers, live on your phone.'],
    ],
    features: [
      ['gst', 'VAT invoices', '5% VAT handled on every bill, with tax reports for filing.'],
      ['bike', 'Talabat orders', 'Talabat orders arrive on your POS and kitchen automatically.'],
      ...COMMON_FEATURES.filter(([, t]) => t !== 'Customers & loyalty'),
    ],
    bill: {
      title: 'Table 4 · Dine-in', currency: 'AED ',
      items: [['Chicken Shawarma Plate', 1, 32], ['Hummus', 1, 18], ['Fresh Lemon Mint', 2, 15]],
      taxes: [['VAT 5%', 0.05]],
      kot: ['KOT #128 · Kitchen', '1 × Chicken Shawarma Plate', '1 × Hummus'],
      pay: ['Cash', 'Card'],
    },
    whatsapp: '919528632779',
    whatsappText: 'Hi DineOpen, I want a demo of the restaurant POS (UAE)',
    faqs: [
      ['How long is the free trial?', 'You get 7 days free with all features, and no card is needed.'],
      ['Which devices does it work on?', 'Android and iPad tablets, phones, Windows computers and any web browser, with thermal receipt and kitchen printers.'],
      ['Does it support VAT?', 'Yes. Bills include 5% VAT and you get VAT reports for filing.'],
      ['Does it work with Talabat?', 'Yes. Talabat orders come straight into DineOpen and to your kitchen.'],
      ['Can you help me set up my menu?', 'Yes. Send your menu on WhatsApp and our team helps you load it.'],
    ],
  },
};

LP_VARIANTS['restaurant-pos-software'] = {
  ...LP_VARIANTS['restaurant-billing-software'],
  title: 'Restaurant POS Software India — ₹899/month | DineOpen',
  description: 'Restaurant POS software for India: GST billing, KOT, tables, inventory, QR and WhatsApp orders and reports. Works on Android, iPhone, Windows and browser. Start a 7-day free trial.',
  eyebrow: 'Restaurant POS software for India',
  h1: 'Restaurant POS software that runs on the device you already have',
  whatsappText: 'Hi DineOpen, I want a demo of the restaurant POS software',
};
