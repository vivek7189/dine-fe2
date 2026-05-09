'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../../lib/api';

const DEFAULT_SUB_CATEGORIES = {
  rent: ['Office Rent', 'Kitchen Rent', 'Storage Rent'],
  utilities: ['Electricity', 'Water', 'Gas', 'Phone', 'Internet'],
  salaries: ['Chef', 'Waiter', 'Manager', 'Cleaner'],
  marketing: ['Social Media', 'Print Ads', 'Promotions', 'Events'],
  repairs: ['Plumbing', 'Electrical', 'AC/Heating', 'Furniture'],
  supplies: ['Kitchen Supplies', 'Cleaning Supplies', 'Office Supplies'],
  insurance: ['Property', 'Liability', 'Health', 'Vehicle'],
  licenses: ['Food License', 'Liquor License', 'Business Permit'],
  equipment: ['Kitchen Equipment', 'POS Hardware', 'Furniture'],
  miscellaneous: [],
};

const DEFAULT_EXPENSE_CATEGORIES = [
  { value: 'rent', label: 'Rent', subCategories: DEFAULT_SUB_CATEGORIES.rent },
  { value: 'utilities', label: 'Utilities', subCategories: DEFAULT_SUB_CATEGORIES.utilities },
  { value: 'salaries', label: 'Salaries & Wages', subCategories: DEFAULT_SUB_CATEGORIES.salaries },
  { value: 'marketing', label: 'Marketing', subCategories: DEFAULT_SUB_CATEGORIES.marketing },
  { value: 'repairs', label: 'Repairs & Maintenance', subCategories: DEFAULT_SUB_CATEGORIES.repairs },
  { value: 'supplies', label: 'Supplies', subCategories: DEFAULT_SUB_CATEGORIES.supplies },
  { value: 'insurance', label: 'Insurance', subCategories: DEFAULT_SUB_CATEGORIES.insurance },
  { value: 'licenses', label: 'Licenses & Permits', subCategories: DEFAULT_SUB_CATEGORIES.licenses },
  { value: 'equipment', label: 'Equipment', subCategories: DEFAULT_SUB_CATEGORIES.equipment },
  { value: 'miscellaneous', label: 'Miscellaneous', subCategories: DEFAULT_SUB_CATEGORIES.miscellaneous },
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
];

const PERIODS = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 Days' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: '30d', label: 'Last 30 Days' },
  { value: 'this_year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
];

const defaultExpenseForm = {
  category: '', subCategories: [], amount: '', date: new Date().toISOString().split('T')[0],
  description: '', paymentMethod: 'cash', vendor: '', isRecurring: false, recurringFrequency: 'monthly'
};

