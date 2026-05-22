import React, { useState, useEffect, useCallback } from 'react';
import { FaRobot } from 'react-icons/fa';
import { useDineBot } from './DineBotProvider';

const DineBotButton = () => {
  const { openDineBot } = useDineBot();
  const [currentRestaurantId, setCurrentRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getRestaurantData = useCallback(() => {
    if (typeof window === 'undefined') return null;

    // Try full restaurant object first
    const restaurantData = localStorage.getItem('selectedRestaurant');
    if (restaurantData) {
      try {
        const parsed = JSON.parse(restaurantData);
        if (parsed.id) {
          setCurrentRestaurantId(parsed.id);
          setRestaurantName(parsed.name || 'Restaurant');
          return parsed.id;
        }
      } catch {}
    }

    // Fallback: just the ID
    const restaurantId = localStorage.getItem('selectedRestaurantId');
    if (restaurantId) {
      setCurrentRestaurantId(restaurantId);
      setRestaurantName('Restaurant');
      return restaurantId;
    }

    return null;
  }, []);

  useEffect(() => {
    // Try immediately
    getRestaurantData();

    // Retry after short delay (localStorage may not be ready on first render)
    const timer = setTimeout(getRestaurantData, 1000);

    // Listen for restaurant changes
    const handleRestaurantChange = (event) => {
      const restaurant = event.detail?.restaurant;
      if (restaurant) {
        setCurrentRestaurantId(restaurant.id);
        setRestaurantName(restaurant.name || 'Restaurant');
      }
    };

    const handleStorageChange = (event) => {
      if (event.key === 'selectedRestaurant' || event.key === 'selectedRestaurantId') {
        getRestaurantData();
      }
    };

    window.addEventListener('restaurantChanged', handleRestaurantChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('restaurantChanged', handleRestaurantChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [getRestaurantData]);

  const handleClick = () => {
    // Try to get restaurant data one more time before opening
    let id = currentRestaurantId;
    if (!id) {
      id = getRestaurantData();
    }

    if (id) {
      openDineBot(id);
    }
    // Silently do nothing if no restaurant — don't show an alert
  };

  // Don't render the button if no restaurant found
  if (!currentRestaurantId) return null;

  return (
    <button
      onClick={handleClick}
      style={{
        position: 'fixed',
        bottom: isMobile ? '20px' : '30px',
        left: '20px',
        width: isMobile ? '50px' : '56px',
        height: isMobile ? '50px' : '56px',
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4)',
        zIndex: 999,
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.6)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(239, 68, 68, 0.4)';
      }}
      title={`Ask DineBot about ${restaurantName}`}
    >
      <FaRobot size={isMobile ? 20 : 22} />
    </button>
  );
};

export default DineBotButton;
