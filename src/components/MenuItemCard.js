'use client';

import React, { useState, useRef, useMemo, memo, useCallback, useEffect } from 'react';
import { FaPlus, FaMinus, FaLeaf, FaDrumstickBite, FaStar, FaHeart, FaUtensils } from 'react-icons/fa';
import { getDisplayImage } from '../utils/placeholderImages';
import { useCurrency } from '../contexts/CurrencyContext';

const MenuItemCard = ({
  item,
  quantityInCart,
  onAddToCart,
  onRemoveFromCart,
  onItemClick, // New prop for opening customization modal
  onToggleFavorite, // New prop for toggling favorite
  isMobile = false,
  useModernDesign = true,
  cardSize = 'standard', // 'compact' | 'standard' | 'large'
  hideImages = false,
  darkMode = false
}) => {
  const { formatCurrency, getCurrencySymbol } = useCurrency();
  const isVeg = item.isVeg === true || item.category === 'veg';
  const isPopular = item.isPopular || item.rating > 4.5;
  const isSpicy = item.spiceLevel === 'hot' || item.spiceLevel === 'very-hot';
  const isNew = item.isNew || item.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  // Check if item has variants or customizations
  const hasVariants = item.variants && Array.isArray(item.variants) && item.variants.length > 0;
  const hasCustomizations = item.customizations && Array.isArray(item.customizations) && item.customizations.length > 0;
  const hasModifierGroups = item.modifierGroups && Array.isArray(item.modifierGroups) && item.modifierGroups.length > 0;
  const needsCustomization = hasVariants || hasCustomizations || hasModifierGroups;

  const dm = darkMode ? {
    cardBg: '#1e293b', cardBorder: '#334155', cardHover: '#475569',
    text: '#e2e8f0', textSec: '#94a3b8', textMuted: '#64748b',
    inputBg: '#0f172a', shadow: '0 2px 8px rgba(0,0,0,0.3)',
    lightBg: '#0f172a', badgeBg: 'rgba(30,41,59,0.9)',
  } : null;

  // Get display price - show "From X" if variants exist, otherwise show regular price
  const getDisplayPrice = () => {
    if (hasVariants && item.variants.length > 0) {
      const minPrice = Math.min(...item.variants.map(v => v.price || item.price || 0));
      return `From ${formatCurrency(minPrice)}`;
    }
    const priceStr = formatCurrency(item.price || 0);
    if (item.soldByWeight) {
      const unitLabel = item.priceUnit === 'per_100g' ? '/100g' : item.priceUnit === 'per_lb' ? '/lb' : '/kg';
      return priceStr + unitLabel;
    }
    return priceStr;
  };
  
  // Handle card click - if needs customization, open modal; otherwise add directly
  const handleCardClick = (e) => {
    if (isOutOfStock) return;
    if (needsCustomization) {
      // Must open customization modal — never add directly without variant/customization selection
      if (onItemClick) {
        e.stopPropagation();
        onItemClick(item);
      }
      return;
    }
    onAddToCart(item);
  };
  
  // Hooks must be called at the top level, before any conditional returns
  const isStockManaged = item.isStockManaged && typeof item.stockQuantity === 'number';
  const isOutOfStock = item.isAvailable === false || (isStockManaged && item.stockQuantity === 0);
  const isLowStock = isStockManaged && item.stockQuantity > 0 && item.stockQuantity <= (item.lowStockThreshold || 5);

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null;
    const days = Math.ceil((new Date(expiryDate) - new Date()) / 86400000);
    if (days < 0) return 'expired';
    if (days <= 2) return 'expiring-soon';
    if (days <= 7) return 'expiring-week';
    return null;
  };
  const expiryStatus = getExpiryStatus(item.expiryDate);
  const [showOutOfStockLabel, setShowOutOfStockLabel] = useState(false);

  // Image URL - memoized to prevent unnecessary recalculations
  const imageUrl = useMemo(() => getDisplayImage(item), [item.image, item.id]);
  const hasImage = (hideImages || item.hideImage) ? false : (imageUrl !== null);

  // Image loading state for smooth fade-in
  const imageRef = useRef(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset loaded state when image URL changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [imageUrl]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);
  
  // ── Soft Pill card (used for every card without a photo: Compact + Standard/Large) ──
  // UI only — same handlers as before: card click → handleCardClick, favourite → onToggleFavorite,
  // Add/+ → onAddToCart(item), − → onRemoveFromCart(item.id). Add controls stay hidden for
  // items that need customization (the card click opens the modal instead).
  const renderSoftPillCard = (compact) => {
    const sp = dm ? {
      bg: '#1e293b', inCartBg: 'linear-gradient(180deg, #1e293b 0%, #2b2130 100%)',
      ring: '0 0 0 1px #334155', inCartRing: '0 0 0 1.5px rgba(248,113,113,0.55)',
      text: '#e2e8f0', name: '#cbd5e1', sec: '#94a3b8', chipBg: '#0f172a', chipText: '#94a3b8',
      priceBg: 'rgba(239,68,68,0.15)', priceText: '#fca5a5',
      addBg: '#0f172a', addBorder: '#334155', addText: '#e2e8f0', heart: '#64748b',
      soldOutBg: '#1b2536', soldOutPillBg: 'rgba(148,163,184,0.12)', soldOutPillBorder: '#334155', soldOutPillText: '#94a3b8',
    } : {
      bg: '#ffffff', inCartBg: 'linear-gradient(180deg, #ffffff 0%, #fff5f5 100%)',
      ring: '0 1px 2px rgba(15,23,42,0.06), 0 0 0 1px rgba(15,23,42,0.07)',
      inCartRing: '0 1px 2px rgba(15,23,42,0.06), 0 0 0 1.5px #fca5a5',
      text: '#0f172a', name: '#334155', sec: '#64748b', chipBg: '#f1f5f9', chipText: '#64748b',
      priceBg: '#fef2f2', priceText: '#b91c1c',
      addBg: '#ffffff', addBorder: '#e2e8f0', addText: '#0f172a', heart: '#cbd5e1',
      soldOutBg: '#fafafa', soldOutPillBg: '#f1f5f9', soldOutPillBorder: '#e2e8f0', soldOutPillText: '#64748b',
    };
    const inCart = quantityInCart > 0;
    const large = !compact && cardSize === 'large';

    // Display-only split of bilingual names ("MASALA DOSAI / மசாலா தோசை") so the second
    // language sits on its own line instead of truncating the main name. item.name is untouched.
    const rawName = item.name || '';
    const slashAt = rawName.indexOf(' / ');
    const primaryName = !item.nameAr && slashAt > 0 ? rawName.slice(0, slashAt).trim() : rawName;
    const secondaryName = item.nameAr || (slashAt > 0 ? rawName.slice(slashAt + 3).trim() : '');
    const subLine = secondaryName || (!compact && item.description) || '';

    const priceText = getDisplayPrice();
    const fromPrice = priceText.startsWith('From ');

    const metaChip = (bg, color, label, key) => (
      <span key={key} style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '999px', backgroundColor: bg, color, whiteSpace: 'nowrap', lineHeight: 1.3 }}>{label}</span>
    );
    const metaChips = [
      item.soldByWeight && metaChip(dm ? 'rgba(234,179,8,0.15)' : '#fefce8', dm ? '#fde047' : '#854d0e', '⚖️ By weight', 'w'),
      compact && isStockManaged && !isLowStock && !isOutOfStock && metaChip(dm ? 'rgba(16,185,129,0.15)' : '#ecfdf5', dm ? '#6ee7b7' : '#047857', `${item.stockQuantity} ${item.stockUnit || 'pcs'}`, 's'),
      expiryStatus && metaChip(expiryStatus === 'expired' ? (dm ? 'rgba(239,68,68,0.15)' : '#fee2e2') : (dm ? 'rgba(245,158,11,0.15)' : '#fef3c7'), expiryStatus === 'expired' ? (dm ? '#fca5a5' : '#dc2626') : (dm ? '#fcd34d' : '#92400e'), expiryStatus === 'expired' ? 'Expired' : expiryStatus === 'expiring-soon' ? 'Exp soon' : 'Exp 7d', 'e'),
      !compact && isPopular && metaChip(dm ? 'rgba(245,158,11,0.15)' : '#fff7ed', dm ? '#fcd34d' : '#c2410c', '★ Hot', 'p'),
      !compact && isNew && metaChip(dm ? 'rgba(139,92,246,0.18)' : '#f5f3ff', dm ? '#c4b5fd' : '#6d28d9', 'New', 'n'),
      !compact && isSpicy && metaChip(dm ? 'rgba(239,68,68,0.15)' : '#fef2f2', dm ? '#fca5a5' : '#dc2626', '🌶 Spicy', 'h'),
    ].filter(Boolean);

    const stepBtn = { width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '999px', padding: 0 };

    return (
      <div
        className={`menu-item-card soft-pill${isOutOfStock ? ' is-oos' : ''}`}
        title={rawName}
        style={{
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: compact ? (isMobile ? '96px' : '108px') : large ? (isMobile ? '160px' : '170px') : (isMobile ? '125px' : '135px'),
          padding: compact ? (isMobile ? '9px 10px 9px 13px' : '10px 12px 10px 15px') : large ? '14px 16px 14px 19px' : '12px 14px 12px 17px',
          borderRadius: '16px',
          background: inCart ? sp.inCartBg : (isOutOfStock ? sp.soldOutBg : sp.bg),
          boxShadow: inCart ? sp.inCartRing : sp.ring,
          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
        }}
        onClick={handleCardClick}
      >
        {/* Veg / non-veg accent stripe (faded when sold out) */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: isVeg ? '#22c55e' : '#ef4444', opacity: isOutOfStock ? 0.35 : 1 }} />

        {/* Top row: short code + stock status · qty badge + favourite */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', minHeight: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
            {item.shortCode && (
              <span style={{ fontSize: '10px', fontWeight: 700, color: sp.chipText, backgroundColor: sp.chipBg, padding: '3px 7px', borderRadius: '6px', letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                {item.shortCode}
              </span>
            )}
            {isLowStock && (
              <span style={{ fontSize: '10px', fontWeight: 700, color: dm ? '#fdba74' : '#c2410c', whiteSpace: 'nowrap' }}>● {item.stockQuantity} left</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            {/* Qty badge for items added via the customization modal (no inline stepper for those) */}
            {inCart && needsCustomization && (
              <span style={{ minWidth: '22px', height: '22px', borderRadius: '999px', backgroundColor: '#ef4444', color: '#ffffff', fontWeight: 800, fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', boxShadow: '0 3px 8px rgba(239,68,68,0.35)' }}>
                {quantityInCart}
              </span>
            )}
            {onToggleFavorite && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(item); }}
                title={item.isFavorite ? 'Remove from favourites' : 'Add to favourites'}
                style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: '999px', cursor: 'pointer', padding: 0, backgroundColor: item.isFavorite ? (dm ? 'rgba(239,68,68,0.15)' : '#fef2f2') : 'transparent', color: item.isFavorite ? '#ef4444' : sp.heart }}
              >
                <FaHeart size={11} style={{ fill: item.isFavorite ? '#ef4444' : 'none', stroke: 'currentColor', strokeWidth: 40 }} />
              </button>
            )}
          </div>
        </div>

        {/* Name + second-language / description line */}
        <div style={{ flex: 1, minHeight: 0, marginTop: compact ? '4px' : '6px', overflow: 'hidden' }}>
          <h3 style={{
            margin: 0, color: isOutOfStock ? sp.sec : sp.name, fontWeight: 500, lineHeight: 1.3, letterSpacing: 0,
            fontSize: large ? '16px' : compact ? (isMobile ? '12.5px' : '14px') : (isMobile ? '13px' : '14.5px'),
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', wordBreak: 'break-word',
          }}>
            {primaryName}
          </h3>
          {subLine && (
            <p style={{
              margin: '2px 0 0', color: sp.sec, fontWeight: 500, lineHeight: 1.3,
              fontSize: large ? '12.5px' : (isMobile ? '10.5px' : '11.5px'),
              overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
              direction: item.nameAr ? 'rtl' : undefined, textAlign: 'left',
            }}>
              {subLine}
            </p>
          )}
          {metaChips.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '5px' }}>{metaChips}</div>
          )}
        </div>

        {/* Footer: price pill · Add / stepper */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px 8px', marginTop: compact ? '6px' : '10px', flexShrink: 0 }}>
          <span style={{
            flexShrink: 0, whiteSpace: 'nowrap',
            backgroundColor: isOutOfStock ? sp.chipBg : sp.priceBg, color: isOutOfStock ? sp.sec : sp.priceText, fontWeight: 750, borderRadius: '999px',
            padding: compact ? '4px 9px' : '5px 11px', fontSize: large ? '15px' : (isMobile ? '12.5px' : '13.5px'), lineHeight: 1.2,
          }}>
            {fromPrice ? (
              <><span style={{ fontSize: '0.78em', fontWeight: 600, opacity: 0.8, marginRight: '3px' }}>from</span>{priceText.slice(5)}</>
            ) : priceText}
          </span>

          {isOutOfStock && !inCart ? (
            <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '6px', padding: compact ? '5px 11px' : '6px 12px', borderRadius: '999px', backgroundColor: sp.soldOutPillBg, border: `1px solid ${sp.soldOutPillBorder}`, color: sp.soldOutPillText, fontWeight: 700, fontSize: '11.5px', whiteSpace: 'nowrap', letterSpacing: '0.01em' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: sp.soldOutPillText, opacity: 0.7 }} />
              Sold out
            </span>
          ) : !needsCustomization ? (
            inCart ? (
              <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, backgroundColor: '#ef4444', borderRadius: '999px', boxShadow: '0 3px 10px rgba(239,68,68,0.3)' }}>
                <button onClick={(e) => { e.stopPropagation(); onRemoveFromCart(item.id); }} style={stepBtn} aria-label="Remove one">
                  <FaMinus size={9} />
                </button>
                <span style={{ minWidth: '18px', textAlign: 'center', fontWeight: 800, color: '#ffffff', fontSize: '12.5px', fontVariantNumeric: 'tabular-nums' }}>{quantityInCart}</span>
                <button onClick={(e) => { e.stopPropagation(); onAddToCart(item); }} style={stepBtn} aria-label="Add one">
                  <FaPlus size={9} />
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onAddToCart(item); }}
                style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px', padding: compact ? '5px 11px' : '6px 13px', borderRadius: '999px', border: `1px solid ${sp.addBorder}`, backgroundColor: sp.addBg, color: sp.addText, fontWeight: 700, fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                <FaPlus size={8} />
                Add
              </button>
            )
          ) : (
            // Same look as the Add button, but not a button — the click falls through to the card,
            // which opens the variant/options modal (unchanged behaviour).
            <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px', padding: compact ? '5px 11px' : '6px 13px', borderRadius: '999px', border: `1px solid ${sp.addBorder}`, backgroundColor: sp.addBg, color: sp.addText, fontWeight: 700, fontSize: '12px', whiteSpace: 'nowrap' }}>
              <FaPlus size={8} />
              Add
            </span>
          )}
        </div>
      </div>
    );
  };

  if (!useModernDesign) {
    // Compact size — Soft Pill design (no photos in compact mode, same as before)
    return renderSoftPillCard(true);
  }

  // Full Image Overlay Design when image exists
  if (hasImage) {
    return (
      <div
        className="menu-item-card"
        style={{
          borderRadius: cardSize === 'large' ? '12px' : '8px',
          cursor: 'pointer',
          height: cardSize === 'large'
            ? (isMobile ? '180px' : '200px')
            : (isMobile ? '140px' : '150px'),
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '0',
          boxShadow: cardSize === 'large' ? '0 6px 16px rgba(0, 0, 0, 0.18)' : '0 4px 12px rgba(0, 0, 0, 0.15)',
          position: 'relative',
          overflow: 'hidden',
          border: 'none',
          filter: isOutOfStock ? 'blur(1.1px)' : 'none',
          opacity: isOutOfStock ? 0.95 : 1
        }}
        onClick={handleCardClick}
        onMouseEnter={(e) => {
          if (isOutOfStock) {
            setShowOutOfStockLabel(true);
          }
        }}
        onMouseLeave={(e) => {
          setShowOutOfStockLabel(false);
        }}
      >
        {/* Out of Stock Label - On Hover */}
        {isOutOfStock && showOutOfStockLabel && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(220, 38, 38, 0.95)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '700',
            zIndex: 20,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap'
          }}>
            Out of Stock
          </div>
        )}
        
        {/* Full Background Image - Simplified to prevent flicker */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          overflow: 'hidden'
        }}>
          {/* Image with async decode + lazy load + fade-in */}
          {hasImage && (
            <img
              ref={imageRef}
              src={imageUrl}
              alt={item.name}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.2s ease-out',
              }}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
          {/* Placeholder bg while image loads */}
          {hasImage && !imageLoaded && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: isVeg ? '#f0fdf4' : '#fef2f2',
            }} />
          )}

          {/* Dark Gradient Overlay for text visibility */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.8) 100%)',
            pointerEvents: 'none',
            zIndex: 2
          }} />
        </div>

        {/* Veg/Non-Veg Badge - Top Left */}
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          backgroundColor: isVeg ? '#22c55e' : '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          border: '2px solid white'
        }}>
          {isVeg ? (
            <FaLeaf size={8} color="white" />
          ) : (
            <FaDrumstickBite size={7} color="white" />
          )}
        </div>

        {/* Top Right Badges */}
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          zIndex: 10
        }}>
          {item.shortCode && (
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(4px)',
              color: 'white',
              padding: '3px 7px',
              borderRadius: '6px',
              fontSize: '9px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              {item.shortCode}
            </div>
          )}
          
          {isPopular && (
            <div style={{
              backgroundColor: 'rgba(245, 158, 11, 0.95)',
              backdropFilter: 'blur(4px)',
              color: 'white',
              padding: '3px 6px',
              borderRadius: '6px',
              fontSize: '7px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
              boxShadow: '0 2px 6px rgba(245, 158, 11, 0.4)'
            }}>
              <FaStar size={6} />
              HOT
            </div>
          )}
          
          {/* Favorite Button */}
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(item);
              }}
              style={{
                backgroundColor: item.isFavorite ? 'rgba(239, 68, 68, 0.95)' : 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)',
                color: 'white',
                border: 'none',
                padding: '6px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: item.isFavorite ? '0 2px 8px rgba(239, 68, 68, 0.5)' : '0 2px 6px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.2s ease',
                width: '24px',
                height: '24px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.backgroundColor = item.isFavorite ? 'rgba(220, 38, 38, 0.95)' : 'rgba(239, 68, 68, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = item.isFavorite ? 'rgba(239, 68, 68, 0.95)' : 'rgba(0, 0, 0, 0.6)';
              }}
            >
              <FaHeart size={10} fill={item.isFavorite ? 'white' : 'none'} />
            </button>
          )}
        </div>

        {/* Bottom Content - Overlaid on image */}
        <div style={{
          position: 'relative',
          zIndex: 5,
          padding: isMobile ? '10px' : '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          {/* Item Name */}
          <h3 style={{
            fontSize: isMobile ? '13px' : '14px',
            fontWeight: '700',
            margin: 0,
            color: '#ffffff',
            lineHeight: '1.2',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
            letterSpacing: '0.2px'
          }}>
            {item.name}
          </h3>
          
          {/* Price and Add Button Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '2px'
          }}>
            {/* Price */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontSize: isMobile ? '15px' : '16px',
                color: '#ffffff',
                fontWeight: '800',
                lineHeight: 1,
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)',
                letterSpacing: '0.3px'
              }}>
                {getDisplayPrice()}
              </span>
              {/* Stock/Expiry badges */}
              {(isLowStock || expiryStatus) && (
                <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginTop: '2px' }}>
                  {isLowStock && (
                    <span style={{
                      fontSize: '8px', fontWeight: '700',
                      padding: '1px 4px', borderRadius: '3px',
                      backgroundColor: '#fef3c7', color: '#92400e',
                      border: '1px solid #fde68a'
                    }}>
                      {item.stockQuantity} left
                    </span>
                  )}
                  {expiryStatus && (
                    <span style={{
                      fontSize: '8px', fontWeight: '700',
                      padding: '1px 4px', borderRadius: '3px',
                      backgroundColor: expiryStatus === 'expired' ? '#fee2e2' : '#fef3c7',
                      color: expiryStatus === 'expired' ? '#dc2626' : '#92400e'
                    }}>
                      {expiryStatus === 'expired' ? 'EXPIRED' : expiryStatus === 'expiring-soon' ? 'Exp Soon' : 'Exp 7d'}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Add Button - Hidden if needs customization */}
            {!needsCustomization && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: quantityInCart > 0 ? '#ef4444' : (dm ? dm.badgeBg : 'rgba(255, 255, 255, 0.95)'),
              borderRadius: '8px',
              overflow: 'hidden',
              border: quantityInCart > 0 ? 'none' : '2px solid rgba(255, 255, 255, 0.3)',
              boxShadow: quantityInCart > 0 
                ? '0 4px 12px rgba(239, 68, 68, 0.4)' 
                : '0 2px 8px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(4px)'
            }}>
              {quantityInCart > 0 ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromCart(item.id);
                    }}
                    style={{
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '700'
                    }}
                  >
                    <FaMinus size={9} />
                  </button>
                  <span style={{
                    width: '32px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    color: 'white',
                    fontSize: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)'
                  }}>
                    {quantityInCart}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(item);
                    }}
                    style={{
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '700'
                    }}
                  >
                    <FaPlus size={9} />
                  </button>
                </>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(item);
                  }}
                  style={{
                    padding: '7px 14px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: dm ? dm.text : '#1f2937',
                    fontWeight: '700',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  <FaPlus size={8} />
                  ADD
                </button>
              )}
            </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Cards without a photo (Standard / Large) — Soft Pill design
  return renderSoftPillCard(false);
};

// Memoize to prevent re-renders during scroll
const MemoizedMenuItemCard = memo(MenuItemCard, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.image === nextProps.item.image &&
    prevProps.item.name === nextProps.item.name &&
    prevProps.item.nameAr === nextProps.item.nameAr &&
    prevProps.item.price === nextProps.item.price &&
    prevProps.item.isAvailable === nextProps.item.isAvailable &&
    prevProps.item.stockQuantity === nextProps.item.stockQuantity &&
    prevProps.item.isStockManaged === nextProps.item.isStockManaged &&
    prevProps.item.expiryDate === nextProps.item.expiryDate &&
    prevProps.item.isFavorite === nextProps.item.isFavorite &&
    prevProps.quantityInCart === nextProps.quantityInCart &&
    prevProps.isMobile === nextProps.isMobile &&
    prevProps.useModernDesign === nextProps.useModernDesign &&
    prevProps.cardSize === nextProps.cardSize &&
    prevProps.hideImages === nextProps.hideImages
  );
});

export default MemoizedMenuItemCard;

// Note: Menu item card CSS is defined in globals.css to avoid duplication
