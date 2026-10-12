// Open Paytm's payment page for a guest order: a plain form POST (mid, orderId, txnToken) to the
// URL our server returned. Works on every phone browser (Paytm's page opens the UPI apps) and
// needs no Paytm script. Paytm sends the guest back to /order-status/<orderId> afterwards.
export function openPaytmCheckout(checkout) {
  if (typeof document === 'undefined' || !checkout?.actionUrl || !checkout?.fields) return false;
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = checkout.actionUrl;
  form.style.display = 'none';
  Object.entries(checkout.fields).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value == null ? '' : String(value);
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
  return true;
}
