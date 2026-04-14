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

function WaitingForData() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '80vh', flexDirection: 'column', gap: '12px',
    }}>
      <div style={{
        width: 32, height: 32,
        border: '3px solid #e5e7eb', borderTopColor: '#10b981',
        borderRadius: '50%', animation: 'spin 0.6s linear infinite',
      }} />
      <div style={{ fontSize: '14px', color: '#6b7280' }}>Ready for billing...</div>
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
  // mode=preload means page is pre-loaded, waiting for data via postMessage
  const mode = searchParams.get('mode');
  const isPreloadMode = mode === 'preload' || !orderId;

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

  // Step 1: Wait for auth
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

  // Step 2A: Listen for data from native app via postMessage (pre-load mode)
  useEffect(() => {
    const handleMessage = (event) => {
      let data;
      try {
        data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch { return; }

      if (data.type === 'BILLING_DATA') {
        // Native app is sending all the data we need — no API calls required
        const d = data.payload;

        // Set order
        setOrder({
          id: d.orderId,
          restaurantId: d.restaurantId,
          items: d.cart || [],
          orderType: d.orderType || 'dine-in',
          paymentMethod: d.paymentMethod || 'cash',
          tableNumber: d.tableNumber || '',
          customerInfo: {
            name: d.customerName || '',
            phone: d.customerMobile || '',
          },
          customerPhone: d.customerMobile || '',
          customerId: d.customerId || null,
          pricingRuleId: d.activePricingRuleId || null,
        });

        // Set all settings directly — no API fetch needed
        if (d.taxSettings) setTaxSettings(d.taxSettings);
        if (d.billingSettings) setBillingSettings(d.billingSettings);
        if (d.menuItems) setMenuItems(d.menuItems);
        if (d.upiSettings) setUpiSettings(d.upiSettings);
        if (d.printSettings) setPrintSettings(d.printSettings);
        if (d.restaurant) setRestaurant(d.restaurant);
        if (d.multiPricingEnabled !== undefined) setMultiPricingEnabled(d.multiPricingEnabled);
        if (d.pricingRules) setPricingRules(d.pricingRules);
        if (d.activePricingRuleId) setActivePricingRuleId(d.activePricingRuleId);

        // Build cart
        const items = d.cart || [];
        setCart(items.map((item, idx) => ({
          id: item.menuItemId || item.id || `item-${idx}`,
          cartId: `${item.menuItemId || item.id}-${idx}`,
          menuItemId: item.menuItemId || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          originalPrice: item.originalPrice || item.price,
          pricingRules: item.pricingRules || {},
        })));

        // Pre-fill customer/table
        setCustomerName(d.customerName || '');
        setCustomerMobile(d.customerMobile || '');
        setTableNumber(d.tableNumber || '');
        setPaymentMethod(d.paymentMethod || 'cash');

        setDataLoaded(true);
        setError(null);

        // Tell native app we're ready
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'BILLING_READY' }));
        }
      } else if (data.type === 'BILLING_RESET') {
        // Reset for next billing session
        setDataLoaded(false);
        setOrder(null);
        setCart([]);
        setError(null);
        setProcessing(false);
      }
    };

    // Listen on both window.onmessage (RN WebView) and document message
    window.addEventListener('message', handleMessage);
    // Also handle RN WebView's direct message posting
    if (typeof document !== 'undefined') {
      document.addEventListener('message', handleMessage);
    }
    return () => {
      window.removeEventListener('message', handleMessage);
      if (typeof document !== 'undefined') {
        document.removeEventListener('message', handleMessage);
      }
    };
  }, []);

  // Step 2B: Fallback — fetch from API if orderId is provided directly (non-preload mode)
  const loadAllData = useCallback(async () => {
    if (!orderId || isPreloadMode) return;

    setError(null);
    try {
      const orderRes = await apiClient.getOrderById(orderId);
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

      let storedRestaurant = null;
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        storedRestaurant = userData.restaurant || null;
      } catch (e) {}

      const [taxRes, billingRes, pricingRes, menuRes, upiRes, printRes] = await Promise.allSettled([
        apiClient.getTaxSettings(restaurantId),
        apiClient.getBillingSettings(restaurantId),
        apiClient.getPricingSettings(restaurantId),
        apiClient.getMenu(restaurantId),
        apiClient.getCustomerAppSettings(restaurantId),
        apiClient.getPrintSettings?.(restaurantId) || Promise.resolve(null),
      ]);

      if (taxRes.status === 'fulfilled' && taxRes.value?.taxSettings) {
        const ts = taxRes.value.taxSettings;
        const enabledTaxes = (ts.taxes || []).filter(t => t.enabled);
        const totalRate = enabledTaxes.reduce((s, t) => s + (t.rate || 0), 0);
        setTaxSettings({ enabled: ts.enabled || false, rate: totalRate, taxes: ts.taxes || [] });
      }
      if (billingRes.status === 'fulfilled') {
        setBillingSettings(billingRes.value?.billingSettings || billingRes.value?.settings || billingRes.value || {});
      }
      if (pricingRes.status === 'fulfilled') {
        const mp = pricingRes.value?.settings?.multiPricing;
        if (mp?.enabled) {
          setMultiPricingEnabled(true);
          setPricingRules((mp.rules || []).filter(r => r.isActive));
        }
      }
      if (storedRestaurant) setRestaurant(storedRestaurant);
      if (menuRes.status === 'fulfilled') setMenuItems(menuRes.value?.menuItems || []);
      if (upiRes.status === 'fulfilled' && upiRes.value?.paymentSettings) setUpiSettings(upiRes.value.paymentSettings);
      if (printRes.status === 'fulfilled' && printRes.value) setPrintSettings(printRes.value?.printSettings || printRes.value || {});

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
  }, [orderId, isPreloadMode]);

  useEffect(() => {
    if (authReady && !isPreloadMode) loadAllData();
  }, [authReady, loadAllData, isPreloadMode]);

  // Notify native app that page shell is ready (pre-load mode)
  useEffect(() => {
    if (authReady && isPreloadMode && window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'BILLING_SHELL_READY' }));
    }
  }, [authReady, isPreloadMode]);

  // Handle billing completion
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

      await apiClient.verifyPayment({
        orderId: order.id,
        paymentMethod: splitPayments ? 'split' : paymentMethod,
        amount: isPartialPayment ? partialPayAmount : paymentAmount,
        userId: currentUser.id,
        restaurantId: order.restaurantId,
        paymentStatus: isPartialPayment ? 'partial' : 'completed',
      });

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

  // Save order (keep as saved/pending)
  const handleSaveOrder = async (taxData = {}) => {
    if (!order) return;
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      await apiClient.updateOrder(order.id, {
        status: 'saved',
        items: cart.map(i => ({ menuItemId: i.menuItemId || i.id, name: i.name, price: i.price, quantity: i.quantity })),
        tableNumber: tableNumber || order.tableNumber || null,
        customerInfo: { name: customerName || '', phone: customerMobile || null },
        ...(taxData.specialInstructions && { specialInstructions: taxData.specialInstructions }),
        lastUpdatedBy: { name: currentUser.name || 'Staff', id: currentUser.id, role: currentUser.role || 'waiter' },
      });
      if (typeof window !== 'undefined' && window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'BILLING_COMPLETE', orderId: order.id, status: 'saved' }));
      }
    } catch (e) {
      alert('Save failed: ' + (e.message || 'Unknown error'));
    }
  };

  // Place order (send to kitchen — status confirmed)
  const handlePlaceOrder = async (taxData = {}) => {
    if (!order) return;
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      await apiClient.updateOrder(order.id, {
        status: 'confirmed',
        items: cart.map(i => ({ menuItemId: i.menuItemId || i.id, name: i.name, price: i.price, quantity: i.quantity })),
        tableNumber: tableNumber || order.tableNumber || null,
        customerInfo: { name: customerName || '', phone: customerMobile || null },
        ...(taxData.specialInstructions && { specialInstructions: taxData.specialInstructions }),
        lastUpdatedBy: { name: currentUser.name || 'Staff', id: currentUser.id, role: currentUser.role || 'waiter' },
      });
      if (typeof window !== 'undefined' && window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'BILLING_COMPLETE', orderId: order.id, status: 'confirmed' }));
      }
    } catch (e) {
      alert('Place order failed: ' + (e.message || 'Unknown error'));
    }
  };

  const handleClose = () => {
    if (typeof window !== 'undefined' && window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'BILLING_CLOSE' }));
    }
  };

  // Pre-load mode: show "waiting" state until data arrives
  if (isPreloadMode && !dataLoaded) {
    if (!authReady) return <LoadingSpinner />;
    return <WaitingForData />;
  }

  // Normal mode: show loading/error
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
        onSaveOrder={handleSaveOrder}
        onPlaceOrder={handlePlaceOrder}
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
        billingMode={false}
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
