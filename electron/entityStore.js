const crypto = require('crypto');
const fs = require('fs');
const pathMod = require('path');
const { getLocalDb } = require('./localDb');

const now = () => Date.now();

// Diagnostic file logger — shared log path with offline.js
const _debugLogPath = pathMod.join(require('os').homedir(), 'dine-offline-debug.log');
function debugLog(...args) {
  try {
    const line = `[${new Date().toISOString()}] [entityStore] ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')}\n`;
    fs.appendFileSync(_debugLogPath, line);
  } catch { /* ignore */ }
}

// ============================================
// Helpers
// ============================================
function parseData(row) {
  if (!row) return null;
  try {
    return typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
  } catch {
    return null;
  }
}

function parseRows(rows) {
  return rows.map(r => parseData(r)).filter(Boolean);
}

function logChange(entityType, entityId, restaurantId, operation, endpoint, method, payload) {
  const db = getLocalDb();
  db.prepare(
    `INSERT INTO change_log (entity_type, entity_id, restaurant_id, operation, endpoint, method, payload, timestamp, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`
  ).run(entityType, entityId, restaurantId || '', operation, endpoint, method, JSON.stringify(payload), now());
}

// ============================================
// Restaurant
// ============================================
function saveRestaurant(id, data) {
  const db = getLocalDb();
  db.prepare(
    'INSERT OR REPLACE INTO restaurant (id, data, synced_at) VALUES (?, ?, ?)'
  ).run(id, JSON.stringify(data), now());
}

function getRestaurant(id) {
  const db = getLocalDb();
  const row = db.prepare('SELECT data FROM restaurant WHERE id = ?').get(id);
  return parseData(row);
}

// ============================================
// Menu Items
// ============================================
function saveMenuItems(restaurantId, items) {
  const db = getLocalDb();
  const ts = now();
  const insertMany = db.transaction((items) => {
    db.prepare('DELETE FROM menu_items WHERE restaurant_id = ?').run(restaurantId);
    const stmt = db.prepare(
      'INSERT INTO menu_items (id, restaurant_id, name, category, price, data, synced_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    for (const item of items) {
      stmt.run(item.id || item._id, restaurantId, item.name || '', item.category || '', item.price || 0, JSON.stringify(item), ts);
    }
  });
  insertMany(items);
}

function getMenuItems(restaurantId, category) {
  const db = getLocalDb();
  if (category) {
    return parseRows(
      db.prepare('SELECT data FROM menu_items WHERE restaurant_id = ? AND category = ?').all(restaurantId, category)
    );
  }
  return parseRows(
    db.prepare('SELECT data FROM menu_items WHERE restaurant_id = ?').all(restaurantId)
  );
}

