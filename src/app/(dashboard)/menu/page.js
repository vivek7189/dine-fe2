'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useLoading } from '../../../contexts/LoadingContext';
import ImageCarousel from '../../../components/ImageCarousel';
import ImageUpload from '../../../components/ImageUpload';
const BulkMenuUpload = dynamic(() => import('../../../components/BulkMenuUpload'), { ssr: false });
const QRCodeModal = dynamic(() => import('../../../components/QRCodeModal'), { ssr: false });
import apiClient from '../../../lib/api';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { t } from '../../../lib/i18n';
import { getDisplayImage } from '../../../utils/placeholderImages';
import { getCachedMenuData, setCachedMenuData, updateMenuItemInAllCaches } from '../../../utils/dashboardCache';
import { getCachedData, setCachedData } from '../../../lib/offlineDb';
import { queueOfflineOrder, generateIdempotencyKey } from '../../../lib/syncEngine';
import { getOfflineEngineEnabled } from '../../../hooks/useSyncEngine';
import { canPerform } from '../../../lib/permissions';
import OfflineBanner from '../../../components/OfflineBanner';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';
import { 
  FaPlus,
  FaEdit,
  FaTrash,
  FaEllipsisH,
  FaHeart,
  FaSearch, 
  FaSave, 
  FaImage,
  FaUtensils,
  FaFire,
  FaLeaf,
  FaDrumstickBite,
  FaTags,
  FaFilter,
  FaSpinner,
  FaExclamationTriangle,
  FaStar,
  FaClock,
  FaTh,
  FaList,
  FaEye,
  FaChevronDown,
  FaChevronUp,
  FaMinus,
  FaCheck,
  FaBars,
  FaSortAmountDown,
  FaCloudUploadAlt,
  FaTimes,
  FaQrcode,
  FaCamera,
  FaCheckCircle,
  FaFlask,
  FaBarcode,
  FaEyeSlash
} from 'react-icons/fa';
const RecipeFormBody = dynamic(() => import('../inventory/components/InventoryModals').then(m => ({ default: m.RecipeFormBody })), { ssr: false });

