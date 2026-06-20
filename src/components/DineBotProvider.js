'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import DineBot from './DineBot';
import DineBotButton from './DineBotButton';
import apiClient from '../lib/api';
import { getPlatform } from '../utils/platform';

const DineBotContext = createContext();

export const useDineBot = () => {
  const context = useContext(DineBotContext);
  if (!context) {
    throw new Error('useDineBot must be used within a DineBotProvider');
  }
  return context;
};

// Small speech-bubble nudge component
function DineBotNudge({ text, onClick, onDismiss }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 90,
        left: 20,
        maxWidth: 260,
        padding: '10px 14px',
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        zIndex: 998,
        fontSize: 13,
        color: '#374151',
        lineHeight: 1.4,
        cursor: 'pointer',
        animation: 'dinebotNudgeIn 0.3s ease-out',
      }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <span style={{ fontSize: 16 }}>🤖</span>
        <span style={{ flex: 1 }}>{text}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#9ca3af', fontSize: 14, padding: 0, lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>
      <style>{`
        @keyframes dinebotNudgeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export const DineBotProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [restaurantId, setRestaurantId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [nudge, setNudge] = useState(null);
  const pathname = usePathname();

  // Build context from localStorage + pathname + platform
  const [botContext, setBotContext] = useState({
    currentPage: '/',
    platform: 'web',
    userRole: null,
    userName: null,
    setupStatus: {},
  });

  // Load user & restaurant context on mount and when restaurant changes
  useEffect(() => {
    const loadContext = () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const restaurant = JSON.parse(localStorage.getItem('selectedRestaurant') || '{}');
        const checklist = JSON.parse(localStorage.getItem('onboardingChecklist') || '{}');
        const platform = getPlatform();

        const rid = restaurant?.id || localStorage.getItem('selectedRestaurantId');
        if (rid && rid !== restaurantId) {
          setRestaurantId(rid);
        }

        setBotContext(prev => ({
          ...prev,
          platform,
          userRole: user.role || null,
          userName: user.name || user.displayName || null,
          setupStatus: {
            hasMenu: !!(checklist.menuSetup || (restaurant.menuItemCount && restaurant.menuItemCount > 0)),
            menuItemCount: checklist.menuItemCount || restaurant.menuItemCount || 0,
            hasTables: !!(checklist.tablesConfigured || restaurant.tableCount),
            hasPrinter: !!(checklist.printerConfigured || restaurant.printerConfigured),
            hasStaff: !!(checklist.staffAdded || restaurant.staffCount),
            businessType: checklist.businessType || restaurant.businessType || null,
            featuresConfigured: !!checklist.featuresConfigured,
          },
        }));
      } catch (e) {
        // Silently continue with defaults
      }
    };

    loadContext();

    // Listen for restaurant changes
    const handleRestaurantChange = () => loadContext();
    window.addEventListener('restaurantChanged', handleRestaurantChange);
    window.addEventListener('storage', handleRestaurantChange);
    return () => {
      window.removeEventListener('restaurantChanged', handleRestaurantChange);
      window.removeEventListener('storage', handleRestaurantChange);
    };
  }, []);

  // Track current page
  useEffect(() => {
    setBotContext(prev => {
      if (prev.currentPage === pathname) return prev;
      return { ...prev, currentPage: pathname };
    });
  }, [pathname]);

  // Fetch suggestions on page change (debounced)
  useEffect(() => {
    const rid = restaurantId || botContext.restaurantId;
    if (!rid || !pathname) return;

    const timer = setTimeout(async () => {
      try {
        const res = await apiClient.getDineBotSuggestions(rid, {
          ...botContext,
          currentPage: pathname,
        });
        if (res?.success && res.suggestions) {
          setSuggestions(res.suggestions);
        }
      } catch (e) {
        // Silently fail — suggestions are non-critical
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [pathname, restaurantId]);

  // Nudge system — show proactive tip once per page per session
  useEffect(() => {
    if (isOpen) { setNudge(null); return; }

    const nudgeKey = `dinebot_nudge_${pathname}`;
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(nudgeKey)) return;

    const { setupStatus } = botContext;
    const nudgeRules = {
      '/menu': !setupStatus?.hasMenu && 'Need help uploading your menu? I can guide you through it!',
      '/admin': !setupStatus?.hasPrinter && 'Want help setting up your printer? Just ask me!',
      '/home': !setupStatus?.hasMenu && !setupStatus?.hasTables && 'Hi! I can help you get your restaurant set up. Click me to get started!',
      '/inventory': 'Need help tracking stock? I can show you how to set up inventory and recipes.',
      '/tables': !setupStatus?.hasTables && 'Need help creating your table layout? I can walk you through it!',
    };

    const nudgeText = nudgeRules[pathname];
    if (nudgeText && typeof nudgeText === 'string') {
      const timer = setTimeout(() => {
        setNudge(nudgeText);
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(nudgeKey, 'true');
        }
        // Auto-dismiss after 10 seconds
        setTimeout(() => setNudge(null), 10000);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [pathname, isOpen, botContext.setupStatus]);

  const openDineBot = useCallback((currentRestaurantId) => {
    setRestaurantId(currentRestaurantId);
    setIsOpen(true);
    setNudge(null);
  }, []);

  const closeDineBot = useCallback(() => {
    setIsOpen(false);
    setRestaurantId(null);
  }, []);

  const value = useMemo(() => ({
    isOpen,
    restaurantId,
    openDineBot,
    closeDineBot
  }), [isOpen, restaurantId, openDineBot, closeDineBot]);

  return (
    <DineBotContext.Provider value={value}>
      {children}
      <DineBotButton />
      {nudge && (
        <DineBotNudge
          text={nudge}
          onClick={() => {
            const rid = restaurantId || JSON.parse(localStorage.getItem('selectedRestaurant') || '{}')?.id;
            if (rid) openDineBot(rid);
          }}
          onDismiss={() => setNudge(null)}
        />
      )}
      <DineBot
        restaurantId={restaurantId}
        isOpen={isOpen}
        onClose={closeDineBot}
        context={botContext}
        suggestions={suggestions}
      />
    </DineBotContext.Provider>
  );
};
