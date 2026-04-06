#!/usr/bin/env node
/**
 * Download food placeholder images from Pexels API.
 * Names files for easy keyword matching in placeholderImages.js
 *
 * Usage: PEXELS_API_KEY=xxx node scripts/download-placeholders.js
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.PEXELS_API_KEY;
if (!API_KEY) {
  console.error('❌ Set PEXELS_API_KEY env variable');
  process.exit(1);
}

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'placeholder-images');

// [filename, pexels search query]
const IMAGES = [
  // === Indian Main Course ===
  ['biryani.jpeg', 'chicken biryani rice plate'],
  ['butter-chicken.jpeg', 'butter chicken curry orange'],
  ['tandoori-chicken.jpeg', 'tandoori chicken red grilled'],
  ['chicken-curry.jpeg', 'chicken curry bowl indian'],
  ['mutton-curry.jpeg', 'lamb curry gravy meat'],
  ['fish-curry.jpeg', 'fish curry bengali'],
  ['egg-curry.jpeg', 'egg curry masala boiled'],
  ['chole.jpeg', 'chickpea chana masala curry'],
  ['rajma.jpeg', 'kidney bean curry bowl'],
  ['palak-paneer.jpeg', 'palak paneer spinach green curry'],
  ['malai-kofta.jpeg', 'malai kofta creamy curry balls'],
  ['aloo-gobi.jpeg', 'cauliflower potato curry indian'],
  ['mixed-veg.jpeg', 'mixed vegetable curry indian'],
  ['korma.jpeg', 'chicken korma creamy sauce'],
  ['dal-tadka.jpeg', 'yellow dal lentils tadka'],
  ['kadhai.jpeg', 'kadhai paneer wok'],
  ['shahi-paneer.jpeg', 'paneer curry rich creamy'],
  ['aloo-matar.jpeg', 'peas potato curry'],
  ['chana-dal.jpeg', 'chana dal lentil curry'],
  ['baingan.jpeg', 'baingan eggplant curry roasted'],
  ['bhindi.jpeg', 'okra bhindi fry indian'],
  ['lauki.jpeg', 'bottle gourd curry indian'],
  ['mushroom-curry.jpeg', 'mushroom curry masala'],
  ['kofta-curry.jpeg', 'veg kofta curry balls'],
  ['chicken-do-pyaza.jpeg', 'chicken do pyaza onion curry'],

  // === Bengali Specialties ===
  ['fish-kalia.jpeg', 'bengali fish curry rich'],
  ['prawn-malai.jpeg', 'prawn malai curry coconut'],
  ['ilish.jpeg', 'hilsa fish mustard curry'],
  ['chicken-kosha.jpeg', 'chicken kosha dry curry dark'],
  ['mutton-kosha.jpeg', 'mutton kosha slow cooked dry'],
  ['mughlai-paratha.jpeg', 'stuffed mughlai paratha egg'],
  ['fish-batter-fry.jpeg', 'fish batter fry crispy'],
  ['fish-fry.jpeg', 'crispy fried fish plate'],
  ['kochuri.jpeg', 'stuffed puri deep fried bread'],

  // === South Indian ===
  ['dosa.jpeg', 'masala dosa crispy south indian'],
  ['idli.jpeg', 'idli sambar white steamed'],
  ['vada.jpeg', 'medu vada fried lentil'],
  ['uttapam.jpeg', 'uttapam thick pancake vegetables'],
  ['upma.jpeg', 'upma semolina dish breakfast'],
  ['appam.jpeg', 'appam bowl shaped pancake'],
  ['pongal.jpeg', 'pongal rice lentil south indian'],
  ['rasam.jpeg', 'rasam soup south indian tangy'],
  ['sambhar.jpeg', 'sambhar dal vegetable stew'],
  ['pesarattu.jpeg', 'moong dal dosa green crepe'],

  // === Street Food / Snacks / Starters ===
  ['samosa.jpeg', 'samosa fried triangular pastry'],
  ['pakora.jpeg', 'pakora onion fritters plate'],
  ['momos.jpeg', 'steamed momos dumplings plate'],
  ['chaat.jpeg', 'bhel puri chaat street food'],
  ['pani-puri.jpeg', 'pani puri golgappa water'],
  ['tikki.jpeg', 'aloo tikki potato cutlet crispy'],
  ['chicken-tikka.jpeg', 'chicken tikka grilled skewer'],
  ['seekh-kebab.jpeg', 'seekh kebab minced meat skewer'],
  ['chicken-wings.jpeg', 'fried chicken wings plate'],
  ['paneer-65.jpeg', 'paneer 65 fried crispy'],
  ['mushroom.jpeg', 'stuffed mushroom appetizer plate'],
  ['corn.jpeg', 'masala corn cup street food'],
  ['tandoori-momos.jpeg', 'tandoori momos red grilled'],
  ['spring-roll-fried.jpeg', 'fried spring roll crispy chinese'],
  ['veg-cutlet.jpeg', 'vegetable cutlet fried round'],
  ['aloo-chop.jpeg', 'potato chop fried snack'],
  ['bread-pakora.jpeg', 'bread pakora stuffed fried'],
  ['dhokla.jpeg', 'dhokla steamed yellow gujarati'],
  ['khandvi.jpeg', 'khandvi rolled gujarati snack'],
  ['dabeli.jpeg', 'dabeli street food spicy'],
  ['vada-pav.jpeg', 'vada pav mumbai street food'],
  ['pav-bhaji.jpeg', 'pav bhaji buttery bread'],
  ['paneer-roll.jpeg', 'paneer roll wrap filling'],
  ['egg-roll.jpeg', 'egg roll kolkata street food'],
  ['chicken-roll.jpeg', 'chicken kathi roll wrap'],
  ['fish-finger.jpeg', 'fish fingers fried breaded'],
  ['onion-ring.jpeg', 'onion rings fried crispy'],

  // === Rice Dishes ===
  ['jeera-rice.jpeg', 'jeera cumin rice white bowl'],
  ['pulao.jpeg', 'vegetable pulao colorful rice'],
  ['lemon-rice.jpeg', 'lemon rice yellow turmeric'],
  ['curd-rice.jpeg', 'curd rice yogurt south indian'],
  ['khichdi.jpeg', 'khichdi rice lentils comfort food'],
  ['plain-rice.jpeg', 'steamed white rice bowl'],
  ['fried-rice-nonveg.jpeg', 'chicken fried rice wok'],

  // === Breads ===
  ['garlic-naan.jpeg', 'garlic naan tandoor bread'],
  ['stuffed-paratha.jpeg', 'stuffed paratha layers filling'],
  ['rumali-roti.jpeg', 'rumali roti thin handkerchief bread'],
  ['kulcha.jpeg', 'amritsari kulcha stuffed bread'],
  ['puri.jpeg', 'puri puffed fried bread golden'],
  ['tandoori-roti.jpeg', 'tandoori roti whole wheat bread'],
  ['butter-naan.jpeg', 'butter naan soft tandoor'],
  ['laccha-paratha.jpeg', 'lachha paratha layers crispy'],
  ['missi-roti.jpeg', 'missi roti gram flour bread'],

  // === Sides & Soups ===
  ['raita.jpeg', 'raita yogurt cucumber bowl'],
  ['salad.jpeg', 'fresh garden salad bowl green'],
  ['soup.jpeg', 'hot tomato soup bowl spoon'],
  ['papad.jpeg', 'papadum crispy round thin'],
  ['pickle.jpeg', 'indian pickle achaar jar'],
  ['chutney.jpeg', 'green mint chutney bowl'],
  ['dal-soup.jpeg', 'dal shorba soup bowl'],
  ['sweet-corn-soup.jpeg', 'sweet corn soup thick'],
  ['hot-sour-soup.jpeg', 'hot sour soup chinese'],
  ['manchow-soup.jpeg', 'manchow soup crispy noodles'],
  ['cream-soup.jpeg', 'cream of mushroom soup'],

  // === Chinese / Indo-Chinese ===
  ['chilli-chicken.jpeg', 'chilli chicken dry indo chinese'],
  ['schezwan-noodles.jpeg', 'schezwan noodles spicy red'],
  ['dim-sum.jpeg', 'dim sum steamed basket bamboo'],
  ['honey-chilli.jpeg', 'honey chilli potato crispy'],
  ['dragon-chicken.jpeg', 'dragon chicken crispy chinese'],
  ['american-chopsuey.jpeg', 'american chopsuey crispy noodles'],
  ['chilli-garlic-noodles.jpeg', 'garlic chilli noodles wok'],
  ['hakka-noodles.jpeg', 'hakka noodles vegetable stir fry'],
  ['crispy-vegetables.jpeg', 'crispy vegetables chinese fried'],
  ['sweet-sour.jpeg', 'sweet and sour sauce chinese'],

  // === Pizza & Italian ===
  ['pizza.jpeg', 'margherita pizza fresh basil'],
  ['garlic-bread.jpeg', 'cheesy garlic bread sliced'],
  ['white-pasta.jpeg', 'white sauce pasta creamy alfredo'],
  ['red-pasta.jpeg', 'red sauce penne pasta tomato'],
  ['lasagna.jpeg', 'lasagna layers cheese baked'],
  ['risotto.jpeg', 'risotto creamy mushroom'],
  ['bruschetta.jpeg', 'bruschetta tomato basil toast'],
  ['calzone.jpeg', 'calzone folded pizza baked'],
  ['mac-cheese.jpeg', 'mac and cheese creamy baked'],

  // === Fast Food / Western ===
  ['sandwich.jpeg', 'club sandwich triple layer toasted'],
  ['wrap.jpeg', 'chicken wrap tortilla roll'],
  ['fries.jpeg', 'french fries golden crispy ketchup'],
  ['tacos.jpeg', 'tacos loaded toppings mexican'],
  ['nachos.jpeg', 'nachos loaded cheese jalapeno'],
  ['fried-chicken.jpeg', 'fried chicken crispy bucket'],
  ['grilled-chicken.jpeg', 'grilled chicken breast herbs'],
  ['steak.jpeg', 'grilled steak medium rare'],
  ['sausage.jpeg', 'grilled sausage plate'],
  ['hot-dog.jpeg', 'hot dog mustard relish'],
  ['quesadilla.jpeg', 'cheese quesadilla crispy'],
  ['loaded-fries.jpeg', 'loaded fries cheese sauce'],
  ['nuggets.jpeg', 'chicken nuggets dipping sauce'],
  ['sub-sandwich.jpeg', 'submarine sandwich long roll'],
  ['bruschetta-western.jpeg', 'toast bruschetta appetizer'],

  // === Seafood ===
  ['prawns.jpeg', 'prawns shrimp garlic butter plate'],
  ['grilled-fish.jpeg', 'grilled fish lemon herbs plate'],
  ['crab.jpeg', 'crab seafood shell plate'],
  ['calamari.jpeg', 'calamari fried rings seafood'],
  ['fish-chips.jpeg', 'fish and chips battered'],
  ['prawn-fry.jpeg', 'fried prawns crispy'],
  ['lobster.jpeg', 'lobster tail butter'],

  // === Hot Beverages ===
  ['tea.jpeg', 'masala chai tea glass indian'],
  ['coffee.jpeg', 'coffee latte art cup'],
  ['green-tea.jpeg', 'green tea cup leaves'],
  ['hot-chocolate.jpeg', 'hot chocolate marshmallow mug'],
  ['black-coffee.jpeg', 'black coffee espresso cup'],
  ['cappuccino.jpeg', 'cappuccino foam art'],
  ['filter-coffee.jpeg', 'filter coffee south indian brass'],

  // === Cold Beverages ===
  ['lassi.jpeg', 'mango lassi thick glass'],
  ['fresh-juice.jpeg', 'fresh orange juice glass'],
  ['smoothie.jpeg', 'berry fruit smoothie glass'],
  ['mojito.jpeg', 'mojito mint lime glass'],
  ['cold-coffee.jpeg', 'iced cold coffee cream'],
  ['lemonade.jpeg', 'lemonade fresh lemon glass'],
  ['milkshake.jpeg', 'chocolate milkshake thick cream'],
  ['soda.jpeg', 'soft drink cola glass ice'],
  ['buttermilk.jpeg', 'buttermilk chaas glass'],
  ['coconut-water.jpeg', 'tender coconut water fresh'],
  ['iced-tea.jpeg', 'iced tea lemon peach glass'],
  ['mango-shake.jpeg', 'mango shake smoothie glass'],
  ['watermelon-juice.jpeg', 'watermelon juice fresh red'],
  ['sugarcane-juice.jpeg', 'sugarcane juice glass fresh'],
  ['thandai.jpeg', 'thandai drink almond milk'],
  ['jaljeera.jpeg', 'jaljeera drink cumin lime'],
  ['rose-sharbat.jpeg', 'rose sharbat pink drink'],
  ['kokum.jpeg', 'kokum drink purple refreshing'],

  // === Alcohol ===
  ['beer.jpeg', 'cold beer glass draft'],
  ['cocktail.jpeg', 'colorful cocktail bar glass'],
  ['wine.jpeg', 'red wine glass elegant'],
  ['whiskey.jpeg', 'whiskey glass ice rocks'],
  ['vodka.jpeg', 'vodka cocktail clear glass'],
  ['rum.jpeg', 'rum cocktail dark cola'],
  ['gin.jpeg', 'gin tonic botanical drink'],
  ['tequila.jpeg', 'tequila shot lime salt'],
  ['sangria.jpeg', 'sangria wine fruit pitcher'],
  ['champagne.jpeg', 'champagne sparkling flute'],
  ['margarita.jpeg', 'margarita cocktail salt rim'],
  ['old-fashioned.jpeg', 'old fashioned whiskey cocktail'],
  ['mojito-cocktail.jpeg', 'mojito rum cocktail bar'],
  ['long-island.jpeg', 'long island iced tea cocktail'],
  ['martini.jpeg', 'martini olive glass bar'],
  ['pina-colada.jpeg', 'pina colada coconut cocktail'],
  ['daiquiri.jpeg', 'strawberry daiquiri cocktail'],
  ['craft-beer.jpeg', 'craft beer pint amber'],

  // === Indian Desserts ===
  ['gulab-jamun.jpeg', 'gulab jamun syrup golden balls'],
  ['rasmalai.jpeg', 'rasmalai cream disc saffron'],
  ['kheer.jpeg', 'rice kheer pudding nuts'],
  ['jalebi.jpeg', 'jalebi crispy orange swirls syrup'],
  ['halwa.jpeg', 'gajar carrot halwa nuts ghee'],
  ['rabri.jpeg', 'rabri thickened milk sweet'],
  ['kulfi.jpeg', 'kulfi indian ice cream stick'],
  ['rasgulla.jpeg', 'rasgulla white sweet balls syrup'],
  ['ladoo.jpeg', 'motichoor ladoo round orange'],
  ['barfi.jpeg', 'kaju barfi cashew fudge silver'],
  ['sandesh.jpeg', 'sandesh bengali sweet cottage cheese'],
  ['mishti-doi.jpeg', 'mishti doi sweet yogurt clay pot'],
  ['payesh.jpeg', 'payesh milk rice pudding bengali'],
  ['cham-cham.jpeg', 'cham cham sweet bengali colorful'],
  ['soan-papdi.jpeg', 'soan papdi flaky sweet layers'],
  ['peda.jpeg', 'peda milk sweet round yellow'],
  ['imarti.jpeg', 'imarti flower shaped jalebi orange'],
  ['malpua.jpeg', 'malpua fried pancake sweet syrup'],
  ['rasabali.jpeg', 'rasabali odisha sweet cream'],
  ['phirni.jpeg', 'phirni rice pudding clay bowl'],

  // === Western Desserts ===
  ['cheesecake.jpeg', 'cheesecake slice berry topping'],
  ['pudding.jpeg', 'caramel pudding custard flan'],
  ['cookie.jpeg', 'chocolate chip cookies stack baked'],
  ['muffin.jpeg', 'blueberry muffin baked fresh'],
  ['donut.jpeg', 'glazed donut sprinkles colorful'],
  ['waffle.jpeg', 'waffle syrup berries cream'],
  ['tiramisu.jpeg', 'tiramisu layers coffee cocoa'],
  ['brownie.jpeg', 'chocolate brownie fudgy slice'],
  ['mousse.jpeg', 'chocolate mousse cup rich'],
  ['panna-cotta.jpeg', 'panna cotta vanilla berry'],
  ['cake-slice.jpeg', 'cake slice cream frosting layers'],
  ['cupcake.jpeg', 'cupcake frosted colorful sprinkles'],
  ['creme-brulee.jpeg', 'creme brulee caramelized custard'],
  ['fruit-tart.jpeg', 'fruit tart pastry colorful'],
  ['tres-leches.jpeg', 'tres leches cake milk cream'],

  // === Bakery ===
  ['bread-loaf.jpeg', 'bread loaf sliced fresh baked'],
  ['puff.jpeg', 'puff pastry golden flaky baked'],
  ['bun.jpeg', 'soft bread bun round fresh'],
  ['roll.jpeg', 'dinner roll bread basket'],
  ['danish.jpeg', 'danish pastry fruit glaze'],
  ['scone.jpeg', 'scone cream jam breakfast'],
  ['bagel.jpeg', 'bagel cream cheese breakfast'],
  ['focaccia.jpeg', 'focaccia bread herbs olive oil'],
  ['cinnamon-roll.jpeg', 'cinnamon roll icing spiral'],

  // === Breakfast ===
  ['omelette.jpeg', 'cheese omelette fluffy breakfast'],
  ['toast.jpeg', 'toast avocado breakfast plate'],
  ['pancake.jpeg', 'pancakes stack maple syrup butter'],
  ['poha.jpeg', 'poha flattened rice peanuts coriander'],
  ['cereal.jpeg', 'cereal milk bowl spoon breakfast'],
  ['eggs.jpeg', 'scrambled eggs plate herbs'],
  ['french-toast.jpeg', 'french toast berries breakfast'],
  ['eggs-benedict.jpeg', 'eggs benedict hollandaise breakfast'],
  ['acai-bowl.jpeg', 'acai bowl granola fruits berries'],
  ['hash-brown.jpeg', 'hash brown crispy golden potato'],

  // === Combos / Platters ===
  ['combo-meal.jpeg', 'combo meal plate rice curry bread'],
  ['non-veg-platter.jpeg', 'non veg mixed grill platter meat'],
  ['breakfast-platter.jpeg', 'breakfast platter eggs toast'],
  ['snack-platter.jpeg', 'snack platter variety appetizer'],

  // === Miscellaneous ===
  ['paneer-tikka-wrap.jpeg', 'paneer tikka wrap roll'],
  ['sev-puri.jpeg', 'sev puri crispy chaat'],
  ['dahi-vada.jpeg', 'dahi vada yogurt lentil balls'],
  ['aloo-paratha-plate.jpeg', 'aloo paratha butter plate curd'],
  ['chole-bhature.jpeg', 'chole bhature chickpea fried bread'],
  ['rajma-chawal.jpeg', 'rajma chawal rice kidney bean bowl'],
  ['dal-chawal.jpeg', 'dal chawal rice lentils plate'],
  ['kadhi-pakora.jpeg', 'kadhi pakora yogurt curry'],
  ['stuffed-capsicum.jpeg', 'stuffed capsicum bell pepper'],
  ['baby-corn.jpeg', 'baby corn crispy fried'],
  ['paneer-butter-masala.jpeg', 'paneer butter masala orange curry'],
  ['methi-malai.jpeg', 'methi malai paneer fenugreek cream'],
  ['chana-masala.jpeg', 'chana masala chickpea spicy'],
  ['aloo-matar-dry.jpeg', 'aloo matar dry peas potato'],
];

function pexelsSearch(query) {
  return new Promise((resolve, reject) => {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&orientation=square&size=small`;
    const req = https.get(url, { headers: { Authorization: API_KEY } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) { reject(new Error(json.error)); return; }
          // Try to pick the best photo (prefer ones with food-related alt text)
          const photos = json.photos || [];
          const photo = photos.find(p => (p.alt || '').toLowerCase().match(/food|dish|meal|curry|rice|bread|drink|dessert|cake|soup|chicken|paneer|fish|tea|coffee/)) || photos[0];
          resolve(photo?.src?.medium || null);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const doDownload = (downloadUrl, redirects = 0) => {
      if (redirects > 5) { reject(new Error('too many redirects')); return; }
      const mod = downloadUrl.startsWith('https') ? https : require('http');
      const req = mod.get(downloadUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          doDownload(res.headers.location, redirects + 1);
          return;
        }
        if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode}`)); return; }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
        file.on('error', reject);
      });
      req.on('error', reject);
      req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')); });
    };
    doDownload(url);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const existing = new Set(fs.readdirSync(OUTPUT_DIR));
  const toDownload = IMAGES.filter(([name]) => !existing.has(name));

  console.log(`📁 Output: ${OUTPUT_DIR}`);
  console.log(`📸 ${existing.size} already exist, ${toDownload.length} to download\n`);

  if (toDownload.length === 0) {
    console.log('✅ All images already downloaded!');
    return;
  }

  let ok = 0, fail = 0, failedList = [];

  for (let i = 0; i < toDownload.length; i++) {
    const [filename, query] = toDownload[i];
    process.stdout.write(`[${i+1}/${toDownload.length}] ${filename.padEnd(30)} `);
    try {
      const imageUrl = await pexelsSearch(query);
      if (!imageUrl) { console.log('❌ no results'); fail++; failedList.push(filename); continue; }

      const dest = path.join(OUTPUT_DIR, filename);
      await downloadImage(imageUrl, dest);

      const size = fs.statSync(dest).size;
      if (size < 1000) {
        fs.unlinkSync(dest);
        console.log('❌ too small');
        fail++;
        failedList.push(filename);
      } else {
        console.log(`✅ ${(size/1024).toFixed(0)}KB`);
        ok++;
      }
    } catch (err) {
      console.log(`❌ ${err.message}`);
      fail++;
      failedList.push(filename);
    }
    // Pexels: 200 req/hour free tier. 1.5s between = ~2400/hr, well within limits with per_page=3
    await sleep(1500);
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`✅ Downloaded: ${ok}`);
  console.log(`❌ Failed: ${fail}`);
  if (failedList.length > 0) console.log(`   Failed: ${failedList.join(', ')}`);
  console.log(`📁 Total images now: ${fs.readdirSync(OUTPUT_DIR).length}`);
}

main().catch(err => { console.error(err); process.exit(1); });
