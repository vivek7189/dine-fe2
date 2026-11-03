// Salary slip maths + copy. Rules checked 3 Nov 2026:
// EPF wage ceiling ₹25,000/month from 17 Sep 2026 (S.O. 5109(E)), employee share 12%.
// ESI covers staff earning up to ₹21,000/month, employee share 0.75%, rounded up to the rupee.
export const PF_RATE = 0.12;
export const PF_CEILING = 25000;
export const ESI_RATE = 0.0075;
export const ESI_LIMIT = 21000;

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
  'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigits(n) {
  if (n < 20) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
}
function threeDigits(n) {
  const h = Math.floor(n / 100);
  const r = n % 100;
  return [h ? `${ONES[h]} Hundred` : '', r ? twoDigits(r) : ''].filter(Boolean).join(' ');
}

// Indian numbering: 1,25,000 → "One Lakh Twenty-Five Thousand".
export function inWords(amount) {
  let n = Math.round(Math.abs(Number(amount) || 0));
  if (n === 0) return 'Rupees Zero Only';
  const parts = [];
  const crore = Math.floor(n / 10000000); n %= 10000000;
  const lakh = Math.floor(n / 100000); n %= 100000;
  const thousand = Math.floor(n / 1000); n %= 1000;
  if (crore) parts.push(`${crore >= 100 ? threeDigits(crore) : twoDigits(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (n) parts.push(threeDigits(n));
  return `Rupees ${parts.join(' ')} Only`;
}

export const num = (v) => {
  const x = Number(v);
  return Number.isFinite(x) && x > 0 ? x : 0;
};

export function daysIn(month) {
  const [y, m] = String(month || '').split('-').map(Number);
  if (!y || !m) return 30;
  return new Date(y, m, 0).getDate();
}

export function calc(v) {
  const days = Math.max(1, num(v.days));
  const paidDays = Math.min(days, num(v.worked) + num(v.offs) + num(v.paidLeave));
  const lop = Math.max(0, days - paidDays);
  const f = paidDays / days;

  const basic = Math.round(num(v.basic) * f);
  const hra = Math.round(num(v.hra) * f);
  const food = Math.round(num(v.food) * f);
  const overtime = Math.round(num(v.overtime));
  const incentive = Math.round(num(v.incentive));
  const earnings = [
    ['Basic', basic],
    ['HRA', hra],
    ['Food allowance', food],
    ['Overtime', overtime],
    ['Incentive / tips share', incentive],
  ].filter(([, a], i) => i === 0 || a > 0);
  const gross = basic + hra + food + overtime + incentive;

  const pfBase = v.pfCap ? Math.min(basic, PF_CEILING) : basic;
  const pf = v.pf ? Math.round(pfBase * PF_RATE) : 0;
  const esiApplies = v.esi && gross > 0 && gross <= ESI_LIMIT;
  const esi = esiApplies ? Math.ceil(gross * ESI_RATE) : 0;
  const pt = Math.round(num(v.pt));
  const advance = Math.round(num(v.advance));
  const other = Math.round(num(v.other));
  const deductions = [
    ['Provident Fund (PF)', pf],
    ['ESI', esi],
    ['Professional tax', pt],
    ['Advance recovery', advance],
    [v.otherLabel?.trim() || 'Other deduction', other],
  ].filter(([, a]) => a > 0);
  const totalDed = pf + esi + pt + advance + other;

  return { days, paidDays, lop, earnings, gross, deductions, totalDed, net: gross - totalDed, pf, esi, esiOver: v.esi && gross > ESI_LIMIT };
}

export const FAQ = [
  ['What must a salary slip show?',
    'The name of the business, the employee’s name, role and ID, the month, how many days were paid, every earning and every deduction, and the net amount paid. It also helps to write the net pay in words and how it was paid (bank, UPI or cash), so there is no argument later.'],
  ['How is PF worked out on a salary slip?',
    'The employee’s PF share is 12% of basic pay (plus DA, if you pay DA). From 17 September 2026 the wage ceiling is ₹25,000 a month, so if basic is above that, PF is usually worked out on ₹25,000, which comes to ₹3,000. PF is compulsory once you have 20 or more employees; smaller places can join voluntarily.'],
  ['When do I deduct ESI?',
    'ESI applies to staff whose gross pay is ₹21,000 a month or less, in places with 10 or more employees (in most states). The employee pays 0.75% of gross pay and you pay 3.25%. If someone earns above ₹21,000, leave ESI off their slip.'],
  ['How is salary cut for leave without pay?',
    'Divide the fixed monthly salary by the days in the month and multiply by the days you are paying for. Weekly offs and approved paid leave count as paid days. This tool does that for basic, HRA and food allowance. Overtime and incentives are added as you enter them.'],
  ['Can I give a salary slip to staff I pay in cash?',
    'Yes, and you should. A signed slip is your record that the money was paid, and staff need it for a bank account, loan or rent agreement. Choose Cash as the payment mode and get it signed when you hand over the money.'],
  ['Is this salary slip format valid for a loan or visa?',
    'Banks accept a slip on your business letterhead with your signature or stamp, usually along with a bank statement that shows the salary credit. Add your logo and address here, then sign the printed copy.'],
];
