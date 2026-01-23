'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaShieldAlt,
  FaCalendarAlt,
  FaBuilding,
  FaEdit,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import apiClient from '../../../lib/api';
import { auth } from '../../../../firebase';
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';

const Profile = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Email/Phone linking state
  const [linkingEmail, setLinkingEmail] = useState(false);
  const [linkingPhone, setLinkingPhone] = useState(false);
  const [linkEmail, setLinkEmail] = useState('');
  const [linkPhone, setLinkPhone] = useState('');
  const [linkPassword, setLinkPassword] = useState('');
  const [linkConfirmPassword, setLinkConfirmPassword] = useState('');
  const [linkOtp, setLinkOtp] = useState('');
  const [linkOtpSent, setLinkOtpSent] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState('');

  // Firebase phone auth state for linking
  const [phoneVerificationId, setPhoneVerificationId] = useState(null);
  const [isFirebasePhoneOTP, setIsFirebasePhoneOTP] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize reCAPTCHA for phone verification
  const setupRecaptcha = useCallback(() => {
    if (typeof window !== 'undefined' && !window.recaptchaVerifierProfile) {
      try {
        window.recaptchaVerifierProfile = new RecaptchaVerifier(auth, 'recaptcha-container-profile', {
          size: 'invisible',
          callback: () => {
            console.log('reCAPTCHA verified for profile phone linking');
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired');
            if (window.recaptchaVerifierProfile) {
              window.recaptchaVerifierProfile.clear();
              window.recaptchaVerifierProfile = null;
            }
          }
        });
        window.recaptchaVerifierProfile.render();
      } catch (error) {
        console.error('Error setting up reCAPTCHA:', error);
      }
    }
  }, []);

  // Setup recaptcha when phone linking starts
  useEffect(() => {
    if (linkingPhone && isClient) {
      setupRecaptcha();
    }
    return () => {
      // Cleanup recaptcha when unmounting or stopping phone linking
      if (window.recaptchaVerifierProfile && !linkingPhone) {
        try {
          window.recaptchaVerifierProfile.clear();
          window.recaptchaVerifierProfile = null;
        } catch (e) {
          console.log('Error clearing recaptcha:', e);
        }
      }
    };
  }, [linkingPhone, isClient, setupRecaptcha]);

  useEffect(() => {
    const loadUserData = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setEditedName(parsedUser.name || '');
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    if (isClient) {
      loadUserData();
    }
  }, [isClient, router]);

  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    if (user?.phone) {
      return user.phone.substring(user.phone.length - 2).toUpperCase();
    }
    return 'U';
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner': return '#ec4899';
      case 'manager': return '#8b5cf6';
      case 'waiter': return '#10b981';
      case 'employee': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'owner': return 'Owner';
      case 'manager': return 'Manager';
      case 'waiter': return 'Waiter';
      case 'employee': return 'Employee';
      default: return role || 'User';
    }
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      return;
    }

    setSaving(true);
    try {
      // Update in localStorage
      const updatedUser = { ...user, name: editedName.trim() };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditMode(false);
      
      // Optionally update on backend
      // await apiClient.updateUserProfile({ name: editedName.trim() });
    } catch (error) {
      console.error('Error saving name:', error);
    } finally {
      setSaving(false);
    }
  };

  // Link Email
  const handleSendEmailOtp = async (e) => {
    if (e) e.preventDefault();

    if (!linkEmail || !linkEmail.includes('@')) {
      setLinkError('Please enter a valid email address');
      return;
    }

    setLinkLoading(true);
    setLinkError('');
    try {
      // STAGING BRANCH: Hardcoded staging backend URL
      const backendUrl = 'https://dine-backend-git-staging-kapils-projects-bfc8fbae.vercel.app';
      const response = await fetch(`${backendUrl}/api/auth/email/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`
        },
        body: JSON.stringify({ email: linkEmail, purpose: 'linking' })
      });

      const data = await response.json();
      if (!response.ok) {
        // Check if email already exists
        if (data.error && data.error.includes('already registered')) {
          throw new Error('This email is already registered. Please use a different email or login with this email instead.');
        }
        throw new Error(data.error || 'Failed to send OTP');
      }

      setLinkOtpSent(true);
    } catch (err) {
      setLinkError(err.message || 'Failed to send OTP');
    } finally {
      setLinkLoading(false);
    }
  };

  const handleLinkEmail = async (e) => {
    e.preventDefault();
    if (!linkOtp || linkOtp.length !== 6) {
      setLinkError('Please enter a valid 6-digit OTP');
      return;
    }

    if (linkPassword && linkPassword !== linkConfirmPassword) {
      setLinkError('Passwords do not match');
      return;
    }

    setLinkLoading(true);
    setLinkError('');
    try {
      // STAGING BRANCH: Hardcoded staging backend URL
      const backendUrl = 'https://dine-backend-git-staging-kapils-projects-bfc8fbae.vercel.app';
      const response = await fetch(`${backendUrl}/api/user/link-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`
        },
        body: JSON.stringify({
          email: linkEmail,
          password: linkPassword || undefined,
          confirmPassword: linkConfirmPassword || undefined,
          otp: linkOtp
        })
      });

      const data = await response.json();
      if (!response.ok) {
        // Check if email already exists
        if (data.emailExists || (data.error && data.error.includes('already registered'))) {
          throw new Error('This email is already registered. Please use a different email or login with this email instead.');
        }
        throw new Error(data.error || 'Failed to link email');
      }

      // Update user in localStorage
      const updatedUser = { ...user, email: linkEmail, emailVerified: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      // Reset state
      setLinkingEmail(false);
      setLinkEmail('');
      setLinkPassword('');
      setLinkConfirmPassword('');
      setLinkOtp('');
      setLinkOtpSent(false);
    } catch (err) {
      setLinkError(err.message || 'Failed to link email');
    } finally {
      setLinkLoading(false);
    }
  };

  // Check if it's a test/dummy phone number
  const isDummyPhoneNumber = (phone) => {
    const normalizedPhone = phone.replace(/\D/g, '');
    // Test numbers: +919000000000 or similar test patterns
    return normalizedPhone.endsWith('9000000000') || normalizedPhone.endsWith('1234567890');
  };

  // Send Phone OTP for linking using Firebase
  const handleSendPhoneOtp = async (e) => {
    if (e) e.preventDefault();

    if (!linkPhone) {
      setLinkError('Please enter a phone number');
      return;
    }

    // Normalize phone (add + if missing)
    const normalizedPhone = linkPhone.startsWith('+') ? linkPhone : `+${linkPhone}`;

    setLinkLoading(true);
    setLinkError('');

    try {
      // Check if it's a dummy/test number - use backend OTP
      if (isDummyPhoneNumber(normalizedPhone)) {
        const backendUrl = 'https://dine-backend-git-staging-kapils-projects-bfc8fbae.vercel.app';
        const response = await fetch(`${backendUrl}/api/auth/phone/send-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ phone: normalizedPhone })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to send OTP');
        }

        setIsFirebasePhoneOTP(false);
        setLinkOtpSent(true);
        setLinkPhone(normalizedPhone);
      } else {
        // Use Firebase OTP for real numbers
        if (!window.recaptchaVerifierProfile) {
          setupRecaptcha();
          // Wait a bit for recaptcha to initialize
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        const appVerifier = window.recaptchaVerifierProfile;
        if (!appVerifier) {
          throw new Error('reCAPTCHA not initialized. Please refresh and try again.');
        }

        const confirmationResult = await signInWithPhoneNumber(auth, normalizedPhone, appVerifier);

        setPhoneVerificationId(confirmationResult);
        setIsFirebasePhoneOTP(true);
        setLinkOtpSent(true);
        setLinkPhone(normalizedPhone);
      }
    } catch (err) {
      console.error('Error sending phone OTP:', err);

      // Handle Firebase-specific errors
      if (err.code === 'auth/invalid-phone-number') {
        setLinkError('Invalid phone number format. Please include country code (e.g., +91)');
      } else if (err.code === 'auth/too-many-requests') {
        setLinkError('Too many attempts. Please try again later.');
      } else if (err.code === 'auth/quota-exceeded') {
        setLinkError('SMS quota exceeded. Please try again later.');
      } else {
        setLinkError(err.message || 'Failed to send OTP');
      }

      // Reset recaptcha on error
      if (window.recaptchaVerifierProfile) {
        try {
          window.recaptchaVerifierProfile.clear();
          window.recaptchaVerifierProfile = null;
        } catch (e) {
          console.log('Error clearing recaptcha:', e);
        }
      }
    } finally {
      setLinkLoading(false);
    }
  };

  // Link Phone with OTP verification
  const handleLinkPhone = async (e) => {
    e.preventDefault();
    if (!linkPhone) {
      setLinkError('Please enter a phone number');
      return;
    }

    const otpLength = isFirebasePhoneOTP ? 6 : 4;
    if (!linkOtp || linkOtp.length !== otpLength) {
      setLinkError(`Please enter a valid ${otpLength}-digit OTP`);
      return;
    }

    setLinkLoading(true);
    setLinkError('');

    try {
      let firebaseUid = null;

      if (isFirebasePhoneOTP) {
        // Verify Firebase OTP
        if (!phoneVerificationId) {
          throw new Error('Verification session expired. Please request a new OTP.');
        }

        const result = await phoneVerificationId.confirm(linkOtp);
        firebaseUid = result.user.uid;
        console.log('Firebase phone verified:', result.user.phoneNumber);
      }

      // Call backend to link phone
      const backendUrl = 'https://dine-backend-git-staging-kapils-projects-bfc8fbae.vercel.app';
      const response = await fetch(`${backendUrl}/api/user/link-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`
        },
        body: JSON.stringify({
          phone: linkPhone,
          otp: linkOtp,
          firebaseUid: firebaseUid, // Pass Firebase UID if verified via Firebase
          verifiedViaFirebase: isFirebasePhoneOTP
        })
      });

      const data = await response.json();
      if (!response.ok) {
        // Check if phone already exists
        if (data.phoneExists || (data.error && data.error.includes('already registered'))) {
          throw new Error('This phone number is already registered. Please use a different phone number or login with this phone instead.');
        }
        throw new Error(data.error || 'Failed to link phone');
      }

      // Update user in localStorage
      const updatedUser = { ...user, phone: linkPhone, phoneVerified: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      // Reset state
      setLinkingPhone(false);
      setLinkPhone('');
      setLinkOtp('');
      setLinkOtpSent(false);
      setLinkError('');
      setPhoneVerificationId(null);
      setIsFirebasePhoneOTP(false);
    } catch (err) {
      console.error('Error linking phone:', err);

      if (err.code === 'auth/invalid-verification-code') {
        setLinkError('Invalid OTP. Please check and try again.');
      } else if (err.code === 'auth/code-expired') {
        setLinkError('OTP expired. Please request a new one.');
        setLinkOtpSent(false);
        setLinkOtp('');
      } else {
        setLinkError(err.message || 'Failed to link phone');
      }
    } finally {
      setLinkLoading(false);
    }
  };

  if (loading || !isClient) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#fef7f0'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p style={{ color: '#6b7280' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isGoogleLogin = user.photoURL || (user.email && !user.phone);
  const hasPhone = user.phone;
  const hasEmail = user.email;

  return (
    <div style={{ 
      width: '100%',
      minHeight: '100vh', 
      backgroundColor: '#fef7f0',
      padding: isMobile ? '16px' : '24px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '16px',
          padding: isMobile ? '20px' : '32px',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid #fce7f3'
        }}>
          <h1 style={{ 
            fontSize: isMobile ? '24px' : '32px', 
            fontWeight: 'bold', 
            color: '#1f2937', 
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FaUser color="#ec4899" size={isMobile ? 24 : 28} />
            Profile
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            View and manage your account information
          </p>
        </div>

        {/* Profile Card */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '16px',
          padding: isMobile ? '24px' : '32px',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid #fce7f3'
        }}>
          {/* Profile Picture and Name Section */}
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'center' : 'flex-start',
            gap: '24px',
            marginBottom: '32px',
            paddingBottom: '32px',
            borderBottom: '1px solid #f3f4f6'
          }}>
            {/* Profile Picture */}
            <div style={{
              width: isMobile ? '120px' : '140px',
              height: isMobile ? '120px' : '140px',
              borderRadius: '50%',
              background: isGoogleLogin && user.photoURL 
                ? 'transparent' 
                : `linear-gradient(135deg, ${getRoleColor(user.role)}, ${getRoleColor(user.role)}dd)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: '4px solid white',
              flexShrink: 0
            }}>
              {isGoogleLogin && user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ 
                  color: 'white', 
                  fontSize: isMobile ? '48px' : '56px',
                  fontWeight: 'bold'
                }}>
                  {getUserInitials()}
                </span>
              )}
            </div>

            {/* Name and Role */}
            <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
              {editMode ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: '200px',
                      padding: '10px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '18px',
                      fontWeight: '600',
                      outline: 'none',
                      backgroundColor: '#f9fafb'
                    }}
                    placeholder="Enter your name"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={saving || !editedName.trim()}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: saving ? '#9ca3af' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    <FaCheck size={14} />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setEditedName(user.name || '');
                      setEditMode(false);
                    }}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    <FaTimes size={14} />
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: isMobile ? 'center' : 'flex-start', marginBottom: '8px' }}>
                    <h2 style={{ 
                      fontSize: isMobile ? '24px' : '28px', 
                      fontWeight: 'bold', 
                      color: '#1f2937', 
                      margin: 0 
                    }}>
                      {user.name || 'User'}
                    </h2>
                    <button
                      onClick={() => setEditMode(true)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        color: '#6b7280'
                      }}
                      title="Edit name"
                    >
                      <FaEdit size={12} />
                      Edit
                    </button>
                  </div>
                  <div style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    backgroundColor: `${getRoleColor(user.role)}15`,
                    borderRadius: '20px',
                    marginTop: '8px'
                  }}>
                    <FaShieldAlt size={14} color={getRoleColor(user.role)} />
                    <span style={{ 
                      color: getRoleColor(user.role), 
                      fontWeight: '600', 
                      fontSize: '14px' 
                    }}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Information Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Email Card */}
            {hasEmail ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#ec489915',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FaEnvelope size={20} color="#ec4899" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px'
                  }}>
                    Email Address
                  </p>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '16px', 
                    color: '#1f2937', 
                    fontWeight: '600' 
                  }}>
                    {user.email}
                  </p>
                </div>
              </div>
            ) : (
              <div style={{
                padding: '20px',
                backgroundColor: '#fef3c7',
                borderRadius: '12px',
                border: '1px solid #fbbf24'
              }}>
                {!linkingEmail ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <FaEnvelope size={20} color="#f59e0b" />
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#92400e' }}>
                        Link Email Address
                      </p>
                    </div>
                    <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#78350f' }}>
                      Link your email to enable email/password login and receive important notifications.
                    </p>
                    <button
                      onClick={() => setLinkingEmail(true)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Link Email
                    </button>
                  </>
                ) : (
                  <form onSubmit={linkOtpSent ? handleLinkEmail : (e) => handleSendEmailOtp(e)}>
                    {linkError && (
                      <div style={{
                        padding: '12px',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        fontSize: '13px'
                      }}>
                        {linkError}
                      </div>
                    )}
                    {!linkOtpSent ? (
                      <>
                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#78350f', marginBottom: '8px' }}>
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={linkEmail}
                            onChange={(e) => setLinkEmail(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: '2px solid #fbbf24',
                              borderRadius: '8px',
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                            placeholder="your@email.com"
                            required
                          />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#78350f', marginBottom: '8px' }}>
                            Password (Optional)
                          </label>
                          <input
                            type="password"
                            value={linkPassword}
                            onChange={(e) => setLinkPassword(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: '2px solid #fbbf24',
                              borderRadius: '8px',
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                            placeholder="Create password for email login"
                          />
                        </div>
                        {linkPassword && (
                          <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#78350f', marginBottom: '8px' }}>
                              Confirm Password
                            </label>
                            <input
                              type="password"
                              value={linkConfirmPassword}
                              onChange={(e) => setLinkConfirmPassword(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '12px',
                                border: '2px solid #fbbf24',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                boxSizing: 'border-box'
                              }}
                              placeholder="Confirm password"
                            />
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="submit"
                            disabled={linkLoading || !linkEmail}
                            style={{
                              flex: 1,
                              padding: '12px',
                              backgroundColor: linkLoading || !linkEmail ? '#d1d5db' : '#f59e0b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontWeight: '600',
                              cursor: linkLoading || !linkEmail ? 'not-allowed' : 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            {linkLoading ? 'Sending...' : 'Send OTP'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setLinkingEmail(false);
                              setLinkEmail('');
                              setLinkPassword('');
                              setLinkConfirmPassword('');
                              setLinkError('');
                            }}
                            style={{
                              padding: '12px 16px',
                              backgroundColor: 'transparent',
                              color: '#78350f',
                              border: '2px solid #fbbf24',
                              borderRadius: '8px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#78350f', marginBottom: '8px' }}>
                            Enter OTP sent to {linkEmail}
                          </label>
                          <input
                            type="text"
                            value={linkOtp}
                            onChange={(e) => setLinkOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            style={{
                              width: '100%',
                              padding: '16px',
                              border: '2px solid #fbbf24',
                              borderRadius: '8px',
                              fontSize: '24px',
                              outline: 'none',
                              letterSpacing: '8px',
                              textAlign: 'center',
                              fontWeight: 'bold',
                              boxSizing: 'border-box'
                            }}
                            placeholder="123456"
                            maxLength={6}
                            required
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="submit"
                            disabled={linkLoading || linkOtp.length !== 6}
                            style={{
                              flex: 1,
                              padding: '12px',
                              backgroundColor: linkLoading || linkOtp.length !== 6 ? '#d1d5db' : '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontWeight: '600',
                              cursor: linkLoading || linkOtp.length !== 6 ? 'not-allowed' : 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            {linkLoading ? 'Linking...' : 'Verify & Link'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setLinkOtpSent(false);
                              setLinkOtp('');
                            }}
                            style={{
                              padding: '12px 16px',
                              backgroundColor: 'transparent',
                              color: '#78350f',
                              border: '2px solid #fbbf24',
                              borderRadius: '8px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            Back
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                )}
              </div>
            )}

            {/* Phone Card */}
            {hasPhone ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#10b98115',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FaPhone size={20} color="#10b981" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px'
                  }}>
                    Phone Number
                  </p>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '16px', 
                    color: '#1f2937', 
                    fontWeight: '600' 
                  }}>
                    {user.phone}
                  </p>
                </div>
              </div>
            ) : (
              <div style={{
                padding: '20px',
                backgroundColor: '#dbeafe',
                borderRadius: '12px',
                border: '1px solid #60a5fa'
              }}>
                {!linkingPhone ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <FaPhone size={20} color="#3b82f6" />
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1e40af' }}>
                        Link Phone Number
                      </p>
                    </div>
                    <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#1e3a8a' }}>
                      Link your phone number to enable phone OTP login.
                    </p>
                    <button
                      onClick={() => setLinkingPhone(true)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Link Phone
                    </button>
                  </>
                ) : (
                  <form onSubmit={linkOtpSent ? handleLinkPhone : (e) => handleSendPhoneOtp(e)}>
                    {linkError && (
                      <div style={{
                        padding: '12px',
                        backgroundColor: linkError.includes('successfully') ? '#d1fae5' : '#fee2e2',
                        color: linkError.includes('successfully') ? '#065f46' : '#dc2626',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        fontSize: '13px'
                      }}>
                        {linkError}
                      </div>
                    )}
                    {!linkOtpSent ? (
                      <>
                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>
                            Phone Number (with country code)
                          </label>
                          <input
                            type="tel"
                            value={linkPhone}
                            onChange={(e) => setLinkPhone(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: '2px solid #60a5fa',
                              borderRadius: '8px',
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                            placeholder="+919876543210"
                            required
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="submit"
                            disabled={linkLoading || !linkPhone}
                            style={{
                              flex: 1,
                              padding: '12px',
                              backgroundColor: linkLoading || !linkPhone ? '#d1d5db' : '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontWeight: '600',
                              cursor: linkLoading || !linkPhone ? 'not-allowed' : 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            {linkLoading ? 'Sending OTP...' : 'Send OTP'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setLinkingPhone(false);
                              setLinkPhone('');
                              setLinkOtp('');
                              setLinkOtpSent(false);
                              setLinkError('');
                              setPhoneVerificationId(null);
                              setIsFirebasePhoneOTP(false);
                            }}
                            style={{
                              padding: '12px 16px',
                              backgroundColor: 'transparent',
                              color: '#1e40af',
                              border: '2px solid #60a5fa',
                              borderRadius: '8px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>
                            Enter {isFirebasePhoneOTP ? '6' : '4'}-digit OTP sent to {linkPhone}
                          </label>
                          <input
                            type="text"
                            value={linkOtp}
                            onChange={(e) => setLinkOtp(e.target.value.replace(/\D/g, '').slice(0, isFirebasePhoneOTP ? 6 : 4))}
                            style={{
                              width: '100%',
                              padding: '16px',
                              border: '2px solid #60a5fa',
                              borderRadius: '8px',
                              fontSize: '24px',
                              outline: 'none',
                              letterSpacing: '8px',
                              textAlign: 'center',
                              fontWeight: 'bold',
                              boxSizing: 'border-box'
                            }}
                            placeholder={isFirebasePhoneOTP ? '123456' : '1234'}
                            maxLength={isFirebasePhoneOTP ? 6 : 4}
                            required
                          />
                          {!isFirebasePhoneOTP && (
                            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                              For testing use: <strong style={{ color: '#3b82f6' }}>1234</strong> (if phone is +919000000000)
                            </p>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="submit"
                            disabled={linkLoading || linkOtp.length !== (isFirebasePhoneOTP ? 6 : 4)}
                            style={{
                              flex: 1,
                              padding: '12px',
                              backgroundColor: linkLoading || linkOtp.length !== (isFirebasePhoneOTP ? 6 : 4) ? '#d1d5db' : '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontWeight: '600',
                              cursor: linkLoading || linkOtp.length !== (isFirebasePhoneOTP ? 6 : 4) ? 'not-allowed' : 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            {linkLoading ? 'Verifying...' : 'Verify & Link'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setLinkOtpSent(false);
                              setLinkOtp('');
                              setPhoneVerificationId(null);
                            }}
                            style={{
                              padding: '12px 16px',
                              backgroundColor: 'transparent',
                              color: '#1e40af',
                              border: '2px solid #60a5fa',
                              borderRadius: '8px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            Back
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                )}
              </div>
            )}

            {/* User ID Card */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px',
              backgroundColor: '#f9fafb',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#3b82f615',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FaUser size={20} color="#3b82f6" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ 
                  margin: 0, 
                  fontSize: '12px', 
                  color: '#6b7280', 
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '4px'
                }}>
                  User ID
                </p>
                <p style={{ 
                  margin: 0, 
                  fontSize: '16px', 
                  color: '#1f2937', 
                  fontWeight: '600',
                  fontFamily: 'monospace'
                }}>
                  {user.id || user.userId || 'N/A'}
                </p>
              </div>
            </div>

            {/* Login Method Card */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px',
              backgroundColor: '#f9fafb',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#8b5cf615',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FaShieldAlt size={20} color="#8b5cf6" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ 
                  margin: 0, 
                  fontSize: '12px', 
                  color: '#6b7280', 
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '4px'
                }}>
                  Login Method
                </p>
                <p style={{ 
                  margin: 0, 
                  fontSize: '16px', 
                  color: '#1f2937', 
                  fontWeight: '600' 
                }}>
                  {isGoogleLogin ? 'Google Account' : 'Phone Number'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invisible reCAPTCHA container for phone verification */}
      <div id="recaptcha-container-profile"></div>
    </div>
  );
};

export default Profile;
