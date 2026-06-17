import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const api = {
    // Admin PIN
    verifyAdminPin: (pin: string) => ipcRenderer.invoke('verifyAdminPin', pin),
    updateAdminPin: (currentPin: string, newPin: string) => ipcRenderer.invoke('updateAdminPin', currentPin, newPin),

    // CSV File Export
    generateExportCsv: (content: string, defaultFilename: string) => ipcRenderer.invoke('saveCsv', content, defaultFilename)
};

contextBridge.exposeInMainWorld('api', api);

// Need to export an empty typescript module to satisfy compiler
export { };
