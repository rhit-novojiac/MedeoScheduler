import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const api = {
    getFencers: () => ipcRenderer.invoke('getFencers'),
    createFencer: (fencer: Record<string, unknown>) => ipcRenderer.invoke('createFencer', fencer),
    updateFencer: (fencer: Record<string, unknown>) => ipcRenderer.invoke('updateFencer', fencer),

    getClassTypes: () => ipcRenderer.invoke('getClassTypes'),
    createClassType: (classType: Record<string, unknown>) => ipcRenderer.invoke('createClassType', classType),
    updateClassType: (classType: Record<string, unknown>) => ipcRenderer.invoke('updateClassType', classType),
    deleteClassType: (id: number) => ipcRenderer.invoke('deleteClassType', id),

    getClassTemplates: () => ipcRenderer.invoke('getClassTemplates'),
    createClassTemplate: (template: Record<string, unknown>) => ipcRenderer.invoke('createClassTemplate', template),
    updateClassTemplate: (template: Record<string, unknown>) => ipcRenderer.invoke('updateClassTemplate', template),
    deleteClassTemplate: (id: number) => ipcRenderer.invoke('deleteClassTemplate', id),

    getOrCreateClassSessionsByDate: (date: string) => ipcRenderer.invoke('getOrCreateClassSessionsByDate', date),
    createClassSession: (session: Record<string, unknown>) => ipcRenderer.invoke('createClassSession', session),
    deleteClassSession: (id: number) => ipcRenderer.invoke('deleteClassSession', id),
    getAttendeesForSession: (sessionId: number) => ipcRenderer.invoke('getAttendeesForSession', sessionId),

    addAttendee: (sessionId: number, fencerId: number) => ipcRenderer.invoke('addAttendee', sessionId, fencerId),
    removeAttendee: (sessionId: number, fencerId: number) => ipcRenderer.invoke('removeAttendee', sessionId, fencerId),

    getCoachesForSession: (sessionId: number) => ipcRenderer.invoke('getCoachesForSession', sessionId),
    addCoach: (sessionId: number, coachId: number) => ipcRenderer.invoke('addCoach', sessionId, coachId),
    removeCoach: (sessionId: number, coachId: number) => ipcRenderer.invoke('removeCoach', sessionId, coachId),

    generateExportCsv: (startDate: string, endDate: string) => ipcRenderer.invoke('generateExportCsv', startDate, endDate),

    // Admin PIN
    verifyAdminPin: (pin: string) => ipcRenderer.invoke('verifyAdminPin', pin),
    updateAdminPin: (currentPin: string, newPin: string) => ipcRenderer.invoke('updateAdminPin', currentPin, newPin)
};

contextBridge.exposeInMainWorld('api', api);

// Need to export an empty typescript module to satisfy compiler
export { };
