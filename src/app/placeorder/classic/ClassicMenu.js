import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaMinus, FaStar, FaLeaf, FaDrumstickBite } from 'react-icons/fa';
import { getDisplayImage } from '../../../utils/placeholderImages';

const ClassicMenu = ({ menu, categories, restaurant, addToCart, cart, removeFromCart, currencySymbol = '₹' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');

  // Filter items
  const filteredItems = menu.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group by category for list view
  const groupedItems = categories.reduce((acc, category) => {
    if (category === 'all') return acc;
    const items = menu.filter(item => item.category === category && (
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ));
    if (items.length > 0) acc[category] = items;
    return acc;
  }, {});

  // Handle scroll to update active category
  useEffect(() => {
    const handleScroll = () => {
      const categoryElements = categories.map(cat => document.getElementById(`category-${cat}`));
      for (const el of categoryElements) {
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 200) {
            setActiveCategory(el.id.replace('category-', ''));
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categories]);

  const scrollToCategory = (category) => {
    setSelectedCategory(category);
    if (category === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(`category-${category}`);
      if (element) {
        // Offset for header
        const y = element.getBoundingClientRect().top + window.pageYOffset - 180;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  const getCartQuantity = (itemId) => {
    const item = cart.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  };

  const headerImage = restaurant?.menuTheme?.headerImage || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      {/* Header Section */}
      <div className="relative h-64 w-full bg-gray-900 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${headerImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center justify-center text-white pb-12">
          <div className="w-20 h-20 rounded-full bg-white p-1 shadow-xl overflow-hidden shrink-0 mb-3">
             {/* Logo or Placeholder */}
             {restaurant?.logo ? (
               <img src={restaurant.logo} alt="Logo" className="w-full h-full object-cover rounded-full" />
             ) : (
               <div className="w-full h-full rounded-full bg-red-600 flex items-center justify-center text-3xl font-bold text-white">
                 {restaurant?.name?.[0] || 'R'}
               </div>
             )}
          </div>
          <h1 className="text-3xl font-bold leading-tight text-center shadow-sm">{restaurant?.name || 'Restaurant Name'}</h1>
          <p className="text-sm text-gray-200 mt-1 line-clamp-1 text-center opacity-90">{restaurant?.description || 'Authentic flavors, unforgettable moments.'}</p>
        </div>
      </div>

      {/* Floating Search Bar - Overlapping Header */}
      <div className="px-4 -mt-7 relative z-10 mb-4 max-w-xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-3.5 flex items-center gap-3 border border-gray-100">
          <FaSearch className="text-gray-400 ml-1" />
          <input
            type="text"
            placeholder="Search for a dish..."
            className="flex-1 outline-none text-gray-700 placeholder-gray-400 bg-transparent text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-sm pt-2 pb-4 px-4 shadow-sm border-b border-gray-100">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 max-w-3xl mx-auto">
          <button
            onClick={() => scrollToCategory('all')}
            className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all shadow-sm
              ${selectedCategory === 'all' 
                ? 'bg-red-600 text-white shadow-red-200 ring-2 ring-red-100' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
          >
            All
          </button>
          {categories.filter(c => c !== 'all').map(cat => (
            <button
              key={cat}
              onClick={() => scrollToCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all shadow-sm capitalize
                ${selectedCategory === cat 
                  ? 'bg-red-600 text-white shadow-red-200 ring-2 ring-red-100' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu List */}
      <div className="px-4 space-y-8 mt-4 max-w-3xl mx-auto">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} id={`category-${category}`} className="scroll-mt-40">
            <h3 className="text-xl font-bold text-gray-800 mb-4 capitalize flex items-center gap-2">
              {category} <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{items.length}</span>
            </h3>
            
            <div className="space-y-4">
              {items.map(item => {
                const qty = getCartQuantity(item.id);
                const displayImage = getDisplayImage(item);
                
                return (
                  <div key={item.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-4 transition-all hover:shadow-md">
                    {/* Item Image */}
                    <div className="w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-gray-100 relative group">
                      {displayImage ? (
                        <img src={displayImage} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-3xl">🍽️</div>
                      )}
                      {/* Veg/Non-Veg Badge on Image */}
                      <div className="absolute top-1.5 left-1.5 bg-white/90 backdrop-blur rounded p-1 shadow-sm">
                        {item.isVeg ? (
                          <div className="border border-green-600 p-[1px] flex items-center justify-center w-3 h-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                          </div>
                        ) : (
                          <div className="border border-red-600 p-[1px] flex items-center justify-center w-3 h-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
                      <div>
                        <h4 className="font-bold text-gray-800 text-base leading-tight mb-1 truncate">{item.name}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.description || 'Delicious and freshly prepared.'}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="font-bold text-gray-900 text-lg">
                          {currencySymbol}{item.price}
                        </div>

                        {qty === 0 ? (
                          <button 
                            onClick={() => addToCart(item)}
                            className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-5 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1"
                          >
                            ADD <FaPlus size={8} />
                          </button>
                        ) : (
                          <div className="flex items-center bg-red-50 rounded-lg border border-red-100 overflow-hidden shadow-sm h-9">
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="px-3 h-full text-red-600 hover:bg-red-100 transition-colors active:bg-red-200 flex items-center justify-center"
                            >
                              <FaMinus size={10} />
                            </button>
                            <span className="font-bold text-sm text-red-700 w-6 text-center">{qty}</span>
                            <button 
                              onClick={() => addToCart(item)}
                              className="px-3 h-full text-red-600 hover:bg-red-100 transition-colors active:bg-red-200 flex items-center justify-center"
                            >
                              <FaPlus size={10} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {Object.keys(groupedItems).length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No items found matching your search.</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ClassicMenu;
