'use client';

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import apiClient from '../lib/api';
import { t } from '../lib/i18n';
import { useCurrency } from '../contexts/CurrencyContext';
import useCustomerLookup, { getPhoneMinLength } from '../hooks/useCustomerLookup';
import useOfferEngine, { calculateDiscountForOffer } from '../hooks/useOfferEngine';
import { getBillPrintCSS, getKOTPrintCSS, getBillHeaderHTML, buildTokenSlipHTML, buildTokenSlipsDocumentHTML } from '../utils/printFontSizes';
import { generateBillHTML, generateKOTHTML } from '../utils/printHtmlGenerator';
import { printDocument, printHtmlInHiddenFrame, supportsNativeAutoPrint } from '../utils/printBridge';

const CustomerDetailModal = dynamic(() => import('./CustomerDetailModal'), { ssr: false });
const DiscountApprovalModal = dynamic(() => import('./DiscountApprovalModal'), { ssr: false });
import UpiPaymentModal from './UpiPaymentModal';
import EcrStatusModal from './EcrStatusModal';
import useEcr from '../services/ecr/useEcr';
import { ECR_STATUS, ECR_RESPONSE_CODES } from '../services/ecr/ecrConstants';
import {
  FaShoppingCart,
  FaTimes,
  FaUtensils,
  FaMinus,
  FaPlus,
  FaCreditCard,
  FaMoneyBillWave,
  FaSave,
  FaCheckCircle,
  FaSpinner,
  FaQrcode,
  FaTrash,
  FaPrint,
  FaMicrophone,
  FaMicrophoneSlash,
  FaChair,
  FaExchangeAlt,
  FaTable,
  FaBed,
  FaStickyNote,
  FaTag,
  FaInfoCircle,
  FaHandHoldingUsd,
  FaConciergeBell,
  FaDivide,
  FaGift,
  FaBan,
  FaWallet,
  FaChevronDown,
  FaChevronUp,
  FaUser,
  FaWhatsapp,
  FaArrowLeft,
  FaRedo,
  FaExclamationCircle,
  FaUserPlus,
  FaStar,
  FaCalendarAlt,
  FaTruck,
  FaPencilAlt,
  FaEdit,
  FaMapMarkerAlt,
  FaExclamationTriangle
} from 'react-icons/fa';

