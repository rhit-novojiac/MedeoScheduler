import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Fencer } from '@preload/index';
import { supabase } from '../lib/supabase';

export const useAttendeesForSession = (sessionId: string | null) => {
    return useQuery({
        queryKey: ['attendees', sessionId],
        queryFn: async () => {
            if (!sessionId) return [];
            const { data, error } = await supabase
                .from('class_attendees')
                .select(`
                    fraction,
                    fencers (*)
                `)
                .eq('class_session_id', sessionId);
            if (error) throw error;

            return (data || [])
                .map((att: any) => {
                    if (!att.fencers) return null;
                    return {
                        ...att.fencers,
                        fraction: att.fraction
                    };
                })
                .filter(Boolean) as Fencer[];
        },
        enabled: !!sessionId,
    });
};

export const useAddAttendee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ sessionId, fencerId, fraction }: { sessionId: string; fencerId: string; fraction?: number; date?: string }) => {
            const { error } = await supabase
                .from('class_attendees')
                .upsert({
                    class_session_id: sessionId,
                    fencer_id: fencerId,
                    fraction: fraction ?? 1.0
                }, { onConflict: 'class_session_id,fencer_id' });
            if (error) throw error;
            return true;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['attendees', variables.sessionId] });
            // Also refresh classSessions so attendee_count on kiosk cards is up-to-date
            if (variables.date) {
                queryClient.invalidateQueries({ queryKey: ['classSessions', variables.date] });
            }
        },
        onError: (error) => {
            console.error('Failed to add attendee:', error);
        },
    });
};

export const useRemoveAttendee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ sessionId, fencerId }: { sessionId: string; fencerId: string; date?: string }) => {
            const { error } = await supabase
                .from('class_attendees')
                .delete()
                .eq('class_session_id', sessionId)
                .eq('fencer_id', fencerId);
            if (error) throw error;
            return true;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['attendees', variables.sessionId] });
            if (variables.date) {
                queryClient.invalidateQueries({ queryKey: ['classSessions', variables.date] });
            }
        },
        onError: (error) => {
            console.error('Failed to remove attendee:', error);
        },
    });
};
