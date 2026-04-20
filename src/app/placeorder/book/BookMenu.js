'use client';

import { useEffect, useMemo } from 'react';
import { Flame, Leaf } from 'lucide-react';

// Skeuomorphic 3D Book using CSS (no WebGL). Two categories per sheet (left/right).
// Pages flip from the spine (transform-origin left), with backface-visibility hidden.

const woodBg =
  'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1600&q=80';
const leatherCover =
  'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80';

const getPageColor = (cat) => {
  const colors = {
    Pizza: '#dc2626',
    Burgers: '#ea580c',
    Salads: '#16a34a',
    Pasta: '#9333ea',
    Desserts: '#db2777',
    appetizer: '#2563eb',
    Tea: '#ca8a04',
    Samosa: '#059669',
    'Main Course': '#475569',
    'main course': '#475569',
    'Main-Course': '#475569',
    'MAIN-COURSE': '#2563eb',
    default: '#4f46e5',
  };
  return colors[cat] || colors[cat?.toLowerCase()] || colors.default;
};

const chunkCategories = (cats = []) => {
  const res = [];
  for (let i = 0; i < cats.length; i += 2) {
    res.push({
      left: cats[i],
      right: cats[i + 1] || cats[i],
    });
  }
  return res;
};

const PageFace = ({ category, items, currencySymbol = '₹' }) => {
  const color = getPageColor(category);
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        padding: '24px 28px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: 'linear-gradient(180deg, #fdfaf4 0%, #f7f2e9 100%)',
        fontFamily: "'Cormorant Garamond','Playfair Display',serif",
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '10px',
          borderBottom: `2px dotted ${color}55`,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color,
          fontSize: '20px',
          fontWeight: 700,
        }}
      >
        <span>{category?.replace(/-/g, ' ')}</span>
        <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>Est. 2024</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.slice(0, 6).map((item) => (
          <div
            key={item.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '8px',
              alignItems: 'start',
              borderBottom: '1px dashed #e5e7eb',
              paddingBottom: '8px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '17px',
                    fontWeight: 700,
                    color: '#1f2937',
                    letterSpacing: '0.01em',
                  }}
                >
                  {item.name}
                </span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {item.isVeg !== false && <Leaf size={14} color="#16a34a" strokeWidth={2.5} />}
                  {item.isSpicy && <Flame size={14} color="#dc2626" strokeWidth={2.5} />}
                </div>
              </div>
              {item.description && (
                <span
                  style={{
                    fontSize: '13px',
                    color: '#4b5563',
                    lineHeight: 1.5,
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {item.description.length > 90 ? item.description.slice(0, 90) + '…' : item.description}
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color,
                fontFamily: 'Inter, sans-serif',
                minWidth: '60px',
                textAlign: 'right',
              }}
            >
              {currencySymbol}{item.price}
            </div>
          </div>
        ))}
        {items.length > 6 && (
          <div
            style={{
              fontSize: '12px',
              color,
              fontWeight: 600,
              opacity: 0.8,
            }}
          >
            + {items.length - 6} more items…
          </div>
        )}
      </div>
    </div>
  );
};

const Sheet = ({ sheetIndex, currentSheet, pair, menu, onFlip }) => {
  const isFlipped = sheetIndex < currentSheet;
  const zIndex = 100 - sheetIndex;
  const rotation = isFlipped ? -180 : 0;
  const leftItems = menu.filter((m) => m.category === pair.left);
  const rightItems = menu.filter((m) => m.category === pair.right);

  return (
    <div
      style={{
        position: 'absolute',
        width: '760px',
        height: '520px',
        transformStyle: 'preserve-3d',
        transformOrigin: 'left center',
        transform: `translateZ(${sheetIndex * -1}px) rotateY(${rotation}deg)`,
        transition: 'transform 0.9s cubic-bezier(0.645, 0.045, 0.355, 1)',
        zIndex,
        boxShadow: isFlipped
          ? 'rgba(0,0,0,0.25) 0px 12px 30px'
          : 'rgba(0,0,0,0.35) 0px 18px 40px',
      }}
    >
      {/* Right page (front) */}
      <div
        onClick={() => onFlip(sheetIndex + 1)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '50%',
          left: '50%',
          backfaceVisibility: 'hidden',
          transform: 'rotateY(0deg)',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #fdfaf4 0%, #f7f2e9 100%)',
          borderLeft: '1px solid #e5e7eb',
        }}
      >
        <PageFace category={pair.right} items={rightItems} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 0% 50%, rgba(0,0,0,0.12), transparent 55%)',
            pointerEvents: 'none',
            mixBlendMode: 'multiply',
          }}
        />
      </div>

      {/* Left page (back) */}
      <div
        onClick={() => onFlip(sheetIndex)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '50%',
          left: 0,
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #fbf7ef 0%, #f3ebde 100%)',
          borderRight: '1px solid #e5e7eb',
        }}
      >
        <PageFace category={pair.left} items={leftItems} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 100% 50%, rgba(0,0,0,0.12), transparent 55%)',
            pointerEvents: 'none',
            mixBlendMode: 'multiply',
          }}
        />
      </div>
    </div>
  );
};

