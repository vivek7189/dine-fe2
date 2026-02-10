import React from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';
import { useCurrency } from '../../../../../contexts/CurrencyContext';

const ClassicMenuPreview = ({ restaurant, menu = [], device = 'mobile' }) => {
  const { formatCurrency } = useCurrency();
  const isMobile = device === 'mobile';
  
  // Dummy categories if none exist
  const categories = ['All', 'Starters', 'Main Course', 'Desserts', 'Beverages'];
  
  // Get sample items
  const displayItems = menu.length > 0 ? menu.slice(0, 4) : [
    { id: 1, name: 'Butter Chicken', price: 350, description: 'Creamy tomato gravy with tender chicken', isVeg: false },
    { id: 2, name: 'Paneer Tikka', price: 280, description: 'Spiced cottage cheese grilled to perfection', isVeg: true },
    { id: 3, name: 'Dal Makhani', price: 220, description: 'Black lentils cooked overnight with cream', isVeg: true },
    { id: 4, name: 'Garlic Naan', price: 40, description: 'Soft bread topped with garlic and butter', isVeg: true },
  ];

  const headerImage = restaurant?.menuTheme?.headerImage || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop";

  return (
    <div 
      className={`bg-gray-50 overflow-hidden shadow-2xl relative transition-all duration-300 ${
        isMobile ? 'w-[320px] h-[640px] rounded-[30px] border-8 border-gray-800' : 
        device === 'tablet' ? 'w-[768px] h-[1024px] rounded-[20px] border-8 border-gray-800' : 
        'w-full h-[600px] rounded-lg border border-gray-200'
      }`}
    >
      {/* Device Notch/Camera for Mobile */}
      {isMobile && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-50"></div>
      )}

      <div className="h-full overflow-y-auto no-scrollbar pb-20 relative">
        {/* Header Section */}
        <div className="relative h-48 w-full bg-gray-900 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${headerImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 pb-10 flex flex-col items-center justify-center text-white">
            <div className="w-16 h-16 rounded-full bg-white p-1 shadow-xl overflow-hidden shrink-0 mb-2">
               {restaurant?.logo ? (
                 <img src={restaurant.logo} alt="Logo" className="w-full h-full object-cover rounded-full" />
               ) : (
                 <div className="w-full h-full rounded-full bg-red-600 flex items-center justify-center text-2xl font-bold text-white">
                   {restaurant?.name?.[0] || 'R'}
                 </div>
               )}
            </div>
            <h1 className="text-xl font-bold leading-tight text-center">{restaurant?.name || 'Restaurant Name'}</h1>
            <p className="text-xs text-gray-200 mt-1 line-clamp-1 text-center opacity-90">{restaurant?.description || 'Authentic flavors'}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 -mt-5 relative z-10 mb-3">
          <div className="bg-white rounded-xl shadow-lg p-2.5 flex items-center gap-2 border border-gray-100">
            <FaSearch className="text-gray-400 text-xs ml-1" />
            <div className="flex-1 text-xs text-gray-400">Search for a dish...</div>
          </div>
        </div>

        {/* Categories */}
        <div className="px-4 pb-3 flex gap-2 overflow-hidden">
          {categories.map((cat, i) => (
            <div 
              key={i} 
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm
                ${i === 0 ? 'bg-red-600 text-white shadow-red-200' : 'bg-white text-gray-600 border border-gray-200'}`}
            >
              {cat}
            </div>
          ))}
        </div>

        {/* List */}
        <div className="px-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-800">Starters</h3>
          
          {displayItems.map((item) => (
            <div key={item.id} className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 flex gap-3">
              {/* Image */}
              <div className="w-20 h-20 shrink-0 rounded-lg bg-gray-100 relative overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                <div className="absolute top-1 left-1 bg-white/90 rounded p-0.5 shadow-sm">
                  <div className={`border ${item.isVeg ? 'border-green-600' : 'border-red-600'} p-[1px] flex items-center justify-center w-2.5 h-2.5`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col justify-between py-0.5">
                <div>
                  <h4 className="font-bold text-gray-800 text-sm leading-tight mb-0.5">{item.name}</h4>
                  <p className="text-[10px] text-gray-500 line-clamp-2">{item.description}</p>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <div className="font-bold text-gray-900 text-sm">{formatCurrency(item.price)}</div>
                  <div className="bg-white border border-red-200 text-red-600 px-3 py-1 rounded-md text-[10px] font-bold shadow-sm flex items-center gap-1">
                    ADD <FaPlus size={6} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassicMenuPreview;
