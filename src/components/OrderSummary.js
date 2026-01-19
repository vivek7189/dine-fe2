'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/api';
import { t } from '../lib/i18n';
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
  FaBed
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
  orderSuccess, 
  setOrderSuccess, 
  error, 
  getTotalAmount,
  tableNumber,
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
  menuItems = [],
  onClose,
  inRoomDiningEnabled = false,
  locationType = 'table',
  setLocationType,
  manualRoomNumber = '',
  setManualRoomNumber
}) => {
  const [invoice, setInvoice] = useState(null);
  const [showInvoicePermanently, setShowInvoicePermanently] = useState(false);
  const [taxBreakdown, setTaxBreakdown] = useState([]);
  const [totalTax, setTotalTax] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  
  // Voice Assistant State
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [recognizedItems, setRecognizedItems] = useState([]);
  const [showVoiceConfirm, setShowVoiceConfirm] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [useFullChatGPT, setUseFullChatGPT] = useState(true); // Feature flag - Set to true for full ChatGPT processing
  const [isMobile, setIsMobile] = useState(false);
  
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

  // Compute unit price for an item considering variant and selected customizations
  const getItemUnitPrice = (cartItem) => {
    const basePrice = (cartItem?.selectedVariant?.price)
      ?? (typeof cartItem?.basePrice === 'number' ? cartItem.basePrice : undefined)
      ?? (typeof cartItem?.price === 'number' ? cartItem.price : 0);
    const extras = Array.isArray(cartItem?.selectedCustomizations)
      ? cartItem.selectedCustomizations.reduce((sum, c) => sum + (c?.price || 0), 0)
      : (typeof cartItem?.customizationPrice === 'number' ? cartItem.customizationPrice : 0);
    return (basePrice || 0) + (extras || 0);
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
      setGrandTotal(getTotalAmount());
      return;
    }

    const subtotal = getTotalAmount();
    
    // Calculate tax based on restaurant's tax settings
    const calculatedTaxes = [];
    let totalTaxAmount = 0;

    if (taxSettings.taxes && taxSettings.taxes.length > 0) {
      taxSettings.taxes.forEach(tax => {
        if (tax.enabled) {
          const taxAmount = subtotal * (tax.rate / 100);
          calculatedTaxes.push({
            name: tax.name,
            rate: tax.rate,
            amount: taxAmount
          });
          totalTaxAmount += taxAmount;
        }
      });
    } else if (taxSettings.defaultTaxRate) {
      // Fallback to default tax rate
      const taxAmount = subtotal * (taxSettings.defaultTaxRate / 100);
      calculatedTaxes.push({
        name: 'GST',
        rate: taxSettings.defaultTaxRate,
        amount: taxAmount
      });
      totalTaxAmount = taxAmount;
    }

    console.log('Calculated taxes:', calculatedTaxes, 'Total tax:', totalTaxAmount);
    setTaxBreakdown(calculatedTaxes);
    setTotalTax(totalTaxAmount);
    setGrandTotal(subtotal + totalTaxAmount);

  }, [cart, restaurantId, getTotalAmount, taxSettings]);
  
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
  }, [calculateTax, cart, restaurantId, getTotalAmount, taxSettings]);

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
  useEffect(() => {
    if (cart.length > 0) {
      console.log('🔄 Cart items changed, forcing tax recalculation');
      // Small delay to ensure cart state is fully updated
      setTimeout(() => {
        calculateTax();
      }, 100);
    }
  }, [cart.map(item => `${item.id}-${item.quantity}-${item.price}`).join(',')]);
  
  // Debug logging
  console.log('OrderSummary orderSuccess:', orderSuccess);
  console.log('Tax state - taxBreakdown:', taxBreakdown, 'totalTax:', totalTax, 'grandTotal:', grandTotal);
  
  const generateInvoice = async (orderId) => {
    try {
      console.log('Generating invoice for order ID:', orderId);
      const response = await apiClient.generateInvoice(orderId);
      console.log('Invoice generation response:', response);
      if (response.success) {
        console.log('Invoice generated successfully:', response.invoice);
        setInvoice(response.invoice);
        setShowInvoicePermanently(true);
        console.log('Invoice will remain visible permanently');
        return true;
      } else {
        console.error('Invoice generation failed:', response);
        return false;
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      return false;
    }
  };
  
  const handleProcessOrder = async () => {
    if (typeof onProcessOrder === 'function') {
      try {
        const result = await onProcessOrder();
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
      height: isMobile ? '100vh' : '100%',
      position: isMobile ? 'fixed' : 'relative',
      top: isMobile ? 0 : 'auto',
      left: isMobile ? 0 : 'auto',
      zIndex: isMobile ? 1000 : 'auto',
      backgroundColor: 'white', 
      borderLeft: isMobile ? 'none' : '2px solid #e5e7eb', 
      display: 'flex', 
      flexDirection: 'column',
      boxShadow: isMobile ? 'none' : '-4px 0 20px rgba(0, 0, 0, 0.08)',
      overflowY: 'auto'
    }}>
      {/* Header - More Compact */}
      <div style={{ 
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)', 
        padding: '12px', 
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(239, 68, 68, 0.3)',
        borderRadius: '5px'
      }}>
        {/* Background Pattern */}
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
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Close Button for Mobile */}
            {isMobile && onClose && (
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '6px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white'
                }}
              >
                <FaTimes size={14} />
              </button>
            )}
            <div style={{
              width: '24px',
              height: '24px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <FaShoppingCart size={12} />
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
          
          {/* Edit Mode Indicator */}
          {currentOrder && (
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
            <div style={{ display: 'flex', gap: isMobile ? '3px' : '4px' }}>
              <button
                onClick={() => setOrderType('dine-in')}
                style={{
                  backgroundColor: orderType === 'dine-in' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: orderType === 'dine-in' ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                  borderRadius: isMobile ? '4px' : '6px',
                  padding: isMobile ? '4px 6px' : '6px 10px',
                  fontSize: isMobile ? '9px' : '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  minWidth: isMobile ? '40px' : '50px',
                  boxShadow: orderType === 'dine-in' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
                }}
                title="Dine In"
              >
                {isMobile ? 'DINE IN' : t('dashboard.dineIn')}
              </button>
              <button
                onClick={() => setOrderType('takeaway')}
                style={{
                  backgroundColor: orderType === 'takeaway' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: orderType === 'takeaway' ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                  borderRadius: isMobile ? '4px' : '6px',
                  padding: isMobile ? '4px 6px' : '6px 10px',
                  fontSize: isMobile ? '9px' : '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  minWidth: isMobile ? '40px' : '50px',
                  boxShadow: orderType === 'takeaway' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
                }}
                title="Takeaway"
              >
                {isMobile ? 'TAKEAWAY' : t('dashboard.takeaway')}
              </button>
              <button
                onClick={() => setOrderType('delivery')}
                style={{
                  backgroundColor: orderType === 'delivery' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: orderType === 'delivery' ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                  borderRadius: isMobile ? '4px' : '6px',
                  padding: isMobile ? '4px 6px' : '6px 10px',
                  fontSize: isMobile ? '9px' : '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  minWidth: isMobile ? '40px' : '50px',
                  boxShadow: orderType === 'delivery' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
                }}
                title="Delivery"
              >
                {isMobile ? 'DELIVERY' : 'Delivery'}
              </button>
            </div>
            
            {/* QR Code Button - Hide on Mobile */}
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
            
            {/* Clear Button - Hide on Mobile */}
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
          </div>
        </div>
      </div>

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

      {/* Cart Items */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '8px',
        scrollbarWidth: 'thin',
        scrollbarColor: '#cbd5e1 transparent'
      }}>
        {cart.length === 0 ? (
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 30px',
            height: '100%',
            minHeight: '500px'
          }}>
            {/* Main Plate Icon */}
            <div style={{ 
              width: '120px', 
              height: '120px', 
              background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(239, 68, 68, 0.15)',
              marginBottom: '32px',
              border: '3px solid #fecaca'
            }}>
              <div style={{ fontSize: '56px' }}>
                🍽️
              </div>
            </div>
            
            {/* Title */}
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '800', 
              color: '#1f2937',
              margin: '0 0 12px 0',
              letterSpacing: '-0.5px'
            }}>
              Start Taking Orders
            </h2>
            
            {/* Description */}
            <p style={{ 
              color: '#64748b', 
              fontSize: '14px', 
              margin: '0 0 32px 0',
              fontWeight: '500',
              lineHeight: '1.6',
              textAlign: 'center',
              maxWidth: '300px'
            }}>
              Start by adding delicious items from the menu to begin taking orders
            </p>
            
            {/* Visual Elements Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              width: '100%',
              maxWidth: '320px',
              marginTop: '20px'
            }}>
              {/* Food Icons */}
              <div style={{
                background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.1)'
              }}>
                🍕
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)'
              }}>
                🍔
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                boxShadow: '0 2px 8px rgba(251, 191, 36, 0.1)'
              }}>
                🍜
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1)'
              }}>
                🍛
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                boxShadow: '0 2px 8px rgba(244, 114, 182, 0.1)'
              }}>
                🍱
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                boxShadow: '0 2px 8px rgba(168, 85, 247, 0.1)'
              }}>
                🥗
              </div>
            </div>
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
                    {/* Variant and toppings sub-content */}
                    {(item?.selectedVariant || (Array.isArray(item?.selectedCustomizations) && item.selectedCustomizations.length > 0)) && (
                      <div style={{ margin: '2px 0 4px 0', color: '#6b7280' }}>
                        {item?.selectedVariant && (
                          <div style={{ fontSize: '10px' }}>
                            Variant: <span style={{ fontWeight: 600, color: '#374151' }}>{item.selectedVariant.name}</span>
                            {typeof item.selectedVariant.price === 'number' && (
                              <span> (₹{item.selectedVariant.price})</span>
                            )}
                          </div>
                        )}
                        {Array.isArray(item?.selectedCustomizations) && item.selectedCustomizations.length > 0 && (
                          <div style={{ fontSize: '10px' }}>
                            Toppings: {item.selectedCustomizations.map((c, idx) => (
                              <span key={idx}>
                                {idx > 0 ? ', ' : ''}
                                {c.name}{typeof c.price === 'number' && c.price > 0 ? ` (+₹${c.price})` : ''}
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
                          Subtotal: ₹{(getItemUnitPrice(item) * item.quantity)}
                        </span>
                        <span style={{ 
                          fontSize: '12px', 
                          fontWeight: 'bold', 
                          color: '#ef4444' 
                        }}>
                          ₹{getItemUnitPrice(item)}
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

      {/* Success Message - Show regardless of cart state */}
      {orderSuccess?.show && (
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#dcfce7', 
          border: '2px solid #22c55e',
          borderRadius: '12px',
          margin: '12px',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              backgroundColor: '#22c55e', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              animation: 'bounce 1s infinite'
            }}>
              <FaCheckCircle size={16} style={{ color: 'white' }} />
            </div>
            <div style={{ fontWeight: '800', color: '#166534', fontSize: '16px' }}>
              {orderSuccess.message || 'Order Complete! ✅'}
            </div>
          </div>
          <div style={{ fontSize: '14px', color: '#166534', marginBottom: '12px', fontWeight: '600' }}>
            Order #{orderSuccess.dailyOrderId || orderSuccess.orderId} {orderSuccess.message?.includes('placed') ? 'sent to kitchen' : 'billing completed'}
            {orderSuccess.dailyOrderId && (
              <div style={{ fontSize: '11px', color: '#15803d', marginTop: '4px', fontFamily: 'monospace' }}>
                ID: {orderSuccess.orderId?.slice(-8).toUpperCase()}
              </div>
            )}
          </div>
          <div style={{ fontSize: '12px', color: '#166534', marginBottom: '16px' }}>
            {orderSuccess.message?.includes('placed') 
              ? 'Your order has been sent to the kitchen for preparation' 
              : 'Payment processed successfully. Thank you for your order!'
            }
          </div>
          
          {/* Show invoice content inline for billing completion */}
          {((orderSuccess?.message?.includes('Billing Complete') && invoice) || showInvoicePermanently) && (
            <div style={{ 
              backgroundColor: '#f0fdf4', 
              border: '2px solid #22c55e', 
              borderRadius: '16px', 
              padding: '20px', 
              marginBottom: '16px',
              marginTop: '16px',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)'
            }}>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: '700', 
                color: '#166534', 
                marginBottom: '16px',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <FaCheckCircle color="#22c55e" size={20} />
                Invoice #{invoice?.id || 'N/A'}
              </div>
              
              {invoice && (
                <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>
                  <div style={{ marginBottom: '10px', fontWeight: '600', color: '#1f2937' }}>
                    🏪 Restaurant: {invoice.restaurantName || 'N/A'}
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    📋 Order ID: {invoice.orderId || 'N/A'}
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    📅 Date: {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleString() : 'N/A'}
                  </div>
                  {invoice.customerName && (
                    <div style={{ marginBottom: '10px' }}>
                      👤 Customer: {invoice.customerName}
                    </div>
                  )}
                  {invoice.tableNumber && (
                    <div style={{ marginBottom: '10px' }}>
                      🪑 Table: {invoice.tableNumber}
                    </div>
                  )}
                  
                  <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '12px', marginTop: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: '600' }}>
                      <span>💰 Subtotal:</span>
                      <span>₹{invoice.subtotal?.toFixed(2) || '0.00'}</span>
                    </div>
                    {invoice.taxBreakdown && invoice.taxBreakdown.map((tax, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px', color: '#6b7280' }}>
                        <span>📊 {tax.name} ({tax.rate}%):</span>
                        <span>₹{tax.amount?.toFixed(2) || '0.00'}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', borderTop: '2px solid #22c55e', paddingTop: '8px', marginTop: '8px', fontSize: '16px', color: '#166534' }}>
                      <span>💳 Total:</span>
                      <span>₹{((invoice.subtotal || 0) + (invoice.taxBreakdown?.reduce((sum, tax) => sum + (tax.amount || 0), 0) || 0)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'center' }}>
                <button
                  onClick={() => {
                    // Create a new window with just the invoice content
                    const printWindow = window.open('', '_blank', 'width=800,height=600');
                    const invoiceContent = `
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <title>Invoice #${invoice?.id || 'N/A'}</title>
                          <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            .invoice-header { text-align: center; margin-bottom: 20px; }
                            .invoice-details { margin-bottom: 20px; }
                            .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                            .invoice-table th, .invoice-table td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                            .invoice-table .total-row { font-weight: bold; border-top: 2px solid #000; }
                            .invoice-footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
                          </style>
                        </head>
                        <body>
                          <div class="invoice-header">
                            <h1>Invoice #${invoice?.id || 'N/A'}</h1>
                            <h2>${invoice?.restaurantName || 'Restaurant'}</h2>
                          </div>
                          
                          <div class="invoice-details">
                            <p><strong>Order ID:</strong> ${invoice?.orderId || 'N/A'}</p>
                            <p><strong>Date:</strong> ${invoice?.generatedAt ? new Date(invoice.generatedAt).toLocaleString() : 'N/A'}</p>
                          </div>
                          
                          <table class="invoice-table">
                            <thead>
                              <tr>
                                <th>Description</th>
                                <th>Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>Subtotal</td>
                                <td>₹${(invoice?.subtotal || 0).toFixed(2)}</td>
                              </tr>
                              ${invoice?.taxBreakdown?.map(tax => `
                                <tr>
                                  <td>${tax.name} (${tax.rate}%)</td>
                                  <td>₹${(tax.amount || 0).toFixed(2)}</td>
                                </tr>
                              `).join('') || ''}
                              <tr class="total-row">
                                <td>Total</td>
                                <td>₹${((invoice?.subtotal || 0) + (invoice?.taxBreakdown?.reduce((sum, tax) => sum + (tax.amount || 0), 0) || 0)).toFixed(2)}</td>
                              </tr>
                            </tbody>
                          </table>
                          
                          <div class="invoice-footer">
                            <p>Thank you for your business!</p>
                            <p>Generated by DineOpen Restaurant Management System</p>
                          </div>
                        </body>
                      </html>
                    `;
                    printWindow.document.write(invoiceContent);
                    printWindow.document.close();
                    printWindow.focus();
                    setTimeout(() => {
                      printWindow.print();
                      printWindow.close();
                    }, 500);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#2563eb';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#3b82f6';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <FaPrint size={14} />
                  Print Invoice
                </button>
                <button
                  onClick={() => {
                    setShowInvoicePermanently(false);
                    setInvoice(null);
                  }}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#dc2626';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#ef4444';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <FaTimes size={14} />
                  Clear Invoice
                </button>
              </div>
            </div>
          )}
          
          <button
            onClick={() => {
              setOrderSuccess(null);
              onClearCart();
              // Close modal on mobile after starting new order
              if (isMobile && onClose) {
                setTimeout(() => onClose(), 300);
              }
            }}
            style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              margin: '0 auto',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(34, 197, 94, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.4)';
            }}
          >
            <FaPlus size={10} />
            Start New Order
          </button>
        </div>
      )}

      {/* Footer */}
      {cart.length > 0 && (
        <div style={{ borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
          {/* Total */}
          <div style={{ padding: '12px' }}>
            {/* Tax Breakdown - Compact */}
            {(taxBreakdown.length > 0 || totalTax > 0) && (
              <div style={{ 
                backgroundColor: '#f3f4f6', 
                padding: '8px 12px', 
                borderRadius: '6px', 
                marginBottom: '8px',
                fontSize: '11px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ color: '#6b7280' }}>Subtotal:</span>
                  <span style={{ color: '#374151', fontWeight: '600' }}>₹{getTotalAmount().toFixed(2)}</span>
                </div>
                {taxBreakdown.map((tax, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ color: '#6b7280' }}>{tax.name} ({tax.rate}%):</span>
                    <span style={{ color: '#374151', fontWeight: '600' }}>₹{tax.amount?.toFixed(2) || '0.00'}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{ 
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)', 
              color: 'white', 
              padding: '10px 12px', 
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              marginBottom: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{t('common.total')}</span>
                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>₹{grandTotal > 0 ? grandTotal.toFixed(2) : getTotalAmount().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          {!orderSuccess?.show && (
            <div style={{ padding: '8px 16px 12px 16px' }}>
              {/* Customer Information */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: '700', 
                  color: '#1f2937', 
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {t('dashboard.customerName')}
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? '8px' : '6px',
                  alignItems: isMobile ? 'stretch' : 'center',
                  flexWrap: 'wrap'
                }}>
                  {/* First Row on Mobile: Customer Name & Mobile Number */}
                  <div style={{
                    display: 'flex',
                    gap: '6px',
                    flex: isMobile ? '0 0 auto' : '1',
                    minWidth: isMobile ? '100%' : '200px'
                  }}>
                    {/* Customer Name */}
                    <input
                      type="text"
                      placeholder={t('dashboard.customerName')}
                      value={customerName || ''}
                      style={{
                        flex: 1,
                        padding: isMobile ? '10px 12px' : '8px 10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: isMobile ? '14px' : '12px',
                        outline: 'none',
                        backgroundColor: '#f9fafb',
                        transition: 'border-color 0.2s'
                      }}
                      onChange={(e) => {
                        if (typeof onCustomerNameChange === 'function') {
                          onCustomerNameChange(e.target.value);
                        }
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                    
                    {/* Customer Mobile */}
                    <input
                      type="tel"
                      placeholder="Mobile Number"
                      value={customerMobile || ''}
                      style={{
                        flex: 1,
                        padding: isMobile ? '10px 12px' : '8px 10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: isMobile ? '14px' : '12px',
                        outline: 'none',
                        backgroundColor: '#f9fafb',
                        transition: 'border-color 0.2s'
                      }}
                      onChange={(e) => {
                        if (typeof onCustomerMobileChange === 'function') {
                          onCustomerMobileChange(e.target.value);
                        }
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>
                  
                  {/* Second Row on Mobile: Table/Room Number (Full Width) */}
                  {/* Combined Table/Room Selector with Input Box */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '4px', 
                    alignItems: 'stretch',
                    width: isMobile ? '100%' : 'auto',
                    flex: isMobile ? '0 0 auto' : '0 0 auto',
                    minWidth: isMobile ? '100%' : '280px',
                    maxWidth: isMobile ? '100%' : '100%'
                  }}>
                    {/* Location Type Selector (Table or Room) - Only show if in-room dining is enabled */}
                    {inRoomDiningEnabled ? (
                      <>
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
                            minWidth: '80px',
                            maxWidth: '120px',
                            padding: isMobile ? '10px 12px' : '7px 10px',
                            border: '2px solid #d1d5db',
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
                          onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                      </>
                    ) : (
                      /* Table Number Input - When in-room dining is disabled */
                      <input
                        type="text"
                        placeholder="Table No"
                        value={tableNumber || ''}
                        style={{
                          width: isMobile ? '100%' : '20%',
                          padding: isMobile ? '10px 12px' : '8px 10px',
                          border: '1px solid #d1d5db',
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
                        onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      />
                    )}
                  </div>
                </div>
              </div>

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
                    { id: 'upi', label: t('dashboard.upi') },
                    { id: 'card', label: t('dashboard.card') }
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

              {/* Workflow Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                {/* First Row - Save and Place Order */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    onClick={() => {
                      if (typeof onSaveOrder === 'function') {
                        onSaveOrder();
                      }
                      // Close modal on mobile after saving order
                      if (isMobile && onClose) {
                        setTimeout(() => onClose(), 500); // Small delay to show success
                      }
                    }}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #f97316, #ea580c)',
                      color: 'white',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)'
                    }}
                  >
                        <FaSave size={10} />
                    {t('dashboard.saveOrder')}
                  </button>
                  
                  <button 
                    onClick={() => {
                      if (typeof onPlaceOrder === 'function') {
                        onPlaceOrder();
                      }
                      // Close modal on mobile after placing order
                      if (isMobile && onClose) {
                        setTimeout(() => onClose(), 500); // Small delay to show success
                      }
                    }}
                    disabled={placingOrder || cart.length === 0 || (currentOrder && currentOrder.status === 'completed')}
                    style={{
                      flex: 1,
                      background: placingOrder || cart.length === 0 || (currentOrder && currentOrder.status === 'completed')
                        ? 'linear-gradient(135deg, #d1d5db, #9ca3af)' 
                        : 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      fontWeight: '600',
                      border: 'none',
                      cursor: placingOrder || cart.length === 0 || (currentOrder && currentOrder.status === 'completed') ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      transition: 'all 0.2s',
                      boxShadow: placingOrder || cart.length === 0 || (currentOrder && currentOrder.status === 'completed') ? 'none' : '0 2px 8px rgba(239, 68, 68, 0.3)'
                    }}
                  >
                    {placingOrder ? (
                      <>
                        <FaSpinner size={10} style={{ animation: 'spin 1s linear infinite' }} />
                        {t('dashboard.orderProcessing')}
                      </>
                    ) : (
                      <>
                        <FaUtensils size={10} />
                        {currentOrder ? 'Update Order' : t('dashboard.placeOrder')}
                      </>
                    )}
                  </button>
                </div>

                {/* Second Row - Complete Billing Only */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    onClick={handleProcessOrder}
                    disabled={processing || cart.length === 0 || (currentOrder && currentOrder.status === 'completed')}
                    style={{
                      flex: 1,
                      background: processing || cart.length === 0 || (currentOrder && currentOrder.status === 'completed')
                        ? 'linear-gradient(135deg, #d1d5db, #9ca3af)' 
                        : 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      fontWeight: '600',
                      border: 'none',
                      cursor: processing || cart.length === 0 || (currentOrder && currentOrder.status === 'completed') ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      transition: 'all 0.2s',
                      boxShadow: processing || cart.length === 0 || (currentOrder && currentOrder.status === 'completed') ? 'none' : '0 2px 8px rgba(34, 197, 94, 0.3)'
                    }}
                  >
                    {processing ? (
                      <>
                        <FaSpinner size={10} style={{ animation: 'spin 1s linear infinite' }} />
                        {t('dashboard.paymentProcessing')}
                      </>
                    ) : (
                      <>
                        <FaCheckCircle size={10} />
                        {t('dashboard.completeBilling')}
                      </>
                    )}
                  </button>
                </div>
              </div>


              {/* Error Message */}
              {error && (
                <div style={{
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '12px',
                  color: '#dc2626',
                  fontWeight: '600',
                  marginTop: '12px',
                  textAlign: 'center'
                }}>
                  {error}
                </div>
              )}
            </div>
          )}
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
                    ₹{item.price * item.quantity}
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
    </div>
  );
};

export default OrderSummary;
