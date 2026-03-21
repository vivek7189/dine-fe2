// Default menus for each business type
// Shown when a restaurant has no real menu items (length === 0)
// All items have isDemo: true so they can be identified

const img = (id) => `/images/menu/${id}.jpg`;

const barMenu = [
  // Whiskey
  { id: 'demo-bar-1', name: "Jack Daniel's Old No. 7", price: 350, category: 'Whiskey', isVeg: true, description: 'Classic Tennessee whiskey, smooth with caramel and vanilla notes', image: img('photo-1527281400683-1aae777175f8'), spiritCategory: 'whiskey', abv: 40, servingUnit: 'peg', status: 'active', isDemo: true },
  { id: 'demo-bar-2', name: 'Jameson Irish Whiskey', price: 320, category: 'Whiskey', isVeg: true, description: 'Triple-distilled smooth Irish whiskey', image: img('photo-1569529465841-dfecdab7503b'), spiritCategory: 'whiskey', abv: 40, servingUnit: 'peg', status: 'active', isDemo: true },
  { id: 'demo-bar-3', name: 'Glenfiddich 12 Year', price: 550, category: 'Whiskey', isVeg: true, description: 'Single malt Scotch with pear and oak notes', image: img('photo-1602081957921-9137a5d6eaee'), spiritCategory: 'whiskey', abv: 40, servingUnit: 'peg', status: 'active', isDemo: true },
  { id: 'demo-bar-4', name: 'Johnnie Walker Black Label', price: 450, category: 'Whiskey', isVeg: true, description: 'Rich blended Scotch with smoky complexity', image: img('photo-1614313511387-1436a4480ebb'), spiritCategory: 'whiskey', abv: 40, servingUnit: 'peg', status: 'active', isDemo: true },
  { id: 'demo-bar-5', name: 'Monkey Shoulder', price: 400, category: 'Whiskey', isVeg: true, description: 'Smooth triple malt blend, perfect for cocktails', image: img('photo-1527281400683-1aae777175f8'), spiritCategory: 'whiskey', abv: 40, servingUnit: 'peg', status: 'active', isDemo: true },
  // Vodka & Gin
  { id: 'demo-bar-6', name: 'Absolut Vodka', price: 250, category: 'Vodka & Gin', isVeg: true, description: 'Swedish premium vodka, clean and smooth', image: img('photo-1607622750671-6cd9a99eabd1'), spiritCategory: 'vodka', abv: 40, servingUnit: 'peg', status: 'active', isDemo: true },
  { id: 'demo-bar-7', name: 'Grey Goose', price: 450, category: 'Vodka & Gin', isVeg: true, description: 'French luxury vodka distilled from wheat', image: img('photo-1607622750671-6cd9a99eabd1'), spiritCategory: 'vodka', abv: 40, servingUnit: 'peg', status: 'active', isDemo: true },
  { id: 'demo-bar-8', name: 'Bombay Sapphire', price: 350, category: 'Vodka & Gin', isVeg: true, description: 'Premium London dry gin with 10 botanicals', image: img('photo-1514362545857-3bc16c4c7d1b'), spiritCategory: 'gin', abv: 40, servingUnit: 'peg', status: 'active', isDemo: true },
  { id: 'demo-bar-9', name: "Hendrick's Gin", price: 400, category: 'Vodka & Gin', isVeg: true, description: 'Scottish gin infused with cucumber and rose', image: img('photo-1551538827-9c037cb4f32a'), spiritCategory: 'gin', abv: 41.4, servingUnit: 'peg', status: 'active', isDemo: true },
  { id: 'demo-bar-10', name: 'Smirnoff Vodka', price: 200, category: 'Vodka & Gin', isVeg: true, description: 'Triple-distilled classic vodka', image: img('photo-1607622750671-6cd9a99eabd1'), spiritCategory: 'vodka', abv: 37.5, servingUnit: 'peg', status: 'active', isDemo: true },
  // Beer
  { id: 'demo-bar-11', name: 'Kingfisher Premium', price: 180, category: 'Beer', isVeg: true, description: "India's most popular lager, crisp and refreshing", image: img('photo-1535958636474-b021ee887b13'), spiritCategory: 'beer', abv: 4.8, servingUnit: 'bottle', status: 'active', isDemo: true },
  { id: 'demo-bar-12', name: 'Heineken', price: 250, category: 'Beer', isVeg: true, description: 'Dutch pale lager with a balanced bitter taste', image: img('photo-1608270586620-248524c67de9'), spiritCategory: 'beer', abv: 5, servingUnit: 'bottle', status: 'active', isDemo: true },
  { id: 'demo-bar-13', name: 'Corona Extra', price: 280, category: 'Beer', isVeg: true, description: 'Mexican light beer, best served with a lime wedge', image: img('photo-1600788886242-5c96aabe3757'), spiritCategory: 'beer', abv: 4.5, servingUnit: 'bottle', status: 'active', isDemo: true },
  { id: 'demo-bar-14', name: 'Budweiser', price: 200, category: 'Beer', isVeg: true, description: 'American lager with smooth, crisp finish', image: img('photo-1618183479302-1e0aa382c36b'), spiritCategory: 'beer', abv: 5, servingUnit: 'bottle', status: 'active', isDemo: true },
  { id: 'demo-bar-15', name: 'Bira White', price: 220, category: 'Beer', isVeg: true, description: 'Indian craft wheat beer with citrus and coriander', image: img('photo-1571613316887-6f8d5cbf7ef7'), spiritCategory: 'beer', abv: 4.7, servingUnit: 'bottle', status: 'active', isDemo: true },
  // Cocktails
  { id: 'demo-bar-16', name: 'Classic Mojito', price: 350, category: 'Cocktails', isVeg: true, description: 'Rum, fresh mint, lime, sugar and soda water', image: img('photo-1551538827-9c037cb4f32a'), spiritCategory: 'cocktail', abv: 15, servingUnit: 'glass', status: 'active', isDemo: true },
  { id: 'demo-bar-17', name: 'Long Island Iced Tea', price: 450, category: 'Cocktails', isVeg: true, description: 'Vodka, rum, gin, tequila, triple sec, cola and lemon', image: img('photo-1536935338788-846bb9981813'), spiritCategory: 'cocktail', abv: 22, servingUnit: 'glass', status: 'active', isDemo: true },
  { id: 'demo-bar-18', name: 'Cosmopolitan', price: 380, category: 'Cocktails', isVeg: true, description: 'Vodka, triple sec, cranberry juice and lime', image: img('photo-1514362545857-3bc16c4c7d1b'), spiritCategory: 'cocktail', abv: 18, servingUnit: 'glass', status: 'active', isDemo: true },
  { id: 'demo-bar-19', name: 'Old Fashioned', price: 420, category: 'Cocktails', isVeg: true, description: 'Bourbon, sugar, Angostura bitters and orange peel', image: img('photo-1470338745628-171cf53de3a8'), spiritCategory: 'cocktail', abv: 30, servingUnit: 'glass', status: 'active', isDemo: true },
  { id: 'demo-bar-20', name: 'Margarita', price: 380, category: 'Cocktails', isVeg: true, description: 'Tequila, triple sec, fresh lime with a salt rim', image: img('photo-1544145945-f90425340c7e'), spiritCategory: 'cocktail', abv: 20, servingUnit: 'glass', status: 'active', isDemo: true },
  { id: 'demo-bar-21', name: 'Piña Colada', price: 350, category: 'Cocktails', isVeg: true, description: 'Rum, coconut cream and pineapple juice, frozen', image: img('photo-1536935338788-846bb9981813'), spiritCategory: 'cocktail', abv: 13, servingUnit: 'glass', status: 'active', isDemo: true },
  // Wine
  { id: 'demo-bar-22', name: 'House Red (Cabernet)', price: 300, category: 'Wine', isVeg: true, description: 'Full-bodied Cabernet Sauvignon by the glass', image: img('photo-1510812431401-41d2bd2722f3'), spiritCategory: 'wine', abv: 13.5, servingUnit: 'glass', status: 'active', isDemo: true },
  { id: 'demo-bar-23', name: 'House White (Chardonnay)', price: 300, category: 'Wine', isVeg: true, description: 'Crisp Chardonnay with citrus and vanilla notes', image: img('photo-1558001373-7b93ee48ffa0'), spiritCategory: 'wine', abv: 13, servingUnit: 'glass', status: 'active', isDemo: true },
  { id: 'demo-bar-24', name: 'Rosé Wine', price: 320, category: 'Wine', isVeg: true, description: 'Light and fruity rosé, perfect for warm evenings', image: img('photo-1558001373-7b93ee48ffa0'), spiritCategory: 'wine', abv: 12, servingUnit: 'glass', status: 'active', isDemo: true },
  { id: 'demo-bar-25', name: 'Sangria Pitcher', price: 550, category: 'Wine', isVeg: true, description: 'Red wine with fresh fruits, brandy and soda', image: img('photo-1510812431401-41d2bd2722f3'), spiritCategory: 'wine', abv: 12, servingUnit: 'glass', status: 'active', isDemo: true },
  // Bar Snacks
  { id: 'demo-bar-26', name: 'Masala Peanuts', price: 120, category: 'Bar Snacks', isVeg: true, description: 'Crunchy spiced peanuts with curry leaves', image: img('photo-1599599810769-bcde5a160d32'), status: 'active', isDemo: true },
  { id: 'demo-bar-27', name: 'Chicken Wings (8 pcs)', price: 320, category: 'Bar Snacks', isVeg: false, description: 'Crispy wings tossed in spicy buffalo sauce', image: img('photo-1608039829572-25e8182a7e46'), status: 'active', isDemo: true },
  { id: 'demo-bar-28', name: 'Fish Fingers', price: 280, category: 'Bar Snacks', isVeg: false, description: 'Golden fried fish strips with tartare sauce', image: img('photo-1604909052743-94e838986d24'), status: 'active', isDemo: true },
  { id: 'demo-bar-29', name: 'Nachos with Salsa', price: 220, category: 'Bar Snacks', isVeg: true, description: 'Crispy tortilla chips with cheese, salsa and guacamole', image: img('photo-1513456852971-30c0b8199d4d'), status: 'active', isDemo: true },
  { id: 'demo-bar-30', name: 'Paneer Tikka', price: 260, category: 'Bar Snacks', isVeg: true, description: 'Smoky grilled cottage cheese with mint chutney', image: img('photo-1567188040759-fb8a883dc6d8'), status: 'active', isDemo: true },
];

