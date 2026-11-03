// Data and text for /tools/catering-quotation-maker, shared by the page and its FAQPage JSON-LD.
// The sample is a typical veg sangeet in a tier-1 city (Oct 2026 rates); every field is editable.

export const SAMPLE = {
  biz: {
    name: 'Shree Annapurna Caterers',
    address: 'Shop 4, Kalyani Nagar, Pune 411006',
    phone: '+91 98220 41567',
    email: 'orders@annapurnacaterers.in',
    gstin: '27ABCPA1234F1Z5',
  },
  client: { name: 'Mr. Rohan Mehta', phone: '+91 98901 22334' },
  event: { type: 'Sangeet (wedding)', date: '', venue: 'Green Leaf Lawns, Baner, Pune', guests: 250, time: '7:30 pm to 11:30 pm' },
  menu: [
    { title: 'Welcome drinks', items: 'Fresh watermelon juice\nMasala chaas\nMocktail: virgin mojito' },
    { title: 'Starters', items: 'Paneer tikka\nHara bhara kebab\nCorn cheese balls\nLive chaat counter (pani puri, dahi puri)' },
    { title: 'Main course', items: 'Paneer butter masala\nDal makhani\nMix veg handi\nJeera rice and veg biryani\nButter naan, tandoori roti\nSalad, raita, papad, pickle' },
    { title: 'Desserts', items: 'Gulab jamun\nRasmalai\nVanilla ice cream' },
  ],
  plateRate: 650,
  items: [
    { name: 'Veg buffet (as per menu)', qty: 250, rate: 600 },
    { name: 'Live chaat counter', qty: 1, rate: 12500 },
  ],
  extras: [
    { name: 'Service staff (12 waiters, uniform)', amount: 18000 },
    { name: 'Live counters setup (chaat, pasta)', amount: 15000 },
    { name: 'Crockery, cutlery & buffet setup', amount: 12500 },
    { name: 'Transport', amount: 4000 },
    { name: 'Decoration of food area', amount: 0 },
  ],
  discount: 5000,
  gstRate: 5,
  advancePct: 50,
  validityDays: 15,
  terms: [
    'Final guest count to be confirmed 3 days before the event. We bill for the confirmed count or the actual count, whichever is higher.',
    'Extra plates on the day are charged at the same per-plate rate.',
    'Gas, water and electricity at the venue to be arranged by the client.',
    'Service time as mentioned above. Each extra hour of service is ₹3,000.',
    'Cancellation within 7 days of the event: the advance is not refundable.',
  ].join('\n'),
  notes: 'Jain food can be made for up to 20 guests at no extra cost. Please tell us by the final count date.',
};

export const GST_OPTIONS = [
  [5, '5% GST', 'Usual rate for outdoor catering, without input tax credit.'],
  [18, '18% GST', 'Generally when you cater inside a hotel that charges ₹7,500 or more a night for a room.'],
  [0, 'No GST', 'If you are not registered for GST (turnover under ₹20 lakh in most states).'],
];

export const FAQ = [
  [
    'What should a catering quotation include?',
    'Your business name, phone and GSTIN, the client and event details (date, venue, time, guest count), the full menu, the price (per plate or item by item), every extra such as staff, counters, crockery and transport, GST, the total, how much advance you need, and your terms. Add how long the quote is valid, because food prices change.',
  ],
  [
    'How do caterers price a plate?',
    'Work out the food cost of one plate (all raw material, gas and disposables), then price it so food is about 30–40% of the plate rate. A veg plate with food cost of ₹220 usually sells at ₹550–700. Staff, live counters, crockery and transport can be added inside the plate rate or shown as separate lines; separate lines make it easier for the client to compare quotes.',
  ],
  [
    'What GST do caterers charge in India?',
    'Most outdoor catering is charged 5% GST without input tax credit. Catering inside a hotel that charges ₹7,500 or more a night for a room is generally charged 18%. If your turnover is under the registration limit and you have no GSTIN, you cannot charge GST at all. Check your case with your CA.',
  ],
  [
    'How much advance should a caterer take?',
    'Most caterers take 25–50% when the booking is confirmed, so they can block the date and buy stock. The rest is paid in one or two parts, for example 40% a week before and the balance on the event day. Write the plan in the quotation so there is no argument later.',
  ],
  [
    'Can I get this quotation format in Word?',
    'Yes. Fill in the form, then use Download Word. The file opens in Microsoft Word or Google Docs so you can change anything. You can also download a PDF, print it, or send a short summary on WhatsApp.',
  ],
  [
    'Is this quotation maker free?',
    'Yes, it is free with no sign-up. Nothing you type is saved on our servers. Close the page and it is gone, so download the PDF or Word file before you leave.',
  ],
];
