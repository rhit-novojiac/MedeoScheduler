import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { FencerMembership, FencerBilling } from '@preload/index';

// --- MEMBERSHIPS ---

export const useFencerMemberships = (fencerId: string) => {
    return useQuery({
        queryKey: ['fencer_memberships', fencerId],
        queryFn: async () => {
            if (!fencerId) return [];
            const { data, error } = await supabase
                .from('fencer_memberships')
                .select('*')
                .eq('fencer_id', fencerId)
                .order('start_date', { ascending: false });

            if (error) throw error;
            return (data || []) as FencerMembership[];
        },
        enabled: !!fencerId,
    });
};

export const useCreateMembership = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (membership: Omit<FencerMembership, 'id'>) => {
            const { data, error } = await supabase
                .from('fencer_memberships')
                .insert({
                    fencer_id: membership.fencer_id,
                    start_date: membership.start_date,
                    end_date: membership.end_date,
                    type: membership.type,
                })
                .select('id')
                .single();

            if (error) throw error;
            return data.id;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['fencer_memberships', variables.fencer_id] });
            // Also invalidate fencers query since active status depends on it
            queryClient.invalidateQueries({ queryKey: ['fencers'] });
        },
    });
};

export const useUpdateMembership = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (membership: FencerMembership) => {
            const { error } = await supabase
                .from('fencer_memberships')
                .update({
                    start_date: membership.start_date,
                    end_date: membership.end_date,
                    type: membership.type,
                })
                .eq('id', membership.id);

            if (error) throw error;
            return true;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['fencer_memberships', variables.fencer_id] });
            queryClient.invalidateQueries({ queryKey: ['fencers'] });
        },
    });
};

export const useDeleteMembership = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, fencerId }: { id: string; fencerId: string }) => {
            const { error } = await supabase
                .from('fencer_memberships')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['fencer_memberships', variables.fencerId] });
            queryClient.invalidateQueries({ queryKey: ['fencers'] });
        },
    });
};

// --- ATTENDANCE & BILLING ---

export interface FencerClassHistoryItem {
    classSessionId: string;
    className: string;
    date: string;
    startTime: string;
    durationMinutes: number;
    fraction: number;
    minutesMissed: number;
    classTypeId: string;
    classTypeName: string;
    memberPrice: number;
    nonMemberPrice: number;
    billingId: string | null;
}

export const useFencerClassHistory = (fencerId: string) => {
    return useQuery({
        queryKey: ['fencer_class_history', fencerId],
        queryFn: async () => {
            if (!fencerId) return [];

            // 1. Fetch attendee records
            const { data: attendeesData, error: attError } = await supabase
                .from('class_attendees')
                .select(`
                    class_session_id,
                    fraction,
                    minutes_missed,
                    class_sessions (
                        id,
                        name,
                        date,
                        start_time,
                        duration_minutes,
                        class_type_id,
                        class_types (
                            id,
                            name,
                            member_price,
                            non_member_price
                        ),
                        class_templates (
                            id,
                            name,
                            class_type_id,
                            class_types (
                                id,
                                name,
                                member_price,
                                non_member_price
                            )
                        )
                    )
                `)
                .eq('fencer_id', fencerId);

            if (attError) throw attError;

            // 2. Fetch billing items for this fencer to see what has been billed
            const { data: billedItems, error: billedError } = await supabase
                .from('billing_items')
                .select('class_session_id, billing_id')
                .eq('fencer_id', fencerId);

            if (billedError) throw billedError;

            const billingMap = new Map<string, string>();
            for (const item of billedItems || []) {
                billingMap.set(item.class_session_id, item.billing_id);
            }

            // 3. Map into clean UI items
            const history: FencerClassHistoryItem[] = [];
            for (const row of attendeesData || []) {
                const session = row.class_sessions as any;
                if (!session) continue;

                // Resolve class type
                const classType = session.class_types || session.class_templates?.class_types;
                const className = session.name || session.class_templates?.name || 'Fencing Class';

                history.push({
                    classSessionId: session.id,
                    className,
                    date: session.date,
                    startTime: session.start_time,
                    durationMinutes: session.duration_minutes,
                    fraction: row.fraction,
                    minutesMissed: row.minutes_missed || 0,
                    classTypeId: classType?.id || '',
                    classTypeName: classType?.name || 'Unknown Type',
                    memberPrice: Number(classType?.member_price || 0),
                    nonMemberPrice: Number(classType?.non_member_price || 0),
                    billingId: billingMap.get(session.id) || null,
                });
            }


            // Sort by date descending
            return history.sort((a, b) => b.date.localeCompare(a.date));
        },
        enabled: !!fencerId,
    });
};

export const useFencerBillings = (fencerId: string) => {
    return useQuery({
        queryKey: ['fencer_billings', fencerId],
        queryFn: async () => {
            if (!fencerId) return [];
            const { data, error } = await supabase
                .from('fencer_billings')
                .select('*')
                .eq('fencer_id', fencerId)
                .order('billing_date', { ascending: false });

            if (error) throw error;
            return (data || []) as FencerBilling[];
        },
        enabled: !!fencerId,
    });
};

export const useCreateBilling = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            fencerId,
            amount,
            status,
            billingDate,
            sessionIds,
        }: {
            fencerId: string;
            amount: number;
            status: 'PENDING' | 'PAID' | 'CANCELLED';
            billingDate: string;
            sessionIds: string[];
        }) => {
            // 1. Insert billing
            const { data: billing, error: bErr } = await supabase
                .from('fencer_billings')
                .insert({
                    fencer_id: fencerId,
                    amount,
                    status,
                    billing_date: billingDate,
                })
                .select('id')
                .single();

            if (bErr) throw bErr;

            // 2. Insert billing items
            if (sessionIds.length > 0) {
                const items = sessionIds.map((sessionId) => ({
                    billing_id: billing.id,
                    class_session_id: sessionId,
                    fencer_id: fencerId,
                }));

                const { error: itemsErr } = await supabase.from('billing_items').insert(items);
                if (itemsErr) throw itemsErr;
            }

            return billing.id;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['fencer_billings', variables.fencerId] });
            queryClient.invalidateQueries({ queryKey: ['fencer_class_history', variables.fencerId] });
        },
    });
};

export const useUpdateBillingStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            status,
        }: {
            id: string;
            status: 'PENDING' | 'PAID' | 'CANCELLED';
        }) => {
            const { data: billing, error } = await supabase
                .from('fencer_billings')
                .update({ status })
                .eq('id', id)
                .select('fencer_id')
                .single();

            if (error) throw error;
            return billing;
        },
        onSuccess: (data) => {
            if (data?.fencer_id) {
                queryClient.invalidateQueries({ queryKey: ['fencer_billings', data.fencer_id] });
            }
        },
    });
};

export const useDeleteBilling = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, fencerId }: { id: string; fencerId: string }) => {
            const { error } = await supabase
                .from('fencer_billings')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['fencer_billings', variables.fencerId] });
            queryClient.invalidateQueries({ queryKey: ['fencer_class_history', variables.fencerId] });
        },
    });
};
