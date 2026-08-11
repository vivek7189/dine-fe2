'use client';
/**
 * FastBillingBoard — a clean, fast "waiter billing" menu view.
 *
 * DESIGN: color-coded category bar → one scrollable sub-category row PER nesting level
 * (arbitrary depth) → clean item cards with a category-color stripe + quantity badge.
 * Left of this (in the dashboard) the existing OrderSummary stays as the live bill.
 *
 * SAFE BY CONSTRUCTION: it does NOT re-implement any billing logic. It drives the existing
 * `selectedCategory` state and renders the dashboard's already-filtered `gridItems`. Cards
 * call the SAME handlers — `onAddToCart` (which already guards weight/out-of-stock/stock) for
 * simple items, and `onItemClick` (the customization modal) for items with variants/
 * customizations/modifiers — so behaviour is identical to MenuItemCard.
 */
import React, { useMemo } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { resolveCategoryPath, isAncestorOrSelf } from '../utils/categoryTree';
import { categoryColor } from '../utils/categoryColors';

const STYLE = `
.fbb{display:flex;flex-direction:column;min-height:0;height:100%;--fbb-line:#e5e8ee;--fbb-panel:#fff;--fbb-sunken:#f4f6f9;--fbb-ink:#161a23;--fbb-muted:#697586;--fbb-faint:#98a1b0}
.fbb-catbar{display:flex;gap:9px;overflow-x:auto;padding:4px 2px 12px;scrollbar-width:none}
.fbb-catbar::-webkit-scrollbar,.fbb-subbar::-webkit-scrollbar{display:none}
.fbb-cat{flex:none;display:flex;align-items:center;gap:9px;height:42px;padding:0 15px;border-radius:12px;background:var(--fbb-panel);border:1.5px solid var(--fbb-line);font-weight:600;font-size:13.5px;color:var(--fbb-ink);cursor:pointer;transition:.12s ease;white-space:nowrap}
.fbb-cat:hover{border-color:var(--fbb-faint)}
.fbb-cat:active{transform:scale(.97)}
.fbb-cat .d{width:10px;height:10px;border-radius:50%}
.fbb-cat .c{font-size:11px;color:var(--fbb-faint);background:var(--fbb-sunken);border-radius:20px;padding:1px 7px;font-weight:700}
.fbb-cat.on{color:var(--fbb-ink)}
.fbb-subwrap{background:var(--fbb-sunken);border:1px solid var(--fbb-line);border-radius:12px;margin:0 2px 10px;overflow:hidden}
.fbb-subbar{display:flex;gap:8px;overflow-x:auto;padding:9px 12px;scrollbar-width:none}
.fbb-subbar+.fbb-subbar{padding-top:0}
.fbb-sub{flex:none;height:33px;padding:0 14px;border-radius:20px;background:var(--fbb-panel);border:1px solid var(--fbb-line);font-weight:600;font-size:12.5px;color:var(--fbb-muted);display:flex;align-items:center;gap:7px;cursor:pointer;transition:.12s ease;white-space:nowrap}
.fbb-sub .d{width:7px;height:7px;border-radius:50%}
.fbb-sub .c{font-size:10px;color:var(--fbb-faint);font-weight:700}
.fbb-sub:hover{color:var(--fbb-ink);border-color:var(--fbb-faint)}
.fbb-subbar.deep .fbb-sub{height:29px;font-size:12px;border-style:dashed}
.fbb-crumb{padding:2px 4px 12px;color:var(--fbb-faint);font-size:12px;display:flex;align-items:center;gap:7px;font-weight:600;flex-wrap:wrap}
.fbb-crumb .s{opacity:.5}
.fbb-grid{flex:1;overflow-y:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(158px,1fr));gap:12px;align-content:start;padding:2px 4px 24px;min-height:0}
.fbb-card{position:relative;text-align:left;background:var(--fbb-panel);border:1.5px solid var(--fbb-line);border-radius:14px;padding:13px;min-height:104px;display:flex;flex-direction:column;box-shadow:0 1px 2px rgba(16,24,40,.05),0 1px 3px rgba(16,24,40,.06);cursor:pointer;transition:transform .12s ease,border-color .12s ease,box-shadow .12s ease;overflow:hidden}
.fbb-card::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;opacity:.9}
.fbb-card:hover{border-color:var(--fbb-faint);box-shadow:0 8px 24px rgba(16,24,40,.10);transform:translateY(-2px)}
.fbb-card:active{transform:translateY(0) scale(.98)}
.fbb-card.added::before{width:5px;opacity:1}
.fbb-top{display:flex;align-items:flex-start;gap:8px;margin-bottom:auto}
.fbb-dot{width:12px;height:12px;border-radius:3px;flex:none;display:grid;place-items:center;border:1.5px solid currentColor;margin-top:1px}
.fbb-dot i{width:5px;height:5px;border-radius:50%;background:currentColor}
.fbb-name{font-weight:650;font-size:13.5px;line-height:1.3;letter-spacing:-.1px}
.fbb-price{margin-top:10px;font-weight:800;font-size:16px;letter-spacing:-.3px;font-variant-numeric:tabular-nums}
.fbb-badge{position:absolute;top:9px;right:9px;min-width:23px;height:23px;padding:0 6px;border-radius:12px;color:#fff;font-weight:800;font-size:12px;display:grid;place-items:center}
.fbb-oos{position:absolute;inset:0;background:rgba(255,255,255,.66);display:grid;place-items:center;font-size:11px;font-weight:700;color:#dc2626;letter-spacing:.4px}
.fbb-empty{grid-column:1/-1;text-align:center;color:var(--fbb-faint);padding:56px 20px;font-size:14px}
@media (prefers-color-scheme:dark){.fbb{--fbb-line:#232a37;--fbb-panel:#141924;--fbb-sunken:#0f131c;--fbb-ink:#eef1f6;--fbb-muted:#9aa4b2;--fbb-faint:#6b7482}.fbb-oos{background:rgba(20,25,36,.66)}}
@media (prefers-reduced-motion:reduce){.fbb-card,.fbb-cat,.fbb-sub{transition:none}}
`;

