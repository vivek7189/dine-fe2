'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLoading } from '../../../contexts/LoadingContext';
import BulkMenuUpload from '../../../components/BulkMenuUpload';
import ImageCarousel from '../../../components/ImageCarousel';
import ImageUpload from '../../../components/ImageUpload';
import QRCodeModal from '../../../components/QRCodeModal';
import apiClient from '../../../lib/api';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { t } from '../../../lib/i18n';
import { getDisplayImage } from '../../../utils/placeholderImages';
import { getCachedMenuData, setCachedMenuData } from '../../../utils/dashboardCache';
import { 
  FaPlus, 
  FaEdit,
  FaTrash,
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
  FaCheckCircle
} from 'react-icons/fa';

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
      alert('Failed to create category: ' + (error.message || 'Unknown error'));
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
      alert('Failed to update category: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) return;
    
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
      alert('Failed to delete category: ' + (error.message || 'Unknown error'));
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
                    placeholder="Category name"
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
                    placeholder="Description (optional)"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                  <div className="flex gap-2">
                <button
                      onClick={handleAddNew}
                             disabled={loading || !newCategory.name.trim()}
                             className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                             {loading ? 'Adding...' : 'Add'}
                </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                      setNewCategory({ name: '', emoji: '🍽️', description: '' });
                      }}
                      className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
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
                    placeholder="Category name"
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
                    placeholder="Description (optional)"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                  <div className="flex gap-2">
                    <button
                             onClick={handleUpdate}
                             disabled={loading || !newCategory.name.trim()}
                             className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                             {loading ? 'Updating...' : 'Update'}
                    </button>
                    <button
                      onClick={() => {
                      setShowEditForm(false);
                      setEditingCategory(null);
                      setNewCategory({ name: '', emoji: '🍽️', description: '' });
                      }}
                      className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
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
                         Add new category
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
                    title="Edit category"
                  >
                    <FaEdit size={10} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(category);
                    }}
                    className="p-1 text-red-600 hover:text-red-800"
                    title="Delete category"
                  >
                    <FaTrash size={10} />
                  </button>
                </div>
              </div>
            ))}
            {filteredCategories.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No categories found
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

  // Close dropdown when clicking outside
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
  
  return (
    <div ref={dropdownRef} style={{ position: 'relative', ...style }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '10px 12px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          backgroundColor: '#f9fafb',
          color: '#374151',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minWidth: '120px',
          width: '100%'
        }}
        onFocus={(e) => {
          e.target.style.backgroundColor = '#ffffff';
          e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
        }}
        onBlur={(e) => {
          e.target.style.backgroundColor = '#f9fafb';
          e.target.style.boxShadow = 'none';
        }}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <FaChevronDown 
          size={12} 
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: '#9ca3af'
          }} 
        />
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          border: '1px solid #e5e7eb',
          zIndex: 10000, // Higher than navigation (1000)
          marginTop: '4px',
          overflow: 'hidden'
        }}>
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: 'none',
                backgroundColor: value === option.value ? '#f3f4f6' : 'transparent',
                color: '#374151',
                fontSize: '14px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
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
              {option.icon && <span style={{ fontSize: '12px' }}>{option.icon}</span>}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Ultra Compact Menu Item Card Component
const MenuItemCard = ({ item, categories, onEdit, onDelete, onToggleAvailability, onToggleFavorite, getCategoryEmoji, onItemClick }) => {
  const { formatCurrency } = useCurrency();

  return (
    <div 
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        opacity: !item.isAvailable ? 0.6 : 1,
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
            OUT OF STOCK
          </div>
        )}
        
        {/* Short Code Badge */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
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
      </div>
      
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
              {categories.find(c => c.id === item.category)?.name || 'Main Course'}
            </span>
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
                per {item.unit}
              </span>
            )}
            {item.servingSize && (
              <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#eff6ff', color: '#1e40af' }}>
                {item.servingSize}
              </span>
            )}
          </div>
        )}

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

          <div style={{
            display: 'flex',
            gap: '8px'
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
                padding: '8px',
                background: item.isFavorite 
                  ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                  : '#ffffff',
                color: item.isFavorite ? 'white' : '#000000',
                border: item.isFavorite ? 'none' : '2px dashed #000000',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: item.isFavorite 
                  ? '0 2px 4px rgba(239, 68, 68, 0.2)' 
                  : '0 1px 2px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.3)';
                e.target.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                e.target.style.color = 'white';
                e.target.style.border = 'none';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = item.isFavorite 
                  ? '0 2px 4px rgba(239, 68, 68, 0.2)' 
                  : '0 1px 2px rgba(0, 0, 0, 0.1)';
                e.target.style.background = item.isFavorite 
                  ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                  : '#ffffff';
                e.target.style.color = item.isFavorite ? 'white' : '#000000';
                e.target.style.border = item.isFavorite ? 'none' : '2px dashed #000000';
              }}
              title={item.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <FaStar size={12} />
            </button>
          )}
          <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onEdit(item);
              }}
              style={{
                padding: '6px',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.2)';
              }}
            >
              <FaEdit size={12} />
          </button>
            
          <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onToggleAvailability(item.id, item.isAvailable);
              }}
              style={{
                padding: '8px',
                background: item.isAvailable 
                  ? 'linear-gradient(135deg, #f97316, #ea580c)' 
                  : 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
            title={item.isAvailable ? 'Mark as Out of Stock' : 'Mark as Available'}
          >
              {item.isAvailable ? <FaMinus size={12} /> : <FaCheck size={12} />}
          </button>
            
          <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDelete(item.id);
              }}
              style={{
                padding: '8px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
const ListViewItem = ({ item, categories, onEdit, onDelete, onToggleAvailability, onToggleFavorite, getCategoryEmoji }) => {
  const { formatCurrency } = useCurrency();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      padding: '12px',
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: item.isAvailable ? '#ffffff' : '#f9fafb',
      opacity: item.isAvailable ? 1 : 0.6,
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
              OUT
            </span>
          )}
        </div>
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            margin: 0,
            lineHeight: '1.4'
          }}>
          {item.description || 'Delicious dish prepared with finest ingredients'}
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
            title={item.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <FaHeart size={12} fill={item.isFavorite ? 'white' : 'none'} />
          </button>
        )}
        <button
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
          title="Edit"
        >
          <FaEdit size={10} />
        </button>
        <button
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
          title={item.isAvailable ? 'Mark as Out of Stock' : 'Mark as Available'}
        >
          {item.isAvailable ? <FaMinus size={10} /> : <FaCheck size={10} />}
        </button>
        <button
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
          title="Delete"
        >
          <FaTrash size={10} />
        </button>
      </div>
    </div>
  );
};

