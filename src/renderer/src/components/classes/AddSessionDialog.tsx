import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClassTypes } from '../../hooks/useClassTypes';
import { useCreateClassSession } from '../../hooks/useClassSessions';
import { format } from 'date-fns';

interface AddSessionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    date: Date;
}

export const AddSessionDialog = ({ open, onOpenChange, date }: AddSessionDialogProps) => {
    const { data: classTypes } = useClassTypes();
    const createSession = useCreateClassSession();

    const [classTypeId, setClassTypeId] = useState<string>('');
    const [startTime, setStartTime] = useState('17:00');
    const [duration, setDuration] = useState('60');

    const resetForm = () => {
        setClassTypeId('');
        setStartTime('17:00');
        setDuration('60');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!classTypeId) return;

        const selectedType = classTypes?.find(ct => ct.id === parseInt(classTypeId));

        await createSession.mutateAsync({
            template_id: null,
            class_type_id: parseInt(classTypeId),
            name: selectedType?.name || 'Ad-Hoc Session',
            date: format(date, 'yyyy-MM-dd'),
            start_time: startTime,
            duration_minutes: parseInt(duration) || 60,
        });

        resetForm();
        onOpenChange(false);
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) resetForm();
        onOpenChange(open);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add Ad-Hoc Session</DialogTitle>
                        <DialogDescription>
                            Create a one-time class session for {format(date, 'EEEE, MMMM do')}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Class Type</Label>
                            <div className="col-span-3">
                                <Select value={classTypeId} onValueChange={setClassTypeId} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a class type..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classTypes?.map(ct => (
                                            <SelectItem key={ct.id} value={ct.id.toString()}>
                                                {ct.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="startTime" className="text-right">Start Time</Label>
                            <Input
                                id="startTime"
                                type="time"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="duration" className="text-right">Duration</Label>
                            <div className="col-span-3 flex items-center gap-2">
                                <Input
                                    id="duration"
                                    type="number"
                                    min={15}
                                    step={15}
                                    value={duration}
                                    onChange={e => setDuration(e.target.value)}
                                    className="w-24"
                                    required
                                />
                                <span className="text-sm text-muted-foreground">minutes</span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!classTypeId || createSession.isPending}>
                            {createSession.isPending ? 'Adding...' : 'Add Session'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
