'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaReceipt, FaTimes, FaSpinner } from 'react-icons/fa';
import apiClient from '../lib/api';
import OrderSummary from './OrderSummary';

/**
 * Shared billing modal used on both the Tables page and Dashboard Tables Panel.
 * Opens with a table object, fetches the order, shows OrderSummary in billing mode.
 * Renders via createPortal so it sits above sidebar/nav without z-index conflicts.
 */
export default function TableBillingModal({
  open,
  table,
  onClose,
  selectedRestaurant,
  restaurantName,
  taxSettings,
  menuItems,
  printSettings,
  billingSettings = {},
  multiPricingEnabled = false,
  pricingRules = [],
  activePricingRuleId = null,
  setActivePricingRuleId,
  countryCode = 'IN',
  businessType = 'restaurant',
  upiSettings = {},
  whatsappConnected = false,
  onRefreshTables,
  onOptimisticTableUpdate,
}) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalCart, setModalCart] = useState([]);
  const [modalPaymentMethod, setModalPaymentMethod] = useState('cash');
  const [modalProcessing, setModalProcessing] = useState(false);
  const [modalCustomerName, setModalCustomerName] = useState('');
  const [modalCustomerMobile, setModalCustomerMobile] = useState('');
  const [mounted, setMounted] = useState(false);
  const closeTimerRef = useRef(null);

  // Ensure portal target is available (client-side only)
  useEffect(() => { setMounted(true); }, []);

  // Cleanup pending close timer on unmount
  useEffect(() => {
    return () => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current); };
  }, []);

  // Fetch order when modal opens
  useEffect(() => {
    if (!open || !table?.currentOrderId || !selectedRestaurant?.id) return;

    setOrder(null);
    setModalCart([]);
    setModalPaymentMethod('cash');
    setModalCustomerName('');
    setModalCustomerMobile('');
    setLoading(true);

    (async () => {
      try {
        const response = await apiClient.getOrderById(table.currentOrderId);
        if (response.orders && response.orders.length > 0) {
          const ord = response.orders[0];
          setOrder(ord);

          const cartItems = (ord.items || []).map(item => {
            const menuItem = menuItems?.find(m => m.id === (item.menuItemId || item.id));
            // Refresh price from current menu to avoid stale pricing
            const refreshedPrice = item.selectedVariant?.price != null
              ? item.selectedVariant.price
              : (menuItem?.price ?? item.price ?? 0);
            // basePrice should use variant price when variant is selected
            const variantPriceVal = item.selectedVariant?.price;
            const itemBasePrice = variantPriceVal != null
              ? variantPriceVal
              : (menuItem?.price ?? item.basePrice ?? item.price ?? 0);
            return {
              id: item.menuItemId || item.id,
              name: menuItem?.name || item.name,
              price: refreshedPrice,
              quantity: item.quantity || 1,
              selectedVariant: item.selectedVariant,
              selectedCustomizations: item.selectedCustomizations,
              basePrice: itemBasePrice,
              isCustomItem: item.isCustomItem || false,
              pricingRules: menuItem?.pricingRules || item.pricingRules || {},
              category: item.category || menuItem?.category || '',
              taxGroupId: menuItem?.taxGroupId || item.taxGroupId || null,
              cartId: `${item.menuItemId || item.id}-${Date.now()}-${Math.random()}`
            };
          });
          setModalCart(cartItems);
          setModalPaymentMethod(ord.paymentMethod || 'cash');
          setModalCustomerName(ord.customerInfo?.name || '');
          setModalCustomerMobile(ord.customerInfo?.phone || '');
        }
      } catch (error) {
        console.error('Error fetching order for billing modal:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, table?.currentOrderId, selectedRestaurant?.id, menuItems?.length]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  const handleClose = () => {
    setOrder(null);
    setModalCart([]);
    setModalProcessing(false);
    setModalCustomerName('');
    setModalCustomerMobile('');
    onClose();
  };

  const getModalTotalAmount = () => {
    return modalCart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const isManualPrintEnabled = () => {
    return printSettings?.manualPrintEnabled !== false;
  };

  const handleModalProcessOrder = async (taxData = {}) => {
    if (!order || !selectedRestaurant?.id || modalProcessing) return;

    setModalProcessing(true);

    const {
      taxBreakdown = [], totalTax = 0, finalAmount = null, subtotal = null,
      serviceChargeAmount, serviceChargeRate, tipAmount, tipPercentage,
      cashReceived, changeReturned, splitPayments, roundOffAmount,
      compItems, voidItems, partialPayAmount, manualDiscount, offerDiscount,
      offerIds, selectedOfferName, totalDiscountAmount, specialInstructions,
      redeemLoyaltyPoints, loyaltyDiscount,
      serviceChargeEnabled, manualDiscountType, manualDiscountValue,
      fullDue,
      couponDiscount, couponCode, couponId,
      walletRedeemAmount, walletCustomerId,
      deliveryInfo: deliveryInfoData, deliveryAddress: deliveryAddrData,
      managerPin, taxInclusiveMode,
    } = taxData;

    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

      const paymentAmount = finalAmount ?? order.finalAmount ?? order.totalAmount ?? getModalTotalAmount();
      const isFullDue = fullDue === true || (partialPayAmount != null && partialPayAmount === 0);
      const isPartialPayment = !isFullDue && partialPayAmount && partialPayAmount > 0 && partialPayAmount < paymentAmount;

      const updateData = {
        status: 'completed',
        paymentStatus: isFullDue ? 'due' : (isPartialPayment ? 'partial' : 'paid'),
        paymentMethod: splitPayments ? 'split' : modalPaymentMethod,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(taxBreakdown.length > 0 && {
          totalAmount: subtotal || getModalTotalAmount(),
          taxBreakdown: taxBreakdown,
          taxAmount: totalTax,
          finalAmount: finalAmount
        }),
        ...(serviceChargeAmount > 0 && { serviceChargeAmount, serviceChargeRate }),
        ...(serviceChargeEnabled != null && { serviceChargeEnabled }),
        ...(tipAmount > 0 && { tipAmount, tipPercentage }),
        ...(cashReceived > 0 && { cashReceived, changeReturned }),
        ...(splitPayments && { splitPayments }),
        ...(roundOffAmount && roundOffAmount !== 0 && { roundOffAmount }),
        ...(compItems && { compItems }),
        ...(voidItems && { voidItems }),
        // Full Due: send partialPayAmount=0, paidAmount=0, outstandingAmount=full amount
        ...(isFullDue && {
          partialPayAmount: 0,
          paidAmount: 0,
          outstandingAmount: Math.round(paymentAmount * 100) / 100,
        }),
        ...(isPartialPayment && {
          partialPayAmount,
          paidAmount: partialPayAmount,
          outstandingAmount: Math.round((paymentAmount - partialPayAmount) * 100) / 100,
        }),
        // Discount fields — always include so zeros can clear previous values
        manualDiscount: manualDiscount || 0,
        manualDiscountType: manualDiscountType || null,
        manualDiscountValue: manualDiscountValue != null ? manualDiscountValue : null,
        offerDiscount: offerDiscount || 0,
        offerIds: offerIds && offerIds.length > 0 ? offerIds : [],
        selectedOfferName: selectedOfferName || null,
        totalDiscountAmount: totalDiscountAmount || 0,
        specialInstructions: specialInstructions || null,
        redeemLoyaltyPoints: redeemLoyaltyPoints || 0,
        loyaltyDiscount: loyaltyDiscount || 0,
        // Coupon fields
        couponDiscount: couponDiscount || null,
        couponCode: couponCode || null,
        couponId: couponId || null,
        // Wallet fields
        walletRedeemAmount: walletRedeemAmount || null,
        walletCustomerId: walletCustomerId || null,
        // Delivery fields
        deliveryInfo: deliveryInfoData || order.deliveryInfo || null,
        deliveryAddress: deliveryAddrData || order.deliveryAddress || null,
        // Manager pin & tax mode
        managerPin: managerPin || null,
        taxInclusiveMode: taxInclusiveMode || null,
        customerId: order.customerId || null,
        customerInfo: {
          name: modalCustomerName || order.customerInfo?.name || '',
          phone: modalCustomerMobile || order.customerInfo?.phone || null,
          tableNumber: order.tableNumber || table?.name || null,
        },
        lastUpdatedBy: {
          name: currentUser.name || 'Staff',
          id: currentUser.id,
          role: currentUser.role || 'waiter'
        }
      };

      // Optimistic: mark table available immediately (but keep modal open for print)
      if (onOptimisticTableUpdate && table) {
        onOptimisticTableUpdate(table.id, 'available');
      }

      const completedOrderId = order.id;

      await apiClient.updateOrder(completedOrderId, updateData);

      // Backend only accepts 'cash', 'card', 'upi' as offline methods
      const effectiveMethod = splitPayments
        ? (splitPayments[0]?.method || 'cash')
        : modalPaymentMethod;
      const safePaymentMethod = ['cash', 'card', 'upi'].includes(effectiveMethod) ? effectiveMethod : 'cash';

      await apiClient.verifyPayment({
        orderId: completedOrderId,
        paymentMethod: safePaymentMethod,
        amount: isPartialPayment ? partialPayAmount : paymentAmount,
        userId: currentUser.id,
        restaurantId: selectedRestaurant.id,
        paymentStatus: isPartialPayment ? 'partial' : 'completed'
      });

      if (!isManualPrintEnabled()) {
        try {
          await apiClient.requestManualPrint(completedOrderId, 'bill');
        } catch (printError) {
          console.error('Auto-print failed:', printError);
        }
      }

      if (onRefreshTables) {
        onRefreshTables();
      }

      console.log('Billing completed for order:', completedOrderId);

      // Delay modal close so OrderSummary can generate invoice + auto-print fires
      // Auto-print useEffect needs invoice set + 800ms timer, so 3s is safe
      const wantsPrint = !!window.__autoPrintBill || !!printSettings?.autoPrintOnCompleteBilling;
      closeTimerRef.current = setTimeout(() => handleClose(), wantsPrint ? 3000 : 500);

      // Return orderId so OrderSummary's handleProcessOrder can call generateInvoice
      return { orderId: completedOrderId };
    } catch (error) {
      console.error('Billing error:', error);
      // Revert optimistic table update and close modal on error
      if (onRefreshTables) {
        onRefreshTables();
      }
      handleClose();
      alert('Billing failed: ' + (error.message || 'Unknown error'));
      setModalProcessing(false); // Only reset on error so user can retry; on success keep disabled until modal closes
    }
  };

  if (!open || !mounted) return null;

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: 0,
      }}
      onClick={handleClose}
    >
      <style>{`
        @keyframes billingSlideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .billing-modal-panel {
          animation: billingSlideUp 0.25s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        @media (max-width: 768px) {
          .billing-modal-panel {
            max-width: 100% !important;
            width: 100% !important;
            height: 100dvh !important;
            max-height: 100dvh !important;
            border-radius: 0 !important;
          }
          .billing-modal-header {
            border-radius: 0 !important;
          }
        }
      `}</style>
      <div
        className="billing-modal-panel"
        style={{
          background: '#fff',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '640px',
          height: '96vh',
          maxHeight: '96vh',
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="billing-modal-header" style={{
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: '14px 14px 0 0',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <FaReceipt size={14} style={{ color: '#fff' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                {table?.name || table?.number || 'Table'} — Bill
              </div>
              {order && (
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', marginTop: '1px' }}>
                  #{order.dailyOrderId || order.id?.slice(-6) || '—'}
                  {order.items?.length ? ` · ${order.items.length} item${order.items.length > 1 ? 's' : ''}` : ''}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
          }}>
            <FaSpinner className="animate-spin" size={24} style={{ color: '#dc2626' }} />
            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Loading order...</div>
          </div>
        ) : order && modalCart.length > 0 ? (
          <div style={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}>
            <OrderSummary
              cart={modalCart}
              setCart={setModalCart}
              orderType={order.orderType || 'dine-in'}
              setOrderType={() => {}}
              paymentMethod={modalPaymentMethod}
              setPaymentMethod={setModalPaymentMethod}
              onClearCart={() => {}}
              onProcessOrder={handleModalProcessOrder}
              onSaveOrder={() => {}}
              onPlaceOrder={() => {}}
              onRemoveFromCart={() => {}}
              onAddToCart={() => {}}
              onUpdateCartItemQuantity={(cartId, newQty) => {
                setModalCart(prev => prev.map(item =>
                  item.cartId === cartId ? { ...item, quantity: newQty } : item
                ).filter(item => item.quantity > 0));
              }}
              onTableNumberChange={() => {}}
              onCustomerNameChange={(val) => setModalCustomerName(val)}
              onCustomerMobileChange={(val) => setModalCustomerMobile(val)}
              processing={modalProcessing}
              placingOrder={false}
              orderSuccess={false}
              setOrderSuccess={() => {}}
              error={null}
              getTotalAmount={getModalTotalAmount}
              tableNumber={order.tableNumber || table?.name || ''}
              selectedTable={{
                id: table?.id || null,
                name: order.tableNumber || table?.name || '',
                floor: order.floorName || table?.floor || null,
                floorId: order.floorId || table?.floorId || null,
              }}
              customerName={modalCustomerName}
              customerMobile={modalCustomerMobile}
              orderLookup=""
              setOrderLookup={() => {}}
              currentOrder={order}
              setCurrentOrder={() => {}}
              onShowQRCode={() => {}}
              restaurantId={selectedRestaurant?.id}
              restaurantName={restaurantName}
              taxSettings={taxSettings}
              printSettings={printSettings}
              menuItems={menuItems}
              onClose={handleClose}
              billingMode={true}
              billingSettings={billingSettings}
              multiPricingEnabled={multiPricingEnabled}
              pricingRules={pricingRules}
              activePricingRuleId={activePricingRuleId}
              setActivePricingRuleId={setActivePricingRuleId || (() => {})}
              countryCode={countryCode}
              businessType={businessType}
              upiSettings={upiSettings}
              whatsappConnected={whatsappConnected}
              posSettings={selectedRestaurant?.posSettings || {}}
              userRole={(() => { try { return JSON.parse(localStorage.getItem('user') || '{}').role || 'waiter'; } catch { return 'waiter'; } })()}
            />
          </div>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <FaReceipt size={22} style={{ color: '#9ca3af' }} />
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>No order found for this table</div>
          </div>
        )}
      </div>
    </div>
  );

  // Render via portal to escape sidebar/nav stacking context
  return createPortal(modalContent, document.body);
}
