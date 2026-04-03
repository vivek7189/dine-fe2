'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import apiClient from '../../../../lib/api';

export default function useWaste(currentRestaurant, inventoryItems = []) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Data
  const [wasteEntries, setWasteEntries] = useState([]);
  const [wasteSummary, setWasteSummary] = useState(null);
  const [expiryAlerts, setExpiryAlerts] = useState(null);

  // Filters
  const [wastePeriod, setWastePeriod] = useState('7d');
  const [wasteReason, setWasteReason] = useState('');

  // Modal states
  const [showQuickWasteModal, setShowQuickWasteModal] = useState(false);
  const [showLeftoverModal, setShowLeftoverModal] = useState(false);

  // Quick waste form
  const [wasteFormData, setWasteFormData] = useState({
    itemId: '', quantity: '', reason: 'spillage', notes: ''
  });

  // Leftover analysis state
  const [leftoverText, setLeftoverText] = useState('');
  const [leftoverAnalysis, setLeftoverAnalysis] = useState(null);
  const [analyzingLeftovers, setAnalyzingLeftovers] = useState(false);
  const [confirmingLeftovers, setConfirmingLeftovers] = useState(false);

  const rid = currentRestaurant?.id;

  // Load waste entries
  const loadWasteEntries = useCallback(async () => {
    if (!rid) return;
    try {
      const params = { period: wastePeriod };
      if (wasteReason) params.reason = wasteReason;
      const res = await apiClient.getWasteEntries(rid, params);
      setWasteEntries(res.entries || []);
    } catch (e) {
      console.error('Load waste entries error:', e);
    }
  }, [rid, wastePeriod, wasteReason]);

  // Load waste summary
  const loadWasteSummary = useCallback(async () => {
    if (!rid) return;
    try {
      const res = await apiClient.getWasteSummary(rid);
      setWasteSummary(res);
    } catch (e) {
      console.error('Load waste summary error:', e);
    }
  }, [rid]);

  // Load expiry alerts
  const loadExpiryAlerts = useCallback(async () => {
    if (!rid) return;
    try {
      const res = await apiClient.getExpiryAlerts(rid, 7);
      setExpiryAlerts(res);
    } catch (e) {
      console.error('Load expiry alerts error:', e);
    }
  }, [rid]);

  // Load all waste data
  const loadWasteData = useCallback(async () => {
    if (!rid) return;
    setLoading(true);
    try {
      await Promise.all([
        loadWasteSummary(),
        loadWasteEntries(),
        loadExpiryAlerts()
      ]);
    } finally {
      setLoading(false);
    }
  }, [rid, loadWasteSummary, loadWasteEntries, loadExpiryAlerts]);

  // Auto-reload waste entries when period/reason filters change
  const hasLoadedOnce = useRef(false);
  useEffect(() => {
    if (!rid) return;
    if (!hasLoadedOnce.current) { hasLoadedOnce.current = true; return; }
    loadWasteEntries();
  }, [wastePeriod, wasteReason]);

  // Quick waste entry (spillage, damage, etc.)
  const handleCreateWasteEntry = async () => {
    if (!rid || !wasteFormData.itemId || !wasteFormData.quantity) {
      setError('Select an item and enter quantity');
      return;
    }
    const item = inventoryItems.find(i => i.id === wasteFormData.itemId);
    if (!item) { setError('Item not found'); return; }

    setLoading(true);
    try {
      await apiClient.createWasteEntry(rid, {
        itemId: wasteFormData.itemId,
        itemName: item.name,
        quantity: Number(wasteFormData.quantity),
        unit: item.unit,
        reason: wasteFormData.reason,
        notes: wasteFormData.notes,
        source: 'MANUAL',
        costPerUnit: item.costPerUnit || 0
      });
      setSuccess('Waste logged successfully');
      setShowQuickWasteModal(false);
      setWasteFormData({ itemId: '', quantity: '', reason: 'spillage', notes: '' });
      await loadWasteData();
    } catch (e) {
      setError(e.message || 'Failed to log waste');
    } finally {
      setLoading(false);
    }
  };

  // Dish-based waste entry (deducts recipe ingredients)
  const handleCreateDishWasteEntry = async (recipe, quantity, reason, notes) => {
    if (!rid || !recipe || !quantity) {
      setError('Select a dish and enter quantity');
      return;
    }
    setLoading(true);
    try {
      // Compute ingredient quantities based on recipe servings
      const servings = recipe.servings || 1;
      const multiplier = quantity / servings;
      const wasteItems = (recipe.ingredients || []).map(ing => ({
        name: ing.inventoryItemName || ing.name,
        quantity: ing.quantity * multiplier,
        unit: ing.unit,
        recipeName: recipe.name,
        recipeId: recipe.id,
        estimatedServings: quantity,
        ingredients: [{
          name: ing.inventoryItemName || ing.name,
          qty: Math.round(ing.quantity * multiplier * 100) / 100,
          unit: ing.unit,
          inventoryItemId: ing.inventoryItemId,
        }],
        totalWasteValue: 0
      }));

      // Use confirm-leftover-waste to deduct ingredients via FIFO
      await apiClient.confirmLeftoverWaste(rid, [{
        name: recipe.name,
        quantity,
        unit: 'servings',
        recipeName: recipe.name,
        recipeId: recipe.id,
        estimatedServings: quantity,
        ingredients: (recipe.ingredients || []).map(ing => ({
          name: ing.inventoryItemName || ing.name,
          qty: Math.round(ing.quantity * multiplier * 100) / 100,
          unit: ing.unit,
          inventoryItemId: ing.inventoryItemId,
        })),
        totalWasteValue: 0
      }]);

      setSuccess(`Logged waste for ${quantity} ${recipe.name}. Ingredients deducted.`);
      setShowQuickWasteModal(false);
      setWasteFormData({ itemId: '', quantity: '', reason: 'spillage', notes: '' });
      await loadWasteData();
    } catch (e) {
      setError(e.message || 'Failed to log dish waste');
    } finally {
      setLoading(false);
    }
  };

  // Mark expired batch as waste
  const handleMarkExpiredWaste = async (batchId) => {
    if (!rid || !batchId) return;
    setLoading(true);
    try {
      const res = await apiClient.markExpiredWaste(rid, batchId);
      setSuccess(`Marked ${res.itemName} (${res.wasteQty} ${res.unit || ''}) as expired waste`);
      await loadWasteData();
    } catch (e) {
      setError(e.message || 'Failed to mark expired waste');
    } finally {
      setLoading(false);
    }
  };

  // Dismiss expired alert (already used)
  const handleDismissExpired = async (batchId) => {
    // Just remove from local state — batch stays as-is in DB
    if (!expiryAlerts) return;
    setExpiryAlerts({
      ...expiryAlerts,
      expired: (expiryAlerts.expired || []).filter(b => b.id !== batchId),
      summary: {
        ...expiryAlerts.summary,
        expiredCount: Math.max(0, (expiryAlerts.summary?.expiredCount || 1) - 1)
      }
    });
  };

  // AI analyze leftovers
  const handleAnalyzeLeftovers = async () => {
    if (!rid || !leftoverText.trim()) {
      setError('Describe what food is left over');
      return;
    }
    setAnalyzingLeftovers(true);
    setLeftoverAnalysis(null);
    try {
      const res = await apiClient.analyzeLeftovers(rid, leftoverText);
      setLeftoverAnalysis(res);
      setShowLeftoverModal(true);
    } catch (e) {
      setError(e.message || 'Failed to analyze leftovers');
    } finally {
      setAnalyzingLeftovers(false);
    }
  };

  // Confirm leftover waste (items user marked as waste)
  const handleConfirmLeftoverWaste = async (wasteItems) => {
    if (!rid || !wasteItems?.length) return;
    setConfirmingLeftovers(true);
    try {
      await apiClient.confirmLeftoverWaste(rid, wasteItems);
      setSuccess(`Logged waste for ${wasteItems.length} leftover item(s). Inventory updated.`);
      setShowLeftoverModal(false);
      setLeftoverText('');
      setLeftoverAnalysis(null);
      await loadWasteData();
    } catch (e) {
      setError(e.message || 'Failed to confirm leftover waste');
    } finally {
      setConfirmingLeftovers(false);
    }
  };

  // Clear messages after delay
  const clearMessages = useCallback(() => {
    if (error) setTimeout(() => setError(null), 4000);
    if (success) setTimeout(() => setSuccess(null), 3000);
  }, [error, success]);
  clearMessages();

  return {
    loading, error, success,

    // Data
    wasteEntries, wasteSummary, expiryAlerts,

    // Filters
    wastePeriod, setWastePeriod,
    wasteReason, setWasteReason,

    // Modals
    showQuickWasteModal, setShowQuickWasteModal,
    showLeftoverModal, setShowLeftoverModal,

    // Quick waste form
    wasteFormData, setWasteFormData,

    // Leftover analysis
    leftoverText, setLeftoverText,
    leftoverAnalysis, setLeftoverAnalysis,
    analyzingLeftovers, confirmingLeftovers,

    // Handlers
    loadWasteData, loadWasteEntries, loadWasteSummary, loadExpiryAlerts,
    handleCreateWasteEntry, handleCreateDishWasteEntry,
    handleMarkExpiredWaste, handleDismissExpired,
    handleAnalyzeLeftovers, handleConfirmLeftoverWaste,
  };
}
