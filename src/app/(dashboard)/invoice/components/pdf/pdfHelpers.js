export function formatCurrency(amount, currencySymbol) {
  const cs = currencySymbol || 'Rs.';
  if (amount === null || amount === undefined || isNaN(amount)) return `${cs}0.00`;
  return `${cs}${Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Helper to get type-specific fields
export function getTypeFields(data, type) {
  const typeLabel = type === 'quote' ? 'Quote' : type === 'challan' ? 'Delivery Challan' : 'Invoice';
  const numberField = type === 'quote' ? data.quoteNumber : type === 'challan' ? data.challanNumber : data.invoiceNumber;
  const dateField = type === 'quote' ? data.quoteDate : type === 'challan' ? data.challanDate : data.invoiceDate;
  return { typeLabel, numberField, dateField };
}
