'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import apiClient from '../lib/api';

/**
 * Normalize a phone number to the last 10 digits for matching.
 */
const normalizePhone = (phone) => {
  if (phone === null || phone === undefined || phone === '') return null;
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length <= 10) return digits;
  return digits.slice(-10);
};

/**
 * Audience matcher mirroring backend services/offerEngine.js.
 * context: { customerId, customerPhone, customerGroupIds, isFirstOrder }
 */
export const matchesAudience = (offer, context = {}) => {
  const legacyFirstOrder = offer.isFirstOrderOnly === true;
  const audience = offer.audience || (legacyFirstOrder ? { type: 'first_order' } : { type: 'all' });
  const type = audience.type || 'all';

  if (type === 'all') return true;
  if (type === 'first_order') return context.isFirstOrder === true;

  if (type === 'groups') {
    const offerGroups = Array.isArray(audience.groupIds) ? audience.groupIds : [];
    if (offerGroups.length === 0) return false;
    const custGroups = Array.isArray(context.customerGroupIds) ? context.customerGroupIds : [];
    if (custGroups.length === 0) return false;
    return offerGroups.some(gid => custGroups.includes(gid));
  }

  if (type === 'customers') {
    const custIds = Array.isArray(audience.customerIds) ? audience.customerIds : [];
    const custPhones = Array.isArray(audience.customerPhones)
      ? audience.customerPhones.map(normalizePhone).filter(Boolean)
      : [];
    if (context.customerId && custIds.includes(context.customerId)) return true;
    const normPhone = normalizePhone(context.customerPhone);
    if (normPhone && custPhones.includes(normPhone)) return true;
    return false;
  }

  return true;
};

/**
 * Resolve tier (highest minSubtotal <= subtotal).
 */
const resolveTier = (offer, subtotal) => {
  if (!Array.isArray(offer.tiers) || offer.tiers.length === 0) return null;
  const sorted = [...offer.tiers]
    .filter(t => t && typeof t.minSubtotal === 'number')
    .sort((a, b) => a.minSubtotal - b.minSubtotal);
  let matched = null;
  for (const tier of sorted) {
    if (subtotal >= tier.minSubtotal) matched = tier;
  }
  return matched;
};

/**
 * Cross-item BOGO calculator — returns { discount, freeItems }.
 */
const calculateCrossItemBogo = (offer, cart) => {
  const cfg = offer.crossItemBogo;
  if (!cfg || !cfg.enabled) return { discount: 0, freeItems: [] };

  const buyItemIds = Array.isArray(cfg.buyItemIds) ? cfg.buyItemIds : [];
  const buyCategoryIds = Array.isArray(cfg.buyCategoryIds) ? cfg.buyCategoryIds : [];
  const getItemIds = Array.isArray(cfg.getItemIds) ? cfg.getItemIds : [];
  const buyQty = Number(cfg.buyQty) || 1;
  const getQty = Number(cfg.getQty) || 1;
  const maxApps = cfg.maxApplications != null ? Number(cfg.maxApplications) : Infinity;

  if (buyQty <= 0 || getQty <= 0 || getItemIds.length === 0) {
    return { discount: 0, freeItems: [] };
  }

  let buyUnits = 0;
  for (const item of cart) {
    const id = item.menuItemId || item.id;
    const cat = (item.category || item.categoryId || '').toString();
    const qty = item.quantity || 0;
    const matchById = buyItemIds.length > 0 && buyItemIds.includes(id);
    const matchByCat = buyCategoryIds.length > 0 && buyCategoryIds.includes(cat);
    if (matchById || matchByCat) buyUnits += qty;
  }

  const applications = Math.min(Math.floor(buyUnits / buyQty), maxApps);
  if (applications <= 0) return { discount: 0, freeItems: [] };

  const pool = [];
  for (const item of cart) {
    const id = item.menuItemId || item.id;
    if (!getItemIds.includes(id)) continue;
    const qty = item.quantity || 0;
    const price = item.price || 0;
    for (let i = 0; i < qty; i++) pool.push({ itemId: id, price });
  }
  pool.sort((a, b) => a.price - b.price);

  const totalFreeUnitsWanted = applications * getQty;
  const taken = pool.slice(0, totalFreeUnitsWanted);
  if (taken.length === 0) return { discount: 0, freeItems: [] };

  const agg = new Map();
  let discount = 0;
  for (const u of taken) {
    discount += u.price;
    const key = `${u.itemId}:${u.price}`;
    if (!agg.has(key)) agg.set(key, { itemId: u.itemId, qty: 0, unitPrice: u.price });
    agg.get(key).qty += 1;
  }

  return {
    discount: Math.round(discount * 100) / 100,
    freeItems: Array.from(agg.values()),
  };
};