const bakeryMenu = [
  // Breads
  { id: 'demo-bk-1', name: 'Sourdough Loaf', price: 180, category: 'Breads', isVeg: true, description: 'Artisan sourdough with a crispy crust and tangy crumb', image: img('photo-1585478259715-876acc5be8eb'), weight: '500g', unit: 'loaf', status: 'active', isDemo: true },
  { id: 'demo-bk-2', name: 'Multigrain Bread', price: 120, category: 'Breads', isVeg: true, description: 'Healthy bread with oats, flax and sunflower seeds', image: img('photo-1509440159596-0249088772ff'), weight: '400g', unit: 'loaf', status: 'active', isDemo: true },
  { id: 'demo-bk-3', name: 'French Baguette', price: 80, category: 'Breads', isVeg: true, description: 'Long crusty French bread, perfect with butter', image: img('photo-1549931319-a545dcf3bc73'), weight: '250g', unit: 'piece', status: 'active', isDemo: true },
  { id: 'demo-bk-4', name: 'Garlic Bread', price: 100, category: 'Breads', isVeg: true, description: 'Toasted bread with garlic butter and herbs', image: img('photo-1619535860434-ba1d8fa12536'), weight: '200g', unit: 'piece', status: 'active', isDemo: true },
  { id: 'demo-bk-5', name: 'Ciabatta', price: 90, category: 'Breads', isVeg: true, description: 'Italian flatbread with olive oil, airy and chewy', image: img('photo-1600398142498-0e371a62bf26'), weight: '300g', unit: 'piece', status: 'active', isDemo: true },
  // Cakes
  { id: 'demo-bk-6', name: 'Chocolate Truffle Cake', price: 450, category: 'Cakes', isVeg: true, description: 'Rich dark chocolate layered cake with ganache', image: img('photo-1578985545062-69928b1d9587'), weight: 'per slice', unit: 'slice', status: 'active', isDemo: true },
  { id: 'demo-bk-7', name: 'Red Velvet Cake', price: 420, category: 'Cakes', isVeg: true, description: 'Classic red velvet with cream cheese frosting', image: img('photo-1616541823729-00fe0aacd32c'), weight: 'per slice', unit: 'slice', status: 'active', isDemo: true },
  { id: 'demo-bk-8', name: 'Black Forest Cake', price: 380, category: 'Cakes', isVeg: true, description: 'Chocolate sponge with cherries and whipped cream', image: img('photo-1606890737304-86aed9e44ce6'), weight: 'per slice', unit: 'slice', status: 'active', isDemo: true },
  { id: 'demo-bk-9', name: 'Pineapple Cake', price: 350, category: 'Cakes', isVeg: true, description: 'Light sponge with fresh pineapple and cream layers', image: img('photo-1488477181946-6428a0291777'), weight: 'per slice', unit: 'slice', status: 'active', isDemo: true },
  { id: 'demo-bk-10', name: 'New York Cheesecake', price: 420, category: 'Cakes', isVeg: true, description: 'Creamy baked cheesecake on a buttery biscuit base', image: img('photo-1524351199678-941a58a3df50'), weight: 'per slice', unit: 'slice', status: 'active', isDemo: true },
  // Pastries
  { id: 'demo-bk-11', name: 'Butter Croissant', price: 90, category: 'Pastries', isVeg: true, description: 'Flaky French pastry with layers of golden butter', image: img('photo-1555507036-ab1f4038024a'), weight: '80g', unit: 'piece', status: 'active', isDemo: true },
  { id: 'demo-bk-12', name: 'Danish Pastry', price: 110, category: 'Pastries', isVeg: true, description: 'Sweet pastry with custard filling and fruit glaze', image: img('photo-1509365390695-33aee754301f'), weight: '100g', unit: 'piece', status: 'active', isDemo: true },
  { id: 'demo-bk-13', name: 'Chocolate Éclair', price: 120, category: 'Pastries', isVeg: true, description: 'Choux pastry filled with cream, topped with chocolate', image: img('photo-1525059696034-4967a8e1dca2'), weight: '90g', unit: 'piece', status: 'active', isDemo: true },
  { id: 'demo-bk-14', name: 'Veg Puff', price: 45, category: 'Pastries', isVeg: true, description: 'Crispy puff pastry with spiced potato and peas filling', image: img('photo-1608039858788-667850f129f6'), weight: '80g', unit: 'piece', status: 'active', isDemo: true },
  { id: 'demo-bk-15', name: 'Cinnamon Roll', price: 120, category: 'Pastries', isVeg: true, description: 'Soft rolled pastry swirled with cinnamon sugar glaze', image: img('photo-1509365465985-25d11c17e812'), weight: '110g', unit: 'piece', status: 'active', isDemo: true },
  // Cookies
  { id: 'demo-bk-16', name: 'Chocolate Chip Cookie', price: 60, category: 'Cookies & Biscuits', isVeg: true, description: 'Classic soft-baked cookie loaded with chocolate chips', image: img('photo-1499636136210-6f4ee915583e'), weight: '50g', unit: 'piece', status: 'active', isDemo: true },
  { id: 'demo-bk-17', name: 'Oatmeal Raisin Cookie', price: 55, category: 'Cookies & Biscuits', isVeg: true, description: 'Chewy oat cookie with plump raisins and cinnamon', image: img('photo-1590080874088-eec64895b423'), weight: '50g', unit: 'piece', status: 'active', isDemo: true },
  { id: 'demo-bk-18', name: 'French Macaron (2 pcs)', price: 120, category: 'Cookies & Biscuits', isVeg: true, description: 'Delicate almond meringue sandwiches with ganache', image: img('photo-1569864358642-9d1684040f43'), weight: '40g', unit: 'box', status: 'active', isDemo: true },
  { id: 'demo-bk-19', name: 'Chocolate Brownie', price: 100, category: 'Cookies & Biscuits', isVeg: true, description: 'Dense fudgy brownie with walnuts', image: img('photo-1606313564200-e75d5e30476c'), weight: '80g', unit: 'piece', status: 'active', isDemo: true },
  { id: 'demo-bk-20', name: 'Almond Biscotti', price: 80, category: 'Cookies & Biscuits', isVeg: true, description: 'Twice-baked Italian almond cookies, perfect with coffee', image: img('photo-1558961363-fa8fdf82db35'), weight: '60g', unit: 'piece', status: 'active', isDemo: true },
  // Savory
  { id: 'demo-bk-21', name: 'Chicken Patty', price: 80, category: 'Savory', isVeg: false, description: 'Spiced minced chicken in flaky pastry', image: img('photo-1600891964599-f94d5421b378'), weight: '120g', unit: 'piece', status: 'active', isDemo: true },
  { id: 'demo-bk-22', name: 'Paneer Roll', price: 70, category: 'Savory', isVeg: true, description: 'Cottage cheese and vegetables wrapped in a paratha', image: img('photo-1626700051175-6818013e1d4f'), weight: '150g', unit: 'piece', status: 'active', isDemo: true },
  { id: 'demo-bk-23', name: 'Quiche Lorraine', price: 160, category: 'Savory', isVeg: false, description: 'French savory tart with bacon, cheese and cream', image: img('photo-1608039783021-96698e4e3ddf'), weight: '180g', unit: 'slice', status: 'active', isDemo: true },
  { id: 'demo-bk-24', name: 'Spinach Corn Sandwich', price: 100, category: 'Savory', isVeg: true, description: 'Grilled sandwich with creamy spinach corn filling', image: img('photo-1528735602780-2552fd46c7af'), weight: '200g', unit: 'piece', status: 'active', isDemo: true },
  { id: 'demo-bk-25', name: 'Cheese Garlic Bread', price: 120, category: 'Savory', isVeg: true, description: 'Toasted bread loaded with mozzarella and garlic butter', image: img('photo-1573140401552-3fab0b4fca47'), weight: '150g', unit: 'piece', status: 'active', isDemo: true },
  // Beverages
  { id: 'demo-bk-26', name: 'Cappuccino', price: 150, category: 'Beverages', isVeg: true, description: 'Espresso with steamed milk foam and cocoa dust', image: img('photo-1572442388796-11668a67e53d'), status: 'active', isDemo: true },
  { id: 'demo-bk-27', name: 'Café Latte', price: 160, category: 'Beverages', isVeg: true, description: 'Smooth espresso with velvety steamed milk', image: img('photo-1461023058943-07fcbe16d735'), status: 'active', isDemo: true },
  { id: 'demo-bk-28', name: 'Hot Chocolate', price: 170, category: 'Beverages', isVeg: true, description: 'Rich chocolate drink topped with whipped cream', image: img('photo-1542990253-0d0f5be5f0ed'), status: 'active', isDemo: true },
  { id: 'demo-bk-29', name: 'Fresh Orange Juice', price: 120, category: 'Beverages', isVeg: true, description: 'Freshly squeezed orange juice, no sugar added', image: img('photo-1621506289937-a8e4df240d0b'), status: 'active', isDemo: true },
  { id: 'demo-bk-30', name: 'Iced Tea', price: 100, category: 'Beverages', isVeg: true, description: 'Refreshing peach iced tea with lemon', image: img('photo-1556679343-c7306c1976bc'), status: 'active', isDemo: true },
];

