'use client';

import { useState } from 'react';
import {
  FaStore,
  FaTimes,
  FaCheckCircle,
  FaForward,
  FaSpinner
} from 'react-icons/fa';
import apiClient from '../lib/api';
import { redirectToSubdomain } from '../utils/subdomain';
import { getCurrencyByCountryCode } from '../lib/currencyData';

const RestaurantNameOnboarding = ({ onComplete, onSkip, selectedCountryCode }) => {
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!restaurantName.trim()) return;

    try {
      setLoading(true);

      // Create restaurant with user-provided name
      const response = await apiClient.createRestaurant({
        name: restaurantName.trim(),
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

      // Auto-set currency settings based on selected country during registration
      if (selectedCountryCode) {
        try {
          const currencyData = getCurrencyByCountryCode(selectedCountryCode);
          await apiClient.updateCurrencySettings(response.restaurant.id, currencyData);
          console.log('Currency auto-set to:', currencyData.currencyCode);
        } catch (currencyError) {
          console.warn('Failed to auto-set currency:', currencyError);
          // Non-fatal error, continue with default currency
        }
      }
      
      // Check if subdomain is enabled and redirect accordingly
      if (response.restaurant.subdomainUrl) {
        // Redirect to subdomain with token and user data
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');
        if (token) {
          const user = userData ? JSON.parse(userData) : null;
          redirectToSubdomain(response.restaurant.subdomainUrl, token, user);
          return; // Don't call onComplete as we're redirecting
        }
      }
      
      // Call onComplete callback
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
      setLoading(true);

      // Generate random restaurant name
      const randomNames = [
        'Delicious Bites', 'Flavor Junction', 'Taste Paradise', 'Culinary Corner',
        'Spice Garden', 'Food Haven', 'Gourmet Spot', 'Kitchen Magic',
        'Flavor Fusion', 'Tasty Treats', 'Cuisine Corner', 'Dining Delight',
        'Foodie Spot', 'Taste Buds', 'Culinary Hub', 'Flavor Station'
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

      // Auto-set currency settings based on selected country during registration
      if (selectedCountryCode) {
        try {
          const currencyData = getCurrencyByCountryCode(selectedCountryCode);
          await apiClient.updateCurrencySettings(response.restaurant.id, currencyData);
          console.log('Currency auto-set to:', currencyData.currencyCode);
        } catch (currencyError) {
          console.warn('Failed to auto-set currency:', currencyError);
          // Non-fatal error, continue with default currency
        }
      }
      
      // Check if subdomain is enabled and redirect accordingly
      if (response.restaurant.subdomainUrl) {
        // Redirect to subdomain with token and user data
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');
        if (token) {
          const user = userData ? JSON.parse(userData) : null;
          redirectToSubdomain(response.restaurant.subdomainUrl, token, user);
          return; // Don't call onComplete as we're redirecting
        }
      }
      
      // Show notification about random name
      alert(`Great! We've created your restaurant "${randomName}". You can change this name anytime in settings.`);
      
      // Call onComplete callback
      onComplete(response.restaurant);
      
    } catch (error) {
      console.error('Error creating restaurant with random name:', error);
      alert(`Failed to create restaurant: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
        width: '100%',
        maxWidth: '500px',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          padding: '32px',
          borderRadius: '24px 24px 0 0',
          color: 'white',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            animation: 'pulse 2s infinite'
          }}>
            <FaStore size={32} />
          </div>
          
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '800', 
            margin: '0 0 8px 0',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            Welcome to DineOpen! 🍽️
          </h1>
          <p style={{ 
            fontSize: '16px', 
            opacity: 0.9, 
            margin: 0,
            fontWeight: '500'
          }}>
            Let&apos;s give your restaurant a name
          </p>
        </div>

        {/* Form Content */}
        <div style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaStore size={18} style={{ color: '#ef4444' }} />
                What&apos;s your restaurant name?
              </label>
              <input
                type="text"
                required
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your restaurant name"
                onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                disabled={loading}
              />
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '8px 0 0 0',
                fontStyle: 'italic'
              }}>
                Don&apos;t worry, you can change this anytime later!
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                type="button"
                onClick={handleSkip}
                disabled={loading}
                style={{
                  flex: 1,
                  backgroundColor: loading ? '#f3f4f6' : '#f3f4f6',
                  color: loading ? '#9ca3af' : '#6b7280',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '16px',
                  border: '2px solid #e5e7eb',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = '#e5e7eb';
                    e.target.style.color = '#4b5563';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = '#f3f4f6';
                    e.target.style.color = '#6b7280';
                  }
                }}
              >
                <FaForward size={16} />
                Use Random Name
              </button>
              
              <button
                type="submit"
                disabled={loading || !restaurantName.trim()}
                style={{
                  flex: 2,
                  background: loading || !restaurantName.trim() 
                    ? 'linear-gradient(135deg, #d1d5db, #9ca3af)' 
                    : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '16px',
                  border: 'none',
                  cursor: loading || !restaurantName.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: loading || !restaurantName.trim() 
                    ? 'none' 
                    : '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Creating...
                  </>
                ) : (
                  <>
                    <FaCheckCircle size={16} />
                    Create Restaurant
                  </>
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
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};

export default RestaurantNameOnboarding;
