'use client';

import React, { useState, useRef, useMemo, memo, useCallback } from 'react';
import { FaPlus, FaMinus, FaLeaf, FaDrumstickBite, FaStar, FaFire, FaHeart, FaUtensils } from 'react-icons/fa';
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
  hideImages = false
}) => {
  const { formatCurrency, getCurrencySymbol } = useCurrency();
  const isVeg = item.isVeg === true || item.category === 'veg';
  const isPopular = item.isPopular || item.rating > 4.5;
  const isSpicy = item.spiceLevel === 'hot' || item.spiceLevel === 'very-hot';
  const isNew = item.isNew || item.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  // Check if item has variants or customizations
  const hasVariants = item.variants && Array.isArray(item.variants) && item.variants.length > 0;
  const hasCustomizations = item.customizations && Array.isArray(item.customizations) && item.customizations.length > 0;
  const needsCustomization = hasVariants || hasCustomizations;
  
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
  const hasImage = hideImages ? false : (imageUrl !== null);

  // Simple ref for image element
  const imageRef = useRef(null);
  const [imageError, setImageError] = useState(false);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);
  
  if (!useModernDesign) {
    // Original Compact Design (Exact old style)
    
    return (
      <div
        className="menu-item-card"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #f3f4f6',
        borderTop: `4px solid ${isVeg ? '#22c55e' : '#ef4444'}`,
        borderRadius: '4px',
        cursor: 'pointer',
        height: isMobile ? '85px' : '95px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'none',
        filter: isOutOfStock ? 'blur(1.1px)' : 'none',
        opacity: isOutOfStock ? 0.95 : 1
      }}
        onClick={handleCardClick}
        onMouseEnter={() => {
          if (isOutOfStock) {
            setShowOutOfStockLabel(true);
          }
        }}
        onMouseLeave={() => {
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
        {/* Short Code - Top Left Corner */}
        {item.shortCode && (
          <div style={{
            position: 'absolute',
            top: '2px',
            left: '2px',
            backgroundColor: '#f3f4f6',
            color: '#6b7280',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '8px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            zIndex: 5
          }}>
            {item.shortCode}
          </div>
        )}

        {/* Favorite Button - Top Right Corner (Old Design) */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(item);
            }}
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              backgroundColor: item.isFavorite ? '#ef4444' : 'rgba(243, 244, 246, 0.9)',
              color: item.isFavorite ? 'white' : '#6b7280',
              border: 'none',
              padding: '4px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: item.isFavorite ? '0 2px 6px rgba(239, 68, 68, 0.4)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease',
              width: '20px',
              height: '20px',
              zIndex: 5
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.backgroundColor = item.isFavorite ? '#dc2626' : '#ef4444';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = item.isFavorite ? '#ef4444' : 'rgba(243, 244, 246, 0.9)';
              e.currentTarget.style.color = item.isFavorite ? 'white' : '#6b7280';
            }}
          >
            <FaHeart size={8} fill={item.isFavorite ? 'white' : 'none'} />
          </button>
        )}

        {/* Main Content Area */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          paddingTop: '2px'
        }}>
          {/* Dish Name */}
          <h3 style={{
            fontSize: isMobile ? '12px' : '14px',
            fontWeight: '600',
            margin: '0 0 4px 0',
            color: '#1f2937',
            lineHeight: '1.2',
            textAlign: 'center',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            wordWrap: 'break-word',
            maxHeight: '32px'
          }}>
            {item.name}
          </h3>
        </div>
        
        {/* Bottom Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '8px',
          borderTop: '1px solid #f3f4f6',
          marginTop: '6px'
        }}>
          {/* Price */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start'
          }}>
            <span style={{
              fontSize: isMobile ? '12px' : '14px',
              color: '#ef4444',
              fontWeight: '700',
              lineHeight: 1
            }}>
              {getDisplayPrice()}
            </span>
            {/* Stock/Expiry/Weight badges */}
            {(isStockManaged || expiryStatus || item.soldByWeight) && (
              <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginTop: '2px' }}>
                {item.soldByWeight && (
                  <span style={{
                    fontSize: '8px', fontWeight: '700',
                    padding: '1px 4px', borderRadius: '3px',
                    backgroundColor: '#fefce8', color: '#854d0e',
                    border: '1px solid #fde047'
                  }}>
                    ⚖️ By Weight
                  </span>
                )}
                {isStockManaged && !isLowStock && !isOutOfStock && (
                  <span style={{
                    fontSize: '8px', fontWeight: '700',
                    padding: '1px 4px', borderRadius: '3px',
                    backgroundColor: '#ecfdf5', color: '#065f46',
                    border: '1px solid #a7f3d0'
                  }}>
                    {item.stockQuantity} {item.stockUnit || 'pcs'}
                  </span>
                )}
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
            backgroundColor: quantityInCart > 0 ? '#ef4444' : '#f8fafc',
            borderRadius: '8px',
            overflow: 'hidden',
            border: quantityInCart > 0 ? 'none' : '1px solid #e5e7eb',
            boxShadow: quantityInCart > 0 ? '0 2px 4px rgba(239, 68, 68, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.05)'
          }}>
            {quantityInCart > 0 ? (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromCart(item.id);
                  }}
                  style={{
                    width: '26px',
                    height: '26px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    transition: 'none'
                  }}
                >
                  <FaMinus size={9} />
                </button>
                <span style={{
                  width: '30px',
                  height: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  color: 'white',
                  fontSize: '11px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '4px'
                }}>
                  {quantityInCart}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(item);
                  }}
                  style={{
                    width: '26px',
                    height: '26px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    transition: 'none'
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
                  padding: '6px 10px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#6b7280',
                  fontWeight: '600',
                  fontSize: '10px',
                  transition: 'none'
                }}
              >
                <FaPlus size={8} />
                Add
              </button>
            )}
          </div>
          )}
        </div>
      </div>
    );
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
          {/* Image - Always visible, no opacity transitions */}
          {hasImage && (
            <img
              ref={imageRef}
              src={imageUrl}
              alt={item.name}
              loading="eager"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
              decoding="sync"
              onError={handleImageError}
            />
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
              backgroundColor: quantityInCart > 0 ? '#ef4444' : 'rgba(255, 255, 255, 0.95)',
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
                    color: '#1f2937',
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

  // Fallback design for items without images
  return (
    <div
      className="menu-item-card"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: cardSize === 'large' ? '10px' : '4px',
        cursor: 'pointer',
        height: cardSize === 'large'
          ? (isMobile ? '160px' : '170px')
          : (isMobile ? '120px' : '130px'),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: cardSize === 'large' ? '16px' : '12px',
        boxShadow: cardSize === 'large' ? '0 4px 12px rgba(0, 0, 0, 0.1)' : '0 2px 8px rgba(0, 0, 0, 0.06)',
        position: 'relative',
        overflow: 'hidden',
        background: '#ffffff',
        borderTop: `3px solid ${isVeg ? '#22c55e' : '#ef4444'}`,
        transition: 'all 0.2s ease',
        filter: isOutOfStock ? 'blur(1.1px)' : 'none',
        opacity: isOutOfStock ? 0.95 : 1
      }}
      onClick={handleCardClick}
      onMouseEnter={() => {
        if (isOutOfStock) {
          setShowOutOfStockLabel(true);
        }
      }}
      onMouseLeave={() => {
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
      {/* Content Section */}
      <div style={{
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flex: 1
      }}>
      
      {/* Top Badges - Compact */}
      <div style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        zIndex: 10
      }}>
        {/* Short Code */}
        {item.shortCode && (
          <div style={{
            backgroundColor: '#6b7280',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '6px',
            fontSize: '9px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.3px'
          }}>
            {item.shortCode}
          </div>
        )}
        
        {/* Favorite Button (No Image Design) */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(item);
            }}
            style={{
              backgroundColor: item.isFavorite ? '#ef4444' : 'rgba(107, 114, 128, 0.8)',
              color: 'white',
              border: 'none',
              padding: '4px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: item.isFavorite ? '0 2px 6px rgba(239, 68, 68, 0.4)' : '0 1px 3px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.2s ease',
              width: '22px',
              height: '22px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.backgroundColor = item.isFavorite ? '#dc2626' : '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = item.isFavorite ? '#ef4444' : 'rgba(107, 114, 128, 0.8)';
            }}
          >
            <FaHeart size={9} fill={item.isFavorite ? 'white' : 'none'} />
          </button>
        )}
        
        {/* Popular Badge */}
        {isPopular && (
          <div style={{
            backgroundColor: '#f59e0b',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '6px',
            fontSize: '8px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            textTransform: 'uppercase',
            letterSpacing: '0.3px'
          }}>
            <FaStar size={6} />
            HOT
          </div>
        )}
        
        {/* New Badge */}
        {isNew && (
          <div style={{
            backgroundColor: '#8b5cf6',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '6px',
            fontSize: '8px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.3px'
          }}>
            NEW
          </div>
        )}
      </div>

      {/* Veg/Non-Veg Indicator - On Image */}
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '8px',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: isVeg ? '#22c55e' : '#ef4444',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
        border: '2px solid white'
      }}>
        {isVeg ? (
          <FaLeaf size={9} color="white" />
        ) : (
          <FaDrumstickBite size={8} color="white" />
        )}
      </div>

      {/* Spicy Indicator - On Image */}
      {isSpicy && (
        <div style={{
          position: 'absolute',
          top: '32px',
          left: '8px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          boxShadow: '0 1px 4px rgba(220, 38, 38, 0.3)',
          border: '2px solid white'
        }}>
          <FaFire size={8} color="white" />
        </div>
      )}

      {/* Main Content Area - Compact */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        paddingTop: '8px',
        paddingBottom: '8px',
        paddingLeft: '8px',
        paddingRight: '8px'
      }}>
        {/* Dish Name - Compact Typography */}
        <h3 style={{
          fontSize: isMobile ? '14px' : '15px',
          fontWeight: '600',
          margin: '0 0 4px 0',
          color: '#374151',
          lineHeight: '1.2',
          textAlign: 'center',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          wordWrap: 'break-word',
          maxHeight: '36px'
        }}>
          {item.name}
        </h3>
        
        {/* Description - Compact */}
        {item.description && (
          <p style={{
            fontSize: '10px',
            color: '#6b7280',
            margin: '0',
            lineHeight: '1.2',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            maxHeight: '12px',
            fontWeight: '400'
          }}>
            {item.description}
          </p>
        )}
      </div>
      
      {/* Bottom Section - Compact */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '8px',
        borderTop: '1px solid #f3f4f6',
        marginTop: '8px'
      }}>
        {/* Price - Compact */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{
            fontSize: isMobile ? '14px' : '15px',
            color: '#ef4444',
            fontWeight: '700',
            lineHeight: 1
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

        {/* Add Button - Compact - Hidden if needs customization */}
        {!needsCustomization && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: quantityInCart > 0 ? '#ef4444' : '#f8fafc',
          borderRadius: '8px',
          overflow: 'hidden',
          border: quantityInCart > 0 ? 'none' : '1px solid #e5e7eb',
          boxShadow: quantityInCart > 0 
            ? '0 2px 6px rgba(239, 68, 68, 0.2)' 
            : '0 1px 3px rgba(0, 0, 0, 0.05)'
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
                  borderRadius: '6px'
                }}
              >
                <FaMinus size={10} />
              </button>
              <span style={{
                width: '36px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                color: 'white',
                fontSize: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '6px'
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
                  borderRadius: '6px'
                }}
              >
                <FaPlus size={10} />
              </button>
            </>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(item);
              }}
              style={{
                padding: '6px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: '#6b7280',
                fontWeight: '600',
                fontSize: '11px',
                borderRadius: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.3px'
              }}
            >
              <FaPlus size={8} />
              ADD
            </button>
          )}
        </div>
        )}
      </div>
      </div> {/* End Content Section */}

    </div>
  );
};

// Memoize to prevent re-renders during scroll
const MemoizedMenuItemCard = memo(MenuItemCard, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.image === nextProps.item.image &&
    prevProps.item.name === nextProps.item.name &&
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
