import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useCoachesForSession = (sessionId: number | null) => {
    return useQuery({
        queryKey: ['coaches', sessionId],
        queryFn: async () => {
            if (!sessionId) return [];
            const result = await window.api.getCoachesForSession(sessionId);
            if (!result.success) throw new Error(result.error);
            return result.data || [];
        },
        enabled: !!sessionId,
    });
};

export const useAddCoach = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ sessionId, coachId }: { sessionId: number; coachId: number }) => {
            const result = await window.api.addCoach(sessionId, coachId);
            if (!result.success) throw new Error(result.error);
            return result.data;
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
        mutationFn: async ({ sessionId, coachId }: { sessionId: number; coachId: number }) => {
            const result = await window.api.removeCoach(sessionId, coachId);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['coaches', variables.sessionId] });
        },
        onError: (error) => {
            console.error('Failed to remove coach:', error);
        },
    });
};