function tint(hex, pct) { // mix hex toward white by pct (0..1) for soft backgrounds
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  const m = (c) => Math.round(c + (255 - c) * pct);
  return `rgb(${m(r)},${m(g)},${m(b)})`;
}
const cleanEmoji = (e) => (e && e !== '🍽️' ? e : '');

function FastItemCard({ item, color, qty, onAddToCart, onItemClick }) {
  const { formatCurrency } = useCurrency();
  const isVeg = item.isVeg === true || item.category === 'veg';
  const hasVariants = Array.isArray(item.variants) && item.variants.length > 0;
  const needsCustomization = hasVariants
    || (Array.isArray(item.customizations) && item.customizations.length > 0)
    || (Array.isArray(item.modifierGroups) && item.modifierGroups.length > 0);
  const oos = item.isAvailable === false
    || (item.isStockManaged && typeof item.stockQuantity === 'number' && item.stockQuantity <= 0);

  const priceText = useMemo(() => {
    if (hasVariants) {
      const min = Math.min(...item.variants.map((v) => v.price || item.price || 0));
      return `From ${formatCurrency(min)}`;
    }
    return formatCurrency(item.price || 0);
  }, [item, hasVariants, formatCurrency]);

  const handleClick = () => {
    if (oos) return;
    // Same routing as MenuItemCard: variants/customizations open the modal; simple items add directly.
    if (needsCustomization) { if (onItemClick) onItemClick(item); return; }
    onAddToCart(item);
  };

  return (
    <button
      className={`fbb-card${qty ? ' added' : ''}`}
      style={{ '--fbb-cc': color, background: qty ? tint(color, 0.93) : undefined, borderColor: qty ? color : undefined }}
      onClick={handleClick}
      disabled={oos}
    >
      <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: qty ? 5 : 4, background: color, opacity: qty ? 1 : 0.9 }} />
      {qty ? <span className="fbb-badge" style={{ background: color }}>{qty}</span> : null}
      <div className="fbb-top">
        <span className="fbb-dot" style={{ color: isVeg ? '#16a34a' : '#dc2626' }}><i /></span>
        <span className="fbb-name">{item.name}</span>
      </div>
      <div className="fbb-price">{priceText}{hasVariants ? <small style={{ fontWeight: 600, fontSize: 11, color: 'var(--fbb-faint)' }}> onwards</small> : null}</div>
      {oos ? <span className="fbb-oos">OUT OF STOCK</span> : null}
    </button>
  );
}

