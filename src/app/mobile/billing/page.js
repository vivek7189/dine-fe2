'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import apiClient from '../../../lib/api';

// Force mobile embed + billing mode flags before anything renders
if (typeof window !== 'undefined') {
  window.__DINEOPEN_MOBILE_EMBED__ = true;
  window.__DINEOPEN_BILLING_MODE__ = true;
}

const OrderSummary = dynamic(
  () => import('../../../components/OrderSummary'),
  { ssr: false, loading: () => <LoadingSpinner /> }
);

function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '80vh', flexDirection: 'column', gap: '12px',
    }}>
      <div style={{
        width: 32, height: 32,
        border: '3px solid #e5e7eb', borderTopColor: '#ef4444',
        borderRadius: '50%', animation: 'spin 0.6s linear infinite',
      }} />
      <div style={{ fontSize: '14px', color: '#6b7280' }}>Loading billing...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ErrorView({ message, onRetry, onClose }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '60vh', padding: '24px', textAlign: 'center',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
      }}>
        <span style={{ fontSize: 28 }}>!</span>
      </div>
      <p style={{ color: '#ef4444', fontWeight: 600, fontSize: 16, margin: '0 0 8px' }}>
        Failed to load billing
      </p>
      <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 24px' }}>{message}</p>
      <button onClick={onRetry} style={{
        padding: '10px 24px', background: '#ef4444', color: '#fff',
        border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 15,
        marginBottom: 8, width: '100%', maxWidth: 200,
      }}>Retry</button>
      <button onClick={onClose} style={{
        padding: '10px 24px', background: '#6b7280', color: '#fff',
        border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 15,
        width: '100%', maxWidth: 200,
      }}>Go Back</button>
    </div>
  );
}

