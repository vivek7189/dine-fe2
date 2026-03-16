'use client';

import { useState } from 'react';
import {
  FaStore,
  FaArrowRight,
  FaSpinner,
  FaMapMarkerAlt
} from 'react-icons/fa';
import apiClient from '../lib/api';
import { redirectToSubdomain } from '../utils/subdomain';
import { getCurrencyByCountryCode } from '../lib/currencyData';

const RestaurantNameOnboarding = ({ onComplete, onSkip, selectedCountryCode }) => {
  const [restaurantName, setRestaurantName] = useState('');
  const [city, setCity] = useState('');
  const [businessType, setBusinessType] = useState('restaurant');
  const [loading, setLoading] = useState(false);
  const [skipping, setSkipping] = useState(false);

  const businessTypes = [
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'cafe', label: 'Cafe' },
    { id: 'bar', label: 'Bar / Pub' },
    { id: 'bakery', label: 'Bakery' },
    { id: 'ice_cream', label: 'Ice Cream' },
    { id: 'qsr', label: 'QSR' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!restaurantName.trim()) return;

    try {
      setLoading(true);

      // Create restaurant with user-provided name
      const response = await apiClient.createRestaurant({
        name: restaurantName.trim(),
        city: city.trim() || null,
        businessType,
        address: '',
        phone: '',
        email: '',
        cuisine: ['Indian'],
        description: '',
        operatingHours: {
          open: '09:00',
          close: '22:00'
        }
      });

      // Save restaurant to localStorage for immediate use
      localStorage.setItem('selectedRestaurantId', response.restaurant.id);
      localStorage.setItem('selectedRestaurant', JSON.stringify(response.restaurant));

      // Seed default menu & tables so user sees a populated dashboard
      try {
        await apiClient.seedDefaultMenu(response.restaurant.id);
      } catch (err) {
        console.warn('Failed to seed default menu:', err);
      }

      // Auto-set currency settings based on selected country during registration
      if (selectedCountryCode) {
        try {
          const currencyData = getCurrencyByCountryCode(selectedCountryCode);
          await apiClient.updateCurrencySettings(response.restaurant.id, currencyData);
          console.log('Currency auto-set to:', currencyData.currencyCode);
        } catch (currencyError) {
          console.warn('Failed to auto-set currency:', currencyError);
        }
      }

      // Check if subdomain is enabled and redirect accordingly
      if (response.restaurant.subdomainUrl) {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');
        if (token) {
          const user = userData ? JSON.parse(userData) : null;
          redirectToSubdomain(response.restaurant.subdomainUrl, token, user);
          return;
        }
      }

      onComplete(response.restaurant);

    } catch (error) {
      console.error('Error creating restaurant:', error);
      alert(`Failed to create restaurant: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      setSkipping(true);

      // Generate random restaurant name
      const randomNames = [
        'My Restaurant', 'Delicious Bites', 'Flavor Junction', 'Taste Paradise',
        'Spice Garden', 'Food Haven', 'Gourmet Spot', 'Kitchen Magic'
      ];

      const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];

      // Create restaurant with random name
      const response = await apiClient.createRestaurant({
        name: randomName,
        address: '',
        phone: '',
        email: '',
        cuisine: ['Indian'],
        description: '',
        operatingHours: {
          open: '09:00',
          close: '22:00'
        }
      });

      // Save restaurant to localStorage for immediate use
      localStorage.setItem('selectedRestaurantId', response.restaurant.id);
      localStorage.setItem('selectedRestaurant', JSON.stringify(response.restaurant));

      // Seed default menu & tables so user sees a populated dashboard
      try {
        await apiClient.seedDefaultMenu(response.restaurant.id);
      } catch (err) {
        console.warn('Failed to seed default menu:', err);
      }

      // Auto-set currency settings based on selected country during registration
      if (selectedCountryCode) {
        try {
          const currencyData = getCurrencyByCountryCode(selectedCountryCode);
          await apiClient.updateCurrencySettings(response.restaurant.id, currencyData);
          console.log('Currency auto-set to:', currencyData.currencyCode);
        } catch (currencyError) {
          console.warn('Failed to auto-set currency:', currencyError);
        }
      }

      // Check if subdomain is enabled and redirect accordingly
      if (response.restaurant.subdomainUrl) {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');
        if (token) {
          const user = userData ? JSON.parse(userData) : null;
          redirectToSubdomain(response.restaurant.subdomainUrl, token, user);
          return;
        }
      }

      onComplete(response.restaurant);

    } catch (error) {
      console.error('Error creating restaurant:', error);
      alert(`Failed to create restaurant: ${error.message}`);
    } finally {
      setSkipping(false);
    }
  };

  const isLoading = loading || skipping;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '440px',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          padding: '32px 32px 28px',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <FaStore size={28} />
          </div>

          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            margin: '0 0 6px 0'
          }}>
            Welcome to DineOpen!
          </h1>
          <p style={{
            fontSize: '15px',
            opacity: 0.9,
            margin: 0
          }}>
            Let&apos;s set up your restaurant
          </p>
        </div>

        {/* Form Content */}
        <div style={{ padding: '28px 32px 32px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '15px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '10px'
              }}>
                <FaStore size={14} style={{ color: '#ef4444' }} />
                Restaurant Name
              </label>
              <input
                type="text"
                required
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                  backgroundColor: '#fafafa'
                }}
                placeholder="e.g. Taj Kitchen, Spice House..."
                onFocus={(e) => {
                  e.target.style.borderColor = '#ef4444';
                  e.target.style.backgroundColor = '#fff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.backgroundColor = '#fafafa';
                }}
                disabled={isLoading}
              />
            </div>

            {/* City */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '15px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '10px'
              }}>
                <FaMapMarkerAlt size={14} style={{ color: '#ef4444' }} />
                City
                <span style={{ fontSize: '12px', fontWeight: '400', color: '#9ca3af' }}>(optional)</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                  backgroundColor: '#fafafa'
                }}
                placeholder="e.g. Mumbai, Delhi, Bangalore..."
                onFocus={(e) => {
                  e.target.style.borderColor = '#ef4444';
                  e.target.style.backgroundColor = '#fff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.backgroundColor = '#fafafa';
                }}
                disabled={isLoading}
              />
            </div>

            {/* Business Type */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '15px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '10px'
              }}>
                <FaStore size={14} style={{ color: '#ef4444' }} />
                What type of business?
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {businessTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setBusinessType(type.id)}
                    disabled={isLoading}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '600',
                      border: businessType === type.id ? '2px solid #ef4444' : '1px solid #e5e7eb',
                      background: businessType === type.id ? '#fef2f2' : '#f9fafb',
                      color: businessType === type.id ? '#dc2626' : '#374151',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              <p style={{
                fontSize: '12px',
                color: '#9ca3af',
                margin: '8px 0 0 0'
              }}>
                This customizes your billing dashboard. You can change it later in settings.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !restaurantName.trim()}
              style={{
                width: '100%',
                background: isLoading || !restaurantName.trim()
                  ? '#e5e7eb'
                  : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: isLoading || !restaurantName.trim() ? '#9ca3af' : 'white',
                padding: '14px 24px',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '15px',
                border: 'none',
                cursor: isLoading || !restaurantName.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: isLoading || !restaurantName.trim()
                  ? 'none'
                  : '0 4px 12px rgba(239, 68, 68, 0.25)'
              }}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" size={16} />
                  Creating...
                </>
              ) : (
                <>
                  Continue
                  <FaArrowRight size={14} />
                </>
              )}
            </button>

            {/* Skip Link */}
            <div style={{
              textAlign: 'center',
              marginTop: '20px'
            }}>
              <button
                type="button"
                onClick={handleSkip}
                disabled={isLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isLoading ? '#d1d5db' : '#6b7280',
                  fontSize: '14px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  transition: 'all 0.2s',
                  fontWeight: '500',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.color = '#374151';
                    e.target.style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.target.style.color = '#6b7280';
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {skipping ? (
                  <>
                    <FaSpinner className="animate-spin" size={12} />
                    Setting up...
                  </>
                ) : (
                  'Skip for now'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default RestaurantNameOnboarding;
