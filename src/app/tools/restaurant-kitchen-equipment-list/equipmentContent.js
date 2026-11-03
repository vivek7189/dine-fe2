// Kitchen equipment presets for /tools/restaurant-kitchen-equipment-list.
// Prices are per piece, in ₹, typical Indian dealer asking prices seen on IndiaMART, Tradeindia,
// Aajjo and appliance retailers (checked Nov 2026). Most dealer prices are before GST.
// Each item: [id, name, group, qty, low, high, note?]

export const GROUPS = ['Cooking', 'Refrigeration', 'Prep', 'Storage & shelving', 'Washing', 'Billing & counter'];

const I = {
  range2: ['range2', '2-burner commercial gas range', 'Cooking', 1, 12000, 22000],
  range3: ['range3', '3-burner commercial gas range', 'Cooking', 1, 18000, 32000],
  chinese: ['chinese', 'Chinese / wok range (high-pressure burner)', 'Cooking', 1, 15000, 35000],
  tandoor: ['tandoor', 'Tandoor (SS body, clay pot)', 'Cooking', 1, 25000, 60000],
  griddle: ['griddle', 'Griddle / tawa plate', 'Cooking', 1, 8000, 25000],
  fryer: ['fryer', 'Deep fryer (gas or electric)', 'Cooking', 1, 8000, 28000],
  sandwich: ['sandwich', 'Sandwich griller / panini press', 'Cooking', 1, 5000, 15000],
  microwave: ['microwave', 'Microwave / OTG', 'Cooking', 1, 8000, 25000],
  pizzaOven: ['pizzaOven', 'Pizza oven (electric deck)', 'Cooking', 1, 35000, 90000],
  deckOven: ['deckOven', 'Deck oven (double deck)', 'Cooking', 1, 45000, 1.5e5],
  bulkCooker: ['bulkCooker', 'Bulk cooker / boiling pan', 'Cooking', 1, 20000, 60000],
  bainMarie: ['bainMarie', 'Bain marie (keeps gravies hot)', 'Cooking', 1, 12000, 30000],
  espresso: ['espresso', 'Espresso machine (2-group, entry level)', 'Cooking', 1, 1.5e5, 3.5e5, 'Small local makers sell for less, imported brands cost much more.'],
  grinderCoffee: ['grinderCoffee', 'Coffee grinder', 'Cooking', 1, 25000, 80000],

  fridge4: ['fridge4', '4-door vertical fridge / freezer', 'Refrigeration', 1, 80000, 1.6e5],
  uc: ['uc', 'Under-counter fridge (work table type)', 'Refrigeration', 1, 45000, 90000],
  freezer: ['freezer', 'Deep freezer, 300 L', 'Refrigeration', 1, 21000, 32000],
  visi: ['visi', 'Visi cooler (glass door), 300 L', 'Refrigeration', 1, 30000, 38000],
  display: ['display', 'Cake / pastry display counter', 'Refrigeration', 1, 40000, 1.2e5],
  iceMaker: ['iceMaker', 'Ice cube machine', 'Refrigeration', 1, 35000, 90000],

  table: ['table', 'SS work table, 4 × 2 ft', 'Prep', 2, 9000, 15000],
  mixer: ['mixer', 'Commercial mixer grinder', 'Prep', 1, 6000, 18000],
  blender: ['blender', 'Commercial blender (shakes, smoothies)', 'Prep', 1, 8000, 25000],
  wetGrinder: ['wetGrinder', 'Wet grinder (batter)', 'Prep', 1, 15000, 40000],
  veg: ['veg', 'Vegetable cutter', 'Prep', 1, 8000, 30000],
  dough: ['dough', 'Dough kneader', 'Prep', 1, 25000, 70000],
  planetary: ['planetary', 'Planetary mixer (cakes, cream)', 'Prep', 1, 35000, 1.2e5],
  proofer: ['proofer', 'Proofer cabinet', 'Prep', 1, 35000, 70000],
  scale: ['scale', 'Weighing scale', 'Prep', 1, 1500, 5000],
  utensils: ['utensils', 'Pots, pans, ladles, knives, boards', 'Prep', 1, 15000, 40000],

  rack: ['rack', 'SS storage rack, 4 shelves', 'Storage & shelving', 2, 7000, 14000],
  bins: ['bins', 'Ingredient bins and containers', 'Storage & shelving', 1, 3000, 10000],
  overhead: ['overhead', 'Wall / overhead shelf', 'Storage & shelving', 2, 2500, 6000],

  sink2: ['sink2', '2-bowl SS sink with drain board', 'Washing', 1, 12000, 25000],
  sink3: ['sink3', '3-bowl SS sink with drain board', 'Washing', 1, 18000, 35000],
  hood: ['hood', 'Exhaust hood with baffle filter (per 6 ft)', 'Washing', 1, 12000, 25000, 'Usually ₹2,000–4,000 a foot in steel. Ducting and fan are extra.'],
  purifier: ['purifier', 'Water purifier (commercial RO)', 'Washing', 1, 15000, 45000],
  extinguisher: ['extinguisher', 'Fire extinguishers + fire blanket', 'Washing', 1, 4000, 10000],

  pos: ['pos', 'Billing tablet or PC', 'Billing & counter', 1, 12000, 35000],
  printer: ['printer', 'Thermal bill / KOT printer', 'Billing & counter', 1, 3500, 9000],
  drawer: ['drawer', 'Cash drawer', 'Billing & counter', 1, 2500, 5000],
  counter: ['counter', 'Service counter (fabricated)', 'Billing & counter', 1, 30000, 1e5],
};

