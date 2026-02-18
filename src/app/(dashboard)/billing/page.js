'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FaCreditCard,
  FaCheckCircle,
  FaCalendarAlt,
  FaRocket,
  FaShieldAlt,
  FaHeadset,
  FaMobile,
  FaStar,
  FaCheck,
  FaSpinner,
  FaClock,
  FaExclamationTriangle,
  FaFire
} from 'react-icons/fa';

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [notification, setNotification] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [trialInfo, setTrialInfo] = useState({ daysLeft: 30, isExpired: false, startDate: null });

  // Calculate trial days remaining
  const calculateTrialDays = (startDate) => {
    if (!startDate) return { daysLeft: 30, isExpired: false };
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = now - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, 30 - diffDays);
    return { daysLeft, isExpired: daysLeft === 0 };
  };

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Always default to USD, user can switch to INR if needed
    setCurrency('USD');

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check for payment return from Dodo
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      showNotification('success', 'Payment initiated! Your subscription will be activated shortly.');
      // Clean URL
      window.history.replaceState({}, '', '/billing');
    }
  }, [searchParams]);

  // Indian plans (Razorpay)
  const indianPlanData = {
    INR: [
      {
        id: 'free-trial',
        name: 'Free Trial',
        price: 0,
        period: '30 days',
        description: '30 days free, no credit card required',
        popular: false,
        features: [
          'AI Agent (Voice/Chat)',
          'Unlimited menu items',
          'Unlimited restaurant locations',
          'Complete POS system',
          'Unlimited tables & floors',
          'Real-time kitchen display',
          'Staff management',
          'Analytics & reports',
          'Inventory management',
          'Email support',
          'Full access for 30 days'
        ]
      },
      {
        id: 'spark-monthly',
        name: 'Spark',
        price: 300,
        period: 'month',
        description: 'Everything you need to run your restaurant',
        popular: true,
        features: [
          'AI Agent (Voice/Chat)',
          'Unlimited menu items',
          'Unlimited restaurant locations',
          'Complete POS system',
          'Unlimited tables & floors',
          'Real-time kitchen display',
          'Staff management',
          'Analytics & reports',
          'Inventory management',
          'Customer loyalty programs',
          'Priority support'
        ]
      },
      {
        id: 'spark-yearly',
        name: 'Spark Yearly',
        price: 2500,
        period: 'year',
        description: 'Save ₹1,100 with annual billing',
        popular: false,
        savings: '₹1,100',
        features: [
          'AI Agent (Voice/Chat)',
          'Unlimited menu items',
          'Unlimited restaurant locations',
          'Complete POS system',
          'Unlimited tables & floors',
          'Real-time kitchen display',
          'Staff management',
          'Analytics & reports',
          'Inventory management',
          'Customer loyalty programs',
          'Priority support',
          '2 months free!'
        ]
      }
    ]
  };

  // International plans (Dodo Payments) - USD only
  const internationalPlanData = {
    USD: [
      {
        id: 'free-trial',
        name: 'Free Trial',
        price: 0,
        period: '30 days',
        description: 'Try everything free',
        popular: false,
        features: [
          'AI Agent (Voice/Chat)',
          'Unlimited menu items',
          '1 restaurant location',
          'Complete POS system',
          'Up to 20 tables',
          'Kitchen display',
          'Basic analytics',
          'Email support'
        ]
      },
      {
        id: 'spark',
        name: 'Spark',
        price: 9.99,
        period: 'month',
        productId: process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_SPARK || 'pdt_0NYkVJEF5ywGL040N55IY',
        description: 'For growing restaurants',
        popular: true,
        features: [
          'AI Agent (Voice/Chat)',
          'Unlimited menu items',
          'Up to 3 locations',
          'Complete POS system',
          'Unlimited tables',
          'Real-time kitchen display',
          'Staff management',
          'Advanced analytics',
          'Inventory management',
          'Priority support'
        ]
      },
      {
        id: 'blaze',
        name: 'Blaze',
        price: 89,
        period: 'month',
        productId: process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_BLAZE || 'pdt_0NYkVvCPauMPQSMaIzqTS',
        description: 'For restaurant chains',
        popular: false,
        features: [
          'AI Agent (Voice/Chat): 5,000 credits',
          'Everything in Spark',
          'Unlimited locations',
          'Chain dashboard',
          'Cross-location analytics',
          'Centralized menu management',
          'Bulk staff management',
          'API access',
          'Custom integrations',
          '24/7 phone support'
        ]
      }
    ]
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);

          // Check if user is owner/admin - only they can access billing
          if (parsedUser.role !== 'owner' && parsedUser.role !== 'admin') {
            showNotification('error', 'Access denied. Only owners can access billing.');
            router.push('/dashboard');
            return;
          }

          setUser(parsedUser);

          // Fetch subscription data from backend (only for owners/admins)
          if (parsedUser.uid || parsedUser.id) {
            try {
              const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
              showNotification('info', 'Loading billing information...');

              // First try to get existing subscription
              console.log('Fetching subscription for user:', parsedUser.uid || parsedUser.id);
              const response = await fetch(`${API_BASE_URL}/api/payments/subscription/${parsedUser.uid || parsedUser.id}`);

              if (response.ok) {
                const data = await response.json();
                if (data.success && data.subscription) {
                  const sub = data.subscription;
                  // Use trial info from backend
                  const isTrial = sub.isTrial || sub.planId === 'free-trial' || sub.planName === 'Free Trial' || sub.amount === 0;
                  const planName = isTrial ? 'Free Trial' : (sub.planName || 'Free Trial');

                  setCurrentSubscription({
                    plan: planName,
                    planId: sub.planId || 'free-trial',
                    status: sub.status || 'active',
                    nextBillingDate: sub.endDate || null,
                    lastPaymentDate: sub.startDate || null,
                    trialStartDate: sub.trialStartDate || sub.startDate || null,
                    trialEndDate: sub.trialEndDate || null,
                    amount: isTrial ? 0 : (sub.amount || 0),
                    currency: sub.currency || 'USD',
                    paymentGateway: sub.paymentGateway || 'dodo',
                    isTrial
                  });

                  // Use trial info from backend (already calculated)
                  if (isTrial) {
                    setTrialInfo({
                      daysLeft: sub.trialDaysRemaining ?? sub.daysRemaining ?? calculateTrialDays(sub.trialStartDate || sub.startDate).daysLeft,
                      isExpired: sub.trialIsExpired ?? false
                    });
                  }
                  showNotification('success', 'Billing information loaded!');
                } else {
                  throw new Error('No subscription data');
                }
              } else if (response.status === 404) {
                // User doesn't exist in billing DB - create them once
                console.log('User not found in billing DB, creating new billing user');
                showNotification('info', 'Setting up your billing account...');

                const createUserResponse = await fetch(`${API_BASE_URL}/api/payments/create-user`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId: parsedUser.uid || parsedUser.id,
                    email: parsedUser.email || parsedUser.phoneNumber || '',
                    phone: parsedUser.phoneNumber || parsedUser.phone || '',
                    role: parsedUser.role,
                    planId: 'free-trial',
                    restaurantInfo: {
                      name: parsedUser.restaurantName || 'My Restaurant',
                      id: parsedUser.restaurantId || null
                    }
                  })
                });

                if (createUserResponse.ok) {
                  const createResult = await createUserResponse.json();
                  console.log('New billing user created:', createResult);

                  if (createResult.success && createResult.data.subscription) {
                    const sub = createResult.data.subscription;
                    setCurrentSubscription({
                      plan: 'Free Trial',
                      planId: sub.planId || 'free-trial',
                      status: sub.status || 'active',
                      nextBillingDate: sub.endDate || null,
                      lastPaymentDate: sub.startDate || null,
                      trialStartDate: sub.trialStartDate || sub.startDate || new Date().toISOString(),
                      trialEndDate: sub.trialEndDate || null,
                      amount: 0,
                      currency: 'USD',
                      paymentGateway: 'dodo',
                      isTrial: true
                    });
                    // Use trial days from backend or default to 30
                    setTrialInfo({
                      daysLeft: sub.trialDays || 30,
                      isExpired: false
                    });
                    showNotification('success', 'Free trial started! You have 30 days to explore DineOpen.');
                  }
                } else {
                  throw new Error('Failed to create billing user');
                }
              } else {
                throw new Error('Failed to fetch subscription');
              }
            } catch (error) {
              console.error('Error loading billing information:', error);
              showNotification('error', 'Error loading billing information');
              setCurrentSubscription({
                plan: 'Free Trial',
                status: 'active',
                nextBillingDate: null,
                lastPaymentDate: null,
                trialStartDate: new Date().toISOString(),
                amount: 0,
                currency: 'USD',
                paymentGateway: 'dodo'
              });
              setTrialInfo({ daysLeft: 30, isExpired: false });
            }
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Listen for restaurant changes from navigation
  useEffect(() => {
    const handleRestaurantChange = (event) => {
      console.log('Billing page: Restaurant changed', event.detail);
      showNotification('info', 'Restaurant context updated. Billing remains user-specific.');
    };

    window.addEventListener('restaurantChanged', handleRestaurantChange);

    return () => {
      window.removeEventListener('restaurantChanged', handleRestaurantChange);
    };
  }, []);

  const formatCurrency = (amount, curr = currency) => {
    if (curr === 'INR') {
      return `₹${amount.toLocaleString()}`;
    } else if (curr === 'GBP') {
      return `£${amount}`;
    } else {
      return `$${amount}`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'NA') return 'NA';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle Dodo Payments checkout (international)
  const handleDodoPayment = async (plan) => {
    try {
      setPaymentProcessing(true);

      if (!user) {
        showNotification('error', 'User data not available');
        return;
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
      const userEmail = user.email || user.phoneNumber || user.phone || `user-${user.uid || user.id}@example.com`;
      const userName = user.displayName || user.name || userEmail;

      console.log('Dodo Payment - Creating checkout for:', { plan: plan.name, productId: plan.productId, email: userEmail });

      const response = await fetch(`${API_BASE_URL}/api/dodo-payments/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: plan.productId,
          planId: plan.id,
          userId: user.uid || user.id,
          email: userEmail,
          name: userName,
          returnUrl: `${window.location.origin}/billing?payment=success`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        // Redirect to Dodo hosted checkout
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (error) {
      console.error('Dodo payment error:', error);
      showNotification('error', 'Payment initialization failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Handle Razorpay payment (Indian)
  const handleRazorpayPayment = async (plan) => {
    try {
      setPaymentProcessing(true);

      if (!user) {
        showNotification('error', 'User data not available');
        return;
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

      // If free-trial plan, just update subscription without payment
      if (plan.id === 'free-trial' || plan.price === 0) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/payments/update-subscription`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.uid || user.id,
              email: user.email || user.phoneNumber || user.phone || '',
              planId: 'free-trial'
            })
          });

          const data = await response.json();

          if (data.success) {
            showNotification('success', 'Free Trial plan activated successfully!');
            setCurrentSubscription({
              plan: 'Free Trial',
              status: 'active',
              nextBillingDate: null,
              lastPaymentDate: new Date().toISOString(),
              amount: 0,
              currency: currency,
              paymentGateway: 'razorpay'
            });
            setTimeout(() => window.location.reload(), 2000);
          } else {
            showNotification('error', 'Failed to activate Free Trial plan');
          }
        } catch (error) {
          console.error('Free trial activation error:', error);
          showNotification('error', 'Failed to activate Free Trial plan');
        } finally {
          setPaymentProcessing(false);
        }
        return;
      }

      // For paid plans, proceed with Razorpay payment
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      const userEmail = user.email || user.phoneNumber || user.phone || `user-${user.uid || user.id}@example.com`;
      const userPhone = user.phoneNumber || user.phone || '';

      const paymentData = {
        planId: plan.id,
        amount: plan.price,
        currency: 'INR',
        email: userEmail,
        userId: user.uid || user.id,
        phone: userPhone
      };

      if (!paymentData.amount || !paymentData.planId || !paymentData.email || !paymentData.userId) {
        showNotification('error', 'Missing payment information. Please try again.');
        return;
      }

      const orderResponse = await fetch(`${API_BASE_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await orderResponse.json();

      const options = {
        key: 'rzp_live_lMZVjvewP7tKIL',
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'DineOpen',
        description: `${plan.name} Subscription - DineOpen`,
        order_id: orderData.order.id,
        prefill: {
          name: user.displayName || '',
          email: user.email || user.phoneNumber || '',
          contact: user.phoneNumber || ''
        },
        theme: {
          color: '#ef4444'
        },
        handler: function (response) {
          verifyPayment({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            planId: plan.id,
            userId: user.uid || user.id
          });
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        showNotification('error', 'Payment failed. Please try again.');
      });
      razorpay.open();

    } catch (error) {
      console.error('Payment initialization error:', error);
      showNotification('error', 'Payment initialization failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Unified payment handler - based on selected currency
  const handlePayment = async (plan) => {
    if (currency === 'INR') {
      await handleRazorpayPayment(plan);
    } else {
      await handleDodoPayment(plan);
    }
  };

  const verifyPayment = async (paymentData) => {
    try {
      setPaymentProcessing(true);

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

      const response = await fetch(`${API_BASE_URL}/api/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();

      if (data.success) {
        showNotification('success', 'Payment successful! Your plan has been upgraded.');

        const plan = currentPlans.find(p => p.id === paymentData.planId);
        setCurrentSubscription({
          plan: plan?.name || 'Professional',
          status: 'active',
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastPaymentDate: new Date().toISOString(),
          amount: plan?.price || 2499,
          currency: currency,
          paymentGateway: 'razorpay'
        });

        setTimeout(() => window.location.reload(), 2000);
      } else {
        showNotification('error', 'Payment verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      showNotification('error', 'Payment verification failed');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Determine which plans to show based on currency
  const currentPlans = (() => {
    if (currency === 'INR') {
      return indianPlanData.INR;
    }
    return internationalPlanData.USD;
  })();

  // Available currencies - USD default, INR for Indian users
  const availableCurrencies = ['USD', 'INR'];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh'
        }}>
          <FaSpinner className="animate-spin" size={32} color="#ef4444" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>

      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          backgroundColor: notification.type === 'success' ? '#10b981' : notification.type === 'info' ? '#3b82f6' : '#ef4444',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaCheckCircle size={16} />
            {notification.message}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {paymentProcessing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <FaSpinner className="animate-spin" size={32} color="#ef4444" />
            <p style={{ marginTop: '16px', color: '#374151' }}>Processing payment...</p>
          </div>
        </div>
      )}

      <div style={{ width: '100%', padding: '16px 20px' }}>

        {/* Trial Banner */}
        {(currentSubscription?.plan === 'Free Trial' || currentSubscription?.plan?.includes('Trial')) && (
          <div style={{
            backgroundColor: trialInfo.isExpired ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${trialInfo.isExpired ? '#fecaca' : '#bbf7d0'}`,
            borderRadius: '12px',
            padding: '12px 20px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {trialInfo.isExpired ? (
                <FaExclamationTriangle size={20} color="#dc2626" />
              ) : (
                <FaClock size={20} color="#16a34a" />
              )}
              <div>
                <span style={{
                  fontWeight: '600',
                  color: trialInfo.isExpired ? '#dc2626' : '#166534',
                  fontSize: '15px'
                }}>
                  {trialInfo.isExpired
                    ? 'Your free trial has expired!'
                    : `${trialInfo.daysLeft} days left in your free trial`}
                </span>
                <span style={{ color: '#6b7280', fontSize: '13px', marginLeft: '8px' }}>
                  {trialInfo.isExpired
                    ? 'Please select a plan to continue using DineOpen'
                    : '(30 day trial)'}
                </span>
              </div>
            </div>
            {!trialInfo.isExpired && (
              <div style={{
                backgroundColor: '#dcfce7',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#166534'
              }}>
                {Math.round((trialInfo.daysLeft / 30) * 100)}% remaining
              </div>
            )}
          </div>
        )}

        {/* Current Plan Banner */}
        {(() => {
          // Determine display plan name
          const displayPlan = currentSubscription?.plan || 'Free Trial';
          const isTrial = displayPlan === 'Free Trial' || currentSubscription?.amount === 0;
          const isBlaze = displayPlan.toLowerCase().includes('blaze');
          const isSpark = displayPlan.toLowerCase().includes('spark') && !isTrial;

          return (
            <div style={{
              backgroundColor: isTrial ? '#f0fdf4' : 'white',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              border: isTrial ? '1px solid #bbf7d0' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: isTrial ? '#dcfce7' : isBlaze ? '#fef3c7' : '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {isTrial ? (
                    <FaClock size={20} color="#16a34a" />
                  ) : isBlaze ? (
                    <FaFire size={20} color="#f59e0b" />
                  ) : (
                    <FaRocket size={20} color="#ef4444" />
                  )}
                </div>
                <div>
                  <div style={{
                    fontSize: '11px',
                    color: isTrial ? '#166534' : '#6b7280',
                    marginBottom: '2px',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {isTrial ? '🎉 Active Trial' : 'Current Plan'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: isTrial ? '#166534' : '#1f2937'
                    }}>
                      {isTrial ? 'Free Trial' : displayPlan}
                    </span>
                    {!isTrial && currentSubscription?.amount > 0 && (
                      <span style={{
                        fontSize: '14px',
                        color: '#ef4444',
                        fontWeight: '600'
                      }}>
                        {formatCurrency(currentSubscription.amount)}/{currentSubscription?.period || 'month'}
                      </span>
                    )}
                    {isTrial && (
                      <span style={{
                        backgroundColor: trialInfo.isExpired ? '#fecaca' : '#bbf7d0',
                        color: trialInfo.isExpired ? '#dc2626' : '#166534',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {trialInfo.isExpired ? (
                          <><FaExclamationTriangle size={10} /> Expired</>
                        ) : (
                          <><FaClock size={10} /> {trialInfo.daysLeft} days left</>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                Billing
              </h1>
            </div>
          );
        })()}

        {/* Currency Toggle - Centered */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'white',
            padding: '6px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            {availableCurrencies.map((curr) => {
              const currencyInfo = {
                USD: { symbol: '$', flag: '🌍', label: 'International' },
                INR: { symbol: '₹', flag: '🇮🇳', label: 'India' }
              };
              const info = currencyInfo[curr];
              const isActive = currency === curr;
              return (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isActive ? '#ef4444' : 'transparent',
                    color: isActive ? 'white' : '#6b7280',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{info.flag}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div>{curr} ({info.symbol})</div>
                    <div style={{ fontSize: '10px', opacity: 0.8 }}>{info.label}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Payment Method Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            backgroundColor: currency === 'INR' ? '#fef3c7' : '#dbeafe',
            borderRadius: '20px',
            fontSize: '12px',
            color: currency === 'INR' ? '#92400e' : '#1e40af',
            fontWeight: '500'
          }}>
            <FaCreditCard size={12} />
            <span>{currency === 'INR' ? 'Razorpay' : 'Dodo Payments'}</span>
            <span style={{ opacity: 0.7, fontSize: '11px' }}>
              {currency === 'USD' ? '• Cards, PayPal' : '• UPI, Cards, Netbanking'}
            </span>
          </div>
        </div>

        {/* Plans Grid */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          overflow: 'visible'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            Choose Your Plan
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : `repeat(${currentPlans.length}, 1fr)`,
            gap: '16px'
          }}>
            {currentPlans.map((plan) => {
              // Check if this is the current plan (handle various naming)
              const currentPlanName = currentSubscription?.plan?.toLowerCase() || '';
              const currentPlanId = currentSubscription?.planId?.toLowerCase() || '';
              const planNameLower = plan.name.toLowerCase();
              const planIdLower = plan.id.toLowerCase();

              const isCurrentPlan =
                // Direct name match
                currentSubscription?.plan === plan.name ||
                // Free Trial variations (Starter, free-trial, Free Trial, etc.)
                ((currentPlanName === 'free trial' || currentPlanName === 'starter' ||
                  currentPlanId === 'free-trial' || currentPlanId === 'starter' ||
                  currentSubscription?.amount === 0) && planIdLower.includes('free')) ||
                // Spark variations
                (currentPlanName.includes('spark') && planNameLower === 'spark') ||
                // Blaze variations
                (currentPlanName.includes('blaze') && planNameLower === 'blaze');

              const isPopular = plan.popular && !isCurrentPlan;

              return (
                <div
                  key={plan.id}
                  style={{
                    position: 'relative',
                    padding: '20px 16px',
                    border: isCurrentPlan ? '2px solid #10b981' : isPopular ? '2px solid #ef4444' : '1px solid #e5e7eb',
                    borderRadius: '12px',
                    backgroundColor: isCurrentPlan ? '#f0fdf4' : 'white',
                    transition: 'all 0.2s',
                    boxShadow: isCurrentPlan ? '0 4px 12px rgba(16, 185, 129, 0.15)' : 'none'
                  }}
                >
                  {/* Current Plan Badge - Always show for current */}
                  {isCurrentPlan && (
                    <div style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#10b981',
                      color: 'white',
                      padding: '4px 14px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <FaCheckCircle size={10} /> Your Plan
                    </div>
                  )}
                  {/* Popular Badge - Only if not current */}
                  {isPopular && (
                    <div style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap'
                    }}>
                      Popular
                    </div>
                  )}

                  {/* Plan Header */}
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: isCurrentPlan ? '#166534' : '#1f2937', margin: '0 0 8px 0' }}>
                      {plan.name}
                    </h3>
                    {plan.price === 0 ? (
                      <div>
                        <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a' }}>Free</span>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {isCurrentPlan ? `${trialInfo.daysLeft} days remaining` : 'for 30 days'}
                        </div>
                        {isCurrentPlan && (
                          <div style={{
                            marginTop: '8px',
                            height: '6px',
                            backgroundColor: '#e5e7eb',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              height: '100%',
                              width: `${Math.round((trialInfo.daysLeft / 30) * 100)}%`,
                              backgroundColor: '#10b981',
                              borderRadius: '3px',
                              transition: 'width 0.3s'
                            }} />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
                          {formatCurrency(plan.price)}
                        </span>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>/{plan.period}</span>
                        {plan.savings && (
                          <div style={{
                            marginTop: '4px',
                            backgroundColor: '#dcfce7',
                            color: '#166534',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: '600',
                            display: 'inline-block'
                          }}>
                            Save {plan.savings}
                          </div>
                        )}
                      </div>
                    )}
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '8px 0 0 0' }}>{plan.description}</p>
                  </div>

                  {/* Top Action Button */}
                  <button
                    onClick={() => !isCurrentPlan && handlePayment(plan)}
                    disabled={isCurrentPlan || paymentProcessing}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: isCurrentPlan ? '2px solid #10b981' : 'none',
                      backgroundColor: isCurrentPlan ? '#dcfce7' : isPopular ? '#ef4444' : '#f3f4f6',
                      color: isCurrentPlan ? '#166534' : isPopular ? 'white' : '#ef4444',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: isCurrentPlan ? 'default' : 'pointer',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    {isCurrentPlan ? (
                      plan.price === 0 ? (
                        <><FaCheckCircle size={12} /> Currently Active</>
                      ) : (
                        <><FaCheckCircle size={12} /> Your Plan</>
                      )
                    ) : plan.price === 0 ? (
                      <><FaRocket size={12} /> Start Free Trial</>
                    ) : (
                      <><FaCreditCard size={12} /> Subscribe - {currency === 'INR' ? 'Razorpay' : 'Dodo'}</>
                    )}
                  </button>

                  {/* Features */}
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {plan.features.slice(0, 6).map((feature, idx) => (
                      <li key={idx} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        padding: '4px 0',
                        fontSize: '12px',
                        color: '#4b5563'
                      }}>
                        <FaCheck size={10} color="#10b981" style={{ marginTop: '3px', flexShrink: 0 }} />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 6 && (
                      <li style={{ fontSize: '11px', color: '#9ca3af', paddingTop: '4px' }}>
                        +{plan.features.length - 6} more features
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Benefits - Compact */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginTop: '20px'
        }}>
          {[
            { icon: FaShieldAlt, text: '99.9% Uptime', color: '#10b981' },
            { icon: FaHeadset, text: '24/7 Support', color: '#3b82f6' },
            { icon: FaMobile, text: 'Mobile Ready', color: '#8b5cf6' },
            { icon: FaFire, text: 'AI Powered', color: '#ef4444' }
          ].map((item, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'white',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '500',
              color: '#374151'
            }}>
              <item.icon size={14} color={item.color} />
              {item.text}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Wrap in Suspense for useSearchParams
export default function BillingPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh'
        }}>
          <FaSpinner className="animate-spin" size={32} color="#ef4444" />
        </div>
      </div>
    }>
      <BillingContent />
    </Suspense>
  );
}
