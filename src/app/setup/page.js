'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaPhone, 
  FaUtensils, 
  FaSpinner,
  FaCheck,
  FaExclamationTriangle,
  FaLock
} from 'react-icons/fa';
import apiClient from '../../lib/api';

const Setup = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [adminKey, setAdminKey] = useState('');
  
  // Optional restaurant details
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [restaurantData, setRestaurantData] = useState({
    address: '',
    city: '',
    email: '',
    cuisine: '',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!phone.trim()) {
        setError('Phone number is required');
        setLoading(false);
        return;
      }

      if (!adminKey.trim()) {
        setError('Admin setup key is required');
        setLoading(false);
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
      const response = await fetch(`${backendUrl}/api/admin/setup-client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-setup-key': adminKey
        },
        body: JSON.stringify({
          phone: phone.trim(),
          name: name.trim() || undefined,
          restaurantName: restaurantName.trim() || undefined,
          restaurantData: restaurantName ? {
            address: restaurantData.address || undefined,
            city: restaurantData.city || undefined,
            email: restaurantData.email || undefined,
            cuisine: restaurantData.cuisine ? restaurantData.cuisine.split(',').map(c => c.trim()) : undefined,
            description: restaurantData.description || undefined
          } : undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Setup failed');
      }

      if (data.success && data.token) {
        // Store token
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (data.restaurant) {
          localStorage.setItem('selectedRestaurantId', data.restaurant.id);
        }

        setSuccess(data.message || 'Client setup successful!');
        
        // Redirect after short delay
        setTimeout(() => {
          router.push(data.redirectTo || '/dashboard');
        }, 1500);
      } else {
        throw new Error('Invalid response from server');
      }

    } catch (err) {
      console.error('Setup error:', err);
      setError(err.message || 'Failed to setup client. Please check your admin key and try again.');
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
            <FaLock className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Client Setup
          </h1>
          <p className="text-gray-600">
            Setup restaurant clients without OTP verification
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <FaExclamationTriangle className="text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <FaCheck className="text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Admin Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Setup Key *
            </label>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter admin setup key"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaPhone className="text-gray-400" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+919876543210"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Include country code (e.g., +91 for India)
            </p>
          </div>

          {/* Owner Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Owner Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Restaurant Owner"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Restaurant Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Restaurant Name (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUtensils className="text-gray-400" />
              </div>
              <input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                placeholder="My Restaurant"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Leave empty to only create/login user without restaurant
            </p>
          </div>

          {/* Advanced Options Toggle */}
          {restaurantName && (
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
              </button>
            </div>
          )}

          {/* Advanced Restaurant Details */}
          {showAdvanced && restaurantName && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={restaurantData.address}
                  onChange={(e) => setRestaurantData({ ...restaurantData, address: e.target.value })}
                  placeholder="123 Main Street"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={restaurantData.city}
                  onChange={(e) => setRestaurantData({ ...restaurantData, city: e.target.value })}
                  placeholder="Mumbai"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={restaurantData.email}
                  onChange={(e) => setRestaurantData({ ...restaurantData, email: e.target.value })}
                  placeholder="restaurant@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine (comma-separated)
                </label>
                <input
                  type="text"
                  value={restaurantData.cuisine}
                  onChange={(e) => setRestaurantData({ ...restaurantData, cuisine: e.target.value })}
                  placeholder="Indian, Chinese, Italian"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={restaurantData.description}
                  onChange={(e) => setRestaurantData({ ...restaurantData, description: e.target.value })}
                  placeholder="Restaurant description..."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                <FaCheck />
                Setup Client
              </>
            )}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> This page bypasses OTP verification. Use only for admin client setup. 
            The admin key should be kept secure and stored in environment variables.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Setup;
