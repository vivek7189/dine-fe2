// Text content for /tools/food-cost-calculator, shared by the page and its FAQPage JSON-LD.

export const BENCHMARKS = [
  ['Quick service / fast food', '25–30%', 'Low prices, high volume, simple recipes.'],
  ['Casual dining', '28–32%', 'The most common target for full-service restaurants.'],
  ['Fine dining', '28–35%', 'Premium ingredients, but higher prices too.'],
  ['Pizza', '20–28%', 'Dough, sauce and cheese are cheap compared with the menu price.'],
  ['Café / coffee shop', '20–30%', 'Drinks carry low food cost; food items pull the average up.'],
  ['Bakery', '25–35%', 'Butter, chocolate and nuts swing costs a lot.'],
  ['Cloud kitchen / delivery', '25–32%', 'Keep it lower to leave room for delivery app commission and packaging.'],
  ['Bar drinks', '18–24% spirits · 20–28% beer · 30–40% wine', 'Pour cost, worked out the same way.'],
];

export const STEPS = [
  ['Cost each ingredient', 'Divide what you paid by the amount you bought, then multiply by the amount the recipe uses. Chicken at 9.00 per kg, 200 g used = 1.80.'],
  ['Add up the plate', 'Add every ingredient, including oil, spices, sauces and garnish. Divide by the number of portions the recipe makes.'],
  ['Divide by the price', 'Food cost % = plate cost ÷ menu price (before tax) × 100. To set a price, divide the plate cost by your target %.'],
];

export const LOWER_COST = [
  ['Weigh portions', 'Use scoops, ladles and a scale. Over-portioning by 10% puts 10% straight onto your food cost.'],
  ['Write recipe cards', 'Every cook makes the dish the same way, so the cost you worked out is the cost you actually pay.'],
  ['Re-cost when prices move', 'Check your top 10 dishes every month, and any dish when a key ingredient goes up.'],
  ['Count stock weekly', 'Opening stock + purchases − closing stock shows what you really used. Compare it with what you sold.'],
  ['Use trim and leftovers', 'Turn trim into stocks, staff meals and specials instead of throwing it away.'],
  ['Engineer the menu', 'Put your high-profit dishes where guests look first, and rework or drop dishes that sell little and earn little.'],
];

export const FAQ = [
  ['How do you calculate food cost percentage?',
    'Food cost % = cost of the ingredients in a dish ÷ its menu price × 100. If a burger costs 4.20 to make and sells for 13.99, the food cost is 4.20 ÷ 13.99 = 30%. Use the menu price before sales tax, VAT or GST.'],
  ['What is a good food cost percentage for a restaurant?',
    'Most restaurants aim for 28–35% across the whole menu. Quick service and pizza often run lower, at 20–30%, and fine dining can go a little higher. Individual dishes can be above or below the target, as long as the menu as a whole hits it.'],
  ['How do I price a menu item from its food cost?',
    'Divide the plate cost by your target food cost %. A dish that costs 4.20 with a 30% target should sell for 4.20 ÷ 0.30 = 14.00. Then round it to a price that suits your menu, such as 13.99, and check it against what nearby restaurants charge.'],
  ['What is the food cost formula for a week or a month?',
    'Food cost % = (opening stock + purchases − closing stock) ÷ food sales × 100. This shows what you really used, including waste, mistakes and over-portioning, so it is usually a few points higher than the cost worked out from recipes.'],
  ['Should food cost include tax?',
    'No. Use the price without sales tax, VAT or GST, because that tax goes to the government, not to you. If your menu prices include tax, as is common in the UK, Europe and the Gulf, take the tax out first. This calculator does it for you when you tick “Menu prices include tax”.'],
  ['What is the difference between food cost and markup?',
    'Food cost % compares cost with price. Markup compares price with cost. A 25% food cost is the same as a 4× markup, 30% is about 3.3×, and 33% is 3×.'],
  ['Why is my real food cost higher than my recipe cost?',
    'Waste, spoilage, over-portioning, staff meals, comps, theft and price rises between orders all add up. Add a few percent for extras and waste on every recipe, count stock regularly, and compare the cost of what you used with what you sold.'],
  ['What is prime cost?',
    'Prime cost is food and drink cost plus labour cost. Many restaurants aim to keep it at or below 60–65% of sales. Food cost is usually the bigger half that you can control week to week.'],
];

export const RELATED = [
  ['/tools/recipe-cost-calculator', 'Recipe Cost Calculator', 'Cost a full recipe batch ingredient by ingredient.'],
  ['/tools/menu-engineering', 'Menu Engineering', 'Find your stars, puzzles and dishes to drop.'],
  ['/tools/profit-margin-calculator', 'Profit Margin Calculator', 'See what is left after every cost.'],
  ['/tools/waste-calculator', 'Food Waste Calculator', 'Put a number on what goes in the bin.'],
  ['/tools/liquor-cost-calculator', 'Liquor Cost Calculator', 'Pour cost for spirits, beer and wine.'],
  ['/tools/labor-cost-calculator', 'Labor Cost Calculator', 'The other half of your prime cost.'],
];
