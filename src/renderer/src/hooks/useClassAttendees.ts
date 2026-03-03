import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useAttendeesForSession = (sessionId: number | null) => {
    return useQuery({
        queryKey: ['attendees', sessionId],
        queryFn: async () => {
            if (!sessionId) return [];
            const result = await window.api.getAttendeesForSession(sessionId);
            if (!result.success) throw new Error(result.error);
            return result.data || [];
        },
        enabled: !!sessionId,
    });
};

export const useAddAttendee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ sessionId, fencerId }: { sessionId: number; fencerId: number }) => {
            const result = await window.api.addAttendee(sessionId, fencerId);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['attendees', variables.sessionId] });
        },
        onError: (error) => {
            console.error('Failed to add attendee:', error);
        },
    });
};

export const useRemoveAttendee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ sessionId, fencerId }: { sessionId: number; fencerId: number }) => {
            const result = await window.api.removeAttendee(sessionId, fencerId);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['attendees', variables.sessionId] });
        },
        onError: (error) => {
            console.error('Failed to remove attendee:', error);
        },
    });
};
