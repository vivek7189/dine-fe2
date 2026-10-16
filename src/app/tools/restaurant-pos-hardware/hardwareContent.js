// Data and text for /tools/restaurant-pos-hardware, shared by the page and its FAQPage JSON-LD.
// Prices are typical market ranges (October 2026), INR and USD; other currencies are converted from USD.

export const TYPES = [
  ['cafe', 'Café', { counters: 1, stations: 1, tables: 8, waiters: 0 }],
  ['qsr', 'Quick service', { counters: 1, stations: 1, tables: 0, waiters: 0 }],
  ['dinein', 'Dine-in restaurant', { counters: 1, stations: 2, tables: 15, waiters: 3 }],
  ['cloud', 'Cloud kitchen', { counters: 1, stations: 2, tables: 0, waiters: 0 }],
  ['bar', 'Bar / pub', { counters: 1, stations: 2, tables: 10, waiters: 2 }],
  ['bakery', 'Bakery / sweet shop', { counters: 1, stations: 0, tables: 0, waiters: 0 }],
  ['truck', 'Food truck / kiosk', { counters: 1, stations: 0, tables: 0, waiters: 0 }],
];

export const HAS_KITCHEN = ['cafe', 'qsr', 'dinein', 'cloud', 'bar'];
export const HAS_TABLES = ['cafe', 'dinein', 'bar'];
export const HAS_WAITERS = ['dinein', 'bar'];

// id: [name, specs, why, works-with-DineOpen, [inrLow, inrHigh], [usdLow, usdHigh]]
export const ITEMS = {
  own: ['Your phone, tablet or laptop', 'Any device with a browser', 'DineOpen runs on what you already have, so you can start billing today.', 'Web, Windows, Android and iPhone apps', [0, 0], [0, 0]],
  digital: ['Digital bills', 'Share on WhatsApp or show a QR', 'Skip paper at the start and send the bill to the guest’s phone.', 'Built in', [0, 0], [0, 0]],
  oldscreen: ['Kitchen screen on a spare phone or tablet', 'One per kitchen station', 'Orders appear on screen in the kitchen instead of on paper tickets.', 'Kitchen display runs in the browser', [0, 0], [0, 0]],
  ownphones: ['Staff use their own phones', 'Android or iPhone', 'Waiters take orders at the table and send them straight to the kitchen.', 'Waiter app on Android and iPhone', [0, 0], [0, 0]],
  qrpaper: ['Printed QR codes on tables', 'Print on paper or card', 'Guests scan, see the menu and order from their phone.', 'QR menu and ordering built in', [0, 0], [0, 0]],
  tablet: ['Tablet', '10–11 inch Android tablet or iPad, with a stand', 'Light, cheap and fast for a counter with a small menu.', 'Android and iPhone/iPad apps', [12000, 25000], [150, 450]],
  laptop: ['Laptop or mini PC', 'Windows 10/11, 8 GB RAM, with a touch or normal screen', 'Best for busy counters and when you need a weighing scale or many printers.', 'Windows app prints without dialog boxes', [25000, 45000], [350, 700]],
  aio: ['All-in-one touchscreen POS terminal', '15 inch touch screen, Windows or Android', 'A tidy counter that looks professional and lasts for years.', 'Windows app or Android app', [30000, 60000], [500, 1200]],
  bt58: ['Bluetooth receipt printer (58 mm)', 'Portable, battery powered, BLE', 'Small and wireless. Good for trucks, stalls and low volume.', 'Android and iPhone apps (BLE printers)', [2000, 4500], [40, 120]],
  bill80: ['Receipt printer (80 mm thermal)', 'Auto-cutter, USB + LAN', 'Fast, clear bills on the standard roll size. Can open the cash drawer.', 'USB, network (LAN/Wi‑Fi) or Bluetooth', [5500, 12000], [150, 350]],
  kot80: ['Kitchen order printer (80 mm)', 'Network (LAN or Wi‑Fi), auto-cutter', 'Every order prints in the right kitchen the moment it is placed.', 'Network printers, one per station', [7000, 14000], [180, 400]],
  kds: ['Kitchen display screen', '15–22 inch screen or large tablet, wall mount', 'Cooks bump orders when ready. No lost tickets, and you see cooking times.', 'Kitchen display runs in the browser', [12000, 30000], [200, 500]],
  drawer: ['Cash drawer', 'RJ11 cable, 4–5 note slots', 'Opens by itself when a cash bill prints, so the cash stays locked.', 'Opens from the receipt printer', [2500, 5000], [70, 160]],
  scanner: ['Barcode scanner', 'USB, 1D/2D', 'Scan packaged items instead of searching the menu.', 'USB scanners work as a keyboard', [1500, 4000], [40, 150]],
  scale: ['Weighing scale (connected)', 'USB or RS-232, or a label-printing scale', 'Sell by weight without typing it in. Label scales print a price barcode.', 'Windows app reads the weight; label barcodes scan in', [6000, 18000], [150, 500]],
  cdisplay: ['Customer display', 'Small screen or tablet facing the guest', 'Guests see items and the total as you bill. Fewer mistakes and disputes.', 'Customer display page on any screen', [8000, 20000], [120, 300]],
  phones: ['Order-taking phones', 'Budget Android phones, one per waiter', 'Shared phones stay at work, charged and logged in.', 'Waiter app on Android', [8000, 12000], [120, 200]],
  router: ['Wi‑Fi router', 'Dual-band, placed near the counter', 'Network printers and kitchen screens need a steady local network.', 'Required for network printers', [1500, 5000], [60, 200]],
  ups: ['UPS / power backup', '600–1000 VA for the counter', 'Keeps the counter and printer running through power cuts.', 'Any', [3000, 8000], [80, 200]],
  qrstand: ['Table QR stands', 'Acrylic stands with your QR codes', 'Neat, wipeable QR codes that last.', 'QR menu and ordering built in', [50, 200], [2, 8]],
};

