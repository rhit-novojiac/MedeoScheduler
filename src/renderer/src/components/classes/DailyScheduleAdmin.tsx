import React, { useState } from 'react';
import { useClassSessionsByDate, useDeleteClassSession, useUpdateClassSession } from '../../hooks/useClassSessions';
import { useSpecialEventsByDate, useDeleteSpecialEvent } from '../../hooks/useSpecialEvents';
import { useClassTypes } from '../../hooks/useClassTypes';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AttendanceSheet } from './AttendanceSheet';
import { AddSessionDialog } from './AddSessionDialog';
import { AddEventDialog } from './AddEventDialog';
import type { ClassSession } from '@preload/index';
import { SessionCard } from './SessionCard';

// ---------------------------------------------------------------------------
// DailyScheduleAdmin
// ---------------------------------------------------------------------------

export const DailyScheduleAdmin = () => {
    const [date, setDate] = useState<Date>(new Date());
    const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [addSessionOpen, setAddSessionOpen] = useState(false);

    const deleteSession = useDeleteClassSession();
    const updateSession = useUpdateClassSession();
    const { data: classTypes } = useClassTypes();

    const formattedDate = format(date, 'yyyy-MM-dd');
    const { data: sessions, isLoading, isError } = useClassSessionsByDate(formattedDate);
    const { data: specialEvents } = useSpecialEventsByDate(formattedDate);
    const { mutateAsync: deleteEvent } = useDeleteSpecialEvent();

    const [addEventOpen, setAddEventOpen] = useState(false);

    const handleSessionClick = (session: ClassSession) => {
        setSelectedSession(session);
        setSheetOpen(true);
    };

    return (
        <div className="p-6 space-y-6 flex flex-col h-[calc(100vh-2rem)]">
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Daily Schedule</h2>
                    <p className="text-muted-foreground">Manage classes and attendance for specific days.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setDate(new Date())}>Today</Button>
                    <Button variant="secondary" onClick={() => setAddEventOpen(true)}>
                        <CalendarIcon className="w-4 h-4 mr-2" /> Add Event
                    </Button>
                    <Button onClick={() => setAddSessionOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Ad-Hoc Session
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 flex-1 min-h-0">

                {/* Left: Calendar Picker */}
                <div className="space-y-4 max-w-sm">
                    <Card>
                        <CardContent className="p-3">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(d: Date | undefined) => d && setDate(d)}
                                className="rounded-md border-0"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Sessions for the selected day */}
                <div className="flex flex-col space-y-4 overflow-y-auto pr-2 pb-10">
                    <h3 className="text-xl font-semibold flex items-center gap-2 sticky top-0 bg-background/95 backdrop-blur py-2 z-10">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                        {format(date, 'EEEE, MMMM do, yyyy')}
                    </h3>

                    {isLoading ? (
                        <div className="flex items-center justify-center p-12">
                            <span className="animate-pulse text-muted-foreground">Loading schedule…</span>
                        </div>
                    ) : isError ? (
                        <div className="p-4 text-destructive border-destructive/20 border rounded-lg bg-destructive/10">
                            Failed to load schedule for this date.
                        </div>
                    ) : (
                        <>
                            {specialEvents && specialEvents.length > 0 && (
                                <div className="flex flex-col gap-2 mb-4">
                                    {specialEvents.map(event => (
                                        <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border bg-secondary/20 shadow-sm border-secondary">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={event.type === 'holiday' ? 'destructive' : 'default'} className="capitalize">{event.type}</Badge>
                                                    <span className="font-bold">{event.name}</span>
                                                    {event.is_annual === 1 && <Badge variant="outline" className="text-[10px] h-5">Annual</Badge>}
                                                </div>
                                                {event.cancels_classes === 1 && (
                                                    <p className="text-xs text-muted-foreground mt-1 text-destructive/80 font-medium">
                                                        Cancels Regular Classes
                                                        {event.excluded_class_ids && ' (except selected)'}
                                                    </p>
                                                )}
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => deleteEvent({ id: event.id, date: formattedDate })} className="text-muted-foreground hover:text-destructive">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!sessions || sessions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl border-dashed bg-muted/10">
                                    <Clock className="w-8 h-8 text-muted-foreground mb-3" />
                                    <p className="text-muted-foreground font-medium">No sessions scheduled for this day.</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Class templates mapped to this day of the week will appear here automatically.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                                    {sessions.map(session => (
                                        <SessionCard
                                            key={session.id}
                                            session={session}
                                            date={formattedDate}
                                            classTypes={classTypes}
                                            onClick={() => handleSessionClick(session)}
                                            onDelete={deleteSession.mutateAsync}
                                            onUpdate={updateSession.mutateAsync}
                                            isDeleting={deleteSession.isPending}
                                            isUpdating={updateSession.isPending}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <AttendanceSheet
                session={selectedSession}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
            />
            <AddSessionDialog
                open={addSessionOpen}
                onOpenChange={setAddSessionOpen}
                date={date}
            />
            <AddEventDialog
                open={addEventOpen}
                onOpenChange={setAddEventOpen}
                date={date}
            />
        </div>
    );
};
