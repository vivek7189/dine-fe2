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
  FaExchangeAlt,
  FaGlobe
} from 'react-icons/fa';

// Detect if user is in India based on timezone
function detectUserRegion() {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (timezone.includes('Calcutta') || timezone.includes('Kolkata')) {
      return 'IN';
    }
    if (timezone.includes('London')) {
      return 'GB';
    }
    return 'OTHER';
  } catch {
    return 'OTHER';
  }
}

function getDefaultCurrency(region) {
  switch (region) {
    case 'IN': return 'INR';
    case 'GB': return 'GBP';
    default: return 'USD';
  }
}

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [userRegion, setUserRegion] = useState('OTHER');
  const [currency, setCurrency] = useState('USD');
  const [notification, setNotification] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const isIndianUser = userRegion === 'IN';

  // Detect mobile screen size and user region
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Detect region and set default currency
    const region = detectUserRegion();
    setUserRegion(region);
    setCurrency(getDefaultCurrency(region));

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

  // Indian plans (Razorpay) - existing plans
  const indianPlanData = {
    INR: [
      {
        id: 'free-trial',
        name: 'Free Trial',
        price: 0,
        period: 'month',
        description: 'Perfect for trying out DineOpen',
        popular: false,
        features: [
          'AI Agent (Voice/Chat): 50 credits/month',
          'Up to 200 menu items',
          '1 restaurant location',
          'Basic POS system',
          'Table management (up to 100 tables)',
          'Kitchen order tracking',
          'Mobile app access',
          'Email support'
        ]
      },
      {
        id: 'pay-as-you-go',
        name: 'Pay as You Go',
        price: 300,
        period: 'one-time',
        description: 'Perfect for variable order volumes',
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
          'Email & chat support',
          '1,000 orders free/month',
          '₹150 per 500 orders after free limit'
        ]
      },
      {
        id: 'monthly-fixed',
        name: 'Monthly Fixed',
        price: 600,
        period: 'month',
        description: 'Best for consistent order volumes',
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
          'Customer loyalty programs',
          'Email & chat support'
        ]
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 4999,
        period: 'month',
        description: 'For restaurant chains and large operations',
        popular: false,
        features: [
          'AI Agent (Voice/Chat): 2,000 credits/month',
          'Everything in Professional',
          'Unlimited locations',
          'Multi-restaurant dashboard',
          'Advanced analytics',
          'Inventory management',
          'Customer loyalty programs',
          'API access',
          '24/7 phone support',
          'Custom integrations'
        ]
      }
    ]
  };

  // International plans (Dodo Payments)
  const internationalPlanData = {
    USD: [
      {
        id: 'spark',
        name: 'Spark',
        price: 9.99,
        period: 'month',
        productId: process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_SPARK || 'pdt_0NYkVJEF5ywGL040N55IY',
        description: 'Perfect for small restaurants & cafes',
        popular: true,
        features: [
          'AI Agent (Voice/Chat)',
          'QR Code Digital Menu',
          'POS Billing System',
          'Up to 10 Tables',
          'Basic Inventory',
          'GST/Tax Billing',
          'Staff management',
          'Analytics & reports',
          'Email support'
        ]
      },
      {
        id: 'flame',
        name: 'Flame',
        price: 89,
        period: 'month',
        productId: process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_FLAME || 'pdt_0NYkVvCPauMPQSMaIzqTS',
        description: 'For growing & multi-location restaurants',
        popular: false,
        features: [
          'AI Agent (Voice/Chat): 2,000 credits/month',
          'Everything in Spark',
          'Unlimited Tables',
          'Unlimited locations',
          'Multi-restaurant dashboard',
          'Advanced Analytics',
          'Multi-location Support',
          'Priority 24/7 Support',
          'API Access',
          'Custom Integrations',
          'Inventory management',
          'Customer loyalty programs'
        ]
      }
    ],
    GBP: [
      {
        id: 'spark',
        name: 'Spark',
        price: 7.99,
        period: 'month',
        productId: process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_SPARK || 'pdt_0NYkVJEF5ywGL040N55IY',
        description: 'Perfect for small restaurants & cafes',
        popular: true,
        features: [
          'AI Agent (Voice/Chat)',
          'QR Code Digital Menu',
          'POS Billing System',
          'Up to 10 Tables',
          'Basic Inventory',
          'GST/Tax Billing',
          'Staff management',
          'Analytics & reports',
          'Email support'
        ]
      },
      {
        id: 'flame',
        name: 'Flame',
        price: 69,
        period: 'month',
        productId: process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_FLAME || 'pdt_0NYkVvCPauMPQSMaIzqTS',
        description: 'For growing & multi-location restaurants',
        popular: false,
        features: [
          'AI Agent (Voice/Chat): 2,000 credits/month',
          'Everything in Spark',
          'Unlimited Tables',
          'Unlimited locations',
          'Multi-restaurant dashboard',
          'Advanced Analytics',
          'Multi-location Support',
          'Priority 24/7 Support',
          'API Access',
          'Custom Integrations',
          'Inventory management',
          'Customer loyalty programs'
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
                  setCurrentSubscription({
                    plan: data.subscription.planName || 'Starter',
                    status: data.subscription.status || 'active',
                    nextBillingDate: data.subscription.endDate || null,
                    lastPaymentDate: data.subscription.startDate || null,
                    amount: 999,
                    currency: 'INR',
                    paymentGateway: data.subscription.paymentGateway || 'razorpay'
                  });
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
                    setCurrentSubscription({
                      plan: createResult.data.subscription.planName || 'Starter',
                      status: createResult.data.subscription.status || 'active',
                      nextBillingDate: createResult.data.subscription.endDate || null,
                      lastPaymentDate: createResult.data.subscription.startDate || null,
                      amount: 999,
                      currency: 'INR',
                      paymentGateway: 'razorpay'
                    });
                    showNotification('success', 'Billing account created successfully!');
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
                plan: 'Starter',
                status: 'active',
                nextBillingDate: null,
                lastPaymentDate: null,
                amount: 999,
                currency: 'INR',
                paymentGateway: 'razorpay'
              });
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

  // Unified payment handler
  const handlePayment = async (plan) => {
    if (isIndianUser || currency === 'INR') {
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

  // Determine which plans to show based on region and currency
  const currentPlans = (() => {
    if (isIndianUser || currency === 'INR') {
      return indianPlanData.INR;
    }
    return internationalPlanData[currency] || internationalPlanData.USD;
  })();

  // Available currencies based on region
  const availableCurrencies = isIndianUser
    ? ['INR', 'USD', 'GBP']
    : ['USD', 'GBP', 'INR'];

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

      <div style={{ width: '100%', padding: '32px 20px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Billing & Subscription
          </h1>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>
            Manage your subscription and billing information
          </p>
          {/* Region indicator */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '8px',
            padding: '4px 12px',
            backgroundColor: '#f3f4f6',
            borderRadius: '20px',
            fontSize: '13px',
            color: '#6b7280'
          }}>
            <FaGlobe size={12} />
            {isIndianUser ? 'India - Razorpay' : 'International - Dodo Payments'}
          </div>
        </div>

        {/* Current Subscription Status */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <FaCreditCard size={24} color="#ef4444" />
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
              Current Subscription
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {/* Current Plan */}
            <div style={{
              padding: '20px',
              backgroundColor: '#fef7f0',
              borderRadius: '12px',
              border: '1px solid #fed7aa'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <FaCheckCircle size={16} color="#10b981" />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                  Current Plan
                </span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                {currentSubscription?.plan || 'Free Trial'}
              </h3>
              <p style={{ fontSize: '14px', color: '#ef4444', margin: '4px 0 0 0' }}>
                {currentSubscription?.amount === 0 ? 'Free' :
                 currentSubscription?.plan === 'Pay as You Go' ?
                   formatCurrency(currentSubscription?.amount || 300) + ' one-time' :
                   formatCurrency(currentSubscription?.amount || 600) + ' / month'}
              </p>
            </div>

            {/* Next Billing */}
            <div style={{
              padding: '20px',
              backgroundColor: '#f0f9ff',
              borderRadius: '12px',
              border: '1px solid #bae6fd'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <FaCalendarAlt size={16} color="#3b82f6" />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                  Next Billing
                </span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                {formatDate(currentSubscription?.nextBillingDate)}
              </h3>
            </div>

            {/* Last Payment */}
            <div style={{
              padding: '20px',
              backgroundColor: '#f0fdf4',
              borderRadius: '12px',
              border: '1px solid #bbf7d0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <FaCheckCircle size={16} color="#10b981" />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                  Last Payment
                </span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                {formatDate(currentSubscription?.lastPaymentDate)}
              </h3>
            </div>
          </div>
        </div>

        {/* Currency Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{
            backgroundColor: 'white',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            display: 'flex',
            gap: '4px'
          }}>
            {availableCurrencies.map((curr) => {
              const symbols = { USD: '$', GBP: '£', INR: '₹' };
              return (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: currency === curr ? '#ef4444' : 'transparent',
                    color: currency === curr ? 'white' : '#6b7280',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FaExchangeAlt size={12} />
                  {curr} ({symbols[curr]})
                </button>
              );
            })}
          </div>
        </div>

        {/* Subscription Plans */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '48px 32px 32px 32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'visible'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            Choose Your Plan
          </h2>

          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '24px',
            flexWrap: 'nowrap',
            overflowX: isMobile ? 'visible' : 'auto',
            overflowY: 'visible',
            justifyContent: isMobile ? 'stretch' : 'center',
            alignItems: isMobile ? 'stretch' : 'stretch',
            position: 'relative'
          }}>
            {currentPlans.map((plan) => {
              const isCurrentPlan = currentSubscription?.plan === plan.name;

              return (
                <div
                  key={plan.id}
                  style={{
                    position: 'relative',
                    padding: isMobile ? '32px 20px 24px 20px' : '40px 24px 32px 24px',
                    marginTop: (plan.popular || isCurrentPlan) ? '20px' : '0',
                    border: plan.popular ? '2px solid #ef4444' : '1px solid #e5e7eb',
                    borderRadius: '16px',
                    backgroundColor: isCurrentPlan ? '#fef7f0' : 'white',
                    boxShadow: plan.popular ? '0 8px 32px rgba(239, 68, 68, 0.15)' : '0 2px 8px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    minWidth: isMobile ? '100%' : '280px',
                    maxWidth: isMobile ? '100%' : '400px',
                    flex: isMobile ? 'none' : '1 1 0',
                    width: isMobile ? '100%' : 'auto',
                    overflow: 'visible'
                  }}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div style={{
                      position: 'absolute',
                      top: '-16px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '8px 20px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      zIndex: 10,
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                    }}>
                      Most Popular
                    </div>
                  )}

                  {/* Current Plan Badge */}
                  {isCurrentPlan && (
                    <div style={{
                      position: 'absolute',
                      top: '-16px',
                      right: '16px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      zIndex: 10,
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                    }}>
                      Current Plan
                    </div>
                  )}

                  {/* Plan Header */}
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h3 style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#1f2937',
                      margin: '0 0 8px 0'
                    }}>
                      {plan.name}
                    </h3>
                    <div style={{ marginBottom: '8px' }}>
                      {plan.price === 0 ? (
                        <span style={{
                          fontSize: '36px',
                          fontWeight: 'bold',
                          color: '#10b981'
                        }}>
                          Free
                        </span>
                      ) : (
                        <>
                          <span style={{
                            fontSize: '36px',
                            fontWeight: 'bold',
                            color: '#1f2937'
                          }}>
                            {formatCurrency(plan.price)}
                          </span>
                          <span style={{ color: '#6b7280', fontSize: '16px' }}>
                            {plan.period === 'one-time' ? ' one-time' : ` /${plan.period}`}
                          </span>
                        </>
                      )}
                    </div>
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                      {plan.description}
                    </p>
                  </div>

                  {/* Features List */}
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '0 0 24px 0'
                  }}>
                    {plan.features.map((feature, index) => {
                      const isAIFeature = feature.includes('AI Agent');
                      return (
                        <li key={index} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: isAIFeature ? '12px 14px' : '8px 0',
                          fontSize: '14px',
                          color: isAIFeature ? '#000000' : '#374151',
                          fontWeight: isAIFeature ? 'bold' : 'normal',
                          backgroundColor: isAIFeature ? '#f3f4f6' : 'transparent',
                          borderRadius: isAIFeature ? '8px' : '0',
                          marginBottom: isAIFeature ? '8px' : '0'
                        }}>
                          <FaCheck size={12} color={isAIFeature ? "#000000" : "#10b981"} />
                          {feature}
                        </li>
                      );
                    })}
                  </ul>

                  {/* Action Button */}
                  <button
                    onClick={() => !isCurrentPlan && handlePayment(plan)}
                    disabled={isCurrentPlan || paymentProcessing}
                    style={{
                      width: '100%',
                      padding: '14px 24px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: isCurrentPlan
                        ? '#d1d5db'
                        : plan.popular
                          ? '#ef4444'
                          : 'transparent',
                      color: isCurrentPlan
                        ? '#6b7280'
                        : plan.popular
                          ? 'white'
                          : '#ef4444',
                      border: !plan.popular && !isCurrentPlan ? '2px solid #ef4444' : 'none',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      cursor: isCurrentPlan ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {isCurrentPlan ? (
                      <>
                        <FaCheckCircle size={16} />
                        Current Plan
                      </>
                    ) : plan.price === 0 ? (
                      <>
                        Get Started Free
                      </>
                    ) : (
                      <>
                        <FaRocket size={16} />
                        Upgrade Now
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Why Choose DineOpen */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginTop: '32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            Why Choose DineOpen?
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                padding: '12px',
                backgroundColor: '#fef7f0',
                borderRadius: '12px',
                color: '#ef4444'
              }}>
                <FaMobile size={20} />
              </div>
              <div>
                <h4 style={{ fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>
                  Mobile First Design
                </h4>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  Optimized for smartphones and tablets with intuitive interface
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                padding: '12px',
                backgroundColor: '#f0fdf4',
                borderRadius: '12px',
                color: '#10b981'
              }}>
                <FaShieldAlt size={20} />
              </div>
              <div>
                <h4 style={{ fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>
                  Secure & Reliable
                </h4>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  Bank-level security with 99.9% uptime guarantee
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                padding: '12px',
                backgroundColor: '#f0f9ff',
                borderRadius: '12px',
                color: '#3b82f6'
              }}>
                <FaHeadset size={20} />
              </div>
              <div>
                <h4 style={{ fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>
                  24/7 Support
                </h4>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  Round-the-clock customer support to help your business
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                padding: '12px',
                backgroundColor: '#fdf4ff',
                borderRadius: '12px',
                color: '#8b5cf6'
              }}>
                <FaStar size={20} />
              </div>
              <div>
                <h4 style={{ fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>
                  Easy Integration
                </h4>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  Quick setup and seamless integration with existing systems
                </p>
              </div>
            </div>
          </div>
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
