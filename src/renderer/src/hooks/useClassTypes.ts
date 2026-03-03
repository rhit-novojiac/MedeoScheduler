import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ClassType } from '@preload/index';

export const useClassTypes = () => {
    return useQuery({
        queryKey: ['classTypes'],
        queryFn: async () => {
            const result = await window.api.getClassTypes();
            if (!result.success) throw new Error(result.error);
            return result.data || [];
        },
    });
};

export const useCreateClassType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (classType: Omit<ClassType, 'id'>) => {
            const result = await window.api.createClassType(classType);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classTypes'] });
        },
        onError: (error) => {
            console.error('Failed to create class type:', error);
        },
    });
};

export const useUpdateClassType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (classType: ClassType) => {
            const result = await window.api.updateClassType(classType);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classTypes'] });
        },
        onError: (error) => {
            console.error('Failed to update class type:', error);
        },
    });
};

export const useDeleteClassType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const result = await window.api.deleteClassType(id);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classTypes'] });
        },
        onError: (error) => {
            console.error('Failed to delete class type:', error);
        },
    });
};
