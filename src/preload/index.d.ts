export interface Fencer {
    id: string;
    first_name: string;
    last_name: string;
    sex: string | null;
    year_of_birth: number;
    usaf_id: number;
    last_membership_renewal: string | null;
    is_foil: boolean;
    is_epee: boolean;
    is_saber: boolean;
    coach_role: 'NONE' | 'TEMPORARY' | 'FULL';
    fraction?: number;
}

export interface ClassSession {
    id: string;
    template_id: string | null;
    class_type_id: string | null;
    name: string | null;
    date: string;
    start_time: string;
    duration_minutes: number;
    template_name?: string;
    template_description?: string;
    class_type_name?: string;
    attendee_count?: number;
    description?: string;
    weapon?: string | null;
}

export interface ClassType {
    id: string;
    name: string;
    member_price: number;
    non_member_price: number;
}

export interface ClassTemplate {
    id: string;
    class_type_id: string;
    name: string;
    description: string | null;
    day_of_week: number;
    start_time: string;
    duration_minutes: number;
    weapon?: string | null;
    class_type_name?: string;
}

export interface SpecialEvent {
    id: string;
    name: string;
    type: string;
    date: string;
    cancels_classes: boolean;
    is_annual: boolean;
    excluded_class_ids: string[] | null;
}

export interface PrivateLesson {
    id: string;
    coach_id: string;
    student_id: string;
    date: string;
    start_time: string;
    duration_minutes: number;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
}

declare global {
    interface Window {
        api: {
            // Admin PIN
            verifyAdminPin: (pin: string) => Promise<{ success: boolean; error?: string }>;
            updateAdminPin: (currentPin: string, newPin: string) => Promise<{ success: boolean; error?: string }>;

            // CSV File Export
            generateExportCsv: (content: string, defaultFilename: string) => Promise<{ success: boolean; error?: string }>;
        };
    }
}