/**
 * Calculate discount for a single offer against the given cart/subtotal.
 * Pure function — no side effects.
 *
 * Back-compat: returns a Number by default (legacy callers) but exposes
 * freeItems + appliedTier via the `.freeItems` / `.appliedTier` props on the
 * returned Number wrapper-object behavior — to keep perfect back-compat we
 * return a primitive Number and provide a sibling helper `calculateOfferResult`
 * that returns the full object shape.
 */
export const calculateOfferResult = (offer, subtotal, cart = [], context = {}) => {
  if (!offer || subtotal <= 0) return { discount: 0, freeItems: [], appliedTier: null };

  const offerScope = offer.scope || 'order';
  let applicableSubtotal = subtotal;

  if (offerScope === 'category' && Array.isArray(offer.targetCategories) && offer.targetCategories.length > 0) {
    applicableSubtotal = cart
      .filter(item => offer.targetCategories.some(c => c.toLowerCase() === (item.category || '').toLowerCase()))
      .reduce((sum, item) => sum + (item.total || item.price * item.quantity), 0);
  } else if (offerScope === 'item' && Array.isArray(offer.targetItems) && offer.targetItems.length > 0) {
    applicableSubtotal = cart
      .filter(item => offer.targetItems.includes(item.menuItemId || item.id))
      .reduce((sum, item) => sum + (item.total || item.price * item.quantity), 0);
  }

  // Tier override
  const appliedTier = resolveTier(offer, subtotal);
  const effectiveDiscountType = appliedTier ? appliedTier.discountType : offer.discountType;
  const effectiveDiscountValue = appliedTier ? Number(appliedTier.discountValue) : (offer.discountValue || 0);

  let baseDiscount = 0;

  // Legacy same-item BOGO
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
      baseDiscount = Math.round(sets * getQty * cheapestPrice * (getDiscount / 100) * 100) / 100;
    }
  } else if (applicableSubtotal > 0) {
    if (effectiveDiscountType === 'percentage') {
      let disc = (applicableSubtotal * effectiveDiscountValue) / 100;
      if (offer.maxDiscount && disc > offer.maxDiscount) disc = offer.maxDiscount;
      baseDiscount = Math.round(disc * 100) / 100;
    } else {
      baseDiscount = Math.round(Math.min(effectiveDiscountValue, applicableSubtotal) * 100) / 100;
    }
  }

  // Cross-item BOGO additive
  const cross = calculateCrossItemBogo(offer, cart);
  const totalDiscount = Math.round((baseDiscount + cross.discount) * 100) / 100;

  return { discount: totalDiscount, freeItems: cross.freeItems, appliedTier };
};

/**
 * Legacy signature — returns a primitive number. Third-arg `cart`, optional
 * 4th-arg `context`. All existing call-sites continue to work unchanged.
 */
export const calculateDiscountForOffer = (offer, subtotal, cart = [], context = {}) => {
  return calculateOfferResult(offer, subtotal, cart, context).discount;
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
    until.setHours(23, 59, 59, 999); // Include the entire last day
    if (now > until) return false;
  }
  return true;
};

