import React, { useMemo, useRef, useState } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { getDisplayImage } from '../../../utils/placeholderImages';
import PublicMenuBadge from '../../../components/PublicMenuBadge';
import QrTodaySpecial from '../../../components/QrTodaySpecial';

// "Quick menu" for the Classic QR design (Customer App → Branding → Quick menu; customerAppSettings.quickMenu,
// off by default). The page header carries the logo + search, so there is no big banner here. Short dish
// cards, Food / Drinks tabs, a "Veg only" switch, categories merged into sections (QR page only) and
// add-on dishes shown right after the dishes they go with.

// A section is "Drinks" when its name or one of its categories reads like a drink, or most of its dishes are drinks.
const DRINK_WORDS = /(drink|beverage|juice|coffee|\btea\b|chai|smoothie|shake|soda|cooler|mocktail|latte|lemonade|\bwater\b|\bcola\b|liquor|beer|lager|wine|whisk(e)?y|scotch|\bgin\b|vodka|\brum\b|tequila|cocktail|\bshots?\b|spirit|liqueur|brew|espresso|cappuccino|mocha|americano|bar special)/i;
const words = (s) => String(s || '').replace(/[-_]+/g, ' ');

export default function QuickMenu({
  menu, categories, restaurant, addToCart, cart, removeFromCart, currencySymbol = '₹',
  t, style, catLabel, isLiquorItem, quick, searching = false, todaySpecial = null, qtyOf = null,
}) {
  const [tab, setTab] = useState(null); // null = first tab that has dishes
  const [vegOnly, setVegOnly] = useState(false);
  const [picked, setPicked] = useState(null);
  const barRef = useRef(null);
  const cs = currencySymbol;
  const hideImages = restaurant?.posSettings?.hideMenuImages === true;
  const qty = (id) => (qtyOf ? qtyOf(id) : (cart.find(i => i.id === id)?.quantity || 0));

  const model = useMemo(() => {
    const sectionsMap = quick?.sections || {};
    const tabsMap = quick?.tabs || {};
    const byId = new Map(menu.map(i => [i.id, i]));
    // Sections in menu category order; a section collects every category mapped to it.
    const order = [];
    const sec = new Map();
    for (const c of categories) {
      if (c === 'all') continue;
      const name = sectionsMap[c] || c;
      if (!sec.has(name)) { sec.set(name, { name, label: sectionsMap[c] ? name : catLabel(c), cats: [], items: [] }); order.push(name); }
      sec.get(name).cats.push(c);
    }
    const sectionOfCat = new Map();
    for (const s of sec.values()) s.cats.forEach(c => sectionOfCat.set(c, s));
    for (const item of menu) {
      const s = sectionOfCat.get(item.category);
      if (s) s.items.push(item);
    }
    for (const s of sec.values()) {
      // …or most of its dishes are drinks by name / liquor (e.g. "Hot Classics": Espresso, Cappuccino, Mocha)
      const drinkish = s.items.filter(i => isLiquorItem(i) || DRINK_WORDS.test(words(i.name))).length;
      const guess = DRINK_WORDS.test(words(s.name)) || s.cats.some(c => DRINK_WORDS.test(words(c)))
        || (s.items.length > 0 && drinkish * 2 > s.items.length);
      s.tab = tabsMap[s.name] || tabsMap[s.cats[0]] || (guess ? 'drinks' : 'food');
    }
    // Add-on links: which add-on dishes follow which dishes.
    const links = (quick?.addonLinks || []).map(l => ({
      label: l.label || 'Add-ons',
      after: new Set(l.afterIds || []),
      addons: (l.addonIds || []).map(id => byId.get(id)).filter(Boolean),
    })).filter(l => l.addons.length);
    return { sections: order.map(n => sec.get(n)), links };
  }, [menu, categories, quick, catLabel, isLiquorItem]);

  const tabsWithDishes = ['food', 'drinks'].filter(x => model.sections.some(s => s.tab === x && s.items.length));
  const activeTab = searching ? null : (tabsWithDishes.includes(tab) ? tab : tabsWithDishes[0] || null);
  const vegMatch = (i) => i.isVeg === true;
  const foodHasBoth = model.sections.some(s => s.tab === 'food' && s.items.some(vegMatch))
    && model.sections.some(s => s.tab === 'food' && s.items.some(i => i.isVeg === false));
  const vegApplies = vegOnly && foodHasBoth;
  const keep = (item, s) => !(vegApplies && s.tab === 'food' && !vegMatch(item));

  // Dishes shown in their own sections first; an add-on moves under its dishes only when one of them shows.
  const shown = model.sections
    .filter(s => !activeTab || s.tab === activeTab)
    .map(s => ({ ...s, items: s.items.filter(i => keep(i, s)) }));
  const addonIds = new Set(model.links.flatMap(l => l.addons.map(a => a.id)));
  const visibleMain = new Set(shown.flatMap(s => s.items.filter(i => !addonIds.has(i.id)).map(i => i.id)));
  const liveLinks = model.links.filter(l => [...l.after].some(id => visibleMain.has(id)));
  const movedAddons = new Set(liveLinks.flatMap(l => l.addons.map(a => a.id)));
  const visible = shown
    .map(s => ({ ...s, items: s.items.filter(i => !movedAddons.has(i.id)) }))
    .filter(s => s.items.length);

  const go = (i, name) => {
    setPicked(name);
    const el = document.getElementById(`qsec-${i}`);
    if (!el) return;
    // land the section heading just under the sticky page header + this filter bar
    const head = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--qr-head-h')) || 0;
    const bar = barRef.current?.offsetHeight || 0;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - head - bar - 8, behavior: 'smooth' });
  };

  const Stepper = ({ item, small }) => {
    const n = qty(item.id);
    if (!n) {
      return (
        <button type="button" onClick={() => addToCart(item)} data-testid="quick-add"
          className={`${t.add} ${small ? 'px-2.5 py-1 text-xs' : 'px-4 py-1.5 text-sm'} rounded-lg font-bold shadow-sm active:scale-95 flex items-center gap-1 shrink-0`}>
          ADD <FaPlus size={8} />
        </button>
      );
    }
    return (
      <div className={`flex items-center ${t.step} rounded-lg border overflow-hidden shadow-sm ${small ? 'h-7' : 'h-8'} shrink-0`}>
        <button type="button" onClick={() => removeFromCart(item.id)} aria-label="Less" className={`px-2.5 h-full ${t.stepBtn} flex items-center`}><FaMinus size={9} /></button>
        <span className={`font-bold text-sm ${t.stepQty} w-5 text-center`}>{n}</span>
        <button type="button" onClick={() => addToCart(item)} aria-label="More" className={`px-2.5 h-full ${t.stepBtn} flex items-center`}><FaPlus size={9} /></button>
      </div>
    );
  };

  const VegMark = ({ item }) => (typeof item.isVeg === 'boolean' && !isLiquorItem(item) ? (
    <span className={`inline-flex shrink-0 items-center justify-center w-3.5 h-3.5 border bg-white ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
    </span>
  ) : null);

  const AddonStrip = ({ link, s }) => {
    const list = link.addons.filter(a => keep(a, s));
    if (!list.length) return null;
    return (
      <div data-testid="quick-addons" className={`rounded-xl border border-dashed ${style === 'dark' ? 'border-neutral-700' : 'border-[#CFE0D5]'} px-3 py-2`}>
        <div className={`text-[11px] font-bold uppercase tracking-wide ${t.desc}`}>{link.label}</div>
        <div className="mt-1.5 space-y-1.5">
          {list.map(a => (
            <div key={a.id} className="flex items-center gap-2">
              <VegMark item={a} />
              <span className={`flex-1 min-w-0 truncate text-sm ${t.name}`}>{a.name}</span>
              <span className={`text-sm font-semibold ${t.price}`}>+{cs}{a.price}</span>
              <Stepper item={a} small />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${t.page} pb-24 font-sans`}>
      {todaySpecial && !searching && (
        <div className="px-3 pt-3 max-w-3xl mx-auto">
          <QrTodaySpecial special={todaySpecial} menu={menu} look={style} cs={cs}
            qtyOf={qty} onAdd={addToCart} onRemove={removeFromCart} hideImages={hideImages} />
        </div>
      )}

      {/* Tabs + Veg only + sections — sticks under the page header */}
      <div ref={barRef} className={`sticky z-20 ${t.bar} backdrop-blur-sm pt-2 pb-2 px-3 shadow-sm border-b`} style={{ top: 'var(--qr-head-h, 0px)' }}>
        <div className="max-w-3xl mx-auto">
          {(tabsWithDishes.length > 1 || foodHasBoth) && !searching && (
            <div className="flex items-center justify-between gap-2 mb-2">
              {tabsWithDishes.length > 1 ? (
                <div className={`inline-flex rounded-lg border ${style === 'dark' ? 'border-neutral-700' : 'border-[#CFE0D5]'} overflow-hidden`} role="tablist">
                  {tabsWithDishes.map(x => (
                    <button key={x} type="button" role="tab" aria-selected={activeTab === x} data-testid={`quick-tab-${x}`}
                      onClick={() => { setTab(x); setPicked(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className={`px-4 py-1.5 text-[13px] font-bold ${activeTab === x ? t.chipOn : t.chipOff} !rounded-none !ring-0`}>
                      {x === 'food' ? 'Food' : 'Drinks'}
                    </button>
                  ))}
                </div>
              ) : <span />}
              {foodHasBoth && activeTab !== 'drinks' && (
                <button type="button" role="switch" aria-checked={vegOnly} data-testid="quick-veg-only" onClick={() => setVegOnly(v => !v)}
                  className="flex items-center gap-2 text-[13px] font-bold">
                  <span className={t.name}>Veg only</span>
                  <span className={`relative inline-block w-10 h-5 rounded-full transition-colors ${vegOnly ? 'bg-green-600' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${vegOnly ? 'left-[22px]' : 'left-0.5'}`} />
                  </span>
                </button>
              )}
            </div>
          )}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {visible.map((s, i) => (
              <button key={s.name} type="button" onClick={() => go(i, s.name)}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap capitalize ${picked === s.name ? t.chipOn : t.chipOff}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-3 space-y-5 mt-3 max-w-3xl mx-auto">
        {visible.map((s, si) => (
          <div key={s.name} id={`qsec-${si}`} data-testid="quick-section">
            <h3 className={`text-base font-bold ${t.heading} mb-2 capitalize flex items-center gap-2`}>
              {s.label} <span className={`text-[11px] font-semibold ${t.count} px-2 py-0.5 rounded-full`}>{s.items.length}</span>
            </h3>
            <div className="space-y-2">
              {s.items.map((item, idx) => {
                const showImage = !(hideImages || item.hideImage);
                const img = showImage ? getDisplayImage(item) : null;
                // add-on strips that follow this dish (after the last of their dishes in this section)
                const after = liveLinks.filter(l => l.after.has(item.id) && !s.items.slice(idx + 1).some(n => l.after.has(n.id)));
                return (
                  <React.Fragment key={item.id}>
                    <div className={`${t.card} px-3 py-2.5 rounded-xl border flex items-center gap-3`} data-testid="quick-dish">
                      {showImage && (
                        <div className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden ${t.imgBg}`}>
                          {img ? <img src={img} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold ${t.name} text-[15px] leading-tight flex items-center gap-1.5`}>
                          {s.tab === 'food' && <VegMark item={item} />}
                          <span className="truncate">{item.name}</span>
                        </div>
                        {item.badge && <div className="mt-0.5"><PublicMenuBadge badge={item.badge} /></div>}
                        {item.description && <p className={`text-xs ${t.desc} line-clamp-1 mt-0.5`}>{item.description}</p>}
                        <div className={`font-bold ${t.price} text-sm mt-0.5`}>{cs}{item.price}</div>
                      </div>
                      <Stepper item={item} />
                    </div>
                    {after.map((l, k) => <AddonStrip key={k} link={l} s={s} />)}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div className={`text-center py-16 ${t.empty}`}>
            <p className="text-lg">No items found.</p>
          </div>
        )}
      </div>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
