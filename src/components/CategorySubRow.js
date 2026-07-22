'use client';

import React from 'react';
import { resolveCategoryPath } from '../utils/categoryTree';

/**
 * CategorySubRow — the drill-down sub-category strip shown BELOW the main
 * category bar on the billing screen (eZee-style: Beverages → Cognac → items).
 *
 * Renders nothing unless the store has a real category tree (auto-detect) and
 * the selected top-level category actually has children — so flat stores and
 * "All items"/"Favorites"/leaf selections show no extra row. One row is rendered
 * per level of the selected path that has children, so it naturally supports
 * 2, 3, or more levels with no special-casing.
 *
 * It never mutates anything: it only calls onSelect(categoryId) to move the
 * existing selectedCategory. The item grid re-filters via the same ancestor-or-
 * self rule used everywhere else.
 *
 * Props:
 *  - categoryIndex: from buildCategoryIndex()
 *  - selectedCategory: current selected category id (lowercased) | 'all-items' | 'favorites'
 *  - onSelect(id): set selectedCategory
 *  - countMap: Map(lowercased id -> item count) (optional)
 *  - getCategoryEmoji(name): emoji fallback (optional)
 *  - theme: 'light' | 'dark'
 */
export default function CategorySubRow({
  categoryIndex,
  selectedCategory,
  onSelect,
  countMap,
  getCategoryEmoji,
  theme = 'light',
}) {
  if (!categoryIndex || !categoryIndex.hasTree) return null;

  const norm = (v) => (v == null ? '' : String(v).trim().toLowerCase());
  const selKey = norm(selectedCategory);

  // Path of the currently selected category NODE (not an item). Empty for
  // all-items / favorites / a category not in the tree.
  const path = resolveCategoryPath({ category: selectedCategory }, categoryIndex);
  if (!path.length) return null;

  // One row per level that has children. Row L shows children of path[L],
  // highlighting path[L+1] (the deeper selected node) when present.
  const rows = [];
  for (let i = 0; i < path.length; i++) {
    const children = categoryIndex.childrenOf(path[i].id);
    if (!children.length) break;
    rows.push({
      level: i,
      parent: path[i],
      children,
      activeChildKey: path[i + 1] ? norm(path[i + 1].id) : null,
    });
  }
  if (!rows.length) return null;

  const isDark = theme === 'dark';
  const palette = isDark
    ? {
        wrap: '#0f172a',
        chipBg: '#1e293b',
        chipBorder: '#334155',
        chipText: '#cbd5e1',
        activeBg: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
        activeText: '#ffffff',
        activeBorder: '#2563eb',
        count: '#64748b',
      }
    : {
        wrap: '#f8fafc',
        chipBg: '#ffffff',
        chipBorder: '#e2e8f0',
        chipText: '#475569',
        activeBg: 'linear-gradient(135deg, #059669, #047857)',
        activeText: '#ffffff',
        activeBorder: '#059669',
        count: '#94a3b8',
      };

  return (
    <div
      className={`category-subrow category-subrow-${theme}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '6px 8px',
        background: palette.wrap,
        borderBottom: `1px solid ${palette.chipBorder}`,
      }}
    >
      {rows.map((row) => (
        <div
          key={`subrow-${row.level}`}
          data-subrow-level={row.level}
          style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingLeft: row.level > 0 ? `${row.level * 10}px` : 0,
            scrollbarWidth: 'thin',
          }}
        >
          {row.children.map((child) => {
            const key = norm(child.id);
            const active = key === selKey || key === row.activeChildKey;
            const count = countMap ? countMap.get(key) || 0 : 0;
            const emoji = child.emoji || (getCategoryEmoji ? getCategoryEmoji(child.name || key) : '');
            return (
              <button
                key={key}
                type="button"
                data-cat-subchip
                onClick={() => {
                  // Toggle: clicking the already-selected child steps back up to
                  // its parent (shows the parent's full set again).
                  if (key === selKey) onSelect(row.parent.id);
                  else onSelect(child.id);
                }}
                style={{
                  flex: '0 0 auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${active ? palette.activeBorder : palette.chipBorder}`,
                  background: active ? palette.activeBg : palette.chipBg,
                  color: active ? palette.activeText : palette.chipText,
                  fontSize: '12px',
                  fontWeight: active ? 700 : 500,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {emoji ? <span aria-hidden>{emoji}</span> : null}
                <span>{child.name || key}</span>
                {count > 0 ? (
                  <span style={{ color: active ? 'rgba(255,255,255,0.85)' : palette.count, fontSize: '11px', fontWeight: 600 }}>
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
