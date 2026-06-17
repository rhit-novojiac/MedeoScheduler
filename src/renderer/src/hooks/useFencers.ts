import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Fencer } from '@preload/index';
import { supabase } from '../lib/supabase';

export const useFencers = (page?: number, pageSize?: number) => {
    return useQuery({
        queryKey: ['fencers', page, pageSize],
        queryFn: async () => {
            let query = supabase
                .from('fencers')
                .select('*', { count: 'exact' })
                .order('last_name', { ascending: true })
                .order('first_name', { ascending: true });

            if (page !== undefined && pageSize !== undefined) {
                const offset = (page - 1) * pageSize;
                query = query.range(offset, offset + pageSize - 1);
            }

            const { data, count, error } = await query;
            if (error) throw error;
            return { items: (data || []) as Fencer[], total: count || 0 };
        },
    });
};

export const useCreateFencer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (fencer: Omit<Fencer, 'id'>) => {
            const { data, error } = await supabase
                .from('fencers')
                .insert({
                    first_name: fencer.first_name,
                    last_name: fencer.last_name,
                    sex: fencer.sex,
                    year_of_birth: fencer.year_of_birth,
                    usaf_id: fencer.usaf_id,
                    last_membership_renewal: fencer.last_membership_renewal,
                    is_foil: fencer.is_foil,
                    is_epee: fencer.is_epee,
                    is_saber: fencer.is_saber
                })
                .select('id')
                .single();
            if (error) throw error;
            return data.id;
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
            const { error } = await supabase
                .from('fencers')
                .update({
                    first_name: fencer.first_name,
                    last_name: fencer.last_name,
                    sex: fencer.sex,
                    year_of_birth: fencer.year_of_birth,
                    usaf_id: fencer.usaf_id,
                    last_membership_renewal: fencer.last_membership_renewal,
                    is_foil: fencer.is_foil,
                    is_epee: fencer.is_epee,
                    is_saber: fencer.is_saber
                })
                .eq('id', fencer.id);
            if (error) throw error;
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fencers'] });
        },
        onError: (error) => {
            console.error('Failed to update fencer:', error);
        },
    });
};