const OrderSummary = ({
  cart,
  setCart,
  orderType,
  setOrderType,
  paymentMethod,
  setPaymentMethod,
  onClearCart,
  onProcessOrder,
  onSaveOrder,
  onPlaceOrder,
  onRemoveFromCart,
  onAddToCart,
  onUpdateCartItemQuantity,
  onTableNumberChange,
  onChangeTable,
  onCustomerNameChange,
  onCustomerMobileChange,
  processing,
  placingOrder,
  savingOrder = false, // Separate loading state for save order button
  orderSuccess,
  setOrderSuccess,
  error,
  getTotalAmount,
  tableNumber,
  selectedTable,
  customerName,
  customerMobile,
  orderLookup,
  setOrderLookup,
  currentOrder,
  setCurrentOrder,
  onShowQRCode,
  restaurantId,
  restaurantName,
  taxSettings,
  printSettings,
  menuItems = [],
  onClose,
  inRoomDiningEnabled = false,
  locationType = 'table',
  setLocationType,
  manualRoomNumber = '',
  setManualRoomNumber,
  billingMode = false, // When true, hides Save/Place Order buttons, only shows Complete Billing
  onBillingComplete, // Callback when billing is completed in billingMode
  onStartVoiceOrder, // Callback to start voice ordering from dashboard
  // Saved orders props
  savedOrders = [],
  activeSavedOrderId = null,
  loadingSavedOrderId = null,
  deletingSavedOrderId = null,
  onLoadSavedOrder,
  onDeleteSavedOrder,
  // Templates props
  templates = [],
  onSaveAsTemplate,
  posSettings = {},
  businessType = 'restaurant',
  userRole = 'waiter',
  countryCode = 'IN',
  onCustomerDataChange,
  // Billing feature settings
  billingSettings = {},
  // Multi-pricing props
  multiPricingEnabled = false,
  pricingRules = [],
  pricingRulesLoading = false,
  activePricingRuleId = null,
  setActivePricingRuleId,
  autoSelectedRule = false,
  setAutoSelectedRule,
  upiSettings = {},
  ecrSettings = null,
  whatsappConnected = false,
  // Scheduled/future order props
  isScheduledOrder = false,
  setIsScheduledOrder,
  scheduledDate = '',
  setScheduledDate,
  scheduledTime = '',
  setScheduledTime,
  onUpdateWithoutKOT,
  onPlaceOrderAndPrint,
  assignedStaff = null,
  onAssignedStaffChange,
}) => {
  // Persistent SC override — stored per restaurant in localStorage
  const scOverrideKey = restaurantId ? `dineopen_sc_override_${restaurantId}` : null;
  const readScOverride = () => {
    if (!scOverrideKey) return null;
    try {
      const val = localStorage.getItem(scOverrideKey);
      if (val === 'true') return true;
      if (val === 'false') return false;
      return null;
    } catch { return null; }
  };

  // Business-type-aware billing labels (i18n — Arabic gets bilingual ar/en)
  const billingLabels = {
    restaurant: { billTitle: t('invoice.billInvoice'), itemCol: t('invoice.item'), qtyCol: t('invoice.qty'), customerLabel: t('invoice.customer'), footer: t('invoice.footerRestaurant'), billLabel: t('invoice.bill') },
    bar: { billTitle: t('invoice.barTab'), itemCol: t('invoice.drinkItem'), qtyCol: t('invoice.qty'), customerLabel: t('invoice.guest'), footer: t('invoice.footerBar'), billLabel: t('invoice.tab') },
    bakery: { billTitle: t('invoice.receipt'), itemCol: t('invoice.item'), qtyCol: t('invoice.qty'), customerLabel: t('invoice.customer'), footer: t('invoice.footerBakery'), billLabel: t('invoice.bill') },
    ice_cream: { billTitle: t('invoice.receipt'), itemCol: t('invoice.itemFlavor'), qtyCol: t('invoice.qty'), customerLabel: t('invoice.customer'), footer: t('invoice.footerIceCream'), billLabel: t('invoice.bill') },
    cafe: { billTitle: t('invoice.receipt'), itemCol: t('invoice.item'), qtyCol: t('invoice.qty'), customerLabel: t('invoice.name'), footer: t('invoice.footerCafe'), billLabel: t('invoice.bill') },
    qsr: { billTitle: t('invoice.orderReceipt'), itemCol: t('invoice.item'), qtyCol: t('invoice.qty'), customerLabel: t('invoice.token'), footer: t('invoice.footerQsr'), billLabel: t('invoice.bill') }
  };
  const bLabels = billingLabels[businessType] || billingLabels.restaurant;

  const getItemSubline = (item) => {
    const parts = [];
    if (item.spiritCategory) parts.push(item.spiritCategory);
    if (item.abv) parts.push(`${item.abv}% ABV`);
    if (item.bottleSize) parts.push(item.bottleSize);
    if (item.servingUnit && item.servingUnit !== item.bottleSize) parts.push(item.servingUnit);
    if (item.weight) parts.push(item.weight);
    if (item.unit) parts.push(`per ${item.unit}`);
    if (item.servingSize) parts.push(item.servingSize);
    if (item.scoopOptions) parts.push(`${item.scoopOptions} scoop${item.scoopOptions > 1 ? 's' : ''}`);
    return parts;
  };

  // Track whether edit-mode pre-fill (SC, discount) is still pending — prevents amount flicker
  const [editPreFillPending, setEditPreFillPending] = useState(false);
  const editPreFillPendingRef = useRef(false); // Synchronous flag for cross-hook blocking
  // Unified flag: disables ALL order buttons when any action is in progress
  const orderBusy = processing || placingOrder || savingOrder || editPreFillPending;
  // True when editing a loaded saved order (disable save button, keep place order text normal)
  const isEditingSavedOrder = currentOrder && currentOrder.status === 'saved';

  const { formatCurrency, getCurrencySymbol } = useCurrency();
  const [invoice, setInvoice] = useState(null);
  const [showInvoicePermanently, setShowInvoicePermanently] = useState(false);
  const [taxBreakdown, setTaxBreakdown] = useState([]);
  const [totalTax, setTotalTax] = useState(0);
  const [grandTotal, setGrandTotal] = useState(null);
  const [restaurantCategories, setRestaurantCategories] = useState([]); // For per-item tax resolution

  // Load categories when tax groups exist (needed for per-item tax resolution)
  useEffect(() => {
    if (restaurantId && taxSettings?.taxGroups?.length > 0) {
      apiClient.getCategories(restaurantId).then(res => {
        setRestaurantCategories(res?.categories || []);
      }).catch(() => setRestaurantCategories([]));
    }
  }, [restaurantId, taxSettings?.taxGroups?.length]);

  // WhatsApp bill sending state
  const [waSending, setWaSending] = useState(false);
  const [waSent, setWaSent] = useState(false);

  // Special Instructions State
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  // Per-item kitchen note — tracks which cart item's note input is expanded
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const [showCustomItemForm, setShowCustomItemForm] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [customItemQty, setCustomItemQty] = useState('1');
  const [editingPriceId, setEditingPriceId] = useState(null);

  // Staff assignment state
  const [staffList, setStaffList] = useState([]);
  const [staffQuery, setStaffQuery] = useState('');
  const [staffDropdownOpen, setStaffDropdownOpen] = useState(false);
  const [staffFetched, setStaffFetched] = useState(false);

  const fetchStaffList = async () => {
    if (staffFetched || !restaurantId) return;
    setStaffFetched(true);
    try {
      const res = await apiClient.getWaiters(restaurantId);
      setStaffList(res.waiters || []);
    } catch { setStaffFetched(false); }
  };

  const filteredStaff = staffList.filter(s =>
    !staffQuery || s.name?.toLowerCase().includes(staffQuery.toLowerCase())
  );

  // Wallet State
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletRedeemAmount, setWalletRedeemAmount] = useState('');
  const [useWallet, setUseWallet] = useState(false);

  // Voice Assistant State
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [recognizedItems, setRecognizedItems] = useState([]);
  const [showVoiceConfirm, setShowVoiceConfirm] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [useFullChatGPT, setUseFullChatGPT] = useState(true); // Feature flag - Set to true for full ChatGPT processing
  const [isMobile, setIsMobile] = useState(false);

  // Customer Lookup Hook
  const { customerData, lookupStatus, triggerLookup, clearCustomer } = useCustomerLookup({ restaurantId, countryCode });

  // Auto-trigger customer lookup when phone is pre-filled (e.g., billing modal from order history/tables)
  const initialLookupDone = useRef(false);
  useEffect(() => {
    if (initialLookupDone.current) return;
    if (customerMobile && restaurantId) {
      const digits = (customerMobile || '').replace(/\D/g, '');
      const minLen = getPhoneMinLength(countryCode);
      if (digits.length >= minLen) {
        initialLookupDone.current = true;
        triggerLookup(digits);
      }
    }
  }, [customerMobile, restaurantId, countryCode, triggerLookup]);

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showUpiQr, setShowUpiQr] = useState(false);
  const [pendingUpiAction, setPendingUpiAction] = useState(null); // 'place' | 'complete'

  // Offer Engine Hook
  const {
    applicableOffers, genericOffers, personalizedOffers,
    selectedOfferId, setSelectedOfferId,
    selectedOfferIds, toggleOffer,
    offerDiscount, selectedOfferName, resetOffers,
    autoApplied, firstOrderOfferRejected,
    offerSettings, loyaltySettings,
    freeItems,
    customerGroups: customerOfferGroups,
  } = useOfferEngine({
    restaurantId,
    cart,
    subtotal: getTotalAmount(),
    customerInfo: customerData,
    taxSettings,
    customerContext: customerData ? {
      customerId: customerData.id,
      customerPhone: customerData.phone,
      isFirstOrder: customerData.isFirstOrder,
    } : null,
  });

  // Manual Discount State (kept local — not part of offer engine)
  const [manualDiscountValue, setManualDiscountValue] = useState('');
  const [manualDiscountTypeState, setManualDiscountTypeState] = useState('flat'); // 'flat' or 'percentage'

  // Discount Approval State
  const [showDiscountApproval, setShowDiscountApproval] = useState(false);
  const [pendingDiscountAction, setPendingDiscountAction] = useState(null); // 'place' | 'complete' | 'placeAndPrint'
  const [discountApproved, setDiscountApproved] = useState(false);
  const [discountApprovalSettings, setDiscountApprovalSettings] = useState(null);

  // Load discount approval settings
  useEffect(() => {
    if (!restaurantId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.getRestaurant(restaurantId);
        if (!cancelled && res?.restaurant?.discountApprovalSettings?.enabled) {
          setDiscountApprovalSettings(res.restaurant.discountApprovalSettings);
        }
      } catch (_) {}
    })();
    return () => { cancelled = true; };
  }, [restaurantId]);

  // Reset approval when discount changes
  useEffect(() => { setDiscountApproved(false); }, [manualDiscountValue, manualDiscountTypeState]);

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { id, code, discountAmount, discountType, value }
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [customerCoupons, setCustomerCoupons] = useState([]);

  // Delivery Person Info
  const [deliveryInfo, setDeliveryInfo] = useState({ personName: '', personPhone: '', cashHandedOver: false });
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({ building: '', landmark: '', city: '', state: '', pincode: '' });
  const [deliveryStaffList, setDeliveryStaffList] = useState([]);
  const [deliveryStaffLoaded, setDeliveryStaffLoaded] = useState(false);
  const [showDeliveryStaffDropdown, setShowDeliveryStaffDropdown] = useState(false);

  // Loyalty Points Redemption State
  const [redeemLoyaltyPoints, setRedeemLoyaltyPoints] = useState(0);
  const [sliderDragging, setSliderDragging] = useState(false);
  const [sliderLocalValue, setSliderLocalValue] = useState(0);
  const loyaltyPreFilled = useRef(false);
  const editPreFilled = useRef(false);
  const offersPreFilled = useRef(false);
  const offersReselectedIds = useRef(null); // Track which saved offer IDs have been re-selected
  const prevCustomerId = useRef(null);

  // Offers & Rewards Modal
  const [showOffersModal, setShowOffersModal] = useState(false);

  // Billing features state
  const [activeBillingPanel, setActiveBillingPanel] = useState(null);
  const [cashReceived, setCashReceived] = useState('');
  const [splitPayments, setSplitPayments] = useState([{ method: 'cash', amount: '' }, { method: 'upi', amount: '' }]);
  const [tipAmount, setTipAmount] = useState(0);
  const [tipPercentage, setTipPercentage] = useState(null);
  const [serviceChargeAmount, setServiceChargeAmount] = useState(0);
  const [serviceChargeOverride, setServiceChargeOverride] = useState(() => readScOverride()); // persisted per device
  const [serviceChargeRateOverride, setServiceChargeRateOverride] = useState(null); // null=use billingSettings rate

  // Wrapper that persists SC override to localStorage when user clicks the toggle
  const setServiceChargeOverridePersistent = useCallback((val) => {
    setServiceChargeOverride(val);
    if (scOverrideKey) {
      try {
        if (val === null) localStorage.removeItem(scOverrideKey);
        else localStorage.setItem(scOverrideKey, String(val));
      } catch {}
    }
  }, [scOverrideKey]);
  const [roundOffAmount, setRoundOffAmount] = useState(0);
  const [compVoidItems, setCompVoidItems] = useState([]);
  const [compVoidType, setCompVoidType] = useState('comp');
  const [compVoidReason, setCompVoidReason] = useState('');
  const [managerPin, setManagerPin] = useState('');
  const [partialPayAmount, setPartialPayAmount] = useState('');
  const [fullDueMode, setFullDueMode] = useState(false);

  // Calculate service charge
  const calcServiceCharge = useCallback((discountedAmount) => {
    // If user explicitly turned off SC for this order
    if (serviceChargeOverride === false) return 0;
    // If SC is not enabled globally and user hasn't forced it on
    if (!billingSettings.serviceChargeEnabled && serviceChargeOverride !== true) return 0;
    const rate = serviceChargeRateOverride !== null ? serviceChargeRateOverride : billingSettings.serviceChargeRate;
    if (!rate) return 0;
    return Math.round(discountedAmount * rate / 100 * 100) / 100;
  }, [billingSettings.serviceChargeEnabled, billingSettings.serviceChargeRate, serviceChargeOverride, serviceChargeRateOverride]);

  // Calculate round-off
  const calcRoundOff = useCallback((amount) => {
    if (!billingSettings.roundOffEnabled) return 0;
    const roundTo = billingSettings.roundOffTo || 1;
    const rounded = Math.round(amount / roundTo) * roundTo;
    return Math.round((rounded - amount) * 100) / 100;
  }, [billingSettings.roundOffEnabled, billingSettings.roundOffTo]);

  // Bubble customerData up to dashboard
  useEffect(() => { onCustomerDataChange?.(customerData); }, [customerData, onCustomerDataChange]);

  // Reset loyalty redemption when customer changes (but not if pre-filling from saved order)
  useEffect(() => {
    if (prevCustomerId.current !== null && prevCustomerId.current !== customerData?.id) {
      // Customer actually changed (not first load) — reset loyalty
      setRedeemLoyaltyPoints(0);
      setSliderLocalValue(0);
      loyaltyPreFilled.current = false;
    }
    prevCustomerId.current = customerData?.id || null;
  }, [customerData?.id]);

  // Fetch wallet balance when customer is found
  useEffect(() => {
    if (lookupStatus === 'found' && customerData?.id) {
      setWalletLoading(true);
      apiClient.getCustomerWallet(customerData.id)
        .then(res => {
          setWalletBalance(Math.round((res.walletBalance || 0) * 100) / 100);
        })
        .catch(() => setWalletBalance(0))
        .finally(() => setWalletLoading(false));
    } else {
      setWalletBalance(0);
      setUseWallet(false);
      setWalletRedeemAmount('');
    }
  }, [lookupStatus, customerData?.id]);

  // Auto-fill customer name when found
  useEffect(() => {
    if (customerData?.name) {
      onCustomerNameChange?.(customerData.name);
    }
  }, [customerData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch staff list when delivery is selected (for delivery person search)
  useEffect(() => {
    if (orderType === 'delivery' && restaurantId && !deliveryStaffLoaded) {
      apiClient.getStaff(restaurantId).then(res => {
        setDeliveryStaffList(res?.staff || []);
        setDeliveryStaffLoaded(true);
      }).catch(() => setDeliveryStaffLoaded(true));
    }
  }, [orderType, restaurantId, deliveryStaffLoaded]);

  // Reset delivery info when switching away from delivery
  useEffect(() => {
    if (orderType !== 'delivery') {
      setDeliveryInfo({ personName: '', personPhone: '', cashHandedOver: false });
      setDeliveryAddress('');
      setAddressForm({ building: '', landmark: '', city: '', state: '', pincode: '' });
    }
  }, [orderType]);

  // Auto-fill delivery address from customer lookup
  useEffect(() => {
    if (orderType === 'delivery' && lookupStatus === 'found' && customerData) {
      const parts = [customerData.address, customerData.locality, customerData.city].filter(Boolean);
      if (parts.length > 0) {
        setDeliveryAddress(parts.join(', '));
      }
    } else if (orderType === 'delivery' && (lookupStatus === 'not_found' || lookupStatus === 'idle')) {
      setDeliveryAddress('');
      setAddressForm({ building: '', landmark: '', city: '', state: '', pincode: '' });
    }
  }, [orderType, lookupStatus, customerData]);

  const kotPrintWindowRef = useRef(null);
  const invoicePrintWindowRef = useRef(null);
  const [foodCourtTokenPreview, setFoodCourtTokenPreview] = useState(null);

  const printFoodCourtTokens = useCallback(async (tokenRestaurantId, orderId, { delay = 900 } = {}) => {
    if (!printSettings?.tokenBillingEnabled || !tokenRestaurantId || !orderId) return;

    const isNativePrint = supportsNativeAutoPrint();
    try {
      const tokenRes = await apiClient.getTokenRender(tokenRestaurantId, orderId);
      const tokens = tokenRes?.tokens || [];
      if (!tokenRes?.success || tokens.length === 0) {
        setFoodCourtTokenPreview(null);
        return;
      }

      if (isNativePrint) {
        const pause = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        if (delay > 0) {
          await pause(delay);
        }
        for (const token of tokens) {
          const tokenHtml = buildTokenSlipHTML(token, printSettings);
          await printDocument({ html: tokenHtml, type: 'bill', printSettings: printSettings || {} });
          await pause(350);
        }
        return;
      }

      setTimeout(() => {
        setFoodCourtTokenPreview({
          restaurantId: tokenRestaurantId,
          orderId,
          tokens,
        });
      }, delay);
    } catch (err) {
      console.error('Token print error:', err);
    }
  }, [printSettings]);

  // Dismiss KOT/billing summary when user starts a new action (adds items, loads saved order)
  // Also reset all offer/loyalty/discount state since this is a fresh order
  const prevCartLength = useRef(cart?.length || 0);
  useEffect(() => {
    prevCartLength.current = cart?.length || 0;

    if (cart?.length > 0 && orderSuccess?.show) {
      setOrderSuccess(null);
      setInvoice(null);
      setShowInvoicePermanently(false);
      setWaSent(false);
      setWaSending(false);
      // Fresh order: reset all customer-specific state
      resetOffers();
      setManualDiscountValue('');
      setManualDiscountTypeState('flat');
      setAppliedCoupon(null);
      setCouponCode('');
      setCouponError('');
      setCustomerCoupons([]);
      setRedeemLoyaltyPoints(0);
      setSliderLocalValue(0);
      setUseWallet(false);
      setWalletRedeemAmount('');
      loyaltyPreFilled.current = false;
      editPreFilled.current = false;
      offersPreFilled.current = false;
      offersReselectedIds.current = null;
      editPreFillPendingRef.current = false;
      setEditPreFillPending(false);
      prevCustomerId.current = null;
      initialLookupDone.current = false;
      clearCustomer();
      setActiveBillingPanel(null);
      setCashReceived('');
      setSplitPayments([{ method: 'cash', amount: '' }, { method: 'upi', amount: '' }]);
      setTipAmount(0);
      setTipPercentage(null);
      setServiceChargeAmount(0);
      setServiceChargeOverride(readScOverride());
      setServiceChargeRateOverride(null);
      setRoundOffAmount(0);
      setCompVoidItems([]);
      setCompVoidReason('');
      setManagerPin('');
      setPartialPayAmount('');
      setFullDueMode(false);
    }
  }, [cart?.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset all offer/loyalty/discount state when cart becomes empty (new order)
  // This prevents stale customer-specific offers, loyalty points, and discounts
  // from leaking into the next order
  useEffect(() => {
    if (cart?.length === 0) {
      resetOffers();
      setManualDiscountValue('');
      setManualDiscountTypeState('flat');
      setAppliedCoupon(null);
      setCouponCode('');
      setCouponError('');
      setCustomerCoupons([]);
      setRedeemLoyaltyPoints(0);
      setSliderLocalValue(0);
      setUseWallet(false);
      setWalletRedeemAmount('');
      loyaltyPreFilled.current = false;
      editPreFilled.current = false;
      offersPreFilled.current = false;
      offersReselectedIds.current = null;
      editPreFillPendingRef.current = false;
      setEditPreFillPending(false);
      prevCustomerId.current = null;
      initialLookupDone.current = false;
      clearCustomer();
      // Reset billing panel state
      setActiveBillingPanel(null);
      setCashReceived('');
      setSplitPayments([{ method: 'cash', amount: '' }, { method: 'upi', amount: '' }]);
      setTipAmount(0);
      setTipPercentage(null);
      setServiceChargeAmount(0);
      setServiceChargeOverride(readScOverride());
      setServiceChargeRateOverride(null);
      setRoundOffAmount(0);
      setCompVoidItems([]);
      setCompVoidReason('');
      setManagerPin('');
      setPartialPayAmount('');
      setFullDueMode(false);
      setWaSent(false);
      setWaSending(false);
    }
  }, [cart?.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-print KOT when order is placed
  // Prints if: user clicked "KOT & Print" button (checks autoPrintOnKOTAndPrint flag)
  //        OR: autoPrintOnPlaceOrder setting is ON (auto-print on every Place Order)
  useEffect(() => {
    if (!orderSuccess?.kotData || typeof window === 'undefined') return;
    // Skip optimistic render (orderId is null before API returns) to avoid double-printing
    if (!orderSuccess.kotData.orderId) return;

    const isNative = supportsNativeAutoPrint();
    const buttonPrintRequested = window.__autoPrintKOT;
    const autoPrintEnabled = !!printSettings?.autoPrintOnPlaceOrder;

    // On native (Tauri): KOT & Print button respects its own flag
    // On web: KOT & Print always prints (no flag control)
    const kotAndPrintAllowed = isNative ? (printSettings?.autoPrintOnKOTAndPrint !== false) : true;
    const shouldPrint = (buttonPrintRequested && kotAndPrintAllowed) || autoPrintEnabled;

    console.log('[OrderSummary] KOT print effect fired:', { isNative, buttonPrintRequested, autoPrintEnabled, kotAndPrintAllowed, orderId: orderSuccess?.kotData?.orderId });

    if (!shouldPrint) {
      window.__autoPrintKOT = false;
      return;
    }

    window.__autoPrintKOT = false;
    const timer = setTimeout(() => {
      const k = orderSuccess.kotData;
      if (!k) return;

      const kotLabels = {
        kitchenOrder: t('invoice.kitchenOrder'), orderHash: t('invoice.orderHash'),
        table: t('invoice.table'), room: t('invoice.room'), time: t('invoice.time'),
        date: t('invoice.date'), customer: t('invoice.customer'), type: t('invoice.type'),
        waiter: t('invoice.waiter'), qty: t('invoice.qty'), item: t('invoice.item'),
        totalItems: t('invoice.totalItems'), specialInstructions: t('invoice.specialInstructions'),
        note: t('invoice.note'),
      };
      const kotContent = generateKOTHTML(k, printSettings || {}, kotLabels);

      if (isNative) {
        console.log('[OrderSummary] Sending KOT to native printer...');
        printDocument({ html: kotContent, type: 'kot', printSettings: printSettings || {} });
        // Track printed order to prevent duplicate from Pusher auto-print
        if (k.orderId) window.__lastLocalPrintedKOT = k.orderId;
      } else {
        // Web: window.open + print dialog
        const newPw = window.open('', '_blank', 'width=400,height=600');
        if (newPw) {
          kotPrintWindowRef.current = newPw;
          newPw.document.write(kotContent);
          newPw.document.close();
          newPw.focus();
          setTimeout(() => newPw.print(), 400);
        }
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [orderSuccess?.kotData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-print Bill when billing completes
  // Prints if: user clicked "Bill & Print" button (checks autoPrintOnBillAndPrint flag)
  //        OR: autoPrintOnCompleteBilling setting is ON (auto-print on every Complete Billing)
  useEffect(() => {
    if (!showInvoicePermanently || !invoice || typeof window === 'undefined') return;

    const isNative = supportsNativeAutoPrint();
    const buttonPrintRequested = window.__autoPrintBill;
    const autoPrintEnabled = !!printSettings?.autoPrintOnCompleteBilling;

    // On native (Tauri): Bill & Print button respects its own flag
    // On web: Bill & Print always prints (no flag control)
    const billAndPrintAllowed = isNative ? (printSettings?.autoPrintOnBillAndPrint !== false) : true;
    const shouldPrint = (buttonPrintRequested && billAndPrintAllowed) || autoPrintEnabled;

    console.log('[OrderSummary] Bill print effect fired:', { isNative, buttonPrintRequested, autoPrintEnabled, billAndPrintAllowed, invoiceId: invoice?.id });

    if (!shouldPrint) {
      window.__autoPrintBill = false;
      return;
    }

    window.__autoPrintBill = false;
    const timer = setTimeout(() => {
        if (!invoice) return;
        const currencySymbol = getCurrencySymbol();

        // Build bill labels from i18n
        const billLabels = {
          billTitle: bLabels.billTitle, billLabel: bLabels.billLabel,
          itemCol: bLabels.itemCol, qtyCol: bLabels.qtyCol, amt: t('invoice.amt'),
          date: t('invoice.date'), table: t('invoice.table'), room: t('invoice.room'),
          customer: bLabels.customerLabel, payment: t('invoice.payment'),
          subtotal: t('invoice.subtotal'), offer: t('invoice.offer'),
          manualDiscount: t('invoice.manualDiscount'), loyaltyRedeem: t('invoice.loyaltyRedeem'),
          serviceCharge: t('invoice.serviceCharge'), tip: t('invoice.tip'),
          roundOff: t('invoice.roundOff'), total: t('invoice.total'),
          splitPayment: t('invoice.splitPayment'), cashReceived: t('invoice.cashReceived'),
          change: t('invoice.change'), partialPayment: t('invoice.partialPayment'),
          paid: t('invoice.paid'), outstanding: t('invoice.outstanding'),
          walletApplied: t('dashboard.walletApplied'), amountToPay: t('dashboard.amountToPay'),
          footer: bLabels.footer, poweredBy: t('invoice.poweredBy'),
          tel: t('invoice.tel'),
        };

        const invoiceData = {
          ...invoice,
          items: invoice?.items || orderSuccess?.kotData?.items || [],
          currencySymbol,
        };
        const invoiceContent = generateBillHTML(invoiceData, printSettings || {}, billLabels);

        // Native (Tauri/Capacitor): use native print bridge — works offline
        if (supportsNativeAutoPrint()) {
          // Track printed order BEFORE printing to prevent duplicate from Pusher auto-print
          const localOrderId = invoice?.id || invoice?.orderId;
          if (localOrderId) {
            window.__lastLocalPrintedBill = localOrderId;
            window.__lastLocalPrintedTokens = localOrderId;
          }
          printDocument({ html: invoiceContent, type: 'bill', printSettings: printSettings || {} });
          // Print food court tokens after bill on native (each token = separate print job with auto-cut)
          printFoodCourtTokens(invoice?.restaurantId, invoice?.orderId || invoice?.id, { delay: 900 });
        } else {
          // Web: window.open + print dialog
          const win = window.open('', '_blank', 'width=800,height=600');
          if (win) {
            invoicePrintWindowRef.current = win;
            win.document.write(invoiceContent);
            win.document.close();
            win.focus();
            setTimeout(() => {
              win.print();
              printFoodCourtTokens(invoice?.restaurantId, invoice?.orderId || invoice?.id, { delay: 900 });
            }, 500);
          }
        }
      }, 800);
      return () => clearTimeout(timer);
  }, [showInvoicePermanently, invoice]); // eslint-disable-line react-hooks/exhaustive-deps

  // Send bill on WhatsApp (via API)
  const handleSendBillWhatsApp = async () => {
    if (!restaurantId || !invoice) return;
    const phone = invoice?.customerPhone || invoice?.customerMobile || customerMobile;
    if (!phone) {
      alert('Customer phone number not available. Add customer phone to send bill on WhatsApp.');
      return;
    }
    setWaSending(true);
    try {
      const res = await apiClient.sendBillOnWhatsApp(restaurantId, {
        customerPhone: phone,
        customerName: invoice?.customerName || customerName || '',
        amount: invoice?.grandTotal ?? grandTotal ?? 0,
        orderId: invoice?.dailyOrderId || invoice?.orderId || '',
        restaurantName: invoice?.restaurantName || restaurantName || '',
      });
      if (res?.success) {
        setWaSent(true);
      } else {
        alert(res?.error || 'Failed to send bill on WhatsApp');
      }
    } catch (err) {
      alert(err?.error || err?.message || 'Failed to send bill on WhatsApp');
    } finally {
      setWaSending(false);
    }
  };

  const printPreviewedFoodCourtTokens = () => {
    if (!foodCourtTokenPreview?.tokens?.length) return;
    const html = buildTokenSlipsDocumentHTML(foodCourtTokenPreview.tokens, printSettings || {});
    printHtmlInHiddenFrame(html).catch((err) => {
      console.error('Food court token preview print failed:', err);
      alert('Token preview could not be printed.');
    });
  };

  const tokenSlipPalette = [
    { bg: '#fef2f2', fg: '#b91c1c', border: '#fecaca', icon: FaTag },
    { bg: '#eff6ff', fg: '#1d4ed8', border: '#bfdbfe', icon: FaUtensils },
    { bg: '#f0fdf4', fg: '#15803d', border: '#bbf7d0', icon: FaConciergeBell },
    { bg: '#fff7ed', fg: '#c2410c', border: '#fed7aa', icon: FaPrint },
    { bg: '#f5f3ff', fg: '#6d28d9', border: '#ddd6fe', icon: FaCreditCard },
    { bg: '#ecfeff', fg: '#0e7490', border: '#a5f3fc', icon: FaShoppingCart },
  ];

  const getTokenSlipTheme = (index) => tokenSlipPalette[index % tokenSlipPalette.length];

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate manual discount amount (must be defined before calculateTax which depends on it)
  const getManualDiscountAmount = useCallback(() => {
    const val = parseFloat(manualDiscountValue) || 0;
    const subtotal = getTotalAmount();
    if (manualDiscountTypeState === 'percentage') {
      return Math.round((subtotal * val / 100) * 100) / 100;
    }
    return Math.round(Math.min(val, subtotal) * 100) / 100;
  }, [manualDiscountValue, manualDiscountTypeState, getTotalAmount]);

  // Loyalty discount calculation — points / redemptionRate = discount amount
  // redemptionRate=1 → 1pt=₹1, redemptionRate=10 → 10pts=₹1, redemptionRate=100 → 100pts=₹1
  const getLoyaltyDiscountAmount = useCallback(() => {
    if (!loyaltySettings?.enabled || !redeemLoyaltyPoints || redeemLoyaltyPoints <= 0) return 0;
    const redemptionRate = Math.max(1, Number(loyaltySettings.redemptionRate) || 1);
    return Math.round((redeemLoyaltyPoints / redemptionRate) * 100) / 100;
  }, [redeemLoyaltyPoints, loyaltySettings]);

  // Effective offer discount: use the offer engine's computed value once re-selection is complete,
  // otherwise fall back to the saved order's offer discount while offers are still loading/re-selecting.
  // This prevents the billing total from showing a partial discount (e.g., auto-applied generic offer
  // of ₹23 when saved order had ₹58 from generic + customer-specific offers combined).
  const effectiveOfferDiscount = offersPreFilled.current
    ? offerDiscount
    : (currentOrder?.offerDiscount > 0 ? currentOrder.offerDiscount : offerDiscount);

  // Loyalty points to earn on this order
  const getLoyaltyPointsToEarn = useCallback(() => {
    if (!loyaltySettings?.enabled) return 0;
    const earnPerAmount = loyaltySettings.earnPerAmount || 100;
    const pointsRate = loyaltySettings.pointsEarned || 4;
    const subtotal = getTotalAmount();
    const discTotal = effectiveOfferDiscount + getManualDiscountAmount();
    const loyaltyDisc = getLoyaltyDiscountAmount();
    // If redeeming and not allowed to earn, return 0
    if (redeemLoyaltyPoints > 0 && !loyaltySettings.earnPointsOnRedemption) return 0;
    const eligibleAmount = loyaltySettings.earnOnFullAmount
      ? Math.max(0, subtotal - discTotal)
      : Math.max(0, subtotal - discTotal - loyaltyDisc);
    return Math.floor(eligibleAmount / earnPerAmount) * pointsRate;
  }, [loyaltySettings, getTotalAmount, effectiveOfferDiscount, getManualDiscountAmount, getLoyaltyDiscountAmount, redeemLoyaltyPoints]);

  // Coupon discount
  const getCouponDiscountAmount = () => appliedCoupon?.discountAmount || 0;

  // Total discount for display
  const totalDiscountAmount = effectiveOfferDiscount + getManualDiscountAmount() + getLoyaltyDiscountAmount() + getCouponDiscountAmount();

  // Discount settings from taxSettings
  const discountSettings = taxSettings?.discountSettings || {};
  const discountEnabled = discountSettings.enabled || false;
  const canEditManualDiscount = discountEnabled &&
    discountSettings.allowManualDiscount !== false &&
    (discountSettings.manualDiscountRoles || ['owner']).includes(userRole?.toLowerCase());

  // Check if current user role is allowed for a billing feature
  // Empty/missing roles array = all roles allowed (backward compatible)
  const isRoleAllowed = useCallback((rolesArray) => {
    if (!rolesArray || rolesArray.length === 0) return true;
    return rolesArray.includes(userRole?.toLowerCase());
  }, [userRole]);

  // Coupon helpers
  const couponsEnabled = offerSettings?.couponsEnabled === true;

  const handleApplyCoupon = async (code) => {
    if (!code?.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await apiClient.validateCoupon(restaurantId, code.trim(), customerMobile || '', getTotalAmount());
      if (res.valid) {
        // Stacking check
        if (!offerSettings?.allowCouponsWithOffers && effectiveOfferDiscount > 0) {
          setCouponError('Remove offers to use a coupon');
          setCouponLoading(false);
          return;
        }
        setAppliedCoupon({ ...res.coupon, discountAmount: res.discountAmount });
        setCouponCode('');
        setCouponError('');
      } else {
        setCouponError(res.reason || 'Invalid coupon');
      }
    } catch (err) {
      setCouponError('Failed to validate coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  // Fetch customer coupons when customer phone is set
  useEffect(() => {
    if (!couponsEnabled || !customerMobile || lookupStatus !== 'found') {
      setCustomerCoupons([]);
      return;
    }
    apiClient.getCustomerCoupons(restaurantId, customerMobile)
      .then(res => setCustomerCoupons(res.coupons || []))
      .catch(() => setCustomerCoupons([]));
  }, [couponsEnabled, customerMobile, lookupStatus, restaurantId]);

  // Compute unit price for an item considering variant and selected customizations
  // Uses item.price (which reflects the active pricing rule) over item.basePrice
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getItemUnitPrice = useCallback((cartItem) => {
    let unitPrice;
    if (cartItem?.selectedVariant?.price != null) {
      unitPrice = cartItem.selectedVariant.price;
    } else if (multiPricingEnabled && activePricingRuleId) {
      // Check per-item pricing rule override (cart item carries pricingRules from menu item)
      const perItemPrice = cartItem?.pricingRules?.[activePricingRuleId];
      const parsed = perItemPrice != null ? Number(perItemPrice) : NaN;
      if (!isNaN(parsed) && parsed >= 0) {
        unitPrice = parsed;
      } else {
        // No per-item price for this rule — use original base price
        unitPrice = typeof cartItem?.basePrice === 'number' ? cartItem.basePrice
          : typeof cartItem?.price === 'number' ? cartItem.price : 0;
      }
    } else {
      // No multi-pricing — use price as-is
      unitPrice = typeof cartItem?.price === 'number' ? cartItem.price
        : typeof cartItem?.basePrice === 'number' ? cartItem.basePrice : 0;
    }
    // Validate customization prices against current menu when possible
    let extras = 0;
    if (Array.isArray(cartItem?.selectedCustomizations) && cartItem.selectedCustomizations.length > 0) {
      const menuItem = menuItems.find(m => m.id === cartItem.id);
      const menuCustomizations = menuItem?.customizations || [];
      extras = cartItem.selectedCustomizations.reduce((sum, c) => {
        // Try to find the matching customization in current menu for price validation
        if (menuCustomizations.length > 0) {
          const menuCust = menuCustomizations.find(mc => mc.id === c.id || mc.name === c.name);
          if (menuCust && typeof menuCust.price === 'number') return sum + menuCust.price;
        }
        return sum + (c?.price || 0);
      }, 0);
    } else if (typeof cartItem?.customizationPrice === 'number') {
      extras = cartItem.customizationPrice;
    }
    return (unitPrice || 0) + (extras || 0);
  }, [multiPricingEnabled, activePricingRuleId, menuItems]);
  
  // Determine if an item's price includes tax (inclusive pricing)
  const isItemTaxInclusive = useCallback((item, settings) => {
    if (item.taxInclusive === true) return true;
    if (item.taxInclusive === false) return false;
    return settings?.taxInclusivePricing === true;
  }, []);

  // Resolve which taxes apply to a given item (per-item > category > restaurant default)
  // When a tax group has alsoApplyGlobalTax: true, both group taxes AND global taxes apply.
  const resolveTaxesForItem = useCallback((item, settings, categories) => {
    if (!settings?.enabled) return [];
    const groups = settings.taxGroups || [];
    const globalTaxes = (settings.taxes && settings.taxes.length > 0)
      ? settings.taxes.filter(tx => tx.enabled)
      : (settings.defaultTaxRate
        ? [{ name: 'Tax', rate: settings.defaultTaxRate, type: 'percentage' }]
        : []);

    const resolveGroup = (group) => {
      const groupTaxes = group.taxes || [];
      if (group.alsoApplyGlobalTax && globalTaxes.length > 0) {
        const merged = [...groupTaxes];
        for (const gt of globalTaxes) {
          if (!merged.some(t => t.name === gt.name && t.rate === gt.rate)) merged.push(gt);
        }
        return merged;
      }
      return groupTaxes;
    };

    // Priority 1: Item-level tax group
    if (item.taxGroupId) {
      const g = groups.find(gr => gr.id === item.taxGroupId);
      if (g) return resolveGroup(g);
    }
    // Priority 2: Category-level tax group
    const catId = item.category || item.categoryId;
    if (catId && categories && categories.length > 0) {
      const cat = categories.find(c => c.id === catId || c.name === catId);
      if (cat?.taxGroupId) {
        const g = groups.find(gr => gr.id === cat.taxGroupId);
        if (g) return resolveGroup(g);
      }
    }
    // Priority 3: Restaurant default taxes (global)
    return globalTaxes;
  }, []);

  const calculateTax = useCallback(() => {
    // Tax calculation started
    if (cart.length === 0 || !restaurantId) {
      setTaxBreakdown([]);
      setTotalTax(0);
      setGrandTotal(getTotalAmount());
      return;
    }

    // Use cached tax settings instead of calling API
    if (!taxSettings?.enabled) {
      // Tax not enabled — skip tax calculation
      setTaxBreakdown([]);
      setTotalTax(0);
      // Apply discounts even if tax is disabled
      const subtotal = getTotalAmount();
      const loyaltyDiscAmt = getLoyaltyDiscountAmount();
      const discTotal = effectiveOfferDiscount + getManualDiscountAmount() + loyaltyDiscAmt + getCouponDiscountAmount();
      const discountedAmt = Math.max(0, subtotal - discTotal);
      const sc = calcServiceCharge(discountedAmt);
      setServiceChargeAmount(sc);
      const afterTax = discountedAmt + sc;
      const withTip = afterTax + tipAmount;
      const ro = calcRoundOff(withTip);
      setRoundOffAmount(ro);
      setGrandTotal(withTip + ro);
      return;
    }

    const subtotal = getTotalAmount();
    // Apply discounts before tax (offers + manual + loyalty + coupon)
    const loyaltyDiscAmt = getLoyaltyDiscountAmount();
    const couponDiscAmt = getCouponDiscountAmount();
    const discTotal = effectiveOfferDiscount + getManualDiscountAmount() + loyaltyDiscAmt + couponDiscAmt;
    const discountedAmt = Math.max(0, subtotal - discTotal);

    // Service charge (after discounts, before tax)
    const sc = calcServiceCharge(discountedAmt);
    setServiceChargeAmount(sc);

    // Check if per-item tax is needed (taxGroups exist)
    const hasTaxGroups = taxSettings.taxGroups && taxSettings.taxGroups.length > 0;

    let calculatedTaxes = [];
    let totalTaxAmount = 0;

    if (hasTaxGroups) {
      // Per-item tax calculation with discountApplicable support
      // Discountable subtotal: only items where discountApplicable !== false
      const discountableSubtotal = cart.reduce((sum, cartItem) => {
        if (cartItem.discountApplicable === false) return sum;
        return sum + getItemUnitPrice(cartItem) * (cartItem.quantity || 1);
      }, 0);

      const taxTotals = {};
      for (const cartItem of cart) {
        const itemUnitPrice = getItemUnitPrice(cartItem);
        const itemTotal = itemUnitPrice * (cartItem.quantity || 1);
        const isDiscountable = cartItem.discountApplicable !== false;
        const isInclusive = isItemTaxInclusive(cartItem, taxSettings);
        // Proportional discount share: only among discountable items
        const itemDiscShare = (isDiscountable && discountableSubtotal > 0)
          ? (itemTotal / discountableSubtotal) * discTotal
          : 0;
        const itemTaxable = Math.max(0, itemTotal - itemDiscShare);
        // Service charge distributed proportional to post-discount taxable amount
        const postDiscSubtotal = Math.max(0, subtotal - discTotal);
        const itemSCShare = postDiscSubtotal > 0
          ? (itemTaxable / postDiscSubtotal) * sc
          : (subtotal > 0 ? (itemTotal / subtotal) * sc : 0);
        const itemTaxableWithSC = itemTaxable + itemSCShare;
        // Resolve taxes for this item
        const itemTaxes = resolveTaxesForItem(cartItem, taxSettings, restaurantCategories);
        const totalRate = itemTaxes.reduce((sum, t) => sum + (t.rate || 0), 0);
        for (const tax of itemTaxes) {
          // Inclusive: back-calculate tax from price. Exclusive: add on top.
          // Accumulate raw (unrounded) values — round only final slab totals
          const amt = isInclusive
            ? (itemTaxableWithSC * (tax.rate || 0) / (100 + totalRate))
            : (itemTaxableWithSC * (tax.rate || 0) / 100);
          const key = `${tax.name || 'Tax'}|${tax.rate || 0}|${isInclusive}`;
          if (!taxTotals[key]) taxTotals[key] = { name: tax.name || 'Tax', rate: tax.rate || 0, amount: 0, inclusive: isInclusive };
          taxTotals[key].amount += amt;
          totalTaxAmount += amt;
        }
      }
      calculatedTaxes = Object.values(taxTotals).map(tx => ({
        ...tx,
        amount: Math.round(tx.amount * 100) / 100
      }));
      totalTaxAmount = Math.round(totalTaxAmount * 100) / 100;
    } else {
      // Flat tax calculation (original behavior — no tax groups)
      const taxableAmount = discountedAmt + sc;
      const isGlobalInclusive = taxSettings.taxInclusivePricing === true;
      if (taxSettings.taxes && taxSettings.taxes.length > 0) {
        const enabledTaxes = taxSettings.taxes.filter(tax => tax.enabled);
        const totalRate = enabledTaxes.reduce((sum, t) => sum + (t.rate || 0), 0);
        enabledTaxes.forEach(tax => {
            const taxAmount = isGlobalInclusive
              ? taxableAmount * (tax.rate / (100 + totalRate))
              : taxableAmount * (tax.rate / 100);
            calculatedTaxes.push({
              name: tax.name,
              rate: tax.rate,
              amount: taxAmount,
              inclusive: isGlobalInclusive
            });
            totalTaxAmount += taxAmount;
        });
      } else if (taxSettings.defaultTaxRate && !Array.isArray(taxSettings.taxes)) {
        const taxAmount = isGlobalInclusive
          ? taxableAmount * (taxSettings.defaultTaxRate / (100 + taxSettings.defaultTaxRate))
          : taxableAmount * (taxSettings.defaultTaxRate / 100);
        calculatedTaxes.push({
          name: 'GST',
          rate: taxSettings.defaultTaxRate,
          amount: taxAmount,
          inclusive: isGlobalInclusive
        });
        totalTaxAmount = taxAmount;
      }
    }

    // Tax calculation complete
    setTaxBreakdown(calculatedTaxes);
    setTotalTax(totalTaxAmount);

    // After tax, add tip and round-off — only add exclusive tax (inclusive is already in discountedAmt)
    const exclusiveTax = calculatedTaxes.filter(t => !t.inclusive).reduce((sum, t) => sum + (t.amount || 0), 0);
    const afterTax = discountedAmt + sc + Math.round(exclusiveTax * 100) / 100;
    const withTip = afterTax + tipAmount;
    const ro = calcRoundOff(withTip);
    setRoundOffAmount(ro);
    setGrandTotal(withTip + ro);

  }, [cart, restaurantId, getTotalAmount, taxSettings, effectiveOfferDiscount, getManualDiscountAmount, getLoyaltyDiscountAmount, appliedCoupon, tipAmount, calcServiceCharge, calcRoundOff, resolveTaxesForItem, isItemTaxInclusive, restaurantCategories]);
  
  // Flag that pre-fill is needed when entering edit mode (prevents amount flicker)
  // Must run BEFORE the tax calculation useLayoutEffect to prevent wrong totals
  // Uses ref for synchronous cross-hook visibility (useState batches and can cancel out)
  useLayoutEffect(() => {
    if (currentOrder && !editPreFilled.current) {
      editPreFillPendingRef.current = true;
      setEditPreFillPending(true);
    }
  }, [currentOrder]);

  // Calculate tax when cart changes — useLayoutEffect ensures billing totals
  // are recalculated synchronously before paint, preventing stale grandTotal
  // when offerDiscount changes (avoids showing discount but wrong total)
  // IMPORTANT: Check the REF (not state) because useState updates are batched
  // and not visible to other hooks in the same render cycle
  useLayoutEffect(() => {
    if (editPreFillPendingRef.current) return; // Wait for pre-fill to complete before calculating
    if (cart.length > 0 && restaurantId && taxSettings) {
      calculateTax();
    } else {
      setTaxBreakdown([]);
      setTotalTax(0);
      setGrandTotal(getTotalAmount());
    }
  }, [calculateTax, cart, restaurantId, getTotalAmount, taxSettings, effectiveOfferDiscount, manualDiscountValue, manualDiscountTypeState, redeemLoyaltyPoints, tipAmount, billingSettings, appliedCoupon, editPreFillPending]);

  // Pre-populate special instructions when editing an existing order
  useEffect(() => {
    if (currentOrder?.specialInstructions) {
      setSpecialInstructions(currentOrder.specialInstructions);
    }
  }, [currentOrder]);

  // Pre-populate loyalty redemption from saved order (e.g., billing modal from order history)
  useEffect(() => {
    if (loyaltyPreFilled.current) return;
    const savedRedeemed = currentOrder?.loyaltyPointsRedeemed || currentOrder?.redeemLoyaltyPoints || 0;
    if (savedRedeemed > 0 && customerData?.loyaltyPoints > 0) {
      // Only pre-fill if customer has enough points and order had redemption
      const pointsToSet = Math.min(savedRedeemed, customerData.loyaltyPoints);
      setRedeemLoyaltyPoints(pointsToSet);
      setSliderLocalValue(pointsToSet);
      loyaltyPreFilled.current = true;
    }
  }, [currentOrder, customerData]);

  // Pre-populate service charge and manual discount when editing an existing order
  // Uses useLayoutEffect so values are set synchronously BEFORE tax calculation re-triggers,
  // preventing the flash of wrong totals (e.g. showing ₹207 before settling to ₹184)
  useLayoutEffect(() => {
    if (editPreFilled.current) return;
    if (!currentOrder || cart?.length === 0) return;

    // Service charge toggle state
    if (currentOrder.serviceChargeEnabled === true) {
      setServiceChargeOverride(true);
    } else if (currentOrder.serviceChargeEnabled === false) {
      setServiceChargeOverride(false);
    } else if (billingSettings.serviceChargeEnabled && (!currentOrder.serviceChargeAmount || currentOrder.serviceChargeAmount <= 0)) {
      // Backward compat: SC is globally enabled but order had no SC amount → was explicitly off
      setServiceChargeOverride(false);
    }

    // Service charge rate override (only set if order rate differs from current global rate)
    if (currentOrder.serviceChargeRate != null && currentOrder.serviceChargeRate > 0 && billingSettings.serviceChargeRate != null && currentOrder.serviceChargeRate !== billingSettings.serviceChargeRate) {
      setServiceChargeRateOverride(currentOrder.serviceChargeRate);
    }

    // Manual discount
    if (currentOrder.manualDiscountValue != null && currentOrder.manualDiscountValue > 0) {
      setManualDiscountValue(String(currentOrder.manualDiscountValue));
      setManualDiscountTypeState(currentOrder.manualDiscountType || 'flat');
    } else if (currentOrder.manualDiscount > 0) {
      // Backward compat: old orders only have the computed amount, restore as flat
      setManualDiscountValue(String(currentOrder.manualDiscount));
      setManualDiscountTypeState(currentOrder.manualDiscountType || 'flat');
    }

    // Coupon code - restore if one was applied (re-validation happens on next apply)
    if (currentOrder.couponCode && !appliedCoupon) {
      setCouponCode(currentOrder.couponCode);
      // Restore as applied coupon so the discount shows immediately
      if (currentOrder.couponDiscount > 0) {
        setAppliedCoupon({
          id: currentOrder.couponId || null,
          code: currentOrder.couponCode,
          discountAmount: currentOrder.couponDiscount,
        });
      }
    }

    // Tip - restore for billing mode (completing an order that already had a tip)
    if (billingMode && currentOrder.tipAmount > 0) {
      setTipAmount(currentOrder.tipAmount);
      if (currentOrder.tipPercentage) setTipPercentage(currentOrder.tipPercentage);
    }

    // Delivery info - restore person name, phone, cash handed over, and address
    if (currentOrder.deliveryInfo) {
      setDeliveryInfo({
        personName: currentOrder.deliveryInfo.personName || '',
        personPhone: currentOrder.deliveryInfo.personPhone || '',
        cashHandedOver: currentOrder.deliveryInfo.cashHandedOver || false,
      });
    }
    if (currentOrder.deliveryAddress) {
      setDeliveryAddress(currentOrder.deliveryAddress);
    }

    editPreFilled.current = true;
    editPreFillPendingRef.current = false;
    // Do NOT call setEditPreFillPending(false) here — the setState(true) from hook 1 must
    // survive batching to trigger a re-render. A separate useEffect clears it after re-render.
  }, [currentOrder, cart?.length, billingSettings.serviceChargeRate, billingSettings.serviceChargeEnabled]);

  // Clear the editPreFillPending state after pre-fill completes and re-render settles.
  // This must be a separate useEffect (not useLayoutEffect) so it runs AFTER the tax
  // calculation layout effect has already re-run with the correct pre-filled values.
  useEffect(() => {
    if (editPreFillPending && editPreFilled.current) {
      setEditPreFillPending(false);
    }
  }, [editPreFillPending]);

  // Re-select previously applied offers in edit mode (runs after offer engine loads offers)
  // Must override any auto-applied offers — the saved order's offer selection takes priority.
  // Tracks which offer IDs have been re-selected so it can re-run when customer-specific
  // offers become available (customerGroupIds loads async → applicableOffers updates).
  useEffect(() => {
    if (!currentOrder || cart?.length === 0) return;
    if (!applicableOffers || applicableOffers.length === 0) return;

    // Get previously applied offer IDs from the order
    const prevOfferIds = currentOrder.offerIds || (currentOrder.appliedOffer ? [currentOrder.appliedOffer.id || currentOrder.appliedOffer._id] : []);
    if (prevOfferIds.length === 0) {
      offersPreFilled.current = true;
      return;
    }

    // Only re-select offers that are still applicable (validated by the offer engine)
    const stillApplicable = prevOfferIds.filter(oid =>
      applicableOffers.some(o => (o.id || o._id) === oid)
    );

    if (stillApplicable.length === 0) {
      // No saved offers found — might be waiting for customer groups to load.
      // Finalize if: no customer data, OR customer groups have already loaded
      // (meaning applicableOffers is complete and saved offers are truly gone)
      if (!customerData || customerOfferGroups?.length > 0 || !currentOrder.customerId) {
        offersPreFilled.current = true;
      }
      return;
    }

    // Check if we've already re-selected exactly these offers (avoid re-running)
    const prevReselected = offersReselectedIds.current;
    if (prevReselected && stillApplicable.length === prevReselected.length &&
        stillApplicable.every(id => prevReselected.includes(id))) {
      return; // Already re-selected these exact offers
    }

    if (offerSettings.allowMultipleOffers) {
      // Multi-offer mode: first remove any auto-applied offers that weren't in the saved order,
      // then add the saved offers that are still applicable
      selectedOfferIds.forEach(oid => {
        if (!stillApplicable.includes(oid)) {
          toggleOffer(oid); // toggleOffer removes if already selected
        }
      });
      stillApplicable.forEach(oid => {
        if (!selectedOfferIds.includes(oid)) {
          toggleOffer(oid);
        }
      });
    } else {
      // Single-offer mode: always re-select the saved offer (override auto-apply)
      // Use the best-matching saved offer (not just the first)
      setSelectedOfferId(stillApplicable[0]);
    }

    offersReselectedIds.current = [...stillApplicable];

    // Only finalize when all saved offers are accounted for
    if (stillApplicable.length >= prevOfferIds.length) {
      offersPreFilled.current = true;
    }
  }, [currentOrder, cart?.length, applicableOffers, offerSettings.allowMultipleOffers, customerOfferGroups?.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Safety: finalize offersPreFilled after 3s even if customer groups never load
  // (prevents stale saved offerDiscount from being used indefinitely)
  useEffect(() => {
    if (!currentOrder || offersPreFilled.current) return;
    const timer = setTimeout(() => {
      if (!offersPreFilled.current) {
        offersPreFilled.current = true;
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [currentOrder]);

  // Voice Assistant Functions
  const fuzzyMatchMenuItems = (transcript, menuItems) => {
    if (!transcript || menuItems.length === 0) return [];
    
    const lowerTranscript = transcript.toLowerCase();
    const results = [];
    
    menuItems.forEach(item => {
      const itemName = item.name.toLowerCase();
      
      // Exact match
      if (itemName.includes(lowerTranscript) || lowerTranscript.includes(itemName)) {
        results.push({ item, confidence: 1.0, matchType: 'exact' });
        return;
      }
      
      // Partial word match
      const itemWords = itemName.split(' ');
      const transcriptWords = lowerTranscript.split(' ');
      
      let matchCount = 0;
      itemWords.forEach(word => {
        if (transcriptWords.some(tword => word.includes(tword) || tword.includes(word))) {
          matchCount++;
        }
      });
      
      if (matchCount > 0) {
        const confidence = matchCount / itemWords.length;
        if (confidence >= 0.5) {
          results.push({ item, confidence, matchType: 'partial' });
        }
      }
      
      // Category match
      if (item.category && item.category.toLowerCase().includes(lowerTranscript)) {
        results.push({ item, confidence: 0.7, matchType: 'category' });
      }
    });
    
    // Sort by confidence
    results.sort((a, b) => b.confidence - a.confidence);
    
    // Return top 3 matches
    return results.slice(0, 3);
  };
  
  const parseQuantity = (transcript) => {
    const quantityMatch = transcript.match(/\d+/);
    return quantityMatch ? parseInt(quantityMatch[0]) : 1;
  };
  
  const startVoiceListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setVoiceError('Speech recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError('');
      setVoiceTranscript('');
    };
    
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setVoiceTranscript(transcript);
      
      // Process the transcript
      await processVoiceCommand(transcript);
      
      recognition.stop();
      setIsListening(false);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setVoiceError(`Error: ${event.error}`);
      setIsListening(false);
      recognition.stop();
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };
  
  const processVoiceCommand = async (transcript) => {
    setVoiceProcessing(true);
    setVoiceError('');
    
    try {
      // If full ChatGPT mode is disabled, use local fuzzy matching first
      if (!useFullChatGPT) {
        const localMatches = fuzzyMatchMenuItems(transcript, menuItems);
        
        if (localMatches.length > 0 && localMatches[0].confidence >= 0.7) {
          // High confidence local match - add immediately
          const matchedItem = localMatches[0].item;
          const quantity = parseQuantity(transcript);
          
          setRecognizedItems([{
            id: matchedItem.id,
            name: matchedItem.name,
            price: matchedItem.price,
            quantity: quantity
          }]);
          setShowVoiceConfirm(true);
          setVoiceProcessing(false);
          return;
        }
      }
      
      // Use ChatGPT for low confidence or full ChatGPT mode
      const response = await apiClient.processVoiceOrder(transcript, restaurantId);
      
      if (response.items && response.items.length > 0) {
        setRecognizedItems(response.items);
        setShowVoiceConfirm(true);
      } else {
        setVoiceError('No items found. Please try again or check the menu.');
      }
    } catch (error) {
      console.error('Voice processing error:', error);
      setVoiceError(error.message || 'Failed to process voice command. Please try again.');
    } finally {
      setVoiceProcessing(false);
    }
  };
  
  const confirmVoiceOrder = () => {
    recognizedItems.forEach(item => {
      const existingItem = cart.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        onUpdateCartItemQuantity(existingItem.id, existingItem.quantity + item.quantity);
      } else {
        onAddToCart({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        });
      }
    });
    
    setShowVoiceConfirm(false);
    setRecognizedItems([]);
    setVoiceTranscript('');
  };

  // Force recalculation when cart items change (for edit mode)
  // Uses a ref to always call the LATEST calculateTax (avoids stale closure in setTimeout
  // overwriting correct values calculated by the useLayoutEffect during pre-fill)
  const calculateTaxRef = useRef(calculateTax);
  calculateTaxRef.current = calculateTax;
  const cartKey = cart.map(item => `${item.id}-${item.quantity}-${Math.round((item.price || 0) * 100)}`).join(',');
  useEffect(() => {
    if (cart.length > 0) {
      // Cart items changed — force tax recalculation
      // Small delay to ensure cart state is fully updated
      setTimeout(() => {
        if (!editPreFillPendingRef.current) {
          calculateTaxRef.current();
        }
      }, 100);
    }
  }, [cartKey]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Debug logging
  // Debug logging removed for performance (ran on every render)

  // Helper function to check if order summary should be shown based on print settings
  const shouldShowOrderSummary = () => {
    if (!orderSuccess?.show) return false;

    // Master toggle: if disabled, never show success notifications
    if (printSettings?.showSuccessNotifications === false) return false;

    // Determine if this is a kitchen order or billing order
    const isKitchenOrder = orderSuccess?.message?.includes('placed') ||
                           orderSuccess?.message?.includes('Updated') ||
                           orderSuccess?.message?.includes('Kitchen');

    if (isKitchenOrder) {
      // For kitchen orders, check showKOTSummaryAfterOrder setting (default: true)
      return printSettings?.showKOTSummaryAfterOrder !== false;
    } else {
      // For billing orders, check showBillSummaryAfterBilling setting (default: true)
      return printSettings?.showBillSummaryAfterBilling !== false;
    }
  };

  // Auto-clear orderSuccess when success notifications are disabled so cart resets
  useEffect(() => {
    if (orderSuccess?.show && printSettings?.showSuccessNotifications === false) {
      const timer = setTimeout(() => {
        setOrderSuccess(null);
        setInvoice(null);
        setShowInvoicePermanently(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [orderSuccess?.show, printSettings?.showSuccessNotifications]);

  // Helper function to check if manual print button should be shown
  const shouldShowManualPrint = () => {
    return printSettings?.manualPrintEnabled !== false;
  };

  // Apply local tax data overrides to an invoice object (shared by online + offline paths)
  const applyLocalTaxOverrides = (invoiceData, localTaxData) => {
    if (localTaxData.subtotal) invoiceData.subtotal = localTaxData.subtotal;
    if (localTaxData.offerDiscount != null) invoiceData.discountAmount = localTaxData.offerDiscount;
    if (localTaxData.manualDiscount != null) invoiceData.manualDiscount = localTaxData.manualDiscount;
    if (localTaxData.loyaltyDiscount != null) invoiceData.loyaltyDiscount = localTaxData.loyaltyDiscount;
    if (localTaxData.couponDiscount != null) invoiceData.couponDiscount = localTaxData.couponDiscount;
    if (localTaxData.couponCode) invoiceData.couponCode = localTaxData.couponCode;
    if (localTaxData.totalDiscountAmount != null) invoiceData.totalDiscount = localTaxData.totalDiscountAmount;
    if (localTaxData.taxBreakdown?.length) invoiceData.taxBreakdown = localTaxData.taxBreakdown;
    if (localTaxData.finalAmount != null) invoiceData.grandTotal = localTaxData.finalAmount;
    invoiceData.totalTax = localTaxData.taxBreakdown?.reduce((s, t) => s + (t.amount || 0), 0) || 0;
    invoiceData.taxAmount = invoiceData.totalTax;
    if (localTaxData.serviceChargeAmount != null) invoiceData.serviceChargeAmount = localTaxData.serviceChargeAmount;
    if (localTaxData.serviceChargeRate != null) invoiceData.serviceChargeRate = localTaxData.serviceChargeRate;
    if (localTaxData.tipAmount != null) invoiceData.tipAmount = localTaxData.tipAmount;
    if (localTaxData.tipPercentage != null) invoiceData.tipPercentage = localTaxData.tipPercentage;
    if (localTaxData.roundOffAmount != null) invoiceData.roundOffAmount = localTaxData.roundOffAmount;
    if (localTaxData.splitPayments) invoiceData.splitPayments = localTaxData.splitPayments;
    if (localTaxData.cashReceived != null) invoiceData.cashReceived = localTaxData.cashReceived;
    if (localTaxData.changeReturned != null) invoiceData.changeReturned = localTaxData.changeReturned;
    if (localTaxData.partialPayAmount != null) {
      invoiceData.paidAmount = localTaxData.partialPayAmount;
      invoiceData.outstandingAmount = Math.round(((localTaxData.finalAmount || 0) - localTaxData.partialPayAmount) * 100) / 100;
    }
    if (useWallet && parseFloat(walletRedeemAmount) > 0) {
      invoiceData.walletRedeemAmount = parseFloat(walletRedeemAmount);
    }
    return invoiceData;
  };

  const generateInvoice = async (orderId) => {
    // Try API first (gets formatted invoice with restaurant details)
    // Electron: always try API — localRouter handles bill render from SQLite even when offline
    const _isElectronInvoice = typeof window !== 'undefined' && !!window.electronAPI?.apiRequest;
    try {
      if (navigator.onLine || _isElectronInvoice) {
        const response = await apiClient.getBillRender(restaurantId, orderId);
        if (response?.success) {
          const invoiceData = response.invoice || response.bill;
          const localTaxData = buildTaxData();
          applyLocalTaxOverrides(invoiceData, localTaxData);
          setInvoice(invoiceData);
          setShowInvoicePermanently(true);
          apiClient.generateInvoice(orderId).catch((err) =>
            console.warn('Invoice persistence (non-blocking):', err),
          );
          return true;
        }
      }
    } catch (error) {
      console.warn('Bill render API unavailable, generating invoice locally:', error.message);
    }

    // Offline fallback: build invoice from local cart + tax data
    try {
      const localTaxData = buildTaxData();
      const localInvoice = {
        orderId,
        orderNumber: orderId?.slice(-4)?.toUpperCase() || '',
        restaurantName: restaurantName || '',
        items: (cart || []).map(item => ({
          name: item.name,
          quantity: item.quantity || 1,
          price: item.price || 0,
          total: (item.price || 0) * (item.quantity || 1),
          variant: item.selectedVariant?.name,
          customizations: item.selectedCustomizations,
        })),
        tableNumber: tableNumber || selectedTable?.name || selectedTable?.number || '',
        floorName: selectedTable?.floor || '',
        customerName: customerName || 'Walk-in',
        customerPhone: customerMobile || '',
        paymentMethod: paymentMethod || 'cash',
        orderType: orderType || 'dine_in',
        // Delivery fields for receipt printing
        deliveryAddress: orderType === 'delivery' ? (deliveryAddress || null) : null,
        deliveryInfo: orderType === 'delivery' ? {
          personName: deliveryInfo.personName || null,
          personPhone: deliveryInfo.personPhone || null,
          cashHandedOver: deliveryInfo.cashHandedOver || false,
        } : null,
        generatedAt: new Date().toISOString(),
        _offlineGenerated: true,
      };
      applyLocalTaxOverrides(localInvoice, localTaxData);
      setInvoice(localInvoice);
      setShowInvoicePermanently(true);
      return true;
    } catch (err) {
      console.error('Local invoice generation failed:', err);
      return false;
    }
  };
  
  const upiConfigured = upiSettings?.upiEnabled && upiSettings?.upiId;

  // ECR payment terminal hook
  const {
    status: ecrStatus,
    lastResponse: ecrLastResponse,
    error: ecrError,
    doPurchase: ecrDoPurchase,
    reset: ecrReset,
    cancel: ecrCancel,
  } = useEcr(ecrSettings);
  const ecrEnabled = !!ecrSettings?.enabled;

  // Build tax data helper (shared by Place Order, Complete Billing, and UPI confirm)
  const buildTaxData = () => {
    const cashReceivedNum = parseFloat(cashReceived) || 0;
    const changeReturned = cashReceivedNum > 0 ? Math.max(0, cashReceivedNum - (grandTotal ?? 0)) : 0;
    const validSplitPayments = billingSettings.splitPaymentEnabled && splitPayments.length >= 2 && splitPayments.every(sp => sp.amount > 0)
      ? splitPayments.map(sp => ({ method: sp.method, amount: Number(sp.amount) }))
      : null;
    const allOfferIds = offerSettings?.allowMultipleOffers && selectedOfferIds.length > 0
      ? selectedOfferIds
      : (selectedOfferId ? [selectedOfferId] : []);
    // Determine tax inclusive mode from taxBreakdown
    const hasInclusive = taxBreakdown.some(t => t.inclusive);
    const hasExclusive = taxBreakdown.some(t => !t.inclusive);
    const taxInclusiveMode = (hasInclusive && hasExclusive) ? 'mixed' : hasInclusive ? 'inclusive' : 'exclusive';
    return {
      taxBreakdown,
      totalTax,
      taxInclusiveMode,
      showInclusiveTaxOnBill: taxSettings?.showInclusiveTaxOnBill !== false,
      finalAmount: grandTotal ?? getTotalAmount(),
      subtotal: getTotalAmount(),
      specialInstructions: specialInstructions.trim() || null,
      offerIds: allOfferIds,
      manualDiscount: getManualDiscountAmount(),
      offerDiscount: effectiveOfferDiscount,
      selectedOfferName: selectedOfferName || currentOrder?.selectedOfferName || null,
      totalDiscountAmount: effectiveOfferDiscount + getManualDiscountAmount() + getLoyaltyDiscountAmount() + getCouponDiscountAmount(),
      redeemLoyaltyPoints: redeemLoyaltyPoints > 0 ? redeemLoyaltyPoints : 0,
      loyaltyDiscount: getLoyaltyDiscountAmount(),
      couponDiscount: getCouponDiscountAmount() > 0 ? getCouponDiscountAmount() : null,
      couponCode: appliedCoupon?.code || null,
      couponId: appliedCoupon?.id || null,
      serviceChargeRate: serviceChargeAmount > 0 ? (serviceChargeRateOverride !== null ? serviceChargeRateOverride : billingSettings.serviceChargeRate) : null,
      serviceChargeAmount: serviceChargeAmount > 0 ? serviceChargeAmount : null,
      serviceChargeEnabled: serviceChargeOverride,
      manualDiscountType: manualDiscountTypeState,
      manualDiscountValue: manualDiscountValue !== '' ? parseFloat(manualDiscountValue) : null,
      tipAmount: tipAmount > 0 ? tipAmount : null,
      tipPercentage: tipPercentage || null,
      cashReceived: cashReceivedNum > 0 ? cashReceivedNum : null,
      changeReturned: changeReturned > 0 ? changeReturned : null,
      splitPayments: validSplitPayments,
      roundOffAmount: roundOffAmount !== 0 ? roundOffAmount : null,
      compItems: compVoidItems.filter(cv => cv.type === 'comp').length > 0 ? compVoidItems.filter(cv => cv.type === 'comp') : null,
      voidItems: compVoidItems.filter(cv => cv.type === 'void').length > 0 ? compVoidItems.filter(cv => cv.type === 'void') : null,
      partialPayAmount: fullDueMode ? 0 : (parseFloat(partialPayAmount) > 0 ? parseFloat(partialPayAmount) : null),
      fullDue: fullDueMode || undefined,
      managerPin: managerPin || null,
      deliveryInfo: orderType === 'delivery' ? {
        personName: deliveryInfo.personName || null,
        personPhone: deliveryInfo.personPhone || null,
        cashHandedOver: deliveryInfo.cashHandedOver || false,
      } : null,
      deliveryAddress: orderType === 'delivery' ? (deliveryAddress || null) : null,
      walletRedeemAmount: useWallet && parseFloat(walletRedeemAmount) > 0 ? Math.min(parseFloat(walletRedeemAmount), grandTotal ?? getTotalAmount()) : null,
      walletCustomerId: useWallet && parseFloat(walletRedeemAmount) > 0 ? customerData?.id : null,
    };
  };

  const handleUpiConfirm = async () => {
    setShowUpiQr(false);
    if (pendingUpiAction === 'place') {
      if (typeof onPlaceOrder === 'function') {
        onPlaceOrder(buildTaxData());
      }
      if (isMobile && onClose) {
        setTimeout(() => onClose(), 500);
      }
    } else if (pendingUpiAction === 'complete') {
      if (typeof onProcessOrder === 'function') {
        try {
          const result = await onProcessOrder(buildTaxData());
          if (result && result.orderId) {
            await generateInvoice(result.orderId);
            // Redeem coupon after successful order
            if (appliedCoupon?.id) {
              apiClient.redeemCoupon(restaurantId, appliedCoupon.id, result.orderId).catch(err => console.warn('Coupon redeem (non-blocking):', err));
              setAppliedCoupon(null);
            }
          }
        } catch (error) {
          console.error('Error in UPI confirm order:', error);
        }
      }
    }
    setPendingUpiAction(null);
  };

  // Discount approval gating
  const needsDiscountApproval = useCallback(() => {
    if (!discountApprovalSettings?.enabled) return false;
    if (getManualDiscountAmount() <= 0) return false;
    if (discountApproved) return false;
    const roleKey = userRole?.toLowerCase();
    if (roleKey === 'owner') return false;
    const config = discountApprovalSettings.roleConfig?.[roleKey];
    if (!config?.requireApproval) return false;
    if (config.maxDiscountWithoutApproval > 0 && getManualDiscountAmount() <= config.maxDiscountWithoutApproval) return false;
    return true;
  }, [discountApprovalSettings, discountApproved, userRole]);

  const handleDiscountApproved = () => {
    setShowDiscountApproval(false);
    setDiscountApproved(true);
    if (pendingDiscountAction === 'place') {
      if (typeof onPlaceOrder === 'function') onPlaceOrder(buildTaxData());
      if (isMobile && onClose) setTimeout(() => onClose(), 500);
    } else if (pendingDiscountAction === 'complete') {
      handleProcessOrder();
    } else if (pendingDiscountAction === 'placeAndPrint') {
      window.__autoPrintKOT = true;
      if (typeof onPlaceOrderAndPrint === 'function') onPlaceOrderAndPrint(buildTaxData());
    }
    setPendingDiscountAction(null);
  };

  const handleProcessOrder = async () => {
    if (orderBusy) return; // Prevent double-tap while order is processing
    // Full Due requires a customer
    if (fullDueMode && lookupStatus !== 'found') {
      alert('Customer phone number is required for due (udhar) orders. Please enter a valid customer phone first.');
      return;
    }
    // Intercept UPI — show QR modal before processing
    if (paymentMethod === 'upi' && upiConfigured) {
      setPendingUpiAction('complete');
      setShowUpiQr(true);
      return;
    }
    // Intercept Card Terminal (ECR) — initiate terminal payment before processing
    if (paymentMethod === 'card-terminal' && ecrEnabled) {
      const taxData = buildTaxData();
      const amount = taxData.finalAmount;
      const txnId = `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      try {
        const resp = await ecrDoPurchase(amount, txnId);
        if (resp?.ResponseCode === ECR_RESPONSE_CODES.APPROVED) {
          // Attach ECR response to tax data and proceed with order
          taxData.ecrResponse = resp;
          if (typeof onProcessOrder === 'function') {
            const result = await onProcessOrder(taxData);
            if (result && result.orderId) {
              await generateInvoice(result.orderId);
              if (appliedCoupon?.id) {
                apiClient.redeemCoupon(restaurantId, appliedCoupon.id, result.orderId).catch(err => console.warn('Coupon redeem (non-blocking):', err));
                setAppliedCoupon(null);
              }
            }
          }
        }
        // If declined/error, the EcrStatusModal will show the status — user can retry or cancel
      } catch (err) {
        console.error('ECR terminal error:', err);
        // EcrStatusModal handles error display
      }
      return;
    }
    if (typeof onProcessOrder === 'function') {
      try {
        const taxData = buildTaxData();
        const result = await onProcessOrder(taxData);
        console.log('Process order result:', result);
        // If order was successful and we have an order ID, generate invoice
        if (result && result.orderId) {
          console.log('Generating invoice for order:', result.orderId);
          const invoiceGenerated = await generateInvoice(result.orderId);
          // Redeem coupon after successful order
          if (appliedCoupon?.id) {
            apiClient.redeemCoupon(restaurantId, appliedCoupon.id, result.orderId).catch(err => console.warn('Coupon redeem (non-blocking):', err));
            setAppliedCoupon(null);
          }
        }
      } catch (error) {
        console.error('Error in handleProcessOrder:', error);
      }
    }
  };
  
  return (
    <div style={{
      width: isMobile ? '100vw' : '100%',
      height: billingMode ? 'auto' : (isMobile ? '100vh' : '100vh'),
      ...(billingMode ? { flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' } : {}),
      position: isMobile && !billingMode ? 'fixed' : 'relative',
      top: isMobile && !billingMode ? 0 : 'auto',
      left: isMobile && !billingMode ? 0 : 'auto',
      zIndex: isMobile && !billingMode ? 1000 : 'auto',
      backgroundColor: 'white',
      borderLeft: isMobile || billingMode ? 'none' : '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: isMobile || billingMode ? 'none' : '-2px 0 8px rgba(0, 0, 0, 0.04)',
      ...(isMobile && !billingMode ? { paddingTop: 'env(safe-area-inset-top, 0px)' } : {}),
      ...(billingMode ? {} : { overflow: 'hidden' })
    }}>
      {/* Header - More Compact, even smaller in billing mode */}
      <div style={{
        background: billingMode
          ? 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
          : 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
        padding: billingMode ? '10px 16px' : (isMobile ? '10px 12px' : '14px 16px'),
        color: billingMode ? '#1e293b' : 'white',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        ...(billingMode && { borderBottom: '1px solid #e2e8f0' })
      }}>
        {/* Background Pattern - hidden in billing mode */}
        {!billingMode && (
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '80px',
            height: '80px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(25px, -25px)'
          }} />
        )}
        
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: isMobile ? '6px' : '0',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
            {/* Back Button for Mobile */}
            {isMobile && onClose && (
              <button
                onClick={onClose}
                style={{
                  background: billingMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: billingMode ? '#374151' : 'white'
                }}
              >
                <FaArrowLeft size={14} />
              </button>
            )}
            <div style={{
              width: '24px',
              height: '24px',
              backgroundColor: billingMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.2)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <FaShoppingCart size={12} style={billingMode ? { color: '#64748b' } : undefined} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: isMobile ? '14px' : '13px', fontWeight: 'bold', margin: 0 }}>
                {t('dashboard.orderSummary')}
              </h2>
              <p style={{ fontSize: isMobile ? '10px' : '9px', margin: '1px 0 0 0', opacity: 0.8 }}>
                {cart.reduce((sum, item) => sum + item.quantity, 0)} {t('common.items')}
              </p>
            </div>
          </div>
          
          {/* Edit Mode Indicator - hidden in billing mode */}
          {currentOrder && !billingMode && (
            <div style={{
              position: 'absolute',
              top: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: currentOrder.status === 'completed'
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: '700',
              boxShadow: currentOrder.status === 'completed'
                ? '0 2px 8px rgba(16, 185, 129, 0.4)'
                : '0 2px 8px rgba(245, 158, 11, 0.4)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {currentOrder.status === 'completed' ? '✅ COMPLETED ORDER' : '✏️ EDIT MODE'}
            </div>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '6px' }}>
            {/* Order Type Selector - Dynamic */}
            {(() => {
              const hasTable = !!(tableNumber || selectedTable?.name);
              const enabledTypes = (Array.isArray(posSettings.orderTypes)
                ? posSettings.orderTypes
                : [
                    { id: 'dine-in', label: 'Dine-in', enabled: true, builtIn: true },
                    { id: 'takeaway', label: 'Takeaway', enabled: true, builtIn: true },
                    { id: 'delivery', label: 'Delivery', enabled: true, builtIn: true },
                  ]
              ).filter(ot => ot.enabled);
              const i18nMap = { 'dine-in': t('dashboard.dineIn'), 'takeaway': t('dashboard.takeaway') };
              return (
            <div style={{ display: 'flex', gap: isMobile ? '3px' : '4px', flexWrap: 'wrap' }}>
              {enabledTypes.map((ot) => {
                const isDisabled = hasTable && ot.id !== 'dine-in';
                return (
                  <button
                    key={ot.id}
                    onClick={() => { if (!isDisabled) setOrderType(ot.id); }}
                    disabled={isDisabled}
                    style={{
                      backgroundColor: orderType === ot.id
                        ? (billingMode ? '#e2e8f0' : 'rgba(255,255,255,0.5)')
                        : (billingMode ? 'transparent' : 'rgba(255,255,255,0.1)'),
                      color: billingMode ? '#334155' : 'white',
                      border: orderType === ot.id
                        ? (billingMode ? '2px solid #94a3b8' : '2px solid white')
                        : (billingMode ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.2)'),
                      borderRadius: isMobile ? '4px' : '6px',
                      padding: isMobile ? '4px 6px' : '6px 12px',
                      fontSize: isMobile ? '9px' : '10px',
                      fontWeight: '700',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      opacity: isDisabled ? 0.4 : 1,
                      backdropFilter: 'blur(10px)',
                      boxShadow: orderType === ot.id ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                      whiteSpace: 'nowrap'
                    }}
                    title={isDisabled ? 'Remove table to switch type' : ot.label}
                  >
                    {isMobile ? ot.label.toUpperCase() : (i18nMap[ot.id] || ot.label)}
                  </button>
                );
              })}
            </div>
              );
            })()}
            
            {/* QR Code Button - Temporarily hidden
            {!isMobile && (
              <button
                onClick={onShowQRCode}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '4px',
                  padding: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s ease'
                }}
                title="Generate QR Code for Customer Orders"
              >
                <FaQrcode size={10} />
              </button>
            )}
            */}

            {/* Clear Button - Temporarily hidden
            {!isMobile && (
              <button
                onClick={onClearCart}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '4px',
                  padding: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s ease'
                }}
                title="Clear Cart"
              >
                <FaTrash size={8} />
              </button>
            )}
            */}
          </div>
        </div>
      </div>

      {/* Delivery Person Info — shown when delivery order type is selected */}
      {orderType === 'delivery' && (
        <div style={{
          padding: isMobile ? '8px 10px' : '10px 16px',
          background: '#fff7ed',
          borderBottom: '1px solid #fed7aa',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <FaTruck size={11} style={{ color: '#ea580c' }} />
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#9a3412', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Delivery Details</span>
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Person name with staff search */}
            <div style={{ position: 'relative', flex: '1', minWidth: '100px' }}>
              <input
                type="text"
                placeholder="Delivery person name"
                value={deliveryInfo.personName}
                onChange={(e) => {
                  setDeliveryInfo(prev => ({ ...prev, personName: e.target.value }));
                  setShowDeliveryStaffDropdown(true);
                }}
                onFocus={() => setShowDeliveryStaffDropdown(true)}
                onBlur={() => setTimeout(() => setShowDeliveryStaffDropdown(false), 200)}
                style={{
                  width: '100%', padding: '7px 10px',
                  border: '1.5px solid #fdba74',
                  borderRadius: '8px', fontSize: '12px',
                  backgroundColor: 'white',
                  color: '#1f2937', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {showDeliveryStaffDropdown && deliveryStaffList.length > 0 && (() => {
                const q = (deliveryInfo.personName || '').toLowerCase();
                const filtered = deliveryStaffList.filter(s =>
                  (s.name || '').toLowerCase().includes(q)
                );
                if (filtered.length === 0 || (filtered.length === 1 && filtered[0].name === deliveryInfo.personName)) return null;
                return (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                    background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px',
                    maxHeight: '120px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    marginTop: '2px',
                  }}>
                    {filtered.slice(0, 8).map(s => (
                      <div key={s.id || s.name} onMouseDown={() => {
                        setDeliveryInfo(prev => ({
                          ...prev, personName: s.name, personPhone: s.phone || prev.personPhone
                        }));
                        setShowDeliveryStaffDropdown(false);
                      }} style={{
                        padding: '7px 10px', fontSize: '12px', cursor: 'pointer',
                        color: '#374151', borderBottom: '1px solid #f3f4f6',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#fff7ed'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
                      >
                        {s.name} {s.phone ? <span style={{ color: '#9ca3af' }}>({s.phone})</span> : ''}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Phone */}
            <input
              type="tel"
              placeholder="Phone"
              value={deliveryInfo.personPhone}
              onChange={(e) => setDeliveryInfo(prev => ({ ...prev, personPhone: e.target.value.replace(/\D/g, '') }))}
              style={{
                width: '90px', padding: '7px 10px',
                border: '1.5px solid #fdba74',
                borderRadius: '8px', fontSize: '12px',
                backgroundColor: 'white',
                color: '#1f2937', outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            {/* Cash handed over toggle */}
            <button
              type="button"
              onClick={() => setDeliveryInfo(prev => ({ ...prev, cashHandedOver: !prev.cashHandedOver }))}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '7px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
                border: deliveryInfo.cashHandedOver
                  ? '1.5px solid #22c55e'
                  : '1.5px solid #fdba74',
                background: deliveryInfo.cashHandedOver
                  ? '#dcfce7'
                  : 'white',
                color: deliveryInfo.cashHandedOver
                  ? '#16a34a'
                  : '#9a3412',
                cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
              title="Cash handed over to delivery person"
            >
              <FaMoneyBillWave size={11} />
              {deliveryInfo.cashHandedOver ? 'Cash ✓' : 'Cash'}
            </button>
          </div>

          {/* Delivery Address Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', position: 'relative' }}>
            <FaMapMarkerAlt size={10} style={{ color: '#ea580c', flexShrink: 0 }} />
            {deliveryAddress ? (
              <span
                onClick={() => setShowAddressModal(true)}
                style={{
                  flex: 1, fontSize: '11px', color: '#374151', cursor: 'pointer',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  padding: '4px 0',
                }}
                title={deliveryAddress}
              >
                {deliveryAddress}
              </span>
            ) : (
              <span style={{ flex: 1, fontSize: '11px', color: '#9ca3af', fontStyle: 'italic' }}>
                No delivery address
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                // Parse existing address into form fields if available
                if (deliveryAddress && !addressForm.building) {
                  setAddressForm(prev => ({ ...prev, building: deliveryAddress }));
                }
                setShowAddressModal(true);
              }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '24px', height: '24px', borderRadius: '6px',
                border: '1.5px solid #fdba74', background: 'white',
                cursor: 'pointer', flexShrink: 0, padding: 0,
              }}
              title={deliveryAddress ? 'Edit delivery address' : 'Add delivery address'}
            >
              {deliveryAddress ? <FaPencilAlt size={9} style={{ color: '#ea580c' }} /> : <FaPlus size={9} style={{ color: '#ea580c' }} />}
            </button>

            {/* Address Modal — small floating card, no overlay */}
            {showAddressModal && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                background: 'white', border: '1.5px solid #fdba74', borderRadius: '10px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)', padding: '10px',
                marginTop: '4px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#9a3412', textTransform: 'uppercase' }}>Delivery Address</span>
                  <button type="button" onClick={() => setShowAddressModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                    <FaTimes size={10} style={{ color: '#9ca3af' }} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <input
                    type="text" placeholder="Building / Street"
                    value={addressForm.building}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, building: e.target.value }))}
                    style={{ width: '100%', padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '11px', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <input
                    type="text" placeholder="Landmark"
                    value={addressForm.landmark}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, landmark: e.target.value }))}
                    style={{ width: '100%', padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '11px', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input
                      type="text" placeholder="City"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                      style={{ flex: 1, padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '11px', outline: 'none', boxSizing: 'border-box' }}
                    />
                    <input
                      type="text" placeholder="State"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                      style={{ flex: 1, padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '11px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <input
                      type="text" placeholder="Pincode"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                      style={{ width: '90px', padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '11px', outline: 'none', boxSizing: 'border-box' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const parts = [addressForm.building, addressForm.landmark, addressForm.city, addressForm.state, addressForm.pincode].filter(Boolean);
                        setDeliveryAddress(parts.join(', '));
                        setShowAddressModal(false);
                      }}
                      style={{
                        flex: 1, padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                        border: 'none', background: '#ea580c', color: 'white', cursor: 'pointer',
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Multi-Pricing Area Selector — only for Dine-In when multi-pricing enabled, hidden when table auto-selects */}
      {multiPricingEnabled && orderType === 'dine-in' && !autoSelectedRule && (() => {
        // Show loading skeleton while pricing rules are loading
        if (pricingRulesLoading && pricingRules.length === 0) {
          return (
            <div style={{
              background: '#f1f5f9',
              padding: isMobile ? '8px 10px' : '8px 16px',
              display: 'flex', alignItems: 'center', gap: '8px',
              borderBottom: '1px solid #e2e8f0',
              flexShrink: 0,
            }}>
              <span style={{
                fontSize: '10px', fontWeight: 700, color: '#94a3b8',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>Area</span>
              <div style={{ width: '1px', height: '20px', background: '#cbd5e1' }} />
              {[1, 2].map(i => (
                <div key={i} style={{
                  width: isMobile ? '60px' : '70px', height: '26px',
                  borderRadius: '20px', background: '#e2e8f0',
                  animation: 'shimmer 1.5s infinite',
                }} />
              ))}
            </div>
          );
        }

        if (pricingRules.length === 0) return null;

        // Filter out rules that duplicate order types (Dine-In, Takeaway, Delivery)
        const skipNames = ['dine-in', 'dinein', 'dine in', 'takeaway', 'take away', 'delivery'];
        const areaRules = pricingRules.filter(r =>
          !skipNames.includes((r.name || '').toLowerCase().trim())
        );
        if (areaRules.length === 0) return null;

        const hasSelection = areaRules.some(r => r.id === activePricingRuleId);
        const needsSelection = !autoSelectedRule && !hasSelection && !tableNumber;

        const showAsButtons = areaRules.slice(0, 4);
        const showInDropdown = areaRules.length > 4 ? areaRules.slice(4) : [];

        // Consistent slate background — no color shifts
        const barBg = '#f1f5f9';
        const barBorder = '#e2e8f0';

        return (
          <div style={{
            background: barBg,
            padding: isMobile ? '8px 10px' : '8px 16px',
            display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '8px',
            flexWrap: 'nowrap', overflow: 'auto',
            borderBottom: '1px solid ' + barBorder,
            flexShrink: 0, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
          }}>
            {/* Label */}
            <span style={{
              fontSize: isMobile ? '9px' : '10px', fontWeight: 700,
              color: needsSelection ? '#d97706' : '#64748b',
              whiteSpace: 'nowrap', flexShrink: 0,
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              {needsSelection ? 'Select Area' : 'Area'}
            </span>

            {/* Pulsing amber dot when needs selection */}
            {needsSelection && (
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b',
                flexShrink: 0, animation: 'pulse 1.5s infinite',
              }} />
            )}

            {/* Divider */}
            <div style={{
              width: '1px', height: '20px', flexShrink: 0,
              background: '#cbd5e1',
            }} />

            {/* Area buttons */}
            {showAsButtons.map(rule => {
              const isActive = activePricingRuleId === rule.id;
              const isAutoActive = autoSelectedRule && isActive;
              return (
                <button
                  key={rule.id}
                  onClick={() => {
                    if (!autoSelectedRule) {
                      setActivePricingRuleId(rule.id);
                    }
                  }}
                  style={{
                    backgroundColor: isActive
                      ? (isAutoActive ? '#059669' : '#1e293b')
                      : 'white',
                    color: isActive ? 'white' : '#475569',
                    border: isActive
                      ? 'none'
                      : '1px solid #cbd5e1',
                    borderRadius: '20px',
                    padding: isMobile ? '5px 10px' : '5px 14px',
                    fontSize: isMobile ? '10px' : '11px',
                    fontWeight: isActive ? '700' : '500',
                    cursor: autoSelectedRule ? 'default' : 'pointer',
                    opacity: autoSelectedRule && !isActive ? 0.5 : 1,
                    boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                    whiteSpace: 'nowrap', flexShrink: 0,
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}
                >
                  {rule.name}
                  {isAutoActive && (
                    <span style={{
                      fontSize: '8px', opacity: 0.8,
                      background: 'rgba(255,255,255,0.2)',
                      padding: '1px 5px', borderRadius: '8px',
                    }}>auto</span>
                  )}
                </button>
              );
            })}

            {/* Overflow dropdown */}
            {showInDropdown.length > 0 && (
              <select
                value={showInDropdown.some(r => r.id === activePricingRuleId) ? activePricingRuleId : ''}
                onChange={(e) => {
                  if (!autoSelectedRule && e.target.value) {
                    setActivePricingRuleId(e.target.value);
                  }
                }}
                style={{
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '1px solid #cbd5e1',
                  borderRadius: '20px', padding: '4px 8px',
                  fontSize: '11px', fontWeight: '600',
                  cursor: autoSelectedRule ? 'default' : 'pointer',
                  flexShrink: 0, outline: 'none',
                }}
                disabled={autoSelectedRule}
              >
                <option value="">More...</option>
                {showInDropdown.map(rule => (
                  <option key={rule.id} value={rule.id}>{rule.name}</option>
                ))}
              </select>
            )}
          </div>
        );
      })()}

      {/* Lock notification when table auto-selects pricing rule */}
      {autoSelectedRule && selectedTable?.floor && activePricingRuleId && (() => {
        const activeRule = pricingRules.find(r => r.id === activePricingRuleId);
        return activeRule ? (
          <div style={{
            padding: '6px 12px', backgroundColor: '#eff6ff', borderBottom: '1px solid #dbeafe',
            fontSize: '11px', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '4px'
          }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 1a4 4 0 0 0-4 4v3H3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-1V5a4 4 0 0 0-4-4zm2 7H6V5a2 2 0 1 1 4 0v3z" fill="currentColor"/></svg>
            <span>{activeRule.name} — {selectedTable.floor}</span>
          </div>
        ) : null;
      })()}

      {/* Active Table Indicator - Compact & Professional */}
      {tableNumber && (
        <div style={{
          padding: '8px 12px',
          background: '#fef2f2',
          borderBottom: '1px solid #fecaca',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
            }}>
              <FaChair size={14} />
            </div>
            <div>
              <div style={{ fontSize: '9px', color: '#f87171', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>SERVING</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#dc2626', lineHeight: '1' }}>Table {tableNumber}</div>
            </div>
          </div>
          
          <button
            onClick={() => {
               if (typeof onChangeTable === 'function') {
                 onChangeTable();
               } else if (typeof onTableNumberChange === 'function') {
                 onTableNumberChange('');
               }
            }}
            style={{
              padding: '4px 8px',
              background: 'white',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: 600,
              color: '#ef4444',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#fee2e2';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
            }}
          >
            <FaExchangeAlt size={10} />
            Change
          </button>
        </div>
      )}

      {/* Scrollable Content - Cart Items Only (in billing mode, parent scrolls so this is static) */}
      <div style={{
        flex: billingMode ? 'none' : 1,
        overflowY: billingMode ? 'visible' : 'auto',
        overflowX: 'hidden',
        padding: '12px',
        paddingBottom: '8px',
        scrollbarWidth: 'thin',
        scrollbarColor: '#cbd5e1 transparent',
        minHeight: billingMode ? 'auto' : 0
      }}
      className={billingMode ? undefined : 'hide-scrollbar'}
      >
        {/* Saved Orders Chips - Always visible at top */}
        {savedOrders && savedOrders.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 0',
            marginBottom: '8px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            borderBottom: '1px solid #f3f4f6'
          }} className="hide-scrollbar">
            <span style={{
              fontSize: '10px',
              fontWeight: '600',
              color: '#6b7280',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}>
              <FaSave size={9} style={{ marginRight: '3px', display: 'inline' }} />
              Saved:
            </span>
            {savedOrders.map((order) => (
              <div
                key={order.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  backgroundColor: activeSavedOrderId === order.id ? '#ea580c' : '#fff7ed',
                  border: activeSavedOrderId === order.id ? '1px solid #ea580c' : '1px solid #fdba74',
                  borderRadius: '12px',
                  cursor: loadingSavedOrderId === order.id ? 'wait' : 'pointer',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  boxShadow: activeSavedOrderId === order.id ? '0 2px 6px rgba(234, 88, 12, 0.25)' : 'none'
                }}
                onClick={() => {
                  if (loadingSavedOrderId) return;
                  if (activeSavedOrderId === order.id) {
                    // Deselect: clear cart and reset to empty state
                    if (onClearCart) onClearCart();
                  } else {
                    // Select: load this saved order
                    if (onLoadSavedOrder) onLoadSavedOrder(order.id);
                  }
                }}
                title={`Load: ${order.name || order.id.slice(-4).toUpperCase()}${order.tableNumber ? ` - Table ${order.tableNumber}` : ''}`}
              >
                {loadingSavedOrderId === order.id ? (
                  <FaSpinner size={8} style={{ animation: 'spin 1s linear infinite', color: '#ea580c' }} />
                ) : (
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '600',
                    color: activeSavedOrderId === order.id ? '#ffffff' : '#9a3412'
                  }}>
                    {order.name || `#${order.dailyOrderId || order.id.slice(-4).toUpperCase()}`}
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDeleteSavedOrder && !deletingSavedOrderId) onDeleteSavedOrder(order.id);
                  }}
                  disabled={deletingSavedOrderId === order.id}
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: activeSavedOrderId === order.id ? 'rgba(255,255,255,0.25)' : '#fee2e2',
                    color: activeSavedOrderId === order.id ? '#ffffff' : '#dc2626',
                    cursor: deletingSavedOrderId === order.id ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                  }}
                  title="Delete saved order"
                >
                  {deletingSavedOrderId === order.id ? (
                    <FaSpinner size={6} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <FaTimes size={6} />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Templates row */}
        {templates && templates.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 0',
            marginBottom: '8px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            borderBottom: '1px solid #f3f4f6'
          }} className="hide-scrollbar">
            <span style={{
              fontSize: '10px',
              fontWeight: '600',
              color: '#6b7280',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}>
              <FaUtensils size={8} style={{ marginRight: '3px', display: 'inline' }} />
              Quick:
            </span>
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
                onClick={() => {
                  if (onLoadSavedOrder) onLoadSavedOrder(tpl.id);
                }}
                title={`Load template: ${tpl.name}`}
              >
                <span style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  color: '#15803d'
                }}>
                  {tpl.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDeleteSavedOrder) onDeleteSavedOrder(tpl.id);
                  }}
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                  }}
                  title="Delete template"
                >
                  <FaTimes size={6} />
                </button>
              </div>
            ))}
          </div>
        )}

        {shouldShowOrderSummary() ? (
          <div style={{ padding: '8px 0', paddingTop: '12px' }}>
            <div style={{
              padding: '16px',
              backgroundColor: '#dcfce7',
              border: '2px solid #22c55e',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)',
              position: 'relative'
            }}>
              <button
                onClick={() => {
                  if (kotPrintWindowRef.current && !kotPrintWindowRef.current.closed) kotPrintWindowRef.current.close();
                  if (invoicePrintWindowRef.current && !invoicePrintWindowRef.current.closed) invoicePrintWindowRef.current.close();
                  kotPrintWindowRef.current = null;
                  invoicePrintWindowRef.current = null;
                  setOrderSuccess(null);
                  setInvoice(null);
                  setShowInvoicePermanently(false);
                  setSpecialInstructions(''); // Clear special instructions for new order
                  // Reset offer/loyalty/discount before clearing cart
                  resetOffers();
                  setManualDiscountValue('');
                  setManualDiscountTypeState('flat');
                  setRedeemLoyaltyPoints(0);
                  setSliderLocalValue(0);
                  setUseWallet(false);
                  setWalletRedeemAmount('');
                  loyaltyPreFilled.current = false;
                  prevCustomerId.current = null;
                  initialLookupDone.current = false;
                  clearCustomer();
                  onClearCart();
                  if (isMobile && onClose) setTimeout(() => onClose(), 300);
                }}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'rgba(22, 101, 52, 0.2)',
                  color: '#166534',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
                aria-label="Close"
              >
                <FaTimes size={14} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '32px', height: '32px', backgroundColor: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaCheckCircle size={16} style={{ color: 'white' }} />
                </div>
                <div style={{ fontWeight: '800', color: '#166534', fontSize: '16px' }}>
                  {orderSuccess.message || 'Order Complete! ✅'}
                </div>
              </div>
              {/* Processing indicator - shows while API call is in flight */}
              {orderSuccess.processing && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '6px 14px', marginBottom: '12px',
                  backgroundColor: '#fefce8', border: '1px solid #fde68a',
                  borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: '#92400e',
                }}>
                  <span style={{
                    width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b',
                    animation: 'pulse-dot 1.2s ease-in-out infinite',
                    display: 'inline-block',
                  }} />
                  Sending to kitchen...
                  <style>{`@keyframes pulse-dot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(0.75); } }`}</style>
                </div>
              )}
              {/* Queued state - API failed, saved for offline sync */}
              {!orderSuccess.processing && orderSuccess.queued && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '5px 12px', marginBottom: '12px',
                  backgroundColor: '#fffbeb', border: '1px solid #fde68a',
                  borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: '#92400e',
                }}>
                  <FaInfoCircle size={10} />
                  Queued — will sync when online
                </div>
              )}
              {/* Confirmed state */}
              {!orderSuccess.processing && !orderSuccess.queued && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '5px 12px', marginBottom: '12px',
                  backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
                  borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: '#166534',
                }}>
                  <FaCheckCircle size={10} />
                  {t('invoice.confirmed')}
                </div>
              )}
              {(() => {
                const isKitchenOrder = orderSuccess?.message?.includes('placed') || orderSuccess?.message?.includes('Updated') || orderSuccess?.message?.includes('Kitchen');
                return (
                  <>
                    <div style={{ fontSize: '14px', color: '#166534', marginBottom: '12px', fontWeight: '600' }}>
                      {bLabels.billLabel} #{orderSuccess.dailyOrderId ?? orderSuccess.orderId ?? '—'} {isKitchenOrder ? t('invoice.sentToKitchen') : t('invoice.completed')}
                    </div>
                    <div style={{ fontSize: '12px', color: '#166534', marginBottom: '16px' }}>
                      {isKitchenOrder ? t('invoice.orderSentToKitchen') : t('invoice.paymentProcessed')}
                    </div>
                  </>
                );
              })()}
              {orderSuccess?.kotData && (orderSuccess?.message?.includes('placed') || orderSuccess?.message?.includes('Updated') || orderSuccess?.message?.includes('Kitchen')) && (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '12px', padding: '12px', backgroundColor: '#fff', borderRadius: '8px', border: '2px dashed #22c55e', fontFamily: 'monospace', fontSize: '14px', color: '#14532d' }}>
                    {(() => {
                      const kd = orderSuccess.kotData;
                      const kdRemoved = kd.removedItems || [];
                      const kdHasChanges = kd.isIncremental && ((kd.items || []).length > 0 || kdRemoved.length > 0);
                      const kdTitle = kdHasChanges ? (t('invoice.kotUpdate') || 'KOT UPDATE') : t('invoice.kitchenOrder');
                      return <div style={{ fontWeight: 'bold', fontSize: '15px', borderBottom: '2px dashed #22c55e', paddingBottom: '6px', marginBottom: '8px' }}>--- {kdTitle} ---</div>;
                    })()}
                    <div style={{ marginBottom: '6px', fontSize: '14px' }}>{orderSuccess.kotData.restaurantName || 'Restaurant'}</div>
                    <div style={{ textAlign: 'left', marginBottom: '8px', fontSize: '13px' }}>
                      <div><strong>{t('invoice.orderHash')}:</strong> {orderSuccess.kotData.dailyOrderId ?? orderSuccess.kotData.orderId ?? '—'}</div>
                      {orderSuccess.kotData.orderId && <div><strong>{t('invoice.id')}:</strong> {String(orderSuccess.kotData.orderId).slice(-8).toUpperCase()}</div>}
                      <div><strong>{t('invoice.date')}:</strong> {new Date().toLocaleString()}</div>
                      {(orderSuccess.kotData.roomNumber || orderSuccess.kotData.tableNumber) && (
                        <div><strong>{orderSuccess.kotData.roomNumber ? t('invoice.room') : t('invoice.table')}:</strong> {orderSuccess.kotData.roomNumber || orderSuccess.kotData.tableNumber}{orderSuccess.kotData.floorName ? ` · ${orderSuccess.kotData.floorName}` : ''}</div>
                      )}
                      {orderSuccess.kotData.customerName && <div><strong>{t('invoice.customer')}:</strong> {orderSuccess.kotData.customerName}</div>}
                      {orderSuccess.kotData.orderType && <div><strong>{t('invoice.type')}:</strong> {orderSuccess.kotData.orderType}</div>}
                    </div>
                    {(() => {
                      const kd = orderSuccess.kotData;
                      const kdRemoved = kd.removedItems || [];
                      const kdHasChanges = kd.isIncremental && ((kd.items || []).length > 0 || kdRemoved.length > 0);
                      const kdReducedItems = kdHasChanges ? (kd.items || []).filter(i => i.isUpdated && i.quantityDelta < 0) : [];
                      const kdNewAndInc = kdHasChanges ? (kd.items || []).filter(i => i.isNew || (i.isUpdated && i.quantityDelta > 0)) : [];
                      const kdUnmarked = kdHasChanges ? (kd.items || []).filter(i => !i.isNew && !i.isUpdated) : (kd.items || []);

                      const renderRow = (item, idx, opts = {}) => (
                        <tr key={`${opts.prefix || ''}-${idx}`} style={{ borderBottom: '1px solid #dcfce7', textDecoration: opts.isRemoved ? 'line-through' : 'none', color: opts.isRemoved ? '#ef4444' : 'inherit' }}>
                          <td style={{ padding: '4px 6px' }}>
                            {item.name || '—'}
                            {opts.label && <span style={{ fontSize: '9px', fontWeight: 'bold', marginLeft: '4px', color: opts.labelColor || '#666' }}>{opts.label}</span>}
                          </td>
                          <td style={{ padding: '4px 6px', textAlign: 'center' }}>{opts.isRemoved && opts.showDelta ? Math.abs(item.quantityDelta) : (item.quantity || 1)}</td>
                          <td style={{ padding: '4px 6px', color: '#6b7280' }}>{item.notes || '—'}</td>
                        </tr>
                      );

                      return (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #86efac' }}>
                              <th style={{ textAlign: 'left', padding: '4px 6px', backgroundColor: '#f0fdf4' }}>{t('invoice.item')}</th>
                              <th style={{ textAlign: 'center', padding: '4px 6px', backgroundColor: '#f0fdf4', width: '36px' }}>{t('invoice.qty')}</th>
                              <th style={{ textAlign: 'left', padding: '4px 6px', backgroundColor: '#f0fdf4' }}>{t('invoice.note')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {kdHasChanges ? (
                              <>
                                {kdRemoved.length > 0 && (
                                  <>
                                    <tr><td colSpan={3} style={{ textAlign: 'center', fontWeight: 'bold', padding: '4px', backgroundColor: '#fee2e2', color: '#dc2626', fontSize: '11px' }}>CANCELLED</td></tr>
                                    {kdRemoved.map((i, idx) => renderRow(i, idx, { prefix: 'rem', isRemoved: true }))}
                                  </>
                                )}
                                {kdReducedItems.length > 0 && (
                                  <>
                                    <tr><td colSpan={3} style={{ textAlign: 'center', fontWeight: 'bold', padding: '4px', backgroundColor: '#fef3c7', color: '#d97706', fontSize: '11px' }}>REDUCED</td></tr>
                                    {kdReducedItems.map((i, idx) => renderRow(i, idx, { prefix: 'dec', isRemoved: true, showDelta: true }))}
                                  </>
                                )}
                                {kdNewAndInc.length > 0 && (
                                  <>
                                    <tr><td colSpan={3} style={{ textAlign: 'center', fontWeight: 'bold', padding: '4px', backgroundColor: '#dcfce7', color: '#16a34a', fontSize: '11px' }}>NEW ITEMS</td></tr>
                                    {kdNewAndInc.map((i, idx) => renderRow(i, idx, { prefix: 'new', label: i.isUpdated ? `+${i.quantityDelta}` : 'NEW', labelColor: '#16a34a' }))}
                                  </>
                                )}
                                {kdUnmarked.map((i, idx) => renderRow(i, idx, { prefix: 'unk' }))}
                              </>
                            ) : (
                              (kd.items || []).map((i, idx) => renderRow(i, idx))
                            )}
                          </tbody>
                        </table>
                      );
                    })()}
                    {orderSuccess.kotData.specialInstructions && (
                      <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#fef3c7', border: '1px dashed #f59e0b', borderRadius: '4px', textAlign: 'left' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '11px', color: '#92400e', marginBottom: '4px' }}>*** {t('invoice.specialInstructions')} ***</div>
                        <div style={{ fontSize: '12px', color: '#78350f' }}>{orderSuccess.kotData.specialInstructions}</div>
                      </div>
                    )}
                    <div style={{ marginTop: '8px', fontSize: '12px', borderTop: '2px dashed #22c55e', paddingTop: '6px' }}>{t('invoice.kotFooter')}</div>
                  </div>
                  {shouldShowManualPrint() && (
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
                  <button
                    onClick={() => {
                      const pw = kotPrintWindowRef.current;
                      if (pw && !pw.closed) {
                        pw.focus();
                        pw.print();
                        return;
                      }
                      const k = orderSuccess.kotData;
                      const kotLabels = {
                        kitchenOrder: t('invoice.kitchenOrder'), kotUpdate: t('invoice.kotUpdate') || 'KOT UPDATE',
                        orderHash: t('invoice.orderHash'), table: t('invoice.table'), room: t('invoice.room'),
                        time: t('invoice.time'), date: t('invoice.date'), customer: t('invoice.customer'),
                        type: t('invoice.type'), waiter: t('invoice.waiter'), qty: t('invoice.qty'),
                        item: t('invoice.item'), totalItems: t('invoice.totalItems'),
                        specialInstructions: t('invoice.specialInstructions'), note: t('invoice.note'),
                      };
                      const kotContent = generateKOTHTML(k, printSettings || {}, kotLabels);
                      const newPw = window.open('', '_blank', 'width=400,height=600');
                      if (newPw) {
                        kotPrintWindowRef.current = newPw;
                        newPw.document.write(kotContent);
                        newPw.document.close();
                        newPw.focus();
                        setTimeout(() => newPw.print(), 400);
                      }
                    }}
                    style={{ backgroundColor: '#f97316', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(249,115,22,0.3)' }}
                  >
                    <FaPrint size={14} />
                    {t('invoice.printKOT')}
                  </button>
                </div>
                  )}
                </>
              )}
              {/* Billing complete: Invoice summary (same style as KOT) + Print Invoice */}
              {((orderSuccess?.message?.includes('Billing Complete') && invoice) || showInvoicePermanently) && invoice && (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '12px', padding: '12px', backgroundColor: '#fff', borderRadius: '8px', border: '2px dashed #22c55e', fontFamily: 'monospace', fontSize: '14px', color: '#14532d' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '15px', borderBottom: '2px dashed #22c55e', paddingBottom: '6px', marginBottom: '8px' }}>--- {bLabels.billTitle} ---</div>
                    <div style={{ marginBottom: '2px', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase' }}>{invoice?.restaurantName || 'Restaurant'}</div>
                    {invoice?.restaurantLegalName && invoice.restaurantLegalName !== invoice.restaurantName && (
                      <div style={{ fontSize: '11px', color: '#166534', marginBottom: '2px' }}>{invoice.restaurantLegalName}</div>
                    )}
                    {invoice?.restaurantAddress && (
                      <div style={{ fontSize: '11px', color: '#166534', marginBottom: '2px' }}>{invoice.restaurantAddress}</div>
                    )}
                    {invoice?.restaurantPhone && (
                      <div style={{ fontSize: '11px', color: '#166534', marginBottom: '2px' }}>{t('invoice.tel')}: {invoice.restaurantPhone}</div>
                    )}
                    {/* India: GSTIN & FSSAI */}
                    {invoice?.showGstOnInvoice && invoice?.gstin && (
                      <div style={{ fontSize: '11px', color: '#166534', marginBottom: '1px' }}><strong>GSTIN:</strong> {invoice.gstin}</div>
                    )}
                    {invoice?.showFssaiOnInvoice && invoice?.fssai && (
                      <div style={{ fontSize: '11px', color: '#166534', marginBottom: '1px' }}><strong>FSSAI:</strong> {invoice.fssai}</div>
                    )}
                    {/* International: VAT/Tax ID */}
                    {invoice?.showTaxIdOnInvoice && invoice?.vatNumber && (
                      <div style={{ fontSize: '11px', color: '#166534', marginBottom: '1px' }}><strong>{invoice?.countryCode === 'GB' ? 'VAT' : invoice?.countryCode === 'CA' ? 'GST/HST' : invoice?.countryCode === 'AE' ? 'TRN' : invoice?.countryCode === 'DE' ? 'USt-IdNr' : invoice?.countryCode === 'FR' ? 'TVA' : 'Tax ID'}:</strong> {invoice.vatNumber}</div>
                    )}
                    {invoice?.showTaxIdOnInvoice && invoice?.taxId && (
                      <div style={{ fontSize: '11px', color: '#166534', marginBottom: '1px' }}><strong>{invoice?.countryCode === 'AU' ? 'ABN' : 'Tax ID'}:</strong> {invoice.taxId}</div>
                    )}
                    {invoice?.showTaxIdOnInvoice && invoice?.businessRegistrationNumber && (
                      <div style={{ fontSize: '11px', color: '#166534', marginBottom: '1px' }}><strong>Reg#:</strong> {invoice.businessRegistrationNumber}</div>
                    )}
                    <div style={{ textAlign: 'left', marginBottom: '8px', fontSize: '13px', marginTop: '6px' }}>
                      {invoice?.dailyOrderId != null && <div><strong>{bLabels.billLabel} #:</strong> {invoice.dailyOrderId}</div>}
                      {invoice?.orderId && <div><strong>{t('invoice.id')}:</strong> {String(invoice.orderId).slice(-8).toUpperCase()}</div>}
                      <div><strong>{t('invoice.date')}:</strong> {invoice?.generatedAt ? new Date(invoice.generatedAt).toLocaleString() : (invoice?.invoiceDate ? new Date(invoice.invoiceDate).toLocaleString() : 'N/A')}</div>
                      {invoice?.tableNumber && <div><strong>{t('invoice.table')}:</strong> {invoice.tableNumber}{invoice?.floorName ? ` · ${invoice.floorName}` : ''}</div>}
                      {invoice?.customerName && <div><strong>{bLabels.customerLabel}:</strong> {invoice.customerName}</div>}
                      <div><strong>{t('invoice.payment')}:</strong> {(invoice?.paymentMethod || 'CASH').toUpperCase()}</div>
                      {invoice?.ecrResponse && (
                        <div style={{ marginTop: '4px', padding: '4px 0', borderTop: '1px dashed #d1d5db', fontSize: '11px' }}>
                          {invoice.ecrResponse.CardType && <div><strong>Card:</strong> {invoice.ecrResponse.CardType} {invoice.ecrResponse.CardNumber || ''}</div>}
                          {invoice.ecrResponse.ApprovalCode && <div><strong>Approval:</strong> {invoice.ecrResponse.ApprovalCode}</div>}
                          {invoice.ecrResponse.RRN && <div><strong>RRN:</strong> {invoice.ecrResponse.RRN}</div>}
                        </div>
                      )}
                    </div>
                    {/* Items table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '8px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px dashed #22c55e' }}>
                          <th style={{ textAlign: 'left', padding: '4px 6px', backgroundColor: '#f0fdf4' }}>{bLabels.itemCol}</th>
                          <th style={{ textAlign: 'center', padding: '4px 6px', backgroundColor: '#f0fdf4', width: '40px' }}>{bLabels.qtyCol}</th>
                          <th style={{ textAlign: 'right', padding: '4px 6px', backgroundColor: '#f0fdf4', width: '70px' }}>{t('invoice.amt')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(invoice?.items || orderSuccess?.kotData?.items || []).map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #dcfce7' }}>
                            <td style={{ padding: '3px 6px', textAlign: 'left' }}>
                              {item.name}
                              {(() => {
                                const subParts = getItemSubline(item);
                                return subParts.length > 0 ? (
                                  <div style={{ fontSize: '9px', color: '#6b7280' }}>{subParts.join(' · ')}</div>
                                ) : null;
                              })()}
                            </td>
                            <td style={{ padding: '3px 6px', textAlign: 'center' }}>{item.quantity || 1}</td>
                            <td style={{ padding: '3px 6px', textAlign: 'right' }}>{formatCurrency(Math.round(((item.price || Math.round((item.total || 0) / (item.quantity || 1) * 100) / 100) || 0) * (item.quantity || 1) * 100) / 100)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* Totals */}
                    <div style={{ borderTop: '1px dashed #22c55e', paddingTop: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                        <span>{t('invoice.subtotal')}:</span>
                        <span>{formatCurrency(invoice?.subtotal || 0)}</span>
                      </div>
                      {(invoice?.discountAmount || 0) > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px', color: '#16a34a' }}>
                          <span>{t('invoice.offer')}{(() => { const n = typeof invoice?.appliedOffer === 'string' ? invoice.appliedOffer : (invoice?.appliedOffer?.name || invoice?.selectedOfferName); return n ? ` (${n})` : ''; })()}:</span>
                          <span>-{formatCurrency(invoice.discountAmount)}</span>
                        </div>
                      )}
                      {(invoice?.manualDiscount || 0) > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px', color: '#16a34a' }}>
                          <span>{t('invoice.manualDiscount')}:</span>
                          <span>-{formatCurrency(invoice.manualDiscount)}</span>
                        </div>
                      )}
                      {(invoice?.loyaltyDiscount || 0) > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px', color: '#b45309' }}>
                          <span>{t('invoice.loyaltyRedeem')}:</span>
                          <span>-{formatCurrency(invoice.loyaltyDiscount)}</span>
                        </div>
                      )}
                      {(invoice?.couponDiscount || 0) > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px', color: '#e11d48' }}>
                          <span>Coupon ({invoice.couponCode}):</span>
                          <span>-{formatCurrency(invoice.couponDiscount)}</span>
                        </div>
                      )}
                      {invoice?.taxBreakdown?.map((tax, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                          <span>{tax.name} ({tax.rate}%){tax.inclusive ? ' (incl.)' : ''}</span>
                          <span>{formatCurrency(tax.amount || 0)}</span>
                        </div>
                      ))}
                      {(invoice?.serviceChargeAmount > 0) && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                          <span>{t('invoice.serviceCharge')}{invoice?.serviceChargeRate ? ` (${invoice.serviceChargeRate}%)` : ''}:</span>
                          <span>{formatCurrency(invoice.serviceChargeAmount)}</span>
                        </div>
                      )}
                      {(invoice?.tipAmount > 0) && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                          <span>{t('invoice.tip')}{invoice?.tipPercentage ? ` (${invoice.tipPercentage}%)` : ''}:</span>
                          <span>{formatCurrency(invoice.tipAmount)}</span>
                        </div>
                      )}
                      {(invoice?.roundOffAmount != null && invoice?.roundOffAmount !== 0) && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                          <span>{t('invoice.roundOff')}:</span>
                          <span>{invoice.roundOffAmount > 0 ? '+' : ''}{formatCurrency(invoice.roundOffAmount)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', borderTop: '2px solid #22c55e', paddingTop: '4px', marginTop: '4px' }}>
                        <span>{t('invoice.total')}:</span>
                        <span>{formatCurrency(invoice?.grandTotal || ((invoice?.subtotal || 0) - (invoice?.totalDiscount || 0) + (invoice?.taxBreakdown?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0) + (invoice?.serviceChargeAmount || 0) + (invoice?.tipAmount || 0) + (invoice?.roundOffAmount || 0)))}</span>
                      </div>
                      {(invoice?.walletRedeemAmount || 0) > 0 && (
                        <div style={{ borderTop: '1px dashed #22c55e', paddingTop: '4px', marginTop: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px', color: '#2563eb' }}>
                            <span>{t('dashboard.walletApplied')}:</span>
                            <span>-{formatCurrency(invoice.walletRedeemAmount)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', marginBottom: '2px' }}>
                            <span>{t('dashboard.amountToPay')}:</span>
                            <span>{formatCurrency(Math.max(0, (invoice?.grandTotal || 0) - invoice.walletRedeemAmount))}</span>
                          </div>
                        </div>
                      )}
                      {(invoice?.splitPayments?.length >= 2) && (
                        <div style={{ borderTop: '1px dashed #22c55e', paddingTop: '4px', marginTop: '4px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '2px' }}>{t('invoice.splitPayment')}:</div>
                          {invoice.splitPayments.map((sp, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                              <span>{(sp.method || 'Cash').toUpperCase()}:</span>
                              <span>{formatCurrency(sp.amount)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {(invoice?.cashReceived > 0) && (
                        <div style={{ borderTop: '1px dashed #22c55e', paddingTop: '4px', marginTop: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                            <span>{t('invoice.cashReceived')}:</span>
                            <span>{formatCurrency(invoice.cashReceived)}</span>
                          </div>
                          {(invoice?.changeReturned > 0) && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                              <span>{t('invoice.change')}:</span>
                              <span>{formatCurrency(invoice.changeReturned)}</span>
                            </div>
                          )}
                        </div>
                      )}
                      {(invoice?.outstandingAmount > 0) && (
                        <div style={{ borderTop: '1px dashed #22c55e', paddingTop: '4px', marginTop: '4px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '2px', color: invoice?.paidAmount === 0 ? '#dc2626' : undefined }}>
                            {invoice?.paidAmount === 0 ? 'Due (Udhar):' : `${t('invoice.partialPayment')}:`}
                          </div>
                          {invoice?.paidAmount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                              <span>{t('invoice.paid')}:</span>
                              <span>{formatCurrency(invoice.paidAmount)}</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px', color: '#dc2626', fontWeight: 700 }}>
                            <span>{t('invoice.outstanding')}:</span>
                            <span>{formatCurrency(invoice.outstandingAmount)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '11px', borderTop: '2px dashed #22c55e', paddingTop: '6px' }}>{bLabels.footer}</div>
                  </div>
                  {shouldShowManualPrint() && (
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
                  <button
                    onClick={() => {
                      const printWindow = invoicePrintWindowRef.current;
                      if (printWindow && !printWindow.closed) {
                        printWindow.focus();
                        printWindow.print();
                        printFoodCourtTokens(invoice?.restaurantId, invoice?.orderId || invoice?.id, { delay: 900 });
                        return;
                      }
                      const win = window.open('', '_blank', 'width=800,height=600');
                      if (!win) return;
                      invoicePrintWindowRef.current = win;
                      const billItems = invoice?.items || orderSuccess?.kotData?.items || [];
                      const currencySymbol = getCurrencySymbol();
                      const getSublineHtml = (item) => {
                        const parts = [];
                        if (item.spiritCategory) parts.push(item.spiritCategory);
                        if (item.abv) parts.push(`${item.abv}% ABV`);
                        if (item.bottleSize) parts.push(item.bottleSize);
                        if (item.servingUnit && item.servingUnit !== item.bottleSize) parts.push(item.servingUnit);
                        if (item.weight) parts.push(item.weight);
                        if (item.unit) parts.push(`/${item.unit}`);
                        if (item.servingSize) parts.push(item.servingSize);
                        return parts.length > 0 ? `<div style="font-size:9px;color:#6b7280;">${parts.join(' · ')}</div>` : '';
                      };
                      const itemsHtml = billItems.map(item => `<tr><td style="text-align:left;">${(item.name || '').replace(/</g,'&lt;')}${getSublineHtml(item)}</td><td style="text-align:center;">${item.quantity || 1}</td><td style="text-align:right;">${currencySymbol}${((item.price || (item.total / (item.quantity || 1)) || 0) * (item.quantity || 1)).toFixed(2)}</td></tr>`).join('');
                      const taxHtml = (invoice?.taxBreakdown || []).map(tax => `<tr><td colspan="2" style="text-align:left;">${tax.name} (${tax.rate}%)${tax.inclusive ? ' (incl.)' : ''}</td><td style="text-align:right;">${currencySymbol}${(tax.amount || 0).toFixed(2)}</td></tr>`).join('');
                      const printTotalDiscount = (invoice?.discountAmount || 0) + (invoice?.manualDiscount || 0) + (invoice?.loyaltyDiscount || 0) + (invoice?.couponDiscount || 0);
                      const offerName = typeof invoice?.appliedOffer === 'string' ? invoice.appliedOffer : (invoice?.appliedOffer?.name || invoice?.selectedOfferName || '');
                      const offerDiscHtml = (invoice?.discountAmount || 0) > 0 ? `<div style="display:flex;justify-content:space-between;margin:2px 0;color:#16a34a;"><span>${t('invoice.offer')}${offerName ? ` (${offerName})` : ''}:</span><span>-${currencySymbol}${(invoice.discountAmount).toFixed(2)}</span></div>` : '';
                      const manualDiscHtml = (invoice?.manualDiscount || 0) > 0 ? `<div style="display:flex;justify-content:space-between;margin:2px 0;color:#16a34a;"><span>${t('invoice.manualDiscount')}:</span><span>-${currencySymbol}${(invoice.manualDiscount).toFixed(2)}</span></div>` : '';
                      const loyaltyDiscHtml = (invoice?.loyaltyDiscount || 0) > 0 ? `<div style="display:flex;justify-content:space-between;margin:2px 0;color:#b45309;"><span>${t('invoice.loyaltyRedeem')}:</span><span>-${currencySymbol}${(invoice.loyaltyDiscount).toFixed(2)}</span></div>` : '';
                      const couponDiscHtml = (invoice?.couponDiscount || 0) > 0 ? `<div style="display:flex;justify-content:space-between;margin:2px 0;color:#e11d48;"><span>Coupon (${invoice.couponCode || ''}):</span><span>-${currencySymbol}${(invoice.couponDiscount).toFixed(2)}</span></div>` : '';
                      const discountHtml = offerDiscHtml + manualDiscHtml + loyaltyDiscHtml + couponDiscHtml;
                      const serviceChargeHtml = (invoice?.serviceChargeAmount > 0) ? `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>${t('invoice.serviceCharge')}${invoice?.serviceChargeRate ? ` (${invoice.serviceChargeRate}%)` : ''}:</span><span>${currencySymbol}${invoice.serviceChargeAmount.toFixed(2)}</span></div>` : '';
                      const tipHtml = (invoice?.tipAmount > 0) ? `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>${t('invoice.tip')}${invoice?.tipPercentage ? ` (${invoice.tipPercentage}%)` : ''}:</span><span>${currencySymbol}${invoice.tipAmount.toFixed(2)}</span></div>` : '';
                      const roundOffHtml = (invoice?.roundOffAmount != null && invoice?.roundOffAmount !== 0) ? `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>${t('invoice.roundOff')}:</span><span>${invoice.roundOffAmount > 0 ? '+' : ''}${currencySymbol}${invoice.roundOffAmount.toFixed(2)}</span></div>` : '';
                      const splitPaymentHtml = (invoice?.splitPayments?.length >= 2) ? `<div style="border-top:1px dashed #000;padding-top:4px;margin-top:4px;"><div style="font-weight:bold;margin-bottom:2px;">${t('invoice.splitPayment')}:</div>${invoice.splitPayments.map(sp => `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>${(sp.method || 'Cash').toUpperCase()}:</span><span>${currencySymbol}${(sp.amount || 0).toFixed(2)}</span></div>`).join('')}</div>` : '';
                      const cashReceivedHtml = (invoice?.cashReceived > 0) ? `<div style="border-top:1px dashed #000;padding-top:4px;margin-top:4px;"><div style="display:flex;justify-content:space-between;margin:2px 0;"><span>${t('invoice.cashReceived')}:</span><span>${currencySymbol}${invoice.cashReceived.toFixed(2)}</span></div>${(invoice?.changeReturned > 0) ? `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>${t('invoice.change')}:</span><span>${currencySymbol}${invoice.changeReturned.toFixed(2)}</span></div>` : ''}</div>` : '';
                      const partialPayHtml = (invoice?.outstandingAmount > 0) ? `<div style="border-top:1px dashed #000;padding-top:4px;margin-top:4px;"><div style="font-weight:bold;margin-bottom:2px;">${invoice?.paidAmount === 0 ? 'Due (Udhar)' : t('invoice.partialPayment')}:</div>${invoice?.paidAmount > 0 ? `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>${t('invoice.paid')}:</span><span>${currencySymbol}${invoice.paidAmount.toFixed(2)}</span></div>` : ''}<div style="display:flex;justify-content:space-between;margin:2px 0;color:#dc2626;font-weight:bold;"><span>${t('invoice.outstanding')}:</span><span>${currencySymbol}${invoice.outstandingAmount.toFixed(2)}</span></div></div>` : '';
                      const walletPayHtml = (invoice?.walletRedeemAmount || 0) > 0 ? `<div style="border-top:1px dashed #000;padding-top:4px;margin-top:4px;"><div style="display:flex;justify-content:space-between;margin:2px 0;"><span>${t('dashboard.walletApplied')}:</span><span>-${currencySymbol}${invoice.walletRedeemAmount.toFixed(2)}</span></div><div style="display:flex;justify-content:space-between;margin:2px 0;font-weight:bold;"><span>${t('dashboard.amountToPay')}:</span><span>${currencySymbol}${Math.max(0, (invoice?.grandTotal || 0) - invoice.walletRedeemAmount).toFixed(2)}</span></div></div>` : '';
                      const printGrandTotal = invoice?.grandTotal || ((invoice?.subtotal || 0) - printTotalDiscount + (invoice?.taxBreakdown?.reduce((sum, tax) => sum + (tax.amount || 0), 0) || 0) + (invoice?.serviceChargeAmount || 0) + (invoice?.tipAmount || 0) + (invoice?.roundOffAmount || 0));
                      // Build identity lines for print header
                      const identityLines = [];
                      if (invoice?.restaurantLegalName && invoice.restaurantLegalName !== invoice.restaurantName) identityLines.push(invoice.restaurantLegalName.replace(/</g,'&lt;'));
                      if (invoice?.restaurantAddress) identityLines.push(invoice.restaurantAddress.replace(/</g,'&lt;'));
                      if (invoice?.restaurantPhone) identityLines.push(t('invoice.tel') + ': ' + invoice.restaurantPhone);
                      if (invoice?.showGstOnInvoice && invoice?.gstin) identityLines.push('GSTIN: ' + invoice.gstin);
                      if (invoice?.showFssaiOnInvoice && invoice?.fssai) identityLines.push('FSSAI: ' + invoice.fssai);
                      if (invoice?.showTaxIdOnInvoice && invoice?.vatNumber) identityLines.push((invoice?.countryCode === 'GB' ? 'VAT: ' : invoice?.countryCode === 'CA' ? 'GST/HST: ' : invoice?.countryCode === 'AE' ? 'TRN: ' : 'Tax ID: ') + invoice.vatNumber);
                      if (invoice?.showTaxIdOnInvoice && invoice?.taxId) identityLines.push((invoice?.countryCode === 'AU' ? 'ABN: ' : 'Tax ID: ') + invoice.taxId);
                      if (invoice?.showTaxIdOnInvoice && invoice?.businessRegistrationNumber) identityLines.push('Reg#: ' + invoice.businessRegistrationNumber);
                      const identityHtml = identityLines.map(l => `<div style="font-size:11px;">${l}</div>`).join('');
                      const receiptLogo = printSettings?.receiptLogo || null;
                      const billHeaderHtml = getBillHeaderHTML((invoice?.restaurantName || 'Restaurant').replace(/</g,'&lt;'), identityHtml, receiptLogo, `--- ${bLabels.billTitle} ---`);

                      const invoiceContent = `<!DOCTYPE html><html><head><title>${bLabels.billLabel} #${invoice?.dailyOrderId || invoice?.id || 'N/A'}</title><style>${getBillPrintCSS(printSettings?.billFontScale || printSettings?.billFontSize, printSettings?.billFontFamily, printSettings?.printerWidth, printSettings)}</style></head><body>${billHeaderHtml}<div class="divider">--------------------------------</div><div class="bill-info"><div><span>${bLabels.billLabel}#:</span><span><strong>${invoice?.dailyOrderId || invoice?.id || 'N/A'}</strong></span></div><div><span>${t('invoice.date')}:</span><span>${new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})} ${new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true})}</span></div>${invoice?.tableNumber ? `<div><span>${t('invoice.table')}:</span><span>${invoice.tableNumber}${invoice?.floorName ? ` · ${invoice.floorName}` : ''}</span></div>` : ''}${invoice?.customerName ? `<div><span>${bLabels.customerLabel}:</span><span>${(invoice.customerName || '').replace(/</g,'&lt;')}</span></div>` : ''}<div><span>${t('invoice.payment')}:</span><span>${(invoice?.paymentMethod || 'CASH').toUpperCase()}</span></div></div><div class="divider">--------------------------------</div><table><thead><tr><th style="text-align:left;width:55%;">${bLabels.itemCol}</th><th style="text-align:center;width:15%;">${bLabels.qtyCol}</th><th style="text-align:right;width:30%;">${t('invoice.amt')}</th></tr></thead><tbody>${itemsHtml}</tbody></table><div class="total-section"><div class="bill-info"><div><span>${t('invoice.subtotal')}:</span><span>${currencySymbol}${(invoice?.subtotal || 0).toFixed(2)}</span></div>${discountHtml}</div>${taxHtml ? `<table style="margin:4px 0;"><tbody>${taxHtml}</tbody></table>` : ''}${serviceChargeHtml}${tipHtml}${roundOffHtml}<div class="total-row"><span>${t('invoice.total')}:</span><span>${currencySymbol}${printGrandTotal.toFixed(2)}</span></div>${splitPaymentHtml}${cashReceivedHtml}${partialPayHtml}${walletPayHtml}</div><div class="divider">================================</div><div class="bill-footer"><p>${bLabels.footer}</p><p style="font-size:10px;margin-top:4px;">${t('invoice.poweredBy')}</p></div></body></html>`;
                      win.document.write(invoiceContent);
                      win.document.close();
                      win.focus();
                      setTimeout(() => {
                        win.print();
                        // Food court token printing: preview/print category-wise token slips after bill.
                        printFoodCourtTokens(invoice?.restaurantId, invoice?.orderId || invoice?.id, { delay: 900 });
                      }, 500);
                    }}
                    style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(59,130,246,0.3)' }}
                  >
                    <FaPrint size={14} />
                    {t('invoice.printBill', { label: bLabels.billLabel })}
                  </button>
                  {whatsappConnected && (
                    <button
                      onClick={handleSendBillWhatsApp}
                      disabled={waSending || waSent}
                      style={{
                        backgroundColor: waSent ? '#22c55e' : '#25D366', color: 'white', border: 'none',
                        borderRadius: '8px', padding: '10px 16px', fontSize: '14px', fontWeight: '600',
                        cursor: (waSending || waSent) ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        boxShadow: '0 2px 4px rgba(37,211,102,0.3)',
                        opacity: waSending ? 0.7 : 1
                      }}
                    >
                      <FaWhatsapp size={14} />
                      {waSent ? t('invoice.sentOnWhatsApp') : waSending ? t('invoice.sending') : t('invoice.sendOnWhatsApp')}
                    </button>
                  )}
                </div>
                  )}
                </>
              )}
              <button
                onClick={() => {
                  if (kotPrintWindowRef.current && !kotPrintWindowRef.current.closed) kotPrintWindowRef.current.close();
                  if (invoicePrintWindowRef.current && !invoicePrintWindowRef.current.closed) invoicePrintWindowRef.current.close();
                  kotPrintWindowRef.current = null;
                  invoicePrintWindowRef.current = null;
                  setOrderSuccess(null);
                  setInvoice(null);
                  setShowInvoicePermanently(false);
                  setSpecialInstructions(''); // Clear special instructions for new order
                  // Reset offer/loyalty/discount before clearing cart
                  resetOffers();
                  setManualDiscountValue('');
                  setManualDiscountTypeState('flat');
                  setRedeemLoyaltyPoints(0);
                  setSliderLocalValue(0);
                  setUseWallet(false);
                  setWalletRedeemAmount('');
                  loyaltyPreFilled.current = false;
                  prevCustomerId.current = null;
                  initialLookupDone.current = false;
                  clearCustomer();
                  onClearCart();
                  if (isMobile && onClose) setTimeout(() => onClose(), 300);
                }}
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', margin: '0 auto', boxShadow: '0 4px 12px rgba(34,197,94,0.4)' }}
              >
                <FaPlus size={10} />
                {t('invoice.startNewOrder')}
              </button>
            </div>
          </div>
        ) : cart.length === 0 ? (
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 30px',
            height: '100%',
            minHeight: '400px'
          }}>
            <style>{`
              @keyframes floatCart {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-8px); }
              }
              @keyframes pulse {
                0%, 100% { opacity: 0.4; }
                50% { opacity: 0.8; }
              }
              @keyframes slideIn {
                0% { opacity: 0; transform: translateX(-10px); }
                100% { opacity: 1; transform: translateX(0); }
              }
              @keyframes shimmer {
                0% { opacity: 0.5; }
                50% { opacity: 0.8; }
                100% { opacity: 0.5; }
              }
            `}</style>

            {/* Animated Cart Icon */}
            <div style={{
              position: 'relative',
              marginBottom: '32px',
              animation: 'floatCart 3s ease-in-out infinite'
            }}>
              {/* Background circle */}
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fef2f2 0%, #fff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #fecaca'
              }}>
                {/* Cart SVG */}
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </div>

              {/* Decorative dots */}
              <div style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#fecaca',
                animation: 'pulse 2s ease-in-out infinite'
              }} />
              <div style={{
                position: 'absolute',
                bottom: '5px',
                left: '-8px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                animation: 'pulse 2s ease-in-out infinite 0.5s'
              }} />
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#374151',
              margin: '0 0 8px 0',
              letterSpacing: '-0.3px'
            }}>
              Your cart is empty
            </h2>

            {/* Description */}
            <p style={{
              color: '#9ca3af',
              fontSize: '13px',
              margin: '0 0 24px 0',
              fontWeight: '400',
              lineHeight: '1.5',
              textAlign: 'center',
              maxWidth: '220px'
            }}>
              Add items from the menu to start building your order
            </p>

            {/* Steps indicator */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              width: '100%',
              maxWidth: '240px'
            }}>
              {[
                { num: '1', text: 'Browse menu items' },
                { num: '2', text: 'Click + ADD to add items' },
                { num: '3', text: 'Review & place order' }
              ].map((step, index) => (
                <div
                  key={step.num}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #f3f4f6',
                    animation: `slideIn 0.4s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: index === 0 ? '#ef4444' : '#e5e7eb',
                    color: index === 0 ? 'white' : '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: '600',
                    flexShrink: 0
                  }}>
                    {step.num}
                  </div>
                  <span style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    {step.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Voice Order Button */}
            {onStartVoiceOrder && (
              <button
                onClick={onStartVoiceOrder}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  width: '100%',
                  maxWidth: '240px',
                  padding: '14px 20px',
                  marginTop: '24px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                }}
              >
                <FaMicrophone size={16} />
                Start Voice Order
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {cart.map((item) => (
              <div 
                key={item.id} 
                style={{ 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '8px', 
                  padding: '8px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      fontWeight: 'bold', 
                      color: '#1f2937', 
                      margin: '0 0 2px 0', 
                      fontSize: '12px', 
                      lineHeight: '1.3',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {item.name}
                      {/* Show indicator for items from original order */}
                      {currentOrder && currentOrder.items && (() => {
                        const origItem = currentOrder.items.find(o => o.menuItemId === item.id);
                        if (!origItem) return null;
                        const qtyDelta = item.quantity - (origItem.quantity || 0);
                        return (
                          <>
                            <span style={{
                              fontSize: '8px',
                              fontWeight: 'bold',
                              color: '#f59e0b',
                              backgroundColor: '#fef3c7',
                              padding: '1px 4px',
                              borderRadius: '3px',
                              border: '1px solid #f59e0b'
                            }}>
                              ORIGINAL
                            </span>
                            {qtyDelta > 0 && (
                              <span style={{
                                fontSize: '8px',
                                fontWeight: 'bold',
                                color: '#10b981',
                                backgroundColor: '#d1fae5',
                                padding: '1px 4px',
                                borderRadius: '3px',
                                border: '1px solid #10b981'
                              }}>
                                +{qtyDelta} NEW
                              </span>
                            )}
                            {qtyDelta < 0 && (
                              <span style={{
                                fontSize: '8px',
                                fontWeight: 'bold',
                                color: '#ef4444',
                                backgroundColor: '#fee2e2',
                                padding: '1px 4px',
                                borderRadius: '3px',
                                border: '1px solid #ef4444'
                              }}>
                                {qtyDelta}
                              </span>
                            )}
                          </>
                        );
                      })()}
                      {/* Show indicator for newly added items */}
                      {currentOrder && (!currentOrder.items || !currentOrder.items.some(origItem => origItem.menuItemId === item.id)) && (
                        <span style={{
                          fontSize: '8px',
                          fontWeight: 'bold',
                          color: '#10b981',
                          backgroundColor: '#d1fae5',
                          padding: '1px 4px',
                          borderRadius: '3px',
                          border: '1px solid #10b981'
                        }}>
                          NEW
                        </span>
                      )}
                    </h4>
                    {/* Business-type details */}
                    {(() => {
                      const subParts = getItemSubline(item);
                      return subParts.length > 0 ? (
                        <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '1px' }}>
                          {subParts.join(' · ')}
                        </div>
                      ) : null;
                    })()}
                    {item.isStockManaged && typeof item.stockQuantity === 'number' && item.stockQuantity > 0 && item.stockQuantity <= (item.lowStockThreshold || 5) && (
                      <span style={{ fontSize: '9px', fontWeight: '600', color: '#92400e', backgroundColor: '#fef3c7', padding: '1px 4px', borderRadius: '3px', border: '1px solid #fde68a', marginLeft: '4px', display: 'inline-block', marginTop: '2px' }}>
                        ⚠️ {item.stockQuantity} left
                      </span>
                    )}
                    {/* Variant and toppings sub-content */}
                    {(item?.selectedVariant || (Array.isArray(item?.selectedCustomizations) && item.selectedCustomizations.length > 0)) && (
                      <div style={{ margin: '2px 0 4px 0', color: '#6b7280' }}>
                        {item?.selectedVariant && (
                          <div style={{ fontSize: '10px' }}>
                            Variant: <span style={{ fontWeight: 600, color: '#374151' }}>{item.selectedVariant.name}</span>
                            {typeof item.selectedVariant.price === 'number' && (
                              <span> ({formatCurrency(item.selectedVariant.price)})</span>
                            )}
                          </div>
                        )}
                        {Array.isArray(item?.selectedCustomizations) && item.selectedCustomizations.length > 0 && (
                          <div style={{ fontSize: '10px' }}>
                            Toppings: {item.selectedCustomizations.map((c, idx) => (
                              <span key={idx}>
                                {idx > 0 ? ', ' : ''}
                                {c.name}{typeof c.price === 'number' && c.price > 0 ? ` (+${formatCurrency(c.price)})` : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Per-item note display (when collapsed but has note) */}
                    {item.notes && expandedNoteId !== (item.cartId || item.id) && (
                      <div
                        onClick={() => setExpandedNoteId(item.cartId || item.id)}
                        style={{ fontSize: '10px', color: '#d97706', background: '#fffbeb', padding: '2px 6px', borderRadius: '4px', marginTop: '2px', cursor: 'pointer', border: '1px solid #fef3c7' }}
                      >
                        <FaStickyNote size={8} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        {item.notes}
                      </div>
                    )}

                    {/* Per-item note input (expanded) */}
                    {expandedNoteId === (item.cartId || item.id) && (
                      <div style={{ marginTop: '4px' }}>
                        <input
                          type="text"
                          autoFocus
                          value={item.notes || ''}
                          onChange={(e) => {
                            const newNotes = e.target.value;
                            setCart(prev => prev.map(c =>
                              (c.cartId || c.id) === (item.cartId || item.id)
                                ? { ...c, notes: newNotes }
                                : c
                            ));
                          }}
                          onBlur={() => setExpandedNoteId(null)}
                          onKeyDown={(e) => { if (e.key === 'Enter') setExpandedNoteId(null); }}
                          placeholder="e.g. No onion, extra spicy..."
                          style={{
                            width: '100%',
                            padding: '4px 8px',
                            fontSize: '11px',
                            border: '1px solid #fde68a',
                            borderRadius: '6px',
                            background: '#fffbeb',
                            outline: 'none',
                            color: '#92400e',
                          }}
                        />
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          color: '#6b7280'
                        }}>
                          Subtotal: {formatCurrency(getItemUnitPrice(item) * item.quantity)}
                        </span>
                        {posSettings.allowPriceEdit && editingPriceId === (item.cartId || item.id) ? (
                          <input
                            type="text"
                            inputMode="decimal"
                            autoFocus
                            defaultValue={getItemUnitPrice(item)}
                            onBlur={(e) => {
                              const newPrice = parseFloat(e.target.value);
                              if (!isNaN(newPrice) && newPrice >= 0) {
                                setCart(prev => prev.map(c => {
                                  if ((c.cartId || c.id) !== (item.cartId || item.id)) return c;
                                  // Preserve original menu price on first edit; keep it on subsequent edits
                                  const originalMenuPrice = c.menuPrice != null
                                    ? c.menuPrice
                                    : (typeof c.basePrice === 'number' ? c.basePrice : c.price);
                                  return {
                                    ...c,
                                    price: newPrice,
                                    basePrice: newPrice,
                                    menuPrice: originalMenuPrice,
                                    priceEdited: newPrice !== originalMenuPrice,
                                  };
                                }));
                              }
                              setEditingPriceId(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') e.target.blur();
                              if (e.key === 'Escape') setEditingPriceId(null);
                            }}
                            style={{
                              width: '60px', padding: '2px 6px', border: '1.5px solid #3b82f6', borderRadius: '4px',
                              fontSize: '11px', fontWeight: 'bold', textAlign: 'right', outline: 'none',
                              background: '#eff6ff', color: '#1e40af',
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              fontSize: '12px', fontWeight: 'bold', color: '#ef4444',
                              cursor: posSettings.allowPriceEdit ? 'pointer' : 'default',
                              display: 'inline-flex', alignItems: 'center', gap: '3px',
                            }}
                            onClick={() => {
                              if (posSettings.allowPriceEdit) setEditingPriceId(item.cartId || item.id);
                            }}
                          >
                            {formatCurrency(getItemUnitPrice(item))}
                            {posSettings.allowPriceEdit && (
                              <FaPencilAlt size={7} style={{ color: '#94a3b8', flexShrink: 0 }} />
                            )}
                          </span>
                        )}
                        <div style={{
                          padding: '1px 4px',
                          borderRadius: '4px',
                          fontSize: '6px',
                          fontWeight: 'bold',
                          backgroundColor: (item.isVeg === true || item.category === 'veg') ? '#dcfce7' : '#fee2e2',
                          color: (item.isVeg === true || item.category === 'veg') ? '#166534' : '#dc2626'
                        }}>
                          {(item.isVeg === true || item.category === 'veg') ? 'V' : 'N'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px'
                  }}>
                    {/* Kitchen Note Toggle */}
                    <button
                      onClick={() => setExpandedNoteId(
                        expandedNoteId === (item.cartId || item.id) ? null : (item.cartId || item.id)
                      )}
                      style={{
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: item.notes ? '#d97706' : '#94a3b8',
                        backgroundColor: item.notes ? '#fffbeb' : 'transparent',
                        border: `1px solid ${item.notes ? '#fde68a' : '#e2e8f0'}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      title="Kitchen note"
                    >
                      <FaStickyNote size={8} />
                    </button>
                    {/* Individual Delete Button */}
                    <button
                      onClick={() => {
                        // Remove all instances of this item
                        const newCart = cart.filter(cartItem => cartItem.id !== item.id);
                        setCart(newCart);
                      }}
                      style={{
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ef4444',
                        backgroundColor: 'transparent',
                        border: '1px solid #fecaca',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#fef2f2';
                        e.target.style.borderColor = '#ef4444';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.borderColor = '#fecaca';
                      }}
                      title="Remove item"
                    >
                      <FaTimes size={8} />
                    </button>
                    
                    {/* Quantity Controls */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      backgroundColor: 'white', 
                      borderRadius: '6px', 
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      gap: '2px'
                    }}>
                      <button
                        onClick={() => onRemoveFromCart(item.cartId || item.id)}
                        style={{
                          width: '22px',
                          height: '22px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ef4444',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '4px 0 0 4px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#fef2f2';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        <FaMinus size={8} />
                      </button>
                      <input
                        type="text"
                        value={item.quantity}
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value) || 1;
                          if (newQuantity > 0 && onUpdateCartItemQuantity) {
                            onUpdateCartItemQuantity(item.cartId || item.id, newQuantity);
                          }
                        }}
                        onBlur={(e) => {
                          // Ensure minimum quantity of 1
                          const quantity = parseInt(e.target.value) || 1;
                          if (quantity < 1) {
                            e.target.value = 1;
                            if (onUpdateCartItemQuantity) {
                              onUpdateCartItemQuantity(item.cartId || item.id, 1);
                            }
                          }
                        }}
                        style={{
                          width: '36px',
                          height: '22px',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          color: '#1f2937',
                          border: 'none',
                          fontSize: '11px',
                          backgroundColor: '#f9fafb',
                          outline: 'none',
                          borderRadius: '0'
                        }}
                      />
                      <button
                        onClick={() => onUpdateCartItemQuantity && onUpdateCartItemQuantity((item.cartId || item.id), (item.quantity || 1) + 1)}
                        style={{
                          width: '22px',
                          height: '22px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#10b981',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '0 4px 4px 0',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#f0fdf4';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        <FaPlus size={8} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Custom Item Entry */}
            {posSettings.allowCustomItems && (
              showCustomItemForm ? (
                <div style={{
                  backgroundColor: '#f0fdf4', borderRadius: '8px', padding: '8px',
                  border: '1.5px dashed #86efac',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('dashboard.customItem')}</span>
                    <button
                      onClick={() => { setShowCustomItemForm(false); setCustomItemName(''); setCustomItemPrice(''); setCustomItemQty('1'); }}
                      style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '14px', lineHeight: 1, padding: '2px' }}
                    >&times;</button>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder={t('dashboard.itemName')}
                      value={customItemName}
                      onChange={(e) => setCustomItemName(e.target.value)}
                      autoFocus
                      style={{
                        flex: 2, padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '6px',
                        fontSize: '11px', outline: 'none', background: '#fff', minWidth: 0,
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#22c55e'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder={t('dashboard.price')}
                      value={customItemPrice}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === '' || /^\d*\.?\d{0,2}$/.test(v)) setCustomItemPrice(v);
                      }}
                      style={{
                        width: '60px', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '6px',
                        fontSize: '11px', outline: 'none', background: '#fff', textAlign: 'right',
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#22c55e'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={customItemQty}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '');
                        setCustomItemQty(v);
                      }}
                      style={{
                        width: '32px', padding: '6px 4px', border: '1px solid #d1d5db', borderRadius: '6px',
                        fontSize: '11px', outline: 'none', background: '#fff', textAlign: 'center',
                      }}
                    />
                    <button
                      onClick={() => {
                        if (!customItemName.trim() || !customItemPrice || parseFloat(customItemPrice) <= 0) return;
                        const ts = Date.now();
                        const newItem = {
                          id: `custom-${ts}`,
                          cartId: `custom-${ts}`,
                          name: customItemName.trim(),
                          price: parseFloat(customItemPrice),
                          basePrice: parseFloat(customItemPrice),
                          quantity: parseInt(customItemQty) || 1,
                          isCustomItem: true,
                          category: 'custom',
                        };
                        setCart(prev => [newItem, ...prev]);
                        setCustomItemName('');
                        setCustomItemPrice('');
                        setCustomItemQty('1');
                        setShowCustomItemForm(false);
                      }}
                      disabled={!customItemName.trim() || !customItemPrice || parseFloat(customItemPrice) <= 0}
                      style={{
                        width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: (!customItemName.trim() || !customItemPrice || parseFloat(customItemPrice) <= 0) ? '#d1d5db' : '#22c55e',
                        color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer',
                        fontSize: '14px', fontWeight: 'bold', flexShrink: 0,
                      }}
                    >
                      ✓
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCustomItemForm(true)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                    padding: '6px', borderRadius: '8px', border: '1.5px dashed #d1d5db',
                    background: 'transparent', color: '#9ca3af', fontSize: '11px', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.color = '#22c55e'; e.currentTarget.style.background = '#f0fdf4'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <FaPlus size={9} /> {t('dashboard.addCustomItem')}
                </button>
              )
            )}
          </div>
        )}

      </div>

      {/* Bottom Section - Total, Customer Info, Payment, Buttons */}
      {/* In billing mode: no flex/overflow — parent div scrolls everything as one column */}
      {cart.length > 0 && !shouldShowOrderSummary() && (
        <div style={{
          borderTop: '1px solid #e5e7eb',
          backgroundColor: 'white',
          flexShrink: billingMode ? 0 : 0,
          boxShadow: billingMode ? 'none' : '0 -4px 12px rgba(0,0,0,0.08)'
        }}>
          {/* (Discount controls moved inline with special instructions below) */}

          {/* Total - Red bar */}
          <div style={{ padding: isMobile ? '2px 8px 4px 8px' : '4px 12px 6px 12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
              color: 'white',
              padding: isMobile ? '8px 10px' : '12px 14px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              opacity: editPreFillPending ? 0.5 : 1,
              transition: 'opacity 0.2s ease',
            }}>
              {/* Total with Subtotal & Tax on left, Amount on right */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: 'bold', marginBottom: isMobile ? '2px' : '4px' }}>{t('common.total')}</div>
                  <div style={{ fontSize: isMobile ? '9px' : '11px', opacity: 0.9, display: 'flex', gap: isMobile ? '6px' : '12px', flexWrap: 'wrap' }}>
                    <span>Subtotal: {formatCurrency(getTotalAmount())}</span>
                    {totalDiscountAmount > 0 && (
                      <span style={{ color: '#bbf7d0' }}>Discount: -{formatCurrency(totalDiscountAmount)}</span>
                    )}
                    {serviceChargeAmount > 0 && (
                      <span>{billingSettings.serviceChargeLabel || 'Service Charge'} ({serviceChargeRateOverride !== null ? serviceChargeRateOverride : billingSettings.serviceChargeRate}%): {formatCurrency(serviceChargeAmount)}</span>
                    )}
                    {taxBreakdown.map((tax, index) => (
                      <span key={index}>{tax.name} ({tax.rate}%){tax.inclusive ? ' (incl.)' : ''}: {formatCurrency(tax.amount || 0)}</span>
                    ))}
                    {tipAmount > 0 && (
                      <span style={{ color: '#fef08a' }}>Tip: {formatCurrency(tipAmount)}</span>
                    )}
                    {roundOffAmount !== 0 && (
                      <span>Round-off: {roundOffAmount > 0 ? '+' : ''}{formatCurrency(roundOffAmount)}</span>
                    )}
                  </div>
                </div>
                <span style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 'bold' }}>{formatCurrency(editPreFillPending && currentOrder?.finalAmount != null ? currentOrder.finalAmount : (grandTotal !== null ? grandTotal : Math.max(0, getTotalAmount() - totalDiscountAmount + totalTax + serviceChargeAmount + tipAmount + roundOffAmount)))}</span>
              </div>
              {useWallet && parseFloat(walletRedeemAmount) > 0 && (
                <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.25)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontSize: '11px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FaWallet size={9} /> {t('dashboard.walletApplied')}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#bbf7d0' }}>-{formatCurrency(parseFloat(walletRedeemAmount))}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700 }}>{t('dashboard.amountToPay')}</span>
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                      {formatCurrency(Math.max(0, Math.round(((grandTotal !== null ? grandTotal : getTotalAmount()) - parseFloat(walletRedeemAmount)) * 100) / 100))}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions Section */}
          {!shouldShowOrderSummary() && (
            <div style={{ padding: isMobile ? '4px 8px 8px 8px' : '6px 12px 12px 12px' }}>
              {/* Offers, Discount, SC, Staff — horizontal scroll row */}
              {(() => {
                const hasOffers = genericOffers.length > 0 || personalizedOffers.length > 0;
                const hasLoyalty = loyaltySettings?.enabled && customerData && lookupStatus === 'found';
                const hasAnything = hasOffers || hasLoyalty || totalDiscountAmount > 0 || specialInstructions;
                const showOffers = hasAnything && cart.length > 0;
                const showDiscount = canEditManualDiscount && cart.length > 0;
                const showSC = billingSettings.serviceChargeEnabled && billingSettings.serviceChargeShowOnDashboard && isRoleAllowed(billingSettings.serviceChargeRoles) && cart.length > 0;
                const showStaffAssign = posSettings.showAssignStaff && onAssignedStaffChange && cart.length > 0;
                if (!showOffers && !showDiscount && !showSC && !showStaffAssign) return null;

                const activeOfferCount = (offerSettings?.allowMultipleOffers ? selectedOfferIds : (selectedOfferId ? [selectedOfferId] : [])).length;
                const loyaltyDisc = getLoyaltyDiscountAmount();
                const earnPts = getLoyaltyPointsToEarn();
                const couponDisc = getCouponDiscountAmount();
                const hasApplied = activeOfferCount > 0 || loyaltyDisc > 0 || couponDisc > 0;

                return (
                  <div style={{ overflowX: 'auto', marginBottom: isMobile ? '4px' : '6px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <style>{`.billing-scroll-row::-webkit-scrollbar { display: none; }`}</style>
                    <div className="billing-scroll-row" style={{ display: 'flex', gap: '6px', alignItems: 'stretch', whiteSpace: 'nowrap', minWidth: 'min-content' }}>
                    {showOffers && (
                      <button
                        onClick={() => setShowOffersModal(true)}
                        style={{
                          flexShrink: 0, padding: '4px 6px', borderRadius: '8px',
                          border: hasApplied ? '1.5px solid #86efac' : '1.5px dashed #d1d5db',
                          background: hasApplied
                            ? 'linear-gradient(135deg, #f0fdf4, #ecfdf5)'
                            : 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                          transition: 'all 0.2s',
                          boxShadow: hasApplied ? '0 1px 4px rgba(22,163,74,0.08)' : '0 1px 2px rgba(0,0,0,0.04)',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
                      >
                        <FaTag size={9} style={{ color: hasApplied ? '#16a34a' : '#9ca3af', flexShrink: 0 }} />
                        <div style={{ textAlign: 'left' }}>
                          {hasApplied ? (
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#15803d', whiteSpace: 'nowrap' }}>
                              -{formatCurrency(totalDiscountAmount)}
                              {activeOfferCount > 0 && <span style={{ fontWeight: 500 }}> · {activeOfferCount} offer{activeOfferCount > 1 ? 's' : ''}</span>}
                            </span>
                          ) : (
                            <span style={{ fontSize: '10px', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>
                              Offers{hasOffers ? ` (${applicableOffers.length})` : ''}
                            </span>
                          )}
                        </div>
                        <FaChevronDown size={7} style={{ color: hasApplied ? '#15803d' : '#9ca3af', flexShrink: 0 }} />
                      </button>
                    )}
                    {showDiscount && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0,
                        padding: '4px 8px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#fafafa',
                      }}>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap' }}>Discount</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="0"
                          value={manualDiscountValue}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === '' || /^\d*\.?\d{0,2}$/.test(v)) {
                              const num = parseFloat(v) || 0;
                              if (manualDiscountTypeState === 'percentage' && discountSettings.maxDiscountPercent && num > discountSettings.maxDiscountPercent) return;
                              if (manualDiscountTypeState === 'flat' && discountSettings.maxDiscountAmount && num > discountSettings.maxDiscountAmount) return;
                              setManualDiscountValue(v);
                            }
                          }}
                          style={{
                            width: '48px', padding: '4px 6px',
                            border: '1px solid #e5e7eb', borderRadius: '6px',
                            fontSize: '11px', textAlign: 'right', outline: 'none',
                            backgroundColor: 'white',
                          }}
                        />
                        <select
                          value={manualDiscountTypeState}
                          onChange={(e) => { setManualDiscountTypeState(e.target.value); setManualDiscountValue(''); }}
                          style={{
                            padding: '4px 4px', border: '1px solid #e5e7eb', borderRadius: '6px',
                            fontSize: '11px', backgroundColor: 'white', cursor: 'pointer', outline: 'none',
                          }}
                        >
                          <option value="flat">{getCurrencySymbol()}</option>
                          <option value="percentage">%</option>
                        </select>
                        {getManualDiscountAmount() > 0 && (
                          <span style={{ fontSize: '10px', fontWeight: 600, color: '#16a34a', whiteSpace: 'nowrap' }}>
                            -{formatCurrency(getManualDiscountAmount())}
                          </span>
                        )}
                      </div>
                    )}
                    {showSC && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '0',
                        borderRadius: '10px', border: '1px solid #e5e7eb', overflow: 'hidden',
                        background: '#fafafa', flexShrink: 0,
                      }}>
                        <button
                          onClick={() => setServiceChargeOverridePersistent(serviceChargeOverride === false ? true : false)}
                          style={{
                            padding: '4px 8px', border: 'none', cursor: 'pointer',
                            fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px',
                            background: serviceChargeOverride !== false ? '#dcfce7' : '#fee2e2',
                            color: serviceChargeOverride !== false ? '#16a34a' : '#dc2626',
                            transition: 'all 0.2s',
                          }}
                        >
                          <FaConciergeBell size={8} />
                          SC
                        </button>
                        {serviceChargeOverride !== false && billingSettings.serviceChargeAllowRateEdit ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={serviceChargeRateOverride !== null ? serviceChargeRateOverride : billingSettings.serviceChargeRate}
                            onChange={(e) => setServiceChargeRateOverride(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                            style={{
                              width: '36px', padding: '4px 2px', border: 'none', borderLeft: '1px solid #e5e7eb',
                              fontSize: '10px', fontWeight: 700, outline: 'none', background: 'white', textAlign: 'center',
                            }}
                          />
                        ) : serviceChargeOverride !== false ? (
                          <span style={{ padding: '4px 6px', fontSize: '10px', fontWeight: 700, color: '#374151', borderLeft: '1px solid #e5e7eb' }}>
                            {serviceChargeRateOverride !== null ? serviceChargeRateOverride : billingSettings.serviceChargeRate}
                          </span>
                        ) : null}
                        {serviceChargeOverride !== false && (
                          <span style={{ fontSize: '9px', color: '#6b7280', paddingRight: '6px' }}>%</span>
                        )}
                        {serviceChargeOverride === false && (
                          <span style={{ padding: '4px 8px', fontSize: '9px', fontWeight: 700, color: '#dc2626', borderLeft: '1px solid #fecaca' }}>OFF</span>
                        )}
                      </div>
                    )}
                    {showStaffAssign && (
                      <div style={{ position: 'relative', flexShrink: 0, minWidth: '100px' }}>
                        <input
                          type="text"
                          placeholder="Assign Staff"
                          value={staffQuery !== '' ? staffQuery : (assignedStaff?.name || '')}
                          onFocus={() => { fetchStaffList(); setStaffDropdownOpen(true); }}
                          onBlur={() => setTimeout(() => setStaffDropdownOpen(false), 200)}
                          onChange={(e) => {
                            setStaffQuery(e.target.value);
                            onAssignedStaffChange(e.target.value ? { name: e.target.value, id: null } : null);
                          }}
                          style={{
                            width: '100%',
                            padding: '4px 6px',
                            border: `1.5px solid ${assignedStaff?.name ? '#86efac' : '#d1d5db'}`,
                            borderRadius: '10px',
                            fontSize: '10px',
                            fontWeight: 500,
                            color: '#1f2937',
                            outline: 'none',
                            boxSizing: 'border-box',
                            background: assignedStaff?.name ? '#f0fdf4' : '#fafafa',
                            transition: 'border-color 0.2s',
                            height: '100%',
                          }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.target.blur(); } }}
                        />
                        {staffDropdownOpen && filteredStaff.length > 0 && (
                          <div style={{
                            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                            background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)', maxHeight: '150px', overflow: 'auto', marginTop: '4px',
                          }}>
                            {filteredStaff.map(s => (
                              <div key={s.id} onMouseDown={(e) => {
                                e.preventDefault();
                                onAssignedStaffChange({ name: s.name, id: s.id });
                                setStaffQuery('');
                                setStaffDropdownOpen(false);
                              }} style={{
                                padding: '6px 10px', cursor: 'pointer', fontSize: '11px',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                borderBottom: '1px solid #f8fafc',
                              }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                              >
                                <span style={{ fontWeight: 500, color: '#1f2937' }}>{s.name}</span>
                                <span style={{ fontSize: '9px', color: '#9ca3af' }}>{s.role}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    </div>
                  </div>
                );
              })()}

                {/* Validation states */}
                {(() => {
                  const mobileDigits = String(customerMobile || '').replace(/\D/g, '');
                  const isValidMobile = mobileDigits.length >= getPhoneMinLength(countryCode);
                  const isValidName = String(customerName || '').trim().length > 3;
                  const isValidTable = String(tableNumber || '').trim().length > 0 && /\d/.test(String(tableNumber));
                  const isValidRoom = String(manualRoomNumber || '').trim().length > 0 && /\d/.test(String(manualRoomNumber));
                  const isValidLocation = locationType === 'room' ? isValidRoom : isValidTable;
                  
                  return (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '6px',
                  alignItems: 'start',
                  }}>
                    {/* Customer Mobile + Lookup (Phone First) */}
                    {!posSettings.hideMobile && (
                    <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      placeholder={posSettings.mobileLabel || 'Mobile Number'}
                      value={customerMobile || ''}
                        maxLength={getPhoneMinLength(countryCode) + 3}
                      style={{
                          width: '100%',
                        padding: isMobile ? '8px 10px' : '8px 10px',
                        paddingRight: '36px',
                          border: `1.5px solid ${
                            lookupStatus === 'error' ? '#ef4444' :
                            lookupStatus === 'found' ? '#22c55e' :
                            lookupStatus === 'not_found' && isValidMobile ? '#f59e0b' :
                            isValidMobile ? '#22c55e' : '#e5e7eb'
                          }`,
                        borderRadius: '8px',
                        fontSize: isMobile ? '12px' : '12px',
                        outline: 'none',
                        backgroundColor: lookupStatus === 'found' ? '#f0fdf4' : lookupStatus === 'error' ? '#fef2f2' : '#ffffff',
                        transition: 'border-color 0.2s, box-shadow 0.2s, background-color 0.2s',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                        boxSizing: 'border-box',
                      }}
                      onChange={(e) => {
                          const digits = (e.target.value || '').replace(/\D/g, '');
                        if (typeof onCustomerMobileChange === 'function') {
                            onCustomerMobileChange(digits);
                          }
                          triggerLookup(digits);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const digits = (e.target.value || '').replace(/\D/g, '');
                            const minLen = getPhoneMinLength(countryCode);
                            if (digits.length >= minLen) {
                              triggerLookup(digits, { force: true });
                            }
                          }
                        }}
                        onFocus={(e) => {
                          e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
                          const digits = (e.target.value || '').replace(/\D/g, '');
                          const minLen = getPhoneMinLength(countryCode);
                          e.target.style.borderColor = digits.length >= minLen ? '#22c55e' : '#6366f1';
                        }}
                        onBlur={(e) => {
                          e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
                          const digits = (e.target.value || '').replace(/\D/g, '');
                          const minLen = getPhoneMinLength(countryCode);
                          e.target.style.borderColor = lookupStatus === 'error' ? '#ef4444' :
                            lookupStatus === 'found' ? '#22c55e' :
                            digits.length >= minLen ? '#22c55e' : '#e5e7eb';
                        }}
                      />
                      {/* Status icon inside input — right side */}
                      <span style={{
                        position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                        display: 'flex', alignItems: 'center', gap: '2px',
                      }}>
                        {lookupStatus === 'loading' ? (
                          <span style={{
                            width: '14px', height: '14px', border: '2px solid #e0e7ff', borderTopColor: '#6366f1',
                            borderRadius: '50%', animation: 'custSpin .6s linear infinite', display: 'inline-block',
                          }} />
                        ) : lookupStatus === 'found' ? (
                          <FaCheckCircle size={14} color="#22c55e" title="Customer found" />
                        ) : lookupStatus === 'not_found' && isValidMobile ? (
                          <FaUserPlus size={13} color="#f59e0b" title="New customer" />
                        ) : lookupStatus === 'error' ? (
                          <button
                            type="button"
                            onClick={() => {
                              const digits = (customerMobile || '').replace(/\D/g, '');
                              triggerLookup(digits, { force: true });
                            }}
                            title="Retry lookup"
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                              display: 'flex', alignItems: 'center', color: '#ef4444',
                            }}
                          >
                            <FaRedo size={12} />
                          </button>
                        ) : isValidMobile ? (
                          <button
                            type="button"
                            onClick={() => {
                              const digits = (customerMobile || '').replace(/\D/g, '');
                              triggerLookup(digits, { force: true });
                            }}
                            title="Fetch customer details"
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                              display: 'flex', alignItems: 'center', color: '#9ca3af',
                              transition: 'color 0.15s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#6366f1'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                          >
                            <FaRedo size={11} />
                          </button>
                        ) : null}
                      </span>
                      <style>{`@keyframes custSpin{to{transform:translateY(-50%) rotate(360deg)}}`}</style>
                    </div>
                    )}

                    {/* Customer Due Warning */}
                    {lookupStatus === 'found' && customerData?.outstandingBalance > 0 && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '3px 8px', background: '#fef2f2', border: '1px solid #fecaca',
                        borderRadius: '8px', fontSize: '10px', fontWeight: 700, color: '#dc2626',
                        flexShrink: 0, gridColumn: '1 / -1',
                      }}>
                        <FaExclamationTriangle size={9} />
                        Due: {formatCurrency(customerData.outstandingBalance)}
                      </div>
                    )}

                    {/* Customer Name — always visible, pre-filled when customer found */}
                    {!posSettings.hideCustomerName && (
                    <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder={posSettings.customerNameLabel || t('dashboard.customerName')}
                      value={customerName || ''}
                      style={{
                          width: '100%',
                        padding: isMobile ? '8px 10px' : '8px 10px',
                        paddingRight: (lookupStatus === 'found' && customerData) ? '36px' : '10px',
                          border: `1.5px solid ${(lookupStatus === 'found' && customerData) ? '#0891b2' : isValidName ? '#22c55e' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        fontSize: '12px',
                        outline: 'none',
                        backgroundColor: (lookupStatus === 'found' && customerData) ? '#ecfeff' : '#ffffff',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                        boxSizing: 'border-box',
                      }}
                      onChange={(e) => {
                        if (typeof onCustomerNameChange === 'function') {
                          onCustomerNameChange(e.target.value);
                        }
                      }}
                        onFocus={(e) => {
                          e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
                          const val = e.target.value.trim();
                          e.target.style.borderColor = val.length > 3 ? '#22c55e' : '#6366f1';
                        }}
                        onBlur={(e) => {
                          e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
                          const val = e.target.value.trim();
                          e.target.style.borderColor = (lookupStatus === 'found' && customerData) ? '#0891b2' : val.length > 3 ? '#22c55e' : '#e5e7eb';
                        }}
                    />
                    {/* Verified badge inside name field */}
                    {lookupStatus === 'found' && customerData && (
                      <span style={{
                        position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                        color: '#0891b2', display: 'flex', alignItems: 'center',
                      }}>
                        <FaCheckCircle size={14} />
                      </span>
                    )}
                    </div>
                    )}

                    {/* Customer Info Card — shows when customer found via lookup */}
                    {lookupStatus === 'found' && customerData && (
                      <button
                        onClick={() => setShowOffersModal(true)}
                        style={{
                          gridColumn: '1 / -1',
                          padding: isMobile ? '6px 10px' : '6px 12px',
                          borderRadius: '10px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: isMobile ? '10px' : '8px',
                          fontSize: isMobile ? '12px' : '11px',
                          fontWeight: 600,
                          color: '#ffffff',
                          transition: 'all 0.2s',
                          whiteSpace: 'nowrap',
                          boxShadow: '0 2px 8px rgba(30,41,59,0.35)',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(30,41,59,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(30,41,59,0.35)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        title="View customer details & offers"
                      >
                        <div style={{
                          width: isMobile ? '26px' : '20px', height: isMobile ? '26px' : '20px',
                          borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <FaUser size={isMobile ? 9 : 8} style={{ color: '#fff' }} />
                        </div>
                        {customerData.loyaltyPoints > 0 && (
                          <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: isMobile ? '11px' : '10px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <FaStar size={8} style={{ color: '#fbbf24' }} />{customerData.loyaltyPoints}
                          </span>
                        )}
                        <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: isMobile ? '11px' : '10px' }}>
                          {customerData.totalOrders} orders
                        </span>
                        <FaChevronDown size={8} style={{ color: 'rgba(255,255,255,0.6)', marginLeft: isMobile ? 'auto' : '0', flexShrink: 0 }} />
                      </button>
                    )}

                    {/* New Customer indicator — when phone entered but no profile found */}
                    {lookupStatus === 'not_found' && customerMobile && (
                      <div style={{
                        gridColumn: '1 / -1',
                        padding: isMobile ? '5px 10px' : '5px 10px',
                        borderRadius: '8px',
                        border: '1px solid #bbf7d0',
                        backgroundColor: '#f0fdf4',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: isMobile ? '11px' : '10px',
                        color: '#16a34a',
                        fontWeight: 500,
                      }}>
                        <FaUser size={8} />
                        <span>New customer — will be saved on billing</span>
                      </div>
                    )}
                      
                      {/* Table/Room Number - Inline when not in-room dining, or when in-room dining is enabled */}
                      {!posSettings.hideTableField && (!inRoomDiningEnabled ? (
                        /* Simple Table Input - All on one line */
                        <input
                          type="text"
                          placeholder={posSettings.tableLabel || 'Table No'}
                          value={tableNumber || ''}
                          style={{
                            width: '100%',
                            padding: isMobile ? '8px 10px' : '8px 10px',
                            border: `2px solid ${isValidTable ? '#22c55e' : '#d1d5db'}`,
                            borderRadius: '6px',
                            fontSize: '12px',
                            outline: 'none',
                            backgroundColor: '#f9fafb',
                            transition: 'border-color 0.2s'
                          }}
                          onChange={(e) => {
                            if (typeof onTableNumberChange === 'function') {
                              onTableNumberChange(e.target.value);
                            }
                          }}
                          onFocus={(e) => {
                            const val = e.target.value.trim();
                            e.target.style.borderColor = (val.length > 0 && /\d/.test(val)) ? '#22c55e' : '#d1d5db';
                          }}
                          onBlur={(e) => {
                            const val = e.target.value.trim();
                            e.target.style.borderColor = (val.length > 0 && /\d/.test(val)) ? '#22c55e' : '#d1d5db';
                          }}
                        />
                      ) : (
                        /* Combined Table/Room Selector with Input Box */
                        <div style={{
                          display: 'flex',
                          gap: '4px',
                          alignItems: 'stretch',
                          width: '100%',
                        }}>
                          <div style={{ display: 'flex', gap: '0', flexShrink: 0 }}>
                            <button
                              type="button"
                              onClick={() => {
                                if (typeof setLocationType === 'function') {
                                  setLocationType('table');
                                  if (typeof setManualRoomNumber === 'function') {
                                    setManualRoomNumber('');
                                  }
                                }
                              }}
                              style={{
                                padding: isMobile ? '10px 12px' : '7px 10px',
                                borderRadius: '6px 0 0 6px',
                                border: '2px solid',
                                borderRight: 'none',
                                backgroundColor: locationType === 'table' ? '#ef4444' : 'white',
                                color: locationType === 'table' ? 'white' : '#374151',
                                borderColor: locationType === 'table' ? '#ef4444' : '#e5e7eb',
                                fontWeight: '600',
                                fontSize: isMobile ? '12px' : '11px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '3px',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <FaTable size={11} />
                              Table
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (typeof setLocationType === 'function') {
                                  setLocationType('room');
                                  if (typeof onTableNumberChange === 'function') {
                                    onTableNumberChange('');
                                  }
                                }
                              }}
                              style={{
                                padding: isMobile ? '10px 12px' : '7px 10px',
                                borderRadius: '0 6px 6px 0',
                                border: '2px solid',
                                backgroundColor: locationType === 'room' ? '#ef4444' : 'white',
                                color: locationType === 'room' ? 'white' : '#374151',
                                borderColor: locationType === 'room' ? '#ef4444' : '#e5e7eb',
                                fontWeight: '600',
                                fontSize: isMobile ? '12px' : '11px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '3px',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <FaBed size={11} />
                              Room
                            </button>
                          </div>
                          {/* Input Box - Shows Table or Room based on selection */}
                          <input
                            type="text"
                            placeholder={locationType === 'room' ? 'Room No' : 'Table No'}
                            value={locationType === 'room' ? (manualRoomNumber || '') : (tableNumber || '')}
                            style={{
                              flex: 1,
                              minWidth: '60px',
                              maxWidth: '80px',
                              padding: isMobile ? '10px 12px' : '7px 10px',
                              border: `2px solid ${isValidLocation ? '#22c55e' : '#d1d5db'}`,
                              borderRadius: '6px',
                              fontSize: isMobile ? '14px' : '12px',
                              outline: 'none',
                              backgroundColor: '#f9fafb',
                              transition: 'border-color 0.2s'
                            }}
                            onChange={(e) => {
                              if (locationType === 'room') {
                                if (typeof setManualRoomNumber === 'function') {
                                  setManualRoomNumber(e.target.value);
                                }
                              } else {
                                if (typeof onTableNumberChange === 'function') {
                                  onTableNumberChange(e.target.value);
                                }
                              }
                            }}
                            onFocus={(e) => {
                              const val = e.target.value.trim();
                              const hasDigits = /\d/.test(val);
                              e.target.style.borderColor = (val.length > 0 && hasDigits) ? '#22c55e' : '#3b82f6';
                            }}
                            onBlur={(e) => {
                              const val = e.target.value.trim();
                              const hasDigits = /\d/.test(val);
                              e.target.style.borderColor = (val.length > 0 && hasDigits) ? '#22c55e' : '#d1d5db';
                            }}
                          />
                        </div>
                      ))}

                    </div>
                  );
                })()}

              {/* Payment Method Selection */}
              <div style={{ marginBottom: isMobile ? '6px' : '16px' }}>
                <div style={{
                  fontSize: isMobile ? '10px' : '12px',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: isMobile ? '4px' : '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <FaCreditCard size={12} />
                  {t('dashboard.paymentMethod')}
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[
                    ...(Array.isArray(posSettings.paymentMethods)
                      ? posSettings.paymentMethods.filter(pm => pm.enabled)
                      : [
                          { id: 'cash', label: t('dashboard.cash') },
                          ...(!posSettings.hideUPI ? [{ id: 'upi', label: t('dashboard.upi') }] : []),
                          ...(!posSettings.hideCard ? [{ id: 'card', label: t('dashboard.card') }] : [])
                        ]
                    ),
                    ...(ecrEnabled ? [{ id: 'card-terminal', label: 'Card (Terminal)' }] : []),
                  ].map((method) => {
                    const isSelected = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        style={{
                          flex: 1,
                          padding: '6px 4px',
                          backgroundColor: isSelected ? '#ef4444' : 'white',
                          color: isSelected ? 'white' : '#6b7280',
                          border: isSelected ? '1px solid #ef4444' : '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontWeight: '600',
                          fontSize: '9px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? '0 2px 6px rgba(239, 68, 68, 0.3)' : '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        {method.label}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* Billing Features Toolbar */}
          {(() => {
            const billingTools = [
              billingSettings.cashTenderingEnabled && isRoleAllowed(billingSettings.cashTenderingRoles) && paymentMethod === 'cash' && { id: 'cash', icon: FaMoneyBillWave, label: 'Cash', color: '#10b981' },
              billingSettings.splitPaymentEnabled && isRoleAllowed(billingSettings.splitPaymentRoles) && (() => {
                // Placement gating:
                // - billingMode=true  → orderhistory Complete flow → show only if settlementShowOnOrderHistory
                // - billingMode=false → dashboard summary → show if settlementShowOnDashboard
                // - If both flags are off (legacy / misconfigured) → fall back to dashboard so the toggle still works.
                const showDash = billingSettings.settlementShowOnDashboard !== false;
                const showHist = billingSettings.settlementShowOnOrderHistory === true;
                const bothOff = !showDash && !showHist;
                const visible = billingMode ? showHist : (showDash || bothOff);
                return visible;
              })() && { id: 'split', icon: FaCreditCard, label: 'Settlement', color: '#3b82f6' },
              billingSettings.tipsEnabled && isRoleAllowed(billingSettings.tipsRoles) && { id: 'tip', icon: FaHandHoldingUsd, label: 'Tip', color: '#f59e0b' },
              billingSettings.partialPaymentEnabled && isRoleAllowed(billingSettings.partialPaymentRoles) && { id: 'partial', icon: FaWallet, label: 'Credit', color: '#8b5cf6' },
              billingSettings.compVoidEnabled && isRoleAllowed(billingSettings.compVoidRoles) && { id: 'comp', icon: FaGift, label: 'Comp', color: '#ec4899' },
              billingSettings.compVoidEnabled && isRoleAllowed(billingSettings.compVoidRoles) && { id: 'void', icon: FaBan, label: 'Void', color: '#6b7280' },
            ].filter(Boolean);

            if (billingTools.length === 0) return null;

            return (
              <div style={{ padding: '0 12px 8px 12px' }}>
                {/* Toolbar icons */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: activeBillingPanel ? '8px' : 0 }}>
                  {billingTools.map(tool => {
                    const isActive = activeBillingPanel === tool.id;
                    const ToolIcon = tool.icon;
                    const hasValue = (tool.id === 'cash' && cashReceived) ||
                      (tool.id === 'tip' && tipAmount > 0) ||
                      (tool.id === 'split' && splitPayments.some(sp => sp.amount > 0)) ||
                      (tool.id === 'partial' && (parseFloat(partialPayAmount) > 0 || fullDueMode)) ||
                      ((tool.id === 'comp' || tool.id === 'void') && compVoidItems.length > 0);
                    return (
                      <button
                        key={tool.id}
                        onClick={() => setActiveBillingPanel(isActive ? null : tool.id)}
                        style={{
                          flex: 1,
                          padding: '6px 4px',
                          borderRadius: '8px',
                          border: isActive ? `1.5px solid ${tool.color}` : hasValue ? `1.5px solid ${tool.color}66` : '1px solid #e5e7eb',
                          background: isActive ? `${tool.color}10` : hasValue ? `${tool.color}08` : 'white',
                          color: isActive || hasValue ? tool.color : '#9ca3af',
                          fontSize: '9px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <ToolIcon size={10} />
                        {tool.label}
                        {hasValue && <FaCheckCircle size={8} />}
                      </button>
                    );
                  })}
                </div>

                {/* Cash Tendering Panel */}
                {activeBillingPanel === 'cash' && (
                  <div style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '10px',
                    padding: '12px',
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#166534', marginBottom: '8px' }}>Cash Tendering</div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
                      <input
                        type="number"
                        placeholder="Cash received"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          border: '1.5px solid #86efac',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 700,
                          outline: 'none',
                          background: 'white'
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => setCashReceived(String(Math.ceil(grandTotal)))}
                        style={{
                          padding: '8px 12px',
                          background: '#16a34a',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '10px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Exact
                      </button>
                    </div>
                    {/* Denomination buttons */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                      {(billingSettings.denominations || [100, 200, 500, 1000, 2000]).map(d => (
                        <button
                          key={d}
                          onClick={() => setCashReceived(String(d))}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            background: cashReceived === String(d) ? '#dcfce7' : 'white',
                            fontSize: '10px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: '#374151'
                          }}
                        >
                          {formatCurrency(d)}
                        </button>
                      ))}
                    </div>
                    {/* Change */}
                    {parseFloat(cashReceived) > 0 && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        background: parseFloat(cashReceived) >= grandTotal ? '#dcfce7' : '#fef2f2',
                        borderRadius: '8px',
                        fontWeight: 700
                      }}>
                        <span style={{ fontSize: '12px', color: '#374151' }}>
                          {parseFloat(cashReceived) >= grandTotal ? 'Return Change' : 'Insufficient'}
                        </span>
                        <span style={{
                          fontSize: '16px',
                          color: parseFloat(cashReceived) >= grandTotal ? '#16a34a' : '#dc2626'
                        }}>
                          {formatCurrency(Math.max(0, parseFloat(cashReceived) - grandTotal))}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Settlement Options Panel */}
                {activeBillingPanel === 'split' && (
                  <div style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '10px',
                    padding: '12px',
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e40af', marginBottom: '8px' }}>
                      Settlement Options — Total: {formatCurrency(grandTotal)}
                    </div>
                    {splitPayments.map((sp, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
                        <select
                          value={sp.method}
                          onChange={(e) => {
                            const updated = [...splitPayments];
                            updated[idx].method = e.target.value;
                            setSplitPayments(updated);
                          }}
                          style={{
                            padding: '6px 8px',
                            border: '1px solid #93c5fd',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            outline: 'none',
                            background: 'white',
                            width: '80px'
                          }}
                        >
                          <option value="cash">Cash</option>
                          <option value="upi">UPI</option>
                          <option value="card">Card</option>
                        </select>
                        <input
                          type="number"
                          placeholder="Amount"
                          value={sp.amount}
                          onChange={(e) => {
                            const updated = [...splitPayments];
                            updated[idx].amount = e.target.value;
                            setSplitPayments(updated);
                          }}
                          style={{
                            flex: 1,
                            padding: '6px 10px',
                            border: '1px solid #93c5fd',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            outline: 'none',
                            background: 'white'
                          }}
                        />
                        {splitPayments.length > 2 && (
                          <button
                            onClick={() => setSplitPayments(splitPayments.filter((_, i) => i !== idx))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '4px' }}
                          >
                            <FaTimes size={10} />
                          </button>
                        )}
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <button
                        onClick={() => setSplitPayments([...splitPayments, { method: 'cash', amount: '' }])}
                        style={{
                          fontSize: '10px',
                          color: '#2563eb',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        + Add Method
                      </button>
                      {(() => {
                        const splitTotal = splitPayments.reduce((sum, sp) => sum + (parseFloat(sp.amount) || 0), 0);
                        const remaining = Math.round((grandTotal - splitTotal) * 100) / 100;
                        return (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: Math.abs(remaining) < 0.01 ? '#16a34a' : '#dc2626'
                          }}>
                            {Math.abs(remaining) < 0.01 ? 'Balanced' : `Remaining: ${formatCurrency(remaining)}`}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Tip Panel */}
                {activeBillingPanel === 'tip' && (
                  <div style={{
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '10px',
                    padding: '12px',
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#92400e', marginBottom: '8px' }}>Add Tip</div>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      {(billingSettings.tipPresets || [5, 10, 15, 20]).map(pct => {
                        const isSelected = tipPercentage === pct;
                        const afterTaxBeforeTip = grandTotal - tipAmount - roundOffAmount;
                        const tipVal = Math.round(afterTaxBeforeTip * pct / 100 * 100) / 100;
                        return (
                          <button
                            key={pct}
                            onClick={() => {
                              if (isSelected) {
                                setTipAmount(0);
                                setTipPercentage(null);
                              } else {
                                setTipAmount(tipVal);
                                setTipPercentage(pct);
                              }
                            }}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '8px',
                              border: isSelected ? '2px solid #f59e0b' : '1px solid #fcd34d',
                              background: isSelected ? '#fef3c7' : 'white',
                              fontWeight: isSelected ? 700 : 500,
                              fontSize: '12px',
                              cursor: 'pointer',
                              color: '#92400e'
                            }}
                          >
                            {pct}%
                            <div style={{ fontSize: '9px', color: '#b45309' }}>{formatCurrency(tipVal)}</div>
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#92400e', fontWeight: 600 }}>Custom:</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={tipAmount > 0 && !tipPercentage ? tipAmount : ''}
                        onChange={(e) => {
                          setTipAmount(parseFloat(e.target.value) || 0);
                          setTipPercentage(null);
                        }}
                        style={{
                          width: '100px',
                          padding: '6px 10px',
                          border: '1px solid #fcd34d',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          outline: 'none',
                          background: 'white'
                        }}
                      />
                      {tipAmount > 0 && (
                        <button
                          onClick={() => { setTipAmount(0); setTipPercentage(null); }}
                          style={{
                            padding: '4px 10px',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            fontSize: '10px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: '#dc2626'
                          }}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Credit / Due Payment Panel */}
                {activeBillingPanel === 'partial' && (
                  <div style={{
                    background: fullDueMode ? '#fef2f2' : '#f5f3ff',
                    border: `1px solid ${fullDueMode ? '#fecaca' : '#ddd6fe'}`,
                    borderRadius: '10px',
                    padding: '12px',
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: fullDueMode ? '#991b1b' : '#5b21b6', marginBottom: '8px' }}>
                      Credit / Udhar — Total: {formatCurrency(grandTotal)}
                    </div>
                    {/* Mode Toggle: Partial vs Full Due */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                      <button
                        onClick={() => { setFullDueMode(false); }}
                        style={{
                          flex: 1, padding: '6px 0', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
                          cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                          background: !fullDueMode ? '#ede9fe' : '#f3f4f6',
                          color: !fullDueMode ? '#7c3aed' : '#6b7280',
                          outline: !fullDueMode ? '2px solid #8b5cf6' : 'none',
                        }}
                      >
                        Partial Pay
                      </button>
                      <button
                        onClick={() => { setFullDueMode(true); setPartialPayAmount(''); }}
                        style={{
                          flex: 1, padding: '6px 0', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
                          cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                          background: fullDueMode ? '#fee2e2' : '#f3f4f6',
                          color: fullDueMode ? '#dc2626' : '#6b7280',
                          outline: fullDueMode ? '2px solid #dc2626' : 'none',
                        }}
                      >
                        Full Due (Udhar)
                      </button>
                    </div>
                    {/* Partial mode: amount input */}
                    {!fullDueMode && (
                      <>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
                          <input
                            type="number"
                            placeholder="Amount to pay now"
                            value={partialPayAmount}
                            onChange={(e) => setPartialPayAmount(e.target.value)}
                            style={{
                              flex: 1, padding: '8px 10px', border: '1.5px solid #c4b5fd', borderRadius: '8px',
                              fontSize: '14px', fontWeight: 700, outline: 'none', background: 'white'
                            }}
                            autoFocus
                          />
                        </div>
                        {parseFloat(partialPayAmount) > 0 && (
                          <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '8px 12px', background: '#ede9fe', borderRadius: '8px', fontWeight: 700
                          }}>
                            <span style={{ fontSize: '12px', color: '#374151' }}>Outstanding (Khata)</span>
                            <span style={{ fontSize: '16px', color: '#7c3aed' }}>
                              {formatCurrency(Math.max(0, grandTotal - parseFloat(partialPayAmount)))}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    {/* Full Due mode: show outstanding = total */}
                    {fullDueMode && (
                      <div style={{
                        padding: '10px 12px', background: '#fee2e2', borderRadius: '8px',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700 }}>
                          <span style={{ fontSize: '12px', color: '#374151' }}>Outstanding (Udhar)</span>
                          <span style={{ fontSize: '18px', color: '#dc2626' }}>
                            {formatCurrency(grandTotal)}
                          </span>
                        </div>
                        {lookupStatus !== 'found' && (
                          <div style={{ marginTop: '6px', fontSize: '10px', color: '#dc2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaExclamationTriangle size={9} /> Customer phone required for due orders
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Comp Panel */}
                {activeBillingPanel === 'comp' && (
                  <div style={{
                    background: '#fdf2f8',
                    border: '1px solid #fbcfe8',
                    borderRadius: '10px',
                    padding: '12px',
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#9d174d', marginBottom: '8px' }}>Comp Items (Free)</div>
                    <div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '8px' }}>
                      {cart.map((item, idx) => {
                        const isSelected = compVoidItems.some(cv => cv.index === idx && cv.type === 'comp');
                        return (
                          <label key={idx} style={{
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0',
                            fontSize: '12px', cursor: 'pointer', color: '#374151'
                          }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                if (isSelected) {
                                  setCompVoidItems(compVoidItems.filter(cv => !(cv.index === idx && cv.type === 'comp')));
                                } else {
                                  setCompVoidItems([...compVoidItems, { index: idx, type: 'comp', name: item.name, quantity: item.quantity, amount: (item.price || 0) * (item.quantity || 1) }]);
                                }
                              }}
                              style={{ accentColor: '#ec4899' }}
                            />
                            <span style={{ flex: 1, fontWeight: isSelected ? 700 : 400 }}>{item.name} x{item.quantity}</span>
                            <span style={{ fontWeight: 600 }}>{formatCurrency((item.price || 0) * (item.quantity || 1))}</span>
                          </label>
                        );
                      })}
                    </div>
                    <input
                      type="text"
                      placeholder="Reason for comp"
                      value={compVoidReason}
                      onChange={(e) => setCompVoidReason(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        border: '1px solid #f9a8d4',
                        borderRadius: '6px',
                        fontSize: '11px',
                        outline: 'none',
                        background: 'white',
                        marginBottom: billingSettings.compVoidRequiresPin ? '6px' : 0,
                        boxSizing: 'border-box'
                      }}
                    />
                    {billingSettings.compVoidRequiresPin && (
                      <input
                        type="password"
                        placeholder="Manager PIN"
                        value={managerPin}
                        onChange={(e) => setManagerPin(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          border: '1px solid #f9a8d4',
                          borderRadius: '6px',
                          fontSize: '11px',
                          outline: 'none',
                          background: 'white',
                          boxSizing: 'border-box'
                        }}
                      />
                    )}
                  </div>
                )}

                {/* Void Panel */}
                {activeBillingPanel === 'void' && (
                  <div style={{
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    padding: '12px',
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Void Items (Remove)</div>
                    <div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '8px' }}>
                      {cart.map((item, idx) => {
                        const isSelected = compVoidItems.some(cv => cv.index === idx && cv.type === 'void');
                        return (
                          <label key={idx} style={{
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0',
                            fontSize: '12px', cursor: 'pointer', color: '#374151'
                          }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                if (isSelected) {
                                  setCompVoidItems(compVoidItems.filter(cv => !(cv.index === idx && cv.type === 'void')));
                                } else {
                                  setCompVoidItems([...compVoidItems, { index: idx, type: 'void', name: item.name, quantity: item.quantity, amount: (item.price || 0) * (item.quantity || 1) }]);
                                }
                              }}
                              style={{ accentColor: '#6b7280' }}
                            />
                            <span style={{ flex: 1, fontWeight: isSelected ? 700 : 400, textDecoration: isSelected ? 'line-through' : 'none' }}>{item.name} x{item.quantity}</span>
                            <span style={{ fontWeight: 600 }}>{formatCurrency((item.price || 0) * (item.quantity || 1))}</span>
                          </label>
                        );
                      })}
                    </div>
                    <input
                      type="text"
                      placeholder="Reason for void"
                      value={compVoidReason}
                      onChange={(e) => setCompVoidReason(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '11px',
                        outline: 'none',
                        background: 'white',
                        marginBottom: billingSettings.compVoidRequiresPin ? '6px' : 0,
                        boxSizing: 'border-box'
                      }}
                    />
                    {billingSettings.compVoidRequiresPin && (
                      <input
                        type="password"
                        placeholder="Manager PIN"
                        value={managerPin}
                        onChange={(e) => setManagerPin(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '11px',
                          outline: 'none',
                          background: 'white',
                          boxSizing: 'border-box'
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })()}



          {/* Action Buttons — sits at bottom of scroll in billing mode */}
          <div style={{
            padding: billingMode ? '12px 16px 16px 16px' : (isMobile ? '6px 8px calc(6px + env(safe-area-inset-bottom, 0px)) 8px' : '6px 12px 12px 12px'),
            ...(isMobile ? {
              position: 'sticky',
              bottom: 0,
              backgroundColor: '#ffffff',
              borderTop: '1px solid #e5e7eb',
              boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
              zIndex: 10,
            } : {}),
            ...(billingMode ? {
              backgroundColor: '#f8fafc',
              borderTop: '2px solid #e2e8f0',
              marginTop: '4px',
            } : {})
          }}>
          {/* Error Message */}
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '11px',
              color: '#dc2626',
              fontWeight: '600',
              marginBottom: '10px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* Schedule for Later — collapsible date/time row */}
          {!billingMode && posSettings.enableScheduleOrder && setIsScheduledOrder && isScheduledOrder && (
            <div style={{
              display: 'flex', gap: '6px', marginBottom: '6px',
              padding: '8px 10px', borderRadius: '8px',
              background: '#eff6ff', border: '1px solid #bfdbfe',
              alignItems: 'center',
            }}>
              <FaCalendarAlt size={11} style={{ color: '#3b82f6', flexShrink: 0 }} />
              <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} min={new Date().toISOString().split('T')[0]} style={{ flex: 1, padding: '5px 8px', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '11px', outline: 'none', background: '#fff', minWidth: 0 }} />
              <input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} style={{ flex: 1, padding: '5px 8px', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '11px', outline: 'none', background: '#fff', minWidth: 0 }} />
              <button onClick={() => { setIsScheduledOrder(false); setScheduledDate(''); setScheduledTime(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '13px', fontWeight: 700, padding: '2px 4px', lineHeight: 1 }}>&times;</button>
            </div>
          )}

          {/* First Row - Save and Place Order (hidden in billing mode) */}
          {!billingMode && (
            <div style={{ display: 'flex', gap: isMobile ? '4px' : '8px', marginBottom: isMobile ? '4px' : '8px', flexWrap: 'wrap' }}>
              {/* Schedule toggle button — hidden unless enabled in POS settings */}
              {posSettings.enableScheduleOrder && setIsScheduledOrder && cart.length > 0 && (
                <button
                  onClick={() => {
                    const next = !isScheduledOrder;
                    setIsScheduledOrder(next);
                    if (!next) { setScheduledDate(''); setScheduledTime(''); }
                  }}
                  style={{
                    width: '40px', flexShrink: 0,
                    background: isScheduledOrder ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#f1f5f9',
                    color: isScheduledOrder ? 'white' : '#64748b',
                    padding: '8px 0',
                    borderRadius: '8px',
                    fontWeight: '600',
                    border: isScheduledOrder ? 'none' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    boxShadow: isScheduledOrder ? '0 2px 8px rgba(59,130,246,0.3)' : 'none',
                  }}
                  title={isScheduledOrder ? 'Cancel scheduling' : 'Schedule for later'}
                >
                  <FaCalendarAlt size={13} />
                </button>
              )}

              {/* Update Order (No KOT) - shown when editing existing running order */}
              {currentOrder && currentOrder.status !== 'saved' && printSettings?.enableUpdateWithoutKOT && (
                <button
                  onClick={() => {
                    if (typeof onUpdateWithoutKOT === 'function' && !orderBusy) {
                      onUpdateWithoutKOT(buildTaxData());
                    }
                    if (isMobile && onClose && !orderBusy) {
                      setTimeout(() => onClose(), 500);
                    }
                  }}
                  disabled={orderBusy || cart.length === 0}
                  style={{
                    flex: 1,
                    background: orderBusy || cart.length === 0
                      ? 'linear-gradient(135deg, #d1d5db, #9ca3af)'
                      : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: 'white',
                    padding: isMobile ? '8px 6px' : '10px 8px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: orderBusy || cart.length === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    fontSize: '11px',
                    transition: 'all 0.2s',
                    boxShadow: orderBusy || cart.length === 0 ? 'none' : '0 2px 8px rgba(59,130,246,0.3)',
                    minWidth: 0,
                  }}
                >
                  {placingOrder ? (
                    <><FaSpinner size={11} style={{ animation: 'spin 1s linear infinite' }} /> Updating...</>
                  ) : (
                    <><FaEdit size={11} /> Update Order</>
                  )}
                </button>
              )}

              {/* Save Order (Hold) - shown for new orders only (not editing existing) */}
              {!currentOrder && !posSettings.hideSaveOrder && <button
                onClick={() => {
                  if (typeof onSaveOrder === 'function' && !orderBusy) {
                    const saveOfferIds = offerSettings?.allowMultipleOffers && selectedOfferIds.length > 0
                      ? selectedOfferIds : (selectedOfferId ? [selectedOfferId] : []);
                    const taxData = {
                      taxBreakdown, totalTax, finalAmount: grandTotal ?? getTotalAmount(), subtotal: getTotalAmount(),
                      specialInstructions: specialInstructions.trim() || null,
                      offerIds: saveOfferIds,
                      manualDiscount: getManualDiscountAmount(),
                      offerDiscount: effectiveOfferDiscount,
                      selectedOfferName: selectedOfferName || currentOrder?.selectedOfferName || null,
                      totalDiscountAmount: effectiveOfferDiscount + getManualDiscountAmount() + getLoyaltyDiscountAmount(),
                      redeemLoyaltyPoints: redeemLoyaltyPoints > 0 ? redeemLoyaltyPoints : 0,
                      loyaltyDiscount: getLoyaltyDiscountAmount(),
                      serviceChargeRate: serviceChargeAmount > 0 ? (serviceChargeRateOverride !== null ? serviceChargeRateOverride : billingSettings.serviceChargeRate) : null,
                      serviceChargeAmount: serviceChargeAmount > 0 ? serviceChargeAmount : null,
                      tipAmount: tipAmount > 0 ? tipAmount : null,
                      tipPercentage: tipPercentage || null,
                      roundOffAmount: roundOffAmount !== 0 ? roundOffAmount : null,
                      compItems: compVoidItems.filter(cv => cv.type === 'comp').length > 0 ? compVoidItems.filter(cv => cv.type === 'comp') : null,
                      voidItems: compVoidItems.filter(cv => cv.type === 'void').length > 0 ? compVoidItems.filter(cv => cv.type === 'void') : null,
                      partialPayAmount: fullDueMode ? 0 : (parseFloat(partialPayAmount) > 0 ? parseFloat(partialPayAmount) : null),
      fullDue: fullDueMode || undefined,
                      managerPin: managerPin || null,
                    };
                    onSaveOrder(taxData);
                  }
                  if (isMobile && onClose && !orderBusy) {
                    setTimeout(() => onClose(), 500);
                  }
                }}
                disabled={orderBusy || cart.length === 0 || isEditingSavedOrder}
                style={{
                  flex: 1,
                  background: orderBusy || cart.length === 0 || isEditingSavedOrder
                    ? 'linear-gradient(135deg, #d1d5db, #9ca3af)'
                    : 'linear-gradient(135deg, #f97316, #ea580c)',
                  color: 'white',
                  padding: isMobile ? '8px 6px' : '10px 8px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: orderBusy || cart.length === 0 || isEditingSavedOrder ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  fontSize: '11px',
                  transition: 'all 0.2s',
                  boxShadow: orderBusy || cart.length === 0 || isEditingSavedOrder ? 'none' : '0 2px 8px rgba(249, 115, 22, 0.3)',
                  minWidth: 0,
                }}
              >
                {savingOrder ? (
                  <><FaSpinner size={11} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
                ) : (
                  <><FaSave size={11} /> {posSettings.saveOrderLabel || t('dashboard.saveOrder')}</>
                )}
              </button>}

              {/* Place Order (KOT) / Update & KOT */}
              <button
                onClick={() => {
                  if (orderBusy) return;
                  if (needsDiscountApproval()) {
                    setPendingDiscountAction('place');
                    setShowDiscountApproval(true);
                    return;
                  }
                  if (paymentMethod === 'upi' && upiConfigured) {
                    setPendingUpiAction('place');
                    setShowUpiQr(true);
                    return;
                  }
                  if (typeof onPlaceOrder === 'function') {
                    onPlaceOrder(buildTaxData());
                  }
                  if (isMobile && onClose) {
                    setTimeout(() => onClose(), 500);
                  }
                }}
                disabled={orderBusy || cart.length === 0 || (currentOrder && currentOrder.status === 'completed')}
                style={{
                  flex: 1,
                  background: orderBusy || cart.length === 0 || (currentOrder && currentOrder.status === 'completed')
                    ? 'linear-gradient(135deg, #d1d5db, #9ca3af)'
                    : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  padding: isMobile ? '8px 6px' : '10px 8px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: orderBusy || cart.length === 0 || (currentOrder && currentOrder.status === 'completed') ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  fontSize: '11px',
                  transition: 'all 0.2s',
                  boxShadow: orderBusy || cart.length === 0 || (currentOrder && currentOrder.status === 'completed') ? 'none' : '0 2px 8px rgba(239, 68, 68, 0.3)',
                  minWidth: 0,
                }}
              >
                {placingOrder ? (
                  <><FaSpinner size={11} style={{ animation: 'spin 1s linear infinite' }} /> {t('dashboard.orderProcessing')}</>
                ) : (
                  <><FaUtensils size={11} /> {currentOrder && currentOrder.status !== 'saved' ? 'Update & KOT' : (posSettings.placeOrderLabel || 'Place Order (KOT)')}</>
                )}
              </button>

              {/* KOT & Print - combined button */}
              {printSettings?.enableKOTAndPrint && (
                <button
                  onClick={() => {
                    window.__autoPrintKOT = true;
                    if (typeof onPlaceOrderAndPrint === 'function' && !orderBusy) {
                      onPlaceOrderAndPrint(buildTaxData());
                    } else if (typeof onPlaceOrder === 'function' && !orderBusy) {
                      // Fallback: use regular place order if onPlaceOrderAndPrint not provided
                      onPlaceOrder(buildTaxData());
                    }
                    if (isMobile && onClose) {
                      setTimeout(() => onClose(), 500);
                    }
                  }}
                  disabled={orderBusy || cart.length === 0 || (currentOrder && currentOrder.status === 'completed')}
                  style={{
                    flex: 1,
                    background: orderBusy || cart.length === 0 || (currentOrder && currentOrder.status === 'completed')
                      ? 'linear-gradient(135deg, #d1d5db, #9ca3af)'
                      : 'linear-gradient(135deg, #991b1b, #7f1d1d)',
                    color: 'white',
                    padding: isMobile ? '8px 6px' : '10px 8px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: orderBusy || cart.length === 0 || (currentOrder && currentOrder.status === 'completed') ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    fontSize: '11px',
                    transition: 'all 0.2s',
                    boxShadow: orderBusy || cart.length === 0 || (currentOrder && currentOrder.status === 'completed') ? 'none' : '0 2px 8px rgba(153,27,27,0.3)',
                    minWidth: 0,
                  }}
                >
                  <FaPrint size={11} /> KOT & Print
                </button>
              )}
            </div>
          )}

          {/* Billing Row */}
          <div style={{ display: 'flex', gap: billingMode ? '10px' : '8px' }}>
            {/* Complete Billing Button */}
            <button
              onClick={() => {
                if (orderBusy) return;
                if (needsDiscountApproval()) {
                  setPendingDiscountAction('complete');
                  setShowDiscountApproval(true);
                  return;
                }
                handleProcessOrder();
              }}
              disabled={orderBusy || cart.length === 0 || (currentOrder && currentOrder.status === 'completed')}
              style={{
                width: printSettings?.enableSaveAndPrint ? '50%' : '100%',
                background: orderBusy || cart.length === 0 || (currentOrder && currentOrder.status === 'completed')
                  ? 'linear-gradient(135deg, #d1d5db, #9ca3af)'
                  : 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                padding: billingMode ? '16px 16px' : '12px 14px',
                borderRadius: billingMode ? '10px' : '8px',
                fontWeight: '700',
                border: 'none',
                cursor: orderBusy || cart.length === 0 || (currentOrder && currentOrder.status === 'completed') ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: billingMode ? '15px' : '12px',
                transition: 'all 0.2s',
                boxShadow: orderBusy || cart.length === 0 || (currentOrder && currentOrder.status === 'completed') ? 'none' : '0 4px 12px rgba(34, 197, 94, 0.35)'
              }}
            >
              {processing ? (
                <>
                  <FaSpinner size={billingMode ? 16 : 12} style={{ animation: 'spin 1s linear infinite' }} />
                  {t('dashboard.paymentProcessing')}
                </>
              ) : (
                <>
                  <FaCheckCircle size={billingMode ? 16 : 12} />
                  {posSettings.completeBillingLabel || t('dashboard.completeBilling')}
                </>
              )}
            </button>

              {/* Bill & Print - combined button */}
              {printSettings?.enableSaveAndPrint && (
                <button
                  onClick={() => {
                    if (orderBusy) return;
                    window.__autoPrintBill = true;
                    handleProcessOrder();
                  }}
                  disabled={orderBusy || cart.length === 0 || (currentOrder && currentOrder.status === 'completed')}
                  style={{
                    width: '50%',
                    background: orderBusy || cart.length === 0 || (currentOrder && currentOrder.status === 'completed')
                      ? 'linear-gradient(135deg, #d1d5db, #9ca3af)'
                      : 'linear-gradient(135deg, #065f46, #064e3b)',
                    color: 'white',
                    padding: billingMode ? '16px 16px' : '12px 14px',
                    borderRadius: billingMode ? '10px' : '8px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: orderBusy || cart.length === 0 || (currentOrder && currentOrder.status === 'completed') ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: billingMode ? '15px' : '12px',
                    transition: 'all 0.2s',
                    boxShadow: orderBusy || cart.length === 0 || (currentOrder && currentOrder.status === 'completed') ? 'none' : '0 4px 12px rgba(6, 95, 70, 0.35)'
                  }}
                >
                  {processing ? (
                    <><FaSpinner size={billingMode ? 14 : 12} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
                  ) : (
                    <><FaPrint size={billingMode ? 14 : 12} /> Bill & Print</>
                  )}
                </button>
              )}
          </div>
          </div>
        </div>
      )}

      {/* Voice Confirmation Modal */}
      {showVoiceConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              fontWeight: '700',
              color: '#1f2937'
            }}>
              Confirm Voice Order
            </h3>
            
            {voiceTranscript && (
              <p style={{
                margin: '0 0 16px 0',
                fontSize: '14px',
                color: '#6b7280',
                fontStyle: 'italic'
              }}>
                You said: &quot;{voiceTranscript}&quot;
              </p>
            )}
            
            <div style={{ marginBottom: '16px' }}>
              <p style={{
                margin: '0 0 8px 0',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Adding to cart:
              </p>
              {recognizedItems.map((item, index) => (
                <div key={index} style={{
                  padding: '8px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#1f2937' }}>
                      {item.quantity}x {item.name}
                    </div>
                  </div>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: '#059669' }}>
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            
            {voiceError && (
              <div style={{
                padding: '8px',
                backgroundColor: '#fee2e2',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '12px',
                color: '#dc2626'
              }}>
                {voiceError}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowVoiceConfirm(false);
                  setRecognizedItems([]);
                  setVoiceTranscript('');
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmVoiceOrder}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: 'none',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Unified Order Details Modal — Offers, Loyalty, Customer, Notes */}
      {showOffersModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowOffersModal(false); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center',
            padding: isMobile ? '0' : '16px',
          }}
        >
          <div style={{
            background: '#f8fafc', borderRadius: isMobile ? '20px 20px 0 0' : '20px',
            width: '100%', maxWidth: isMobile ? '100%' : '480px',
            maxHeight: isMobile ? '92vh' : '82vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)', overflow: 'hidden',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 18px', borderBottom: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#fff',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FaTag size={13} style={{ color: '#fff' }} />
                </div>
                <div>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', display: 'block' }}>Order Details</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{cart.reduce((s, i) => s + i.quantity, 0)} items · {formatCurrency(getTotalAmount())}</span>
                </div>
              </div>
              <button
                onClick={() => setShowOffersModal(false)}
                style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  border: 'none', background: '#f1f5f9', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
              >
                <FaTimes size={12} style={{ color: '#64748b' }} />
              </button>
            </div>

            {/* Modal Body — scrollable */}
            <style>{`
              .loyalty-slider { -webkit-transition: none; transition: none; }
              .loyalty-slider::-webkit-slider-runnable-track { height: 8px; border-radius: 4px; }
              .loyalty-slider::-webkit-slider-thumb { -webkit-appearance:none; width:24px; height:24px; border-radius:50%; background:linear-gradient(135deg, #f59e0b, #d97706); cursor:grab; border:3px solid #fff; box-shadow:0 2px 8px rgba(217,119,6,0.4); margin-top: -8px; transition: box-shadow 0.15s, transform 0.1s; }
              .loyalty-slider::-webkit-slider-thumb:hover { box-shadow:0 3px 12px rgba(217,119,6,0.5); }
              .loyalty-slider::-webkit-slider-thumb:active { cursor:grabbing; transform: scale(1.1); box-shadow:0 4px 16px rgba(217,119,6,0.6); }
              .loyalty-slider::-moz-range-thumb { width:24px; height:24px; border-radius:50%; background:linear-gradient(135deg, #f59e0b, #d97706); cursor:grab; border:3px solid #fff; box-shadow:0 2px 8px rgba(217,119,6,0.4); }
              .loyalty-slider::-moz-range-track { height: 8px; border-radius: 4px; border: none; }
            `}</style>
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>

              {/* CUSTOMER INFO Section — when customer found */}
              {lookupStatus === 'found' && customerData && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                    Customer
                  </div>
                  <div style={{
                    padding: '14px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 50%, #f0fdfa 100%)',
                    border: '1px solid #5eead4',
                    boxShadow: '0 2px 8px rgba(13,148,136,0.08)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #0d9488, #0891b2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, boxShadow: '0 2px 8px rgba(13,148,136,0.3)',
                      }}>
                        <FaUser size={14} style={{ color: '#fff' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#134e4a' }}>
                          {customerData.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#5eaaa0' }}>
                          {customerData.phone || customerMobile}
                        </div>
                      </div>
                      <button
                        onClick={() => setShowCustomerModal(true)}
                        style={{
                          padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
                          background: 'rgba(13,148,136,0.1)', color: '#0d9488', border: '1px solid rgba(13,148,136,0.2)',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(13,148,136,0.18)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(13,148,136,0.1)'; }}
                      >
                        Profile <FaChevronDown size={7} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <div style={{
                        flex: 1, padding: '10px 6px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)',
                        textAlign: 'center', border: '1px solid #2dd4bf',
                      }}>
                        <div style={{ fontSize: '17px', fontWeight: 700, color: '#0d9488' }}>{customerData.totalOrders || 0}</div>
                        <div style={{ fontSize: '9px', color: '#0891b2', fontWeight: 600 }}>Orders</div>
                      </div>
                      <div style={{
                        flex: 1, padding: '10px 6px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                        textAlign: 'center', border: '1px solid #fbbf24',
                      }}>
                        <div style={{ fontSize: '17px', fontWeight: 700, color: '#b45309' }}>
                          {customerData.loyaltyPoints || 0}
                        </div>
                        <div style={{ fontSize: '9px', color: '#b45309', fontWeight: 600 }}>Points</div>
                      </div>
                      <div style={{
                        flex: 1, padding: '10px 6px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #ecfdf5, #a7f3d0)',
                        textAlign: 'center', border: '1px solid #6ee7b7',
                      }}>
                        <div style={{ fontSize: '17px', fontWeight: 700, color: '#047857' }}>
                          {formatCurrency(customerData.totalSpent || 0)}
                        </div>
                        <div style={{ fontSize: '9px', color: '#059669', fontWeight: 600 }}>Spent</div>
                      </div>
                    </div>
                    {customerOfferGroups && customerOfferGroups.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', marginTop: '10px', flexWrap: 'wrap' }}>
                        {customerOfferGroups.map(g => (
                          <span key={g.id} style={{
                            fontSize: '9px', padding: '3px 8px', borderRadius: '10px',
                            background: g.color || '#0ea5e9', color: '#fff', fontWeight: 700,
                          }}>{g.name}</span>
                        ))}
                      </div>
                    )}
                    {/* Wallet Balance */}
                    {walletBalance > 0 && (
                      <div style={{ marginTop: '10px', padding: '10px', borderRadius: '10px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #93c5fd' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: useWallet ? '8px' : 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FaWallet size={12} style={{ color: '#2563eb' }} />
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e40af' }}>{t('dashboard.walletBalance')}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1d4ed8' }}>{formatCurrency(walletBalance)}</span>
                            <button
                              onClick={() => {
                                const next = !useWallet;
                                setUseWallet(next);
                                if (next) {
                                  const billAmount = grandTotal !== null ? grandTotal : Math.max(0, getTotalAmount() - totalDiscountAmount + totalTax + serviceChargeAmount + tipAmount + roundOffAmount);
                                  setWalletRedeemAmount(String(Math.round(Math.min(walletBalance, Math.max(0, billAmount)) * 100) / 100));
                                } else {
                                  setWalletRedeemAmount('');
                                }
                              }}
                              style={{
                                padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
                                background: useWallet ? '#dc2626' : '#2563eb', color: '#fff', border: 'none',
                                cursor: 'pointer', transition: 'all 0.15s',
                              }}
                            >
                              {useWallet ? t('common.cancel') : t('dashboard.use')}
                            </button>
                          </div>
                        </div>
                        {useWallet && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '10px', color: '#1e40af', fontWeight: 600, whiteSpace: 'nowrap' }}>{t('dashboard.redeem')}:</span>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={walletRedeemAmount}
                              onChange={(e) => {
                                const v = e.target.value;
                                if (v === '' || /^\d*\.?\d{0,2}$/.test(v)) {
                                  const num = parseFloat(v) || 0;
                                  if (num <= walletBalance) setWalletRedeemAmount(v);
                                }
                              }}
                              style={{
                                flex: 1, padding: '5px 8px', borderRadius: '6px', border: '1.5px solid #60a5fa',
                                fontSize: '12px', fontWeight: 700, outline: 'none', background: '#fff',
                                textAlign: 'right', color: '#1e40af',
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                              onBlur={(e) => e.target.style.borderColor = '#60a5fa'}
                            />
                            <button
                              onClick={() => {
                                const billAmount = grandTotal !== null ? grandTotal : Math.max(0, getTotalAmount() - totalDiscountAmount + totalTax + serviceChargeAmount + tipAmount + roundOffAmount);
                                setWalletRedeemAmount(String(Math.round(Math.min(walletBalance, Math.max(0, billAmount)) * 100) / 100));
                              }}
                              style={{
                                padding: '4px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: 700,
                                background: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd',
                                cursor: 'pointer', whiteSpace: 'nowrap',
                              }}
                            >
                              {t('dashboard.max')}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* OFFERS Section */}
              {(genericOffers.length > 0 || personalizedOffers.length > 0) && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                    Offers
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {genericOffers.map(offer => {
                      const oid = offer.id || offer._id;
                      const isMulti = offerSettings?.allowMultipleOffers;
                      const isSelected = isMulti ? selectedOfferIds.includes(oid) : selectedOfferId === oid;
                      const saves = calculateDiscountForOffer(offer, getTotalAmount(), cart);
                      return (
                        <button
                          key={oid}
                          onClick={() => {
                            if (isMulti) { toggleOffer(oid); } else { setSelectedOfferId(isSelected ? null : oid); }
                          }}
                          style={{
                            width: '100%', padding: '12px 14px', borderRadius: '12px',
                            border: isSelected ? '1.5px solid #0ea5e9' : '1.5px solid #e2e8f0',
                            background: isSelected ? '#f0f9ff' : '#fff',
                            cursor: 'pointer', textAlign: 'left',
                            display: 'flex', alignItems: 'center', gap: '10px',
                            transition: 'all 0.15s',
                            boxShadow: isSelected ? '0 2px 8px rgba(14,165,233,0.1)' : '0 1px 2px rgba(0,0,0,0.03)',
                          }}
                        >
                          <div style={{
                            width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0,
                            border: isSelected ? 'none' : '2px solid #cbd5e1',
                            background: isSelected ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {isSelected && <FaCheckCircle size={10} style={{ color: '#fff' }} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? '#0c4a6e' : '#334155' }}>
                              {offer.name}
                            </div>
                            {offer.description && (
                              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {offer.description}
                              </div>
                            )}
                          </div>
                          {saves > 0 && (
                            <span style={{
                              fontSize: '12px', fontWeight: 700, flexShrink: 0,
                              color: '#16a34a',
                              background: isSelected ? '#f0fdf4' : 'transparent',
                              padding: isSelected ? '2px 8px' : '0',
                              borderRadius: '6px',
                            }}>
                              -{formatCurrency(saves)}
                            </span>
                          )}
                        </button>
                      );
                    })}

                    {/* Personalized offers */}
                    {lookupStatus === 'found' && personalizedOffers.length > 0 && (
                      <>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '8px', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaGift size={9} /> For You
                        </div>
                        {personalizedOffers.map(offer => {
                          const oid = offer.id || offer._id;
                          const isMulti = offerSettings?.allowMultipleOffers;
                          const isSelected = isMulti ? selectedOfferIds.includes(oid) : selectedOfferId === oid;
                          const saves = calculateDiscountForOffer(offer, getTotalAmount(), cart);
                          const offerGroupIds = offer.audience?.groupIds || [];
                          const matchedGroup = customerOfferGroups?.find(g => offerGroupIds.includes(g.id));
                          return (
                            <button
                              key={oid}
                              onClick={() => {
                                if (isMulti) { toggleOffer(oid); } else { setSelectedOfferId(isSelected ? null : oid); }
                              }}
                              style={{
                                width: '100%', padding: '12px 14px', borderRadius: '12px',
                                border: isSelected ? '1.5px solid #d97706' : '1.5px solid #fde68a',
                                background: isSelected ? '#fffbeb' : '#fff',
                                cursor: 'pointer', textAlign: 'left',
                                display: 'flex', alignItems: 'center', gap: '10px',
                                transition: 'all 0.15s',
                                boxShadow: isSelected ? '0 2px 8px rgba(217,119,6,0.1)' : '0 1px 2px rgba(0,0,0,0.03)',
                              }}
                            >
                              <div style={{
                                width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0,
                                border: isSelected ? 'none' : '2px solid #fbbf24',
                                background: isSelected ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                {isSelected && <FaCheckCircle size={10} style={{ color: '#fff' }} />}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? '#78350f' : '#92400e' }}>
                                  {offer.name}
                                </div>
                                {(offer.description || matchedGroup) && (
                                  <div style={{ fontSize: '11px', color: '#b45309', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {offer.description && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{offer.description}</span>}
                                    {matchedGroup && (
                                      <span style={{
                                        fontSize: '9px', padding: '2px 6px', borderRadius: '6px',
                                        background: matchedGroup.color || '#0ea5e9', color: '#fff', fontWeight: 700, flexShrink: 0,
                                      }}>{matchedGroup.name}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                              {saves > 0 && (
                                <span style={{
                                  fontSize: '12px', fontWeight: 700, flexShrink: 0,
                                  color: '#16a34a',
                                  background: isSelected ? '#f0fdf4' : 'transparent',
                                  padding: isSelected ? '2px 8px' : '0',
                                  borderRadius: '6px',
                                }}>
                                  -{formatCurrency(saves)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </>
                    )}
                  </div>
                  {freeItems && freeItems.length > 0 && (
                    <div style={{
                      marginTop: '8px', padding: '6px 10px', borderRadius: '8px',
                      background: '#fef3c7', border: '1px dashed #f59e0b',
                      fontSize: '11px', fontWeight: 600, color: '#78350f',
                      display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                      <FaGift size={10} /> Free: {freeItems.map(f => {
                        const match = cart.find(c => (c.menuItemId || c.id) === f.itemId);
                        return `${f.qty}× ${match?.name || f.itemId}`;
                      }).join(', ')}
                    </div>
                  )}
                </div>
              )}

              {/* COUPON CODE Section */}
              {couponsEnabled && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                    Coupon Code
                  </div>
                  {appliedCoupon ? (
                    <div style={{
                      padding: '12px 14px', borderRadius: '12px',
                      border: '1.5px solid #86efac', background: '#f0fdf4',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#15803d', fontFamily: 'monospace' }}>{appliedCoupon.code}</div>
                        <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '2px' }}>
                          Saving {formatCurrency(appliedCoupon.discountAmount)}
                        </div>
                      </div>
                      <button onClick={handleRemoveCoupon} style={{
                        padding: '4px 10px', borderRadius: '6px', border: '1px solid #fca5a5',
                        background: '#fef2f2', color: '#dc2626', fontSize: '11px', fontWeight: 600, cursor: 'pointer'
                      }}>
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: couponError ? '6px' : (customerCoupons.length > 0 ? '8px' : '0') }}>
                        <input
                          value={couponCode}
                          onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                          placeholder="Enter coupon code"
                          onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCoupon(couponCode); }}
                          style={{
                            flex: 1, padding: '10px 12px', borderRadius: '10px',
                            border: couponError ? '1.5px solid #fca5a5' : '1.5px solid #e2e8f0',
                            fontSize: '13px', fontFamily: 'monospace', fontWeight: 600,
                            letterSpacing: '1px', outline: 'none',
                          }}
                        />
                        <button
                          onClick={() => handleApplyCoupon(couponCode)}
                          disabled={couponLoading || !couponCode.trim()}
                          style={{
                            padding: '10px 16px', borderRadius: '10px', border: 'none',
                            background: couponLoading || !couponCode.trim() ? '#e5e7eb' : '#ef4444',
                            color: couponLoading || !couponCode.trim() ? '#9ca3af' : 'white',
                            fontWeight: 600, fontSize: '12px', cursor: couponLoading ? 'not-allowed' : 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {couponLoading ? '...' : 'Apply'}
                        </button>
                      </div>
                      {couponError && (
                        <div style={{ fontSize: '11px', color: '#dc2626', marginBottom: customerCoupons.length > 0 ? '8px' : '0' }}>{couponError}</div>
                      )}
                      {/* Customer's available coupons */}
                      {customerCoupons.length > 0 && (
                        <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                          <div style={{ fontSize: '10px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>Available coupons:</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {customerCoupons.map(c => (
                              <button
                                key={c.id}
                                onClick={() => handleApplyCoupon(c.code)}
                                style={{
                                  width: '100%', padding: '8px 12px', borderRadius: '10px',
                                  border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer',
                                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                  textAlign: 'left', transition: 'all 0.15s',
                                }}
                              >
                                <div>
                                  <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'monospace', color: '#1f2937' }}>{c.code}</span>
                                  {c.type === 'private' && <span style={{ fontSize: '9px', marginLeft: '6px', padding: '1px 5px', borderRadius: '4px', background: '#fef2f2', color: '#e11d48', fontWeight: 600 }}>YOURS</span>}
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>
                                  {c.discountType === 'percentage' ? `${c.value}% off` : formatCurrency(c.value)}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* LOYALTY POINTS Section */}
              {loyaltySettings?.enabled && customerData && lookupStatus === 'found' && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                    Loyalty Points
                  </div>
                  <div style={{
                    padding: '14px', borderRadius: '14px',
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#b45309' }}>
                        {customerData.loyaltyPoints || 0} points available
                      </span>
                      {getLoyaltyPointsToEarn() > 0 && (
                        <span style={{
                          fontSize: '11px', fontWeight: 600, color: '#16a34a',
                          background: '#f0fdf4', padding: '3px 8px', borderRadius: '8px',
                          border: '1px solid #bbf7d0',
                        }}>
                          Will earn +{getLoyaltyPointsToEarn()} pts
                        </span>
                      )}
                    </div>
                    {(customerData.loyaltyPoints || 0) > 0 && (() => {
                      const redemptionRate = loyaltySettings.redemptionRate || 1;
                      const maxPct = loyaltySettings.maxRedemptionPercent || 20;
                      const afterOtherDisc = Math.max(0, getTotalAmount() - effectiveOfferDiscount - getManualDiscountAmount());
                      const maxDiscByPct = (afterOtherDisc * maxPct) / 100;
                      const maxPointsByPct = Math.floor(maxDiscByPct * redemptionRate);
                      const maxRedeemable = Math.min(customerData.loyaltyPoints, maxPointsByPct);
                      if (maxRedeemable <= 0) return (
                        <div style={{ fontSize: '11px', color: '#92400e' }}>
                          Cannot redeem points on current order (max {maxPct}% of total)
                        </div>
                      );
                      const displayValue = sliderDragging ? sliderLocalValue : redeemLoyaltyPoints;
                      const displayPct = maxRedeemable > 0 ? (displayValue / maxRedeemable) * 100 : 0;
                      return (
                        <div>
                          <input
                            type="range"
                            className="loyalty-slider"
                            min={0}
                            max={maxRedeemable}
                            step={1}
                            value={displayValue}
                            onInput={(e) => {
                              setSliderLocalValue(Number(e.target.value));
                            }}
                            onMouseDown={() => { setSliderLocalValue(redeemLoyaltyPoints); setSliderDragging(true); }}
                            onTouchStart={() => { setSliderLocalValue(redeemLoyaltyPoints); setSliderDragging(true); }}
                            onMouseUp={(e) => { setRedeemLoyaltyPoints(Number(e.target.value)); setSliderDragging(false); }}
                            onTouchEnd={() => { setRedeemLoyaltyPoints(sliderLocalValue); setSliderDragging(false); }}
                            onChange={() => {}}
                            style={{
                              width: '100%', height: '8px', borderRadius: '4px',
                              appearance: 'none', WebkitAppearance: 'none',
                              background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${displayPct}%, #e5e7eb ${displayPct}%, #e5e7eb 100%)`,
                              outline: 'none', cursor: 'pointer', marginBottom: '8px',
                            }}
                          />
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#b45309' }}>
                              {displayValue > 0 ? `${displayValue} pts = -${formatCurrency(Math.round((displayValue / (loyaltySettings.redemptionRate || 1)) * 100) / 100)}` : 'Slide to redeem'}
                            </span>
                            <span style={{ fontSize: '10px', color: '#92400e' }}>
                              Max: {maxRedeemable} pts ({maxPct}%)
                            </span>
                          </div>
                          {redeemLoyaltyPoints > 0 && (
                            <button
                              onClick={() => { setRedeemLoyaltyPoints(0); setSliderLocalValue(0); setSliderDragging(false); }}
                              style={{
                                marginTop: '6px', fontSize: '10px', fontWeight: 600, color: '#dc2626',
                                background: '#fee2e2', padding: '4px 10px', borderRadius: '6px',
                                border: '1px solid #fecaca', cursor: 'pointer',
                              }}
                            >
                              Clear Redemption
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* KITCHEN NOTES Section */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FaStickyNote size={9} /> Kitchen Notes
                </div>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="E.g., No onions, extra spicy, birthday celebration..."
                  rows={2}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '10px',
                    border: '1.5px solid #e2e8f0', fontSize: '12px', resize: 'none',
                    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                    transition: 'border-color 0.15s', background: '#fff',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

            </div>

            {/* Modal Footer — sticky with full breakdown */}
            <div style={{
              padding: '14px 18px', borderTop: '1px solid #e2e8f0',
              background: '#fff',
            }}>
              {/* Full price breakdown */}
              <div style={{ marginBottom: '12px', fontSize: '12px', color: '#64748b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{formatCurrency(getTotalAmount())}</span>
                </div>
                {effectiveOfferDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#16a34a' }}>{selectedOfferName || currentOrder?.selectedOfferName || 'Offers'}</span>
                    <span style={{ fontWeight: 600, color: '#16a34a' }}>-{formatCurrency(effectiveOfferDiscount)}</span>
                  </div>
                )}
                {getLoyaltyDiscountAmount() > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#b45309' }}>Loyalty ({redeemLoyaltyPoints} pts)</span>
                    <span style={{ fontWeight: 600, color: '#b45309' }}>-{formatCurrency(getLoyaltyDiscountAmount())}</span>
                  </div>
                )}
                {getCouponDiscountAmount() > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#7c3aed' }}>Coupon{appliedCoupon?.code ? ` (${appliedCoupon.code})` : ''}</span>
                    <span style={{ fontWeight: 600, color: '#7c3aed' }}>-{formatCurrency(getCouponDiscountAmount())}</span>
                  </div>
                )}
                {taxBreakdown.map((tax, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>{tax.name} ({tax.rate}%){tax.inclusive ? ' (incl.)' : ''}</span>
                    <span style={{ fontWeight: 500 }}>{formatCurrency(tax.amount || 0)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #e2e8f0', marginTop: '6px' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>Total</span>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>{formatCurrency(grandTotal !== null ? grandTotal : getTotalAmount())}</span>
                </div>
              </div>
              <button
                onClick={() => setShowOffersModal(false)}
                style={{
                  width: '100%', padding: '13px', borderRadius: '12px',
                  border: 'none', cursor: 'pointer',
                  background: totalDiscountAmount > 0 ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                  color: '#fff', fontSize: '14px', fontWeight: 700,
                  boxShadow: totalDiscountAmount > 0 ? '0 4px 14px rgba(16,185,129,0.25)' : '0 4px 14px rgba(14,165,233,0.25)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                {totalDiscountAmount > 0 ? `Apply & Save ${formatCurrency(totalDiscountAmount)}` : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}

      {foodCourtTokenPreview?.tokens?.length > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setFoodCourtTokenPreview(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1200,
            background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(1120px, 100%)',
              maxHeight: '92vh',
              background: '#fff',
              borderRadius: '18px',
              overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(15, 23, 42, 0.28)',
              border: '1px solid #e2e8f0',
              display: 'grid',
              gridTemplateRows: 'auto 1fr auto'
            }}
          >
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a', fontWeight: 800, fontSize: '16px' }}>
                  <FaPrint size={15} color="#16a34a" />
                  Food Court Tokens
                </div>
                <div style={{ marginTop: '4px', fontSize: '12px', color: '#64748b' }}>
                  Each category prints as its own thermal slip. The preview below matches the printed order.
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={printPreviewedFoodCourtTokens}
                  style={{
                    border: 'none',
                    cursor: 'pointer',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: '#16a34a',
                    color: '#fff',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FaPrint size={13} />
                  Print Tokens
                </button>
                <button
                  onClick={() => setFoodCourtTokenPreview(null)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FaTimes size={14} />
                </button>
              </div>
            </div>

            <div style={{
              padding: '18px',
              overflow: 'auto',
              background: '#f8fafc'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
                gap: '16px',
                alignItems: 'start'
              }}>
                {foodCourtTokenPreview.tokens.map((token, index) => {
                  const theme = getTokenSlipTheme(index);
                  const SlipIcon = theme.icon;
                  return (
                    <div
                      key={`${token.tokenLabel}-${index}`}
                      style={{
                        background: '#fff',
                        borderRadius: '14px',
                        border: `1px solid ${theme.border}`,
                        boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)',
                        overflow: 'hidden'
                      }}
                    >
                      <div style={{
                        padding: '14px 14px 12px',
                        borderBottom: `1px dashed ${theme.border}`,
                        background: theme.bg
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#fff',
                              border: `1px solid ${theme.border}`,
                              color: theme.fg
                            }}>
                              <SlipIcon size={16} />
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                                {token.categoryName || 'General'}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>
                                Order #{token.orderNumber}
                              </div>
                            </div>
                          </div>
                          <div style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            color: theme.fg,
                            background: '#fff',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '999px',
                            padding: '5px 10px'
                          }}>
                            {token.tokenLabel}
                          </div>
                        </div>
                      </div>

                      <div style={{ padding: '12px 14px 14px' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
                          Counter {token.printStationName || token.categoryName || 'General'}
                        </div>
                        <div style={{ display: 'grid', gap: '8px' }}>
                          {(token.items || []).map((item, itemIndex) => (
                            <div
                              key={`${token.tokenLabel}-${itemIndex}`}
                              style={{
                                padding: '10px 12px',
                                borderRadius: '10px',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                                <div style={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                                  {item.quantity || 1}x {item.name || 'Item'}
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap' }}>
                                  slip
                                </div>
                              </div>
                              {(item.variant || (Array.isArray(item.customizations) && item.customizations.length > 0)) && (
                                <div style={{ marginTop: '6px', fontSize: '11px', color: '#475569', lineHeight: 1.45 }}>
                                  {item.variant && <div>Variant: {item.variant}</div>}
                                  {Array.isArray(item.customizations) && item.customizations.length > 0 && (
                                    <div>Notes: {item.customizations.map(c => c.name || c).join(', ')}</div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <div style={{
                          marginTop: '12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '11px',
                          color: '#64748b'
                        }}>
                          <span>{token.time}</span>
                          <span>{token.itemCount} items</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid #e2e8f0',
              background: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '12px',
              alignItems: 'center',
              fontSize: '12px',
              color: '#64748b'
            }}>
              <span>{foodCourtTokenPreview.tokens.length} category slips ready to print.</span>
              <button
                onClick={() => setFoodCourtTokenPreview(null)}
                style={{
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  color: '#334155',
                  borderRadius: '10px',
                  padding: '9px 14px',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Detail Modal (lazy loaded) */}
      {showCustomerModal && customerData?.id && (
        <CustomerDetailModal
          customerId={customerData.id}
          restaurantId={restaurantId}
          onClose={() => setShowCustomerModal(false)}
        />
      )}
      <UpiPaymentModal
        isOpen={showUpiQr}
        onClose={() => { setShowUpiQr(false); setPendingUpiAction(null); }}
        onConfirmPayment={handleUpiConfirm}
        amount={grandTotal ?? 0}
        restaurantName={restaurantName}
        upiId={upiSettings?.upiId}
        upiQrCodeUrl={upiSettings?.upiQrCodeUrl}
        upiDisplayName={upiSettings?.upiDisplayName}
        formatCurrency={formatCurrency}
      />
      {/* ECR Payment Terminal Status Modal */}
      <EcrStatusModal
        status={ecrStatus}
        error={ecrError}
        lastResponse={ecrLastResponse}
        onCancel={ecrCancel}
        onRetry={() => {
          ecrReset();
          handleProcessOrder();
        }}
        onDismiss={ecrReset}
      />
      {/* Discount Approval Modal */}
      {showDiscountApproval && (
        <DiscountApprovalModal
          isOpen={showDiscountApproval}
          onClose={() => { setShowDiscountApproval(false); setPendingDiscountAction(null); }}
          onApproved={handleDiscountApproved}
          restaurantId={restaurantId}
          discountData={{
            discountType: manualDiscountTypeState,
            discountValue: parseFloat(manualDiscountValue) || 0,
            discountAmount: getManualDiscountAmount(),
            subtotal: getTotalAmount(),
          }}
          userRole={userRole}
          userName=""
        />
      )}
    </div>
  );
};

export default OrderSummary;
