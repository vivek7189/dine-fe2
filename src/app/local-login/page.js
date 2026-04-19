'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaPhone, 
  FaEnvelope,
  FaKey, 
  FaSpinner,
  FaExclamationTriangle,
  FaSignInAlt
} from 'react-icons/fa';
import apiClient from '../../lib/api';
import { redirectToSubdomain } from '../../utils/subdomain';

const LocalLogin = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [loginType, setLoginType] = useState('phone'); // 'phone' or 'email'
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginValue = loginType === 'phone' ? phone.trim() : email.trim();
      
      if (!loginValue) {
        setError(`${loginType === 'phone' ? 'Phone number' : 'Email'} is required`);
        setLoading(false);
        return;
      }

      if (!password.trim()) {
        setError('Password is required');
        setLoading(false);
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
      const response = await fetch(`${backendUrl}/api/auth/local-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [loginType]: loginValue,
          password: password.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Login failed');
      }

      if (data.success && data.token) {
        // Store auth token in both cookie (for cross-subdomain) and localStorage (same as OTP login)
        apiClient.setToken(data.token); // Stores in both cookie and localStorage
        apiClient.setUser(data.user); // Stores in both cookie and localStorage
        
        // Handle first-time user experience
        if (data.firstTimeUser || data.isNewUser) {
          console.log('🎉 First-time user detected!');
          router.replace('/onboarding');
        } else {
          // Redirect existing users (same as OTP login)
          if (data.subdomainUrl) {
            // Redirect to subdomain with token and user data
            redirectToSubdomain(data.subdomainUrl, data.token, data.user);
          } else if (data.redirectTo) {
            router.replace(data.redirectTo);
          } else {
            router.replace('/home');
          }
        }
      } else {
        throw new Error('Invalid response from server');
      }

    } catch (err) {
      console.error('Local login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
            <FaSignInAlt className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Local Admin Login
          </h1>
          <p className="text-gray-600">
            Test login with phone or email
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <FaExclamationTriangle className="text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Login Type Toggle */}
        <div className="mb-6">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setLoginType('phone');
                setEmail('');
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
                loginType === 'phone'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaPhone className="inline mr-2" />
              Phone
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginType('email');
                setPhone('');
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
                loginType === 'email'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaEnvelope className="inline mr-2" />
              Email
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone or Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {loginType === 'phone' ? 'Phone Number' : 'Email Address'} *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {loginType === 'phone' ? (
                  <FaPhone className="text-gray-400" />
                ) : (
                  <FaEnvelope className="text-gray-400" />
                )}
              </div>
              <input
                type={loginType === 'phone' ? 'tel' : 'email'}
                value={loginType === 'phone' ? phone : email}
                onChange={(e) => {
                  if (loginType === 'phone') {
                    setPhone(e.target.value);
                  } else {
                    setEmail(e.target.value);
                  }
                }}
                placeholder={loginType === 'phone' ? '+919876543210' : 'user@example.com'}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            {loginType === 'phone' && (
              <p className="mt-1 text-xs text-gray-500">
                Include country code (e.g., +91 for India)
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaKey className="text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Use the fixed admin password
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                <FaSignInAlt />
                Login
              </>
            )}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> This is a local admin login for testing purposes. 
            Use phone number or email with the fixed admin password to access user accounts.
          </p>
        </div>

        {/* Link to regular login */}
        <div className="mt-4 text-center">
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-red-600"
          >
            Go to regular login →
          </Link>
        </div>
      </div>

    </div>
  );
};

export default LocalLogin;
