'use client';

import { useState, useEffect } from 'react';
import { FaReceipt, FaTimes, FaSpinner } from 'react-icons/fa';
import apiClient from '../lib/api';
import OrderSummary from './OrderSummary';

/**
 * Shared billing modal used on both the Tables page and Dashboard Tables Panel.
 * Opens with a table object, fetches the order, shows OrderSummary in billing mode.
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

          // Populate modal cart with order items (include pricingRules from menu for multi-tier pricing)
          const cartItems = (ord.items || []).map(item => {
            const menuItem = menuItems?.find(m => m.id === (item.menuItemId || item.id));
            return {
              id: item.menuItemId || item.id,
              name: item.name,
              price: item.price || 0,
              quantity: item.quantity || 1,
              selectedVariant: item.selectedVariant,
              selectedCustomizations: item.selectedCustomizations,
              basePrice: item.basePrice || item.price || 0,
              pricingRules: menuItem?.pricingRules || item.pricingRules || {},
              category: item.category || menuItem?.category || '',
              taxGroupId: item.taxGroupId || menuItem?.taxGroupId || null,
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
  }, [open, table?.currentOrderId, selectedRestaurant?.id]);

  const handleClose = () => {
    setOrder(null);
    setModalCart([]);
    setModalProcessing(false);
    setModalCustomerName('');
    setModalCustomerMobile('');
    onClose();
  };

  // Get total amount for modal cart
  const getModalTotalAmount = () => {
    return modalCart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Check if manual print is enabled
  const isManualPrintEnabled = () => {
    return printSettings?.manualPrintEnabled !== false;
  };

  // Handle billing process from modal OrderSummary
  const handleModalProcessOrder = async (taxData = {}) => {
    if (!order || !selectedRestaurant?.id || modalProcessing) return;

    setModalProcessing(true);

    // Extract ALL billing data from taxData passed by OrderSummary
    const {
      taxBreakdown = [], totalTax = 0, finalAmount = null, subtotal = null,
      serviceChargeAmount, serviceChargeRate, tipAmount, tipPercentage,
      cashReceived, changeReturned, splitPayments, roundOffAmount,
      compItems, voidItems, partialPayAmount, manualDiscount, offerDiscount,
      offerIds, selectedOfferName, totalDiscountAmount, specialInstructions,
      redeemLoyaltyPoints, loyaltyDiscount,
    } = taxData;

    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

      // Calculate the payment amount (use taxData if provided, else use order's stored values)
      const paymentAmount = finalAmount ?? order.finalAmount ?? order.totalAmount ?? getModalTotalAmount();
      const isPartialPayment = partialPayAmount && partialPayAmount > 0 && partialPayAmount < paymentAmount;

      // Update order to completed status with full billing data
      const updateData = {
        status: 'completed',
        paymentStatus: isPartialPayment ? 'partial' : 'paid',
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
        ...(tipAmount > 0 && { tipAmount, tipPercentage }),
        ...(cashReceived > 0 && { cashReceived, changeReturned }),
        ...(splitPayments && { splitPayments }),
        ...(roundOffAmount && roundOffAmount !== 0 && { roundOffAmount }),
        ...(compItems && { compItems }),
        ...(voidItems && { voidItems }),
        ...(isPartialPayment && {
          partialPayAmount,
          paidAmount: partialPayAmount,
          outstandingAmount: Math.round((paymentAmount - partialPayAmount) * 100) / 100,
        }),
        ...(manualDiscount > 0 && { manualDiscount }),
        ...(offerDiscount > 0 && { offerDiscount, offerIds, selectedOfferName }),
        ...(totalDiscountAmount > 0 && { totalDiscountAmount }),
        ...(specialInstructions && { specialInstructions }),
        ...(redeemLoyaltyPoints > 0 && { redeemLoyaltyPoints }),
        ...(loyaltyDiscount > 0 && { loyaltyDiscount }),
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

      // Optimistic: close modal and mark table available immediately
      handleClose();
      if (onOptimisticTableUpdate && table) {
        onOptimisticTableUpdate(table.id, 'available');
      }

      await apiClient.updateOrder(order.id, updateData);

      // Process payment
      await apiClient.verifyPayment({
        orderId: order.id,
        paymentMethod: splitPayments ? 'split' : modalPaymentMethod,
        amount: isPartialPayment ? partialPayAmount : paymentAmount,
        userId: currentUser.id,
        restaurantId: selectedRestaurant.id,
        paymentStatus: isPartialPayment ? 'partial' : 'completed'
      });

      // Only send to auto-print if auto-print is enabled (manualPrint disabled)
      if (!isManualPrintEnabled()) {
        try {
          await apiClient.requestManualPrint(order.id, 'bill');
        } catch (printError) {
          console.error('Auto-print failed:', printError);
        }
      }

      // Background refresh to sync final state from server
      if (onRefreshTables) {
        onRefreshTables();
      }

      console.log('Billing completed for order:', order.id);
    } catch (error) {
      console.error('Billing error:', error);
      // Revert: refresh tables to restore actual state from server
      if (onRefreshTables) {
        onRefreshTables();
      }
      alert('Billing failed: ' + (error.message || 'Unknown error'));
    } finally {
      setModalProcessing(false);
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '16px'
      }}
      onClick={handleClose}
    >
      <div
        className="table-actions-modal"
        style={{
          background: '#fff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '580px',
          maxHeight: '92vh',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          animation: 'modalFadeIn 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Red Header with Close Button */}
        <div style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: '16px 16px 0 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaReceipt size={16} style={{ color: '#ffffff' }} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                {table?.name || table?.number || 'Table'} - Bill
              </div>
              {order && (
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>
                  Order #{order.dailyOrderId || order.id?.slice(-6) || 'N/A'}
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
              background: 'rgba(255,255,255,0.2)',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Modal Content */}
        {loading ? (
          <div style={{
            padding: '60px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <FaSpinner className="animate-spin" size={28} style={{ color: '#dc2626' }} />
            <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>Loading order...</div>
          </div>
        ) : order && modalCart.length > 0 ? (
          /* OrderSummary in billing mode */
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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
            padding: '60px',
            textAlign: 'center',
            background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 20px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}>
              <FaReceipt size={28} style={{ color: '#9ca3af' }} />
            </div>
            <div style={{ fontSize: '16px', color: '#6b7280', fontWeight: 500 }}>No order found for this table</div>
          </div>
        )}
      </div>
    </div>
  );
}
