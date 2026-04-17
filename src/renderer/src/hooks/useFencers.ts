import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Fencer } from '@preload/index';

export const useFencers = (page?: number, pageSize?: number) => {
    return useQuery({
        queryKey: ['fencers', page, pageSize],
        queryFn: async () => {
            const result = await window.api.getFencers(page, pageSize);
            if (!result.success) throw new Error(result.error);
            return result.data || { items: [], total: 0 };
        },
    });
};

export const useCreateFencer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (fencer: Omit<Fencer, 'id'>) => {
            const result = await window.api.createFencer(fencer);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fencers'] });
        },
        onError: (error) => {
            console.error('Failed to create fencer:', error);
        },
    });
};

export const useUpdateFencer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (fencer: Fencer) => {
            const result = await window.api.updateFencer(fencer);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fencers'] });
        },
        onError: (error) => {
            console.error('Failed to update fencer:', error);
        },
    });
};