const iceCreamMenu = [
  // Classic Scoops
  { id: 'demo-ic-1', name: 'Vanilla Bean', price: 80, category: 'Classic Scoops', isVeg: true, description: 'Creamy vanilla ice cream with real vanilla bean specks', image: img('photo-1570197788417-0e82375c9371'), servingSize: 'scoop', status: 'active', isDemo: true },
  { id: 'demo-ic-2', name: 'Belgian Chocolate', price: 90, category: 'Classic Scoops', isVeg: true, description: 'Rich dark chocolate ice cream with cocoa nibs', image: img('photo-1563805042-7684c019e1cb'), servingSize: 'scoop', status: 'active', isDemo: true },
  { id: 'demo-ic-3', name: 'Strawberry Swirl', price: 85, category: 'Classic Scoops', isVeg: true, description: 'Fresh strawberry ice cream with fruit swirls', image: img('photo-1497034825429-c343d7c6a68f'), servingSize: 'scoop', status: 'active', isDemo: true },
  { id: 'demo-ic-4', name: 'Mango Alphonso', price: 100, category: 'Classic Scoops', isVeg: true, description: 'Made with real Alphonso mango pulp, tropical and sweet', image: img('photo-1501443762994-82bd5dace89a'), servingSize: 'scoop', status: 'active', isDemo: true },
  { id: 'demo-ic-5', name: 'Butterscotch Crunch', price: 85, category: 'Classic Scoops', isVeg: true, description: 'Buttery caramel ice cream with crunchy toffee bits', image: img('photo-1580915411954-282cb1b0d780'), servingSize: 'scoop', status: 'active', isDemo: true },
  // Premium Scoops
  { id: 'demo-ic-6', name: 'Salted Caramel', price: 120, category: 'Premium Scoops', isVeg: true, description: 'Sweet and salty caramel swirl, luxuriously smooth', image: img('photo-1560008581-09826d1de69e'), servingSize: 'scoop', status: 'active', isDemo: true },
  { id: 'demo-ic-7', name: 'Cookie Dough', price: 120, category: 'Premium Scoops', isVeg: true, description: 'Vanilla base loaded with chocolate chip cookie dough', image: img('photo-1629385701021-fcd568a743e8'), servingSize: 'scoop', status: 'active', isDemo: true },
  { id: 'demo-ic-8', name: 'Pistachio', price: 130, category: 'Premium Scoops', isVeg: true, description: 'Nutty pistachio gelato with roasted pistachio pieces', image: img('photo-1557142046-c704a3adf364'), servingSize: 'scoop', status: 'active', isDemo: true },
  { id: 'demo-ic-9', name: 'Blueberry Cheesecake', price: 130, category: 'Premium Scoops', isVeg: true, description: 'Cheesecake-flavoured ice cream with blueberry ribbon', image: img('photo-1488900128323-21503983a07e'), servingSize: 'scoop', status: 'active', isDemo: true },
  { id: 'demo-ic-10', name: 'Dark Rum Raisin', price: 140, category: 'Premium Scoops', isVeg: true, description: 'Rich rum-infused ice cream studded with plump raisins', image: img('photo-1516559828984-fb3b99548b21'), servingSize: 'scoop', status: 'active', isDemo: true },
  // Sundaes
  { id: 'demo-ic-11', name: 'Hot Fudge Sundae', price: 220, category: 'Sundaes', isVeg: true, description: 'Vanilla and chocolate scoops with hot fudge and whipped cream', image: img('photo-1563805042-7684c019e1cb'), servingSize: 'sundae', status: 'active', isDemo: true },
  { id: 'demo-ic-12', name: 'Brownie Sundae', price: 250, category: 'Sundaes', isVeg: true, description: 'Warm brownie topped with ice cream, nuts and chocolate sauce', image: img('photo-1551024506-0bccd828d307'), servingSize: 'sundae', status: 'active', isDemo: true },
  { id: 'demo-ic-13', name: 'Banana Split', price: 260, category: 'Sundaes', isVeg: true, description: 'Fresh banana with 3 scoops, whipped cream, nuts and cherry', image: img('photo-1432457990754-c8b5f21448de'), servingSize: 'sundae', status: 'active', isDemo: true },
  { id: 'demo-ic-14', name: 'Caramel Crunch Sundae', price: 240, category: 'Sundaes', isVeg: true, description: 'Caramel ice cream with toffee crunch and butterscotch sauce', image: img('photo-1580915411954-282cb1b0d780'), servingSize: 'sundae', status: 'active', isDemo: true },
  { id: 'demo-ic-15', name: 'Fruit Paradise', price: 230, category: 'Sundaes', isVeg: true, description: 'Mixed fruit with mango and strawberry ice cream', image: img('photo-1488900128323-21503983a07e'), servingSize: 'sundae', status: 'active', isDemo: true },
  // Shakes
  { id: 'demo-ic-16', name: 'Oreo Milkshake', price: 180, category: 'Shakes & Smoothies', isVeg: true, description: 'Thick creamy shake blended with Oreo cookies', image: img('photo-1572490122747-3968b75cc699'), servingSize: 'shake', status: 'active', isDemo: true },
  { id: 'demo-ic-17', name: 'Mango Smoothie', price: 160, category: 'Shakes & Smoothies', isVeg: true, description: 'Fresh mango blended with yogurt and honey', image: img('photo-1623065422902-30a2d299bbe4'), servingSize: 'shake', status: 'active', isDemo: true },
  { id: 'demo-ic-18', name: 'Strawberry Milkshake', price: 170, category: 'Shakes & Smoothies', isVeg: true, description: 'Classic strawberry shake with fresh berries', image: img('photo-1579954115545-a95591f28bfc'), servingSize: 'shake', status: 'active', isDemo: true },
  { id: 'demo-ic-19', name: 'Cold Coffee Shake', price: 160, category: 'Shakes & Smoothies', isVeg: true, description: 'Espresso blended with vanilla ice cream and milk', image: img('photo-1461023058943-07fcbe16d735'), servingSize: 'shake', status: 'active', isDemo: true },
  { id: 'demo-ic-20', name: 'Nutella Shake', price: 200, category: 'Shakes & Smoothies', isVeg: true, description: 'Indulgent Nutella blended with chocolate ice cream', image: img('photo-1541658016709-82535e94bc69'), servingSize: 'shake', status: 'active', isDemo: true },
  // Cones & Cups
  { id: 'demo-ic-21', name: 'Single Scoop Cone', price: 80, category: 'Cones & Cups', isVeg: true, description: 'One scoop of your choice in a crispy wafer cone', image: img('photo-1497034825429-c343d7c6a68f'), servingSize: 'cone', status: 'active', isDemo: true },
  { id: 'demo-ic-22', name: 'Double Scoop Cone', price: 140, category: 'Cones & Cups', isVeg: true, description: 'Two scoops of your choice in a crispy wafer cone', image: img('photo-1501443762994-82bd5dace89a'), servingSize: 'cone', status: 'active', isDemo: true },
  { id: 'demo-ic-23', name: 'Waffle Cone', price: 160, category: 'Cones & Cups', isVeg: true, description: 'Freshly made waffle cone with two scoops', image: img('photo-1570197788417-0e82375c9371'), servingSize: 'cone', status: 'active', isDemo: true },
  { id: 'demo-ic-24', name: 'Cup - Small', price: 100, category: 'Cones & Cups', isVeg: true, description: 'Two scoops in a cup with your choice of topping', image: img('photo-1563805042-7684c019e1cb'), servingSize: 'cup', status: 'active', isDemo: true },
  { id: 'demo-ic-25', name: 'Cup - Large', price: 180, category: 'Cones & Cups', isVeg: true, description: 'Three scoops in a large cup with two toppings', image: img('photo-1488900128323-21503983a07e'), servingSize: 'cup', status: 'active', isDemo: true },
  // Specials
  { id: 'demo-ic-26', name: 'Ice Cream Sandwich', price: 120, category: 'Specials', isVeg: true, description: 'Vanilla ice cream between two chocolate chip cookies', image: img('photo-1629385701021-fcd568a743e8'), status: 'active', isDemo: true },
  { id: 'demo-ic-27', name: 'Kulfi Stick', price: 70, category: 'Specials', isVeg: true, description: 'Traditional Indian frozen dessert with cardamom and pistachio', image: img('photo-1516559828984-fb3b99548b21'), status: 'active', isDemo: true },
  { id: 'demo-ic-28', name: 'Falooda', price: 180, category: 'Specials', isVeg: true, description: 'Rose falooda with vermicelli, basil seeds and ice cream', image: img('photo-1551024506-0bccd828d307'), status: 'active', isDemo: true },
  { id: 'demo-ic-29', name: 'Affogato', price: 160, category: 'Specials', isVeg: true, description: 'Vanilla gelato drowned in a shot of hot espresso', image: img('photo-1461023058943-07fcbe16d735'), status: 'active', isDemo: true },
  { id: 'demo-ic-30', name: 'Ice Cream Cake Slice', price: 200, category: 'Specials', isVeg: true, description: 'Layered ice cream cake with chocolate and vanilla', image: img('photo-1578985545062-69928b1d9587'), status: 'active', isDemo: true },
];

