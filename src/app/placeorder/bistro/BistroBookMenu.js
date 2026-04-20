'use client';

import { useMemo, useEffect, useState } from 'react';
import { Flame, Leaf } from 'lucide-react';
import { FaPlus, FaMinus } from 'react-icons/fa';

// Two categories per sheet: left/right.

const woodBg =
  'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1600&q=80';
const leatherCover =
  'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80';

const getPageColor = (cat) => {
  const colors = {
    appetizers: '#f59e0b',
    starters: '#f59e0b',
    mains: '#ef4444',
    'main course': '#ef4444',
    desserts: '#ec4899',
    sweets: '#ec4899',
    drinks: '#7c3aed',
    cocktails: '#7c3aed',
    specials: '#10b981',
    wine: '#a855f7',
    default: '#d97706',
  };
  const key = cat?.toString().toLowerCase();
  return colors[key] || colors.default;
};

const chunkCategories = (cats = []) => {
  const res = [];
  for (let i = 0; i < cats.length; i += 2) {
    res.push({ left: cats[i], right: cats[i + 1] || cats[i] });
  }
  return res;
};

const Page = ({ category, items, isLeft, pageNumber, onAddToCart, cart = [], onRemoveFromCart, currencySymbol = '₹' }) => {
  const color = getPageColor(category);
  
  // Helper to get item quantity from cart
  const getItemQuantity = (itemId) => {
    const cartItem = cart.find((c) => c.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };
  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        backgroundColor: '#fdfbf7',
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")',
        padding: '28px 24px',
        borderRight: isLeft ? '1px solid #d6d3d1' : 'none',
        borderLeft: !isLeft ? '1px solid #d6d3d1' : 'none',
        boxSizing: 'border-box',
      }}
    >
      {/* Decorative borders */}
      <div
        className="pointer-events-none"
        style={{
          position: 'absolute',
          inset: '12px',
          border: '2px double rgba(120,53,15,0.25)',
          borderRadius: '2px',
        }}
      />
      <div
        className="pointer-events-none"
        style={{
          position: 'absolute',
          inset: '20px',
          border: '1px solid rgba(120,53,15,0.2)',
          borderRadius: '2px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="text-center mb-2">
          <h2
            style={{
              fontFamily: '"Playfair Display","Cormorant Garamond",serif',
              fontSize: '18px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#111827',
              borderBottom: `2px solid ${color}40`,
              display: 'inline-block',
              paddingBottom: '4px',
            }}
          >
            {category || 'Menu'}
          </h2>
        </div>

        {/* Items */}
        <div
          className="flex-1 overflow-y-auto menu-scroll pr-1"
          style={{ fontFamily: '"Cormorant Garamond",serif' }}
        >
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="text-center text-gray-500 italic py-8">No items in this category</div>
            ) : (
              items.map((item, idx) => (
                <div key={`${item.id || idx}-${category}`} className="relative group">
                  <div
                    className="flex justify-between items-baseline pb-1 mb-1"
                    style={{ borderBottom: '1px dotted rgba(17,24,39,0.2)' }}
                  >
                    <h3
                      className="font-bold text-lg"
                      style={{
                        fontFamily: '"Playfair Display","Cormorant Garamond",serif',
                        color: '#1f2937',
                      }}
                    >
                      {item.name}
                    </h3>
                    <span
                      className="font-semibold text-lg"
                      style={{ color: '#111827', fontFamily: '"Cormorant Garamond",serif' }}
                    >
                      {item.price ? `${currencySymbol}${item.price}` : '—'}
                    </span>
                  </div>
                  {item.description && (
                    <p className="italic text-sm text-gray-600 leading-relaxed mb-1">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-3 text-[10px] uppercase tracking-wider font-semibold">
                      {item.isVeg !== false && (
                        <span className="flex items-center gap-1 text-emerald-700">
                          <Leaf size={12} strokeWidth={2.5} /> Veg
                        </span>
                      )}
                      {item.isSpicy && (
                        <span className="flex items-center gap-1 text-red-700">
                          <Flame size={12} strokeWidth={2.5} /> Spicy
                        </span>
                      )}
                    </div>
                    {onAddToCart && (() => {
                      const quantity = getItemQuantity(item.id);
                      const isInCart = quantity > 0;
                      
                      if (isInCart) {
                        // Show quantity controls
                        return (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              background: '#f9fafb',
                              padding: '4px 6px',
                              borderRadius: '8px',
                              border: '1px solid #e5e7eb',
                              position: 'relative',
                              zIndex: 1001,
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (onRemoveFromCart) {
                                  onRemoveFromCart(item.id);
                                }
                              }}
                              style={{
                                background: '#ffffff',
                                border: '1px solid #e5e7eb',
                                padding: '4px 6px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                color: '#6b7280',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: '24px',
                                height: '24px',
                              }}
                            >
                              <FaMinus size={10} />
                            </button>
                            <span
                              style={{
                                fontSize: '13px',
                                fontWeight: 700,
                                color: '#111827',
                                minWidth: '20px',
                                textAlign: 'center',
                                fontFamily: '"Cormorant Garamond",serif',
                              }}
                            >
                              {quantity}
                            </span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onAddToCart(item);
                              }}
                              style={{
                                background: 'linear-gradient(135deg, #d97706, #b45309)',
                                border: 'none',
                                padding: '4px 6px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: '24px',
                                height: '24px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                              }}
                            >
                              <FaPlus size={10} />
                            </button>
                          </div>
                        );
                      } else {
                        // Show Add button
                        return (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onAddToCart(item);
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                            }}
                            style={{
                              background: 'linear-gradient(135deg, #d97706, #b45309)',
                              color: '#fff',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              fontFamily: '"Cormorant Garamond",serif',
                              letterSpacing: '0.05em',
                              textTransform: 'uppercase',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                              transition: 'all 0.2s',
                              position: 'relative',
                              zIndex: 1001,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)';
                              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
                            }}
                          >
                            Add
                          </button>
                        );
                      }
                    })()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Page number */}
        <div className="mt-4 text-center text-sm italic text-gray-400">- {pageNumber} -</div>
      </div>

      {/* Light vignette */}
      <div
        className="pointer-events-none"
        style={{
          position: 'absolute',
          inset: 0,
          background: isLeft
            ? 'linear-gradient(to left, rgba(0,0,0,0.06), transparent)'
            : 'linear-gradient(to right, rgba(0,0,0,0.06), transparent)',
          mixBlendMode: 'multiply',
        }}
      />
    </div>
  );
};

