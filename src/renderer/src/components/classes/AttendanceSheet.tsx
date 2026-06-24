import React, { useState } from 'react';
import { useAttendeesForSession, useAddAttendee, useRemoveAttendee } from '../../hooks/useClassAttendees';
import { useCoachesForSession, useAddCoach, useRemoveCoach } from '../../hooks/useCoaches';
import { useFencers } from '../../hooks/useFencers';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, X, User, GraduationCap } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn, formatTime } from '@/lib/utils';
import type { ClassSession, Fencer } from '@preload/index';

interface AttendanceSheetProps {
    session: ClassSession | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

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
        <Badge variant="outline" className={`${bg} ${text} font-semibold px-2 py-0.5`}>
            {label}
        </Badge>
    );
};

const isOpenBouting = (sessionName?: string | null, templateName?: string | null): boolean => {
    const name = (sessionName || templateName || '').toLowerCase();
    return name.includes('open fencing') || name.includes('open bouting');
};

export const AttendanceSheet = ({ session, open, onOpenChange }: AttendanceSheetProps) => {
    const { data: attendees, isLoading: loadingAttendees } = useAttendeesForSession(session?.id || null);
    const { data: coaches, isLoading: loadingCoaches } = useCoachesForSession(session?.id || null);
    const { data: fencers } = useFencers();
    const addAttendee = useAddAttendee();
    const removeAttendee = useRemoveAttendee();
    const addCoach = useAddCoach();
    const removeCoach = useRemoveCoach();

    const [comboboxOpen, setComboboxOpen] = useState(false);
    const [coachComboboxOpen, setCoachComboboxOpen] = useState(false);

    if (!session) return null;

    // Filter out fencers who are already in the session as attendees
    const availableFencers = (fencers?.items || []).filter((f: Fencer) => !attendees?.some(a => a.id === f.id));
    // Filter out fencers who are already coaches for this session, and only show those who have a coach role
    const availableCoaches = (fencers?.items || []).filter((f: Fencer) => f.coach_role !== 'NONE' && !coaches?.some(c => c.id === f.id));

    const handleAdd = async (fencerId: string) => {
        if (!session.id) return;
        await addAttendee.mutateAsync({ sessionId: session.id, fencerId, date: session.date });
        setComboboxOpen(false);
    };

    const handleRemove = async (fencerId: string) => {
        if (!session.id) return;
        await removeAttendee.mutateAsync({ sessionId: session.id, fencerId, date: session.date });
    };

    const handleAddCoach = async (coachId: string) => {
        if (!session.id) return;
        await addCoach.mutateAsync({ sessionId: session.id, coachId });
        setCoachComboboxOpen(false);
    };

    const handleRemoveCoach = async (coachId: string) => {
        if (!session.id) return;
        await removeCoach.mutateAsync({ sessionId: session.id, coachId });
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col pt-10 px-6">
                <SheetHeader className="pb-6 border-b shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <SheetTitle className="text-2xl">{session.template_name || session.name || 'Ad-Hoc Session'}</SheetTitle>
                            <div className="flex gap-2 mt-1.5">
                                {getWeaponBadge(session.weapon)}
                            </div>
                        </div>
                    </div>
                    <SheetDescription className="text-base flex flex-col gap-1 mt-2">
                        <span>{formatTime(session.start_time)} ({session.duration_minutes} min)</span>
                        {session.class_type_name && <span className="text-primary font-medium">{session.class_type_name}</span>}
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-hidden flex flex-col py-4 space-y-4">

                    {/* --- Coaches Section --- */}
                    <div className="shrink-0 space-y-3">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground">
                                <GraduationCap className="w-4 h-4" />
                                Coaches ({coaches?.length || 0})
                            </h4>

                            <Popover open={coachComboboxOpen} onOpenChange={setCoachComboboxOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm" role="combobox" aria-expanded={coachComboboxOpen} className="w-[160px] justify-between text-xs">
                                        Assign Coach...
                                        <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[250px] p-0" align="end">
                                    <Command>
                                        <CommandInput placeholder="Search fencer..." />
                                        <CommandList>
                                            <CommandEmpty>No fencer found.</CommandEmpty>
                                            <CommandGroup>
                                                {availableCoaches.map((fencer: Fencer) => (
                                                    <CommandItem
                                                        key={fencer.id}
                                                        value={`${fencer.last_name} ${fencer.first_name}`}
                                                        onSelect={() => handleAddCoach(fencer.id)}
                                                        className="cursor-pointer"
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", "opacity-0")} />
                                                        {fencer.last_name}, {fencer.first_name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {loadingCoaches ? (
                            <div className="text-xs text-muted-foreground animate-pulse px-2">Loading...</div>
                        ) : !coaches || coaches.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic px-2">No coaches assigned.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2 px-1">
                                {coaches.map(c => (
                                    <span key={c.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                                        <GraduationCap className="w-3 h-3" />
                                        {c.last_name}, {c.first_name}
                                        <button onClick={() => handleRemoveCoach(c.id)} className="ml-1 hover:text-destructive transition-colors">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* --- Attendees Section --- */}
                    <div className="flex justify-between items-center shrink-0">
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                            <User className="w-5 h-5 text-muted-foreground" />
                            Attendees ({attendees?.length || 0})
                        </h4>

                        <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" aria-expanded={comboboxOpen} className="w-[200px] justify-between">
                                    Add Fencer...
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[250px] p-0" align="end">
                                <Command>
                                    <CommandInput placeholder="Search fencer..." />
                                    <CommandList>
                                        <CommandEmpty>No fencer found.</CommandEmpty>
                                        <CommandGroup>
                                            {availableFencers.map((fencer: Fencer) => (
                                                <CommandItem
                                                    key={fencer.id}
                                                    value={`${fencer.last_name} ${fencer.first_name}`}
                                                    onSelect={() => handleAdd(fencer.id)}
                                                    className="cursor-pointer"
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", "opacity-0")} />
                                                    {fencer.last_name}, {fencer.first_name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <ScrollArea className="flex-1 rounded-md border min-h-0 bg-muted/10">
                        {loadingAttendees ? (
                            <div className="flex justify-center p-8 text-sm text-muted-foreground animate-pulse">Loading...</div>
                        ) : !attendees || attendees.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full p-12 text-center text-muted-foreground">
                                <p className="italic mb-2">Nobody is signed up yet.</p>
                                <p className="text-xs">Use the button above to add attendees manually.</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {attendees.map(a => (
                                    <div key={a.id} className="flex justify-between items-center p-3 hover:bg-muted/30 transition-colors">
                                        <div className="flex flex-col gap-1">
                                            <div className="font-medium text-sm">{a.last_name}, {a.first_name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {isOpenBouting(session.name, session.template_name)
                                                    ? 'Open Bouting Attendance'
                                                    : (a.minutes_missed && a.minutes_missed > 0)
                                                        ? `Missed ${a.minutes_missed}m of ${session.duration_minutes}m`
                                                        : 'Full Class'}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isOpenBouting(session.name, session.template_name) ? (
                                                <span className="text-xs font-semibold bg-muted text-muted-foreground px-2.5 py-1 rounded border">Whole Class</span>
                                            ) : (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs text-muted-foreground">Missed:</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={session.duration_minutes}
                                                        value={a.minutes_missed ?? 0}
                                                        onChange={async (e) => {
                                                            const val = Math.max(0, Math.min(session.duration_minutes, parseInt(e.target.value) || 0));
                                                            const fraction = (session.duration_minutes - val) / session.duration_minutes;
                                                            const roundedFraction = Math.round(fraction * 10000) / 10000;
                                                            await addAttendee.mutateAsync({
                                                                sessionId: session.id,
                                                                fencerId: a.id,
                                                                fraction: roundedFraction,
                                                                minutesMissed: val,
                                                                date: session.date
                                                            });
                                                        }}
                                                        className="w-14 bg-background text-foreground border border-border/50 rounded px-1.5 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                                                    />
                                                    <span className="text-[10px] text-muted-foreground">min</span>
                                                </div>
                                            )}
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleRemove(a.id)}>
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </SheetContent>
        </Sheet>
    );
};