const restaurantMenu = [
  // Chinese
  { id: 'demo-r-1', name: 'Veg Manchurian', price: 180, category: 'Chinese', isVeg: true, description: 'Crispy vegetable balls in tangy manchurian sauce', image: img('photo-1525755662778-989d0524087e'), status: 'active', isDemo: true },
  { id: 'demo-r-2', name: 'Hakka Noodles', price: 160, category: 'Chinese', isVeg: true, description: 'Stir-fried noodles with fresh vegetables', image: img('photo-1569718212165-3a8278d5f624'), status: 'active', isDemo: true },
  { id: 'demo-r-3', name: 'Chicken Fried Rice', price: 200, category: 'Chinese', isVeg: false, description: 'Wok-tossed rice with chicken and vegetables', image: img('photo-1603133872878-684f208fb84b'), status: 'active', isDemo: true },
  { id: 'demo-r-4', name: 'Spring Rolls (4 pcs)', price: 140, category: 'Chinese', isVeg: true, description: 'Crispy rolls stuffed with mixed vegetables', image: img('photo-1548507200-e9e0add0ef19'), status: 'active', isDemo: true },
  { id: 'demo-r-5', name: 'Chilli Chicken', price: 220, category: 'Chinese', isVeg: false, description: 'Spicy chicken tossed with peppers and onions', image: img('photo-1525755662778-989d0524087e'), status: 'active', isDemo: true },
  // Continental
  { id: 'demo-r-6', name: 'Grilled Chicken Breast', price: 320, category: 'Continental', isVeg: false, description: 'Herb-marinated grilled chicken with mashed potatoes', image: img('photo-1532550907401-a500c9a57435'), status: 'active', isDemo: true },
  { id: 'demo-r-7', name: 'Caesar Salad', price: 240, category: 'Continental', isVeg: false, description: 'Romaine lettuce with caesar dressing and croutons', image: img('photo-1546793665-c74683f339c1'), status: 'active', isDemo: true },
  { id: 'demo-r-8', name: 'Cream of Mushroom Soup', price: 160, category: 'Continental', isVeg: true, description: 'Rich and creamy mushroom soup', image: img('photo-1547592166-23ac45744acd'), status: 'active', isDemo: true },
  { id: 'demo-r-9', name: 'Fish and Chips', price: 340, category: 'Continental', isVeg: false, description: 'Beer-battered fish with crispy fries', image: img('photo-1579208030886-b1f5b6b0a7f7'), status: 'active', isDemo: true },
  { id: 'demo-r-10', name: 'Pasta Alfredo', price: 260, category: 'Continental', isVeg: true, description: 'Penne in creamy parmesan alfredo sauce', image: img('photo-1621996346565-e3dbc646d9a9'), status: 'active', isDemo: true },
  // Pizza
  { id: 'demo-r-11', name: 'Margherita Pizza', price: 250, category: 'Pizza', isVeg: true, description: 'Classic tomato sauce, mozzarella and fresh basil', image: img('photo-1574071318508-1cdbab80d002'), status: 'active', isDemo: true },
  { id: 'demo-r-12', name: 'Pepperoni Pizza', price: 350, category: 'Pizza', isVeg: false, description: 'Loaded with pepperoni and mozzarella cheese', image: img('photo-1628840042765-356cda07504e'), status: 'active', isDemo: true },
  { id: 'demo-r-13', name: 'BBQ Chicken Pizza', price: 380, category: 'Pizza', isVeg: false, description: 'Smoky BBQ sauce with grilled chicken and onions', image: img('photo-1565299624946-b28f40a0ae38'), status: 'active', isDemo: true },
  { id: 'demo-r-14', name: 'Veggie Supreme Pizza', price: 300, category: 'Pizza', isVeg: true, description: 'Bell peppers, olives, mushrooms, onions and corn', image: img('photo-1571407970349-bc81e7e96d47'), status: 'active', isDemo: true },
  { id: 'demo-r-15', name: 'Farmhouse Pizza', price: 320, category: 'Pizza', isVeg: true, description: 'Fresh vegetables with herbs on a crispy crust', image: img('photo-1513104890138-7c749659a591'), status: 'active', isDemo: true },
  // Desserts
  { id: 'demo-r-16', name: 'Chocolate Brownie', price: 120, category: 'Desserts', isVeg: true, description: 'Warm fudgy brownie with chocolate sauce', image: img('photo-1606313564200-e75d5e30476c'), status: 'active', isDemo: true },
  { id: 'demo-r-17', name: 'Red Velvet Cake', price: 180, category: 'Desserts', isVeg: true, description: 'Classic red velvet with cream cheese frosting', image: img('photo-1616541823729-00fe0aacd32c'), status: 'active', isDemo: true },
  { id: 'demo-r-18', name: 'Tiramisu', price: 220, category: 'Desserts', isVeg: true, description: 'Italian coffee-flavoured layered dessert', image: img('photo-1571877227200-a0d98ea607e9'), status: 'active', isDemo: true },
  { id: 'demo-r-19', name: 'Cheesecake', price: 200, category: 'Desserts', isVeg: true, description: 'New York style baked cheesecake', image: img('photo-1524351199678-941a58a3df50'), status: 'active', isDemo: true },
  { id: 'demo-r-20', name: 'Gulab Jamun', price: 80, category: 'Desserts', isVeg: true, description: 'Soft milk-solid dumplings soaked in rose sugar syrup', image: img('photo-1666190020498-b8ec9e5ab556'), status: 'active', isDemo: true },
  // Dal & Roti
  { id: 'demo-r-21', name: 'Dal Tadka', price: 140, category: 'Dal & Roti', isVeg: true, description: 'Yellow lentils tempered with cumin and garlic', image: img('photo-1546833999-b9f581a1996d'), status: 'active', isDemo: true },
  { id: 'demo-r-22', name: 'Dal Makhani', price: 180, category: 'Dal & Roti', isVeg: true, description: 'Slow-cooked black lentils in creamy tomato gravy', image: img('photo-1585937421612-70a008356fbe'), status: 'active', isDemo: true },
  { id: 'demo-r-23', name: 'Butter Naan', price: 40, category: 'Dal & Roti', isVeg: true, description: 'Soft leavened bread brushed with butter', image: img('photo-1565557623262-b51c2513a641'), status: 'active', isDemo: true },
  { id: 'demo-r-24', name: 'Paneer Butter Masala', price: 220, category: 'Dal & Roti', isVeg: true, description: 'Cottage cheese cubes in rich buttery tomato gravy', image: img('photo-1631452180519-c014fe946bc7'), status: 'active', isDemo: true },
  { id: 'demo-r-25', name: 'Tandoori Roti', price: 30, category: 'Dal & Roti', isVeg: true, description: 'Whole wheat bread baked in tandoor', image: img('photo-1565557623262-b51c2513a641'), status: 'active', isDemo: true },
  // Beverages
  { id: 'demo-r-26', name: 'Masala Chai', price: 30, category: 'Beverages', isVeg: true, description: 'Traditional Indian spiced tea', image: img('photo-1561336526-2914f13db765'), status: 'active', isDemo: true },
  { id: 'demo-r-27', name: 'Cold Coffee', price: 120, category: 'Beverages', isVeg: true, description: 'Chilled blended coffee with ice cream', image: img('photo-1461023058943-07fcbe16d735'), status: 'active', isDemo: true },
  { id: 'demo-r-28', name: 'Fresh Lime Soda', price: 60, category: 'Beverages', isVeg: true, description: 'Refreshing lime with soda water', image: img('photo-1513558161293-cdaf765ed2fd'), status: 'active', isDemo: true },
  { id: 'demo-r-29', name: 'Mango Lassi', price: 80, category: 'Beverages', isVeg: true, description: 'Creamy mango yogurt smoothie', image: img('photo-1623065422902-30a2d299bbe4'), status: 'active', isDemo: true },
  { id: 'demo-r-30', name: 'Virgin Mojito', price: 140, category: 'Beverages', isVeg: true, description: 'Mint and lime refresher with soda', image: img('photo-1551538827-9c037cb4f32a'), status: 'active', isDemo: true },
];

