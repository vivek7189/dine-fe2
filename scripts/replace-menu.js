#!/usr/bin/env node

/**
 * Replace Menu Script
 *
 * Usage: node scripts/replace-menu.js <restaurantId> <jsonFile>
 *
 * Example:
 *   node scripts/replace-menu.js 6612abc123def456 krishnas-dosa-kadai-menu.json
 *
 * This will:
 *   1. Soft-delete all existing menu items for the restaurant
 *   2. Upload all items from the JSON file (with multi-tier pricing)
 */

const path = require('path');
const fs = require('fs');

const API_BASE = process.env.API_URL || 'https://www.dineopen.com';
const AUTH_TOKEN = process.env.AUTH_TOKEN || '';

const restaurantId = process.argv[2];
const jsonFile = process.argv[3];

if (!restaurantId || !jsonFile) {
  console.error('\n  Usage: node scripts/replace-menu.js <restaurantId> <jsonFile>\n');
  console.error('  Environment variables:');
  console.error('    API_URL     - API base URL (default: https://www.dineopen.com)');
  console.error('    AUTH_TOKEN  - Bearer token for authentication\n');
  console.error('  Example:');
  console.error('    AUTH_TOKEN="your-token" node scripts/replace-menu.js 6612abc123 krishnas-dosa-kadai-menu.json\n');
  process.exit(1);
}

// Resolve JSON file path
const jsonPath = path.resolve(jsonFile);
if (!fs.existsSync(jsonPath)) {
  console.error(`File not found: ${jsonPath}`);
  process.exit(1);
}

const menuData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const menuItems = menuData.menuItems;

if (!menuItems || !Array.isArray(menuItems) || menuItems.length === 0) {
  console.error('No menuItems found in JSON file');
  process.exit(1);
}

// Extract unique categories as objects (backend expects { name: "..." })
const categories = [...new Set(menuItems.map(i => i.category))].filter(Boolean)
  .map(name => ({ name }));

async function apiRequest(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (AUTH_TOKEN) headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, opts);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(`${method} ${endpoint} failed (${res.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

async function main() {
  console.log(`\n  Menu Replace Tool`);
  console.log(`  ─────────────────────────────────`);
  console.log(`  API:          ${API_BASE}`);
  console.log(`  Restaurant:   ${restaurantId}`);
  console.log(`  JSON File:    ${path.basename(jsonPath)}`);
  console.log(`  Items:        ${menuItems.length}`);
  console.log(`  Categories:   ${categories.length} (${categories.slice(0, 5).map(c => c.name).join(', ')}${categories.length > 5 ? '...' : ''})`);

  const withAC = menuItems.filter(i => i.pricingRules?.rule_ac_dining).length;
  const withTW = menuItems.filter(i => i.pricingRules?.rule_takeaway).length;
  console.log(`  AC Pricing:   ${withAC} items`);
  console.log(`  TW Pricing:   ${withTW} items`);
  console.log(`  ─────────────────────────────────\n`);

  // Step 1: Delete existing menu
  console.log('  [1/2] Deleting existing menu items...');
  try {
    const deleteResult = await apiRequest(`/api/menus/${restaurantId}/bulk-delete`, 'DELETE');
    console.log(`        Deleted: ${deleteResult.deletedCount || 0} items`);
  } catch (err) {
    // Might fail if no items exist — that's ok
    console.log(`        No existing items to delete (${err.message})`);
  }

  // Step 2: Upload new menu
  console.log('  [2/2] Uploading new menu items...');
  try {
    const saveResult = await apiRequest(
      `/api/menus/bulk-save/${restaurantId}`,
      'POST',
      { menuItems, categories }
    );
    console.log(`        Saved: ${saveResult.savedCount || menuItems.length} items`);
    if (saveResult.errorCount > 0) {
      console.log(`        Errors: ${saveResult.errorCount}`);
      (saveResult.errors || []).forEach(e => console.log(`          - ${e}`));
    }
  } catch (err) {
    console.error(`        Failed: ${err.message}`);
    process.exit(1);
  }

  console.log(`\n  Done! Menu replaced successfully for restaurant ${restaurantId}\n`);
}

main().catch(err => {
  console.error(`\n  Error: ${err.message}\n`);
  process.exit(1);
});
