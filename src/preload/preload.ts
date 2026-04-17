import { contextBridge, ipcRenderer } from 'electron';
import type { Fencer, ClassType, ClassTemplate, ClassSession } from './index.d';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const api = {
    getFencers: () => ipcRenderer.invoke('getFencers'),
    createFencer: (fencer: Omit<Fencer, 'id'>) => ipcRenderer.invoke('createFencer', fencer),
    updateFencer: (fencer: Fencer) => ipcRenderer.invoke('updateFencer', fencer),

    getClassTypes: () => ipcRenderer.invoke('getClassTypes'),
    createClassType: (classType: Omit<ClassType, 'id'>) => ipcRenderer.invoke('createClassType', classType),
    updateClassType: (classType: ClassType) => ipcRenderer.invoke('updateClassType', classType),
    deleteClassType: (id: number) => ipcRenderer.invoke('deleteClassType', id),

    getClassTemplates: () => ipcRenderer.invoke('getClassTemplates'),
    createClassTemplate: (template: Omit<ClassTemplate, 'id' | 'class_type_name'>) => ipcRenderer.invoke('createClassTemplate', template),
    updateClassTemplate: (template: Omit<ClassTemplate, 'class_type_name'>) => ipcRenderer.invoke('updateClassTemplate', template),
    deleteClassTemplate: (id: number) => ipcRenderer.invoke('deleteClassTemplate', id),

    getOrCreateClassSessionsByDate: (date: string) => ipcRenderer.invoke('getOrCreateClassSessionsByDate', date),
    createClassSession: (session: Omit<ClassSession, 'id' | 'template_name' | 'description' | 'class_type_name'>) => ipcRenderer.invoke('createClassSession', session),
    updateClassSession: (session: Pick<ClassSession, 'id' | 'name' | 'class_type_id' | 'start_time' | 'duration_minutes'>) => ipcRenderer.invoke('updateClassSession', session),
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
