import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Fencer } from '@preload/index';
import { supabase } from '../lib/supabase';

export const useCoachesForSession = (sessionId: string | null) => {
    return useQuery({
        queryKey: ['coaches', sessionId],
        queryFn: async () => {
            if (!sessionId) return [];
            const { data, error } = await supabase
                .from('class_coaches')
                .select(`
                    fencers (*)
                `)
                .eq('class_session_id', sessionId);
            if (error) throw error;

            return (data || []).map((c: any) => c.fencers).filter(Boolean) as Fencer[];
        },
        enabled: !!sessionId,
    });
};

export const useAddCoach = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ sessionId, coachId }: { sessionId: string; coachId: string }) => {
            const { error } = await supabase
                .from('class_coaches')
                .insert({
                    class_session_id: sessionId,
                    coach_id: coachId
                });
            if (error) throw error;
            return true;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['coaches', variables.sessionId] });
        },
        onError: (error) => {
            console.error('Failed to add coach:', error);
        },
    });
};

export const useRemoveCoach = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ sessionId, coachId }: { sessionId: string; coachId: string }) => {
            const { error } = await supabase
                .from('class_coaches')
                .delete()
                .eq('class_session_id', sessionId)
                .eq('coach_id', coachId);
            if (error) throw error;
            return true;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['coaches', variables.sessionId] });
        },
        onError: (error) => {
            console.error('Failed to remove coach:', error);
        },
    });
};
