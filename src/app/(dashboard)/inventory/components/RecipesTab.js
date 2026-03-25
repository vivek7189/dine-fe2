'use client';

import { useState, useMemo } from 'react';
import { FaPlus, FaTrash, FaClock, FaUtensils, FaUsers, FaSearch } from 'react-icons/fa';

export default function RecipesTab({
  recipes,
  inventoryItems,
  categories,
  isMobile,
  formatCurrency,
  setShowAddRecipeModal,
  handleDeleteRecipe,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecipes = useMemo(() => {
    if (!searchTerm.trim()) return recipes;
    const term = searchTerm.toLowerCase();
    return recipes.filter((r) => r.name?.toLowerCase().includes(term));
  }, [recipes, searchTerm]);

  const getIngredientCost = (ingredient) => {
    const item = inventoryItems.find((i) => i._id === ingredient.inventoryItemId);
    if (!item) return 0;
    return (ingredient.quantity || 0) * (item.costPerUnit || 0);
  };

  const getCostPerServing = (recipe) => {
    const totalCost = (recipe.ingredients || []).reduce(
      (sum, ing) => sum + getIngredientCost(ing),
      0
    );
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
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1f2937' }}>
            Recipes
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6b7280' }}>
            {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={() => setShowAddRecipeModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', backgroundColor: '#059669', color: '#fff',
            border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <FaPlus size={13} /> Add Recipe
        </button>
      </div>

      {/* Search */}
      <div style={{
        position: 'relative', marginBottom: 20, maxWidth: 400,
      }}>
        <FaSearch
          size={14}
          style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}
        />
        <input
          type="text"
          placeholder="Search recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%', padding: '10px 12px 10px 36px',
            border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14,
            outline: 'none', backgroundColor: '#fff',
          }}
        />
      </div>

      {/* Recipe Cards Grid */}
      {filteredRecipes.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px', backgroundColor: '#f9fafb',
          borderRadius: 12, border: '1px dashed #d1d5db',
        }}>
          <FaUtensils size={40} style={{ color: '#d1d5db', marginBottom: 12 }} />
          <h3 style={{ margin: '0 0 8px', fontSize: 18, color: '#6b7280', fontWeight: 600 }}>
            {searchTerm ? 'No recipes found' : 'No recipes yet'}
          </h3>
          <p style={{ margin: 0, fontSize: 14, color: '#9ca3af' }}>
            {searchTerm
              ? 'Try a different search term.'
              : 'Create your first recipe to track ingredient costs.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowAddRecipeModal(true)}
              style={{
                marginTop: 16, padding: '10px 24px', backgroundColor: '#059669',
                color: '#fff', border: 'none', borderRadius: 8, fontSize: 14,
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              <FaPlus size={12} style={{ marginRight: 6 }} /> Add Recipe
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: 16,
        }}>
          {filteredRecipes.map((recipe) => {
            const costPerServing = getCostPerServing(recipe);
            const ingredients = recipe.ingredients || [];
            const visibleIngredients = ingredients.slice(0, 4);
            const remaining = ingredients.length - 4;

            return (
              <div
                key={recipe._id}
                style={{
                  backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e5e7eb',
                  padding: 20, display: 'flex', flexDirection: 'column', gap: 14,
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Name & Category */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      margin: 0, fontSize: 18, fontWeight: 700, color: '#111827',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {recipe.name}
                    </h3>
                    {recipe.category && (
                      <span style={{
                        display: 'inline-block', marginTop: 6, padding: '3px 10px',
                        backgroundColor: '#ecfdf5', color: '#059669', borderRadius: 20,
                        fontSize: 12, fontWeight: 600,
                      }}>
                        {recipe.category}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteRecipe(recipe._id)}
                    title="Delete recipe"
                    style={{
                      background: 'none', border: 'none', color: '#d1d5db',
                      cursor: 'pointer', padding: 6, borderRadius: 6, flexShrink: 0,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#d1d5db'; }}
                  >
                    <FaTrash size={14} />
                  </button>
                </div>

                {/* Stats Row */}
                <div style={{
                  display: 'flex', gap: 16, flexWrap: 'wrap',
                }}>
                  {recipe.servings > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#6b7280' }}>
                      <FaUsers size={12} style={{ color: '#059669' }} />
                      <span>{recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {recipe.prepTime > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#6b7280' }}>
                      <FaClock size={12} style={{ color: '#f59e0b' }} />
                      <span>{recipe.prepTime}m prep</span>
                    </div>
                  )}
                  {recipe.cookTime > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#6b7280' }}>
                      <FaUtensils size={12} style={{ color: '#ef4444' }} />
                      <span>{recipe.cookTime}m cook</span>
                    </div>
                  )}
                </div>

                {/* Ingredients */}
                {ingredients.length > 0 && (
                  <div>
                    <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Ingredients
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {visibleIngredients.map((ing, idx) => (
                        <span key={idx} style={{ fontSize: 13, color: '#4b5563' }}>
                          {ing.quantity} {ing.unit} {ing.inventoryItemName || 'Unknown item'}
                        </span>
                      ))}
                      {remaining > 0 && (
                        <span style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>
                          +{remaining} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Cost Per Serving */}
                <div style={{
                  marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #f3f4f6',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>
                    Cost per serving
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#059669' }}>
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
