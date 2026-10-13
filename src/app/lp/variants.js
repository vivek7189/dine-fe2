// Google Ads landing pages (noindex). One page per market/keyword group; ads point here so
// the visitor sees exactly what they searched for, one price and one action (free trial).
// Keep claims in line with /pricing: 7-day trial, ₹899/month India, AED 75 UAE.
const COMMON_FEATURES = [
  ['Fast billing', 'Bill in a few taps — dine-in, takeaway and delivery, split bills, discounts.'],
  ['KOT to kitchen', 'Orders print or show in the kitchen instantly, routed to the right station.'],
  ['Tables & captain app', 'Live table view; waiters take orders on their phone.'],
  ['QR menu ordering', 'Guests scan, order and the order lands on your POS.'],
  ['Inventory & recipes', 'Stock goes down with every sale; low-stock alerts and purchase orders.'],
  ['Reports', 'Daily sales, item-wise, staff-wise and payment-wise reports on your phone.'],
  ['Staff & attendance', 'Roles and permissions, attendance and payroll in one place.'],
  ['Loyalty & customers', 'Customer history, credit (udhaar) and loyalty points.'],
];

export const LP_VARIANTS = {
  'restaurant-billing-software': {
    market: 'IN',
    title: 'Restaurant Billing Software — ₹899/month | DineOpen',
    description: 'Simple restaurant billing software with GST bills, KOT, table management, inventory and reports. Works on Android, iPhone, Windows and browser. Start a 7-day free trial.',
    eyebrow: 'Restaurant billing software for India',
    h1: 'Restaurant billing software that your staff learns in 10 minutes',
    sub: 'GST bills, KOT, tables, inventory, QR ordering and WhatsApp bills — on Android, iPhone, Windows or any browser.',
    price: '₹899', per: '/month', priceNote: 'or ₹8,988/year (₹749/month) · cafés, restaurants, bars, cloud kitchens',
    features: [
      ['GST-ready bills', 'CGST/SGST invoices, inclusive or exclusive tax — print or send on WhatsApp.'],
      ...COMMON_FEATURES,
    ],
    whatsapp: '919528632779',
    whatsappText: 'Hi DineOpen, I want a demo of the restaurant billing software',
    faqs: [
      ['How long is the free trial?', 'You get 7 days free with all features. Set up your menu and start billing on day one.'],
      ['Which devices does it work on?', 'Android phones and tablets, iPhone and iPad, Windows computers and any web browser. Bluetooth, USB and network thermal printers are supported.'],
      ['Can I print KOT and bills on my existing printer?', 'Yes — most 58mm and 80mm thermal printers work. KOTs can go to different kitchen printers by station.'],
      ['Does it handle GST?', 'Yes. Bills show CGST/SGST correctly, with tax inclusive or exclusive pricing per item, and GST reports for your accountant.'],
      ['Can you help me set up my menu?', 'Yes. Send us your menu (photo, PDF or Excel) on WhatsApp and our team helps you load it.'],
    ],
  },
  'restaurant-pos-uae': {
    market: 'AE',
    title: 'Restaurant POS System UAE — AED 75/month | DineOpen',
    description: 'Cloud restaurant POS for UAE restaurants and cafés: VAT invoices, KOT, table management, inventory, Talabat orders and reports. Start a 7-day free trial.',
    eyebrow: 'Restaurant POS for the UAE',
    h1: 'A restaurant POS for UAE cafés and restaurants — from AED 75/month',
    sub: 'VAT invoices, kitchen orders, tables, inventory and Talabat orders in one system — on tablet, phone, Windows or browser.',
    price: 'AED 75', per: '/month', priceNote: 'or AED 790/year · cafés, restaurants, cloud kitchens',
    features: [
      ['VAT invoices', '5% VAT handled on every bill, with tax reports for filing.'],
      ['Talabat orders', 'Talabat orders arrive on your POS and kitchen automatically.'],
      ...COMMON_FEATURES.filter(([t]) => t !== 'Loyalty & customers'),
    ],
    whatsapp: '919528632779',
    whatsappText: 'Hi DineOpen, I want a demo of the restaurant POS (UAE)',
    faqs: [
      ['How long is the free trial?', 'You get 7 days free with all features.'],
      ['Which devices does it work on?', 'Android and iPad tablets, phones, Windows computers and any web browser, with thermal receipt and kitchen printers.'],
      ['Does it support VAT?', 'Yes. Bills include 5% VAT and you get VAT reports for filing.'],
      ['Does it work with Talabat?', 'Yes. Talabat orders come straight into DineOpen and to your kitchen.'],
      ['Can you help me set up my menu?', 'Yes. Send your menu on WhatsApp and our team helps you load it.'],
    ],
  },
};
