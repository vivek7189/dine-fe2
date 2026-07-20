'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaSearch, FaSpinner, FaUtensils } from 'react-icons/fa';
import apiClient from '../lib/api';
import OrderSummary from './OrderSummary';
import MenuItemCard from './MenuItemCard';
import { sanitizeSeat, getOrderItemKey } from '../utils/orderItemKey';

/**
 * Edit Order modal — rebuilt to reuse the dashboard billing UI.
 * LEFT: searchable menu grid (MenuItemCard). RIGHT: <OrderSummary billingMode>
 * which computes offers/tax/loyalty/wallet/split internally and hands back a
 * single taxData object. Renders via createPortal so it sits above nav.
 */
const OrderEditModal = ({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  selectedRestaurant,
  onOrderUpdated,
  onOrderCompleted,
  mode = 'active',
  editReason = '',
  pinCode = '',
  // New optional props (orderhistory passes these; defaults keep it safe)
  menuItems = [],
  taxSettings,
  printSettings,
  billingSettings = {},
  multiPricingEnabled = false,
  pricingRules = [],
  activePricingRuleId = null,
  setActivePricingRuleId,
  upiSettings = {},
  whatsappConnected = false,
  countryCode = 'IN',
  businessType = 'restaurant',
  defaultTaxName = 'Tax',
}) => {
  const [order, setOrder] = useState(null);
  const [menuLoadedItems, setMenuLoadedItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalCart, setModalCart] = useState([]);
  const [modalPaymentMethod, setModalPaymentMethod] = useState('cash');
  const [modalCustomerName, setModalCustomerName] = useState('');
  const [modalCustomerMobile, setModalCustomerMobile] = useState('');
  const [activeSeat, setActiveSeat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const closeTimerRef = useRef(null);

  const seatOrderingEnabled =
    selectedRestaurant?.posSettings?.seatOrdering === 'optional' ||
    selectedRestaurant?.posSettings?.seatOrdering === 'required';

  // Effective menu: prefer the prop, fall back to a locally fetched menu
  const effectiveMenu = (menuItems && menuItems.length > 0) ? menuItems : menuLoadedItems;

  // Portal target + viewport size (client only)
  useEffect(() => {
    setMounted(true);
    const update = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768);
    update();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
  }, []);

  // Cleanup pending close timer on unmount
  useEffect(() => {
    return () => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current); };
  }, []);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  // Load order (+ menu fallback) when the modal opens
  useEffect(() => {
    if (!isOpen || !selectedRestaurant?.id || (!orderId && !orderNumber)) return;

    setOrder(null);
    setModalCart([]);
    setModalPaymentMethod('cash');
    setModalCustomerName('');
    setModalCustomerMobile('');
    setActiveSeat(null);
    setErrorMsg(null);
    setLoading(true);

    (async () => {
      try {
        // Menu fallback: only fetch when the prop is empty
        let liveMenu = (menuItems && menuItems.length > 0) ? menuItems : null;
        if (!liveMenu) {
          try {
            const menuRes = await apiClient.getMenu(selectedRestaurant.id);
            liveMenu = menuRes?.menuItems || [];
            setMenuLoadedItems(liveMenu);
          } catch (menuErr) {
            console.error('Error fetching menu for edit modal:', menuErr);
            liveMenu = [];
          }
        }

        // Load the order
        let response;
        if (orderId) {
          response = await apiClient.getOrderById(orderId);
        } else {
          response = await apiClient.getOrders(selectedRestaurant.id, { search: orderNumber, limit: 1 });
        }

        if (response?.orders && response.orders.length > 0) {
          const ord = response.orders[0];
          setOrder(ord);

          // Rehydrate order.items -> cart (preserves variant/customizations/seat,
          // refreshes price from live menu). Mirrors TableBillingModal.
          const cartItems = (ord.items || []).map(item => {
            const menuItem = liveMenu?.find(m => m.id === (item.menuItemId || item.id));
            // Preserve the price this SETTLED bill was actually billed at — do NOT
            // re-price existing lines to today's menu (that would silently change a
            // completed bill's total if menu prices changed since it was placed, or
            // revert a manually price-edited line). Variant price from the order,
            // then the stored line price, and menu price only as a last resort.
            const variantPriceVal = item.selectedVariant?.price;
            const refreshedPrice = variantPriceVal != null
              ? variantPriceVal
              : (item.price != null ? item.price : (menuItem?.price ?? 0));
            const itemBasePrice = variantPriceVal != null
              ? variantPriceVal
              : (item.basePrice != null ? item.basePrice : (item.price != null ? item.price : (menuItem?.price ?? 0)));
            return {
              id: item.menuItemId || item.id,
              name: menuItem?.name || item.name,
              price: refreshedPrice,
              quantity: item.quantity || 1,
              selectedVariant: item.selectedVariant,
              selectedCustomizations: item.selectedCustomizations,
              basePrice: itemBasePrice,
              isCustomItem: item.isCustomItem || false,
              // Carry the price-edit provenance so it isn't lost on re-save
              priceEdited: item.priceEdited === true,
              ...(item.menuPrice != null ? { menuPrice: item.menuPrice } : {}),
              pricingRules: menuItem?.pricingRules || item.pricingRules || {},
              category: item.category || menuItem?.category || '',
              taxGroupId: menuItem?.taxGroupId || item.taxGroupId || null,
              notes: item.notes || '',
              ...(item.seat != null ? { seat: item.seat } : {}),
              cartId: `${item.menuItemId || item.id}-${Date.now()}-${Math.random()}`
            };
          });
          setModalCart(cartItems);
          setModalPaymentMethod(ord.paymentMethod || 'cash');
          setModalCustomerName(ord.customerInfo?.name || '');
          setModalCustomerMobile(ord.customerInfo?.phone || '');
        } else {
          setErrorMsg('Order not found');
        }
      } catch (error) {
        console.error('Error fetching order for edit modal:', error);
        setErrorMsg('Failed to load order details');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, orderId, orderNumber, selectedRestaurant?.id, menuItems?.length]);

  // Derive category tabs from the effective menu
  const categories = useMemo(() => {
    const set = new Set(['All Items']);
    (effectiveMenu || []).forEach(item => { if (item.category) set.add(item.category); });
    return Array.from(set);
  }, [effectiveMenu]);

  const filteredMenuItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return (effectiveMenu || []).filter(item => {
      const matchesCategory = selectedCategory === 'All Items' || item.category === selectedCategory;
      const matchesSearch = !term ||
        (item.name && item.name.toLowerCase().includes(term)) ||
        (item.shortCode && item.shortCode.toLowerCase().includes(term));
      return matchesCategory && matchesSearch;
    });
  }, [effectiveMenu, selectedCategory, searchTerm]);

  // ---- Cart handlers (mirror dashboard) ----
  const addToCart = (itemRaw) => {
    if (!itemRaw) return;
    if (itemRaw.isAvailable === false) return;

    let item = itemRaw;
    // Seat-level ordering: stamp the active seat cursor on newly added items
    if (item.seat === undefined && seatOrderingEnabled && sanitizeSeat(activeSeat) !== null) {
      item = { ...item, seat: sanitizeSeat(activeSeat) };
    }

    setModalCart(prev => {
      const targetKey = getOrderItemKey(item);
      const idx = prev.findIndex(ci => getOrderItemKey(ci) === targetKey);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: (updated[idx].quantity || 0) + (item.quantity || 1),
        };
        return updated;
      }
      const cartId = `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      return [
        {
          ...item,
          quantity: item.quantity || 1,
          basePrice: typeof item.basePrice === 'number' ? item.basePrice : item.price,
          cartId,
        },
        ...prev,
      ];
    });
  };

  const removeFromCart = (itemId) => {
    setModalCart(prev => prev.map(ci =>
      (ci.cartId === itemId || ci.id === itemId)
        ? { ...ci, quantity: Math.max(0, (ci.quantity || 0) - 1) }
        : ci
    ).filter(ci => ci.quantity > 0));
  };

  const getItemQuantityInCart = (itemId) =>
    modalCart.filter(ci => ci.id === itemId).reduce((sum, ci) => sum + (ci.quantity || 0), 0);

  const getModalTotalAmount = () =>
    modalCart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const buildModalItemPayload = (item) => {
    const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
    const total = price * (item.quantity || 1);
    return {
      menuItemId: item.id || item.menuItemId,
      name: item.name,
      nameAr: item.nameAr || null,
      price,
      quantity: item.quantity || 1,
      total,
      notes: item.notes || '',
      seat: sanitizeSeat(item.seat),
      category: item.category || '',
      categoryId: item.categoryId || null,
      taxGroupId: item.taxGroupId || null,
      selectedVariant: item.selectedVariant || null,
      selectedCustomizations: Array.isArray(item.selectedCustomizations) ? item.selectedCustomizations : [],
      basePrice: typeof item.basePrice === 'number' ? item.basePrice : price,
      priceEdited: item.priceEdited === true,
      ...(item.isCustomItem ? { isCustomItem: true } : {}),
    };
  };

  const isManualPrintEnabled = () => printSettings?.manualPrintEnabled !== false;

  const handleClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setOrder(null);
    setModalCart([]);
    setSaving(false);
    onClose?.();
  };

  // ---- Save (baseline copied from TableBillingModal.handleModalProcessOrder) ----
  const handleSave = async (taxData = {}) => {
    if (!order || !selectedRestaurant?.id || saving) return;

    setSaving(true);
    setErrorMsg(null);

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
      splitBill, ecrResponse,
    } = taxData;

    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

      const paymentAmount = finalAmount ?? order.finalAmount ?? order.totalAmount ?? getModalTotalAmount();
      const isFullDue = fullDue === true || (partialPayAmount != null && partialPayAmount === 0);
      const isPartialPayment = !isFullDue && partialPayAmount && partialPayAmount > 0 && partialPayAmount < paymentAmount;

      // The backend PATCH blocks updating a completed/cancelled order unless the
      // payload re-sends status:'completed'. For an already-completed order we
      // re-bill with the edits; for an active order we must NOT force completion
      // (that would prematurely bill it) — leave status/payment fields untouched.
      const isCompletedOrder = mode === 'completed' || order?.status === 'completed';
      // Distinguish "editing an order that was ALREADY completed" from "completing
      // for the first time". For an already-completed bill we re-bill the edits
      // but must NOT re-record payment (duplicate payment doc + clobbers a split
      // method down to 'cash') nor re-date completedAt.
      const wasAlreadyCompleted = order?.status === 'completed';
      // Khata safety: editing an already-completed DUE/PARTIAL bill without an
      // explicit re-payment must keep it due (else OrderSummary defaulting to
      // "paid" would mark the khata collected while the customer's outstanding
      // balance is never decremented). Re-derive outstanding from the new total.
      const wasUnpaid = order?.paymentStatus === 'due' || order?.paymentStatus === 'partial';
      const explicitRepay = partialPayAmount != null || fullDue === true;
      const preserveDue = wasAlreadyCompleted && wasUnpaid && !explicitRepay;
      const preservedPaid = preserveDue ? (Number(order?.paidAmount) || 0) : 0;
      const preservedOutstanding = preserveDue
        ? Math.round(Math.max(0, paymentAmount - preservedPaid) * 100) / 100
        : 0;

      const updateData = {
        // Edited items MUST be sent so item changes persist (both modes)
        items: modalCart.map(buildModalItemPayload),
        // Audit trail for the edit
        editReason: editReason || null,
        ...(pinCode ? { pinCode } : {}),
        status: isCompletedOrder ? 'completed' : (order?.status || undefined),
        paymentStatus: preserveDue
          ? order.paymentStatus
          : (isCompletedOrder
            ? (isFullDue ? 'due' : (isPartialPayment ? 'partial' : 'paid'))
            : (order?.paymentStatus || undefined)),
        // Persist the full-due flag so the due state survives future round-trips
        fullDue: preserveDue ? (order.paymentStatus === 'due') : isFullDue,
        paymentMethod: splitPayments ? 'split' : modalPaymentMethod,
        completedAt: wasAlreadyCompleted
          ? (order?.completedAt || new Date().toISOString())
          : (isCompletedOrder ? new Date().toISOString() : (order?.completedAt || undefined)),
        updatedAt: new Date().toISOString(),
        // Always persist totals (mirror dashboard) — otherwise a tax-free / 0%
        // order keeps its stale finalAmount/totalAmount after an edit because
        // taxBreakdown is empty. taxAmount is 0 when there's no tax.
        totalAmount: subtotal ?? getModalTotalAmount(),
        taxBreakdown: taxBreakdown || [],
        taxAmount: totalTax || 0,
        finalAmount: finalAmount ?? paymentAmount,
        // Send SC / tip / round-off / cash unconditionally (|| null) so REMOVING
        // them during an edit clears the prior values instead of leaving stale ones.
        serviceChargeAmount: serviceChargeAmount || null,
        serviceChargeRate: serviceChargeRate || null,
        ...(serviceChargeEnabled != null && { serviceChargeEnabled }),
        tipAmount: tipAmount || null,
        tipPercentage: tipPercentage || null,
        cashReceived: cashReceived || null,
        changeReturned: changeReturned || null,
        ...(splitPayments && { splitPayments }),
        // Parity with dashboard billing: persist split-among-guests + card-terminal response
        ...(splitBill && { splitBill }),
        ...(ecrResponse && { ecrResponse }),
        roundOffAmount: roundOffAmount || null,
        ...(compItems && { compItems }),
        ...(voidItems && { voidItems }),
        ...(preserveDue && {
          paidAmount: preservedPaid,
          outstandingAmount: preservedOutstanding,
        }),
        ...(!preserveDue && isFullDue && {
          partialPayAmount: 0,
          paidAmount: 0,
          outstandingAmount: Math.round(paymentAmount * 100) / 100,
        }),
        ...(!preserveDue && isPartialPayment && {
          partialPayAmount,
          paidAmount: partialPayAmount,
          outstandingAmount: Math.round((paymentAmount - partialPayAmount) * 100) / 100,
        }),
        // Discount fields — always include so zeros can clear previous values
        manualDiscount: manualDiscount || 0,
        manualDiscountType: manualDiscountType || null,
        manualDiscountValue: manualDiscountValue != null ? manualDiscountValue : null,
        offerDiscount: offerDiscount || 0,
        // Mirror the dashboard-billing payload: the backend "POS override" reads
        // the offer discount from `discountAmount`. Without this, an edited bill
        // stored discountAmount=0 while finalAmount reflected the offer — so the
        // revised receipt showed subtotal 40 / total 31 with no discount line.
        discountAmount: offerDiscount || 0,
        offerIds: offerIds && offerIds.length > 0 ? offerIds : [],
        selectedOfferName: selectedOfferName || null,
        totalDiscountAmount: totalDiscountAmount || 0,
        specialInstructions: specialInstructions || null,
        redeemLoyaltyPoints: redeemLoyaltyPoints || 0,
        loyaltyDiscount: loyaltyDiscount || 0,
        couponDiscount: couponDiscount || null,
        couponCode: couponCode || null,
        couponId: couponId || null,
        walletRedeemAmount: walletRedeemAmount || null,
        walletCustomerId: walletCustomerId || null,
        deliveryInfo: deliveryInfoData || order.deliveryInfo || null,
        deliveryAddress: deliveryAddrData || order.deliveryAddress || null,
        managerPin: managerPin || null,
        taxInclusiveMode: taxInclusiveMode || null,
        customerId: order.customerId || null,
        customerInfo: {
          name: modalCustomerName || order.customerInfo?.name || '',
          phone: modalCustomerMobile || order.customerInfo?.phone || null,
          tableNumber: order.tableNumber || null,
          // Preserve hotel/room + floor context on edit (parity with dashboard)
          roomNumber: order.roomNumber || order.customerInfo?.roomNumber || null,
          floorName: order.floorName || order.customerInfo?.floorName || null,
        },
        lastUpdatedBy: {
          name: currentUser.name || 'Staff',
          id: currentUser.id,
          role: currentUser.role || 'waiter'
        }
      };

      const completedOrderId = order.id;

      await apiClient.updateOrder(completedOrderId, updateData);

      // Record/verify payment ONLY on a FIRST completion. Editing an
      // already-completed bill must not re-verify (that mints a duplicate payment
      // record and collapses a split method to 'cash'); the PATCH already persisted
      // the updated billing state, and the delta is captured by the edit history /
      // auto-refund fields. Skip for split payments too.
      if (isCompletedOrder && !wasAlreadyCompleted && !splitPayments) {
        const safePaymentMethod = ['cash', 'card', 'upi'].includes(modalPaymentMethod) ? modalPaymentMethod : 'cash';

        await apiClient.verifyPayment({
          orderId: completedOrderId,
          paymentMethod: safePaymentMethod,
          amount: isPartialPayment ? partialPayAmount : paymentAmount,
          userId: currentUser.id,
          restaurantId: selectedRestaurant.id,
          paymentStatus: isPartialPayment ? 'partial' : 'completed'
        });
      }

      if (isCompletedOrder && !isManualPrintEnabled()) {
        try {
          await apiClient.requestManualPrint(completedOrderId, 'bill');
        } catch (printError) {
          console.error('Auto-print failed:', printError);
        }
      }

      // Re-fetch the saved order so the caller updates its list with the fresh
      // totals, incremented editCount and new editHistory entry (the local `order`
      // is the pre-edit snapshot; passing it would leave "Revised #N" stale).
      let refreshedOrder = order;
      try {
        const refetch = await apiClient.getOrderById(completedOrderId);
        if (refetch?.orders?.[0]) refreshedOrder = refetch.orders[0];
      } catch (_) { /* non-fatal — fall back to the pre-edit order */ }
      onOrderUpdated?.(refreshedOrder);
      onOrderCompleted?.(refreshedOrder);

      // Delay close so OrderSummary can generate the invoice + auto-print fires
      const isRNWebView = typeof window !== 'undefined' && !!window.ReactNativeWebView;
      const wantsPrint = (typeof window !== 'undefined' && !!window.__autoPrintBill) ||
        !!printSettings?.autoPrintOnCompleteBilling ||
        (isRNWebView && !!printSettings?.autoPrintOnBilling);
      closeTimerRef.current = setTimeout(() => handleClose(), wantsPrint ? 3000 : 500);

      return { orderId: completedOrderId };
    } catch (error) {
      console.error('Order edit save error:', error);
      setSaving(false);
      setErrorMsg('Save failed: ' + (error.message || 'Unknown error'));
    }
  };

  if (!isOpen || !mounted) return null;

  const posSettingsForSummary = {
    ...(selectedRestaurant?.posSettings || {}),
    completeBillingLabel: 'Save Changes',
  };

  const modalContent = (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 99999, padding: 0,
      }}
      onClick={handleClose}
    >
      <style>{`
        @keyframes editModalSlideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .edit-modal-panel { animation: editModalSlideUp 0.25s cubic-bezier(0.22, 0.61, 0.36, 1); }
        .edit-modal-body { display: flex; flex-direction: row; }
        .edit-modal-left { flex: 1.3; min-width: 0; }
        .edit-modal-right { flex: 1; min-width: 380px; }
        @media (max-width: 768px) {
          .edit-modal-panel {
            max-width: 100% !important; width: 100% !important;
            height: 100dvh !important; max-height: 100dvh !important;
            border-radius: 0 !important;
          }
          .edit-modal-header { border-radius: 0 !important; }
          .edit-modal-body { flex-direction: column; }
          .edit-modal-left, .edit-modal-right { flex: none; width: 100%; min-width: 0; }
          .edit-modal-left { height: 42%; }
          .edit-modal-right { height: 58%; }
        }
      `}</style>
      <div
        className="edit-modal-panel"
        style={{
          background: '#fff', borderRadius: '14px',
          width: '96vw', maxWidth: '1100px', height: '92vh', maxHeight: '92vh',
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.05)',
          display: 'flex', flexDirection: 'column', position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="edit-modal-header" style={{
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderRadius: '14px 14px 0 0', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <FaUtensils size={14} style={{ color: '#fff' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                Order #{order?.dailyOrderId || order?.id?.slice(-6) || orderNumber || '—'} — Edit
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', marginTop: '1px' }}>
                {order?.tableNumber ? `Table ${order.tableNumber}` : (mode === 'completed' ? 'Completed order' : 'Active order')}
                {order?.status ? ` · ${order.status}` : ''}
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              width: '32px', height: '32px', borderRadius: '50%', border: 'none',
              background: 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '14px',
          }}>
            <FaSpinner className="animate-spin" size={24} style={{ color: '#dc2626' }} />
            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Loading order...</div>
          </div>
        ) : !order ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: '40px',
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', background: '#f3f4f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
            }}>
              <FaUtensils size={22} style={{ color: '#9ca3af' }} />
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>{errorMsg || 'No order found'}</div>
          </div>
        ) : (
          <div className="edit-modal-body" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            {/* LEFT: menu grid */}
            <div className="edit-modal-left" style={{
              display: 'flex', flexDirection: 'column', borderRight: '1px solid #e5e7eb', minHeight: 0,
            }}>
              {/* Search + categories (sticky) */}
              <div style={{ padding: '12px 14px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
                <div style={{ position: 'relative', marginBottom: '10px' }}>
                  <FaSearch style={{
                    position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                    color: '#9ca3af', fontSize: '13px',
                  }} />
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%', padding: '9px 12px 9px 34px',
                      border: '1px solid #e5e7eb', borderRadius: '10px',
                      fontSize: '14px', outline: 'none',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      style={{
                        padding: '5px 12px', borderRadius: '999px',
                        fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer',
                        border: 'none',
                        background: selectedCategory === category ? '#dc2626' : '#f3f4f6',
                        color: selectedCategory === category ? '#fff' : '#374151',
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', minHeight: 0 }}>
                {filteredMenuItems.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '10px',
                  }}>
                    {filteredMenuItems.map(item => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        quantityInCart={getItemQuantityInCart(item.id)}
                        onAddToCart={addToCart}
                        onRemoveFromCart={removeFromCart}
                        onItemClick={addToCart}
                        isMobile={isMobile}
                        useModernDesign={true}
                        cardSize="standard"
                        hideImages={selectedRestaurant?.posSettings?.hideMenuImages}
                      />
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 0', fontSize: '13px' }}>
                    No menu items found
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: OrderSummary */}
            <div className="edit-modal-right" style={{
              display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'auto',
            }}>
              {errorMsg && (
                <div style={{
                  margin: '10px 12px 0', padding: '10px 12px', borderRadius: '8px',
                  background: '#fee2e2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '13px',
                }}>
                  {errorMsg}
                </div>
              )}
              <OrderSummary
                cart={modalCart}
                setCart={setModalCart}
                orderType={order.orderType || 'dine-in'}
                setOrderType={() => {}}
                paymentMethod={modalPaymentMethod}
                setPaymentMethod={setModalPaymentMethod}
                onClearCart={() => {}}
                onProcessOrder={handleSave}
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
                processing={saving}
                placingOrder={false}
                orderSuccess={false}
                setOrderSuccess={() => {}}
                error={null}
                getTotalAmount={getModalTotalAmount}
                tableNumber={order.tableNumber || ''}
                selectedTable={{
                  id: null,
                  name: order.tableNumber || '',
                  floor: order.floorName || null,
                  floorId: order.floorId || null,
                }}
                customerName={modalCustomerName}
                customerMobile={modalCustomerMobile}
                orderLookup=""
                setOrderLookup={() => {}}
                currentOrder={order}
                setCurrentOrder={() => {}}
                onShowQRCode={() => {}}
                restaurantId={selectedRestaurant?.id}
                restaurantName={selectedRestaurant?.name || ''}
                taxSettings={taxSettings}
                printSettings={printSettings}
                menuItems={effectiveMenu}
                onClose={handleClose}
                billingMode={true}
                allowCompletedEdit={true}
                billingSettings={billingSettings}
                multiPricingEnabled={multiPricingEnabled}
                pricingRules={pricingRules}
                activePricingRuleId={activePricingRuleId}
                setActivePricingRuleId={setActivePricingRuleId || (() => {})}
                countryCode={countryCode}
                businessType={businessType}
                defaultTaxName={defaultTaxName}
                upiSettings={upiSettings}
                whatsappConnected={whatsappConnected}
                posSettings={posSettingsForSummary}
                seatOrderingEnabled={seatOrderingEnabled}
                activeSeat={activeSeat}
                setActiveSeat={setActiveSeat}
                userRole={(() => { try { return JSON.parse(localStorage.getItem('user') || '{}').role || 'waiter'; } catch { return 'waiter'; } })()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default OrderEditModal;
