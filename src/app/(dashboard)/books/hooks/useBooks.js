'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../../lib/api';

const EXPENSE_CATEGORIES = [
  { value: 'rent', label: 'Rent' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'salaries', label: 'Salaries & Wages' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'repairs', label: 'Repairs & Maintenance' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'licenses', label: 'Licenses & Permits' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'miscellaneous', label: 'Miscellaneous' },
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
  category: '', amount: '', date: new Date().toISOString().split('T')[0],
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

  // Loading states
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingRevenue, setLoadingRevenue] = useState(false);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [loadingSupplierDues, setLoadingSupplierDues] = useState(false);
  const [loadingPnl, setLoadingPnl] = useState(false);

  // Modal states
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseFormData, setExpenseFormData] = useState({ ...defaultExpenseForm });

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
        setExpensesList(res.data.expenses);
        setExpensesSummary({ total: res.data.total, byCategory: res.data.byCategory, count: res.data.count });
      }
    } catch (err) { console.error('Expenses fetch error:', err); }
    setLoadingExpenses(false);
  }, [restaurantId, getParams, expenseCategoryFilter]);

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

  // Load overview on mount
  useEffect(() => { fetchOverview(); }, [fetchOverview]);

  // Load tab data on tab switch
  useEffect(() => {
    if (activeTab === 'overview') fetchOverview();
    else if (activeTab === 'revenue') fetchRevenue();
    else if (activeTab === 'expenses') fetchExpenses();
    else if (activeTab === 'supplier-dues') fetchSupplierDues();
    else if (activeTab === 'pnl') fetchPnl();
  }, [activeTab, period, customStart, customEnd]);

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
    loadingOverview, loadingRevenue, loadingExpenses, loadingSupplierDues, loadingPnl,
    showAddExpenseModal, setShowAddExpenseModal, editingExpense, setEditingExpense,
    expenseFormData, setExpenseFormData,
    expenseCategoryFilter, setExpenseCategoryFilter,
    handleAddExpense, handleUpdateExpense, handleDeleteExpense, handleEditExpense,
    fetchOverview, fetchRevenue, fetchExpenses, fetchSupplierDues, fetchPnl,
    getModalStyles, getModalContentStyles,
    EXPENSE_CATEGORIES, PAYMENT_METHODS, PERIODS,
  };
}