const pick = (ids, qty = {}) => ids.map((id) => {
  const [, name, group, q, low, high, note] = I[id];
  return { id, name, group, qty: qty[id] ?? q, low, high, note: note || '', on: true };
});

export const PRESETS = [
  {
    id: 'cafe', name: 'Café',
    blurb: 'Coffee, shakes, sandwiches and a few baked items. About 20–30 seats.',
    items: pick(['range2', 'sandwich', 'microwave', 'espresso', 'grinderCoffee', 'uc', 'visi', 'display', 'table', 'blender', 'mixer', 'scale', 'utensils', 'rack', 'bins', 'sink2', 'purifier', 'extinguisher', 'pos', 'printer', 'drawer', 'counter'], { table: 1 }),
  },
  {
    id: 'qsr', name: 'QSR / fast food',
    blurb: 'Burgers, rolls, momos, fries. Counter service with a short menu.',
    items: pick(['range3', 'fryer', 'griddle', 'sandwich', 'microwave', 'bainMarie', 'fridge4', 'uc', 'freezer', 'visi', 'table', 'mixer', 'veg', 'scale', 'utensils', 'rack', 'bins', 'sink2', 'hood', 'purifier', 'extinguisher', 'pos', 'printer', 'drawer', 'counter'], { fryer: 2 }),
  },
  {
    id: 'cloud', name: 'Cloud kitchen',
    blurb: 'Delivery only, one or two brands, no seating or front counter.',
    items: pick(['range3', 'chinese', 'fryer', 'bainMarie', 'fridge4', 'freezer', 'table', 'mixer', 'veg', 'scale', 'utensils', 'rack', 'bins', 'overhead', 'sink2', 'hood', 'purifier', 'extinguisher', 'pos', 'printer'], { table: 3 }),
  },
  {
    id: 'bakery', name: 'Bakery',
    blurb: 'Breads, cakes and pastries baked on site, with a display counter.',
    items: pick(['deckOven', 'microwave', 'fridge4', 'freezer', 'display', 'table', 'planetary', 'dough', 'proofer', 'scale', 'utensils', 'rack', 'bins', 'sink2', 'purifier', 'extinguisher', 'pos', 'printer', 'drawer', 'counter'], { table: 2, rack: 3 }),
  },
  {
    id: 'dhaba', name: 'Dhaba / casual dining',
    blurb: 'North Indian or multi-cuisine menu with tandoor, 40–60 seats.',
    items: pick(['range3', 'chinese', 'tandoor', 'bulkCooker', 'fryer', 'bainMarie', 'fridge4', 'freezer', 'visi', 'table', 'mixer', 'wetGrinder', 'veg', 'dough', 'scale', 'utensils', 'rack', 'bins', 'overhead', 'sink3', 'hood', 'purifier', 'extinguisher', 'pos', 'printer', 'drawer', 'counter'], { table: 3, range3: 2, hood: 2 }),
  },
];

export const FAQ = [
  ['How much does kitchen equipment cost for a small restaurant in India?',
    'For a small café the kitchen and counter equipment usually comes to ₹4–10 lakh with a 2-group espresso machine, or ₹2–4 lakh with a small coffee machine or none. A QSR or cloud kitchen is often ₹3–6 lakh. A dhaba or casual dining kitchen with a tandoor and two ranges is more like ₹6–10 lakh. Interiors, rent deposit and licences are on top of this.'],
  ['What is the minimum equipment needed to start a cloud kitchen?',
    'A 3-burner range, a fryer if you sell fried items, one 4-door fridge or two under-counter fridges, a deep freezer, two or three steel work tables, a sink, an exhaust hood, a mixer grinder, storage racks and a billing setup with a KOT printer. That covers most single-brand cloud kitchens.'],
  ['Should I buy new or used restaurant equipment?',
    'Buy steel items like tables, racks, sinks and ranges used if they are in good shape. They have no motor and last for years. Buy fridges, freezers, ice machines and espresso machines new or with a warranty, because a failed compressor costs a lot and can spoil a day of stock.'],
  ['Gas or electric: which is cheaper to run?',
    'For Indian cooking on burners, commercial LPG is usually cheaper and faster. Electric makes sense for ovens, fryers in small spaces and places where you cannot get a gas connection. Check your electricity load before buying many electric items, as you may need a three-phase connection.'],
  ['Do these prices include GST?',
    'Most dealer prices are quoted before GST, which is usually 18% on kitchen equipment. Delivery, installation, gas piping and ducting are often extra, so ask for a full quote.'],
];
