import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ClassTemplate } from '@preload/index';
import { supabase } from '../lib/supabase';

export const useClassTemplates = (page?: number, pageSize?: number) => {
    return useQuery({
        queryKey: ['classTemplates', page, pageSize],
        queryFn: async () => {
            let query = supabase
                .from('class_templates')
                .select('*, class_types(name)', { count: 'exact' })
                .order('day_of_week', { ascending: true })
                .order('start_time', { ascending: true });

            if (page !== undefined && pageSize !== undefined) {
                const offset = (page - 1) * pageSize;
                query = query.range(offset, offset + pageSize - 1);
            }

            const { data, count, error } = await query;
            if (error) throw error;

            const items = (data || []).map((t: any) => ({
                id: t.id,
                class_type_id: t.class_type_id,
                name: t.name,
                description: t.description,
                day_of_week: t.day_of_week,
                start_time: t.start_time,
                duration_minutes: t.duration_minutes,
                weapon: t.weapon,
                class_type_name: t.class_types?.name
            })) as ClassTemplate[];

            return { items, total: count || 0 };
        },
    });
};

export const useCreateClassTemplate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (template: Omit<ClassTemplate, 'id' | 'class_type_name'>) => {
            const { data, error } = await supabase
                .from('class_templates')
                .insert({
                    class_type_id: template.class_type_id,
                    name: template.name,
                    description: template.description,
                    day_of_week: template.day_of_week,
                    start_time: template.start_time,
                    duration_minutes: template.duration_minutes,
                    weapon: template.weapon
                })
                .select('id')
                .single();
            if (error) throw error;
            return data.id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classTemplates'] });
        },
        onError: (error) => {
            console.error('Failed to create template:', error);
        },
    });
};

export const useUpdateClassTemplate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (template: Omit<ClassTemplate, 'class_type_name'>) => {
            const { error } = await supabase
                .from('class_templates')
                .update({
                    class_type_id: template.class_type_id,
                    name: template.name,
                    description: template.description,
                    day_of_week: template.day_of_week,
                    start_time: template.start_time,
                    duration_minutes: template.duration_minutes,
                    weapon: template.weapon
                })
                .eq('id', template.id);
            if (error) throw error;
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classTemplates'] });
        },
        onError: (error) => {
            console.error('Failed to update template:', error);
        },
    });
};

export const useDeleteClassTemplate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('class_templates')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classTemplates'] });
        },
        onError: (error) => {
            console.error('Failed to delete template:', error);
        },
    });
};
