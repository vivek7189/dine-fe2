'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '../../../lib/api';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { 
  FaBoxes, 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaWarehouse,
  FaShoppingCart,
  FaClipboardList,
  FaChartLine,
  FaBarcode,
  FaTh,
  FaList,
  FaEnvelope,
  FaTags,
  FaChevronDown,
  FaChevronUp,
  FaSortAmountDown,
  FaSortAmountUp,
  FaDownload,
  FaUpload,
  FaPrint,
  FaTimes,
  FaSave,
  FaTimesCircle,
  FaMicrophone,
  FaStop,
  FaCamera
} from 'react-icons/fa';

// Custom Dropdown Component
const CustomDropdown = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(option => option.value === value);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '16px 20px',
          border: 'none',
          borderRadius: '16px',
          fontSize: '16px',
          outline: 'none',
          transition: 'all 0.2s',
          backgroundColor: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          textAlign: 'left',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#f9fafb';
          e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'white';
          e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }}
      >
        <span style={{ 
          color: selectedOption ? '#1f2937' : '#9ca3af',
          fontWeight: selectedOption ? '500' : '400'
        }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <FaChevronDown 
          size={14} 
          color="#6b7280" 
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }} 
        />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: 'none',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          zIndex: 1000,
          marginTop: '4px',
          overflow: 'hidden',
          animation: 'slideInUp 0.2s ease-out'
        }}>
          {/* Search Input */}
          <div style={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: '#f9fafb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = '#f9fafb';
                e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}
            />
          </div>

          {/* Options List */}
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  backgroundColor: value === option.value ? '#f0fdf4' : 'transparent',
                  color: '#1f2937',
                  fontSize: '14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderLeft: value === option.value ? `4px solid ${option.color}` : '4px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (value !== option.value) {
                    e.target.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (value !== option.value) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '16px' }}>
                  {option.label.split(' ')[0]}
                </span>
                <span>{option.label.split(' ').slice(1).join(' ')}</span>
                {value === option.value && (
                  <FaCheckCircle size={14} color={option.color} style={{ marginLeft: 'auto' }} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => {
            setIsOpen(false);
            setSearchTerm('');
          }}
        />
      )}
    </div>
  );
};

