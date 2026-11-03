// Copy for the "restaurant bill format" section and FAQ under the bill generator.
export const BILL_MUST_SHOW = [
  'Your restaurant name, address and GSTIN',
  'A bill number that runs in order and does not repeat in the financial year (up to 16 characters, e.g. INV/2026-27/0001)',
  'Date of the bill',
  'Each item with quantity, rate and amount',
  'Taxable value after any discount',
  'CGST and SGST separately, with the rate (2.5% + 2.5% for most restaurants)',
  'SAC code 996331 (restaurant service)',
  'Customer name and address only if the bill is ₹50,000 or more, or the customer asks for a GST bill in their company name',
];

export const FAQ = [
  {
    q: 'What is the GST rate on a restaurant bill?',
    a: 'Most restaurants charge 5% GST: 2.5% CGST plus 2.5% SGST, and they cannot claim input tax credit. Restaurants inside a hotel where any room is priced above ₹7,500 a night charge 18%. Restaurants under the composition scheme do not charge GST on the bill at all.',
  },
  {
    q: 'What should a restaurant bill format have?',
    a: 'Your name, address and GSTIN, a running bill number, the date, each item with quantity and rate, the taxable value, CGST and SGST shown separately, and the total. Add your FSSAI licence number too; FSSAI asks food businesses to print it on bills.',
  },
  {
    q: 'Can I make a restaurant bill in Word or Excel?',
    a: 'Yes. Download the free Word or Excel format on this page. The Excel one works out the amounts, GST and total for you. For more than a few bills a day, billing software is faster and keeps your bill numbers in order without mistakes.',
  },
  {
    q: 'Can a restaurant add service charge to the bill?',
    a: 'Not by default. Under the CCPA guidelines of July 2022, service charge must be optional and the customer can ask for it to be removed. If you show it, label it clearly as voluntary.',
  },
  {
    q: 'What bill does a composition scheme restaurant give?',
    a: 'A bill of supply, not a tax invoice. It must not show GST, and it should carry the line "Composition taxable person, not eligible to collect tax on supplies".',
  },
  {
    q: 'Is this bill generator free?',
    a: 'Yes. Fill in the details, add your logo and download the PDF or print it. No signup.',
  },
];