// Enhanced Category Dropdown Component with Management
const CategoryDropdown = ({ 
  label, 
  value, 
  onChange, 
  categories = [], 
  placeholder = "Select category",
  restaurantId,
  onCategoryAdded = null,
  onCategoryUpdated = null,
  onCategoryDeleted = null,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', emoji: '🍽️', description: '' });
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const selectedCategory = categories.find(cat => cat.id === value) || null;
  
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
    setIsOpen(false);
    setSearchTerm('');
        setShowAddForm(false);
        setShowEditForm(false);
        setEditingCategory(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (category) => {
    onChange(category.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleAddNew = async () => {
    if (!navigator.onLine && !(typeof window !== 'undefined' && window.electronAPI?.apiRequest)) { alert('You are offline. Go online to make changes.'); return; }
    if (!newCategory.name.trim()) return;

    try {
      setLoading(true);
      const response = await apiClient.createCategory(restaurantId, newCategory);
      if (onCategoryAdded) {
        onCategoryAdded(response.category);
      }
      setNewCategory({ name: '', emoji: '🍽️', description: '' });
      setShowAddForm(false);
      setSearchTerm('');
    } catch (error) {
      console.error('Error creating category:', error);
      alert(t('menu.failedCreateCategory', { error: error.message || 'Unknown error' }));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setNewCategory({ 
      name: category.name, 
      emoji: category.emoji, 
      description: category.description || '' 
    });
    setShowEditForm(true);
  };

  const handleUpdate = async () => {
    if (!navigator.onLine && !(typeof window !== 'undefined' && window.electronAPI?.apiRequest)) { alert('You are offline. Go online to make changes.'); return; }
    if (!editingCategory || !newCategory.name.trim()) return;

    try {
      setLoading(true);
      const response = await apiClient.updateCategory(restaurantId, editingCategory.id, newCategory);
      if (onCategoryUpdated) {
        onCategoryUpdated(response.category);
      }
      setNewCategory({ name: '', emoji: '🍽️', description: '' });
      setShowEditForm(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Error updating category:', error);
      alert(t('menu.failedUpdateCategory', { error: error.message || 'Unknown error' }));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (category) => {
    if (!navigator.onLine && !(typeof window !== 'undefined' && window.electronAPI?.apiRequest)) { alert('You are offline. Go online to make changes.'); return; }
    if (!confirm(t('menu.deleteCategoryConfirm', { name: category.name }))) return;

    try {
      setLoading(true);
      await apiClient.deleteCategory(restaurantId, category.id);
      if (onCategoryDeleted) {
        onCategoryDeleted(category.id);
      }
      // If the deleted category was selected, clear selection
      if (value === category.id) {
        onChange('');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(t('menu.failedDeleteCategory', { error: error.message || 'Unknown error' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 flex items-center justify-between transition-all duration-200 hover:border-gray-400"
      >
                 <span className={selectedCategory ? 'text-gray-900' : 'text-gray-500'}>
                   {selectedCategory ? selectedCategory.name : placeholder}
        </span>
        <FaChevronDown className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} size={12} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Add New Category Form */}
          {showAddForm && (
            <div className="p-3 border-b border-gray-200 bg-blue-50">
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    placeholder={t('menu.categoryName')}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory.emoji}
                    onChange={(e) => setNewCategory({...newCategory, emoji: e.target.value})}
                    placeholder="🍽️"
                    className="w-16 px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength="2"
                  />
                  <input
                    type="text"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                    placeholder={t('menu.descriptionOptional')}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                  <div className="flex gap-2">
                <button
                      onClick={handleAddNew}
                             disabled={loading || !newCategory.name.trim()}
                             className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                             {loading ? t('menu.adding') : t('menu.add')}
                </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                      setNewCategory({ name: '', emoji: '🍽️', description: '' });
                      }}
                      className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      {t('menu.cancel')}
                    </button>
                </div>
                  </div>
                </div>
              )}

          {/* Edit Category Form */}
          {showEditForm && editingCategory && (
            <div className="p-3 border-b border-gray-200 bg-green-50">
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    placeholder={t('menu.categoryName')}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory.emoji}
                    onChange={(e) => setNewCategory({...newCategory, emoji: e.target.value})}
                    placeholder="🍽️"
                    className="w-16 px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    maxLength="2"
                  />
                  <input
                    type="text"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                    placeholder={t('menu.descriptionOptional')}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                  <div className="flex gap-2">
                    <button
                             onClick={handleUpdate}
                             disabled={loading || !newCategory.name.trim()}
                             className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                             {loading ? t('menu.updating') : t('menu.update')}
                    </button>
                    <button
                      onClick={() => {
                      setShowEditForm(false);
                      setEditingCategory(null);
                      setNewCategory({ name: '', emoji: '🍽️', description: '' });
                      }}
                      className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      {t('menu.cancel')}
                    </button>
                </div>
                  </div>
                </div>
              )}
          
          {/* Add New Button */}
          {!showAddForm && !showEditForm && (
            <div className="p-3 border-b border-gray-200">
                       <button
                         onClick={() => setShowAddForm(true)}
                         className="w-full text-left text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-2"
                       >
                         {t('menu.addNewCategory')}
                       </button>
            </div>
          )}
          
          {/* Categories List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 group">
            <button
              type="button"
                           onClick={() => handleSelect(category)}
                           className="flex-1 text-left text-sm text-gray-900 hover:text-gray-700 flex items-center gap-2"
                         >
                           <span>{category.name}</span>
                           {selectedCategory?.id === category.id && (
                             <FaCheck className="text-red-500 ml-auto" size={12} />
                )}
            </button>
                
                {/* Category Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(category);
                    }}
                    className="p-1 text-blue-600 hover:text-blue-800"
                    title={t('menu.edit')}
                  >
                    <FaEdit size={10} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(category);
                    }}
                    className="p-1 text-red-600 hover:text-red-800"
                    title={t('menu.delete')}
                  >
                    <FaTrash size={10} />
                  </button>
                </div>
              </div>
            ))}
            {filteredCategories.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                {t('menu.noCategoriesFound')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Custom Dropdown Component
const CustomDropdown = ({ value, onChange, options, placeholder, style = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedOption = options.find(opt => opt.value === value) || null;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const isActive = value && value !== 'all';

  return (
    <div ref={dropdownRef} style={{ position: 'relative', ...style }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '7px 14px',
          border: isActive ? '1.5px solid #ef4444' : '1.5px solid transparent',
          borderRadius: '20px',
          fontSize: '13px',
          backgroundColor: isActive ? '#fef2f2' : '#f3f4f6',
          color: isActive ? '#dc2626' : '#6b7280',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontWeight: isActive ? '600' : '500',
          whiteSpace: 'nowrap'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isActive ? '#fee2e2' : '#e5e7eb'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isActive ? '#fef2f2' : '#f3f4f6'; }}
      >
        {selectedOption ? selectedOption.label : placeholder}
        <FaChevronDown
          size={9}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: isActive ? '#ef4444' : '#9ca3af',
            flexShrink: 0
          }}
        />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.04)',
          zIndex: 10002,
          marginTop: '8px',
          minWidth: '220px',
          padding: '6px',
          maxHeight: '320px',
          overflowY: 'auto',
          animation: 'fadeInUp 0.15s ease-out'
        }}>
          {options.map((option, idx) => {
            const isSelected = value === option.value;
            return (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: 'none',
                  backgroundColor: isSelected ? '#fef2f2' : 'transparent',
                  color: isSelected ? '#dc2626' : '#374151',
                  fontSize: '13px',
                  fontWeight: isSelected ? '600' : '450',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span>{option.label}</span>
                {isSelected && <FaCheck size={10} style={{ color: '#ef4444', flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Ultra Compact Menu Item Card Component
const MenuItemCardBase = ({ item, categoryMap, onEdit, onDelete, onToggleAvailability, onToggleFavorite, onToggleHideImage, onGenerateRecipe, generatingRecipeFor, hasRecipe, getCategoryEmoji, onItemClick, multiPricingEnabled, activePricingRules, formatCurrency: formatCurrencyProp, taxInclusiveGlobal, compact, scaleBarcodeFlag, scalePluDigits, globalHideImages = false }) => {
  const { formatCurrency: formatCurrencyHook } = useCurrency();
  const formatCurrency = formatCurrencyProp || formatCurrencyHook;
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef(null);

  // Close overflow menu on outside click
  useEffect(() => {
    if (!showMoreMenu) return;
    const handler = (e) => { if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) setShowMoreMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMoreMenu]);

  // Stock & expiry computed values
  const isStockManaged = item.isStockManaged && typeof item.stockQuantity === 'number';
  const isLowStock = isStockManaged && item.stockQuantity > 0 && item.stockQuantity <= (item.lowStockThreshold || 5);
  const isOutOfStock = item.isAvailable === false || (isStockManaged && item.stockQuantity === 0);

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null;
    const days = Math.ceil((new Date(expiryDate) - new Date()) / 86400000);
    if (days < 0) return 'expired';
    if (days <= 2) return 'expiring-soon';
    if (days <= 7) return 'expiring-week';
    return null;
  };
  const expiryStatus = getExpiryStatus(item.expiryDate);

  // ── Compact mobile card ──
  if (compact) {
    const placeholderUrl = getDisplayImage(item);
    return (
      <div
        onClick={() => onItemClick(item)}
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          opacity: isOutOfStock ? 0.55 : 1,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Image */}
        {!(globalHideImages || item.hideImage) && (
        <div style={{ height: '90px', position: 'relative', overflow: 'hidden', background: '#f3f4f6' }}>
          {(item.images && item.images.length > 0) ? (
            <ImageCarousel images={item.images} itemName={item.name} maxHeight="90px" showControls={false} showDots={false} autoPlay={false} className="w-full h-full" />
          ) : placeholderUrl ? (
            <img src={placeholderUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '28px' }}>{getCategoryEmoji(item.category)}</span>
            </div>
          )}
          {/* Veg/Non-Veg */}
          <div style={{
            position: 'absolute', top: '6px', left: '6px',
            width: '20px', height: '20px', borderRadius: '50%',
            border: `2px solid ${item.isVeg ? '#22c55e' : '#ef4444'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#fff', zIndex: 2
          }}>
            <div style={{ width: '7px', height: '7px', backgroundColor: item.isVeg ? '#22c55e' : '#ef4444', borderRadius: item.isVeg ? '1px' : '50%' }} />
          </div>
          {/* Out of stock */}
          {!item.isAvailable && (
            <div style={{
              position: 'absolute', top: '6px', right: '6px',
              background: 'rgba(220,38,38,0.9)', color: '#fff',
              padding: '2px 6px', borderRadius: '8px', fontSize: '9px', fontWeight: '700', zIndex: 2
            }}>
              {t('menu.outOfStock')}
            </div>
          )}
          {/* Favorite star */}
          {item.isFavorite && (
            <div style={{
              position: 'absolute', bottom: '6px', right: '6px',
              width: '20px', height: '20px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2
            }}>
              <FaStar size={9} color="#fff" />
            </div>
          )}
        </div>
        )}
        {/* Content */}
        <div style={{ padding: '8px 10px 10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{
              fontSize: '13px', fontWeight: '600', color: '#1f2937', margin: 0,
              lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden'
            }}>
              {item.name}
            </h3>
            <span style={{
              display: 'inline-block', marginTop: '4px',
              fontSize: '10px', fontWeight: '500', color: '#9ca3af',
              maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>
              {categoryMap.get(item.category)?.name || ''}
            </span>
          </div>
          {/* Price + actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#111' }}>
              {formatCurrency(item.price)}
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {onToggleAvailability && (
                <button type="button" onClick={(e) => { e.stopPropagation(); onToggleAvailability(item.id, item.isAvailable); }}
                  style={{
                    padding: '5px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: item.isAvailable ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: '#fff',
                  }}>
                  {item.isAvailable ? <FaMinus size={10} /> : <FaCheck size={10} />}
                </button>
              )}
              {onEdit && (
                <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                  style={{
                    padding: '5px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff',
                  }}>
                  <FaEdit size={10} />
                </button>
              )}
              {onToggleHideImage && (
                <button type="button" onClick={(e) => { e.stopPropagation(); onToggleHideImage(item); }}
                  title={item.hideImage ? 'Show image' : 'Hide image'}
                  style={{
                    padding: '5px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: item.hideImage ? 'linear-gradient(135deg, #6b7280, #4b5563)' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff',
                  }}>
                  {item.hideImage ? <FaEyeSlash size={10} /> : <FaImage size={10} />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        opacity: isOutOfStock ? 0.5 : 1,
        position: 'relative',
        minHeight: '200px',
        cursor: 'pointer',
        background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
        display: 'flex',
        flexDirection: 'column'
      }}
      onClick={() => onItemClick(item)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
      }}>
      
      {/* Image Section */}
      {!(globalHideImages || item.hideImage) && (
      <div style={{
        height: '120px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'
      }}>
        {(item.images && item.images.length > 0) ? (
          <ImageCarousel
            images={item.images}
            itemName={item.name}
            maxHeight="120px"
            showControls={false}
            showDots={false}
            autoPlay={true}
            autoPlayInterval={4000}
            className="w-full h-full"
          />
        ) : (() => {
          const placeholderUrl = getDisplayImage(item);
          return placeholderUrl ? (
            <img
              src={placeholderUrl}
              alt={item.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Category Icon */}
              <div style={{
                fontSize: '32px',
                color: 'rgba(75, 85, 99, 0.6)',
                zIndex: 2,
                position: 'relative'
              }}>
                {getCategoryEmoji(item.category)}
              </div>
            </div>
          );
        })()}

        {/* Overlay Gradient */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40px',
          background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.1))',
          pointerEvents: 'none'
        }} />

        {/* Veg/Non-Veg Badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          border: `3px solid ${item.isVeg ? '#22c55e' : '#ef4444'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
          zIndex: 3
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            backgroundColor: item.isVeg ? '#22c55e' : '#ef4444',
            borderRadius: item.isVeg ? '2px' : '50%'
          }} />
        </div>

        {/* Availability Badge */}
        {!item.isAvailable && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(220, 38, 38, 0.95)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '16px',
            fontSize: '11px',
            fontWeight: '700',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
            zIndex: 3
          }}>
            {t('menu.outOfStock')}
          </div>
        )}

        {/* Short Code Badge */}
        <div style={{
          position: 'absolute',
          bottom: item.soldByWeight && item.pluCode ? '36px' : '12px',
          right: '12px',
          background: 'rgba(239, 68, 68, 0.95)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '16px',
          fontSize: '11px',
          fontWeight: '700',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
          zIndex: 3
        }}>
          {item.shortCode}
        </div>

        {/* Scale Barcode Badge (for sold-by-weight items) */}
        {item.soldByWeight && item.pluCode && (
          <div style={{
            position: 'absolute',
            bottom: '8px',
            right: '12px',
            background: 'rgba(30, 64, 175, 0.95)',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '10px',
            fontWeight: '700',
            fontFamily: 'monospace',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 8px rgba(30, 64, 175, 0.3)',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            letterSpacing: '0.5px'
          }}>
            <FaBarcode size={10} />
            {(() => { const pd = parseInt(scalePluDigits) === 5 ? 5 : 4; const dd = 10 - pd; return (scaleBarcodeFlag || '20') + item.pluCode.padStart(pd, '0') + 'X'.repeat(dd) + 'C'; })()}
          </div>
        )}
      </div>
      )}
      
      {/* Content Section */}
      <div style={{
        padding: '16px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        {/* Item Info */}
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0,
            marginBottom: '8px',
            lineHeight: '1.3',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {item.name}
          </h3>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '10px'
          }}>
            <span style={{
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              padding: '4px 8px',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              {categoryMap.get(item.category)?.name || t('menu.mainCourse')}
            </span>
            {(item.taxInclusive === true || (taxInclusiveGlobal && item.taxInclusive !== false)) && (
              <span style={{
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                padding: '4px 8px',
                borderRadius: '10px',
                fontSize: '10px',
                fontWeight: '600'
              }}>
                GST incl.
              </span>
            )}
        </div>
        
          {item.description && (
            <p style={{
              fontSize: '13px',
              color: '#6b7280',
              margin: 0,
              lineHeight: '1.5',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {item.description}
            </p>
          )}
        </div>
        
        {/* Type-specific info badges */}
        {(item.spiritCategory || item.abv || item.unit || item.weight || item.servingSize || item.bottleSize) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
            {item.spiritCategory && (
              <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#fdf2f8', color: '#9d174d' }}>
                {item.spiritCategory}
              </span>
            )}
            {item.abv && (
              <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#92400e' }}>
                {item.abv}% ABV
              </span>
            )}
            {item.bottleSize && (
              <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#fce7f3', color: '#831843' }}>
                {item.bottleSize}
              </span>
            )}
            {item.weight && (
              <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#fef9ee', color: '#92400e' }}>
                {item.weight}
              </span>
            )}
            {item.unit && (
              <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#fef9ee', color: '#92400e' }}>
                {t('menu.per')} {item.unit}
              </span>
            )}
            {item.servingSize && (
              <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#eff6ff', color: '#1e40af' }}>
                {item.servingSize}
              </span>
            )}
          </div>
        )}

        {/* Stock & Expiry Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
          {isStockManaged && (
            <span style={{
              fontSize: '10px', fontWeight: '600',
              padding: '2px 6px', borderRadius: '4px',
              backgroundColor: item.stockQuantity === 0 ? '#fee2e2' : isLowStock ? '#fef3c7' : '#dcfce7',
              color: item.stockQuantity === 0 ? '#dc2626' : isLowStock ? '#92400e' : '#166534',
              border: `1px solid ${item.stockQuantity === 0 ? '#fca5a5' : isLowStock ? '#fde68a' : '#86efac'}`
            }}>
              {item.stockQuantity === 0 ? t('menu.outOfStockBadge') : isLowStock ? t('menu.lowStockBadge', { quantity: item.stockQuantity }) : t('menu.stockBadge', { quantity: item.stockQuantity, unit: item.stockUnit || 'pcs' })}
            </span>
          )}
          {expiryStatus && (
            <span style={{
              fontSize: '10px', fontWeight: '600',
              padding: '2px 6px', borderRadius: '4px',
              backgroundColor: expiryStatus === 'expired' ? '#fee2e2' : expiryStatus === 'expiring-soon' ? '#fef3c7' : '#fff7ed',
              color: expiryStatus === 'expired' ? '#dc2626' : expiryStatus === 'expiring-soon' ? '#92400e' : '#c2410c',
              border: `1px solid ${expiryStatus === 'expired' ? '#fca5a5' : expiryStatus === 'expiring-soon' ? '#fde68a' : '#fed7aa'}`
            }}>
              {expiryStatus === 'expired' ? t('menu.expiredBadge') : expiryStatus === 'expiring-soon' ? t('menu.expSoonBadge') : t('menu.exp7dBadge')}
            </span>
          )}
        </div>

        {/* Channel Pricing */}
        {multiPricingEnabled && activePricingRules?.length > 0 && item.pricingRules && Object.keys(item.pricingRules).length > 0 && (() => {
          const DINEIN_NAMES = ['dine-in', 'dine in', 'dinein'];
          const TAKEAWAY_NAMES = ['takeaway', 'take away', 'take-away'];
          const DELIVERY_NAMES = ['delivery'];
          const channelChips = activePricingRules
            .filter(rule => {
              const n = (rule.name || '').toLowerCase().trim();
              return DINEIN_NAMES.includes(n) || TAKEAWAY_NAMES.includes(n) || DELIVERY_NAMES.includes(n);
            })
            .filter(rule => typeof item.pricingRules[rule.id] === 'number')
            .map(rule => {
              const n = (rule.name || '').toLowerCase().trim();
              const icon = DINEIN_NAMES.includes(n) ? '🍽️' : TAKEAWAY_NAMES.includes(n) ? '🥡' : '🛵';
              return { icon, price: item.pricingRules[rule.id], id: rule.id };
            });
          if (channelChips.length === 0) return null;
          return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
              {channelChips.map(chip => (
                <span key={chip.id} style={{ fontSize: '10px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#f0fdf4', color: '#166534' }}>
                  {chip.icon} {formatCurrency(chip.price)}
                </span>
              ))}
            </div>
          );
        })()}

        {/* Price and Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #f3f4f6'
        }}>
          <div style={{
            color: '#000000',
            fontSize: '14px',
            fontWeight: '700',
            padding: '4px 0'
          }}>
            {formatCurrency(item.price)}
          </div>

          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          {/* Primary: Edit */}
          {onEdit && <button
              type="button"
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); onEdit(item); }}
              style={{
                padding: '5px 8px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white',
                border: 'none', borderRadius: '7px', cursor: 'pointer', transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 500,
                boxShadow: '0 1px 3px rgba(59, 130, 246, 0.2)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 3px 8px rgba(59, 130, 246, 0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(59, 130, 246, 0.2)'; }}
              title={t('menu.edit')}
            >
              <FaEdit size={10} /> Edit
          </button>}

          {/* Primary: Availability */}
          {onToggleAvailability && <button
              type="button"
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); onToggleAvailability(item.id, item.isAvailable); }}
              style={{
                padding: '5px 8px',
                background: item.isAvailable ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 500,
                boxShadow: item.isAvailable ? '0 1px 3px rgba(249, 115, 22, 0.2)' : '0 1px 3px rgba(34, 197, 94, 0.2)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              title={item.isAvailable ? t('menu.markOutOfStock') : t('menu.markAvailable')}
            >
              {item.isAvailable ? <><FaMinus size={10} /> Hide</> : <><FaCheck size={10} /> Show</>}
          </button>}

          {/* Primary: Hide/Show Image */}
          {onToggleHideImage && <button
              type="button"
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); onToggleHideImage(item); }}
              style={{
                padding: '5px 8px',
                background: item.hideImage ? 'linear-gradient(135deg, #6b7280, #4b5563)' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 500,
                boxShadow: '0 1px 3px rgba(139, 92, 246, 0.2)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              title={item.hideImage ? 'Show image' : 'Hide image'}
            >
              {item.hideImage ? <><FaEyeSlash size={10} /> Show Img</> : <><FaImage size={10} /> Hide Img</>}
          </button>}

          {/* More menu */}
          {(onToggleFavorite || onGenerateRecipe || onDelete) && (
            <div ref={moreMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); setShowMoreMenu(!showMoreMenu); }}
                style={{
                  padding: '5px 6px', background: '#f3f4f6', color: '#6b7280',
                  border: '1px solid #e5e7eb', borderRadius: '7px', cursor: 'pointer', transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e5e7eb'; e.currentTarget.style.color = '#374151'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#6b7280'; }}
                title="More actions"
              >
                <FaEllipsisH size={12} />
              </button>
              {showMoreMenu && (
                <div style={{
                  position: 'absolute', bottom: '100%', right: 0, marginBottom: '4px',
                  background: 'white', borderRadius: '10px', border: '1px solid #e5e7eb',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: '4px', minWidth: '170px',
                  zIndex: 100, animation: 'fadeIn 0.1s ease-out',
                }}>
                  {/* View Details */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShowMoreMenu(false); onItemClick(item); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                      padding: '8px 10px', border: 'none', background: 'none', borderRadius: '6px',
                      cursor: 'pointer', fontSize: '12px', color: '#374151', textAlign: 'left',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                  >
                    <FaEye size={11} style={{ color: '#6b7280', flexShrink: 0 }} /> {t('menu.viewDetails')}
                  </button>
                  {/* Favorite */}
                  {onToggleFavorite && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setShowMoreMenu(false); onToggleFavorite(item); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                        padding: '8px 10px', border: 'none', background: 'none', borderRadius: '6px',
                        cursor: 'pointer', fontSize: '12px', color: '#374151', textAlign: 'left',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                    >
                      <FaStar size={11} style={{ color: item.isFavorite ? '#f59e0b' : '#6b7280', flexShrink: 0 }} />
                      {item.isFavorite ? t('menu.removeFromFavorites') : t('menu.addToFavorites')}
                    </button>
                  )}
                  {/* Recipe */}
                  {onGenerateRecipe && (
                    <button
                      type="button"
                      disabled={generatingRecipeFor === item.id}
                      onClick={(e) => { e.stopPropagation(); setShowMoreMenu(false); if (!hasRecipe) onGenerateRecipe(item); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                        padding: '8px 10px', border: 'none', background: 'none', borderRadius: '6px',
                        cursor: generatingRecipeFor === item.id ? 'wait' : 'pointer', fontSize: '12px',
                        color: hasRecipe ? '#059669' : '#374151', textAlign: 'left',
                        opacity: generatingRecipeFor === item.id ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                    >
                      {generatingRecipeFor === item.id
                        ? <FaSpinner size={11} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                        : hasRecipe ? <FaCheckCircle size={11} style={{ flexShrink: 0 }} /> : <FaFlask size={11} style={{ color: '#6b7280', flexShrink: 0 }} />}
                      {generatingRecipeFor === item.id ? t('menu.generating') : hasRecipe ? t('menu.recipeLinkedAction') : t('menu.generateRecipe')}
                    </button>
                  )}
                  {/* Delete */}
                  {onDelete && (
                    <>
                      <div style={{ height: '1px', background: '#f3f4f6', margin: '2px 0' }} />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setShowMoreMenu(false); onDelete(item.id); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                          padding: '8px 10px', border: 'none', background: 'none', borderRadius: '6px',
                          cursor: 'pointer', fontSize: '12px', color: '#dc2626', textAlign: 'left',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                      >
                        <FaTrash size={11} style={{ flexShrink: 0 }} /> {t('menu.delete')}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};
const MenuItemCard = React.memo(MenuItemCardBase);

// Helper function to get category-specific colors
const getCategoryColor = (category, opacity = 1) => {
  const colors = {
    'Pizza': `rgba(254, 226, 226, ${opacity})`,      // Light Red
    'Burgers': `rgba(255, 237, 213, ${opacity})`,   // Light Orange
    'Salads': `rgba(220, 252, 231, ${opacity})`,     // Light Green
    'Pasta': `rgba(243, 232, 255, ${opacity})`,     // Light Purple
    'Desserts': `rgba(252, 231, 243, ${opacity})`,  // Light Pink
    'appetizer': `rgba(219, 234, 254, ${opacity})`, // Light Blue
    'Tea': `rgba(254, 249, 195, ${opacity})`,       // Light Yellow
    'Samosa': `rgba(204, 251, 241, ${opacity})`,    // Light Teal
    'Main Course': `rgba(243, 244, 246, ${opacity})`, // Light Gray
    'default': `rgba(238, 242, 255, ${opacity})`    // Light Indigo
  };
  return colors[category] || colors['default'];
};

// List View Item Component
const ListViewItem = ({ item, categories, onEdit, onDelete, onToggleAvailability, onToggleFavorite, onToggleHideImage, getCategoryEmoji }) => {
  const { formatCurrency } = useCurrency();

  // Stock & expiry computed values
  const isStockManaged = item.isStockManaged && typeof item.stockQuantity === 'number';
  const isLowStock = isStockManaged && item.stockQuantity > 0 && item.stockQuantity <= (item.lowStockThreshold || 5);
  const isOutOfStock = item.isAvailable === false || (isStockManaged && item.stockQuantity === 0);

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null;
    const days = Math.ceil((new Date(expiryDate) - new Date()) / 86400000);
    if (days < 0) return 'expired';
    if (days <= 2) return 'expiring-soon';
    if (days <= 7) return 'expiring-week';
    return null;
  };
  const expiryStatus = getExpiryStatus(item.expiryDate);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      padding: '12px',
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: item.isAvailable ? '#ffffff' : '#f9fafb',
      opacity: isOutOfStock ? 0.5 : 1,
      transition: 'all 0.2s ease'
    }}>
      {/* Top Row - Icon, Name, Price */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '8px'
      }}>
      {/* Icon */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          backgroundColor: item.isVeg ? '#dcfce7' : '#fef2f2'
        }}>
        {getCategoryEmoji(item.category)}
      </div>
      
      {/* Veg indicator */}
        <div style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          border: `2px solid ${item.isVeg ? '#22c55e' : '#ef4444'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            backgroundColor: item.isVeg ? '#22c55e' : '#ef4444',
            borderRadius: item.isVeg ? '2px' : '50%'
          }}></div>
      </div>
      
      {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '2px',
            flexWrap: 'wrap'
          }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0,
              textDecoration: item.isAvailable ? 'none' : 'line-through'
            }}>
            {item.name}
          </h4>
            <span style={{
              backgroundColor: '#374151',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>
            {item.shortCode}
          </span>
          {!item.isAvailable && (
              <span style={{
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 'bold'
              }}>
              {t('menu.out')}
            </span>
          )}
        </div>
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            margin: 0,
            lineHeight: '1.4'
          }}>
          {item.description || t('menu.defaultDescription')}
        </p>
      </div>
      
      {/* Price */}
        <div style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#ef4444',
          minWidth: 'fit-content'
        }}>
        {formatCurrency(item.price)}
        </div>
      </div>

      {/* Stock & Expiry Badges */}
      {(isStockManaged || expiryStatus) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px', paddingLeft: '68px' }}>
          {isStockManaged && (
            <span style={{
              fontSize: '9px', fontWeight: '600',
              padding: '1px 5px', borderRadius: '4px',
              backgroundColor: item.stockQuantity === 0 ? '#fee2e2' : isLowStock ? '#fef3c7' : '#dcfce7',
              color: item.stockQuantity === 0 ? '#dc2626' : isLowStock ? '#92400e' : '#166534',
              border: `1px solid ${item.stockQuantity === 0 ? '#fca5a5' : isLowStock ? '#fde68a' : '#86efac'}`
            }}>
              {item.stockQuantity === 0 ? t('menu.outOfStockBadge') : isLowStock ? t('menu.lowStockBadge', { quantity: item.stockQuantity }) : t('menu.stockBadge', { quantity: item.stockQuantity, unit: item.stockUnit || 'pcs' })}
            </span>
          )}
          {expiryStatus && (
            <span style={{
              fontSize: '9px', fontWeight: '600',
              padding: '1px 5px', borderRadius: '4px',
              backgroundColor: expiryStatus === 'expired' ? '#fee2e2' : expiryStatus === 'expiring-soon' ? '#fef3c7' : '#fff7ed',
              color: expiryStatus === 'expired' ? '#dc2626' : expiryStatus === 'expiring-soon' ? '#92400e' : '#c2410c',
              border: `1px solid ${expiryStatus === 'expired' ? '#fca5a5' : expiryStatus === 'expiring-soon' ? '#fde68a' : '#fed7aa'}`
            }}>
              {expiryStatus === 'expired' ? t('menu.expiredBadge') : expiryStatus === 'expiring-soon' ? t('menu.expSoonBadge') : t('menu.exp7dBadge')}
            </span>
          )}
        </div>
      )}

      {/* Bottom Row - Actions */}
      <div style={{
        display: 'flex',
        gap: '6px',
        justifyContent: 'flex-end'
      }}>
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onToggleFavorite(item);
            }}
            style={{
              padding: '6px',
              backgroundColor: item.isFavorite ? '#ef4444' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={item.isFavorite ? t('menu.removeFromFavorites') : t('menu.addToFavorites')}
          >
            <FaHeart size={12} fill={item.isFavorite ? 'white' : 'none'} />
          </button>
        )}
        {onEdit && <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onEdit(item);
          }}
          style={{
            padding: '6px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={t('menu.edit')}
        >
          <FaEdit size={10} />
        </button>}
        {onToggleAvailability && <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onToggleAvailability(item.id, item.isAvailable);
          }}
          style={{
            padding: '6px',
            backgroundColor: item.isAvailable ? '#f97316' : '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={item.isAvailable ? t('menu.markOutOfStock') : t('menu.markAvailable')}
        >
          {item.isAvailable ? <FaMinus size={10} /> : <FaCheck size={10} />}
        </button>}
        {onToggleHideImage && <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onToggleHideImage(item);
          }}
          style={{
            padding: '6px',
            backgroundColor: item.hideImage ? '#6b7280' : '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={item.hideImage ? 'Show image' : 'Hide image'}
        >
          {item.hideImage ? <FaEyeSlash size={10} /> : <FaImage size={10} />}
        </button>}
        {onDelete && <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDelete(item.id);
          }}
          style={{
            padding: '6px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={t('menu.delete')}
        >
          <FaTrash size={10} />
        </button>}
      </div>
    </div>
  );
};

// Item Detail Modal Component
const ItemDetailModal = ({ item, categoryMap, isOpen, onClose, onEdit, onDelete, onToggleAvailability, getCategoryEmoji, multiPricingEnabled, activePricingRules, formatCurrency: formatCurrencyProp, recipe, globalHideImages = false }) => {
  const { formatCurrency: formatCurrencyHook } = useCurrency();
  const formatCurrency = formatCurrencyProp || formatCurrencyHook;
  if (!isOpen || !item) return null;
  if (typeof document === 'undefined') return null;
  const category = categoryMap.get(item.category);

  return createPortal(
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10002,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '20px',
          overflowY: 'auto',
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={onClose}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            maxWidth: '520px',
            width: '100%',
            marginTop: '20px',
            marginBottom: '20px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
            position: 'relative',
            animation: 'slideInUp 0.3s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            padding: '24px 24px 16px 24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '24px' }}>
                {getCategoryEmoji(item.category)}
              </div>
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: 0,
                  marginBottom: '4px'
                }}>
                  {item.name}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: `2px solid ${item.isVeg ? '#22c55e' : '#ef4444'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#ffffff'
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: item.isVeg ? '#22c55e' : '#ef4444',
                      borderRadius: item.isVeg ? '1px' : '50%'
                    }} />
                  </div>
                  <span style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    {item.isVeg ? t('menu.vegLabel') : t('menu.nonVegLabel')}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                color: '#9ca3af',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
                e.target.style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#9ca3af';
              }}
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '24px' }}>
            {/* Price */}
            <div style={{
              backgroundColor: '#f9fafb',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '32px',
                fontWeight: '800',
                color: '#ef4444',
                marginBottom: '4px'
              }}>
                {formatCurrency(item.price)}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                {t('menu.pricePerServing')}
              </div>
            </div>

            {/* Images */}
            {!(globalHideImages || item.hideImage) && (item.images && item.images.length > 0) && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0,
                  marginBottom: '12px'
                }}>
                  {t('menu.images')}
                </h3>
                <ImageCarousel
                  images={item.images}
                  itemName={item.name}
                  maxHeight="200px"
                  className="w-full"
                />
              </div>
            )}

            {/* Description */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0,
                marginBottom: '8px'
              }}>
                {t('menu.description')}
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: '1.6',
                margin: 0
              }}>
                {item.description || t('menu.defaultDescriptionFull')}
              </p>
            </div>

            {/* Details */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0,
                marginBottom: '12px'
              }}>
                {t('menu.details')}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>{t('menu.category')}</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                    {category?.name || t('menu.mainCourse')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>{t('menu.shortCode')}</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                    {item.shortCode}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>{t('menu.status')}</span>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: item.isAvailable ? '#22c55e' : '#ef4444',
                    backgroundColor: item.isAvailable ? '#dcfce7' : '#fef2f2',
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}>
                    {item.isAvailable ? t('menu.available') : t('menu.outOfStock')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Channel Prices */}
          {multiPricingEnabled && activePricingRules?.length > 0 && item.pricingRules && Object.keys(item.pricingRules).length > 0 && (
            <div style={{ padding: '0 24px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0, marginBottom: '12px' }}>
                {t('menu.channelPrices')}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {activePricingRules.map(rule => {
                  const price = item.pricingRules[rule.id];
                  if (typeof price !== 'number') return null;
                  const n = (rule.name || '').toLowerCase().trim();
                  const isDineIn = ['dine-in', 'dine in', 'dinein'].includes(n);
                  const isTakeaway = ['takeaway', 'take away', 'take-away'].includes(n);
                  const isDelivery = n === 'delivery';
                  const icon = isDineIn ? '🍽️' : isTakeaway ? '🥡' : isDelivery ? '🛵' : '📍';
                  return (
                    <div key={rule.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>{icon} {rule.name}</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#166534' }}>
                        {formatCurrency(price)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bar Details */}
          {(item.spiritCategory || item.abv || item.bottleSize || item.servingUnit || item.ingredients) && (
            <div style={{ padding: '0 24px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0, marginBottom: '12px' }}>
                {t('menu.barDetails')}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {item.spiritCategory && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>{t('menu.spiritCategory')}</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{item.spiritCategory}</span>
                  </div>
                )}
                {item.abv && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>{t('menu.abv')}</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{item.abv}%</span>
                  </div>
                )}
                {item.bottleSize && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>{t('menu.bottleSize')}</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{item.bottleSize}</span>
                  </div>
                )}
                {item.servingUnit && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>{t('menu.servingUnit')}</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{item.servingUnit}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bakery Details */}
          {(item.unit || item.weight || item.shelfLife || item.mfgDate || item.expiryDate) && (
            <div style={{ padding: '0 24px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0, marginBottom: '12px' }}>
                {t('menu.bakeryDetails')}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {item.unit && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>{t('menu.unit')}</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{item.unit}</span>
                  </div>
                )}
                {item.weight && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>{t('menu.weight')}</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{item.weight}</span>
                  </div>
                )}
                {item.shelfLife && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>{t('menu.shelfLife')}</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{item.shelfLife} days</span>
                  </div>
                )}
                {item.mfgDate && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>{t('menu.mfgDate')}</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{new Date(item.mfgDate).toLocaleDateString()}</span>
                  </div>
                )}
                {item.expiryDate && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>{t('menu.expiryDate')}</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{new Date(item.expiryDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ice Cream Details */}
          {(item.servingSize || item.scoopOptions) && (
            <div style={{ padding: '0 24px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0, marginBottom: '12px' }}>
                {t('menu.iceCreamDetails')}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {item.servingSize && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>{t('menu.servingSize')}</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{item.servingSize}</span>
                  </div>
                )}
                {item.scoopOptions && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>{t('menu.maxScoops')}</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{item.scoopOptions}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Variants */}
          {item.variants && item.variants.length > 0 && (
            <div style={{ padding: '0 24px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0, marginBottom: '12px' }}>
                {t('menu.variantsCount', { count: item.variants.length })}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {item.variants.map((v, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                    <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>{v.name}</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{formatCurrency(v.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customizations */}
          {item.customizations && item.customizations.length > 0 && (
            <div style={{ padding: '0 24px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0, marginBottom: '12px' }}>
                {t('menu.customizationsCount', { count: item.customizations.length })}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {item.customizations.map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                    <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>{c.name}</span>
                    {c.price > 0 && <span style={{ fontSize: '14px', fontWeight: '600', color: '#16a34a' }}>+{formatCurrency(c.price)}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recipe Section */}
          {recipe && (
            <div style={{ padding: '0 24px', marginBottom: '20px' }}>
              <div style={{
                padding: '16px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
                border: '1px solid #bbf7d0'
              }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#059669', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaFlask size={14} /> {t('menu.recipeLinked')}
                </h3>
                {/* Recipe meta */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {recipe.servings && (
                    <span style={{ fontSize: '12px', color: '#374151', backgroundColor: 'white', padding: '3px 8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                      {t('menu.servings', { count: recipe.servings })}
                    </span>
                  )}
                  {recipe.prepTime > 0 && (
                    <span style={{ fontSize: '12px', color: '#374151', backgroundColor: 'white', padding: '3px 8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                      {t('menu.prepTime', { time: recipe.prepTime })}
                    </span>
                  )}
                  {recipe.cookTime > 0 && (
                    <span style={{ fontSize: '12px', color: '#374151', backgroundColor: 'white', padding: '3px 8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                      {t('menu.cookTime', { time: recipe.cookTime })}
                    </span>
                  )}
                </div>
                {/* Ingredients */}
                {recipe.ingredients && recipe.ingredients.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {t('menu.ingredientsCount', { count: recipe.ingredients.length })}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {recipe.ingredients.map((ing, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', padding: '4px 8px', backgroundColor: 'white', borderRadius: '6px' }}>
                          <span style={{ color: '#374151' }}>{ing.inventoryItemName || ing.itemName || ing.name}</span>
                          <span style={{ color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' }}>{ing.quantity} {ing.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Instructions summary */}
                {recipe.instructions && recipe.instructions.length > 0 && (
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {t('menu.stepsCount', { count: recipe.instructions.length })}
                    </div>
                    <div style={{ fontSize: '12px', color: '#374151', lineHeight: 1.5 }}>
                      {recipe.instructions.slice(0, 3).map((step, i) => (
                        <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '2px' }}>
                          <span style={{ color: '#059669', fontWeight: 700, minWidth: '16px' }}>{i + 1}.</span>
                          <span>{step}</span>
                        </div>
                      ))}
                      {recipe.instructions.length > 3 && (
                        <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: '2px' }}>
                          {t('menu.moreSteps', { count: recipe.instructions.length - 3 })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          {(onEdit || onToggleAvailability || onDelete) && <div style={{
            padding: '16px 24px 24px 24px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            gap: '12px'
          }}>
            {onEdit && <button
              onClick={() => {
                onEdit(item);
                onClose();
              }}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.2)';
              }}
            >
              <FaEdit size={12} />
              {t('menu.editItem')}
            </button>}
            {onToggleAvailability && <button
              onClick={() => {
                onToggleAvailability(item.id, item.isAvailable);
                onClose();
              }}
              style={{
                padding: '12px 16px',
                background: item.isAvailable
                  ? 'linear-gradient(135deg, #f97316, #ea580c)'
                  : 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                minWidth: '120px',
                boxShadow: item.isAvailable
                  ? '0 2px 4px rgba(249, 115, 22, 0.2)'
                  : '0 2px 4px rgba(34, 197, 94, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                if (item.isAvailable) {
                  e.target.style.boxShadow = '0 4px 8px rgba(249, 115, 22, 0.3)';
                } else {
                  e.target.style.boxShadow = '0 4px 8px rgba(34, 197, 94, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                if (item.isAvailable) {
                  e.target.style.boxShadow = '0 2px 4px rgba(249, 115, 22, 0.2)';
                } else {
                  e.target.style.boxShadow = '0 2px 4px rgba(34, 197, 94, 0.2)';
                }
              }}
            >
              {item.isAvailable ? <FaMinus size={12} /> : <FaCheck size={12} />}
              {item.isAvailable ? t('menu.markOut') : t('menu.markAvailable')}
            </button>}
            {onDelete && <button
              onClick={() => {
                onDelete(item.id);
                onClose();
              }}
              style={{
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                minWidth: '100px',
                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.2)';
              }}
            >
              <FaTrash size={12} />
              {t('menu.delete')}
            </button>}
          </div>}
        </div>
      </div>, document.body
  );
};

const MenuManagement = () => {
  const { isLoading } = useLoading();
  const router = useRouter();
  const { formatCurrency, getCurrencySymbol } = useCurrency();
  const { isOnline } = useNetworkStatus();
  const [isMobile, setIsMobile] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]); // Dynamic: from backend or from menu photo extraction
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVegFilter, setSelectedVegFilter] = useState('all');
  const [selectedWeightFilter, setSelectedWeightFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [displaySearch, setDisplaySearch] = useState('');
  const searchDebounceRef = useRef(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const moreActionsRef = useRef(null);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true); // Start as true to show loading on first load
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [hasInitialData, setHasInitialData] = useState(false); // Track if we have any data (cached or fresh)
  const [operationLoading, setOperationLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentRestaurant, setCurrentRestaurant] = useState(null); // Will be loaded from user data
  const isBarMode = currentRestaurant?.businessType === 'bar';
  const isBakeryMode = currentRestaurant?.businessType === 'bakery';
  const isIceCreamMode = currentRestaurant?.businessType === 'ice_cream';

  // Business-type-aware labels
  const businessTypeConfig = {
    restaurant: { item: t('menu.dish'), add: t('menu.addNewDish'), empty: t('menu.createRestaurantMenu'), emptyDesc: t('menu.addDishesDesc'), icon: '🍽️', label: t('menu.labelRestaurant'), accent: '#dc2626', accentLight: '#fef2f2', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
    bar: { item: t('menu.drink'), add: t('menu.addDrink'), empty: t('menu.startDrinksMenu'), emptyDesc: t('menu.addDrinksDesc'), icon: '🍸', label: t('menu.labelBar'), accent: '#1e293b', accentLight: '#f1f5f9', gradient: 'linear-gradient(135deg, #334155, #1e293b)' },
    bakery: { item: t('menu.item'), add: t('menu.addItem'), empty: t('menu.startBakeryMenu'), emptyDesc: t('menu.addBakeryDesc'), icon: '🧁', label: t('menu.labelBakery'), accent: '#d97706', accentLight: '#fffbeb', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
    ice_cream: { item: t('menu.flavor'), add: t('menu.addFlavor'), empty: t('menu.startIceCreamMenu'), emptyDesc: t('menu.addIceCreamDesc'), icon: '🍦', label: t('menu.labelIceCreamParlor'), accent: '#2563eb', accentLight: '#eff6ff', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
    cafe: { item: t('menu.item'), add: t('menu.addItem'), empty: t('menu.startCafeMenu'), emptyDesc: t('menu.addCafeDesc'), icon: '☕', label: t('menu.labelCafe'), accent: '#059669', accentLight: '#ecfdf5', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
    qsr: { item: t('menu.item'), add: t('menu.addItem'), empty: t('menu.startQsrMenu'), emptyDesc: t('menu.addQsrDesc'), icon: '🍔', label: t('menu.labelQuickService'), accent: '#ea580c', accentLight: '#fff7ed', gradient: 'linear-gradient(135deg, #f97316, #ea580c)' },
  };
  const btype = businessTypeConfig[currentRestaurant?.businessType] || businessTypeConfig.restaurant;
  const globalHideImages = currentRestaurant?.posSettings?.hideMenuImages === true;
  const [isClient, setIsClient] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [bulkDeleteReason, setBulkDeleteReason] = useState('');
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const hasLoadedData = useRef(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [photoSuccess, setPhotoSuccess] = useState(false);
  const [generatingRecipeFor, setGeneratingRecipeFor] = useState(null); // menu item ID currently generating recipe
  // recipeConfirmItem removed — replaced by showMenuRecipeModal
  const [menuItemRecipes, setMenuItemRecipes] = useState({}); // menuItemId → recipe data
  const cameraInputRef = useRef(null);

  // Permission gating
  const menuUserData = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const menuPageAccess = menuUserData.pageAccess;
  const canAddMenuItem = canPerform(menuUserData, menuPageAccess, 'menu', 'add');
  const canEditMenuItem = canPerform(menuUserData, menuPageAccess, 'menu', 'update');
  const canDeleteMenuItem = canPerform(menuUserData, menuPageAccess, 'menu', 'delete');
  const canMarkOutOfStock = canPerform(menuUserData, menuPageAccess, 'menu', 'markOutOfStock');
  const isOwnerOrAdmin = ['owner', 'admin'].includes(menuUserData.role);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isVeg: true,
    shortCode: '',
    image: '',
    images: [],
    tempImages: [],
    isAvailable: true,
    stockQuantity: null,
    isStockManaged: false,
    lowStockThreshold: 5,
    stockUnit: 'pcs',
    soldByWeight: false,
    priceUnit: 'per_kg',
    pluCode: '',
    variants: [],
    customizations: [],
    generateRecipe: true,
    // Bar-specific fields
    spiritCategory: '',
    ingredients: '',
    abv: '',
    servingUnit: '',
    bottleSize: '',
    // Bakery-specific fields
    unit: '',
    weight: '',
    shelfLife: '',
    mfgDate: '',
    expiryDate: '',
    // Ice cream-specific fields
    servingSize: '',
    scoopOptions: '',
    // Multi-tier pricing
    pricingRules: {},
    // Channel prices (always visible)
    dineInPrice: '',
    takeawayPrice: '',
    deliveryPrice: '',
    // Tax inclusive override (null = follow restaurant setting)
    taxInclusive: null,
    // Inventory direct deduction
    deductionQuantity: 1,
  });
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [multiPricingEnabled, setMultiPricingEnabled] = useState(false);
  const [activePricingRules, setActivePricingRules] = useState([]);
  const [pricingRulesExpanded, setPricingRulesExpanded] = useState(true);
  const [stockTrackSuggestion, setStockTrackSuggestion] = useState(null);

  // AI Smart Detection: Suggest inventory tracking for packaged/countable items
  const detectDirectTrackableItem = useCallback((itemName) => {
    if (!itemName || itemName.length < 2) { setStockTrackSuggestion(null); return; }
    const name = itemName.toLowerCase().trim();
    const directTrackPatterns = [
      // Bottled items
      { pattern: /\b(water|soda|cola|pepsi|coke|sprite|fanta|mirinda|thumbs?\s*up|limca|maaza|frooti|appy|redbull|monster|beer|wine)\b/i, unit: 'bottle', label: 'Bottled item' },
      { pattern: /\b(bottle|can|tin|tetra\s*pack|pet)\b/i, unit: 'bottle', label: 'Packaged beverage' },
      // Packaged food
      { pattern: /\b(bread|bun|pav|roti|naan|paratha)\s*(packet|pack|loaf)?\b/i, unit: 'pcs', label: 'Packaged item' },
      { pattern: /\b(chips|lays|kurkure|biscuit|cookie|wafer|namkeen|snack)\b/i, unit: 'pcs', label: 'Packaged snack' },
      { pattern: /\b(cigarette|gutka|pan\s*masala|matchbox)\b/i, unit: 'pcs', label: 'Countable item' },
      { pattern: /\b(ice\s*cream|cone|cup|tub|scoop)\b/i, unit: 'pcs', label: 'Countable item' },
      // Eggs, fruits
      { pattern: /\b(egg|anda|boiled\s*egg)\b/i, unit: 'pcs', label: 'Countable item' },
      // Ready-made items
      { pattern: /\b(samosa|vada\s*pav|puff|sandwich|burger|wrap|roll|momo|dumpling)\b/i, unit: 'pcs', label: 'Prepared countable item' },
      // Desserts
      { pattern: /\b(gulab\s*jamun|rasgulla|laddu|ladoo|barfi|jalebi|cake\s*slice)\b/i, unit: 'pcs', label: 'Countable dessert' },
      // Retail items
      { pattern: /\b(packet|pack|pouch|sachet|box|carton|piece)\b/i, unit: 'pcs', label: 'Packaged item' },
      // Quantity indicators in name
      { pattern: /\b(\d+\s*(ml|ltr|l|gm|g|kg|pcs|pc))\b/i, unit: 'pcs', label: 'Sized item - track by piece' },
    ];

    for (const { pattern, unit, label } of directTrackPatterns) {
      if (pattern.test(name)) {
        setStockTrackSuggestion({ unit, label, itemName: itemName });
        return;
      }
    }
    setStockTrackSuggestion(null);
  }, []);

  // Name matching constants for channel rules
  const TAKEAWAY_NAMES = ['takeaway', 'take away', 'take-away'];
  const DELIVERY_NAMES = ['delivery'];
  const DINEIN_NAMES = ['dine-in', 'dine in', 'dinein'];

  // Resolve channel rule IDs from active pricing rules
  const findRuleByChannel = useCallback((channel) => {
    const names = channel === 'dineIn' ? DINEIN_NAMES : channel === 'takeaway' ? TAKEAWAY_NAMES : DELIVERY_NAMES;
    return activePricingRules.find(r => r.isActive && names.includes((r.name || '').toLowerCase().trim()));
  }, [activePricingRules]);

  // Mobile detection with client-side hydration safety
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Mobile detection for responsive layout
  useEffect(() => {
    // Electron is always a desktop POS terminal — never use mobile layout
    if (typeof window !== 'undefined' && window.electronAPI) {
      setIsMobile(false);
      return;
    }
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const isMobileEmbed = isMobile && typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__;

  // Close "More" dropdown on outside click
  useEffect(() => {
    if (!showMoreActions) return;
    const handler = (e) => {
      if (moreActionsRef.current && !moreActionsRef.current.contains(e.target)) {
        setShowMoreActions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMoreActions]);

  const loadMenuData = useCallback(async (restaurantId, useCache = true) => {
    try {
      console.log('Loading menu data for restaurant:', restaurantId);
      
      // Check for cached data first
      if (useCache) {
        const cachedData = getCachedMenuData(restaurantId);
        if (cachedData) {
          console.log('⚡ Loading cached menu data instantly...');
          if (cachedData.menuItems) {
            setMenuItems(cachedData.menuItems);
          }
          // Always set hasInitialData to true if we have cached data (even if empty, we know the state)
          setHasInitialData(true);
          if (cachedData.categories) setCategories(cachedData.categories);
          setLoading(false);
          
          // Show background loading
          setBackgroundLoading(true);
          window.dispatchEvent(new CustomEvent('menuBackgroundLoading', { detail: { loading: true } }));
        } else {
          // No cache, but don't show loading - just fetch silently
          setLoading(false);
        }
      } else {
        // Force refresh - don't show loading
        setLoading(false);
      }
      
      setError('');

      // Load menu items and categories in parallel
      const [menuResponse, categoriesResponse] = await Promise.all([
        apiClient.getMenu(restaurantId),
        apiClient.getCategories(restaurantId),
      ]);
      
      const freshMenuItems = menuResponse.menuItems || [];
      setMenuItems(freshMenuItems);
      // Always set hasInitialData to true once we've loaded data (even if empty, we know the state)
      setHasInitialData(true);

      // Use categories from backend only (dynamic). No hardcoded defaults – user adds or they come from menu photo extraction.
      const backendCategories = categoriesResponse.categories || [];
      const finalCategories = backendCategories.length > 0 ? backendCategories : [];
      setCategories(finalCategories);

      if (finalCategories.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: finalCategories[0].id }));
      }

      // Cache the data (localStorage + IndexedDB)
      const dataToCache = {
        menuItems: freshMenuItems,
        categories: finalCategories
      };
      setCachedMenuData(restaurantId, dataToCache);
      setCachedData(`menu_${restaurantId}`, dataToCache).catch(() => {});
      console.log('✅ Menu data cached');

      // Load recipes for menu items (for recipe icon status)
      try {
        const recipesRes = await apiClient.getRecipes(restaurantId);
        const recipes = recipesRes.recipes || recipesRes || [];
        const recipeMap = {};
        recipes.forEach(r => {
          if (r.menuItemId) recipeMap[r.menuItemId] = r;
        });
        setMenuItemRecipes(recipeMap);
      } catch (e) {
        console.warn('Could not load recipes for menu items:', e);
      }

    } catch (error) {
      console.error('Error loading menu data:', error);
      // Try IndexedDB fallback before showing error
      if (menuItems.length === 0) {
        try {
          const idbData = await getCachedData(`menu_${restaurantId}`);
          if (idbData?.menuItems?.length > 0) {
            console.log('📦 Loaded menu from IndexedDB offline cache');
            setMenuItems(idbData.menuItems);
            if (idbData.categories) setCategories(idbData.categories);
            setHasInitialData(true);
            setError('');
          } else {
            setError(t('menu.failedLoadMenu'));
            setHasInitialData(false);
          }
        } catch {
          setError(t('menu.failedLoadMenu'));
          setHasInitialData(false);
        }
      }
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
      setBackgroundLoading(false);
      window.dispatchEvent(new CustomEvent('menuBackgroundLoading', { detail: { loading: false } }));
      hasLoadedData.current = true;
    }
  }, [formData.category]);

  // Get current restaurant context
  useEffect(() => {
    const loadRestaurantContext = async () => {
      try {
        console.log('🏪 Menu: Loading restaurant context...');
        const userData = localStorage.getItem('user');
        if (!userData) {
          console.log('❌ Menu: No user data found, redirecting to login');
          if (isMobileEmbed) return;
          router.push('/login');
          return;
        }

        const user = JSON.parse(userData);
        console.log('👤 Menu: User role:', user.role);
        let restaurantId = null;
        let restaurant = null;

        // For staff members (not owners), use their assigned restaurant
        if (user.restaurantId && ['waiter', 'manager', 'employee', 'cashier'].includes(user.role)) {
          restaurantId = user.restaurantId;
          console.log('👨‍💼 Menu: Staff member - using assigned restaurant:', restaurantId);
          // Set restaurant object for staff
          restaurant = {
            id: user.restaurantId,
            name: user.restaurant?.name || 'Restaurant'
          };
          setCurrentRestaurant(restaurant);
        }
        // For owners or customers, get selected restaurant
        else {
          console.log('👑 Menu: Owner/Customer - fetching restaurants...');
          let restaurantsResponse;
          try {
            restaurantsResponse = await apiClient.getRestaurants();
          } catch (restErr) {
            // Offline fallback: use cached restaurant
            console.warn('🔌 Menu: Restaurants API failed, using cached:', restErr.message);
            const saved = localStorage.getItem('selectedRestaurant');
            restaurantsResponse = saved ? { restaurants: [JSON.parse(saved)] } : { restaurants: [] };
          }
          if (restaurantsResponse.restaurants && restaurantsResponse.restaurants.length > 0) {
            const savedRestaurantId = localStorage.getItem('selectedRestaurantId');
            const defaultId = restaurantsResponse.defaultRestaurantId;
            const selectedRestaurant = restaurantsResponse.restaurants.find(r => r.id === savedRestaurantId) ||
                                      (defaultId ? restaurantsResponse.restaurants.find(r => r.id === defaultId) : null) ||
                                      restaurantsResponse.restaurants[0];
            restaurantId = selectedRestaurant.id;
            restaurant = selectedRestaurant;
            // Sync localStorage
            localStorage.setItem('selectedRestaurantId', restaurantId);
            localStorage.setItem('selectedRestaurant', JSON.stringify(selectedRestaurant));
            console.log('✅ Menu: Selected restaurant:', restaurantId);
            setCurrentRestaurant(selectedRestaurant);
          } else {
            console.warn('⚠️ Menu: No restaurants found');
          }
        }

        if (restaurantId && !hasLoadedData.current) {
          console.log('📋 Menu: Loading menu data for restaurant:', restaurantId);
          // Try to load cached data immediately
          const cachedData = getCachedMenuData(restaurantId);
          if (cachedData) {
            console.log('⚡ Menu: Loading cached menu data on mount...');
            if (cachedData.menuItems) {
              setMenuItems(cachedData.menuItems);
              setHasInitialData(true);
            }
            if (cachedData.categories) setCategories(cachedData.categories);
            setLoading(false);
          }
          await loadMenuData(restaurantId, true); // Use cache
        } else if (!restaurantId) {
          console.error('❌ Menu: No restaurant ID available');
          setError(t('menu.noRestaurantFound'));
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Menu: Error loading restaurant context:', error);
        setError(t('menu.failedLoadRestaurant', { error: error.message }));
        setLoading(false);
      }
    };

    loadRestaurantContext();
  }, [router]); // Removed loadMenuData dependency to prevent unnecessary reloads

  // Listen for restaurant changes from navigation
  useEffect(() => {
    const handleRestaurantChange = (event) => {
      console.log('🏪 Menu page: Restaurant changed, reloading data', event.detail);
      // Reset the loaded data flag to allow reloading
      hasLoadedData.current = false;
      
      // Reload restaurant context and menu data
      const loadRestaurantContext = async () => {
        try {
          const userData = localStorage.getItem('user');
          if (!userData) return;

          const user = JSON.parse(userData);
          let restaurantId = null;

          if (user.restaurantId && ['waiter', 'manager', 'employee', 'cashier'].includes(user.role)) {
            restaurantId = user.restaurantId;
            // Set restaurant object for staff
            const restaurant = {
              id: user.restaurantId,
              name: user.restaurant?.name || 'Restaurant'
            };
            setCurrentRestaurant(restaurant);
          } else if (user.role === 'owner' || user.role === 'admin') {
            const restaurantsResponse = await apiClient.getRestaurants();
            const restaurants = restaurantsResponse.restaurants || [];
            const savedRestaurantId = localStorage.getItem('selectedRestaurantId');
            const selectedRestaurant = restaurants.find(r => r.id === savedRestaurantId) || restaurants[0];
            restaurantId = selectedRestaurant?.id;
            setCurrentRestaurant(selectedRestaurant);
          }

          if (restaurantId) {
            await loadMenuData(restaurantId, true); // Use cache
          }
        } catch (error) {
          console.error('Error reloading restaurant context:', error);
        }
      };

      loadRestaurantContext();
    };

    window.addEventListener('restaurantChanged', handleRestaurantChange);

    return () => {
      window.removeEventListener('restaurantChanged', handleRestaurantChange);
    };
  }, []); // Removed loadMenuData dependency

  // Refresh menu when inventory/stock changes on other pages
  useEffect(() => {
    const handleInventoryChanged = () => {
      if (currentRestaurant?.id) {
        loadMenuData(currentRestaurant.id, false); // Force fresh fetch
      }
    };
    window.addEventListener('inventoryChanged', handleInventoryChanged);
    return () => window.removeEventListener('inventoryChanged', handleInventoryChanged);
  }, [currentRestaurant?.id]);

  // Load multi-pricing rules when restaurant is set
  useEffect(() => {
    if (!currentRestaurant?.id) return;
    (async () => {
      try {
        const response = await apiClient.getPricingSettings(currentRestaurant.id);
        const mp = response?.settings?.multiPricing;
        if (mp?.enabled) {
          setMultiPricingEnabled(true);
          setActivePricingRules(mp.rules || []);
        } else {
          setMultiPricingEnabled(false);
          setActivePricingRules([]);
        }
      } catch { /* ignore — backward compatible */ }
    })();
  }, [currentRestaurant?.id]);

  // O(1) category lookup map
  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach(c => map.set(c.id, c));
    return map;
  }, [categories]);

  // Check if any item is sold by weight (to show/hide the weight filter)
  const hasWeightItems = useMemo(() => menuItems.some(item => item.soldByWeight), [menuItems]);

  const filteredItems = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return menuItems.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesVegFilter = selectedVegFilter === 'all' ||
        (selectedVegFilter === 'veg' && item.isVeg) ||
        (selectedVegFilter === 'non-veg' && !item.isVeg);
      const matchesWeightFilter = selectedWeightFilter === 'all' ||
        (selectedWeightFilter === 'weight' && item.soldByWeight);
      const matchesSearch = !lowerSearch ||
                           item.name?.toLowerCase().includes(lowerSearch) ||
                           item.shortCode?.toLowerCase().includes(lowerSearch) ||
                           item.description?.toLowerCase().includes(lowerSearch);
      return matchesCategory && matchesVegFilter && matchesWeightFilter && matchesSearch;
    });
  }, [menuItems, selectedCategory, selectedVegFilter, selectedWeightFilter, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOnline && !editingItem) { alert('You are offline. Go online to add new items.'); return; }
    if (!currentRestaurant) return;

    try {
      setProcessing(true);
      setError('');

      // Clean up variants - parse prices and filter out empty ones
      const cleanedVariants = (formData.variants || []).filter(v => v.name && v.price).map(v => ({
        name: v.name,
        price: parseFloat(v.price) || 0,
        description: v.description || ''
      }));

      // Clean up customizations - parse prices and filter out empty ones
      const cleanedCustomizations = (formData.customizations || []).filter(c => c.name).map(c => ({
        id: c.id || Date.now().toString(),
        name: c.name,
        price: parseFloat(c.price) || 0,
        description: c.description || ''
      }));

      // Check if any channel prices are set
      const dineInVal = parseFloat(formData.dineInPrice);
      const takeawayVal = parseFloat(formData.takeawayPrice);
      const deliveryVal = parseFloat(formData.deliveryPrice);
      const hasChannelPrice = (!isNaN(dineInVal) && dineInVal >= 0) || (!isNaN(takeawayVal) && takeawayVal >= 0) || (!isNaN(deliveryVal) && deliveryVal >= 0);

      // Auto-enable multi-pricing if channel prices are set but not enabled
      let currentRules = [...activePricingRules];
      if (hasChannelPrice && !multiPricingEnabled) {
        try {
          const pricingRes = await apiClient.getPricingSettings(currentRestaurant.id);
          const existing = pricingRes?.settings?.multiPricing;
          currentRules = existing?.rules || [];

          // Create default channel rules if missing
          const DEFAULT_CHANNEL_RULES = [
            { id: 'rule_dine_in', name: 'Dine-In', type: 'fixed', defaultMarkupType: 'none', defaultMarkupValue: 0, tableMappings: [], isActive: true, order: 0 },
            { id: 'rule_takeaway', name: 'Takeaway', type: 'fixed', defaultMarkupType: 'none', defaultMarkupValue: 0, tableMappings: [], isActive: true, order: 1 },
            { id: 'rule_delivery', name: 'Delivery', type: 'fixed', defaultMarkupType: 'none', defaultMarkupValue: 0, tableMappings: [], isActive: true, order: 2 },
          ];
          for (const def of DEFAULT_CHANNEL_RULES) {
            const names = def.name === 'Dine-In' ? DINEIN_NAMES : def.name === 'Takeaway' ? TAKEAWAY_NAMES : DELIVERY_NAMES;
            const exists = currentRules.some(r => names.includes((r.name || '').toLowerCase().trim()));
            if (!exists) currentRules.push(def);
          }

          await apiClient.updatePricingSettings(currentRestaurant.id, {
            multiPricing: { enabled: true, rules: currentRules }
          });
          setMultiPricingEnabled(true);
          setActivePricingRules(currentRules);
        } catch (pricingError) {
          console.error('Failed to auto-enable multi-pricing:', pricingError);
        }
      }

      // Clean up pricing rules — only keep numeric values
      const cleanedPricingRules = {};
      // Merge extra zone rules (AC, Non-AC, etc.)
      if (formData.pricingRules) {
        for (const [ruleId, val] of Object.entries(formData.pricingRules)) {
          const parsed = parseFloat(val);
          if (!isNaN(parsed) && parsed >= 0) {
            cleanedPricingRules[ruleId] = parsed;
          }
        }
      }

      // Map channel prices to rule IDs
      const rulesToSearch = currentRules.length > 0 ? currentRules : activePricingRules;
      const dineInRule = rulesToSearch.find(r => DINEIN_NAMES.includes((r.name || '').toLowerCase().trim()));
      const takeawayRule = rulesToSearch.find(r => TAKEAWAY_NAMES.includes((r.name || '').toLowerCase().trim()));
      const deliveryRule = rulesToSearch.find(r => DELIVERY_NAMES.includes((r.name || '').toLowerCase().trim()));
      if (dineInRule && !isNaN(dineInVal) && dineInVal >= 0) cleanedPricingRules[dineInRule.id] = dineInVal;
      if (takeawayRule && !isNaN(takeawayVal) && takeawayVal >= 0) cleanedPricingRules[takeawayRule.id] = takeawayVal;
      if (deliveryRule && !isNaN(deliveryVal) && deliveryVal >= 0) cleanedPricingRules[deliveryRule.id] = deliveryVal;

      const itemData = {
        ...formData,
        price: parseFloat(formData.price),
        restaurantId: currentRestaurant.id,
        variants: cleanedVariants,
        customizations: cleanedCustomizations,
        pricingRules: cleanedPricingRules
      };

      if (editingItem) {
        // Update existing item
        if (!isOnline && !getOfflineEngineEnabled()) {
          setError('You are offline. Go online to make changes.');
          return;
        }
        if (!isOnline && getOfflineEngineEnabled()) {
          // Offline: queue update for later sync, update local state + caches
          const updateFields = {
            name: itemData.name,
            price: itemData.price,
            description: itemData.description,
            category: itemData.category,
            veg: itemData.veg,
            variants: itemData.variants,
            customizations: itemData.customizations,
            pricingRules: itemData.pricingRules,
          };
          await queueOfflineOrder({
            restaurantId: currentRestaurant.id,
            _offlineAction: 'update_menu_item',
            _menuItemId: editingItem.id,
            _menuUpdateData: updateFields,
            _restaurantId: currentRestaurant.id,
            idempotencyKey: generateIdempotencyKey(),
          });
          updateMenuItemInAllCaches(currentRestaurant.id, editingItem.id, updateFields).catch(() => {});
        } else {
          await apiClient.updateMenuItem(editingItem.id, itemData, currentRestaurant?.id);
        }
        setMenuItems(items => items.map(item =>
          item.id === editingItem.id ? { ...itemData, id: editingItem.id } : item
        ));
        setSuccessMessage(!isOnline
          ? `${formData.name} updated offline — will sync when online`
          : t('menu.itemUpdatedSuccess', { name: formData.name })
        );
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        // Add new item
        // Ensure the category exists in backend before saving item
        if (itemData.category && currentRestaurant?.id) {
          const categoryId = itemData.category.toLowerCase();
          const categoryExists = categories.some(c => (c.id || '').toLowerCase() === categoryId);
          if (!categoryExists) {
            try {
              // Create category if it doesn't exist
              const categoryName = categoryId.charAt(0).toUpperCase() + categoryId.slice(1).replace(/-/g, ' ');
              await apiClient.createCategory(currentRestaurant.id, { name: categoryName, emoji: '🍽️', description: '' });
              // Refresh categories
              const categoriesResponse = await apiClient.getCategories(currentRestaurant.id);
              if (categoriesResponse.categories) {
                setCategories(categoriesResponse.categories);
              }
            } catch (catError) {
              console.log('Category might already exist or failed to create:', catError.message);
            }
          }
        }

        const response = await apiClient.createMenuItem(currentRestaurant.id, itemData);
        const newItem = response.menuItem;
        setMenuItems(items => [...items, newItem]);

        // If there are temporary images, upload them now
        if (formData.tempImages && formData.tempImages.length > 0) {
          try {
            const files = formData.tempImages.map(temp => temp.file);
            const uploadResponse = await apiClient.uploadMenuItemImages(newItem.id, files, currentRestaurant?.id);

            if (uploadResponse.success) {
              // Update the new item with uploaded images
              setMenuItems(items => items.map(item =>
                item.id === newItem.id
                  ? { ...item, images: uploadResponse.images }
                  : item
              ));
            }
          } catch (uploadError) {
            console.error('Error uploading temporary images:', uploadError);
          }
        }

        // Show success notification
        setSuccessMessage(t('menu.itemAddedSuccess', { name: formData.name }));
        setTimeout(() => setSuccessMessage(''), 3000);
      }

      // Close modal on success
      resetForm();
    } catch (error) {
      console.error('Error saving menu item:', error);
      // Show error notification and close modal
      setError(editingItem ? t('menu.failedUpdateItem', { error: error.message || error }) : t('menu.failedAddItem', { error: error.message || error }));
      setTimeout(() => setError(''), 5000);
      resetForm();
    } finally {
      setProcessing(false);
    }
  };

  // Helper functions for variants and customizations
  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...(formData.variants || []), { name: '', price: '', description: '' }]
    });
  };

  const addBarServingVariants = () => {
    const templates = [
      { name: t('menu.variantPeg30ml'), price: '', description: '' },
      { name: t('menu.variantLarge60ml'), price: '', description: '' },
      { name: t('menu.variantBottle'), price: '', description: '' },
      { name: t('menu.variantPitcher'), price: '', description: '' }
    ];
    setFormData({
      ...formData,
      variants: [...(formData.variants || []), ...templates]
    });
  };

  const addBakeryPackVariants = () => {
    const templates = [
      { name: t('menu.variantSinglePiece'), price: '', description: '' },
      { name: t('menu.variantBoxOf6'), price: '', description: '' },
      { name: t('menu.variantBoxOf12'), price: '', description: '' }
    ];
    setFormData({
      ...formData,
      variants: [...(formData.variants || []), ...templates]
    });
  };

  const addIceCreamScoopVariants = () => {
    const templates = [
      { name: t('menu.variantSingleScoop'), price: '', description: '' },
      { name: t('menu.variantDoubleScoop'), price: '', description: '' },
      { name: t('menu.variantTripleScoop'), price: '', description: '' }
    ];
    setFormData({
      ...formData,
      variants: [...(formData.variants || []), ...templates]
    });
  };

  const removeVariant = (index) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index)
    });
  };

  const updateVariant = (index, field, value) => {
    const updatedVariants = [...(formData.variants || [])];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setFormData({ ...formData, variants: updatedVariants });
  };

  const addCustomization = () => {
    setFormData({
      ...formData,
      customizations: [...(formData.customizations || []), { id: Date.now().toString(), name: '', price: '', description: '' }]
    });
  };

  const removeCustomization = (index) => {
    setFormData({
      ...formData,
      customizations: formData.customizations.filter((_, i) => i !== index)
    });
  };

  const updateCustomization = (index, field, value) => {
    const updatedCustomizations = [...(formData.customizations || [])];
    updatedCustomizations[index] = { ...updatedCustomizations[index], [field]: value };
    setFormData({ ...formData, customizations: updatedCustomizations });
  };

  const handleEdit = useCallback((item) => {
    console.log('Editing item:', item);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      price: item.price?.toString() || '',
      category: item.category || '',
      isVeg: item.isVeg !== false,
      shortCode: item.shortCode || '',
      image: item.image || '',
      images: item.images || [],
      isAvailable: item.isAvailable !== false,
      stockQuantity: item.stockQuantity || null,
      isStockManaged: item.isStockManaged || false,
      lowStockThreshold: item.lowStockThreshold ?? 5,
      stockUnit: item.stockUnit || 'pcs',
      deductionQuantity: item.deductionQuantity ?? 1,
      soldByWeight: item.soldByWeight || false,
      priceUnit: item.priceUnit || 'per_kg',
      pluCode: item.pluCode || '',
      variants: item.variants || [],
      customizations: item.customizations || [],
      spiritCategory: item.spiritCategory || '',
      ingredients: item.ingredients || '',
      abv: item.abv?.toString() || '',
      servingUnit: item.servingUnit || '',
      bottleSize: item.bottleSize || '',
      unit: item.unit || '',
      weight: item.weight || '',
      shelfLife: item.shelfLife?.toString() || '',
      mfgDate: item.mfgDate || '',
      expiryDate: item.expiryDate || '',
      servingSize: item.servingSize || '',
      scoopOptions: item.scoopOptions?.toString() || '',
      hideImage: item.hideImage || false,
      pricingRules: item.pricingRules || {},
      taxInclusive: item.taxInclusive != null ? item.taxInclusive : null,
      // Pre-populate channel prices from pricing rules
      dineInPrice: (() => {
        const rule = activePricingRules.find(r => DINEIN_NAMES.includes((r.name || '').toLowerCase().trim()));
        return rule && item.pricingRules?.[rule.id] != null ? String(item.pricingRules[rule.id]) : '';
      })(),
      takeawayPrice: (() => {
        const rule = activePricingRules.find(r => TAKEAWAY_NAMES.includes((r.name || '').toLowerCase().trim()));
        return rule && item.pricingRules?.[rule.id] != null ? String(item.pricingRules[rule.id]) : '';
      })(),
      deliveryPrice: (() => {
        const rule = activePricingRules.find(r => DELIVERY_NAMES.includes((r.name || '').toLowerCase().trim()));
        return rule && item.pricingRules?.[rule.id] != null ? String(item.pricingRules[rule.id]) : '';
      })(),
    });
    setEditingItem(item);
    setShowAddForm(true);
    setShowAdvancedOptions(false); // Collapse advanced options when editing
    // Don't trigger any loading states - just open the form
  }, [activePricingRules]);

  const handleDelete = useCallback((itemId) => {
    if (!isOnline) { alert('You are offline. Go online to make changes.'); return; }
    const item = menuItems.find(i => i.id === itemId);
    setDeleteConfirmItem(item || { id: itemId, name: '' });
  }, [isOnline, menuItems]);

  const confirmDelete = useCallback(async () => {
    if (!deleteConfirmItem) return;
    try {
      setIsDeleting(true);
      await apiClient.deleteMenuItem(deleteConfirmItem.id, currentRestaurant?.id);
      setMenuItems(items => items.filter(item => item.id !== deleteConfirmItem.id));
      setDeleteConfirmItem(null);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      setError(t('menu.failedDeleteItem'));
    } finally {
      setIsDeleting(false);
    }
  }, [deleteConfirmItem, currentRestaurant?.id]);


  const handleBulkDeleteClick = () => {
    if (!isOnline) { alert('You are offline. Go online to make changes.'); return; }
    console.log('🗑️ Bulk delete clicked. Current restaurant:', currentRestaurant);

    if (!currentRestaurant?.id) {
      console.error('❌ No restaurant selected for bulk delete');
      setError(t('menu.noRestaurantRefresh'));
      return;
    }

    const activeItemsCount = menuItems.filter(item => item.status !== 'deleted').length;

    if (activeItemsCount === 0) {
      setError(t('menu.noItemsToDelete'));
      return;
    }

    console.log('✅ Showing bulk delete confirmation for', activeItemsCount, 'items');
    // Show confirmation modal
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    if (!bulkDeleteReason.trim()) return;
    try {
      setOperationLoading(true);
      setShowBulkDeleteConfirm(false);

      const response = await apiClient.bulkDeleteMenuItems(currentRestaurant.id, bulkDeleteReason.trim());
      setBulkDeleteReason('');

      // Clear all menu items from state
      setMenuItems([]);

      // Show success message
      setSuccessMessage(t('menu.deletedItemsSuccess', { count: response.deletedCount }));

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);

      // Reload menu data to ensure consistency
      if (currentRestaurant?.id) {
        await loadMenuData(currentRestaurant.id, false);
      }
    } catch (error) {
      console.error('Error bulk deleting menu items:', error);
      setError(t('menu.failedDeleteItems', { error: error.message || error }));

      // Clear error message after 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleToggleFavorite = useCallback(async (item) => {
    if (!currentRestaurant?.id) {
      setError(t('menu.noRestaurantSelected'));
      return;
    }

    try {
      const isCurrentlyFavorite = item.isFavorite === true;

      if (!isOnline) {
        // Offline: optimistic local + cache update only (syncs on next online menu load)
        setMenuItems(prevItems => prevItems.map(menuItem =>
          menuItem.id === item.id
            ? { ...menuItem, isFavorite: !isCurrentlyFavorite }
            : menuItem
        ));
        updateMenuItemInAllCaches(currentRestaurant.id, item.id, { isFavorite: !isCurrentlyFavorite }).catch(() => {});
        return;
      }

      if (isCurrentlyFavorite) {
        await apiClient.unmarkMenuItemAsFavorite(currentRestaurant.id, item.id);
      } else {
        await apiClient.markMenuItemAsFavorite(currentRestaurant.id, item.id);
      }

      // Update the menu item in state
      setMenuItems(prevItems => prevItems.map(menuItem =>
        menuItem.id === item.id
          ? { ...menuItem, isFavorite: !isCurrentlyFavorite }
          : menuItem
      ));

      // Reload menu data to sync with backend
      await loadMenuData(currentRestaurant.id, false);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError(t('menu.failedUpdateFavorite'));
    }
  }, [currentRestaurant?.id, isOnline, loadMenuData]);

  const [hideImageToast, setHideImageToast] = useState(null);
  const handleToggleHideImage = useCallback(async (item) => {
    if (!currentRestaurant?.id) return;
    const newVal = !item.hideImage;
    // Optimistic update
    setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, hideImage: newVal } : m));
    setHideImageToast({ message: newVal ? `Image hidden for "${item.name}"` : `Image visible for "${item.name}"`, type: 'loading' });
    try {
      await apiClient.updateMenuItem(item.id, { hideImage: newVal }, currentRestaurant.id);
      updateMenuItemInAllCaches(currentRestaurant.id, item.id, { hideImage: newVal }).catch(() => {});
      setHideImageToast({ message: newVal ? `Image hidden for "${item.name}"` : `Image shown for "${item.name}"`, type: 'success' });
      setTimeout(() => setHideImageToast(null), 2000);
    } catch (e) {
      console.error('Failed to toggle hideImage:', e);
      setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, hideImage: !newVal } : m));
      setHideImageToast({ message: `Failed to update "${item.name}"`, type: 'error' });
      setTimeout(() => setHideImageToast(null), 3000);
    }
  }, [currentRestaurant?.id]);

  const handleToggleAvailability = useCallback(async (itemId, currentStatus) => {
    try {
      setOperationLoading(true);
      const updatedData = { isAvailable: !currentStatus };

      if (!isOnline) {
        if (!getOfflineEngineEnabled()) {
          setError('You are offline. Go online to make changes.');
          return;
        }
        // Queue for later sync
        await queueOfflineOrder({
          restaurantId: currentRestaurant?.id,
          _offlineAction: 'update_menu_item',
          _menuItemId: itemId,
          _menuUpdateData: updatedData,
          _restaurantId: currentRestaurant?.id,
          idempotencyKey: generateIdempotencyKey(),
        });
        // Update all caches so dashboard reflects the change
        updateMenuItemInAllCaches(currentRestaurant?.id, itemId, updatedData).catch(() => {});
      } else {
        await apiClient.updateMenuItem(itemId, updatedData, currentRestaurant?.id);
      }

      setMenuItems(items => items.map(item =>
        item.id === itemId ? { ...item, isAvailable: !currentStatus } : item
      ));
    } catch (error) {
      console.error('Error updating availability:', error);
      setError(t('menu.failedUpdateAvailability'));
    } finally {
      setOperationLoading(false);
    }
  }, [isOnline, currentRestaurant?.id]);

  // ─── Recipe Modal State & Handlers (reuses RecipeFormBody from Inventory) ───
  const [showMenuRecipeModal, setShowMenuRecipeModal] = useState(false);
  const [menuRecipeItem, setMenuRecipeItem] = useState(null); // the menu item this recipe is for
  const [menuRecipeFormData, setMenuRecipeFormData] = useState({
    name: '', description: '', category: '', servings: 1, prepTime: 0, cookTime: 0,
    ingredients: [{ inventoryItemId: '', inventoryItemName: '', quantity: 1, unit: '' }],
    instructions: [''], notes: '',
  });
  const [menuRecipeInventoryItems, setMenuRecipeInventoryItems] = useState([]);
  const [menuRecipeGenerating, setMenuRecipeGenerating] = useState(false);
  const [menuRecipeGeneratingSteps, setMenuRecipeGeneratingSteps] = useState(false);
  const [menuRecipeSaving, setMenuRecipeSaving] = useState(false);
  const [menuRecipeError, setMenuRecipeError] = useState(null);

  const menuRecipeAddIngredient = () => {
    setMenuRecipeFormData(prev => ({
      ...prev, ingredients: [...prev.ingredients, { inventoryItemId: '', inventoryItemName: '', quantity: 1, unit: '', type: 'inventory', subRecipeId: null }]
    }));
  };
  const menuRecipeRemoveIngredient = (index) => {
    setMenuRecipeFormData(prev => ({
      ...prev, ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };
  const menuRecipeUpdateIngredient = (index, field, value) => {
    setMenuRecipeFormData(prev => {
      const newIngredients = [...prev.ingredients];
      newIngredients[index] = { ...newIngredients[index], [field]: value };
      if (field === 'type') {
        // Reset fields when switching between inventory item and sub-recipe
        if (value === 'recipe') {
          newIngredients[index].inventoryItemId = '';
          newIngredients[index].inventoryItemName = '';
          newIngredients[index].unit = 'servings';
        } else {
          newIngredients[index].subRecipeId = null;
          newIngredients[index].unit = '';
        }
      } else if (field === 'inventoryItemId') {
        const selectedItem = menuRecipeInventoryItems.find(item => item.id === value);
        newIngredients[index].inventoryItemName = selectedItem ? selectedItem.name : '';
      } else if (field === 'subRecipeId') {
        const allRecipesList = Object.values(menuItemRecipes);
        const selectedRecipe = allRecipesList.find(r => r.id === value);
        newIngredients[index].inventoryItemName = selectedRecipe ? selectedRecipe.name : '';
      }
      return { ...prev, ingredients: newIngredients };
    });
  };
  const menuRecipeAddInstruction = () => {
    setMenuRecipeFormData(prev => ({ ...prev, instructions: [...prev.instructions, ''] }));
  };
  const menuRecipeRemoveInstruction = (index) => {
    setMenuRecipeFormData(prev => ({ ...prev, instructions: prev.instructions.filter((_, i) => i !== index) }));
  };
  const menuRecipeUpdateInstruction = (index, value) => {
    setMenuRecipeFormData(prev => {
      const newInstructions = [...prev.instructions];
      newInstructions[index] = value;
      return { ...prev, instructions: newInstructions };
    });
  };

  // AI generate full recipe (same logic as inventory page)
  const menuRecipeGenerateFull = async () => {
    if (!currentRestaurant?.id || !menuRecipeFormData.name) return;
    try {
      setMenuRecipeGenerating(true); setMenuRecipeError(null);
      const result = await apiClient.generateFullRecipe(currentRestaurant.id, {
        name: menuRecipeFormData.name,
        servings: menuRecipeFormData.servings || 1,
      });
      if (result) {
        const unmatchedToCreate = [];
        const mappedIngredients = (result.ingredients || []).map(aiIng => {
          const normalizedName = (aiIng.itemName || '').toLowerCase().trim();
          const match = menuRecipeInventoryItems.find(inv => {
            const invName = (inv.name || '').toLowerCase().trim();
            return invName === normalizedName || invName.includes(normalizedName) || normalizedName.includes(invName);
          });
          if (!match) {
            unmatchedToCreate.push({ name: aiIng.itemName, unit: aiIng.unit || 'g', category: result.category || 'Other' });
          }
          return {
            inventoryItemId: match ? match.id : '',
            inventoryItemName: match ? match.name : aiIng.itemName,
            quantity: aiIng.quantity || 0,
            unit: aiIng.unit || '',
            type: 'inventory',
            subRecipeId: null,
            _unmatched: !match,
          };
        });

        // Auto-create missing inventory items
        for (const newItem of unmatchedToCreate) {
          try {
            const created = await apiClient.createInventoryItem(currentRestaurant.id, {
              name: newItem.name, unit: newItem.unit, category: newItem.category,
              currentStock: 0, minimumStock: 0, costPerUnit: 0,
            });
            const newId = created?.item?.id || created?.id;
            const idx = mappedIngredients.findIndex(m => m._unmatched && m.inventoryItemName === newItem.name);
            if (idx !== -1 && newId) {
              mappedIngredients[idx].inventoryItemId = newId;
              mappedIngredients[idx]._unmatched = false;
              menuRecipeInventoryItems.push({ id: newId, name: newItem.name, unit: newItem.unit });
            }
          } catch (e) { console.warn(`Failed to create inventory item "${newItem.name}":`, e); }
        }

        // Reload inventory items to include newly created ones
        try {
          const invResponse = await apiClient.getInventoryItems(currentRestaurant.id);
          setMenuRecipeInventoryItems(invResponse.items || invResponse || []);
        } catch (e) { /* keep existing */ }

        setMenuRecipeFormData(prev => ({
          ...prev,
          category: result.category || prev.category,
          servings: result.servings || prev.servings,
          prepTime: result.prepTime || prev.prepTime,
          cookTime: result.cookTime || prev.cookTime,
          description: result.description || prev.description,
          instructions: result.instructions?.length > 0 ? result.instructions : prev.instructions,
          ingredients: mappedIngredients.length > 0 ? mappedIngredients : prev.ingredients,
        }));
      }
    } catch (error) {
      console.error('Error generating full recipe:', error);
      setMenuRecipeError(error.message || 'Failed to generate recipe with AI');
    } finally { setMenuRecipeGenerating(false); }
  };

  // AI generate steps only
  const menuRecipeGenerateSteps = async () => {
    if (!currentRestaurant?.id || !menuRecipeFormData.name) return;
    try {
      setMenuRecipeGeneratingSteps(true);
      const ingredientList = menuRecipeFormData.ingredients
        .filter(i => i.inventoryItemId)
        .map(i => `${i.quantity} ${i.unit} ${i.inventoryItemName}`).join(', ');
      const result = await apiClient.generateRecipeSteps(currentRestaurant.id, {
        name: menuRecipeFormData.name, category: menuRecipeFormData.category,
        description: menuRecipeFormData.description, ingredients: ingredientList,
        servings: menuRecipeFormData.servings,
      });
      if (result.steps?.length > 0) {
        setMenuRecipeFormData(prev => ({ ...prev, instructions: result.steps }));
      }
    } catch (error) {
      setMenuRecipeError('Failed to generate recipe steps');
    } finally { setMenuRecipeGeneratingSteps(false); }
  };

  // Save/update recipe from menu page modal
  const menuRecipeSave = async () => {
    if (!currentRestaurant?.id || !menuRecipeItem) return;
    if (!menuRecipeFormData.name || menuRecipeFormData.ingredients.length === 0) {
      setMenuRecipeError(t('menu.recipeNameRequired')); return;
    }
    try {
      setMenuRecipeSaving(true); setMenuRecipeError(null);
      const saveData = {
        ...menuRecipeFormData,
        menuItemId: menuRecipeItem.id,
        menuItemName: menuRecipeItem.name,
        ingredients: menuRecipeFormData.ingredients.map(ing => ({
          inventoryItemId: ing.inventoryItemId || '',
          inventoryItemName: ing.inventoryItemName || '',
          quantity: parseFloat(ing.quantity) || 0,
          unit: ing.unit || '',
          type: ing.type || 'inventory',
          subRecipeId: ing.subRecipeId || null,
        })),
        instructions: menuRecipeFormData.instructions.filter(i => typeof i === 'string' && i.trim()),
        isActive: true,
      };
      // Backend upsert — replaces existing if menuItemId matches
      await apiClient.createRecipe(currentRestaurant.id, saveData);

      // Update recipe map
      setMenuItemRecipes(prev => ({ ...prev, [menuRecipeItem.id]: saveData }));
      setShowMenuRecipeModal(false);
      setSuccessMessage(t('menu.recipeSavedSuccess', { name: menuRecipeItem.name }));
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (error) {
      console.error('Error saving recipe:', error);
      setMenuRecipeError(error.message || 'Failed to save recipe');
    } finally { setMenuRecipeSaving(false); }
  };

  const handleGenerateRecipe = useCallback(async (item) => {
    if (!currentRestaurant?.id) {
      setError(t('menu.noRestaurantSelected'));
      return;
    }

    // Load inventory items for the modal
    let invItems = [];
    try {
      const invResponse = await apiClient.getInventoryItems(currentRestaurant.id);
      invItems = invResponse.items || invResponse || [];
    } catch (e) { console.warn('Could not load inventory items:', e); }
    setMenuRecipeInventoryItems(invItems);

    const existingRecipe = menuItemRecipes[item.id];
    setMenuRecipeItem(item);

    if (existingRecipe) {
      // Pre-fill form with existing recipe data
      setMenuRecipeFormData({
        name: existingRecipe.name || item.name,
        description: existingRecipe.description || '',
        category: existingRecipe.category || '',
        servings: existingRecipe.servings || 1,
        prepTime: existingRecipe.prepTime || 0,
        cookTime: existingRecipe.cookTime || 0,
        ingredients: (existingRecipe.ingredients || []).map(ing => ({
          inventoryItemId: ing.inventoryItemId || '',
          inventoryItemName: ing.inventoryItemName || '',
          quantity: ing.quantity || 0,
          unit: ing.unit || '',
          type: ing.type || 'inventory',
          subRecipeId: ing.subRecipeId || null,
        })),
        instructions: existingRecipe.instructions?.length > 0 ? existingRecipe.instructions : [''],
        notes: existingRecipe.notes || '',
      });
    } else {
      // New recipe — pre-fill name only
      setMenuRecipeFormData({
        name: item.name, description: '', category: '', servings: 1, prepTime: 0, cookTime: 0,
        ingredients: [{ inventoryItemId: '', inventoryItemName: '', quantity: 1, unit: '', type: 'inventory', subRecipeId: null }],
        instructions: [''], notes: '',
      });
    }

    setMenuRecipeError(null);
    setShowMenuRecipeModal(true);
  }, [currentRestaurant?.id, menuItemRecipes]);

  const handleItemClick = useCallback((item) => {
    setSelectedItem(item);
    setShowItemModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    console.log('Closing modal');
    setShowItemModal(false);
    setSelectedItem(null);
    // Don't trigger any loading states - just close the modal
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: categories[0]?.id || '',
      isVeg: true,
      shortCode: '',
      image: '',
      images: [],
      tempImages: [],
      isAvailable: true,
      stockQuantity: null,
      isStockManaged: false,
      lowStockThreshold: 5,
      stockUnit: 'pcs',
      soldByWeight: false,
      priceUnit: 'per_kg',
      pluCode: '',
      variants: [],
      customizations: [],
      generateRecipe: true,
      spiritCategory: '',
      ingredients: '',
      abv: '',
      servingUnit: '',
      bottleSize: '',
      unit: '',
      weight: '',
      shelfLife: '',
      mfgDate: '',
      expiryDate: '',
      servingSize: '',
      scoopOptions: '',
      pricingRules: {},
      dineInPrice: '',
      takeawayPrice: '',
      deliveryPrice: ''
    });
    setEditingItem(null);
    setShowAddForm(false);
    setShowAdvancedOptions(false);
  };

  const getSpiceLevel = (level) => {
    switch(level) {
      case 'mild': return { icon: '🌶️', color: '#10B981', label: t('menu.spiceMild') };
      case 'medium': return { icon: '🌶️🌶️', color: '#F59E0B', label: t('menu.spiceMedium') };
      case 'hot': return { icon: '🌶️🌶️🌶️', color: '#EF4444', label: t('menu.spiceHot') };
      default: return { icon: '🌶️', color: '#10B981', label: t('menu.spiceMild') };
    }
  };

  const getCategoryEmoji = useCallback((category) => {
    return categoryMap.get(category)?.emoji || '🍽️';
  }, [categoryMap]);

  const handleAddNewCategory = (category) => {
    setCategories(prev => [...prev, category]);
    setFormData(prev => ({ ...prev, category: category.id }));
  };

  const handleCategoryUpdated = (updatedCategory) => {
    setCategories(prev => prev.map(cat => 
      cat.id === updatedCategory.id ? updatedCategory : cat
    ));
  };

  const handleCategoryDeleted = (categoryId) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    // If the deleted category was selected, clear selection
    if (formData.category === categoryId) {
      setFormData(prev => ({ ...prev, category: '' }));
    }
  };

  const toggleCategoryCollapse = (categoryId) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Image upload handlers
  const handleImagesUploaded = async (files) => {
    if (!isOnline) { alert('You are offline. Go online to upload images.'); return; }
    console.log('🖼️ Uploading images for item:', {
      editingItem: !!editingItem,
      itemId: editingItem?.id,
      itemName: editingItem?.name || formData.name,
      hasId: !!editingItem?.id,
      idType: typeof editingItem?.id
    });

    setUploadingImages(true);
    try {
      // For new items (not yet saved), we'll store the files temporarily
      // and upload them when the menu item is saved
      if (!editingItem) {
        // Store files in form data for later upload
        const tempImages = files.map(file => ({
          file: file,
          name: file.name,
          size: file.size,
          type: file.type,
          tempId: Date.now() + Math.random() // Temporary ID
        }));
        
        setFormData(prev => ({
          ...prev,
          tempImages: [...(prev.tempImages || []), ...tempImages]
        }));
        
        console.log('✅ Files stored temporarily for later upload:', tempImages.length);
        return;
      }

      // For existing items, use the existing API
      const response = await apiClient.uploadMenuItemImages(editingItem.id, files, currentRestaurant?.id);
      
      if (response.success) {
        // Update form data with new images
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...response.images]
        }));
        
        // Update menu items list
        const newImages = [...(editingItem.images || []), ...response.images];
        setMenuItems(items => items.map(item =>
          item.id === editingItem.id
            ? { ...item, images: newImages }
            : item
        ));

        // Update dashboard cache so images persist on refresh
        updateMenuItemInAllCaches(currentRestaurant?.id, editingItem.id, { images: newImages }).catch(() => {});
      }
    } catch (error) {
      console.error('❌ Error uploading images:', error);
      alert(t('menu.failedUploadImages', { error: error.message || error }));
    } finally {
      setUploadingImages(false);
    }
  };

  const handleImageDeleted = async (imageIndex) => {
    try {
      // Check if it's a temporary image
      const existingImagesCount = (formData.images || []).length;
      
      if (imageIndex >= existingImagesCount) {
        // It's a temporary image
        const tempIndex = imageIndex - existingImagesCount;
        setFormData(prev => ({
          ...prev,
          tempImages: prev.tempImages.filter((_, index) => index !== tempIndex)
        }));
        return;
      }

      // For new items (not yet saved), just remove from form data
      if (!editingItem) {
        setFormData(prev => ({
          ...prev,
          images: prev.images.filter((_, index) => index !== imageIndex)
        }));
        return;
      }

      // For existing items, call the API to delete
      const response = await apiClient.deleteMenuItemImage(editingItem.id, imageIndex, currentRestaurant?.id);
      
      if (response.success) {
        // Update form data
        setFormData(prev => ({
          ...prev,
          images: prev.images.filter((_, index) => index !== imageIndex)
        }));
        
        // Update menu items list
        const remainingImages = (editingItem.images || []).filter((_, index) => index !== imageIndex);
        setMenuItems(items => items.map(item =>
          item.id === editingItem.id
            ? { ...item, images: remainingImages }
            : item
        ));

        // Update dashboard cache so deletion persists on refresh
        updateMenuItemInAllCaches(currentRestaurant?.id, editingItem.id, { images: remainingImages }).catch(() => {});
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert(t('menu.failedDeleteImage'));
    }
  };


  const handleMenuItemsAdded = async () => {
    // Reload menu data when new items are added (including categories)
    if (currentRestaurant) {
      await loadMenuData(currentRestaurant.id, false); // Force fresh fetch to get new categories
      // Clear hasDefaultMenu so the "Sample Menu" banner hides immediately
      setCurrentRestaurant(prev => prev ? { ...prev, hasDefaultMenu: false } : prev);
    }
  };

  // Photo capture handlers
  const handleCameraCapture = () => {
    console.log('📷 Camera capture clicked - opening photo capture modal');
    setPhotoError(''); // Clear any previous errors
    setPhotoSuccess(false);
    setShowPhotoCapture(true);
  };

  const handleTakePhoto = () => {
    console.log('📷 Take photo clicked - opening camera/gallery directly');
    setPhotoError(''); // Clear any previous errors
    cameraInputRef.current?.click();
  };

  const handlePhotoUpload = async (event) => {
    if (!isOnline) { alert('You are offline. Go online to upload.'); return; }
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

        const maxFileSize = 300 * 1024 * 1024; // 300MB max
        const supportedTypes = [
          'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff',
          'application/pdf',
          'text/csv', 'application/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain',
          'application/octet-stream' // For live photos and unknown types
        ];
        
        let errors = [];
        let validFiles = [];
        
        files.forEach((file) => {
          // More lenient validation - accept any file type but warn about unsupported ones
          const isSupportedType = supportedTypes.some(type => 
            file.type.includes(type.split('/')[1]) || 
            file.type === type ||
            file.type.startsWith('image/') || // Accept any image type
            file.type.includes('pdf') || // Accept any PDF variant
            file.type.includes('csv') || // Accept any CSV variant
            file.type.includes('excel') || // Accept any Excel variant
            file.type.includes('document') || // Accept any document variant
            file.type.includes('text') // Accept any text variant
          );
          
          if (!isSupportedType) {
            console.log(`⚠️ Unsupported file type: ${file.type} for ${file.name}, but will attempt extraction anyway`);
            // Don't reject the file, just log a warning
          }
          
          if (file.size > maxFileSize) {
            errors.push(t('menu.fileTooLarge', { fileName: file.name, size: Math.round(file.size / (1024 * 1024)) }));
            return;
          }
          
          if (file.size === 0) {
            errors.push(t('menu.emptyFile', { fileName: file.name }));
            return;
          }
          
          validFiles.push(file);
        });
    
    if (errors.length > 0) {
      setPhotoError(errors.join(' '));
      return;
    }

    if (validFiles.length === 0) return;

    try {
      setPhotoUploading(true);
      setPhotoError('');
      setPhotoSuccess(false);

      console.log('📸 Uploading photo files:', validFiles.length);

      const formData = new FormData();
      validFiles.forEach((file, index) => {
        formData.append('menuFiles', file);
      });

      const response = await apiClient.bulkUploadMenu(currentRestaurant.id, formData);
      
      if (response.success) {
        console.log('✅ Photo upload successful:', response);
        
        // Process extraction results
        if (response.data && response.data.length > 0) {
          const allMenuItems = response.data.flatMap(menu => menu.menuItems);
          const extractionResults = response.data;
          
          // Check extraction status for each file
          const noMenuDataFiles = extractionResults.filter(result => result.extractionStatus === 'no_menu_data');
          const failedFiles = extractionResults.filter(result => result.extractionStatus === 'failed');
          const successfulFiles = extractionResults.filter(result => result.extractionStatus === 'success');
          
          if (allMenuItems.length > 0) {
            const toId = (s) => (s && String(s).trim()) ? String(s).trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'other' : 'other';
            const normalized = allMenuItems.map(it => ({ ...it, category: toId(it.category) }));
            setMenuItems(prev => [...prev, ...normalized]);
            
            // Save extracted categories to backend immediately so they persist
            const fromExtraction = response.extractedCategories || [];
            if (fromExtraction.length > 0 && currentRestaurant?.id) {
              try {
                // Save each new category to backend
                const existingIds = new Set(categories.map(c => (c.id || '').toLowerCase()));
                for (const c of fromExtraction) {
                  const name = (c && c.name) ? String(c.name).trim() : '';
                  if (!name) continue;
                  const id = toId(name);
                  if (id && id !== 'other' && !existingIds.has(id)) {
                    try {
                      await apiClient.createCategory(currentRestaurant.id, { name, emoji: '🍽️', description: '' });
                      existingIds.add(id); // Track so we don't try to create duplicate
                      console.log('✅ Saved new category to backend:', id, name);
                    } catch (catError) {
                      // Category might already exist, ignore error
                      console.log('Category might already exist:', id, catError.message);
                    }
                  }
                }
                // Refresh categories from backend to get the saved ones
                const categoriesResponse = await apiClient.getCategories(currentRestaurant.id);
                if (categoriesResponse.categories) {
                  setCategories(categoriesResponse.categories);
                }
              } catch (error) {
                console.error('Error saving categories to backend:', error);
                // Still merge to local state so UI works
                setCategories(prev => {
                  const seen = new Set(prev.map(c => (c.id || '').toLowerCase()));
                  const next = [...prev];
                  for (const c of fromExtraction) {
                    const name = (c && c.name) ? String(c.name).trim() : '';
                    if (!name) continue;
                    const id = toId(name);
                    if (id && id !== 'other' && !seen.has(id)) { seen.add(id); next.push({ id, name, emoji: '🍽️' }); }
                  }
                  return next;
                });
              }
            }
            console.log('📋 Menu items added from photo:', allMenuItems.length);
            
            // Create detailed success message
            let successMessage = `✅ ${allMenuItems.length} menu items extracted successfully!`;
            
            if (successfulFiles.length > 0) {
              successMessage += `\n📄 Files processed: ${successfulFiles.map(f => f.file).join(', ')}`;
            }
            
            if (noMenuDataFiles.length > 0) {
              successMessage += `\n⚠️ No menu data found in: ${noMenuDataFiles.map(f => f.file).join(', ')}`;
            }
            
            if (failedFiles.length > 0) {
              successMessage += `\n❌ Failed to process: ${failedFiles.map(f => f.file).join(', ')}`;
            }
            
            setPhotoSuccess(true);
            console.log('📋 Success message:', successMessage);
          } else {
            // No menu items found
            let errorMessage = t('menu.noMenuDataFound');

            if (noMenuDataFiles.length > 0) {
              errorMessage += `${t('menu.filesNoMenuData')}${noMenuDataFiles.map(f => `• ${f.file}: ${f.message}`).join('\n')}\n\n`;
            }

            if (failedFiles.length > 0) {
              errorMessage += `${t('menu.filesFailedProcess')}${failedFiles.map(f => `• ${f.file}: ${f.message}`).join('\n')}\n\n`;
            }

            errorMessage += t('menu.uploadSuggestions');
            
            setPhotoError(errorMessage);
            return;
          }
        } else {
          setPhotoError(t('menu.noFilesProcessed'));
          return;
        }
        
        // Reset camera input
        if (cameraInputRef.current) {
          cameraInputRef.current.value = '';
        }
        
        // Auto-close after success
        setTimeout(() => {
          setShowPhotoCapture(false);
          setPhotoSuccess(false);
        }, 3000); // Longer timeout to read the detailed message
      } else {
        setPhotoError(response.error || t('menu.photoUploadFailed'));
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      setPhotoError(error.message || t('menu.photoUploadFailed'));
    } finally {
      setPhotoUploading(false);
    }
  };

  // Don't show loading spinner - just show data if available
  // Only show empty state if we have no data AND we're not loading

  return (
    <div 
      className={`page-transition ${isLoading ? 'loading' : ''}`}
      style={{ 
      minHeight: '100vh', 
      backgroundColor: '#ffffff',
      position: 'relative',
      overflow: 'auto'
    }}>
      {/* Top Operation Loader */}
      {operationLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10002,
          background: 'linear-gradient(90deg, #ef4444, #dc2626)',
          height: '3px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            animation: 'shimmer 1.5s infinite'
          }}></div>
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
      <div style={{
        width: '100%',
        padding: isMobileEmbed ? '8px' : '14px',
        position: 'relative',
        paddingBottom: '40px'
      }}>
        {/* Header - Sticky */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: '#ffffff',
          marginLeft: isMobileEmbed ? '-8px' : '-14px',
          marginRight: isMobileEmbed ? '-8px' : '-14px',
          padding: isMobileEmbed ? '8px 8px 0 8px' : '12px 14px 0 14px',
          marginBottom: isMobileEmbed ? '8px' : '14px'
        }}>
          {/* Title row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobileEmbed ? '6px' : '10px', paddingLeft: isMobile && !isMobileEmbed ? '48px' : '0' }}>
            <div>
              <h1 style={{ fontSize: isMobileEmbed ? '15px' : '18px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                {t('menu.title')}
              </h1>
              <p style={{ fontSize: isMobileEmbed ? '10px' : '11px', color: '#9ca3af', margin: '2px 0 0 0' }}>
                {filteredItems.length} {t('common.items')}
                {currentRestaurant?.name ? ` · ${currentRestaurant.name}` : ''}
              </p>
            </div>
            {/* Primary CTA */}
            {canAddMenuItem && (
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                padding: isMobileEmbed ? '6px 10px' : '8px 14px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                border: 'none',
                borderRadius: isMobileEmbed ? '8px' : '10px',
                fontWeight: '600',
                fontSize: isMobileEmbed ? '11px' : '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: isMobileEmbed ? '4px' : '6px',
                boxShadow: '0 4px 14px rgba(239,68,68,0.3)',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(239,68,68,0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(239,68,68,0.3)'; }}
            >
              <FaPlus size={isMobileEmbed ? 9 : 11} /> {btype.add}
            </button>
            )}
          </div>

          {/* Action pills row */}
          <div style={{ display: 'flex', gap: isMobileEmbed ? '6px' : '10px', flexWrap: 'wrap', marginBottom: isMobileEmbed ? '8px' : '16px' }}>
            {[
              { icon: <FaCloudUploadAlt size={isMobileEmbed ? 11 : 16} />, label: t('menu.upload'), onClick: () => setShowBulkUpload(true), bg: '#fef2f2', color: '#dc2626', hoverBg: '#fee2e2', border: '#fecaca' },
              { icon: <FaCamera size={isMobileEmbed ? 11 : 16} />, label: t('menu.photo'), onClick: handleCameraCapture, bg: '#fffbeb', color: '#d97706', hoverBg: '#fef3c7', border: '#fde68a' },
              { icon: <FaQrcode size={isMobileEmbed ? 11 : 16} />, label: t('menu.qrCode'), onClick: () => setShowQRCodeModal(true), bg: '#ecfdf5', color: '#059669', hoverBg: '#d1fae5', border: '#a7f3d0' },
              { icon: <FaEye size={isMobileEmbed ? 11 : 16} />, label: t('menu.customize'), onClick: () => { const rid = currentRestaurant?.id || localStorage.getItem('restaurantId'); const p = `/menu/customize${rid ? `?restaurant=${rid}` : ''}`; router.push(isMobileEmbed ? `/mobile${p}` : p); }, bg: '#eff6ff', color: '#2563eb', hoverBg: '#dbeafe', border: '#bfdbfe' },
              ...(isOwnerOrAdmin ? [{ icon: <FaImage size={isMobileEmbed ? 11 : 16} />, label: globalHideImages ? 'Show Images' : 'Hide Images', onClick: async () => { const newVal = !globalHideImages; try { await apiClient.updateRestaurant(currentRestaurant.id, { posSettings: { hideMenuImages: newVal } }); setCurrentRestaurant(prev => ({ ...prev, posSettings: { ...prev?.posSettings, hideMenuImages: newVal } })); } catch (e) { console.error('Failed to toggle images:', e); } }, bg: globalHideImages ? '#fef2f2' : '#f0fdf4', color: globalHideImages ? '#dc2626' : '#059669', hoverBg: globalHideImages ? '#fee2e2' : '#dcfce7', border: globalHideImages ? '#fecaca' : '#a7f3d0' }] : []),
            ].map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                style={{
                  padding: isMobileEmbed ? '5px 10px' : '10px 18px',
                  backgroundColor: action.bg,
                  color: action.color,
                  border: `1px solid ${action.border}`,
                  borderRadius: isMobileEmbed ? '8px' : '10px',
                  fontWeight: isMobileEmbed ? '600' : '700',
                  fontSize: isMobileEmbed ? '11px' : '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobileEmbed ? '4px' : '7px',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = action.hoverBg; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = action.bg; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {action.icon} {action.label}
              </button>
            ))}
            {menuItems.filter(item => item.status !== 'deleted').length > 0 && (
              <button
                onClick={handleBulkDeleteClick}
                disabled={operationLoading}
                style={{
                  padding: isMobileEmbed ? '4px 8px' : '6px 12px',
                  backgroundColor: '#fef2f2',
                  color: '#ef4444',
                  border: 'none',
                  borderRadius: isMobileEmbed ? '6px' : '8px',
                  fontWeight: '600',
                  fontSize: isMobileEmbed ? '10px' : '12px',
                  cursor: operationLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobileEmbed ? '3px' : '5px',
                  transition: 'all 0.2s',
                  opacity: operationLoading ? 0.5 : 1,
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => { if (!operationLoading) { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <FaTrash size={isMobileEmbed ? 9 : 11} /> {t('menu.deleteAll')}
              </button>
            )}
          </div>

        {/* Search + Filters */}
        <div style={{
          display: 'flex',
          gap: isMobileEmbed ? '6px' : '10px',
          alignItems: 'center',
          paddingBottom: isMobileEmbed ? '8px' : '16px',
          borderBottom: '1px solid #f3f4f6',
          flexWrap: 'wrap'
        }}>
          {/* Search */}
          <div style={{
            position: 'relative',
            width: isMobileEmbed ? '100%' : '260px',
            flexShrink: 0
          }}>
            <FaSearch style={{
              position: 'absolute',
              left: isMobileEmbed ? '10px' : '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#ef4444',
              fontSize: isMobileEmbed ? '11px' : '13px'
            }} />
            <input
              type="text"
              placeholder={t('menu.searchPlaceholder')}
              value={displaySearch}
              onChange={(e) => {
                const val = e.target.value;
                setDisplaySearch(val);
                clearTimeout(searchDebounceRef.current);
                searchDebounceRef.current = setTimeout(() => setSearchTerm(val), 300);
              }}
              style={{
                width: '100%',
                padding: isMobileEmbed ? '7px 10px 7px 28px' : '9px 14px 9px 36px',
                border: '1.5px solid #e5e7eb',
                borderRadius: isMobileEmbed ? '8px' : '10px',
                fontSize: isMobileEmbed ? '11px' : '13px',
                backgroundColor: '#fff',
                transition: 'all 0.2s ease',
                outline: 'none',
                color: '#1f2937',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#ef4444';
                e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
              }}
            />
          </div>

          {/* Filters */}
          <CustomDropdown
            value={selectedVegFilter}
            onChange={setSelectedVegFilter}
            options={[
              { value: 'all', label: t('menu.allTypes') },
              { value: 'veg', label: t('menu.veg') },
              { value: 'non-veg', label: t('menu.nonVeg') }
            ]}
            placeholder={t('menu.allTypes')}
          />

          <CustomDropdown
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={[
              { value: 'all', label: t('menu.allCategories') },
              ...categories.map(category => ({
                value: category.id,
                label: category.name
              }))
            ]}
            placeholder={t('menu.allCategories')}
          />

          {hasWeightItems && (
            <CustomDropdown
              value={selectedWeightFilter}
              onChange={setSelectedWeightFilter}
              options={[
                { value: 'all', label: 'All Items' },
                { value: 'weight', label: 'Sold by Weight' }
              ]}
              placeholder="All Items"
            />
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* View Toggle */}
          <div style={{
            display: 'flex',
            backgroundColor: '#f3f4f6',
            borderRadius: '20px',
            padding: '3px',
            flexShrink: 0
          }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px 8px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: viewMode === 'grid' ? '#ef4444' : 'transparent',
                color: viewMode === 'grid' ? 'white' : '#9ca3af',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <FaTh size={12} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '6px 8px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: viewMode === 'list' ? '#ef4444' : 'transparent',
                color: viewMode === 'list' ? 'white' : '#9ca3af',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <FaList size={12} />
            </button>
          </div>
        </div>
        </div>{/* END Sticky Header */}

        {/* Offline Banner */}
        <OfflineBanner />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <FaExclamationTriangle size={16} />
            {error}
          </div>
        )}

        {/* Success Toast */}
        {successMessage && (
          <div style={{
            position: 'fixed', top: '24px', right: '24px', zIndex: 10002,
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 20px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white', fontSize: '14px', fontWeight: 600,
            boxShadow: '0 8px 30px rgba(16,185,129,0.3)',
            animation: 'slideInRight 0.3s ease-out'
          }}>
            <FaCheckCircle size={16} />
            {successMessage}
          </div>
        )}

        {/* Menu Items Grid */}

        {/* Loading State */}
        {(loading || !hasInitialData || operationLoading) && menuItems.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 20px',
            background: 'linear-gradient(135deg, rgb(255 246 241) 0%, rgb(254 245 242) 50%, rgb(255 244 243) 100%)',
            borderRadius: '24px',
            border: '1px solid rgba(239, 68, 68, 0.1)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#fef2f2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <FaSpinner size={32} style={{ color: '#ef4444', animation: 'spin 1s linear infinite' }} />
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#374151',
              marginBottom: '8px'
            }}>
              {t('menu.loadingMenu')}
            </h3>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              {t('menu.loadingMenuDesc')}
            </p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div style={{ position: 'relative' }}>
            {/* Demo Menu Banner */}
            {currentRestaurant?.hasDefaultMenu && (
              <div style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
                borderRadius: '16px',
                padding: '24px 28px',
                marginBottom: '24px',
                border: '1px solid #f59e0b',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                flexWrap: 'wrap',
              }}>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '24px' }}>🍽️</span>
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#92400e' }}>
                      {t('menu.sampleMenu')}
                    </h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#78350f', lineHeight: '1.5' }}>
                    {t('menu.sampleMenuDesc')}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                  <button
                    onClick={() => setShowBulkUpload(true)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#f59e0b',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
                  >
                    <FaCloudUploadAlt size={14} />
                    {t('menu.uploadMenuAI')}
                  </button>
                  {canAddMenuItem && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#fff',
                      color: '#92400e',
                      border: '2px solid #f59e0b',
                      borderRadius: '10px',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#fffbeb'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#fff'}
                  >
                    <FaPlus size={12} />
                    {t('menu.addManually')}
                  </button>
                  )}
                </div>
              </div>
            )}
            {/* Operation Loading Overlay */}
            {operationLoading && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                borderRadius: '16px'
              }}>
                <FaSpinner size={40} style={{ color: '#ef4444', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
                <p style={{ color: '#374151', fontWeight: '600', fontSize: '16px' }}>{t('menu.processing')}</p>
              </div>
            )}
            {viewMode === 'grid' ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: isMobile ? '10px' : '24px',
              padding: '0'
            }}>
              {filteredItems.map((item) => (
                  <MenuItemCard
                  key={item.id}
                  item={item}
                  categoryMap={categoryMap}
                  onEdit={canEditMenuItem ? handleEdit : undefined}
                  onDelete={canDeleteMenuItem ? handleDelete : undefined}
                  onToggleAvailability={canMarkOutOfStock ? handleToggleAvailability : undefined}
                  onToggleFavorite={handleToggleFavorite}
                  onGenerateRecipe={canAddMenuItem ? handleGenerateRecipe : undefined}
                  generatingRecipeFor={generatingRecipeFor}
                  hasRecipe={!!menuItemRecipes[item.id]}
                  getCategoryEmoji={getCategoryEmoji}
                  onItemClick={handleItemClick}
                  multiPricingEnabled={multiPricingEnabled}
                  activePricingRules={activePricingRules}
                  formatCurrency={formatCurrency}
                  taxInclusiveGlobal={currentRestaurant?.taxSettings?.taxInclusivePricing}
                  compact={isMobile}
                  scaleBarcodeFlag={currentRestaurant?.posSettings?.scaleBarcodeFlag}
                  scalePluDigits={currentRestaurant?.posSettings?.scalePluDigits}
                  globalHideImages={globalHideImages}
                  onToggleHideImage={isOwnerOrAdmin ? handleToggleHideImage : undefined}
                />
              ))}
            </div>
          ) : (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              {/* Table Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 120px 100px 140px',
                padding: '10px 20px',
                backgroundColor: '#f8fafc',
                borderBottom: '2px solid #e5e7eb',
                gap: '12px',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('menu.hashCol')}</span>
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('menu.itemCol')}</span>
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('menu.categoryCol')}</span>
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>{t('menu.priceCol')}</span>
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{t('menu.actionsCol')}</span>
              </div>
              {/* Table Rows */}
              {filteredItems.map((item, index) => {
                const category = categoryMap.get(item.category);
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 1fr 120px 100px 140px',
                      padding: '12px 20px',
                      gap: '12px',
                      alignItems: 'center',
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: !item.isAvailable ? '#fafafa' : (index % 2 === 0 ? '#ffffff' : '#fcfcfd'),
                      opacity: item.isAvailable ? 1 : 0.55,
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                    onClick={() => handleItemClick(item)}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = !item.isAvailable ? '#fafafa' : (index % 2 === 0 ? '#ffffff' : '#fcfcfd'); }}
                  >
                    {/* # */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '3px',
                          border: `2px solid ${item.isVeg ? '#22c55e' : '#ef4444'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <div style={{
                            width: '6px',
                            height: '6px',
                            backgroundColor: item.isVeg ? '#22c55e' : '#ef4444',
                            borderRadius: item.isVeg ? '1px' : '50%'
                          }} />
                        </div>
                      <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>{index + 1}</span>
                    </div>
                    {/* Item Name */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#1e293b',
                          textDecoration: item.isAvailable ? 'none' : 'line-through',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.name}
                        </span>
                        {item.shortCode && (
                          <span style={{
                            backgroundColor: '#f1f5f9',
                            color: '#64748b',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '600',
                            flexShrink: 0
                          }}>
                            {item.shortCode}
                          </span>
                        )}
                        {!item.isAvailable && (
                          <span style={{
                            backgroundColor: '#fef2f2',
                            color: '#ef4444',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '700',
                            flexShrink: 0
                          }}>
                            {t('menu.out')}
                          </span>
                        )}
                        {item.isFavorite && (
                          <FaStar size={10} style={{ color: '#f59e0b', flexShrink: 0 }} />
                        )}
                        {(item.taxInclusive === true || (currentRestaurant?.taxSettings?.taxInclusivePricing && item.taxInclusive !== false)) && (
                          <span style={{
                            backgroundColor: '#dbeafe',
                            color: '#1e40af',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            fontSize: '9px',
                            fontWeight: '600',
                            flexShrink: 0
                          }}>
                            GST incl.
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Category */}
                    <span style={{
                      fontSize: '12px',
                      color: '#64748b',
                      fontWeight: '500',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {category?.emoji ? `${category.emoji} ` : ''}{category?.name || '—'}
                    </span>
                    {/* Price */}
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        color: '#0f172a',
                        fontVariantNumeric: 'tabular-nums'
                      }}>
                        {formatCurrency(item.price)}
                      </span>
                      {multiPricingEnabled && activePricingRules?.length > 0 && item.pricingRules && Object.keys(item.pricingRules).length > 0 && (() => {
                        const DN = ['dine-in', 'dine in', 'dinein'];
                        const TN = ['takeaway', 'take away', 'take-away'];
                        const DL = ['delivery'];
                        const chips = activePricingRules
                          .filter(rule => { const n = (rule.name || '').toLowerCase().trim(); return DN.includes(n) || TN.includes(n) || DL.includes(n); })
                          .filter(rule => typeof item.pricingRules[rule.id] === 'number')
                          .map(rule => { const n = (rule.name || '').toLowerCase().trim(); return { icon: DN.includes(n) ? '🍽️' : TN.includes(n) ? '🥡' : '🛵', price: item.pricingRules[rule.id], id: rule.id }; });
                        if (chips.length === 0) return null;
                        return (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '2px', justifyContent: 'flex-end' }}>
                            {chips.map(c => (
                              <span key={c.id} style={{ fontSize: '9px', fontWeight: '600', padding: '1px 4px', borderRadius: '3px', backgroundColor: '#f0fdf4', color: '#166534' }}>
                                {c.icon} {formatCurrency(c.price)}
                              </span>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                    {/* Actions */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      justifyContent: 'center'
                    }}>
                      {[
                        { icon: <FaStar size={11} />, color: item.isFavorite ? '#f59e0b' : '#cbd5e1', hoverColor: '#f59e0b', title: t('menu.favorite'), handler: (e) => { e.stopPropagation(); handleToggleFavorite(item); } },
                        canEditMenuItem && { icon: <FaEdit size={11} />, color: '#94a3b8', hoverColor: '#3b82f6', title: t('menu.edit'), handler: (e) => { e.stopPropagation(); handleEdit(item); } },
                        canAddMenuItem && { icon: generatingRecipeFor === item.id ? <FaSpinner size={11} style={{ animation: 'spin 1s linear infinite' }} /> : menuItemRecipes[item.id] ? <FaCheckCircle size={11} /> : <FaFlask size={11} />, color: menuItemRecipes[item.id] ? '#059669' : '#94a3b8', hoverColor: '#059669', title: generatingRecipeFor === item.id ? t('menu.generating') : menuItemRecipes[item.id] ? t('menu.recipeLinkedAction') : t('menu.generateRecipe'), handler: (e) => { e.stopPropagation(); if (!menuItemRecipes[item.id]) handleGenerateRecipe(item); } },
                        canMarkOutOfStock && { icon: <FaMinus size={11} />, color: '#94a3b8', hoverColor: '#f59e0b', title: item.isAvailable ? t('menu.markUnavailable') : t('menu.markAvailable'), handler: (e) => { e.stopPropagation(); handleToggleAvailability(item); } },
                        canDeleteMenuItem && { icon: <FaTrash size={11} />, color: '#94a3b8', hoverColor: '#ef4444', title: t('menu.delete'), handler: (e) => { e.stopPropagation(); handleDelete(item.id); } },
                      ].filter(Boolean).map((action, i) => (
                        <button
                          key={i}
                          onClick={action.handler}
                          title={action.title}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '6px',
                            color: action.color,
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = action.hoverColor; e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = action.color; e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          {action.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              {/* Footer */}
              <div style={{
                padding: '10px 20px',
                backgroundColor: '#f8fafc',
                borderTop: '1px solid #e5e7eb',
                fontSize: '12px',
                color: '#94a3b8',
                fontWeight: '500'
              }}>
                {filteredItems.length} {filteredItems.length === 1 ? t('menu.itemSingular') : t('menu.itemPlural')}
              </div>
            </div>
          )}
          </div>
        ) : (menuItems.length > 0 && filteredItems.length === 0) ? (
          // No items match the filter, but we have menu items - don't show empty state
          null
        ) : (hasInitialData && !loading && !operationLoading && menuItems.length === 0) ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'linear-gradient(135deg, rgb(255 246 241) 0%, rgb(254 245 242) 50%, rgb(255 244 243) 100%)',
            borderRadius: '24px',
            border: '1px solid rgba(239, 68, 68, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background Pattern */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                radial-gradient(circle at 20% 80%, ${btype.accent}11 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, ${btype.accent}11 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, ${btype.accent}08 0%, transparent 70%)
              `,
              zIndex: 0
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              {(searchTerm || selectedCategory !== 'all') ? (
                <>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px auto'
                  }}>
                    <span style={{ fontSize: '32px' }}>🔍</span>
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>
                    {t('menu.noDishesFound')}
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '15px' }}>
                    {t('menu.trySearchingElse')}
                  </p>
                  <button
                    onClick={() => { setSearchTerm(''); setDisplaySearch(''); setSelectedCategory('all'); }}
                    style={{
                      padding: '12px 28px',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '15px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                    }}
                  >
                    {t('menu.clearSearch')}
                  </button>
                </>
              ) : (
                <>
                  {/* Icon */}
                  <div style={{
                    width: '90px',
                    height: '90px',
                    background: btype.gradient,
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 28px auto',
                    boxShadow: `0 8px 24px ${btype.accent}33`,
                    animation: 'bounce 2s infinite'
                  }}>
                    <span style={{ fontSize: '40px', filter: 'brightness(1.1)' }}>{btype.icon}</span>
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: '30px',
                    fontWeight: '800',
                    marginBottom: '12px',
                    background: btype.gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    {btype.empty}
                  </h3>

                  <p style={{
                    color: '#6b7280',
                    marginBottom: '36px',
                    maxWidth: '460px',
                    margin: '0 auto 36px auto',
                    fontSize: '16px',
                    lineHeight: '1.6'
                  }}>
                    {btype.emptyDesc}
                  </p>

                  {/* Two option cards */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '16px',
                    maxWidth: '560px',
                    margin: '0 auto 24px auto'
                  }}>
                    {/* Upload Card */}
                    <div
                      onClick={() => setShowBulkUpload(true)}
                      style={{
                        padding: '24px 20px',
                        background: 'white',
                        borderRadius: '16px',
                        border: `2px solid ${btype.accent}22`,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = btype.accent;
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = `0 12px 28px ${btype.accent}20`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = `${btype.accent}22`;
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                      }}
                    >
                      <div style={{
                        width: '52px',
                        height: '52px',
                        background: btype.gradient,
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 14px auto'
                      }}>
                        <FaCloudUploadAlt size={20} style={{ color: 'white' }} />
                      </div>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', marginBottom: '6px' }}>
                        {t('menu.uploadMenu')}
                      </h4>
                      <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.4', margin: 0 }}>
                        {t('menu.uploadMenuDesc')}
                      </p>
                    </div>

                    {/* Manual Add Card */}
                    {canAddMenuItem && <div
                      onClick={() => setShowAddForm(true)}
                      style={{
                        padding: '24px 20px',
                        background: 'white',
                        borderRadius: '16px',
                        border: '2px solid #e5e7eb',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = btype.accent;
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = `0 12px 28px ${btype.accent}20`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                      }}
                    >
                      <div style={{
                        width: '52px',
                        height: '52px',
                        background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 14px auto'
                      }}>
                        <FaPlus size={20} style={{ color: 'white' }} />
                      </div>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', marginBottom: '6px' }}>
                        {btype.add}
                      </h4>
                      <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.4', margin: 0 }}>
                        {t('menu.addItemsDesc')}
                      </p>
                    </div>}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>


      {/* Add/Edit Form Modal */}
      {showAddForm && typeof document !== 'undefined' && createPortal(
        <div
          ref={(el) => { if (el && !el._scrollInit) { el.scrollTop = 0; el._scrollInit = true; } }}
          style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          zIndex: 10002,
          padding: window.innerWidth <= 768 ? '0' : '20px',
          paddingBottom: isMobileEmbed ? '60px' : undefined,
          overflowY: 'auto'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: window.innerWidth <= 768 ? '0' : '12px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            width: '100%',
            maxWidth: window.innerWidth <= 768 ? '100%' : '820px',
            minHeight: window.innerWidth <= 768 ? (isMobileEmbed ? 'auto' : '100vh') : 'auto',
            marginTop: window.innerWidth <= 768 ? '0' : '20px',
            marginBottom: window.innerWidth <= 768 ? '0' : '20px'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: window.innerWidth <= 768 ? '14px 16px' : '16px 24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              borderRadius: window.innerWidth <= 768 ? '0' : '12px 12px 0 0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    fontSize: '28px',
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    borderRadius: '12px'
                  }}>
                    {btype.icon}
                  </span>
                  <div>
                    <h2 style={{
                      fontSize: '17px',
                      fontWeight: '700',
                      color: 'white',
                      margin: 0
                    }}>
                      {editingItem ? t('menu.editItemTitle', { item: btype.item }) : btype.add}
                    </h2>
                    <span style={{
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.8)',
                      fontWeight: '500'
                    }}>
                      {btype.label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    fontSize: '18px',
                    color: 'white',
                    cursor: 'pointer',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    lineHeight: 1
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                  }}
                >
                  ×
                </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: window.innerWidth <= 768 ? '16px' : '24px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr',
                gap: '24px',
              }}>
              {/* ===== LEFT COLUMN ===== */}
              <div>
              {/* Name + Short Code row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '2fr 1fr',
                gap: '16px',
                marginBottom: '16px'
              }}>
                {/* Name */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    {t('menu.itemNameRequired', { item: btype.item })}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => { setFormData({...formData, name: e.target.value}); detectDirectTrackableItem(e.target.value); }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: 'white',
                      transition: 'border-color 0.2s ease'
                    }}
                    placeholder={t('menu.enterItemName', { item: btype.item.toLowerCase() })}
                    onFocus={(e) => e.target.style.borderColor = btype.accent}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
                
                {/* Short Code */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    {t('menu.shortCodeLabel')}
                  </label>
                  <input
                    type="text"
                    value={formData.shortCode}
                    onChange={(e) => setFormData({...formData, shortCode: e.target.value.toUpperCase()})}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: 'white',
                      transition: 'border-color 0.2s ease'
                    }}
                    placeholder={t('menu.shortCodePlaceholder')}
                    onFocus={(e) => e.target.style.borderColor = btype.accent}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>
              
              {/* Description */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t('menu.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'white',
                    resize: 'vertical',
                    minHeight: '80px',
                    transition: 'border-color 0.2s ease'
                  }}
                  rows="3"
                  placeholder={t('menu.describeItem', { item: btype.item.toLowerCase() })}
                  onFocus={(e) => e.target.style.borderColor = btype.accent}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              
              {/* Price and Category - Mobile-friendly */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 2fr', 
                gap: '16px', 
                marginBottom: '16px' 
              }}>
                {/* Price */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    {t('menu.priceLabel', { currency: getCurrencySymbol() })}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: 'white',
                      transition: 'border-color 0.2s ease'
                    }}
                    placeholder={t('menu.enterPrice')}
                    onFocus={(e) => e.target.style.borderColor = btype.accent}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                {/* Tax Inclusive Override */}
                <div>
                  <label style={{
                    display: 'block', marginBottom: '6px', fontWeight: '600',
                    fontSize: '13px', color: '#374151'
                  }}>
                    Tax Pricing
                  </label>
                  <select
                    value={formData.taxInclusive === null || formData.taxInclusive === undefined ? 'default' : formData.taxInclusive ? 'inclusive' : 'exclusive'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        taxInclusive: val === 'default' ? null : val === 'inclusive'
                      }));
                    }}
                    style={{
                      width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb',
                      borderRadius: '6px', fontSize: '13px', outline: 'none',
                      backgroundColor: 'white', color: '#374151'
                    }}
                  >
                    <option value="default">Follow restaurant setting</option>
                    <option value="inclusive">Price includes tax</option>
                    <option value="exclusive">Add tax on top</option>
                  </select>
                </div>

                {/* Channel & Zone Prices — Tree Layout */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
                    {t('menu.channelPricesOptional')} <span style={{ fontWeight: '400', color: '#9ca3af', fontSize: '12px' }}>{t('menu.optional')}</span>
                  </label>

                  {/* Dine-In */}
                  {(() => {
                    const hasDineIn = formData.dineInPrice !== '' && formData.dineInPrice !== undefined;
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px', width: '22px', textAlign: 'center' }}>🍽️</span>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#334155', width: '70px' }}>{t('menu.dineIn')}</span>
                        <input
                          type="number"
                          placeholder={formData.price ? `${getCurrencySymbol()}${formData.price}` : `${getCurrencySymbol()}0`}
                          value={formData.dineInPrice}
                          onChange={(e) => setFormData(prev => ({ ...prev, dineInPrice: e.target.value }))}
                          min="0" step="0.01"
                          style={{
                            flex: 1, maxWidth: '140px', padding: '7px 10px', borderRadius: '6px',
                            border: hasDineIn ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                            fontSize: '13px', boxSizing: 'border-box',
                            backgroundColor: hasDineIn ? '#f0fdf4' : 'white',
                            fontWeight: hasDineIn ? '600' : '400',
                            color: hasDineIn ? '#166534' : '#374151'
                          }}
                          onFocus={(e) => { e.target.style.borderColor = '#ef4444'; e.target.style.boxShadow = '0 0 0 2px rgba(239,68,68,0.1)'; }}
                          onBlur={(e) => { e.target.style.borderColor = hasDineIn ? '#10b981' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                        />
                      </div>
                    );
                  })()}

                  {/* Zone children — indented tree under Dine-In */}
                  {multiPricingEnabled && activePricingRules.length > 0 && (() => {
                    const extraRules = activePricingRules.filter(r => {
                      const name = (r.name || '').toLowerCase().trim();
                      return r.isActive && !TAKEAWAY_NAMES.includes(name) && !DELIVERY_NAMES.includes(name) && !DINEIN_NAMES.includes(name);
                    });
                    if (extraRules.length === 0) return null;
                    const inheritedPrice = formData.dineInPrice || formData.price || '';
                    return (
                      <div style={{ marginLeft: '30px', borderLeft: '2px solid #e2e8f0', paddingLeft: '14px', marginBottom: '6px', paddingTop: '2px' }}>
                        {extraRules.map((rule, idx) => {
                          const savedPrice = formData.pricingRules[rule.id];
                          const hasCustom = savedPrice !== undefined && savedPrice !== '' && savedPrice !== null;
                          const isLast = idx === extraRules.length - 1;
                          return (
                            <div key={rule.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: isLast ? '0' : '4px', position: 'relative' }}>
                              <span style={{ position: 'absolute', left: '-15px', top: '50%', width: '12px', height: '1px', backgroundColor: '#e2e8f0' }} />
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: hasCustom ? '#10b981' : '#cbd5e1', flexShrink: 0 }} />
                              <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748b', width: '80px', flexShrink: 0 }}>{rule.name}</span>
                              <input
                                type="number"
                                placeholder={inheritedPrice ? `${getCurrencySymbol()}${inheritedPrice}` : `${getCurrencySymbol()}0`}
                                value={hasCustom ? savedPrice : ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => ({ ...prev, pricingRules: { ...prev.pricingRules, [rule.id]: val === '' ? undefined : val } }));
                                }}
                                min="0" step="0.01"
                                style={{
                                  flex: 1, maxWidth: '120px', padding: '5px 8px', borderRadius: '5px',
                                  border: hasCustom ? '1.5px solid #10b981' : '1px dashed #d1d5db',
                                  fontSize: '12px', boxSizing: 'border-box',
                                  backgroundColor: hasCustom ? '#f0fdf4' : '#fafafa',
                                  fontWeight: hasCustom ? '600' : '400',
                                  fontStyle: hasCustom ? 'normal' : 'italic',
                                  color: hasCustom ? '#166534' : '#94a3b8'
                                }}
                                onFocus={(e) => { e.target.style.borderColor = '#ef4444'; e.target.style.boxShadow = '0 0 0 2px rgba(239,68,68,0.1)'; e.target.style.fontStyle = 'normal'; }}
                                onBlur={(e) => { e.target.style.borderColor = hasCustom ? '#10b981' : '#d1d5db'; e.target.style.boxShadow = 'none'; if (!hasCustom) e.target.style.fontStyle = 'italic'; }}
                              />
                              {!hasCustom && <span style={{ fontSize: '10px', color: '#94a3b8', fontStyle: 'italic' }}>{t('menu.inherited')}</span>}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* Takeaway */}
                  {(() => {
                    const hasTakeaway = formData.takeawayPrice !== '' && formData.takeawayPrice !== undefined;
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', marginTop: '6px' }}>
                        <span style={{ fontSize: '14px', width: '22px', textAlign: 'center' }}>🥡</span>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#334155', width: '70px' }}>{t('menu.takeaway')}</span>
                        <input
                          type="number"
                          placeholder={formData.price ? `${getCurrencySymbol()}${formData.price}` : `${getCurrencySymbol()}0`}
                          value={formData.takeawayPrice}
                          onChange={(e) => setFormData(prev => ({ ...prev, takeawayPrice: e.target.value }))}
                          min="0" step="0.01"
                          style={{
                            flex: 1, maxWidth: '140px', padding: '7px 10px', borderRadius: '6px',
                            border: hasTakeaway ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                            fontSize: '13px', boxSizing: 'border-box',
                            backgroundColor: hasTakeaway ? '#f0fdf4' : 'white',
                            fontWeight: hasTakeaway ? '600' : '400',
                            color: hasTakeaway ? '#166534' : '#374151'
                          }}
                          onFocus={(e) => { e.target.style.borderColor = '#ef4444'; e.target.style.boxShadow = '0 0 0 2px rgba(239,68,68,0.1)'; }}
                          onBlur={(e) => { e.target.style.borderColor = hasTakeaway ? '#10b981' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                        />
                      </div>
                    );
                  })()}

                  {/* Delivery */}
                  {(() => {
                    const hasDelivery = formData.deliveryPrice !== '' && formData.deliveryPrice !== undefined;
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px', width: '22px', textAlign: 'center' }}>🛵</span>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#334155', width: '70px' }}>{t('menu.delivery')}</span>
                        <input
                          type="number"
                          placeholder={formData.price ? `${getCurrencySymbol()}${formData.price}` : `${getCurrencySymbol()}0`}
                          value={formData.deliveryPrice}
                          onChange={(e) => setFormData(prev => ({ ...prev, deliveryPrice: e.target.value }))}
                          min="0" step="0.01"
                          style={{
                            flex: 1, maxWidth: '140px', padding: '7px 10px', borderRadius: '6px',
                            border: hasDelivery ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                            fontSize: '13px', boxSizing: 'border-box',
                            backgroundColor: hasDelivery ? '#f0fdf4' : 'white',
                            fontWeight: hasDelivery ? '600' : '400',
                            color: hasDelivery ? '#166534' : '#374151'
                          }}
                          onFocus={(e) => { e.target.style.borderColor = '#ef4444'; e.target.style.boxShadow = '0 0 0 2px rgba(239,68,68,0.1)'; }}
                          onBlur={(e) => { e.target.style.borderColor = hasDelivery ? '#10b981' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                        />
                      </div>
                    );
                  })()}

                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '8px 0 0' }}>
                    {t('menu.emptyZonesInfo')}{' '}
                    <span onClick={() => router.push(isMobileEmbed ? '/mobile/admin' : '/admin')} style={{ color: '#ef4444', cursor: 'pointer', fontWeight: '600' }}>{t('menu.adminPricingRules')}</span>
                  </p>
                </div>

                {/* Category */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <CategoryDropdown
                    label={t('menu.categoryRequired')}
                    value={formData.category}
                    onChange={(value) => setFormData({...formData, category: value})}
                    categories={categories}
                    placeholder={t('menu.selectCategory')}
                    restaurantId={currentRestaurant?.id}
                    onCategoryAdded={handleAddNewCategory}
                    onCategoryUpdated={handleCategoryUpdated}
                    onCategoryDeleted={handleCategoryDeleted}
                  />
                </div>

              </div>
              
              {/* Business-Type-Specific Fields — shown FIRST for relevant types */}
                {isBarMode && (
                  <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#fdf2f8', borderRadius: '12px', border: '1px solid #fce7f3' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#831843', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {t('menu.barDetails')}
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>{t('menu.abvPercent')}</label>
                        <input
                          type="number"
                          value={formData.abv || ''}
                          onChange={(e) => setFormData({...formData, abv: e.target.value})}
                          placeholder={t('menu.abvPlaceholder')}
                          min="0"
                          max="100"
                          step="0.1"
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>{t('menu.ingredientsCocktails')}</label>
                        <input
                          type="text"
                          value={formData.ingredients || ''}
                          onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
                          placeholder={t('menu.ingredientsPlaceholder')}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>{t('menu.servingUnit')}</label>
                        <select
                          value={formData.servingUnit || ''}
                          onChange={(e) => setFormData({...formData, servingUnit: e.target.value})}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box' }}
                        >
                          <option value="">{t('menu.selectOption')}</option>
                          <option value="ml">{t('menu.ml')}</option>
                          <option value="peg">{t('menu.peg')}</option>
                          <option value="glass">{t('menu.glass')}</option>
                          <option value="bottle">{t('menu.bottle')}</option>
                          <option value="pint">{t('menu.pint')}</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>{t('menu.bottleSize')}</label>
                        <select
                          value={formData.bottleSize || ''}
                          onChange={(e) => setFormData({...formData, bottleSize: e.target.value})}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box' }}
                        >
                          <option value="">{t('menu.selectOption')}</option>
                          <option value="180ml">{t('menu.bottleSize180')}</option>
                          <option value="375ml">{t('menu.bottleSize375')}</option>
                          <option value="500ml">{t('menu.bottleSize500')}</option>
                          <option value="750ml">{t('menu.bottleSize750')}</option>
                          <option value="1L">{t('menu.bottleSize1L')}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {isBakeryMode && (
                  <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#fef9ee', borderRadius: '12px', border: '1px solid #fde68a' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#92400e', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {t('menu.bakeryDetails')}
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>{t('menu.unit')}</label>
                        <select
                          value={formData.unit || ''}
                          onChange={(e) => setFormData({...formData, unit: e.target.value})}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box' }}
                        >
                          <option value="">{t('menu.selectOption')}</option>
                          <option value="piece">{t('menu.piece')}</option>
                          <option value="kg">{t('menu.kg')}</option>
                          <option value="gram">{t('menu.gram')}</option>
                          <option value="dozen">{t('menu.dozen')}</option>
                          <option value="box">{t('menu.box')}</option>
                          <option value="slice">{t('menu.slice')}</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>{t('menu.weight')}</label>
                        <input
                          type="text"
                          value={formData.weight || ''}
                          onChange={(e) => setFormData({...formData, weight: e.target.value})}
                          placeholder={t('menu.weightPlaceholder')}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>{t('menu.shelfLifeDays')}</label>
                        <input
                          type="number"
                          value={formData.shelfLife || ''}
                          onChange={(e) => setFormData({...formData, shelfLife: e.target.value})}
                          placeholder={t('menu.shelfLifePlaceholder')}
                          min="0"
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>{t('menu.mfgDate')}</label>
                        <input
                          type="date"
                          value={formData.mfgDate || ''}
                          onChange={(e) => setFormData({...formData, mfgDate: e.target.value})}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>{t('menu.expiryDate')}</label>
                        <input
                          type="date"
                          value={formData.expiryDate || ''}
                          onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {isIceCreamMode && (
                  <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#1e40af', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {t('menu.iceCreamDetails')}
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>{t('menu.servingSize')}</label>
                        <select
                          value={formData.servingSize || ''}
                          onChange={(e) => setFormData({...formData, servingSize: e.target.value})}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box' }}
                        >
                          <option value="">{t('menu.selectOption')}</option>
                          <option value="scoop">{t('menu.scoop')}</option>
                          <option value="cup">{t('menu.cup')}</option>
                          <option value="cone">{t('menu.cone')}</option>
                          <option value="sundae">{t('menu.sundae')}</option>
                          <option value="shake">{t('menu.shake')}</option>
                          <option value="tub">{t('menu.tub')}</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>{t('menu.maxScoops')}</label>
                        <input
                          type="number"
                          value={formData.scoopOptions || ''}
                          onChange={(e) => setFormData({...formData, scoopOptions: e.target.value})}
                          placeholder={t('menu.maxScoopsPlaceholder')}
                          min="1"
                          max="5"
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                    <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px', marginBottom: 0 }}>{t('menu.toppingsHint')}</p>
                  </div>
                )}

                {/* AI Stock Suggestion Banner */}
                {stockTrackSuggestion && !formData.isStockManaged && (
                  <div style={{
                    marginBottom: '12px', padding: '10px 14px', backgroundColor: '#fefce8', borderRadius: '10px',
                    border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '10px',
                    animation: 'fadeIn 0.3s ease'
                  }}>
                    <span style={{ fontSize: '18px' }}>💡</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '12px', fontWeight: '600', color: '#92400e', margin: 0 }}>
                        {stockTrackSuggestion.label} detected
                      </p>
                      <p style={{ fontSize: '11px', color: '#a16207', margin: '2px 0 0 0' }}>
                        &quot;{formData.name}&quot; looks like a directly countable item. Enable stock tracking to auto-deduct inventory on each sale.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        isStockManaged: true,
                        stockUnit: stockTrackSuggestion.unit || 'pcs',
                        deductionQuantity: 1
                      }))}
                      style={{
                        padding: '6px 14px', backgroundColor: '#f59e0b', color: 'white', border: 'none',
                        borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                        whiteSpace: 'nowrap', flexShrink: 0
                      }}
                    >
                      Enable Tracking
                    </button>
                  </div>
                )}

                {/* Stock Tracking */}
                <div style={{ marginBottom: '16px', padding: '12px 14px', backgroundColor: formData.isStockManaged ? '#ecfdf5' : '#f0f9ff', borderRadius: '10px', border: `1px solid ${formData.isStockManaged ? '#86efac' : '#bae6fd'}`, transition: 'all 0.2s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: formData.isStockManaged ? '12px' : '0' }}>
                    <input
                      type="checkbox"
                      id="isStockManaged"
                      checked={formData.isStockManaged || false}
                      onChange={(e) => setFormData(prev => ({...prev, isStockManaged: e.target.checked}))}
                      style={{ width: '16px', height: '16px', accentColor: formData.isStockManaged ? '#16a34a' : '#0284c7', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <label htmlFor="isStockManaged" style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: formData.isStockManaged ? '#166534' : '#0c4a6e', cursor: 'pointer' }}>
                        {t('menu.trackStockCount')}
                      </label>
                      <p style={{ fontSize: '11px', color: formData.isStockManaged ? '#15803d' : '#0369a1', margin: '2px 0 0 0' }}>
                        {formData.isStockManaged ? 'Inventory will auto-deduct when this item is sold' : t('menu.stockSynced')}
                      </p>
                    </div>
                    {formData.isStockManaged && (
                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#16a34a', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '4px' }}>Active</span>
                    )}
                  </div>
                  {formData.isStockManaged && (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>{t('menu.unitLabel')}</label>
                          <select
                            value={formData.stockUnit || 'pcs'}
                            onChange={(e) => setFormData(prev => ({...prev, stockUnit: e.target.value}))}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box', backgroundColor: 'white', cursor: 'pointer' }}
                          >
                            <option value="pcs">{t('menu.unitCountPcs')}</option>
                            <option value="kg">{t('menu.unitKg')}</option>
                            <option value="gram">{t('menu.unitGram')}</option>
                            <option value="liter">{t('menu.unitLiter')}</option>
                            <option value="ml">{t('menu.unitMl')}</option>
                            <option value="bottle">{t('menu.unitBottles')}</option>
                            <option value="dozen">{t('menu.unitDozen')}</option>
                            <option value="box">{t('menu.unitBox')}</option>
                            <option value="plate">{t('menu.unitPlate')}</option>
                            <option value="slice">{t('menu.unitSlice')}</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                            {(() => { const u = formData.stockUnit || 'pcs'; const labels = { pcs: t('menu.stockLabelQuantity'), kg: t('menu.stockLabelKg'), gram: t('menu.stockLabelGram'), liter: t('menu.stockLabelLiter'), ml: t('menu.stockLabelMl'), bottle: t('menu.stockLabelBottle'), dozen: t('menu.stockLabelDozen'), box: t('menu.stockLabelBox'), plate: t('menu.stockLabelPlate'), slice: t('menu.stockLabelSlice') }; return labels[u] || t('menu.stockLabelDefault'); })()}
                          </label>
                          <input
                            type="number"
                            value={formData.stockQuantity ?? ''}
                            onChange={(e) => setFormData(prev => ({...prev, stockQuantity: e.target.value === '' ? null : parseInt(e.target.value)}))}
                            placeholder="e.g., 100"
                            min="0"
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>{t('menu.lowAlertAt')}</label>
                          <input
                            type="number"
                            value={formData.lowStockThreshold ?? 5}
                            onChange={(e) => setFormData(prev => ({...prev, lowStockThreshold: parseInt(e.target.value) || 5}))}
                            placeholder={t('menu.lowAlertPlaceholder')}
                            min="1"
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Deduct/Sale</label>
                          <input
                            type="number"
                            value={formData.deductionQuantity ?? 1}
                            onChange={(e) => setFormData(prev => ({...prev, deductionQuantity: parseInt(e.target.value) || 1}))}
                            placeholder="1"
                            min="1"
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                      <p style={{ fontSize: '10px', color: '#6b7280', margin: '8px 0 0 0' }}>
                        Each sale of this item will deduct {formData.deductionQuantity || 1} {formData.stockUnit || 'pcs'} from inventory. No recipe needed for direct items.
                      </p>
                    </div>
                  )}
                </div>

              {/* Sold by Weight */}
                <div style={{ marginBottom: '16px', padding: '12px 14px', backgroundColor: formData.soldByWeight ? '#fefce8' : '#f0f9ff', borderRadius: '10px', border: `1px solid ${formData.soldByWeight ? '#fde047' : '#bae6fd'}`, transition: 'all 0.2s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: formData.soldByWeight ? '12px' : '0' }}>
                    <input
                      type="checkbox"
                      id="soldByWeight"
                      checked={formData.soldByWeight || false}
                      onChange={(e) => setFormData(prev => ({...prev, soldByWeight: e.target.checked}))}
                      style={{ width: '16px', height: '16px', accentColor: formData.soldByWeight ? '#ca8a04' : '#0284c7', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <label htmlFor="soldByWeight" style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: formData.soldByWeight ? '#854d0e' : '#0c4a6e', cursor: 'pointer' }}>
                        Sold by Weight
                      </label>
                      <p style={{ fontSize: '11px', color: formData.soldByWeight ? '#a16207' : '#0369a1', margin: '2px 0 0 0' }}>
                        {formData.soldByWeight ? 'Price is calculated based on weight from the scale' : 'Enable for items priced per kg/lb (requires weighing scale)'}
                      </p>
                    </div>
                    {formData.soldByWeight && (
                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#ca8a04', backgroundColor: '#fef9c3', padding: '2px 8px', borderRadius: '4px' }}>⚖️ Active</span>
                    )}
                  </div>
                  {formData.soldByWeight && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <label style={{ fontSize: '11px', fontWeight: '500', color: '#374151' }}>Price Unit:</label>
                        <select
                          value={formData.priceUnit || 'per_kg'}
                          onChange={(e) => setFormData(prev => ({...prev, priceUnit: e.target.value}))}
                          style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '12px', backgroundColor: 'white' }}
                        >
                          <option value="per_kg">per kg</option>
                          <option value="per_100g">per 100g</option>
                          <option value="per_lb">per lb</option>
                        </select>
                        <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>
                          Price entered above = {formData.priceUnit === 'per_100g' ? `${getCurrencySymbol()}/100g` : formData.priceUnit === 'per_lb' ? `${getCurrencySymbol()}/lb` : `${getCurrencySymbol()}/kg`}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <label style={{ fontSize: '11px', fontWeight: '500', color: '#374151', whiteSpace: 'nowrap' }}>PLU Code:</label>
                        <input
                          type="text"
                          value={formData.pluCode || ''}
                          onChange={(e) => {
                            const maxLen = parseInt(currentRestaurant?.posSettings?.scalePluDigits) || 4;
                            const val = e.target.value.replace(/\D/g, '').slice(0, maxLen);
                            setFormData(prev => ({...prev, pluCode: val}));
                          }}
                          placeholder={parseInt(currentRestaurant?.posSettings?.scalePluDigits) === 5 ? '00001' : '0001'}
                          maxLength={parseInt(currentRestaurant?.posSettings?.scalePluDigits) || 4}
                          style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '12px', backgroundColor: 'white', width: parseInt(currentRestaurant?.posSettings?.scalePluDigits) === 5 ? '90px' : '80px', fontFamily: 'monospace', letterSpacing: '2px' }}
                        />
                        <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>
                          {parseInt(currentRestaurant?.posSettings?.scalePluDigits) === 5 ? '5' : '4'}-digit code programmed in your weighing scale for this item
                        </p>
                      </div>
                    </div>
                  )}
                </div>

              {/* Food Type — compact inline pills */}
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#6b7280',
                  }}>
                    {t('menu.type')}
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, isVeg: true})}
                      style={{
                        padding: '4px 14px',
                        border: formData.isVeg === true ? '1.5px solid #16a34a' : '1px solid #d1d5db',
                        borderRadius: '20px',
                        backgroundColor: formData.isVeg === true ? '#f0fdf4' : 'white',
                        color: formData.isVeg === true ? '#16a34a' : '#9ca3af',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {t('menu.vegLabel')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, isVeg: false})}
                      style={{
                        padding: '4px 14px',
                        border: formData.isVeg === false ? '1.5px solid #dc2626' : '1px solid #d1d5db',
                        borderRadius: '20px',
                        backgroundColor: formData.isVeg === false ? '#fef2f2' : 'white',
                        color: formData.isVeg === false ? '#dc2626' : '#9ca3af',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {t('menu.nonVegLabel')}
                    </button>
                  </div>
                </div>

              </div>{/* END LEFT COLUMN */}

              {/* ===== RIGHT COLUMN ===== */}
              <div>
                {/* Image Upload */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '10px'
                  }}>
                    {t('menu.itemImages', { item: btype.item })}
                  </h4>
                    <ImageUpload
                      onImagesUploaded={handleImagesUploaded}
                      onImageDeleted={handleImageDeleted}
                    existingImages={[...(formData.images || []), ...(formData.tempImages || []).map(temp => ({
                      url: URL.createObjectURL(temp.file),
                      originalName: temp.name,
                      tempId: temp.tempId
                    }))]}
                      maxImages={4}
                      disabled={uploadingImages}
                      uploading={uploadingImages}
                    />
              </div>

              {/* Hide Image Toggle */}
                {editingItem && isOwnerOrAdmin && (
                  <div style={{ marginBottom: '16px', padding: '10px 12px', backgroundColor: formData.hideImage ? '#fef2f2' : '#f9fafb', borderRadius: '8px', border: `1px solid ${formData.hideImage ? '#fecaca' : '#e5e7eb'}`, display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s ease' }}>
                    <input
                      type="checkbox"
                      id="hideImage"
                      checked={formData.hideImage || false}
                      onChange={(e) => setFormData({...formData, hideImage: e.target.checked})}
                      style={{ width: '16px', height: '16px', accentColor: '#ef4444', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <label htmlFor="hideImage" style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: formData.hideImage ? '#991b1b' : '#374151', cursor: 'pointer' }}>
                        Hide image for this item
                      </label>
                      <p style={{ fontSize: '11px', color: formData.hideImage ? '#b91c1c' : '#6b7280', margin: '2px 0 0 0' }}>
                        Image will not be shown on POS menu across all devices
                      </p>
                    </div>
                  </div>
                )}

              {/* AI Recipe Generation Toggle — hide for bar */}
              {!editingItem && !isBarMode && (
                <div style={{ marginBottom: '16px', padding: '10px 12px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="generateRecipe"
                    checked={formData.generateRecipe}
                    onChange={(e) => setFormData({...formData, generateRecipe: e.target.checked})}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: '#16a34a',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <label htmlFor="generateRecipe" style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#166534', cursor: 'pointer' }}>
                      {t('menu.generateSmartRecipe')}
                    </label>
                    <p style={{ fontSize: '11px', color: '#15803d', margin: '2px 0 0 0' }}>
                      {t('menu.autoCreateIngredients')}
                    </p>
                  </div>
                </div>
              )}

              {/* Variants Section — always visible on right */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}>
                  <label style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    {isBarMode ? 'Serving Sizes' : isIceCreamMode ? t('menu.scoopOptions') : isBakeryMode ? t('menu.packSizes') : t('menu.variants')}
                  </label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={addVariant}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <FaPlus size={8} />
                      {t('menu.add')}
                    </button>
                    {isBarMode && (!formData.variants || formData.variants.length === 0) && (
                      <button
                        type="button"
                        onClick={addBarServingVariants}
                        style={{
                          padding: '4px 10px',
                          backgroundColor: '#7c3aed',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        {t('menu.barTemplate')}
                      </button>
                    )}
                    {isBakeryMode && (!formData.variants || formData.variants.length === 0) && (
                      <button
                        type="button"
                        onClick={addBakeryPackVariants}
                        style={{
                          padding: '4px 10px',
                          backgroundColor: '#d97706',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        {t('menu.bakeryTemplate')}
                      </button>
                    )}
                    {isIceCreamMode && (!formData.variants || formData.variants.length === 0) && (
                      <button
                        type="button"
                        onClick={addIceCreamScoopVariants}
                        style={{
                          padding: '4px 10px',
                          backgroundColor: '#2563eb',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        {t('menu.iceCreamTemplate')}
                      </button>
                    )}
                  </div>
                </div>
                {formData.variants && formData.variants.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {formData.variants.map((variant, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '10px',
                          backgroundColor: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'center'
                        }}
                      >
                        <input
                          type="text"
                          placeholder={isBarMode ? t('menu.variantPlaceholderBar') : isIceCreamMode ? t('menu.variantPlaceholderIceCream') : t('menu.variantPlaceholderDefault')}
                          value={variant.name}
                          onChange={(e) => updateVariant(index, 'name', e.target.value)}
                          style={{
                            flex: 1,
                            padding: '8px 10px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '12px',
                            outline: 'none'
                          }}
                        />
                        <input
                          type="number"
                          placeholder={t('menu.price')}
                          value={variant.price}
                          onChange={(e) => updateVariant(index, 'price', e.target.value)}
                          style={{
                            width: '80px',
                            padding: '8px 10px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '12px',
                            outline: 'none'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          style={{
                            padding: '8px',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            flexShrink: 0
                          }}
                        >
                          <FaTrash size={9} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    fontStyle: 'italic',
                    padding: '10px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px',
                    border: '1px dashed #d1d5db',
                    margin: 0
                  }}>
                    {isBarMode ? t('menu.variantEmptyBar') : isIceCreamMode ? t('menu.variantEmptyIceCream') : isBakeryMode ? t('menu.variantEmptyBakery') : t('menu.variantEmptyDefault')}
                  </p>
                )}
              </div>

              {/* Customizations Section */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <label style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    {isBarMode ? t('menu.mixers') : isIceCreamMode ? t('menu.toppings') : isBakeryMode ? 'Add-ons' : t('menu.customizations')}
                  </label>
                  <button
                    type="button"
                    onClick={addCustomization}
                    style={{
                      padding: '4px 10px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <FaPlus size={8} />
                    {t('menu.add')}
                  </button>
                </div>
                {formData.customizations && formData.customizations.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {formData.customizations.map((customization, index) => (
                      <div
                        key={customization.id || index}
                        style={{
                          padding: '10px',
                          backgroundColor: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'center'
                        }}
                      >
                        <input
                          type="text"
                          placeholder={isBarMode ? t('menu.customPlaceholderBar') : isIceCreamMode ? t('menu.customPlaceholderIceCream') : t('menu.customPlaceholderDefault')}
                          value={customization.name}
                          onChange={(e) => updateCustomization(index, 'name', e.target.value)}
                          style={{
                            flex: 1,
                            padding: '8px 10px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '12px',
                            outline: 'none'
                          }}
                        />
                        <input
                          type="number"
                          placeholder={t('menu.price')}
                          value={customization.price}
                          onChange={(e) => updateCustomization(index, 'price', e.target.value)}
                          style={{
                            width: '80px',
                            padding: '8px 10px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '12px',
                            outline: 'none'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeCustomization(index)}
                          style={{
                            padding: '8px',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            flexShrink: 0
                          }}
                        >
                          <FaTrash size={9} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    fontStyle: 'italic',
                    padding: '10px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px',
                    border: '1px dashed #d1d5db',
                    margin: 0
                  }}>
                    {isBarMode ? t('menu.customEmptyBar') : isIceCreamMode ? t('menu.customEmptyIceCream') : isBakeryMode ? t('menu.customEmptyBakery') : t('menu.customEmptyDefault')}
                  </p>
                )}
              </div>
              </div>{/* END RIGHT COLUMN */}
              </div>{/* END TWO-COLUMN GRID */}

              {/* Sticky Actions Bar */}
              <div style={{
                position: 'sticky',
                bottom: 0,
                display: 'flex',
                gap: isMobileEmbed ? '8px' : '10px',
                justifyContent: 'flex-end',
                margin: window.innerWidth <= 768 ? '16px -16px 0 -16px' : '16px -24px 0 -24px',
                padding: window.innerWidth <= 768 ? (isMobileEmbed ? '10px 12px 70px 12px' : '12px 16px') : '14px 24px',
                borderTop: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                borderRadius: window.innerWidth <= 768 ? '0' : '0 0 12px 12px',
                flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
              }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: isMobileEmbed ? '8px 16px' : '10px 24px',
                    backgroundColor: 'white',
                    color: '#374151',
                    fontSize: isMobileEmbed ? '12px' : '13px',
                    fontWeight: '500',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    width: window.innerWidth <= 768 ? '100%' : 'auto'
                  }}
                >
                  {t('menu.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  style={{
                    padding: isMobileEmbed ? '8px 20px' : '10px 28px',
                    background: processing ? 'linear-gradient(135deg, #f87171, #ef4444)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    fontSize: isMobileEmbed ? '12px' : '13px',
                    fontWeight: '600',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: processing ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: processing ? 'none' : '0 4px 12px rgba(0,0,0,0.15)',
                    width: window.innerWidth <= 768 ? '100%' : 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: processing ? 0.85 : 1
                  }}
                >
                  {processing && <FaSpinner size={13} style={{ animation: 'spin 1s linear infinite' }} />}
                  {processing ? (editingItem ? t('menu.updatingItem') : t('menu.addingItem')) : editingItem ? t('menu.updateItem', { item: btype.item }) : t('menu.addItemBtn', { item: btype.item })}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Bulk Upload Modal — lazy-loaded, portal to render above sidebar */}
      {showBulkUpload && typeof document !== 'undefined' && createPortal(
        <BulkMenuUpload
          isOpen={showBulkUpload}
          onClose={() => setShowBulkUpload(false)}
          restaurantId={currentRestaurant?.id}
          onMenuItemsAdded={handleMenuItemsAdded}
          currentMenuItems={menuItems}
          taxSettings={currentRestaurant?.taxSettings}
        />,
        document.body
      )}

      {/* QR Code Modal — lazy-loaded, portal to render above sidebar */}
      {showQRCodeModal && typeof document !== 'undefined' && createPortal(
        <QRCodeModal
          isOpen={showQRCodeModal}
          onClose={() => setShowQRCodeModal(false)}
          restaurantId={currentRestaurant?.id}
          restaurantName={currentRestaurant?.name}
          restaurant={currentRestaurant}
        />,
        document.body
      )}

      {/* Single Item Delete Confirmation Modal */}
      {deleteConfirmItem && typeof document !== 'undefined' && createPortal(
        <div
          onClick={() => { if (!isDeleting) setDeleteConfirmItem(null); }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10002, padding: '16px',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white', borderRadius: '12px',
              padding: '20px', maxWidth: '340px', width: '100%',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
              animation: 'slideInUp 0.15s ease-out',
            }}
          >
            <div style={{
              width: '40px', height: '40px', margin: '0 auto 12px',
              backgroundColor: '#fee2e2', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FaTrash size={16} color="#dc2626" />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1f2937', textAlign: 'center', margin: '0 0 6px 0' }}>
              Delete Item
            </h3>
            <p style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', margin: '0 0 16px 0', lineHeight: 1.4 }}>
              Are you sure you want to delete <strong style={{ color: '#374151' }}>{deleteConfirmItem.name}</strong>? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setDeleteConfirmItem(null)}
                disabled={isDeleting}
                style={{
                  flex: 1, padding: '8px 12px', fontSize: '13px', fontWeight: 500,
                  backgroundColor: '#f3f4f6', color: '#374151',
                  border: 'none', borderRadius: '8px',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                style={{
                  flex: 1, padding: '8px 12px', fontSize: '13px', fontWeight: 600,
                  backgroundColor: '#dc2626', color: 'white',
                  border: 'none', borderRadius: '8px',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.9 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
              >
                {isDeleting ? (
                  <>
                    <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} />
                    Deleting...
                  </>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Bulk Delete Confirmation Modal — portal to render above sidebar */}
      {showBulkDeleteConfirm && typeof document !== 'undefined' && createPortal(
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
          zIndex: 10002,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Icon */}
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 24px',
              backgroundColor: '#fee2e2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaExclamationTriangle size={32} color="#dc2626" />
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              {t('menu.deleteAllTitle')}
            </h2>

            {/* Message */}
            <div style={{
              fontSize: '16px',
              color: '#6b7280',
              marginBottom: '32px',
              lineHeight: '1.6',
              textAlign: 'center'
            }}>
              <p style={{ marginBottom: '12px' }}>
                {t('menu.deleteAllConfirm', { count: menuItems.filter(item => item.status !== 'deleted').length })}
              </p>
              <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                {t('menu.deleteAllWarning')}
              </p>
            </div>

            {/* Reason */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px', textAlign: 'left' }}>
                Reason for deletion *
              </label>
              <textarea
                value={bulkDeleteReason}
                onChange={(e) => setBulkDeleteReason(e.target.value)}
                placeholder="Enter reason for deleting all menu items..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => e.target.style.borderColor = '#6b7280'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => { setShowBulkDeleteConfirm(false); setBulkDeleteReason(''); }}
                disabled={operationLoading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: operationLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: operationLoading ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!operationLoading) e.target.style.backgroundColor = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  if (!operationLoading) e.target.style.backgroundColor = '#f3f4f6';
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                disabled={operationLoading || !bulkDeleteReason.trim()}
                style={{
                  padding: '12px 24px',
                  background: (operationLoading || !bulkDeleteReason.trim()) ? '#9ca3af' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: operationLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!operationLoading && bulkDeleteReason.trim()) e.target.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
                }}
                onMouseLeave={(e) => {
                  if (!operationLoading && bulkDeleteReason.trim()) e.target.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                }}
              >
                {operationLoading ? (
                  <>
                    <FaSpinner className="animate-spin" size={16} />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash size={16} />
                    Yes, Delete All
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Menu Recipe Modal — same style as Inventory Add Recipe */}
      {showMenuRecipeModal && menuRecipeItem && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            zIndex: 10002, padding: 20, overflowY: 'auto',
          }}
          onClick={e => { if (e.target === e.currentTarget) setShowMenuRecipeModal(false); }}
        >
          <div style={{
            backgroundColor: 'white', borderRadius: 14,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            width: '100%', maxWidth: '820px',
            marginTop: 20, marginBottom: 20,
            display: 'flex', flexDirection: 'column', maxHeight: isMobileEmbed ? 'calc(var(--app-height, 90vh) - 8px)' : '90vh',
            overflow: 'hidden',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              padding: '16px 20px', borderRadius: '14px 14px 0 0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'white' }}>
                {menuItemRecipes[menuRecipeItem.id] ? t('menu.recipe') : t('menu.addRecipe')} — {menuRecipeItem.name}
              </h2>
              <button onClick={() => setShowMenuRecipeModal(false)} style={{
                background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
                cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex',
                alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)',
              }}>
                <FaTimes size={14} />
              </button>
            </div>
            <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <RecipeFormBody
                recipeFormData={menuRecipeFormData}
                setRecipeFormData={setMenuRecipeFormData}
                inventoryItems={menuRecipeInventoryItems}
                addRecipeIngredient={menuRecipeAddIngredient}
                removeRecipeIngredient={menuRecipeRemoveIngredient}
                updateRecipeIngredient={menuRecipeUpdateIngredient}
                addRecipeInstruction={menuRecipeAddInstruction}
                removeRecipeInstruction={menuRecipeRemoveInstruction}
                updateRecipeInstruction={menuRecipeUpdateInstruction}
                handleGenerateRecipeSteps={menuRecipeGenerateSteps}
                generatingSteps={menuRecipeGeneratingSteps}
                handleGenerateFullRecipe={menuRecipeGenerateFull}
                generatingFullRecipe={menuRecipeGenerating}
                recipes={Object.values(menuItemRecipes)}
                editingRecipeId={menuItemRecipes[menuRecipeItem?.id]?.id || null}
              />
            </div>
            {menuRecipeError && (
              <div style={{
                margin: '0 20px', padding: '10px 14px', backgroundColor: '#fef2f2',
                border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626',
                fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ fontSize: 15 }}>⚠</span> {menuRecipeError}
              </div>
            )}
            <div style={{
              padding: '14px 20px', borderTop: '1px solid #e5e7eb', backgroundColor: 'white',
              flexShrink: 0, display: 'flex', justifyContent: 'flex-end', gap: '10px'
            }}>
              <button
                style={{
                  padding: '11px 20px', backgroundColor: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0',
                  borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
                }}
                onClick={() => setShowMenuRecipeModal(false)}
              >
                {t('menu.cancel')}
              </button>
              <button
                style={{
                  padding: '11px 24px', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white',
                  border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(5,150,105,0.3)',
                  opacity: menuRecipeSaving ? 0.6 : 1, pointerEvents: menuRecipeSaving ? 'none' : 'auto',
                }}
                onClick={menuRecipeSave}
                disabled={menuRecipeSaving}
              >
                {menuRecipeSaving ? t('menu.savingRecipe') : <><FaSave /> {t('menu.saveRecipe')}</>}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Hidden Camera Input */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*,application/pdf,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        capture="environment"
        multiple
        onChange={handlePhotoUpload}
        style={{ display: 'none' }}
      />

      {/* Photo Capture Modal */}
      {showPhotoCapture && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10002, // Higher than navigation (1000)
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}>
            {photoSuccess ? (
              <>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <FaCheckCircle size={40} style={{ color: 'white' }} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: '0 0 16px 0' }}>
                  Photo Uploaded Successfully!
                </h3>
                <p style={{ fontSize: '16px', color: '#6b7280', margin: '0' }}>
                  Your menu items have been processed and added.
                </p>
              </>
            ) : photoError ? (
              <>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <FaTimes size={40} style={{ color: 'white' }} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: '0 0 16px 0' }}>
                  Upload Failed
                </h3>
                <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 24px 0' }}>
                  {photoError}
                </p>
                <button
                  onClick={() => {
                    setPhotoError('');
                    setShowPhotoCapture(false);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  Try Again
                </button>
              </>
            ) : photoUploading ? (
              <>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#3b82f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <FaSpinner size={40} style={{ color: 'white', animation: 'spin 1s linear infinite' }} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: '0 0 16px 0' }}>
                  Processing Photo...
                </h3>
                <p style={{ fontSize: '16px', color: '#6b7280', margin: '0' }}>
                  Please wait while we extract menu items from your photo.
                </p>
              </>
            ) : (
              <>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#f59e0b',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <FaCamera size={40} style={{ color: 'white' }} />
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', margin: '0 0 16px 0' }}>
                  Take Menu Photo
                </h3>
                <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 32px 0' }}>
                  Use your camera to capture menu photos. The AI will automatically extract menu items.
                </p>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={handleTakePhoto}
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: 'white',
                      padding: '16px 24px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      minWidth: '140px',
                      justifyContent: 'center'
                    }}
                  >
                    <FaCamera size={18} />
                    Take Photo
                  </button>
                  <button
                    onClick={() => setShowPhotoCapture(false)}
                    style={{
                      background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                      color: 'white',
                      padding: '16px 24px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '16px',
                      minWidth: '140px'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes slideInRight {
          from {
            transform: translateX(100px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      
      {/* Item Detail Modal */}
      {/* Hide Image Toast */}
      {hideImageToast && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          padding: '10px 20px', borderRadius: '10px', zIndex: 10010,
          display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)', animation: 'fadeInUp 0.3s ease',
          backgroundColor: hideImageToast.type === 'success' ? '#dcfce7' : hideImageToast.type === 'error' ? '#fee2e2' : '#f0f9ff',
          color: hideImageToast.type === 'success' ? '#166534' : hideImageToast.type === 'error' ? '#991b1b' : '#0c4a6e',
          border: `1px solid ${hideImageToast.type === 'success' ? '#86efac' : hideImageToast.type === 'error' ? '#fca5a5' : '#7dd3fc'}`,
        }}>
          {hideImageToast.type === 'loading' && <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} />}
          {hideImageToast.type === 'success' && <FaCheckCircle size={12} />}
          {hideImageToast.type === 'error' && <FaExclamationTriangle size={12} />}
          {hideImageToast.message}
        </div>
      )}

      <ItemDetailModal
        item={selectedItem}
        categoryMap={categoryMap}
        isOpen={showItemModal}
        onClose={handleCloseModal}
        onEdit={canEditMenuItem ? handleEdit : undefined}
        onDelete={canDeleteMenuItem ? handleDelete : undefined}
        onToggleAvailability={canMarkOutOfStock ? handleToggleAvailability : undefined}
        getCategoryEmoji={getCategoryEmoji}
        multiPricingEnabled={multiPricingEnabled}
        activePricingRules={activePricingRules}
        formatCurrency={formatCurrency}
        recipe={selectedItem ? menuItemRecipes[selectedItem.id] : null}
        globalHideImages={globalHideImages}
      />
    </div>
  );
};

export default MenuManagement;