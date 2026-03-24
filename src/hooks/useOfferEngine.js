'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import apiClient from '../lib/api';

/**
 * Calculate discount for a single offer against the given cart/subtotal.
 * Pure function — no side effects.
 */
export const calculateDiscountForOffer = (offer, subtotal, cart = []) => {
  if (!offer || subtotal <= 0) return 0;

  const offerScope = offer.scope || 'order';
  let applicableSubtotal = subtotal;

  // Scoped subtotals
  if (offerScope === 'category' && Array.isArray(offer.targetCategories) && offer.targetCategories.length > 0) {
    applicableSubtotal = cart
      .filter(item => offer.targetCategories.some(c => c.toLowerCase() === (item.category || '').toLowerCase()))
      .reduce((sum, item) => sum + (item.total || item.price * item.quantity), 0);
  } else if (offerScope === 'item' && Array.isArray(offer.targetItems) && offer.targetItems.length > 0) {
    applicableSubtotal = cart
      .filter(item => offer.targetItems.includes(item.menuItemId || item.id))
      .reduce((sum, item) => sum + (item.total || item.price * item.quantity), 0);
  }

  if (applicableSubtotal <= 0) return 0;

  // BOGO calculation
  if (offer.promotionType === 'bogo' && offer.bogoConfig) {
    const bogoItems = offerScope === 'item' && offer.targetItems?.length > 0
      ? cart.filter(item => offer.targetItems.includes(item.menuItemId || item.id))
      : cart;
    const totalQty = bogoItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const buyQty = offer.bogoConfig.buyQty || 2;
    const getQty = offer.bogoConfig.getQty || 1;
    const getDiscount = offer.bogoConfig.getDiscount || 100;
    const sets = Math.floor(totalQty / (buyQty + getQty));
    if (sets > 0 && bogoItems.length > 0) {
      const cheapestPrice = Math.min(...bogoItems.map(item => item.price || 0));
      return Math.round(sets * getQty * cheapestPrice * (getDiscount / 100) * 100) / 100;
    }
    return 0;
  }

  // Percentage discount
  if (offer.discountType === 'percentage') {
    let disc = (applicableSubtotal * (offer.discountValue || 0)) / 100;
    if (offer.maxDiscount && disc > offer.maxDiscount) disc = offer.maxDiscount;
    return Math.round(disc * 100) / 100;
  }

  // Flat discount
  return Math.round(Math.min(offer.discountValue || 0, applicableSubtotal) * 100) / 100;
};

/**
 * Check if an offer's schedule is currently valid.
 */
const isScheduleValid = (offer) => {
  if (!offer.schedule || offer.schedule.type !== 'recurring') return true;
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const scheduleDays = offer.schedule.days || [];
  const startTime = offer.schedule.startTime || '00:00';
  const endTime = offer.schedule.endTime || '23:59';
  return scheduleDays.includes(currentDay) && currentTime >= startTime && currentTime <= endTime;
};

/**
 * Check if an offer's date range is currently valid.
 */
const isDateValid = (offer) => {
  const now = new Date();
  if (offer.validFrom) {
    const from = new Date(offer.validFrom);
    if (now < from) return false;
  }
  if (offer.validUntil) {
    const until = new Date(offer.validUntil);
    if (now > until) return false;
  }
  return true;
};

