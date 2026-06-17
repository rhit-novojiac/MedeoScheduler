import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ClassType } from '@preload/index';
import { supabase } from '../lib/supabase';

export const useClassTypes = () => {
    return useQuery({
        queryKey: ['classTypes'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('class_types')
                .select('*')
                .order('name', { ascending: true });
            if (error) throw error;
            return (data || []) as ClassType[];
        },
    });
};

export const useCreateClassType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (classType: Omit<ClassType, 'id'>) => {
            const { data, error } = await supabase
                .from('class_types')
                .insert({
                    name: classType.name,
                    member_price: classType.member_price,
                    non_member_price: classType.non_member_price
                })
                .select('id')
                .single();
            if (error) throw error;
            return data.id;
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
            const { error } = await supabase
                .from('class_types')
                .update({
                    name: classType.name,
                    member_price: classType.member_price,
                    non_member_price: classType.non_member_price
                })
                .eq('id', classType.id);
            if (error) throw error;
            return true;
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
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('class_types')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classTypes'] });
        },
        onError: (error) => {
            console.error('Failed to delete class type:', error);
        },
    });
};