/**
 * Compute ms until the next schedule transition (offer activates or deactivates).
 * Returns null if no scheduled offers exist.
 */
const getNextScheduleTransition = (offers) => {
  const now = new Date();
  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  let minMs = null;

  for (const offer of offers) {
    // Time-based schedule transitions
    if (offer.schedule?.type === 'recurring') {
      const days = offer.schedule.days || [];
      const [startH, startM] = (offer.schedule.startTime || '00:00').split(':').map(Number);
      const [endH, endM] = (offer.schedule.endTime || '23:59').split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      if (days.includes(currentDay)) {
        if (currentMinutes < startMinutes) {
          // Before window today — transition at startTime
          const ms = (startMinutes - currentMinutes) * 60000 - (now.getSeconds() * 1000);
          if (minMs === null || ms < minMs) minMs = ms;
        } else if (currentMinutes < endMinutes) {
          // Inside window — transition at endTime
          const ms = (endMinutes - currentMinutes) * 60000 - (now.getSeconds() * 1000);
          if (minMs === null || ms < minMs) minMs = ms;
        }
        // After window today — check next scheduled day below
      }

      // Find next scheduled day's startTime
      if (!days.includes(currentDay) || currentMinutes >= endMinutes) {
        for (let i = 1; i <= 7; i++) {
          const nextDay = (currentDay + i) % 7;
          if (days.includes(nextDay)) {
            const msToMidnight = ((24 * 60) - currentMinutes) * 60000 - (now.getSeconds() * 1000);
            const msFromMidnight = (i - 1) * 24 * 60 * 60000 + startMinutes * 60000;
            const ms = msToMidnight + msFromMidnight;
            if (minMs === null || ms < minMs) minMs = ms;
            break;
          }
        }
      }
    }

    // Date-based transitions
    if (offer.validFrom) {
      const from = new Date(offer.validFrom);
      if (from > now) {
        const ms = from.getTime() - now.getTime();
        if (minMs === null || ms < minMs) minMs = ms;
      }
    }
    if (offer.validUntil) {
      const until = new Date(offer.validUntil);
      until.setHours(23, 59, 59, 999);
      if (until > now) {
        const ms = until.getTime() - now.getTime();
        if (minMs === null || ms < minMs) minMs = ms;
      }
    }
  }

  return minMs;
};