const useOfferEngine = ({ restaurantId, cart = [], subtotal = 0, customerInfo = null, taxSettings = null }) => {
  const [allOffers, setAllOffers] = useState([]);
  const [offerSettings, setOfferSettings] = useState({
    autoApplyBestOffer: false,
    allowMultipleOffers: false,
    maxOffersAllowed: 1,
  });
  const [selectedOfferId, setSelectedOfferIdInternal] = useState(null);
  const [offerDiscount, setOfferDiscount] = useState(0);
  const [selectedOfferName, setSelectedOfferName] = useState('');
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);
  const [autoApplied, setAutoApplied] = useState(false);
  const [firstOrderOfferRejected, setFirstOrderOfferRejected] = useState(false);

  const wasManuallySelectedRef = useRef(false);
  const prevRestaurantIdRef = useRef(null);

  // Load offers when restaurantId changes
  useEffect(() => {
    if (!restaurantId) return;
    if (restaurantId === prevRestaurantIdRef.current) return;
    prevRestaurantIdRef.current = restaurantId;

    const loadOffers = async () => {
      setIsLoadingOffers(true);
      try {
        // Try authenticated endpoint first (full fields), fallback to public
        let offersResponse;
        try {
          offersResponse = await apiClient.getActiveOffersForPOS(
            restaurantId,
            customerInfo?.isFirstOrder
          );
        } catch (e) {
          offersResponse = await apiClient.getActiveOffers(
            restaurantId,
            customerInfo?.isFirstOrder
          );
        }

        const offers = (offersResponse.offers || offersResponse || []).filter(o => o.isActive !== false);
        setAllOffers(offers);

        // Load offer settings
        try {
          const settingsRes = await apiClient.getCustomerAppSettings(restaurantId);
          if (settingsRes?.settings?.offerSettings) {
            setOfferSettings(settingsRes.settings.offerSettings);
          }
        } catch (e) {
          // Ignore settings load failure
        }
      } catch (err) {
        console.error('Failed to load offers:', err);
        setAllOffers([]);
      } finally {
        setIsLoadingOffers(false);
      }
    };

    loadOffers();
  }, [restaurantId]); // Only re-fetch when restaurant changes

  // Re-fetch offers when customerInfo.isFirstOrder changes (to filter first-order-only)
  useEffect(() => {
    if (!restaurantId || !customerInfo) return;

    const refetchOffers = async () => {
      try {
        let offersResponse;
        try {
          offersResponse = await apiClient.getActiveOffersForPOS(restaurantId, customerInfo.isFirstOrder);
        } catch (e) {
          offersResponse = await apiClient.getActiveOffers(restaurantId, customerInfo.isFirstOrder);
        }
        const offers = (offersResponse.offers || offersResponse || []).filter(o => o.isActive !== false);
        setAllOffers(offers);
      } catch (e) {
        // Keep existing offers on failure
      }
    };

    refetchOffers();
  }, [restaurantId, customerInfo?.isFirstOrder]);

  // Compute applicable offers (filtered by schedule, date, minOrder, firstOrder, scope)
  const applicableOffers = useMemo(() => {
    if (!allOffers.length) return [];

    return allOffers.filter(offer => {
      // Schedule check (happy hour, recurring)
      if (!isScheduleValid(offer)) return false;

      // Date range check
      if (!isDateValid(offer)) return false;

      // Min order value check
      if (offer.minOrderValue && subtotal < offer.minOrderValue) return false;

      // First order check
      if (offer.isFirstOrderOnly && customerInfo && customerInfo.isFirstOrder === false) return false;

      // Scope check — for category/item scoped offers, verify cart has matching items
      if (offer.scope === 'category' && Array.isArray(offer.targetCategories) && offer.targetCategories.length > 0) {
        const hasMatchingItem = cart.some(item =>
          offer.targetCategories.some(c => c.toLowerCase() === (item.category || '').toLowerCase())
        );
        if (!hasMatchingItem) return false;
      }
      if (offer.scope === 'item' && Array.isArray(offer.targetItems) && offer.targetItems.length > 0) {
        const hasMatchingItem = cart.some(item =>
          offer.targetItems.includes(item.menuItemId || item.id)
        );
        if (!hasMatchingItem) return false;
      }

      return true;
    });
  }, [allOffers, subtotal, cart, customerInfo]);

  // Update discount when selectedOfferId or subtotal changes
  useEffect(() => {
    if (!selectedOfferId) {
      setOfferDiscount(0);
      setSelectedOfferName('');
      return;
    }

    const offer = allOffers.find(o => (o.id || o._id) === selectedOfferId);
    if (!offer) {
      setOfferDiscount(0);
      setSelectedOfferName('');
      return;
    }

    setSelectedOfferName(offer.name);
    const disc = calculateDiscountForOffer(offer, subtotal, cart);
    setOfferDiscount(disc);
  }, [selectedOfferId, subtotal, cart, allOffers]);

  // Auto-apply best offer
  useEffect(() => {
    if (!offerSettings.autoApplyBestOffer) return;
    if (wasManuallySelectedRef.current) return;
    if (applicableOffers.length === 0) {
      if (selectedOfferId && !wasManuallySelectedRef.current) {
        setSelectedOfferIdInternal(null);
        setAutoApplied(false);
      }
      return;
    }

    // Find the offer that gives the maximum discount
    let bestOffer = null;
    let bestDiscount = 0;
    for (const offer of applicableOffers) {
      const disc = calculateDiscountForOffer(offer, subtotal, cart);
      if (disc > bestDiscount) {
        bestDiscount = disc;
        bestOffer = offer;
      }
    }

    if (bestOffer) {
      const bestId = bestOffer.id || bestOffer._id;
      if (bestId !== selectedOfferId) {
        setSelectedOfferIdInternal(bestId);
        setAutoApplied(true);
      }
    }
  }, [applicableOffers, subtotal, cart, offerSettings.autoApplyBestOffer]);

  // First-order offer rejection: if customer looked up and not first order, deselect first-order-only offer
  useEffect(() => {
    if (!selectedOfferId || !customerInfo) return;
    const offer = allOffers.find(o => (o.id || o._id) === selectedOfferId);
    if (offer?.isFirstOrderOnly && customerInfo.isFirstOrder === false) {
      setSelectedOfferIdInternal(null);
      setOfferDiscount(0);
      setSelectedOfferName('');
      setAutoApplied(false);
      setFirstOrderOfferRejected(true);
      wasManuallySelectedRef.current = false;
      // Auto-clear the rejection warning after 5s
      setTimeout(() => setFirstOrderOfferRejected(false), 5000);
    }
  }, [customerInfo, selectedOfferId, allOffers]);

  // Clear offers when cart is empty
  useEffect(() => {
    if (cart.length === 0 && selectedOfferId) {
      setSelectedOfferIdInternal(null);
      setOfferDiscount(0);
      setSelectedOfferName('');
      setAutoApplied(false);
      wasManuallySelectedRef.current = false;
    }
  }, [cart.length]);

  // Manual selection handler
  const setSelectedOfferId = useCallback((offerId) => {
    if (offerId) {
      wasManuallySelectedRef.current = true;
      setAutoApplied(false);
    } else {
      wasManuallySelectedRef.current = false;
    }
    setSelectedOfferIdInternal(offerId);
    setFirstOrderOfferRejected(false);
  }, []);

  // Reset
  const resetOffers = useCallback(() => {
    setSelectedOfferIdInternal(null);
    setOfferDiscount(0);
    setSelectedOfferName('');
    setAutoApplied(false);
    setFirstOrderOfferRejected(false);
    wasManuallySelectedRef.current = false;
  }, []);

  return {
    applicableOffers,
    selectedOfferId,
    setSelectedOfferId,
    offerDiscount,
    selectedOfferName,
    resetOffers,
    isLoadingOffers,
    autoApplied,
    firstOrderOfferRejected,
    offerSettings,
    calculateDiscountForOffer,
  };
};

export default useOfferEngine;
