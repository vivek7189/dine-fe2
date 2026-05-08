const entityStore = require('./entityStore');

// Lazy hub reference for broadcasting entity events on LAN
let _hub = null;
function getHub() {
  if (!_hub) { try { _hub = require('./hub'); } catch {} }
  return _hub;
}
function broadcastIfHub(entityType, operation, data, entityId) {
  try {
    const hub = getHub();
    if (hub && hub.isHubRunning && hub.isHubRunning()) {
      // Broadcast to all connected terminals via WebSocket
      hub.broadcastEntityEvent(entityType, operation, data, entityId);
      // Also notify the hub terminal's own renderer via IPC
      try {
        const { BrowserWindow } = require('electron');
        const windows = BrowserWindow.getAllWindows();
        for (const win of windows) {
          if (win.webContents && !win.webContents.isDestroyed()) {
            // Build the same message format as hub WebSocket events
            const ENTITY_EVENT_NAMES = {
              menu_items: { CREATE: 'menu-item-created', UPDATE: 'menu-updated', DELETE: 'menu-item-deleted' },
              orders: { CREATE: 'order-created', UPDATE: 'order-updated', DELETE: 'order-deleted' },
              tables: { CREATE: 'table-updated', UPDATE: 'table-updated', DELETE: 'table-updated' },
            };
            const eventName = ENTITY_EVENT_NAMES[entityType]?.[operation];
            if (eventName) {
              win.webContents.send('hub-event', { type: 'event', event: eventName, data: { entityId, ...data } });
            }
          }
        }
      } catch { /* renderer notification is best-effort */ }
    }
  } catch { /* hub not available or not running */ }
}

// Broadcast a print-specific event (kot-print-request, billing-print-request)
// to all connected LAN terminals AND the hub's own renderer
function broadcastPrintEvent(eventName, data) {
  try {
    const hub = getHub();
    if (hub && hub.isHubRunning && hub.isHubRunning()) {
      // Send to LAN terminals via hub WebSocket
      if (hub.broadcastRawEvent) {
        hub.broadcastRawEvent(eventName, data);
      }
    }
    // Also notify the hub's own renderer via IPC
    const { BrowserWindow } = require('electron');
    const windows = BrowserWindow.getAllWindows();
    for (const win of windows) {
      if (win.webContents && !win.webContents.isDestroyed()) {
        win.webContents.send('hub-event', { type: 'event', event: eventName, data });
      }
    }
  } catch { /* best-effort */ }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function match(pattern, endpoint) {
  const patternParts = pattern.split('/');
  const endpointParts = endpoint.split('?')[0].split('/');
  if (patternParts.length !== endpointParts.length) return null;
  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = endpointParts[i];
    } else if (patternParts[i] !== endpointParts[i]) {
      return null;
    }
  }
  return params;
}

function parseQuery(endpoint) {
  const idx = endpoint.indexOf('?');
  if (idx === -1) return {};
  const qs = endpoint.slice(idx + 1);
  const params = {};
  for (const pair of qs.split('&')) {
    const [k, v] = pair.split('=');
    if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || '');
  }
  return params;
}

function safe(fn) {
  try {
    const result = fn();
    if (result && typeof result.then === 'function') {
      return result.catch((err) => ({
        handled: true,
        data: { error: err.message || 'Internal local error', success: false },
        statusCode: 500,
      }));
    }
    return result;
  } catch (err) {
    return {
      handled: true,
      data: { error: err.message || 'Internal local error', success: false },
      statusCode: 500,
    };
  }
}

function ok(data) {
  return { handled: true, data, statusCode: 200 };
}

const NOT_HANDLED = { handled: false };

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

