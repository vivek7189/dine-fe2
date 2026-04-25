'use client';

import { useState, useEffect } from 'react';
import { auth } from '../../../firebase';
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { FaPhone, FaSpinner, FaCheck, FaArrowRight, FaChevronDown, FaSearch, FaDesktop } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { MdEmail } from 'react-icons/md';

// Country data (subset of main login page)
const countries = [
  { code: 'IN', name: 'India', flag: '\u{1F1EE}\u{1F1F3}', dialCode: '+91' },
  { code: 'US', name: 'United States', flag: '\u{1F1FA}\u{1F1F8}', dialCode: '+1' },
  { code: 'GB', name: 'United Kingdom', flag: '\u{1F1EC}\u{1F1E7}', dialCode: '+44' },
  { code: 'CA', name: 'Canada', flag: '\u{1F1E8}\u{1F1E6}', dialCode: '+1' },
  { code: 'AU', name: 'Australia', flag: '\u{1F1E6}\u{1F1FA}', dialCode: '+61' },
  { code: 'AE', name: 'UAE', flag: '\u{1F1E6}\u{1F1EA}', dialCode: '+971' },
  { code: 'SG', name: 'Singapore', flag: '\u{1F1F8}\u{1F1EC}', dialCode: '+65' },
  { code: 'DE', name: 'Germany', flag: '\u{1F1E9}\u{1F1EA}', dialCode: '+49' },
  { code: 'FR', name: 'France', flag: '\u{1F1EB}\u{1F1F7}', dialCode: '+33' },
  { code: 'NL', name: 'Netherlands', flag: '\u{1F1F3}\u{1F1F1}', dialCode: '+31' },
];