export const TIERS = [
  ['lean', 'Start with what you have', 'Use your phone or laptop. Add hardware later.'],
  ['ess', 'Essentials', 'Printers, cash drawer and the basics for a busy day.'],
  ['full', 'Full counter', 'Touchscreen, kitchen display and every extra.'],
];

// Returns [[itemId, qty], ...] for a business type, tier and counts.
export function buildKit(type, tier, c, currency) {
  const k = HAS_KITCHEN.includes(type);
  const t = HAS_TABLES.includes(type) ? c.tables : 0;
  const w = HAS_WAITERS.includes(type) ? c.waiters : 0;
  const s = k ? c.stations : 0;
  const n = c.counters;
  const out = [];
  const add = (id, q) => { if (q > 0) out.push([id, q]); };
  if (tier === 'lean') {
    add('own', n); add('digital', 1); add('oldscreen', s); add('ownphones', w); add('qrpaper', t);
    return out;
  }
  const small = ['cafe', 'qsr', 'truck'].includes(type);
  if (tier === 'ess') add(small ? 'tablet' : 'laptop', n);
  else add(type === 'truck' ? 'tablet' : 'aio', n);
  // A truck starts on a Bluetooth printer; the full kit moves to an 80 mm printer that can open a drawer.
  add(type === 'truck' && tier === 'ess' ? 'bt58' : 'bill80', n);
  add('kot80', s);
  if (tier === 'full') add('kds', s);
  if (type !== 'cloud' && !(type === 'truck' && tier === 'ess')) add('drawer', n);
  if (type === 'bakery' || (tier === 'full' && ['cafe', 'qsr'].includes(type))) add('scanner', n);
  if (type === 'bakery') add('scale', n);
  if (tier === 'full' && ['cafe', 'qsr', 'bakery', 'truck'].includes(type)) add('cdisplay', n);
  if (tier === 'ess') add('ownphones', w); else add('phones', w);
  if (type !== 'truck' && (s > 0 || tier === 'full')) add('router', 1);
  if (type !== 'truck' && (tier === 'full' || currency === 'INR')) add('ups', n);
  if (tier === 'full') add('qrstand', t); else add('qrpaper', t);
  return out;
}

