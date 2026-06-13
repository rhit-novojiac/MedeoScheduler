import React, { useState } from 'react';
import { useAttendeesForSession, useAddAttendee, useRemoveAttendee } from '../../hooks/useClassAttendees';
import { useCoachesForSession, useAddCoach, useRemoveCoach } from '../../hooks/useCoaches';
import { useFencers } from '../../hooks/useFencers';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, X, User, GraduationCap } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn, formatTime } from '@/lib/utils';
import type { ClassSession } from '@preload/index';

interface AttendanceSheetProps {
    session: ClassSession | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

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
    const availableFencers = fencers?.filter(f => !attendees?.some(a => a.id === f.id)) || [];
    // Filter out fencers who are already coaches for this session
    const availableCoaches = fencers?.filter(f => !coaches?.some(c => c.id === f.id)) || [];

    const handleAdd = async (fencerId: number) => {
        if (!session.id) return;
        await addAttendee.mutateAsync({ sessionId: session.id, fencerId });
        setComboboxOpen(false);
    };

    const handleRemove = async (fencerId: number) => {
        if (!session.id) return;
        await removeAttendee.mutateAsync({ sessionId: session.id, fencerId });
    };

    const handleAddCoach = async (coachId: number) => {
        if (!session.id) return;
        await addCoach.mutateAsync({ sessionId: session.id, coachId });
        setCoachComboboxOpen(false);
    };

    const handleRemoveCoach = async (coachId: number) => {
        if (!session.id) return;
        await removeCoach.mutateAsync({ sessionId: session.id, coachId });
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col pt-10 px-6">
                <SheetHeader className="pb-6 border-b shrink-0">
                    <SheetTitle className="text-2xl">{session.template_name || session.name || 'Ad-Hoc Session'}</SheetTitle>
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
                                                {availableCoaches.map((fencer) => (
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
                                            {availableFencers.map((fencer) => (
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
                                                Participation: {a.fraction === 1.0 ? 'Whole' : a.fraction === 0.67 ? '2/3' : a.fraction === 0.50 ? '1/2' : '1/3'} Class
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={a.fraction ?? 1.0}
                                                onChange={async (e) => {
                                                    const fraction = parseFloat(e.target.value);
                                                    await addAttendee.mutateAsync({ sessionId: session.id, fencerId: a.id, fraction });
                                                }}
                                                className="bg-background text-foreground border border-border/50 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-medium"
                                            >
                                                <option value="1" className="bg-background text-foreground">Whole Class</option>
                                                <option value="0.67" className="bg-background text-foreground">2/3 Class</option>
                                                <option value="0.5" className="bg-background text-foreground">1/2 Class</option>
                                                <option value="0.33" className="bg-background text-foreground">1/3 Class</option>
                                            </select>
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