const cafeMenu = [
  // Hot Beverages
  { id: 'demo-cf-1', name: 'Espresso', price: 120, category: 'Hot Beverages', isVeg: true, description: 'Double shot of rich espresso', image: img('photo-1510707577719-ae7c14805e3a'), status: 'active', isDemo: true },
  { id: 'demo-cf-2', name: 'Cappuccino', price: 160, category: 'Hot Beverages', isVeg: true, description: 'Espresso with steamed milk foam and cocoa dust', image: img('photo-1572442388796-11668a67e53d'), status: 'active', isDemo: true },
  { id: 'demo-cf-3', name: 'Café Latte', price: 170, category: 'Hot Beverages', isVeg: true, description: 'Smooth espresso with velvety steamed milk', image: img('photo-1461023058943-07fcbe16d735'), status: 'active', isDemo: true },
  { id: 'demo-cf-4', name: 'Flat White', price: 180, category: 'Hot Beverages', isVeg: true, description: 'Double espresso with microfoam milk', image: img('photo-1534778101976-62847782c213'), status: 'active', isDemo: true },
  { id: 'demo-cf-5', name: 'Hot Chocolate', price: 170, category: 'Hot Beverages', isVeg: true, description: 'Rich chocolate drink topped with whipped cream', image: img('photo-1542990253-0d0f5be5f0ed'), status: 'active', isDemo: true },
  // Cold Beverages
  { id: 'demo-cf-6', name: 'Iced Americano', price: 160, category: 'Cold Beverages', isVeg: true, description: 'Chilled espresso over ice with cold water', image: img('photo-1517701604599-bb29b565090c'), status: 'active', isDemo: true },
  { id: 'demo-cf-7', name: 'Cold Brew', price: 180, category: 'Cold Beverages', isVeg: true, description: '18-hour cold steeped coffee, smooth and bold', image: img('photo-1461023058943-07fcbe16d735'), status: 'active', isDemo: true },
  { id: 'demo-cf-8', name: 'Iced Mocha', price: 200, category: 'Cold Beverages', isVeg: true, description: 'Espresso with chocolate, milk and ice', image: img('photo-1541658016709-82535e94bc69'), status: 'active', isDemo: true },
  { id: 'demo-cf-9', name: 'Mango Smoothie', price: 180, category: 'Cold Beverages', isVeg: true, description: 'Fresh mango blended with yogurt and honey', image: img('photo-1623065422902-30a2d299bbe4'), status: 'active', isDemo: true },
  { id: 'demo-cf-10', name: 'Fresh Lime Soda', price: 80, category: 'Cold Beverages', isVeg: true, description: 'Refreshing lime with soda water', image: img('photo-1513558161293-cdaf765ed2fd'), status: 'active', isDemo: true },
  // Sandwiches
  { id: 'demo-cf-11', name: 'Club Sandwich', price: 220, category: 'Sandwiches', isVeg: false, description: 'Triple-decker with chicken, bacon, lettuce and tomato', image: img('photo-1528735602780-2552fd46c7af'), status: 'active', isDemo: true },
  { id: 'demo-cf-12', name: 'Grilled Cheese', price: 160, category: 'Sandwiches', isVeg: true, description: 'Melted cheddar and mozzarella on sourdough', image: img('photo-1528735602780-2552fd46c7af'), status: 'active', isDemo: true },
  { id: 'demo-cf-13', name: 'Panini Caprese', price: 200, category: 'Sandwiches', isVeg: true, description: 'Mozzarella, tomato, basil and pesto on ciabatta', image: img('photo-1528735602780-2552fd46c7af'), status: 'active', isDemo: true },
  { id: 'demo-cf-14', name: 'Chicken Wrap', price: 190, category: 'Sandwiches', isVeg: false, description: 'Grilled chicken with veggies and ranch in a tortilla', image: img('photo-1626700051175-6818013e1d4f'), status: 'active', isDemo: true },
  { id: 'demo-cf-15', name: 'Veggie Burger', price: 180, category: 'Sandwiches', isVeg: true, description: 'Black bean patty with lettuce, tomato and cheese', image: img('photo-1571407970349-bc81e7e96d47'), status: 'active', isDemo: true },
  // Snacks
  { id: 'demo-cf-16', name: 'French Fries', price: 120, category: 'Snacks', isVeg: true, description: 'Crispy golden fries with ketchup and mayo', image: img('photo-1573080496219-bb080dd4f877'), status: 'active', isDemo: true },
  { id: 'demo-cf-17', name: 'Nachos with Cheese', price: 180, category: 'Snacks', isVeg: true, description: 'Tortilla chips with melted cheese and salsa', image: img('photo-1513456852971-30c0b8199d4d'), status: 'active', isDemo: true },
  { id: 'demo-cf-18', name: 'Garlic Bread', price: 120, category: 'Snacks', isVeg: true, description: 'Toasted bread with garlic butter and herbs', image: img('photo-1619535860434-ba1d8fa12536'), status: 'active', isDemo: true },
  { id: 'demo-cf-19', name: 'Bruschetta', price: 160, category: 'Snacks', isVeg: true, description: 'Toasted bread topped with tomato, basil and olive oil', image: img('photo-1572695157366-5e585ab2b69f'), status: 'active', isDemo: true },
  { id: 'demo-cf-20', name: 'Chicken Nuggets', price: 160, category: 'Snacks', isVeg: false, description: 'Crispy breaded chicken pieces with dipping sauce', image: img('photo-1562967914-608f82629710'), status: 'active', isDemo: true },
  // Pastries
  { id: 'demo-cf-21', name: 'Butter Croissant', price: 90, category: 'Pastries', isVeg: true, description: 'Flaky French pastry with layers of golden butter', image: img('photo-1555507036-ab1f4038024a'), status: 'active', isDemo: true },
  { id: 'demo-cf-22', name: 'Blueberry Muffin', price: 100, category: 'Pastries', isVeg: true, description: 'Soft muffin loaded with fresh blueberries', image: img('photo-1607958996333-41aef7caefaa'), status: 'active', isDemo: true },
  { id: 'demo-cf-23', name: 'Chocolate Brownie', price: 110, category: 'Pastries', isVeg: true, description: 'Dense fudgy brownie with walnuts', image: img('photo-1606313564200-e75d5e30476c'), status: 'active', isDemo: true },
  { id: 'demo-cf-24', name: 'Red Velvet Slice', price: 150, category: 'Pastries', isVeg: true, description: 'Red velvet cake with cream cheese frosting', image: img('photo-1616541823729-00fe0aacd32c'), status: 'active', isDemo: true },
  { id: 'demo-cf-25', name: 'Cinnamon Roll', price: 120, category: 'Pastries', isVeg: true, description: 'Soft rolled pastry swirled with cinnamon sugar', image: img('photo-1509365465985-25d11c17e812'), status: 'active', isDemo: true },
  // All Day Breakfast
  { id: 'demo-cf-26', name: 'Avocado Toast', price: 200, category: 'All Day Breakfast', isVeg: true, description: 'Smashed avocado on sourdough with cherry tomatoes', image: img('photo-1541519227354-08fa5d50c44d'), status: 'active', isDemo: true },
  { id: 'demo-cf-27', name: 'Eggs Benedict', price: 250, category: 'All Day Breakfast', isVeg: false, description: 'Poached eggs with hollandaise on an English muffin', image: img('photo-1608039829572-25e8182a7e46'), status: 'active', isDemo: true },
  { id: 'demo-cf-28', name: 'Pancake Stack', price: 180, category: 'All Day Breakfast', isVeg: true, description: 'Fluffy pancakes with maple syrup and berries', image: img('photo-1567620905732-2d1ec7ab7445'), status: 'active', isDemo: true },
  { id: 'demo-cf-29', name: 'French Toast', price: 160, category: 'All Day Breakfast', isVeg: true, description: 'Brioche dipped in egg, pan-fried with cinnamon', image: img('photo-1484723091739-30a097e8f929'), status: 'active', isDemo: true },
  { id: 'demo-cf-30', name: 'Granola Bowl', price: 180, category: 'All Day Breakfast', isVeg: true, description: 'Greek yogurt with house granola, honey and fruits', image: img('photo-1490474418585-ba9bad8fd0ea'), status: 'active', isDemo: true },
];