const Sheet = ({ index, currentSheet, pair, menu, onFlip, isMobile, onAddToCart, allCategories = [], sheetCount = 1, cart = [], onRemoveFromCart }) => {
  const isFlipped = index < currentSheet;
  const isCurrent = index === currentSheet;
  const rotation = isFlipped ? -180 : 0;
  const zIndex = 100 - index;

  // Case-insensitive category matching
  const normalizeCategory = (cat) => (cat || '').toString().trim().toLowerCase();
  
  // Create a set of all known categories (excluding "Other")
  const knownCategories = new Set(
    allCategories
      .filter(c => c && c.toString().trim().toLowerCase() !== 'other')
      .map(c => normalizeCategory(c))
  );
  
  // Handle "Other" category - show items that don't match any known category
  const leftItems = normalizeCategory(pair.left) === 'other'
    ? menu.filter((m) => {
        const itemCat = normalizeCategory(m.category);
        return !itemCat || !knownCategories.has(itemCat);
      })
    : menu.filter((m) => normalizeCategory(m.category) === normalizeCategory(pair.left));
    
  const rightItems = normalizeCategory(pair.right) === 'other'
    ? menu.filter((m) => {
        const itemCat = normalizeCategory(m.category);
        return !itemCat || !knownCategories.has(itemCat);
      })
    : menu.filter((m) => normalizeCategory(m.category) === normalizeCategory(pair.right));

  // Handle tap on left side - go to previous page
  const handleLeftTap = (e) => {
    // Don't trigger if clicking on a button or interactive element
    const target = e.target;
    if (
      target.tagName === 'BUTTON' ||
      target.closest('button') ||
      target.closest('[role="button"]') ||
      target.style.cursor === 'pointer' && target.tagName !== 'DIV'
    ) {
      return;
    }
    // Check if click is on the tap zone itself (not on content)
    if (target === e.currentTarget) {
      e.stopPropagation();
      if (isCurrent && currentSheet > 0) {
        onFlip(currentSheet - 1);
      }
    }
  };

  // Handle tap on right side - go to next page
  const handleRightTap = (e) => {
    // Don't trigger if clicking on a button or interactive element
    const target = e.target;
    if (
      target.tagName === 'BUTTON' ||
      target.closest('button') ||
      target.closest('[role="button"]') ||
      target.style.cursor === 'pointer' && target.tagName !== 'DIV'
    ) {
      return;
    }
    // Check if click is on the tap zone itself (not on content)
    if (target === e.currentTarget) {
      e.stopPropagation();
      if (isCurrent && currentSheet < sheetCount - 1) {
        onFlip(currentSheet + 1);
      }
    }
  };

  return (
    <div
      className="absolute top-0 left-0 w-full h-full"
      style={{
        transformStyle: 'preserve-3d',
        transformOrigin: 'left center',
        transform: `translateZ(${index * -1}px) rotateY(${rotation}deg)`,
        transition: 'transform 1s cubic-bezier(0.65, 0, 0.35, 1)',
        zIndex,
        boxShadow: isFlipped
          ? 'rgba(0,0,0,0.25) 0px 12px 30px'
          : 'rgba(0,0,0,0.35) 0px 18px 40px',
        pointerEvents: isCurrent ? 'auto' : 'none',
      }}
    >
      {/* Right page (front) */}
      <div
        className={`absolute inset-0 ${isMobile ? 'w-full left-0' : 'w-1/2 left-1/2'}`}
        style={{
          background: '#fdfbf7',
          transform: 'rotateY(0deg)',
          borderLeft: '1px solid #e5e7eb',
          overflow: 'hidden',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        <Page
          category={isMobile ? pair.left : pair.right}
          items={isMobile ? leftItems : rightItems}
          isLeft={false}
          pageNumber={isMobile ? index + 1 : index * 2 + 2}
          onAddToCart={onAddToCart}
          cart={cart}
          onRemoveFromCart={onRemoveFromCart}
        />
        {/* Right tap zone - only on current page, excludes bottom area where buttons are */}
        {isCurrent && (
          <div
            onClick={handleRightTap}
            onTouchStart={handleRightTap}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: isMobile ? '50%' : '100%',
              height: 'calc(100% - 120px)', // Exclude bottom area where buttons are
              cursor: currentSheet < sheetCount - 1 ? 'pointer' : 'default',
              zIndex: 1, // Lower z-index so buttons are above
              pointerEvents: 'auto',
            }}
          />
        )}
      </div>

      {/* Left page (back) - hide on mobile for single-page view */}
      {!isMobile && (
        <div
          className="absolute inset-0 w-1/2 left-0"
          style={{
            background: '#fdfbf7',
            transform: 'rotateY(180deg)',
            borderRight: '1px solid #e5e7eb',
            overflow: 'hidden',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <Page category={pair.left} items={leftItems} isLeft pageNumber={index * 2 + 1} onAddToCart={onAddToCart} cart={cart} onRemoveFromCart={onRemoveFromCart} />
          {/* Left tap zone - only on current page, excludes bottom area where buttons are */}
          {isCurrent && (
            <div
              onClick={handleLeftTap}
              onTouchStart={handleLeftTap}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: 'calc(100% - 120px)', // Exclude bottom area where buttons are
                cursor: currentSheet > 0 ? 'pointer' : 'default',
                zIndex: 1, // Lower z-index so buttons are above
                pointerEvents: 'auto',
              }}
            />
          )}
        </div>
      )}

      {/* Mobile: Left tap zone on visible page, excludes bottom area where buttons are */}
      {isMobile && isCurrent && (
        <div
          onClick={handleLeftTap}
          onTouchStart={handleLeftTap}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '50%',
            height: 'calc(100% - 120px)', // Exclude bottom area where buttons are
            cursor: currentSheet > 0 ? 'pointer' : 'default',
            zIndex: 1, // Lower z-index so buttons are above
            pointerEvents: 'auto',
          }}
        />
      )}
    </div>
  );
};

