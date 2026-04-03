export const sampleInvoiceData = {
  invoiceNumber: 'INV-0042',
  invoiceDate: '2026-04-01',
  dueDate: '2026-05-01',
  status: 'sent',
  customer: {
    name: 'Acme Corporation',
    email: 'billing@acme.co',
    phone: '+91 98765 43210',
    address: '123 Business Ave, Mumbai, MH 400001',
  },
  customerName: 'Acme Corporation',
  items: [
    { name: 'Website Design & Development', quantity: 1, rate: 35000, taxRate: 18, amount: 35000 },
    { name: 'Brand Identity Package', quantity: 1, rate: 12000, taxRate: 18, amount: 12000 },
    { name: 'Monthly Hosting & Maintenance', quantity: 3, rate: 1500, taxRate: 18, amount: 4500 },
  ],
  subtotal: 51500,
  discountType: 'percentage',
  discountValue: 5,
  discountAmount: 2575,
  taxAmount: 8806.50,
  adjustments: 0,
  total: 57731.50,
  balanceDue: 57731.50,
  customerNotes: 'Thank you for your business! Payment is due within 30 days.',
  termsAndConditions: 'Late payments subject to 1.5% monthly interest.',
  paymentTerms: 'net_30',
};

export const sampleOrg = {
  name: 'DineOpen Studio',
  email: 'hello@dineopen.com',
  phone: '+91 98765 43210',
  address: '456 Tech Park, Bangalore, KA 560001',
  gstin: '29AAACR5055K1Z5',
};
