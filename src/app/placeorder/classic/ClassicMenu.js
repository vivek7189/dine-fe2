import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaMinus, FaStar, FaLeaf, FaDrumstickBite } from 'react-icons/fa';
import { getDisplayImage } from '../../../utils/placeholderImages';
import PublicMenuBadge from '../../../components/PublicMenuBadge';

const ClassicMenu = ({ menu, categories, restaurant, addToCart, cart, removeFromCart, currencySymbol = '₹', dark = false, look = null, logoUrl = null }) => {
  // Menu look (Customer App → Branding): 'standard' (exactly the classes used before) | 'dark' |
  // 'green' (racing green + white + gold). `dark` is the older switch for 'dark'.
  const style = look || (dark ? 'dark' : 'standard');
  const GREEN = {
    page: 'bg-[#F3F7F4]', search: 'bg-white border-[#D6E5DB]', searchText: 'text-[#10291F] placeholder-[#7C9A88]', searchIcon: 'text-[#1F7A4D]',
    bar: 'bg-[#F3F7F4]/95 border-[#D6E5DB]', chipOff: 'bg-white text-[#0B3D2E] border border-[#CFE0D5] hover:bg-[#E7F1EA]',
    chipOn: 'bg-[#0B3D2E] text-white ring-2 ring-[#C9A227]', heading: 'text-[#0B3D2E]', count: 'text-[#0B3D2E] bg-[#E3EFE7]',
    card: 'bg-white border-[#E1ECE5]', imgBg: 'bg-[#E7F1EA]', name: 'text-[#10291F]', desc: 'text-[#5B7565]', price: 'text-[#1F7A4D]',
    add: 'bg-[#1F7A4D] border border-[#1F7A4D] text-white hover:bg-[#17633E]', step: 'bg-[#E7F1EA] border-[#CFE0D5]', stepBtn: 'text-[#0B3D2E] hover:bg-[#D6E9DC] active:bg-[#C4DECD]', stepQty: 'text-[#0B3D2E]',
    empty: 'text-[#7C9A88]', logoRing: 'bg-white ring-2 ring-[#C9A227]', hero: 'bg-[#0B3D2E]',
  };
  const t = style === 'green' ? GREEN : style === 'dark' ? {
    page: 'bg-black', search: 'bg-neutral-900 border-neutral-800', searchText: 'text-gray-100 placeholder-gray-500', searchIcon: 'text-gray-500',
    bar: 'bg-black/95 border-neutral-800', chipOff: 'bg-neutral-900 text-gray-300 border border-neutral-700 hover:bg-neutral-800',
    chipOn: 'bg-white text-black ring-2 ring-neutral-700', heading: 'text-white', count: 'text-gray-300 bg-neutral-800',
    card: 'bg-neutral-900 border-neutral-800', imgBg: 'bg-neutral-800', name: 'text-white', desc: 'text-gray-400', price: 'text-white',
    add: 'bg-white border border-white text-black hover:bg-gray-200', step: 'bg-neutral-800 border-neutral-700', stepBtn: 'text-white hover:bg-neutral-700 active:bg-neutral-600', stepQty: 'text-white',
    empty: 'text-gray-500', logoRing: 'bg-black ring-2 ring-white',
  } : {
    page: 'bg-gray-50', search: 'bg-white border-gray-100', searchText: 'text-gray-700 placeholder-gray-400', searchIcon: 'text-gray-400',
    bar: 'bg-gray-50/95 border-gray-100', chipOff: 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100',
    chipOn: 'bg-red-600 text-white shadow-red-200 ring-2 ring-red-100', heading: 'text-gray-800', count: 'text-gray-500 bg-gray-200',
    card: 'bg-white border-gray-100', imgBg: 'bg-gray-100', name: 'text-gray-800', desc: 'text-gray-500', price: 'text-gray-900',
    add: 'bg-white border border-red-200 text-red-600 hover:bg-red-50', step: 'bg-red-50 border-red-100', stepBtn: 'text-red-600 hover:bg-red-100 active:bg-red-200', stepQty: 'text-red-700',
    empty: 'text-gray-400', logoRing: 'bg-white',
  };
  const logo = logoUrl || restaurant?.logo || null;
  // Coloured looks show "breakfast-special-platter" as "breakfast special platter" (capitalize class does the rest).
  const catLabel = (c) => (style === 'standard' ? c : String(c).replace(/-+/g, ' '));
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

  // Dark look with no photo of their own: plain black header (their logo stands out), not the stock café photo.
  const headerImage = restaurant?.menuTheme?.headerImage || (style !== 'standard' ? null : "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop");

  return (
    <div className={`min-h-screen ${t.page} pb-24 font-sans`}>
      {/* Header Section */}
      <div className={`relative h-64 w-full ${style === 'green' ? t.hero : style === 'dark' ? 'bg-black' : 'bg-gray-900'} overflow-hidden`}>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={headerImage ? { backgroundImage: `url(${headerImage})` } : undefined}
        >
          {/* photo shade — not over a plain coloured header (it turned the green header black) */}
          {(headerImage || style === 'standard') && <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center justify-center text-white pb-12">
          <div className={`w-20 h-20 rounded-full ${t.logoRing} p-1 shadow-xl overflow-hidden shrink-0 mb-3`}>
             {/* Logo or Placeholder */}
             {logo ? (
               <img src={logo} alt="Logo" className="w-full h-full object-cover rounded-full" />
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
        <div className={`${t.search} rounded-xl shadow-lg p-3.5 flex items-center gap-3 border`}>
          <FaSearch className={`${t.searchIcon} ml-1`} />
          <input
            type="text"
            placeholder="Search for a dish..."
            className={`flex-1 outline-none ${t.searchText} bg-transparent text-sm font-medium`}
            style={style === 'dark' ? { background: 'transparent', color: '#f3f4f6' } : style === 'green' ? { background: 'transparent', color: '#10291F' } : undefined}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className={`sticky top-0 z-20 ${t.bar} backdrop-blur-sm pt-2 pb-4 px-4 shadow-sm border-b`}>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 max-w-3xl mx-auto">
          <button
            onClick={() => scrollToCategory('all')}
            className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all shadow-sm
              ${selectedCategory === 'all' 
                ? t.chipOn 
                : t.chipOff}`}
          >
            All
          </button>
          {categories.filter(c => c !== 'all').map(cat => (
            <button
              key={cat}
              onClick={() => scrollToCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all shadow-sm capitalize
                ${selectedCategory === cat 
                  ? t.chipOn 
                  : t.chipOff}`}
            >
              {catLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Menu List */}
      <div className="px-4 space-y-8 mt-4 max-w-3xl mx-auto">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} id={`category-${category}`} className="scroll-mt-40">
            <h3 className={`text-xl font-bold ${t.heading} mb-4 capitalize flex items-center gap-2`}>
              {catLabel(category)} <span className={`text-xs font-semibold ${t.count} px-2 py-0.5 rounded-full`}>{items.length}</span>
            </h3>
            
            <div className="space-y-4">
              {items.map(item => {
                const qty = getCartQuantity(item.id);
                const shouldHideImage = restaurant?.posSettings?.hideMenuImages === true || item.hideImage;
                const displayImage = shouldHideImage ? null : getDisplayImage(item);

                return (
                  <div key={item.id} className={`${t.card} p-3 rounded-2xl shadow-sm border flex gap-4 transition-all hover:shadow-md`}>
                    {/* Item Image */}
                    {!shouldHideImage && (
                    <div className={`w-28 h-28 shrink-0 rounded-xl overflow-hidden ${t.imgBg} relative group`}>
                      {displayImage ? (
                        <img src={displayImage} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${t.imgBg} text-3xl`}>🍽️</div>
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
                    )}

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
                      <div>
                        {item.badge && <div className="mb-1"><PublicMenuBadge badge={item.badge} /></div>}
                        <h4 className={`font-bold ${t.name} text-base leading-tight mb-1 truncate`}>{item.name}</h4>
                        <p className={`text-xs ${t.desc} line-clamp-2 leading-relaxed`}>{item.description || 'Delicious and freshly prepared.'}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className={`font-bold ${t.price} text-lg`}>
                          {currencySymbol}{item.price}
                        </div>

                        {qty === 0 ? (
                          <button 
                            onClick={() => addToCart(item)}
                            className={`${t.add} px-5 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1`}
                          >
                            ADD <FaPlus size={8} />
                          </button>
                        ) : (
                          <div className={`flex items-center ${t.step} rounded-lg border overflow-hidden shadow-sm h-9`}>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className={`px-3 h-full ${t.stepBtn} transition-colors flex items-center justify-center`}
                            >
                              <FaMinus size={10} />
                            </button>
                            <span className={`font-bold text-sm ${t.stepQty} w-6 text-center`}>{qty}</span>
                            <button 
                              onClick={() => addToCart(item)}
                              className={`px-3 h-full ${t.stepBtn} transition-colors flex items-center justify-center`}
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
          <div className={`text-center py-16 ${t.empty}`}>
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
