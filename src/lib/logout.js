/**
 * Logout utility function
 * Clears all localStorage and sessionStorage data and redirects to main domain login
 */

export const performLogout = () => {
  try {
    // Clear ALL localStorage data (including all cache keys)
    // Instead of removing specific keys, clear everything
    if (typeof window !== 'undefined' && window.localStorage) {
      // Get all keys first to log them (for debugging)
      const allKeys = Object.keys(localStorage);
      console.log('Clearing localStorage keys:', allKeys);
      
      // Clear all localStorage
      localStorage.clear();
    }
    
    // Clear ALL sessionStorage data
    if (typeof window !== 'undefined' && window.sessionStorage) {
      // Get all keys first to log them (for debugging)
      const allSessionKeys = Object.keys(sessionStorage);
      console.log('Clearing sessionStorage keys:', allSessionKeys);
      
      // Clear all sessionStorage
      sessionStorage.clear();
    }
    
    // Clear cookies (for cross-subdomain SSO)
    if (typeof document !== 'undefined') {
      const isProduction = window.location.hostname.includes('dineopen.com');
      const domain = isProduction ? '.dineopen.com' : '';
      
      // Clear all possible auth cookies
      const cookiesToClear = [
        'dine_auth_token',
        'dine_user_data',
        'authToken',
        'user',
        'restaurant',
        'selectedRestaurant',
        'selectedRestaurantId'
      ];
      
      cookiesToClear.forEach(cookieName => {
        // Clear with domain
        if (domain) {
          document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax${isProduction ? ';Secure' : ''};domain=${domain}`;
        }
        // Clear without domain (for current domain)
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax${isProduction ? ';Secure' : ''}`;
        // Clear with root path
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
      });
    }
    
    // Clear IndexedDB if needed (for future use)
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      // Note: IndexedDB requires async operations, but we'll clear it if possible
      try {
        indexedDB.databases().then(databases => {
          databases.forEach(db => {
            if (db.name && db.name.includes('dine')) {
              indexedDB.deleteDatabase(db.name);
            }
          });
        }).catch(err => {
          console.warn('Could not clear IndexedDB:', err);
        });
      } catch (err) {
        console.warn('IndexedDB not available:', err);
      }
    }
    
    console.log('✅ All storage cleared successfully');
  } catch (error) {
    console.error('Error during logout cleanup:', error);
    // Even if there's an error, try to clear what we can
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
  }
  
  // Redirect to login page (handle both production and development)
  if (typeof window !== 'undefined') {
    const isProduction = window.location.hostname.includes('dineopen.com');
    const loginUrl = isProduction ? 'https://dineopen.com/login' : '/login';
    window.location.href = loginUrl;
  }
};

export default performLogout;