export const PRINTER_GUIDE = [
  ['80 mm thermal', 'Bills and kitchen tickets at most restaurants', 'Standard roll, fast, auto-cutter, can open a cash drawer.'],
  ['58 mm thermal', 'Food trucks, stalls, small cafés', 'Cheaper and smaller. Narrow bills fit fewer columns.'],
  ['Impact (dot matrix)', 'Very hot kitchens, two-colour tickets', 'Uses plain paper that heat can’t darken. Louder and slower.'],
  ['Label printer', 'Takeaway and delivery bag labels', 'Sticky labels with order number and items.'],
];

export const CONNECTIONS = [
  ['USB', 'One device next to the printer', 'Simple and reliable, but only the device it is plugged into can print.'],
  ['Network (LAN or Wi‑Fi)', 'Kitchen printers, several devices', 'Any device on your network can print to it. Best for kitchens.'],
  ['Bluetooth', 'Phones, tablets, trucks', 'No cables, but short range. Pick a printer that supports Bluetooth Low Energy (BLE).'],
];

export const DEVICE_GUIDE = [
  ['Phone', 'Waiters, trucks, starting out', 'Free if you have one. Small screen for a big menu.'],
  ['Tablet', 'Cafés and quick service', 'Big enough to bill fast. Use a stand and a charger at the counter.'],
  ['Laptop / mini PC', 'Busy counters, bakeries', 'Works with the most printers, scales and drawers through the Windows app.'],
  ['All-in-one terminal', 'Front counter at a busy restaurant', 'Durable and tidy. The most expensive option.'],
];

export const FAQ = [
  ['How much does a restaurant POS machine cost?',
    'For one counter with one kitchen, a tablet, 80 mm receipt printer, kitchen printer, cash drawer, router and UPS cost about ₹30,000–₹70,000 in India, or $600–$1,600 in the US. If you already have a phone, tablet or laptop, a receipt printer and cash drawer alone cost about ₹8,000–₹17,000. You can also start with no hardware at all.'],
  ['Do I need a special POS machine for my restaurant?',
    'No. Modern POS software such as DineOpen runs on an ordinary phone, tablet, laptop or desktop. A dedicated POS terminal is tidier and tougher, but it is not required. Buy printers and drawers from any local supplier.'],
  ['Which printer size should I buy, 58 mm or 80 mm?',
    '80 mm is the standard for restaurant bills and kitchen tickets. It prints more text per line, cuts paper automatically and can open a cash drawer. 58 mm printers are cheaper and smaller, which suits food trucks and stalls.'],
  ['Should my kitchen printer be USB, Wi‑Fi or LAN?',
    'Use a network printer (LAN cable or Wi‑Fi) in the kitchen. Then every billing device and waiter phone can send orders to it. A LAN cable is the most reliable. USB printers only print from the one device they are plugged into.'],
  ['Kitchen printer or kitchen display screen?',
    'Printers are cheap and familiar. A kitchen display screen shows orders in time order, lets cooks mark them ready and shows how long each order is taking. Many kitchens start with a printer and add a screen later, or keep both.'],
  ['Can I use my phone as a POS?',
    'Yes. You can take orders and bill from a phone with the DineOpen app or in the browser, and connect a Bluetooth printer if you want paper bills. Many owners start this way and add a tablet or printer as they grow.'],
  ['Do I need a cash drawer?',
    'If you take cash, yes. A drawer that opens only when a cash bill prints keeps cash locked and makes counting at the end of the day easier. Cloud kitchens that take only online payments can skip it.'],
  ['Does DineOpen sell hardware?',
    'No. DineOpen is software. You can buy printers, drawers, scanners and screens from any local supplier or online store. This guide shows what works with DineOpen and how it connects.'],
];

export const RELATED = [
  ['/tools/startup-cost-calculator', 'Restaurant Startup Cost Calculator', 'Everything it costs to open, not just hardware.'],
  ['/tools/food-cost-calculator', 'Food Cost Calculator', 'Price every dish for a healthy food cost.'],
  ['/tools/qr-menu-generator', 'QR Menu Generator', 'Make a QR code for your menu.'],
];