// Item Detail Modal Component
const ItemDetailModal = ({ item, categories, isOpen, onClose, onEdit, onDelete, onToggleAvailability, getCategoryEmoji }) => {
  const { formatCurrency } = useCurrency();
  if (!isOpen || !item) return null;
  const category = categories.find(c => c.id === item.category);

  return (
    <>
      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10000, // Higher than navigation (1000)
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onClick={onClose}
      >
        {/* Modal Content */}
        <div 
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            position: 'relative',
            animation: 'slideInFromRight 0.3s ease-out'
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
                    {item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
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
                Price per serving
              </div>
            </div>

            {/* Images */}
            {(item.images && item.images.length > 0) && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0,
                  marginBottom: '12px'
                }}>
                  Images
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
                Description
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: '1.6',
                margin: 0
              }}>
                {item.description || 'Delicious dish prepared with finest ingredients and authentic flavors.'}
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
                Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Category</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                    {category?.name || 'Main Course'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Short Code</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                    {item.shortCode}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Status</span>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: item.isAvailable ? '#22c55e' : '#ef4444',
                    backgroundColor: item.isAvailable ? '#dcfce7' : '#fef2f2',
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}>
                    {item.isAvailable ? 'Available' : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{
            padding: '16px 24px 24px 24px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            gap: '12px'
          }}>
            <button
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
              Edit Item
            </button>
            <button
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
              {item.isAvailable ? 'Mark Out' : 'Mark Available'}
            </button>
            <button
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
              Delete
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @media (max-width: 768px) {
          @keyframes slideInFromRight {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        }
      `}</style>
    </>
  );
};

const MenuManagement = () => {
  const { isLoading } = useLoading();
  const router = useRouter();
  const { formatCurrency, getCurrencySymbol } = useCurrency();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]); // Dynamic: from backend or from menu photo extraction
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVegFilter, setSelectedVegFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
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
  const [isClient, setIsClient] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const hasLoadedData = useRef(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [photoSuccess, setPhotoSuccess] = useState(false);
  const cameraInputRef = useRef(null);
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
    scoopOptions: ''
  });
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Mobile detection with client-side hydration safety
  useEffect(() => {
    setIsClient(true);
  }, []);

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
        apiClient.getCategories(restaurantId)
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

      // Cache the data
      const dataToCache = {
        menuItems: freshMenuItems,
        categories: finalCategories
      };
      setCachedMenuData(restaurantId, dataToCache);
      console.log('✅ Menu data cached');

    } catch (error) {
      console.error('Error loading menu data:', error);
      setError('Failed to load menu items');
      // Only set hasInitialData to false if we truly have no data
      if (menuItems.length === 0) {
        setHasInitialData(false);
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
          router.push('/login');
          return;
        }

        const user = JSON.parse(userData);
        console.log('👤 Menu: User role:', user.role);
        let restaurantId = null;
        let restaurant = null;

        // For staff members, use their assigned restaurant
        if (user.restaurantId) {
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
          const restaurantsResponse = await apiClient.getRestaurants();
          if (restaurantsResponse.restaurants && restaurantsResponse.restaurants.length > 0) {
            const savedRestaurantId = localStorage.getItem('selectedRestaurantId');
            const selectedRestaurant = restaurantsResponse.restaurants.find(r => r.id === savedRestaurantId) ||
                                      restaurantsResponse.restaurants[0];
            restaurantId = selectedRestaurant.id;
            restaurant = selectedRestaurant;
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
          setError('No restaurant found. Please set up a restaurant first.');
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Menu: Error loading restaurant context:', error);
        setError('Failed to load restaurant information: ' + error.message);
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

          if (user.restaurantId) {
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


  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesVegFilter = selectedVegFilter === 'all' || 
      (selectedVegFilter === 'veg' && item.isVeg) ||
      (selectedVegFilter === 'non-veg' && !item.isVeg);
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.shortCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesVegFilter && matchesSearch;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      const itemData = {
        ...formData,
        price: parseFloat(formData.price),
        restaurantId: currentRestaurant.id,
        variants: cleanedVariants,
        customizations: cleanedCustomizations
      };

      if (editingItem) {
        // Update existing item
        await apiClient.updateMenuItem(editingItem.id, itemData, currentRestaurant?.id);
        setMenuItems(items => items.map(item => 
          item.id === editingItem.id ? { ...itemData, id: editingItem.id } : item
        ));
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
            // Don't show alert, just log the error
          }
        }
        
        // Show success notification
        setSuccessMessage(`Menu item "${formData.name}" added successfully!`);
        setTimeout(() => setSuccessMessage(''), 3000);

      resetForm();
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      setError(`Failed to ${editingItem ? 'update' : 'add'} menu item: ${error.message}`);
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
      { name: 'Peg (30ml)', price: '', description: '' },
      { name: 'Large (60ml)', price: '', description: '' },
      { name: 'Bottle', price: '', description: '' },
      { name: 'Pitcher', price: '', description: '' }
    ];
    setFormData({
      ...formData,
      variants: [...(formData.variants || []), ...templates]
    });
  };

  const addBakeryPackVariants = () => {
    const templates = [
      { name: 'Single Piece', price: '', description: '' },
      { name: 'Box of 6', price: '', description: '' },
      { name: 'Box of 12', price: '', description: '' }
    ];
    setFormData({
      ...formData,
      variants: [...(formData.variants || []), ...templates]
    });
  };

  const addIceCreamScoopVariants = () => {
    const templates = [
      { name: 'Single Scoop', price: '', description: '' },
      { name: 'Double Scoop', price: '', description: '' },
      { name: 'Triple Scoop', price: '', description: '' }
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

  const handleEdit = (item) => {
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
      scoopOptions: item.scoopOptions?.toString() || ''
    });
    setEditingItem(item);
    setShowAddForm(true);
    setShowAdvancedOptions(false); // Collapse advanced options when editing
    // Don't trigger any loading states - just open the form
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      setOperationLoading(true);
      await apiClient.deleteMenuItem(itemId, currentRestaurant?.id);
      setMenuItems(items => items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting menu item:', error);
      setError('Failed to delete menu item');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleBulkDeleteClick = () => {
    console.log('🗑️ Bulk delete clicked. Current restaurant:', currentRestaurant);

    if (!currentRestaurant?.id) {
      console.error('❌ No restaurant selected for bulk delete');
      setError('No restaurant selected. Please refresh the page and try again.');
      return;
    }

    const activeItemsCount = menuItems.filter(item => item.status !== 'deleted').length;

    if (activeItemsCount === 0) {
      setError('No menu items to delete');
      return;
    }

    console.log('✅ Showing bulk delete confirmation for', activeItemsCount, 'items');
    // Show confirmation modal
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    try {
      setOperationLoading(true);
      setShowBulkDeleteConfirm(false);

      const response = await apiClient.bulkDeleteMenuItems(currentRestaurant.id);

      // Clear all menu items from state
      setMenuItems([]);

      // Show success message
      setSuccessMessage(`Successfully deleted ${response.deletedCount} menu items`);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);

      // Reload menu data to ensure consistency
      if (currentRestaurant?.id) {
        await loadMenuData(currentRestaurant.id, false);
      }
    } catch (error) {
      console.error('Error bulk deleting menu items:', error);
      setError('Failed to delete menu items: ' + (error.message || 'Unknown error'));

      // Clear error message after 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleToggleFavorite = async (item) => {
    if (!currentRestaurant?.id) {
      setError('No restaurant selected');
      return;
    }

    try {
      const isCurrentlyFavorite = item.isFavorite === true;
      
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
      await loadMenuData(currentRestaurant.id, false); // Don't use cache for immediate update
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError('Failed to update favorite status');
    }
  };

  const handleToggleAvailability = async (itemId, currentStatus) => {
    try {
      setOperationLoading(true);
      const updatedData = { isAvailable: !currentStatus };
      await apiClient.updateMenuItem(itemId, updatedData, currentRestaurant?.id);
      setMenuItems(items => items.map(item => 
        item.id === itemId ? { ...item, isAvailable: !currentStatus } : item
      ));
    } catch (error) {
      console.error('Error updating availability:', error);
      setError('Failed to update item availability');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  const handleCloseModal = () => {
    console.log('Closing modal');
    setShowItemModal(false);
    setSelectedItem(null);
    // Don't trigger any loading states - just close the modal
  };

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
      scoopOptions: ''
    });
    setEditingItem(null);
    setShowAddForm(false);
    setShowAdvancedOptions(false);
  };

  const getSpiceLevel = (level) => {
    switch(level) {
      case 'mild': return { icon: '🌶️', color: '#10B981', label: 'Mild' };
      case 'medium': return { icon: '🌶️🌶️', color: '#F59E0B', label: 'Medium' };
      case 'hot': return { icon: '🌶️🌶️🌶️', color: '#EF4444', label: 'Hot' };
      default: return { icon: '🌶️', color: '#10B981', label: 'Mild' };
    }
  };

  const getCategoryEmoji = (category) => {
    const categoryObj = categories.find(c => c.id === category);
    return categoryObj?.emoji || '🍽️';
  };

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
        setMenuItems(items => items.map(item => 
          item.id === editingItem.id 
            ? { ...item, images: [...(item.images || []), ...response.images] }
            : item
        ));
        
        // Don't show alert, just update the UI silently
      }
    } catch (error) {
      console.error('❌ Error uploading images:', error);
      alert(`Failed to upload images: ${error.message}`);
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
        setMenuItems(items => items.map(item => 
          item.id === editingItem.id 
            ? { 
                ...item, 
                images: (item.images || []).filter((_, index) => index !== imageIndex)
              }
            : item
        ));
        
        // Don't show alert, just update the UI silently
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image. Please try again.');
    }
  };


  const handleMenuItemsAdded = async () => {
    // Reload menu data when new items are added (including categories)
    if (currentRestaurant) {
      await loadMenuData(currentRestaurant.id, false); // Force fresh fetch to get new categories
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
            errors.push(`${file.name}: File too large (${Math.round(file.size / (1024 * 1024))}MB). Maximum 300MB per file.`);
            return;
          }
          
          if (file.size === 0) {
            errors.push(`${file.name}: Empty file.`);
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
            let errorMessage = 'No menu data found in the uploaded files.\n\n';
            
            if (noMenuDataFiles.length > 0) {
              errorMessage += `Files with no menu data:\n${noMenuDataFiles.map(f => `• ${f.file}: ${f.message}`).join('\n')}\n\n`;
            }
            
            if (failedFiles.length > 0) {
              errorMessage += `Files that failed to process:\n${failedFiles.map(f => `• ${f.file}: ${f.message}`).join('\n')}\n\n`;
            }
            
            errorMessage += 'Please try uploading:\n• Clear menu images\n• PDF files with menu content\n• Document files with menu data';
            
            setPhotoError(errorMessage);
            return;
          }
        } else {
          setPhotoError('No files were processed. Please try uploading menu files.');
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
        setPhotoError(response.error || 'Photo upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      setPhotoError(error.message || 'Photo upload failed. Please try again.');
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
          zIndex: 9999,
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
        padding: '20px', 
        position: 'relative',
        paddingBottom: '40px'
      }}>
        {/* Compact Header */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
              <div>
              <h1 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0,
                marginBottom: '4px'
              }}>
{t('menu.title')}
                </h1>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: 0
              }}>
{filteredItems.length} {t('common.items')} • {currentRestaurant?.name}
              </p>
          </div>
          
            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
              justifyContent: 'flex-end'
            }}>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                padding: '6px 12px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                whiteSpace: 'nowrap',
                minWidth: 'auto'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.backgroundColor = '#f3f4f6';
              }}
            >
              <FaPlus size={10} />
              {t('menu.freshOrder')}
            </button>
            <button
                onClick={() => setShowBulkUpload(true)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  whiteSpace: 'nowrap',
                  minWidth: 'auto'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.backgroundColor = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.backgroundColor = '#ef4444';
                }}
              >
                <FaCloudUploadAlt size={10} />
{t('menu.bulkUpload')}
            </button>
            <button
              onClick={handleCameraCapture}
                style={{
                  padding: '6px 12px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  whiteSpace: 'nowrap',
                  minWidth: 'auto'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                }}
              >
              <FaCamera size={10} />
              Take Photo
            </button>
            <button
              onClick={() => setShowQRCodeModal(true)}
              style={{
                padding: '6px 12px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                whiteSpace: 'nowrap',
                minWidth: 'auto'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <FaQrcode size={10} />
              QR Code
            </button>
            <button
              onClick={() => {
                const restaurantId = currentRestaurant?.id || localStorage.getItem('restaurantId');
                router.push(`/menu/customize${restaurantId ? `?restaurant=${restaurantId}` : ''}`);
              }}
              style={{
                padding: '8px 14px',
                backgroundColor: '#fef3c7',
                color: '#92400e',
                border: '1px solid #fbbf24',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                whiteSpace: 'nowrap',
                minWidth: 'auto'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.backgroundColor = '#fde68a';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.backgroundColor = '#fef3c7';
              }}
            >
              <FaEye size={10} />
              Customize Menu
            </button>
            <button
              onClick={handleBulkDeleteClick}
              disabled={operationLoading || menuItems.filter(item => item.status !== 'deleted').length === 0}
              style={{
                padding: '6px 12px',
                background: operationLoading || menuItems.filter(item => item.status !== 'deleted').length === 0
                  ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                  : 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '12px',
                cursor: operationLoading || menuItems.filter(item => item.status !== 'deleted').length === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                whiteSpace: 'nowrap',
                minWidth: 'auto',
                opacity: operationLoading || menuItems.filter(item => item.status !== 'deleted').length === 0 ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!operationLoading && menuItems.filter(item => item.status !== 'deleted').length > 0) {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
                }
              }}
              onMouseLeave={(e) => {
                if (!operationLoading && menuItems.filter(item => item.status !== 'deleted').length > 0) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                }
              }}
            >
              <FaTrash size={10} />
              Delete All Menu
            </button>
          </div>
        </div>
              </div>
        {/* Compact Filters */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '16px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {/* Search Bar */}
            <div style={{ width: '100%' }}>
              <div style={{ position: 'relative' }}>
                <FaSearch style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  fontSize: '14px'
                }} />
                  <input
                    type="text"
                  placeholder={t('menu.searchMenu')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: '#f9fafb',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = '#ffffff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.boxShadow = 'none';
                  }}
                  />
                </div>
              </div>
              
            {/* Filter Buttons */}
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              justifyContent: 'space-between'
            }}>
              {/* Veg Filter */}
              <CustomDropdown
                value={selectedVegFilter}
                onChange={setSelectedVegFilter}
                options={[
                  { value: 'all', label: t('menu.allTypes'), icon: '🍽️' },
                  { value: 'veg', label: t('common.veg'), icon: '🥬' },
                  { value: 'non-veg', label: t('common.nonVeg'), icon: '🍖' }
                ]}
                placeholder={t('menu.allTypes')}
                style={{ flex: 1, minWidth: '120px' }}
              />

              {/* Category Filter */}
              <CustomDropdown
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={[
                  { value: 'all', label: t('menu.allCategories'), icon: '🍽️' },
                  ...categories.map(category => ({ 
                    value: category.id, 
                    label: category.name, 
                    icon: category.emoji 
                  }))
                ]}
                placeholder={t('menu.allCategories')}
                style={{ flex: 1, minWidth: '140px' }}
              />
              
              {/* View Toggle */}
              <div style={{
                display: 'flex',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                padding: '2px',
                flexShrink: 0
              }}>
              <button
                onClick={() => setViewMode('grid')}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: viewMode === 'grid' ? '#ef4444' : 'transparent',
                    color: viewMode === 'grid' ? 'white' : '#6b7280',
                    fontWeight: '500',
                    fontSize: '11px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <FaTh size={12} />
                  {t('menu.gridView')}
              </button>
              <button
                onClick={() => setViewMode('list')}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: viewMode === 'list' ? '#ef4444' : 'transparent',
                    color: viewMode === 'list' ? 'white' : '#6b7280',
                    fontWeight: '500',
                    fontSize: '11px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <FaList size={12} />
                  {t('menu.listView')}
              </button>
            </div>
          </div>
        </div>
        </div>


        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <FaExclamationTriangle size={16} />
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <FaCheckCircle size={16} />
            {successMessage}
          </div>
        )}

        {/* Ultra Compact Menu Items Grid */}
        {/* Add New Dish Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
              minWidth: '120px',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
            }}
          >
            <FaPlus size={12} />
            {t('menu.addNewDish')}
          </button>
        </div>

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
              Loading Menu...
            </h3>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              Please wait while we fetch your menu items
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
                      Sample Menu
                    </h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#78350f', lineHeight: '1.5' }}>
                    This is a demo menu to help you explore DineOpen. Adding your own items will automatically replace it.
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
                    Upload Menu (AI)
                  </button>
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
                    Add Manually
                  </button>
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
                <p style={{ color: '#374151', fontWeight: '600', fontSize: '16px' }}>Processing...</p>
              </div>
            )}
            {viewMode === 'grid' ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px',
              padding: '0'
            }}>
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    animation: `fadeInUp 0.3s ease-out ${index * 0.03}s both`
                  }}
                >
                  <MenuItemCard
                  item={item}
                  categories={categories}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleAvailability={handleToggleAvailability}
                  onToggleFavorite={handleToggleFavorite}
                  getCategoryEmoji={getCategoryEmoji}
                  onItemClick={handleItemClick}
                />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {['appetizer', 'main-course', 'dessert', 'beverages', 'pizza', 'chinese', 'bread', 'rice', 'dal', 'south-indian', 'north-indian', 'fast-food'].filter(cat => 
                filteredItems.some(item => item.category === cat)
              ).map(category => {
                const categoryItems = filteredItems.filter(item => item.category === category);
                const categoryInfo = categories.find(c => c.id === category);
                const isCollapsed = collapsedCategories[category];
                
                return (
                <div key={category}>
                    <button
                      onClick={() => toggleCategoryCollapse(category)}
                      className="w-full bg-gray-50 px-6 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{categoryInfo?.emoji || '🍽️'}</span>
                        <h3 className="text-lg font-semibold text-gray-900 capitalize">
                          {categoryInfo?.name || category.split('-').join(' ')}
                    </h3>
                        <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-sm font-medium">
                          {categoryItems.length} items
                    </span>
                  </div>
                      {isCollapsed ? <FaChevronDown size={16} /> : <FaChevronUp size={16} />}
                    </button>
                    
                    {!isCollapsed && categoryItems.map((item) => (
                      <ListViewItem
                        key={item.id} 
                        item={item}
                        categories={categories}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleAvailability={handleToggleAvailability}
                        onToggleFavorite={handleToggleFavorite}
                        getCategoryEmoji={getCategoryEmoji}
                      />
                    ))}
                      </div>
                    );
                  })}
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
                radial-gradient(circle at 20% 80%, rgba(239, 68, 68, 0.05) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.05) 0%, transparent 50%)
              `,
              zIndex: 0
            }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '100px',
                height: '100px',
                backgroundColor: '#fef2f2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px auto',
                animation: 'bounce 2s infinite'
              }}>
                <FaUtensils size={40} style={{ color: '#ef4444' }} />
            </div>
              
              <h3 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                marginBottom: '16px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {searchTerm || selectedCategory !== 'all' ? t('menu.noDishesFound') : t('menu.menuReady')}
            </h3>
              
              <p style={{
                fontSize: '18px',
                color: '#374151',
                marginBottom: '8px',
                fontWeight: '500'
              }}>
                {(searchTerm || selectedCategory !== 'all') ? t('menu.tryDifferentSearch') : t('menu.createMenu')}
              </p>
              
              <p style={{
                color: '#6b7280',
                marginBottom: '32px',
                maxWidth: '500px',
                margin: '0 auto 32px auto',
                fontSize: '16px',
                lineHeight: '1.6'
              }}>
                {(searchTerm || selectedCategory !== 'all')
                  ? t('menu.trySearchingElse') 
                  : t('menu.setupRestaurantFirst')
                }
              </p>
              
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                {(searchTerm || selectedCategory !== 'all') ? (
            <button
                    onClick={() => setSearchTerm('')}
                    style={{
                      padding: '16px 32px',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                      transform: 'translateY(0)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
                    }}
                  >
                    Clear Search
            </button>
                ) : (
                  <>
            <button
              onClick={() => setShowAddForm(true)}
                      style={{
                        padding: '16px 32px',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                        transform: 'translateY(0)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
                      }}
                    >
                      New item
            </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>


      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000, // Higher than navigation (1000)
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#fef2f2'
            }}>
                <h2 style={{
                fontSize: '18px',
                  fontWeight: '600',
                color: '#dc2626',
                  margin: 0
                }}>
                  {editingItem ? 'Edit Dish' : 'Add New Dish'}
                </h2>
                <button
                  onClick={resetForm}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                  fontSize: '18px',
                    color: '#6b7280',
                    cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fee2e2';
                  e.currentTarget.style.color = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#6b7280';
                  }}
                >
                ×
                </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              {/* Mobile-friendly responsive grid */}
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
                    Dish Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                    placeholder="Enter dish name"
                    onFocus={(e) => e.target.style.borderColor = '#dc2626'}
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
                    Short Code
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
                    placeholder="e.g., DAL, SAM (optional)"
                    onFocus={(e) => e.target.style.borderColor = '#dc2626'}
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
                  Description
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
                  placeholder="Describe this dish..."
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
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
                    Price ({getCurrencySymbol()}) *
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
                    placeholder="Enter price"
                    onFocus={(e) => e.target.style.borderColor = '#dc2626'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
                
                {/* Category */}
                <div>
                  <CategoryDropdown
                    label="Category *"
                    value={formData.category}
                    onChange={(value) => setFormData({...formData, category: value})}
                    categories={categories}
                    placeholder="Select category"
                    restaurantId={currentRestaurant?.id}
                    onCategoryAdded={handleAddNewCategory}
                    onCategoryUpdated={handleCategoryUpdated}
                    onCategoryDeleted={handleCategoryDeleted}
                  />
                </div>
                
              </div>
              
              {/* Food Type - Mobile-friendly */}
              <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Food Type
                  </label>
                <div style={{ 
                  display: 'flex', 
                  gap: '8px',
                  flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
                }}>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, isVeg: true})}
                      style={{
                        flex: 1,
                      padding: '12px 16px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                      backgroundColor: formData.isVeg === true ? '#dc2626' : 'white',
                        color: formData.isVeg === true ? 'white' : '#6b7280',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'center'
                      }}
                    >
                      Veg
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, isVeg: false})}
                      style={{
                        flex: 1,
                      padding: '12px 16px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                      backgroundColor: formData.isVeg === false ? '#dc2626' : 'white',
                        color: formData.isVeg === false ? 'white' : '#6b7280',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'center'
                      }}
                    >
                      Non-Veg
                    </button>
                  </div>
                </div>

                {/* Bar-Specific Fields */}
                {isBarMode && (
                  <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#fdf2f8', borderRadius: '12px', border: '1px solid #fce7f3' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#831843', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🍸 Bar Details
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Spirit Category</label>
                        <select
                          value={formData.spiritCategory || ''}
                          onChange={(e) => setFormData({...formData, spiritCategory: e.target.value})}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                        >
                          <option value="">Select...</option>
                          <option value="whiskey">Whiskey</option>
                          <option value="vodka">Vodka</option>
                          <option value="rum">Rum</option>
                          <option value="gin">Gin</option>
                          <option value="tequila">Tequila</option>
                          <option value="beer">Beer</option>
                          <option value="wine">Wine</option>
                          <option value="cocktail">Cocktail</option>
                          <option value="mocktail">Mocktail</option>
                          <option value="shots">Shots</option>
                          <option value="mixer">Mixer</option>
                          <option value="snack">Bar Snack</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>ABV %</label>
                        <input
                          type="number"
                          value={formData.abv || ''}
                          onChange={(e) => setFormData({...formData, abv: e.target.value})}
                          placeholder="e.g., 40"
                          min="0"
                          max="100"
                          step="0.1"
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Ingredients (for cocktails)</label>
                        <input
                          type="text"
                          value={formData.ingredients || ''}
                          onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
                          placeholder="e.g., Bourbon, Simple Syrup, Angostura Bitters"
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Serving Unit</label>
                        <select
                          value={formData.servingUnit || ''}
                          onChange={(e) => setFormData({...formData, servingUnit: e.target.value})}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                        >
                          <option value="">Select...</option>
                          <option value="ml">ml</option>
                          <option value="peg">Peg</option>
                          <option value="glass">Glass</option>
                          <option value="bottle">Bottle</option>
                          <option value="pint">Pint</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Bottle Size</label>
                        <select
                          value={formData.bottleSize || ''}
                          onChange={(e) => setFormData({...formData, bottleSize: e.target.value})}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                        >
                          <option value="">Select...</option>
                          <option value="180ml">180ml</option>
                          <option value="375ml">375ml</option>
                          <option value="750ml">750ml</option>
                          <option value="1L">1L</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bakery-Specific Fields */}
                {isBakeryMode && (
                  <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#fef9ee', borderRadius: '12px', border: '1px solid #fde68a' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🧁 Bakery Details
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Unit</label>
                        <select
                          value={formData.unit || ''}
                          onChange={(e) => setFormData({...formData, unit: e.target.value})}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                        >
                          <option value="">Select...</option>
                          <option value="piece">Piece</option>
                          <option value="kg">Kg</option>
                          <option value="gram">Gram</option>
                          <option value="dozen">Dozen</option>
                          <option value="box">Box</option>
                          <option value="slice">Slice</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Weight</label>
                        <input
                          type="text"
                          value={formData.weight || ''}
                          onChange={(e) => setFormData({...formData, weight: e.target.value})}
                          placeholder="e.g., 250g, 1kg"
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Shelf Life (days)</label>
                        <input
                          type="number"
                          value={formData.shelfLife || ''}
                          onChange={(e) => setFormData({...formData, shelfLife: e.target.value})}
                          placeholder="e.g., 3"
                          min="0"
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>MFG Date</label>
                        <input
                          type="date"
                          value={formData.mfgDate || ''}
                          onChange={(e) => setFormData({...formData, mfgDate: e.target.value})}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Expiry Date</label>
                        <input
                          type="date"
                          value={formData.expiryDate || ''}
                          onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Ice Cream-Specific Fields */}
                {isIceCreamMode && (
                  <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🍦 Ice Cream Details
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Serving Size</label>
                        <select
                          value={formData.servingSize || ''}
                          onChange={(e) => setFormData({...formData, servingSize: e.target.value})}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                        >
                          <option value="">Select...</option>
                          <option value="scoop">Scoop</option>
                          <option value="cup">Cup</option>
                          <option value="cone">Cone</option>
                          <option value="sundae">Sundae</option>
                          <option value="shake">Shake</option>
                          <option value="tub">Tub</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Max Scoops</label>
                        <input
                          type="number"
                          value={formData.scoopOptions || ''}
                          onChange={(e) => setFormData({...formData, scoopOptions: e.target.value})}
                          placeholder="e.g., 3"
                          min="1"
                          max="5"
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>Use Customizations below for toppings (sprinkles, sauces, etc.)</p>
                  </div>
                )}

                {/* Image Upload Section - Always Available */}
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '12px'
                  }}>
                    Item Images (Max 4)
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
                    />
                      <p style={{ 
                    fontSize: '12px',
                        color: '#6b7280', 
                    margin: '8px 0 0 0',
                    fontStyle: 'italic'
                      }}>
                    💡 You can upload images anytime - they&apos;ll be saved when you submit the form
                      </p>
              </div>
              
              {/* AI Recipe Generation Toggle */}
              {!editingItem && (
                <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="checkbox"
                    id="generateRecipe"
                    checked={formData.generateRecipe}
                    onChange={(e) => setFormData({...formData, generateRecipe: e.target.checked})}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: '#16a34a',
                      cursor: 'pointer'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <label htmlFor="generateRecipe" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#166534', cursor: 'pointer' }}>
                      Generate Smart Recipe with AI
                    </label>
                    <p style={{ fontSize: '12px', color: '#15803d', margin: '2px 0 0 0' }}>
                      Automatically create a list of ingredients and quantities for inventory tracking.
                    </p>
                  </div>
                  <div style={{ fontSize: '20px' }}>🤖</div>
                </div>
              )}

              {/* Advanced Options - Variants & Customizations */}
              <div style={{ marginTop: '24px', marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    backgroundColor: showAdvancedOptions ? '#fee2e2' : '#f9fafb',
                    border: `2px solid ${showAdvancedOptions ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                    marginBottom: showAdvancedOptions ? '16px' : '0'
                  }}
                  onMouseEnter={(e) => {
                    if (!showAdvancedOptions) {
                      e.target.style.backgroundColor = '#f3f4f6';
                      e.target.style.borderColor = '#d1d5db';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!showAdvancedOptions) {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.borderColor = '#e5e7eb';
                    }
                  }}
                >
                  <span style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: showAdvancedOptions ? '#dc2626' : '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FaTags size={14} />
                    Advanced Options (Variants & Toppings)
                  </span>
                  {showAdvancedOptions ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                </button>

                {showAdvancedOptions && (
                  <div style={{
                    padding: '20px',
                    backgroundColor: '#fef7f0',
                    borderRadius: '8px',
                    border: '1px solid #fed7aa',
                    marginTop: '12px'
                  }}>
                    {/* Variants Section */}
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '12px'
                      }}>
                        <label style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          Variants (Different Sizes/Portions)
                        </label>
                        <button
                          type="button"
                          onClick={addVariant}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <FaPlus size={10} />
                          Add Variant
                        </button>
                        {isBarMode && (!formData.variants || formData.variants.length === 0) && (
                          <button
                            type="button"
                            onClick={addBarServingVariants}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#7c3aed',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            🍸 Add Serving Sizes (Peg/Large/Bottle)
                          </button>
                        )}
                        {isBakeryMode && (!formData.variants || formData.variants.length === 0) && (
                          <button
                            type="button"
                            onClick={addBakeryPackVariants}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#d97706',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            🧁 Add Pack Sizes (Piece/Box of 6/Box of 12)
                          </button>
                        )}
                        {isIceCreamMode && (!formData.variants || formData.variants.length === 0) && (
                          <button
                            type="button"
                            onClick={addIceCreamScoopVariants}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#2563eb',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            🍦 Add Scoop Sizes (Single/Double/Triple)
                          </button>
                        )}
                      </div>
                      {formData.variants && formData.variants.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {formData.variants.map((variant, index) => (
                            <div
                              key={index}
                              style={{
                                padding: '14px',
                                backgroundColor: 'white',
                                border: '1px solid #fde68a',
                                borderRadius: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                              }}
                            >
                              <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 120px auto',
                                gap: '10px' 
                              }}>
                                <input
                                  type="text"
                                  placeholder="Variant name (e.g., Half, Full, Small)"
                                  value={variant.name}
                                  onChange={(e) => updateVariant(index, 'name', e.target.value)}
                                  style={{
                                    padding: '10px 12px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    outline: 'none'
                                  }}
                                />
                                <input
                                  type="number"
                                  placeholder="Price"
                                  value={variant.price}
                                  onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                  style={{
                                    padding: '10px 12px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    outline: 'none'
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeVariant(index)}
                                  style={{
                                    padding: '10px',
                                    backgroundColor: '#fee2e2',
                                    color: '#dc2626',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                  }}
                                >
                                  <FaTrash size={10} />
                                </button>
                              </div>
                              <input
                                type="text"
                                placeholder="Description (optional)"
                                value={variant.description || ''}
                                onChange={(e) => updateVariant(index, 'description', e.target.value)}
                                style={{
                                  padding: '10px 12px',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  outline: 'none'
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{
                          fontSize: '13px',
                          color: '#6b7280',
                          fontStyle: 'italic',
                          padding: '12px',
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          border: '1px dashed #d1d5db'
                        }}>
                          No variants added. Add variants if this item has different sizes or portions (e.g., Half {getCurrencySymbol()}100, Full {getCurrencySymbol()}200).
                        </p>
                      )}
                    </div>

                    {/* Customizations Section */}
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '12px'
                      }}>
                        <label style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          Customizations (Toppings/Add-ons)
                        </label>
                        <button
                          type="button"
                          onClick={addCustomization}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <FaPlus size={10} />
                          Add Topping
                        </button>
                      </div>
                      {formData.customizations && formData.customizations.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {formData.customizations.map((customization, index) => (
                            <div
                              key={customization.id || index}
                              style={{
                                padding: '14px',
                                backgroundColor: 'white',
                                border: '1px solid #fde68a',
                                borderRadius: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                              }}
                            >
                              <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 120px auto',
                                gap: '10px' 
                              }}>
                                <input
                                  type="text"
                                  placeholder="Topping/Add-on name (e.g., Extra Cheese)"
                                  value={customization.name}
                                  onChange={(e) => updateCustomization(index, 'name', e.target.value)}
                                  style={{
                                    padding: '10px 12px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    outline: 'none'
                                  }}
                                />
                                <input
                                  type="number"
                                  placeholder="Extra Price"
                                  value={customization.price}
                                  onChange={(e) => updateCustomization(index, 'price', e.target.value)}
                                  style={{
                                    padding: '10px 12px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    outline: 'none'
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeCustomization(index)}
                                  style={{
                                    padding: '10px',
                                    backgroundColor: '#fee2e2',
                                    color: '#dc2626',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    minWidth: '40px'
                                  }}
                                >
                                  <FaTrash size={10} />
                                </button>
                              </div>
                              <input
                                type="text"
                                placeholder="Description (optional)"
                                value={customization.description || ''}
                                onChange={(e) => updateCustomization(index, 'description', e.target.value)}
                                style={{
                                  padding: '10px 12px',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  outline: 'none'
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{
                          fontSize: '13px',
                          color: '#6b7280',
                          fontStyle: 'italic',
                          padding: '12px',
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          border: '1px dashed #d1d5db'
                        }}>
                          No customizations added. Add toppings/add-ons if this item can be customized (e.g., Pizza toppings, Extra Cheese).
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Actions - Mobile-friendly */}
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                justifyContent: 'flex-end',
                paddingTop: '16px',
                borderTop: '1px solid #f3f4f6',
                flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
              }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#f3f4f6',
                    color: '#6b7280',
                    fontSize: '14px',
                    fontWeight: '500',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    width: window.innerWidth <= 768 ? '100%' : 'auto'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: processing ? '#d1d5db' : '#dc2626',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: processing ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    width: window.innerWidth <= 768 ? '100%' : 'auto'
                  }}
                >
                  {processing ? 'Processing...' : editingItem ? 'Update Dish' : 'Add Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      <BulkMenuUpload
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        restaurantId={currentRestaurant?.id}
        onMenuItemsAdded={handleMenuItemsAdded}
        currentMenuItems={menuItems}
      />

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRCodeModal}
        onClose={() => setShowQRCodeModal(false)}
        restaurantId={currentRestaurant?.id}
        restaurantName={currentRestaurant?.name}
        restaurant={currentRestaurant}
      />

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
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
          zIndex: 10000,
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
              Delete All Menu Items?
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
                Are you sure you want to delete <strong style={{ color: '#dc2626' }}>ALL {menuItems.filter(item => item.status !== 'deleted').length} menu items</strong>?
              </p>
              <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                This will delete all items from all categories. This action cannot be undone easily.
              </p>
            </div>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
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
                disabled={operationLoading}
                style={{
                  padding: '12px 24px',
                  background: operationLoading ? '#9ca3af' : 'linear-gradient(135deg, #ef4444, #dc2626)',
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
                  if (!operationLoading) e.target.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
                }}
                onMouseLeave={(e) => {
                  if (!operationLoading) e.target.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
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
        </div>
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
          zIndex: 10000, // Higher than navigation (1000)
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
      `}</style>
      
      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        categories={categories}
        isOpen={showItemModal}
        onClose={handleCloseModal}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleAvailability={handleToggleAvailability}
        getCategoryEmoji={getCategoryEmoji}
      />
    </div>
  );
};

export default MenuManagement;