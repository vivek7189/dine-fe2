'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FaChevronLeft, FaChevronRight, FaPlus, FaUtensils, FaLeaf, FaFire } from 'react-icons/fa';
import { getDisplayImage } from '../../../utils/placeholderImages';

// Vibrant pastel colors for chips
const CHIP_COLORS = [
  { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', active: 'bg-red-500' },
  { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', active: 'bg-orange-500' },
  { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', active: 'bg-amber-500' },
  { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', active: 'bg-green-500' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', active: 'bg-emerald-500' },
  { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200', active: 'bg-teal-500' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200', active: 'bg-cyan-500' },
  { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200', active: 'bg-sky-500' },
  { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', active: 'bg-blue-500' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', active: 'bg-indigo-500' },
  { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200', active: 'bg-violet-500' },
  { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', active: 'bg-purple-500' },
  { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', border: 'border-fuchsia-200', active: 'bg-fuchsia-500' },
  { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200', active: 'bg-pink-500' },
  { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', active: 'bg-rose-500' },
];

const Carousel3DMenu = ({ menu, categories, restaurant, addToCart, cart, currencySymbol = '₹' }) => {
  const [activeCategory, setActiveCategory] = useState(categories[0] || 'All');
  const [activeIndex, setActiveIndex] = useState(0);
  const categoriesRef = useRef(null);

  // Hide image check: global setting or per-item flag
  const shouldHideImage = (item) => restaurant?.posSettings?.hideMenuImages === true || item.hideImage;
  
  // Touch state
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Filter items by category
  const activeItems = useMemo(() => {
    return menu.filter(item => item.category === activeCategory);
  }, [menu, activeCategory]);

  // Reset index when category changes
  useEffect(() => {
    setActiveIndex(0);
    
    if (categoriesRef.current) {
      const activeButton = categoriesRef.current.querySelector(`[data-category="${activeCategory}"]`);
      if (activeButton) {
        activeButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [activeCategory]);

  // Navigation Handlers
  const handleNext = () => {
    if (activeIndex < activeItems.length - 1) {
      setActiveIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
    }
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrev();
  };

  // Touch Handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isSwipe = Math.abs(distance) > 50;

    if (isSwipe) {
      if (distance > 0) {
        // Swipe Left -> Next
        handleNext();
      } else {
        // Swipe Right -> Prev
        handlePrev();
      }
    }
    
    // Reset
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, activeItems]);

  // Card Style Calculation
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCardStyle = (index) => {
    const offset = index - activeIndex;
    const absOffset = Math.abs(offset);
    
    // Mobile-first: Ensure single view focus
    // On mobile, use screen width based spacing to push neighbors largely off-screen
    // Card width is 240px on mobile.
    const spacing = isMobile ? 260 : 320;
    const scale = absOffset === 0 ? 1 : 0.85; 
    const opacity = absOffset === 0 ? 1 : 0.0; // Hide neighbors completely on mobile per request "one view"? 
    // User said "render thsi for one view" and "prev card showin partial viiable". 
    // If I hide them (opacity 0), it's truly one view. But swipe feels empty?
    // Let's scale them down and push them back but keep slight opacity if implied "carousel". 
    // But user specifically said "render thsi for one view". I will hide neighbors visually or push them far.
    // If I hide opacity, it solves overlap.
    
    // Revised strategy: Visible neighbor but far away.
    const effectiveOpacity = absOffset === 0 ? 1 : (isMobile ? 0 : 0.4); 
    const zIndex = 100 - absOffset;
    const rotateY = offset * -2; 
    const translateX = offset * spacing;
    const translateZ = absOffset === 0 ? 0 : -100; // Push back neighbors in 3D space

    const isVisible = absOffset <= 1;

    return {
      transform: `translateX(${translateX}px) translateZ(${translateZ}px) scale(${scale}) rotateY(${rotateY}deg)`,
      zIndex,
      opacity: isVisible ? effectiveOpacity : 0,
      pointerEvents: offset === 0 ? 'auto' : 'none', 
      transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.5s ease',
      position: 'absolute',
      left: '50%',
      top: '50%',
      marginTop: 0,
      transformOrigin: 'center center',
      visibility: isVisible ? 'visible' : 'hidden',
      filter: offset === 0 ? 'drop-shadow(0 20px 40px rgba(0,0,0,0.2))' : 'none',
      cursor: offset === 0 ? 'default' : 'pointer'
    };
  };

  const activeItem = activeItems[activeIndex];

  const renderIndicators = () => {
    const maxIndicators = 8;
    const start = Math.max(0, Math.min(activeIndex - Math.floor(maxIndicators / 2), activeItems.length - maxIndicators));
    const visibleDots = activeItems.slice(start, start + maxIndicators);
    
    return (
        <div className="flex gap-2 items-center">
            {activeItems.length > maxIndicators && start > 0 && <span className="text-gray-300 text-xs">•••</span>}
            {visibleDots.map((_, i) => {
                const realIndex = start + i;
                return (
                    <button 
                        key={realIndex}
                        onClick={() => setActiveIndex(realIndex)}
                        className={`transition-all duration-300 rounded-full ${realIndex === activeIndex ? 'w-6 h-2 bg-red-500' : 'w-2 h-2 bg-gray-300 hover:bg-red-300'}`}
                    />
                );
            })}
            {activeItems.length > maxIndicators && (start + maxIndicators) < activeItems.length && <span className="text-gray-300 text-xs">•••</span>}
        </div>
    );
  };

  return (
    <div className="w-full h-screen relative flex flex-col font-sans overflow-hidden bg-gray-50 text-gray-800">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {activeItem && !shouldHideImage(activeItem) && (
           <div
             className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out transform scale-110 opacity-14"
             style={{
               backgroundImage: `url(${getDisplayImage(activeItem)})`,
               filter: 'blur(24px)'
             }}
           />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-gray-50/90" />
      </div>

      {/* Header */}
      <div className="relative z-20 pt-3 px-5 pb-1 flex justify-center items-center flex-shrink-0">
        <div className="text-center">
          <h1 className="text-lg font-bold tracking-tight text-gray-900">
            {restaurant?.name || 'Menu'}
          </h1>
          <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-0.5">Discover Delicious</p>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="relative z-20 mb-1 w-full flex-shrink-0">
        <div 
            ref={categoriesRef}
            className="flex gap-2 overflow-x-auto py-2 px-4 scrollbar-hide snap-x w-full"
        >
          {categories.map((cat, idx) => {
            const colorSet = CHIP_COLORS[idx % CHIP_COLORS.length];
            const isActive = activeCategory === cat;
            
            return (
              <button
                key={cat}
                data-category={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`
                  px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 snap-center shadow-sm flex-shrink-0 border
                  ${isActive 
                    ? `${colorSet.active} text-white border-transparent shadow-md transform scale-110` 
                    : `bg-white ${colorSet.text} ${colorSet.border} hover:bg-gray-50`}
                `}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D Carousel Stage */}
      <div 
        className="relative z-10 flex-1 min-h-0 flex items-center justify-center perspective-container overflow-hidden touch-none overscroll-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        
        {/* Navigation Buttons */}
        <button 
          onClick={handlePrev}
          disabled={activeIndex === 0}
          className={`absolute left-2 md:left-8 z-50 p-3 rounded-full bg-white border border-gray-200 shadow-lg text-gray-800 hover:text-red-600 active:scale-95 disabled:opacity-0 transition-all duration-300 ${activeIndex === 0 ? 'pointer-events-none' : 'cursor-pointer'}`}
          aria-label="Previous Item"
        >
          <FaChevronLeft size={20} />
        </button>

        <button 
          onClick={handleNext}
          disabled={activeIndex === activeItems.length - 1}
          className={`absolute right-2 md:right-8 z-50 p-3 rounded-full bg-white border border-gray-200 shadow-lg text-gray-800 hover:text-red-600 active:scale-95 disabled:opacity-0 transition-all duration-300 ${activeIndex === activeItems.length - 1 ? 'pointer-events-none' : 'cursor-pointer'}`}
          aria-label="Next Item"
        >
          <FaChevronRight size={20} />
        </button>

        {/* Carousel Items */}
        <div className="relative w-full h-full flex items-center justify-center">
          {activeItems.length > 0 ? (
            activeItems.map((item, index) => (
              <div 
                key={item.id}
                onClick={() => {
                    if (index !== activeIndex) setActiveIndex(index);
                }}
                className="w-[240px] md:w-[280px] aspect-[3/4] bg-white rounded-[22px] overflow-hidden shadow-xl border border-gray-100 flex flex-col"
                style={{
                    ...getCardStyle(index),
                    transform: `${getCardStyle(index).transform} translate(-50%, -50%)`,
                    maxHeight: '68vh',
                }}
              >
                {/* Image */}
                {!shouldHideImage(item) && (
                <div className="h-[52%] w-full relative overflow-hidden group bg-gray-100">
                  <img
                    src={getDisplayImage(item)}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                    {item.isVeg ? (
                      <div className="w-6 h-6 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center" title="Vegetarian">
                        <FaLeaf className="text-green-500 text-[10px]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center" title="Non-Veg">
                        <FaUtensils className="text-red-500 text-[10px]" />
                      </div>
                    )}
                    {item.isSpicy && (
                       <div className="w-6 h-6 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center" title="Spicy">
                        <FaFire className="text-orange-500 text-[10px]" />
                      </div>
                    )}
                  </div>
                  {/* Gradient Overlay */}
                  <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                )}

                {/* Content */}
                <div className={`${shouldHideImage(item) ? 'h-full' : 'h-[48%]'} bg-white p-3 flex flex-col justify-between relative z-10`}>
                  <div className="transform -translate-y-6 mb-[-14px]">
                     <div className="bg-white rounded-xl p-3 shadow border border-gray-100 text-center">
                        <h3 className="text-base font-extrabold text-gray-900 mb-1 line-clamp-1">{item.name}</h3>
                        <p className="text-gray-500 text-[11px] line-clamp-2 leading-relaxed">{item.description}</p>
                     </div>
                  </div>

                  <div className="flex items-end justify-between w-full pt-2">
                    <div className="flex flex-col">
                       <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Price</span>
                       <span className="text-lg font-black text-gray-900 leading-none">{currencySymbol}{item.price}</span>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item);
                      }}
                      className="group relative overflow-hidden rounded-lg bg-red-500 px-4 py-2 transition-all hover:bg-red-600 hover:shadow-md hover:shadow-red-200 active:scale-95 flex items-center gap-2"
                    >
                      <FaPlus className="text-white text-xs" />
                      <span className="font-bold text-white text-xs">ADD</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-400 text-sm font-medium bg-white px-6 py-3 rounded-full shadow-sm">No items in this category</div>
          )}
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="relative z-20 pb-6 pt-2 flex flex-col items-center gap-2 flex-shrink-0">
         {activeItems.length > 1 && (
             <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold opacity-60">
                {activeIndex + 1} / {activeItems.length}
             </p>
         )}
         {renderIndicators()}
      </div>
      
      <style jsx global>{`
        .perspective-container {
          perspective: 1200px;
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Carousel3DMenu;