const BookMenu = ({ categories = [], menu = [], currentPage = 0, onPageChange = () => {}, onCategorySelect }) => {
  useEffect(() => {}, []);

  const sheets = useMemo(() => chunkCategories(categories), [categories]);
  const currentSheet = Math.min(currentPage, sheets.length - 1);

  const handleFlip = (nextSheet) => {
    const clamped = Math.max(0, Math.min(sheets.length - 1, nextSheet));
    onPageChange(clamped);
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: '600px',
        perspective: '2000px',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: `url(${woodBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.45) 95%)',
          pointerEvents: 'none',
        }}
      />

      {/* Leather mat under book */}
      <div
        style={{
          position: 'absolute',
          inset: '14% 20%',
          backgroundImage: `url(${leatherCover})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '24px',
          boxShadow: '0 25px 70px rgba(0,0,0,0.45)',
          filter: 'saturate(0.85)',
        }}
      />

      {/* Book container */}
      <div
        style={{
          position: 'relative',
          width: '760px',
          height: '520px',
          margin: '0 auto',
          top: '14%',
        }}
      >
        {sheets.map((pair, idx) => (
          <Sheet
            key={`${pair.left}-${idx}`}
            sheetIndex={idx}
            currentSheet={currentSheet}
            pair={pair}
            menu={menu}
            onFlip={handleFlip}
          />
        ))}
      </div>

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: '28px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          color: '#f8fafc',
          textShadow: '0 4px 12px rgba(0,0,0,0.45)',
          letterSpacing: '0.2em',
          fontSize: '32px',
          fontFamily: '"Playfair Display","Cormorant Garamond",serif',
          fontWeight: 800,
        }}
      >
        Menu Book
        <div style={{ fontSize: '12px', letterSpacing: '0.35em', marginTop: '6px', color: '#e5e7eb' }}>
          Fine Dining Collection
        </div>
      </div>

      {/* Page indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
        }}
      >
        <button
          onClick={() => handleFlip(currentSheet - 1)}
          disabled={currentSheet === 0}
          style={{
            padding: '10px 18px',
            borderRadius: '9999px',
            border: '1px solid rgba(255,255,255,0.35)',
            background: currentSheet === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.25)',
            color: '#fff',
            fontWeight: 700,
            letterSpacing: '0.08em',
            cursor: currentSheet === 0 ? 'not-allowed' : 'pointer',
            boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
            backdropFilter: 'blur(6px)',
          }}
        >
          Previous
        </button>
        <div
          style={{
            padding: '10px 16px',
            borderRadius: '9999px',
            border: '1px solid rgba(255,255,255,0.45)',
            background: 'rgba(0,0,0,0.5)',
            color: '#fff',
            fontWeight: 800,
            letterSpacing: '0.08em',
            boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
            backdropFilter: 'blur(6px)',
          }}
        >
          Page {currentSheet + 1} of {sheets.length}
        </div>
        <button
          onClick={() => handleFlip(currentSheet + 1)}
          disabled={currentSheet === sheets.length - 1}
          style={{
            padding: '10px 18px',
            borderRadius: '9999px',
            border: '1px solid rgba(255,255,255,0.35)',
            background:
              currentSheet === sheets.length - 1
                ? 'rgba(255,255,255,0.15)'
                : 'linear-gradient(135deg,#ef4444,#b91c1c)',
            color: '#fff',
            fontWeight: 700,
            letterSpacing: '0.08em',
            cursor: currentSheet === sheets.length - 1 ? 'not-allowed' : 'pointer',
            boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
            backdropFilter: 'blur(6px)',
          }}
        >
          Next
        </button>
      </div>

      {/* Global fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Playfair+Display:wght@700;800&family=Inter:wght@500;600;700&display=swap');
      `}</style>
    </div>
  );
};

export default BookMenu;
