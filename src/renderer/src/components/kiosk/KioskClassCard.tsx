import React from 'react';
import { Clock, UserCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatTime } from '@/lib/utils';
import type { ClassSession } from '@preload/index';

const getWeaponBadge = (weapon?: string | null) => {
    if (!weapon) return null;
    const w = weapon.toLowerCase();
    let bg = '';
    let text = '';
    let label = '';
    
    if (w === 'foil') {
        bg = 'bg-blue-100 dark:bg-blue-900/30';
        text = 'text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
        label = 'Foil';
    } else if (w === 'epee') {
        bg = 'bg-green-100 dark:bg-green-900/30';
        text = 'text-green-800 dark:text-green-300 border-green-200 dark:border-green-800';
        label = 'Epee';
    } else if (w === 'saber' || w === 'sabre') {
        bg = 'bg-amber-100 dark:bg-amber-900/30';
        text = 'text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
        label = 'Saber';
    } else if (w === 'all' || w === 'all-weapon') {
        bg = 'bg-slate-100 dark:bg-slate-800/50';
        text = 'text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
        label = 'All-Weapon';
    } else {
        return null;
    }
    
    return (
        <Badge variant="outline" className={`${bg} ${text} font-semibold px-2 py-0.5 shrink-0`}>
            {label}
        </Badge>
    );
};

const KioskClassCardComponent = ({ session, onClick, expired }: { session: ClassSession; onClick: () => void; expired: boolean }) => {
    const count = session.attendee_count ?? 0;

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
                        {getWeaponBadge(session.weapon)}
                        {session.class_type_name && (
                            <Badge variant="outline" className="text-xs px-2 py-0 shrink-0">{session.class_type_name}</Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-muted-foreground text-sm">
                        <span className="flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5" />
                            {count}
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
                <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                    <div className="flex flex-col gap-1 min-w-0">
                        <CardTitle className="text-2xl">{session.template_name || session.name || 'Ad-Hoc Session'}</CardTitle>
                        <div className="flex gap-2 mt-0.5">
                            {getWeaponBadge(session.weapon)}
                        </div>
                    </div>
                    {session.class_type_name && (
                        <Badge variant="secondary" className="text-sm px-3 py-1 shrink-0">{session.class_type_name}</Badge>
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
                    {count} Signed In
                </span>
                <span className="text-primary font-semibold">Tap to Sign In &rarr;</span>
            </CardContent>
        </Card>
    );
};

export const KioskClassCard = React.memo(KioskClassCardComponent);