function routeLocally(endpoint, method, body) {
  const m = method.toUpperCase();
  const query = parseQuery(endpoint);
  const path = endpoint.split('?')[0];
  let p;

  // Cloud-only pass-through prefixes
  const cloudOnly = [
    '/api/auth/', '/api/upload/', '/api/voice/', '/api/dineai/',
    '/api/smart-suggestions/', '/api/public/', '/api/payment/',
    '/api/razorpay/', '/api/demo', '/api/super-admin/',
    '/api/menus/bulk-upload/', '/api/menus/bulk-save/',
    '/api/menus/upload-status/', '/api/menu-items/',
    '/api/invoice/ocr', '/api/printer/',
  ];
  for (const prefix of cloudOnly) {
    if (path.startsWith(prefix)) return NOT_HANDLED;
  }

  // ── HEALTH ──
  if (m === 'GET' && path === '/api/health') {
    return ok({ status: 'ok', offline: true });
  }

  // ── ORDERS ──
  if (m === 'GET' && (p = match('/api/orders/single/:orderId', path))) {
    return safe(() => ok({ order: entityStore.getOrder(p.orderId), success: true }));
  }
  if (m === 'PATCH' && (p = match('/api/orders/:orderId/status', path))) {
    return safe(() => {
      const order = entityStore.updateOrderStatus(p.orderId, body.restaurantId, body.status, body);
      broadcastIfHub('orders', 'UPDATE', { orderId: p.orderId, status: body.status }, p.orderId);
      // Trigger billing-print-request when order is completed
      if (body.status === 'completed' && order) {
        broadcastPrintEvent('billing-print-request', { orderId: p.orderId, id: p.orderId });
      }
      return ok({ order, success: true });
    });
  }
  if (m === 'PATCH' && (p = match('/api/orders/:orderId/cancel', path))) {
    return safe(() => ok({ order: entityStore.cancelOrder(p.orderId, body.restaurantId, body.reason), success: true }));
  }
  if (m === 'PATCH' && (p = match('/api/orders/:orderId', path))) {
    return safe(() => {
      const order = entityStore.updateOrder(p.orderId, body.restaurantId, body);
      broadcastIfHub('orders', 'UPDATE', body, p.orderId);
      return ok({ order, success: true });
    });
  }
  if (m === 'DELETE' && (p = match('/api/orders/:orderId', path))) {
    return safe(() => { entityStore.deleteOrder(p.orderId, body?.restaurantId); return ok({ success: true }); });
  }
  if (m === 'POST' && path === '/api/orders') {
    return safe(() => {
      const order = entityStore.createOrder(body.restaurantId, body);
      broadcastIfHub('orders', 'CREATE', { orderId: order.id, tableNumber: body.tableNumber }, order.id);
      // Trigger kot-print-request for the new order
      broadcastPrintEvent('kot-print-request', { orderId: order.id, id: order.id, dailyOrderId: order.dailyOrderId, tableNumber: body.tableNumber });
      return ok({ order, success: true });
    });
  }
  if (m === 'GET' && (p = match('/api/orders/:restaurantId', path))) {
    return safe(() => ok({ orders: entityStore.getOrders(p.restaurantId, query), success: true }));
  }

  // ── MENUS ──
  if (m === 'POST' && (p = match('/api/menus/:restaurantId/item/:itemId/favorite', path))) {
    return safe(() => {
      const items = entityStore.getMenuItems(p.restaurantId);
      const item = (items || []).find(i => i.id === p.itemId || i._id === p.itemId);
      const updated = entityStore.upsertMenuItem(p.restaurantId, { ...(item || {}), id: p.itemId, isFavorite: true });
      return ok({ item: updated, success: true });
    });
  }
  if (m === 'DELETE' && (p = match('/api/menus/:restaurantId/item/:itemId/favorite', path))) {
    return safe(() => {
      const items = entityStore.getMenuItems(p.restaurantId);
      const item = (items || []).find(i => i.id === p.itemId || i._id === p.itemId);
      const updated = entityStore.upsertMenuItem(p.restaurantId, { ...(item || {}), id: p.itemId, isFavorite: false });
      return ok({ item: updated, success: true });
    });
  }
  if (m === 'DELETE' && (p = match('/api/menus/:restaurantId/bulk-delete', path))) {
    return NOT_HANDLED; // bulk delete needs special handling, pass to cloud
  }
  if (m === 'PATCH' && (p = match('/api/menus/item/:id', path))) {
    return safe(() => {
      const item = entityStore.upsertMenuItem(body.restaurantId, { id: p.id, ...body });
      broadcastIfHub('menu_items', 'UPDATE', { ...body, id: p.id }, p.id);
      return ok({ item, success: true });
    });
  }
  if (m === 'DELETE' && (p = match('/api/menus/item/:id', path))) {
    return safe(() => {
      entityStore.deleteMenuItem(p.id, body?.restaurantId);
      broadcastIfHub('menu_items', 'DELETE', { id: p.id }, p.id);
      return ok({ success: true });
    });
  }
  if (m === 'POST' && (p = match('/api/menus/:restaurantId', path))) {
    return safe(() => {
      const item = entityStore.createMenuItem(p.restaurantId, body);
      broadcastIfHub('menu_items', 'CREATE', { ...body, restaurantId: p.restaurantId }, item?.id || body.id);
      return ok({ item, success: true });
    });
  }
  if (m === 'GET' && (p = match('/api/menus/:restaurantId', path))) {
    return safe(() => ok({ items: entityStore.getMenuItems(p.restaurantId), menuItems: entityStore.getMenuItems(p.restaurantId), success: true }));
  }

  // ── TABLES ──
  if (m === 'POST' && (p = match('/api/tables/:restaurantId/bulk', path))) {
    return safe(() => ok({ tables: entityStore.createTablesBulk(p.restaurantId, body.tables || body), success: true }));
  }
  if (m === 'POST' && (p = match('/api/tables/:restaurantId/reset-all', path))) {
    return safe(() => { entityStore.resetAllTables(p.restaurantId); return ok({ success: true }); });
  }
  if (m === 'PATCH' && (p = match('/api/tables/:tableId/status', path))) {
    return safe(() => ok({ table: entityStore.updateTableStatus(p.tableId, body.restaurantId, body.status, body.orderId), success: true }));
  }
  if (m === 'PATCH' && (p = match('/api/tables/:tableId', path))) {
    return safe(() => ok({ table: entityStore.updateTable(p.tableId, body.restaurantId, body), success: true }));
  }
  if (m === 'DELETE' && (p = match('/api/tables/:tableId', path))) {
    return safe(() => { entityStore.deleteTable(p.tableId, body?.restaurantId); return ok({ success: true }); });
  }
  if (m === 'POST' && (p = match('/api/tables/:restaurantId', path))) {
    return safe(() => ok({ table: entityStore.createTable(p.restaurantId, body), success: true }));
  }
  if (m === 'GET' && (p = match('/api/tables/:restaurantId', path))) {
    return safe(() => ok({ tables: entityStore.getTables(p.restaurantId), success: true }));
  }

  // ── FLOORS ──
  if (m === 'PATCH' && (p = match('/api/floors/reorder/:restaurantId', path))) {
    return safe(() => {
      const floors = body.floors || body;
      if (Array.isArray(floors)) {
        for (const floor of floors) {
          entityStore.updateFloor(floor.id || floor._id, p.restaurantId, floor);
        }
      }
      return ok({ success: true });
    });
  }
  if (m === 'PATCH' && (p = match('/api/floors/:floorId', path))) {
    return safe(() => ok({ floor: entityStore.updateFloor(p.floorId, body.restaurantId, body), success: true }));
  }
  if (m === 'DELETE' && (p = match('/api/floors/:floorId', path))) {
    return safe(() => { entityStore.deleteFloor(p.floorId, body?.restaurantId); return ok({ success: true }); });
  }
  if (m === 'POST' && (p = match('/api/floors/:restaurantId', path))) {
    return safe(() => ok({ floor: entityStore.createFloor(p.restaurantId, body), success: true }));
  }
  if (m === 'GET' && (p = match('/api/floors/:restaurantId', path))) {
    return safe(() => ok({ floors: entityStore.getFloors(p.restaurantId), success: true }));
  }

  // ── TAX ──
  if (m === 'PUT' && (p = match('/api/admin/tax/:restaurantId', path))) {
    return safe(() => ok({ tax: entityStore.updateTaxSettings(p.restaurantId, body), success: true }));
  }
  if (m === 'GET' && (p = match('/api/admin/tax/:restaurantId', path))) {
    return safe(() => ok({ tax: entityStore.getTaxSettings(p.restaurantId), success: true }));
  }

  // ── BUSINESS ──
  if (m === 'PUT' && (p = match('/api/admin/business/:restaurantId', path))) {
    return safe(() => ok({ business: entityStore.updateBusinessSettings(p.restaurantId, body), success: true }));
  }
  if (m === 'GET' && (p = match('/api/admin/business/:restaurantId', path))) {
    return safe(() => ok({ business: entityStore.getBusinessSettings(p.restaurantId), success: true }));
  }

  // ── PRINT SETTINGS ──
  if (m === 'PUT' && (p = match('/api/admin/print-settings/:restaurantId', path))) {
    return safe(() => ok({ settings: entityStore.updatePrintSettings(p.restaurantId, body), success: true }));
  }
  if (m === 'GET' && (p = match('/api/admin/print-settings/:restaurantId', path))) {
    return safe(() => ok({ settings: entityStore.getPrintSettings(p.restaurantId), success: true }));
  }
  if (m === 'PUT' && (p = match('/api/admin/print-stations/:restaurantId', path))) {
    return safe(() => ok({ stations: entityStore.updatePrintStations(p.restaurantId, body), success: true }));
  }
  if (m === 'GET' && (p = match('/api/admin/print-stations/:restaurantId', path))) {
    return safe(() => ok({ stations: entityStore.getPrintStations(p.restaurantId), success: true }));
  }

  // ── CUSTOMERS ──
  if (m === 'GET' && (p = match('/api/customers/:restaurantId', path))) {
    return safe(() => ok({ customers: entityStore.getCustomers(p.restaurantId, query.search), success: true }));
  }

  // ── STAFF ──
  if (m === 'GET' && (p = match('/api/waiters/:restaurantId', path))) {
    return safe(() => ok({ waiters: entityStore.getWaiters(p.restaurantId), success: true }));
  }
  if (m === 'PATCH' && (p = match('/api/staff/:staffId', path))) {
    return safe(() => ok({ staff: entityStore.updateStaff(p.staffId, body.restaurantId, body), success: true }));
  }
  if (m === 'DELETE' && (p = match('/api/staff/:staffId', path))) {
    return safe(() => { entityStore.deleteStaff(p.staffId, body?.restaurantId); return ok({ success: true }); });
  }
  if (m === 'POST' && (p = match('/api/staff/:restaurantId', path))) {
    return safe(() => {
      const result = entityStore.createStaff(p.restaurantId, body);
      return ok({
        staff: result.staff,
        credentials: result.credentials,
        success: true,
        message: 'Staff member added successfully. Login credentials generated.',
      });
    });
  }
  if (m === 'GET' && (p = match('/api/staff/:restaurantId', path))) {
    return safe(() => ok({ staff: entityStore.getStaff(p.restaurantId), success: true }));
  }

  // ── SAVED CARTS ──
  if (m === 'POST' && path === '/api/saved-carts') {
    return safe(() => ok({ cart: entityStore.upsertSavedCart(body), success: true }));
  }
  if (m === 'PATCH' && (p = match('/api/saved-carts/:id', path))) {
    return safe(() => ok({ cart: entityStore.upsertSavedCart({ id: p.id, ...body }), success: true }));
  }
  if (m === 'DELETE' && (p = match('/api/saved-carts/:id', path))) {
    return safe(() => { entityStore.deleteSavedCart(p.id, body?.restaurantId); return ok({ success: true }); });
  }
  if (m === 'GET' && (p = match('/api/saved-carts/:restaurantId', path))) {
    return safe(() => ok({ carts: entityStore.getSavedCarts(p.restaurantId, query.type), success: true }));
  }

  // ── KOT ──
  if (m === 'PATCH' && (p = match('/api/kot/:orderId/status', path))) {
    return safe(() => { entityStore.updateKotStatus(p.orderId, body.restaurantId, body.status); return ok({ success: true }); });
  }
  if (m === 'PATCH' && (p = match('/api/kot/:orderId/printed', path))) {
    return safe(() => { entityStore.updateKotStatus(p.orderId, body.restaurantId, 'printed'); return ok({ success: true }); });
  }
  if (m === 'GET' && (p = match('/api/kot/pending-print/:restaurantId', path))) {
    return safe(() => ok({ orders: entityStore.getKotItems(p.restaurantId, 'pending'), success: true }));
  }
  if (m === 'GET' && (p = match('/api/kot/:restaurantId/:orderId', path))) {
    return safe(() => ok({ order: entityStore.getOrder(p.orderId), success: true }));
  }
  if (m === 'GET' && (p = match('/api/kot/:restaurantId', path))) {
    return safe(() => ok({ orders: entityStore.getKotItems(p.restaurantId), success: true }));
  }

  // ── BILLING ──
  if (m === 'GET' && (p = match('/api/billing/pending-print/:restaurantId', path))) {
    return safe(() => ok({ orders: entityStore.getOrders(p.restaurantId, { status: 'completed' }), success: true }));
  }
  if (m === 'PATCH' && (p = match('/api/billing/:orderId/printed', path))) {
    return safe(() => ok({ success: true })); // just acknowledge
  }

  // ── INVENTORY ──
  if (m === 'PATCH' && (p = match('/api/inventory/:restaurantId/:itemId', path))) {
    return safe(() => ok({ item: entityStore.updateInventoryItem(p.restaurantId, p.itemId, body), success: true }));
  }
  if (m === 'DELETE' && (p = match('/api/inventory/:restaurantId/:itemId', path))) {
    return safe(() => { entityStore.deleteInventoryItem(p.restaurantId, p.itemId); return ok({ success: true }); });
  }
  if (m === 'POST' && (p = match('/api/inventory/:restaurantId', path))) {
    return safe(() => ok({ item: entityStore.createInventoryItem(p.restaurantId, body), success: true }));
  }
  if (m === 'GET' && (p = match('/api/inventory/:restaurantId', path))) {
    return safe(() => ok({ items: entityStore.getInventoryItems(p.restaurantId), success: true }));
  }

  // ── BOOKINGS ──
  if (m === 'PATCH' && (p = match('/api/bookings/:bookingId', path))) {
    return safe(() => ok({ booking: entityStore.updateBooking(p.bookingId, body.restaurantId, body), success: true }));
  }
  if (m === 'DELETE' && (p = match('/api/bookings/:bookingId', path))) {
    return safe(() => { entityStore.deleteBooking(p.bookingId, body?.restaurantId); return ok({ success: true }); });
  }
  if (m === 'POST' && (p = match('/api/bookings/:restaurantId', path))) {
    return safe(() => ok({ booking: entityStore.createBooking(p.restaurantId, body), success: true }));
  }
  if (m === 'GET' && (p = match('/api/bookings/:restaurantId', path))) {
    return safe(() => ok({ bookings: entityStore.getBookings(p.restaurantId), success: true }));
  }

  // ── REGISTER ──
  if (m === 'POST' && (p = match('/api/register/:restaurantId/open', path))) {
    return safe(() => ok({ register: entityStore.openRegister(p.restaurantId, body), success: true }));
  }
  if (m === 'GET' && (p = match('/api/register/:restaurantId/current', path))) {
    return safe(() => ok({ register: entityStore.getCurrentRegister(p.restaurantId), success: true }));
  }
  if (m === 'GET' && (p = match('/api/register/:restaurantId/history', path))) {
    return safe(() => ok({ history: entityStore.getEntities('register_history', p.restaurantId), success: true }));
  }
  if (m === 'POST' && (p = match('/api/register/:registerId/transaction', path))) {
    return safe(() => ok({ transaction: entityStore.addTransaction(p.registerId, body.restaurantId, body), success: true }));
  }
  if (m === 'POST' && (p = match('/api/register/:registerId/close', path))) {
    return safe(() => ok({ register: entityStore.closeRegister(p.registerId, body.restaurantId, body), success: true }));
  }
  if (m === 'GET' && (p = match('/api/register/:registerId/x-report', path))) {
    return safe(() => ok({ register: entityStore.getEntity('register', p.registerId), success: true }));
  }

  // ── INVOICES ──
  if (m === 'POST' && (p = match('/api/invoice/generate/:orderId', path))) {
    return safe(() => {
      const order = entityStore.getOrder(p.orderId);
      if (!order) return { handled: true, data: { error: 'Order not found', success: false }, statusCode: 404 };
      const invoice = {
        id: `inv_${p.orderId}_${Date.now()}`,
        orderId: p.orderId,
        restaurantId: order.restaurantId,
        items: order.items || [],
        subtotal: order.subtotal || 0,
        tax: order.tax || 0,
        total: order.finalAmount || order.totalAmount || 0,
        paymentMethod: order.paymentMethod || 'cash',
        createdAt: new Date().toISOString(),
        invoiceNumber: `INV-${Date.now()}`,
        ...body,
      };
      entityStore.logChange('invoice', invoice.id, order.restaurantId, 'CREATE', `/api/invoice/generate/${p.orderId}`, 'POST', invoice);
      return ok({ invoice, success: true });
    });
  }
  if (m === 'GET' && (p = match('/api/invoice/:invoiceId', path))) {
    return safe(() => ok({ invoice: entityStore.getInvoice(p.invoiceId), success: true }));
  }
  if (m === 'GET' && (p = match('/api/invoices/:restaurantId', path))) {
    return safe(() => ok({ invoices: entityStore.getInvoices(p.restaurantId), success: true }));
  }

  // ── MENU THEME ──
  if (m === 'POST' && (p = match('/api/menu-theme/:restaurantId', path))) {
    return safe(() => ok({ theme: entityStore.updateMenuTheme(p.restaurantId, body), success: true }));
  }
  if (m === 'GET' && (p = match('/api/menu-theme/:restaurantId', path))) {
    return safe(() => ok({ theme: entityStore.getMenuTheme(p.restaurantId), success: true }));
  }

  // ── RESTAURANT ──
  if (m === 'GET' && (p = match('/api/restaurant/info/:restaurantId', path))) {
    return safe(() => ok({ restaurant: entityStore.getRestaurant(p.restaurantId), success: true }));
  }
  if (m === 'PATCH' && (p = match('/api/restaurants/:restaurantId', path))) {
    return safe(() => {
      entityStore.saveRestaurant(p.restaurantId, body);
      entityStore.logChange('restaurant', p.restaurantId, p.restaurantId, 'UPDATE', `/api/restaurants/${p.restaurantId}`, 'PATCH', body);
      return ok({ restaurant: body, success: true });
    });
  }
  if (m === 'GET' && path === '/api/restaurants') {
    return safe(() => ok({ restaurant: entityStore.getRestaurant(query.id), success: true }));
  }

  // ── ANALYTICS ──
  if (m === 'GET' && (p = match('/api/analytics/:restaurantId/daily-summary', path))) {
    return safe(() => ok({ analytics: entityStore.getAnalytics(p.restaurantId, { daily: true, ...query }), success: true }));
  }
  if (m === 'GET' && (p = match('/api/analytics/:restaurantId', path))) {
    return safe(() => ok({ analytics: entityStore.getAnalytics(p.restaurantId, query), success: true }));
  }

  // ── USER (read-only, pass-through for writes) ──
  if (m === 'GET' && path === '/api/user/page-access') return NOT_HANDLED;
  if (m === 'GET' && path === '/api/auth/me') return NOT_HANDLED;
  if (m === 'GET' && path === '/api/user/profile') return NOT_HANDLED;

  // ── KOT RENDER (local fallback when offline) ──
  if (m === 'GET' && (p = match('/api/kot/render/:restaurantId/:orderId', path))) {
    return safe(() => {
      const order = entityStore.getOrder(p.orderId);
      const restaurant = entityStore.getRestaurant(p.restaurantId);
      if (!order) return NOT_HANDLED; // fall through to cloud
      if (!restaurant) return NOT_HANDLED;

      const query = parseQuery(endpoint);
      const ps = { ...(restaurant.printSettings || {}) };
      const businessType = restaurant.businessType || 'restaurant';
      const KOT_LABELS = {
        restaurant: { kitchenOrder: 'KITCHEN ORDER' },
        hotel: { kitchenOrder: 'KITCHEN ORDER' },
        foodcourt: { kitchenOrder: 'COUNTER ORDER' },
      };
      const labels = KOT_LABELS[businessType] || KOT_LABELS.restaurant;
      const kotId = `KOT-${p.orderId.slice(-6).toUpperCase()}`;

      let items = order.items || [];
      if (query.newOnly === 'true') {
        items = items.filter(i => i.isNew === true || i.isUpdated === true);
      }
      let printStationName = null;
      if (query.stationId && restaurant.printStations?.length) {
        const station = restaurant.printStations.find(s => s.id === query.stationId);
        if (station) {
          printStationName = station.name;
          const stationCatIds = new Set(station.categoryIds || []);
          const nameToId = {};
          for (const cat of (restaurant.categories || [])) {
            if (cat.name) nameToId[cat.name.toLowerCase().trim()] = cat.id;
          }
          const allAssignedCatIds = new Set();
          for (const s of restaurant.printStations) {
            for (const cId of (s.categoryIds || [])) allAssignedCatIds.add(cId);
          }
          items = items.filter(item => {
            const catId = item.categoryId || nameToId[item.category?.toLowerCase()?.trim()] || item.category;
            if (stationCatIds.has(catId)) return true;
            if (station.isDefault && !allAssignedCatIds.has(catId)) return true;
            return false;
          });
        }
      }

      const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
      return {
        handled: true,
        data: {
          success: true,
          restaurant: {
            id: p.restaurantId,
            name: restaurant.name || 'Restaurant',
            phone: restaurant.phone || '',
            address: restaurant.address || '',
          },
          printSettings: ps,
          labels,
          kot: {
            id: p.orderId,
            orderId: p.orderId,
            kotId,
            dailyOrderId: order.dailyOrderId || null,
            orderNumber: order.orderNumber || null,
            tableNumber: order.tableNumber || '',
            roomNumber: order.roomNumber || '',
            orderType: order.orderType || 'dine-in',
            items,
            notes: order.notes || '',
            specialInstructions: order.specialInstructions || '',
            staffInfo: order.staffInfo || null,
            createdAt: createdAt.toISOString(),
            formattedDate: createdAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            formattedTime: createdAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
            isReprint: order.kotPrinted === true,
            isIncremental: query.newOnly === 'true',
            printStationId: query.stationId || null,
            printStationName,
          },
        },
      };
    });
  }

  // ── BILL RENDER (local fallback when offline) ──
  if (m === 'GET' && (p = match('/api/bill/render/:restaurantId/:orderId', path))) {
    return safe(() => {
      const order = entityStore.getOrder(p.orderId);
      const restaurant = entityStore.getRestaurant(p.restaurantId);
      if (!order) return NOT_HANDLED;
      if (!restaurant) return NOT_HANDLED;

      const ps = { ...(restaurant.printSettings || {}) };
      const businessType = restaurant.businessType || 'restaurant';
      const LABELS = {
        restaurant: { bill: 'BILL', invoice: 'Invoice' },
        hotel: { bill: 'BILL', invoice: 'Invoice' },
        foodcourt: { bill: 'BILL', invoice: 'Invoice' },
      };
      const labels = LABELS[businessType] || LABELS.restaurant;

      // Build tax breakdown
      const taxSettings = restaurant.taxSettings || {};
      const items = order.items || [];
      const itemsSubtotal = items.reduce((sum, i) => sum + ((i.price || 0) * (i.quantity || 1)), 0);
      const subtotal = order.subtotal || itemsSubtotal;
      const discountAmount = order.discountAmount || 0;
      const manualDiscount = order.manualDiscount || 0;
      const loyaltyDiscount = order.loyaltyDiscount || 0;
      const totalDiscount = discountAmount + manualDiscount + loyaltyDiscount;

      let totalTax = 0;
      let taxBreakdown = [];
      if (Array.isArray(order.taxBreakdown) && order.taxBreakdown.length > 0) {
        taxBreakdown = order.taxBreakdown;
        totalTax = order.taxAmount || taxBreakdown.reduce((s, t) => s + (t.amount || 0), 0);
      } else if (taxSettings.enabled) {
        const taxable = Math.max(0, subtotal - totalDiscount);
        for (const tax of (taxSettings.taxes || [])) {
          if (tax.enabled) {
            const amt = (taxable * (tax.rate || 0)) / 100;
            taxBreakdown.push({ id: tax.id, name: tax.name, rate: tax.rate, amount: Math.round(amt * 100) / 100 });
            totalTax += amt;
          }
        }
        totalTax = Math.round(totalTax * 100) / 100;
      }

      const serviceChargeAmount = order.serviceChargeAmount || null;
      const tipAmount = order.tipAmount || null;
      const roundOffAmount = order.roundOffAmount != null ? order.roundOffAmount : null;
      const grandTotal = order.finalAmount ||
        (subtotal - totalDiscount + totalTax + (serviceChargeAmount || 0) + (tipAmount || 0) + (roundOffAmount || 0));

      const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
      const completedAt = order.completedAt ? new Date(order.completedAt) : null;
      const displayDate = completedAt || createdAt;

      const flat = {
        id: order.invoiceId || null,
        orderId: p.orderId,
        dailyOrderId: order.dailyOrderId || null,
        orderNumber: order.orderNumber || null,
        restaurantId: p.restaurantId,
        restaurantName: restaurant.name || 'Restaurant',
        restaurantLegalName: restaurant.legalBusinessName || '',
        restaurantAddress: restaurant.address || '',
        restaurantPhone: restaurant.phone || '',
        restaurantEmail: restaurant.email || '',
        gstin: restaurant.gstin || '',
        fssai: restaurant.fssai || '',
        showGstOnInvoice: restaurant.showGstOnInvoice === true,
        showFssaiOnInvoice: restaurant.showFssaiOnInvoice === true,
        vatNumber: restaurant.vatNumber || '',
        taxId: restaurant.taxId || '',
        businessRegistrationNumber: restaurant.businessRegistrationNumber || '',
        showTaxIdOnInvoice: restaurant.showTaxIdOnInvoice === true,
        countryCode: restaurant.countryCode || 'IN',
        customerName: order.customerInfo?.name || order.customerName || 'Walk-in Customer',
        customerPhone: order.customerInfo?.phone || order.customerMobile || '',
        customerEmail: order.customerInfo?.email || '',
        tableNumber: order.tableNumber || '',
        roomNumber: order.roomNumber || '',
        orderType: order.orderType || 'dine-in',
        items,
        subtotal,
        discountAmount,
        manualDiscount,
        loyaltyDiscount,
        totalDiscount,
        appliedOffer: order.appliedOffer || null,
        appliedOffers: order.appliedOffers || null,
        selectedOfferName: order.selectedOfferName || null,
        taxBreakdown,
        totalTax,
        taxAmount: totalTax,
        grandTotal: Math.round(grandTotal * 100) / 100,
        finalAmount: Math.round(grandTotal * 100) / 100,
        totalAmount: Math.round((order.totalAmount || (subtotal - totalDiscount)) * 100) / 100,
        paymentMethod: order.paymentMethod || 'cash',
        serviceChargeRate: order.serviceChargeRate || null,
        serviceChargeAmount,
        tipAmount,
        tipPercentage: order.tipPercentage || null,
        roundOffAmount,
        splitPayments: order.splitPayments || null,
        cashReceived: order.cashReceived || null,
        changeReturned: order.changeReturned || null,
        paidAmount: order.paidAmount || null,
        outstandingAmount: order.outstandingAmount || null,
        walletRedeemAmount: order.walletRedeemAmount || null,
        notes: order.notes || '',
        specialInstructions: order.specialInstructions || '',
        staffInfo: order.staffInfo || null,
        status: order.status || null,
        createdAt: createdAt.toISOString(),
        completedAt: completedAt ? completedAt.toISOString() : null,
        invoiceDate: displayDate.toISOString(),
        generatedAt: new Date().toISOString(),
        formattedDate: displayDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        formattedTime: displayDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      };

      return {
        handled: true,
        data: {
          success: true,
          restaurant: {
            id: p.restaurantId,
            name: restaurant.name || 'Restaurant',
            phone: restaurant.phone || '',
            address: restaurant.address || '',
            gstin: restaurant.gstin || '',
            fssai: restaurant.fssai || '',
          },
          printSettings: ps,
          labels,
          bill: flat,
          invoice: flat,
        },
      };
    });
  }

  // ── TOKEN RENDER (pass to cloud — not critical for offline) ──
  if (path.includes('/api/token/render/')) {
    return NOT_HANDLED;
  }

  // ── ORDERS MANUAL PRINT ──
  if (m === 'POST' && (p = match('/api/orders/:orderId/manual-print', path))) {
    return NOT_HANDLED; // needs cloud for print rendering
  }

  // ── TAX CALCULATE ──
  if (m === 'POST' && (p = match('/api/tax/calculate/:restaurantId', path))) {
    return NOT_HANDLED; // complex calculation, pass to cloud
  }

  // No match
  return NOT_HANDLED;
}

module.exports = { routeLocally };
