'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import apiClient from '../lib/api';
import { t } from '../lib/i18n';
import { useCurrency } from '../contexts/CurrencyContext';
import useCustomerLookup, { getPhoneMinLength } from '../hooks/useCustomerLookup';
import useOfferEngine, { calculateDiscountForOffer } from '../hooks/useOfferEngine';
import { getBillPrintCSS, getKOTPrintCSS } from '../utils/printFontSizes';

const CustomerDetailModal = dynamic(() => import('./CustomerDetailModal'), { ssr: false });
import UpiPaymentModal from './UpiPaymentModal';
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
  FaStar
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
  whatsappConnected = false,
}) => {
  // Business-type-aware billing labels
  const billingLabels = {
    restaurant: { billTitle: 'BILL / INVOICE', itemCol: 'Item', qtyCol: 'Qty', customerLabel: 'Customer', footer: 'Thank you for dining with us!', billLabel: 'Bill' },
    bar: { billTitle: 'BAR TAB', itemCol: 'Drink / Item', qtyCol: 'Qty', customerLabel: 'Guest', footer: 'Thank you for visiting! Cheers!', billLabel: 'Tab' },
    bakery: { billTitle: 'RECEIPT', itemCol: 'Item', qtyCol: 'Qty', customerLabel: 'Customer', footer: 'Thank you! Enjoy your fresh bakes!', billLabel: 'Receipt' },
    ice_cream: { billTitle: 'RECEIPT', itemCol: 'Item / Flavor', qtyCol: 'Qty', customerLabel: 'Customer', footer: 'Thank you! Stay cool, visit again!', billLabel: 'Receipt' },
    cafe: { billTitle: 'RECEIPT', itemCol: 'Item', qtyCol: 'Qty', customerLabel: 'Name', footer: 'Thanks for stopping by! See you soon.', billLabel: 'Receipt' },
    qsr: { billTitle: 'ORDER RECEIPT', itemCol: 'Item', qtyCol: 'Qty', customerLabel: 'Token', footer: 'Thank you! Visit again.', billLabel: 'Receipt' }
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

  // Unified flag: disables ALL order buttons when any action is in progress
  const orderBusy = processing || placingOrder || savingOrder;
  // True when editing a loaded saved order (disable save button, keep place order text normal)
  const isEditingSavedOrder = currentOrder && currentOrder.status === 'saved';

  const { formatCurrency, getCurrencySymbol } = useCurrency();
  const [invoice, setInvoice] = useState(null);
  const [showInvoicePermanently, setShowInvoicePermanently] = useState(false);
  const [taxBreakdown, setTaxBreakdown] = useState([]);
  const [totalTax, setTotalTax] = useState(0);
  const [grandTotal, setGrandTotal] = useState(null);

  // WhatsApp bill sending state
  const [waSending, setWaSending] = useState(false);
  const [waSent, setWaSent] = useState(false);

  // Special Instructions State
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

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

  // Loyalty Points Redemption State
  const [redeemLoyaltyPoints, setRedeemLoyaltyPoints] = useState(0);
  const [sliderDragging, setSliderDragging] = useState(false);
  const [sliderLocalValue, setSliderLocalValue] = useState(0);
  const loyaltyPreFilled = useRef(false);
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
  const [roundOffAmount, setRoundOffAmount] = useState(0);
  const [compVoidItems, setCompVoidItems] = useState([]);
  const [compVoidType, setCompVoidType] = useState('comp');
  const [compVoidReason, setCompVoidReason] = useState('');
  const [managerPin, setManagerPin] = useState('');
  const [partialPayAmount, setPartialPayAmount] = useState('');

  // Calculate service charge
  const calcServiceCharge = useCallback((discountedAmount) => {
    if (!billingSettings.serviceChargeEnabled || !billingSettings.serviceChargeRate) return 0;
    return Math.round(discountedAmount * billingSettings.serviceChargeRate / 100 * 100) / 100;
  }, [billingSettings.serviceChargeEnabled, billingSettings.serviceChargeRate]);

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

  // Auto-fill customer name when found
  useEffect(() => {
    if (customerData?.name) {
      onCustomerNameChange?.(customerData.name);
    }
  }, [customerData]); // eslint-disable-line react-hooks/exhaustive-deps

  const kotPrintWindowRef = useRef(null);
  const invoicePrintWindowRef = useRef(null);

  // Dismiss KOT/billing summary when user starts a new action (adds items, loads saved order)
  useEffect(() => {
    if (cart?.length > 0 && orderSuccess?.show) {
      setOrderSuccess(null);
      setInvoice(null);
      setShowInvoicePermanently(false);
      setWaSent(false);
    }
  }, [cart?.length]); // eslint-disable-line react-hooks/exhaustive-deps

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
  
  // Debug: Log cart prop received by OrderSummary
  console.log('📋 OrderSummary: Received cart prop:', cart);
  console.log('📋 OrderSummary: Cart length:', cart?.length);
  if (cart?.length > 0) {
    console.log('📋 OrderSummary: First cart item:', cart[0]);
    console.log('📋 OrderSummary: All cart items:', cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    })));
  }
  
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
    return Math.min(val, subtotal);
  }, [manualDiscountValue, manualDiscountTypeState, getTotalAmount]);

  // Loyalty discount calculation — points / redemptionRate = discount amount
  // redemptionRate=1 → 1pt=₹1, redemptionRate=10 → 10pts=₹1, redemptionRate=100 → 100pts=₹1
  const getLoyaltyDiscountAmount = useCallback(() => {
    if (!loyaltySettings?.enabled || !redeemLoyaltyPoints || redeemLoyaltyPoints <= 0) return 0;
    const redemptionRate = loyaltySettings.redemptionRate || 1;
    return Math.round((redeemLoyaltyPoints / redemptionRate) * 100) / 100;
  }, [redeemLoyaltyPoints, loyaltySettings]);

  // Loyalty points to earn on this order
  const getLoyaltyPointsToEarn = useCallback(() => {
    if (!loyaltySettings?.enabled) return 0;
    const earnPerAmount = loyaltySettings.earnPerAmount || 100;
    const pointsRate = loyaltySettings.pointsEarned || 4;
    const subtotal = getTotalAmount();
    const discTotal = offerDiscount + getManualDiscountAmount();
    const loyaltyDisc = getLoyaltyDiscountAmount();
    // If redeeming and not allowed to earn, return 0
    if (redeemLoyaltyPoints > 0 && !loyaltySettings.earnPointsOnRedemption) return 0;
    const eligibleAmount = loyaltySettings.earnOnFullAmount
      ? Math.max(0, subtotal - discTotal)
      : Math.max(0, subtotal - discTotal - loyaltyDisc);
    return Math.floor(eligibleAmount / earnPerAmount) * pointsRate;
  }, [loyaltySettings, getTotalAmount, offerDiscount, getManualDiscountAmount, getLoyaltyDiscountAmount, redeemLoyaltyPoints]);

  // Total discount for display
  const totalDiscountAmount = offerDiscount + getManualDiscountAmount() + getLoyaltyDiscountAmount();

  // Discount settings from taxSettings
  const discountSettings = taxSettings?.discountSettings || {};
  const discountEnabled = discountSettings.enabled || false;
  const canEditManualDiscount = discountEnabled &&
    discountSettings.allowManualDiscount !== false &&
    (discountSettings.manualDiscountRoles || ['owner']).includes(userRole?.toLowerCase());

  // Compute unit price for an item considering variant and selected customizations
  // Uses item.price (which reflects the active pricing rule) over item.basePrice
  const getItemUnitPrice = (cartItem) => {
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
    const extras = Array.isArray(cartItem?.selectedCustomizations)
      ? cartItem.selectedCustomizations.reduce((sum, c) => sum + (c?.price || 0), 0)
      : (typeof cartItem?.customizationPrice === 'number' ? cartItem.customizationPrice : 0);
    return (unitPrice || 0) + (extras || 0);
  };
  
  const calculateTax = useCallback(async () => {
    console.log('Calculating tax for cart:', cart.length, 'items, restaurantId:', restaurantId);
    if (cart.length === 0 || !restaurantId) {
      setTaxBreakdown([]);
      setTotalTax(0);
      setGrandTotal(getTotalAmount());
      return;
    }

    // Use cached tax settings instead of calling API
    if (!taxSettings?.enabled) {
      console.log('Tax not enabled for this restaurant');
      setTaxBreakdown([]);
      setTotalTax(0);
      // Apply discounts even if tax is disabled
      const subtotal = getTotalAmount();
      const loyaltyDiscAmt = getLoyaltyDiscountAmount();
      const discTotal = offerDiscount + getManualDiscountAmount() + loyaltyDiscAmt;
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
    // Apply discounts before tax (offers + manual + loyalty)
    const loyaltyDiscAmt = getLoyaltyDiscountAmount();
    const discTotal = offerDiscount + getManualDiscountAmount() + loyaltyDiscAmt;
    const discountedAmt = Math.max(0, subtotal - discTotal);

    // Service charge (after discounts, before tax)
    const sc = calcServiceCharge(discountedAmt);
    setServiceChargeAmount(sc);
    const taxableAmount = discountedAmt + sc;

    // Calculate tax based on restaurant's tax settings
    const calculatedTaxes = [];
    let totalTaxAmount = 0;

    if (taxSettings.taxes && taxSettings.taxes.length > 0) {
      taxSettings.taxes.forEach(tax => {
        if (tax.enabled) {
          const taxAmount = taxableAmount * (tax.rate / 100);
          calculatedTaxes.push({
            name: tax.name,
            rate: tax.rate,
            amount: taxAmount
          });
          totalTaxAmount += taxAmount;
        }
      });
    } else if (taxSettings.defaultTaxRate) {
      const taxAmount = taxableAmount * (taxSettings.defaultTaxRate / 100);
      calculatedTaxes.push({
        name: 'GST',
        rate: taxSettings.defaultTaxRate,
        amount: taxAmount
      });
      totalTaxAmount = taxAmount;
    }

    console.log('Calculated taxes:', calculatedTaxes, 'Total tax:', totalTaxAmount, 'Discount:', discTotal);
    setTaxBreakdown(calculatedTaxes);
    setTotalTax(totalTaxAmount);

    // After tax, add tip and round-off
    const afterTax = taxableAmount + totalTaxAmount;
    const withTip = afterTax + tipAmount;
    const ro = calcRoundOff(withTip);
    setRoundOffAmount(ro);
    setGrandTotal(withTip + ro);

  }, [cart, restaurantId, getTotalAmount, taxSettings, offerDiscount, getManualDiscountAmount, getLoyaltyDiscountAmount, tipAmount, calcServiceCharge, calcRoundOff]);
  
  // Calculate tax when cart changes
  useEffect(() => {
    console.log('useEffect triggered - cart length:', cart.length, 'restaurantId:', restaurantId, 'taxSettings:', taxSettings);
    if (cart.length > 0 && restaurantId && taxSettings) {
      calculateTax();
    } else {
      setTaxBreakdown([]);
      setTotalTax(0);
      setGrandTotal(getTotalAmount());
    }
  }, [calculateTax, cart, restaurantId, getTotalAmount, taxSettings, offerDiscount, manualDiscountValue, manualDiscountTypeState, redeemLoyaltyPoints, tipAmount, billingSettings]);

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
  const cartKey = cart.map(item => `${item.id}-${item.quantity}-${item.price}`).join(',');
  useEffect(() => {
    if (cart.length > 0) {
      console.log('🔄 Cart items changed, forcing tax recalculation');
      // Small delay to ensure cart state is fully updated
      setTimeout(() => {
        calculateTax();
      }, 100);
    }
  }, [cartKey]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Debug logging
  console.log('OrderSummary orderSuccess:', orderSuccess);
  console.log('Tax state - taxBreakdown:', taxBreakdown, 'totalTax:', totalTax, 'grandTotal:', grandTotal);

  // Helper function to check if order summary should be shown based on print settings
  const shouldShowOrderSummary = () => {
    if (!orderSuccess?.show) return false;

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

  // Helper function to check if manual print button should be shown
  const shouldShowManualPrint = () => {
    return printSettings?.manualPrintEnabled !== false;
  };

  const generateInvoice = async (orderId) => {
    try {
      console.log('Fetching unified bill render for order ID:', orderId);
      // Use the unified render endpoint (/api/bill/render) so the on-screen
      // bill summary is sourced from the SAME payload the android + electron
      // printers consume. This guarantees pixel/data parity between what the
      // user sees on screen and what the thermal printer prints.
      const response = await apiClient.getBillRender(restaurantId, orderId);
      if (response && response.success) {
        // `response.invoice` is the legacy-compatible flat shape (same fields
        // as the old POST /api/invoice/generate response), so existing JSX
        // that reads `invoice.restaurantName`, `invoice.grandTotal`, etc.
        // works unchanged.
        setInvoice(response.invoice || response.bill);
        setShowInvoicePermanently(true);

        // Persist the invoice doc in the background (for reports / history /
        // invoiceId on the order). Non-blocking — the UI already has what it
        // needs from the render endpoint.
        apiClient.generateInvoice(orderId).catch((err) =>
          console.warn('Invoice persistence (non-blocking):', err),
        );
        return true;
      }
      console.error('Bill render fetch failed:', response);
      return false;
    } catch (error) {
      console.error('Error fetching bill render:', error);
      return false;
    }
  };
  
  const upiConfigured = upiSettings?.upiEnabled && upiSettings?.upiId;

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
    return {
      taxBreakdown,
      totalTax,
      finalAmount: grandTotal ?? getTotalAmount(),
      subtotal: getTotalAmount(),
      specialInstructions: specialInstructions.trim() || null,
      offerIds: allOfferIds,
      manualDiscount: getManualDiscountAmount(),
      offerDiscount,
      selectedOfferName,
      totalDiscountAmount: offerDiscount + getManualDiscountAmount() + getLoyaltyDiscountAmount(),
      redeemLoyaltyPoints: redeemLoyaltyPoints > 0 ? redeemLoyaltyPoints : 0,
      loyaltyDiscount: getLoyaltyDiscountAmount(),
      serviceChargeRate: serviceChargeAmount > 0 ? billingSettings.serviceChargeRate : null,
      serviceChargeAmount: serviceChargeAmount > 0 ? serviceChargeAmount : null,
      tipAmount: tipAmount > 0 ? tipAmount : null,
      tipPercentage: tipPercentage || null,
      cashReceived: cashReceivedNum > 0 ? cashReceivedNum : null,
      changeReturned: changeReturned > 0 ? changeReturned : null,
      splitPayments: validSplitPayments,
      roundOffAmount: roundOffAmount !== 0 ? roundOffAmount : null,
      compItems: compVoidItems.filter(cv => cv.type === 'comp').length > 0 ? compVoidItems.filter(cv => cv.type === 'comp') : null,
      voidItems: compVoidItems.filter(cv => cv.type === 'void').length > 0 ? compVoidItems.filter(cv => cv.type === 'void') : null,
      partialPayAmount: parseFloat(partialPayAmount) > 0 ? parseFloat(partialPayAmount) : null,
      managerPin: managerPin || null,
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
          }
        } catch (error) {
          console.error('Error in UPI confirm order:', error);
        }
      }
    }
    setPendingUpiAction(null);
  };

  const handleProcessOrder = async () => {
    // Intercept UPI — show QR modal before processing
    if (paymentMethod === 'upi' && upiConfigured) {
      setPendingUpiAction('complete');
      setShowUpiQr(true);
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
        }
      } catch (error) {
        console.error('Error in handleProcessOrder:', error);
      }
    }
  };
  
  return (
    <div style={{ 
      width: isMobile ? '100vw' : '100%', 
      height: isMobile ? '100vh' : '100vh',
      position: isMobile ? 'fixed' : 'relative',
      top: isMobile ? 0 : 'auto',
      left: isMobile ? 0 : 'auto',
      zIndex: isMobile ? 1000 : 'auto',
      backgroundColor: 'white', 
      borderLeft: isMobile ? 'none' : '1px solid #e5e7eb',
      display: 'flex', 
      flexDirection: 'column',
      boxShadow: isMobile ? 'none' : '-2px 0 8px rgba(0, 0, 0, 0.04)',
      overflow: 'hidden'
    }}>
      {/* Header - More Compact, even smaller in billing mode */}
      <div style={{
        background: billingMode
          ? 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
          : 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
        padding: billingMode ? '10px 16px' : '14px 16px',
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
          alignItems: 'center', 
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
            {/* Order Type Selector - Text Based */}
            {(() => {
              const hasTable = !!(tableNumber || selectedTable?.name);
              return (
            <div style={{ display: 'flex', gap: isMobile ? '3px' : '4px' }}>
              <button
                onClick={() => setOrderType('dine-in')}
                style={{
                  backgroundColor: orderType === 'dine-in'
                    ? (billingMode ? '#e2e8f0' : 'rgba(255,255,255,0.5)')
                    : (billingMode ? 'transparent' : 'rgba(255,255,255,0.1)'),
                  color: billingMode ? '#334155' : 'white',
                  border: orderType === 'dine-in'
                    ? (billingMode ? '2px solid #94a3b8' : '2px solid white')
                    : (billingMode ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.2)'),
                  borderRadius: isMobile ? '4px' : '6px',
                  padding: isMobile ? '4px 6px' : '6px 12px',
                  fontSize: isMobile ? '9px' : '10px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  boxShadow: orderType === 'dine-in' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                  whiteSpace: 'nowrap'
                }}
                title="Dine In"
              >
                {isMobile ? 'DINE IN' : t('dashboard.dineIn')}
              </button>
              <button
                onClick={() => { if (!hasTable) setOrderType('takeaway'); }}
                disabled={hasTable}
                style={{
                  backgroundColor: orderType === 'takeaway'
                    ? (billingMode ? '#e2e8f0' : 'rgba(255,255,255,0.5)')
                    : (billingMode ? 'transparent' : 'rgba(255,255,255,0.1)'),
                  color: billingMode ? '#334155' : 'white',
                  border: orderType === 'takeaway'
                    ? (billingMode ? '2px solid #94a3b8' : '2px solid white')
                    : (billingMode ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.2)'),
                  borderRadius: isMobile ? '4px' : '6px',
                  padding: isMobile ? '4px 6px' : '6px 12px',
                  fontSize: isMobile ? '9px' : '10px',
                  fontWeight: '700',
                  cursor: hasTable ? 'not-allowed' : 'pointer',
                  opacity: hasTable ? 0.4 : 1,
                  backdropFilter: 'blur(10px)',
                  boxShadow: orderType === 'takeaway' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                  whiteSpace: 'nowrap'
                }}
                title={hasTable ? 'Remove table to switch to Takeaway' : 'Takeaway'}
              >
                {isMobile ? 'TAKEAWAY' : t('dashboard.takeaway')}
              </button>
              <button
                onClick={() => { if (!hasTable) setOrderType('delivery'); }}
                disabled={hasTable}
                style={{
                  backgroundColor: orderType === 'delivery'
                    ? (billingMode ? '#e2e8f0' : 'rgba(255,255,255,0.5)')
                    : (billingMode ? 'transparent' : 'rgba(255,255,255,0.1)'),
                  color: billingMode ? '#334155' : 'white',
                  border: orderType === 'delivery'
                    ? (billingMode ? '2px solid #94a3b8' : '2px solid white')
                    : (billingMode ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.2)'),
                  borderRadius: isMobile ? '4px' : '6px',
                  padding: isMobile ? '4px 6px' : '6px 12px',
                  fontSize: isMobile ? '9px' : '10px',
                  fontWeight: '700',
                  cursor: hasTable ? 'not-allowed' : 'pointer',
                  opacity: hasTable ? 0.4 : 1,
                  backdropFilter: 'blur(10px)',
                  boxShadow: orderType === 'delivery' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                  whiteSpace: 'nowrap'
                }}
                title={hasTable ? 'Remove table to switch to Delivery' : 'Delivery'}
              >
                {isMobile ? 'DELIVERY' : 'Delivery'}
              </button>
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
               if (typeof onTableNumberChange === 'function') {
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

      {/* Scrollable Content - Cart Items Only */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '12px',
        paddingBottom: '8px',
        scrollbarWidth: 'thin',
        scrollbarColor: '#cbd5e1 transparent',
        minHeight: 0
      }}
      className="hide-scrollbar"
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
                  onClearCart();
                  setSpecialInstructions(''); // Clear special instructions for new order
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
                  Confirmed
                </div>
              )}
              {(() => {
                const isKitchenOrder = orderSuccess?.message?.includes('placed') || orderSuccess?.message?.includes('Updated') || orderSuccess?.message?.includes('Kitchen');
                return (
                  <>
                    <div style={{ fontSize: '14px', color: '#166534', marginBottom: '12px', fontWeight: '600' }}>
                      {bLabels.billLabel} #{orderSuccess.dailyOrderId ?? orderSuccess.orderId ?? '—'} {isKitchenOrder ? 'sent to kitchen' : 'completed'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#166534', marginBottom: '16px' }}>
                      {isKitchenOrder ? 'Your order has been sent to the kitchen for preparation.' : 'Payment processed successfully. Thank you for your order!'}
                    </div>
                  </>
                );
              })()}
              {orderSuccess?.kotData && (orderSuccess?.message?.includes('placed') || orderSuccess?.message?.includes('Updated') || orderSuccess?.message?.includes('Kitchen')) && (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '12px', padding: '12px', backgroundColor: '#fff', borderRadius: '8px', border: '2px dashed #22c55e', fontFamily: 'monospace', fontSize: '14px', color: '#14532d' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '15px', borderBottom: '2px dashed #22c55e', paddingBottom: '6px', marginBottom: '8px' }}>--- KITCHEN ORDER ---</div>
                    <div style={{ marginBottom: '6px', fontSize: '14px' }}>{orderSuccess.kotData.restaurantName || 'Restaurant'}</div>
                    <div style={{ textAlign: 'left', marginBottom: '8px', fontSize: '13px' }}>
                      <div><strong>Order #:</strong> {orderSuccess.kotData.dailyOrderId ?? orderSuccess.kotData.orderId ?? '—'}</div>
                      {orderSuccess.kotData.orderId && <div><strong>ID:</strong> {String(orderSuccess.kotData.orderId).slice(-8).toUpperCase()}</div>}
                      <div><strong>Date:</strong> {new Date().toLocaleString()}</div>
                      {(orderSuccess.kotData.roomNumber || orderSuccess.kotData.tableNumber) && (
                        <div><strong>{orderSuccess.kotData.roomNumber ? 'Room' : 'Table'}:</strong> {orderSuccess.kotData.roomNumber || orderSuccess.kotData.tableNumber}</div>
                      )}
                      {orderSuccess.kotData.customerName && <div><strong>Customer:</strong> {orderSuccess.kotData.customerName}</div>}
                      {orderSuccess.kotData.orderType && <div><strong>Type:</strong> {orderSuccess.kotData.orderType}</div>}
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #86efac' }}>
                          <th style={{ textAlign: 'left', padding: '4px 6px', backgroundColor: '#f0fdf4' }}>Item</th>
                          <th style={{ textAlign: 'center', padding: '4px 6px', backgroundColor: '#f0fdf4', width: '36px' }}>Qty</th>
                          <th style={{ textAlign: 'left', padding: '4px 6px', backgroundColor: '#f0fdf4' }}>Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(orderSuccess.kotData.items || []).map((i, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #dcfce7' }}>
                            <td style={{ padding: '4px 6px' }}>{i.name || '—'}</td>
                            <td style={{ padding: '4px 6px', textAlign: 'center' }}>{i.quantity || 1}</td>
                            <td style={{ padding: '4px 6px', color: '#6b7280' }}>{i.notes || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {orderSuccess.kotData.specialInstructions && (
                      <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#fef3c7', border: '1px dashed #f59e0b', borderRadius: '4px', textAlign: 'left' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '11px', color: '#92400e', marginBottom: '4px' }}>*** SPECIAL INSTRUCTIONS ***</div>
                        <div style={{ fontSize: '12px', color: '#78350f' }}>{orderSuccess.kotData.specialInstructions}</div>
                      </div>
                    )}
                    <div style={{ marginTop: '8px', fontSize: '12px', borderTop: '2px dashed #22c55e', paddingTop: '6px' }}>Thank you - DineOpen KOT</div>
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
                      const tableOrRoom = k.roomNumber ? `Room: ${k.roomNumber}` : (k.tableNumber ? `Table: ${k.tableNumber}` : '');
                      const totalItems = (k.items || []).reduce((sum, i) => sum + (i.quantity || 1), 0);
                      const specialInstructionsHtml = k.specialInstructions ? `<div class="divider">--------------------------------</div><div class="special-instructions"><strong>*** SPECIAL INSTRUCTIONS ***</strong><div>${(k.specialInstructions || '').replace(/</g,'&lt;')}</div></div>` : '';
                      const kotContent = `<!DOCTYPE html><html><head><title>KOT - ${k.dailyOrderId || k.orderId}</title><style>${getKOTPrintCSS(printSettings?.billFontScale || printSettings?.billFontSize, printSettings?.billFontFamily)}</style></head><body><div class="kot-header"><div class="restaurant-name">${(k.restaurantName || 'Restaurant').replace(/</g,'&lt;')}</div><div class="kot-title">--- KITCHEN ORDER ---</div></div><div class="divider">--------------------------------</div><div class="kot-info"><div><strong>Order#:</strong> ${k.dailyOrderId || k.orderId}</div>${tableOrRoom ? `<div><strong>${k.roomNumber ? 'Room' : 'Table'}:</strong> ${k.roomNumber || k.tableNumber}</div>` : ''}<div><strong>Time:</strong> ${new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true})}</div><div><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</div>${k.customerName ? `<div><strong>Customer:</strong> ${(k.customerName || '').replace(/</g,'&lt;')}</div>` : ''}${k.orderType ? `<div><strong>Type:</strong> ${k.orderType}</div>` : ''}${k.waiterName ? `<div><strong>Waiter:</strong> ${(k.waiterName || '').replace(/</g,'&lt;')}</div>` : ''}</div><div class="divider">--------------------------------</div><div style="font-weight:bold;margin-bottom:4px;">QTY &nbsp; ITEM</div><div class="divider">--------------------------------</div>${(k.items || []).map(i => `<div class="item"><div class="item-main"><span class="item-qty">${i.quantity || 1}x</span><span class="item-name">${(i.name || '').replace(/</g,'&lt;')}</span></div>${i.selectedVariant?.name ? `<div class="item-detail">[${i.selectedVariant.name}]</div>` : ''}${(i.selectedCustomizations || []).map(c => `<div class="item-detail">+ ${(c.name || c || '').toString().replace(/</g,'&lt;')}</div>`).join('')}${i.notes ? `<div class="item-note">Note: ${(i.notes || '').replace(/</g,'&lt;')}</div>` : ''}</div>`).join('')}<div class="divider">--------------------------------</div><div class="kot-footer">Total Items: ${totalItems}</div>${specialInstructionsHtml}<div class="divider">================================</div></body></html>`;
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
                    Print Kitchen Order (KOT)
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
                    <div style={{ marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase' }}>{invoice?.restaurantName || 'Restaurant'}</div>
                    <div style={{ textAlign: 'left', marginBottom: '8px', fontSize: '13px' }}>
                      {invoice?.dailyOrderId != null && <div><strong>{bLabels.billLabel} #:</strong> {invoice.dailyOrderId}</div>}
                      {invoice?.orderId && <div><strong>ID:</strong> {String(invoice.orderId).slice(-8).toUpperCase()}</div>}
                      <div><strong>Date:</strong> {invoice?.generatedAt ? new Date(invoice.generatedAt).toLocaleString() : (invoice?.invoiceDate ? new Date(invoice.invoiceDate).toLocaleString() : 'N/A')}</div>
                      {invoice?.tableNumber && <div><strong>Table:</strong> {invoice.tableNumber}</div>}
                      {invoice?.customerName && <div><strong>{bLabels.customerLabel}:</strong> {invoice.customerName}</div>}
                      <div><strong>Payment:</strong> {(invoice?.paymentMethod || 'CASH').toUpperCase()}</div>
                    </div>
                    {/* Items table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '8px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px dashed #22c55e' }}>
                          <th style={{ textAlign: 'left', padding: '4px 6px', backgroundColor: '#f0fdf4' }}>{bLabels.itemCol}</th>
                          <th style={{ textAlign: 'center', padding: '4px 6px', backgroundColor: '#f0fdf4', width: '40px' }}>{bLabels.qtyCol}</th>
                          <th style={{ textAlign: 'right', padding: '4px 6px', backgroundColor: '#f0fdf4', width: '70px' }}>Amt</th>
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
                            <td style={{ padding: '3px 6px', textAlign: 'right' }}>{formatCurrency((item.price || item.total/(item.quantity||1) || 0) * (item.quantity || 1))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* Totals */}
                    <div style={{ borderTop: '1px dashed #22c55e', paddingTop: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                        <span>Subtotal:</span>
                        <span>{formatCurrency(invoice?.subtotal || 0)}</span>
                      </div>
                      {(invoice?.discountAmount || 0) > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px', color: '#16a34a' }}>
                          <span>Offer{(() => { const n = typeof invoice?.appliedOffer === 'string' ? invoice.appliedOffer : (invoice?.appliedOffer?.name || invoice?.selectedOfferName); return n ? ` (${n})` : ''; })()}:</span>
                          <span>-{formatCurrency(invoice.discountAmount)}</span>
                        </div>
                      )}
                      {(invoice?.manualDiscount || 0) > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px', color: '#16a34a' }}>
                          <span>Manual Discount:</span>
                          <span>-{formatCurrency(invoice.manualDiscount)}</span>
                        </div>
                      )}
                      {(invoice?.loyaltyDiscount || 0) > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px', color: '#b45309' }}>
                          <span>Loyalty Redeem:</span>
                          <span>-{formatCurrency(invoice.loyaltyDiscount)}</span>
                        </div>
                      )}
                      {invoice?.taxBreakdown?.map((tax, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                          <span>{tax.name} ({tax.rate}%)</span>
                          <span>{formatCurrency(tax.amount || 0)}</span>
                        </div>
                      ))}
                      {(invoice?.serviceChargeAmount > 0) && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                          <span>Service Charge{invoice?.serviceChargeRate ? ` (${invoice.serviceChargeRate}%)` : ''}:</span>
                          <span>{formatCurrency(invoice.serviceChargeAmount)}</span>
                        </div>
                      )}
                      {(invoice?.tipAmount > 0) && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                          <span>Tip{invoice?.tipPercentage ? ` (${invoice.tipPercentage}%)` : ''}:</span>
                          <span>{formatCurrency(invoice.tipAmount)}</span>
                        </div>
                      )}
                      {(invoice?.roundOffAmount != null && invoice?.roundOffAmount !== 0) && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                          <span>Round Off:</span>
                          <span>{invoice.roundOffAmount > 0 ? '+' : ''}{formatCurrency(invoice.roundOffAmount)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', borderTop: '2px solid #22c55e', paddingTop: '4px', marginTop: '4px' }}>
                        <span>TOTAL:</span>
                        <span>{formatCurrency(invoice?.grandTotal || ((invoice?.subtotal || 0) - (invoice?.totalDiscount || 0) + (invoice?.taxBreakdown?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0) + (invoice?.serviceChargeAmount || 0) + (invoice?.tipAmount || 0) + (invoice?.roundOffAmount || 0)))}</span>
                      </div>
                      {(invoice?.splitPayments?.length >= 2) && (
                        <div style={{ borderTop: '1px dashed #22c55e', paddingTop: '4px', marginTop: '4px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '2px' }}>Split Payment:</div>
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
                            <span>Cash Received:</span>
                            <span>{formatCurrency(invoice.cashReceived)}</span>
                          </div>
                          {(invoice?.changeReturned > 0) && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                              <span>Change:</span>
                              <span>{formatCurrency(invoice.changeReturned)}</span>
                            </div>
                          )}
                        </div>
                      )}
                      {(invoice?.paidAmount > 0 && invoice?.outstandingAmount > 0) && (
                        <div style={{ borderTop: '1px dashed #22c55e', paddingTop: '4px', marginTop: '4px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '2px' }}>Partial Payment:</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                            <span>Paid:</span>
                            <span>{formatCurrency(invoice.paidAmount)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px', color: '#dc2626' }}>
                            <span>Outstanding:</span>
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
                      const itemsHtml = billItems.map(item => `<tr><td style="text-align:left;">${(item.name || '').replace(/</g,'&lt;')}${getSublineHtml(item)}</td><td style="text-align:center;">${item.quantity || 1}</td><td style="text-align:right;">${currencySymbol}${((item.price || item.total/item.quantity || 0) * (item.quantity || 1)).toFixed(2)}</td></tr>`).join('');
                      const taxHtml = (invoice?.taxBreakdown || []).map(tax => `<tr><td colspan="2" style="text-align:left;">${tax.name} (${tax.rate}%)</td><td style="text-align:right;">${currencySymbol}${(tax.amount || 0).toFixed(2)}</td></tr>`).join('');
                      const printTotalDiscount = (invoice?.discountAmount || 0) + (invoice?.manualDiscount || 0) + (invoice?.loyaltyDiscount || 0);
                      const offerName = typeof invoice?.appliedOffer === 'string' ? invoice.appliedOffer : (invoice?.appliedOffer?.name || invoice?.selectedOfferName || '');
                      const offerDiscHtml = (invoice?.discountAmount || 0) > 0 ? `<div style="display:flex;justify-content:space-between;margin:2px 0;color:#16a34a;"><span>Offer${offerName ? ` (${offerName})` : ''}:</span><span>-${currencySymbol}${(invoice.discountAmount).toFixed(2)}</span></div>` : '';
                      const manualDiscHtml = (invoice?.manualDiscount || 0) > 0 ? `<div style="display:flex;justify-content:space-between;margin:2px 0;color:#16a34a;"><span>Manual Discount:</span><span>-${currencySymbol}${(invoice.manualDiscount).toFixed(2)}</span></div>` : '';
                      const loyaltyDiscHtml = (invoice?.loyaltyDiscount || 0) > 0 ? `<div style="display:flex;justify-content:space-between;margin:2px 0;color:#b45309;"><span>Loyalty Redeem:</span><span>-${currencySymbol}${(invoice.loyaltyDiscount).toFixed(2)}</span></div>` : '';
                      const discountHtml = offerDiscHtml + manualDiscHtml + loyaltyDiscHtml;
                      const serviceChargeHtml = (invoice?.serviceChargeAmount > 0) ? `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>Service Charge${invoice?.serviceChargeRate ? ` (${invoice.serviceChargeRate}%)` : ''}:</span><span>${currencySymbol}${invoice.serviceChargeAmount.toFixed(2)}</span></div>` : '';
                      const tipHtml = (invoice?.tipAmount > 0) ? `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>Tip${invoice?.tipPercentage ? ` (${invoice.tipPercentage}%)` : ''}:</span><span>${currencySymbol}${invoice.tipAmount.toFixed(2)}</span></div>` : '';
                      const roundOffHtml = (invoice?.roundOffAmount != null && invoice?.roundOffAmount !== 0) ? `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>Round Off:</span><span>${invoice.roundOffAmount > 0 ? '+' : ''}${currencySymbol}${invoice.roundOffAmount.toFixed(2)}</span></div>` : '';
                      const splitPaymentHtml = (invoice?.splitPayments?.length >= 2) ? `<div style="border-top:1px dashed #000;padding-top:4px;margin-top:4px;"><div style="font-weight:bold;margin-bottom:2px;">Split Payment:</div>${invoice.splitPayments.map(sp => `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>${(sp.method || 'Cash').toUpperCase()}:</span><span>${currencySymbol}${(sp.amount || 0).toFixed(2)}</span></div>`).join('')}</div>` : '';
                      const cashReceivedHtml = (invoice?.cashReceived > 0) ? `<div style="border-top:1px dashed #000;padding-top:4px;margin-top:4px;"><div style="display:flex;justify-content:space-between;margin:2px 0;"><span>Cash Received:</span><span>${currencySymbol}${invoice.cashReceived.toFixed(2)}</span></div>${(invoice?.changeReturned > 0) ? `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>Change:</span><span>${currencySymbol}${invoice.changeReturned.toFixed(2)}</span></div>` : ''}</div>` : '';
                      const partialPayHtml = (invoice?.paidAmount > 0 && invoice?.outstandingAmount > 0) ? `<div style="border-top:1px dashed #000;padding-top:4px;margin-top:4px;"><div style="font-weight:bold;margin-bottom:2px;">Partial Payment:</div><div style="display:flex;justify-content:space-between;margin:2px 0;"><span>Paid:</span><span>${currencySymbol}${invoice.paidAmount.toFixed(2)}</span></div><div style="display:flex;justify-content:space-between;margin:2px 0;color:#dc2626;"><span>Outstanding:</span><span>${currencySymbol}${invoice.outstandingAmount.toFixed(2)}</span></div></div>` : '';
                      const printGrandTotal = invoice?.grandTotal || ((invoice?.subtotal || 0) - printTotalDiscount + (invoice?.taxBreakdown?.reduce((sum, tax) => sum + (tax.amount || 0), 0) || 0) + (invoice?.serviceChargeAmount || 0) + (invoice?.tipAmount || 0) + (invoice?.roundOffAmount || 0));
                      const invoiceContent = `<!DOCTYPE html><html><head><title>${bLabels.billLabel} #${invoice?.dailyOrderId || invoice?.id || 'N/A'}</title><style>${getBillPrintCSS(printSettings?.billFontScale || printSettings?.billFontSize, printSettings?.billFontFamily)}</style></head><body><div class="bill-header"><div class="restaurant-name">${(invoice?.restaurantName || 'Restaurant').replace(/</g,'&lt;')}</div><div class="bill-title">--- ${bLabels.billTitle} ---</div></div><div class="divider">--------------------------------</div><div class="bill-info"><div><span>${bLabels.billLabel}#:</span><span><strong>${invoice?.dailyOrderId || invoice?.id || 'N/A'}</strong></span></div><div><span>Date:</span><span>${new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})} ${new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true})}</span></div>${invoice?.tableNumber ? `<div><span>Table:</span><span>${invoice.tableNumber}</span></div>` : ''}${invoice?.customerName ? `<div><span>${bLabels.customerLabel}:</span><span>${(invoice.customerName || '').replace(/</g,'&lt;')}</span></div>` : ''}<div><span>Payment:</span><span>${(invoice?.paymentMethod || 'CASH').toUpperCase()}</span></div></div><div class="divider">--------------------------------</div><table><thead><tr><th style="text-align:left;">${bLabels.itemCol}</th><th style="text-align:center;">${bLabels.qtyCol}</th><th style="text-align:right;">Amt</th></tr></thead><tbody>${itemsHtml}</tbody></table><div class="total-section"><div class="bill-info"><div><span>Subtotal:</span><span>${currencySymbol}${(invoice?.subtotal || 0).toFixed(2)}</span></div>${discountHtml}</div>${taxHtml ? `<table style="margin:4px 0;"><tbody>${taxHtml}</tbody></table>` : ''}${serviceChargeHtml}${tipHtml}${roundOffHtml}<div class="total-row"><span>TOTAL:</span><span>${currencySymbol}${printGrandTotal.toFixed(2)}</span></div>${splitPaymentHtml}${cashReceivedHtml}${partialPayHtml}</div><div class="divider">================================</div><div class="bill-footer"><p>${bLabels.footer}</p><p style="font-size:10px;margin-top:4px;">Powered by DineOpen</p></div></body></html>`;
                      win.document.write(invoiceContent);
                      win.document.close();
                      win.focus();
                      setTimeout(() => win.print(), 500);
                    }}
                    style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(59,130,246,0.3)' }}
                  >
                    <FaPrint size={14} />
                    Print {bLabels.billLabel}
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
                      {waSent ? 'Sent on WhatsApp!' : waSending ? 'Sending...' : 'Send on WhatsApp'}
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
                  onClearCart();
                  setSpecialInstructions(''); // Clear special instructions for new order
                  if (isMobile && onClose) setTimeout(() => onClose(), 300);
                }}
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', margin: '0 auto', boxShadow: '0 4px 12px rgba(34,197,94,0.4)' }}
              >
                <FaPlus size={10} />
                Start New Order
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
                      {currentOrder && currentOrder.items && currentOrder.items.some(origItem => origItem.menuItemId === item.id) && (
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
                      )}
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

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: '600', 
                          color: '#6b7280' 
                        }}>
                          Subtotal: {formatCurrency(getItemUnitPrice(item) * item.quantity)}
                        </span>
                        <span style={{ 
                          fontSize: '12px', 
                          fontWeight: 'bold', 
                          color: '#ef4444' 
                        }}>
                          {formatCurrency(getItemUnitPrice(item))}
                        </span>
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
          </div>
        )}

      </div>

      {/* Fixed Bottom Section - Total, Customer Info, Payment, Buttons */}
      {cart.length > 0 && !shouldShowOrderSummary() && (
        <div style={{
          borderTop: '1px solid #e5e7eb',
          backgroundColor: 'white',
          flexShrink: 0,
          boxShadow: '0 -4px 12px rgba(0,0,0,0.08)'
        }}>
          {/* (Discount controls moved inline with special instructions below) */}

          {/* Total - Red bar */}
          <div style={{ padding: '4px 12px 6px 12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
              color: 'white',
              padding: '12px 14px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}>
              {/* Total with Subtotal & Tax on left, Amount on right */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>{t('common.total')}</div>
                  <div style={{ fontSize: '11px', opacity: 0.9, display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span>Subtotal: {formatCurrency(getTotalAmount())}</span>
                    {totalDiscountAmount > 0 && (
                      <span style={{ color: '#bbf7d0' }}>Discount: -{formatCurrency(totalDiscountAmount)}</span>
                    )}
                    {serviceChargeAmount > 0 && (
                      <span>{billingSettings.serviceChargeLabel || 'Service Charge'} ({billingSettings.serviceChargeRate}%): {formatCurrency(serviceChargeAmount)}</span>
                    )}
                    {taxBreakdown.map((tax, index) => (
                      <span key={index}>{tax.name} ({tax.rate}%): {formatCurrency(tax.amount || 0)}</span>
                    ))}
                    {tipAmount > 0 && (
                      <span style={{ color: '#fef08a' }}>Tip: {formatCurrency(tipAmount)}</span>
                    )}
                    {roundOffAmount !== 0 && (
                      <span>Round-off: {roundOffAmount > 0 ? '+' : ''}{formatCurrency(roundOffAmount)}</span>
                    )}
                  </div>
                </div>
                <span style={{ fontSize: '22px', fontWeight: 'bold' }}>{formatCurrency(grandTotal !== null ? grandTotal : getTotalAmount())}</span>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          {!shouldShowOrderSummary() && (
            <div style={{ padding: '6px 12px 12px 12px' }}>
              {/* Offers & Rewards Summary Row — opens unified detail modal */}
              {(() => {
                const hasOffers = genericOffers.length > 0 || personalizedOffers.length > 0;
                const hasLoyalty = loyaltySettings?.enabled && customerData && lookupStatus === 'found';
                const hasAnything = hasOffers || hasLoyalty || totalDiscountAmount > 0 || specialInstructions;
                if (!hasAnything || cart.length === 0) return null;

                const activeOfferCount = (offerSettings?.allowMultipleOffers ? selectedOfferIds : (selectedOfferId ? [selectedOfferId] : [])).length;
                const loyaltyDisc = getLoyaltyDiscountAmount();
                const earnPts = getLoyaltyPointsToEarn();
                const hasApplied = activeOfferCount > 0 || loyaltyDisc > 0;

                return (
                  <button
                    onClick={() => setShowOffersModal(true)}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '10px',
                      border: hasApplied ? '1.5px solid #86efac' : '1.5px dashed #d1d5db',
                      background: hasApplied
                        ? 'linear-gradient(135deg, #f0fdf4, #ecfdf5)'
                        : 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                      marginBottom: '6px', transition: 'all 0.2s',
                      boxShadow: hasApplied ? '0 2px 8px rgba(22,163,74,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = hasApplied ? '0 4px 12px rgba(22,163,74,0.12)' : '0 3px 8px rgba(0,0,0,0.08)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = hasApplied ? '0 2px 8px rgba(22,163,74,0.08)' : '0 1px 3px rgba(0,0,0,0.04)'; }}
                  >
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                      background: hasApplied ? '#dcfce7' : '#f1f5f9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FaTag size={11} style={{ color: hasApplied ? '#16a34a' : '#9ca3af' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                      {hasApplied ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#15803d' }}>
                            Saving {formatCurrency(totalDiscountAmount)}
                          </span>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {activeOfferCount > 0 && (
                              <span style={{ fontSize: '10px', fontWeight: 500, color: '#16a34a' }}>
                                {activeOfferCount} offer{activeOfferCount > 1 ? 's' : ''}
                              </span>
                            )}
                            {loyaltyDisc > 0 && (
                              <span style={{ fontSize: '10px', fontWeight: 500, color: '#b45309' }}>
                                {redeemLoyaltyPoints}pts redeemed
                              </span>
                            )}
                            {specialInstructions && (
                              <span style={{ fontSize: '10px', fontWeight: 500, color: '#d97706', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <FaStickyNote size={7} /> Note
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                            Offers & Rewards
                          </span>
                          <span style={{ fontSize: '10px', color: '#9ca3af' }}>
                            {hasOffers ? `${applicableOffers.length} offer${applicableOffers.length > 1 ? 's' : ''} available` : ''}
                            {hasOffers && hasLoyalty ? ' · ' : ''}
                            {hasLoyalty ? `${customerData.loyaltyPoints || 0} pts` : ''}
                          </span>
                        </div>
                      )}
                    </div>
                    {earnPts > 0 && (
                      <span style={{
                        fontSize: '9px', fontWeight: 600, color: '#16a34a', flexShrink: 0,
                        background: '#dcfce7', padding: '2px 7px', borderRadius: '10px',
                      }}>+{earnPts}pts</span>
                    )}
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0,
                      background: hasApplied ? '#bbf7d0' : '#e5e7eb',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FaChevronDown size={8} style={{ color: hasApplied ? '#15803d' : '#6b7280' }} />
                    </div>
                  </button>
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
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row',
                      gap: isMobile ? '8px' : '6px',
                      alignItems: isMobile ? 'stretch' : 'center',
                      flexWrap: 'wrap'
                  }}>
                    {/* Customer Mobile + Lookup (Phone First) */}
                    {!posSettings.hideMobile && (
                    <div style={{ position: 'relative', flex: isMobile ? '0 0 auto' : '1', minWidth: isMobile ? '100%' : '120px' }}>
                    <input
                      type="tel"
                      placeholder={posSettings.mobileLabel || 'Mobile Number'}
                      value={customerMobile || ''}
                        maxLength={getPhoneMinLength(countryCode) + 3}
                      style={{
                          width: '100%',
                        padding: isMobile ? '10px 12px' : '8px 10px',
                        paddingRight: '36px',
                          border: `1.5px solid ${
                            lookupStatus === 'error' ? '#ef4444' :
                            lookupStatus === 'found' ? '#22c55e' :
                            lookupStatus === 'not_found' && isValidMobile ? '#f59e0b' :
                            isValidMobile ? '#22c55e' : '#e5e7eb'
                          }`,
                        borderRadius: '8px',
                        fontSize: isMobile ? '14px' : '12px',
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

                    {/* Customer Name — always visible, pre-filled when customer found */}
                    {!posSettings.hideCustomerName && (
                    <div style={{ position: 'relative', flex: isMobile ? '0 0 auto' : '1', minWidth: isMobile ? '100%' : '120px' }}>
                    <input
                      type="text"
                      placeholder={posSettings.customerNameLabel || t('dashboard.customerName')}
                      value={customerName || ''}
                      style={{
                          width: '100%',
                        padding: isMobile ? '10px 12px' : '8px 10px',
                        paddingRight: (lookupStatus === 'found' && customerData) ? '36px' : (isMobile ? '12px' : '10px'),
                          border: `1.5px solid ${(lookupStatus === 'found' && customerData) ? '#0891b2' : isValidName ? '#22c55e' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        fontSize: isMobile ? '14px' : '12px',
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
                          width: isMobile ? '100%' : 'auto',
                          flex: isMobile ? '0 0 auto' : '0 0 auto',
                          padding: isMobile ? '8px 14px' : '6px 12px',
                          borderRadius: '10px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 50%, #06b6d4 100%)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: isMobile ? '10px' : '8px',
                          fontSize: isMobile ? '12px' : '11px',
                          fontWeight: 600,
                          color: '#ffffff',
                          transition: 'all 0.2s',
                          whiteSpace: 'nowrap',
                          boxShadow: '0 2px 8px rgba(13,148,136,0.3)',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(13,148,136,0.45)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(13,148,136,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        title="View customer details & offers"
                      >
                        <div style={{
                          width: isMobile ? '26px' : '20px', height: isMobile ? '26px' : '20px',
                          borderRadius: '50%', background: 'rgba(255,255,255,0.25)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <FaUser size={isMobile ? 9 : 8} style={{ color: '#fff' }} />
                        </div>
                        {customerData.loyaltyPoints > 0 && (
                          <span style={{ color: '#ffffff', fontWeight: 700, fontSize: isMobile ? '11px' : '10px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <FaStar size={8} style={{ color: '#ffffff' }} />{customerData.loyaltyPoints}
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
                        width: isMobile ? '100%' : 'auto',
                        flex: isMobile ? '0 0 auto' : '0 0 auto',
                        padding: isMobile ? '6px 12px' : '5px 10px',
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
                            flex: '0 0 auto',
                            width: isMobile ? '100%' : '80px',
                            padding: isMobile ? '10px 12px' : '8px 10px',
                            border: `2px solid ${isValidTable ? '#22c55e' : '#d1d5db'}`,
                            borderRadius: '6px',
                            fontSize: isMobile ? '14px' : '12px',
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
                          width: isMobile ? '100%' : 'auto',
                          flex: '0 0 auto',
                          minWidth: isMobile ? '100%' : 'auto'
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
              <div style={{ marginBottom: '16px' }}>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: '700', 
                  color: '#1f2937', 
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <FaCreditCard size={12} />
                  {t('dashboard.paymentMethod')}
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[
                    { id: 'cash', label: t('dashboard.cash') },
                    ...(!posSettings.hideUPI ? [{ id: 'upi', label: t('dashboard.upi') }] : []),
                    ...(!posSettings.hideCard ? [{ id: 'card', label: t('dashboard.card') }] : [])
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
              billingSettings.cashTenderingEnabled && paymentMethod === 'cash' && { id: 'cash', icon: FaMoneyBillWave, label: 'Cash', color: '#10b981' },
              billingSettings.splitPaymentEnabled && (() => {
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
              billingSettings.tipsEnabled && { id: 'tip', icon: FaHandHoldingUsd, label: 'Tip', color: '#f59e0b' },
              billingSettings.partialPaymentEnabled && { id: 'partial', icon: FaWallet, label: 'Partial', color: '#8b5cf6' },
              billingSettings.compVoidEnabled && { id: 'comp', icon: FaGift, label: 'Comp', color: '#ec4899' },
              billingSettings.compVoidEnabled && { id: 'void', icon: FaBan, label: 'Void', color: '#6b7280' },
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
                      (tool.id === 'partial' && parseFloat(partialPayAmount) > 0) ||
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

                {/* Partial Payment Panel */}
                {activeBillingPanel === 'partial' && (
                  <div style={{
                    background: '#f5f3ff',
                    border: '1px solid #ddd6fe',
                    borderRadius: '10px',
                    padding: '12px',
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#5b21b6', marginBottom: '8px' }}>
                      Partial Payment — Total: {formatCurrency(grandTotal)}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
                      <input
                        type="number"
                        placeholder="Amount to pay now"
                        value={partialPayAmount}
                        onChange={(e) => setPartialPayAmount(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          border: '1.5px solid #c4b5fd',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 700,
                          outline: 'none',
                          background: 'white'
                        }}
                        autoFocus
                      />
                    </div>
                    {parseFloat(partialPayAmount) > 0 && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        background: '#ede9fe',
                        borderRadius: '8px',
                        fontWeight: 700
                      }}>
                        <span style={{ fontSize: '12px', color: '#374151' }}>Outstanding (Khata)</span>
                        <span style={{ fontSize: '16px', color: '#7c3aed' }}>
                          {formatCurrency(Math.max(0, grandTotal - parseFloat(partialPayAmount)))}
                        </span>
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

          {/* Action Buttons */}
          <div style={{ padding: '6px 12px 12px 12px' }}>
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

          {/* First Row - Save and Place Order (hidden in billing mode) */}
          {!billingMode && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              {!posSettings.hideSaveOrder && <button
                onClick={() => {
                  if (typeof onSaveOrder === 'function' && !orderBusy) {
                    const saveOfferIds = offerSettings?.allowMultipleOffers && selectedOfferIds.length > 0
                      ? selectedOfferIds : (selectedOfferId ? [selectedOfferId] : []);
                    const taxData = {
                      taxBreakdown, totalTax, finalAmount: grandTotal ?? getTotalAmount(), subtotal: getTotalAmount(),
                      specialInstructions: specialInstructions.trim() || null,
                      offerIds: saveOfferIds,
                      manualDiscount: getManualDiscountAmount(),
                      offerDiscount,
                      selectedOfferName,
                      totalDiscountAmount: offerDiscount + getManualDiscountAmount() + getLoyaltyDiscountAmount(),
                      redeemLoyaltyPoints: redeemLoyaltyPoints > 0 ? redeemLoyaltyPoints : 0,
                      loyaltyDiscount: getLoyaltyDiscountAmount(),
                      serviceChargeRate: serviceChargeAmount > 0 ? billingSettings.serviceChargeRate : null,
                      serviceChargeAmount: serviceChargeAmount > 0 ? serviceChargeAmount : null,
                      tipAmount: tipAmount > 0 ? tipAmount : null,
                      tipPercentage: tipPercentage || null,
                      roundOffAmount: roundOffAmount !== 0 ? roundOffAmount : null,
                      compItems: compVoidItems.filter(cv => cv.type === 'comp').length > 0 ? compVoidItems.filter(cv => cv.type === 'comp') : null,
                      voidItems: compVoidItems.filter(cv => cv.type === 'void').length > 0 ? compVoidItems.filter(cv => cv.type === 'void') : null,
                      partialPayAmount: parseFloat(partialPayAmount) > 0 ? parseFloat(partialPayAmount) : null,
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
                  padding: '12px 14px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: orderBusy || cart.length === 0 || isEditingSavedOrder ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  transition: 'all 0.2s',
                  boxShadow: orderBusy || cart.length === 0 || isEditingSavedOrder ? 'none' : '0 2px 8px rgba(249, 115, 22, 0.3)'
                }}
              >
                {savingOrder ? (
                  <>
                    <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave size={12} />
                    {posSettings.saveOrderLabel || t('dashboard.saveOrder')}
                  </>
                )}
              </button>}

              <button
                onClick={() => {
                  // Intercept UPI — show QR modal
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
                  padding: '12px 14px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: orderBusy || cart.length === 0 || (currentOrder && currentOrder.status === 'completed') ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  transition: 'all 0.2s',
                  boxShadow: orderBusy || cart.length === 0 || (currentOrder && currentOrder.status === 'completed') ? 'none' : '0 2px 8px rgba(239, 68, 68, 0.3)'
                }}
              >
                {placingOrder ? (
                  <>
                    <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} />
                    {t('dashboard.orderProcessing')}
                  </>
                ) : (
                  <>
                    <FaUtensils size={12} />
                    {posSettings.placeOrderLabel || t('dashboard.placeOrder')}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Complete Billing Button */}
          <button
            onClick={handleProcessOrder}
            disabled={orderBusy || cart.length === 0 || (currentOrder && currentOrder.status === 'completed')}
            style={{
              width: '100%',
              background: orderBusy || cart.length === 0 || (currentOrder && currentOrder.status === 'completed')
                ? 'linear-gradient(135deg, #d1d5db, #9ca3af)'
                : 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              padding: billingMode ? '14px 16px' : '12px 14px',
              borderRadius: '8px',
              fontWeight: '700',
              border: 'none',
              cursor: orderBusy || cart.length === 0 || (currentOrder && currentOrder.status === 'completed') ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: billingMode ? '14px' : '12px',
              transition: 'all 0.2s',
              boxShadow: orderBusy || cart.length === 0 || (currentOrder && currentOrder.status === 'completed') ? 'none' : '0 4px 12px rgba(34, 197, 94, 0.35)'
            }}
          >
            {processing ? (
              <>
                <FaSpinner size={billingMode ? 14 : 12} style={{ animation: 'spin 1s linear infinite' }} />
                {t('dashboard.paymentProcessing')}
              </>
            ) : (
              <>
                <FaCheckCircle size={billingMode ? 14 : 12} />
                {posSettings.completeBillingLabel || t('dashboard.completeBilling')}
              </>
            )}
          </button>
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
                      <FaGift size={10} /> Free: {freeItems.map(f => `${f.qty}× ${f.itemId}`).join(', ')}
                    </div>
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
                      const afterOtherDisc = Math.max(0, getTotalAmount() - offerDiscount - getManualDiscountAmount());
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
                {offerDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#16a34a' }}>Offers</span>
                    <span style={{ fontWeight: 600, color: '#16a34a' }}>-{formatCurrency(offerDiscount)}</span>
                  </div>
                )}
                {getLoyaltyDiscountAmount() > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#b45309' }}>Loyalty ({redeemLoyaltyPoints} pts)</span>
                    <span style={{ fontWeight: 600, color: '#b45309' }}>-{formatCurrency(getLoyaltyDiscountAmount())}</span>
                  </div>
                )}
                {taxBreakdown.map((tax, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>{tax.name} ({tax.rate}%)</span>
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
    </div>
  );
};

export default OrderSummary;
