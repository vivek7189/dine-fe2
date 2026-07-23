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
  FaFire,
  FaTimes,
  FaHistory
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
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [pendingPlan, setPendingPlan] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [billingHistory, setBillingHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
  const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY || 'rzp_live_lMZVjvewP7tKIL';

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
    // Electron is always a desktop POS terminal — never use mobile layout
    if (typeof window !== 'undefined' && window.electronAPI) {
      setIsMobile(false);
      return;
    }
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    setCurrency('USD');

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check for payment return from Dodo
  useEffect(() => {
    const subscriptionId = searchParams.get('subscription_id');
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('payment');

    if (subscriptionId && user) {
      // Verify session with backend
      verifyDodoSession(subscriptionId, status);
      // Clean URL
      window.history.replaceState({}, '', '/billing');
    } else if (paymentStatus === 'success') {
      showNotification('success', 'Payment initiated! Your subscription will be activated shortly.');
      window.history.replaceState({}, '', '/billing');
    }
  }, [searchParams, user]);

  // Verify Dodo session after redirect
  const verifyDodoSession = async (subscriptionId, status) => {
    try {
      const userId = user?.uid || user?.id;
      if (!userId) return;

      const response = await fetch(
        `${API_BASE_URL}/api/dodo-payments/verify-session?subscription_id=${subscriptionId}&status=${status || ''}&userId=${userId}`
      );

      const data = await response.json();

      if (data.success && data.status === 'active') {
        showNotification('success', data.message || 'Subscription activated!');
        // Reload to get fresh data
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showNotification('info', 'Payment processing... Your plan will update shortly.');
        // Try sync as fallback
        setTimeout(() => syncSubscription(userId), 3000);
      }
    } catch (error) {
      console.error('Verify session error:', error);
      showNotification('info', 'Verifying payment... Please wait.');
    }
  };

  // Sync subscription (restore purchase)
  const syncSubscription = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dodo-payments/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();
      if (data.success && data.synced) {
        showNotification('success', data.message || 'Subscription restored!');
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  };

  // Sync with Razorpay API — recover missed payments
  const syncRazorpayPayments = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/sync-razorpay/${userId}`);
      const data = await response.json();

      if (data.success && data.synced && data.subscription) {
        console.log('Razorpay sync recovered payment:', data.payment);
        showNotification('success', 'Payment recovered! Your plan has been activated.');

        const sub = data.subscription;
        const subPlanId = (sub.planId || '').toLowerCase();
        const isTrialPlan = subPlanId === 'free-trial' || subPlanId === 'starter' || subPlanId === 'free';

        setCurrentSubscription({
          plan: isTrialPlan ? 'Free Trial' : (sub.planName || sub.planId || 'Unknown Plan'),
          planId: sub.planId || 'free-trial',
          status: sub.status || 'active',
          nextBillingDate: sub.endDate || null,
          lastPaymentDate: sub.startDate || null,
          trialStartDate: sub.trialStartDate || sub.startDate || null,
          trialEndDate: sub.trialEndDate || null,
          amount: isTrialPlan ? 0 : (sub.amount || 0),
          currency: sub.currency || 'INR',
          paymentGateway: sub.paymentGateway || 'razorpay',
          isTrial: isTrialPlan,
          cancelledAt: sub.cancelledAt || null,
          daysRemaining: null, // Will be recalculated on next load
        });

        if (!isTrialPlan) {
          setTrialInfo({ daysLeft: 0, isExpired: false, startDate: null });
        }
      }
    } catch (error) {
      console.error('Razorpay sync error (non-critical):', error);
      // Silent fail — this is a background recovery mechanism
    }
  };

  // Indian plans (Razorpay) — monthly & yearly variants
  const indianPlanData = {
    INR: {
      monthly: [
        {
          id: 'free-trial',
          name: 'Free Trial',
          price: 0,
          period: '30 days',
          description: '7 days free, no credit card required',
          popular: false,
          features: [
            'AI Agent (Voice/Chat)',
            'Unlimited menu items',
            '1 restaurant location',
            'Complete POS system',
            'Unlimited tables & floors',
            'Real-time kitchen display',
            'Staff management',
            'Basic analytics',
            'Email support',
            'Full access for 30 days'
          ]
        },
        {
          id: 'starter-monthly',
          name: 'Starter',
          price: 299,
          period: 'month',
          description: 'For new restaurants & cafes',
          popular: false,
          features: [
            'AI Agent (Voice/Chat)',
            'Unlimited menu items',
            '1 restaurant location',
            'Complete POS system',
            'Unlimited tables & floors',
            'Real-time kitchen display',
            '3 staff accounts',
            'Analytics & reports',
            'Inventory management',
            'Email support'
          ]
        },
        {
          id: 'growth-monthly',
          name: 'Growth',
          price: 899,
          period: 'month',
          description: 'For busy restaurants',
          popular: true,
          features: [
            'Everything in Starter',
            'Up to 5 locations',
            '10 staff accounts',
            'Advanced analytics',
            'Priority support',
            'Customer loyalty programs',
            'Multi-store management',
            'Data backup'
          ]
        },
        {
          id: 'pro-monthly',
          name: 'Pro',
          price: 1799,
          period: 'month',
          description: 'For restaurant chains',
          popular: false,
          features: [
            'Everything in Growth',
            'Unlimited locations',
            'Unlimited staff accounts',
            'API access',
            'Custom integrations',
            'Dedicated support',
            'White-label options',
            'Advanced AI features'
          ]
        }
      ],
      yearly: [
        {
          id: 'free-trial',
          name: 'Free Trial',
          price: 0,
          period: '30 days',
          description: '7 days free, no credit card required',
          popular: false,
          features: [
            'AI Agent (Voice/Chat)',
            'Unlimited menu items',
            '1 restaurant location',
            'Complete POS system',
            'Unlimited tables & floors',
            'Real-time kitchen display',
            'Staff management',
            'Basic analytics',
            'Email support',
            'Full access for 30 days'
          ]
        },
        {
          id: 'starter-yearly',
          name: 'Starter',
          price: 3000,
          period: 'year',
          monthlyEquivalent: 250,
          description: 'Save ₹588/year',
          popular: false,
          savings: '₹588',
          features: [
            'AI Agent (Voice/Chat)',
            'Unlimited menu items',
            '1 restaurant location',
            'Complete POS system',
            'Unlimited tables & floors',
            'Real-time kitchen display',
            '3 staff accounts',
            'Analytics & reports',
            'Inventory management',
            'Email support'
          ]
        },
        {
          id: 'growth-yearly',
          name: 'Growth',
          price: 8988,
          period: 'year',
          monthlyEquivalent: 749,
          description: 'Save ₹1,800/year',
          popular: true,
          savings: '₹1,800',
          features: [
            'Everything in Starter',
            'Up to 5 locations',
            '10 staff accounts',
            'Advanced analytics',
            'Priority support',
            'Customer loyalty programs',
            'Multi-store management',
            'Data backup'
          ]
        },
        {
          id: 'pro-yearly',
          name: 'Pro',
          price: 17988,
          period: 'year',
          monthlyEquivalent: 1499,
          description: 'Save ₹3,600/year',
          popular: false,
          savings: '₹3,600',
          features: [
            'Everything in Growth',
            'Unlimited locations',
            'Unlimited staff accounts',
            'API access',
            'Custom integrations',
            'Dedicated support',
            'White-label options',
            'Advanced AI features'
          ]
        }
      ]
    }
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
        productId: process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_BLAZE || process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_FLAME || 'pdt_0NYkVvCPauMPQSMaIzqTS',
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

          // Check if user is owner/admin
          if (parsedUser.role !== 'owner' && parsedUser.role !== 'admin') {
            showNotification('error', 'Access denied. Only owners can access billing.');
            router.push('/dashboard');
            return;
          }

          setUser(parsedUser);

          // Fetch subscription data from backend
          if (parsedUser.uid || parsedUser.id) {
            try {
              showNotification('info', 'Loading billing information...');
              const userId = parsedUser.uid || parsedUser.id;

              console.log('Fetching subscription for user:', userId);
              const response = await fetch(`${API_BASE_URL}/api/payments/subscription/${userId}`);

              if (response.ok) {
                const data = await response.json();
                if (data.success && data.subscription) {
                  const sub = data.subscription;
                  const subPlanId = (sub.planId || '').toLowerCase();
                  const isTrial = subPlanId === 'free-trial' || subPlanId === 'starter' || subPlanId === 'free' || sub.isTrial;
                  const planName = isTrial ? 'Free Trial' : (sub.planName || sub.planId || 'Unknown Plan');

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
                    dodoSubscriptionId: sub.dodoSubscriptionId || null,
                    isTrial,
                    cancelledAt: sub.cancelledAt || null,
                    daysRemaining: sub.daysRemaining ?? null,
                  });

                  if (isTrial) {
                    setTrialInfo({
                      daysLeft: sub.trialDaysRemaining ?? sub.daysRemaining ?? calculateTrialDays(sub.trialStartDate || sub.startDate).daysLeft,
                      isExpired: sub.trialIsExpired ?? false
                    });

                    // Auto-sync for free/trial users with Dodo
                    syncSubscription(userId);

                    // Also try Razorpay sync — recover any missed payments
                    syncRazorpayPayments(userId);
                  }
                  showNotification('success', 'Billing information loaded!');
                } else {
                  throw new Error('No subscription data');
                }
              } else if (response.status === 404) {
                // User doesn't exist in billing DB - create them
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
              showNotification('error', 'Error loading billing information. Please refresh the page.');
              // Don't set fake trial data — leave as null so UI shows loading/error state
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

  // Listen for restaurant changes
  useEffect(() => {
    const handleRestaurantChange = (event) => {
      console.log('Billing page: Restaurant changed', event.detail);
      showNotification('info', 'Restaurant context updated. Billing remains user-specific.');
    };

    window.addEventListener('restaurantChanged', handleRestaurantChange);
    return () => window.removeEventListener('restaurantChanged', handleRestaurantChange);
  }, []);

  const formatCurrency = (amount, curr = currency) => {
    if (curr === 'INR') return `\u20B9${amount.toLocaleString()}`;
    if (curr === 'GBP') return `\u00A3${amount}`;
    return `$${amount}`;
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'NA') return 'NA';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (error) {
      return dateString;
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const isValidEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  // ── Handle Dodo Payments checkout (international) ──
  const handleDodoPayment = async (plan) => {
    if (!user) {
      showNotification('error', 'User data not available');
      return;
    }

    if (!isValidEmail(user.email)) {
      setPendingPlan(plan);
      setEmailInput('');
      setShowEmailModal(true);
      return;
    }

    await proceedWithDodoPayment(plan, user.email);
  };

  const proceedWithDodoPayment = async (plan, email) => {
    try {
      setPaymentProcessing(true);
      setShowEmailModal(false);

      const userName = user.displayName || user.name || 'Customer';

      console.log('Dodo Payment - Creating checkout for:', { plan: plan.name, productId: plan.productId, email });

      const response = await fetch(`${API_BASE_URL}/api/dodo-payments/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: plan.productId,
          planId: plan.id,
          userId: user.uid || user.id,
          email: email,
          name: userName,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (error) {
      console.error('Dodo payment error:', error);
      showNotification('error', error.message || 'Payment initialization failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleEmailSubmit = () => {
    if (pendingPlan) {
      const emailToUse = isValidEmail(emailInput)
        ? emailInput.trim()
        : `${user.uid || user.id}@customers.dineopen.app`;
      proceedWithDodoPayment(pendingPlan, emailToUse);
    }
  };

  const handleSkipEmail = () => {
    if (pendingPlan) {
      const generatedEmail = `${user.uid || user.id}@customers.dineopen.app`;
      proceedWithDodoPayment(pendingPlan, generatedEmail);
    }
  };

  // ── Handle Razorpay payment (Indian) — now uses Subscriptions API ──
  const handleRazorpayPayment = async (plan) => {
    try {
      setPaymentProcessing(true);

      if (!user) {
        showNotification('error', 'User data not available');
        return;
      }

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

      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve) => { script.onload = resolve; });
      }

      const userEmail = user.email || user.phoneNumber || user.phone || `user-${user.uid || user.id}@example.com`;
      const userPhone = user.phoneNumber || user.phone || '';

      // Create Razorpay subscription via backend
      const subResponse = await fetch(`${API_BASE_URL}/api/payments/create-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          email: userEmail,
          userId: user.uid || user.id,
          phone: userPhone
        })
      });

      if (!subResponse.ok) {
        const errorData = await subResponse.json();
        throw new Error(errorData.error || 'Failed to create subscription');
      }

      const subData = await subResponse.json();

      const options = {
        key: RAZORPAY_KEY,
        subscription_id: subData.subscription.id,
        name: 'DineOpen',
        description: `${plan.name} Plan - DineOpen (${plan.period === 'year' ? 'Annual' : 'Monthly'})`,
        prefill: {
          name: user.displayName || '',
          email: userEmail,
          contact: userPhone
        },
        theme: { color: '#ef4444' },
        handler: function (response) {
          verifyPayment({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_signature: response.razorpay_signature,
            planId: plan.id,
            userId: user.uid || user.id
          });
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        showNotification('error', 'Payment failed. Please try again.');
        fetch(`${API_BASE_URL}/api/payments/report-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'failed',
            planId: plan.id,
            amount: plan.price,
            currency: 'INR',
            userId: user.uid || user.id,
            email: userEmail,
            phone: userPhone,
            gateway: 'Razorpay',
            orderId: subData.subscription.id,
            reason: response?.error?.description || response?.error?.reason || 'Payment failed on Razorpay'
          })
        }).catch(() => {});
      });
      razorpay.open();

    } catch (error) {
      console.error('Payment initialization error:', error);
      showNotification('error', 'Payment initialization failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

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

      const response = await fetch(`${API_BASE_URL}/api/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();

      if (data.success) {
        showNotification('success', 'Payment successful! Your plan has been upgraded.');
        // Immediately update subscription state so UI reflects the new plan
        const userId = user?.uid || user?.id;
        if (userId) {
          try {
            const subRes = await fetch(`${API_BASE_URL}/api/payments/subscription/${userId}`);
            const subData = await subRes.json();
            if (subData.success && subData.subscription) {
              const sub = subData.subscription;
              const subPlanId = (sub.planId || '').toLowerCase();
              const isTrialPlan = subPlanId === 'free-trial' || subPlanId === 'starter' || subPlanId === 'free';
              setCurrentSubscription({
                plan: isTrialPlan ? 'Free Trial' : (sub.planName || sub.planId || 'Unknown Plan'),
                planId: sub.planId || 'free-trial',
                status: sub.status || 'active',
                nextBillingDate: sub.endDate || null,
                lastPaymentDate: sub.startDate || null,
                trialStartDate: sub.trialStartDate || sub.startDate || null,
                trialEndDate: sub.trialEndDate || null,
                amount: isTrialPlan ? 0 : (sub.amount || 0),
                currency: sub.currency || 'INR',
                paymentGateway: sub.paymentGateway || 'razorpay',
                isTrial: isTrialPlan,
                cancelledAt: sub.cancelledAt || null,
                daysRemaining: sub.daysRemaining ?? null,
              });
              if (isTrialPlan) {
                setTrialInfo({
                  daysLeft: sub.trialDaysRemaining ?? sub.daysRemaining ?? calculateTrialDays(sub.trialStartDate || sub.startDate).daysLeft,
                  isExpired: sub.trialIsExpired ?? false,
                });
              } else {
                setTrialInfo({ daysLeft: 0, isExpired: false, startDate: null });
              }
            }
          } catch (e) {
            // Fallback to reload if subscription fetch fails
            setTimeout(() => window.location.reload(), 2000);
          }
        }
      } else {
        console.error('Payment verification failed:', data);
        showNotification('error', data.error || 'Payment verification failed. Please contact support if money was deducted.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      showNotification('error', 'Payment verification failed. Please contact support if money was deducted.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // ── Cancel Subscription ──
  const handleCancelSubscription = async () => {
    try {
      setCancelling(true);
      const userId = user?.uid || user?.id;

      // Cancel on Dodo if it's a Dodo subscription
      if (currentSubscription?.paymentGateway === 'dodo') {
        const response = await fetch(`${API_BASE_URL}/api/dodo-payments/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });

        const data = await response.json();
        if (data.success) {
          showNotification('success', data.message || 'Subscription cancelled.');
          setShowCancelModal(false);
          setTimeout(() => window.location.reload(), 2000);
        } else {
          showNotification('error', data.error || 'Failed to cancel subscription');
        }
      } else {
        // For Razorpay, cancel subscription properly
        const response = await fetch(`${API_BASE_URL}/api/payments/cancel-subscription`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });

        const data = await response.json();
        if (data.success) {
          showNotification('success', data.message || 'Subscription cancelled.');
          setShowCancelModal(false);
          setTimeout(() => window.location.reload(), 2000);
        } else {
          showNotification('error', data.error || 'Failed to cancel subscription');
        }
      }
    } catch (error) {
      console.error('Cancel error:', error);
      showNotification('error', 'Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  // ── Billing History ──
  const loadBillingHistory = async () => {
    try {
      const userId = user?.uid || user?.id;
      if (!userId) return;

      // Load from both Razorpay and Dodo
      const [razorpayRes, dodoRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/api/payments/history/${userId}`),
        fetch(`${API_BASE_URL}/api/dodo-payments/billing-history/${userId}`),
      ]);

      const history = [];

      if (razorpayRes.status === 'fulfilled' && razorpayRes.value.ok) {
        const data = await razorpayRes.value.json();
        if (data.success && data.data) {
          data.data.forEach(p => history.push({ ...p, gateway: 'Razorpay' }));
        }
      }

      if (dodoRes.status === 'fulfilled' && dodoRes.value.ok) {
        const data = await dodoRes.value.json();
        if (data.success && data.history) {
          data.history.forEach(p => history.push({ ...p, gateway: 'Dodo' }));
        }
      }

      // Sort by date
      history.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));

      setBillingHistory(history);
      setShowHistory(true);
    } catch (error) {
      console.error('Error loading billing history:', error);
      showNotification('error', 'Failed to load billing history');
    }
  };

  const currentPlans = (() => {
    if (currency === 'INR') return indianPlanData.INR[billingCycle] || indianPlanData.INR.monthly;
    return internationalPlanData.USD;
  })();

  const availableCurrencies = ['USD', 'INR'];

  // Is current subscription a paid plan?
  const isPaidPlan = currentSubscription &&
    currentSubscription.planId !== 'free-trial' && currentSubscription.planId !== 'free' &&
    currentSubscription.planId !== 'starter' &&
    currentSubscription.status === 'active';

  // Helper: does current subscription match this plan?
  const checkIsCurrentPlan = (plan) => {
    if (!currentSubscription) return false;
    const subPlanId = (currentSubscription.planId || '').toLowerCase();
    const planId = plan.id.toLowerCase();
    const subCurrency = (currentSubscription.currency || 'USD').toUpperCase();

    // Free trial match: show on both tabs
    if (planId === 'free-trial') {
      return subPlanId === 'free-trial' || subPlanId === 'starter' || subPlanId === 'free';
    }

    // INR plans should only match on INR tab, USD on USD tab
    const isINRPlan = planId.includes('monthly') || planId.includes('yearly') || planId === 'spark-monthly' || planId === 'spark-yearly';
    const isUSDPlan = planId === 'spark' || planId === 'blaze';
    if (isINRPlan && currency !== 'INR') return false;
    if (isUSDPlan && currency !== 'USD') return false;

    // Direct planId match
    if (subPlanId === planId) return true;

    // Match base plan name (e.g., starter-monthly matches starter-yearly and vice versa)
    const subBase = subPlanId.replace('-monthly', '').replace('-yearly', '');
    const planBase = planId.replace('-monthly', '').replace('-yearly', '');
    if (subBase === planBase && subBase !== 'free') return true;

    // Legacy matches
    if (planId === 'spark' && subPlanId === 'spark' && subCurrency === 'USD') return true;
    if (planId === 'blaze' && (subPlanId === 'blaze' || subPlanId === 'flame')) return true;

    return false;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
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
          position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
          backgroundColor: notification.type === 'success' ? '#10b981' : notification.type === 'info' ? '#3b82f6' : '#ef4444',
          color: 'white', padding: '12px 20px', borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)', animation: 'slideIn 0.3s ease-out'
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
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 10002
        }}>
          <div style={{
            backgroundColor: 'white', padding: '32px', borderRadius: '16px',
            textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <FaSpinner className="animate-spin" size={32} color="#ef4444" />
            <p style={{ marginTop: '16px', color: '#374151' }}>Processing...</p>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9998, padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white', padding: '28px', borderRadius: '16px',
            maxWidth: '420px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 16px'
              }}>
                <FaExclamationTriangle size={24} color="#ef4444" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>
                Cancel Subscription?
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>
                {currentSubscription?.nextBillingDate
                  ? `You'll keep access until ${formatDate(currentSubscription.nextBillingDate)}, then downgrade to free.`
                  : 'Your subscription will be cancelled and you\'ll be downgraded to free.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowCancelModal(false)}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px',
                  border: '2px solid #e5e7eb', backgroundColor: 'white',
                  color: '#6b7280', fontWeight: '600', fontSize: '14px', cursor: 'pointer'
                }}
              >
                Keep Plan
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px',
                  border: 'none', backgroundColor: '#ef4444',
                  color: 'white', fontWeight: '600', fontSize: '14px',
                  cursor: cancelling ? 'not-allowed' : 'pointer',
                  opacity: cancelling ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                {cancelling ? <><FaSpinner className="animate-spin" size={14} /> Cancelling...</> : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Collection Modal */}
      {showEmailModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9998, padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white', padding: '28px', borderRadius: '16px',
            maxWidth: '420px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            position: 'relative'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 16px'
              }}>
                <FaCreditCard size={24} color="#f59e0b" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>
                Add Your Email
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>
                Enter your email to receive payment receipts and subscription updates
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="your@email.com"
                style={{
                  width: '100%', padding: '14px 16px', border: '2px solid #e5e7eb',
                  borderRadius: '10px', fontSize: '16px', outline: 'none',
                  transition: 'border-color 0.2s', boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                autoFocus
              />
              {emailInput && !isValidEmail(emailInput) && (
                <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '6px' }}>
                  Please enter a valid email address
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleSkipEmail} style={{
                flex: 1, padding: '12px', borderRadius: '10px', border: '2px solid #e5e7eb',
                backgroundColor: 'white', color: '#6b7280', fontWeight: '600', fontSize: '14px', cursor: 'pointer'
              }}>
                Skip
              </button>
              <button
                onClick={handleEmailSubmit}
                disabled={emailInput && !isValidEmail(emailInput)}
                style={{
                  flex: 2, padding: '12px', borderRadius: '10px', border: 'none',
                  backgroundColor: isValidEmail(emailInput) ? '#ef4444' : '#fca5a5',
                  color: 'white', fontWeight: '600', fontSize: '14px',
                  cursor: isValidEmail(emailInput) ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                <FaCreditCard size={14} />
                Continue to Pay
              </button>
            </div>

            <button
              onClick={() => { setShowEmailModal(false); setPendingPlan(null); }}
              style={{
                position: 'absolute', top: '12px', right: '12px', background: 'none',
                border: 'none', fontSize: '20px', color: '#9ca3af', cursor: 'pointer', padding: '4px'
              }}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Billing History Modal */}
      {showHistory && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9998, padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white', padding: '24px', borderRadius: '16px',
            maxWidth: '520px', width: '100%', maxHeight: '80vh', overflow: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)', position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                Billing History
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', color: '#9ca3af', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            {billingHistory.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>No billing history yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {billingHistory.slice(0, 20).map((item, idx) => (
                  <div key={idx} style={{
                    padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
                        {(item.type || 'payment').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>
                        {formatDate(item.createdAt || item.date)} &middot; {item.gateway}
                        {item.planId ? ` \u00B7 ${item.planId}` : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {item.amount ? (
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
                          {formatCurrency(item.amount, item.currency || 'USD')}
                        </div>
                      ) : null}
                      <div style={{
                        fontSize: '10px', fontWeight: '600',
                        color: item.status === 'paid' || item.status === 'completed' || item.status === 'verified' ? '#10b981' : '#f59e0b'
                      }}>
                        {item.status || '-'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ width: '100%', padding: '16px 20px' }}>

        {/* Trial Banner — only for actual trial plans */}
        {(currentSubscription?.planId === 'free-trial' || currentSubscription?.planId === 'starter' || currentSubscription?.planId === 'free') && (
          <div style={{
            backgroundColor: trialInfo.isExpired ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${trialInfo.isExpired ? '#fecaca' : '#bbf7d0'}`,
            borderRadius: '12px', padding: '12px 20px', marginBottom: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '12px'
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
                    : '(7 day trial)'}
                </span>
              </div>
            </div>
            {!trialInfo.isExpired && (
              <div style={{
                backgroundColor: '#dcfce7', padding: '4px 12px', borderRadius: '20px',
                fontSize: '12px', fontWeight: '600', color: '#166534'
              }}>
                {Math.round((trialInfo.daysLeft / 30) * 100)}% remaining
              </div>
            )}
          </div>
        )}

        {/* Current Plan Banner */}
        {(() => {
          const subPlanId = (currentSubscription?.planId || 'free-trial').toLowerCase();
          const isTrial = subPlanId === 'free-trial' || subPlanId === 'starter' || subPlanId === 'free';
          const displayPlan = isTrial ? 'Free Trial' : (currentSubscription?.plan || currentSubscription?.planName || subPlanId);
          const isBlaze = subPlanId.includes('blaze') || subPlanId.includes('flame');
          const isSpark = subPlanId.includes('spark');
          const isCancelled = currentSubscription?.cancelledAt || currentSubscription?.status === 'cancelled';
          const isExpired = currentSubscription?.status === 'expired';

          return (
            <div style={{
              backgroundColor: isTrial ? '#f0fdf4' : 'white',
              borderRadius: '12px', padding: '16px 20px', marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              border: isTrial ? '1px solid #bbf7d0' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  backgroundColor: isTrial ? '#dcfce7' : isBlaze ? '#fef3c7' : '#fee2e2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {isTrial ? <FaClock size={20} color="#16a34a" /> :
                    isBlaze ? <FaFire size={20} color="#f59e0b" /> :
                      <FaRocket size={20} color="#ef4444" />}
                </div>
                <div>
                  <div style={{
                    fontSize: '11px', color: isTrial ? '#166534' : isExpired ? '#dc2626' : '#6b7280',
                    marginBottom: '2px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px'
                  }}>
                    {isTrial ? (trialInfo.isExpired ? 'Trial Expired' : 'Active Trial') : isCancelled ? 'Cancelled' : isExpired ? 'Expired' : 'Current Plan'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '20px', fontWeight: '700', color: isTrial ? '#166534' : '#1f2937' }}>
                      {isTrial ? 'Free Trial' : displayPlan}
                    </span>
                    {!isTrial && currentSubscription?.amount > 0 && (
                      <span style={{ fontSize: '14px', color: '#ef4444', fontWeight: '600' }}>
                        {formatCurrency(currentSubscription.amount, currentSubscription.currency || 'USD')}/{currentSubscription?.period || 'month'}
                      </span>
                    )}
                    {isCancelled && (
                      <span style={{
                        backgroundColor: '#fecaca', color: '#dc2626', padding: '4px 10px',
                        borderRadius: '12px', fontSize: '12px', fontWeight: '600'
                      }}>
                        Cancelled
                      </span>
                    )}
                    {isExpired && !isTrial && !isCancelled && (
                      <span style={{
                        backgroundColor: '#fecaca', color: '#dc2626', padding: '4px 10px',
                        borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                        display: 'flex', alignItems: 'center', gap: '4px'
                      }}>
                        <FaExclamationTriangle size={10} /> Expired — Please renew
                      </span>
                    )}
                    {!isTrial && currentSubscription?.nextBillingDate && !isCancelled && !isExpired && (
                      <>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                          Renews {formatDate(currentSubscription.nextBillingDate)}
                        </span>
                        {currentSubscription?.daysRemaining != null && currentSubscription.daysRemaining <= 7 && (
                          <span style={{
                            backgroundColor: currentSubscription.daysRemaining <= 3 ? '#ffedd5' : '#fef3c7',
                            color: currentSubscription.daysRemaining <= 3 ? '#ea580c' : '#92400e',
                            padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                            display: 'flex', alignItems: 'center', gap: '4px'
                          }}>
                            <FaClock size={10} /> {currentSubscription.daysRemaining} day{currentSubscription.daysRemaining !== 1 ? 's' : ''} left
                          </span>
                        )}
                      </>
                    )}
                    {isTrial && (
                      <span style={{
                        backgroundColor: trialInfo.isExpired ? '#fecaca' : '#bbf7d0',
                        color: trialInfo.isExpired ? '#dc2626' : '#166534',
                        padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                        display: 'flex', alignItems: 'center', gap: '4px'
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Billing History Button */}
                <button
                  onClick={loadBillingHistory}
                  style={{
                    padding: '8px 14px', borderRadius: '8px', border: '1px solid #e5e7eb',
                    backgroundColor: 'white', color: '#6b7280', fontWeight: '500',
                    fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <FaHistory size={12} /> History
                </button>
                {/* Cancel Button — only for paid active plans */}
                {isPaidPlan && !isCancelled && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    style={{
                      padding: '8px 14px', borderRadius: '8px', border: '1px solid #fecaca',
                      backgroundColor: '#fef2f2', color: '#dc2626', fontWeight: '500',
                      fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    <FaTimes size={12} /> Cancel Plan
                  </button>
                )}
                <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  Billing
                </h1>
              </div>
            </div>
          );
        })()}

        {/* Currency Toggle - Centered */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '12px', marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            backgroundColor: 'white', padding: '6px', borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            {availableCurrencies.map((curr) => {
              const currencyInfo = {
                USD: { symbol: '$', flag: '\uD83C\uDF0D', label: 'International' },
                INR: { symbol: '\u20B9', flag: '\uD83C\uDDEE\uD83C\uDDF3', label: 'India' }
              };
              const info = currencyInfo[curr];
              const isActive = currency === curr;
              return (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  style={{
                    padding: '10px 24px', borderRadius: '8px', border: 'none',
                    backgroundColor: isActive ? '#ef4444' : 'transparent',
                    color: isActive ? 'white' : '#6b7280', fontWeight: '600',
                    fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: '8px'
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

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px',
            backgroundColor: currency === 'INR' ? '#fef3c7' : '#dbeafe',
            borderRadius: '20px', fontSize: '12px',
            color: currency === 'INR' ? '#92400e' : '#1e40af', fontWeight: '500'
          }}>
            <FaCreditCard size={12} />
            <span>{currency === 'INR' ? 'Razorpay' : 'Dodo Payments'}</span>
            <span style={{ opacity: 0.7, fontSize: '11px' }}>
              {currency === 'USD' ? '\u00B7 Cards, PayPal' : '\u00B7 UPI, Cards, Netbanking'}
            </span>
          </div>

          {/* Monthly / Yearly toggle — only for INR */}
          {currency === 'INR' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              backgroundColor: '#f3f4f6', padding: '4px', borderRadius: '10px'
            }}>
              {['monthly', 'yearly'].map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => setBillingCycle(cycle)}
                  style={{
                    padding: '8px 20px', borderRadius: '8px', border: 'none',
                    backgroundColor: billingCycle === cycle ? '#1f2937' : 'transparent',
                    color: billingCycle === cycle ? 'white' : '#6b7280',
                    fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  {cycle === 'monthly' ? 'Monthly' : 'Yearly'}
                  {cycle === 'yearly' && (
                    <span style={{
                      backgroundColor: billingCycle === 'yearly' ? '#10b981' : '#dcfce7',
                      color: billingCycle === 'yearly' ? 'white' : '#166534',
                      padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '700'
                    }}>
                      Save 17%
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Paid Plan Renewal / Expiration Banner */}
        {(() => {
          if (!currentSubscription || currentSubscription.isTrial) return null;
          const subPlanId = (currentSubscription.planId || '').toLowerCase();
          if (subPlanId === 'free-trial' || subPlanId === 'starter' || subPlanId === 'free') return null;

          const days = currentSubscription.daysRemaining;
          const isExpiredPlan = currentSubscription.status === 'expired' || days === 0;
          const planDisplayName = currentSubscription.plan || currentSubscription.planId;
          const renewDate = currentSubscription.nextBillingDate ? formatDate(currentSubscription.nextBillingDate) : '';

          // Find matching plan from currentPlans for the Renew Now button
          const matchingPlan = currentPlans.find(p => checkIsCurrentPlan(p) && p.price > 0);

          if (isExpiredPlan) {
            return (
              <div style={{
                backgroundColor: '#fef2f2', border: '2px solid #fecaca',
                borderRadius: '12px', padding: '16px 20px', marginBottom: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <FaExclamationTriangle size={18} color="#dc2626" />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', color: '#dc2626', fontSize: '15px' }}>
                      Your {planDisplayName} plan has expired!
                    </div>
                    <div style={{ fontSize: '13px', color: '#991b1b' }}>
                      Renew now to keep using all features.
                    </div>
                  </div>
                </div>
                {matchingPlan && (
                  <button
                    onClick={() => handlePayment(matchingPlan)}
                    disabled={paymentProcessing}
                    style={{
                      padding: '10px 24px', borderRadius: '10px', border: 'none',
                      backgroundColor: '#dc2626', color: 'white', fontWeight: '700',
                      fontSize: '14px', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', gap: '8px', whiteSpace: 'nowrap'
                    }}
                  >
                    <FaCreditCard size={14} /> Renew Now
                  </button>
                )}
              </div>
            );
          }

          if (days != null && days <= 3) {
            return (
              <div style={{
                backgroundColor: '#fff7ed', border: '2px solid #fed7aa',
                borderRadius: '12px', padding: '14px 20px', marginBottom: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: '12px',
                animation: 'urgentPulse 2s ease-in-out infinite'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    backgroundColor: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <FaExclamationTriangle size={16} color="#ea580c" />
                  </div>
                  <div>
                    <span style={{ fontWeight: '700', color: '#ea580c', fontSize: '14px' }}>
                      Your {planDisplayName} renews in {days} day{days !== 1 ? 's' : ''}
                    </span>
                    <span style={{ color: '#9a3412', fontSize: '13px', marginLeft: '6px' }}>
                      — Payment due soon!
                    </span>
                  </div>
                </div>
                <div style={{
                  backgroundColor: '#ea580c', color: 'white', padding: '4px 14px',
                  borderRadius: '20px', fontSize: '12px', fontWeight: '700'
                }}>
                  {days} day{days !== 1 ? 's' : ''} left
                </div>
              </div>
            );
          }

          if (days != null && days <= 7) {
            return (
              <div style={{
                backgroundColor: '#fffbeb', border: '1px solid #fde68a',
                borderRadius: '12px', padding: '14px 20px', marginBottom: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FaClock size={18} color="#d97706" />
                  <span style={{ fontWeight: '600', color: '#92400e', fontSize: '14px' }}>
                    Your {planDisplayName} renews in {days} days{renewDate ? ` on ${renewDate}` : ''}
                  </span>
                </div>
                <div style={{
                  backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 14px',
                  borderRadius: '20px', fontSize: '12px', fontWeight: '600'
                }}>
                  {days} days left
                </div>
              </div>
            );
          }

          return null;
        })()}

        {/* Plans Grid */}
        <div style={{
          backgroundColor: 'white', borderRadius: '12px', padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'visible'
        }}>
          <h2 style={{
            fontSize: '18px', fontWeight: '600', color: '#1f2937',
            textAlign: 'center', marginBottom: '20px'
          }}>
            Choose Your Plan
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : `repeat(${currentPlans.length}, 1fr)`,
            gap: '16px'
          }}>
            {currentPlans.map((plan) => {
              const isCurrentPlan = checkIsCurrentPlan(plan);
              const isPopular = plan.popular && !isCurrentPlan;

              // Check if current paid plan is expired (allow renewal)
              const isPaidExpired = isCurrentPlan && currentSubscription?.status === 'expired' && plan.price > 0;

              // Determine button text for upgrade/downgrade
              let buttonText = '';
              if (isCurrentPlan && isPaidExpired) {
                buttonText = `Renew — ${currency === 'INR' ? 'Razorpay' : 'Dodo'}`;
              } else if (isCurrentPlan) {
                buttonText = plan.price === 0 ? 'Currently Active' : 'Your Plan';
              } else if (plan.price === 0) {
                buttonText = 'Start Free Trial';
              } else if (isPaidPlan && plan.price > 0) {
                // If current plan price > this plan price, it's a downgrade
                const currentAmount = currentSubscription?.amount || 0;
                if (currentAmount > plan.price) {
                  buttonText = `Downgrade to ${plan.name}`;
                } else {
                  buttonText = `Upgrade to ${plan.name}`;
                }
              } else {
                buttonText = `Subscribe - ${currency === 'INR' ? 'Razorpay' : 'Dodo'}`;
              }

              return (
                <div
                  key={plan.id}
                  style={{
                    position: 'relative', padding: '20px 16px',
                    border: isCurrentPlan ? '2px solid #10b981' : isPopular ? '2px solid #ef4444' : '1px solid #e5e7eb',
                    borderRadius: '12px',
                    backgroundColor: isCurrentPlan ? '#f0fdf4' : 'white',
                    transition: 'all 0.2s',
                    boxShadow: isCurrentPlan ? '0 4px 12px rgba(16, 185, 129, 0.15)' : 'none'
                  }}
                >
                  {isCurrentPlan && (
                    <div style={{
                      position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                      backgroundColor: '#10b981', color: 'white', padding: '4px 14px',
                      borderRadius: '12px', fontSize: '10px', fontWeight: '700',
                      textTransform: 'uppercase', whiteSpace: 'nowrap',
                      display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      <FaCheckCircle size={10} /> Your Plan
                    </div>
                  )}
                  {isPopular && (
                    <div style={{
                      position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                      backgroundColor: '#ef4444', color: 'white', padding: '4px 12px',
                      borderRadius: '12px', fontSize: '10px', fontWeight: '600',
                      textTransform: 'uppercase', whiteSpace: 'nowrap'
                    }}>
                      Popular
                    </div>
                  )}

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
                            marginTop: '8px', height: '6px', backgroundColor: '#e5e7eb',
                            borderRadius: '3px', overflow: 'hidden'
                          }}>
                            <div style={{
                              height: '100%', width: `${Math.round((trialInfo.daysLeft / 30) * 100)}%`,
                              backgroundColor: '#10b981', borderRadius: '3px', transition: 'width 0.3s'
                            }} />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        {plan.monthlyEquivalent ? (
                          <>
                            <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
                              {formatCurrency(plan.monthlyEquivalent)}
                            </span>
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>/mo</span>
                            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                              Billed {formatCurrency(plan.price)}/{plan.period}
                            </div>
                          </>
                        ) : (
                          <>
                            <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
                              {formatCurrency(plan.price)}
                            </span>
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>/{plan.period}</span>
                          </>
                        )}
                        {plan.savings && (
                          <div style={{
                            marginTop: '4px', backgroundColor: '#dcfce7', color: '#166534',
                            padding: '2px 8px', borderRadius: '10px', fontSize: '11px',
                            fontWeight: '600', display: 'inline-block'
                          }}>
                            Save {plan.savings}
                          </div>
                        )}
                      </div>
                    )}
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '8px 0 0 0' }}>{plan.description}</p>
                  </div>

                  <button
                    onClick={() => (!isCurrentPlan || isPaidExpired) && handlePayment(plan)}
                    disabled={(isCurrentPlan && !isPaidExpired) || paymentProcessing}
                    style={{
                      width: '100%', padding: '10px', borderRadius: '8px',
                      border: isCurrentPlan && !isPaidExpired ? '2px solid #10b981' : 'none',
                      backgroundColor: isPaidExpired ? '#dc2626' : isCurrentPlan ? '#dcfce7' : isPopular ? '#ef4444' : '#f3f4f6',
                      color: isPaidExpired ? 'white' : isCurrentPlan ? '#166534' : isPopular ? 'white' : '#ef4444',
                      fontWeight: '600', fontSize: '13px',
                      cursor: isCurrentPlan && !isPaidExpired ? 'default' : 'pointer', marginBottom: '16px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}
                  >
                    {isPaidExpired ? (
                      <><FaCreditCard size={12} /> {buttonText}</>
                    ) : isCurrentPlan ? (
                      <><FaCheckCircle size={12} /> {buttonText}</>
                    ) : plan.price === 0 ? (
                      <><FaRocket size={12} /> {buttonText}</>
                    ) : (
                      <><FaCreditCard size={12} /> {buttonText}</>
                    )}
                  </button>

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {plan.features.slice(0, 6).map((feature, idx) => (
                      <li key={idx} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '8px',
                        padding: '4px 0', fontSize: '12px', color: '#4b5563'
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

        {/* Quick Benefits */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px', marginTop: '20px'
        }}>
          {[
            { icon: FaShieldAlt, text: '99.9% Uptime', color: '#10b981' },
            { icon: FaHeadset, text: '24/7 Support', color: '#3b82f6' },
            { icon: FaMobile, text: 'Mobile Ready', color: '#8b5cf6' },
            { icon: FaFire, text: 'AI Powered', color: '#ef4444' }
          ].map((item, idx) => (
            <div key={idx} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              backgroundColor: 'white', padding: '10px 14px', borderRadius: '8px',
              fontSize: '12px', fontWeight: '500', color: '#374151'
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
        @keyframes urgentPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(234, 88, 12, 0.15); }
          50% { box-shadow: 0 0 0 6px rgba(234, 88, 12, 0.08); }
        }
      `}</style>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <FaSpinner className="animate-spin" size={32} color="#ef4444" />
        </div>
      </div>
    }>
      <BillingContent />
    </Suspense>
  );
}
