'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaMinus, FaLeaf, FaDrumstickBite } from 'react-icons/fa';
import { getDisplayImage } from '../utils/placeholderImages';
import { useCurrency } from '../contexts/CurrencyContext';

const ItemCustomizationModal = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
  currentQuantity = 0,
  initialVariant = null,
  initialCustomizations = null,
  initialQuantity = null,
}) => {
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const { formatCurrency } = useCurrency();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedCustomizations, setSelectedCustomizations] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedGroupItems, setSelectedGroupItems] = useState({});

  // Check if item has variants or customizations (safe checks)
  const hasVariants = item?.variants && Array.isArray(item.variants) && item.variants.length > 0;
  const hasCustomizations = item?.customizations && Array.isArray(item.customizations) && item.customizations.length > 0;
  const hasModifierGroups = item?.modifierGroups && Array.isArray(item.modifierGroups) && item.modifierGroups.length > 0;
  const useGroupedUI = hasModifierGroups;

  // Initialize variant/customization selection when modal opens
  useEffect(() => {
    // Only run when modal opens with a valid item
    if (!isOpen || !item) {
      // Reset state when modal closes
      setSelectedVariant(null);
      setSelectedCustomizations([]);
      setQuantity(1);
      setSelectedGroupItems({});
      return;
    }

    // Pre-select variant from initialVariant (e.g. editing existing cart item)
    if (initialVariant && item.variants && Array.isArray(item.variants)) {
      const matched = item.variants.find(v => v.name === initialVariant.name) || initialVariant;
      setSelectedVariant(matched);
    } else if (item.variants && Array.isArray(item.variants) && item.variants.length === 1) {
      // Auto-select variant if only one exists
      setSelectedVariant(item.variants[0]);
    } else {
      setSelectedVariant(null);
    }

    // Pre-select customizations from initialCustomizations
    if (initialCustomizations && Array.isArray(initialCustomizations) && initialCustomizations.length > 0) {
      setSelectedCustomizations(initialCustomizations);
    } else {
      setSelectedCustomizations([]);
    }

    // Pre-populate group selections from initialCustomizations
    if (item?.modifierGroups?.length > 0 && initialCustomizations && initialCustomizations.length > 0) {
      const map = {};
      for (const group of item.modifierGroups) {
        const matched = initialCustomizations.filter(c =>
          (group.items || []).some(gi => gi.id === c.id || gi.name === c.name)
        );
        if (matched.length > 0) map[group.id] = matched.map(c => ({ id: c.id, name: c.name, price: c.price || 0 }));
      }
      setSelectedGroupItems(map);
    } else {
      setSelectedGroupItems({});
    }

    // Pre-set quantity
    if (initialQuantity && initialQuantity > 0) {
      setQuantity(initialQuantity);
    } else {
      setQuantity(1);
    }
  }, [isOpen, item, initialVariant, initialCustomizations, initialQuantity]);

  // Early return AFTER all hooks
  if (!isOpen || !item) return null;

  const isVeg = item.isVeg !== false;

  // Calculate base price
  const getBasePrice = () => {
    if (hasVariants && selectedVariant) {
      return selectedVariant.price;
    }
    return item.price || 0;
  };

  // Calculate customization price
  const getCustomizationPrice = () => {
    return selectedCustomizations.reduce((total, cust) => total + (cust.price || 0), 0);
  };

  // Calculate total price
  const getTotalPrice = () => {
    const basePrice = getBasePrice();
    const customizationPrice = getCustomizationPrice();
    return (basePrice + customizationPrice) * quantity;
  };

  // Handle variant selection
  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
  };

  // Handle customization toggle
  const handleCustomizationToggle = (customization) => {
    setSelectedCustomizations(prev => {
      const exists = prev.find(c => c.id === customization.id);
      if (exists) {
        return prev.filter(c => c.id !== customization.id);
      }
      return [...prev, customization];
    });
  };

  const handleGroupItemToggle = (group, groupItem) => {
    setSelectedGroupItems(prev => {
      const current = prev[group.id] || [];
      const exists = current.find(c => c.id === groupItem.id);

      let next;
      if ((group.max || 1) === 1) {
        // Radio: replace (deselect if same item clicked again)
        next = exists ? [] : [{ id: groupItem.id, name: groupItem.name, price: groupItem.price || 0 }];
      } else {
        // Checkbox with max limit
        if (exists) {
          next = current.filter(c => c.id !== groupItem.id);
        } else {
          if (current.length >= (group.max || 99)) return prev; // max reached
          next = [...current, { id: groupItem.id, name: groupItem.name, price: groupItem.price || 0 }];
        }
      }
      const updated = { ...prev, [group.id]: next };
      // Sync flat selectedCustomizations from all groups
      const flat = Object.values(updated).flat();
      setSelectedCustomizations(flat);
      return updated;
    });
  };

  const isGroupValid = (group) => {
    const selected = (selectedGroupItems[group.id] || []).length;
    if (group.required) return selected >= (group.min || 1);
    return true;
  };

  const allGroupsValid = hasModifierGroups
    ? item.modifierGroups.every(g => isGroupValid(g))
    : true;

  // Handle add to cart
  const handleAddToCart = () => {
    // Validation: Must select variant if variants exist
    if (hasVariants && !selectedVariant) {
      return;
    }

    const cartItem = {
      ...item,
      cartId: `${item.id}-${Date.now()}`, // Unique ID for this cart entry
      selectedVariant: selectedVariant ? {
        name: selectedVariant.name,
        price: selectedVariant.price
      } : null,
      selectedCustomizations: selectedCustomizations.map(c => ({
        id: c.id,
        name: c.name,
        price: c.price || 0
      })),
      basePrice: getBasePrice(),
      customizationPrice: getCustomizationPrice(),
      finalPrice: getBasePrice() + getCustomizationPrice(),
      quantity: quantity
    };

    onAddToCart(cartItem);
    
    // Reset and close
    setSelectedVariant(null);
    setSelectedCustomizations([]);
    setSelectedGroupItems({});
    setQuantity(1);
    onClose();
  };

  const imageUrl = getDisplayImage(item);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          animation: 'fadeIn 0.2s ease'
        }}
      >
        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'slideUp 0.3s ease',
            position: 'relative'
          }}
        >
          {/* Header with Image */}
          {imageUrl && (
            <div style={{
              position: 'relative',
              width: '100%',
              height: '200px',
              overflow: 'hidden',
              borderRadius: '16px 16px 0 0'
            }}>
              <img
                src={imageUrl}
                alt={item.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              {/* Gradient Overlay */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '60%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
              }} />
              
              {/* Close Button */}
              <button
                onClick={onClose}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  zIndex: 10
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                <FaTimes size={16} color="#374151" />
              </button>

              {/* Item Name Over Image */}
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                right: '16px',
                color: 'white',
                zIndex: 5
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  {isVeg ? (
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: '#22c55e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FaLeaf size={10} color="white" />
                    </div>
                  ) : (
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FaDrumstickBite size={10} color="white" />
                    </div>
                  )}
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    margin: 0,
                    color: 'white',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    {item.name}
                  </h2>
                </div>
                {item.description && (
                  <p style={{
                    fontSize: '14px',
                    margin: 0,
                    color: 'rgba(255,255,255,0.9)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}>
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          )}

          {!imageUrl && (
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isVeg ? (
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#22c55e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FaLeaf size={12} color="white" />
                  </div>
                ) : (
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FaDrumstickBite size={12} color="white" />
                  </div>
                )}
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>
                    {item.name}
                  </h2>
                  {item.description && (
                    <p style={{ fontSize: '14px', margin: '4px 0 0 0', color: '#6b7280' }}>
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <FaTimes size={14} color="#6b7280" />
              </button>
            </div>
          )}

          {/* Content */}
          <div style={{ padding: '20px' }}>
            {/* Variants Section (Sizes/Portions) */}
            {hasVariants && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '12px'
                }}>
                  Select Size/Portion <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {item.variants.map((variant, index) => (
                    <button
                      key={index}
                      onClick={() => handleVariantSelect(variant)}
                      style={{
                        padding: '14px 16px',
                        backgroundColor: selectedVariant?.name === variant.name ? '#fef2f2' : '#f9fafb',
                        border: selectedVariant?.name === variant.name 
                          ? '2px solid #ef4444' 
                          : '2px solid #e5e7eb',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s ease',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedVariant?.name !== variant.name) {
                          e.target.style.borderColor = '#ef4444';
                          e.target.style.backgroundColor = '#fff7ed';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedVariant?.name !== variant.name) {
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.backgroundColor = '#f9fafb';
                        }
                      }}
                    >
                      <div>
                        <div style={{
                          fontSize: '15px',
                          fontWeight: '600',
                          color: '#1f2937',
                          marginBottom: '2px'
                        }}>
                          {variant.name}
                        </div>
                        {variant.description && (
                          <div style={{
                            fontSize: '13px',
                            color: '#6b7280'
                          }}>
                            {variant.description}
                          </div>
                        )}
                      </div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: selectedVariant?.name === variant.name ? '#ef4444' : '#1f2937'
                      }}>
                        {formatCurrency(variant.price)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* GROUPED MODIFIER UI */}
                {useGroupedUI && (
                  <div style={{ marginBottom: '24px' }}>
                    {item.modifierGroups.map((group) => {
                      const selectedInGroup = selectedGroupItems[group.id] || [];
                      const isValid = isGroupValid(group);
                      const isRadio = (group.max || 1) === 1;

                      return (
                        <div key={group.id} style={{ marginBottom: '20px' }}>
                          {/* Group Header */}
                          <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            marginBottom: '10px', flexWrap: 'wrap', gap: '6px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '15px', fontWeight: '700', color: '#1f2937' }}>
                                {group.name}
                              </span>
                              {group.required && (
                                <span style={{ color: '#ef4444', fontSize: '14px', fontWeight: '700' }}>*</span>
                              )}
                            </div>
                            <span style={{
                              fontSize: '11px', fontWeight: '600',
                              padding: '3px 10px', borderRadius: '20px',
                              backgroundColor: isValid ? '#f0fdf4' : '#fef2f2',
                              color: isValid ? '#16a34a' : '#ef4444'
                            }}>
                              {selectedInGroup.length}/{group.max || 1}
                              {' · '}
                              {group.required
                                ? ((group.min || 1) === (group.max || 1) ? `Pick ${group.min || 1}` : `Pick ${group.min || 1}-${group.max || 1}`)
                                : `Optional${group.max ? `, up to ${group.max}` : ''}`
                              }
                            </span>
                          </div>

                          {/* Group Items */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {(group.items || []).map((groupItem) => {
                              const isSelected = selectedInGroup.some(c => c.id === groupItem.id);
                              const atMax = !isSelected && selectedInGroup.length >= (group.max || 1) && (group.max || 1) > 1;
                              return (
                                <button
                                  key={groupItem.id}
                                  type="button"
                                  onClick={() => handleGroupItemToggle(group, groupItem)}
                                  disabled={atMax}
                                  style={{
                                    padding: '12px 16px',
                                    backgroundColor: isSelected ? '#fef2f2' : (atMax ? '#f3f4f6' : 'white'),
                                    border: isSelected ? '2px solid #ef4444' : '1px solid #e5e7eb',
                                    borderRadius: '10px',
                                    cursor: atMax ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    opacity: atMax ? 0.5 : 1,
                                    transition: 'all 0.15s ease',
                                    textAlign: 'left',
                                    width: '100%'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {isRadio ? (
                                      <div style={{
                                        width: '20px', height: '20px', borderRadius: '50%',
                                        border: `2px solid ${isSelected ? '#ef4444' : '#d1d5db'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0
                                      }}>
                                        {isSelected && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />}
                                      </div>
                                    ) : (
                                      <div style={{
                                        width: '20px', height: '20px', borderRadius: '4px',
                                        border: `2px solid ${isSelected ? '#ef4444' : '#d1d5db'}`,
                                        backgroundColor: isSelected ? '#ef4444' : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0
                                      }}>
                                        {isSelected && <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                                      </div>
                                    )}
                                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                                      {groupItem.name}
                                    </span>
                                  </div>
                                  {groupItem.price > 0 && (
                                    <span style={{
                                      fontSize: '14px', fontWeight: '600',
                                      color: isSelected ? '#ef4444' : '#6b7280'
                                    }}>
                                      +{formatCurrency(groupItem.price)}
                                    </span>
                                  )}
                                  {groupItem.price === 0 && (
                                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                                      Included
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Validation hint */}
                          {group.required && !isValid && (
                            <p style={{ fontSize: '11px', color: '#ef4444', margin: '6px 0 0 0', fontWeight: '500' }}>
                              Please select {(group.min || 1) === 1 ? '1 option' : `at least ${group.min || 1} options`}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

            {/* Customizations Section (Toppings/Add-ons) */}
            {!useGroupedUI && hasCustomizations && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '12px'
                }}>
                  Add Toppings/Extras
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {item.customizations.map((customization, index) => {
                    const isSelected = selectedCustomizations.some(c => c.id === customization.id);
                    return (
                      <button
                        key={customization.id || index}
                        onClick={() => handleCustomizationToggle(customization)}
                        style={{
                          padding: '12px 16px',
                          backgroundColor: isSelected ? '#fef2f2' : 'white',
                          border: isSelected ? '2px solid #ef4444' : '1px solid #e5e7eb',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s ease',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.target.style.borderColor = '#ef4444';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.target.style.borderColor = '#e5e7eb';
                          }
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            border: '2px solid',
                            borderColor: isSelected ? '#ef4444' : '#d1d5db',
                            backgroundColor: isSelected ? '#ef4444' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                          }}>
                            {isSelected && (
                              <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>✓</span>
                            )}
                          </div>
                          <div>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#1f2937'
                            }}>
                              {customization.name}
                            </div>
                            {customization.description && (
                              <div style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                marginTop: '2px'
                              }}>
                                {customization.description}
                              </div>
                            )}
                          </div>
                        </div>
                        {customization.price > 0 && (
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: isSelected ? '#ef4444' : '#6b7280'
                          }}>
                            +{formatCurrency(customization.price)}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div style={{ 
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#374151' }}>
                Quantity
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: quantity > 1 ? '#ef4444' : '#d1d5db',
                    color: 'white',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: quantity > 1 ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <FaMinus size={12} />
                </button>
                <span style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1f2937',
                  minWidth: '30px',
                  textAlign: 'center'
                }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <FaPlus size={12} />
                </button>
              </div>
            </div>

            {/* Price Summary */}
            <div style={{
              padding: '16px',
              backgroundColor: '#fff7ed',
              borderRadius: '12px',
              marginBottom: '20px',
              border: '1px solid #fed7aa'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Base Price</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                  {formatCurrency(getBasePrice())}
                </span>
              </div>
              {(hasCustomizations || hasModifierGroups) && selectedCustomizations.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    Toppings/Extras ({selectedCustomizations.length})
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                    +{formatCurrency(getCustomizationPrice())}
                  </span>
                </div>
              )}
              {quantity > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Quantity</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                    × {quantity}
                  </span>
                </div>
              )}
              <div style={{
                paddingTop: '12px',
                borderTop: '2px solid #fed7aa',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>
                  Total
                </span>
                <span style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#ef4444'
                }}>
                  {formatCurrency(getTotalPrice())}
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={(hasVariants && !selectedVariant) || (hasModifierGroups && !allGroupsValid)}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: ((hasVariants && !selectedVariant) || (hasModifierGroups && !allGroupsValid)) ? '#d1d5db' : '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: ((hasVariants && !selectedVariant) || (hasModifierGroups && !allGroupsValid)) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: ((hasVariants && !selectedVariant) || (hasModifierGroups && !allGroupsValid)) ? 'none' : '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!((hasVariants && !selectedVariant) || (hasModifierGroups && !allGroupsValid))) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = ((hasVariants && !selectedVariant) || (hasModifierGroups && !allGroupsValid)) ? 'none' : '0 4px 12px rgba(239, 68, 68, 0.3)';
              }}
            >
              <FaPlus size={14} />
              {currentQuantity > 0 ? `Update Cart (${currentQuantity} in cart)` : 'Add to Cart'}
            </button>

            {hasVariants && !selectedVariant && (
              <p style={{
                fontSize: '12px',
                color: '#ef4444',
                margin: '8px 0 0 0',
                textAlign: 'center'
              }}>
                Please select a size/portion
              </p>
            )}
                {hasModifierGroups && !allGroupsValid && (
                  <p style={{ fontSize: '12px', color: '#ef4444', margin: '8px 0 0 0', textAlign: 'center', fontWeight: '500' }}>
                    Please complete all required selections
                  </p>
                )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default ItemCustomizationModal;

