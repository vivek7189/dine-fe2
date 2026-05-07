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

  // Auto-update
  checkForUpdates: () =>
    ipcRenderer.invoke('electron:checkForUpdates'),
  restartApp: () =>
    ipcRenderer.invoke('electron:restartApp'),
  getVersion: () =>
    ipcRenderer.invoke('electron:getVersion'),

  // Offline SQLite proxy — ALL API calls route through this
  apiRequest: (request) =>
    ipcRenderer.invoke('electron:apiRequest', request),

  // Sync control — for admin dashboard
  offlineSync: {
    getSyncStatus: () => ipcRenderer.invoke('electron:getSyncStatus'),
    getPendingMutations: () => ipcRenderer.invoke('electron:getPendingMutations'),
    getSyncHistory: (limit) => ipcRenderer.invoke('electron:getSyncHistory', limit),
    triggerSync: () => ipcRenderer.invoke('electron:triggerSync'),
    pauseSync: () => ipcRenderer.invoke('electron:pauseSync'),
    resumeSync: () => ipcRenderer.invoke('electron:resumeSync'),
    retryMutation: (id) => ipcRenderer.invoke('electron:retryMutation', id),
    deleteMutation: (id) => ipcRenderer.invoke('electron:deleteMutation', id),
    clearCache: () => ipcRenderer.invoke('electron:clearCache'),
    getCacheStats: () => ipcRenderer.invoke('electron:getCacheStats'),
  },
});
