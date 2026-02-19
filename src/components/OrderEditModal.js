'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaSearch, FaEdit, FaCheck, FaPlus, FaMinus, FaTrash, FaUtensils, FaHome, FaShoppingBag, FaTruck } from 'react-icons/fa';
import apiClient from '../lib/api';
import { useLoading } from '../contexts/LoadingContext';
import { useCurrency } from '../contexts/CurrencyContext';

const OrderEditModal = ({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  selectedRestaurant,
  onOrderUpdated,
  onOrderCompleted
}) => {
  const { startLoading, stopLoading } = useLoading();
  const { formatCurrency } = useCurrency();
  const [order, setOrder] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderType, setOrderType] = useState('dine-in');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', email: '' });
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);


  useEffect(() => {
    if (isOpen && (orderId || orderNumber) && selectedRestaurant?.id) {
      // Call functions directly without including them in dependencies
      const loadData = async () => {
        try {
          startLoading('Loading order details...');
          setError(null);
          
          let response;
          if (orderId) {
            response = await apiClient.getOrderById(orderId);
          } else if (orderNumber) {
            response = await apiClient.getOrders(selectedRestaurant.id, {
              search: orderNumber,
              limit: 1
            });
          }
          
          if (response.orders && response.orders.length > 0) {
            const orderData = response.orders[0];
            setOrder(orderData);
            setOrderType(orderData.orderType || 'dine-in');
            setPaymentMethod(orderData.paymentMethod || 'cash');
            setNotes(orderData.notes || '');
            
            if (orderData.customerInfo) {
              setCustomerInfo({
                name: orderData.customerInfo.name || '',
                phone: orderData.customerInfo.phone || '',
                email: orderData.customerInfo.email || ''
              });
            }
            
            setSuccess('Order loaded successfully!');
            setTimeout(() => setSuccess(null), 3000);
          } else {
            setError('Order not found');
          }
        } catch (error) {
          console.error('Error fetching order:', error);
          setError('Failed to load order details');
        } finally {
          stopLoading();
        }
      };

      const loadMenu = async () => {
        try {
          const response = await apiClient.getMenu(selectedRestaurant.id);
          if (response.success && response.items) {
            setMenuItems(response.items);
            
            // Extract categories
            const categorySet = new Set(['All Items']);
            response.items.forEach(item => {
              if (item.category) categorySet.add(item.category);
            });
            setCategories(Array.from(categorySet));
          }
        } catch (error) {
          console.error('Error fetching menu items:', error);
        }
      };

      loadData();
      loadMenu();
    }
  }, [isOpen, orderId, orderNumber, selectedRestaurant?.id]);

  // Filter menu items based on category and search
  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All Items' || item.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.shortCode && item.shortCode.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Add item to order
  const addItemToOrder = (menuItem) => {
    if (!order) return;
    
    const existingItem = order.items.find(item => item.menuItemId === menuItem.id);
    
    if (existingItem) {
      // Update existing item quantity
      const updatedItems = order.items.map(item =>
        item.menuItemId === menuItem.id
          ? { ...item, quantity: item.quantity + 1, total: item.price * (item.quantity + 1) }
          : item
      );
      setOrder({ ...order, items: updatedItems });
    } else {
      // Add new item
      const newItem = {
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: parseFloat(menuItem.price),
        quantity: 1,
        total: parseFloat(menuItem.price),
        shortCode: menuItem.shortCode || null,
        notes: '',
        category: menuItem.category || null,
        isVeg: menuItem.isVeg || false
      };
      setOrder({ ...order, items: [...order.items, newItem] });
    }
  };

  // Update item quantity
  const updateItemQuantity = (menuItemId, newQuantity) => {
    if (!order || newQuantity < 0) return;
    
    if (newQuantity === 0) {
      // Remove item
      const updatedItems = order.items.filter(item => item.menuItemId !== menuItemId);
      setOrder({ ...order, items: updatedItems });
    } else {
      // Update quantity
      const updatedItems = order.items.map(item =>
        item.menuItemId === menuItemId
          ? { ...item, quantity: newQuantity, total: item.price * newQuantity }
          : item
      );
      setOrder({ ...order, items: updatedItems });
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    if (!order?.items) return { subtotal: 0, tax: 0, total: 0 };
    
    const subtotal = order.items.reduce((sum, item) => sum + (item.total || 0), 0);
    const taxRate = 0.05; // 5% GST
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };

  const totals = calculateTotals();

  // Update order
  const handleUpdateOrder = async () => {
    if (!order) return;
    
    try {
      startLoading('Updating order...');
      setError(null);
      
      const updateData = {
        items: order.items.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          notes: item.notes || ''
        })),
        orderType,
        paymentMethod,
        customerInfo,
        notes,
        updatedAt: new Date().toISOString(),
        lastUpdatedBy: {
          name: 'Staff Member',
          id: 'staff-001'
        }
      };

      const response = await apiClient.updateOrder(order.id, updateData);
      
      if (response.data) {
        setSuccess('Order updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
        onOrderUpdated?.(order);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      setError('Failed to update order');
    } finally {
      stopLoading();
    }
  };

  // Complete billing
  const handleCompleteBilling = async () => {
    if (!order) return;
    
    try {
      startLoading('Completing billing...');
      setError(null);
      
      const billingData = {
        items: order.items.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          notes: item.notes || ''
        })),
        orderType,
        paymentMethod,
        customerInfo,
        notes,
        status: 'completed',
        completedAt: new Date().toISOString(),
        totalAmount: totals.total,
        taxAmount: totals.tax,
        subtotalAmount: totals.subtotal
      };

      const response = await apiClient.updateOrder(order.id, billingData);
      
      if (response.data) {
        setSuccess('Billing completed successfully!');
        setTimeout(() => {
          setSuccess(null);
          onOrderCompleted?.(order);
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Error completing billing:', error);
      setError('Failed to complete billing');
    } finally {
      stopLoading();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Slider */}
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {order ? `Order #${order.dailyOrderId || order.orderNumber}` : 'Order Details'}
              </h2>
              <p className="text-sm text-gray-500">
                {order ? `Table ${order.tableNumber || 'N/A'} • ${order.status}` : 'Loading...'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full flex">
              {/* Left Panel - Menu Items */}
              <div className="w-1/2 border-r border-gray-200 flex flex-col">
                {/* Search and Categories */}
                <div className="p-4 border-b border-gray-200">
                  <div className="relative mb-3">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search menu items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedCategory === category
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Menu Items */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="grid grid-cols-1 gap-3">
                    {filteredMenuItems.map(item => (
                      <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`w-3 h-3 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                              <h3 className="font-medium text-gray-900">{item.name}</h3>
                              {item.shortCode && (
                                <span className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                                  {item.shortCode}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                            <p className="text-sm font-semibold text-red-600 mt-1">{formatCurrency(item.price)}</p>
                          </div>
                          <button
                            onClick={() => addItemToOrder(item)}
                            className="ml-3 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Panel - Order Details */}
              <div className="w-1/2 flex flex-col">
                {/* Order Items */}
                <div className="flex-1 overflow-y-auto p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Order Items ({order?.items?.length || 0})</h3>
                  
                  {order?.items?.length > 0 ? (
                    <div className="space-y-3">
                      {order.items.map(item => (
                        <div key={item.menuItemId} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                                <h4 className="font-medium text-gray-900">{item.name}</h4>
                                {item.shortCode && (
                                  <span className="px-2 py-1 bg-gray-200 text-xs text-gray-600 rounded">
                                    {item.shortCode}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{formatCurrency(item.price)} × {item.quantity} = {formatCurrency(item.total)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateItemQuantity(item.menuItemId, item.quantity - 1)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <FaMinus size={12} />
                              </button>
                              <span className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-medium min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateItemQuantity(item.menuItemId, item.quantity + 1)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <FaPlus size={12} />
                              </button>
                              <button
                                onClick={() => updateItemQuantity(item.menuItemId, 0)}
                                className="p-1 text-red-400 hover:text-red-600 ml-2"
                              >
                                <FaTrash size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <FaUtensils size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>No items in order</p>
                    </div>
                  )}
                </div>

                {/* Order Settings */}
                <div className="border-t border-gray-200 p-4">
                  <div className="space-y-4">
                    {/* Order Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
                      <div className="flex gap-2">
                        {[
                          { value: 'dine-in', label: 'Dine In', icon: FaHome },
                          { value: 'takeaway', label: 'Takeaway', icon: FaShoppingBag },
                          { value: 'delivery', label: 'Delivery', icon: FaTruck }
                        ].map(type => (
                          <button
                            key={type.value}
                            onClick={() => setOrderType(type.value)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              orderType === type.value
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <type.icon size={14} />
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                      <div className="flex gap-2">
                        {['cash', 'card', 'upi', 'online'].map(method => (
                          <button
                            key={method}
                            onClick={() => setPaymentMethod(method)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                              paymentMethod === method
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                        <input
                          type="text"
                          value={customerInfo.name}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="text"
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Special instructions..."
                      />
                    </div>
                  </div>
                </div>

                {/* Totals and Actions */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="space-y-3">
                    {/* Totals */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(totals.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>GST (5%):</span>
                        <span>{formatCurrency(totals.tax)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg border-t border-gray-300 pt-2">
                        <span>Total:</span>
                        <span>{formatCurrency(totals.total)}</span>
                      </div>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                      <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                        {error}
                      </div>
                    )}
                    {success && (
                      <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
                        {success}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleUpdateOrder}
                        disabled={!order?.items?.length}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        <FaEdit size={16} />
                        Update Order
                      </button>
                      <button
                        onClick={handleCompleteBilling}
                        disabled={!order?.items?.length}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        <FaCheck size={16} />
                        Complete Billing
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderEditModal;
