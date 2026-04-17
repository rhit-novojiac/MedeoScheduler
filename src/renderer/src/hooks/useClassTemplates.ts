import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ClassTemplate } from '@preload/index';

export const useClassTemplates = (page?: number, pageSize?: number) => {
    return useQuery({
        queryKey: ['classTemplates', page, pageSize],
        queryFn: async () => {
            const result = await window.api.getClassTemplates(page, pageSize);
            if (!result.success) throw new Error(result.error);
            return result.data || { items: [], total: 0 };
        },
    });
};

export const useCreateClassTemplate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (template: Omit<ClassTemplate, 'id' | 'class_type_name'>) => {
            const result = await window.api.createClassTemplate(template);
            if (!result.success) throw new Error(result.error);
            return result.data;
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
            const result = await window.api.updateClassTemplate(template);
            if (!result.success) throw new Error(result.error);
            return result.data;
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
        mutationFn: async (id: number) => {
            const result = await window.api.deleteClassTemplate(id);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classTemplates'] });
        },
        onError: (error) => {
            console.error('Failed to delete template:', error);
        },
    });
};
