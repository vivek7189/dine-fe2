const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Printing
  print: (html, options = {}) =>
    ipcRenderer.invoke('electron:print', { html, ...options }),
  getPrinters: () =>
    ipcRenderer.invoke('electron:listPrinters'),
  setDefaultPrinter: (name) =>
    ipcRenderer.invoke('electron:setDefaultPrinter', { name }),
  getDefaultPrinter: () =>
    ipcRenderer.invoke('electron:getDefaultPrinter'),
  setPrinterConfig: (config) =>
    ipcRenderer.invoke('electron:setPrinterConfig', config),
  getPrinterConfig: () =>
    ipcRenderer.invoke('electron:getPrinterConfig'),

  // Auto-update
  checkForUpdates: () =>
    ipcRenderer.invoke('electron:checkForUpdates'),
  restartApp: () =>
    ipcRenderer.invoke('electron:restartApp'),
  getVersion: () =>
    ipcRenderer.invoke('electron:getVersion'),

  // Offline local-first proxy — ALL API calls route through this
  apiRequest: (request) =>
    ipcRenderer.invoke('electron:apiRequest', request),

  // Sync control
  offlineSync: {
    getSyncStatus: () => ipcRenderer.invoke('electron:getSyncStatus'),
    getSyncHistory: (limit) => ipcRenderer.invoke('electron:getSyncHistory', limit),
    triggerSync: () => ipcRenderer.invoke('electron:triggerSync'),
    pauseSync: () => ipcRenderer.invoke('electron:pauseSync'),
    resumeSync: () => ipcRenderer.invoke('electron:resumeSync'),
    forcePull: (restaurantId) => ipcRenderer.invoke('electron:forcePull', restaurantId),
  },

  // LAN hub control + terminal identity + pairing
  lanHub: {
    // Hub control
    startHub: (port) => ipcRenderer.invoke('electron:startHub', port),
    stopHub: () => ipcRenderer.invoke('electron:stopHub'),
    getHubInfo: () => ipcRenderer.invoke('electron:getHubInfo'),
    getConnectedTerminals: () => ipcRenderer.invoke('electron:getConnectedTerminals'),
    discoverHub: () => ipcRenderer.invoke('electron:discoverHub'),
    getDiscoveredHub: () => ipcRenderer.invoke('electron:getDiscoveredHub'),

    // Terminal identity
    getTerminalId: () => ipcRenderer.invoke('electron:getTerminalId'),
    getTerminalConfig: () => ipcRenderer.invoke('electron:getTerminalConfig'),
    isPaired: () => ipcRenderer.invoke('electron:isPaired'),
    isHub: () => ipcRenderer.invoke('electron:isHub'),

    // Pairing
    pairWithHub: (data) => ipcRenderer.invoke('electron:pairWithHub', data),
    unpair: () => ipcRenderer.invoke('electron:unpair'),
    getPairingCode: () => ipcRenderer.invoke('electron:getPairingCode'),
    regeneratePairingCode: () => ipcRenderer.invoke('electron:regeneratePairingCode'),
    getHubQrData: () => ipcRenderer.invoke('electron:getHubQrData'),

    // Local staff auth
    localStaffLogin: (data) => ipcRenderer.invoke('electron:localStaffLogin', data),
  },

  // Hub real-time events (forwarded from hub WebSocket)
  onHubEvent: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('hub-event', handler);
    return () => ipcRenderer.removeListener('hub-event', handler);
  },

  // Image helpers
  getImageUrl: (urlOrLocal) => ipcRenderer.invoke('electron:getImageUrl', urlOrLocal),

  // Data management
  clearLocalData: () => ipcRenderer.invoke('electron:clearLocalData'),
});
