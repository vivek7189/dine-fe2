/**
 * Terminal Identity & Pairing Config
 *
 * Each Electron terminal gets a persistent UUID stored in dineopen-settings.json.
 * Pairing state (hub host, port, restaurant, role) is also persisted here.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { app } = require('electron');

let settingsPath = null;

function getSettingsPath() {
  if (!settingsPath) {
    settingsPath = path.join(app.getPath('userData'), 'dineopen-settings.json');
  }
  return settingsPath;
}

function loadSettings() {
  try {
    const raw = fs.readFileSync(getSettingsPath(), 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveSettings(data) {
  fs.writeFileSync(getSettingsPath(), JSON.stringify(data, null, 2), 'utf8');
}

function getTerminalId() {
  const settings = loadSettings();
  if (!settings.terminalId) {
    settings.terminalId = crypto.randomUUID();
    saveSettings(settings);
  }
  return settings.terminalId;
}

function getTerminalConfig() {
  const settings = loadSettings();
  return settings.terminalPairing || null;
}

function saveTerminalConfig(config) {
  const settings = loadSettings();
  settings.terminalPairing = {
    ...config,
    terminalId: settings.terminalId || getTerminalId(),
  };
  saveSettings(settings);
}

function isPaired() {
  const settings = loadSettings();
  return !!(settings.terminalPairing && settings.terminalPairing.pairedAt);
}

function isHub() {
  const settings = loadSettings();
  return !!settings.lanHub;
}

function setHubMode(enabled, port = 3847) {
  const settings = loadSettings();
  settings.lanHub = enabled;
  settings.lanHubPort = port;
  if (!enabled) {
    delete settings.lanClient;
  }
  saveSettings(settings);
}

function clearPairing() {
  const settings = loadSettings();
  delete settings.terminalPairing;
  delete settings.lanClient;
  saveSettings(settings);
}

module.exports = {
  getTerminalId,
  getTerminalConfig,
  saveTerminalConfig,
  isPaired,
  isHub,
  setHubMode,
  clearPairing,
};
