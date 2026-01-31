const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
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
      const response = await fetch(url, config);
      
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

        // Forbidden - might be role-based access issue
        if (response.status === 403) {
          console.log('🚫 403 Forbidden - Access denied');
          throw new Error(data.message || data.error || 'Access denied.');
        }

        // Provide more specific error message for 404
        if (response.status === 404) {
          throw new Error(data.message || data.error || `Endpoint ${endpoint} not found`);
        }
        throw new Error(data.message || data.error || `API request failed (${response.status})`);
      }

      return data;
    } catch (error) {
      // Only log if it's not a handled error to reduce console noise
      if (error.message && !error.message.includes('not found') && !error.message.includes('failed')) {
        console.error('API Error:', error);
      }
      throw error;
    }
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

  // Authentication utilities
  isAuthenticated() {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
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

    console.log('🚪 Force logout completed - all auth data cleared');
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
    
    // Check if user has restaurants
    const hasRestaurants = localStorage.getItem('selectedRestaurantId');
    
    if (user.role === 'owner' || user.role === 'customer') {
      return hasRestaurants ? '/dashboard' : '/admin';
    } else if (user.role === 'staff') {
      return '/dashboard';
    }
    
    return '/login';
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
      body: { token },
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
      body: { phone, otp, name },
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  // Restaurant endpoints
  async getRestaurants() {
    return this.request('/api/restaurants');
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
    return this.request(`/api/restaurants/${restaurantId}`, {
      method: 'PATCH',
      body: updateData,
    });
  }

  async deleteRestaurant(restaurantId) {
    return this.request(`/api/restaurants/${restaurantId}`, {
      method: 'DELETE',
    });
  }

  // Menu endpoints
  async getMenu(restaurantId, category = null) {
    const query = category ? `?category=${category}` : '';
    return this.request(`/api/menus/${restaurantId}${query}`);
  }

  async createMenuItem(restaurantId, menuItemData) {
    return this.request(`/api/menus/${restaurantId}`, {
      method: 'POST',
      body: menuItemData,
    });
  }

  async updateMenuItem(itemId, updateData) {
    return this.request(`/api/menus/item/${itemId}`, {
      method: 'PATCH',
      body: updateData,
    });
  }

  async deleteMenuItem(itemId) {
    return this.request(`/api/menus/item/${itemId}`, {
      method: 'DELETE',
    });
  }

  async bulkDeleteMenuItems(restaurantId) {
    return this.request(`/api/menus/${restaurantId}/bulk-delete`, {
      method: 'DELETE',
    });
  }

  async markMenuItemAsFavorite(restaurantId, itemId) {
    return this.post(`/api/menus/${restaurantId}/item/${itemId}/favorite`);
  }

  async unmarkMenuItemAsFavorite(restaurantId, itemId) {
    return this.delete(`/api/menus/${restaurantId}/item/${itemId}/favorite`);
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
    return this.request(`/api/menus/bulk-save/${restaurantId}`, {
      method: 'POST',
      body,
    });
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
  async createOrder(orderData) {
    console.log('📤 API Client - Creating order with data:', orderData);
    return this.request('/api/orders', {
      method: 'POST',
      body: orderData,
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
    return this.request(`/api/orders/details/${orderId}`);
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

  async updateOrder(orderId, updateData) {
    return this.request(`/api/orders/${orderId}`, {
      method: 'PATCH',
      body: updateData,
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
    return this.request(`/api/categories/${restaurantId}`, {
      method: 'GET',
    });
  }

  async createCategory(restaurantId, categoryData) {
    return this.request(`/api/categories/${restaurantId}`, {
      method: 'POST',
      body: categoryData,
    });
  }

  async updateCategory(restaurantId, categoryId, categoryData) {
    return this.request(`/api/categories/${restaurantId}/${categoryId}`, {
      method: 'PATCH',
      body: categoryData,
    });
  }

  async deleteCategory(restaurantId, categoryId) {
    return this.request(`/api/categories/${restaurantId}/${categoryId}`, {
      method: 'DELETE',
    });
  }

  // Analytics endpoints
  async getAnalytics(restaurantId, period = '7d') {
    return this.request(`/api/analytics/${restaurantId}?period=${period}`);
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
  async getFloors(restaurantId) {
    return this.request(`/api/floors/${restaurantId}`);
  }

  async createFloor(restaurantId, floorData) {
    return this.request(`/api/floors/${restaurantId}`, {
      method: 'POST',
      body: floorData,
    });
  }

  async updateFloor(floorId, updateData) {
    return this.request(`/api/floors/${floorId}`, {
      method: 'PATCH',
      body: updateData,
    });
  }

  async deleteFloor(floorId) {
    return this.request(`/api/floors/${floorId}`, {
      method: 'DELETE',
    });
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

  // Utility endpoints
  async seedData(restaurantId) {
    return this.request(`/api/seed-data/${restaurantId}`, {
      method: 'POST',
    });
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

  async deleteOrder(orderId) {
    return this.request(`/api/orders/${orderId}`, {
      method: 'DELETE',
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

  async getInventoryCategories(restaurantId) {
    return this.request(`/api/inventory/${restaurantId}/categories`);
  }

  async getInventoryDashboard(restaurantId) {
    return this.request(`/api/inventory/${restaurantId}/dashboard`);
  }

  // Suppliers Management endpoints
  async getSuppliers(restaurantId) {
    return this.request(`/api/suppliers/${restaurantId}`);
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
    return this.request(`/api/admin/tax/${restaurantId}`);
  }

  async updateTaxSettings(restaurantId, taxSettings) {
    return this.request(`/api/admin/tax/${restaurantId}`, {
      method: 'PUT',
      body: { taxSettings },
    });
  }

  async calculateTax(restaurantId, items, subtotal) {
    return this.request(`/api/tax/calculate/${restaurantId}`, {
      method: 'POST',
      body: { items, subtotal },
    });
  }

  // Print Settings endpoints
  async getPrintSettings(restaurantId) {
    return this.request(`/api/admin/print-settings/${restaurantId}`);
  }

  async updatePrintSettings(restaurantId, printSettings) {
    return this.request(`/api/admin/print-settings/${restaurantId}`, {
      method: 'PUT',
      body: { printSettings },
    });
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

  // Send query to DineBot (Simple Intent-Based API)
  async queryDineBot(query, restaurantId) {
    // SECURITY: Commented out to prevent exposing sensitive token data in console logs
    // console.log('🤖 DineBot queryDineBot called with:', { query, restaurantId });
    const token = this.getToken();
    // SECURITY: Commented out to prevent exposing sensitive token data in console logs
    // console.log('🔑 Token in queryDineBot:', !!token, token ? token.substring(0, 20) + '...' : 'null');
    
    return this.request('/api/dinebot/query', {
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
  async getCustomers(restaurantId) {
    return this.request(`/api/customers/${restaurantId}`);
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
  async uploadMenuItemImages(itemId, files) {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('images', file);
    });

    return this.request(`/api/menu-items/${itemId}/images`, {
      method: 'POST',
      body: formData
      // Don't set headers - let request method handle auth and Content-Type
    });
  }

  async deleteMenuItemImage(itemId, imageIndex) {
    return this.request(`/api/menu-items/${itemId}/images/${imageIndex}`, {
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

  // Create booking (reservation)
  async createBooking(bookingData) {
    return this.request('/api/booking', {
      method: 'POST',
      body: bookingData,
    });
  }

  // Get bookings
  async getBookings(restaurantId, filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.date) params.append('date', filters.date);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/bookings/${restaurantId}${queryString}`);
  }

  // Cancel booking
  async cancelBooking(bookingId, reason) {
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

  // Get active offers (public)
  // isFirstOrder: true/false - Filter first-order-only offers based on customer status
  async getActiveOffers(restaurantId, isFirstOrder = undefined) {
    const params = isFirstOrder !== undefined ? `?isFirstOrder=${isFirstOrder}` : '';
    return this.request(`/api/public/offers/${restaurantId}${params}`);
  }

  // Get customer app settings (public)
  async getPublicCustomerAppSettings(restaurantId) {
    return this.request(`/api/public/customer-app-settings/${restaurantId}`);
  }

  // Lookup customer by phone (public) - for loyalty points
  async lookupCustomerByPhone(restaurantId, phone) {
    return this.request('/api/public/customer/lookup', {
      method: 'POST',
      body: { restaurantId, phone },
    });
  }

  // Get customer loyalty history (public) - for showing points history
  async getCustomerLoyaltyHistory(customerId, page = 1, limit = 20, type = 'all') {
    return this.request(`/api/public/customer/${customerId}/loyalty-history?page=${page}&limit=${limit}&type=${type}`);
  }

  // Get customer order history (public) - for showing order details
  async getCustomerOrderHistory(customerId, page = 1, limit = 20, status = 'all') {
    return this.request(`/api/public/customer/${customerId}/orders?page=${page}&limit=${limit}&status=${status}`);
  }
}

const apiClient = new ApiClient();
export default apiClient;