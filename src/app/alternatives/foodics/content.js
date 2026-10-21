// Facts for /alternatives/foodics. Foodics figures are from foodics.com (UAE pricing page), checked
// October 2026; see /vs/dineopen-vs-foodics for sources. FAQS also feed the FAQPage schema in page.js.

export const ROWS = [
  ['UAE starting price', 'AED 75/month (Starter)', 'AED 199/month Starter, billed annually'],
  ['How you start', '7-day free trial, no card', 'Demo, then a quote for hardware and software'],
  ['Talabat orders', 'Arrive in the POS automatically', 'Delivery aggregators on the UAE Advanced plan'],
  ['Deliveroo, Noon, Careem', 'Not synced; record them on the POS', 'Ask Foodics for your country and plan'],
  ['Saudi ZATCA e-invoicing', 'Not claimed', 'Says it keeps restaurants compliant'],
  ['Inventory', 'Basic inventory from Starter; recipes on Growth', 'From the UAE Basic plan (AED 375)'],
  ['QR / online ordering', 'QR menu ordering from Starter', 'Foodics Online on the UAE Advanced plan'],
  ['Staff attendance and payroll', 'Included', 'Check with Foodics'],
  ['Devices', 'Android, iPhone/iPad, Windows, browser', 'Quoted with hardware after a demo'],
];

export const FAQS = [
  {
    q: 'Is DineOpen a good alternative to Foodics in the UAE?',
    a: 'For many UAE cafés and restaurants, yes. DineOpen starts at AED 75 a month, brings Talabat orders in automatically and can be tried free for 7 days. Foodics has more local depth, including Foodics Pay and an app marketplace, so compare the plan you actually need on each side.',
  },
  {
    q: 'How do the prices compare?',
    a: 'As listed on foodics.com in October 2026, Foodics UAE plans are AED 199 (Starter), AED 375 (Basic) and AED 556 (Advanced) a month, billed annually. DineOpen Starter is AED 75 a month. Plans include different things, so a straight price match can mislead.',
  },
  {
    q: 'Does DineOpen integrate with Talabat and Deliveroo?',
    a: 'Talabat orders arrive in DineOpen automatically. Deliveroo, Noon and Careem orders are not synced today; staff record them on the POS and reports show sales by platform.',
  },
  {
    q: 'Should a restaurant in Saudi Arabia switch from Foodics?',
    a: 'Usually not. ZATCA e-invoicing is mandatory in Saudi Arabia and Foodics says it keeps restaurants compliant. DineOpen does not make that claim, so for Saudi restaurants we would point you to Foodics today.',
  },
  {
    q: 'How do I move my menu from Foodics?',
    a: 'Start the 7-day free trial and send us your menu (Excel export, PDF or photos) on WhatsApp. Our team helps you load it for free.',
  },
];
