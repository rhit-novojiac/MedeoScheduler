import React, { useState, useEffect } from 'react';
import { Users, Clock, Trash2, Pencil, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatTime } from '@/lib/utils';
import type { ClassSession, ClassType } from '@preload/index';
import { ConfirmDialog } from '../shared/ConfirmDialog';

type DeleteFn = (args: { id: number; date: string }) => Promise<unknown>;
type UpdateFn = (args: {
    session: Pick<ClassSession, 'id' | 'name' | 'class_type_id' | 'start_time' | 'duration_minutes'>;
    date: string;
}) => Promise<unknown>;

const EditSessionDialog = ({
    open,
    onOpenChange,
    session,
    date,
    classTypes,
    onUpdate,
    isPending,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    session: ClassSession;
    date: string;
    classTypes: ClassType[] | undefined;
    onUpdate: UpdateFn;
    isPending: boolean;
}) => {
    const [name, setName] = useState(session.name || '');
    const [classTypeId, setClassTypeId] = useState(
        session.class_type_id ? String(session.class_type_id) : ''
    );
    const [startTime, setStartTime] = useState(session.start_time);
    const [duration, setDuration] = useState(String(session.duration_minutes));

    // Re-sync whenever the dialog opens for a (possibly different) session
    useEffect(() => {
        if (!open) return;
        setName(session.name || '');
        setClassTypeId(session.class_type_id ? String(session.class_type_id) : '');
        setStartTime(session.start_time);
        setDuration(String(session.duration_minutes));
    }, [open, session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onUpdate({
            session: {
                id: session.id,
                name: name || null,
                class_type_id: classTypeId ? parseInt(classTypeId) : null,
                start_time: startTime,
                duration_minutes: parseInt(duration) || session.duration_minutes,
            },
            date,
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Session</DialogTitle>
                        <DialogDescription>
                            Overrides apply to this single occurrence only — the template is unchanged.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Custom name (optional override) */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="sessionName" className="text-right text-sm">
                                Name
                            </Label>
                            <Input
                                id="sessionName"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder={session.template_name || 'Session name…'}
                                className="col-span-3"
                            />
                        </div>

                        {/* Class Type */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-sm">Type</Label>
                            <div className="col-span-3">
                                <Select value={classTypeId} onValueChange={setClassTypeId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select class type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classTypes?.map(ct => (
                                            <SelectItem key={ct.id} value={String(ct.id)}>
                                                {ct.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Start Time */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="sessionTime" className="text-right text-sm">
                                Start Time
                            </Label>
                            <Input
                                id="sessionTime"
                                type="time"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>

                        {/* Duration */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="sessionDuration" className="text-right text-sm">
                                Duration (m)
                            </Label>
                            <Input
                                id="sessionDuration"
                                type="number"
                                step="15"
                                min="15"
                                value={duration}
                                onChange={e => setDuration(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Saving…' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export const SessionCard = ({
    session,
    date,
    classTypes,
    onClick,
    onDelete,
    onUpdate,
    isDeleting,
    isUpdating,
}: {
    session: ClassSession;
    date: string;
    classTypes: ClassType[] | undefined;
    onClick: () => void;
    onDelete: DeleteFn;
    onUpdate: UpdateFn;
    isDeleting: boolean;
    isUpdating: boolean;
}) => {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    return (
        <>
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title={`Delete "${session.template_name || session.name || 'this session'}"?`}
                description="This will also permanently remove all attendance records for this session."
                confirmLabel="Delete"
                onConfirm={() => onDelete({ id: session.id, date })}
            />
            <EditSessionDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                session={session}
                date={date}
                classTypes={classTypes}
                onUpdate={onUpdate}
                isPending={isUpdating}
            />

            <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={onClick}>
                <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            {/* Title & Badge — they wrap together now */}
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                                <CardTitle className="text-base leading-snug break-words">
                                    {session.name || session.template_name || 'Ad-Hoc Session'}
                                </CardTitle>
                                {session.class_type_name && (
                                    <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-normal uppercase tracking-wider shrink-0 bg-secondary/30">
                                        {session.class_type_name}
                                    </Badge>
                                )}
                            </div>
                            <CardDescription className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 shrink-0" />
                                {formatTime(session.start_time)} ({session.duration_minutes}m)
                            </CardDescription>
                        </div>

                        {/* Actions dropdown — stays in top-right, never shrinks */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 shrink-0"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => setEditOpen(true)}
                                    disabled={isUpdating}
                                >
                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="cursor-pointer text-destructive focus:text-destructive"
                                    onClick={() => setConfirmOpen(true)}
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                        <Users className="w-4 h-4 shrink-0" />
                        <span>{session.attendee_count ?? 0} Attendees</span>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};
