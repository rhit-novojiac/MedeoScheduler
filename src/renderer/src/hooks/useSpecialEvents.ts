import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SpecialEvent } from '@preload/index';
import { supabase } from '../lib/supabase';

export const useSpecialEventsByDate = (date: string) => {
    return useQuery({
        queryKey: ['specialEvents', date],
        queryFn: async () => {
            if (!date) return [];
            const { data, error } = await supabase
                .from('special_events')
                .select('*')
                .or(`date.eq.${date},is_annual.eq.true`);
            if (error) throw error;

            return (data || []).filter(e => {
                if (e.date === date) return true;
                if (e.is_annual) {
                    const eMd = e.date.substring(5); // "MM-DD"
                    const targetMd = date.substring(5); // "MM-DD"
                    return eMd === targetMd;
                }
                return false;
            }) as SpecialEvent[];
        },
        enabled: !!date,
    });
};

export const useCreateSpecialEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (event: Omit<SpecialEvent, 'id'>) => {
            const { data, error } = await supabase
                .from('special_events')
                .insert({
                    name: event.name,
                    type: event.type,
                    date: event.date,
                    cancels_classes: event.cancels_classes,
                    is_annual: event.is_annual,
                    excluded_class_ids: event.excluded_class_ids
                })
                .select('id')
                .single();
            if (error) throw error;
            return data.id;
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
            const { error } = await supabase
                .from('special_events')
                .update({
                    name: event.name,
                    type: event.type,
                    date: event.date,
                    cancels_classes: event.cancels_classes,
                    is_annual: event.is_annual,
                    excluded_class_ids: event.excluded_class_ids
                })
                .eq('id', event.id);
            if (error) throw error;
            return true;
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
        mutationFn: async ({ id }: { id: string; date: string }) => {
            const { error } = await supabase
                .from('special_events')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return true;
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
