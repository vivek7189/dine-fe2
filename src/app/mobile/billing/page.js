'use client';
// Mobile WebView billing page — renders OrderSummary for dine-app WebView billing flow

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import apiClient from '../../../lib/api';
import { getCartSubtotal, getEffectiveItemPrice } from '../../../utils/billingPrice';

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


// Saved/app order line → billing cart line. Order lines (from the server, or from the native app's
// buildItemPayload) carry price = base + topping prices, plus the variant/toppings/notes/seat/tax
// fields. Keep ALL of them — previously only id/name/price/qty survived, so completing a bill sent
// the items back WITHOUT variant/toppings/notes: the server then re-priced variant lines at the
// plain menu price, marked the originals removed (kitchen update) and wiped kitchen notes. The cart
// stores the BASE (price − toppings); toppings are added back once by getEffectiveItemPrice, so
// base + toppings === the incoming price exactly (displayed totals are unchanged).
function orderLineToBillingCartItem(item, idx, menuItem) {
  const toppings = Array.isArray(item.selectedCustomizations) ? item.selectedCustomizations : [];
  const toppingsTotal = toppings.reduce((sum, c) => sum + (typeof c?.price === 'number' ? c.price : 0), 0);
  const unit = typeof item.price === 'number' ? item.price
    : (item.price != null && !isNaN(parseFloat(item.price)) ? parseFloat(item.price) : 0);
  const base = Math.max(0, Math.round((unit - toppingsTotal) * 100) / 100);
  return {
    id: item.menuItemId || item.id || `item-${idx}`,
    cartId: `${item.menuItemId || item.id}-${idx}`,
    menuItemId: item.menuItemId || item.id,
    name: item.name,
    price: base,
    basePrice: base,
    quantity: item.quantity || 1,
    originalPrice: base,
    pricingRules: menuItem?.pricingRules || item.pricingRules || {},
    selectedVariant: item.selectedVariant || null,
    selectedCustomizations: toppings,
    notes: item.notes || '',
    category: item.category || menuItem?.category || '',
    categoryId: item.categoryId || null,
    taxGroupId: item.taxGroupId || menuItem?.taxGroupId || null,
    ...(item.taxInclusive != null ? { taxInclusive: item.taxInclusive } : {}),
    ...(item.hsnCode ? { hsnCode: item.hsnCode } : {}),
    ...(item.seat != null ? { seat: item.seat } : {}),
    ...(item.isCustomItem ? { isCustomItem: true } : {}),
    ...(item.priceEdited === true ? { priceEdited: true } : {}),
    ...(typeof item.menuPrice === 'number' ? { menuPrice: item.menuPrice } : {}),
  };
}

