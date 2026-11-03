// Data and text for /tools/kot-system (KOT format maker), shared by the page (FAQPage JSON-LD) and the tool.

export const ORDER_TYPES = ['Dine-in', 'Takeaway', 'Delivery'];

export const PAPERS = [
  { id: '58', name: '58 mm', hint: 'Small thermal printer', widthMm: 58, cols: 32 },
  { id: '80', name: '80 mm', hint: 'Standard thermal printer', widthMm: 80, cols: 42 },
  { id: 'a5', name: 'A5 KOT book', hint: 'Half an A4 sheet', widthMm: 148, cols: 0 },
];

export const SAMPLE_ITEMS = [
  { name: 'Paneer Butter Masala', qty: '1', note: 'Less spicy' },
  { name: 'Butter Naan', qty: '4', note: '' },
  { name: 'Jeera Rice', qty: '1', note: '' },
  { name: 'Sweet Lassi', qty: '2', note: 'No ice' },
];

export const FAQ = [
  ['What is a KOT in a restaurant?',
    'KOT stands for Kitchen Order Ticket. It is the slip the waiter or cashier sends to the kitchen with the table number and the items to cook. The kitchen cooks only from the KOT, and the bill is made later from the same items, so what was cooked and what was charged match.'],
  ['What should a KOT format have?',
    'KOT number, date and time, table number or order type (dine-in, takeaway, delivery), the waiter’s name, and each item with its quantity and any special note like "less spicy" or "no onion". Prices are not needed on a KOT. The kitchen doesn’t need them, and leaving them off keeps the slip short.'],
  ['Is a KOT the same as a bill?',
    'No. A KOT goes to the kitchen and has no prices or tax. The bill goes to the customer and has prices, GST and the total. One table can have several KOTs (starters first, then main course) but gets one bill at the end.'],
  ['Can I use a KOT book instead of a printer?',
    'Yes, many small restaurants start with a carbon KOT book: one copy to the kitchen, one stays with the cashier. It works, but handwriting gets misread, copies get lost, and at night someone has to match KOTs to bills by hand. That matching is where missed items and unbilled orders usually hide.'],
  ['What size paper does a KOT printer use?',
    'Most kitchens use a 58 mm or 80 mm thermal roll. 80 mm fits longer item names and is easier for the cook to read from a distance. 58 mm printers are cheaper and fine for short menus and small counters.'],
  ['How does a POS print KOTs?',
    'When the waiter saves an order on the POS, the KOT prints in the kitchen straight away. If you have more than one kitchen station, each station gets only its own items, for example the tandoor gets the naan and the bar gets the drinks. Added items print as a new KOT, so the kitchen only sees what is new.'],
];