const BistroBookMenu = ({ categories = [], menu = [], currentSheet = 0, onSheetChange = () => {}, onAddToCart = () => {}, cart = [], onRemoveFromCart = () => {} }) => {
  // Ensure all menu items are included - add "Other" category for items without a category
  const normalizedCategories = useMemo(() => {
    const catSet = new Set(categories.map(c => (c || '').toString().trim().toLowerCase()));
    const itemsWithoutCategory = menu.filter(m => {
      const itemCat = (m.category || '').toString().trim().toLowerCase();
      return !itemCat || !catSet.has(itemCat);
    });
    const finalCategories = [...categories];
    if (itemsWithoutCategory.length > 0 && !finalCategories.includes('Other')) {
      finalCategories.push('Other');
    }
    return finalCategories;
  }, [categories, menu]);

  const sheets = useMemo(() => chunkCategories(normalizedCategories), [normalizedCategories]);
  const sheetCount = Math.max(1, sheets.length);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleFlip = (next) => {
    const clamped = Math.max(0, Math.min(sheetCount - 1, next));
    onSheetChange(clamped);
  };

  return (
    <div
      className="relative w-full h-full"
      style={{
        minHeight: '100vh',
        height: '100vh',
        perspective: isMobile ? '2500px' : 'none',
        overflow: 'hidden',
        background: '#f6f4ef',
      }}
    >
      {/* Mobile 3D stack */}
      <div
        id="book-stage"
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          width: '100vw',
          maxWidth: '100vw',
          minWidth: '320px',
          height: '100vh',
          top: 0,
          transformOrigin: 'center top',
        }}
      >
        <div className="absolute inset-0 right-0 w-full h-full transform-style-3d">
          {sheets.map((pair, idx) => (
            <Sheet
              key={`${pair.left}-${idx}`}
              index={idx}
              currentSheet={currentSheet}
              pair={pair}
              menu={menu}
              onFlip={handleFlip}
              isMobile={isMobile}
              onAddToCart={onAddToCart}
              allCategories={normalizedCategories}
              sheetCount={sheetCount}
              cart={cart}
              onRemoveFromCart={onRemoveFromCart}
            />
          ))}
        </div>
      </div>

      {/* Controls (mobile) */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          zIndex: 50,
        }}
      >
        <button
          onClick={() => handleFlip(currentSheet - 1)}
          disabled={currentSheet === 0}
          aria-label="Previous page"
          style={{
            width: '32px',
            height: '32px',
            padding: 0,
            borderRadius: '50%',
            border: '1px solid rgba(0,0,0,0.12)',
            background: currentSheet === 0 ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.1)',
            color: '#4b5563',
            cursor: currentSheet === 0 ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            lineHeight: 1,
          }}
        >
          ←
        </button>
        <div
          style={{
            padding: '6px 10px',
            borderRadius: '9999px',
            border: '1px solid rgba(0,0,0,0.12)',
            background: 'rgba(255,255,255,0.9)',
            color: '#374151',
            fontWeight: 800,
            letterSpacing: '0.08em',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            fontSize: '11px',
            minWidth: '80px',
            textAlign: 'center',
          }}
        >
          {currentSheet + 1} / {sheetCount}
        </div>
        <button
          onClick={() => handleFlip(currentSheet + 1)}
          disabled={currentSheet === sheetCount - 1}
          aria-label="Next page"
          style={{
            width: '32px',
            height: '32px',
            padding: 0,
            borderRadius: '50%',
            border: '1px solid rgba(0,0,0,0.12)',
            background:
              currentSheet === sheetCount - 1 ? 'rgba(0,0,0,0.06)' : 'linear-gradient(135deg,#f59e0b,#d97706)',
            color: currentSheet === sheetCount - 1 ? '#6b7280' : '#1f1b12',
            cursor: currentSheet === sheetCount - 1 ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            lineHeight: 1,
          }}
        >
          →
        </button>
      </div>

      {/* Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Playfair+Display:wght@700;800&family=Inter:wght@500;600&display=swap');
      `}</style>
    </div>
  );
};

export default BistroBookMenu;

