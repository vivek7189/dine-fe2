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
  scanNetworkPrinters: () =>
    ipcRenderer.invoke('electron:scanNetworkPrinters'),
  getPrinterHealth: () =>
    ipcRenderer.invoke('electron:getPrinterHealth'),
  onPrinterStatus: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('printer-status', handler);
    return () => ipcRenderer.removeListener('printer-status', handler);
  },

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

  // ECR Payment Terminal (NAPS Qatar) — direct HTTPS to terminal on local network
  ecrRequest: (params) =>
    ipcRenderer.invoke('electron:ecrRequest', params),

  // Open URL in system browser (for desktop auth flow)
  openExternal: (url) => ipcRenderer.invoke('electron:openExternal', url),

  // Image helpers
  getImageUrl: (urlOrLocal) => ipcRenderer.invoke('electron:getImageUrl', urlOrLocal),

  // Data management
  clearLocalData: () => ipcRenderer.invoke('electron:clearLocalData'),

  // Emergency direct SQLite save — bypasses normal API routing
  saveOrderDirect: (orderData) =>
    ipcRenderer.invoke('electron:saveOrderDirect', orderData),

  // Weighing Scale (serial port)
  scale: {
    connect: (port, baudRate) => ipcRenderer.invoke('electron:scaleConnect', { port, baudRate }),
    disconnect: () => ipcRenderer.invoke('electron:scaleDisconnect'),
    getWeight: () => ipcRenderer.invoke('electron:scaleGetWeight'),
    getStatus: () => ipcRenderer.invoke('electron:scaleGetStatus'),
    listPorts: () => ipcRenderer.invoke('electron:scaleListPorts'),
  },
  onScaleWeight: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('scale-weight', handler);
    return () => ipcRenderer.removeListener('scale-weight', handler);
  },

  // Cash Drawer
  cashDrawer: {
    open: () => ipcRenderer.invoke('electron:openCashDrawer'),
  },

  // Customer Display (Secondary Screen)
  display: {
    getDisplays: () => ipcRenderer.invoke('electron:getDisplays'),
    open: (options) => ipcRenderer.invoke('electron:openCustomerDisplay', options),
    close: () => ipcRenderer.invoke('electron:closeCustomerDisplay'),
    getStatus: () => ipcRenderer.invoke('electron:getCustomerDisplayStatus'),
  },
  onDisplayClosed: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('customer-display-closed', handler);
    return () => ipcRenderer.removeListener('customer-display-closed', handler);
  },

  // Window refocus (fixes Windows keyboard focus after alert/confirm dialogs)
  _refocusWindow: () => ipcRenderer.invoke('electron:refocusWindow'),

  // Build version marker for debugging
  buildVersion: 'v1.5.0',
});
