import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { useCreateSpecialEvent } from '../../hooks/useSpecialEvents';
import { useClassSessionsByDate } from '../../hooks/useClassSessions';
import type { ClassSession } from '@preload/index';

interface AddEventDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    date: Date;
}

export const AddEventDialog: React.FC<AddEventDialogProps> = ({ open, onOpenChange, date }) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const { mutateAsync: createEvent, isPending } = useCreateSpecialEvent();

    // We fetch sessions just for this dialog so the user can see what normally runs today
    // if they choose to cancel classes. 
    const { data: sessions = [] } = useClassSessionsByDate(formattedDate);

    const [name, setName] = useState('');
    const [type, setType] = useState('holiday');
    const [cancelsClasses, setCancelsClasses] = useState(false);
    const [isAnnual, setIsAnnual] = useState(false);
    const [excludedClassIds, setExcludedClassIds] = useState<number[]>([]);

    useEffect(() => {
        if (open) {
            setName('');
            setType('holiday');
            setCancelsClasses(false);
            setIsAnnual(false);
            setExcludedClassIds([]);
        }
    }, [open]);

    const handleToggleExcluded = (sessionId: number) => {
        setExcludedClassIds(prev =>
            prev.includes(sessionId) ? prev.filter(id => id !== sessionId) : [...prev, sessionId]
        );
    };

    const handleSave = async () => {
        if (!name.trim()) return;

        await createEvent({
            name: name.trim(),
            type,
            date: formattedDate,
            cancels_classes: cancelsClasses ? 1 : 0,
            is_annual: isAnnual ? 1 : 0,
            excluded_class_ids: cancelsClasses && excludedClassIds.length > 0
                ? JSON.stringify(excludedClassIds)
                : null
        });

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Special Event</DialogTitle>
                    <DialogDescription>
                        Create an event for {format(date, 'MMMM do, yyyy')}.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="event-name">Event Name</Label>
                        <Input
                            id="event-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Winter Camp, Thanksgiving"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="event-type">Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger id="event-type">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="holiday">Holiday</SelectItem>
                                <SelectItem value="camp">Camp</SelectItem>
                                <SelectItem value="tournament">Tournament</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center space-x-2 mt-2">
                        <Checkbox
                            id="is-annual"
                            checked={isAnnual}
                            onCheckedChange={(c: boolean | 'indeterminate') => setIsAnnual(c === true)}
                        />
                        <Label htmlFor="is-annual" className="font-normal cursor-pointer text-sm">
                            Recurs Annually (every year on {format(date, 'MMMM do')})
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="cancels-classes"
                            checked={cancelsClasses}
                            onCheckedChange={(c: boolean | 'indeterminate') => setCancelsClasses(c === true)}
                        />
                        <Label htmlFor="cancels-classes" className="font-normal cursor-pointer text-sm">
                            Cancels Regular Classes
                        </Label>
                    </div>

                    {cancelsClasses && sessions.length > 0 && (
                        <div className="mt-4 border rounded-md p-3 bg-muted/20">
                            <Label className="mb-2 block">Keep Specific Classes (Optional)</Label>
                            <p className="text-xs text-muted-foreground mb-3">
                                Select classes that should still run despite the cancellation.
                            </p>
                            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                                {sessions.map((session) => (
                                    <div key={session.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`session-${session.id}`}
                                            checked={excludedClassIds.includes(session.id)}
                                            onCheckedChange={() => handleToggleExcluded(session.id)}
                                        />
                                        <Label htmlFor={`session-${session.id}`} className="font-normal cursor-pointer text-sm truncate flex-1">
                                            {session.name} ({session.start_time})
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!name.trim() || isPending}>
                        {isPending ? "Saving..." : "Save Event"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