// Billing cart line → order line for PATCH — the same shape the web POS / native app send.
function billingCartItemToOrderLine(item) {
  const unit = getEffectiveItemPrice(item, {});
  const qty = item.quantity || 1;
  return {
    menuItemId: item.menuItemId || item.id,
    name: item.name,
    price: unit,
    quantity: qty,
    total: unit * qty,
    notes: item.notes || '',
    category: item.category || '',
    categoryId: item.categoryId || null,
    taxGroupId: item.taxGroupId || null,
    ...(item.taxInclusive != null ? { taxInclusive: item.taxInclusive } : {}),
    ...(item.hsnCode ? { hsnCode: item.hsnCode } : {}),
    selectedVariant: item.selectedVariant || null,
    selectedCustomizations: Array.isArray(item.selectedCustomizations) ? item.selectedCustomizations : [],
    basePrice: typeof item.basePrice === 'number' ? item.basePrice : item.price,
    ...(item.seat != null ? { seat: item.seat } : {}),
    ...(item.isCustomItem ? { isCustomItem: true } : {}),
    ...(item.priceEdited === true ? { priceEdited: true } : {}),
  };
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
        setCart(items.map((item, idx) => orderLineToBillingCartItem(item, idx, null)));

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
        return orderLineToBillingCartItem(item, idx, menuItem);
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

  // Helper: extract taxData fields (same destructuring as dashboard)
  const extractTaxData = (taxData = {}) => {
    const {
      taxBreakdown = [], totalTax = 0, finalAmount = null, subtotal = null,
      specialInstructions = null, offerIds = [], manualDiscount = 0,
      offerDiscount: offerDiscountAmt = 0, selectedOfferName: offerName = '',
      totalDiscountAmount: discountTotal = 0,
      redeemLoyaltyPoints = 0, loyaltyDiscount: loyaltyDiscAmt = 0,
      serviceChargeRate = null, serviceChargeAmount: scAmount = null,
      tipAmount: tipAmt = null, tipPercentage: tipPct = null,
      cashReceived = null, changeReturned = null,
      splitPayments: splitPay = null, roundOffAmount: roundOff = null,
      partialPayAmount: partialPay = null,
      compItems: compData = null, voidItems: voidData = null,
      walletRedeemAmount: walletRedeem = null, walletCustomerId: walletCustId = null,
    } = taxData;
    return {
      taxBreakdown, totalTax, finalAmount, subtotal, specialInstructions,
      offerIds, manualDiscount, offerDiscountAmt, offerName, discountTotal,
      redeemLoyaltyPoints, loyaltyDiscAmt, serviceChargeRate, scAmount,
      tipAmt, tipPct, cashReceived, changeReturned, splitPay, roundOff,
      partialPay, compData, voidData, walletRedeem, walletCustId,
    };
  };

  // Build update payload (same structure as dashboard's processOrder / placeOrder)
  const buildUpdateData = (taxData, status) => {
    const d = extractTaxData(taxData);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const totalAmount = d.subtotal || getCartSubtotal(cart, {});
    const computedFinal = d.finalAmount || totalAmount + d.totalTax;

    const updateData = {
      items: cart.map(billingCartItemToOrderLine),
      orderType: order?.orderType || 'dine-in',
      paymentMethod: d.splitPay && d.splitPay.length > 1 ? 'split' : paymentMethod,
      totalAmount,
      taxBreakdown: d.taxBreakdown,
      taxAmount: d.totalTax,
      finalAmount: computedFinal,
      specialInstructions: d.specialInstructions || null,
      updatedAt: new Date().toISOString(),
      // Billing feature fields
      serviceChargeRate: d.serviceChargeRate || null,
      serviceChargeAmount: d.scAmount || null,
      tipAmount: d.tipAmt || null,
      tipPercentage: d.tipPct || null,
      cashReceived: d.cashReceived || null,
      changeReturned: d.changeReturned || null,
      splitPayments: d.splitPay || null,
      roundOffAmount: d.roundOff || null,
      partialPayAmount: d.partialPay || null,
      paidAmount: d.partialPay ? Math.round(Number(d.partialPay) * 100) / 100 : null,
      outstandingAmount: d.partialPay ? Math.round((computedFinal - Number(d.partialPay)) * 100) / 100 : null,
      compItems: d.compData || null,
      voidItems: d.voidData || null,
      // Discount/offer fields
      offerIds: d.offerIds && d.offerIds.length > 0 ? d.offerIds : [],
      manualDiscount: d.manualDiscount || 0,
      discountAmount: d.offerDiscountAmt || 0,
      offerDiscount: d.offerDiscountAmt || 0,
      totalDiscountAmount: d.discountTotal || 0,
      selectedOfferName: d.offerName || null,
      // Loyalty fields
      redeemLoyaltyPoints: d.redeemLoyaltyPoints || 0,
      loyaltyDiscount: d.loyaltyDiscAmt || 0,
      // Wallet — always explicit: exactly what this screen applied (null = not used here), so
      // the server charges the wallet (once, at billing) only for what the cashier saw.
      walletRedeemAmount: d.walletRedeem || null,
      walletCustomerId: d.walletRedeem ? (d.walletCustId || null) : null,
      // Customer & staff
      customerInfo: {
        name: customerName || order?.customerInfo?.name || '',
        phone: customerMobile || order?.customerInfo?.phone || null,
        tableNumber: tableNumber || order?.tableNumber || null,
      },
      customerId: order?.customerId || null,
      lastUpdatedBy: {
        name: currentUser.name || 'Staff',
        id: currentUser.id,
        role: currentUser.role || 'waiter',
      },
    };

    // Table number — always include for all statuses
    updateData.tableNumber = tableNumber || order?.tableNumber || null;

    // Status-specific fields
    if (status === 'completed') {
      updateData.status = 'completed';
      updateData.paymentStatus = d.partialPay ? 'partial' : 'paid';
      updateData.completedAt = new Date().toISOString();
    } else {
      updateData.status = status;
    }

    return { updateData, d, currentUser, computedFinal };
  };

  // Complete Billing — same API flow as dashboard processOrder
  const handleProcessOrder = async (taxData = {}) => {
    if (!order || processing) return;
    setProcessing(true);
    setError(null);

    try {
      const { updateData, d, currentUser, computedFinal } = buildUpdateData(taxData, 'completed');
      await apiClient.updateOrder(order.id, updateData);

      // Verify payment — same as dashboard
      await apiClient.verifyPayment({
        orderId: order.id,
        paymentMethod: d.splitPay && d.splitPay.length > 1 ? 'split' : paymentMethod,
        amount: d.partialPay ? Math.round(Number(d.partialPay) * 100) / 100 : computedFinal,
        userId: currentUser.id,
        restaurantId: order.restaurantId,
        paymentStatus: d.partialPay ? 'partial' : 'completed',
      });

      if (typeof window !== 'undefined' && window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'BILLING_COMPLETE', orderId: order.id, status: 'completed',
        }));
      }
      return { orderId: order.id };
    } catch (e) {
      console.error('Billing completion error:', e);
      setError('Billing failed: ' + (e.message || 'Unknown error'));
      throw e;
    } finally {
      setProcessing(false);
    }
  };

  // Save Order — same API flow as dashboard saveOrder
  const handleSaveOrder = async (taxData = {}) => {
    if (!order) return;
    setError(null);
    try {
      const { updateData } = buildUpdateData(taxData, 'saved');
      await apiClient.updateOrder(order.id, updateData);
      if (typeof window !== 'undefined' && window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'BILLING_COMPLETE', orderId: order.id, status: 'saved' }));
      }
    } catch (e) {
      setError('Save failed: ' + (e.message || 'Unknown error'));
    }
  };

  // Place Order (send to kitchen) — same API flow as dashboard placeOrder
  const handlePlaceOrder = async (taxData = {}) => {
    if (!order) return;
    setError(null);
    try {
      const { updateData } = buildUpdateData(taxData, 'confirmed');
      await apiClient.updateOrder(order.id, updateData);
      if (typeof window !== 'undefined' && window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'BILLING_COMPLETE', orderId: order.id, status: 'confirmed' }));
      }
    } catch (e) {
      setError('Place order failed: ' + (e.message || 'Unknown error'));
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
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
        error={error}
        getTotalAmount={() => getCartSubtotal(cart, {})}
        tableNumber={tableNumber}
        selectedTable={tableNumber ? { name: tableNumber } : null}
        customerName={customerName}
        customerMobile={customerMobile}
        orderLookup=""
        setOrderLookup={() => {}}
        currentOrder={null}
        setCurrentOrder={() => {}}
        onShowQRCode={() => {}}
        restaurantId={restaurantId}
        restaurantName={restaurant?.name || ''}
        taxSettings={taxSettings}
        printSettings={printSettings}
        menuItems={menuItems}
        onClose={handleClose}
        billingMode={false}
        posSettings={{ hideTableField: !!tableNumber }}
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