export default function FastBillingBoard({
  categoryIndex,
  selectedCategory,
  setSelectedCategory,
  gridItems = [],
  allItems = [],
  searchTerm = '',
  getItemQuantityInCart,
  onAddToCart,
  onItemClick,
}) {
  const searching = !!(searchTerm && searchTerm.trim());
  const currentNode = categoryIndex?.resolve ? categoryIndex.resolve(selectedCategory) : null;

  // Path root→current (walk parentId). Empty when "all-items"/"favorites"/no tree.
  const path = useMemo(() => {
    const out = [];
    let n = currentNode;
    let guard = 0;
    while (n && guard++ < 12) {
      out.unshift(n);
      n = n.parentId ? categoryIndex.resolve(n.parentId) : null;
    }
    return out;
  }, [currentNode, categoryIndex]);

  const rootKey = path[0] ? (path[0].id || path[0].name) : null;
  const rootColor = categoryColor(rootKey);

  const countUnder = useMemo(() => {
    const cache = new Map();
    return (node) => {
      const k = node.id || node.name;
      if (cache.has(k)) return cache.get(k);
      const c = allItems.filter((it) => isAncestorOrSelf(node.id ?? node.name, it, categoryIndex)).length;
      cache.set(k, c);
      return c;
    };
  }, [allItems, categoryIndex]);

  const roots = categoryIndex?.roots || [];

  const select = (node) => setSelectedCategory && setSelectedCategory(node.id ?? node.name);

  return (
    <div className="fbb">
      <style>{STYLE}</style>

      {/* Category bar */}
      <div className="fbb-catbar">
        {roots.map((node) => {
          const key = node.id || node.name;
          const color = categoryColor(key);
          const on = path[0] && (path[0].id || path[0].name) === key;
          const cnt = countUnder(node);
          return (
            <button
              key={key}
              className={`fbb-cat${on ? ' on' : ''}`}
              onClick={() => select(node)}
              style={on ? { background: tint(color, 0.87), borderColor: color } : undefined}
            >
              <span className="d" style={{ background: color }} />
              {cleanEmoji(node.emoji)} {node.name}
              {cnt ? <span className="c" style={on ? { background: tint(color, 0.72), color } : undefined}>{cnt}</span> : null}
            </button>
          );
        })}
      </div>

      {/* Nested sub-category rows — one per level in the active path that has children */}
      {!searching && path.some((n, i) => categoryIndex.childrenOf(n.id ?? n.name).length > 0) && (
        <div className="fbb-subwrap">
          {path.map((node, idx) => {
            const kids = categoryIndex.childrenOf(node.id ?? node.name);
            if (!kids.length) return null;
            const activeChildKey = path[idx + 1] ? (path[idx + 1].id || path[idx + 1].name) : null;
            return (
              <div key={node.id || node.name} className={`fbb-subbar${idx > 0 ? ' deep' : ''}`}>
                {kids.map((ch) => {
                  const key = ch.id || ch.name;
                  const on = key === activeChildKey;
                  const cnt = countUnder(ch);
                  return (
                    <button
                      key={key}
                      className="fbb-sub"
                      onClick={() => select(ch)}
                      style={on ? { background: rootColor, borderColor: rootColor, color: '#fff' } : undefined}
                    >
                      <span className="d" style={{ background: on ? 'rgba(255,255,255,.9)' : rootColor }} />
                      {cleanEmoji(ch.emoji)} {ch.name}
                      {cnt ? <span className="c" style={on ? { color: 'rgba(255,255,255,.85)' } : undefined}>{cnt}</span> : null}
                      {categoryIndex.childrenOf(key).length ? <span style={{ opacity: 0.5, fontSize: 10 }}>▾</span> : null}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* Breadcrumb */}
      {!searching && path.length > 0 && (
        <div className="fbb-crumb">
          <span>Menu</span>
          {path.map((n, i) => (
            <React.Fragment key={n.id || n.name}>
              <span className="s">›</span>
              <span style={i === path.length - 1 ? { color: rootColor, fontWeight: 700 } : undefined}>{n.name}</span>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Item grid */}
      <div className="fbb-grid">
        {gridItems.length === 0 ? (
          <div className="fbb-empty">{searching ? 'No dishes match your search.' : 'No dishes in this category.'}</div>
        ) : (
          gridItems.map((item) => {
            const rootOfItem = (resolveCategoryPath(item, categoryIndex) || [])[0];
            const color = categoryColor(rootOfItem ? (rootOfItem.id || rootOfItem.name) : (item.category || item.name));
            return (
              <FastItemCard
                key={item.id}
                item={item}
                color={color}
                qty={getItemQuantityInCart ? getItemQuantityInCart(item.id) : 0}
                onAddToCart={onAddToCart}
                onItemClick={onItemClick}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