export default function DesktopAuthPage() {
  const [sessionId, setSessionId] = useState(null);
  const [step, setStep] = useState('method'); // method, phone, otp, email-login, success
  const [method, setMethod] = useState('phone'); // phone, google, email
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Email login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

  useEffect(() => {
    // Get session ID from URL params
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('session');
    if (sid) {
      setSessionId(sid);
    } else {
      setError('Invalid session. Please try again from the desktop app.');
    }
  }, []);

  const setupRecaptcha = () => {
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {},
          'expired-callback': () => setError('reCAPTCHA expired. Please try again.')
        });
      }
    } catch (err) {
      console.error('RecaptchaVerifier error:', err);
      setError('Failed to setup verification. Please refresh.');
    }
  };

  // Store auth result in backend session
  const storeSession = async (token, user) => {
    try {
      await fetch(`${backendUrl}/api/auth/desktop/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, token, user }),
      });
      setSuccess(true);
      setStep('success');
    } catch (err) {
      console.error('Failed to store session:', err);
      setError('Failed to complete login. Please try again.');
    }
  };

  // Phone OTP flow
  const handlePhoneSend = async (e) => {
    e.preventDefault();
    setError('');
    if (!phoneNumber || phoneNumber.length < 7) {
      setError('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    try {
      setupRecaptcha();
      const fullPhone = `${selectedCountry.dialCode}${phoneNumber}`;
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
      setVerificationId(result);
      setStep('otp');
    } catch (err) {
      console.error('Phone OTP error:', err);
      if (err.code === 'auth/invalid-phone-number') setError('Invalid phone number format');
      else if (err.code === 'auth/too-many-requests') setError('Too many requests. Try again later.');
      else setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const result = await verificationId.confirm(otp);
      // Exchange Firebase user for our JWT
      const response = await fetch(`${backendUrl}/api/auth/firebase/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: result.user.uid,
          phoneNumber: result.user.phoneNumber,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        await storeSession(data.token, data.user);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      console.error('OTP verify error:', err);
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Google login flow
  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      // Exchange for JWT
      const response = await fetch(`${backendUrl}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName,
          picture: result.user.photoURL,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        await storeSession(data.token, data.user);
      } else {
        setError(data.error || 'Google login failed');
      }
    } catch (err) {
      console.error('Google login error:', err);
      if (err.code === 'auth/popup-closed-by-user') setError('Login cancelled.');
      else if (err.code === 'auth/popup-blocked') setError('Popup blocked. Please allow popups.');
      else setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Email login flow
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/auth/email/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        await storeSession(data.token, data.user);
      } else {
        setError(data.message || data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Email login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(countrySearchTerm.toLowerCase()) ||
    c.dialCode.includes(countrySearchTerm)
  );

  if (!sessionId && !error) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <FaSpinner className="animate-spin" size={24} />
    </div>;
  }

  // Success screen
  if (success) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', background: '#fef2f2' }}>
        <div style={{ textAlign: 'center', maxWidth: 400, padding: 40, background: 'white', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <FaCheck size={28} color="#16a34a" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#111' }}>Login Successful!</h2>
          <p style={{ color: '#666', fontSize: 15, lineHeight: 1.5 }}>
            You can close this browser tab and return to the <strong>DineOpen POS</strong> desktop app.
          </p>
          <p style={{ color: '#999', fontSize: 13, marginTop: 16 }}>
            The app will automatically log you in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', background: '#fef2f2', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'white', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: '#dc2626', color: 'white', padding: '28px 24px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <FaDesktop size={20} />
            <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.9 }}>Desktop App Login</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>DineOpen POS</h1>
          <p style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>Sign in to continue to the desktop app</p>
        </div>

        <div style={{ padding: 24 }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
              {error}
            </div>
          )}

          {/* Method selection */}
          {step === 'method' && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Google Login */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px 20px', border: '1px solid #e5e7eb', borderRadius: 10, background: 'white', cursor: 'pointer', fontSize: 15, fontWeight: 500, transition: 'all 0.15s' }}
                >
                  {loading && method === 'google' ? <FaSpinner className="animate-spin" /> : <FcGoogle size={20} />}
                  Continue with Google
                </button>

                {/* Phone Login */}
                <button
                  onClick={() => { setMethod('phone'); setStep('phone'); }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px 20px', border: '1px solid #e5e7eb', borderRadius: 10, background: 'white', cursor: 'pointer', fontSize: 15, fontWeight: 500, transition: 'all 0.15s' }}
                >
                  <FaPhone size={16} color="#dc2626" />
                  Continue with Phone
                </button>

                {/* Email Login */}
                <button
                  onClick={() => { setMethod('email'); setStep('email-login'); }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px 20px', border: '1px solid #e5e7eb', borderRadius: 10, background: 'white', cursor: 'pointer', fontSize: 15, fontWeight: 500, transition: 'all 0.15s' }}
                >
                  <MdEmail size={18} color="#dc2626" />
                  Continue with Email
                </button>
              </div>
            </div>
          )}

          {/* Phone number input */}
          {step === 'phone' && (
            <form onSubmit={handlePhoneSend}>
              <label style={{ fontSize: 14, fontWeight: 500, color: '#333', marginBottom: 6, display: 'block' }}>Phone Number</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '10px 8px', border: '1px solid #e5e7eb', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 14, minWidth: 90 }}
                  >
                    <span>{selectedCountry.flag}</span>
                    <span>{selectedCountry.dialCode}</span>
                    <FaChevronDown size={10} />
                  </button>
                  {showCountryDropdown && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 50, width: 240, maxHeight: 200, overflowY: 'auto' }}>
                      <div style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', background: '#f9fafb', borderRadius: 6 }}>
                          <FaSearch size={12} color="#9ca3af" />
                          <input
                            type="text"
                            placeholder="Search..."
                            value={countrySearchTerm}
                            onChange={(e) => setCountrySearchTerm(e.target.value)}
                            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, width: '100%' }}
                          />
                        </div>
                      </div>
                      {filteredCountries.map(c => (
                        <div
                          key={c.code}
                          onClick={() => { setSelectedCountry(c); setShowCountryDropdown(false); setCountrySearchTerm(''); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid #f9fafb' }}
                        >
                          <span>{c.flag}</span>
                          <span style={{ flex: 1 }}>{c.name}</span>
                          <span style={{ color: '#9ca3af' }}>{c.dialCode}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 15))}
                  placeholder="Phone number"
                  style={{ flex: 1, padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 15, outline: 'none' }}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '12px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {loading ? <FaSpinner className="animate-spin" /> : <><FaArrowRight /> Send OTP</>}
              </button>
              <button type="button" onClick={() => { setStep('method'); setError(''); }} style={{ width: '100%', padding: 10, marginTop: 8, background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 14 }}>
                Back
              </button>
            </form>
          )}

          {/* OTP input */}
          {step === 'otp' && (
            <form onSubmit={handleOtpVerify}>
              <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
                Enter the 6-digit code sent to <strong>{selectedCountry.dialCode}{phoneNumber}</strong>
              </p>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                style={{ width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 20, textAlign: 'center', letterSpacing: 8, outline: 'none', marginBottom: 16, boxSizing: 'border-box' }}
                autoFocus
              />
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '12px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {loading ? <FaSpinner className="animate-spin" /> : <><FaCheck /> Verify OTP</>}
              </button>
            </form>
          )}

          {/* Email login */}
          {step === 'email-login' && (
            <form onSubmit={handleEmailLogin}>
              <label style={{ fontSize: 14, fontWeight: 500, color: '#333', marginBottom: 6, display: 'block' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 15, outline: 'none', marginBottom: 12, boxSizing: 'border-box' }}
                autoFocus
              />
              <label style={{ fontSize: 14, fontWeight: 500, color: '#333', marginBottom: 6, display: 'block' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 15, outline: 'none', marginBottom: 16, boxSizing: 'border-box' }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '12px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {loading ? <FaSpinner className="animate-spin" /> : <><FaArrowRight /> Login</>}
              </button>
              <button type="button" onClick={() => { setStep('method'); setError(''); }} style={{ width: '100%', padding: 10, marginTop: 8, background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 14 }}>
                Back
              </button>
            </form>
          )}
        </div>

        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}
