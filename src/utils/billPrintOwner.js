// Multi-terminal printing for bills: which desktop prints a bill event.
// Same owner / Main rule as kitchen tickets, but only when the server says which desktop raised the
// bill (data.billTerminalId: that desktop's id, or '' when billed on a phone / web / waiter app).
// Events without it (older server, LAN hub, offline) print exactly as before. FAIL-OPEN: when in
// doubt it prints — a duplicate at worst, never a missed bill.
export function shouldPrintBillHere(printSettings, data, myId) {
  if (!printSettings?.multiTerminalPrinting) return true;      // feature OFF → 100% unchanged
  if (!data || typeof data.billTerminalId !== 'string') return true;
  if (!myId) return true;
  if (data.billTerminalId) return data.billTerminalId === myId; // billed on a desktop → that desktop
  const mainId = printSettings.printTerminalId || null;         // billed elsewhere → the Main terminal
  if (!mainId) return true;
  return mainId === myId;
}