const useOfferEngine = ({ restaurantId, cart = [], subtotal = 0, customerInfo = null, taxSettings = null, customerContext = null }) => {
  const [allOffers, setAllOffers] = useState([]);
  const [offerSettings, setOfferSettings] = useState({
    autoApplyBestOffer: false,
    allowMultipleOffers: false,
    maxOffersAllowed: 1,
  });
  const [loyaltySettings, setLoyaltySettings] = useState({
    enabled: false,
    earnPerAmount: 100,
    pointsEarned: 4,
    redemptionRate: 1,
    maxRedemptionPercent: 20,
    earnPointsOnRedemption: false,
    earnOnFullAmount: false,
  });
  const [selectedOfferId, setSelectedOfferIdInternal] = useState(null);
  const [selectedOfferIds, setSelectedOfferIdsInternal] = useState([]);
  const [offerDiscount, setOfferDiscount] = useState(0);
  const [selectedOfferName, setSelectedOfferName] = useState('');
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);
  const [autoApplied, setAutoApplied] = useState(false);
  const [firstOrderOfferRejected, setFirstOrderOfferRejected] = useState(false);
  const [scheduleCheckKey, setScheduleCheckKey] = useState(0);

  const wasManuallySelectedRef = useRef(false);
  const prevRestaurantIdRef = useRef(null);
  const [customerGroupIds, setCustomerGroupIds] = useState([]);
  const [customerGroups, setCustomerGroups] = useState([]); // full objects { id, name, color }
  const groupLookupCacheRef = useRef({}); // key: `${rid}|${phone}|${cid}` -> { ids, groups }

  // Resolve final context (merge customerInfo.isFirstOrder if only customerInfo passed)
  const resolvedContext = useMemo(() => {
    if (!customerContext && !customerInfo) return null;
    const ctx = { ...(customerContext || {}) };
    if (customerInfo && ctx.isFirstOrder === undefined && customerInfo.isFirstOrder !== undefined) {
      ctx.isFirstOrder = customerInfo.isFirstOrder;
    }
    if (customerInfo && !ctx.customerPhone && customerInfo.phone) {
      ctx.customerPhone = customerInfo.phone;
    }
    if (customerInfo && !ctx.customerId && customerInfo.id) {
      ctx.customerId = customerInfo.id;
    }
    ctx.customerGroupIds = customerGroupIds;
    return ctx;
  }, [customerContext, customerInfo, customerGroupIds]);

  // Load customer groups when context known
  useEffect(() => {
    if (!restaurantId) return;
    const phone = customerContext?.customerPhone || customerInfo?.phone;
    const cid = customerContext?.customerId || customerInfo?.id;
    if (!phone && !cid) {
      setCustomerGroupIds([]);
      setCustomerGroups([]);
      return;
    }
    const cacheKey = `${restaurantId}|${phone || ''}|${cid || ''}`;
    if (groupLookupCacheRef.current[cacheKey]) {
      setCustomerGroupIds(groupLookupCacheRef.current[cacheKey].ids);
      setCustomerGroups(groupLookupCacheRef.current[cacheKey].groups);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams();
        if (phone) params.set('phone', phone);
        if (cid) params.set('customerId', cid);
        const res = await apiClient.request(`/api/customer-groups/lookup/${restaurantId}?${params.toString()}`, { method: 'GET' }).catch(() => null);
        const groups = res?.groups || [];
        const ids = groups.map(g => g.id).filter(Boolean);
        const groupObjs = groups.map(g => ({ id: g.id, name: g.name, color: g.color })).filter(g => g.id);
        groupLookupCacheRef.current[cacheKey] = { ids, groups: groupObjs };
        if (!cancelled) {
          setCustomerGroupIds(ids);
          setCustomerGroups(groupObjs);
        }
      } catch (_) {
        if (!cancelled) {
          setCustomerGroupIds([]);
          setCustomerGroups([]);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [restaurantId, customerContext?.customerPhone, customerContext?.customerId, customerInfo?.phone, customerInfo?.id]);

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

        // Load offer + loyalty settings
        try {
          const settingsRes = await apiClient.getCustomerAppSettings(restaurantId);
          if (settingsRes?.settings?.offerSettings) {
            setOfferSettings(settingsRes.settings.offerSettings);
          }
          if (settingsRes?.settings?.loyaltySettings) {
            setLoyaltySettings(prev => ({ ...prev, ...settingsRes.settings.loyaltySettings }));
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

  // Smart schedule timer — sets a precise timeout for the next schedule transition
  useEffect(() => {
    if (allOffers.length === 0) return;
    const msToNext = getNextScheduleTransition(allOffers);
    if (!msToNext || msToNext <= 0) return;
    // Cap at 1 hour to handle edge cases (page left open overnight)
    const timeout = Math.min(msToNext + 1000, 3600000);
    const timer = setTimeout(() => setScheduleCheckKey(prev => prev + 1), timeout);
    return () => clearTimeout(timer);
  }, [allOffers, scheduleCheckKey]);

  // Compute applicable offers (filtered by schedule, date, minOrder, firstOrder, scope)
  const applicableOffers = useMemo(() => {
    if (!allOffers.length) return [];

    const hasContext = !!resolvedContext;

    const result = [];
    for (const offer of allOffers) {
      // Schedule check (happy hour, recurring)
      if (!isScheduleValid(offer)) continue;
      if (!isDateValid(offer)) continue;
      if (offer.minOrderValue && subtotal < offer.minOrderValue) continue;
      if (offer.isFirstOrderOnly && customerInfo && customerInfo.isFirstOrder === false) continue;

      // Scope check
      if (offer.scope === 'category' && Array.isArray(offer.targetCategories) && offer.targetCategories.length > 0) {
        const hasMatchingItem = cart.some(item =>
          offer.targetCategories.some(c => c.toLowerCase() === (item.category || '').toLowerCase())
        );
        if (!hasMatchingItem) continue;
      }
      if (offer.scope === 'item' && Array.isArray(offer.targetItems) && offer.targetItems.length > 0) {
        const hasMatchingItem = cart.some(item =>
          offer.targetItems.includes(item.menuItemId || item.id)
        );
        if (!hasMatchingItem) continue;
      }

      // Audience filtering
      const audienceType = offer.audience?.type || (offer.isFirstOrderOnly ? 'first_order' : 'all');
      const isPublicAudience = audienceType === 'all' || audienceType === 'first_order';

      if (hasContext) {
        if (!matchesAudience(offer, resolvedContext)) continue;
        result.push(offer);
      } else {
        if (isPublicAudience) {
          // first_order without context: show but note eligibility unknown
          result.push(offer);
        }
        // targeted audience without context: simply exclude (shown after customer identified)
      }
    }
    return result;
  }, [allOffers, subtotal, cart, customerInfo, scheduleCheckKey, resolvedContext]);

  // Split applicable offers into generic (everyone/first-order) and personalized (group/customer-targeted)
  const { genericOffers, personalizedOffers } = useMemo(() => {
    const generic = [];
    const personalized = [];
    for (const offer of applicableOffers) {
      const audienceType = offer.audience?.type || (offer.isFirstOrderOnly ? 'first_order' : 'all');
      if (audienceType === 'all' || audienceType === 'first_order') {
        generic.push(offer);
      } else {
        personalized.push(offer);
      }
    }
    return { genericOffers: generic, personalizedOffers: personalized };
  }, [applicableOffers]);

  // Compute freeItems from currently applied offer(s) via cross-item BOGO
  const freeItems = useMemo(() => {
    const activeIds = offerSettings.allowMultipleOffers && selectedOfferIds.length > 0
      ? selectedOfferIds
      : (selectedOfferId ? [selectedOfferId] : []);
    if (activeIds.length === 0) return [];
    const all = [];
    for (const oid of activeIds) {
      const offer = allOffers.find(o => (o.id || o._id) === oid);
      if (!offer) continue;
      const res = calculateOfferResult(offer, subtotal, cart, resolvedContext || {});
      if (res.freeItems && res.freeItems.length) all.push(...res.freeItems);
    }
    return all;
  }, [selectedOfferId, selectedOfferIds, allOffers, subtotal, cart, offerSettings.allowMultipleOffers, resolvedContext]);

  // Update discount when selected offers or subtotal changes
  useEffect(() => {
    // Multi-offer mode
    if (offerSettings.allowMultipleOffers && selectedOfferIds.length > 0) {
      let totalDisc = 0;
      const names = [];
      for (const oid of selectedOfferIds) {
        const offer = allOffers.find(o => (o.id || o._id) === oid);
        if (offer) {
          totalDisc += calculateDiscountForOffer(offer, subtotal, cart);
          names.push(offer.name);
        }
      }
      // Cap combined discount at subtotal
      totalDisc = Math.min(totalDisc, subtotal);
      setOfferDiscount(Math.round(totalDisc * 100) / 100);
      setSelectedOfferName(names.join(', '));
      return;
    }

    // Single offer mode
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
  }, [selectedOfferId, selectedOfferIds, subtotal, cart, allOffers, offerSettings.allowMultipleOffers]);

  // Auto-apply best offer(s)
  useEffect(() => {
    if (!offerSettings.autoApplyBestOffer) return;
    if (wasManuallySelectedRef.current) return;
    if (applicableOffers.length === 0) {
      if (selectedOfferId && !wasManuallySelectedRef.current) {
        setSelectedOfferIdInternal(null);
        setSelectedOfferIdsInternal([]);
        setAutoApplied(false);
      }
      return;
    }

    if (applicableOffers.length === 0) return;
    const eligible = applicableOffers;

    if (offerSettings.allowMultipleOffers) {
      // Multi-offer mode: auto-apply top N offers by discount
      const maxOffers = offerSettings.maxOffersAllowed || 1;
      const scored = eligible.map(offer => ({
        offer,
        discount: calculateDiscountForOffer(offer, subtotal, cart, resolvedContext || {}),
      })).filter(s => s.discount > 0);
      scored.sort((a, b) => b.discount - a.discount);
      const topN = scored.slice(0, maxOffers);

      if (topN.length > 0) {
        const newIds = topN.map(s => s.offer.id || s.offer._id);
        const currentIds = selectedOfferIds.join(',');
        if (newIds.join(',') !== currentIds) {
          setSelectedOfferIdsInternal(newIds);
          setSelectedOfferIdInternal(newIds[0]);
          setAutoApplied(true);
        }
      }
    } else {
      // Single offer mode: pick the one with maximum discount
      let bestOffer = null;
      let bestDiscount = 0;
      for (const offer of eligible) {
        const disc = calculateDiscountForOffer(offer, subtotal, cart, resolvedContext || {});
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
    }
  }, [applicableOffers, subtotal, cart, offerSettings.autoApplyBestOffer, offerSettings.allowMultipleOffers, offerSettings.maxOffersAllowed]);

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
    if (cart.length === 0 && (selectedOfferId || selectedOfferIds.length > 0)) {
      setSelectedOfferIdInternal(null);
      setSelectedOfferIdsInternal([]);
      setOfferDiscount(0);
      setSelectedOfferName('');
      setAutoApplied(false);
      wasManuallySelectedRef.current = false;
    }
  }, [cart.length]);

  // Manual selection handler (single offer)
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

  // Toggle offer in multi-select mode
  const toggleOffer = useCallback((offerId) => {
    wasManuallySelectedRef.current = true;
    setAutoApplied(false);
    setFirstOrderOfferRejected(false);
    setSelectedOfferIdsInternal(prev => {
      if (prev.includes(offerId)) {
        const next = prev.filter(id => id !== offerId);
        // Also sync single-offer state
        if (next.length === 0) {
          setSelectedOfferIdInternal(null);
          wasManuallySelectedRef.current = false;
        } else {
          setSelectedOfferIdInternal(next[0]);
        }
        return next;
      }
      // Check max offers cap
      const max = offerSettings.maxOffersAllowed || 1;
      if (prev.length >= max) return prev;
      const next = [...prev, offerId];
      setSelectedOfferIdInternal(next[0]);
      return next;
    });
  }, [offerSettings.maxOffersAllowed]);

  // Reset
  const resetOffers = useCallback(() => {
    setSelectedOfferIdInternal(null);
    setSelectedOfferIdsInternal([]);
    setOfferDiscount(0);
    setSelectedOfferName('');
    setAutoApplied(false);
    setFirstOrderOfferRejected(false);
    wasManuallySelectedRef.current = false;
  }, []);

  return {
    applicableOffers,
    genericOffers,
    personalizedOffers,
    selectedOfferId,
    setSelectedOfferId,
    selectedOfferIds,
    toggleOffer,
    offerDiscount,
    selectedOfferName,
    resetOffers,
    isLoadingOffers,
    autoApplied,
    firstOrderOfferRejected,
    offerSettings,
    loyaltySettings,
    calculateDiscountForOffer,
    freeItems,
    customerGroupIds,
    customerGroups,
  };
};

export default useOfferEngine;
