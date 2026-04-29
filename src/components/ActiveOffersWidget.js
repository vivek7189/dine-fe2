'use client';

/**
 * ActiveOffersWidget — compact display of applicable offers for a billing surface.
 *
 * Consumes values from useOfferEngine and renders:
 *  - Compact cards per applicable offer (name, discount, scope)
 *  - Highlighted best/selected offer
 *  - Free items chip (cross-item BOGO)
 *  - "Login required" chips for audience-gated offers
 *
 * Purely presentational — parent passes pre-computed values from the hook.dfd
 */
import React from 'react';
import { FaGift, FaLock, FaCheckCircle } from 'react-icons/fa';

const formatDiscount = (offer, currencySymbol = '₹') => {
  if (offer.promotionType === 'bogo') return 'BOGO';
  if (offer.discountType === 'percentage') return `${offer.discountValue || 0}% off`;
  return `Flat ${currencySymbol}${offer.discountValue || 0} off`;
};

const scopeHint = (offer) => {
  if (offer.scope === 'category') return 'on categories';
  if (offer.scope === 'item') return 'on items';
  return 'on order';
};

const ActiveOffersWidget = ({
  applicableOffers = [],
  selectedOfferId = null,
  freeItems = [],
  onOfferClick,
  onLoginClick,
  compact = false,
  title = 'Active Offers',
  currencySymbol = '₹',
}) => {
  if (!applicableOffers || applicableOffers.length === 0) {
    return null;
  }

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      padding: compact ? 8 : 12,
      background: '#fafafa',
      marginTop: 8,
      marginBottom: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
        <FaGift style={{ color: '#f59e0b' }} />
        <span>{title}</span>
        <span style={{ color: '#9ca3af', fontWeight: 400 }}>({applicableOffers.length})</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {applicableOffers.map(offer => {
          const id = offer.id || offer._id;
          const isSelected = id === selectedOfferId;
          const requiresLogin = offer._requiresLogin;
          return (
            <div
              key={id}
              onClick={() => {
                if (requiresLogin && onLoginClick) return onLoginClick(offer);
                if (onOfferClick) onOfferClick(offer);
              }}
              style={{
                padding: compact ? '6px 8px' : '8px 10px',
                borderRadius: 6,
                background: isSelected ? '#ecfdf5' : '#fff',
                border: isSelected ? '1px solid #10b981' : '1px solid #e5e7eb',
                cursor: onOfferClick || onLoginClick ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                opacity: requiresLogin ? 0.75 : 1,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {isSelected && <FaCheckCircle style={{ color: '#10b981', fontSize: 11 }} />}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {offer.name}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>
                  {formatDiscount(offer, currencySymbol)} {scopeHint(offer)}
                </div>
              </div>
              {requiresLogin && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: 10,
                  background: '#fef3c7',
                  color: '#92400e',
                  padding: '2px 6px',
                  borderRadius: 10,
                  whiteSpace: 'nowrap',
                }}>
                  <FaLock style={{ fontSize: 9 }} /> Login
                </span>
              )}
            </div>
          );
        })}
      </div>

      {freeItems && freeItems.length > 0 && (
        <div style={{
          marginTop: 8,
          padding: '6px 8px',
          background: '#fef3c7',
          border: '1px dashed #f59e0b',
          borderRadius: 6,
          fontSize: 11,
          color: '#78350f',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexWrap: 'wrap',
        }}>
          <FaGift style={{ color: '#f59e0b' }} />
          <span style={{ fontWeight: 600 }}>Free:</span>
          {freeItems.map((f, i) => (
            <span key={i}>
              {f.qty}× {f.itemId}
              {i < freeItems.length - 1 ? ',' : ''}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveOffersWidget;
