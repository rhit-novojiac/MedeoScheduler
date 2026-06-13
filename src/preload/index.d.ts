export interface Fencer {
    id: number;
    first_name: string;
    last_name: string;
    sex: string | null;
    year_of_birth: number;
    usaf_id: number;
    last_membership_renewal: string | null;
    is_foil: number;
    is_epee: number;
    is_saber: number;
    fraction?: number;
}

export interface ClassSession {
    id: number;
    template_id: number | null;
    class_type_id: number | null;
    name: string | null;
    date: string;
    start_time: string;
    duration_minutes: number;
    template_name?: string;
    template_description?: string;
    class_type_name?: string;
    attendee_count?: number;
    description?: string;
}

export interface ClassType {
    id: number;
    name: string;
    member_price: number;
    non_member_price: number;
}

export interface ClassTemplate {
    id: number;
    class_type_id: number;
    name: string;
    description: string | null;
    day_of_week: number;
    start_time: string;
    duration_minutes: number;
    class_type_name?: string; // Loaded via SQL JOIN
}

export interface SpecialEvent {
    id: number;
    name: string;
    type: string;
    date: string;
    cancels_classes: number;
    is_annual: number;
    excluded_class_ids: string | null;
}

declare global {
    interface Window {
        api: {
            getFencers: (page?: number, pageSize?: number) => Promise<{ success: boolean; data?: { items: Fencer[], total: number }; error?: string }>;
            createFencer: (fencer: Omit<Fencer, 'id'>) => Promise<{ success: boolean; data?: number; error?: string }>;
            updateFencer: (fencer: Fencer) => Promise<{ success: boolean; data?: boolean; error?: string }>;

            getClassTypes: () => Promise<{ success: boolean; data?: ClassType[]; error?: string }>;
            createClassType: (classType: Omit<ClassType, 'id'>) => Promise<{ success: boolean; data?: number; error?: string }>;
            updateClassType: (classType: ClassType) => Promise<{ success: boolean; data?: boolean; error?: string }>;
            deleteClassType: (id: number) => Promise<{ success: boolean; data?: boolean; error?: string }>;

            getClassTemplates: (page?: number, pageSize?: number) => Promise<{ success: boolean; data?: { items: ClassTemplate[], total: number }; error?: string }>;
            createClassTemplate: (template: Omit<ClassTemplate, 'id' | 'class_type_name'>) => Promise<{ success: boolean; data?: number; error?: string }>;
            updateClassTemplate: (template: Omit<ClassTemplate, 'class_type_name'>) => Promise<{ success: boolean; data?: boolean; error?: string }>;
            deleteClassTemplate: (id: number) => Promise<{ success: boolean; data?: boolean; error?: string }>;

            getOrCreateClassSessionsByDate: (date: string) => Promise<{ success: boolean; data?: ClassSession[]; error?: string }>;
            createClassSession: (session: Omit<ClassSession, 'id' | 'template_name' | 'description' | 'class_type_name'>) => Promise<{ success: boolean; data?: number; error?: string }>;
            updateClassSession: (session: Pick<ClassSession, 'id' | 'name' | 'class_type_id' | 'start_time' | 'duration_minutes'>) => Promise<{ success: boolean; data?: boolean; error?: string }>;
            deleteClassSession: (id: number) => Promise<{ success: boolean; data?: boolean; error?: string }>;
            getAttendeesForSession: (sessionId: number) => Promise<{ success: boolean; data?: Fencer[]; error?: string }>;
            addAttendee: (sessionId: number, fencerId: number, fraction?: number) => Promise<{ success: boolean; data?: boolean; error?: string }>;
            removeAttendee: (sessionId: number, fencerId: number) => Promise<{ success: boolean; data?: boolean; error?: string }>;

            getCoachesForSession: (sessionId: number) => Promise<{ success: boolean; data?: Fencer[]; error?: string }>;
            addCoach: (sessionId: number, coachId: number) => Promise<{ success: boolean; data?: boolean; error?: string }>;
            removeCoach: (sessionId: number, coachId: number) => Promise<{ success: boolean; data?: boolean; error?: string }>;

            generateExportCsv: (startDate: string, endDate: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;

            // Admin PIN
            verifyAdminPin: (pin: string) => Promise<{ success: boolean; error?: string }>;
            updateAdminPin: (currentPin: string, newPin: string) => Promise<{ success: boolean; error?: string }>;

            // Special Events
            getSpecialEventsByDate: (date: string) => Promise<{ success: boolean; data?: SpecialEvent[]; error?: string }>;
            createSpecialEvent: (event: Omit<SpecialEvent, 'id'>) => Promise<{ success: boolean; data?: number; error?: string }>;
            updateSpecialEvent: (event: SpecialEvent) => Promise<{ success: boolean; data?: boolean; error?: string }>;
            deleteSpecialEvent: (id: number) => Promise<{ success: boolean; data?: boolean; error?: string }>;
        };
    }
}
