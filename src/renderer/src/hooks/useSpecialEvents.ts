import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SpecialEvent } from '@preload/index';

export const useSpecialEventsByDate = (date: string) => {
    return useQuery({
        queryKey: ['specialEvents', date],
        queryFn: async () => {
            const result = await window.api.getSpecialEventsByDate(date);
            if (!result.success) throw new Error(result.error);
            return result.data || [];
        },
        enabled: !!date,
    });
};

export const useCreateSpecialEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (event: Omit<SpecialEvent, 'id'>) => {
            const result = await window.api.createSpecialEvent(event);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['specialEvents'] });
            queryClient.invalidateQueries({ queryKey: ['classSessions', variables.date] });
        },
        onError: (error) => {
            console.error('Failed to create special event:', error);
        },
    });
};

export const useUpdateSpecialEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (event: SpecialEvent) => {
            const result = await window.api.updateSpecialEvent(event);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['specialEvents'] });
            queryClient.invalidateQueries({ queryKey: ['classSessions', variables.date] });
        },
        onError: (error) => {
            console.error('Failed to update special event:', error);
        },
    });
};

export const useDeleteSpecialEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id }: { id: number; date: string }) => {
            const result = await window.api.deleteSpecialEvent(id);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['specialEvents'] });
            queryClient.invalidateQueries({ queryKey: ['classSessions', variables.date] });
        },
        onError: (error) => {
            console.error('Failed to delete special event:', error);
        },
    });
};
