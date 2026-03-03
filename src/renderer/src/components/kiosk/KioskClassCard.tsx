import React from 'react';
import { Clock, UserCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatTime } from '@/lib/utils';
import { useAttendeesForSession } from '../../hooks/useClassAttendees';
import type { ClassSession } from '@preload/index';

export const KioskClassCard = ({ session, onClick, expired }: { session: ClassSession; onClick: () => void; expired: boolean }) => {
    const { data: attendees } = useAttendeesForSession(session.id);

    if (expired) {
        // Compact / collapsed card for finished classes
        return (
            <Card
                className="cursor-pointer hover:border-primary/50 transition-all active:scale-[0.99] bg-card/40 backdrop-blur-sm border-border/40 opacity-60 hover:opacity-80"
                onClick={onClick}
            >
                <div className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="font-medium text-sm truncate">{session.template_name || session.name || 'Ad-Hoc Session'}</span>
                        <span className="text-xs text-muted-foreground shrink-0">{formatTime(session.start_time)} ({session.duration_minutes}m)</span>
                        {session.class_type_name && (
                            <Badge variant="outline" className="text-xs px-2 py-0 shrink-0">{session.class_type_name}</Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-muted-foreground text-sm">
                        <span className="flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5" />
                            {attendees?.length || 0}
                        </span>
                        <span className="text-xs text-primary/70">Sign In &rarr;</span>
                    </div>
                </div>
            </Card>
        );
    }

    // Full-size card for active/upcoming classes
    return (
        <Card
            className="cursor-pointer hover:border-primary hover:shadow-lg transition-all active:scale-[0.98] bg-card/80 backdrop-blur-sm"
            onClick={onClick}
        >
            <CardHeader className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-2xl">{session.template_name || session.name || 'Ad-Hoc Session'}</CardTitle>
                    {session.class_type_name && (
                        <Badge variant="secondary" className="text-sm px-3 py-1">{session.class_type_name}</Badge>
                    )}
                </div>
                <CardDescription className="flex items-center gap-2 text-lg font-medium">
                    <Clock className="w-5 h-5 text-primary" />
                    {formatTime(session.start_time)} ({session.duration_minutes}m)
                </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0 flex justify-between items-center text-muted-foreground">
                <span className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    {attendees?.length || 0} Signed In
                </span>
                <span className="text-primary font-semibold">Tap to Sign In &rarr;</span>
            </CardContent>
        </Card>
    );
};
