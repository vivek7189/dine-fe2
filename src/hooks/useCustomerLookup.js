'use client';

import { useState, useRef, useCallback } from 'react';
import apiClient from '../lib/api';

// Country code → minimum local phone digits
const PHONE_LENGTH_MAP = {
  'IN': 10, 'US': 10, 'CA': 10, 'GB': 10, 'AU': 10, 'FR': 10, 'DE': 10, 'IT': 10,
  'ES': 9, 'NL': 9, 'BE': 9, 'SE': 9, 'NO': 8, 'DK': 8,
  'SG': 8, 'HK': 8,
  'MY': 9, 'PH': 10, 'ID': 10, 'TH': 9, 'KR': 10, 'JP': 10,
  'AE': 9, 'SA': 9, 'QA': 8, 'KW': 8, 'BH': 8, 'OM': 8,
  'BR': 11, 'MX': 10, 'AR': 10, 'CL': 9, 'CO': 10,
  'ZA': 9, 'KE': 9, 'NG': 10,
  'LK': 9, 'NP': 10, 'BD': 10, 'PK': 10, 'MM': 9,
  'NZ': 9, 'CN': 11, 'TW': 9,
};

export const getPhoneMinLength = (countryCode) => {
  return PHONE_LENGTH_MAP[countryCode] || 8;
};

const useCustomerLookup = ({ restaurantId, countryCode = 'IN' }) => {
  const [customerData, setCustomerData] = useState(null);
  const [lookupStatus, setLookupStatus] = useState('idle'); // idle | loading | found | not_found | error
  const debounceRef = useRef(null);
  const lastPhoneRef = useRef('');

  const triggerLookup = useCallback((phone) => {
    const digits = (phone || '').replace(/\D/g, '');
    const minLength = getPhoneMinLength(countryCode);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    // If phone cleared or too short, reset
    if (digits.length < minLength) {
      if (lastPhoneRef.current) {
        setCustomerData(null);
        setLookupStatus('idle');
        lastPhoneRef.current = '';
      }
      return;
    }

    // Don't re-lookup the same phone
    if (digits === lastPhoneRef.current) return;

    setLookupStatus('loading');

    debounceRef.current = setTimeout(async () => {
      if (!restaurantId) {
        setLookupStatus('idle');
        return;
      }

      try {
        lastPhoneRef.current = digits;
        const response = await apiClient.lookupCustomerByPhone(restaurantId, digits, countryCode);

        if (response.found) {
          setCustomerData(response.customer);
          setLookupStatus('found');
        } else {
          setCustomerData(null);
          setLookupStatus('not_found');
        }
      } catch (err) {
        console.error('Customer lookup error:', err);
        setLookupStatus('error');
        // Keep previous customerData on error (don't clear)
      }
    }, 500);
  }, [restaurantId, countryCode]);

  const clearCustomer = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setCustomerData(null);
    setLookupStatus('idle');
    lastPhoneRef.current = '';
  }, []);

  return { customerData, lookupStatus, triggerLookup, clearCustomer };
};

export default useCustomerLookup;
