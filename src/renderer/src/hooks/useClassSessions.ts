import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ClassSession } from '@preload/index';

export const useClassSessionsByDate = (date: string) => {
    return useQuery({
        queryKey: ['classSessions', date],
        queryFn: async () => {
            const result = await window.api.getOrCreateClassSessionsByDate(date);
            if (!result.success) throw new Error(result.error);
            return result.data || [];
        },
        enabled: !!date, // Only run if a date is provided
    });
};

export const useCreateClassSession = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (session: Omit<ClassSession, 'id' | 'template_name' | 'description' | 'class_type_name'>) => {
            const result = await window.api.createClassSession(session);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['classSessions', variables.date] });
        },
        onError: (error) => {
            console.error('Failed to create session:', error);
        },
    });
};

export const useDeleteClassSession = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id }: { id: number; date: string }) => {
            const result = await window.api.deleteClassSession(id);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['classSessions', variables.date] });
        },
        onError: (error) => {
            console.error('Failed to delete session:', error);
        },
    });
};
