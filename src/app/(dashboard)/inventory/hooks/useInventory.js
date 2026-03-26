'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '../../../../lib/api';

export default function useInventory() {
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [procurementSubTab, setProcurementSubTab] = useState('suppliers');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showAddPurchaseOrderModal, setShowAddPurchaseOrderModal] = useState(false);
  const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
  const [showAddGRNModal, setShowAddGRNModal] = useState(false);
  const [showAddRequisitionModal, setShowAddRequisitionModal] = useState(false);
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [showAddReturnModal, setShowAddReturnModal] = useState(false);
  const [showAddTransferModal, setShowAddTransferModal] = useState(false);
  const [showQuickStockModal, setShowQuickStockModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    name: '', category: '', unit: '', currentStock: 0, minStock: 0, maxStock: 0,
    costPerUnit: 0, supplier: '', description: '', barcode: '', expiryDate: '', location: ''
  });

  const [supplierFormData, setSupplierFormData] = useState({
    name: '', contact: '', phone: '', email: '', address: '', paymentTerms: '', notes: ''
  });

  const [purchaseOrderFormData, setPurchaseOrderFormData] = useState({
    supplierId: '',
    items: [{ inventoryItemId: '', inventoryItemName: '', quantity: 1, unitPrice: 0 }],
    expectedDeliveryDate: '', notes: ''
  });

  const [recipeFormData, setRecipeFormData] = useState({
    name: '', description: '', category: '', servings: 1, prepTime: 0, cookTime: 0,
    ingredients: [{ inventoryItemId: '', inventoryItemName: '', quantity: 1, unit: '' }],
    instructions: [''], notes: ''
  });

  const [grnFormData, setGrnFormData] = useState({ purchaseOrderId: '', items: [] });

  const [requisitionFormData, setRequisitionFormData] = useState({
    items: [], priority: 'medium', reason: '', notes: ''
  });

  const [invoiceFormData, setInvoiceFormData] = useState({
    supplierId: '', invoiceNumber: '', invoiceDate: new Date().toISOString().split('T')[0],
    items: [], totalAmount: 0, imageUrl: '', notes: ''
  });

  const [returnFormData, setReturnFormData] = useState({
    purchaseOrderId: '', supplierId: '', items: [], returnType: 'damaged', reason: '', notes: ''
  });

  const [transferFormData, setTransferFormData] = useState({
    fromLocation: '', toLocation: '', items: [], reason: '', notes: ''
  });

  // Data arrays
  const [inventoryItems, setInventoryItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [grns, setGrns] = useState([]);
  const [purchaseRequisitions, setPurchaseRequisitions] = useState([]);
  const [supplierInvoices, setSupplierInvoices] = useState([]);
  const [supplierPerformance, setSupplierPerformance] = useState([]);
  const [aiReorderSuggestions, setAiReorderSuggestions] = useState([]);
  const [wastePredictions, setWastePredictions] = useState([]);
  const [wasteSummary, setWasteSummary] = useState(null);
  const [supplierReturns, setSupplierReturns] = useState([]);
  const [stockTransfers, setStockTransfers] = useState([]);

  // Usage tab state
  const [usageTransactions, setUsageTransactions] = useState([]);
  const [usageSummary, setUsageSummary] = useState([]);
  const [usagePeriod, setUsagePeriod] = useState('today');
  const [usageStartDate, setUsageStartDate] = useState('');
  const [usageEndDate, setUsageEndDate] = useState('');
  const [loadingUsage, setLoadingUsage] = useState(false);

  // Voice and AI states
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const [processingVoice, setProcessingVoice] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [processingInvoiceOCR, setProcessingInvoiceOCR] = useState(false);
  const invoiceFileInputRef = useRef(null);
  const [selectedPOForGRN, setSelectedPOForGRN] = useState(null);
  const [selectedRequisition, setSelectedRequisition] = useState(null);

  // Quick stock adjustment
  const [quickStockItems, setQuickStockItems] = useState([]);

  // Load restaurant context
  const loadRestaurantContext = async () => {
    try {
      const userData = localStorage.getItem('user');
      const selectedRestaurantId = localStorage.getItem('selectedRestaurantId');
      if (userData && selectedRestaurantId) {
        const user = JSON.parse(userData);
        setCurrentRestaurant({ id: selectedRestaurantId, ...user });
      }
    } catch (error) {
      console.error('Error loading restaurant context:', error);
      setError('Failed to load restaurant context');
    }
  };

  // Load smart suggestions
  const loadSmartSuggestions = useCallback(async () => {
    if (!currentRestaurant) return;
    try {
      setLoadingSuggestions(true);
      const suggestions = await apiClient.getSmartSuggestions(currentRestaurant.id, 'po');
      setSmartSuggestions(suggestions);
    } catch (error) {
      console.error('Error loading smart suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [currentRestaurant]);

  const loadUsageData = useCallback(async (periodOverride) => {
    if (!currentRestaurant) return;
    try {
      setLoadingUsage(true);
      const period = periodOverride || usagePeriod;
      const params = { period };
      if (period === 'custom' && usageStartDate && usageEndDate) {
        params.startDate = usageStartDate;
        params.endDate = usageEndDate;
      }

      const [txResult, summaryResult] = await Promise.allSettled([
        apiClient.getInventoryTransactions(currentRestaurant.id, {
          ...(period === 'today' ? { date: new Date().toISOString().split('T')[0] } : {}),
          limit: 100,
        }),
        apiClient.getInventoryUsageSummary(currentRestaurant.id, params),
      ]);

      setUsageTransactions(txResult.status === 'fulfilled' ? (txResult.value.transactions || []) : []);
      setUsageSummary(summaryResult.status === 'fulfilled' ? (summaryResult.value.summary || []) : []);
    } catch (error) {
      console.error('Error loading usage data:', error);
    } finally {
      setLoadingUsage(false);
    }
  }, [currentRestaurant, usagePeriod, usageStartDate, usageEndDate]);

  const loadSCMData = useCallback(async () => {
    if (!currentRestaurant) return;
    try {
      const subTab = activeTab === 'procurement' ? procurementSubTab : null;
      if (subTab === 'grn') {
        const grnsData = await apiClient.getGRNs(currentRestaurant.id);
        setGrns(grnsData.grns || []);
      } else if (subTab === 'requisitions') {
        const reqsData = await apiClient.getPurchaseRequisitions(currentRestaurant.id);
        setPurchaseRequisitions(reqsData.requisitions || []);
      } else if (subTab === 'invoices') {
        const invoicesData = await apiClient.getSupplierInvoices(currentRestaurant.id);
        setSupplierInvoices(invoicesData.invoices || []);
      } else if (subTab === 'suppliers') {
        const perfData = await apiClient.getAllSuppliersPerformance(currentRestaurant.id);
        setSupplierPerformance(perfData.performances || []);
      } else if (subTab === 'returns') {
        const returnsData = await apiClient.getSupplierReturns(currentRestaurant.id);
        setSupplierReturns(returnsData.returns || []);
      } else if (subTab === 'transfers') {
        const transfersData = await apiClient.getStockTransfers(currentRestaurant.id);
        setStockTransfers(transfersData.transfers || []);
      } else if (activeTab === 'insights') {
        const suggestionsData = await apiClient.getAIReorderSuggestions(currentRestaurant.id);
        setAiReorderSuggestions(suggestionsData.suggestions || []);
        const wasteData = await apiClient.getAIWastePrediction(currentRestaurant.id);
        setWastePredictions(wasteData.predictions || []);
        const summaryData = await apiClient.getAIWasteSummary(currentRestaurant.id);
        setWasteSummary(summaryData.summary || null);
      }
    } catch (error) {
      console.error('Error loading SCM data:', error);
    }
  }, [currentRestaurant, activeTab, procurementSubTab]);

  const loadInventoryData = useCallback(async () => {
    if (!currentRestaurant) return;
    try {
      setLoading(true);
      setError(null);
      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (selectedCategory !== 'all') filters.category = selectedCategory;

      const results = await Promise.allSettled([
        apiClient.getInventoryItems(currentRestaurant.id, filters),
        apiClient.getInventoryCategories(currentRestaurant.id),
        apiClient.getSuppliers(currentRestaurant.id),
        apiClient.getInventoryDashboard(currentRestaurant.id),
        apiClient.getRecipes(currentRestaurant.id),
        apiClient.getPurchaseOrders(currentRestaurant.id)
      ]);

      const [itemsResult, categoriesResult, suppliersResult, dashboardResult, recipesResult, ordersResult] = results;
      setInventoryItems(itemsResult.status === 'fulfilled' ? (itemsResult.value.items || []) : []);
      setCategories(categoriesResult.status === 'fulfilled' ? (categoriesResult.value.categories || []) : []);
      setSuppliers(suppliersResult.status === 'fulfilled' ? (suppliersResult.value.suppliers || []) : []);
      setDashboardStats(dashboardResult.status === 'fulfilled' ? (dashboardResult.value.stats || null) : null);
      setRecipes(recipesResult.status === 'fulfilled' ? (recipesResult.value.recipes || []) : []);
      setPurchaseOrders(ordersResult.status === 'fulfilled' ? (ordersResult.value.orders || []) : []);

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.warn(`Failed to load data at index ${index}:`, result.reason);
        }
      });
    } catch (error) {
      console.error('Error loading inventory data:', error);
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  }, [currentRestaurant, searchTerm, selectedCategory]);

  // Init effects
  useEffect(() => {
    setIsClient(true);
    loadRestaurantContext();
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (currentRestaurant) {
      loadInventoryData();
      loadSCMData();
      loadSmartSuggestions();
    }
  }, [currentRestaurant, searchTerm, selectedCategory, loadInventoryData, loadSCMData, loadSmartSuggestions]);

  useEffect(() => {
    if (currentRestaurant && activeTab) loadSCMData();
  }, [activeTab, currentRestaurant, loadSCMData]);

  useEffect(() => {
    if (currentRestaurant && activeTab === 'usage') {
      loadUsageData();
    }
  }, [activeTab, currentRestaurant]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Status helpers
  const getStatusColor = (status) => {
    switch (status) {
      case 'low': return '#ef4444';
      case 'good': return '#10b981';
      case 'expired': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#3b82f6';
      case 'sent': return '#8b5cf6';
      case 'received': return '#10b981';
      case 'delivered': return '#059669';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Filtered & sorted items
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    if (sortBy === 'name') { aValue = (aValue || '').toLowerCase(); bValue = (bValue || '').toLowerCase(); }
    if (sortOrder === 'asc') return aValue > bValue ? 1 : -1;
    return aValue < bValue ? 1 : -1;
  });

  // CRUD handlers
  const handleAddItem = async () => {
    if (!currentRestaurant) return;
    try {
      setLoading(true); setError(null);
      const response = await apiClient.createInventoryItem(currentRestaurant.id, formData);
      if (response.item) {
        setSuccess('Item added successfully!');
        setShowAddModal(false);
        setFormData({ name: '', category: '', unit: '', currentStock: 0, minStock: 0, maxStock: 0, costPerUnit: 0, supplier: '', description: '', barcode: '', expiryDate: '', location: '' });
        loadInventoryData();
      }
    } catch (error) {
      console.error('Error adding item:', error);
      setError(error.message || 'Failed to add item');
    } finally { setLoading(false); }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name, category: item.category, unit: item.unit,
      currentStock: item.currentStock, minStock: item.minStock, maxStock: item.maxStock,
      costPerUnit: item.costPerUnit, supplier: item.supplier, description: item.description,
      barcode: item.barcode, expiryDate: item.expiryDate || '', location: item.location
    });
    setShowEditModal(true);
  };

  const handleUpdateItem = async () => {
    if (!currentRestaurant || !editingItem) return;
    try {
      setLoading(true); setError(null);
      const response = await apiClient.updateInventoryItem(currentRestaurant.id, editingItem.id, formData);
      if (response.item) {
        setSuccess('Item updated successfully!');
        setShowEditModal(false);
        setEditingItem(null);
        loadInventoryData();
      }
    } catch (error) {
      console.error('Error updating item:', error);
      setError(error.message || 'Failed to update item');
    } finally { setLoading(false); }
  };

  const handleDeleteItem = async (itemId) => {
    if (!currentRestaurant) return;
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        setLoading(true); setError(null);
        await apiClient.deleteInventoryItem(currentRestaurant.id, itemId);
        setSuccess('Item deleted successfully!');
        loadInventoryData();
      } catch (error) {
        console.error('Error deleting item:', error);
        setError(error.message || 'Failed to delete item');
      } finally { setLoading(false); }
    }
  };

  // Quick stock update (batch adjust multiple items at once)
  const handleQuickStockUpdate = async (updates) => {
    if (!currentRestaurant) return;
    try {
      setLoading(true); setError(null);
      let updatedCount = 0;
      for (const update of updates) {
        if (update.adjustment !== 0) {
          const item = inventoryItems.find(i => i.id === update.itemId);
          if (item) {
            await apiClient.updateInventoryItem(currentRestaurant.id, update.itemId, {
              ...item,
              currentStock: Math.max(0, item.currentStock + update.adjustment)
            });
            updatedCount++;
          }
        }
      }
      if (updatedCount > 0) {
        setSuccess(`Updated ${updatedCount} item(s) successfully!`);
        loadInventoryData();
      }
      setShowQuickStockModal(false);
      setQuickStockItems([]);
    } catch (error) {
      console.error('Error updating stock:', error);
      setError(error.message || 'Failed to update stock');
    } finally { setLoading(false); }
  };

  // Supplier handlers
  const handleAddSupplier = async () => {
    if (!currentRestaurant) return;
    if (!supplierFormData.name || !supplierFormData.contact) {
      setError('Supplier name and contact person are required'); return;
    }
    try {
      setLoading(true); setError(null);
      const response = await apiClient.createSupplier(currentRestaurant.id, supplierFormData);
      if (response.supplier) {
        setSuccess('Supplier added successfully!');
        setShowAddSupplierModal(false);
        setSupplierFormData({ name: '', contact: '', phone: '', email: '', address: '', paymentTerms: '', notes: '' });
        loadInventoryData();
      }
    } catch (error) {
      console.error('Error adding supplier:', error);
      setError(error.message || 'Failed to add supplier');
    } finally { setLoading(true); }
  };

  const handleDeleteSupplier = async (supplierId) => {
    if (!currentRestaurant) return;
    if (confirm('Are you sure you want to delete this supplier?')) {
      try {
        setLoading(true); setError(null);
        await apiClient.deleteSupplier(currentRestaurant.id, supplierId);
        setSuccess('Supplier deleted successfully!');
        loadInventoryData();
      } catch (error) {
        console.error('Error deleting supplier:', error);
        setError(error.message || 'Failed to delete supplier');
      } finally { setLoading(false); }
    }
  };

  // Purchase Order handlers
  const handleAddPurchaseOrder = async () => {
    if (!currentRestaurant) return;
    if (!purchaseOrderFormData.supplierId || purchaseOrderFormData.items.length === 0) {
      setError('Please select a supplier and add at least one item'); return;
    }
    try {
      setLoading(true); setError(null);
      const response = await apiClient.createPurchaseOrder(currentRestaurant.id, purchaseOrderFormData);
      if (response.order) {
        setSuccess('Purchase order created successfully!');
        setShowAddPurchaseOrderModal(false);
        setPurchaseOrderFormData({ supplierId: '', items: [{ inventoryItemId: '', inventoryItemName: '', quantity: 1, unitPrice: 0 }], expectedDeliveryDate: '', notes: '' });
        loadInventoryData();
      }
    } catch (error) {
      console.error('Error creating purchase order:', error);
      setError(error.message || 'Failed to create purchase order');
    } finally { setLoading(false); }
  };

  const addPurchaseOrderItem = () => {
    setPurchaseOrderFormData({
      ...purchaseOrderFormData,
      items: [...purchaseOrderFormData.items, { inventoryItemId: '', inventoryItemName: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const removePurchaseOrderItem = (index) => {
    setPurchaseOrderFormData({
      ...purchaseOrderFormData,
      items: purchaseOrderFormData.items.filter((_, i) => i !== index)
    });
  };

  const updatePurchaseOrderItem = (index, field, value) => {
    const newItems = [...purchaseOrderFormData.items];
    newItems[index][field] = value;
    if (field === 'inventoryItemId') {
      const selectedItem = inventoryItems.find(item => item.id === value);
      newItems[index].inventoryItemName = selectedItem ? selectedItem.name : '';
    }
    setPurchaseOrderFormData({ ...purchaseOrderFormData, items: newItems });
  };

  // Recipe handlers
  const handleAddRecipe = async () => {
    if (!currentRestaurant) return;
    if (!recipeFormData.name || recipeFormData.ingredients.length === 0) {
      setError('Please provide recipe name and at least one ingredient'); return;
    }
    try {
      setLoading(true); setError(null);
      const response = await apiClient.createRecipe(currentRestaurant.id, recipeFormData);
      if (response.recipe) {
        setSuccess('Recipe created successfully!');
        setShowAddRecipeModal(false);
        setRecipeFormData({ name: '', description: '', category: '', servings: 1, prepTime: 0, cookTime: 0, ingredients: [{ inventoryItemId: '', inventoryItemName: '', quantity: 1, unit: '' }], instructions: [''], notes: '' });
        loadInventoryData();
      }
    } catch (error) {
      console.error('Error creating recipe:', error);
      setError(error.message || 'Failed to create recipe');
    } finally { setLoading(false); }
  };

  const addRecipeIngredient = () => {
    setRecipeFormData({
      ...recipeFormData,
      ingredients: [...recipeFormData.ingredients, { inventoryItemId: '', inventoryItemName: '', quantity: 1, unit: '' }]
    });
  };

  const removeRecipeIngredient = (index) => {
    setRecipeFormData({
      ...recipeFormData,
      ingredients: recipeFormData.ingredients.filter((_, i) => i !== index)
    });
  };

  const updateRecipeIngredient = (index, field, value) => {
    const newIngredients = [...recipeFormData.ingredients];
    newIngredients[index][field] = value;
    if (field === 'inventoryItemId') {
      const selectedItem = inventoryItems.find(item => item.id === value);
      newIngredients[index].inventoryItemName = selectedItem ? selectedItem.name : '';
    }
    setRecipeFormData({ ...recipeFormData, ingredients: newIngredients });
  };

  const addRecipeInstruction = () => {
    setRecipeFormData({ ...recipeFormData, instructions: [...recipeFormData.instructions, ''] });
  };

  const removeRecipeInstruction = (index) => {
    setRecipeFormData({ ...recipeFormData, instructions: recipeFormData.instructions.filter((_, i) => i !== index) });
  };

  const updateRecipeInstruction = (index, value) => {
    const newInstructions = [...recipeFormData.instructions];
    newInstructions[index] = value;
    setRecipeFormData({ ...recipeFormData, instructions: newInstructions });
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (!currentRestaurant) return;
    if (confirm('Are you sure you want to delete this recipe?')) {
      try {
        setLoading(true); setError(null);
        await apiClient.deleteRecipe(currentRestaurant.id, recipeId);
        setSuccess('Recipe deleted successfully!');
        loadInventoryData();
      } catch (error) {
        console.error('Error deleting recipe:', error);
        setError(error.message || 'Failed to delete recipe');
      } finally { setLoading(false); }
    }
  };

  // Order handlers
  const handleEmailPurchaseOrder = async (order) => {
    if (!currentRestaurant) return;
    try {
      setLoading(true); setError(null);
      const supplier = suppliers.find(s => s.id === order.supplierId);
      if (!supplier || !supplier.email) {
        setError('Supplier email not found. Please add email to supplier details.'); return;
      }
      const response = await apiClient.emailPurchaseOrder(currentRestaurant.id, order.id, {
        supplierEmail: supplier.email, supplierName: supplier.name
      });
      if (response.success) setSuccess('Purchase order sent successfully to supplier!');
    } catch (error) {
      console.error('Error sending purchase order email:', error);
      setError(error.message || 'Failed to send purchase order email');
    } finally { setLoading(false); }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    if (!currentRestaurant) return;
    try {
      setLoading(true); setError(null);
      await apiClient.updatePurchaseOrder(currentRestaurant.id, orderId, { status });
      setSuccess(`Order ${status} successfully!`);
      loadInventoryData();
    } catch (error) {
      console.error('Error updating order:', error);
      setError(error.message || 'Failed to update order');
    } finally { setLoading(false); }
  };

  // Voice functions
  const startVoiceListeningPO = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setVoiceError('Speech recognition not supported. Please use Chrome or Edge.'); return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => { setIsListeningVoice(true); setVoiceTranscript(''); setVoiceError(''); };
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setVoiceTranscript(transcript);
      await processVoicePOCommand(transcript);
      setTimeout(() => { recognition.stop(); setIsListeningVoice(false); }, 100);
    };
    recognition.onerror = (event) => { setVoiceError(`Error: ${event.error}`); setIsListeningVoice(false); recognition.stop(); };
    recognition.onend = () => setIsListeningVoice(false);
    recognition.start();
  };

  const processVoicePOCommand = async (transcript) => {
    if (!currentRestaurant) return;
    try {
      setProcessingVoice(true); setError(null);
      const response = await apiClient.processVoicePurchaseOrder(transcript, currentRestaurant.id);
      if (response.success && response.items) {
        setPurchaseOrderFormData({
          supplierId: response.supplierId || '',
          items: response.items.map(item => ({
            inventoryItemId: item.inventoryItemId, inventoryItemName: item.inventoryItemName,
            quantity: item.quantity, unitPrice: item.unitPrice, unit: item.unit
          })),
          expectedDeliveryDate: response.expectedDeliveryDate || '', notes: response.notes || ''
        });
        setShowAddPurchaseOrderModal(true);
        setSuccess(`Voice command processed! ${response.items.length} item(s) added.`);
      } else {
        setError('Could not process voice command. Please try again.');
      }
    } catch (error) {
      console.error('Voice PO processing error:', error);
      setError(error.message || 'Failed to process voice command');
    } finally { setProcessingVoice(false); }
  };

  // Report generation
  const generateReport = (type) => {
    let reportContent = '';
    let reportTitle = '';
    switch (type) {
      case 'low-stock':
        const lowStockItems = inventoryItems.filter(item => item.currentStock <= item.minStock);
        reportTitle = 'Low Stock Report';
        reportContent = `Low Stock Items (${lowStockItems.length} items):\n\n`;
        lowStockItems.forEach(item => { reportContent += `• ${item.name}: ${item.currentStock} ${item.unit} (Min: ${item.minStock})\n`; });
        break;
      case 'expired':
        const expiredItems = inventoryItems.filter(item => item.expiryDate && new Date(item.expiryDate) < new Date());
        reportTitle = 'Expired Items Report';
        reportContent = `Expired Items (${expiredItems.length} items):\n\n`;
        expiredItems.forEach(item => { reportContent += `• ${item.name}: Expired on ${new Date(item.expiryDate).toLocaleDateString()}\n`; });
        break;
      case 'value':
        const totalValue = inventoryItems.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0);
        reportTitle = 'Inventory Value Report';
        reportContent = `Total Inventory Value: ${totalValue.toLocaleString()}\n\nBreakdown by Category:\n`;
        const categoryValues = {};
        inventoryItems.forEach(item => {
          if (!categoryValues[item.category]) categoryValues[item.category] = 0;
          categoryValues[item.category] += item.currentStock * item.costPerUnit;
        });
        Object.entries(categoryValues).forEach(([category, value]) => {
          reportContent += `• ${category}: ${value.toLocaleString()}\n`;
        });
        break;
      case 'supplier':
        reportTitle = 'Supplier Report';
        reportContent = `Suppliers (${suppliers.length} suppliers):\n\n`;
        suppliers.forEach(supplier => {
          reportContent += `• ${supplier.name}: ${supplier.contact}\n`;
          if (supplier.phone) reportContent += `  Phone: ${supplier.phone}\n`;
          if (supplier.email) reportContent += `  Email: ${supplier.email}\n`;
          reportContent += '\n';
        });
        break;
    }
    setReportData({ title: reportTitle, content: reportContent });
  };

  // Invoice OCR
  const handleInvoiceOCR = async (file) => {
    if (!currentRestaurant || !file) return;
    try {
      setProcessingInvoiceOCR(true); setError(null);
      const formDataUpload = new FormData();
      formDataUpload.append('invoice', file);
      const response = await apiClient.processInvoiceOCR(currentRestaurant.id, formDataUpload);
      if (response.success) {
        setInvoiceFormData(prev => ({
          ...prev,
          invoiceNumber: response.invoiceNumber || prev.invoiceNumber,
          invoiceDate: response.invoiceDate || prev.invoiceDate,
          items: response.items || prev.items,
          totalAmount: response.totalAmount || prev.totalAmount
        }));
        setSuccess('Invoice scanned successfully!');
      }
    } catch (error) {
      console.error('Invoice OCR error:', error);
      setError(error.message || 'Failed to scan invoice');
    } finally { setProcessingInvoiceOCR(false); }
  };

  // Modal style helpers
  const getModalStyles = () => ({
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'center',
    zIndex: 1000, padding: isMobile ? '0' : '20px', overflowY: 'auto'
  });

  const getModalContentStyles = () => ({
    backgroundColor: 'white',
    borderRadius: isMobile ? '0' : '24px',
    padding: isMobile ? '20px' : '32px',
    width: '100%', maxWidth: isMobile ? '100%' : '700px',
    maxHeight: isMobile ? '100vh' : '90vh', overflowY: 'auto',
    boxShadow: isMobile ? 'none' : '0 25px 50px rgba(0,0,0,0.25)',
    animation: isMobile ? 'none' : 'slideInUp 0.3s ease-out',
    minHeight: isMobile ? '100vh' : 'auto'
  });

  return {
    // State
    loading, isClient, isMobile, activeTab, setActiveTab, procurementSubTab, setProcurementSubTab,
    searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, sortBy, setSortBy,
    sortOrder, setSortOrder, error, setError, success, setSuccess, currentRestaurant,
    dashboardStats,

    // Modal states
    showAddModal, setShowAddModal, showEditModal, setShowEditModal,
    showAddSupplierModal, setShowAddSupplierModal, showAddPurchaseOrderModal, setShowAddPurchaseOrderModal,
    showAddRecipeModal, setShowAddRecipeModal, showAddGRNModal, setShowAddGRNModal,
    showAddRequisitionModal, setShowAddRequisitionModal, showAddInvoiceModal, setShowAddInvoiceModal,
    showAddReturnModal, setShowAddReturnModal, showAddTransferModal, setShowAddTransferModal,
    showQuickStockModal, setShowQuickStockModal, editingItem,

    // Form data
    formData, setFormData, supplierFormData, setSupplierFormData,
    purchaseOrderFormData, setPurchaseOrderFormData, recipeFormData, setRecipeFormData,
    grnFormData, setGrnFormData, requisitionFormData, setRequisitionFormData,
    invoiceFormData, setInvoiceFormData, returnFormData, setReturnFormData,
    transferFormData, setTransferFormData,

    // Data
    inventoryItems, categories, suppliers, recipes, purchaseOrders, reportData, setReportData,
    grns, purchaseRequisitions, supplierInvoices, supplierPerformance,
    aiReorderSuggestions, wastePredictions, wasteSummary,
    supplierReturns, stockTransfers, sortedItems, filteredItems,
    usageTransactions, usageSummary, usagePeriod, setUsagePeriod,
    usageStartDate, setUsageStartDate, usageEndDate, setUsageEndDate,
    loadingUsage, loadUsageData,

    // Voice / AI
    isListeningVoice, voiceTranscript, voiceError, processingVoice,
    smartSuggestions, loadingSuggestions, processingInvoiceOCR,
    invoiceFileInputRef, selectedPOForGRN, setSelectedPOForGRN,
    selectedRequisition, setSelectedRequisition,
    quickStockItems, setQuickStockItems,

    // Handlers
    handleAddItem, handleEditItem, handleUpdateItem, handleDeleteItem,
    handleQuickStockUpdate, handleAddSupplier, handleDeleteSupplier,
    handleAddPurchaseOrder, addPurchaseOrderItem, removePurchaseOrderItem, updatePurchaseOrderItem,
    handleAddRecipe, addRecipeIngredient, removeRecipeIngredient, updateRecipeIngredient,
    addRecipeInstruction, removeRecipeInstruction, updateRecipeInstruction, handleDeleteRecipe,
    handleEmailPurchaseOrder, handleUpdateOrderStatus,
    startVoiceListeningPO, generateReport, handleInvoiceOCR,
    loadInventoryData, loadSCMData,

    // Helpers
    getStatusColor, getOrderStatusColor, getModalStyles, getModalContentStyles,
  };
}
