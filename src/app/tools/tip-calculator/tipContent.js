// Text content for /tools/tip-calculator. Kept outside the client component so page.js can build
// the FAQPage JSON-LD from exactly the same answers the visitor sees.

export const US_GUIDE = [
  ['Sit-down restaurant', '18–20%', '20–25% for great service or fine dining'],
  ['Bar or drinks', '$1–2 per drink', 'or 18–20% of a running tab'],
  ['Buffet', '10%', 'Someone still clears plates and refills drinks'],
  ['Food delivery', '15–20%', 'At least $3–5, more in bad weather or for long trips'],
  ['Takeout / pickup', '0–10%', 'Optional; more for large or complicated orders'],
  ['Coffee shop / counter', 'Optional', '$1 or round up is common'],
  ['Large group (6–8+)', '18–20%', 'Check the bill: many restaurants add it automatically'],
];

export const WORLD_GUIDE = [
  ['United States', '18–20%', 'Expected. Servers rely on tips as part of their pay.'],
  ['Canada', '15–20%', 'Expected at sit-down restaurants, usually on the pre-tax total.'],
  ['United Kingdom', '10–12.5%', 'Check the bill first: a service charge is often already added.'],
  ['Mexico', '10–15%', 'Standard at restaurants (la propina). Cash is appreciated.'],
  ['Germany', '5–10%', 'Round up and tell the server the total you want to pay.'],
  ['France', 'Round up', 'Service is included by law (service compris); leave small change for good service.'],
  ['Spain', '5–10% or change', 'Not expected; small change or rounding up is normal.'],
  ['Italy', 'Round up', 'A cover charge (coperto) is common; extra tips are optional.'],
  ['UAE', '10–15%', 'Many bills already include a service charge; tip extra only if not.'],
  ['India', '5–10%', 'Only if no service charge is on the bill. Service charge is optional for guests.'],
  ['Australia', 'Optional', 'Not expected; around 10% for great service.'],
  ['Japan', 'No tip', 'Tipping is not part of the culture and can cause confusion.'],
];

export const FAQ = [
  ['How do I calculate a tip?',
    'Multiply the bill by the tip percentage. For an 18% tip on a $60 bill: 60 × 0.18 = $10.80, so you pay $70.80. This calculator does it for you and also splits the total between people.'],
  ['How do I work out a 20% tip in my head?',
    'Move the decimal point one place to the left to get 10%, then double it. On a $47 bill, 10% is $4.70, so 20% is $9.40. For 15%, take 10% and add half of it: $4.70 + $2.35 = $7.05.'],
  ['Should I tip on the total before or after tax?',
    'Etiquette guides say the pre-tax amount is fine, and that is common in Canada. Many people in the US simply tip on the final total, which gives the server a little more. Turn on "Tip on pre-tax amount" above to see both.'],
  ['Is 18% or 20% the standard tip in the US?',
    'For table service in the US, 18–20% is standard today, and 20% is the most common choice. Many card terminals suggest 18%, 20% and 22%.'],
  ['How much should I tip when splitting the bill?',
    'Work out the tip on the full bill first, then split the total. Set the number of people above and turn on "Round up" so everyone pays an even amount. If people ordered very different things, use our Bill Splitter to split by item.'],
  ['Do I tip on takeout and delivery?',
    'Delivery: yes, 15–20% with a minimum of about $3–5, because the driver is doing the work. Takeout: optional. 0–10% is normal, a little more for big or complicated orders.'],
  ['Should I tip on a discounted meal or coupon?',
    'Tip on the price before the discount. The server did the same work, so base the tip on what the meal would normally cost.'],
  ['What is the difference between a tip, a service charge and an auto-gratuity?',
    'A tip is optional and set by you. A service charge or auto-gratuity is added by the restaurant, often for large groups. If the bill already includes one, you do not need to tip again unless the service was exceptional.'],
];

export const RELATED = [
  ['/tools/bill-splitter', 'Bill Splitter', 'Split a bill by item when everyone ordered different things.'],
  ['/tools/tip-pooling-calculator', 'Tip Pooling Calculator', 'For restaurants: share the night’s tips among staff by hours and role.'],
  ['/tools/sales-tax-calculator', 'Sales Tax Calculator', 'Work out US sales tax on a bill before you tip.'],
];