export default function useBooks() {
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Data states
  const [overviewData, setOverviewData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [cogsData, setCogsData] = useState(null);
  const [expensesList, setExpensesList] = useState([]);
  const [expensesSummary, setExpensesSummary] = useState({ total: 0, byCategory: {}, count: 0 });
  const [supplierDuesData, setSupplierDuesData] = useState(null);
  const [pnlData, setPnlData] = useState(null);
  const [payrollConfig, setPayrollConfig] = useState([]);
  const [payrollRuns, setPayrollRuns] = useState([]);
  const [staffList, setStaffList] = useState([]);

  // Loading states
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingRevenue, setLoadingRevenue] = useState(false);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [loadingSupplierDues, setLoadingSupplierDues] = useState(false);
  const [loadingPnl, setLoadingPnl] = useState(false);
  const [loadingPayroll, setLoadingPayroll] = useState(false);

  // Modal states
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseFormData, setExpenseFormData] = useState({ ...defaultExpenseForm });

  // Custom categories
  const [customCategories, setCustomCategories] = useState([]);
  const [showManageCategories, setShowManageCategories] = useState(false);

  // Filters
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('');

  // Toast
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const restaurantId = typeof window !== 'undefined' ? localStorage.getItem('selectedRestaurantId') : null;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const getParams = useCallback(() => {
    const params = { period };
    if (period === 'custom' && customStart) params.startDate = customStart;
    if (period === 'custom' && customEnd) params.endDate = customEnd;
    return params;
  }, [period, customStart, customEnd]);

  // Auto-clear toasts
  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(null), 4000); return () => clearTimeout(t); }
  }, [error]);
  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(null), 3000); return () => clearTimeout(t); }
  }, [success]);

  // Fetch functions
  const fetchOverview = useCallback(async () => {
    if (!restaurantId) return;
    setLoadingOverview(true);
    try {
      const res = await apiClient.getBooksOverview(restaurantId, getParams());
      if (res.success) setOverviewData(res.data);
    } catch (err) { console.error('Overview fetch error:', err); }
    setLoadingOverview(false);
  }, [restaurantId, getParams]);

  const fetchRevenue = useCallback(async () => {
    if (!restaurantId) return;
    setLoadingRevenue(true);
    try {
      const res = await apiClient.getBooksRevenue(restaurantId, getParams());
      if (res.success) setRevenueData(res.data);
    } catch (err) { console.error('Revenue fetch error:', err); }
    setLoadingRevenue(false);
  }, [restaurantId, getParams]);

  const fetchExpenses = useCallback(async () => {
    if (!restaurantId) return;
    setLoadingExpenses(true);
    try {
      const params = { ...getParams() };
      if (expenseCategoryFilter) params.category = expenseCategoryFilter;
      const res = await apiClient.getBooksExpenses(restaurantId, params);
      if (res.success) {
        // Normalize subCategories to always be an array
        const expenses = (res.data.expenses || []).map(exp => ({
          ...exp,
          subCategories: normalizeSubCategories(exp),
        }));
        setExpensesList(expenses);
        setExpensesSummary({ total: res.data.total, byCategory: res.data.byCategory, count: res.data.count });
      }
    } catch (err) { console.error('Expenses fetch error:', err); }
    setLoadingExpenses(false);
  }, [restaurantId, getParams, expenseCategoryFilter]);

  // Merged categories: defaults + custom (with sub-category merging)
  const EXPENSE_CATEGORIES = (() => {
    const merged = DEFAULT_EXPENSE_CATEGORIES.map(d => {
      // Check if custom categories override this default's subCategories
      const custom = customCategories.find(cc => cc.value === d.value);
      if (custom) {
        return { ...d, ...custom, subCategories: custom.subCategories || d.subCategories || [] };
      }
      return { ...d };
    });
    for (const cc of customCategories) {
      if (!merged.some(d => d.value === cc.value)) {
        merged.push({ ...cc, subCategories: cc.subCategories || [] });
      }
    }
    return merged;
  })();

  // Build label/color/sub-category lookups from merged categories
  const CATEGORY_LABELS_MAP = {};
  const CATEGORY_COLORS_MAP = {};
  const SUB_CATEGORIES_MAP = {};
  for (const cat of EXPENSE_CATEGORIES) {
    CATEGORY_LABELS_MAP[cat.value] = cat.label;
    if (cat.color) CATEGORY_COLORS_MAP[cat.value] = cat.color;
    SUB_CATEGORIES_MAP[cat.value] = cat.subCategories || [];
  }

  const fetchExpenseCategories = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const res = await apiClient.getExpenseCategories(restaurantId);
      if (res.success) setCustomCategories(res.categories || []);
    } catch (err) { console.error('Fetch expense categories error:', err); }
  }, [restaurantId]);

  const handleSaveCustomCategories = async (categories) => {
    try {
      const res = await apiClient.saveExpenseCategories(restaurantId, categories);
      if (res.success) {
        setCustomCategories(categories);
        setSuccess('Categories saved');
      }
    } catch (err) { setError('Failed to save categories'); }
  };

  const fetchSupplierDues = useCallback(async () => {
    if (!restaurantId) return;
    setLoadingSupplierDues(true);
    try {
      const res = await apiClient.getBooksSupplierDues(restaurantId);
      if (res.success) setSupplierDuesData(res.data);
    } catch (err) { console.error('Supplier dues fetch error:', err); }
    setLoadingSupplierDues(false);
  }, [restaurantId]);

  const fetchPnl = useCallback(async () => {
    if (!restaurantId) return;
    setLoadingPnl(true);
    try {
      const res = await apiClient.getBooksPnl(restaurantId, getParams());
      if (res.success) setPnlData(res.data);
    } catch (err) { console.error('P&L fetch error:', err); }
    setLoadingPnl(false);
  }, [restaurantId, getParams]);

  // Payroll functions
  const fetchPayroll = useCallback(async () => {
    if (!restaurantId) return;
    setLoadingPayroll(true);
    try {
      const [configRes, runsRes, staffRes] = await Promise.all([
        apiClient.getPayrollConfig(restaurantId),
        apiClient.getPayrollRuns(restaurantId),
        apiClient.getStaff(restaurantId).catch(() => ({ staff: [] })),
      ]);
      setPayrollConfig(configRes?.configs || []);
      setPayrollRuns(runsRes?.runs || []);
      setStaffList(staffRes?.staff || staffRes || []);
    } catch (err) { console.error('Payroll fetch error:', err); }
    setLoadingPayroll(false);
  }, [restaurantId]);

  const handleSavePayrollConfig = async (data) => {
    try {
      await apiClient.updatePayrollConfig(restaurantId, data);
      setSuccess('Salary config saved');
      fetchPayroll();
    } catch (err) { setError('Failed to save salary config'); }
  };

  const handleDeletePayrollConfig = async (configId) => {
    try {
      await apiClient.deletePayrollConfig(restaurantId, configId);
      setSuccess('Salary config deleted');
      fetchPayroll();
    } catch (err) { setError('Failed to delete config'); }
  };

  const handleGeneratePayrollRun = async (month) => {
    try {
      await apiClient.generatePayrollRun(restaurantId, { month });
      setSuccess(`Payroll generated for ${month}`);
      fetchPayroll();
    } catch (err) { setError(err?.message || 'Failed to generate payroll run'); }
  };

  const handleUpdatePayrollRun = async (runId, status) => {
    try {
      await apiClient.updatePayrollRun(restaurantId, runId, { status });
      setSuccess(`Payroll run ${status}`);
      fetchPayroll();
    } catch (err) { setError('Failed to update payroll run'); }
  };

  const handleViewPaySlips = async (runId) => {
    try {
      return await apiClient.getPaySlips(restaurantId, runId);
    } catch (err) { setError('Failed to fetch pay slips'); return null; }
  };

  // Supplier payment recording
  const handleRecordSupplierPayment = async (invoiceId, paymentData) => {
    try {
      await apiClient.updateSupplierInvoice(restaurantId, invoiceId, paymentData);
      setSuccess('Payment recorded');
      fetchSupplierDues();
    } catch (err) { setError('Failed to record payment'); }
  };

  // Load overview + custom categories on mount
  useEffect(() => { fetchOverview(); fetchExpenseCategories(); }, [fetchOverview, fetchExpenseCategories]);

  // Load tab data on tab switch
  useEffect(() => {
    if (activeTab === 'overview') fetchOverview();
    else if (activeTab === 'revenue') fetchRevenue();
    else if (activeTab === 'expenses') fetchExpenses();
    else if (activeTab === 'supplier-dues') fetchSupplierDues();
    else if (activeTab === 'pnl') fetchPnl();
    else if (activeTab === 'payroll') fetchPayroll();
  }, [activeTab, period, customStart, customEnd]);

  // Ensure subCategories is always a clean array
  const normalizeSubCategories = (expense) => {
    if (Array.isArray(expense.subCategories)) return expense.subCategories;
    return [];
  };

  // Expense CRUD
  const handleAddExpense = async () => {
    if (!expenseFormData.category || !expenseFormData.amount || !expenseFormData.date) {
      setError('Category, amount, and date are required');
      return;
    }
    try {
      const res = await apiClient.createBooksExpense(restaurantId, expenseFormData);
      if (res.success) {
        setSuccess('Expense added');
        setShowAddExpenseModal(false);
        setExpenseFormData({ ...defaultExpenseForm });
        fetchExpenses();
        if (activeTab === 'overview') fetchOverview();
      }
    } catch (err) { setError('Failed to add expense'); }
  };

  const handleUpdateExpense = async () => {
    if (!editingExpense) return;
    try {
      const res = await apiClient.updateBooksExpense(restaurantId, editingExpense.id, expenseFormData);
      if (res.success) {
        setSuccess('Expense updated');
        setShowAddExpenseModal(false);
        setEditingExpense(null);
        setExpenseFormData({ ...defaultExpenseForm });
        fetchExpenses();
        if (activeTab === 'overview') fetchOverview();
      }
    } catch (err) { setError('Failed to update expense'); }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      const res = await apiClient.deleteBooksExpense(restaurantId, expenseId);
      if (res.success) {
        setSuccess('Expense deleted');
        fetchExpenses();
        if (activeTab === 'overview') fetchOverview();
      }
    } catch (err) { setError('Failed to delete expense'); }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseFormData({
      category: expense.category || '',
      subCategories: normalizeSubCategories(expense),
      amount: expense.amount || '',
      date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
      description: expense.description || '',
      paymentMethod: expense.paymentMethod || 'cash',
      vendor: expense.vendor || '',
      isRecurring: expense.isRecurring || false,
      recurringFrequency: expense.recurringFrequency || 'monthly',
    });
    setShowAddExpenseModal(true);
  };

  const getModalStyles = () => ({
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 10001, padding: '20px',
  });
  const getModalContentStyles = () => ({
    backgroundColor: 'white', borderRadius: '16px', width: '100%',
    maxWidth: '520px', maxHeight: '90vh', position: 'relative',
  });

  return {
    activeTab, setActiveTab, period, setPeriod,
    customStart, setCustomStart, customEnd, setCustomEnd,
    isMobile, error, setError, success, setSuccess,
    overviewData, revenueData, cogsData, expensesList, expensesSummary,
    supplierDuesData, pnlData,
    payrollConfig, payrollRuns, staffList, loadingPayroll,
    loadingOverview, loadingRevenue, loadingExpenses, loadingSupplierDues, loadingPnl,
    showAddExpenseModal, setShowAddExpenseModal, editingExpense, setEditingExpense,
    expenseFormData, setExpenseFormData,
    expenseCategoryFilter, setExpenseCategoryFilter,
    handleAddExpense, handleUpdateExpense, handleDeleteExpense, handleEditExpense,
    handleSavePayrollConfig, handleDeletePayrollConfig,
    handleGeneratePayrollRun, handleUpdatePayrollRun, handleViewPaySlips,
    handleRecordSupplierPayment,
    fetchOverview, fetchRevenue, fetchExpenses, fetchSupplierDues, fetchPnl, fetchPayroll,
    getModalStyles, getModalContentStyles,
    restaurantId, apiClient,
    EXPENSE_CATEGORIES, PAYMENT_METHODS, PERIODS,
    customCategories, setCustomCategories, showManageCategories, setShowManageCategories,
    handleSaveCustomCategories, CATEGORY_LABELS_MAP, CATEGORY_COLORS_MAP, SUB_CATEGORIES_MAP,
  };
}
