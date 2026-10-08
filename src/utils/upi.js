// UPI "tap to pay" links (upi://pay?pa=…&am=…) only work for PERSONAL UPI IDs. For a merchant /
// business UPI ID (PhonePe Business Q…@ybl, Paytm QR, BharatPe, GPay for Business …) Google Pay /
// PhonePe refuse an unsigned link ("this UPI ID doesn't allow this type of payment"). Those
// restaurants are paid by scanning their own QR or by typing the UPI ID — never by a link.

const MERCHANT_UPI = [
  /^q\d{6,}@ybl$/i,        // PhonePe Business
  /^paytmqr/i,             // Paytm for Business QR
  /^bharatpe/i,            // BharatPe
  /@okbiz/i,               // Google Pay for Business
  /\.rzp@/i,               // Razorpay QR
  /^mab\./i,               // HDFC SmartHub merchant
  /^(gpay|pos|merchant)[-.]/i,
];

export function looksLikeMerchantUpi(upiId) {
  const id = String(upiId || '').trim();
  return !!id && MERCHANT_UPI.some((re) => re.test(id));
}

// Show the "Pay ₹X via UPI app" link button? Only for a personal UPI ID, and only when the restaurant
// hasn't uploaded its own UPI QR (an uploaded QR is usually a merchant QR — the reliable way).
export function canUseUpiPayLink({ upiId, upiQrCodeUrl } = {}) {
  return !!upiId && !upiQrCodeUrl && !looksLikeMerchantUpi(upiId);
}

// upi:// link / QR payload. Amount only for personal IDs (merchant QRs with a typed-in amount scan fine).
export function upiPayUri({ upiId, name, amount, note } = {}) {
  if (!upiId) return null;
  const parts = [`pa=${encodeURIComponent(upiId)}`, `pn=${encodeURIComponent(name || '')}`];
  if (!looksLikeMerchantUpi(upiId) && Number(amount) > 0) parts.push(`am=${Number(amount).toFixed(2)}`);
  parts.push('cu=INR');
  if (note && !looksLikeMerchantUpi(upiId)) parts.push(`tn=${encodeURIComponent(note)}`);
  return `upi://pay?${parts.join('&')}`;
}