const qsrMenu = [
  // Burgers
  { id: 'demo-qsr-1', name: 'Classic Chicken Burger', price: 150, category: 'Burgers', isVeg: false, description: 'Crispy chicken patty with lettuce, mayo and pickles', image: img('photo-1568901346375-23c9450c58cd'), status: 'active', isDemo: true },
  { id: 'demo-qsr-2', name: 'Veg Crunch Burger', price: 120, category: 'Burgers', isVeg: true, description: 'Crispy veggie patty with shredded cabbage and special sauce', image: img('photo-1571407970349-bc81e7e96d47'), status: 'active', isDemo: true },
  { id: 'demo-qsr-3', name: 'Double Cheese Burger', price: 200, category: 'Burgers', isVeg: false, description: 'Two chicken patties with double cheese and smoky sauce', image: img('photo-1565299507177-b0ac66763828'), status: 'active', isDemo: true },
  { id: 'demo-qsr-4', name: 'Paneer Tikka Burger', price: 140, category: 'Burgers', isVeg: true, description: 'Grilled paneer patty with tandoori mayo and onion rings', image: img('photo-1568901346375-23c9450c58cd'), status: 'active', isDemo: true },
  { id: 'demo-qsr-5', name: 'Spicy Zinger Burger', price: 170, category: 'Burgers', isVeg: false, description: 'Extra-crispy spicy chicken with jalapenos and hot sauce', image: img('photo-1565299507177-b0ac66763828'), status: 'active', isDemo: true },
  // Wraps
  { id: 'demo-qsr-6', name: 'Chicken Shawarma', price: 130, category: 'Wraps & Rolls', isVeg: false, description: 'Spiced chicken in pita with garlic sauce and pickles', image: img('photo-1626700051175-6818013e1d4f'), status: 'active', isDemo: true },
  { id: 'demo-qsr-7', name: 'Paneer Kathi Roll', price: 110, category: 'Wraps & Rolls', isVeg: true, description: 'Grilled paneer with onions and chutney in a paratha', image: img('photo-1626700051175-6818013e1d4f'), status: 'active', isDemo: true },
  { id: 'demo-qsr-8', name: 'Chicken Tikka Roll', price: 130, category: 'Wraps & Rolls', isVeg: false, description: 'Tandoori chicken pieces with mint chutney in a wrap', image: img('photo-1626700051175-6818013e1d4f'), status: 'active', isDemo: true },
  { id: 'demo-qsr-9', name: 'Falafel Wrap', price: 120, category: 'Wraps & Rolls', isVeg: true, description: 'Crispy falafel with hummus and fresh veggies', image: img('photo-1626700051175-6818013e1d4f'), status: 'active', isDemo: true },
  { id: 'demo-qsr-10', name: 'Egg Roll', price: 80, category: 'Wraps & Rolls', isVeg: false, description: 'Egg-stuffed paratha roll with onions and sauce', image: img('photo-1626700051175-6818013e1d4f'), status: 'active', isDemo: true },
  // Combos
  { id: 'demo-qsr-11', name: 'Burger + Fries Combo', price: 220, category: 'Combos', isVeg: false, description: 'Classic chicken burger with regular fries and a drink', image: img('photo-1565299507177-b0ac66763828'), status: 'active', isDemo: true },
  { id: 'demo-qsr-12', name: 'Wrap + Drink Combo', price: 180, category: 'Combos', isVeg: false, description: 'Any wrap with a regular cold drink', image: img('photo-1626700051175-6818013e1d4f'), status: 'active', isDemo: true },
  { id: 'demo-qsr-13', name: 'Family Bucket', price: 550, category: 'Combos', isVeg: false, description: '8 pcs chicken, 2 fries, coleslaw and 4 drinks', image: img('photo-1562967914-608f82629710'), status: 'active', isDemo: true },
  { id: 'demo-qsr-14', name: 'Veg Meal Box', price: 180, category: 'Combos', isVeg: true, description: 'Veg burger, fries, cookie and a cold drink', image: img('photo-1571407970349-bc81e7e96d47'), status: 'active', isDemo: true },
  { id: 'demo-qsr-15', name: 'Kids Meal', price: 150, category: 'Combos', isVeg: true, description: 'Mini burger, small fries, juice and a toy', image: img('photo-1568901346375-23c9450c58cd'), status: 'active', isDemo: true },
  // Sides
  { id: 'demo-qsr-16', name: 'French Fries - Regular', price: 80, category: 'Sides', isVeg: true, description: 'Crispy golden fries with ketchup', image: img('photo-1573080496219-bb080dd4f877'), status: 'active', isDemo: true },
  { id: 'demo-qsr-17', name: 'French Fries - Large', price: 120, category: 'Sides', isVeg: true, description: 'Large portion of crispy golden fries', image: img('photo-1573080496219-bb080dd4f877'), status: 'active', isDemo: true },
  { id: 'demo-qsr-18', name: 'Chicken Nuggets (6 pcs)', price: 140, category: 'Sides', isVeg: false, description: 'Crispy breaded chicken pieces with dipping sauce', image: img('photo-1562967914-608f82629710'), status: 'active', isDemo: true },
  { id: 'demo-qsr-19', name: 'Onion Rings', price: 100, category: 'Sides', isVeg: true, description: 'Crispy battered onion rings with chipotle mayo', image: img('photo-1639024471283-03518883512d'), status: 'active', isDemo: true },
  { id: 'demo-qsr-20', name: 'Coleslaw', price: 60, category: 'Sides', isVeg: true, description: 'Fresh cabbage and carrot in creamy dressing', image: img('photo-1546793665-c74683f339c1'), status: 'active', isDemo: true },
  // Pizza
  { id: 'demo-qsr-21', name: 'Personal Margherita', price: 150, category: 'Pizza', isVeg: true, description: '7-inch pizza with tomato sauce, mozzarella and basil', image: img('photo-1574071318508-1cdbab80d002'), status: 'active', isDemo: true },
  { id: 'demo-qsr-22', name: 'Pepperoni Pizza', price: 220, category: 'Pizza', isVeg: false, description: '7-inch pizza loaded with pepperoni and cheese', image: img('photo-1628840042765-356cda07504e'), status: 'active', isDemo: true },
  { id: 'demo-qsr-23', name: 'Veggie Supreme', price: 200, category: 'Pizza', isVeg: true, description: 'Bell peppers, olives, mushrooms and corn', image: img('photo-1571407970349-bc81e7e96d47'), status: 'active', isDemo: true },
  { id: 'demo-qsr-24', name: 'Garlic Bread Sticks', price: 100, category: 'Pizza', isVeg: true, description: 'Cheesy garlic bread sticks with marinara dip', image: img('photo-1619535860434-ba1d8fa12536'), status: 'active', isDemo: true },
  { id: 'demo-qsr-25', name: 'Cheesy Dip Fries', price: 130, category: 'Pizza', isVeg: true, description: 'Fries loaded with melted cheese and jalapeños', image: img('photo-1573080496219-bb080dd4f877'), status: 'active', isDemo: true },
  // Beverages
  { id: 'demo-qsr-26', name: 'Coca-Cola', price: 50, category: 'Beverages', isVeg: true, description: 'Classic chilled cola - regular size', image: img('photo-1622483767028-3f66f32aef97'), status: 'active', isDemo: true },
  { id: 'demo-qsr-27', name: 'Oreo Milkshake', price: 150, category: 'Beverages', isVeg: true, description: 'Thick creamy shake blended with Oreo cookies', image: img('photo-1572490122747-3968b75cc699'), status: 'active', isDemo: true },
  { id: 'demo-qsr-28', name: 'Cold Coffee', price: 120, category: 'Beverages', isVeg: true, description: 'Chilled blended coffee with ice cream', image: img('photo-1461023058943-07fcbe16d735'), status: 'active', isDemo: true },
  { id: 'demo-qsr-29', name: 'Fresh Lime Soda', price: 60, category: 'Beverages', isVeg: true, description: 'Refreshing lime with soda water', image: img('photo-1513558161293-cdaf765ed2fd'), status: 'active', isDemo: true },
  { id: 'demo-qsr-30', name: 'Mango Shake', price: 130, category: 'Beverages', isVeg: true, description: 'Thick mango shake with fresh Alphonso pulp', image: img('photo-1623065422902-30a2d299bbe4'), status: 'active', isDemo: true },
];

const defaultMenusByType = {
  restaurant: restaurantMenu,
  bar: barMenu,
  bakery: bakeryMenu,
  ice_cream: iceCreamMenu,
  cafe: cafeMenu,
  qsr: qsrMenu,
};

/**
 * Get default menu items for a given business type.
 * Returns items with isDemo: true flag.
 * @param {string} businessType - restaurant, bar, bakery, ice_cream, cafe, qsr
 * @returns {Array} menu items
 */
export function getDefaultMenu(businessType) {
  return defaultMenusByType[businessType] || defaultMenusByType.restaurant;
}

/**
 * Get unique categories from default menu
 * @param {string} businessType
 * @returns {Array} category names
 */
export function getDefaultCategories(businessType) {
  const items = getDefaultMenu(businessType);
  return [...new Set(items.map(item => item.category))];
}

export default defaultMenusByType;
