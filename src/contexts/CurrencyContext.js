'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/api';
import { defaultCurrencySettings } from '../lib/currencyData';
import {
  formatCurrency as formatCurrencyUtil,
  formatCurrencyParts as formatCurrencyPartsUtil,
  getCurrencySymbol as getCurrencySymbolUtil,
  formatCurrencyHtml as formatCurrencyHtmlUtil
} from '../utils/currency';
// jjh d
const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currencySettings, setCurrencySettings] = useState(defaultCurrencySettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load currency settings when restaurant changes
  const loadCurrencySettings = useCallback(async (restaurantId) => {
    if (!restaurantId) {
      setCurrencySettings(defaultCurrencySettings);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getCurrencySettings(restaurantId);
      if (response.success && response.currencySettings) {
        setCurrencySettings(response.currencySettings);
      } else {
        // Use default if no settings found
        setCurrencySettings(defaultCurrencySettings);
      }
    } catch (err) {
      console.error('Error loading currency settings:', err);
      setError(err.message);
      // Fall back to default settings on error
      setCurrencySettings(defaultCurrencySettings);
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for restaurant changes
  useEffect(() => {
    // Load initial settings from localStorage
    const restaurantId = typeof window !== 'undefined'
      ? localStorage.getItem('selectedRestaurantId')
      : null;

    if (restaurantId) {
      loadCurrencySettings(restaurantId);
    } else {
      setLoading(false);
    }

    // Listen for restaurant change events
    const handleRestaurantChange = (event) => {
      const newRestaurantId = event.detail?.restaurantId;
      if (newRestaurantId) {
        loadCurrencySettings(newRestaurantId);
      }
    };

    // Listen for currency settings changes (from admin page)
    const handleCurrencyChange = (event) => {
      const newSettings = event.detail?.settings;
      if (newSettings) {
        setCurrencySettings(newSettings);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('restaurantChanged', handleRestaurantChange);
      window.addEventListener('currencyChanged', handleCurrencyChange);
      return () => {
        window.removeEventListener('restaurantChanged', handleRestaurantChange);
        window.removeEventListener('currencyChanged', handleCurrencyChange);
      };
    }
  }, [loadCurrencySettings]);

  // Bound formatting functions
  const formatCurrency = useCallback((amount) => {
    return formatCurrencyUtil(amount, currencySettings);
  }, [currencySettings]);

  const formatCurrencyParts = useCallback((amount) => {
    return formatCurrencyPartsUtil(amount, currencySettings);
  }, [currencySettings]);

  const getCurrencySymbol = useCallback(() => {
    return getCurrencySymbolUtil(currencySettings);
  }, [currencySettings]);

  const formatCurrencyHtml = useCallback((amount) => {
    return formatCurrencyHtmlUtil(amount, currencySettings);
  }, [currencySettings]);

  // Update settings (for admin UI)
  const updateCurrencySettings = useCallback(async (restaurantId, newSettings) => {
    try {
      const response = await apiClient.updateCurrencySettings(restaurantId, newSettings);
      if (response.success) {
        setCurrencySettings(newSettings);
      }
      return response;
    } catch (err) {
      console.error('Error updating currency settings:', err);
      throw err;
    }
  }, []);

  // Reload settings (useful after updates)
  const reloadSettings = useCallback((restaurantId) => {
    loadCurrencySettings(restaurantId);
  }, [loadCurrencySettings]);

  const value = {
    currencySettings,
    loading,
    error,
    formatCurrency,
    formatCurrencyParts,
    getCurrencySymbol,
    formatCurrencyHtml,
    updateCurrencySettings,
    reloadSettings
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Return default utilities if used outside provider
    return {
      currencySettings: defaultCurrencySettings,
      loading: false,
      error: null,
      formatCurrency: (amount) => formatCurrencyUtil(amount, defaultCurrencySettings),
      formatCurrencyParts: (amount) => formatCurrencyPartsUtil(amount, defaultCurrencySettings),
      getCurrencySymbol: () => getCurrencySymbolUtil(defaultCurrencySettings),
      formatCurrencyHtml: (amount) => formatCurrencyHtmlUtil(amount, defaultCurrencySettings),
      updateCurrencySettings: async () => { throw new Error('CurrencyProvider not found'); },
      reloadSettings: () => {}
    };
  }
  return context;
}

export default CurrencyContext;
