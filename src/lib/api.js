import { reportNetworkFailure, reportNetworkSuccess } from '../hooks/useNetworkStatus';
import { setCachedData, getCachedData } from './offlineDb';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.isRefreshing = false;
    this.refreshQueue = [];

    // In-memory cache for GET requests (survives navigation, dies on page refresh)
    this._cache = new Map();
    // Track in-flight requests to prevent duplicate concurrent calls
    this._inflight = new Map();
  }

  /**
   * Cached GET request — returns cached data if available and not expired.
   * Deduplicates concurrent requests to the same endpoint.
   * @param {string} endpoint - API endpoint
   * @param {number} ttlMs - Cache TTL in milliseconds (default: 5 min)
   * @returns {Promise<any>} - API response data
   */
  async cachedGet(endpoint, ttlMs = 5 * 60 * 1000) {
    // Check in-memory cache
    const cached = this._cache.get(endpoint);
    if (cached && (Date.now() - cached.timestamp) < ttlMs) {
      return cached.data;
    }

    // Deduplicate: if same request is already in-flight, wait for it
    if (this._inflight.has(endpoint)) {
      return this._inflight.get(endpoint);
    }

    // Make the request and cache it
    const promise = this.request(endpoint)
      .then(data => {
        this._cache.set(endpoint, { data, timestamp: Date.now() });
        this._inflight.delete(endpoint);
        return data;
      })
      .catch(err => {
        this._inflight.delete(endpoint);
        throw err;
      });

    this._inflight.set(endpoint, promise);
    return promise;
  }

  /**
   * Invalidate cache entries matching a prefix (e.g., after a write operation)
   * @param {string} prefix - URL prefix to match (e.g., '/api/menus/')
   */
  invalidateCache(prefix) {
    for (const key of this._cache.keys()) {
      if (key.startsWith(prefix) || key.includes(prefix)) {
        this._cache.delete(key);
      }
    }
  }

  /**
   * Clear all cached data (e.g., on restaurant switch or logout)
   */
  clearAllCache() {
    this._cache.clear();
    this._inflight.clear();
  }

  // Process queued requests after token refresh
  processQueue(newToken) {
    this.refreshQueue.forEach(({ resolve }) => resolve(newToken));
    this.refreshQueue = [];
  }

  // Reject all queued requests on refresh failure
  rejectQueue(error) {
    this.refreshQueue.forEach(({ reject }) => reject(error));
    this.refreshQueue = [];
  }

  // Attempt to refresh the token
  async refreshToken() {
    const currentToken = this.getToken();
    if (!currentToken) {
      throw new Error('No token to refresh');
    }

    try {
      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Token refresh failed');
      }

      // Save the new token
      this.setToken(data.token);
      return data.token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  // Wait for token refresh if one is in progress
  waitForRefresh() {
    return new Promise((resolve, reject) => {
      this.refreshQueue.push({ resolve, reject });
    });
  }

  async request(endpoint, options = {}, isRetry = false) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();
    
    // SECURITY: Commented out to prevent exposing sensitive token data in console logs
    // console.log('🌐 API Request:', { endpoint, hasToken: !!token, method: options.method || 'GET' });
    // if (token) {
    //   console.log('🔑 Token preview:', token.substring(0, 20) + '...');
    // }

    // Merge headers properly to ensure Authorization token is always included
    const headers = {
      // Only set Content-Type for non-FormData requests
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
      // Always add Authorization token if available (this should override any conflicting header)
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const config = {
      ...options,
      headers,
    };

    // SECURITY: Commented out to prevent exposing sensitive auth data in console logs
    // console.log('🔧 Final request config:', {
    //   url,
    //   method: config.method,
    //   headers: config.headers,
    //   hasAuth: !!config.headers.Authorization,
    //   authValue: config.headers.Authorization ? config.headers.Authorization.substring(0, 20) + '...' : 'none',
    //   allHeaders: Object.keys(config.headers),
    //   optionsHeaders: options.headers ? Object.keys(options.headers) : 'none'
    // });

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      // Tauri desktop: route through Rust proxy for offline SQLite cache
      if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
        return await this._tauriRequest(endpoint, config);
      }

      // Electron desktop: route through Node.js main process for SQLite offline cache
      if (typeof window !== 'undefined' && window.electronAPI?.apiRequest) {
        return await this._electronRequest(endpoint, config);
      }

      const response = await fetch(url, config);

      // Report network success — we got a response from the server
      reportNetworkSuccess();

      // Handle non-JSON responses
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (jsonError) {
          // If JSON parsing fails, create error object
          data = { error: 'Invalid JSON response' };
        }
      } else {
        const text = await response.text();
        data = { error: text || 'API request failed' };
      }

      if (!response.ok) {
        // Staff/employee deactivated: clear auth and redirect to login (web + app)
        if (response.status === 401 && data && data.inactive === true) {
          this.forceLogout();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new Error(data.message || data.error || 'Your account has been deactivated.');
        }

        // Token expired or unauthorized: force logout and redirect
        if (response.status === 401) {
          console.log('🔒 401 Unauthorized - Token may be expired');
          this.forceLogout();
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          throw new Error(data.message || data.error || 'Session expired. Please login again.');
        }

        // Forbidden - check if it's a token expiration issue
        if (response.status === 403) {
          const errorMsg = data.error || data.message || '';

          // Check if this is a token expiration error (not a role/permission issue)
          if (errorMsg.toLowerCase().includes('invalid or expired token') && !isRetry) {
            console.log('🔄 Token expired - attempting refresh...');

            // If already refreshing, wait for it
            if (this.isRefreshing) {
              try {
                const newToken = await this.waitForRefresh();
                // Retry with new token
                return this.request(endpoint, options, true);
              } catch (refreshError) {
                this.forceLogout();
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                  window.location.href = '/login';
                }
                throw new Error('Session expired. Please login again.');
              }
            }

            // Start token refresh
            this.isRefreshing = true;

            try {
              const newToken = await this.refreshToken();
              this.isRefreshing = false;
              this.processQueue(newToken);

              console.log('✅ Token refreshed successfully - retrying request');
              // Retry the original request with new token
              return this.request(endpoint, options, true);
            } catch (refreshError) {
              this.isRefreshing = false;
              this.rejectQueue(refreshError);

              console.log('❌ Token refresh failed - logging out');
              this.forceLogout();
              if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                window.location.href = '/login';
              }
              throw new Error('Session expired. Please login again.');
            }
          }

          // Not a token issue - regular 403 forbidden (role/permission based)
          console.log('🚫 403 Forbidden - Access denied');
          throw new Error(data.message || data.error || 'Access denied.');
        }

        // Provide more specific error message for 404
        if (response.status === 404) {
          throw new Error(data.message || data.error || `Endpoint ${endpoint} not found`);
        }
        throw new Error(data.message || data.error || `API request failed (${response.status})`);
      }

      // Cache successful GET responses to IndexedDB for offline fallback (all pages)
      const method = (config.method || 'GET').toUpperCase();
      if (method === 'GET') {
        setCachedData(`api_${endpoint}`, data).catch(() => {});
      }

      return data;
    } catch (error) {
      // Network error (fetch itself failed — no response at all)
      // Chrome/Firefox: "Failed to fetch", Safari/WebKit/Tauri: "Load failed"
      const isNetworkError = error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Load failed') || error.message.includes('NetworkError') || error.message.includes('cancelled'));
      if (isNetworkError) {
        reportNetworkFailure();

        // Offline fallback: serve cached data for GET requests
        const method = (config.method || 'GET').toUpperCase();
        if (method === 'GET') {
          try {
            const cached = await getCachedData(`api_${endpoint}`);
            if (cached) return cached;
          } catch { /* cache miss — fall through to throw */ }
        }
      }
      // Only log if it's not a handled error to reduce console noise
      if (error.message && !error.message.includes('not found') && !error.message.includes('failed')) {
        console.error('API Error:', error);
      }
      throw error;
    }
  }

  // Tauri proxy: route API calls through Rust for SQLite offline cache
  async _tauriRequest(endpoint, config) {
    const method = (config.method || 'GET').toUpperCase();
    const headers = {};
    if (config.headers) {
      Object.keys(config.headers).forEach(k => {
        if (config.headers[k]) headers[k] = config.headers[k];
      });
    }

    const result = await window.__TAURI_INTERNALS__.invoke('api_request', {
      request: {
        endpoint,
        method,
        body: typeof config.body === 'string' ? config.body : null,
        headers: Object.keys(headers).length > 0 ? headers : null,
        cache_ttl: null,
      }
    });

    // Handle errors (mirror the fetch path behavior)
    if (result.error && result.status_code >= 400) {
      let errorData;
      try { errorData = JSON.parse(result.error); } catch { errorData = { error: result.error }; }

      // Staff deactivated
      if (result.status_code === 401 && errorData.inactive) {
        this.forceLogout();
        if (typeof window !== 'undefined') window.location.href = '/login';
        throw new Error(errorData.message || 'Your account has been deactivated.');
      }

      // Token expired
      if (result.status_code === 401) {
        this.forceLogout();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        throw new Error(errorData.message || errorData.error || 'Session expired. Please login again.');
      }

      // 403 with expired token — attempt refresh
      if (result.status_code === 403) {
        const errorMsg = errorData.error || errorData.message || '';
        if (errorMsg.toLowerCase().includes('invalid or expired token')) {
          try {
            await this.refreshToken();
            return this.request(endpoint, { ...config, method }, true);
          } catch {
            this.forceLogout();
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
            throw new Error('Session expired. Please login again.');
          }
        }
        throw new Error(errorData.message || errorData.error || 'Access denied.');
      }

      throw new Error(errorData.message || errorData.error || `API request failed (${result.status_code})`);
    }

    // Report network status — from_cache on Electron/Tauri just means "local-first SQLite",
    // not a network failure. Only report offline if navigator confirms no connectivity.
    if (result.from_cache && typeof navigator !== 'undefined' && !navigator.onLine) {
      reportNetworkFailure();
    } else if (!result.from_cache && !result.is_queued) {
      reportNetworkSuccess();
    }

    return result.data;
  }

  // Electron proxy: route API calls through Node.js main process for SQLite offline cache
  async _electronRequest(endpoint, config) {
    const method = (config.method || 'GET').toUpperCase();
    const headers = {};
    if (config.headers) {
      Object.keys(config.headers).forEach(k => {
        if (config.headers[k]) headers[k] = config.headers[k];
      });
    }

    if (method !== 'GET') {
      console.log(`[_electronRequest] ${method} ${endpoint} — sending IPC`);
    }

    const result = await window.electronAPI.apiRequest({
      endpoint,
      method,
      body: typeof config.body === 'string' ? config.body : (config.body ? JSON.stringify(config.body) : null),
      headers: Object.keys(headers).length > 0 ? headers : null,
    });

    if (method !== 'GET') {
      console.log(`[_electronRequest] ${method} ${endpoint} — result:`, { status_code: result?.status_code, error: result?.error, from_cache: result?.from_cache, is_queued: result?.is_queued, dataKeys: result?.data ? Object.keys(result.data) : null });
    }

    // Handle errors (same logic as _tauriRequest)
    // Check both top-level error field AND status_code (local router errors may have error=null but status>=400)
    if ((result.error || result.status_code >= 400) && result.status_code >= 400) {
      let errorData;
      const errStr = result.error || (result.data ? JSON.stringify(result.data) : 'Unknown error');
      try { errorData = typeof errStr === 'string' ? JSON.parse(errStr) : errStr; } catch { errorData = { error: errStr }; }

      if (result.status_code === 401 && errorData.inactive) {
        this.forceLogout();
        if (typeof window !== 'undefined') window.location.href = '/login';
        throw new Error(errorData.message || 'Your account has been deactivated.');
      }

      if (result.status_code === 401) {
        this.forceLogout();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        throw new Error(errorData.message || errorData.error || 'Session expired. Please login again.');
      }

      if (result.status_code === 403) {
        const errorMsg = errorData.error || errorData.message || '';
        if (errorMsg.toLowerCase().includes('invalid or expired token')) {
          try {
            await this.refreshToken();
            return this.request(endpoint, { ...config, method }, true);
          } catch {
            this.forceLogout();
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
            throw new Error('Session expired. Please login again.');
          }
        }
        throw new Error(errorData.message || errorData.error || 'Access denied.');
      }

      throw new Error(errorData.message || errorData.error || `API request failed (${result.status_code})`);
    }

    // Report network status — from_cache on Electron/Tauri just means "local-first SQLite",
    // not a network failure. Only report offline if navigator confirms no connectivity.
    if (result.from_cache && typeof navigator !== 'undefined' && !navigator.onLine) {
      reportNetworkFailure();
    } else if (!result.from_cache && !result.is_queued) {
      reportNetworkSuccess();
    }

    return result.data;
  }

  // HTTP method shortcuts
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body: data });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body: data });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'PATCH', body: data });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // File upload with FormData (supports progress tracking)
  async upload(endpoint, formData, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (options.onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            options.onProgress(progress);
          }
        };
      }

      xhr.onload = () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(response);
          } else {
            reject(new Error(response.error || 'Upload failed'));
          }
        } catch (e) {
          reject(new Error('Invalid response from server'));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during upload'));
      };

      xhr.open('POST', url);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);
    });
  }

  getToken() {
    // Use cookie-based storage for cross-subdomain SSO
    if (typeof document !== 'undefined') {
      // First try cookie (shared across subdomains)
      const cookieToken = this.getCookie('dine_auth_token');
      if (cookieToken) {
        // Sync to localStorage for backward compatibility
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', cookieToken);
        }
        return cookieToken;
      }
      
      // Fallback to localStorage (same domain)
      if (typeof window !== 'undefined') {
        const localToken = localStorage.getItem('authToken');
        // If found in localStorage but not cookie, sync to cookie
        if (localToken) {
          this.setCookie('dine_auth_token', localToken, 30, '.dineopen.com');
        }
        return localToken;
      }
    }
    return null;
  }

  setToken(token) {
    // Store in both cookie (for cross-subdomain SSO) and localStorage (for backward compatibility)
    if (typeof document !== 'undefined') {
      this.setCookie('dine_auth_token', token, 30, '.dineopen.com');
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  // Cookie helper methods for cross-subdomain SSO
  setCookie(name, value, days = 30, domain = '.dineopen.com') {
    if (typeof document === 'undefined') return;
    
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    
    // Set cookie with domain for subdomain sharing
    const isProduction = typeof window !== 'undefined' && window.location.hostname.includes('dineopen.com');
    const cookieString = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax${isProduction ? ';Secure' : ''}${isProduction ? `;domain=${domain}` : ''}`;
    document.cookie = cookieString;
  }

  getCookie(name) {
    if (typeof document === 'undefined') return null;
    
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
    
    return null;
  }

  deleteCookie(name, domain = '.dineopen.com') {
    if (typeof document === 'undefined') return;
    
    const isProduction = typeof window !== 'undefined' && window.location.hostname.includes('dineopen.com');
    // Set expiration to past date
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax${isProduction ? ';Secure' : ''}${isProduction ? `;domain=${domain}` : ''}`;
    // Also try without domain for current domain
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax${isProduction ? ';Secure' : ''}`;
  }

  clearToken() {
    if (typeof window !== 'undefined') {
      // Clear ALL localStorage (not just specific keys)
      // This ensures all cache keys are cleared too
      localStorage.clear();
      
      // Clear ALL sessionStorage
      sessionStorage.clear();
    }
  }

  // Sync auth data from cookies to localStorage (for cross-tab support)
  syncAuthFromCookies() {
    if (typeof window === 'undefined') return false;
    // getToken() and getUser() already check cookies first and sync to localStorage
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // Authentication utilities
  isAuthenticated() {
    if (typeof window === 'undefined') return false;
    // First check localStorage (fast path)
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    if (token && user) return true;
    // Fallback: check cookies and sync to localStorage (cross-tab support)
    return this.syncAuthFromCookies();
  }

  // Validate token with backend - returns true if valid, false if expired/invalid
  async validateToken() {
    if (typeof window === 'undefined') return false;
    const token = this.getToken();
    if (!token) return false;

    try {
      // Use getUserPageAccess as a lightweight endpoint to verify token
      // This endpoint requires auth and will return 401 if token is invalid
      const response = await fetch(`${this.baseURL}/api/user/page-access`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return true;
      }

      // Token is invalid or expired - clean up
      if (response.status === 401 || response.status === 403) {
        console.log('🔒 Token expired or invalid, logging out...');
        this.forceLogout();
        return false;
      }

      // Other errors (5xx, network issues) - don't logout, might be server issue
      // Return true to avoid logging out user on temporary server issues
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      // On network error, assume token might still be valid (offline mode)
      // Don't force logout on network issues
      return this.isAuthenticated();
    }
  }

  // Force logout - clears all auth data completely
  forceLogout() {
    if (typeof window === 'undefined') return;

    // Clear cookies
    this.deleteCookie('dine_auth_token');
    this.deleteCookie('dine_user_data');

    // Clear localStorage completely
    localStorage.clear();

    // Clear sessionStorage
    sessionStorage.clear();

    // Reset refresh state
    this.isRefreshing = false;
    this.refreshQueue = [];

    // Clear API cache
    this.clearAllCache();

    console.log('🚪 Force logout completed - all auth data cleared');
  }

  // Manually refresh the auth token - can be used proactively
  async refreshAuthToken() {
    try {
      const newToken = await this.refreshToken();
      console.log('✅ Auth token refreshed successfully');
      return { success: true, token: newToken };
    } catch (error) {
      console.error('❌ Failed to refresh auth token:', error);
      return { success: false, error: error.message };
    }
  }

  getUser() {
    // Use cookie-based storage for cross-subdomain SSO
    if (typeof document !== 'undefined') {
      // First try cookie (shared across subdomains)
      const cookieUser = this.getCookie('dine_user_data');
      if (cookieUser) {
        try {
          const userData = JSON.parse(decodeURIComponent(cookieUser));
          // Sync to localStorage for backward compatibility
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(userData));
          }
          return userData;
        } catch (error) {
          console.error('Failed to parse user data from cookie:', error);
        }
      }
      
      // Fallback to localStorage (same domain)
      if (typeof window !== 'undefined') {
        const localUser = localStorage.getItem('user');
        if (localUser) {
          try {
            const userData = JSON.parse(localUser);
            // Sync to cookie for cross-subdomain access
            this.setCookie('dine_user_data', encodeURIComponent(localUser), 30, '.dineopen.com');
            return userData;
          } catch (error) {
            console.error('Failed to parse user data from localStorage:', error);
          }
        }
      }
    }
    return null;
  }

  setUser(userData) {
    // Store in both cookie (for cross-subdomain) and localStorage (for backward compatibility)
    const userJson = JSON.stringify(userData);
    if (typeof document !== 'undefined') {
      this.setCookie('dine_user_data', encodeURIComponent(userJson), 30, '.dineopen.com');
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', userJson);
    }
  }

  getRedirectPath() {
    if (typeof window === 'undefined') return '/login';
    const user = this.getUser();
    if (!user) return '/login';

    // All authenticated users land on home page (role-based dashboard)
    return '/home';
  }

  // Auth endpoints
  async register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: userData,
    });
  }

  async verifyEmail(email, otp) {
    return this.request('/api/auth/verify-email', {
      method: 'POST',
      body: { email, otp },
    });
  }

  async login(credentials) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: credentials,
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async googleLogin(token) {
    const response = await this.request('/api/auth/google', {
      method: 'POST',
      body: { token, platform: 'dine-frontend' },
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async sendPhoneOTP(phone) {
    return this.request('/api/auth/phone/send-otp', {
      method: 'POST',
      body: { phone },
    });
  }

  async verifyPhoneOTP(phone, otp, name) {
    const response = await this.request('/api/auth/phone/verify-otp', {
      method: 'POST',
      body: { phone, otp, name, platform: 'dine-frontend' },
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  // Restaurant endpoints
  async getRestaurants() {
    return this.cachedGet('/api/restaurants', 10 * 60 * 1000); // 10 min — rarely changes
  }

  // Public Directory
  async getPublicRestaurants(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const queryString = query ? `?${query}` : '';
    return this.request(`/api/public/restaurants${queryString}`);
  }

  async createRestaurant(restaurantData) {
    return this.request('/api/restaurants', {
      method: 'POST',
      body: restaurantData,
    });
  }

  async updateRestaurant(restaurantId, updateData) {
    const result = await this.request(`/api/restaurants/${restaurantId}`, {
      method: 'PATCH',
      body: updateData,
    });
    this.invalidateCache('/api/restaurants');
    return result;
  }

  async deleteRestaurant(restaurantId) {
    return this.request(`/api/restaurants/${restaurantId}`, {
      method: 'DELETE',
    });
  }

  // Sub-restaurant endpoints
  async getSubRestaurants(restaurantId) {
    return this.request(`/api/restaurants/${restaurantId}/sub-restaurants`);
  }

  async createSubRestaurant(restaurantId, data) {
    return this.request(`/api/restaurants/${restaurantId}/sub-restaurants`, {
      method: 'POST',
      body: data,
    });
  }

  async updateSubRestaurant(restaurantId, subId, data) {
    return this.request(`/api/restaurants/${restaurantId}/sub-restaurants/${subId}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async deleteSubRestaurant(restaurantId, subId) {
    return this.request(`/api/restaurants/${restaurantId}/sub-restaurants/${subId}`, {
      method: 'DELETE',
    });
  }

  // Feedback Forms
  async getFeedbackForms(restaurantId) {
    return this.request(`/api/feedback/${restaurantId}/forms`);
  }
  async createFeedbackForm(restaurantId, data) {
    return this.request(`/api/feedback/${restaurantId}/forms`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
  }
  async getFeedbackForm(restaurantId, formId) {
    return this.request(`/api/feedback/${restaurantId}/forms/${formId}`);
  }
  async updateFeedbackForm(restaurantId, formId, data) {
    return this.request(`/api/feedback/${restaurantId}/forms/${formId}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
  }
  async deleteFeedbackForm(restaurantId, formId) {
    return this.request(`/api/feedback/${restaurantId}/forms/${formId}`, { method: 'DELETE' });
  }
  async generateFeedbackFormAI(restaurantId, prompt, restaurantType) {
    return this.request(`/api/feedback/${restaurantId}/forms/ai-generate`, { method: 'POST', body: JSON.stringify({ prompt, restaurantType }), headers: { 'Content-Type': 'application/json' } });
  }
  async getFeedbackAnalytics(restaurantId, formId, params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/feedback/${restaurantId}/forms/${formId}/analytics${query ? '?' + query : ''}`);
  }
  async getFeedbackOverview(restaurantId, days = 30) {
    return this.request(`/api/feedback/${restaurantId}/analytics/overview?days=${days}`);
  }
  async getFeedbackResponses(restaurantId, params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/feedback/${restaurantId}/responses${query ? '?' + query : ''}`);
  }
  async exportFeedbackResponses(restaurantId, params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/feedback/${restaurantId}/responses/export${query ? '?' + query : ''}`);
  }
  async generateFeedbackInsights(restaurantId, formId) {
    return this.request(`/api/feedback/${restaurantId}/forms/${formId}/ai-insights`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
  }
  async getFeedbackTemplates() {
    return this.request('/api/feedback/templates/list');
  }
  async getFeedbackTemplate(templateId) {
    return this.request(`/api/feedback/templates/${templateId}`);
  }

  // Menu endpoints
  async getMenu(restaurantId, category = null) {
    const query = category ? `?category=${category}` : '';
    return this.cachedGet(`/api/menus/${restaurantId}${query}`, 5 * 60 * 1000); // 5 min
  }

  async createMenuItem(restaurantId, menuItemData) {
    const result = await this.request(`/api/menus/${restaurantId}`, {
      method: 'POST',
      body: menuItemData,
    });
    this.invalidateCache(`/api/menus/${restaurantId}`);
    this.invalidateCache(`/api/categories/${restaurantId}`);
    return result;
  }

  async updateMenuItem(itemId, updateData, restaurantId) {
    const query = restaurantId ? `?restaurantId=${restaurantId}` : '';
    const result = await this.request(`/api/menus/item/${itemId}${query}`, {
      method: 'PATCH',
      body: updateData,
    });
    if (restaurantId) {
      this.invalidateCache(`/api/menus/${restaurantId}`);
      this.invalidateCache(`/api/categories/${restaurantId}`);
    }
    return result;
  }

  async deleteMenuItem(itemId, restaurantId) {
    const query = restaurantId ? `?restaurantId=${restaurantId}` : '';
    const result = await this.request(`/api/menus/item/${itemId}${query}`, {
      method: 'DELETE',
    });
    if (restaurantId) {
      this.invalidateCache(`/api/menus/${restaurantId}`);
      this.invalidateCache(`/api/categories/${restaurantId}`);
    }
    return result;
  }

  async bulkDeleteMenuItems(restaurantId) {
    const result = await this.request(`/api/menus/${restaurantId}/bulk-delete`, {
      method: 'DELETE',
    });
    this.invalidateCache(`/api/menus/${restaurantId}`);
    this.invalidateCache(`/api/categories/${restaurantId}`);
    return result;
  }

  async markMenuItemAsFavorite(restaurantId, itemId) {
    const result = await this.post(`/api/menus/${restaurantId}/item/${itemId}/favorite`);
    this.invalidateCache(`/api/menus/${restaurantId}`);
    return result;
  }

  async unmarkMenuItemAsFavorite(restaurantId, itemId) {
    const result = await this.delete(`/api/menus/${restaurantId}/item/${itemId}/favorite`);
    this.invalidateCache(`/api/menus/${restaurantId}`);
    return result;
  }

  // Bulk menu upload endpoints
  async bulkUploadMenu(restaurantId, formData) {
    const url = `${this.baseURL}/api/menus/bulk-upload/${restaurantId}`;
    const token = this.getToken();

    const config = {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let the browser set it for FormData
        ...(token && { Authorization: `Bearer ${token}` }),
      }
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async bulkSaveMenuItems(restaurantId, menuItems, categories = null) {
    const body = { menuItems };
    if (categories && Array.isArray(categories) && categories.length > 0) {
      body.categories = categories;
    }
    const result = await this.request(`/api/menus/bulk-save/${restaurantId}`, {
      method: 'POST',
      body,
    });
    this.invalidateCache(`/api/menus/${restaurantId}`);
    this.invalidateCache(`/api/categories/${restaurantId}`);
    return result;
  }

  async getUploadStatus(restaurantId) {
    return this.request(`/api/menus/upload-status/${restaurantId}`);
  }

  // Public API endpoints (no authentication required)
  async getPublicMenu(restaurantId) {
    return this.request(`/api/public/menu/${restaurantId}`);
  }

  async placePublicOrder(restaurantId, orderData) {
    return this.request(`/api/public/orders/${restaurantId}`, {
      method: 'POST',
      body: orderData,
    });
  }

  // Razorpay OAuth (restaurant payment gateway - public)
  async createRazorpayOrder(restaurantId, data) {
    return this.request(`/api/public/razorpay/create-order/${restaurantId}`, {
      method: 'POST',
      body: data,
    });
  }

  // Menu Theme APIs
  async getMenuTheme(restaurantId) {
    return this.request(`/api/menu-theme/${restaurantId}`);
  }

  async saveMenuTheme(restaurantId, themeData) {
    return this.request(`/api/menu-theme/${restaurantId}`, {
      method: 'POST',
      body: themeData,
    });
  }

  async getPublicMenuTheme(restaurantId) {
    return this.request(`/api/public/menu-theme/${restaurantId}`);
  }

  // Order endpoints
  async createOrder(orderData, extraOptions = {}) {
    console.log('📤 API Client - Creating order with data:', orderData);
    return this.request('/api/orders', {
      method: 'POST',
      body: orderData,
      ...extraOptions,
    });
  }

  async getOrders(restaurantId, filters = {}) {
    // Filter out undefined values to avoid sending them in query params
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null && value !== '')
    );
    const query = new URLSearchParams(cleanFilters).toString();
    const queryString = query ? `?${query}` : '';
    console.log('📤 API Client - getOrders filters:', cleanFilters);
    return this.request(`/api/orders/${restaurantId}${queryString}`);
  }

  async getOrderById(orderId) {
    return this.request(`/api/orders/single/${orderId}`);
  }

  async updateOrderStatus(orderId, status, restaurantId = null) {
    const body = { status };
    if (restaurantId) {
      body.restaurantId = restaurantId;
    }
    return this.request(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      body,
    });
  }

  async updateOrder(orderId, updateData, extraOptions = {}) {
    return this.request(`/api/orders/${orderId}`, {
      method: 'PATCH',
      body: updateData,
      ...extraOptions,
    });
  }

  async moveOrderToTable(orderId, { targetTableId, targetTableName, targetFloorId, targetFloorName, restaurantId }) {
    return this.request(`/api/orders/${orderId}/move-table`, {
      method: 'POST',
      body: { targetTableId, targetTableName, targetFloorId, targetFloorName, restaurantId },
    });
  }

  // Saved Carts (parked orders & templates — separate from orders, no side effects)
  async getSavedCarts(restaurantId, type = null) {
    const query = type ? `?type=${type}` : '';
    return this.request(`/api/saved-carts/${restaurantId}${query}`);
  }

  async createSavedCart(cartData, extraOptions = {}) {
    return this.request('/api/saved-carts', {
      method: 'POST',
      body: cartData,
      ...extraOptions,
    });
  }

  async updateSavedCart(cartId, updateData) {
    return this.request(`/api/saved-carts/${cartId}`, {
      method: 'PATCH',
      body: updateData,
    });
  }

  async deleteSavedCart(cartId) {
    return this.request(`/api/saved-carts/${cartId}`, {
      method: 'DELETE',
    });
  }

  // Payment endpoints
  async createPayment(orderData) {
    return this.request('/api/payments/create', {
      method: 'POST',
      body: orderData,
    });
  }

  async verifyPayment(paymentData) {
    return this.request('/api/payments/verify', {
      method: 'POST',
      body: paymentData,
    });
  }

  async completeOrder(orderId) {
    return this.request(`/api/orders/${orderId}/complete`, {
      method: 'POST',
    });
  }

  // Category Management APIs
  async getCategories(restaurantId) {
    return this.cachedGet(`/api/categories/${restaurantId}`, 10 * 60 * 1000); // 10 min
  }

  async createCategory(restaurantId, categoryData) {
    const result = await this.request(`/api/categories/${restaurantId}`, {
      method: 'POST',
      body: categoryData,
    });
    this.invalidateCache(`/api/categories/${restaurantId}`);
    return result;
  }

  async updateCategory(restaurantId, categoryId, categoryData) {
    const result = await this.request(`/api/categories/${restaurantId}/${categoryId}`, {
      method: 'PATCH',
      body: categoryData,
    });
    this.invalidateCache(`/api/categories/${restaurantId}`);
    return result;
  }

  async deleteCategory(restaurantId, categoryId) {
    const result = await this.request(`/api/categories/${restaurantId}/${categoryId}`, {
      method: 'DELETE',
    });
    this.invalidateCache(`/api/categories/${restaurantId}`);
    return result;
  }

  // Analytics endpoints
  async getAnalytics(restaurantId, period = '7d', options = {}) {
    const params = new URLSearchParams({ period });
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    return this.request(`/api/analytics/${restaurantId}?${params.toString()}`);
  }

  async getDailySummary(restaurantId, options = {}) {
    const params = new URLSearchParams();
    if (options.date) params.append('date', options.date);
    if (options.period) params.append('period', options.period);
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    if (options.subRestaurantId) params.append('subRestaurantId', options.subRestaurantId);
    const qs = params.toString();
    return this.request(`/api/analytics/${restaurantId}/daily-summary${qs ? '?' + qs : ''}`);
  }

  async getCancelledOrdersReport(restaurantId, options = {}) {
    const params = new URLSearchParams();
    if (options.period) params.append('period', options.period);
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    if (options.type) params.append('type', options.type);
    const qs = params.toString();
    return this.request(`/api/analytics/${restaurantId}/cancelled-orders${qs ? '?' + qs : ''}`);
  }

  // Table management endpoints
  async getTables(restaurantId) {
    return this.request(`/api/tables/${restaurantId}`);
  }

  async createTable(restaurantId, tableData) {
    return this.request(`/api/tables/${restaurantId}`, {
      method: 'POST',
      body: tableData,
    });
  }

  async bulkCreateTables(restaurantId, bulkData) {
    return this.request(`/api/tables/${restaurantId}/bulk`, {
      method: 'POST',
      body: bulkData,
    });
  }

  async resetAllTables(restaurantId) {
    return this.request(`/api/tables/${restaurantId}/reset-all`, {
      method: 'POST',
    });
  }

  async updateTableStatus(tableId, status, orderId = null, restaurantId = null) {
    const body = { status };
    if (orderId) body.orderId = orderId;
    if (restaurantId) body.restaurantId = restaurantId;
    
    return this.request(`/api/tables/${tableId}/status`, {
      method: 'PATCH',
      body,
    });
  }

  async updateTable(tableId, updateData, restaurantId = null) {
    const body = { ...updateData };
    if (restaurantId) body.restaurantId = restaurantId;
    
    return this.request(`/api/tables/${tableId}`, {
      method: 'PATCH',
      body,
    });
  }

  async deleteTable(tableId, restaurantId = null) {
    const body = {};
    if (restaurantId) body.restaurantId = restaurantId;
    
    return this.request(`/api/tables/${tableId}`, {
      method: 'DELETE',
      body,
    });
  }

  // Floor management endpoints
  // NOT cached — floors contain table statuses which change with every order
  async getFloors(restaurantId) {
    return this.request(`/api/floors/${restaurantId}`);
  }

  async createFloor(restaurantId, floorData) {
    const result = await this.request(`/api/floors/${restaurantId}`, {
      method: 'POST',
      body: floorData,
    });
    this.invalidateCache(`/api/floors/${restaurantId}`);
    return result;
  }

  async updateFloor(floorId, updateData) {
    const result = await this.request(`/api/floors/${floorId}`, {
      method: 'PATCH',
      body: updateData,
    });
    this.invalidateCache('/api/floors/');
    return result;
  }

  async reorderFloors(restaurantId, floorOrder) {
    const result = await this.request(`/api/floors/reorder/${restaurantId}`, {
      method: 'PATCH',
      body: { floorOrder },
    });
    this.invalidateCache('/api/floors/');
    return result;
  }

  async deleteFloor(floorId, restaurantId) {
    const result = await this.request(`/api/floors/${floorId}?restaurantId=${restaurantId}`, {
      method: 'DELETE',
    });
    this.invalidateCache('/api/floors/');
    return result;
  }

  // Table booking endpoints
  async createBooking(restaurantId, bookingData) {
    return this.request(`/api/bookings/${restaurantId}`, {
      method: 'POST',
      body: bookingData,
    });
  }

  async getBookings(restaurantId, filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const queryString = query ? `?${query}` : '';
    return this.request(`/api/bookings/${restaurantId}${queryString}`);
  }

  async updateBooking(bookingId, updateData) {
    return this.request(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      body: updateData,
    });
  }

  async cancelBooking(bookingId) {
    return this.request(`/api/bookings/${bookingId}`, {
      method: 'DELETE',
    });
  }

  // Space booking endpoints
  async getOwnerSpaces() {
    return this.request('/api/space-booking/spaces');
  }

  async updateSpaceSettings(spaceId, settings) {
    return this.request(`/api/space-booking/spaces/${spaceId}/settings`, {
      method: 'PATCH',
      body: settings,
    });
  }

  async getSpaceBookings(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const queryString = query ? `?${query}` : '';
    return this.request(`/api/space-booking/bookings${queryString}`);
  }

  async updateSpaceBookingStatus(bookingId, data) {
    return this.request(`/api/space-booking/bookings/${bookingId}/status`, {
      method: 'PATCH',
      body: data,
    });
  }

  // Utility endpoints
  async seedData(restaurantId) {
    return this.request(`/api/seed-data/${restaurantId}`, {
      method: 'POST',
    });
  }

  async seedDefaultMenu(restaurantId, countryCode = 'IN') {
    const result = await this.request(`/api/restaurants/${restaurantId}/seed-default`, {
      method: 'POST',
      body: { countryCode },
    });
    this.invalidateCache('/api/restaurants');
    this.invalidateCache(`/api/menus/${restaurantId}`);
    return result;
  }

  async seedOrders(restaurantId) {
    return this.request(`/api/seed-orders/${restaurantId}`, {
      method: 'POST',
    });
  }

  async getWaiters(restaurantId) {
    return this.request(`/api/waiters/${restaurantId}`);
  }

  // Staff Management endpoints
  async getStaff(restaurantId) {
    return this.request(`/api/staff/${restaurantId}`);
  }

  async addStaff(restaurantId, staffData) {
    return this.request(`/api/staff/${restaurantId}`, {
      method: 'POST',
      body: staffData,
    });
  }

  async updateStaff(staffId, updateData) {
    return this.request(`/api/staff/${staffId}`, {
      method: 'PATCH',
      body: updateData,
    });
  }

  async deleteStaff(staffId) {
    return this.request(`/api/staff/${staffId}`, {
      method: 'DELETE',
    });
  }

  // Multi-restaurant staff access
  async getStaffRestaurants(staffId) {
    return this.request(`/api/staff/${staffId}/restaurants`);
  }

  async assignStaffRestaurant(staffId, restaurantId) {
    return this.request(`/api/staff/${staffId}/restaurants`, {
      method: 'POST',
      body: { restaurantId },
    });
  }

  async removeStaffRestaurant(staffId, restaurantId) {
    return this.request(`/api/staff/${staffId}/restaurants/${restaurantId}`, {
      method: 'DELETE',
    });
  }

  async switchRestaurant(restaurantId) {
    return this.request('/api/auth/staff/switch-restaurant', {
      method: 'POST',
      body: { restaurantId },
    });
  }

  // User Page Access
  async getUserPageAccess() {
    return this.request('/api/user/page-access');
  }

  // Intelligent Chatbot
  async intelligentChatbotQuery(query, restaurantId, userId, context = {}) {
    return this.post('/api/chatbot/intelligent-query', {
      query,
      restaurantId,
      userId,
      context
    });
  }

  // User Profile
  async getUserProfile() {
    return this.request('/api/user/profile');
  }

  async updateUserPreferences(preferences) {
    return this.request('/api/user/preferences', {
      method: 'PATCH',
      body: preferences,
    });
  }

  async staffLogin(loginId, password) {
    const response = await this.request('/api/auth/staff/login', {
      method: 'POST',
      body: { loginId, password },
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  // PIN Login endpoints
  async pinLogin(identifier, pin) {
    const response = await this.request('/api/auth/pin/login', {
      method: 'POST',
      body: { identifier, pin, platform: 'dine-frontend' },
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async getPinStatus() {
    return this.request('/api/auth/pin/status');
  }

  async setPin(pin, confirmPin) {
    return this.request('/api/auth/pin/set', {
      method: 'POST',
      body: { pin, confirmPin },
    });
  }

  async changePin(currentPin, newPin, confirmNewPin) {
    return this.request('/api/auth/pin/change', {
      method: 'POST',
      body: { currentPin, newPin, confirmNewPin },
    });
  }

  async disablePin(currentPin) {
    return this.request('/api/auth/pin/disable', {
      method: 'POST',
      body: { currentPin },
    });
  }

  async updateFeatures(notAllowedPages) {
    return this.request('/api/user/features', {
      method: 'PATCH',
      body: { notAllowedPages },
    });
  }

  // KOT (Kitchen Order Ticket) endpoints
  async getKotOrders(restaurantId, status = null) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/api/kot/${restaurantId}${query}`);
  }

  async updateKotStatus(orderId, status, notes = null) {
    return this.request(`/api/kot/${orderId}/status`, {
      method: 'PATCH',
      body: { status, ...(notes && { notes }) },
    });
  }

  async getKotDetails(restaurantId, orderId) {
    return this.request(`/api/kot/${restaurantId}/${orderId}`);
  }

  async startCooking(orderId) {
    return this.request(`/api/kot/${orderId}/status`, {
      method: 'PATCH',
      body: { 
        status: 'preparing',
        cookingStartTime: new Date().toISOString()
      }
    });
  }

  async markReady(orderId) {
    return this.request(`/api/kot/${orderId}/status`, {
      method: 'PATCH',
      body: { 
        status: 'ready',
        cookingEndTime: new Date().toISOString()
      }
    });
  }

  async markServed(orderId) {
    return this.request(`/api/kot/${orderId}/status`, {
      method: 'PATCH',
      body: { status: 'served' },
    });
  }

  async completeOrder(orderId) {
    return this.request(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      body: { status: 'completed' },
    });
  }

  async cancelOrder(orderId, reason = '') {
    return this.request(`/api/orders/${orderId}/cancel`, {
      method: 'PATCH',
      body: { reason },
    });
  }

  async getStaffCredentials(staffId) {
    return this.request(`/api/staff/${staffId}/credentials`);
  }

  async resetStaffPassword(staffId, body = {}) {
    return this.request(`/api/staff/${staffId}/reset-password`, {
      method: 'POST',
      body,
    });
  }

  async deleteStaff(staffId) {
    return this.request(`/api/staff/${staffId}`, {
      method: 'DELETE',
    });
  }

  // Shift Scheduling APIs
  async getShifts(restaurantId, startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return this.request(`/api/shift-scheduling/shifts/${restaurantId}${params.toString() ? '?' + params.toString() : ''}`);
  }

  async createShift(restaurantId, shiftData) {
    return this.request(`/api/shift-scheduling/shifts/${restaurantId}`, {
      method: 'POST',
      body: shiftData,
    });
  }

  async deleteShift(shiftId) {
    return this.request(`/api/shift-scheduling/shifts/${shiftId}`, {
      method: 'DELETE',
    });
  }

  async bulkCreateShifts(restaurantId, shifts) {
    return this.request(`/api/shift-scheduling/shifts/${restaurantId}/bulk`, {
      method: 'POST',
      body: { shifts },
    });
  }

  async autoGenerateShifts(restaurantId, startDate, endDate, preferences, shiftTypes) {
    return this.request(`/api/shift-scheduling/shifts/${restaurantId}/auto-generate`, {
      method: 'POST',
      body: { startDate, endDate, preferences, shiftTypes },
    });
  }

  async getStaffAvailability(staffId) {
    return this.request(`/api/shift-scheduling/availability/${staffId}`);
  }

  async updateStaffAvailability(staffId, preferences) {
    return this.request(`/api/shift-scheduling/availability/${staffId}`, {
      method: 'POST',
      body: { preferences },
    });
  }

  async getShiftSettings(restaurantId) {
    return this.request(`/api/shift-scheduling/settings/${restaurantId}`);
  }

  async updateShiftSettings(restaurantId, settings) {
    return this.request(`/api/shift-scheduling/settings/${restaurantId}`, {
      method: 'POST',
      body: settings,
    });
  }

  // Cash Register / Shift Management
  openRegister(restaurantId, data) { return this.request(`/api/register/${restaurantId}/open`, { method: 'POST', body: data }); }
  getCurrentRegister(restaurantId) { return this.request(`/api/register/${restaurantId}/current`); }
  registerTransaction(registerId, data) { return this.request(`/api/register/${registerId}/transaction`, { method: 'POST', body: data }); }
  closeRegister(registerId, data) { return this.request(`/api/register/${registerId}/close`, { method: 'POST', body: data }); }
  getRegisterHistory(restaurantId, params) { const qs = params ? '?' + new URLSearchParams(params).toString() : ''; return this.request(`/api/register/${restaurantId}/history${qs}`); }
  getXReport(registerId) { return this.request(`/api/register/${registerId}/x-report`); }

  // Google Reviews APIs
  async getGoogleReviewSettings(restaurantId) {
    return this.request(`/api/google-reviews/settings/${restaurantId}`);
  }

  async updateGoogleReviewSettings(restaurantId, settings) {
    return this.request(`/api/google-reviews/settings/${restaurantId}`, {
      method: 'POST',
      body: settings,
    });
  }

  async generateQRCode(restaurantId, url) {
    return this.request(`/api/google-reviews/generate-qr/${restaurantId}`, {
      method: 'POST',
      body: { url },
    });
  }

  async generateReviewContent(restaurantId, customerName, rating) {
    return this.request(`/api/google-reviews/generate-content/${restaurantId}`, {
      method: 'POST',
      body: { customerName, rating },
    });
  }

  async getReviewLink(restaurantId, placeId) {
    const params = placeId ? `?placeId=${placeId}` : '';
    return this.request(`/api/google-reviews/review-link/${restaurantId}${params}`);
  }

  async getGoogleAuthUrl(restaurantId) {
    return this.request(`/api/google-reviews/auth/url/${restaurantId}`);
  }

  async disconnectGoogleAccount(restaurantId) {
    return this.request(`/api/google-reviews/auth/disconnect/${restaurantId}`, {
      method: 'POST',
    });
  }

  async getGoogleAuthStatus(restaurantId) {
    return this.request(`/api/google-reviews/auth/status/${restaurantId}`);
  }

  async getGoogleReviews(restaurantId, params = {}) {
    const query = new URLSearchParams(params).toString();
    const queryString = query ? `?${query}` : '';
    return this.request(`/api/google-reviews/reviews/${restaurantId}${queryString}`);
  }

  async replyToGoogleReview(restaurantId, reviewId, comment) {
    return this.request(`/api/google-reviews/reviews/${restaurantId}/${reviewId}/reply`, {
      method: 'POST',
      body: { comment },
    });
  }

  async deleteGoogleReviewReply(restaurantId, reviewId) {
    return this.request(`/api/google-reviews/reviews/${restaurantId}/${reviewId}/reply`, {
      method: 'DELETE',
    });
  }

  async generateGoogleReviewReply(restaurantId, data) {
    return this.request(`/api/google-reviews/reviews/${restaurantId}/generate-reply`, {
      method: 'POST',
      body: data,
    });
  }

  async deleteOrder(orderId, reason) {
    return this.request(`/api/orders/${orderId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason: reason || undefined }),
    });
  }

  // Inventory Management endpoints
  async getInventoryItems(restaurantId, filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const queryString = query ? `?${query}` : '';
    return this.request(`/api/inventory/${restaurantId}${queryString}`);
  }

  async getInventoryItem(restaurantId, itemId) {
    return this.request(`/api/inventory/${restaurantId}/${itemId}`);
  }

  async createInventoryItem(restaurantId, itemData) {
    return this.request(`/api/inventory/${restaurantId}`, {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async updateInventoryItem(restaurantId, itemId, updateData) {
    return this.request(`/api/inventory/${restaurantId}/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  async deleteInventoryItem(restaurantId, itemId) {
    return this.request(`/api/inventory/${restaurantId}/${itemId}`, {
      method: 'DELETE',
    });
  }

  async getItemStockBatches(restaurantId, itemId) {
    return this.request(`/api/inventory/${restaurantId}/${itemId}/batches`);
  }

  async getItemStockHistory(restaurantId, itemId) {
    return this.request(`/api/inventory/${restaurantId}/${itemId}/history`);
  }

  async getInventoryWastage(restaurantId) {
    return this.request(`/api/inventory/${restaurantId}/wastage`);
  }

  async getInventoryCategories(restaurantId) {
    return this.cachedGet(`/api/inventory/${restaurantId}/categories`, 10 * 60 * 1000); // 10 min
  }

  async getInventoryDashboard(restaurantId) {
    return this.request(`/api/inventory/${restaurantId}/dashboard`);
  }

  async getInventoryTransactions(restaurantId, params = {}) {
    const query = new URLSearchParams(params).toString();
    const queryString = query ? `?${query}` : '';
    return this.request(`/api/inventory/${restaurantId}/transactions${queryString}`);
  }

  async getInventoryUsageSummary(restaurantId, params = {}) {
    const query = new URLSearchParams(params).toString();
    const queryString = query ? `?${query}` : '';
    return this.request(`/api/inventory/${restaurantId}/usage-summary${queryString}`);
  }

  async parseQuickOrder(restaurantId, payload) {
    if (payload instanceof FormData) {
      return this.upload(`/api/inventory/${restaurantId}/quick-order`, payload);
    }
    return this.request(`/api/inventory/${restaurantId}/quick-order`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async confirmQuickOrder(restaurantId, items, source, notes = '') {
    return this.request(`/api/inventory/${restaurantId}/quick-order`, {
      method: 'POST',
      body: JSON.stringify({ mode: 'confirm', items, source, notes }),
    });
  }

  // Smart Import endpoints
  async smartImportParse(restaurantId, payload) {
    if (payload instanceof FormData) {
      return this.upload(`/api/inventory/${restaurantId}/smart-import/parse`, payload);
    }
    return this.request(`/api/inventory/${restaurantId}/smart-import/parse`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async smartImportConfirm(restaurantId, data) {
    return this.request(`/api/inventory/${restaurantId}/smart-import/confirm`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Waste Tracking endpoints
  async createWasteEntry(restaurantId, data) {
    return this.request(`/api/inventory/${restaurantId}/waste-entries`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWasteEntries(restaurantId, params = {}) {
    const query = new URLSearchParams(params).toString();
    const queryString = query ? `?${query}` : '';
    return this.request(`/api/inventory/${restaurantId}/waste-entries${queryString}`);
  }

  async createStockAudit(restaurantId, data) {
    return this.request(`/api/inventory/${restaurantId}/stock-audits`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getStockAudits(restaurantId) {
    return this.request(`/api/inventory/${restaurantId}/stock-audits`);
  }

  async createProductionEntry(restaurantId, data) {
    return this.request(`/api/inventory/${restaurantId}/production-entries`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async closeProductionEntry(restaurantId, entryId, data) {
    return this.request(`/api/inventory/${restaurantId}/production-entries/${entryId}/close`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getProductionEntries(restaurantId, params = {}) {
    const query = new URLSearchParams(params).toString();
    const queryString = query ? `?${query}` : '';
    return this.request(`/api/inventory/${restaurantId}/production-entries${queryString}`);
  }

  async getExpiryAlerts(restaurantId, days = 7) {
    return this.request(`/api/inventory/${restaurantId}/expiry-alerts?days=${days}`);
  }

  async getWasteSummary(restaurantId) {
    return this.request(`/api/inventory/${restaurantId}/waste-summary`);
  }

  async markExpiredWaste(restaurantId, batchId) {
    return this.request(`/api/inventory/${restaurantId}/mark-expired-waste`, {
      method: 'POST',
      body: JSON.stringify({ batchId }),
    });
  }

  async analyzeLeftovers(restaurantId, text) {
    return this.request(`/api/inventory/${restaurantId}/analyze-leftovers`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async confirmLeftoverWaste(restaurantId, items) {
    return this.request(`/api/inventory/${restaurantId}/confirm-leftover-waste`, {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  }

  // Suppliers Management endpoints
  async getSuppliers(restaurantId) {
    return this.cachedGet(`/api/suppliers/${restaurantId}`, 10 * 60 * 1000); // 10 min
  }

  async createSupplier(restaurantId, supplierData) {
    return this.request(`/api/suppliers/${restaurantId}`, {
      method: 'POST',
      body: JSON.stringify(supplierData),
    });
  }

  async updateSupplier(restaurantId, supplierId, updateData) {
    return this.request(`/api/suppliers/${restaurantId}/${supplierId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  async deleteSupplier(restaurantId, supplierId) {
    return this.request(`/api/suppliers/${restaurantId}/${supplierId}`, {
      method: 'DELETE',
    });
  }

  // Recipes Management endpoints
  async getRecipes(restaurantId, filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const queryString = query ? `?${query}` : '';
    return this.request(`/api/recipes/${restaurantId}${queryString}`);
  }

  async createRecipe(restaurantId, recipeData) {
    return this.request(`/api/recipes/${restaurantId}`, {
      method: 'POST',
      body: JSON.stringify(recipeData),
    });
  }

  async updateRecipe(restaurantId, recipeId, updateData) {
    return this.request(`/api/recipes/${restaurantId}/${recipeId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  async generateRecipeSteps(restaurantId, recipeData) {
    return this.request(`/api/recipes/${restaurantId}/generate-steps`, {
      method: 'POST',
      body: JSON.stringify(recipeData),
    });
  }

  async generateFullRecipe(restaurantId, data) {
    return this.request(`/api/recipes/${restaurantId}/generate-full`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteRecipe(restaurantId, recipeId) {
    return this.request(`/api/recipes/${restaurantId}/${recipeId}`, {
      method: 'DELETE',
    });
  }

  // Purchase Orders endpoints
  async getPurchaseOrders(restaurantId, filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const queryString = query ? `?${query}` : '';
    return this.request(`/api/purchase-orders/${restaurantId}${queryString}`);
  }

  async createPurchaseOrder(restaurantId, orderData) {
    return this.request(`/api/purchase-orders/${restaurantId}`, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updatePurchaseOrder(restaurantId, orderId, updateData) {
    return this.request(`/api/purchase-orders/${restaurantId}/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  async emailPurchaseOrder(restaurantId, orderId, emailData) {
    return this.request(`/api/purchase-orders/${restaurantId}/${orderId}/email`, {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  // Customer Management endpoints

  async createSupplier(restaurantId, supplierData) {
    return this.request(`/api/suppliers/${restaurantId}`, {
      method: 'POST',
      body: supplierData,
    });
  }

  async updateSupplier(restaurantId, supplierId, updateData) {
    return this.request(`/api/suppliers/${restaurantId}/${supplierId}`, {
      method: 'PATCH',
      body: updateData,
    });
  }

  async deleteSupplier(restaurantId, supplierId) {
    return this.request(`/api/suppliers/${restaurantId}/${supplierId}`, {
      method: 'DELETE',
    });
  }

  async getSupplier(restaurantId, supplierId) {
    return this.request(`/api/suppliers/${restaurantId}/${supplierId}`);
  }

  // GRN (Goods Receipt Note) endpoints
  async getGRNs(restaurantId, filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const queryString = query ? `?${query}` : '';
    return this.request(`/api/grn/${restaurantId}${queryString}`);
  }

  async getGRN(restaurantId, grnId) {
    return this.request(`/api/grn/${restaurantId}/${grnId}`);
  }

  async createGRN(restaurantId, grnData) {
    return this.request(`/api/grn/${restaurantId}`, {
      method: 'POST',
      body: JSON.stringify(grnData),
    });
  }

  async updateGRN(restaurantId, grnId, updateData) {
    return this.request(`/api/grn/${restaurantId}/${grnId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  // Purchase Requisitions endpoints
  async getPurchaseRequisitions(restaurantId, filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const queryString = query ? `?${query}` : '';
    return this.request(`/api/purchase-requisitions/${restaurantId}${queryString}`);
  }

  async createPurchaseRequisition(restaurantId, requisitionData) {
    return this.request(`/api/purchase-requisitions/${restaurantId}`, {
      method: 'POST',
      body: JSON.stringify(requisitionData),
    });
  }

  async updatePurchaseRequisition(restaurantId, reqId, updateData) {
    return this.request(`/api/purchase-requisitions/${restaurantId}/${reqId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  async convertRequisitionToPO(restaurantId, reqId, poData) {
    return this.request(`/api/purchase-requisitions/${restaurantId}/${reqId}/convert-to-po`, {
      method: 'POST',
      body: JSON.stringify(poData),
    });
  }

  // Supplier Invoices endpoints
  async getSupplierInvoices(restaurantId, filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const queryString = query ? `?${query}` : '';
    return this.request(`/api/supplier-invoices/${restaurantId}${queryString}`);
  }

  async createSupplierInvoice(restaurantId, invoiceData) {
    return this.request(`/api/supplier-invoices/${restaurantId}`, {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  }

  async matchInvoice(restaurantId, invoiceId) {
    return this.request(`/api/supplier-invoices/${restaurantId}/${invoiceId}/match`, {
      method: 'POST',
    });
  }

  async generateInvoiceFromPO(restaurantId, purchaseOrderId) {
    return this.request(`/api/supplier-invoices/${restaurantId}/generate-from-po`, {
      method: 'POST',
      body: JSON.stringify({ purchaseOrderId }),
    });
  }

  async updateSupplierInvoice(restaurantId, invoiceId, updateData) {
    return this.request(`/api/supplier-invoices/${restaurantId}/${invoiceId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  // Supplier Performance endpoints
  async getSupplierPerformance(restaurantId, supplierId) {
    return this.request(`/api/suppliers/${restaurantId}/${supplierId}/performance`);
  }

  async getAllSuppliersPerformance(restaurantId) {
    return this.request(`/api/suppliers/${restaurantId}/performance`);
  }

  // AI Services endpoints
  async getAIReorderSuggestions(restaurantId) {
    return this.request(`/api/ai/reorder-suggestions/${restaurantId}`);
  }

  async getAIDemandPrediction(restaurantId, itemId, daysAhead = 7) {
    return this.request(`/api/ai/demand-prediction/${restaurantId}/${itemId}?daysAhead=${daysAhead}`);
  }

  async getAIWastePrediction(restaurantId) {
    return this.request(`/api/ai/waste-prediction/${restaurantId}`);
  }

  async getAIWasteSummary(restaurantId) {
    return this.request(`/api/ai/waste-summary/${restaurantId}`);
  }

  async processInvoiceOCR(restaurantId, imageUrl) {
    return this.request(`/api/ai/invoice-ocr/${restaurantId}`, {
      method: 'POST',
      body: JSON.stringify({ imageUrl }),
    });
  }

  // Price Intelligence endpoints
  async getPriceComparison(restaurantId, itemId) {
    return this.request(`/api/ai/price-comparison/${restaurantId}/${itemId}`);
  }

  async getPriceTrend(restaurantId, itemId, days = 90) {
    return this.request(`/api/ai/price-trend/${restaurantId}/${itemId}?days=${days}`);
  }

  async getPriceAnomalies(restaurantId, itemId) {
    return this.request(`/api/ai/price-anomalies/${restaurantId}/${itemId}`);
  }

  async getBestSupplier(restaurantId, itemId) {
    return this.request(`/api/ai/best-supplier/${restaurantId}/${itemId}`);
  }

  // Supplier Returns endpoints
  async getSupplierReturns(restaurantId, filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const queryString = query ? `?${query}` : '';
    return this.request(`/api/supplier-returns/${restaurantId}${queryString}`);
  }

  async createSupplierReturn(restaurantId, returnData) {
    return this.request(`/api/supplier-returns/${restaurantId}`, {
      method: 'POST',
      body: JSON.stringify(returnData),
    });
  }

  async updateSupplierReturn(restaurantId, returnId, updateData) {
    return this.request(`/api/supplier-returns/${restaurantId}/${returnId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  async deleteSupplierReturn(restaurantId, returnId) {
    return this.request(`/api/supplier-returns/${restaurantId}/${returnId}`, {
      method: 'DELETE',
    });
  }

  // Stock Transfers endpoints
  async getStockTransfers(restaurantId, filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const queryString = query ? `?${query}` : '';
    return this.request(`/api/stock-transfers/${restaurantId}${queryString}`);
  }

  async createStockTransfer(restaurantId, transferData) {
    return this.request(`/api/stock-transfers/${restaurantId}`, {
      method: 'POST',
      body: JSON.stringify(transferData),
    });
  }

  async updateStockTransfer(restaurantId, transferId, updateData) {
    return this.request(`/api/stock-transfers/${restaurantId}/${transferId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  async deleteStockTransfer(restaurantId, transferId) {
    return this.request(`/api/stock-transfers/${restaurantId}/${transferId}`, {
      method: 'DELETE',
    });
  }

  // Admin Settings endpoints
  async getAdminSettings(restaurantId) {
    return this.request(`/api/admin/settings/${restaurantId}`);
  }

  async updateAdminSettings(restaurantId, settingsData) {
    return this.request(`/api/admin/settings/${restaurantId}`, {
      method: 'PUT',
      body: settingsData,
    });
  }

  async applyDiscount(restaurantId, discountData) {
    return this.request(`/api/admin/settings/${restaurantId}/apply-discount`, {
      method: 'POST',
      body: discountData,
    });
  }

  async getRestaurantStatus(restaurantId) {
    return this.request(`/api/admin/settings/${restaurantId}/status`);
  }

  async updateRestaurantStatus(restaurantId, statusData) {
    return this.request(`/api/admin/settings/${restaurantId}/status`, {
      method: 'PUT',
      body: statusData,
    });
  }

  // Tax Management endpoints
  async getTaxSettings(restaurantId) {
    return this.cachedGet(`/api/admin/tax/${restaurantId}`, 30 * 60 * 1000); // 30 min — rarely changes
  }

  async updateTaxSettings(restaurantId, taxSettings) {
    const result = await this.request(`/api/admin/tax/${restaurantId}`, {
      method: 'PUT',
      body: { taxSettings },
    });
    this.invalidateCache(`/api/admin/tax/${restaurantId}`);
    // Clear localStorage cache so dashboard picks up changes immediately
    try { localStorage.removeItem(`dine_tax_${restaurantId}`); } catch (_) {}
    return result;
  }

  async calculateTax(restaurantId, items, subtotal) {
    return this.request(`/api/tax/calculate/${restaurantId}`, {
      method: 'POST',
      body: { items, subtotal },
    });
  }

  // Currency Settings endpoints
  async getCurrencySettings(restaurantId) {
    return this.cachedGet(`/api/admin/currency/${restaurantId}`, 60 * 60 * 1000); // 1 hour — almost never changes
  }

  async updateCurrencySettings(restaurantId, currencySettings) {
    const result = await this.request(`/api/admin/currency/${restaurantId}`, {
      method: 'PUT',
      body: { currencySettings },
    });
    this.invalidateCache(`/api/admin/currency/${restaurantId}`);
    return result;
  }

  // Print Settings endpoints
  async getPrintSettings(restaurantId) {
    return this.cachedGet(`/api/admin/print-settings/${restaurantId}`, 30 * 60 * 1000); // 30 min
  }

  async updatePrintSettings(restaurantId, printSettings) {
    const result = await this.request(`/api/admin/print-settings/${restaurantId}`, {
      method: 'PUT',
      body: { printSettings },
    });
    this.invalidateCache(`/api/admin/print-settings/${restaurantId}`);
    return result;
  }

  // Print Stations (kitchen routing) endpoints
  async getPrintStations(restaurantId) {
    return this.cachedGet(`/api/admin/print-stations/${restaurantId}`, 10 * 60 * 1000);
  }

  async updatePrintStations(restaurantId, printStations) {
    const result = await this.request(`/api/admin/print-stations/${restaurantId}`, {
      method: 'PUT',
      body: { printStations },
    });
    this.invalidateCache(`/api/admin/print-stations/${restaurantId}`);
    return result;
  }

  async getBusinessSettings(restaurantId) {
    return this.request(`/api/admin/business/${restaurantId}`);
  }

  async updateBusinessSettings(restaurantId, settings) {
    const result = await this.request(`/api/admin/business/${restaurantId}`, {
      method: 'PUT',
      body: settings,
    });
    return result;
  }

  // Manual print request - sends print to KOT Printer app via Pusher
  // printType: 'kot' or 'bill' (optional - auto-detected based on order status)
  async requestManualPrint(orderId, printType = null) {
    return this.request(`/api/orders/${orderId}/manual-print`, {
      method: 'POST',
      body: printType ? { printType } : {},
    });
  }

  // Print installer (KOT Printer exe/dmg) – public URLs for download
  async getPrintInstallerUrls() {
    return this.request('/api/print-installer/urls');
  }

  // Upload installer (owner only). file: File object (.exe or .dmg)
  async uploadPrintInstaller(file) {
    const formData = new FormData();
    formData.append('installer', file);
    return this.request('/api/print-installer/upload', {
      method: 'POST',
      body: formData,
    });
  }

  // Invoice Management endpoints
  async generateInvoice(orderId) {
    return this.request(`/api/invoice/generate/${orderId}`, {
      method: 'POST',
    });
  }

  // Unified "ready-to-print" bill payload (restaurant + bill + printSettings
  // + labels). Single source of truth shared between web bill summary, the
  // electron KOT printer, and the android KOT printer so all three render
  // identical bills. Public endpoint, scope-checked by restaurantId.
  async getBillRender(restaurantId, orderId) {
    return this.request(`/api/bill/render/${restaurantId}/${orderId}`);
  }

  async getKOTRender(restaurantId, orderId, { newOnly = false, stationId = null } = {}) {
    const params = new URLSearchParams();
    if (newOnly) params.set('newOnly', 'true');
    if (stationId) params.set('stationId', stationId);
    const qs = params.toString();
    return this.request(`/api/kot/render/${restaurantId}/${orderId}${qs ? '?' + qs : ''}`);
  }

  async getTokenRender(restaurantId, orderId) {
    return this.request(`/api/token/render/${restaurantId}/${orderId}`);
  }

  async getInvoice(invoiceId) {
    return this.request(`/api/invoice/${invoiceId}`);
  }

  async getInvoices(restaurantId, options = {}) {
    const queryParams = new URLSearchParams();
    if (options.limit) queryParams.append('limit', options.limit);
    if (options.offset) queryParams.append('offset', options.offset);
    if (options.startDate) queryParams.append('startDate', options.startDate);
    if (options.endDate) queryParams.append('endDate', options.endDate);
    
    const query = queryParams.toString();
    return this.request(`/api/invoices/${restaurantId}${query ? `?${query}` : ''}`);
  }

  // ==================== DINEBOT METHODS ====================

  // Send query to DineBot (Function Calling Agent with role-based access)
  async queryDineBot(query, restaurantId) {
    return this.request('/api/chatbot/intelligent-query', {
      method: 'POST',
      body: {
        query: query,
        restaurantId: restaurantId
      }
    });
  }

  // Get DineBot status and capabilities
  async getDineBotStatus(restaurantId) {
    return this.request(`/api/dinebot/status?restaurantId=${restaurantId}`);
  }

  // Customer Management API methods
  async getCustomers(restaurantId, page = 1, pageSize = 50, search = '', cursor = '') {
    let url = `/api/customers/${restaurantId}?page=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;
    return this.request(url);
  }

  async getCustomer(customerId) {
    return this.request(`/api/customers/detail/${customerId}`);
  }

  async createCustomer(restaurantId, customerData) {
    return this.request('/api/customers', {
      method: 'POST',
      body: {
        ...customerData,
        restaurantId: restaurantId
      }
    });
  }

  async updateCustomer(customerId, updateData) {
    return this.request(`/api/customers/${customerId}`, {
      method: 'PATCH',
      body: updateData
    });
  }

  async deleteCustomer(customerId) {
    return this.request(`/api/customers/${customerId}`, {
      method: 'DELETE'
    });
  }

  async bulkImportCustomers(restaurantId, customers) {
    return this.request('/api/customers/bulk-import', {
      method: 'POST',
      body: { restaurantId, customers },
    });
  }

  async getCustomerReports(restaurantIds, period = 'this_week', limit = 20, fromDate, toDate) {
    const params = new URLSearchParams({ restaurantIds: restaurantIds.join(','), period, limit: String(limit) });
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);
    return this.request(`/api/customers/reports?${params.toString()}`);
  }

  // ==================== BOOKINGS & CATERING ====================

  async getBookings(restaurantId, filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.type) params.set('type', filters.type);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.search) params.set('search', filters.search);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
    const qs = params.toString();
    return this.request(`/api/bookings/${restaurantId}${qs ? '?' + qs : ''}`);
  }

  async getBooking(restaurantId, bookingId) {
    return this.request(`/api/bookings/${restaurantId}/${bookingId}`);
  }

  async createBooking(restaurantId, data) {
    return this.request(`/api/bookings/${restaurantId}`, { method: 'POST', body: data });
  }

  async updateBooking(restaurantId, bookingId, data) {
    return this.request(`/api/bookings/${restaurantId}/${bookingId}`, { method: 'PATCH', body: data });
  }

  async deleteBooking(restaurantId, bookingId, reason, { permanent = false } = {}) {
    return this.request(`/api/bookings/${restaurantId}/${bookingId}`, { method: 'DELETE', body: { reason, permanent } });
  }

  async getBookingCalendar(restaurantId, startDate, endDate) {
    return this.request(`/api/bookings/${restaurantId}/calendar?startDate=${startDate}&endDate=${endDate}`);
  }

  async getBookingVenues(restaurantId) {
    return this.request(`/api/bookings/${restaurantId}/venues`);
  }

  async createBookingVenue(restaurantId, data) {
    return this.request(`/api/bookings/${restaurantId}/venues`, { method: 'POST', body: data });
  }

  async updateBookingVenue(restaurantId, venueId, data) {
    return this.request(`/api/bookings/${restaurantId}/venues/${venueId}`, { method: 'PATCH', body: data });
  }

  async deleteBookingVenue(restaurantId, venueId) {
    return this.request(`/api/bookings/${restaurantId}/venues/${venueId}`, { method: 'DELETE' });
  }

  async checkVenueAvailability(restaurantId, venueId, date, startTime, endTime, endDate) {
    const params = new URLSearchParams({ date });
    if (startTime) params.set('startTime', startTime);
    if (endTime) params.set('endTime', endTime);
    if (endDate) params.set('endDate', endDate);
    return this.request(`/api/bookings/${restaurantId}/venues/${venueId}/availability?${params.toString()}`);
  }

  async addBookingPayment(restaurantId, bookingId, payment) {
    return this.request(`/api/bookings/${restaurantId}/${bookingId}/payment`, { method: 'POST', body: payment });
  }

  async completeBooking(restaurantId, bookingId) {
    return this.request(`/api/bookings/${restaurantId}/${bookingId}/complete`, { method: 'POST' });
  }

  async getBookingInvoice(restaurantId, bookingId) {
    return this.request(`/api/bookings/${restaurantId}/${bookingId}/invoice`, { method: 'POST' });
  }

  // ==================== EMAIL METHODS ====================

  // Send welcome email to new user
  async sendWelcomeEmail(email, name) {
    return this.request('/api/email/welcome', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        email: email,
        name: name
      }
    });
  }

  // Send weekly analytics report
  async sendWeeklyAnalyticsReport(restaurantId) {
    return this.request('/api/email/weekly-analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        restaurantId: restaurantId
      }
    });
  }

  // Generic image upload
  async uploadImage(formData) {
    const url = `${this.baseURL}/api/upload/image`;
    const token = this.getToken();

    const config = {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let the browser set it for FormData
        ...(token && { Authorization: `Bearer ${token}` }),
      }
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Menu item image management
  async uploadMenuItemImages(itemId, files, restaurantId) {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('images', file);
    });
    const query = restaurantId ? `?restaurantId=${restaurantId}` : '';

    return this.request(`/api/menu-items/${itemId}/images${query}`, {
      method: 'POST',
      body: formData
      // Don't set headers - let request method handle auth and Content-Type
    });
  }

  async deleteMenuItemImage(itemId, imageIndex, restaurantId) {
    const query = restaurantId ? `?restaurantId=${restaurantId}` : '';
    return this.request(`/api/menu-items/${itemId}/images/${imageIndex}${query}`, {
      method: 'DELETE'
    });
  }

  // Voice Assistant endpoint
  async processVoiceOrder(transcript, restaurantId) {
    return this.request(`/api/voice/process-order`, {
      method: 'POST',
      body: { transcript, restaurantId },
    });
  }

  // Voice chunk processing for real-time streaming
  async processVoiceChunk(data) {
    return this.request('/api/voice/process-chunk', {
      method: 'POST',
      body: data,
    });
  }

  // Smart Voice Processing - with intent detection and cart context
  async smartVoiceProcess(data) {
    return this.request('/api/voice/smart-process', {
      method: 'POST',
      body: data,
    });
  }

  // Voice Purchase Order processing
  async processVoicePurchaseOrder(transcript, restaurantId) {
    return this.request(`/api/voice/process-purchase-order`, {
      method: 'POST',
      body: { transcript, restaurantId },
    });
  }

  // Invoice OCR
  async processInvoiceOCR(imageFile, restaurantId) {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('restaurantId', restaurantId);
    
    return this.request(`/api/invoice/ocr`, {
      method: 'POST',
      body: formData,
    });
  }

  // Smart suggestions
  async getSmartSuggestions(restaurantId, type = 'po') {
    return this.request(`/api/smart-suggestions/${restaurantId}?type=${type}`);
  }

  // ==================== AUTOMATION & LOYALTY APIs ====================

  // Automations
  async getAutomations(restaurantId) {
    return this.request(`/api/automation/${restaurantId}/automations`);
  }

  async createAutomation(restaurantId, automationData) {
    return this.request(`/api/automation/${restaurantId}/automations`, {
      method: 'POST',
      body: automationData,
    });
  }

  async updateAutomation(restaurantId, automationId, updateData) {
    return this.request(`/api/automation/${restaurantId}/automations/${automationId}`, {
      method: 'PATCH',
      body: updateData,
    });
  }

  async deleteAutomation(restaurantId, automationId) {
    return this.request(`/api/automation/${restaurantId}/automations/${automationId}`, {
      method: 'DELETE',
    });
  }

  // Templates
  async getAutomationTemplates(restaurantId) {
    return this.request(`/api/automation/${restaurantId}/templates`);
  }

  async createTemplate(restaurantId, templateData) {
    return this.request(`/api/automation/${restaurantId}/templates`, {
      method: 'POST',
      body: templateData,
    });
  }

  async updateTemplate(restaurantId, templateId, updateData) {
    return this.request(`/api/automation/${restaurantId}/templates/${templateId}`, {
      method: 'PATCH',
      body: updateData,
    });
  }

  async deleteTemplate(restaurantId, templateId) {
    return this.request(`/api/automation/${restaurantId}/templates/${templateId}`, {
      method: 'DELETE',
    });
  }

  // Analytics
  async getAutomationAnalytics(restaurantId, period = '30d') {
    return this.request(`/api/automation/${restaurantId}/analytics?period=${period}`);
  }

  // Coupons
  async getCoupons(restaurantId) {
    return this.request(`/api/automation/${restaurantId}/coupons`);
  }

  async createCoupon(restaurantId, couponData) {
    return this.request(`/api/automation/${restaurantId}/coupons`, {
      method: 'POST',
      body: couponData,
    });
  }

  async updateCoupon(restaurantId, couponId, updateData) {
    return this.request(`/api/automation/${restaurantId}/coupons/${couponId}`, {
      method: 'PATCH',
      body: updateData,
    });
  }

  async deleteCoupon(restaurantId, couponId) {
    return this.request(`/api/automation/${restaurantId}/coupons/${couponId}`, {
      method: 'DELETE',
    });
  }

  async validateCoupon(restaurantId, code, customerPhone, cartTotal) {
    return this.request(`/api/automation/${restaurantId}/coupons/validate`, {
      method: 'POST',
      body: { code, customerPhone, cartTotal },
    });
  }

  async redeemCoupon(restaurantId, couponId, orderId) {
    return this.request(`/api/automation/${restaurantId}/coupons/redeem`, {
      method: 'POST',
      body: { couponId, orderId },
    });
  }

  async generatePrivateCoupons(restaurantId, data) {
    return this.request(`/api/automation/${restaurantId}/coupons/generate-private`, {
      method: 'POST',
      body: data,
    });
  }

  async getCustomerCoupons(restaurantId, phone) {
    return this.request(`/api/automation/${restaurantId}/coupons/customer/${encodeURIComponent(phone)}`);
  }

  // WhatsApp Settings
  async getWhatsAppSettings(restaurantId) {
    return this.request(`/api/automation/${restaurantId}/whatsapp`);
  }

  async connectWhatsApp(restaurantId, settings) {
    return this.request(`/api/automation/${restaurantId}/whatsapp/connect`, {
      method: 'POST',
      body: settings, // Should include: { mode: 'restaurant' | 'dineopen', accessToken, phoneNumberId, businessAccountId, webhookVerifyToken }
    });
  }

  async disconnectWhatsApp(restaurantId) {
    return this.request(`/api/automation/${restaurantId}/whatsapp/disconnect`, {
      method: 'POST',
    });
  }

  async testWhatsAppMessage(restaurantId, { phoneNumber, message, templateName, templateLanguage }) {
    return this.request(`/api/automation/${restaurantId}/whatsapp/test`, {
      method: 'POST',
      body: { phoneNumber, message, templateName, templateLanguage },
    });
  }

  async sendBillOnWhatsApp(restaurantId, { customerPhone, customerName, amount, orderId, invoiceText, restaurantName }) {
    return this.request(`/api/automation/${restaurantId}/whatsapp/send-bill`, {
      method: 'POST',
      body: { customerPhone, customerName, amount, orderId, invoiceText, restaurantName },
    });
  }

  async getWhatsAppMessages(restaurantId, { page, limit, phone } = {}) {
    const params = new URLSearchParams();
    if (page) params.set('page', page);
    if (limit) params.set('limit', limit);
    if (phone) params.set('phone', phone);
    return this.request(`/api/automation/${restaurantId}/whatsapp/messages?${params.toString()}`);
  }

  async replyWhatsApp(restaurantId, { phone, message }) {
    return this.request(`/api/automation/${restaurantId}/whatsapp/reply`, {
      method: 'POST',
      body: { phone, message },
    });
  }

  async markWhatsAppRead(restaurantId, phone) {
    return this.request(`/api/automation/${restaurantId}/whatsapp/mark-read`, {
      method: 'POST',
      body: { phone },
    });
  }

  // Demo request endpoint - public, no auth required
  async submitDemoRequest(contactType, phone, email, comment) {
    // Create a request without auth token
    const url = `${this.baseURL}/api/demo-request`;
    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contactType, phone, email, comment })
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to submit demo request');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ==================== HOTEL MANAGEMENT ====================

  // Create hotel check-in
  async hotelCheckIn(checkInData) {
    return this.request('/api/hotel/checkin', {
      method: 'POST',
      body: checkInData,
    });
  }

  // Get all check-ins for a restaurant
  async getHotelCheckIns(restaurantId, status = 'all') {
    return this.request(`/api/hotel/checkins/${restaurantId}?status=${status}`);
  }

  // Get check-in by room number
  async getCheckInByRoom(restaurantId, roomNumber) {
    return this.request(`/api/hotel/checkin/room/${restaurantId}/${roomNumber}`);
  }

  // Link order to hotel check-in
  async linkOrderToCheckIn(checkInId, orderId, orderAmount) {
    return this.request('/api/hotel/link-order', {
      method: 'POST',
      body: { checkInId, orderId, orderAmount },
    });
  }

  // Hotel checkout
  async hotelCheckOut(checkInId, checkoutData) {
    return this.request(`/api/hotel/checkout/${checkInId}`, {
      method: 'POST',
      body: checkoutData,
    });
  }

  // Get invoice for check-in
  async getHotelInvoice(checkInId) {
    return this.request(`/api/hotel/invoice/${checkInId}`);
  }

  // Update check-in details
  async updateCheckIn(checkInId, updates) {
    return this.request(`/api/hotel/checkin/${checkInId}`, {
      method: 'PATCH',
      body: updates,
    });
  }

  // Room Management APIs

  // Add a single room
  async addRoom(roomData) {
    return this.request('/api/room', {
      method: 'POST',
      body: roomData,
    });
  }

  // Bulk add rooms
  async bulkAddRooms(bulkData) {
    return this.request('/api/rooms/bulk', {
      method: 'POST',
      body: bulkData,
    });
  }

  // Get all rooms
  async getRooms(restaurantId, filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.floor) params.append('floor', filters.floor);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/rooms/${restaurantId}${queryString}`);
  }

  // Update room status
  async updateRoomStatus(roomId, status, currentGuest = null) {
    return this.request(`/api/room/${roomId}/status`, {
      method: 'PATCH',
      body: { status, currentGuest },
    });
  }

  async getRoomMaintenanceSchedules(roomId, restaurantId) {
    const params = new URLSearchParams();
    params.append('restaurantId', restaurantId);
    return this.request(`/api/room/${roomId}/maintenance?${params.toString()}`);
  }

  async cancelRoomMaintenance(roomId, restaurantId, startDate = null, endDate = null) {
    const params = new URLSearchParams();
    params.append('restaurantId', restaurantId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return this.request(`/api/room/${roomId}/maintenance?${params.toString()}`, {
      method: 'DELETE',
    });
  }

  // Delete room
  async deleteRoom(roomId) {
    return this.request(`/api/room/${roomId}`, {
      method: 'DELETE',
    });
  }

  // Create hotel room booking
  async createHotelBooking(bookingData) {
    return this.request('/api/booking', {
      method: 'POST',
      body: bookingData,
    });
  }

  // Get hotel room bookings
  async getHotelBookings(restaurantId, filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.date) params.append('date', filters.date);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/room-bookings/${restaurantId}${queryString}`);
  }

  // Cancel hotel room booking
  async cancelHotelBooking(bookingId, reason) {
    return this.request(`/api/booking/${bookingId}/cancel`, {
      method: 'PATCH',
      body: { reason }
    });
  }

  // Convert booking to check-in
  async convertBookingToCheckIn(bookingId, checkInData) {
    return this.request(`/api/booking/${bookingId}/checkin`, {
      method: 'POST',
      body: checkInData,
    });
  }

  // Search guests
  async searchGuests(restaurantId, searchParams) {
    const params = new URLSearchParams();
    if (searchParams.phone) params.append('phone', searchParams.phone);
    if (searchParams.name) params.append('name', searchParams.name);

    return this.request(`/api/hotel/guests/${restaurantId}?${params.toString()}`);
  }

  // ==================== OFFERS MANAGEMENT ====================

  // Get all offers for a restaurant
  async getOffers(restaurantId) {
    return this.request(`/api/offers/${restaurantId}`);
  }

  // Create a new offer
  async createOffer(restaurantId, offerData) {
    return this.request(`/api/offers/${restaurantId}`, {
      method: 'POST',
      body: offerData,
    });
  }

  // Update an offer
  async updateOffer(restaurantId, offerId, offerData) {
    return this.request(`/api/offers/${restaurantId}/${offerId}`, {
      method: 'PUT',
      body: offerData,
    });
  }

  // Delete an offer
  async deleteOffer(restaurantId, offerId) {
    return this.request(`/api/offers/${restaurantId}/${offerId}`, {
      method: 'DELETE',
    });
  }

  // ==================== CUSTOMER APP SETTINGS ====================

  // Get customer app settings
  async getCustomerAppSettings(restaurantId) {
    return this.request(`/api/restaurants/${restaurantId}/customer-app-settings`);
  }

  // Update customer app settings
  async updateCustomerAppSettings(restaurantId, settings) {
    return this.request(`/api/restaurants/${restaurantId}/customer-app-settings`, {
      method: 'PUT',
      body: settings,
    });
  }

  // ==================== PRICING SETTINGS ====================

  // Get pricing settings
  async getPricingSettings(restaurantId) {
    return this.cachedGet(`/api/restaurants/${restaurantId}/pricing-settings`, 30 * 60 * 1000); // 30 min
  }

  // Update pricing settings
  async updatePricingSettings(restaurantId, settings) {
    const result = await this.request(`/api/restaurants/${restaurantId}/pricing-settings`, {
      method: 'PUT',
      body: settings,
    });
    this.invalidateCache(`/api/restaurants/${restaurantId}/pricing-settings`);
    return result;
  }

  // ==================== BILLING SETTINGS ====================

  async getBillingSettings(restaurantId) {
    return this.request(`/api/restaurants/${restaurantId}/billing-settings`);
  }

  async updateBillingSettings(restaurantId, settings) {
    return this.request(`/api/restaurants/${restaurantId}/billing-settings`, {
      method: 'PUT',
      body: settings,
    });
  }

  async validateManagerPin(restaurantId, pin) {
    return this.request('/api/billing/validate-manager-pin', {
      method: 'POST',
      body: { restaurantId, pin },
    });
  }

  async processRefund(orderId, data) {
    return this.request(`/api/orders/${orderId}/refund`, {
      method: 'POST',
      body: data,
    });
  }

  async recordPartialPayment(orderId, data) {
    return this.request(`/api/orders/${orderId}/partial-payment`, {
      method: 'POST',
      body: data,
    });
  }

  async compVoidItems(orderId, data) {
    return this.request(`/api/orders/${orderId}/comp-void`, {
      method: 'POST',
      body: data,
    });
  }

  // Edit Completed Orders
  async editCompletedOrder(orderId, data) {
    return this.request(`/api/orders/${orderId}/edit-completed`, {
      method: 'PATCH',
      body: data,
    });
  }

  async getOrderEditHistory(orderId) {
    return this.request(`/api/orders/${orderId}/edit-history`);
  }

  async searchAdminUsers(query) {
    return this.request(`/api/admin/users/search?q=${encodeURIComponent(query)}`);
  }

  async toggleEditCompletedPermission(userId, allow) {
    return this.request(`/api/admin/users/${userId}/allow-edit-completed`, {
      method: 'PATCH',
      body: { allow },
    });
  }

  async getUsersWithEditPermission() {
    return this.request('/api/admin/users/edit-completed-users');
  }

  async getCustomerCreditHistory(customerId) {
    return this.request(`/api/customers/${customerId}/credit-history`);
  }

  async settleCustomerCredit(customerId, data) {
    return this.request(`/api/customers/${customerId}/settle-credit`, {
      method: 'POST',
      body: data,
    });
  }

  async bulkSettleCredit(customerId, data) {
    return this.request(`/api/customers/${customerId}/bulk-settle-credit`, {
      method: 'POST',
      body: data,
    });
  }

  async getCustomerWallet(customerId) {
    return this.request(`/api/customers/${customerId}/wallet`);
  }

  async addCustomerWalletCredit(customerId, data) {
    return this.request(`/api/customers/${customerId}/wallet/credit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async redeemCustomerWallet(customerId, data) {
    return this.request(`/api/customers/${customerId}/wallet/redeem`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getStaffTips(userId) {
    return this.request(`/api/staff/${userId}/tips`);
  }

  // Generate restaurant code
  async generateRestaurantCode(restaurantId) {
    return this.request(`/api/restaurants/${restaurantId}/generate-code`, {
      method: 'POST',
    });
  }

  // Get restaurant by code (public)
  async getRestaurantByCode(code) {
    return this.request(`/api/public/restaurant/code/${code}`);
  }

  // Get restaurant by URL slug (public)
  async getRestaurantBySlug(slug) {
    return this.request(`/api/public/restaurant-by-slug/${slug}`);
  }

  // Check if URL slug is available (public)
  async checkSlugAvailability(slug, excludeRestaurantId = null) {
    const params = excludeRestaurantId ? `?excludeRestaurantId=${excludeRestaurantId}` : '';
    return this.request(`/api/public/check-slug/${slug}${params}`);
  }

  // Update restaurant URL slug (authenticated)
  async updateRestaurantSlug(restaurantId, slug) {
    return this.request(`/api/restaurants/${restaurantId}/slug`, {
      method: 'PATCH',
      body: { slug },
    });
  }

  // Get active offers (public) - used by Crave app
  // isFirstOrder: true/false - Filter first-order-only offers based on customer status
  async getActiveOffers(restaurantId, isFirstOrder = undefined) {
    const params = isFirstOrder !== undefined ? `?isFirstOrder=${isFirstOrder}` : '';
    return this.request(`/api/public/offers/${restaurantId}${params}`);
  }

  // Get active offers for POS (authenticated, returns full fields including scope, schedule, bogoConfig)
  async getActiveOffersForPOS(restaurantId, isFirstOrder = undefined) {
    const params = isFirstOrder !== undefined ? `?isFirstOrder=${isFirstOrder}` : '';
    return this.request(`/api/offers/${restaurantId}/active${params}`);
  }

  // Get customer app settings (public)
  async getPublicCustomerAppSettings(restaurantId) {
    return this.request(`/api/public/customer-app-settings/${restaurantId}`);
  }

  // Lookup customer by phone (public) - for loyalty points and customer identification
  async lookupCustomerByPhone(restaurantId, phone, countryCode) {
    // Always send phone as a trimmed string (backend normalizePhone expects string)
    const phoneStr = phone === null || phone === undefined ? '' : String(phone).trim();
    return this.request('/api/public/customer/lookup', {
      method: 'POST',
      body: { restaurantId, phone: phoneStr, countryCode },
    });
  }

  // Public customer-groups lookup (phone -> groups) for offer audience unlock.
  async lookupPublicCustomerGroups(restaurantId, phone) {
    const p = phone == null ? '' : String(phone).trim();
    const qs = new URLSearchParams({ phone: p }).toString();
    return this.request(`/api/public/customer-groups/lookup/${restaurantId}?${qs}`);
  }

  // Get customer loyalty history (public) - for showing points history
  async getCustomerLoyaltyHistory(customerId, page = 1, limit = 20, type = 'all') {
    return this.request(`/api/public/customer/${customerId}/loyalty-history?page=${page}&limit=${limit}&type=${type}`);
  }

  // Get customer order history (public) - for showing order details
  async getCustomerOrderHistory(customerId, page = 1, limit = 20, status = 'all') {
    return this.request(`/api/public/customer/${customerId}/orders?page=${page}&limit=${limit}&status=${status}`);
  }

  // ==================== OWNER CHAIN DASHBOARD ====================

  // Get owner dashboard overview (all restaurants with today's stats)
  async getOwnerDashboard(params = {}) {
    const query = new URLSearchParams();
    if (params.period) query.append('period', params.period);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    const queryString = query.toString();
    return this.request(`/api/owner/dashboard${queryString ? `?${queryString}` : ''}`);
  }

  // Get cross-restaurant analytics
  async getOwnerAnalytics(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append('period', params.period);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.restaurantIds) {
      params.restaurantIds.forEach(id => queryParams.append('restaurantIds[]', id));
    }
    const query = queryParams.toString();
    return this.request(`/api/owner/analytics${query ? `?${query}` : ''}`);
  }

  // Get all staff across owner's restaurants
  async getOwnerStaff(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.role) queryParams.append('role', params.role);
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    if (params.restaurantIds) {
      params.restaurantIds.forEach(id => queryParams.append('restaurantIds[]', id));
    }
    const query = queryParams.toString();
    return this.request(`/api/owner/staff${query ? `?${query}` : ''}`);
  }

  // Get menu items across owner's restaurants
  async getOwnerMenuItems(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.category) queryParams.append('category', params.category);
    if (params.search) queryParams.append('search', params.search);
    if (params.restaurantIds) {
      params.restaurantIds.forEach(id => queryParams.append('restaurantIds[]', id));
    }
    const query = queryParams.toString();
    return this.request(`/api/owner/menu-items${query ? `?${query}` : ''}`);
  }

  // Get inventory across owner's restaurants
  async getOwnerInventory(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.stockStatus) queryParams.append('stockStatus', params.stockStatus);
    if (params.category) queryParams.append('category', params.category);
    if (params.search) queryParams.append('search', params.search);
    if (params.restaurantIds) {
      params.restaurantIds.forEach(id => queryParams.append('restaurantIds[]', id));
    }
    const query = queryParams.toString();
    return this.request(`/api/owner/inventory${query ? `?${query}` : ''}`);
  }

  // Update staff status (activate/deactivate)
  async updateOwnerStaffStatus(staffId, status) {
    return this.request(`/api/owner/staff/${staffId}/status`, {
      method: 'PATCH',
      body: { status }
    });
  }

  // ==================== AI INSIGHTS ====================

  // Get AI-generated insights for owner's restaurants
  async getAIInsights(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append('period', params.period);
    if (params.restaurantIds) {
      params.restaurantIds.forEach(id => queryParams.append('restaurantIds[]', id));
    }
    const query = queryParams.toString();
    return this.request(`/api/ai/insights${query ? `?${query}` : ''}`);
  }

  // Get email report preferences
  async getEmailPreferences() {
    return this.request('/api/ai/email-preferences');
  }

  // Update email report preferences
  async updateEmailPreferences(preferences) {
    return this.request('/api/ai/email-preferences', {
      method: 'POST',
      body: preferences
    });
  }

  // Send test email report (accepts single email string or array)
  async sendTestReport(emailOrEmails) {
    const body = Array.isArray(emailOrEmails)
      ? { emails: emailOrEmails }
      : { email: emailOrEmails };
    return this.request('/api/ai/send-test-report', {
      method: 'POST',
      body
    });
  }

  // Get AI insights usage (remaining count)
  async getAIUsage() {
    return this.request('/api/ai/usage');
  }

  // ─── Books (Accounting) ──────────────────────────────────────────────────
  async getBooksOverview(restaurantId, params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/api/books/${restaurantId}/overview${q ? `?${q}` : ''}`);
  }
  async getBooksRevenue(restaurantId, params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/api/books/${restaurantId}/revenue${q ? `?${q}` : ''}`);
  }
  async getBooksCogs(restaurantId, params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/api/books/${restaurantId}/cogs${q ? `?${q}` : ''}`);
  }
  async getBooksExpenses(restaurantId, params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/api/books/${restaurantId}/expenses${q ? `?${q}` : ''}`);
  }
  async createBooksExpense(restaurantId, data) {
    return this.request(`/api/books/${restaurantId}/expenses`, { method: 'POST', body: JSON.stringify(data) });
  }
  async updateBooksExpense(restaurantId, expenseId, data) {
    return this.request(`/api/books/${restaurantId}/expenses/${expenseId}`, { method: 'PATCH', body: JSON.stringify(data) });
  }
  async deleteBooksExpense(restaurantId, expenseId) {
    return this.request(`/api/books/${restaurantId}/expenses/${expenseId}`, { method: 'DELETE' });
  }
  async getExpenseCategories(restaurantId) {
    return this.request(`/api/books/${restaurantId}/expense-categories`);
  }
  async saveExpenseCategories(restaurantId, categories) {
    return this.request(`/api/books/${restaurantId}/expense-categories`, { method: 'PUT', body: JSON.stringify({ categories }) });
  }
  async getBooksSupplierDues(restaurantId) {
    return this.request(`/api/books/${restaurantId}/supplier-dues`);
  }
  async getBooksPnl(restaurantId, params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/api/books/${restaurantId}/pnl${q ? `?${q}` : ''}`);
  }

  // ─── Payroll ────────────────────────────────────────────────────────────
  async getPayrollConfig(restaurantId) {
    return this.request(`/api/payroll/${restaurantId}/config`);
  }
  async updatePayrollConfig(restaurantId, data) {
    return this.request(`/api/payroll/${restaurantId}/config`, { method: 'POST', body: data });
  }
  async deletePayrollConfig(restaurantId, configId) {
    return this.request(`/api/payroll/${restaurantId}/config/${configId}`, { method: 'DELETE' });
  }
  async getPayrollRuns(restaurantId) {
    return this.request(`/api/payroll/${restaurantId}/runs`);
  }
  async generatePayrollRun(restaurantId, data) {
    return this.request(`/api/payroll/${restaurantId}/runs`, { method: 'POST', body: data });
  }
  async updatePayrollRun(restaurantId, runId, data) {
    return this.request(`/api/payroll/${restaurantId}/runs/${runId}`, { method: 'PATCH', body: data });
  }
  async getPaySlips(restaurantId, runId) {
    return this.request(`/api/payroll/${restaurantId}/runs/${runId}/slips`);
  }

  // ─── GST Reports ──────────────────────────────────────────────────────
  async getGSTR1(restaurantId, month) {
    return this.request(`/api/gst/${restaurantId}/gstr1?month=${month}`);
  }
  async getGSTR3B(restaurantId, month) {
    return this.request(`/api/gst/${restaurantId}/gstr3b?month=${month}`);
  }
  async getHSNSummary(restaurantId, month) {
    return this.request(`/api/gst/${restaurantId}/hsn-summary?month=${month}`);
  }
  async exportGSTReport(restaurantId, type, month) {
    return this.request(`/api/gst/${restaurantId}/export/${type}?month=${month}`, { responseType: 'text' });
  }

  // ─── Ledger ────────────────────────────────────────────────────────────
  async getLedgerAccounts(restaurantId) {
    return this.request(`/api/ledger/${restaurantId}/accounts`);
  }
  async getLedgerEntries(restaurantId, params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/api/ledger/${restaurantId}/entries${q ? `?${q}` : ''}`);
  }
  async createJournalEntry(restaurantId, data) {
    return this.request(`/api/ledger/${restaurantId}/entries`, { method: 'POST', body: data });
  }
  async getTrialBalance(restaurantId, params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/api/ledger/${restaurantId}/trial-balance${q ? `?${q}` : ''}`);
  }
  async getLedgerSummary(restaurantId, params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/api/ledger/${restaurantId}/summary${q ? `?${q}` : ''}`);
  }

  // ─── Invoice Module ─────────────────────────────────────────────────────
  // Helper: invoice endpoints return { success, data } — unwrap to match what page code expects
  _invUnwrap(promise) {
    return promise.then(r => (r && typeof r.success === 'boolean' && 'data' in r) ? r.data : r);
  }

  // Organization
  getInvoiceOrg() { return this._invUnwrap(this.request('/api/invoice/organizations')); }
  updateInvoiceOrg(data) { return this._invUnwrap(this.request('/api/invoice/organizations', { method: 'PATCH', body: data })); }

  // Settings
  getInvoiceSettings() { return this._invUnwrap(this.request('/api/invoice/settings')); }
  updateInvoiceSettings(data) { return this._invUnwrap(this.request('/api/invoice/settings', { method: 'PATCH', body: data })); }

  // Customers
  getInvoiceCustomers(query = '') { return this._invUnwrap(this.request(`/api/invoice/customers${query ? `?${query}` : ''}`)); }
  getInvoiceCustomer(id) { return this._invUnwrap(this.request(`/api/invoice/customers/${id}`)); }
  getInvoiceDineopenCustomers(restaurantId) { return this._invUnwrap(this.request(`/api/invoice/customers/dineopen?restaurantId=${restaurantId}`)); }
  createInvoiceCustomer(data) { return this._invUnwrap(this.request('/api/invoice/customers', { method: 'POST', body: data })); }
  updateInvoiceCustomer(id, data) { return this._invUnwrap(this.request(`/api/invoice/customers/${id}`, { method: 'PATCH', body: data })); }
  deleteInvoiceCustomer(id) { return this._invUnwrap(this.request(`/api/invoice/customers/${id}`, { method: 'DELETE' })); }

  // Items
  getInvoiceItems(query = '') { return this._invUnwrap(this.request(`/api/invoice/items${query ? `?${query}` : ''}`)); }
  getInvoiceItem(id) { return this._invUnwrap(this.request(`/api/invoice/items/${id}`)); }
  createInvoiceItem(data) { return this._invUnwrap(this.request('/api/invoice/items', { method: 'POST', body: data })); }
  updateInvoiceItem(id, data) { return this._invUnwrap(this.request(`/api/invoice/items/${id}`, { method: 'PATCH', body: data })); }
  deleteInvoiceItem(id) { return this._invUnwrap(this.request(`/api/invoice/items/${id}`, { method: 'DELETE' })); }

  // Invoices
  getInvoices(query = '') { return this._invUnwrap(this.request(`/api/invoice/invoices${query ? `?${query}` : ''}`)); }
  getInvoice(id) { return this._invUnwrap(this.request(`/api/invoice/invoices/${id}`)); }
  getNextInvoiceNumber() { return this._invUnwrap(this.request('/api/invoice/invoices/next-number')); }
  createInvoice(data) { return this._invUnwrap(this.request('/api/invoice/invoices', { method: 'POST', body: data })); }
  updateInvoice(id, data) { return this._invUnwrap(this.request(`/api/invoice/invoices/${id}`, { method: 'PATCH', body: data })); }
  sendInvoice(id) { return this._invUnwrap(this.request(`/api/invoice/invoices/${id}/send`, { method: 'POST' })); }
  voidInvoice(id) { return this._invUnwrap(this.request(`/api/invoice/invoices/${id}/void`, { method: 'POST' })); }
  deleteInvoice(id) { return this._invUnwrap(this.request(`/api/invoice/invoices/${id}`, { method: 'DELETE' })); }

  // Quotes
  getInvoiceQuotes(query = '') { return this._invUnwrap(this.request(`/api/invoice/quotes${query ? `?${query}` : ''}`)); }
  getInvoiceQuote(id) { return this._invUnwrap(this.request(`/api/invoice/quotes/${id}`)); }
  getNextQuoteNumber() { return this._invUnwrap(this.request('/api/invoice/quotes/next-number')); }
  createInvoiceQuote(data) { return this._invUnwrap(this.request('/api/invoice/quotes', { method: 'POST', body: data })); }
  sendInvoiceQuote(id) { return this._invUnwrap(this.request(`/api/invoice/quotes/${id}/send`, { method: 'POST' })); }
  acceptInvoiceQuote(id) { return this._invUnwrap(this.request(`/api/invoice/quotes/${id}/accept`, { method: 'POST' })); }
  declineInvoiceQuote(id) { return this._invUnwrap(this.request(`/api/invoice/quotes/${id}/decline`, { method: 'POST' })); }
  convertQuoteToInvoice(id) { return this._invUnwrap(this.request(`/api/invoice/quotes/${id}/convert`, { method: 'POST' })); }
  deleteInvoiceQuote(id) { return this._invUnwrap(this.request(`/api/invoice/quotes/${id}`, { method: 'DELETE' })); }

  // Challans
  getInvoiceChallans(query = '') { return this._invUnwrap(this.request(`/api/invoice/challans${query ? `?${query}` : ''}`)); }
  getInvoiceChallan(id) { return this._invUnwrap(this.request(`/api/invoice/challans/${id}`)); }
  getNextChallanNumber() { return this._invUnwrap(this.request('/api/invoice/challans/next-number')); }
  createInvoiceChallan(data) { return this._invUnwrap(this.request('/api/invoice/challans', { method: 'POST', body: data })); }
  updateInvoiceChallan(id, data) { return this._invUnwrap(this.request(`/api/invoice/challans/${id}`, { method: 'PATCH', body: data })); }
  deleteInvoiceChallan(id) { return this._invUnwrap(this.request(`/api/invoice/challans/${id}`, { method: 'DELETE' })); }

  // Payments
  getInvoicePayments() { return this._invUnwrap(this.request('/api/invoice/payments')); }
  createInvoicePayment(data) { return this._invUnwrap(this.request('/api/invoice/payments', { method: 'POST', body: data })); }

  // Expenses
  getInvoiceExpenses(query = '') { return this._invUnwrap(this.request(`/api/invoice/expenses${query ? `?${query}` : ''}`)); }
  createInvoiceExpense(data) { return this._invUnwrap(this.request('/api/invoice/expenses', { method: 'POST', body: data })); }

  // Reports
  getInvoiceReportReceivables() { return this._invUnwrap(this.request('/api/invoice/reports/receivables')); }
  getInvoiceReportSales() { return this._invUnwrap(this.request('/api/invoice/reports/sales')); }
  getInvoiceReportExpenses() { return this._invUnwrap(this.request('/api/invoice/reports/expenses')); }

  // AI
  getInvoiceExpenseCategories() { return this._invUnwrap(this.request('/api/invoice/ai/expense-categories')); }
  invoiceAIChat(data) { return this._invUnwrap(this.request('/api/invoice/ai/chat', { method: 'POST', body: data })); }

  // ==================== CHAIN / ENTERPRISE APIs ====================

  // --- Organization Management ---
  createOrganization(data) { return this.request('/api/organizations', { method: 'POST', body: data }); }
  getOrganizations() { return this.request('/api/organizations'); }
  getOrganization(orgId) { return this.request(`/api/organizations/${orgId}`); }
  updateOrganization(orgId, data) { return this.request(`/api/organizations/${orgId}`, { method: 'PATCH', body: data }); }
  addOutletToOrg(orgId, data) { return this.request(`/api/organizations/${orgId}/outlets`, { method: 'POST', body: data }); }
  removeOutletFromOrg(orgId, restaurantId) { return this.request(`/api/organizations/${orgId}/outlets/${restaurantId}`, { method: 'DELETE' }); }
  changeOutletType(orgId, restaurantId, data) { return this.request(`/api/organizations/${orgId}/outlets/${restaurantId}/type`, { method: 'PATCH', body: data }); }
  getOrgOutlets(orgId) { return this.request(`/api/organizations/${orgId}/outlets`); }

  // --- Central Menu Management ---
  createMenuTemplate(orgId, data) { return this.request(`/api/org-menu/${orgId}/templates`, { method: 'POST', body: data }); }
  getMenuTemplates(orgId) { return this.request(`/api/org-menu/${orgId}/templates`); }
  getMenuTemplate(orgId, templateId) { return this.request(`/api/org-menu/${orgId}/templates/${templateId}`); }
  updateMenuTemplate(orgId, templateId, data) { return this.request(`/api/org-menu/${orgId}/templates/${templateId}`, { method: 'PATCH', body: data }); }
  archiveMenuTemplate(orgId, templateId) { return this.request(`/api/org-menu/${orgId}/templates/${templateId}`, { method: 'DELETE' }); }
  addMenuTemplateItem(orgId, templateId, data) { return this.request(`/api/org-menu/${orgId}/templates/${templateId}/items`, { method: 'POST', body: data }); }
  updateMenuTemplateItem(orgId, templateId, itemId, data) { return this.request(`/api/org-menu/${orgId}/templates/${templateId}/items/${itemId}`, { method: 'PATCH', body: data }); }
  deleteMenuTemplateItem(orgId, templateId, itemId) { return this.request(`/api/org-menu/${orgId}/templates/${templateId}/items/${itemId}`, { method: 'DELETE' }); }
  pushMenuTemplate(orgId, templateId, data) { return this.request(`/api/org-menu/${orgId}/templates/${templateId}/push`, { method: 'POST', body: data }); }
  syncMenuTemplate(orgId, templateId) { return this.request(`/api/org-menu/${orgId}/templates/${templateId}/sync`, { method: 'POST' }); }
  getMenuSyncStatus(orgId) { return this.request(`/api/org-menu/${orgId}/sync-status`); }
  toggleMenuItemLock(orgId, itemId, data) { return this.request(`/api/org-menu/${orgId}/items/${itemId}/lock`, { method: 'POST', body: data }); }
  importMenuFromOutlet(orgId, restaurantId) { return this.request(`/api/org-menu/${orgId}/import-from-outlet/${restaurantId}`, { method: 'POST' }); }

  // --- Warehouse / Indent System ---
  createIndent(orgId, data) { return this.request(`/api/warehouse/${orgId}/indents`, { method: 'POST', body: data }); }
  async getIndents(orgId, params = {}) {
    const q = new URLSearchParams();
    if (params.status) q.append('status', params.status);
    if (params.requestingOutletId) q.append('requestingOutletId', params.requestingOutletId);
    if (params.warehouseId) q.append('warehouseId', params.warehouseId);
    if (params.page) q.append('page', params.page);
    if (params.limit) q.append('limit', params.limit);
    const qs = q.toString();
    return this.request(`/api/warehouse/${orgId}/indents${qs ? `?${qs}` : ''}`);
  }
  getIndent(orgId, indentId) { return this.request(`/api/warehouse/${orgId}/indents/${indentId}`); }
  receiveIndent(orgId, indentId, data) { return this.request(`/api/warehouse/${orgId}/indents/${indentId}/receive`, { method: 'PATCH', body: data }); }
  cancelIndent(orgId, indentId) { return this.request(`/api/warehouse/${orgId}/indents/${indentId}`, { method: 'DELETE' }); }
  approveIndent(orgId, indentId, data) { return this.request(`/api/warehouse/${orgId}/indents/${indentId}/approve`, { method: 'PATCH', body: data }); }
  rejectIndent(orgId, indentId, data) { return this.request(`/api/warehouse/${orgId}/indents/${indentId}/reject`, { method: 'PATCH', body: data }); }
  pickIndent(orgId, indentId) { return this.request(`/api/warehouse/${orgId}/indents/${indentId}/pick`, { method: 'PATCH' }); }
  dispatchIndent(orgId, indentId, data) { return this.request(`/api/warehouse/${orgId}/indents/${indentId}/dispatch`, { method: 'PATCH', body: data }); }
  getWarehouseStock(orgId, warehouseId) { return this.request(`/api/warehouse/${orgId}/warehouse/${warehouseId}/stock`); }
  getWarehousePending(orgId, warehouseId) { return this.request(`/api/warehouse/${orgId}/warehouse/${warehouseId}/pending`); }

  // --- Central Kitchen / Production ---
  createProductionOrder(orgId, data) { return this.request(`/api/central-kitchen/${orgId}/production-orders`, { method: 'POST', body: data }); }
  async getProductionOrders(orgId, params = {}) {
    const q = new URLSearchParams();
    if (params.status) q.append('status', params.status);
    if (params.centralKitchenId) q.append('centralKitchenId', params.centralKitchenId);
    if (params.startDate) q.append('startDate', params.startDate);
    if (params.endDate) q.append('endDate', params.endDate);
    if (params.page) q.append('page', params.page);
    if (params.limit) q.append('limit', params.limit);
    const qs = q.toString();
    return this.request(`/api/central-kitchen/${orgId}/production-orders${qs ? `?${qs}` : ''}`);
  }
  getProductionOrder(orgId, orderId) { return this.request(`/api/central-kitchen/${orgId}/production-orders/${orderId}`); }
  startProduction(orgId, orderId) { return this.request(`/api/central-kitchen/${orgId}/production-orders/${orderId}/start`, { method: 'PATCH' }); }
  completeProduction(orgId, orderId, data) { return this.request(`/api/central-kitchen/${orgId}/production-orders/${orderId}/complete`, { method: 'PATCH', body: data }); }
  cancelProductionOrder(orgId, orderId) { return this.request(`/api/central-kitchen/${orgId}/production-orders/${orderId}/cancel`, { method: 'PATCH' }); }
  createDistributionPlan(orgId, data) { return this.request(`/api/central-kitchen/${orgId}/distribution-plans`, { method: 'POST', body: data }); }
  async getDistributionPlans(orgId, params = {}) {
    const q = new URLSearchParams();
    if (params.status) q.append('status', params.status);
    if (params.centralKitchenId) q.append('centralKitchenId', params.centralKitchenId);
    if (params.page) q.append('page', params.page);
    if (params.limit) q.append('limit', params.limit);
    const qs = q.toString();
    return this.request(`/api/central-kitchen/${orgId}/distribution-plans${qs ? `?${qs}` : ''}`);
  }
  getDistributionPlan(orgId, planId) { return this.request(`/api/central-kitchen/${orgId}/distribution-plans/${planId}`); }
  dispatchDistribution(orgId, planId, outletId) { return this.request(`/api/central-kitchen/${orgId}/distribution-plans/${planId}/dispatch/${outletId}`, { method: 'PATCH' }); }
  receiveDistribution(orgId, planId, outletId, data) { return this.request(`/api/central-kitchen/${orgId}/distribution-plans/${planId}/receive/${outletId}`, { method: 'PATCH', body: data }); }
  getKitchenDashboard(orgId, kitchenId) { return this.request(`/api/central-kitchen/${orgId}/kitchen/${kitchenId}/dashboard`); }

  // --- HQ Reports ---
  async getHQReport(orgId, reportType, params = {}) {
    const q = new URLSearchParams();
    if (params.startDate) q.append('startDate', params.startDate);
    if (params.endDate) q.append('endDate', params.endDate);
    if (params.restaurantIds && Array.isArray(params.restaurantIds)) {
      params.restaurantIds.forEach(id => q.append('restaurantIds[]', id));
    }
    const qs = q.toString();
    return this.request(`/api/hq-reports/${orgId}/${reportType}${qs ? `?${qs}` : ''}`);
  }
  getInventoryComparison(orgId, params = {}) { return this.getHQReport(orgId, 'inventory-comparison', params); }
  getConsolidatedPL(orgId, params = {}) { return this.getHQReport(orgId, 'consolidated-pl', params); }
  getKitchenReports(orgId, params = {}) { return this.getHQReport(orgId, 'kitchen-reports', params); }
  getWarehouseMetrics(orgId, params = {}) { return this.getHQReport(orgId, 'warehouse-metrics', params); }
  getIndentTracking(orgId, params = {}) { return this.getHQReport(orgId, 'indent-tracking', params); }
  getMenuPerformance(orgId, params = {}) { return this.getHQReport(orgId, 'menu-performance', params); }
  getOutletRanking(orgId, params = {}) { return this.getHQReport(orgId, 'outlet-ranking', params); }
  getSalesSummary(orgId, params = {}) { return this.getHQReport(orgId, 'sales-summary', params); }
  getStaffPerformance(orgId, params = {}) { return this.getHQReport(orgId, 'staff-performance', params); }
  getCategorySales(orgId, params = {}) { return this.getHQReport(orgId, 'category-sales', params); }
  getDiscountReport(orgId, params = {}) { return this.getHQReport(orgId, 'discount-report', params); }
  getTaxSummary(orgId, params = {}) { return this.getHQReport(orgId, 'tax-summary', params); }
  getCustomerInsights(orgId, params = {}) { return this.getHQReport(orgId, 'customer-insights', params); }
  getPaymentAnalytics(orgId, params = {}) { return this.getHQReport(orgId, 'payment-analytics', params); }
  getOrderAnalytics(orgId, params = {}) { return this.getHQReport(orgId, 'order-analytics', params); }
  getRevenueTrends(orgId, params = {}) { return this.getHQReport(orgId, 'revenue-trends', params); }
  getWalletLoyaltyReport(orgId, params = {}) { return this.getHQReport(orgId, 'wallet-loyalty', params); }
  getReportSummaries(orgId, params = {}) {
    const q = new URLSearchParams();
    if (params.startDate) q.append('startDate', params.startDate);
    if (params.endDate) q.append('endDate', params.endDate);
    if (params.restaurantIds && Array.isArray(params.restaurantIds)) {
      params.restaurantIds.forEach(id => q.append('restaurantIds[]', id));
    }
    const qs = q.toString();
    return this.request(`/api/hq-reports/${orgId}/summaries${qs ? '?' + qs : ''}`);
  }
  exportHQReport(orgId, reportType, params = {}) {
    const q = new URLSearchParams();
    if (params.startDate) q.append('startDate', params.startDate);
    if (params.endDate) q.append('endDate', params.endDate);
    if (params.restaurantIds && Array.isArray(params.restaurantIds)) {
      params.restaurantIds.forEach(id => q.append('restaurantIds[]', id));
    }
    const qs = q.toString();
    return this.request(`/api/hq-reports/${orgId}/export/${reportType}${qs ? `?${qs}` : ''}`, { rawResponse: true });
  }

  // ==================== AGGREGATOR INTEGRATION APIs ====================

  // --- Talabat ---
  connectTalabat(restaurantId, credentials) { return this.request(`/api/aggregators/talabat/connect/${restaurantId}`, { method: 'POST', body: credentials }); }
  disconnectTalabat(restaurantId) { return this.request(`/api/aggregators/talabat/disconnect/${restaurantId}`, { method: 'DELETE' }); }
  getTalabatStatus(restaurantId) { return this.request(`/api/aggregators/talabat/status/${restaurantId}`); }
  updateTalabatSettings(restaurantId, settings) { return this.request(`/api/aggregators/talabat/settings/${restaurantId}`, { method: 'PATCH', body: settings }); }
  pushMenuToTalabat(restaurantId) { return this.request(`/api/aggregators/talabat/push-menu/${restaurantId}`, { method: 'POST' }); }
  updateTalabatStoreStatus(restaurantId, isOpen) { return this.request(`/api/aggregators/talabat/store-status/${restaurantId}`, { method: 'POST', body: { isOpen } }); }
  acceptTalabatOrder(restaurantId, orderId) { return this.request(`/api/aggregators/talabat/accept-order/${restaurantId}/${orderId}`, { method: 'POST' }); }
  rejectTalabatOrder(restaurantId, orderId, reason) { return this.request(`/api/aggregators/talabat/reject-order/${restaurantId}/${orderId}`, { method: 'POST', body: { reason } }); }
  markTalabatOrderPrepared(restaurantId, orderId) { return this.request(`/api/aggregators/talabat/mark-prepared/${restaurantId}/${orderId}`, { method: 'POST' }); }
  getTalabatOrders(restaurantId, limit) { return this.request(`/api/aggregators/talabat/orders/${restaurantId}${limit ? `?limit=${limit}` : ''}`); }
  getAggregatorWebhookUrls() { return this.request('/api/aggregators/webhook-url'); }

  // ── Parking Management ──────────────────────────────────────
  getParkingConfig(restaurantId) { return this.request(`/api/parking/config/${restaurantId}`); }
  updateParkingConfig(restaurantId, data) { return this.request(`/api/parking/config/${restaurantId}`, { method: 'PUT', body: data }); }
  getParkingDashboardStats(restaurantId) { return this.request(`/api/parking/config/${restaurantId}/dashboard-stats`); }

  getParkingZones(restaurantId) { return this.request(`/api/parking/zones/${restaurantId}`); }
  createParkingZone(restaurantId, data) { return this.request(`/api/parking/zones/${restaurantId}`, { method: 'POST', body: data }); }
  updateParkingZone(restaurantId, zoneId, data) { return this.request(`/api/parking/zones/${restaurantId}/${zoneId}`, { method: 'PUT', body: data }); }
  deleteParkingZone(restaurantId, zoneId) { return this.request(`/api/parking/zones/${restaurantId}/${zoneId}`, { method: 'DELETE' }); }

  getParkingSlots(restaurantId, filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`/api/parking/slots/${restaurantId}${query ? `?${query}` : ''}`);
  }
  createParkingSlot(restaurantId, data) { return this.request(`/api/parking/slots/${restaurantId}`, { method: 'POST', body: data }); }
  bulkCreateParkingSlots(restaurantId, data) { return this.request(`/api/parking/slots/${restaurantId}/bulk`, { method: 'POST', body: data }); }
  updateParkingSlot(restaurantId, slotId, data) { return this.request(`/api/parking/slots/${restaurantId}/${slotId}`, { method: 'PUT', body: data }); }
  deleteParkingSlot(restaurantId, slotId) { return this.request(`/api/parking/slots/${restaurantId}/${slotId}`, { method: 'DELETE' }); }

  getParkingRates(restaurantId) { return this.request(`/api/parking/rates/${restaurantId}`); }
  createParkingRate(restaurantId, data) { return this.request(`/api/parking/rates/${restaurantId}`, { method: 'POST', body: data }); }
  updateParkingRate(restaurantId, rateId, data) { return this.request(`/api/parking/rates/${restaurantId}/${rateId}`, { method: 'PUT', body: data }); }
  deleteParkingRate(restaurantId, rateId) { return this.request(`/api/parking/rates/${restaurantId}/${rateId}`, { method: 'DELETE' }); }

  getParkingTickets(restaurantId, filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`/api/parking/tickets/${restaurantId}${query ? `?${query}` : ''}`);
  }
  getParkingTicket(restaurantId, ticketId) { return this.request(`/api/parking/tickets/${restaurantId}/${ticketId}`); }
  lookupParkingTicket(restaurantId, filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`/api/parking/tickets/${restaurantId}/lookup${query ? `?${query}` : ''}`);
  }
  createParkingEntry(restaurantId, data) { return this.request(`/api/parking/tickets/${restaurantId}/entry`, { method: 'POST', body: data }); }
  processParkingExit(restaurantId, data) { return this.request(`/api/parking/tickets/${restaurantId}/exit`, { method: 'POST', body: data }); }
  confirmParkingExit(restaurantId, data) { return this.request(`/api/parking/tickets/${restaurantId}/exit/confirm`, { method: 'POST', body: data }); }
  updateParkingTicket(restaurantId, ticketId, data) { return this.request(`/api/parking/tickets/${restaurantId}/${ticketId}`, { method: 'PUT', body: data }); }
  cancelParkingTicket(restaurantId, ticketId, reason) { return this.request(`/api/parking/tickets/${restaurantId}/${ticketId}/cancel`, { method: 'POST', body: { reason } }); }
  getParkingTicketPrintData(restaurantId, ticketId) { return this.request(`/api/parking/tickets/${restaurantId}/${ticketId}/print-data`); }

  recognizeLicensePlate(restaurantId, formData) {
    return this.upload(`/api/parking/ai/recognize-plate/${restaurantId}`, formData);
  }

  getParkingReports(restaurantId, filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`/api/parking/reports/${restaurantId}${query ? `?${query}` : ''}`);
  }

  async downloadParkingReport(restaurantId, { startDate, endDate, staffId, format = 'xlsx' } = {}) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (staffId) params.append('staffId', staffId);
    params.append('format', format);

    const extMap = { csv: '.csv', xlsx: '.xlsx' };
    const ext = extMap[format] || '.csv';

    const token = this.getToken();
    const response = await fetch(`${this.baseURL}/api/parking/reports/${restaurantId}/download?${params.toString()}`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Download failed' }));
      throw new Error(err.error || 'Download failed');
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parking-report-${startDate || 'all'}${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Convert an image URL to base64 via backend proxy (avoids CORS on GCP Storage)
  async imageToBase64(url) {
    return this.request(`/api/utils/image-to-base64?url=${encodeURIComponent(url)}`);
  }
}

const apiClient = new ApiClient();

// Auto-sync auth from cookies to localStorage on module load (cross-tab support)
// This ensures localStorage has auth data before any page checks it directly
if (typeof window !== 'undefined') {
  apiClient.syncAuthFromCookies();
}

export default apiClient;