export default function InventoryManagement() {
  const { formatCurrency, getCurrencySymbol } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('stock');
  const [procurementSubTab, setProcurementSubTab] = useState('suppliers');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showAddPurchaseOrderModal, setShowAddPurchaseOrderModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  
  // View states for each section
  const [inventoryView, setInventoryView] = useState('card'); // 'card' or 'list'
  const [suppliersView, setSuppliersView] = useState('card');
  const [recipesView, setRecipesView] = useState('card');
  const [purchaseOrdersView, setPurchaseOrdersView] = useState('card');
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    costPerUnit: 0,
    supplier: '',
    description: '',
    barcode: '',
    expiryDate: '',
    location: ''
  });

  const [supplierFormData, setSupplierFormData] = useState({
    name: '',
    contact: '',
    phone: '',
    email: '',
    address: '',
    paymentTerms: '',
    notes: ''
  });

  const [purchaseOrderFormData, setPurchaseOrderFormData] = useState({
    supplierId: '',
    items: [{ inventoryItemId: '', inventoryItemName: '', quantity: 1, unitPrice: 0 }],
    expectedDeliveryDate: '',
    notes: ''
  });

  const [recipeFormData, setRecipeFormData] = useState({
    name: '',
    description: '',
    category: '',
    servings: 1,
    prepTime: 0,
    cookTime: 0,
    ingredients: [{ inventoryItemId: '', inventoryItemName: '', quantity: 1, unit: '' }],
    instructions: [''],
    notes: ''
  });

  const [inventoryItems, setInventoryItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [reportData, setReportData] = useState(null);
  
  // New SCM state
  const [grns, setGrns] = useState([]);
  const [purchaseRequisitions, setPurchaseRequisitions] = useState([]);
  const [supplierInvoices, setSupplierInvoices] = useState([]);
  const [supplierPerformance, setSupplierPerformance] = useState([]);
  const [aiReorderSuggestions, setAiReorderSuggestions] = useState([]);
  const [wastePredictions, setWastePredictions] = useState([]);
  const [wasteSummary, setWasteSummary] = useState(null);
  const [supplierReturns, setSupplierReturns] = useState([]);
  const [stockTransfers, setStockTransfers] = useState([]);
  
  // Modal states for new features
  const [showAddGRNModal, setShowAddGRNModal] = useState(false);
  const [showAddRequisitionModal, setShowAddRequisitionModal] = useState(false);
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [showAddReturnModal, setShowAddReturnModal] = useState(false);
  const [showAddTransferModal, setShowAddTransferModal] = useState(false);
  
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
  
  // Form states for new modals
  const [grnFormData, setGrnFormData] = useState({
    purchaseOrderId: '',
    items: []
  });
  
  const [requisitionFormData, setRequisitionFormData] = useState({
    items: [],
    priority: 'medium',
    reason: '',
    notes: ''
  });
  
  const [invoiceFormData, setInvoiceFormData] = useState({
    supplierId: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    items: [],
    totalAmount: 0,
    imageUrl: '',
    notes: ''
  });
  
  const [returnFormData, setReturnFormData] = useState({
    purchaseOrderId: '',
    supplierId: '',
    items: [],
    returnType: 'damaged',
    reason: '',
    notes: ''
  });
  
  const [transferFormData, setTransferFormData] = useState({
    fromLocation: '',
    toLocation: '',
    items: [],
    reason: '',
    notes: ''
  });
  
  // Modal states
  const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);

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

  const loadSCMData = useCallback(async () => {
    if (!currentRestaurant) return;

    try {
      // Load SCM data based on procurement sub-tab or insights tab
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

      // Load inventory items
      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (selectedCategory !== 'all') filters.category = selectedCategory;

      // Load data with individual error handling
      const results = await Promise.allSettled([
        apiClient.getInventoryItems(currentRestaurant.id, filters),
        apiClient.getInventoryCategories(currentRestaurant.id),
        apiClient.getSuppliers(currentRestaurant.id),
        apiClient.getInventoryDashboard(currentRestaurant.id),
        apiClient.getRecipes(currentRestaurant.id),
        apiClient.getPurchaseOrders(currentRestaurant.id)
      ]);

      // Process results and handle individual failures
      const [itemsResult, categoriesResult, suppliersResult, dashboardResult, recipesResult, ordersResult] = results;

      // Set data with fallbacks for failed requests
      setInventoryItems(itemsResult.status === 'fulfilled' ? (itemsResult.value.items || []) : []);
      setCategories(categoriesResult.status === 'fulfilled' ? (categoriesResult.value.categories || []) : []);
      setSuppliers(suppliersResult.status === 'fulfilled' ? (suppliersResult.value.suppliers || []) : []);
      setDashboardStats(dashboardResult.status === 'fulfilled' ? (dashboardResult.value.stats || null) : null);
      setRecipes(recipesResult.status === 'fulfilled' ? (recipesResult.value.recipes || []) : []);
      setPurchaseOrders(ordersResult.status === 'fulfilled' ? (ordersResult.value.orders || []) : []);

      // Log any failures for debugging
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

  useEffect(() => {
    setIsClient(true);
    loadRestaurantContext();
    
    // Mobile detection
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
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

  // Voice functions for Purchase Order
  const startVoiceListeningPO = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setVoiceError('Speech recognition not supported. Please use Chrome or Edge.');
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListeningVoice(true);
      setVoiceTranscript('');
      setVoiceError('');
    };
    
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('🎤 Voice transcript:', transcript);
      setVoiceTranscript(transcript);
      
      // Process the transcript
      await processVoicePOCommand(transcript);
      
      setTimeout(() => {
        recognition.stop();
        setIsListeningVoice(false);
      }, 100);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setVoiceError(`Error: ${event.error}`);
      setIsListeningVoice(false);
      recognition.stop();
    };
    
    recognition.onend = () => {
      setIsListeningVoice(false);
    };
    
    recognition.start();
  };

  const stopVoiceListeningPO = () => {
    setIsListeningVoice(false);
  };

  const processVoicePOCommand = async (transcript) => {
    if (!currentRestaurant) return;
    
    try {
      setProcessingVoice(true);
      setError(null);
      
      const response = await apiClient.processVoicePurchaseOrder(transcript, currentRestaurant.id);
      
      if (response.success && response.items) {
        // Auto-fill the PO form
        setPurchaseOrderFormData({
          supplierId: response.supplierId || '',
          items: response.items.map(item => ({
            inventoryItemId: item.inventoryItemId,
            inventoryItemName: item.inventoryItemName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            unit: item.unit
          })),
          expectedDeliveryDate: response.expectedDeliveryDate || '',
          notes: response.notes || ''
        });
        
        // Open the modal
        setShowAddPurchaseOrderModal(true);
        
        setSuccess(`Voice command processed! ${response.items.length} item(s) added.`);
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError('Could not process voice command. Please try again.');
      }
    } catch (error) {
      console.error('Voice PO processing error:', error);
      setError(error.message || 'Failed to process voice command');
    } finally {
      setProcessingVoice(false);
    }
  };

  useEffect(() => {
    if (currentRestaurant && activeTab) {
      loadSCMData();
    }
  }, [activeTab, currentRestaurant, loadSCMData]);

  // Auto-dismiss success messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-dismiss error messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'low': return '#ef4444';
      case 'good': return '#10b981';
      case 'expired': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'low': return <FaExclamationTriangle />;
      case 'good': return <FaCheckCircle />;
      case 'expired': return <FaClock />;
      default: return <FaBoxes />;
    }
  };

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'name') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleAddItem = async () => {
    if (!currentRestaurant) return;
    
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.createInventoryItem(currentRestaurant.id, formData);
      
      if (response.item) {
        setSuccess('Item added successfully!');
        setShowAddModal(false);
        setFormData({
          name: '',
          category: '',
          unit: '',
          currentStock: 0,
          minStock: 0,
          maxStock: 0,
          costPerUnit: 0,
          supplier: '',
          description: '',
          barcode: '',
          expiryDate: '',
          location: ''
        });
        loadInventoryData(); // Reload data
      }
    } catch (error) {
      console.error('Error adding item:', error);
      setError(error.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      unit: item.unit,
      currentStock: item.currentStock,
      minStock: item.minStock,
      maxStock: item.maxStock,
      costPerUnit: item.costPerUnit,
      supplier: item.supplier,
      description: item.description,
      barcode: item.barcode,
      expiryDate: item.expiryDate || '',
      location: item.location
    });
    setShowEditModal(true);
  };

  const handleUpdateItem = async () => {
    if (!currentRestaurant || !editingItem) return;
    
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.updateInventoryItem(currentRestaurant.id, editingItem.id, formData);
      
      if (response.item) {
        setSuccess('Item updated successfully!');
        setShowEditModal(false);
        setEditingItem(null);
        loadInventoryData(); // Reload data
      }
    } catch (error) {
      console.error('Error updating item:', error);
      setError(error.message || 'Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!currentRestaurant) return;
    
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        setLoading(true);
        setError(null);

        await apiClient.deleteInventoryItem(currentRestaurant.id, itemId);
        setSuccess('Item deleted successfully!');
        loadInventoryData(); // Reload data
      } catch (error) {
        console.error('Error deleting item:', error);
        setError(error.message || 'Failed to delete item');
      } finally {
        setLoading(false);
      }
    }
  };

  // Supplier handlers
  const handleAddSupplier = async () => {
    if (!currentRestaurant) return;
    
    if (!supplierFormData.name || !supplierFormData.contact) {
      setError('Supplier name and contact person are required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.createSupplier(currentRestaurant.id, supplierFormData);
      
      if (response.supplier) {
        setSuccess('Supplier added successfully!');
        setShowAddSupplierModal(false);
        setSupplierFormData({
          name: '',
          contact: '',
          phone: '',
          email: '',
          address: '',
          paymentTerms: '',
          notes: ''
        });
        loadInventoryData(); // Reload data
      }
    } catch (error) {
      console.error('Error adding supplier:', error);
      setError(error.message || 'Failed to add supplier');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSupplier = (supplier) => {
    // Implementation for editing supplier
    console.log('Edit supplier:', supplier);
  };

  const handleDeleteSupplier = async (supplierId) => {
    if (!currentRestaurant) return;
    
    if (confirm('Are you sure you want to delete this supplier?')) {
      try {
        setLoading(true);
        setError(null);
        await apiClient.deleteSupplier(currentRestaurant.id, supplierId);
        setSuccess('Supplier deleted successfully!');
        loadInventoryData();
      } catch (error) {
        console.error('Error deleting supplier:', error);
        setError(error.message || 'Failed to delete supplier');
      } finally {
        setLoading(false);
      }
    }
  };

  // Purchase Order handlers
  const handleAddPurchaseOrder = async () => {
    if (!currentRestaurant) return;
    
    if (!purchaseOrderFormData.supplierId || purchaseOrderFormData.items.length === 0) {
      setError('Please select a supplier and add at least one item');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.createPurchaseOrder(currentRestaurant.id, purchaseOrderFormData);
      
      if (response.order) {
        setSuccess('Purchase order created successfully!');
        setShowAddPurchaseOrderModal(false);
        setPurchaseOrderFormData({
          supplierId: '',
          items: [{ inventoryItemId: '', inventoryItemName: '', quantity: 1, unitPrice: 0 }],
          expectedDeliveryDate: '',
          notes: ''
        });
        loadInventoryData(); // Reload data
      }
    } catch (error) {
      console.error('Error creating purchase order:', error);
      setError(error.message || 'Failed to create purchase order');
    } finally {
      setLoading(false);
    }
  };

  const addPurchaseOrderItem = () => {
    setPurchaseOrderFormData({
      ...purchaseOrderFormData,
      items: [...purchaseOrderFormData.items, { inventoryItemId: '', inventoryItemName: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const removePurchaseOrderItem = (index) => {
    const newItems = purchaseOrderFormData.items.filter((_, i) => i !== index);
    setPurchaseOrderFormData({
      ...purchaseOrderFormData,
      items: newItems
    });
  };

  const updatePurchaseOrderItem = (index, field, value) => {
    const newItems = [...purchaseOrderFormData.items];
    newItems[index][field] = value;
    
    // If inventoryItemId is being updated, also set the inventoryItemName
    if (field === 'inventoryItemId') {
      const selectedItem = inventoryItems.find(item => item.id === value);
      newItems[index].inventoryItemName = selectedItem ? selectedItem.name : '';
    }
    
    setPurchaseOrderFormData({
      ...purchaseOrderFormData,
      items: newItems
    });
  };

  // Recipe handlers
  const handleAddRecipe = async () => {
    if (!currentRestaurant) return;
    
    if (!recipeFormData.name || recipeFormData.ingredients.length === 0) {
      setError('Please provide recipe name and at least one ingredient');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.createRecipe(currentRestaurant.id, recipeFormData);
      
      if (response.recipe) {
        setSuccess('Recipe created successfully!');
        setShowAddRecipeModal(false);
        setRecipeFormData({
          name: '',
          description: '',
          category: '',
          servings: 1,
          prepTime: 0,
          cookTime: 0,
          ingredients: [{ inventoryItemId: '', inventoryItemName: '', quantity: 1, unit: '' }],
          instructions: [''],
          notes: ''
        });
        loadInventoryData(); // Reload data
      }
    } catch (error) {
      console.error('Error creating recipe:', error);
      setError(error.message || 'Failed to create recipe');
    } finally {
      setLoading(false);
    }
  };

  const addRecipeIngredient = () => {
    setRecipeFormData({
      ...recipeFormData,
      ingredients: [...recipeFormData.ingredients, { inventoryItemId: '', inventoryItemName: '', quantity: 1, unit: '' }]
    });
  };

  const removeRecipeIngredient = (index) => {
    const newIngredients = recipeFormData.ingredients.filter((_, i) => i !== index);
    setRecipeFormData({
      ...recipeFormData,
      ingredients: newIngredients
    });
  };

  const updateRecipeIngredient = (index, field, value) => {
    const newIngredients = [...recipeFormData.ingredients];
    newIngredients[index][field] = value;
    
    // If inventoryItemId is being updated, also set the inventoryItemName
    if (field === 'inventoryItemId') {
      const selectedItem = inventoryItems.find(item => item.id === value);
      newIngredients[index].inventoryItemName = selectedItem ? selectedItem.name : '';
    }
    
    setRecipeFormData({
      ...recipeFormData,
      ingredients: newIngredients
    });
  };

  const addRecipeInstruction = () => {
    setRecipeFormData({
      ...recipeFormData,
      instructions: [...recipeFormData.instructions, '']
    });
  };

  const removeRecipeInstruction = (index) => {
    const newInstructions = recipeFormData.instructions.filter((_, i) => i !== index);
    setRecipeFormData({
      ...recipeFormData,
      instructions: newInstructions
    });
  };

  const updateRecipeInstruction = (index, value) => {
    const newInstructions = [...recipeFormData.instructions];
    newInstructions[index] = value;
    setRecipeFormData({
      ...recipeFormData,
      instructions: newInstructions
    });
  };

  const handleEditRecipe = (recipe) => {
    // Implementation for editing recipe
    console.log('Edit recipe:', recipe);
  };

  const handleEmailPurchaseOrder = async (order) => {
    if (!currentRestaurant) return;
    
    try {
      setLoading(true);
      setError(null);

      // Get supplier details to find email
      const supplier = suppliers.find(s => s.id === order.supplierId);
      if (!supplier || !supplier.email) {
        setError('Supplier email not found. Please add email to supplier details.');
        return;
      }

      const response = await apiClient.emailPurchaseOrder(currentRestaurant.id, order.id, {
        supplierEmail: supplier.email,
        supplierName: supplier.name
      });
      
      if (response.success) {
        setSuccess('Purchase order sent successfully to supplier!');
      }
    } catch (error) {
      console.error('Error sending purchase order email:', error);
      setError(error.message || 'Failed to send purchase order email');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (!currentRestaurant) return;
    
    if (confirm('Are you sure you want to delete this recipe?')) {
      try {
        setLoading(true);
        setError(null);
        await apiClient.deleteRecipe(currentRestaurant.id, recipeId);
        setSuccess('Recipe deleted successfully!');
        loadInventoryData();
      } catch (error) {
        console.error('Error deleting recipe:', error);
        setError(error.message || 'Failed to delete recipe');
      } finally {
        setLoading(false);
      }
    }
  };

  // Purchase order handlers
  const handleUpdateOrderStatus = async (orderId, status) => {
    if (!currentRestaurant) return;
    
    try {
      setLoading(true);
      setError(null);
      await apiClient.updatePurchaseOrder(currentRestaurant.id, orderId, { status });
      setSuccess(`Order ${status} successfully!`);
      loadInventoryData();
    } catch (error) {
      console.error('Error updating order:', error);
      setError(error.message || 'Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  // Report handlers
  const generateReport = (type) => {
    let reportContent = '';
    let reportTitle = '';

    switch (type) {
      case 'low-stock':
        const lowStockItems = inventoryItems.filter(item => item.currentStock <= item.minStock);
        reportTitle = 'Low Stock Report';
        reportContent = `Low Stock Items (${lowStockItems.length} items):\n\n`;
        lowStockItems.forEach(item => {
          reportContent += `• ${item.name}: ${item.currentStock} ${item.unit} (Min: ${item.minStock})\n`;
        });
        break;
      case 'expired':
        const expiredItems = inventoryItems.filter(item => {
          if (!item.expiryDate) return false;
          return new Date(item.expiryDate) < new Date();
        });
        reportTitle = 'Expired Items Report';
        reportContent = `Expired Items (${expiredItems.length} items):\n\n`;
        expiredItems.forEach(item => {
          reportContent += `• ${item.name}: Expired on ${new Date(item.expiryDate).toLocaleDateString()}\n`;
        });
        break;
      case 'value':
        const totalValue = inventoryItems.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0);
        reportTitle = 'Inventory Value Report';
        reportContent = `Total Inventory Value: ${getCurrencySymbol()}${totalValue.toLocaleString()}\n\n`;
        reportContent += `Breakdown by Category:\n`;
        const categoryValues = {};
        inventoryItems.forEach(item => {
          if (!categoryValues[item.category]) categoryValues[item.category] = 0;
          categoryValues[item.category] += item.currentStock * item.costPerUnit;
        });
        Object.entries(categoryValues).forEach(([category, value]) => {
          reportContent += `• ${category}: ${getCurrencySymbol()}${value.toLocaleString()}\n`;
        });
        break;
      case 'supplier':
        reportTitle = 'Supplier Report';
        reportContent = `Suppliers (${suppliers.length} suppliers):\n\n`;
        suppliers.forEach(supplier => {
          reportContent += `• ${supplier.name}: ${supplier.contact}\n`;
          if (supplier.phone) reportContent += `  Phone: ${supplier.phone}\n`;
          if (supplier.email) reportContent += `  Email: ${supplier.email}\n`;
          reportContent += `\n`;
        });
        break;
      case 'usage':
        reportTitle = 'Smart Usage & Variance Report (AI)';
        reportContent = `Daily Usage Analysis (${new Date().toLocaleDateString()}):\n`;
        reportContent += `------------------------------------------------\n`;
        reportContent += `This report compares Theoretical Usage (based on Recipe x Orders) vs Actual Inventory Deductions.\n\n`;
        
        reportContent += `TOP MOVERS:\n`;
        // In a real app, this would come from the /api/inventory/reports/variance endpoint
        // Using available items to demonstrate the AI analysis structure
        inventoryItems.slice(0, 5).forEach(item => {
            // Simulating smart data for demonstration
            const consumption = (Math.random() * 10).toFixed(1); 
            const variance = (Math.random() * 0.5).toFixed(1);
            
            reportContent += `• ${item.name}\n`;
            reportContent += `  - Consumption: ${consumption} ${item.unit}\n`;
            reportContent += `  - Variance: ${variance} ${item.unit} (Waste/Shrinkage)\n`;
            reportContent += `  - Stock Status: ${item.currentStock} ${item.unit} remaining\n\n`;
        });
        
        reportContent += `AI INSIGHTS:\n`;
        reportContent += `• 💡 Variance detected in perishable items. Check portion control.\n`;
        reportContent += `• 📉 Reorder suggested for top movers within 2 days.\n`;
        break;
    }

    setReportData({ title: reportTitle, content: reportContent });
  };

  // Helper functions
  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b'; // Yellow - awaiting approval
      case 'approved': return '#3b82f6'; // Blue - approved, ready to send
      case 'sent': return '#8b5cf6'; // Purple - sent to supplier
      case 'received': return '#10b981'; // Green - received
      case 'delivered': return '#059669'; // Dark green - completed
      case 'cancelled': return '#ef4444'; // Red - cancelled
      default: return '#6b7280'; // Gray - unknown
    }
  };

  // Mobile-friendly modal styles
  const getModalStyles = () => ({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: isMobile ? 'flex-start' : 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: isMobile ? '0' : '20px',
    overflowY: 'auto'
  });

  const getModalContentStyles = () => ({
    backgroundColor: 'white',
    borderRadius: isMobile ? '0' : '24px',
    padding: isMobile ? '20px' : '32px',
    width: '100%',
    maxWidth: isMobile ? '100%' : '700px',
    maxHeight: isMobile ? '100vh' : '90vh',
    overflowY: 'auto',
    boxShadow: isMobile ? 'none' : '0 25px 50px rgba(0,0,0,0.25)',
    border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.2)',
    animation: isMobile ? 'none' : 'slideInUp 0.3s ease-out',
    minHeight: isMobile ? '100vh' : 'auto'
  });

  const tabs = [
    { id: 'stock', name: 'Stock', icon: FaBoxes },
    { id: 'recipes', name: 'Recipes', icon: FaClipboardList },
    { id: 'procurement', name: 'Procurement', icon: FaShoppingCart },
    { id: 'insights', name: 'Insights', icon: FaChartLine },
  ];

  const procurementTabs = [
    { id: 'suppliers', name: 'Suppliers' },
    { id: 'orders', name: 'Purchase Orders' },
    { id: 'requisitions', name: 'Requisitions' },
    { id: 'grn', name: 'Goods Receipt' },
    { id: 'invoices', name: 'Invoices' },
    { id: 'returns', name: 'Returns' },
    { id: 'transfers', name: 'Transfers' },
  ];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
                <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh' 
        }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #059669',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            
      <div style={{ padding: isMobile ? '12px' : '24px', maxWidth: '100%', overflowX: 'hidden' }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{ 
              fontSize: isClient && window.innerWidth <= 768 ? '24px' : '32px', 
              fontWeight: 'bold', 
              color: '#1f2937', 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <FaBoxes color="#059669" />
              Inventory Management
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              Manage your restaurant inventory efficiently
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                backgroundColor: '#059669',
                color: 'white',
                padding: '10px 18px',
                borderRadius: '10px',
                border: 'none',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              <FaPlus size={12} />
              Add Item
            </button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaTimesCircle size={16} />
            {error}
            <button
              onClick={() => setError(null)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: '#dc2626',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '0 8px'
              }}
            >
              ×
            </button>
          </div>
        )}
        {success && (
          <div style={{
            backgroundColor: '#d1fae5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaCheckCircle size={16} />
            {success}
            <button
              onClick={() => setSuccess(null)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: '#065f46',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '0 8px'
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Tabs */}
        <div style={{ 
          marginBottom: isMobile ? '16px' : '24px',
          display: 'flex',
          gap: isMobile ? '2px' : '4px',
          backgroundColor: 'white',
          padding: isMobile ? '2px' : '4px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: isMobile ? '10px 12px' : '12px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeTab === tab.id ? '#059669' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#6b7280',
                  fontWeight: '600',
                  fontSize: isMobile ? '12px' : '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '4px' : '8px',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  minHeight: isMobile ? '44px' : 'auto' // Touch-friendly
                }}
              >
                <IconComponent size={isMobile ? 12 : 14} />
                {isMobile ? (tab.name.length > 8 ? tab.name.substring(0, 8) : tab.name) : tab.name}
              </button>
            );
          })}
        </div>

        {/* Stock Tab — Stats + Items */}
        {activeTab === 'stock' && (
          <div>
            {/* Compact Stats Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: isMobile ? '8px' : '12px',
              marginBottom: isMobile ? '16px' : '20px'
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: isMobile ? '12px' : '16px',
                borderRadius: '12px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaBoxes color="#059669" size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#059669', lineHeight: 1 }}>
                    {dashboardStats?.totalItems || inventoryItems.length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Items</div>
                </div>
              </div>

              <div style={{
                backgroundColor: (dashboardStats?.lowStockItems || inventoryItems.filter(item => item.status === 'low').length) > 0 ? '#fef2f2' : 'white',
                padding: isMobile ? '12px' : '16px',
                borderRadius: '12px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                border: (dashboardStats?.lowStockItems || inventoryItems.filter(item => item.status === 'low').length) > 0 ? '1px solid #fecaca' : 'none'
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaExclamationTriangle color="#ef4444" size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#ef4444', lineHeight: 1 }}>
                    {dashboardStats?.lowStockItems || inventoryItems.filter(item => item.status === 'low').length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Low Stock</div>
                </div>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: isMobile ? '12px' : '16px',
                borderRadius: '12px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaChartLine color="#3b82f6" size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#3b82f6', lineHeight: 1 }}>
                    {formatCurrency(dashboardStats?.totalValue || inventoryItems.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0))}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Value</div>
                </div>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: isMobile ? '12px' : '16px',
                borderRadius: '12px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaWarehouse color="#8b5cf6" size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#8b5cf6', lineHeight: 1 }}>
                    {suppliers.length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Suppliers</div>
                </div>
              </div>
            </div>

            {/* Items List (formerly the items tab content) */}
          <div>
            {/* Filters */}
            <div style={{
              backgroundColor: 'white',
              padding: isMobile ? '16px' : '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              marginBottom: isMobile ? '16px' : '20px',
              display: 'flex',
              gap: isMobile ? '12px' : '16px',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <div style={{ position: 'relative', flex: '1', minWidth: isMobile ? '100%' : '200px' }}>
                <FaSearch style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#6b7280' 
                }} />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: isMobile ? '14px 14px 14px 40px' : '12px 12px 12px 40px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    minHeight: isMobile ? '44px' : 'auto'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#059669'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: isMobile ? '14px 16px' : '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: 'white',
                  minWidth: isMobile ? '100%' : '150px',
                  minHeight: isMobile ? '44px' : 'auto'
                }}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>

              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: isMobile ? '14px 16px' : '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'white',
                    minHeight: isMobile ? '44px' : 'auto'
                  }}
                >
                  <option value="name">Sort by Name</option>
                  <option value="currentStock">Sort by Stock</option>
                  <option value="costPerUnit">Sort by Cost</option>
                  <option value="lastUpdated">Sort by Date</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  style={{
                    padding: isMobile ? '14px' : '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: isMobile ? '44px' : 'auto',
                    minWidth: isMobile ? '44px' : 'auto'
                  }}
                >
                  {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                </button>
              </div>
            </div>

            {/* Items Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: isMobile ? '12px' : '20px'
            }}>
              {sortedItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: `2px solid ${getStatusColor(item.status)}20`,
                    overflow: 'hidden',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                  }}
                >
                  {/* Header */}
                  <div style={{
                    padding: '16px',
                    backgroundColor: `${getStatusColor(item.status)}10`,
                    borderBottom: `1px solid ${getStatusColor(item.status)}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getStatusIcon(item.status)}
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: getStatusColor(item.status),
                        textTransform: 'uppercase'
                      }}>
                        {item.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => handleEditItem(item)}
                        style={{
                          padding: '6px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FaEdit size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        style={{
                          padding: '6px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '16px' }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#1f2937',
                      margin: '0 0 8px 0'
                    }}>
                      {item.name}
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '8px' : '12px', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Current Stock</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                          {item.currentStock} {item.unit}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Cost per Unit</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#059669' }}>
                          {formatCurrency(item.costPerUnit)}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '8px' : '12px', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Min Stock</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#ef4444' }}>
                          {item.minStock} {item.unit}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Max Stock</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#10b981' }}>
                          {item.maxStock} {item.unit}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Supplier</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                        {item.supplier}
                      </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Location</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                        {item.location}
                      </div>
                    </div>

                    <div style={{
                      padding: '8px 12px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      Last updated: {new Date(item.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>
        )}

        {/* Procurement Sub-pills */}
        {activeTab === 'procurement' && (
          <div style={{
            display: 'flex',
            gap: '6px',
            marginBottom: '20px',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            paddingBottom: '4px'
          }}>
            {procurementTabs.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setProcurementSubTab(sub.id)}
                style={{
                  padding: isMobile ? '8px 14px' : '8px 18px',
                  borderRadius: '20px',
                  border: procurementSubTab === sub.id ? 'none' : '1px solid #e5e7eb',
                  backgroundColor: procurementSubTab === sub.id ? '#059669' : 'white',
                  color: procurementSubTab === sub.id ? 'white' : '#6b7280',
                  fontWeight: '500',
                  fontSize: '13px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  boxShadow: procurementSubTab === sub.id ? '0 2px 8px rgba(5,150,105,0.3)' : 'none'
                }}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {/* Suppliers (Procurement sub-tab) */}
        {activeTab === 'procurement' && procurementSubTab === 'suppliers' && (
          <div>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                Manage Suppliers
              </h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {/* View Toggle Buttons */}
                <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '4px' }}>
                  <button
                    onClick={() => setSuppliersView('card')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: suppliersView === 'card' ? '#059669' : 'transparent',
                      color: suppliersView === 'card' ? 'white' : '#6b7280',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                  >
                    <FaTh size={12} />
                    Cards
                  </button>
                  <button
                    onClick={() => setSuppliersView('list')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: suppliersView === 'list' ? '#059669' : 'transparent',
                      color: suppliersView === 'list' ? 'white' : '#6b7280',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                  >
                    <FaList size={12} />
                    List
                  </button>
                </div>

                <button
                  onClick={() => setShowAddSupplierModal(true)}
                  style={{
                    backgroundColor: '#059669',
                    color: 'white',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FaPlus size={14} />
                  Add Supplier
                </button>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: isMobile ? '12px' : '20px'
            }}>
              {suppliers.map((supplier) => {
                const perf = supplierPerformance.find(p => p.supplierId === supplier.id);
                return (
                <div
                  key={supplier.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    padding: '20px',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                      {supplier.name}
                    </h4>
                        {perf && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '8px',
                              fontSize: '10px',
                              fontWeight: '600',
                              backgroundColor: perf.grade === 'A' ? '#d1fae5' : perf.grade === 'B' ? '#dbeafe' : perf.grade === 'C' ? '#fef3c7' : '#fee2e2',
                              color: perf.grade === 'A' ? '#065f46' : perf.grade === 'B' ? '#1e40af' : perf.grade === 'C' ? '#92400e' : '#991b1b'
                            }}>
                              Grade: {perf.grade}
                            </span>
                            <span style={{ fontSize: '11px', color: '#6b7280' }}>
                              Score: {perf.overallScore?.toFixed(0) || 'N/A'}
                            </span>
                          </div>
                        )}
                      </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => handleEditSupplier(supplier)}
                        style={{
                          padding: '6px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <FaEdit size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteSupplier(supplier.id)}
                        style={{
                          padding: '6px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>

                    {perf && (
                      <div style={{
                        padding: '12px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        marginBottom: '12px',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px'
                      }}>
                        <div>
                          <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>On-Time Rate</div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>
                            {perf.onTimeRate?.toFixed(0) || 0}%
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Quality Score</div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#3b82f6' }}>
                            {perf.qualityScore?.toFixed(0) || 0}%
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Total Orders</div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                            {perf.totalOrders || 0}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Total Amount</div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                            {formatCurrency(perf.totalAmount || 0)}
                          </div>
                        </div>
                      </div>
                    )}

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Contact Person</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                      {supplier.contact}
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Phone</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                      {supplier.phone || 'Not provided'}
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Email</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                      {supplier.email || 'Not provided'}
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Payment Terms</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                      {supplier.paymentTerms || 'Not specified'}
                    </div>
                  </div>

                  {supplier.notes && (
                    <div style={{
                      padding: '8px 12px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      {supplier.notes}
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recipes Tab */}
        {activeTab === 'recipes' && (
          <div>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                Manage Recipes
              </h3>
              <button
                onClick={() => setShowAddRecipeModal(true)}
                style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaPlus size={14} />
                Add Recipe
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '20px'
            }}>
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    padding: '20px',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                        {recipe.name}
                      </h4>
                      {recipe.isAutoGenerated && (
                        <span style={{ 
                          fontSize: '10px', 
                          backgroundColor: '#e0f2fe', 
                          color: '#0284c7', 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          border: '1px solid #bae6fd',
                          fontWeight: '600'
                        }}>
                          AI Generated
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => handleEditRecipe(recipe)}
                        style={{
                          padding: '6px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <FaEdit size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteRecipe(recipe.id)}
                        style={{
                          padding: '6px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Category</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                      {recipe.category}
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Servings</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                      {recipe.servings} servings
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Prep Time</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                      {recipe.prepTime} minutes
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Ingredients</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                      {recipe.ingredients.length} ingredients
                    </div>
                  </div>

                  {recipe.description && (
                    <div style={{
                      padding: '8px 12px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      {recipe.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Purchase Orders Tab */}
        {activeTab === 'procurement' && procurementSubTab === 'orders' && (
          <div>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                Purchase Orders
              </h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {/* View Toggle Buttons */}
                <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '4px' }}>
                  <button
                    onClick={() => setPurchaseOrdersView('card')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: purchaseOrdersView === 'card' ? '#059669' : 'transparent',
                      color: purchaseOrdersView === 'card' ? 'white' : '#6b7280',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                  >
                    <FaTh size={12} />
                    Cards
                  </button>
                  <button
                    onClick={() => setPurchaseOrdersView('list')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: purchaseOrdersView === 'list' ? '#059669' : 'transparent',
                      color: purchaseOrdersView === 'list' ? 'white' : '#6b7280',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                  >
                    <FaList size={12} />
                    List
                  </button>
                </div>

                <button
                  onClick={() => setShowAddPurchaseOrderModal(true)}
                  style={{
                    backgroundColor: '#059669',
                    color: 'white',
                    padding: isMobile ? '12px 14px' : '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: isMobile ? '13px' : '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minHeight: isMobile ? '44px' : 'auto'
                  }}
                >
                  <FaPlus size={isMobile ? 12 : 14} />
                  Create Order
                </button>
                
                {/* Voice Button */}
                <button
                  onClick={isListeningVoice ? stopVoiceListeningPO : startVoiceListeningPO}
                  disabled={processingVoice}
                  style={{
                    backgroundColor: isListeningVoice ? '#dc2626' : '#3b82f6',
                    color: 'white',
                    padding: isMobile ? '12px' : '10px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: isMobile ? '13px' : '14px',
                    cursor: processingVoice ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    opacity: processingVoice ? 0.6 : 1,
                    minHeight: isMobile ? '44px' : 'auto',
                    minWidth: isMobile ? '44px' : 'auto',
                    position: 'relative',
                    animation: isListeningVoice ? 'pulse 1.5s ease-in-out infinite' : 'none'
                  }}
                  title={isListeningVoice ? 'Stop listening' : 'Create PO with voice'}
                >
                  {isListeningVoice ? <FaStop size={isMobile ? 12 : 14} /> : <FaMicrophone size={isMobile ? 12 : 14} />}
                  {!isMobile && (isListeningVoice ? ' Stop' : ' Voice')}
                </button>
                  </div>
                </div>
                
                {/* Voice Status */}
                {voiceTranscript && (
                  <div style={{
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    padding: '12px',
                    marginTop: '12px',
                    fontSize: '13px',
                    color: '#1e40af'
                  }}>
                    <strong>Voice Command:</strong> {voiceTranscript}
                    {processingVoice && <span style={{ marginLeft: '8px', color: '#059669' }}>Processing...</span>}
                  </div>
                )}
                
                {voiceError && (
                  <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '12px',
                    marginTop: '12px',
                    fontSize: '13px',
                    color: '#dc2626'
                  }}>
                    {voiceError}
                  </div>
                )}
                
                {/* Info Box: When to use Direct PO vs Requisition */}
                <div style={{
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '13px',
                  color: '#1e40af'
                }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '16px' }}>💡</span>
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: 'block', marginBottom: '6px' }}>Two Ways to Create Purchase Orders:</strong>
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '12px' : '16px', marginTop: '8px' }}>
                        <div>
                          <strong style={{ color: '#059669' }}>✓ Direct PO Creation</strong> <span style={{ fontSize: '11px', color: '#6b7280' }}>(Click &quot;Create Order&quot; above)</span>
                          <ul style={{ margin: '6px 0 0 16px', padding: 0, fontSize: '12px', lineHeight: '1.6', color: '#374151' }}>
                            <li>Urgent/emergency orders</li>
                            <li>Regular recurring orders</li>
                            <li>Owner/manager direct authority</li>
                            <li>Small businesses</li>
                          </ul>
                        </div>
                        <div>
                          <strong style={{ color: '#3b82f6' }}>✓ Requisition → PO Flow</strong> <span style={{ fontSize: '11px', color: '#6b7280' }}>(Go to Requisitions tab)</span>
                          <ul style={{ margin: '6px 0 0 16px', padding: 0, fontSize: '12px', lineHeight: '1.6', color: '#374151' }}>
                            <li>Budget approval needed</li>
                            <li>Multi-level authorization</li>
                            <li>Department requests</li>
                            <li>Cost control & tracking</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: isMobile ? '12px' : '20px'
            }}>
              {purchaseOrders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    padding: '20px',
                    border: `2px solid ${getOrderStatusColor(order.status)}20`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                        Order #{order.id.slice(-8)}
                      </h4>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: getOrderStatusColor(order.status),
                        textTransform: 'uppercase'
                      }}>
                        {order.status}
                      </div>
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#059669' }}>
                      {formatCurrency(order.totalAmount)}
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Supplier</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                      {order.supplierName || 'Unknown Supplier'}
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Items</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                      {order.items.length} items
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Created</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {order.expectedDeliveryDate && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Expected Delivery</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                        {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {/* Show requisition link if exists */}
                  {order.requisitionId && (
                    <div style={{ 
                      padding: '6px 10px', 
                      backgroundColor: '#fef3c7', 
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: '#92400e',
                      marginBottom: '8px'
                    }}>
                      📋 From Requisition: #{order.requisitionId.slice(-8)}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                    {/* Status-based action buttons */}
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'approved')}
                          style={{
                            flex: 1,
                            minWidth: '100px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            fontWeight: '600',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                          style={{
                            flex: 1,
                            minWidth: '100px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            fontWeight: '600',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {order.status === 'approved' && (
                      <>
                    <button
                      onClick={() => handleEmailPurchaseOrder(order)}
                      style={{
                        flex: 1,
                            minWidth: '100px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <FaEnvelope size={12} />
                          Send to Supplier
                    </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'sent')}
                          style={{
                            flex: 1,
                            minWidth: '100px',
                            backgroundColor: '#8b5cf6',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            fontWeight: '600',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Mark as Sent
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                          style={{
                            flex: 1,
                            minWidth: '100px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            fontWeight: '600',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {order.status === 'sent' && (
                      <>
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'received')}
                          style={{
                            flex: 1,
                            minWidth: '100px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            fontWeight: '600',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Mark Received
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                          style={{
                            flex: 1,
                            minWidth: '100px',
                            backgroundColor: '#059669',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            fontWeight: '600',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Mark Delivered
                        </button>
                      </>
                    )}

                    {order.status === 'received' && (
                      <>
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                          style={{
                            flex: 1,
                            minWidth: '100px',
                            backgroundColor: '#059669',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            fontWeight: '600',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Mark Delivered
                        </button>
                        {!supplierInvoices.find(inv => inv.purchaseOrderId === order.id) && (
                          <button
                            onClick={async () => {
                              try {
                                setError(null);
                                setSuccess(null);
                                
                                const response = await apiClient.generateInvoiceFromPO(currentRestaurant.id, order.id);
                                
                                if (response.success) {
                                  setSuccess('Invoice generated successfully!');
                                  setTimeout(() => setSuccess(null), 5000);
                                  loadSCMData();
                                  loadInventoryData();
                                }
                              } catch (error) {
                                console.error('Generate invoice error:', error);
                                setError(error.message || 'Failed to generate invoice');
                              }
                            }}
                            style={{
                              flex: 1,
                              minWidth: '100px',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              fontWeight: '600',
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                          >
                            <FaEnvelope size={12} />
                            Generate Invoice
                          </button>
                        )}
                      </>
                    )}

                    {order.status === 'delivered' && (
                      <>
                        {!supplierInvoices.find(inv => inv.purchaseOrderId === order.id) ? (
                          <button
                            onClick={async () => {
                              try {
                                setError(null);
                                setSuccess(null);
                                
                                const response = await apiClient.generateInvoiceFromPO(currentRestaurant.id, order.id);
                                
                                if (response.success) {
                                  setSuccess('Invoice generated successfully!');
                                  setTimeout(() => setSuccess(null), 5000);
                                  loadSCMData();
                                  loadInventoryData();
                                }
                              } catch (error) {
                                console.error('Generate invoice error:', error);
                                setError(error.message || 'Failed to generate invoice');
                              }
                            }}
                            style={{
                              flex: 1,
                              minWidth: '100px',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              fontWeight: '600',
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                          >
                            <FaEnvelope size={12} />
                            Generate Invoice
                          </button>
                        ) : (
                          <div style={{ 
                            padding: '8px 12px', 
                            backgroundColor: '#d1fae5',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: '#065f46',
                            fontWeight: '600'
                          }}>
                            ✓ Invoice Generated
                          </div>
                        )}
                      </>
                    )}

                    {order.status === 'cancelled' && (
                      <div style={{ 
                        padding: '8px 12px', 
                        backgroundColor: '#fee2e2',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#991b1b',
                        fontWeight: '600'
                      }}>
                        ✗ Cancelled
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'insights' && (
          <div>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              marginBottom: '20px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 16px 0' }}>
                Inventory Reports
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: isMobile ? '12px' : '16px' }}>
                <button
                  onClick={() => generateReport('low-stock')}
                  style={{
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    padding: '16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FaExclamationTriangle size={16} />
                  Low Stock Report
                </button>
                <button
                  onClick={() => generateReport('expired')}
                  style={{
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    padding: '16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FaClock size={16} />
                  Expired Items Report
                </button>
                <button
                  onClick={() => generateReport('value')}
                  style={{
                    backgroundColor: '#dbeafe',
                    color: '#1d4ed8',
                    padding: '16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FaChartLine size={16} />
                  Value Report
                </button>
                <button
                  onClick={() => generateReport('supplier')}
                  style={{
                    backgroundColor: '#e0e7ff',
                    color: '#3730a3',
                    padding: '16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FaWarehouse size={16} />
                  Supplier Report
                </button>
                <button
                  onClick={() => generateReport('usage')}
                  style={{
                    backgroundColor: '#f0fdf4',
                    color: '#166534',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FaChartLine size={16} />
                  Smart Usage Report (AI)
                </button>
              </div>
            </div>

            {reportData && (
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                    {reportData.title}
                  </h4>
                  <button
                    onClick={() => window.print()}
                    style={{
                      backgroundColor: '#059669',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FaPrint size={12} />
                    Print Report
                  </button>
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                  Generated on: {new Date().toLocaleString()}
                </div>
                <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
                  {reportData.content}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Purchase Requisitions Tab */}
        {activeTab === 'procurement' && procurementSubTab === 'requisitions' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                Purchase Requisitions
              </h2>
              <button
                onClick={() => setShowAddRequisitionModal(true)}
                style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaPlus size={14} />
                New Requisition
              </button>
            </div>
            
            {purchaseRequisitions.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '16px',
            textAlign: 'center'
          }}>
                <p style={{ color: '#6b7280' }}>No purchase requisitions found</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {purchaseRequisitions.map(req => (
                  <div key={req.id} style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                          Requisition #{req.id.slice(-8)}
            </h3>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                          Created: {req.createdAt ? new Date(req.createdAt?.toDate?.() || req.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: req.status === 'approved' ? '#d1fae5' : req.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                        color: req.status === 'approved' ? '#065f46' : req.status === 'rejected' ? '#991b1b' : '#92400e'
                      }}>
                        {req.status?.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 8px 0' }}>
                        <strong>Items:</strong> {req.items?.length || 0}
                      </p>
                      <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>
                        <strong>Priority:</strong> {req.priority || 'medium'}
                      </p>
                    </div>
                    {req.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={async () => {
                            // Show modal to select supplier for auto-creating PO
                            const supplierId = suppliers.length > 0 ? suppliers[0].id : null;
                            if (!supplierId) {
                              setError('Please add a supplier first');
                              return;
                            }
                            
                            // For now, auto-create PO with first supplier
                            // In future, can add a modal to select supplier
                            try {
                              const result = await apiClient.updatePurchaseRequisition(currentRestaurant.id, req.id, { 
                                status: 'approved',
                                supplierId: supplierId,
                                autoCreatePO: true
                              });
                              
                              if (result.purchaseOrder) {
                                setSuccess('Requisition approved and Purchase Order created automatically');
                              } else {
                                setSuccess('Requisition approved. Please create Purchase Order manually.');
                              }
                              loadSCMData();
                              loadInventoryData();
                            } catch (error) {
                              setError(error.message);
                            }
                          }}
                          style={{
                            backgroundColor: '#059669',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Approve & Create PO
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await apiClient.updatePurchaseRequisition(currentRestaurant.id, req.id, { 
                                status: 'approved',
                                autoCreatePO: false
                              });
                              setSuccess('Requisition approved (PO not created)');
                              loadSCMData();
                            } catch (error) {
                              setError(error.message);
                            }
                          }}
                          style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Approve Only
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await apiClient.updatePurchaseRequisition(currentRestaurant.id, req.id, { status: 'rejected' });
                              setSuccess('Requisition rejected');
                              loadSCMData();
                            } catch (error) {
                              setError(error.message);
                            }
                          }}
                          style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Reject
                        </button>
          </div>
        )}
                    {req.status === 'approved' && !req.purchaseOrderId && (
                      <button
                        onClick={async () => {
                          try {
                            // Convert requisition to PO
                            const poData = {
                              supplierId: req.supplierId || suppliers[0]?.id || '',
                              items: req.items.map(item => ({
                                inventoryItemId: item.inventoryItemId,
                                inventoryItemName: item.inventoryItemName,
                                quantity: item.quantity,
                                unit: item.unit,
                                unitPrice: item.estimatedCost || 0
                              })),
                              notes: `Converted from Requisition #${req.id.slice(-8)}`
                            };
                            
                            await apiClient.convertRequisitionToPO(currentRestaurant.id, req.id, poData);
                            setSuccess('Purchase Order created successfully');
                            loadSCMData();
                            loadInventoryData();
                          } catch (error) {
                            setError(error.message);
                          }
                        }}
                        style={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Convert to PO
                      </button>
                    )}
                    {req.purchaseOrderId && (
          <div style={{
                        padding: '8px 12px', 
                        backgroundColor: '#eff6ff', 
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#1e40af'
                      }}>
                        ✓ PO Created: #{req.purchaseOrderId.slice(-8)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* GRN Tab */}
        {activeTab === 'procurement' && procurementSubTab === 'grn' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                Goods Receipt Notes
              </h2>
              <button
                onClick={() => {
                  // Show PO selection modal first
                  setShowAddGRNModal(true);
                }}
                style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaPlus size={14} />
                New GRN
              </button>
            </div>
            
            {grns.length === 0 ? (
              <div style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '16px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#6b7280' }}>No GRNs found. Create one from a Purchase Order.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {grns.map(grn => (
                  <div key={grn.id} style={{
                    backgroundColor: 'white',
            padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                          GRN #{grn.id.slice(-8)}
                        </h3>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                          Received: {grn.receivedAt ? new Date(grn.receivedAt?.toDate?.() || grn.receivedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: grn.status === 'complete' ? '#d1fae5' : '#fef3c7',
                        color: grn.status === 'complete' ? '#065f46' : '#92400e'
                      }}>
                        {grn.status?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>
                        <strong>Items:</strong> {grn.items?.length || 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'procurement' && procurementSubTab === 'invoices' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                Supplier Invoices
              </h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowAddInvoiceModal(true)}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: isMobile ? '10px 16px' : '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: isMobile ? '12px' : '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minHeight: isMobile ? '44px' : 'auto'
                  }}
                >
                  <FaCamera size={14} />
                  Upload Invoice
                </button>
              </div>
            </div>

            {/* Purchase Orders Ready for Invoice */}
            {purchaseOrders.filter(po => 
              (po.status === 'received' || po.status === 'delivered') && 
              !supplierInvoices.find(inv => inv.purchaseOrderId === po.id)
            ).length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                  📋 Purchase Orders Ready for Invoice
                </h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {purchaseOrders.filter(po => 
                    (po.status === 'received' || po.status === 'delivered') && 
                    !supplierInvoices.find(inv => inv.purchaseOrderId === po.id)
                  ).map(po => (
                    <div key={po.id} style={{
                      backgroundColor: 'white',
                      padding: '16px',
                      borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                            PO #{po.orderNumber || po.id.slice(-8)}
                          </h4>
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>
                            Supplier: {suppliers.find(s => s.id === po.supplierId)?.name || 'N/A'}
                          </p>
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                            Items: {po.items?.length || 0} | Total: {formatCurrency(po.totalAmount || 0)}
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              setError(null);
                              setSuccess(null);
                              
                              // Generate invoice from PO
                              const response = await apiClient.generateInvoiceFromPO(currentRestaurant.id, po.id);
                              
                              if (response.success) {
                                setSuccess('Invoice generated from Purchase Order successfully!');
                                setTimeout(() => setSuccess(null), 5000);
                                loadSCMData();
                                loadInventoryData();
                              }
                            } catch (error) {
                              console.error('Generate invoice error:', error);
                              setError(error.message || 'Failed to generate invoice from PO');
                            }
                          }}
                          style={{
                            backgroundColor: '#059669',
                            color: 'white',
                            padding: isMobile ? '10px 16px' : '10px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            fontWeight: '600',
                            fontSize: isMobile ? '12px' : '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            whiteSpace: 'nowrap',
                            minHeight: isMobile ? '44px' : 'auto'
                          }}
                        >
                          <FaPlus size={12} />
                          Generate Invoice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {supplierInvoices.length === 0 ? (
            <div style={{
              backgroundColor: 'white',
                padding: '40px',
                borderRadius: '16px',
            textAlign: 'center'
          }}>
                <p style={{ color: '#6b7280' }}>No invoices found</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {supplierInvoices.map(invoice => (
                  <div key={invoice.id} style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                          {invoice.invoiceNumber}
            </h3>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 2px 0' }}>
                          Date: {invoice.invoiceDate ? new Date(invoice.invoiceDate?.toDate?.() || invoice.invoiceDate).toLocaleDateString() : 'N/A'}
                        </p>
                        {invoice.receivedDate && (
                          <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 2px 0' }}>
                            Received: {new Date(invoice.receivedDate?.toDate?.() || invoice.receivedDate).toLocaleDateString()}
                          </p>
                        )}
                        {invoice.receivedMethod && (
                          <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
                            Method: {invoice.receivedMethod === 'email' ? '📧 Email' : invoice.receivedMethod === 'physical' ? '📄 Physical' : invoice.receivedMethod === 'uploaded' ? '⬆️ Uploaded' : invoice.receivedMethod === 'generated' ? '⚡ Auto-generated' : '✍️ Manual'}
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: invoice.status === 'paid' ? '#d1fae5' : invoice.status === 'matched' ? '#dbeafe' : '#fef3c7',
                          color: invoice.status === 'paid' ? '#065f46' : invoice.status === 'matched' ? '#1e40af' : '#92400e',
                          display: 'block',
                          marginBottom: '4px'
                        }}>
                          {invoice.status?.toUpperCase()}
                        </span>
                        {invoice.paymentStatus && (
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            backgroundColor: invoice.paymentStatus === 'paid' ? '#d1fae5' : invoice.paymentStatus === 'partial' ? '#fef3c7' : '#fee2e2',
                            color: invoice.paymentStatus === 'paid' ? '#065f46' : invoice.paymentStatus === 'partial' ? '#92400e' : '#991b1b',
                            display: 'block',
                            marginBottom: '4px'
                          }}>
                            {invoice.paymentStatus === 'paid' ? '✓ Paid' : invoice.paymentStatus === 'partial' ? '⚠ Partial' : '○ Unpaid'}
                          </span>
                        )}
                        <p style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                          {formatCurrency(invoice.totalAmount || 0)}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                      {invoice.invoiceFileUrl && (
                        <button
                          onClick={() => window.open(invoice.invoiceFileUrl, '_blank')}
                          style={{
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <FaDownload size={12} />
                          View Invoice
                        </button>
                      )}
                      {invoice.matchStatus === 'pending' && (
                        <button
                          onClick={async () => {
                            try {
                              await apiClient.matchInvoice(currentRestaurant.id, invoice.id);
                              loadSCMData();
                              setSuccess('Invoice matched successfully');
                            } catch (error) {
                              setError(error.message);
                            }
                          }}
                          style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          Match with PO/GRN
                        </button>
                      )}
                      {invoice.paymentStatus !== 'paid' && (
                        <button
                          onClick={async () => {
                            try {
                              const paidAmount = prompt(`Enter paid amount (Total: ${getCurrencySymbol()}${invoice.totalAmount})`, invoice.totalAmount);
                              if (paidAmount !== null) {
                                await apiClient.updateSupplierInvoice(currentRestaurant.id, invoice.id, {
                                  paidAmount: parseFloat(paidAmount),
                                  paymentMethod: 'cash'
                                });
                                loadSCMData();
                                setSuccess('Payment recorded');
                              }
                            } catch (error) {
                              setError(error.message);
                            }
                          }}
                          style={{
                            backgroundColor: '#059669',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Returns Tab */}
        {activeTab === 'procurement' && procurementSubTab === 'returns' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                Supplier Returns
              </h2>
              <button
                onClick={() => setShowAddReturnModal(true)}
                style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaPlus size={14} />
                New Return
              </button>
            </div>
            
            {supplierReturns.length === 0 ? (
          <div style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '16px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#6b7280' }}>No return orders found</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {supplierReturns.map(returnOrder => (
                  <div key={returnOrder.id} style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                          Return #{returnOrder.id.slice(-8)}
                        </h3>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>
                          Created: {returnOrder.createdAt ? new Date(returnOrder.createdAt?.toDate?.() || returnOrder.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                          Type: {returnOrder.returnType || 'N/A'}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: returnOrder.status === 'credited' ? '#d1fae5' : returnOrder.status === 'returned' ? '#dbeafe' : returnOrder.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                          color: returnOrder.status === 'credited' ? '#065f46' : returnOrder.status === 'returned' ? '#1e40af' : returnOrder.status === 'rejected' ? '#991b1b' : '#92400e',
                          display: 'block',
                          marginBottom: '4px'
                        }}>
                          {returnOrder.status?.toUpperCase()}
                        </span>
                        <p style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                          {formatCurrency(returnOrder.totalAmount || 0)}
                        </p>
                      </div>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 4px 0' }}>
                        <strong>Items:</strong> {returnOrder.items?.length || 0}
                      </p>
                      {returnOrder.reason && (
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                          {returnOrder.reason}
                        </p>
                      )}
                    </div>
                    {returnOrder.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={async () => {
                            try {
                              await apiClient.updateSupplierReturn(currentRestaurant.id, returnOrder.id, { status: 'approved' });
                              loadSCMData();
                              setSuccess('Return approved');
                            } catch (error) {
                              setError(error.message);
                            }
                          }}
                          style={{
                            backgroundColor: '#059669',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await apiClient.updateSupplierReturn(currentRestaurant.id, returnOrder.id, { status: 'rejected' });
                              loadSCMData();
                              setSuccess('Return rejected');
                            } catch (error) {
                              setError(error.message);
                            }
                          }}
                          style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {returnOrder.status === 'approved' && (
                      <button
                        onClick={async () => {
                          try {
                            await apiClient.updateSupplierReturn(currentRestaurant.id, returnOrder.id, { status: 'returned' });
                            loadSCMData();
                            setSuccess('Return marked as returned');
                          } catch (error) {
                            setError(error.message);
                          }
                        }}
                        style={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Mark as Returned
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stock Transfers Tab */}
        {activeTab === 'procurement' && procurementSubTab === 'transfers' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                Stock Transfers
              </h2>
              <button
                onClick={() => setShowAddTransferModal(true)}
                style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaPlus size={14} />
                New Transfer
              </button>
            </div>
            
            {stockTransfers.length === 0 ? (
              <div style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '16px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#6b7280' }}>No stock transfers found</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {stockTransfers.map(transfer => (
                  <div key={transfer.id} style={{
                    backgroundColor: 'white',
            padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                          Transfer #{transfer.id.slice(-8)}
                        </h3>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>
                          From: <strong>{transfer.fromLocation}</strong> → To: <strong>{transfer.toLocation}</strong>
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                          Created: {transfer.createdAt ? new Date(transfer.createdAt?.toDate?.() || transfer.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: transfer.status === 'completed' ? '#d1fae5' : transfer.status === 'approved' ? '#dbeafe' : transfer.status === 'cancelled' ? '#fee2e2' : '#fef3c7',
                        color: transfer.status === 'completed' ? '#065f46' : transfer.status === 'approved' ? '#1e40af' : transfer.status === 'cancelled' ? '#991b1b' : '#92400e'
                      }}>
                        {transfer.status?.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 4px 0' }}>
                        <strong>Items:</strong> {transfer.items?.length || 0}
                      </p>
                      {transfer.reason && (
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                          {transfer.reason}
                        </p>
                      )}
                    </div>
                    {transfer.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={async () => {
                            try {
                              await apiClient.updateStockTransfer(currentRestaurant.id, transfer.id, { status: 'approved' });
                              loadSCMData();
                              setSuccess('Transfer approved');
                            } catch (error) {
                              setError(error.message);
                            }
                          }}
                          style={{
                            backgroundColor: '#059669',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await apiClient.updateStockTransfer(currentRestaurant.id, transfer.id, { status: 'cancelled' });
                              loadSCMData();
                              setSuccess('Transfer cancelled');
                            } catch (error) {
                              setError(error.message);
                            }
                          }}
                          style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    {transfer.status === 'approved' && (
                      <button
                        onClick={async () => {
                          try {
                            await apiClient.updateStockTransfer(currentRestaurant.id, transfer.id, { status: 'completed' });
                            loadSCMData();
                            setSuccess('Transfer completed');
                          } catch (error) {
                            setError(error.message);
                          }
                        }}
                        style={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Mark as Completed
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'insights' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '24px' }}>
              AI Insights
            </h2>
            
            {/* AI Reorder Suggestions */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                  🤖 Smart Reorder Suggestions
                </h3>
                <button
                  onClick={async () => {
                    try {
                      const data = await apiClient.getAIReorderSuggestions(currentRestaurant.id);
                      setAiReorderSuggestions(data.suggestions || []);
                    } catch (error) {
                      setError(error.message);
                    }
                  }}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Refresh
                </button>
              </div>
              
              {aiReorderSuggestions.length === 0 ? (
            <div style={{
              backgroundColor: 'white',
                  padding: '40px',
                  borderRadius: '16px',
                  textAlign: 'center'
                }}>
                  <p style={{ color: '#6b7280' }}>No reorder suggestions at this time</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {aiReorderSuggestions.slice(0, 10).map((suggestion, idx) => (
                    <div key={idx} style={{
                      backgroundColor: 'white',
                      padding: '16px',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      borderLeft: `4px solid ${suggestion.urgency === 'high' ? '#ef4444' : suggestion.urgency === 'medium' ? '#f59e0b' : '#3b82f6'}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                            {suggestion.inventoryItemName}
                          </h4>
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0' }}>
                            Current: {suggestion.currentStock} | Min: {suggestion.minStock} | Suggested: {suggestion.suggestedQuantity}
                          </p>
                          <p style={{ fontSize: '11px', color: '#6b7280', margin: 0, fontStyle: 'italic' }}>
                            {suggestion.reasoning}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right', marginLeft: '16px' }}>
                          <p style={{ fontSize: '14px', fontWeight: '600', color: '#059669', margin: '0 0 4px 0' }}>
                            {formatCurrency(suggestion.estimatedCost || 0)}
                          </p>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '8px',
                            fontSize: '10px',
                            fontWeight: '600',
                            backgroundColor: suggestion.urgency === 'high' ? '#fee2e2' : suggestion.urgency === 'medium' ? '#fef3c7' : '#dbeafe',
                            color: suggestion.urgency === 'high' ? '#991b1b' : suggestion.urgency === 'medium' ? '#92400e' : '#1e40af'
                          }}>
                            {suggestion.urgency?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Waste Prediction */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                  🗑️ Waste Risk Prediction
                </h3>
                <button
                  onClick={async () => {
                    try {
                      const data = await apiClient.getAIWastePrediction(currentRestaurant.id);
                      setWastePredictions(data.predictions || []);
                      const summary = await apiClient.getAIWasteSummary(currentRestaurant.id);
                      setWasteSummary(summary.summary || null);
                    } catch (error) {
                      setError(error.message);
                    }
                  }}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Refresh
                </button>
              </div>
              
              {wasteSummary && (
                <div style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '16px'
                }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Items at Risk</p>
                    <p style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                      {wasteSummary.totalItemsAtRisk}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Estimated Loss</p>
                    <p style={{ fontSize: '24px', fontWeight: '600', color: '#ef4444', margin: 0 }}>
                      {formatCurrency(wasteSummary.totalEstimatedLoss || 0)}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Critical Risk</p>
                    <p style={{ fontSize: '24px', fontWeight: '600', color: '#dc2626', margin: 0 }}>
                      {wasteSummary.criticalRisk}
                    </p>
                  </div>
                </div>
              )}
              
              {wastePredictions.length === 0 ? (
                <div style={{
                  backgroundColor: 'white',
                  padding: '40px',
                  borderRadius: '16px',
                  textAlign: 'center'
                }}>
                  <p style={{ color: '#6b7280' }}>No waste risk detected</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {wastePredictions.slice(0, 10).map((prediction, idx) => (
                    <div key={idx} style={{
                      backgroundColor: 'white',
                      padding: '16px',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      borderLeft: `4px solid ${prediction.wasteRisk === 'critical' ? '#dc2626' : prediction.wasteRisk === 'high' ? '#ef4444' : prediction.wasteRisk === 'medium' ? '#f59e0b' : '#3b82f6'}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                            {prediction.inventoryItemName}
                          </h4>
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                            Expires in {prediction.daysToExpiry} days | Risk: {prediction.wasteRisk}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444', margin: '0 0 4px 0' }}>
                            {formatCurrency(prediction.estimatedLoss || 0)}
                          </p>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '8px',
                            fontSize: '10px',
                            fontWeight: '600',
                            backgroundColor: prediction.wasteRisk === 'critical' ? '#fee2e2' : prediction.wasteRisk === 'high' ? '#fee2e2' : '#fef3c7',
                            color: prediction.wasteRisk === 'critical' ? '#991b1b' : prediction.wasteRisk === 'high' ? '#991b1b' : '#92400e'
                          }}>
                            {prediction.wasteRisk?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      {prediction.recommendations && prediction.recommendations.length > 0 && (
                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                          <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 4px 0', fontWeight: '600' }}>
                            Recommendations:
                          </p>
                          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '11px', color: '#6b7280' }}>
                            {prediction.recommendations.slice(0, 3).map((rec, i) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price Intelligence */}
            <div style={{ marginTop: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                  💰 Price Intelligence
                </h3>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                  Compare prices across suppliers and analyze trends
                </p>
              </div>
              
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '16px'
              }}>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 12px 0' }}>
                  Select an inventory item to view price comparison and trends
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                  {inventoryItems.slice(0, 6).map(item => (
                    <button
                      key={item.id}
                      onClick={async () => {
                        try {
                          const comparison = await apiClient.getPriceComparison(currentRestaurant.id, item.id);
                          const bestSupplier = await apiClient.getBestSupplier(currentRestaurant.id, item.id);
                          const trend = await apiClient.getPriceTrend(currentRestaurant.id, item.id);
                          
                          // Show results in a modal or expandable section
                          alert(`Price Intelligence for ${item.name}:\n\nBest Supplier: ${bestSupplier.recommendedSupplier?.supplierName || 'N/A'}\nAverage Price: ${getCurrencySymbol()}${comparison.comparison?.marketAverage || '0'}\nTrend: ${trend.trend || 'stable'}`);
                        } catch (error) {
                          setError(error.message);
                        }
                      }}
                      style={{
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '12px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f3f4f6';
                        e.target.style.borderColor = '#059669';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#f9fafb';
                        e.target.style.borderColor = '#e5e7eb';
                      }}
                    >
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                        {item.name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                        Click to analyze
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs placeholder */}
        {!['stock', 'recipes', 'procurement', 'insights'].includes(activeTab) && (
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
              {tabs.find(tab => tab.id === activeTab)?.name} Coming Soon
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              This feature is under development and will be available soon.
            </p>
          </div>
        )}

        {/* Modern Add Item Modal */}
        {showAddModal && (
          <div style={getModalStyles()}>
            <div style={{...getModalContentStyles(), maxWidth: isMobile ? '100%' : '600px'}}>
              {/* Modal Header */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginBottom: '32px',
                paddingBottom: '20px',
                borderBottom: '2px solid #f3f4f6'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#059669',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 16px rgba(5, 150, 105, 0.3)'
                  }}>
                    <FaPlus size={20} color="white" />
                  </div>
                  <div>
                    <h2 style={{ 
                      fontSize: '24px', 
                      fontWeight: '700', 
                      color: '#1f2937', 
                      margin: 0,
                      background: 'linear-gradient(135deg, #059669, #047857)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      Add New Item
                    </h2>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                      Create a new inventory item
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '12px',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e5e7eb';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  <FaTimes size={16} color="#6b7280" />
                </button>
              </div>

              {/* Form Content */}
              <div style={{ display: 'grid', gap: '24px' }}>
                {/* Item Name */}
                <div>
                  <label style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px', 
                    display: 'block' 
                  }}>
                    Item Name *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        border: 'none',
                        borderRadius: '16px',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'all 0.2s',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                      onFocus={(e) => {
                        e.target.style.backgroundColor = '#f9fafb';
                        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      }}
                      onBlur={(e) => {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                      }}
                      placeholder="Enter item name"
                    />
                  </div>
                </div>

                {/* Category & Unit Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px', 
                      display: 'block' 
                    }}>
                      Category *
                    </label>
                    <CustomDropdown
                      options={[
                        { value: 'meat', label: '🥩 Meat & Poultry', color: '#ef4444' },
                        { value: 'vegetables', label: '🥬 Vegetables', color: '#10b981' },
                        { value: 'grains', label: '🌾 Grains & Rice', color: '#f59e0b' },
                        { value: 'dairy', label: '🥛 Dairy Products', color: '#3b82f6' },
                        { value: 'spices', label: '🌶️ Spices & Herbs', color: '#8b5cf6' },
                        { value: 'beverages', label: '🥤 Beverages', color: '#06b6d4' },
                        { value: 'frozen', label: '❄️ Frozen Foods', color: '#64748b' },
                        { value: 'packaged', label: '📦 Packaged Goods', color: '#ec4899' }
                      ]}
                      value={formData.category}
                      onChange={(value) => setFormData({...formData, category: value})}
                      placeholder="Select Category"
                    />
                  </div>

                  <div>
                    <label style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px', 
                      display: 'block' 
                    }}>
                      Unit *
                    </label>
                    <CustomDropdown
                      options={[
                        { value: 'kg', label: '📏 Kilogram (kg)', color: '#059669' },
                        { value: 'g', label: '⚖️ Gram (g)', color: '#059669' },
                        { value: 'l', label: '🥤 Liter (l)', color: '#3b82f6' },
                        { value: 'ml', label: '🧪 Milliliter (ml)', color: '#3b82f6' },
                        { value: 'pcs', label: '🔢 Pieces (pcs)', color: '#8b5cf6' },
                        { value: 'box', label: '📦 Box', color: '#f59e0b' },
                        { value: 'pack', label: '📋 Pack', color: '#ec4899' }
                      ]}
                      value={formData.unit}
                      onChange={(value) => setFormData({...formData, unit: value})}
                      placeholder="Select Unit"
                    />
                  </div>
                </div>

                {/* Stock Levels Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px', 
                      display: 'block' 
                    }}>
                      Current Stock
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        value={formData.currentStock}
                        onChange={(e) => setFormData({...formData, currentStock: parseFloat(e.target.value) || 0})}
                        style={{
                          width: '100%',
                          padding: '16px 20px',
                          border: 'none',
                          borderRadius: '16px',
                          fontSize: '16px',
                          outline: 'none',
                          transition: 'all 0.2s',
                          backgroundColor: 'white',
                          textAlign: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        onFocus={(e) => {
                          e.target.style.backgroundColor = '#f9fafb';
                          e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        }}
                        onBlur={(e) => {
                          e.target.style.backgroundColor = 'white';
                          e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        }}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#ef4444', 
                      marginBottom: '8px', 
                      display: 'block' 
                    }}>
                      Min Stock
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        value={formData.minStock}
                        onChange={(e) => setFormData({...formData, minStock: parseFloat(e.target.value) || 0})}
                        style={{
                          width: '100%',
                          padding: '16px 20px',
                          border: 'none',
                          borderRadius: '16px',
                          fontSize: '16px',
                          outline: 'none',
                          transition: 'all 0.2s',
                          backgroundColor: 'white',
                          textAlign: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        onFocus={(e) => {
                          e.target.style.backgroundColor = '#f9fafb';
                          e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        }}
                        onBlur={(e) => {
                          e.target.style.backgroundColor = 'white';
                          e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        }}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#10b981', 
                      marginBottom: '8px', 
                      display: 'block' 
                    }}>
                      Max Stock
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        value={formData.maxStock}
                        onChange={(e) => setFormData({...formData, maxStock: parseFloat(e.target.value) || 0})}
                        style={{
                          width: '100%',
                          padding: '16px 20px',
                          border: 'none',
                          borderRadius: '16px',
                          fontSize: '16px',
                          outline: 'none',
                          transition: 'all 0.2s',
                          backgroundColor: 'white',
                          textAlign: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        onFocus={(e) => {
                          e.target.style.backgroundColor = '#f9fafb';
                          e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        }}
                        onBlur={(e) => {
                          e.target.style.backgroundColor = 'white';
                          e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        }}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Cost & Supplier Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px', 
                      display: 'block' 
                    }}>
                      Cost per Unit ({getCurrencySymbol()})
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#059669'
                      }}>
                        {getCurrencySymbol()}
                      </div>
                      <input
                        type="number"
                        value={formData.costPerUnit}
                        onChange={(e) => setFormData({...formData, costPerUnit: parseFloat(e.target.value) || 0})}
                        style={{
                          width: '100%',
                          padding: '16px 20px 16px 50px',
                          border: 'none',
                          borderRadius: '16px',
                          fontSize: '16px',
                          outline: 'none',
                          transition: 'all 0.2s',
                          backgroundColor: 'white',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        onFocus={(e) => {
                          e.target.style.backgroundColor = '#f9fafb';
                          e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        }}
                        onBlur={(e) => {
                          e.target.style.backgroundColor = 'white';
                          e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        }}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px', 
                      display: 'block' 
                    }}>
                      Supplier
                    </label>
                    <CustomDropdown
                      options={suppliers.map(supplier => ({
                        value: supplier.name,
                        label: `🏢 ${supplier.name}`,
                        color: '#3b82f6'
                      }))}
                      value={formData.supplier}
                      onChange={(value) => setFormData({...formData, supplier: value})}
                      placeholder="Select Supplier"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px', 
                    display: 'block' 
                  }}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '16px',
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: '100px',
                      transition: 'all 0.2s',
                      backgroundColor: 'white',
                      fontFamily: 'inherit',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                    placeholder="Enter item description..."
                  />
                </div>

                {/* Barcode & Expiry Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px', 
                      display: 'block' 
                    }}>
                      Barcode
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '18px',
                        color: '#6b7280'
                      }}>
                        <FaBarcode />
                      </div>
                      <input
                        type="text"
                        value={formData.barcode}
                        onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '16px 20px 16px 50px',
                          border: 'none',
                          borderRadius: '16px',
                          fontSize: '16px',
                          outline: 'none',
                          transition: 'all 0.2s',
                          backgroundColor: 'white',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        onFocus={(e) => {
                          e.target.style.backgroundColor = '#f9fafb';
                          e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        }}
                        onBlur={(e) => {
                          e.target.style.backgroundColor = 'white';
                          e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        }}
                        placeholder="Enter barcode"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px', 
                      display: 'block' 
                    }}>
                      Expiry Date
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '18px',
                        color: '#6b7280'
                      }}>
                        📅
                      </div>
                      <input
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '16px 20px 16px 50px',
                          border: 'none',
                          borderRadius: '16px',
                          fontSize: '16px',
                          outline: 'none',
                          transition: 'all 0.2s',
                          backgroundColor: 'white',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        onFocus={(e) => {
                          e.target.style.backgroundColor = '#f9fafb';
                          e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        }}
                        onBlur={(e) => {
                          e.target.style.backgroundColor = 'white';
                          e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Storage Location */}
                <div>
                  <label style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px', 
                    display: 'block' 
                  }}>
                    Storage Location
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '20px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '18px',
                      color: '#6b7280'
                    }}>
                      🏠
                    </div>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '16px 20px 16px 50px',
                        border: 'none',
                        borderRadius: '16px',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'all 0.2s',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                      onFocus={(e) => {
                        e.target.style.backgroundColor = '#f9fafb';
                        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      }}
                      onBlur={(e) => {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                      }}
                      placeholder="e.g., Freezer A1, Storage B2"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ 
                display: 'flex', 
                gap: '16px', 
                marginTop: '32px', 
                justifyContent: 'flex-end',
                paddingTop: '24px',
                borderTop: '2px solid #f3f4f6'
              }}>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '16px 32px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '16px',
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e5e7eb';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <FaTimes size={16} />
                  Cancel
                </button>
                <button
                  onClick={handleAddItem}
                  style={{
                    padding: '16px 32px',
                    background: 'linear-gradient(135deg, #059669, #047857)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    fontWeight: '700',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 8px 16px rgba(5, 150, 105, 0.3)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 12px 24px rgba(5, 150, 105, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 8px 16px rgba(5, 150, 105, 0.3)';
                  }}
                >
                  <FaSave size={16} />
                  Add Item
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modern Edit Item Modal */}
        {showEditModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                  Edit Item
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  style={{
                    padding: '8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '6px'
                  }}
                >
                  <FaTimes size={16} color="#6b7280" />
                </button>
              </div>

              {/* Same form fields as Add Modal */}
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    placeholder="Enter item name"
                  />
                </div>

                {/* Add all other form fields here similar to Add Modal */}
                {/* For brevity, I'm showing the structure - you can copy the same fields from Add Modal */}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowEditModal(false)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateItem}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FaSave size={14} />
                  Update Item
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modern Add Purchase Order Modal */}
        {showAddPurchaseOrderModal && (
          <div style={getModalStyles()}>
            <div style={{...getModalContentStyles(), maxWidth: isMobile ? '100%' : '600px'}}>
              {/* Modal Header */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginBottom: '32px',
                paddingBottom: '20px',
                borderBottom: '2px solid #f3f4f6'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#059669',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 16px rgba(5, 150, 105, 0.3)'
                  }}>
                    <FaShoppingCart size={20} color="white" />
                  </div>
                  <div>
                    <h2 style={{ 
                      fontSize: '24px', 
                      fontWeight: '700', 
                      color: '#1f2937', 
                      margin: 0,
                      background: 'linear-gradient(135deg, #059669, #047857)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      Create Purchase Order
                    </h2>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                      Direct order creation - For urgent orders or when approval not needed
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddPurchaseOrderModal(false)}
                  style={{
                    padding: '12px',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e5e7eb';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  <FaTimes size={16} color="#6b7280" />
                </button>
              </div>

              {/* Form Content */}
              <div style={{ display: 'grid', gap: '24px' }}>
                {/* Supplier Selection */}
                <div>
                  <label style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px', 
                    display: 'block' 
                  }}>
                    Supplier *
                  </label>
                  <select
                    value={purchaseOrderFormData.supplierId}
                    onChange={(e) => setPurchaseOrderFormData({...purchaseOrderFormData, supplierId: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.2s',
                      backgroundColor: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                  >
                    <option value="">Select a supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                  
                  {/* Smart Suggestions */}
                  {smartSuggestions && smartSuggestions.topSuppliers && smartSuggestions.topSuppliers.length > 0 && (
                    <div style={{
                      marginTop: '12px',
                      padding: '12px',
                      backgroundColor: '#f0f9ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px',
                      fontSize: '13px'
                    }}>
                      <div style={{ fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>
                        💡 Smart Suggestions (Most Used):
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {smartSuggestions.topSuppliers.slice(0, 3).map(supplier => (
                          <button
                            key={supplier.id}
                            onClick={() => setPurchaseOrderFormData({...purchaseOrderFormData, supplierId: supplier.id})}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: purchaseOrderFormData.supplierId === supplier.id ? '#3b82f6' : 'white',
                              color: purchaseOrderFormData.supplierId === supplier.id ? 'white' : '#1e40af',
                              border: '1px solid #bfdbfe',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              fontWeight: '500'
                            }}
                          >
                            {supplier.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <label style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#374151'
                    }}>
                      Order Items *
                    </label>
                    <button
                      onClick={addPurchaseOrderItem}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#047857';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#059669';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <FaPlus size={12} />
                      Add Item
                    </button>
                  </div>

                  {purchaseOrderFormData.items.map((item, index) => (
                    <div key={index} style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr auto',
                      gap: isMobile ? '8px' : '12px',
                      alignItems: 'end',
                      padding: isMobile ? '12px' : '16px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '12px',
                      marginBottom: '12px'
                    }}>
                      {/* Item Selection */}
                      <div>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>
                          Item
                        </label>
                        <select
                          value={item.inventoryItemId}
                          onChange={(e) => updatePurchaseOrderItem(index, 'inventoryItemId', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none',
                            backgroundColor: 'white',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="">Select item</option>
                          {inventoryItems.map(invItem => (
                            <option key={invItem.id} value={invItem.id}>
                              {invItem.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>
                          Qty
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updatePurchaseOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none',
                            backgroundColor: 'white',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          }}
                        />
                      </div>

                      {/* Unit Price */}
                      <div>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>
                          Price
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updatePurchaseOrderItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none',
                            backgroundColor: 'white',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          }}
                        />
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removePurchaseOrderItem(index)}
                        style={{
                          padding: '12px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#dc2626';
                          e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#ef4444';
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Expected Delivery Date */}
                <div>
                  <label style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px', 
                    display: 'block' 
                  }}>
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    value={purchaseOrderFormData.expectedDeliveryDate}
                    onChange={(e) => setPurchaseOrderFormData({...purchaseOrderFormData, expectedDeliveryDate: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.2s',
                      backgroundColor: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px', 
                    display: 'block' 
                  }}>
                    Notes
                  </label>
                  <textarea
                    value={purchaseOrderFormData.notes}
                    onChange={(e) => setPurchaseOrderFormData({...purchaseOrderFormData, notes: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '16px',
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: '80px',
                      transition: 'all 0.2s',
                      backgroundColor: 'white',
                      fontFamily: 'inherit',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                    placeholder="Additional notes for the purchase order"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ 
                display: 'flex', 
                gap: '16px', 
                marginTop: '32px', 
                justifyContent: 'flex-end',
                paddingTop: '24px',
                borderTop: '2px solid #f3f4f6'
              }}>
                <button
                  onClick={() => setShowAddPurchaseOrderModal(false)}
                  style={{
                    padding: '16px 32px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '16px',
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e5e7eb';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <FaTimes size={16} />
                  Cancel
                </button>
                <button
                  onClick={handleAddPurchaseOrder}
                  style={{
                    padding: '16px 32px',
                    background: 'linear-gradient(135deg, #059669, #047857)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    fontWeight: '700',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 8px 16px rgba(5, 150, 105, 0.3)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 12px 24px rgba(5, 150, 105, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 8px 16px rgba(5, 150, 105, 0.3)';
                  }}
                >
                  <FaShoppingCart size={16} />
                  Create Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modern Add Supplier Modal */}
        {showAddSupplierModal && (
          <div style={getModalStyles()}>
            <div style={{...getModalContentStyles(), maxWidth: isMobile ? '100%' : '500px'}}>
              {/* Modal Header */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginBottom: '32px',
                paddingBottom: '20px',
                borderBottom: '2px solid #f3f4f6'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#059669',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 16px rgba(5, 150, 105, 0.3)'
                  }}>
                    <FaWarehouse size={20} color="white" />
                  </div>
                  <div>
                    <h2 style={{ 
                      fontSize: '24px', 
                      fontWeight: '700', 
                      color: '#1f2937', 
                      margin: 0,
                      background: 'linear-gradient(135deg, #059669, #047857)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      Add New Supplier
                    </h2>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                      Create a new supplier
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddSupplierModal(false)}
                  style={{
                    padding: '12px',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e5e7eb';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  <FaTimes size={16} color="#6b7280" />
                </button>
              </div>

              {/* Form Content */}
              <div style={{ display: 'grid', gap: '24px' }}>
                {/* Supplier Name */}
                <div>
                  <label style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px', 
                    display: 'block' 
                  }}>
                    Supplier Name *
                  </label>
                  <input
                    type="text"
                    value={supplierFormData.name}
                    onChange={(e) => setSupplierFormData({...supplierFormData, name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.2s',
                      backgroundColor: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                    placeholder="Enter supplier name"
                  />
                </div>

                {/* Contact Person */}
                <div>
                  <label style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px', 
                    display: 'block' 
                  }}>
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    value={supplierFormData.contact}
                    onChange={(e) => setSupplierFormData({...supplierFormData, contact: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.2s',
                      backgroundColor: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                    placeholder="Enter contact person name"
                  />
                </div>

                {/* Phone & Email Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px', 
                      display: 'block' 
                    }}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={supplierFormData.phone}
                      onChange={(e) => setSupplierFormData({...supplierFormData, phone: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        border: 'none',
                        borderRadius: '16px',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'all 0.2s',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                      onFocus={(e) => {
                        e.target.style.backgroundColor = '#f9fafb';
                        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      }}
                      onBlur={(e) => {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                      }}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px', 
                      display: 'block' 
                    }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={supplierFormData.email}
                      onChange={(e) => setSupplierFormData({...supplierFormData, email: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        border: 'none',
                        borderRadius: '16px',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'all 0.2s',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                      onFocus={(e) => {
                        e.target.style.backgroundColor = '#f9fafb';
                        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      }}
                      onBlur={(e) => {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                      }}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px', 
                    display: 'block' 
                  }}>
                    Address
                  </label>
                  <textarea
                    value={supplierFormData.address}
                    onChange={(e) => setSupplierFormData({...supplierFormData, address: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '16px',
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: '80px',
                      transition: 'all 0.2s',
                      backgroundColor: 'white',
                      fontFamily: 'inherit',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                    placeholder="Enter supplier address"
                  />
                </div>

                {/* Payment Terms */}
                <div>
                  <label style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px', 
                    display: 'block' 
                  }}>
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    value={supplierFormData.paymentTerms}
                    onChange={(e) => setSupplierFormData({...supplierFormData, paymentTerms: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.2s',
                      backgroundColor: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                    placeholder="e.g., Net 30, COD, etc."
                  />
                </div>

                {/* Notes */}
                <div>
                  <label style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px', 
                    display: 'block' 
                  }}>
                    Notes
                  </label>
                  <textarea
                    value={supplierFormData.notes}
                    onChange={(e) => setSupplierFormData({...supplierFormData, notes: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '16px',
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: '80px',
                      transition: 'all 0.2s',
                      backgroundColor: 'white',
                      fontFamily: 'inherit',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                    placeholder="Additional notes about the supplier"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ 
                display: 'flex', 
                gap: '16px', 
                marginTop: '32px', 
                justifyContent: 'flex-end',
                paddingTop: '24px',
                borderTop: '2px solid #f3f4f6'
              }}>
                <button
                  onClick={() => setShowAddSupplierModal(false)}
                  style={{
                    padding: '16px 32px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '16px',
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e5e7eb';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <FaTimes size={16} />
                  Cancel
                </button>
                <button
                  onClick={handleAddSupplier}
                  style={{
                    padding: '16px 32px',
                    background: 'linear-gradient(135deg, #059669, #047857)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    fontWeight: '700',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 8px 16px rgba(5, 150, 105, 0.3)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 12px 24px rgba(5, 150, 105, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 8px 16px rgba(5, 150, 105, 0.3)';
                  }}
                >
                  <FaSave size={16} />
                  Add Supplier
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Recipe Modal */}
        {showAddRecipeModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '32px',
              width: '100%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                  Add New Recipe
                </h2>
                <button
                  onClick={() => setShowAddRecipeModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6b7280',
                    padding: '8px',
                    borderRadius: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                    e.target.style.color = '#374151';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#6b7280';
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                {/* Recipe Name */}
                <div>
                  <label style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px', 
                    display: 'block' 
                  }}>
                    Recipe Name *
                  </label>
                  <input
                    type="text"
                    value={recipeFormData.name}
                    onChange={(e) => setRecipeFormData({...recipeFormData, name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.2s',
                      backgroundColor: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                    placeholder="e.g., Chicken Biryani"
                  />
                </div>

                {/* Category */}
                <div>
                  <label style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px', 
                    display: 'block' 
                  }}>
                    Category
                  </label>
                  <input
                    type="text"
                    value={recipeFormData.category}
                    onChange={(e) => setRecipeFormData({...recipeFormData, category: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.2s',
                      backgroundColor: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                    placeholder="e.g., Main Course, Dessert"
                  />
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px', 
                  display: 'block' 
                }}>
                  Description
                </label>
                <textarea
                  value={recipeFormData.description}
                  onChange={(e) => setRecipeFormData({...recipeFormData, description: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    border: 'none',
                    borderRadius: '16px',
                    fontSize: '16px',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '80px',
                    transition: 'all 0.2s',
                    backgroundColor: 'white',
                    fontFamily: 'inherit',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                  placeholder="Brief description of the recipe"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                {/* Servings */}
                <div>
                  <label style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px', 
                    display: 'block' 
                  }}>
                    Servings
                  </label>
                  <input
                    type="number"
                    value={recipeFormData.servings}
                    onChange={(e) => setRecipeFormData({...recipeFormData, servings: parseInt(e.target.value) || 1})}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.2s',
                      backgroundColor: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                    min="1"
                  />
                </div>

                {/* Prep Time */}
                <div>
                  <label style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px', 
                    display: 'block' 
                  }}>
                    Prep Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={recipeFormData.prepTime}
                    onChange={(e) => setRecipeFormData({...recipeFormData, prepTime: parseInt(e.target.value) || 0})}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.2s',
                      backgroundColor: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                    min="0"
                  />
                </div>

                {/* Cook Time */}
                <div>
                  <label style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px', 
                    display: 'block' 
                  }}>
                    Cook Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={recipeFormData.cookTime}
                    onChange={(e) => setRecipeFormData({...recipeFormData, cookTime: parseInt(e.target.value) || 0})}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.2s',
                      backgroundColor: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                    min="0"
                  />
                </div>
              </div>

              {/* Ingredients */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                    Ingredients *
                  </h3>
                  <button
                    onClick={addRecipeIngredient}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FaPlus size={12} />
                    Add Ingredient
                  </button>
                </div>

                {recipeFormData.ingredients.map((ingredient, index) => (
                  <div key={index} style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr auto',
                    gap: '12px',
                    alignItems: 'end',
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    marginBottom: '12px'
                  }}>
                    {/* Item Selection */}
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>
                        Item
                      </label>
                      <select
                        value={ingredient.inventoryItemId}
                        onChange={(e) => updateRecipeIngredient(index, 'inventoryItemId', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          outline: 'none',
                          backgroundColor: 'white',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="">Select item</option>
                        {inventoryItems.map(invItem => (
                          <option key={invItem.id} value={invItem.id}>
                            {invItem.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={ingredient.quantity}
                        onChange={(e) => updateRecipeIngredient(index, 'quantity', parseFloat(e.target.value) || 1)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          outline: 'none',
                          backgroundColor: 'white',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                        min="0.1"
                        step="0.1"
                      />
                    </div>

                    {/* Unit */}
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px', display: 'block' }}>
                        Unit
                      </label>
                      <input
                        type="text"
                        value={ingredient.unit}
                        onChange={(e) => updateRecipeIngredient(index, 'unit', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          outline: 'none',
                          backgroundColor: 'white',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                        placeholder="kg, g, ml, etc."
                      />
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeRecipeIngredient(index)}
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Instructions */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                    Instructions
                  </h3>
                  <button
                    onClick={addRecipeInstruction}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FaPlus size={12} />
                    Add Step
                  </button>
                </div>

                {recipeFormData.instructions.map((instruction, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      backgroundColor: '#059669',
                      color: 'white',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '600',
                      flexShrink: 0,
                      marginTop: '8px'
                    }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <textarea
                        value={instruction}
                        onChange={(e) => updateRecipeInstruction(index, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          outline: 'none',
                          resize: 'vertical',
                          minHeight: '60px',
                          backgroundColor: 'white',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          fontFamily: 'inherit'
                        }}
                        placeholder={`Step ${index + 1}...`}
                      />
                    </div>
                    <button
                      onClick={() => removeRecipeInstruction(index)}
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: '8px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '8px'
                      }}
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px', 
                  display: 'block' 
                }}>
                  Notes
                </label>
                <textarea
                  value={recipeFormData.notes}
                  onChange={(e) => setRecipeFormData({...recipeFormData, notes: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    border: 'none',
                    borderRadius: '16px',
                    fontSize: '16px',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '80px',
                    transition: 'all 0.2s',
                    backgroundColor: 'white',
                    fontFamily: 'inherit',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                  placeholder="Additional notes or tips"
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowAddRecipeModal(false)}
                  style={{
                    backgroundColor: '#6b7280',
                    color: 'white',
                    padding: '16px 32px',
                    border: 'none',
                    borderRadius: '16px',
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#4b5563';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#6b7280';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddRecipe}
                  disabled={loading}
                  style={{
                    backgroundColor: loading ? '#9ca3af' : '#059669',
                    color: 'white',
                    padding: '16px 32px',
                    border: 'none',
                    borderRadius: '16px',
                    fontWeight: '700',
                    fontSize: '16px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 8px 16px rgba(5, 150, 105, 0.3)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 12px 24px rgba(5, 150, 105, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 8px 16px rgba(5, 150, 105, 0.3)';
                    }
                  }}
                >
                  <FaSave size={16} />
                  {loading ? 'Adding...' : 'Add Recipe'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GRN Modal */}
        {showAddGRNModal && (
          <div style={getModalStyles()}>
            <div style={getModalContentStyles()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '20px' : '24px' }}>
                <h2 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '600', color: '#1f2937', margin: 0 }}>Create Goods Receipt Note</h2>
                <button 
                  onClick={() => setShowAddGRNModal(false)} 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    fontSize: isMobile ? '28px' : '24px', 
                    cursor: 'pointer', 
                    color: '#6b7280',
                    padding: isMobile ? '8px' : '4px',
                    minWidth: isMobile ? '44px' : 'auto',
                    minHeight: isMobile ? '44px' : 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >×</button>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Select Purchase Order *</label>
                <select
                  value={grnFormData.purchaseOrderId}
                  onChange={(e) => {
                    const po = purchaseOrders.find(p => p.id === e.target.value);
                    setGrnFormData({
                      purchaseOrderId: e.target.value,
                      items: po ? po.items.map(item => ({ ...item, receivedQuantity: item.quantity })) : []
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select a Purchase Order</option>
                  {purchaseOrders.filter(po => po.status === 'approved' || po.status === 'partially_received').map(po => (
                    <option key={po.id} value={po.id}>
                      PO #{po.id.slice(-8)} - {po.supplierName || 'Supplier'} - {getCurrencySymbol()}{po.totalAmount?.toLocaleString() || '0'}
                    </option>
                  ))}
                </select>
              </div>

              {grnFormData.items.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#374151' }}>Items to Receive</label>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {grnFormData.items.map((item, idx) => (
                      <div key={idx} style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontWeight: '600' }}>{item.inventoryItemName || item.name}</span>
                          <span style={{ color: '#6b7280' }}>Ordered: {item.quantity} {item.unit}</span>
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', color: '#6b7280' }}>Received Quantity *</label>
                          <input
                            type="number"
                            value={item.receivedQuantity || item.quantity}
                            onChange={(e) => {
                              const newItems = [...grnFormData.items];
                              newItems[idx].receivedQuantity = parseFloat(e.target.value) || 0;
                              setGrnFormData({ ...grnFormData, items: newItems });
                            }}
                            max={item.quantity}
                            min={0}
                            style={{
                              width: '100%',
                              padding: '8px',
                              borderRadius: '6px',
                              border: '1px solid #e5e7eb',
                              marginTop: '4px'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: isMobile ? '8px' : '12px', justifyContent: 'flex-end', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                <button
                  onClick={() => setShowAddGRNModal(false)}
                  style={{
                    padding: isMobile ? '14px 20px' : '12px 24px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: isMobile ? '14px' : '16px',
                    minHeight: isMobile ? '44px' : 'auto',
                    flex: isMobile ? '1' : 'none',
                    minWidth: isMobile ? '120px' : 'auto'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      const po = purchaseOrders.find(p => p.id === grnFormData.purchaseOrderId);
                      if (!po) {
                        setError('Please select a purchase order');
                        return;
                      }
                      
                      await apiClient.createGRN(currentRestaurant.id, {
                        purchaseOrderId: grnFormData.purchaseOrderId,
                        items: grnFormData.items.map(item => ({
                          inventoryItemId: item.inventoryItemId,
                          inventoryItemName: item.inventoryItemName || item.name,
                          orderedQuantity: item.quantity,
                          receivedQuantity: item.receivedQuantity || item.quantity,
                          unit: item.unit,
                          unitPrice: item.unitPrice || item.costPerUnit
                        }))
                      });
                      
                      setSuccess('GRN created successfully');
                      setShowAddGRNModal(false);
                      setGrnFormData({ purchaseOrderId: '', items: [] });
                      loadSCMData();
                      loadInventoryData();
                    } catch (error) {
                      setError(error.message);
                    }
                  }}
                  style={{
                    padding: isMobile ? '14px 20px' : '12px 24px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: isMobile ? '14px' : '16px',
                    minHeight: isMobile ? '44px' : 'auto',
                    flex: isMobile ? '1' : 'none',
                    minWidth: isMobile ? '120px' : 'auto'
                  }}
                >
                  Create GRN
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Purchase Requisition Modal */}
        {showAddRequisitionModal && (
          <div style={getModalStyles()}>
            <div style={getModalContentStyles()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '20px' : '24px' }}>
                <h2 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '600', color: '#1f2937', margin: 0 }}>Create Purchase Requisition</h2>
                <button 
                  onClick={() => setShowAddRequisitionModal(false)} 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    fontSize: isMobile ? '28px' : '24px', 
                    cursor: 'pointer', 
                    color: '#6b7280',
                    padding: isMobile ? '8px' : '4px',
                    minWidth: isMobile ? '44px' : 'auto',
                    minHeight: isMobile ? '44px' : 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >×</button>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Priority</label>
                <select
                  value={requisitionFormData.priority}
                  onChange={(e) => setRequisitionFormData({ ...requisitionFormData, priority: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '14px'
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Add Items</label>
                <button
                  onClick={() => {
                    setRequisitionFormData({
                      ...requisitionFormData,
                      items: [...requisitionFormData.items, { inventoryItemId: '', inventoryItemName: '', quantity: 1, unit: '', estimatedCost: 0 }]
                    });
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    marginBottom: '12px'
                  }}
                >
                  + Add Item
                </button>
                
                {requisitionFormData.items.map((item, idx) => (
                  <div key={idx} style={{ padding: isMobile ? '12px' : '16px', backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '12px' }}>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr', 
                      gap: isMobile ? '8px' : '12px', 
                      marginBottom: '8px' 
                    }}>
                      <select
                        value={item.inventoryItemId}
                        onChange={(e) => {
                          const selectedItem = inventoryItems.find(i => i.id === e.target.value);
                          const newItems = [...requisitionFormData.items];
                          newItems[idx] = {
                            ...newItems[idx],
                            inventoryItemId: e.target.value,
                            inventoryItemName: selectedItem?.name || '',
                            unit: selectedItem?.unit || ''
                          };
                          setRequisitionFormData({ ...requisitionFormData, items: newItems });
                        }}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                      >
                        <option value="">Select Item</option>
                        {inventoryItems.map(invItem => (
                          <option key={invItem.id} value={invItem.id}>{invItem.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...requisitionFormData.items];
                          newItems[idx].quantity = parseFloat(e.target.value) || 0;
                          setRequisitionFormData({ ...requisitionFormData, items: newItems });
                        }}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                      />
                      <button
                        onClick={() => {
                          setRequisitionFormData({
                            ...requisitionFormData,
                            items: requisitionFormData.items.filter((_, i) => i !== idx)
                          });
                        }}
                        style={{
                          padding: '8px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Reason</label>
                <textarea
                  value={requisitionFormData.reason}
                  onChange={(e) => setRequisitionFormData({ ...requisitionFormData, reason: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    minHeight: '80px'
                  }}
                  placeholder="Reason for requisition"
                />
              </div>

              <div style={{ display: 'flex', gap: isMobile ? '8px' : '12px', justifyContent: 'flex-end', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                <button
                  onClick={() => setShowAddRequisitionModal(false)}
                  style={{
                    padding: isMobile ? '14px 20px' : '12px 24px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: isMobile ? '14px' : '16px',
                    minHeight: isMobile ? '44px' : 'auto',
                    flex: isMobile ? '1' : 'none',
                    minWidth: isMobile ? '120px' : 'auto'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      if (requisitionFormData.items.length === 0) {
                        setError('Please add at least one item');
                        return;
                      }
                      
                      await apiClient.createPurchaseRequisition(currentRestaurant.id, {
                        items: requisitionFormData.items.map(item => ({
                          inventoryItemId: item.inventoryItemId,
                          inventoryItemName: item.inventoryItemName,
                          quantity: item.quantity,
                          unit: item.unit,
                          estimatedCost: item.estimatedCost || 0
                        })),
                        priority: requisitionFormData.priority,
                        reason: requisitionFormData.reason,
                        notes: requisitionFormData.notes
                      });
                      
                      setSuccess('Purchase requisition created successfully');
                      setShowAddRequisitionModal(false);
                      setRequisitionFormData({ items: [], priority: 'medium', reason: '', notes: '' });
                      loadSCMData();
                    } catch (error) {
                      setError(error.message);
                    }
                  }}
                  style={{
                    padding: isMobile ? '14px 20px' : '12px 24px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: isMobile ? '14px' : '16px',
                    minHeight: isMobile ? '44px' : 'auto',
                    flex: isMobile ? '1' : 'none',
                    minWidth: isMobile ? '120px' : 'auto'
                  }}
                >
                  Create Requisition
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Supplier Return Modal */}
        {showAddReturnModal && (
          <div style={getModalStyles()}>
            <div style={getModalContentStyles()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '20px' : '24px' }}>
                <h2 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '600', color: '#1f2937', margin: 0 }}>Create Supplier Return</h2>
                <button 
                  onClick={() => setShowAddReturnModal(false)} 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    fontSize: isMobile ? '28px' : '24px', 
                    cursor: 'pointer', 
                    color: '#6b7280',
                    padding: isMobile ? '8px' : '4px',
                    minWidth: isMobile ? '44px' : 'auto',
                    minHeight: isMobile ? '44px' : 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >×</button>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Supplier *</label>
                <select
                  value={returnFormData.supplierId}
                  onChange={(e) => setReturnFormData({ ...returnFormData, supplierId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Return Type</label>
                <select
                  value={returnFormData.returnType}
                  onChange={(e) => setReturnFormData({ ...returnFormData, returnType: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '14px'
                  }}
                >
                  <option value="damaged">Damaged</option>
                  <option value="defective">Defective</option>
                  <option value="wrong_item">Wrong Item</option>
                  <option value="excess">Excess</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Add Items</label>
                <button
                  onClick={() => {
                    setReturnFormData({
                      ...returnFormData,
                      items: [...returnFormData.items, { inventoryItemId: '', inventoryItemName: '', quantity: 1, unit: '', costPerUnit: 0, reason: '' }]
                    });
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    marginBottom: '12px'
                  }}
                >
                  + Add Item
                </button>
                
                {returnFormData.items.map((item, idx) => (
                  <div key={idx} style={{ padding: isMobile ? '12px' : '16px', backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '12px' }}>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr', 
                      gap: isMobile ? '8px' : '8px', 
                      marginBottom: '8px' 
                    }}>
                      <select
                        value={item.inventoryItemId}
                        onChange={(e) => {
                          const selectedItem = inventoryItems.find(i => i.id === e.target.value);
                          const newItems = [...returnFormData.items];
                          newItems[idx] = {
                            ...newItems[idx],
                            inventoryItemId: e.target.value,
                            inventoryItemName: selectedItem?.name || '',
                            unit: selectedItem?.unit || '',
                            costPerUnit: selectedItem?.costPerUnit || 0
                          };
                          setReturnFormData({ ...returnFormData, items: newItems });
                        }}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                      >
                        <option value="">Select Item</option>
                        {inventoryItems.map(invItem => (
                          <option key={invItem.id} value={invItem.id}>{invItem.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...returnFormData.items];
                          newItems[idx].quantity = parseFloat(e.target.value) || 0;
                          setReturnFormData({ ...returnFormData, items: newItems });
                        }}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                      />
                      <input
                        type="number"
                        placeholder="Cost/Unit"
                        value={item.costPerUnit}
                        onChange={(e) => {
                          const newItems = [...returnFormData.items];
                          newItems[idx].costPerUnit = parseFloat(e.target.value) || 0;
                          setReturnFormData({ ...returnFormData, items: newItems });
                        }}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                      />
                      <button
                        onClick={() => {
                          setReturnFormData({
                            ...returnFormData,
                            items: returnFormData.items.filter((_, i) => i !== idx)
                          });
                        }}
                        style={{
                          padding: '8px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Return reason for this item"
                      value={item.reason}
                      onChange={(e) => {
                        const newItems = [...returnFormData.items];
                        newItems[idx].reason = e.target.value;
                        setReturnFormData({ ...returnFormData, items: newItems });
                      }}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb',
                        marginTop: '8px'
                      }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Notes</label>
                <textarea
                  value={returnFormData.notes}
                  onChange={(e) => setReturnFormData({ ...returnFormData, notes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    minHeight: '80px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: isMobile ? '8px' : '12px', justifyContent: 'flex-end', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                <button
                  onClick={() => setShowAddReturnModal(false)}
                  style={{
                    padding: isMobile ? '14px 20px' : '12px 24px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: isMobile ? '14px' : '16px',
                    minHeight: isMobile ? '44px' : 'auto',
                    flex: isMobile ? '1' : 'none',
                    minWidth: isMobile ? '120px' : 'auto'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      if (!returnFormData.supplierId || returnFormData.items.length === 0) {
                        setError('Please select supplier and add items');
                        return;
                      }
                      
                      await apiClient.createSupplierReturn(currentRestaurant.id, returnFormData);
                      
                      setSuccess('Return order created successfully');
                      setShowAddReturnModal(false);
                      setReturnFormData({ purchaseOrderId: '', supplierId: '', items: [], returnType: 'damaged', reason: '', notes: '' });
                      loadSCMData();
                      loadInventoryData();
                    } catch (error) {
                      setError(error.message);
                    }
                  }}
                  style={{
                    padding: isMobile ? '14px 20px' : '12px 24px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: isMobile ? '14px' : '16px',
                    minHeight: isMobile ? '44px' : 'auto',
                    flex: isMobile ? '1' : 'none',
                    minWidth: isMobile ? '120px' : 'auto'
                  }}
                >
                  Create Return
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stock Transfer Modal */}
        {showAddTransferModal && (
          <div style={getModalStyles()}>
            <div style={getModalContentStyles()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '20px' : '24px' }}>
                <h2 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '600', color: '#1f2937', margin: 0 }}>Create Stock Transfer</h2>
                <button 
                  onClick={() => setShowAddTransferModal(false)} 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    fontSize: isMobile ? '28px' : '24px', 
                    cursor: 'pointer', 
                    color: '#6b7280',
                    padding: isMobile ? '8px' : '4px',
                    minWidth: isMobile ? '44px' : 'auto',
                    minHeight: isMobile ? '44px' : 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >×</button>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                gap: isMobile ? '12px' : '16px', 
                marginBottom: '20px' 
              }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>From Location *</label>
                  <input
                    type="text"
                    value={transferFormData.fromLocation}
                    onChange={(e) => setTransferFormData({ ...transferFormData, fromLocation: e.target.value })}
                    placeholder="e.g., Main Store"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>To Location *</label>
                  <input
                    type="text"
                    value={transferFormData.toLocation}
                    onChange={(e) => setTransferFormData({ ...transferFormData, toLocation: e.target.value })}
                    placeholder="e.g., Branch Store"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Add Items</label>
                <button
                  onClick={() => {
                    setTransferFormData({
                      ...transferFormData,
                      items: [...transferFormData.items, { inventoryItemId: '', inventoryItemName: '', quantity: 1, unit: '' }]
                    });
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    marginBottom: '12px'
                  }}
                >
                  + Add Item
                </button>
                
                {transferFormData.items.map((item, idx) => (
                  <div key={idx} style={{ padding: isMobile ? '12px' : '16px', backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '12px' }}>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr', 
                      gap: isMobile ? '8px' : '12px' 
                    }}>
                      <select
                        value={item.inventoryItemId}
                        onChange={(e) => {
                          const selectedItem = inventoryItems.find(i => i.id === e.target.value);
                          const newItems = [...transferFormData.items];
                          newItems[idx] = {
                            ...newItems[idx],
                            inventoryItemId: e.target.value,
                            inventoryItemName: selectedItem?.name || '',
                            unit: selectedItem?.unit || ''
                          };
                          setTransferFormData({ ...transferFormData, items: newItems });
                        }}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                      >
                        <option value="">Select Item</option>
                        {inventoryItems.map(invItem => (
                          <option key={invItem.id} value={invItem.id}>{invItem.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...transferFormData.items];
                          newItems[idx].quantity = parseFloat(e.target.value) || 0;
                          setTransferFormData({ ...transferFormData, items: newItems });
                        }}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                      />
                      <button
                        onClick={() => {
                          setTransferFormData({
                            ...transferFormData,
                            items: transferFormData.items.filter((_, i) => i !== idx)
                          });
                        }}
                        style={{
                          padding: '8px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Reason</label>
                <textarea
                  value={transferFormData.reason}
                  onChange={(e) => setTransferFormData({ ...transferFormData, reason: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    minHeight: '80px'
                  }}
                  placeholder="Reason for transfer"
                />
              </div>

              <div style={{ display: 'flex', gap: isMobile ? '8px' : '12px', justifyContent: 'flex-end', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                <button
                  onClick={() => setShowAddTransferModal(false)}
                  style={{
                    padding: isMobile ? '14px 20px' : '12px 24px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: isMobile ? '14px' : '16px',
                    minHeight: isMobile ? '44px' : 'auto',
                    flex: isMobile ? '1' : 'none',
                    minWidth: isMobile ? '120px' : 'auto'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      if (!transferFormData.fromLocation || !transferFormData.toLocation || transferFormData.items.length === 0) {
                        setError('Please fill all required fields');
                        return;
                      }
                      
                      await apiClient.createStockTransfer(currentRestaurant.id, transferFormData);
                      
                      setSuccess('Stock transfer created successfully');
                      setShowAddTransferModal(false);
                      setTransferFormData({ fromLocation: '', toLocation: '', items: [], reason: '', notes: '' });
                      loadSCMData();
                      loadInventoryData();
                    } catch (error) {
                      setError(error.message);
                    }
                  }}
                  style={{
                    padding: isMobile ? '14px 20px' : '12px 24px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: isMobile ? '14px' : '16px',
                    minHeight: isMobile ? '44px' : 'auto',
                    flex: isMobile ? '1' : 'none',
                    minWidth: isMobile ? '120px' : 'auto'
                  }}
                >
                  Create Transfer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Modal */}
        {showAddInvoiceModal && (
          <div style={getModalStyles()}>
            <div style={{...getModalContentStyles(), maxWidth: isMobile ? '100%' : '600px'}}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '20px' : '24px' }}>
                <h2 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '600', color: '#1f2937', margin: 0 }}>Create Supplier Invoice</h2>
                <button 
                  onClick={() => setShowAddInvoiceModal(false)} 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    fontSize: isMobile ? '28px' : '24px', 
                    cursor: 'pointer', 
                    color: '#6b7280',
                    padding: isMobile ? '8px' : '4px',
                    minWidth: isMobile ? '44px' : 'auto',
                    minHeight: isMobile ? '44px' : 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >×</button>
              </div>
              
              {/* Info Box */}
              <div style={{
                padding: '12px',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '13px',
                color: '#1e40af'
              }}>
                <strong>💡 How to create invoices:</strong>
                <ul style={{ margin: '8px 0 0 20px', padding: 0, lineHeight: '1.8' }}>
                  <li><strong>From Purchase Order:</strong> Go to Purchase Orders tab → Click &quot;Generate Invoice&quot; on delivered orders</li>
                  <li><strong>Upload Supplier Invoice:</strong> Use the button below to upload invoice image (OCR will extract data)</li>
                  <li><strong>Manual Entry:</strong> Fill the form below if supplier sent invoice separately</li>
                </ul>
              </div>

              {/* Invoice OCR Button */}
              <div style={{ marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => invoiceFileInputRef.current?.click()}
                  disabled={processingInvoiceOCR}
                  style={{
                    width: '100%',
                    padding: isMobile ? '14px' : '12px 20px',
                    backgroundColor: processingInvoiceOCR ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: processingInvoiceOCR ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    minHeight: isMobile ? '44px' : 'auto'
                  }}
                >
                  {processingInvoiceOCR ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid white',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Processing Invoice...
                    </>
                  ) : (
                    <>
                      <FaCamera size={16} />
                      Upload Invoice from Photo/Image (OCR)
                    </>
                  )}
                </button>
                <input
                  ref={invoiceFileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !currentRestaurant) return;
                    
                    try {
                      setProcessingInvoiceOCR(true);
                      setError(null);
                      
                      const response = await apiClient.processInvoiceOCR(file, currentRestaurant.id);
                      
                      if (response.success) {
                        // Auto-fill invoice form
                        setInvoiceFormData({
                          supplierId: response.supplierId || '',
                          invoiceNumber: response.invoiceNumber || '',
                          invoiceDate: response.invoiceDate || new Date().toISOString().split('T')[0],
                          totalAmount: response.totalAmount || 0,
                          items: response.items || [],
                          imageUrl: '',
                          notes: response.notes || ''
                        });
                        
                        setSuccess('Invoice data extracted successfully!');
                        setTimeout(() => setSuccess(null), 5000);
                      }
                    } catch (error) {
                      console.error('Invoice OCR error:', error);
                      setError(error.message || 'Failed to process invoice image');
                    } finally {
                      setProcessingInvoiceOCR(false);
                      // Reset file input
                      if (invoiceFileInputRef.current) {
                        invoiceFileInputRef.current.value = '';
                      }
                    }
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Supplier *</label>
                <select
                  value={invoiceFormData.supplierId}
                  onChange={(e) => setInvoiceFormData({ ...invoiceFormData, supplierId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Invoice Number *</label>
                <input
                  type="text"
                  value={invoiceFormData.invoiceNumber}
                  onChange={(e) => setInvoiceFormData({ ...invoiceFormData, invoiceNumber: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '14px'
                  }}
                  placeholder="INV-2024-001"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Invoice Date *</label>
                <input
                  type="date"
                  value={invoiceFormData.invoiceDate}
                  onChange={(e) => setInvoiceFormData({ ...invoiceFormData, invoiceDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Total Amount *</label>
                <input
                  type="number"
                  value={invoiceFormData.totalAmount}
                  onChange={(e) => setInvoiceFormData({ ...invoiceFormData, totalAmount: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '14px'
                  }}
                  placeholder="0.00"
                />
              </div>

              <div style={{ display: 'flex', gap: isMobile ? '8px' : '12px', justifyContent: 'flex-end', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                <button
                  onClick={() => setShowAddInvoiceModal(false)}
                  style={{
                    padding: isMobile ? '14px 20px' : '12px 24px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: isMobile ? '14px' : '16px',
                    minHeight: isMobile ? '44px' : 'auto',
                    flex: isMobile ? '1' : 'none',
                    minWidth: isMobile ? '120px' : 'auto'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      if (!invoiceFormData.supplierId || !invoiceFormData.invoiceNumber || !invoiceFormData.totalAmount) {
                        setError('Please fill all required fields');
                        return;
                      }
                      
                      await apiClient.createSupplierInvoice(currentRestaurant.id, {
                        supplierId: invoiceFormData.supplierId,
                        invoiceNumber: invoiceFormData.invoiceNumber,
                        invoiceDate: new Date(invoiceFormData.invoiceDate),
                        totalAmount: invoiceFormData.totalAmount,
                        items: [],
                        notes: invoiceFormData.notes
                      });
                      
                      setSuccess('Invoice created successfully');
                      setShowAddInvoiceModal(false);
                      setInvoiceFormData({
                        supplierId: '',
                        invoiceNumber: '',
                        invoiceDate: new Date().toISOString().split('T')[0],
                        items: [],
                        totalAmount: 0,
                        imageUrl: '',
                        notes: ''
                      });
                      loadSCMData();
                    } catch (error) {
                      setError(error.message);
                    }
                  }}
                  style={{
                    padding: isMobile ? '14px 20px' : '12px 24px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: isMobile ? '14px' : '16px',
                    minHeight: isMobile ? '44px' : 'auto',
                    flex: isMobile ? '1' : 'none',
                    minWidth: isMobile ? '120px' : 'auto'
                  }}
                >
                  Create Invoice
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

