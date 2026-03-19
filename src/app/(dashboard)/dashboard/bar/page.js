'use client';

import { useState, useEffect, useCallback, useRef, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '../../../../lib/api';
import { t } from '../../../../lib/i18n';
import { useCurrency } from '../../../../contexts/CurrencyContext';
import MenuItemCard from '../../../../components/MenuItemCard';
import Notification from '../../../../components/Notification';
import {
  FaPlus,
  FaMinus,
  FaTimes,
  FaSearch,
  FaSpinner,
  FaMoneyBillWave,
  FaCreditCard,
  FaCheckCircle,
  FaPrint,
  FaClock,
  FaReceipt,
  FaGlassMartiniAlt,
  FaUser,
  FaTrash,
  FaBars,
  FaSave,
  FaUtensils,
  FaPhone,
  FaClipboardList,
  FaChair,
  FaFire,
  FaUsers
} from 'react-icons/fa';

function BarPOSContent() {
  const router = useRouter();
  const { formatCurrency, getCurrencySymbol } = useCurrency();

  // Core state
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Tabs (open saved orders)
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [loadingTabs, setLoadingTabs] = useState(false);

  // Menu
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all-items');
  const [searchTerm, setSearchTerm] = useState('');

  // Settings
  const [taxSettings, setTaxSettings] = useState(null);
  const [printSettings, setPrintSettings] = useState(null);

  // UI state
  const [showNewTabDialog, setShowNewTabDialog] = useState(false);
  const [newTabName, setNewTabName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [processing, setProcessing] = useState(false);
  const [creatingTab, setCreatingTab] = useState(false);
  const [savingTab, setSavingTab] = useState(false);
  const [editingQty, setEditingQty] = useState(null); // { menuItemId, value }
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');

  // Loyalty & Offers
  const [customerData, setCustomerData] = useState(null);
  const [loyaltySettings, setLoyaltySettings] = useState(null);
  const [redeemLoyaltyPoints, setRedeemLoyaltyPoints] = useState(0);
  const [availableOffers, setAvailableOffers] = useState([]);
  const [selectedOfferId, setSelectedOfferId] = useState('');
  const [manualDiscount, setManualDiscount] = useState(0);
  const [manualDiscountType, setManualDiscountType] = useState('flat'); // 'flat' or 'percentage'

  // Print refs
  const printWindowRef = useRef(null);

  // Debounce ref for rapid item additions
  const updateTimerRef = useRef(null);
  const pendingUpdateRef = useRef(null);

  // Keep a ref of activeTabId so callbacks always read the latest value
  const activeTabIdRef = useRef(activeTabId);
  activeTabIdRef.current = activeTabId;

  // Keep a ref of tabs so callbacks always read the latest value
  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;

  // Active tab object
  const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId) || null, [tabs, activeTabId]);

  // Auto-select first tab when tabs load and nothing is selected
  useEffect(() => {
    if (tabs.length > 0 && !activeTabId) {
      setActiveTabId(tabs[0].id);
    }
  }, [tabs, activeTabId]);

  // Sync customer info fields when active tab changes
  useEffect(() => {
    if (activeTab) {
      setCustomerName(activeTab.customerInfo?.name || '');
      setCustomerPhone(activeTab.customerInfo?.phone || '');
    } else {
      setCustomerName('');
      setCustomerPhone('');
    }
    // Reset loyalty/discount state on tab switch
    setCustomerData(null);
    setRedeemLoyaltyPoints(0);
    setSelectedOfferId('');
    setManualDiscount(0);
  }, [activeTabId, activeTab]);

  // Redirect non-bar restaurants
  useEffect(() => {
    if (selectedRestaurant && selectedRestaurant.businessType !== 'bar') {
      router.replace('/dashboard');
    }
  }, [selectedRestaurant, router]);

  // Auth check + load restaurant
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const saved = localStorage.getItem('selectedRestaurant');
      if (saved) {
        setSelectedRestaurant(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading restaurant:', e);
    }
    setLoading(false);
  }, [router]);

  // Listen for restaurant changes
  useEffect(() => {
    const handler = () => {
      try {
        const saved = localStorage.getItem('selectedRestaurant');
        if (saved) setSelectedRestaurant(JSON.parse(saved));
      } catch (e) {
        console.error('Error on restaurant change:', e);
      }
    };
    window.addEventListener('restaurantChanged', handler);
    return () => window.removeEventListener('restaurantChanged', handler);
  }, []);

  // Load data when restaurant changes
  useEffect(() => {
    if (!selectedRestaurant?.id) return;
    loadMenu(selectedRestaurant.id);
    loadTaxSettings(selectedRestaurant.id);
    loadPrintSettings(selectedRestaurant.id);
    fetchOpenTabs(selectedRestaurant.id);
    loadLoyaltyAndOffers(selectedRestaurant.id);
  }, [selectedRestaurant?.id]);

  // ─── Data Loading ───────────────────────────────────────

  const loadMenu = async (restaurantId) => {
    try {
      const response = await apiClient.getMenu(restaurantId);
      setMenuItems(response.menuItems || []);
    } catch (err) {
      console.error('Failed to load menu:', err);
    }
  };

  const loadTaxSettings = async (restaurantId) => {
    try {
      const response = await apiClient.getTaxSettings(restaurantId);
      if (response.success) setTaxSettings(response.taxSettings);
    } catch (err) {
      console.error('Failed to load tax settings:', err);
    }
  };

  const loadPrintSettings = async (restaurantId) => {
    try {
      const response = await apiClient.getPrintSettings(restaurantId);
      if (response.success) setPrintSettings(response.printSettings);
    } catch (err) {
      console.error('Failed to load print settings:', err);
    }
  };

  const loadLoyaltyAndOffers = async (restaurantId) => {
    try {
      const [settingsRes, offersRes] = await Promise.all([
        apiClient.getPublicCustomerAppSettings(restaurantId).catch(() => null),
        apiClient.request(`/api/offers/${restaurantId}`).catch(() => ({ offers: [] }))
      ]);
      if (settingsRes?.settings?.loyaltySettings) {
        setLoyaltySettings(settingsRes.settings.loyaltySettings);
      }
      const activeOffers = (offersRes?.offers || []).filter(o => o.isActive);
      setAvailableOffers(activeOffers);
    } catch (err) {
      console.error('Failed to load loyalty/offers:', err);
    }
  };

  const lookupCustomer = async (phone) => {
    if (!phone?.trim() || !selectedRestaurant?.id) return;
    try {
      const response = await apiClient.lookupCustomerByPhone(selectedRestaurant.id, phone.trim());
      if (response?.found && response.customer) {
        setCustomerData(response.customer);
        if (!customerName && response.customer.name) {
          setCustomerName(response.customer.name);
        }
      } else {
        setCustomerData(null);
      }
    } catch (err) {
      console.error('Customer lookup failed:', err);
      setCustomerData(null);
    }
  };

  const getOfferDiscount = () => {
    if (!selectedOfferId || !activeTab?.items?.length) return 0;
    const offer = availableOffers.find(o => o.id === selectedOfferId);
    if (!offer) return 0;
    const subtotal = (activeTab.items || []).reduce((sum, i) => sum + i.price * i.quantity, 0);
    if (subtotal < (offer.minOrderValue || 0)) return 0;
    let discount = 0;
    if (offer.discountType === 'percentage') {
      discount = (subtotal * offer.discountValue) / 100;
      if (offer.maxDiscount && discount > offer.maxDiscount) discount = offer.maxDiscount;
    } else {
      discount = Math.min(offer.discountValue, subtotal);
    }
    return Math.round(discount * 100) / 100;
  };

  const getManualDiscountAmount = () => {
    if (!manualDiscount || !activeTab?.items?.length) return 0;
    const subtotal = (activeTab.items || []).reduce((sum, i) => sum + i.price * i.quantity, 0);
    if (manualDiscountType === 'percentage') {
      return Math.round((subtotal * manualDiscount / 100) * 100) / 100;
    }
    return Math.min(manualDiscount, subtotal);
  };

  const getLoyaltyDiscount = () => {
    if (!loyaltySettings?.enabled || !customerData || !redeemLoyaltyPoints) return 0;
    const subtotal = (activeTab?.items || []).reduce((sum, i) => sum + i.price * i.quantity, 0);
    const afterDiscounts = subtotal - getOfferDiscount() - getManualDiscountAmount();
    const redemptionRate = loyaltySettings.redemptionRate || 100;
    const maxRedemptionPercent = loyaltySettings.maxRedemptionPercent || 20;
    const maxFromPercent = (afterDiscounts * maxRedemptionPercent) / 100;
    const maxFromPoints = redeemLoyaltyPoints / redemptionRate;
    return Math.round(Math.min(maxFromPercent, maxFromPoints, afterDiscounts) * 100) / 100;
  };

  const fetchOpenTabs = async (restaurantId) => {
    setLoadingTabs(true);
    try {
      const response = await apiClient.getOrders(restaurantId, { status: 'saved', limit: 50 });
      if (response.orders) {
        const sorted = response.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTabs(sorted);
      }
    } catch (err) {
      console.error('Failed to fetch tabs:', err);
    } finally {
      setLoadingTabs(false);
    }
  };

  // ─── Tax Calculation ────────────────────────────────────

  const calculateTax = useCallback((subtotal) => {
    if (!taxSettings?.enabled || subtotal === 0) return { taxBreakdown: [], totalTax: 0 };
    const taxes = [];
    let total = 0;
    if (taxSettings.taxes?.length > 0) {
      taxSettings.taxes.forEach(tax => {
        if (tax.enabled) {
          const amount = subtotal * (tax.rate / 100);
          taxes.push({ name: tax.name, rate: tax.rate, amount });
          total += amount;
        }
      });
    } else if (taxSettings.defaultTaxRate) {
      const amount = subtotal * (taxSettings.defaultTaxRate / 100);
      taxes.push({ name: 'GST', rate: taxSettings.defaultTaxRate, amount });
      total = amount;
    }
    return { taxBreakdown: taxes, totalTax: total };
  }, [taxSettings]);

  // ─── Tab Functions ──────────────────────────────────────

  const openTab = async () => {
    if (!selectedRestaurant?.id) return;
    setCreatingTab(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const tabName = newTabName.trim() || ''; // Empty = auto-numbered by backend
      const orderData = {
        restaurantId: selectedRestaurant.id,
        tableNumber: null,
        items: [],
        orderType: 'dine-in',
        paymentMethod: 'cash',
        status: 'saved',
        totalAmount: 0,
        taxBreakdown: [],
        taxAmount: 0,
        finalAmount: 0,
        customerInfo: tabName ? { name: tabName } : null,
        staffInfo: {
          userId: user.id,
          name: user.name || 'Staff',
          loginId: user.loginId || user.phone || user.id,
          phone: user.phone,
          role: user.role || 'waiter'
        }
      };
      const response = await apiClient.createOrder(orderData);
      if (response.order) {
        setTabs(prev => [response.order, ...prev]);
        setActiveTabId(response.order.id);
        setShowNewTabDialog(false);
        setNewTabName('');
        showNotification('Tab opened!', 'success');
      }
    } catch (err) {
      console.error('Failed to open tab:', err);
      showNotification('Failed to open tab: ' + err.message, 'error');
    } finally {
      setCreatingTab(false);
    }
  };

  const addItemToTab = useCallback((menuItem) => {
    const currentTabId = activeTabIdRef.current;
    const currentTabs = tabsRef.current;

    if (!currentTabId) {
      showNotification('Select or open a tab first', 'error');
      return;
    }
    const tab = currentTabs.find(t => t.id === currentTabId);
    if (!tab) return;

    const existingItems = tab.items || [];
    const existingIdx = existingItems.findIndex(i => i.menuItemId === menuItem.id);
    let updatedItems;
    if (existingIdx >= 0) {
      updatedItems = existingItems.map((item, idx) =>
        idx === existingIdx ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedItems = [...existingItems, {
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        notes: ''
      }];
    }

    const subtotal = updatedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const { taxBreakdown, totalTax } = calculateTax(subtotal);

    // Optimistic local update
    setTabs(prev => prev.map(t => t.id === currentTabId ? {
      ...t,
      items: updatedItems,
      totalAmount: subtotal,
      taxBreakdown,
      taxAmount: totalTax,
      finalAmount: subtotal + totalTax
    } : t));

    // Debounced API call
    const updateData = {
      items: updatedItems,
      totalAmount: subtotal,
      taxBreakdown,
      taxAmount: totalTax,
      finalAmount: subtotal + totalTax
    };
    pendingUpdateRef.current = { tabId: currentTabId, data: updateData };
    if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
    updateTimerRef.current = setTimeout(async () => {
      const pending = pendingUpdateRef.current;
      if (pending) {
        try {
          await apiClient.updateOrder(pending.tabId, pending.data);
        } catch (err) {
          console.error('Failed to update tab:', err);
        }
        pendingUpdateRef.current = null;
      }
    }, 300);
  }, [calculateTax]);

  const updateItemQuantity = useCallback((menuItemId, delta) => {
    const currentTabId = activeTabIdRef.current;
    const currentTabs = tabsRef.current;
    if (!currentTabId) return;
    const tab = currentTabs.find(t => t.id === currentTabId);
    if (!tab) return;

    let updatedItems = (tab.items || []).map(item => {
      if (item.menuItemId === menuItemId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean);

    const subtotal = updatedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const { taxBreakdown, totalTax } = calculateTax(subtotal);

    setTabs(prev => prev.map(t => t.id === currentTabId ? {
      ...t,
      items: updatedItems,
      totalAmount: subtotal,
      taxBreakdown,
      taxAmount: totalTax,
      finalAmount: subtotal + totalTax
    } : t));

    const updateData = { items: updatedItems, totalAmount: subtotal, taxBreakdown, taxAmount: totalTax, finalAmount: subtotal + totalTax };
    pendingUpdateRef.current = { tabId: currentTabId, data: updateData };
    if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
    updateTimerRef.current = setTimeout(async () => {
      const pending = pendingUpdateRef.current;
      if (pending) {
        try { await apiClient.updateOrder(pending.tabId, pending.data); } catch (err) { console.error('Failed to update tab:', err); }
        pendingUpdateRef.current = null;
      }
    }, 300);
  }, [calculateTax]);

  const setItemQuantity = useCallback((menuItemId, newQty) => {
    const currentTabId = activeTabIdRef.current;
    const currentTabs = tabsRef.current;
    if (!currentTabId) return;
    const tab = currentTabs.find(t => t.id === currentTabId);
    if (!tab) return;

    let updatedItems;
    if (newQty <= 0) {
      updatedItems = (tab.items || []).filter(item => item.menuItemId !== menuItemId);
    } else {
      updatedItems = (tab.items || []).map(item =>
        item.menuItemId === menuItemId ? { ...item, quantity: newQty } : item
      );
    }

    const subtotal = updatedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const { taxBreakdown, totalTax } = calculateTax(subtotal);

    setTabs(prev => prev.map(t => t.id === currentTabId ? {
      ...t,
      items: updatedItems,
      totalAmount: subtotal,
      taxBreakdown,
      taxAmount: totalTax,
      finalAmount: subtotal + totalTax
    } : t));

    const updateData = { items: updatedItems, totalAmount: subtotal, taxBreakdown, taxAmount: totalTax, finalAmount: subtotal + totalTax };
    pendingUpdateRef.current = { tabId: currentTabId, data: updateData };
    if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
    updateTimerRef.current = setTimeout(async () => {
      const pending = pendingUpdateRef.current;
      if (pending) {
        try { await apiClient.updateOrder(pending.tabId, pending.data); } catch (err) { console.error('Failed to update tab:', err); }
        pendingUpdateRef.current = null;
      }
    }, 300);
  }, [calculateTax]);

  const closeTab = async () => {
    if (!activeTabId || !selectedRestaurant?.id) return;
    const tab = tabs.find(t => t.id === activeTabId);
    if (!tab || !tab.items?.length) return;

    setProcessing(true);
    try {
      // Flush any pending update first
      if (pendingUpdateRef.current && pendingUpdateRef.current.tabId === activeTabId) {
        if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
        await apiClient.updateOrder(pendingUpdateRef.current.tabId, pendingUpdateRef.current.data);
        pendingUpdateRef.current = null;
      }

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const subtotal = (tab.items || []).reduce((sum, i) => sum + i.price * i.quantity, 0);

      // Calculate discounts
      const offerDiscountAmt = getOfferDiscount();
      const manualDiscountAmt = getManualDiscountAmount();
      const loyaltyDiscountAmt = getLoyaltyDiscount();
      const totalDiscount = offerDiscountAmt + manualDiscountAmt + loyaltyDiscountAmt;
      const afterDiscount = Math.max(0, subtotal - totalDiscount);
      const { taxBreakdown, totalTax } = calculateTax(afterDiscount);

      // Step 1: Update order to completed with discounts
      const updatePayload = {
        items: tab.items,
        status: 'completed',
        paymentStatus: 'paid',
        paymentMethod,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalAmount: subtotal,
        discountAmount: Math.round(totalDiscount * 100) / 100,
        offerDiscount: offerDiscountAmt > 0 ? { offerId: selectedOfferId, amount: offerDiscountAmt, offerName: availableOffers.find(o => o.id === selectedOfferId)?.name || '' } : null,
        manualDiscount: manualDiscountAmt > 0 ? { type: manualDiscountType, value: manualDiscount, amount: manualDiscountAmt } : null,
        loyaltyDiscount: loyaltyDiscountAmt > 0 ? { pointsRedeemed: redeemLoyaltyPoints, amount: loyaltyDiscountAmt } : null,
        taxBreakdown,
        taxAmount: totalTax,
        finalAmount: Math.round((afterDiscount + totalTax) * 100) / 100,
        lastUpdatedBy: { name: user.name, id: user.id, role: user.role }
      };
      await apiClient.updateOrder(activeTabId, updatePayload);

      // Step 2: Verify payment
      await apiClient.verifyPayment({
        orderId: activeTabId,
        paymentMethod,
        amount: subtotal + totalTax,
        userId: user.id,
        restaurantId: selectedRestaurant.id,
        paymentStatus: 'completed'
      });

      // Step 3: Print bill
      if (printSettings?.showBillSummaryAfterBilling !== false) {
        printBill(tab, subtotal, taxBreakdown, totalTax, { offerDiscount: offerDiscountAmt, manualDiscount: manualDiscountAmt, loyaltyDiscount: loyaltyDiscountAmt, totalDiscount });
      }
      // Server print (only if KOT printer is explicitly enabled)
      if (printSettings?.kotPrinterEnabled === true) {
        try { await apiClient.requestManualPrint(activeTabId, 'bill'); } catch (e) { /* silent */ }
      }

      // Step 4: Remove from local state
      setTabs(prev => prev.filter(t => t.id !== activeTabId));
      setActiveTabId(null);
      showNotification('Tab settled!', 'success');
    } catch (err) {
      console.error('Failed to close tab:', err);
      showNotification('Failed to close tab: ' + err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const saveTab = async () => {
    if (!activeTabId) return;
    setSavingTab(true);
    try {
      // Flush any pending update first
      if (pendingUpdateRef.current && pendingUpdateRef.current.tabId === activeTabId) {
        if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
        await apiClient.updateOrder(pendingUpdateRef.current.tabId, pendingUpdateRef.current.data);
        pendingUpdateRef.current = null;
      }
      // Update customer info if changed
      const tab = tabsRef.current.find(t => t.id === activeTabId);
      if (tab) {
        await apiClient.updateOrder(activeTabId, {
          customerInfo: { name: customerName || tab.customerInfo?.name || '', phone: customerPhone || '' }
        });
        setTabs(prev => prev.map(t => t.id === activeTabId ? {
          ...t,
          customerInfo: { ...t.customerInfo, name: customerName || t.customerInfo?.name, phone: customerPhone }
        } : t));
      }
      showNotification('Tab saved!', 'success');
    } catch (err) {
      console.error('Failed to save tab:', err);
      showNotification('Failed to save tab', 'error');
    } finally {
      setSavingTab(false);
    }
  };

  const deleteTab = async (tabId) => {
    try {
      await apiClient.updateOrder(tabId, { status: 'cancelled' });
      setTabs(prev => prev.filter(t => t.id !== tabId));
      if (activeTabId === tabId) setActiveTabId(null);
      showNotification('Tab voided', 'success');
    } catch (err) {
      console.error('Failed to delete tab:', err);
      showNotification('Failed to void tab', 'error');
    }
  };

  // ─── Print ──────────────────────────────────────────────

  const printBill = (tab, subtotal, taxBreakdown, totalTax, discounts = {}) => {
    const currencySymbol = getCurrencySymbol();
    const items = tab.items || [];
    const itemsHtml = items.map(item =>
      `<tr><td style="text-align:left;padding:2px 4px;">${(item.name || '').replace(/</g, '&lt;')}</td><td style="text-align:center;padding:2px 4px;">${item.quantity}</td><td style="text-align:right;padding:2px 4px;">${currencySymbol}${(item.price * item.quantity).toFixed(2)}</td></tr>`
    ).join('');
    const taxHtml = (taxBreakdown || []).map(tax =>
      `<tr><td colspan="2" style="text-align:left;padding:2px 4px;">${tax.name} (${tax.rate}%)</td><td style="text-align:right;padding:2px 4px;">${currencySymbol}${(tax.amount || 0).toFixed(2)}</td></tr>`
    ).join('');
    const tabName = tab.customerInfo?.name || (tab.tabNumber ? `Tab #${tab.tabNumber}` : 'Tab');
    // Build discount lines
    let discountHtml = '';
    if (discounts.offerDiscount > 0) discountHtml += `<div><span>Offer Discount:</span><span>-${currencySymbol}${discounts.offerDiscount.toFixed(2)}</span></div>`;
    if (discounts.manualDiscount > 0) discountHtml += `<div><span>Discount:</span><span>-${currencySymbol}${discounts.manualDiscount.toFixed(2)}</span></div>`;
    if (discounts.loyaltyDiscount > 0) discountHtml += `<div><span>Loyalty Points:</span><span>-${currencySymbol}${discounts.loyaltyDiscount.toFixed(2)}</span></div>`;
    const afterDiscount = Math.max(0, subtotal - (discounts.totalDiscount || 0));
    const grandTotal = afterDiscount + totalTax;
    const html = `<!DOCTYPE html><html><head><title>Bill - ${tabName}</title><style>@page{size:80mm auto;margin:0;}body{font-family:'Courier New',Courier,monospace;margin:16px;font-size:12px;line-height:1.4;max-width:80mm;} .bill-header{text-align:center;margin-bottom:8px;} .restaurant-name{font-size:16px;font-weight:bold;text-transform:uppercase;} .bill-title{font-size:14px;font-weight:bold;margin-top:4px;} .divider{text-align:center;margin:6px 0;} .bill-info{margin:8px 0;font-size:11px;} .bill-info div{display:flex;justify-content:space-between;margin:2px 0;} table{width:100%;border-collapse:collapse;margin:8px 0;} th{text-align:left;border-bottom:1px dashed #000;padding:4px;font-size:11px;} td{font-size:11px;} .total-section{border-top:1px dashed #000;margin-top:8px;padding-top:4px;} .total-row{display:flex;justify-content:space-between;font-weight:bold;font-size:14px;margin-top:4px;} .bill-footer{margin-top:12px;text-align:center;font-size:11px;}</style></head><body><div class="bill-header"><div class="restaurant-name">${(selectedRestaurant?.name || 'Bar').replace(/</g, '&lt;')}</div><div class="bill-title">--- BILL / INVOICE ---</div></div><div class="divider">--------------------------------</div><div class="bill-info"><div><span>Tab:</span><span><strong>${tabName.replace(/</g, '&lt;')}</strong></span></div><div><span>Date:</span><span>${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span></div><div><span>Payment:</span><span>${paymentMethod.toUpperCase()}</span></div></div><div class="divider">--------------------------------</div><table><thead><tr><th style="text-align:left;">Item</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Amt</th></tr></thead><tbody>${itemsHtml}</tbody></table><div class="total-section"><div class="bill-info"><div><span>Subtotal:</span><span>${currencySymbol}${subtotal.toFixed(2)}</span></div>${discountHtml}</div>${taxHtml ? `<table style="margin:4px 0;"><tbody>${taxHtml}</tbody></table>` : ''}<div class="total-row"><span>TOTAL:</span><span>${currencySymbol}${grandTotal.toFixed(2)}</span></div></div><div class="divider">================================</div><div class="bill-footer"><p>Thank you for visiting!</p><p style="font-size:10px;margin-top:4px;">Powered by DineOpen</p></div></body></html>`;

    if (printWindowRef.current && !printWindowRef.current.closed) {
      printWindowRef.current.close();
    }
    const win = window.open('', '_blank', 'width=400,height=600');
    if (win) {
      printWindowRef.current = win;
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 500);
    }
  };

  // ─── Helpers ────────────────────────────────────────────

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getTabTotal = (tab) => {
    const subtotal = (tab.items || []).reduce((sum, i) => sum + i.price * i.quantity, 0);
    const { totalTax } = calculateTax(subtotal);
    return subtotal + totalTax;
  };

  const getTabItemCount = (tab) => {
    return (tab.items || []).reduce((sum, i) => sum + i.quantity, 0);
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return 'now';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'now';
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  // ─── Categories (no emojis) ───────────────────────────

  const categories = useMemo(() => {
    if (!menuItems.length) return [{ id: 'all-items', name: 'All', count: 0 }];
    const catMap = new Map();
    catMap.set('all-items', { id: 'all-items', name: 'All', count: menuItems.length });
    menuItems.forEach(item => {
      if (item.category) {
        const catId = item.category.toLowerCase();
        if (catMap.has(catId)) {
          catMap.get(catId).count++;
        } else {
          catMap.set(catId, {
            id: catId,
            name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
            count: 1
          });
        }
      }
    });
    return Array.from(catMap.values());
  }, [menuItems]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    let items = menuItems;
    if (selectedCategory && selectedCategory !== 'all-items') {
      items = items.filter(i => i.category?.toLowerCase() === selectedCategory);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      items = items.filter(i => i.name?.toLowerCase().includes(q) || i.shortCode?.toLowerCase().includes(q));
    }
    return items;
  }, [menuItems, selectedCategory, searchTerm]);

  // Get quantity of a menu item in the active tab
  const getItemQtyInTab = useCallback((menuItemId) => {
    if (!activeTab) return 0;
    const item = (activeTab.items || []).find(i => i.menuItemId === menuItemId);
    return item ? item.quantity : 0;
  }, [activeTab]);

  // ─── Loading State ──────────────────────────────────────

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>
        <FaSpinner size={32} style={{ animation: 'spin 1s linear infinite', color: '#ef4444' }} />
      </div>
    );
  }

  if (!selectedRestaurant) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>No restaurant selected</p>
      </div>
    );
  }

  const activeTabItems = activeTab?.items || [];
  const activeSubtotal = activeTabItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const { taxBreakdown: activeTaxBreakdown, totalTax: activeTotalTax } = calculateTax(activeSubtotal);
  const activeGrandTotal = activeSubtotal + activeTotalTax;
  const activeItemCount = activeTabItems.reduce((sum, i) => sum + i.quantity, 0);

  // ─── Render ─────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header - Dashboard Style */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        height: '56px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        gap: '12px'
      }}>
        {/* Hamburger Menu Button */}
        <button
          onClick={() => { window.dispatchEvent(new CustomEvent('openNavSidebar')); }}
          style={{
            width: '36px',
            height: '36px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
        >
          <FaBars size={14} color="#374151" />
        </button>

        {/* Logo */}
        <Link href="/dashboard/bar" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(239, 68, 68, 0.25)'
            }}>
              <FaGlassMartiniAlt color="white" size={14} />
            </div>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>DineOpen</span>
          </div>
        </Link>

        {/* Left Spacer - push controls to center */}
        <div style={{ flex: 1 }} />

        {/* Search - Dashboard style */}
        <div style={{ width: '280px', flexShrink: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            height: '36px',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <FaSearch style={{ marginLeft: '12px', color: '#9ca3af', flexShrink: 0 }} size={14} />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                height: '100%',
                paddingLeft: '10px',
                paddingRight: '12px',
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '13px',
                fontWeight: '500',
                outline: 'none',
                color: '#374151'
              }}
            />
          </div>
        </div>

        {/* New Tab Button */}
        <button
          onClick={() => { setNewTabName(''); setShowNewTabDialog(true); }}
          style={{
            height: '36px',
            padding: '0 14px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            boxShadow: '0 2px 4px rgba(239,68,68,0.25)'
          }}
        >
          <FaPlus size={10} />
          NEW TAB
        </button>

        {/* Open Tabs Count Badge */}
        {tabs.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '6px 12px',
            backgroundColor: '#fef2f2',
            borderRadius: '8px',
            border: '1px solid #fecaca',
            flexShrink: 0
          }}>
            <FaReceipt size={11} color="#ef4444" />
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#dc2626' }}>
              {tabs.length} open
            </span>
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Navigation Icons - Same as Restaurant Dashboard */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {[
            { href: '/orderhistory', icon: FaClipboardList, color: '#f59e0b', label: 'Orders' },
            { href: '/tables', icon: FaChair, color: '#3b82f6', label: 'Tables' },
            { href: '/menu', icon: FaUtensils, color: '#10b981', label: 'Menu' },
            { href: '/kot', icon: FaFire, color: '#f97316', label: 'Kitchen' },
            { href: '/customers', icon: FaUsers, color: '#8b5cf6', label: 'Guests' },
          ].map(nav => (
            <Link key={nav.href} href={nav.href} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <nav.icon size={22} color={nav.color} />
                <span style={{ fontSize: '10px', fontWeight: '600', color: '#6b7280', marginTop: '3px' }}>{nav.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content - Three Panels */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left Panel - Open Tabs */}
        <div style={{
          width: '270px',
          flexShrink: 0,
          borderRight: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Tabs Header */}
          <div style={{
            padding: '14px 16px',
            backgroundColor: '#fff',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FaReceipt size={12} color="white" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#1f2937' }}>
                Tabs
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {loadingTabs && <FaSpinner size={11} style={{ animation: 'spin 1s linear infinite', color: '#9ca3af' }} />}
              <span style={{
                fontSize: '12px', fontWeight: '700', color: '#dc2626',
                backgroundColor: '#fef2f2', padding: '3px 10px', borderRadius: '12px',
                border: '1px solid #fecaca'
              }}>
                {tabs.length}
              </span>
            </div>
          </div>

          {/* Tabs List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            {tabs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 16px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 14px auto'
                }}>
                  <FaGlassMartiniAlt size={22} color="#d1d5db" />
                </div>
                <p style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: '#6b7280' }}>No open tabs</p>
                <p style={{ fontSize: '12px', margin: '6px 0 0 0', color: '#9ca3af' }}>
                  Hit &quot;New Tab&quot; to get started
                </p>
              </div>
            ) : (
              tabs.map((tab, tabIdx) => {
                const isActive = activeTabId === tab.id;
                const itemCount = getTabItemCount(tab);
                const total = getTabTotal(tab);
                return (
                  <div
                    key={tab.id}
                    onClick={() => setActiveTabId(tab.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      marginBottom: '6px',
                      cursor: 'pointer',
                      backgroundColor: isActive ? '#fff' : '#fff',
                      border: isActive ? '2px solid #ef4444' : '1.5px solid #e5e7eb',
                      boxShadow: isActive
                        ? '0 4px 12px rgba(239, 68, 68, 0.15)'
                        : '0 1px 3px rgba(0,0,0,0.04)',
                      transition: 'all 0.15s',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
                        background: 'linear-gradient(to bottom, #ef4444, #dc2626)',
                        borderRadius: '0 2px 2px 0'
                      }} />
                    )}

                    {/* Top row: Name + Close */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 0, paddingLeft: isActive ? '6px' : 0, transition: 'padding 0.15s' }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '700',
                          color: isActive ? '#dc2626' : '#1f2937',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: '1.3'
                        }}>
                          {tab.customerInfo?.name || (tab.tabNumber ? `Tab #${tab.tabNumber}` : 'Tab')}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <FaClock size={9} />
                            {timeAgo(tab.createdAt)}
                          </span>
                          <span style={{ color: '#d1d5db' }}>&middot;</span>
                          <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); if (confirm('Void this tab?')) deleteTab(tab.id); }}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          padding: '2px', color: '#d1d5db', display: 'flex',
                          opacity: 0.6, flexShrink: 0
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#ef4444'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.color = '#d1d5db'; }}
                      >
                        <FaTimes size={10} />
                      </button>
                    </div>

                    {/* Bottom row: Amount */}
                    <div style={{
                      display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
                      marginTop: '6px', paddingLeft: isActive ? '6px' : 0
                    }}>
                      <span style={{
                        fontSize: '15px',
                        fontWeight: '800',
                        color: isActive ? '#dc2626' : '#1f2937',
                        letterSpacing: '-0.02em'
                      }}>
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom summary */}
          {tabs.length > 0 && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#fff',
              borderTop: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>All tabs total</span>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#1f2937' }}>
                  {formatCurrency(tabs.reduce((sum, tab) => sum + getTabTotal(tab), 0))}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Center Panel - Menu */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
          {/* Category Chips - Clean, no emojis */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    border: selectedCategory === cat.id ? '1.5px solid #ef4444' : '1.5px solid #e5e7eb',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    backgroundColor: selectedCategory === cat.id ? '#fef2f2' : '#ffffff',
                    color: selectedCategory === cat.id ? '#dc2626' : '#6b7280',
                    transition: 'all 0.15s',
                    lineHeight: '1.4'
                  }}
                >
                  {cat.name} <span style={{ fontWeight: '400', opacity: 0.7 }}>{cat.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Menu Grid */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
            {!activeTabId && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                color: '#9ca3af',
                backgroundColor: '#fef3c7',
                borderRadius: '8px',
                marginBottom: '12px',
                fontSize: '13px',
              }}>
                <FaGlassMartiniAlt size={14} style={{ color: '#d97706', flexShrink: 0 }} />
                <span style={{ color: '#92400e' }}>
                  Tap <strong>&quot;+ New Tab&quot;</strong> to start — items will be added to the active tab
                </span>
              </div>
            )}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
              gap: '10px'
            }}>
              {filteredItems.map(item => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  quantityInCart={getItemQtyInTab(item.id)}
                  onAddToCart={() => addItemToTab(item)}
                  onRemoveFromCart={() => activeTabId && updateItemQuantity(item.id, -1)}
                  useModernDesign={true}
                />
              ))}
            </div>
            {filteredItems.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                <p style={{ fontSize: '14px' }}>No items found</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Tab Summary */}
        <div style={{
          width: '360px',
          flexShrink: 0,
          borderLeft: '1px solid #e5e7eb',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {!activeTab ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', color: '#6b7280' }}>
              {/* Quick stats summary */}
              <div style={{ textAlign: 'center', padding: '20px 0 16px 0', borderBottom: '1px solid #f3f4f6' }}>
                <FaReceipt size={28} style={{ opacity: 0.2, marginBottom: '8px' }} />
                <p style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#374151' }}>
                  {tabs.length > 0 ? `${tabs.length} Open Tab${tabs.length > 1 ? 's' : ''}` : 'No Open Tabs'}
                </p>
                <p style={{ fontSize: '12px', margin: '4px 0 0 0', color: '#9ca3af' }}>
                  {tabs.length > 0 ? 'Select a tab to view details' : 'Create a new tab to get started'}
                </p>
              </div>

              {/* Summary when tabs exist */}
              {tabs.length > 0 && (
                <div style={{ padding: '16px 0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ backgroundColor: '#f9fafb', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                      <p style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#dc2626' }}>
                        {formatCurrency(tabs.reduce((sum, t) => sum + (t.items || []).reduce((s, i) => s + i.price * i.quantity, 0), 0))}
                      </p>
                      <p style={{ fontSize: '11px', margin: '4px 0 0 0', color: '#9ca3af' }}>Total across tabs</p>
                    </div>
                    <div style={{ backgroundColor: '#f9fafb', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                      <p style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#6b7280' }}>
                        {tabs.reduce((sum, t) => sum + (t.items || []).reduce((s, i) => s + i.quantity, 0), 0)}
                      </p>
                      <p style={{ fontSize: '11px', margin: '4px 0 0 0', color: '#9ca3af' }}>Total items</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick tips */}
              <div style={{ marginTop: 'auto', padding: '16px 0 0 0' }}>
                <p style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Quick Tips</p>
                {[
                  { icon: '🍺', text: 'Click "+ New Tab" to open a customer tab' },
                  { icon: '🔍', text: 'Use search or shortcodes to find items fast' },
                  { icon: '📋', text: 'Long-press a tab to see options' },
                ].map((tip, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px' }}>{tip.icon}</span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{tip.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Tab Header - Prominent with color accent */}
              <div style={{
                padding: '14px 16px',
                background: 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)',
                borderBottom: '2px solid #fecaca',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#dc2626', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {activeTab.customerInfo?.name || (activeTab.tabNumber ? `Tab #${activeTab.tabNumber}` : 'Tab')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                    <span style={{
                      fontSize: '10px', fontWeight: '600', color: '#ef4444',
                      backgroundColor: '#fff', padding: '2px 8px', borderRadius: '10px',
                      border: '1px solid #fecaca', display: 'inline-flex', alignItems: 'center', gap: '3px'
                    }}>
                      <FaClock size={8} />
                      {activeTab.createdAt ? timeAgo(activeTab.createdAt) : 'now'}
                    </span>
                    <span style={{
                      fontSize: '10px', fontWeight: '600', color: '#6b7280',
                      backgroundColor: '#fff', padding: '2px 8px', borderRadius: '10px',
                      border: '1px solid #e5e7eb'
                    }}>
                      {activeItemCount} {activeItemCount === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTabId(null)}
                  style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    border: '1px solid #fecaca', backgroundColor: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#9ca3af', flexShrink: 0
                  }}
                >
                  <FaTimes size={12} />
                </button>
              </div>

              {/* Customer Info - Compact row */}
              <div style={{ padding: '10px 16px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#fff' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <FaUser size={11} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#d1d5db' }} />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Guest name"
                      style={{
                        width: '100%',
                        padding: '8px 10px 8px 30px',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '500',
                        outline: 'none',
                        backgroundColor: '#f9fafb',
                        color: '#1f2937',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <FaPhone size={11} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#d1d5db' }} />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      onBlur={() => lookupCustomer(customerPhone)}
                      placeholder="Phone"
                      style={{
                        width: '100%',
                        padding: '8px 10px 8px 30px',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '500',
                        outline: 'none',
                        backgroundColor: '#f9fafb',
                        color: '#1f2937',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
                {/* Customer Loyalty Info */}
                {customerData && loyaltySettings?.enabled && (
                  <div style={{ marginTop: '6px', padding: '6px 10px', backgroundColor: '#ecfdf5', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#065f46' }}>
                        {customerData.name || 'Customer'} — {customerData.loyaltyPoints || 0} pts
                      </span>
                      <span style={{ fontSize: '10px', color: '#047857' }}>
                        Worth {formatCurrency((customerData.loyaltyPoints || 0) / (loyaltySettings.redemptionRate || 100))}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '6px 12px' }}>
                {activeTabItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 16px', color: '#d1d5db' }}>
                    <p style={{ fontSize: '13px', fontWeight: '500', margin: 0 }}>Empty tab</p>
                    <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>Add drinks or food from the menu</p>
                  </div>
                ) : (
                  activeTabItems.map((item, idx) => (
                    <div key={item.menuItemId || idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 4px',
                      borderBottom: idx < activeTabItems.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }}>
                      <div style={{ flex: 1, minWidth: 0, marginRight: '8px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                          {formatCurrency(item.price)} ea.
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <button
                          onClick={() => updateItemQuantity(item.menuItemId, -1)}
                          style={{
                            width: '26px', height: '26px', borderRadius: '6px',
                            border: '1px solid #e5e7eb', backgroundColor: '#f9fafb',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#6b7280', flexShrink: 0
                          }}
                        >
                          <FaMinus size={9} />
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={editingQty?.menuItemId === item.menuItemId ? editingQty.value : item.quantity}
                          onFocus={() => setEditingQty({ menuItemId: item.menuItemId, value: String(item.quantity) })}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setEditingQty({ menuItemId: item.menuItemId, value: val });
                          }}
                          onBlur={() => {
                            if (editingQty?.menuItemId === item.menuItemId) {
                              const newQty = parseInt(editingQty.value, 10);
                              if (!isNaN(newQty) && newQty !== item.quantity) {
                                if (newQty <= 0) {
                                  updateItemQuantity(item.menuItemId, -item.quantity);
                                } else {
                                  setItemQuantity(item.menuItemId, newQty);
                                }
                              }
                              setEditingQty(null);
                            }
                          }}
                          onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                          style={{
                            width: '32px', height: '26px', textAlign: 'center',
                            fontSize: '13px', fontWeight: '700', color: '#1f2937',
                            border: '1px solid #e5e7eb', borderRadius: '6px',
                            outline: 'none', backgroundColor: '#fff', padding: 0
                          }}
                        />
                        <button
                          onClick={() => updateItemQuantity(item.menuItemId, 1)}
                          style={{
                            width: '26px', height: '26px', borderRadius: '6px',
                            border: '1px solid #ef4444', backgroundColor: '#fef2f2',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#ef4444', flexShrink: 0
                          }}
                        >
                          <FaPlus size={9} />
                        </button>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#1f2937', minWidth: '56px', textAlign: 'right', marginLeft: '6px' }}>
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Bottom: Totals + Payment + Actions */}
              <div style={{ borderTop: '2px solid #f3f4f6', backgroundColor: '#fff', padding: '12px 14px 16px 14px' }}>
                {/* Subtotal & Tax */}
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', marginBottom: '3px' }}>
                    <span>Subtotal</span>
                    <span style={{ fontWeight: '600' }}>{formatCurrency(activeSubtotal)}</span>
                  </div>
                  {activeTaxBreakdown.map((tax, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>
                      <span>{tax.name} ({tax.rate}%)</span>
                      <span>{formatCurrency(tax.amount)}</span>
                    </div>
                  ))}
                </div>

                {/* Discounts & Loyalty Section */}
                {activeTabItems.length > 0 && (
                  <div style={{ marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {/* Offer Selector */}
                    {availableOffers.length > 0 && (
                      <div>
                        <select
                          value={selectedOfferId}
                          onChange={(e) => setSelectedOfferId(e.target.value)}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '11px', fontWeight: '600', backgroundColor: '#f9fafb', boxSizing: 'border-box' }}
                        >
                          <option value="">No offer</option>
                          {availableOffers.map(o => (
                            <option key={o.id} value={o.id}>
                              {o.name} ({o.discountType === 'percentage' ? `${o.discountValue}%` : formatCurrency(o.discountValue)} off)
                              {o.schedule ? ' [Scheduled]' : ''}
                            </option>
                          ))}
                        </select>
                        {getOfferDiscount() > 0 && (
                          <div style={{ fontSize: '11px', color: '#059669', fontWeight: '600', marginTop: '2px' }}>
                            Offer discount: -{formatCurrency(getOfferDiscount())}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Manual Discount */}
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input
                        type="number"
                        value={manualDiscount || ''}
                        onChange={(e) => setManualDiscount(parseFloat(e.target.value) || 0)}
                        placeholder="Discount"
                        min="0"
                        style={{ flex: 1, padding: '7px 10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '11px', fontWeight: '500', boxSizing: 'border-box' }}
                      />
                      <select
                        value={manualDiscountType}
                        onChange={(e) => setManualDiscountType(e.target.value)}
                        style={{ padding: '7px 6px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '11px', fontWeight: '600', boxSizing: 'border-box' }}
                      >
                        <option value="flat">{getCurrencySymbol()}</option>
                        <option value="percentage">%</option>
                      </select>
                    </div>

                    {/* Loyalty Redemption */}
                    {loyaltySettings?.enabled && customerData && (customerData.loyaltyPoints || 0) > 0 && (
                      <div style={{ padding: '6px 10px', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '600', color: '#065f46' }}>Redeem Points</span>
                          <span style={{ fontSize: '10px', color: '#047857' }}>{redeemLoyaltyPoints} pts = {formatCurrency(getLoyaltyDiscount())}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={customerData.loyaltyPoints || 0}
                          value={redeemLoyaltyPoints}
                          onChange={(e) => setRedeemLoyaltyPoints(parseInt(e.target.value) || 0)}
                          style={{ width: '100%', accentColor: '#10b981' }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Grand Total - Prominent */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  backgroundColor: '#fef2f2',
                  borderRadius: '10px',
                  border: '1.5px solid #fecaca',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#374151' }}>Total</span>
                  <span style={{ fontSize: '20px', fontWeight: '800', color: '#dc2626' }}>
                    {formatCurrency(Math.max(0, activeGrandTotal - getOfferDiscount() - getManualDiscountAmount() - getLoyaltyDiscount()))}
                  </span>
                </div>

                {/* Payment & Actions - only if items exist */}
                {activeTabItems.length > 0 && (
                  <>
                    {/* Payment Method */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                      {[
                        { id: 'cash', label: 'Cash' },
                        { id: 'upi', label: 'UPI' },
                        { id: 'card', label: 'Card' }
                      ].map(pm => (
                        <button
                          key={pm.id}
                          onClick={() => setPaymentMethod(pm.id)}
                          style={{
                            flex: 1,
                            padding: '8px 4px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: '700',
                            border: paymentMethod === pm.id ? '1.5px solid #ef4444' : '1.5px solid #e5e7eb',
                            backgroundColor: paymentMethod === pm.id ? '#fef2f2' : '#fff',
                            color: paymentMethod === pm.id ? '#dc2626' : '#6b7280',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            transition: 'all 0.12s',
                            letterSpacing: '0.03em'
                          }}
                        >
                          {pm.label}
                        </button>
                      ))}
                    </div>

                    {/* Save + KOT row */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <button
                        onClick={saveTab}
                        disabled={savingTab}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '10px',
                          fontWeight: '700',
                          fontSize: '13px',
                          border: 'none',
                          cursor: savingTab ? 'not-allowed' : 'pointer',
                          background: savingTab ? '#d1d5db' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: savingTab ? 'none' : '0 2px 8px rgba(239,68,68,0.25)',
                          transition: 'all 0.2s'
                        }}
                      >
                        {savingTab ? (
                          <><FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
                        ) : (
                          <><FaSave size={12} /> Save Tab</>
                        )}
                      </button>

                      {printSettings?.kotPrinterEnabled === true && (
                        <button
                          onClick={async () => {
                            try {
                              if (pendingUpdateRef.current && pendingUpdateRef.current.tabId === activeTabId) {
                                if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
                                await apiClient.updateOrder(pendingUpdateRef.current.tabId, pendingUpdateRef.current.data);
                                pendingUpdateRef.current = null;
                              }
                              await apiClient.requestManualPrint(activeTabId, 'kot');
                              showNotification('KOT sent to kitchen!', 'success');
                            } catch (err) {
                              showNotification('Failed to print KOT', 'error');
                            }
                          }}
                          style={{
                            padding: '10px 16px',
                            borderRadius: '10px',
                            fontWeight: '700',
                            fontSize: '13px',
                            border: '1.5px solid #e5e7eb',
                            backgroundColor: '#fff',
                            color: '#374151',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            flexShrink: 0
                          }}
                        >
                          <FaPrint size={12} />
                          KOT
                        </button>
                      )}
                    </div>

                    {/* Settle Tab */}
                    <button
                      onClick={closeTab}
                      disabled={processing}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '10px',
                        fontWeight: '700',
                        fontSize: '14px',
                        border: 'none',
                        cursor: processing ? 'not-allowed' : 'pointer',
                        background: processing ? '#d1d5db' : 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: processing ? 'none' : '0 3px 10px rgba(16,185,129,0.3)',
                        transition: 'all 0.2s'
                      }}
                    >
                      {processing ? (
                        <><FaSpinner size={13} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
                      ) : (
                        <><FaCheckCircle size={13} /> Settle &amp; Bill &middot; {formatCurrency(activeGrandTotal)}</>
                      )}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* New Tab Dialog */}
      {showNewTabDialog && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', padding: '24px',
            width: '100%', maxWidth: '380px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: '700', margin: '0 0 4px 0', color: '#1f2937' }}>Open New Tab</h3>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 14px 0' }}>Auto-numbered — or type a custom name</p>
            <input
              type="text"
              autoFocus
              placeholder="Tab name (optional — auto-numbered if empty)"
              value={newTabName}
              onChange={(e) => setNewTabName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') openTab(); if (e.key === 'Escape') setShowNewTabDialog(false); }}
              style={{
                width: '100%', padding: '12px 14px', border: '2px solid #e5e7eb',
                borderRadius: '10px', fontSize: '15px', outline: 'none',
                boxSizing: 'border-box', marginBottom: '14px'
              }}
              onFocus={(e) => { e.target.style.borderColor = '#ef4444'; }}
              onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowNewTabDialog(false)}
                style={{
                  flex: 1, padding: '11px', borderRadius: '10px', fontSize: '14px',
                  fontWeight: '600', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb',
                  color: '#374151', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={openTab}
                disabled={creatingTab}
                style={{
                  flex: 1, padding: '11px', borderRadius: '10px', fontSize: '14px',
                  fontWeight: '700', border: 'none',
                  backgroundColor: creatingTab ? '#e5e7eb' : '#ef4444',
                  color: creatingTab ? '#9ca3af' : 'white',
                  cursor: creatingTab ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                {creatingTab ? <><FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} /> Opening...</> : 'Open Tab'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for spin animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function BarPOSPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <FaSpinner size={32} style={{ animation: 'spin 1s linear infinite', color: '#ef4444' }} />
      </div>
    }>
      <BarPOSContent />
    </Suspense>
  );
}
