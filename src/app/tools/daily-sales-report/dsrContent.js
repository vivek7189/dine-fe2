// Data, maths and text for /tools/daily-sales-report, shared by the page (FAQPage JSON-LD) and the tool.

export const MODES = [
  ['cash', 'Cash'],
  ['upi', 'UPI'],
  ['card', 'Card'],
  ['swiggy', 'Swiggy'],
  ['zomato', 'Zomato'],
  ['credit', 'Credit (udhaar)'],
];

// A normal mid-size day, so the report shows something useful before the owner types anything.
export const SAMPLE = {
  outlet: 'Sharma Café',
  preparedBy: '',
  bills: '86',
  cash: '9450',
  upi: '14280',
  card: '3120',
  swiggy: '4860',
  zomato: '3730',
  credit: '650',
  discounts: '820',
  voidCount: '2',
  voidAmount: '340',
  opening: '2000',
  takenOut: '5000',
  counted: '5730',
  notes: '',
  expenses: [
    { what: 'Milk and bread', amt: '480' },
    { what: 'Gas cylinder delivery tip', amt: '50' },
  ],
};

export const BLANK = {
  outlet: '', preparedBy: '', bills: '', cash: '', upi: '', card: '', swiggy: '', zomato: '', credit: '',
  discounts: '', voidCount: '', voidAmount: '', opening: '', takenOut: '', counted: '', notes: '',
  expenses: [{ what: '', amt: '' }],
};

const n = (v) => {
  const x = parseFloat(v);
  return Number.isFinite(x) ? x : 0;
};

export function calc(v) {
  const modes = MODES.map(([k, label]) => ({ k, label, amt: n(v[k]) }));
  const total = modes.reduce((s, m) => s + m.amt, 0);
  const bills = Math.round(n(v.bills));
  const expenses = v.expenses.filter((e) => e.what.trim() || n(e.amt)).map((e) => ({ what: e.what.trim() || 'Expense', amt: n(e.amt) }));
  const expTotal = expenses.reduce((s, e) => s + e.amt, 0);
  const cash = n(v.cash);
  const expected = n(v.opening) + cash - expTotal - n(v.takenOut);
  const countedSet = String(v.counted).trim() !== '';
  const diff = countedSet ? n(v.counted) - expected : null;
  return {
    modes, total, bills, avg: bills > 0 ? total / bills : 0,
    discounts: n(v.discounts), voidCount: Math.round(n(v.voidCount)), voidAmount: n(v.voidAmount),
    opening: n(v.opening), cash, expenses, expTotal, takenOut: n(v.takenOut),
    expected, counted: n(v.counted), countedSet, diff,
    online: n(v.swiggy) + n(v.zomato),
  };
}

export const FAQ = [
  ['What should a daily sales report have?',
    'At the least: the date, number of bills, total sales, and how that money came in (cash, UPI, card, Swiggy, Zomato and credit). Add discounts and cancelled bills, because that is where money quietly goes missing. Then the cash check: opening cash, cash sales, expenses paid from the drawer, cash taken out, and what is actually in the drawer at closing.'],
  ['How do I check the cash at closing?',
    'Expected cash = opening cash + cash sales − expenses paid from the drawer − cash taken out (for a bank deposit or handed to the owner). Count the drawer and compare. If the two match, the day is clean. Write down any difference, even ₹10, with a reason if you know it.'],
  ['The cash is short. What should I check first?',
    'Most small differences come from three things: a UPI payment entered as cash, change given wrongly at a busy time, or an expense paid from the drawer that nobody wrote down. If the drawer is short by a similar amount several days in a row, look at cancelled bills and discounts for that staff member’s shift.'],
  ['Should Swiggy and Zomato orders go in the daily report?',
    'Yes, but on their own lines. That money doesn’t come into your drawer or your UPI that day. The apps pay you every week, after taking commission, GST on commission and other charges. Keeping them separate lets you match each payout later and see how much of your business depends on the apps.'],
  ['Can I send this report on WhatsApp?',
    'Yes. Press "Copy for WhatsApp" and paste it in the owner or partner group, or use "Open WhatsApp" on your phone. The text is short, so it reads well on a phone screen.'],
  ['Is Excel enough, or do I need billing software?',
    'For one counter with a few dozen bills a day, a daily sheet in Excel works fine as long as someone fills it every night. Once you have staff billing, several payment modes and app orders, it gets slow and mistakes creep in. Billing software builds this report on its own from every bill, so the only thing left to do at night is count the cash.'],
];
