import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ClassSession } from '@preload/index';
import { supabase } from '../lib/supabase';

export const useClassSessionsByDate = (date: string) => {
    return useQuery({
        queryKey: ['classSessions', date],
        queryFn: async () => {
            if (!date) return [];

            // 1. Check for special events today that cancel classes
            const { data: events, error: eventErr } = await supabase
                .from('special_events')
                .select('*')
                .or(`date.eq.${date},is_annual.eq.true`);
            if (eventErr) throw eventErr;

            const cancelsEvent = (events || []).find(e => {
                if (e.date === date) return e.cancels_classes;
                if (e.is_annual) {
                    const eMd = e.date.substring(5); // "MM-DD"
                    const targetMd = date.substring(5); // "MM-DD"
                    return eMd === targetMd && e.cancels_classes;
                }
                return false;
            });

            // 2. Parse dayOfWeek to check templates
            const [year, month, day] = date.split('-').map(Number);
            const dayOfWeek = new Date(year, month - 1, day).getDay();

            if (!cancelsEvent) {
                // Normal day: Fetch templates for this day of the week
                const { data: templates, error: templatesErr } = await supabase
                    .from('class_templates')
                    .select('*')
                    .eq('day_of_week', dayOfWeek);
                if (templatesErr) throw templatesErr;

                // Fetch existing sessions for this date
                const { data: existingSessions, error: sessionsErr } = await supabase
                    .from('class_sessions')
                    .select('template_id')
                    .eq('date', date);
                if (sessionsErr) throw sessionsErr;

                // Filter templates to find the ones that do not have a session today
                const missingTemplates = (templates || []).filter(t =>
                    !(existingSessions || []).some(s => s.template_id === t.id)
                );

                // Auto-instantiate missing templates
                if (missingTemplates.length > 0) {
                    const inserts = missingTemplates.map(t => ({
                        template_id: t.id,
                        class_type_id: t.class_type_id,
                        name: t.name,
                        date: date,
                        start_time: t.start_time,
                        duration_minutes: t.duration_minutes,
                        weapon: t.weapon
                    }));

                    const { error: insertErr } = await supabase
                        .from('class_sessions')
                        .insert(inserts);
                    if (insertErr) throw insertErr;
                }
            }

            // 3. Fetch all sessions for today with relational joins
            const { data: sessions, error: fetchErr } = await supabase
                .from('class_sessions')
                .select(`
                    id,
                    template_id,
                    class_type_id,
                    name,
                    date,
                    start_time,
                    duration_minutes,
                    weapon,
                    class_templates (
                        name,
                        description,
                        weapon,
                        class_types (
                            name
                        )
                    ),
                    class_types (
                        name
                    ),
                    class_attendees (
                        fencer_id
                    )
                `)
                .eq('date', date)
                .order('start_time', { ascending: true });
            if (fetchErr) throw fetchErr;

            let formattedSessions = (sessions || []).map((s: any) => {
                const template = s.class_templates;
                const ctDirect = s.class_types;
                const ctTemplate = template?.class_types;

                return {
                    id: s.id,
                    template_id: s.template_id,
                    class_type_id: s.class_type_id,
                    name: s.name,
                    date: s.date,
                    start_time: s.start_time,
                    duration_minutes: s.duration_minutes,
                    weapon: s.weapon || template?.weapon,
                    template_name: template?.name || null,
                    description: template?.description || null,
                    class_type_name: ctDirect?.name || ctTemplate?.name || null,
                    attendee_count: s.class_attendees ? s.class_attendees.length : 0
                } as ClassSession;
            });

            // 4. If classes are cancelled, only keep excluded sessions
            if (cancelsEvent) {
                const excludedIds = cancelsEvent.excluded_class_ids || [];
                formattedSessions = formattedSessions.filter(s => excludedIds.includes(s.id));
            }

            return formattedSessions;
        },
        enabled: !!date,
    });
};

export const useCreateClassSession = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (session: Omit<ClassSession, 'id' | 'template_name' | 'description' | 'class_type_name'>) => {
            const { data, error } = await supabase
                .from('class_sessions')
                .insert({
                    template_id: session.template_id,
                    class_type_id: session.class_type_id,
                    name: session.name,
                    date: session.date,
                    start_time: session.start_time,
                    duration_minutes: session.duration_minutes,
                    weapon: session.weapon
                })
                .select('id')
                .single();
            if (error) throw error;
            return data.id;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['classSessions', variables.date] });
        },
        onError: (error) => {
            console.error('Failed to create session:', error);
        },
    });
};

export const useDeleteClassSession = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id }: { id: string; date: string }) => {
            const { error } = await supabase
                .from('class_sessions')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return true;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['classSessions', variables.date] });
        },
        onError: (error) => {
            console.error('Failed to delete session:', error);
        },
    });
};

export const useUpdateClassSession = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            session,
        }: {
            session: Pick<ClassSession, 'id' | 'name' | 'class_type_id' | 'start_time' | 'duration_minutes' | 'weapon'>;
            date: string;
        }) => {
            const { error } = await supabase
                .from('class_sessions')
                .update({
                    name: session.name,
                    class_type_id: session.class_type_id,
                    start_time: session.start_time,
                    duration_minutes: session.duration_minutes,
                    weapon: session.weapon
                })
                .eq('id', session.id);
            if (error) throw error;
            return true;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['classSessions', variables.date] });
        },
        onError: (error) => {
            console.error('Failed to update session:', error);
        },
    });
};
