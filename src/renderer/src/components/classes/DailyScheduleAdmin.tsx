import React, { useState } from 'react';
import { useClassSessionsByDate } from '../../hooks/useClassSessions';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Users, Clock, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AttendanceSheet } from './AttendanceSheet';
import { AddSessionDialog } from './AddSessionDialog';
import { useDeleteClassSession } from '../../hooks/useClassSessions';
import { formatTime } from '@/lib/utils';
import type { ClassSession } from '@preload/index';

const SessionCard = ({ session, date, onClick }: { session: ClassSession; date: string; onClick: () => void }) => {
    const deleteSession = useDeleteClassSession();

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(`Delete "${session.template_name || 'this session'}"? This will also remove all attendance records.`)) {
            await deleteSession.mutateAsync({ id: session.id, date });
        }
    };

    return (
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={onClick}>
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{session.template_name || 'Ad-Hoc Session'}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(session.start_time)} ({session.duration_minutes}m)
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {session.class_type_name && (
                            <Badge variant="secondary">{session.class_type_name}</Badge>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={handleDelete}
                            disabled={deleteSession.isPending}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <Users className="w-4 h-4" />
                    <span>{session.attendee_count || 0} Attendees</span>
                </div>
            </CardContent>
        </Card>
    );
};

export const DailyScheduleAdmin = () => {
    const [date, setDate] = useState<Date>(new Date());
    const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [addSessionOpen, setAddSessionOpen] = useState(false);

    // YYYY-MM-DD
    const formattedDate = format(date, 'yyyy-MM-dd');
    const { data: sessions, isLoading, isError } = useClassSessionsByDate(formattedDate);

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
                    <Button onClick={() => setAddSessionOpen(true)}><Plus className="w-4 h-4 mr-2" /> Ad-Hoc Session</Button>
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

                {/* Right: Classes for the day */}
                <div className="flex flex-col space-y-4 overflow-y-auto pr-2 pb-10">
                    <h3 className="text-xl font-semibold flex items-center gap-2 sticky top-0 bg-background/95 backdrop-blur py-2 z-10">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                        {format(date, 'EEEE, MMMM do, yyyy')}
                    </h3>

                    {isLoading ? (
                        <div className="flex items-center justify-center p-12">
                            <span className="animate-pulse text-muted-foreground">Loading schedule...</span>
                        </div>
                    ) : isError ? (
                        <div className="p-4 text-destructive border-destructive/20 border rounded-lg bg-destructive/10">
                            Failed to load schedule for this date.
                        </div>
                    ) : !sessions || sessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl border-dashed bg-muted/10">
                            <Clock className="w-8 h-8 text-muted-foreground mb-3" />
                            <p className="text-muted-foreground font-medium">No sessions scheduled for this day.</p>
                            <p className="text-xs text-muted-foreground mt-1">Class templates mapped to this day of the week will appear here automatically.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                            {sessions.map(session => (
                                <SessionCard
                                    key={session.id}
                                    session={session}
                                    date={formattedDate}
                                    onClick={() => handleSessionClick(session)}
                                />
                            ))}
                        </div>
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
        </div>
    );
};