export default function MobileBillingPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [authReady, setAuthReady] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Order and restaurant data
  const [order, setOrder] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [taxSettings, setTaxSettings] = useState({ enabled: false, rate: 0, taxes: [] });
  const [billingSettings, setBillingSettings] = useState({});
  const [multiPricingEnabled, setMultiPricingEnabled] = useState(false);
  const [pricingRules, setPricingRules] = useState([]);
  const [activePricingRuleId, setActivePricingRuleId] = useState(null);
  const [upiSettings, setUpiSettings] = useState({});
  const [printSettings, setPrintSettings] = useState({});

  // Cart and billing state
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [processing, setProcessing] = useState(false);

  // Step 1: Wait for auth to be populated by injected JS / mobile layout
  useEffect(() => {
    let attempts = 0;
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const user = localStorage.getItem('user');
      if (token && user) {
        setAuthReady(true);
        return;
      }
      attempts++;
      if (attempts < 20) {
        setTimeout(checkAuth, 100);
      } else {
        setAuthReady(true);
      }
    };
    checkAuth();
  }, []);

  // Step 2: Load all data once auth is ready
  const loadAllData = useCallback(async () => {
    if (!orderId) {
      setError('No order ID provided');
      return;
    }

    setError(null);
    try {
      // Fetch the order first
      const orderRes = await apiClient.getOrderById(orderId);
      // Backend returns { orders: [order], pagination: {...} }
      const orderData = orderRes?.orders?.[0] || orderRes?.order || orderRes;
      if (!orderData || !orderData.id) {
        setError('Order not found');
        return;
      }
      setOrder(orderData);

      const restaurantId = orderData.restaurantId || localStorage.getItem('selectedRestaurantId');
      if (!restaurantId) {
        setError('Restaurant not found');
        return;
      }

      // Fetch all settings in parallel
      const [taxRes, billingRes, pricingRes, restaurantRes, menuRes, upiRes, printRes] = await Promise.allSettled([
        apiClient.getTaxSettings(restaurantId),
        apiClient.getBillingSettings(restaurantId),
        apiClient.getPricingSettings(restaurantId),
        apiClient.getRestaurant(restaurantId),
        apiClient.getMenu(restaurantId),
        apiClient.getCustomerAppSettings(restaurantId),
        apiClient.getPrintSettings?.(restaurantId) || Promise.resolve(null),
      ]);

      // Tax settings
      if (taxRes.status === 'fulfilled' && taxRes.value?.taxSettings) {
        const ts = taxRes.value.taxSettings;
        const enabledTaxes = (ts.taxes || []).filter(t => t.enabled);
        const totalRate = enabledTaxes.reduce((s, t) => s + (t.rate || 0), 0);
        setTaxSettings({ enabled: ts.enabled || false, rate: totalRate, taxes: ts.taxes || [] });
      }

      // Billing settings
      if (billingRes.status === 'fulfilled') {
        setBillingSettings(billingRes.value?.billingSettings || billingRes.value?.settings || billingRes.value || {});
      }

      // Multi-tier pricing
      if (pricingRes.status === 'fulfilled') {
        const mp = pricingRes.value?.settings?.multiPricing;
        if (mp?.enabled) {
          setMultiPricingEnabled(true);
          setPricingRules((mp.rules || []).filter(r => r.isActive));
        }
      }

      // Restaurant data
      if (restaurantRes.status === 'fulfilled') {
        setRestaurant(restaurantRes.value?.restaurant || restaurantRes.value);
      }

      // Menu items
      if (menuRes.status === 'fulfilled') {
        setMenuItems(menuRes.value?.menuItems || []);
      }

      // UPI settings
      if (upiRes.status === 'fulfilled' && upiRes.value?.paymentSettings) {
        setUpiSettings(upiRes.value.paymentSettings);
      }

      // Print settings
      if (printRes.status === 'fulfilled' && printRes.value) {
        setPrintSettings(printRes.value?.printSettings || printRes.value || {});
      }

      // Build cart from order items
      const items = orderData.items || [];
      const allMenuItems = menuRes.status === 'fulfilled' ? (menuRes.value?.menuItems || []) : [];
      setCart(items.map((item, idx) => {
        const menuItem = allMenuItems.find(m => m.id === (item.menuItemId || item.id));
        return {
          id: item.menuItemId || item.id || `item-${idx}`,
          cartId: `${item.menuItemId || item.id}-${idx}`,
          menuItemId: item.menuItemId || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          originalPrice: item.originalPrice || item.price,
          pricingRules: menuItem?.pricingRules || item.pricingRules || {},
        };
      }));

      // Pre-fill customer and table info from order
      setCustomerName(orderData.customerInfo?.name || orderData.customerName || '');
      setCustomerMobile(orderData.customerPhone || orderData.customerInfo?.phone || orderData.customerInfo?.mobile || '');
      setTableNumber(orderData.tableNumber || '');
      setPaymentMethod(orderData.paymentMethod || 'cash');
      setActivePricingRuleId(orderData.pricingRuleId || null);

      setDataLoaded(true);
    } catch (e) {
      console.error('MobileBillingPage loadAllData error:', e);
      setError(e.message || 'Failed to load billing data');
    }
  }, [orderId]);

  useEffect(() => {
    if (authReady) loadAllData();
  }, [authReady, loadAllData]);

  // Handle billing completion — called by OrderSummary's onProcessOrder
  const handleProcessOrder = async (taxData = {}) => {
    if (!order || processing) return;
    setProcessing(true);

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
      const paymentAmount = finalAmount || order.finalAmount || order.totalAmount || cart.reduce((t, i) => t + i.price * i.quantity, 0);
      const isPartialPayment = partialPayAmount && partialPayAmount > 0 && partialPayAmount < paymentAmount;

      const updateData = {
        status: 'completed',
        paymentStatus: isPartialPayment ? 'partial' : 'paid',
        paymentMethod: splitPayments ? 'split' : paymentMethod,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(taxBreakdown.length > 0 && {
          totalAmount: subtotal || cart.reduce((t, i) => t + i.price * i.quantity, 0),
          taxBreakdown,
          taxAmount: totalTax,
          finalAmount,
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
        tableNumber: tableNumber || order.tableNumber || null,
        customerInfo: {
          name: customerName || order.customerInfo?.name || '',
          phone: customerMobile || order.customerInfo?.phone || null,
          tableNumber: tableNumber || order.tableNumber || null,
        },
        lastUpdatedBy: {
          name: currentUser.name || 'Staff',
          id: currentUser.id,
          role: currentUser.role || 'waiter',
        },
      };

      await apiClient.updateOrder(order.id, updateData);

      // Verify payment
      await apiClient.verifyPayment({
        orderId: order.id,
        paymentMethod: splitPayments ? 'split' : paymentMethod,
        amount: isPartialPayment ? partialPayAmount : paymentAmount,
        userId: currentUser.id,
        restaurantId: order.restaurantId,
        paymentStatus: isPartialPayment ? 'partial' : 'completed',
      });

      // Notify native app that billing is complete
      if (typeof window !== 'undefined' && window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'BILLING_COMPLETE',
          orderId: order.id,
          status: 'completed',
        }));
      }

      return { orderId: order.id };
    } catch (e) {
      console.error('Billing completion error:', e);
      alert('Billing failed: ' + (e.message || 'Unknown error'));
      throw e;
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (typeof window !== 'undefined' && window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'BILLING_CLOSE' }));
    }
  };

  // Loading states
  if (!authReady || (!dataLoaded && !error)) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorView message={error} onRetry={loadAllData} onClose={handleClose} />;
  }

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();

  const restaurantId = order?.restaurantId || localStorage.getItem('selectedRestaurantId');

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OrderSummary
        cart={cart}
        setCart={setCart}
        orderType={order?.orderType || 'dine-in'}
        setOrderType={() => {}}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        onClearCart={() => {}}
        onProcessOrder={handleProcessOrder}
        onSaveOrder={() => {}}
        onPlaceOrder={() => {}}
        onRemoveFromCart={() => {}}
        onAddToCart={() => {}}
        onUpdateCartItemQuantity={(cartId, newQty) => {
          setCart(prev => prev.map(item =>
            item.cartId === cartId ? { ...item, quantity: newQty } : item
          ).filter(item => item.quantity > 0));
        }}
        onTableNumberChange={(val) => setTableNumber(val)}
        onCustomerNameChange={(val) => setCustomerName(val)}
        onCustomerMobileChange={(val) => setCustomerMobile(val)}
        processing={processing}
        placingOrder={false}
        orderSuccess={false}
        setOrderSuccess={() => {}}
        error={null}
        getTotalAmount={() => cart.reduce((t, i) => t + i.price * i.quantity, 0)}
        tableNumber={tableNumber}
        selectedTable={tableNumber ? { name: tableNumber } : null}
        customerName={customerName}
        customerMobile={customerMobile}
        orderLookup=""
        setOrderLookup={() => {}}
        currentOrder={order}
        setCurrentOrder={() => {}}
        onShowQRCode={() => {}}
        restaurantId={restaurantId}
        restaurantName={restaurant?.name || ''}
        taxSettings={taxSettings}
        printSettings={printSettings}
        menuItems={menuItems}
        onClose={handleClose}
        billingMode={true}
        billingSettings={billingSettings}
        businessType={restaurant?.businessType || 'restaurant'}
        countryCode={restaurant?.countryCode || 'IN'}
        userRole={user?.role || 'cashier'}
        multiPricingEnabled={multiPricingEnabled}
        pricingRules={pricingRules}
        activePricingRuleId={activePricingRuleId}
        setActivePricingRuleId={setActivePricingRuleId}
        upiSettings={upiSettings}
      />
    </div>
  );
}
