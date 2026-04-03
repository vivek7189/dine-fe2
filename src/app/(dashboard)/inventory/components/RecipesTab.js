'use client';

import { useState, useMemo } from 'react';
import { FaPlus, FaTrash, FaClock, FaUtensils, FaUsers, FaSearch, FaEdit, FaEye, FaLeaf, FaCoffee, FaFlask } from 'react-icons/fa';
import dynamic from 'next/dynamic';
const InventoryDownloadPDFButton = dynamic(() => import('./pdf/InventoryDownloadPDFButton'), { ssr: false });

const categoryColors = {
  'Tea Counter': { bg: '#fef3c7', color: '#92400e', icon: FaLeaf, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  'Coffee Counter': { bg: '#fce7f3', color: '#9d174d', icon: FaCoffee, gradient: 'linear-gradient(135deg, #6b4423, #8b5e3c)' },
  'Herbal & Speciality Tea': { bg: '#ede9fe', color: '#6d28d9', icon: FaFlask, gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
};
const defaultCategoryColor = { bg: '#ecfdf5', color: '#059669', icon: FaUtensils, gradient: 'linear-gradient(135deg, #059669, #10b981)' };

export default function RecipesTab({
  recipes,
  inventoryItems,
  categories,
  isMobile,
  formatCurrency,
  setShowAddRecipeModal,
  handleDeleteRecipe,
  handleEditRecipe,
  handleViewRecipe,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const recipeCategories = useMemo(() => {
    const cats = [...new Set(recipes.map(r => r.category).filter(Boolean))];
    return cats.sort();
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    let filtered = recipes;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => r.name?.toLowerCase().includes(term) || r.category?.toLowerCase().includes(term));
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }
    return filtered;
  }, [recipes, searchTerm, selectedCategory]);

  const getIngredientCost = (ingredient) => {
    const item = inventoryItems.find(i => i._id === ingredient.inventoryItemId || i.id === ingredient.inventoryItemId);
    if (!item) return 0;
    return (ingredient.quantity || 0) * (item.costPerUnit || 0);
  };

  const getCostPerServing = (recipe) => {
    const totalCost = (recipe.ingredients || []).reduce((sum, ing) => sum + getIngredientCost(ing), 0);
    return recipe.servings > 0 ? totalCost / recipe.servings : totalCost;
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1f2937' }}>Recipes</h2>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6b7280' }}>
            {filteredRecipes.length} of {recipes.length} recipe{recipes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowAddRecipeModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff',
            border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(5,150,105,0.3)',
          }}
        >
          <FaPlus size={13} /> Add Recipe
        </button>
        <InventoryDownloadPDFButton
          reportType="recipes"
          data={{ recipes }}
          org={{}}
          filename="recipes-report.pdf"
        />
      </div>

      {/* Search & Category Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: 400 }}>
          <FaSearch size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px 10px 36px',
              border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14,
              outline: 'none', backgroundColor: '#fff',
            }}
          />
        </div>
        {recipeCategories.length > 1 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['all', ...recipeCategories].map(cat => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, border: 'none',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    backgroundColor: isActive ? '#059669' : '#f3f4f6',
                    color: isActive ? '#fff' : '#6b7280',
                    transition: 'all 0.2s',
                  }}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Recipe Cards Grid */}
      {filteredRecipes.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px', backgroundColor: '#f9fafb',
          borderRadius: 14, border: '1px dashed #d1d5db',
        }}>
          <FaUtensils size={40} style={{ color: '#d1d5db', marginBottom: 12 }} />
          <h3 style={{ margin: '0 0 8px', fontSize: 18, color: '#6b7280', fontWeight: 600 }}>
            {searchTerm || selectedCategory !== 'all' ? 'No recipes found' : 'No recipes yet'}
          </h3>
          <p style={{ margin: 0, fontSize: 14, color: '#9ca3af' }}>
            {searchTerm || selectedCategory !== 'all'
              ? 'Try a different search or category.'
              : 'Create your first recipe to track ingredient costs.'}
          </p>
          {!searchTerm && selectedCategory === 'all' && (
            <button
              onClick={() => setShowAddRecipeModal(true)}
              style={{
                marginTop: 16, padding: '10px 24px', background: 'linear-gradient(135deg, #059669, #10b981)',
                color: '#fff', border: 'none', borderRadius: 10, fontSize: 14,
                fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(5,150,105,0.3)',
              }}
            >
              <FaPlus size={12} style={{ marginRight: 6 }} /> Add Recipe
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 16,
        }}>
          {filteredRecipes.map(recipe => {
            const costPerServing = getCostPerServing(recipe);
            const ingredients = recipe.ingredients || [];
            const catStyle = categoryColors[recipe.category] || defaultCategoryColor;
            const CatIcon = catStyle.icon;

            return (
              <div
                key={recipe._id || recipe.id}
                style={{
                  backgroundColor: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
                  overflow: 'hidden', display: 'flex', flexDirection: 'column',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
              >
                {/* Card Header with gradient */}
                <div style={{
                  background: catStyle.gradient,
                  padding: '14px 18px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      margin: 0, fontSize: 17, fontWeight: 700, color: '#fff',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {recipe.name}
                    </h3>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 5,
                      padding: '2px 10px', backgroundColor: 'rgba(255,255,255,0.25)',
                      borderRadius: 20, fontSize: 11, fontWeight: 600, color: '#fff',
                      backdropFilter: 'blur(4px)',
                    }}>
                      <CatIcon size={10} />
                      {recipe.category || 'Uncategorized'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button
                      onClick={() => handleViewRecipe(recipe)}
                      title="View details"
                      style={{
                        background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
                        cursor: 'pointer', padding: 7, borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(4px)', transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.4)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                    >
                      <FaEye size={13} />
                    </button>
                    <button
                      onClick={() => handleEditRecipe(recipe)}
                      title="Edit recipe"
                      style={{
                        background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
                        cursor: 'pointer', padding: 7, borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(4px)', transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.4)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                    >
                      <FaEdit size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteRecipe(recipe._id || recipe.id)}
                      title="Delete recipe"
                      style={{
                        background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
                        cursor: 'pointer', padding: 7, borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(4px)', transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.6)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                  {/* Stats Chips */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {recipe.servings > 0 && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#059669',
                        backgroundColor: '#ecfdf5', padding: '3px 10px', borderRadius: 20, fontWeight: 600,
                      }}>
                        <FaUsers size={10} /> {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}
                      </span>
                    )}
                    {recipe.prepTime > 0 && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#d97706',
                        backgroundColor: '#fffbeb', padding: '3px 10px', borderRadius: 20, fontWeight: 600,
                      }}>
                        <FaClock size={10} /> {recipe.prepTime}m prep
                      </span>
                    )}
                    {recipe.cookTime > 0 && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#dc2626',
                        backgroundColor: '#fef2f2', padding: '3px 10px', borderRadius: 20, fontWeight: 600,
                      }}>
                        <FaUtensils size={10} /> {recipe.cookTime}m cook
                      </span>
                    )}
                  </div>

                  {/* Ingredients */}
                  {ingredients.length > 0 && (
                    <div>
                      <p style={{
                        margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: '#9ca3af',
                        textTransform: 'uppercase', letterSpacing: 0.5,
                      }}>
                        Ingredients ({ingredients.length})
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {ingredients.map((ing, idx) => (
                          <span key={idx} style={{
                            fontSize: 12, color: '#374151', backgroundColor: '#f3f4f6',
                            padding: '3px 8px', borderRadius: 6,
                          }}>
                            {ing.quantity}{ing.unit} {ing.inventoryItemName || '?'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description preview */}
                  {recipe.description && (
                    <p style={{
                      margin: 0, fontSize: 12, color: '#9ca3af', lineHeight: 1.4,
                      overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {recipe.description}
                    </p>
                  )}
                </div>

                {/* Card Footer */}
                <div style={{
                  padding: '12px 18px', borderTop: '1px solid #f3f4f6',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  backgroundColor: '#fafafa',
                }}>
                  <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>Cost per serving</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#059669' }}>
                    {formatCurrency(costPerServing)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