function upsertMenuItem(restaurantId, item) {
  const db = getLocalDb();
  const id = item.id || item._id || crypto.randomUUID();
  const updated = { ...item, id };
  db.prepare(
    'INSERT OR REPLACE INTO menu_items (id, restaurant_id, name, category, price, data, synced_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, restaurantId, updated.name || '', updated.category || '', updated.price || 0, JSON.stringify(updated), now());
  logChange('menu_item', id, restaurantId, 'UPDATE', `/api/menus/item/${id}`, 'PATCH', updated);
  return updated;
}

function createMenuItem(restaurantId, item) {
  const db = getLocalDb();
  const id = item.id || crypto.randomUUID();
  const newItem = { ...item, id };
  db.prepare(
    'INSERT INTO menu_items (id, restaurant_id, name, category, price, data, synced_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, restaurantId, newItem.name || '', newItem.category || '', newItem.price || 0, JSON.stringify(newItem), now());
  logChange('menu_item', id, restaurantId, 'CREATE', `/api/menus/${restaurantId}`, 'POST', newItem);
  return newItem;
}

function deleteMenuItem(itemId, restaurantId) {
  const db = getLocalDb();
  db.prepare('DELETE FROM menu_items WHERE id = ?').run(itemId);
  logChange('menu_item', itemId, restaurantId, 'DELETE', `/api/menus/item/${itemId}`, 'DELETE', {});
}

// ============================================
// Floors
// ============================================
function saveFloors(restaurantId, floors) {
  const db = getLocalDb();
  const ts = now();
  const insertMany = db.transaction((floors) => {
    db.prepare('DELETE FROM floors WHERE restaurant_id = ?').run(restaurantId);
    const stmt = db.prepare(
      'INSERT INTO floors (id, restaurant_id, name, data, synced_at) VALUES (?, ?, ?, ?, ?)'
    );
    for (const floor of floors) {
      stmt.run(floor.id || floor._id, restaurantId, floor.name || '', JSON.stringify(floor), ts);
    }
  });
  insertMany(floors);
}

function getFloors(restaurantId) {
  const db = getLocalDb();
  const floors = parseRows(
    db.prepare('SELECT data FROM floors WHERE restaurant_id = ?').all(restaurantId)
  );
  // Overlay live table data from tables_local so status changes are instant.
  // Floor objects embed tables at sync time, but table status/order updates
  // go into tables_local — merge them so getFloors always reflects the latest state.
  const liveTables = db.prepare(
    'SELECT id, status, current_order_id, data FROM tables_local WHERE restaurant_id = ?'
  ).all(restaurantId);
  if (liveTables.length > 0) {
    const tableMap = {};
    for (const row of liveTables) {
      const parsed = parseData(row);
      if (parsed) tableMap[row.id] = parsed;
    }
    for (const floor of floors) {
      if (Array.isArray(floor.tables)) {
        floor.tables = floor.tables.map(t => {
          const live = tableMap[t.id || t._id];
          return live || t;
        });
      }
    }
  }
  return floors;
}

function createFloor(restaurantId, floor) {
  const db = getLocalDb();
  const id = floor.id || crypto.randomUUID();
  const newFloor = { ...floor, id };
  db.prepare(
    'INSERT INTO floors (id, restaurant_id, name, data, synced_at) VALUES (?, ?, ?, ?, ?)'
  ).run(id, restaurantId, newFloor.name || '', JSON.stringify(newFloor), now());
  logChange('floor', id, restaurantId, 'CREATE', `/api/floors/${restaurantId}`, 'POST', newFloor);
  return newFloor;
}

function updateFloor(floorId, restaurantId, data) {
  const db = getLocalDb();
  const row = db.prepare('SELECT data FROM floors WHERE id = ?').get(floorId);
  const existing = parseData(row) || {};
  const updated = { ...existing, ...data, id: floorId };
  db.prepare(
    'UPDATE floors SET name = ?, data = ?, synced_at = ? WHERE id = ?'
  ).run(updated.name || '', JSON.stringify(updated), now(), floorId);
  logChange('floor', floorId, restaurantId, 'UPDATE', `/api/floors/${floorId}`, 'PATCH', data);
  return updated;
}

function deleteFloor(floorId, restaurantId) {
  const db = getLocalDb();
  db.prepare('DELETE FROM floors WHERE id = ?').run(floorId);
  logChange('floor', floorId, restaurantId, 'DELETE', `/api/floors/${floorId}`, 'DELETE', {});
}

// ============================================
// Tables
// ============================================
function saveTables(restaurantId, tables) {
  const db = getLocalDb();
  const ts = now();
  const insertMany = db.transaction((tables) => {
    db.prepare('DELETE FROM tables_local WHERE restaurant_id = ?').run(restaurantId);
    const stmt = db.prepare(
      'INSERT INTO tables_local (id, restaurant_id, floor_id, name, status, current_order_id, data, synced_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const table of tables) {
      stmt.run(
        table.id || table._id, restaurantId,
        table.floor || table.floorId || '',
        table.name || '', table.status || 'available',
        table.currentOrderId || null, JSON.stringify(table), ts
      );
    }
  });
  insertMany(tables);
}

function getTables(restaurantId) {
  const db = getLocalDb();
  return parseRows(
    db.prepare('SELECT data FROM tables_local WHERE restaurant_id = ?').all(restaurantId)
  );
}

function createTable(restaurantId, table) {
  const db = getLocalDb();
  const id = table.id || crypto.randomUUID();
  const newTable = { ...table, id };
  db.prepare(
    'INSERT INTO tables_local (id, restaurant_id, floor_id, name, status, current_order_id, data, synced_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(id, restaurantId, newTable.floor || newTable.floorId || '', newTable.name || '', 'available', null, JSON.stringify(newTable), now());
  logChange('table', id, restaurantId, 'CREATE', `/api/tables/${restaurantId}`, 'POST', newTable);
  return newTable;
}

function createTablesBulk(restaurantId, tables) {
  const db = getLocalDb();
  const ts = now();
  const results = [];
  const insertMany = db.transaction((tables) => {
    const stmt = db.prepare(
      'INSERT INTO tables_local (id, restaurant_id, floor_id, name, status, current_order_id, data, synced_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const table of tables) {
      const id = table.id || crypto.randomUUID();
      const newTable = { ...table, id };
      stmt.run(id, restaurantId, newTable.floor || newTable.floorId || '', newTable.name || '', 'available', null, JSON.stringify(newTable), ts);
      results.push(newTable);
    }
  });
  insertMany(tables);
  logChange('table', 'bulk', restaurantId, 'CREATE', `/api/tables/${restaurantId}/bulk`, 'POST', { tables: results });
  return results;
}

function updateTable(tableId, restaurantId, data) {
  const db = getLocalDb();
  const row = db.prepare('SELECT data FROM tables_local WHERE id = ?').get(tableId);
  const existing = parseData(row) || {};
  const updated = { ...existing, ...data, id: tableId };
  db.prepare(
    'UPDATE tables_local SET name = ?, floor_id = ?, data = ?, synced_at = ? WHERE id = ?'
  ).run(updated.name || '', updated.floor || updated.floorId || '', JSON.stringify(updated), now(), tableId);
  logChange('table', tableId, restaurantId, 'UPDATE', `/api/tables/${tableId}`, 'PATCH', data);
  return updated;
}

function updateTableStatus(tableId, restaurantId, status, orderId) {
  const db = getLocalDb();
  const row = db.prepare('SELECT data FROM tables_local WHERE id = ?').get(tableId);
  if (!row) return null;
  const data = parseData(row);
  if (data) {
    data.status = status;
    data.currentOrderId = orderId || null;
    data.updatedAt = new Date().toISOString();
    if (status === 'occupied' && orderId) {
      data.lastOrderTime = new Date().toISOString();
    }
    db.prepare(
      'UPDATE tables_local SET status = ?, current_order_id = ?, data = ?, synced_at = ? WHERE id = ?'
    ).run(status, orderId || null, JSON.stringify(data), now(), tableId);
    logChange('table', tableId, restaurantId, 'UPDATE', `/api/tables/${tableId}/status`, 'PATCH', { status, orderId });
  }
  return data;
}

function deleteTable(tableId, restaurantId) {
  const db = getLocalDb();
  db.prepare('DELETE FROM tables_local WHERE id = ?').run(tableId);
  logChange('table', tableId, restaurantId, 'DELETE', `/api/tables/${tableId}`, 'DELETE', {});
}

function resetAllTables(restaurantId) {
  const db = getLocalDb();
  const rows = db.prepare('SELECT data FROM tables_local WHERE restaurant_id = ?').all(restaurantId);
  const ts = now();
  const updateStmt = db.prepare(
    'UPDATE tables_local SET status = ?, current_order_id = NULL, data = ?, synced_at = ? WHERE id = ?'
  );
  db.transaction(() => {
    for (const row of rows) {
      const data = parseData(row);
      if (data) {
        data.status = 'available';
        data.currentOrderId = null;
        data.currentOrderTotal = null;
        data.updatedAt = new Date().toISOString();
        updateStmt.run('available', JSON.stringify(data), ts, data.id || data._id);
      }
    }
  })();
  logChange('table', 'all', restaurantId, 'UPDATE', `/api/tables/${restaurantId}/reset-all`, 'POST', {});
}

// ============================================
// Settings (Tax, Billing, Pricing, Business, Print)
// ============================================
function _saveSettings(table, restaurantId, data) {
  const db = getLocalDb();
  db.prepare(
    `INSERT OR REPLACE INTO ${table} (restaurant_id, data, synced_at) VALUES (?, ?, ?)`
  ).run(restaurantId, JSON.stringify(data), now());
}

function _getSettings(table, restaurantId) {
  const db = getLocalDb();
  const row = db.prepare(`SELECT data FROM ${table} WHERE restaurant_id = ?`).get(restaurantId);
  return parseData(row);
}

function saveTaxSettings(restaurantId, data) { _saveSettings('tax_settings', restaurantId, data); }
function getTaxSettings(restaurantId) { return _getSettings('tax_settings', restaurantId); }
function updateTaxSettings(restaurantId, data) {
  _saveSettings('tax_settings', restaurantId, data);
  logChange('tax_settings', restaurantId, restaurantId, 'UPDATE', `/api/admin/tax/${restaurantId}`, 'PUT', data);
  return data;
}

function saveBillingSettings(restaurantId, data) { _saveSettings('billing_settings', restaurantId, data); }
function getBillingSettings(restaurantId) { return _getSettings('billing_settings', restaurantId); }
function updateBillingSettings(restaurantId, data) {
  _saveSettings('billing_settings', restaurantId, data);
  logChange('billing_settings', restaurantId, restaurantId, 'UPDATE', `/api/admin/business/${restaurantId}`, 'PUT', data);
  return data;
}

function savePricingSettings(restaurantId, data) { _saveSettings('pricing_settings', restaurantId, data); }
function getPricingSettings(restaurantId) { return _getSettings('pricing_settings', restaurantId); }
function updatePricingSettings(restaurantId, data) {
  _saveSettings('pricing_settings', restaurantId, data);
  logChange('pricing_settings', restaurantId, restaurantId, 'UPDATE', `/api/admin/business/${restaurantId}`, 'PUT', data);
  return data;
}

function saveBusinessSettings(restaurantId, data) { _saveSettings('business_settings', restaurantId, data); }
function getBusinessSettings(restaurantId) { return _getSettings('business_settings', restaurantId); }
function updateBusinessSettings(restaurantId, data) {
  _saveSettings('business_settings', restaurantId, data);
  logChange('business_settings', restaurantId, restaurantId, 'UPDATE', `/api/admin/business/${restaurantId}`, 'PUT', data);
  return data;
}

function savePrintSettings(restaurantId, data) { _saveSettings('print_settings', restaurantId, data); }
function getPrintSettings(restaurantId) { return _getSettings('print_settings', restaurantId); }
function updatePrintSettings(restaurantId, data) {
  _saveSettings('print_settings', restaurantId, data);
  logChange('print_settings', restaurantId, restaurantId, 'UPDATE', `/api/admin/print-settings/${restaurantId}`, 'PUT', data);
  return data;
}

function savePrintStations(restaurantId, data) { _saveSettings('print_stations', restaurantId, data); }
function getPrintStations(restaurantId) { return _getSettings('print_stations', restaurantId); }
function updatePrintStations(restaurantId, data) {
  _saveSettings('print_stations', restaurantId, data);
  logChange('print_stations', restaurantId, restaurantId, 'UPDATE', `/api/admin/print-stations/${restaurantId}`, 'PUT', data);
  return data;
}

// ============================================
// Customers
// ============================================
function saveCustomers(restaurantId, customers) {
  const db = getLocalDb();
  const ts = now();
  const insertMany = db.transaction((customers) => {
    db.prepare('DELETE FROM customers WHERE restaurant_id = ?').run(restaurantId);
    const stmt = db.prepare(
      'INSERT INTO customers (id, restaurant_id, name, phone, data, synced_at) VALUES (?, ?, ?, ?, ?, ?)'
    );
    for (const c of customers) {
      stmt.run(c.id || c._id, restaurantId, c.name || '', c.phone || '', JSON.stringify(c), ts);
    }
  });
  insertMany(customers);
}

function getCustomers(restaurantId, search) {
  const db = getLocalDb();
  if (search) {
    const pattern = `%${search}%`;
    return parseRows(
      db.prepare(
        'SELECT data FROM customers WHERE restaurant_id = ? AND (name LIKE ? OR phone LIKE ?)'
      ).all(restaurantId, pattern, pattern)
    );
  }
  return parseRows(
    db.prepare('SELECT data FROM customers WHERE restaurant_id = ?').all(restaurantId)
  );
}

function upsertCustomer(customer) {
  const db = getLocalDb();
  const id = customer.id || customer._id || crypto.randomUUID();
  const updated = { ...customer, id };
  db.prepare(
    'INSERT OR REPLACE INTO customers (id, restaurant_id, name, phone, data, synced_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, updated.restaurantId, updated.name || '', updated.phone || '', JSON.stringify(updated), now());
  logChange('customer', id, updated.restaurantId, 'UPSERT', `/api/customers/${id}`, 'PUT', updated);
  return updated;
}

// ============================================
// Offers
// ============================================
function saveOffers(restaurantId, offers) {
  const db = getLocalDb();
  const ts = now();
  const insertMany = db.transaction((offers) => {
    db.prepare('DELETE FROM offers WHERE restaurant_id = ?').run(restaurantId);
    const stmt = db.prepare(
      'INSERT INTO offers (id, restaurant_id, data, synced_at) VALUES (?, ?, ?, ?)'
    );
    for (const offer of offers) {
      stmt.run(offer.id || offer._id, restaurantId, JSON.stringify(offer), ts);
    }
  });
  insertMany(offers);
}

function getOffers(restaurantId) {
  const db = getLocalDb();
  return parseRows(
    db.prepare('SELECT data FROM offers WHERE restaurant_id = ?').all(restaurantId)
  );
}

function saveOfferSettings(restaurantId, data) { _saveSettings('offer_settings', restaurantId, data); }
function getOfferSettings(restaurantId) { return _getSettings('offer_settings', restaurantId); }

// ============================================
// Inventory Items
// ============================================
function saveInventoryItems(restaurantId, items) {
  const db = getLocalDb();
  const ts = now();
  const insertMany = db.transaction((items) => {
    db.prepare('DELETE FROM inventory_items WHERE restaurant_id = ?').run(restaurantId);
    const stmt = db.prepare(
      'INSERT INTO inventory_items (id, restaurant_id, name, current_stock, data, synced_at) VALUES (?, ?, ?, ?, ?, ?)'
    );
    for (const item of items) {
      stmt.run(item.id || item._id, restaurantId, item.name || '', item.currentStock || 0, JSON.stringify(item), ts);
    }
  });
  insertMany(items);
}

function getInventoryItems(restaurantId) {
  const db = getLocalDb();
  return parseRows(
    db.prepare('SELECT data FROM inventory_items WHERE restaurant_id = ?').all(restaurantId)
  );
}

function createInventoryItem(restaurantId, item) {
  const db = getLocalDb();
  const id = item.id || crypto.randomUUID();
  const newItem = { ...item, id };
  db.prepare(
    'INSERT INTO inventory_items (id, restaurant_id, name, current_stock, data, synced_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, restaurantId, newItem.name || '', newItem.currentStock || 0, JSON.stringify(newItem), now());
  logChange('inventory_item', id, restaurantId, 'CREATE', `/api/inventory/${restaurantId}`, 'POST', newItem);
  return newItem;
}

function updateInventoryItem(restaurantId, itemId, data) {
  const db = getLocalDb();
  const row = db.prepare('SELECT data FROM inventory_items WHERE id = ?').get(itemId);
  const existing = parseData(row) || {};
  const updated = { ...existing, ...data, id: itemId };
  db.prepare(
    'UPDATE inventory_items SET name = ?, current_stock = ?, data = ?, synced_at = ? WHERE id = ?'
  ).run(updated.name || '', updated.currentStock || 0, JSON.stringify(updated), now(), itemId);
  logChange('inventory_item', itemId, restaurantId, 'UPDATE', `/api/inventory/${restaurantId}/${itemId}`, 'PATCH', data);
  return updated;
}

function deleteInventoryItem(restaurantId, itemId) {
  const db = getLocalDb();
  db.prepare('DELETE FROM inventory_items WHERE id = ?').run(itemId);
  logChange('inventory_item', itemId, restaurantId, 'DELETE', `/api/inventory/${restaurantId}/${itemId}`, 'DELETE', {});
}

// ============================================
// Recipes
// ============================================
function saveRecipes(restaurantId, recipes) {
  const db = getLocalDb();
  const ts = now();
  const insertMany = db.transaction((recipes) => {
    db.prepare('DELETE FROM recipes WHERE restaurant_id = ?').run(restaurantId);
    const stmt = db.prepare(
      'INSERT INTO recipes (id, restaurant_id, menu_item_id, data, synced_at) VALUES (?, ?, ?, ?, ?)'
    );
    for (const recipe of recipes) {
      stmt.run(recipe.id || recipe._id, restaurantId, recipe.menuItemId || '', JSON.stringify(recipe), ts);
    }
  });
  insertMany(recipes);
}

function getRecipes(restaurantId) {
  const db = getLocalDb();
  return parseRows(
    db.prepare('SELECT data FROM recipes WHERE restaurant_id = ?').all(restaurantId)
  );
}

// ============================================
// Rooms
// ============================================
function saveRooms(restaurantId, rooms) {
  const db = getLocalDb();
  const ts = now();
  const insertMany = db.transaction((rooms) => {
    db.prepare('DELETE FROM rooms WHERE restaurant_id = ?').run(restaurantId);
    const stmt = db.prepare(
      'INSERT INTO rooms (id, restaurant_id, data, synced_at) VALUES (?, ?, ?, ?)'
    );
    for (const room of rooms) {
      stmt.run(room.id || room._id, restaurantId, JSON.stringify(room), ts);
    }
  });
  insertMany(rooms);
}

function getRooms(restaurantId) {
  const db = getLocalDb();
  return parseRows(
    db.prepare('SELECT data FROM rooms WHERE restaurant_id = ?').all(restaurantId)
  );
}

// ============================================
// Saved Carts
// ============================================
function saveSavedCarts(restaurantId, carts) {
  const db = getLocalDb();
  const ts = now();
  const insertMany = db.transaction((carts) => {
    db.prepare('DELETE FROM saved_carts WHERE restaurant_id = ?').run(restaurantId);
    const stmt = db.prepare(
      'INSERT INTO saved_carts (id, restaurant_id, type, name, data, synced_at) VALUES (?, ?, ?, ?, ?, ?)'
    );
    for (const cart of carts) {
      stmt.run(cart.id || cart._id, restaurantId, cart.type || 'parked', cart.name || '', JSON.stringify(cart), ts);
    }
  });
  insertMany(carts);
}

function getSavedCarts(restaurantId, type) {
  const db = getLocalDb();
  if (type) {
    return parseRows(
      db.prepare('SELECT data FROM saved_carts WHERE restaurant_id = ? AND type = ?').all(restaurantId, type)
    );
  }
  return parseRows(
    db.prepare('SELECT data FROM saved_carts WHERE restaurant_id = ?').all(restaurantId)
  );
}

function upsertSavedCart(cart) {
  const db = getLocalDb();
  const id = cart.id || crypto.randomUUID();
  const updated = { ...cart, id };
  db.prepare(
    'INSERT OR REPLACE INTO saved_carts (id, restaurant_id, type, name, data, synced_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, updated.restaurantId, updated.type || 'parked', updated.name || '', JSON.stringify(updated), now());
  logChange('saved_cart', id, updated.restaurantId, cart.id ? 'UPDATE' : 'CREATE', cart.id ? `/api/saved-carts/${id}` : '/api/saved-carts', cart.id ? 'PATCH' : 'POST', updated);
  return updated;
}

function deleteSavedCart(cartId, restaurantId) {
  const db = getLocalDb();
  db.prepare('DELETE FROM saved_carts WHERE id = ?').run(cartId);
  logChange('saved_cart', cartId, restaurantId, 'DELETE', `/api/saved-carts/${cartId}`, 'DELETE', {});
}

// ============================================
// Orders
// ============================================
function saveOrders(restaurantId, orders) {
  const db = getLocalDb();
  const ts = now();
  const insertMany = db.transaction((orders) => {
    const stmt = db.prepare(
      `INSERT OR REPLACE INTO orders
       (id, restaurant_id, daily_order_id, status, table_id, total, data, idempotency_key, is_local, synced_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const order of orders) {
      stmt.run(
        order.id || order._id,
        restaurantId,
        order.dailyOrderId || null,
        order.status || 'confirmed',
        order.tableNumber || order.tableId || null,
        order.finalAmount || order.totalAmount || 0,
        JSON.stringify(order),
        order.idempotencyKey || null,
        0,
        ts,
        order.createdAt ? new Date(order.createdAt).getTime() : ts,
        order.updatedAt ? new Date(order.updatedAt).getTime() : ts
      );
    }
  });
  insertMany(orders);
}

// Enrich order items that are missing names by looking up the local menu cache.
// This handles orders created before the write-time enrichment was added,
// and also serves as a safety net if write-time enrichment fails.
function enrichOrderItems(db, order) {
  if (!order || !Array.isArray(order.items) || order.items.length === 0) return order;
  // Check if any item is missing a name
  const needsEnrichment = order.items.some(i => !i.name && i.menuItemId);
  if (!needsEnrichment) return order;
  try {
    const rid = order.restaurantId;
    if (!rid) return order;
    const menuRows = db.prepare('SELECT id, data FROM menu_items WHERE restaurant_id = ?').all(rid);
    if (menuRows.length === 0) return order;
    const menuMap = {};
    for (const row of menuRows) {
      const parsed = parseData(row);
      if (parsed) {
        menuMap[row.id] = parsed;
        if (parsed.id) menuMap[parsed.id] = parsed;
        if (parsed._id) menuMap[parsed._id] = parsed;
      }
    }
    order.items = order.items.map(item => {
      if (item.name) return item; // already has name
      const menuItem = menuMap[item.menuItemId];
      if (!menuItem) return item;
      const selectedVariant = item.selectedVariant || null;
      const customizations = Array.isArray(item.selectedCustomizations) ? item.selectedCustomizations : [];
      let basePrice = typeof selectedVariant?.price === 'number'
        ? selectedVariant.price
        : (typeof item.basePrice === 'number' ? item.basePrice : menuItem.price);
      const customizationPrice = customizations.reduce((sum, c) => sum + (typeof c.price === 'number' ? c.price : 0), 0);
      const unitPrice = (basePrice || 0) + (customizationPrice || 0);
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      return {
        ...item,
        name: menuItem.name,
        price: unitPrice,
        total: unitPrice * qty,
        category: menuItem.category || item.category || '',
        shortCode: menuItem.shortCode || item.shortCode || null,
      };
    });
  } catch (e) { /* non-critical — items display without names */ }
  return order;
}

function getOrders(restaurantId, filters) {
  filters = filters || {};
  const db = getLocalDb();
  let query = 'SELECT data FROM orders WHERE restaurant_id = ?';
  const params = [restaurantId];

  if (filters.search) {
    query += ' AND (id = ? OR daily_order_id = ? OR idempotency_key = ?)';
    params.push(filters.search, filters.search, filters.search);
  }

  if (filters.status) {
    if (Array.isArray(filters.status)) {
      query += ` AND status IN (${filters.status.map(() => '?').join(',')})`;
      params.push(...filters.status);
    } else {
      query += ' AND status = ?';
      params.push(filters.status);
    }
  }

  if (filters.today) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    query += ' AND created_at >= ?';
    params.push(startOfDay.getTime());
  }

  if (filters.startDate) {
    query += ' AND created_at >= ?';
    params.push(new Date(filters.startDate).getTime());
  }

  if (filters.endDate) {
    query += ' AND created_at <= ?';
    params.push(new Date(filters.endDate).getTime());
  }

  query += ' ORDER BY created_at DESC';

  if (filters.limit) {
    query += ' LIMIT ?';
    params.push(parseInt(filters.limit));
  }

  const orders = parseRows(db.prepare(query).all(...params));
  // Enrich items at read-time as a safety net for orders missing item names
  return orders.map(o => enrichOrderItems(db, o));
}

function getOrder(orderId) {
  const db = getLocalDb();
  const row = db.prepare('SELECT data FROM orders WHERE id = ?').get(orderId);
  const order = parseData(row);
  return enrichOrderItems(db, order);
}

// Helper: release a table when its linked order is completed/cancelled
function releaseTableForOrder(db, orderId, restaurantId) {
  try {
    const tableRow = db.prepare(
      'SELECT id, data FROM tables_local WHERE restaurant_id = ? AND current_order_id = ?'
    ).get(restaurantId, orderId);
    if (tableRow) {
      const tData = parseData(tableRow);
      if (tData) {
        tData.status = 'available';
        tData.currentOrderId = null;
        tData.currentOrderTotal = null;
        tData.updatedAt = new Date().toISOString();
        db.prepare(
          'UPDATE tables_local SET status = ?, current_order_id = ?, data = ?, synced_at = ? WHERE id = ?'
        ).run('available', null, JSON.stringify(tData), now(), tableRow.id);
      }
    }
  } catch (e) {
    // Non-critical — cloud sync will fix it
  }
}

function createOrder(restaurantId, orderData) {
  debugLog('createOrder called — restaurantId:', restaurantId, 'items:', (orderData.items || []).length);
  const db = getLocalDb();
  const ts = now();
  const id = orderData.id || crypto.randomUUID();
  const idempotencyKey = orderData.idempotencyKey || crypto.randomUUID();

  // Enrich items with name/price from local menu cache (mirrors backend logic).
  // The frontend sends { menuItemId, quantity, basePrice, selectedVariant, selectedCustomizations }
  // but not the item name — the backend resolves it from Firestore. We do the same from SQLite.
  let enrichedItems = orderData.items || [];
  try {
    const menuRows = db.prepare('SELECT id, name, price, data FROM menu_items WHERE restaurant_id = ?').all(restaurantId);
    console.log(`[entityStore] createOrder: found ${menuRows.length} menu items for restaurant ${restaurantId}`);
    if (menuRows.length > 0 && enrichedItems.length > 0) {
      // Build a fast lookup map by id
      const menuMap = {};
      for (const row of menuRows) {
        const parsed = parseData(row);
        if (parsed) {
          menuMap[row.id] = parsed;
          if (parsed.id) menuMap[parsed.id] = parsed;
          if (parsed._id) menuMap[parsed._id] = parsed;
        }
      }
      let totalAmount = 0;
      enrichedItems = enrichedItems.map(item => {
        // Try exact match, then fallback to name-based match
        let menuItem = menuMap[item.menuItemId];
        if (!menuItem && item.name) {
          // Fallback: match by name if menuItemId lookup fails
          menuItem = menuRows.map(r => parseData(r)).filter(Boolean)
            .find(m => m.name && m.name.toLowerCase() === item.name.toLowerCase());
        }
        if (!menuItem) {
          console.log(`[entityStore] createOrder: menu item NOT found for menuItemId=${item.menuItemId}, name=${item.name || 'N/A'}`);
          return item; // keep as-is if not found
        }
        const selectedVariant = item.selectedVariant || null;
        const customizations = Array.isArray(item.selectedCustomizations) ? item.selectedCustomizations : [];
        let basePrice = typeof selectedVariant?.price === 'number'
          ? selectedVariant.price
          : (typeof item.basePrice === 'number' ? item.basePrice : menuItem.price);
        const customizationPrice = customizations.reduce((sum, c) => sum + (typeof c.price === 'number' ? c.price : 0), 0);
        const unitPrice = (basePrice || 0) + (customizationPrice || 0);
        const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
        const itemTotal = unitPrice * qty;
        totalAmount += itemTotal;
        return {
          menuItemId: item.menuItemId,
          name: menuItem.name,
          price: unitPrice,
          quantity: qty,
          total: itemTotal,
          category: menuItem.category || '',
          shortCode: menuItem.shortCode || null,
          notes: item.notes || '',
          selectedVariant: selectedVariant ? { name: selectedVariant.name, price: selectedVariant.price || 0 } : null,
          selectedCustomizations: customizations.map(c => ({ id: c.id || null, name: c.name || c, price: typeof c.price === 'number' ? c.price : 0 })),
        };
      });
      // Recalculate totals if not provided
      if (!orderData.totalAmount && !orderData.finalAmount) {
        orderData.totalAmount = totalAmount;
      }
    }
  } catch (e) { console.error('[entityStore] createOrder enrichment error:', e); }

  // Generate a local dailyOrderId if not provided (backend normally does this).
  // Prefix with 'A' + short hex to distinguish offline-created orders.
  let dailyOrderId = orderData.dailyOrderId || null;
  if (!dailyOrderId) {
    dailyOrderId = 'A' + id.replace(/-/g, '').slice(0, 5).toUpperCase();
  }

  const order = { ...orderData, items: enrichedItems, id, idempotencyKey, restaurantId, dailyOrderId, syncSource: 'offline', createdAt: new Date().toISOString() };
  db.prepare(
    `INSERT INTO orders
     (id, restaurant_id, daily_order_id, status, table_id, total, data, idempotency_key, is_local, synced_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id, restaurantId,
    dailyOrderId,
    order.status || 'confirmed',
    order.tableNumber || order.tableId || null,
    order.finalAmount || order.totalAmount || 0,
    JSON.stringify(order),
    idempotencyKey,
    1, null, ts, ts
  );
  debugLog('createOrder INSERT success — id:', id, 'dailyOrderId:', dailyOrderId);
  logChange('order', id, restaurantId, 'CREATE', '/api/orders', 'POST', order);

  // Auto-update the linked table to 'occupied' so tables view reflects instantly.
  // Matches the exact fields the backend sets in Firestore on order creation.
  const tbl = order.tableNumber || order.tableId;
  debugLog('createOrder table update — tbl:', tbl, 'restaurantId:', restaurantId);
  if (tbl) {
    // Find the table by name/number OR by number field in JSON data
    const tableRow = db.prepare(
      'SELECT id, name, data FROM tables_local WHERE restaurant_id = ? AND (name = ? OR id = ?)'
    ).get(restaurantId, String(tbl), String(tbl));
    // If no match by name/id, try matching by number field in the JSON data
    let finalTableRow = tableRow;
    if (!finalTableRow) {
      const allTables = db.prepare('SELECT id, name, data FROM tables_local WHERE restaurant_id = ?').all(restaurantId);
      debugLog('createOrder table lookup miss — tbl:', tbl, 'total tables:', allTables.length, 'names:', allTables.map(r => r.name).join(','));
      for (const row of allTables) {
        const parsed = parseData(row);
        if (parsed && (String(parsed.number) === String(tbl) || String(parsed.name) === String(tbl))) {
          finalTableRow = row;
          break;
        }
      }
    }
    if (finalTableRow) {
      debugLog('createOrder table found — id:', finalTableRow.id, 'name:', finalTableRow.name);
      const tData = parseData(finalTableRow);
      if (tData) {
        tData.status = 'occupied';
        tData.currentOrderId = id;
        tData.currentOrderTotal = order.finalAmount || order.totalAmount || 0;
        tData.lastOrderTime = new Date().toISOString();
        tData.updatedAt = new Date().toISOString();
        db.prepare(
          'UPDATE tables_local SET status = ?, current_order_id = ?, data = ?, synced_at = ? WHERE id = ?'
        ).run('occupied', id, JSON.stringify(tData), ts, finalTableRow.id);
        debugLog('createOrder table updated to occupied — id:', finalTableRow.id);
      }
    } else {
      debugLog('createOrder table NOT found — tbl:', tbl);
    }
  }

  return order;
}

function updateOrder(orderId, restaurantId, updates) {
  const db = getLocalDb();
  const row = db.prepare('SELECT data FROM orders WHERE id = ?').get(orderId);
  if (!row) return null;
  const existing = parseData(row);
  const updated = { ...existing, ...updates };
  db.prepare(
    'UPDATE orders SET status = ?, total = ?, data = ?, updated_at = ? WHERE id = ?'
  ).run(
    updated.status || existing.status,
    updated.finalAmount || updated.totalAmount || existing.finalAmount || 0,
    JSON.stringify(updated), now(), orderId
  );
  logChange('order', orderId, restaurantId, 'UPDATE', `/api/orders/${orderId}`, 'PATCH', updates);
  return updated;
}

function updateOrderStatus(orderId, restaurantId, status, extra) {
  const db = getLocalDb();
  const row = db.prepare('SELECT data FROM orders WHERE id = ?').get(orderId);
  if (!row) return null;
  const existing = parseData(row);
  existing.status = status;
  if (extra) Object.assign(existing, extra);
  db.prepare(
    'UPDATE orders SET status = ?, data = ?, updated_at = ? WHERE id = ?'
  ).run(status, JSON.stringify(existing), now(), orderId);
  logChange('order', orderId, restaurantId, 'UPDATE', `/api/orders/${orderId}/status`, 'PATCH', { status, ...(extra || {}) });

  // Release the linked table when order is completed/cancelled
  if (status === 'completed' || status === 'cancelled') {
    releaseTableForOrder(db, orderId, restaurantId);
  }
  return existing;
}

function cancelOrder(orderId, restaurantId, reason) {
  const db = getLocalDb();
  const row = db.prepare('SELECT data FROM orders WHERE id = ?').get(orderId);
  if (!row) return null;
  const existing = parseData(row);
  existing.status = 'cancelled';
  if (reason) existing.cancellationReason = reason;
  db.prepare(
    'UPDATE orders SET status = ?, data = ?, updated_at = ? WHERE id = ?'
  ).run('cancelled', JSON.stringify(existing), now(), orderId);
  logChange('order', orderId, restaurantId, 'UPDATE', `/api/orders/${orderId}/cancel`, 'PATCH', { reason });
  // Release the linked table
  releaseTableForOrder(db, orderId, restaurantId);
  return existing;
}

function deleteOrder(orderId, restaurantId) {
  const db = getLocalDb();
  db.prepare('DELETE FROM orders WHERE id = ?').run(orderId);
  logChange('order', orderId, restaurantId, 'DELETE', `/api/orders/${orderId}`, 'DELETE', {});
}

function getLocalOnlyOrders(restaurantId) {
  const db = getLocalDb();
  return parseRows(
    db.prepare('SELECT data FROM orders WHERE restaurant_id = ? AND is_local = 1').all(restaurantId)
  );
}

function replaceLocalOrderWithServer(localId, serverOrder, restaurantId) {
  const db = getLocalDb();
  db.prepare('DELETE FROM orders WHERE id = ?').run(localId);
  saveOrders(restaurantId, [serverOrder]);
}

function getNextLocalOrderSequence(restaurantId) {
  const db = getLocalDb();
  const today = new Date().toISOString().split('T')[0];
  const row = db.prepare(
    'SELECT next_sequence FROM local_sequences WHERE restaurant_id = ? AND date = ?'
  ).get(restaurantId, today);
  const seq = row ? row.next_sequence : 1;
  db.prepare(
    'INSERT OR REPLACE INTO local_sequences (restaurant_id, date, next_sequence) VALUES (?, ?, ?)'
  ).run(restaurantId, today, seq + 1);
  return seq;
}

// ============================================
// Staff
// ============================================
function saveStaff(restaurantId, staffList) {
  const db = getLocalDb();
  const ts = now();
  const insertMany = db.transaction((staffList) => {
    db.prepare('DELETE FROM staff WHERE restaurant_id = ?').run(restaurantId);
    const stmt = db.prepare(
      'INSERT INTO staff (id, restaurant_id, name, role, data, synced_at) VALUES (?, ?, ?, ?, ?, ?)'
    );
    for (const member of staffList) {
      stmt.run(member.id || member._id, restaurantId, member.name || '', member.role || '', JSON.stringify(member), ts);
    }
  });
  insertMany(staffList);
}

function getStaff(restaurantId) {
  const db = getLocalDb();
  return parseRows(
    db.prepare('SELECT data FROM staff WHERE restaurant_id = ?').all(restaurantId)
  );
}

function createStaff(restaurantId, staffData) {
  let bcryptjs;
  try { bcryptjs = require('bcryptjs'); } catch { /* will skip credential generation */ }

  const db = getLocalDb();
  const id = staffData.id || crypto.randomUUID();

  // Generate loginId (5-digit numeric, matching cloud format) if not provided
  let loginId = staffData.loginId;
  if (!loginId) {
    const existingLogins = new Set();
    try {
      const rows = db.prepare('SELECT login_id FROM staff_credentials').all();
      rows.forEach(r => { if (r.login_id) existingLogins.add(r.login_id); });
      // Also check staff data for loginIds
      const staffRows = db.prepare('SELECT data FROM staff').all();
      staffRows.forEach(r => {
        try { const d = JSON.parse(r.data); if (d.loginId) existingLogins.add(d.loginId); } catch {}
      });
    } catch {}

    let attempts = 0;
    do {
      loginId = String(Math.floor(10000 + Math.random() * 90000));
      attempts++;
    } while (existingLogins.has(loginId) && attempts < 100);
  }

  // Generate temporary password (8-char base-36, matching cloud format)
  const temporaryPassword = staffData.password || Math.random().toString(36).slice(-8);

  // Hash password with bcrypt (10 rounds, matching cloud)
  let hashedPassword = '';
  if (bcryptjs) {
    hashedPassword = bcryptjs.hashSync(temporaryPassword, 10);
  }

  const newStaff = {
    ...staffData,
    id,
    loginId,
    password: hashedPassword,
    restaurantId,
    status: staffData.status || 'active',
    provider: 'staff',
    temporaryPassword: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Store in staff table
  db.prepare(
    'INSERT INTO staff (id, restaurant_id, name, role, data, synced_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, restaurantId, newStaff.name || '', newStaff.role || '', JSON.stringify(newStaff), now());

  // Store in staff_credentials for local login
  try {
    db.prepare(`
      INSERT INTO staff_credentials (id, restaurant_id, login_id, password_hash, name, role, page_access, synced_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        login_id = excluded.login_id,
        password_hash = excluded.password_hash,
        name = excluded.name,
        role = excluded.role,
        page_access = excluded.page_access,
        synced_at = excluded.synced_at
    `).run(
      id, restaurantId, loginId, hashedPassword,
      newStaff.name || '', newStaff.role || 'employee',
      newStaff.pageAccess ? JSON.stringify(newStaff.pageAccess) : null,
      now()
    );
  } catch (e) {
    console.error('[entityStore] Failed to save staff credentials:', e.message);
  }

  // Log change for cloud sync — send the hashed password so cloud stores it as-is
  logChange('staff', id, restaurantId, 'CREATE', `/api/staff/${restaurantId}`, 'POST', newStaff);

  return {
    staff: newStaff,
    credentials: {
      loginId,
      username: newStaff.username || null,
      password: temporaryPassword,
    },
  };
}

function updateStaff(staffId, restaurantId, data) {
  const db = getLocalDb();
  const row = db.prepare('SELECT data FROM staff WHERE id = ?').get(staffId);
  if (!row) return null;
  const existing = parseData(row);
  const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };

  // If password is being changed, hash it
  if (data.password && !data.password.startsWith('$2')) {
    let bcryptjs;
    try { bcryptjs = require('bcryptjs'); } catch {}
    if (bcryptjs) {
      updated.password = bcryptjs.hashSync(data.password, 10);
    }
  }

  db.prepare(
    'UPDATE staff SET name = ?, role = ?, data = ?, synced_at = ? WHERE id = ?'
  ).run(updated.name || '', updated.role || '', JSON.stringify(updated), now(), staffId);

  // Keep staff_credentials in sync
  try {
    const rid = restaurantId || updated.restaurantId || '';
    if (updated.loginId || updated.login_id) {
      db.prepare(`
        UPDATE staff_credentials SET
          name = ?, role = ?, page_access = ?,
          password_hash = CASE WHEN ? != '' THEN ? ELSE password_hash END,
          synced_at = ?
        WHERE id = ?
      `).run(
        updated.name || '', updated.role || '',
        updated.pageAccess ? JSON.stringify(updated.pageAccess) : null,
        updated.password || '', updated.password || '',
        now(), staffId
      );
    }
  } catch { /* staff_credentials update is best-effort */ }

  logChange('staff', staffId, restaurantId, 'UPDATE', `/api/staff/${staffId}`, 'PATCH', data);
  return updated;
}

function deleteStaff(staffId, restaurantId) {
  const db = getLocalDb();
  db.prepare('DELETE FROM staff WHERE id = ?').run(staffId);
  try { db.prepare('DELETE FROM staff_credentials WHERE id = ?').run(staffId); } catch {}
  logChange('staff', staffId, restaurantId, 'DELETE', `/api/staff/${staffId}`, 'DELETE', {});
}

// ============================================
// Waiters
// ============================================
function saveWaiters(restaurantId, waiters) {
  const db = getLocalDb();
  const ts = now();
  const insertMany = db.transaction((waiters) => {
    db.prepare('DELETE FROM waiters WHERE restaurant_id = ?').run(restaurantId);
    const stmt = db.prepare(
      'INSERT INTO waiters (id, restaurant_id, name, data, synced_at) VALUES (?, ?, ?, ?, ?)'
    );
    for (const waiter of waiters) {
      stmt.run(waiter.id || waiter._id, restaurantId, waiter.name || '', JSON.stringify(waiter), ts);
    }
  });
  insertMany(waiters);
}

function getWaiters(restaurantId) {
  const db = getLocalDb();
  return parseRows(
    db.prepare('SELECT data FROM waiters WHERE restaurant_id = ?').all(restaurantId)
  );
}

// ============================================
// Bookings
// ============================================
function saveBookings(restaurantId, bookings) {
  const db = getLocalDb();
  const ts = now();
  const insertMany = db.transaction((bookings) => {
    db.prepare('DELETE FROM bookings WHERE restaurant_id = ?').run(restaurantId);
    const stmt = db.prepare(
      'INSERT INTO bookings (id, restaurant_id, data, synced_at) VALUES (?, ?, ?, ?)'
    );
    for (const booking of bookings) {
      stmt.run(booking.id || booking._id, restaurantId, JSON.stringify(booking), ts);
    }
  });
  insertMany(bookings);
}

function getBookings(restaurantId) {
  const db = getLocalDb();
  return parseRows(
    db.prepare('SELECT data FROM bookings WHERE restaurant_id = ?').all(restaurantId)
  );
}

function createBooking(restaurantId, data) {
  const db = getLocalDb();
  const id = data.id || crypto.randomUUID();
  const newBooking = { ...data, id };
  db.prepare(
    'INSERT INTO bookings (id, restaurant_id, data, synced_at) VALUES (?, ?, ?, ?)'
  ).run(id, restaurantId, JSON.stringify(newBooking), now());
  logChange('booking', id, restaurantId, 'CREATE', `/api/bookings/${restaurantId}`, 'POST', newBooking);
  return newBooking;
}

function updateBooking(bookingId, restaurantId, data) {
  const db = getLocalDb();
  const row = db.prepare('SELECT data FROM bookings WHERE id = ?').get(bookingId);
  if (!row) return null;
  const existing = parseData(row);
  const updated = { ...existing, ...data };
  db.prepare(
    'UPDATE bookings SET data = ?, synced_at = ? WHERE id = ?'
  ).run(JSON.stringify(updated), now(), bookingId);
  logChange('booking', bookingId, restaurantId, 'UPDATE', `/api/bookings/${bookingId}`, 'PATCH', data);
  return updated;
}

function deleteBooking(bookingId, restaurantId) {
  const db = getLocalDb();
  db.prepare('DELETE FROM bookings WHERE id = ?').run(bookingId);
  logChange('booking', bookingId, restaurantId, 'DELETE', `/api/bookings/${bookingId}`, 'DELETE', {});
}

// ============================================
// Invoices
// ============================================
function saveInvoices(restaurantId, invoices) {
  const db = getLocalDb();
  const ts = now();
  const insertMany = db.transaction((invoices) => {
    db.prepare('DELETE FROM invoices WHERE restaurant_id = ?').run(restaurantId);
    const stmt = db.prepare(
      'INSERT INTO invoices (id, restaurant_id, order_id, data, synced_at) VALUES (?, ?, ?, ?, ?)'
    );
    for (const invoice of invoices) {
      stmt.run(invoice.id || invoice._id, restaurantId, invoice.orderId || '', JSON.stringify(invoice), ts);
    }
  });
  insertMany(invoices);
}

function getInvoices(restaurantId) {
  const db = getLocalDb();
  return parseRows(
    db.prepare('SELECT data FROM invoices WHERE restaurant_id = ?').all(restaurantId)
  );
}

function getInvoice(invoiceId) {
  const db = getLocalDb();
  const row = db.prepare('SELECT data FROM invoices WHERE id = ?').get(invoiceId);
  return parseData(row);
}

// ============================================
// KOT (Kitchen Order Tickets)
// ============================================
function saveKotItems(restaurantId, items) {
  const db = getLocalDb();
  const ts = now();
  const insertMany = db.transaction((items) => {
    db.prepare('DELETE FROM kot_queue WHERE restaurant_id = ?').run(restaurantId);
    const stmt = db.prepare(
      'INSERT INTO kot_queue (id, restaurant_id, order_id, status, data, synced_at) VALUES (?, ?, ?, ?, ?, ?)'
    );
    for (const item of items) {
      stmt.run(item.id || item._id, restaurantId, item.orderId || '', item.status || 'pending', JSON.stringify(item), ts);
    }
  });
  insertMany(items);
}

function getKotItems(restaurantId, status) {
  const db = getLocalDb();
  let kotOrders;
  if (status) {
    kotOrders = parseRows(
      db.prepare('SELECT data FROM kot_queue WHERE restaurant_id = ? AND status = ?').all(restaurantId, status)
    );
  } else {
    kotOrders = parseRows(
      db.prepare('SELECT data FROM kot_queue WHERE restaurant_id = ?').all(restaurantId)
    );
  }

  // Merge locally-created orders that aren't yet in kot_queue.
  // These are orders created offline via entityStore.createOrder() and stored
  // in the orders table with is_local = 1. They need to appear in KOT view.
  try {
    const validStatuses = status ? [status] : ['confirmed', 'preparing', 'ready', 'pending'];
    const placeholders = validStatuses.map(() => '?').join(',');
    const localOrders = parseRows(
      db.prepare(
        `SELECT data FROM orders WHERE restaurant_id = ? AND status IN (${placeholders}) ORDER BY created_at DESC LIMIT 100`
      ).all(restaurantId, ...validStatuses)
    );
    const existingIds = new Set(kotOrders.map(o => o.id || o._id));
    for (const order of localOrders) {
      if (!existingIds.has(order.id) && !existingIds.has(order._id)) {
        // Format to match the backend KOT response shape
        kotOrders.push({
          ...order,
          kotId: `KOT-${(order.id || '').slice(-6).toUpperCase()}`,
          kotTime: order.createdAt || new Date().toISOString(),
          estimatedTime: Math.max(15, (order.items?.length || 0) * 8),
        });
      }
    }
  } catch (e) {
    // Non-critical — kot_queue data alone is fine
  }

  // Enrich items at read-time for any KOT orders missing item names
  return kotOrders.map(o => enrichOrderItems(db, o));
}

function updateKotStatus(orderId, restaurantId, status) {
  const db = getLocalDb();
  db.prepare(
    'UPDATE kot_queue SET status = ?, synced_at = ? WHERE order_id = ? AND restaurant_id = ?'
  ).run(status, now(), orderId, restaurantId);
  logChange('kot', orderId, restaurantId, 'UPDATE', `/api/kot/${orderId}/status`, 'PATCH', { status });
}

// ============================================
// Register
// ============================================
function saveRegister(restaurantId, registerData) {
  const db = getLocalDb();
  db.prepare(
    'INSERT OR REPLACE INTO register (id, restaurant_id, status, data, synced_at) VALUES (?, ?, ?, ?, ?)'
  ).run(registerData.id, restaurantId, registerData.status || 'open', JSON.stringify(registerData), now());
}

function getCurrentRegister(restaurantId) {
  const db = getLocalDb();
  const row = db.prepare(
    "SELECT data FROM register WHERE restaurant_id = ? AND status = 'open'"
  ).get(restaurantId);
  return parseData(row);
}

function openRegister(restaurantId, data) {
  const db = getLocalDb();
  const id = data.id || crypto.randomUUID();
  const registerData = { ...data, id, status: 'open' };
  db.prepare(
    'INSERT OR REPLACE INTO register (id, restaurant_id, status, data, synced_at) VALUES (?, ?, ?, ?, ?)'
  ).run(id, restaurantId, 'open', JSON.stringify(registerData), now());
  logChange('register', id, restaurantId, 'CREATE', `/api/register/${restaurantId}/open`, 'POST', registerData);
  return registerData;
}

function addTransaction(registerId, restaurantId, data) {
  const db = getLocalDb();
  const row = db.prepare('SELECT data FROM register WHERE id = ?').get(registerId);
  if (!row) return null;
  const registerData = parseData(row);
  if (!registerData) return null;
  if (!registerData.transactions) registerData.transactions = [];
  const txnId = data.id || crypto.randomUUID();
  const txn = { ...data, id: txnId };
  registerData.transactions.push(txn);
  db.prepare(
    'UPDATE register SET data = ?, synced_at = ? WHERE id = ?'
  ).run(JSON.stringify(registerData), now(), registerId);
  logChange('register', registerId, restaurantId, 'UPDATE', `/api/register/${registerId}/transaction`, 'POST', txn);
  return txn;
}

function closeRegister(registerId, restaurantId, data) {
  const db = getLocalDb();
  const row = db.prepare('SELECT data FROM register WHERE id = ?').get(registerId);
  if (!row) return null;
  const registerData = parseData(row);
  if (!registerData) return null;
  const closed = { ...registerData, ...data, status: 'closed' };
  db.prepare(
    "UPDATE register SET status = 'closed', data = ?, synced_at = ? WHERE id = ?"
  ).run(JSON.stringify(closed), now(), registerId);
  logChange('register', registerId, restaurantId, 'UPDATE', `/api/register/${registerId}/close`, 'POST', closed);
  return closed;
}

// ============================================
// Menu Theme
// ============================================
function saveMenuTheme(restaurantId, data) { _saveSettings('menu_theme', restaurantId, data); }
function getMenuTheme(restaurantId) { return _getSettings('menu_theme', restaurantId); }
function updateMenuTheme(restaurantId, data) {
  _saveSettings('menu_theme', restaurantId, data);
  logChange('menu_theme', restaurantId, restaurantId, 'UPDATE', `/api/menu-theme/${restaurantId}`, 'POST', data);
  return data;
}

// ============================================
// Generic Entity Store
// ============================================
function saveEntity(entityType, id, restaurantId, data) {
  const db = getLocalDb();
  db.prepare(
    'INSERT OR REPLACE INTO entities (id, entity_type, restaurant_id, data, updated_at, sync_status) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, entityType, restaurantId, JSON.stringify(data), now(), 'synced');
}

function getEntity(entityType, id) {
  const db = getLocalDb();
  const row = db.prepare('SELECT data FROM entities WHERE entity_type = ? AND id = ?').get(entityType, id);
  return parseData(row);
}

function getEntities(entityType, restaurantId) {
  const db = getLocalDb();
  return parseRows(
    db.prepare('SELECT data FROM entities WHERE entity_type = ? AND restaurant_id = ?').all(entityType, restaurantId)
  );
}

function deleteEntity(entityType, id, restaurantId) {
  const db = getLocalDb();
  db.prepare('DELETE FROM entities WHERE entity_type = ? AND id = ?').run(entityType, id);
}

// ============================================
// Analytics (computed locally from orders)
// ============================================
function getAnalytics(restaurantId, dateRange) {
  const db = getLocalDb();
  let query = 'SELECT data FROM orders WHERE restaurant_id = ?';
  const params = [restaurantId];

  if (dateRange) {
    if (dateRange.startDate) {
      query += ' AND created_at >= ?';
      params.push(new Date(dateRange.startDate).getTime());
    }
    if (dateRange.endDate) {
      query += ' AND created_at <= ?';
      params.push(new Date(dateRange.endDate).getTime());
    }
    if (dateRange.daily || dateRange.today) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      query += ' AND created_at >= ?';
      params.push(startOfDay.getTime());
    }
  }

  const rows = db.prepare(query).all(...params);
  const orders = parseRows(rows);

  const totalOrders = orders.length;
  let totalRevenue = 0;
  const statusCounts = {};
  const typeCounts = {};

  for (const order of orders) {
    totalRevenue += order.finalAmount || order.totalAmount || 0;
    const status = order.status || 'unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
    const type = order.orderType || order.type || 'unknown';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  }

  return {
    totalOrders,
    totalRevenue,
    averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    orderCountByStatus: statusCounts,
    orderCountByType: typeCounts,
  };
}

// ============================================
// Utility
// ============================================
function clearAllData() {
  const db = getLocalDb();
  const tables = [
    'restaurant', 'menu_items', 'floors', 'tables_local',
    'tax_settings', 'billing_settings', 'pricing_settings',
    'business_settings', 'print_settings', 'print_stations',
    'customers', 'offers', 'offer_settings',
    'inventory_items', 'recipes', 'rooms',
    'saved_carts', 'orders', 'local_sequences',
    'staff', 'waiters', 'bookings', 'invoices',
    'kot_queue', 'register', 'menu_theme',
    'entities', 'change_log',
  ];
  db.transaction(() => {
    for (const table of tables) {
      db.prepare(`DELETE FROM ${table}`).run();
    }
  })();
}

const VALID_TABLES = new Set([
  'restaurant', 'menu_items', 'floors', 'tables_local',
  'tax_settings', 'billing_settings', 'pricing_settings',
  'business_settings', 'print_settings', 'print_stations',
  'customers', 'offers', 'offer_settings',
  'inventory_items', 'recipes', 'rooms',
  'saved_carts', 'orders', 'staff', 'waiters',
  'bookings', 'invoices', 'kot_queue', 'register', 'menu_theme', 'entities',
]);

function getLastSyncTime(tableName, restaurantId) {
  if (!VALID_TABLES.has(tableName)) return null;
  const db = getLocalDb();
  const row = db.prepare(
    `SELECT MAX(synced_at) as last_sync FROM ${tableName} WHERE restaurant_id = ?`
  ).get(restaurantId);
  return row ? row.last_sync : null;
}

function getChangeLogPending() {
  const db = getLocalDb();
  return db.prepare(
    'SELECT * FROM change_log WHERE synced = 0 ORDER BY id ASC'
  ).all().map(row => {
    try {
      row.payload = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
    } catch { /* keep as-is */ }
    return row;
  });
}

function markChangeLogSynced(id) {
  const db = getLocalDb();
  db.prepare('UPDATE change_log SET synced = 1 WHERE id = ?').run(id);
}

function markChangeLogFailed(id, error) {
  const db = getLocalDb();
  db.prepare(
    'UPDATE change_log SET sync_error = ?, retry_count = retry_count + 1 WHERE id = ?'
  ).run(error, id);
}

// ============================================
// Staff Credentials (for offline/LAN auth)
// ============================================

function saveStaffCredentials(restaurantId, credentials) {
  const db = getLocalDb();
  const upsert = db.prepare(`
    INSERT INTO staff_credentials (id, restaurant_id, login_id, password_hash, name, role, page_access, synced_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      login_id = excluded.login_id,
      password_hash = excluded.password_hash,
      name = excluded.name,
      role = excluded.role,
      page_access = excluded.page_access,
      synced_at = excluded.synced_at
  `);

  const tx = db.transaction(() => {
    for (const cred of credentials) {
      upsert.run(
        cred.id || cred._id,
        restaurantId,
        cred.loginId || cred.login_id || '',
        cred.passwordHash || cred.password || '',
        cred.name || '',
        cred.role || 'employee',
        cred.pageAccess ? JSON.stringify(cred.pageAccess) : null,
        now(),
      );
    }
  });
  tx();
}

function getStaffCredentials(restaurantId) {
  const db = getLocalDb();
  return db.prepare(
    'SELECT * FROM staff_credentials WHERE restaurant_id = ?'
  ).all(restaurantId);
}

function verifyStaffLogin(loginId, password) {
  let bcryptjs;
  try {
    bcryptjs = require('bcryptjs');
  } catch {
    return { success: false, error: 'bcryptjs not available' };
  }

  const db = getLocalDb();
  const cred = db.prepare(
    'SELECT * FROM staff_credentials WHERE login_id = ?'
  ).get(loginId);

  if (!cred || !cred.password_hash) {
    return { success: false, error: 'Invalid credentials' };
  }

  if (!bcryptjs.compareSync(password, cred.password_hash)) {
    return { success: false, error: 'Invalid credentials' };
  }

  return {
    success: true,
    staff: {
      id: cred.id,
      loginId: cred.login_id,
      name: cred.name,
      role: cred.role,
      restaurantId: cred.restaurant_id,
      pageAccess: cred.page_access ? JSON.parse(cred.page_access) : null,
    },
  };
}

// ============================================
// Module Exports
// ============================================
module.exports = {
  // Restaurant
  saveRestaurant, getRestaurant,
  // Menu Items
  saveMenuItems, getMenuItems, upsertMenuItem, createMenuItem, deleteMenuItem,
  // Floors
  saveFloors, getFloors, createFloor, updateFloor, deleteFloor,
  // Tables
  saveTables, getTables, createTable, createTablesBulk, updateTable, updateTableStatus, deleteTable, resetAllTables,
  // Settings
  saveTaxSettings, getTaxSettings, updateTaxSettings,
  saveBillingSettings, getBillingSettings, updateBillingSettings,
  savePricingSettings, getPricingSettings, updatePricingSettings,
  saveBusinessSettings, getBusinessSettings, updateBusinessSettings,
  savePrintSettings, getPrintSettings, updatePrintSettings,
  savePrintStations, getPrintStations, updatePrintStations,
  // Customers
  saveCustomers, getCustomers, upsertCustomer,
  // Offers
  saveOffers, getOffers, saveOfferSettings, getOfferSettings,
  // Inventory
  saveInventoryItems, getInventoryItems, createInventoryItem, updateInventoryItem, deleteInventoryItem,
  // Recipes
  saveRecipes, getRecipes,
  // Rooms
  saveRooms, getRooms,
  // Saved Carts
  saveSavedCarts, getSavedCarts, upsertSavedCart, deleteSavedCart,
  // Orders
  saveOrders, getOrders, getOrder, createOrder, updateOrder, updateOrderStatus,
  cancelOrder, deleteOrder, getLocalOnlyOrders, replaceLocalOrderWithServer, getNextLocalOrderSequence,
  // Staff
  saveStaff, getStaff, createStaff, updateStaff, deleteStaff,
  // Waiters
  saveWaiters, getWaiters,
  // Bookings
  saveBookings, getBookings, createBooking, updateBooking, deleteBooking,
  // Invoices
  saveInvoices, getInvoices, getInvoice,
  // KOT
  saveKotItems, getKotItems, updateKotStatus,
  // Register
  saveRegister, getCurrentRegister, openRegister, addTransaction, closeRegister,
  // Menu Theme
  saveMenuTheme, getMenuTheme, updateMenuTheme,
  // Generic
  saveEntity, getEntity, getEntities, deleteEntity,
  // Analytics
  getAnalytics,
  // Utility
  clearAllData, getLastSyncTime, getChangeLogPending, markChangeLogSynced, markChangeLogFailed,
  // Staff Credentials (offline auth)
  saveStaffCredentials, getStaffCredentials, verifyStaffLogin,
  // Expose logChange for use by localRouter
  logChange,
};
