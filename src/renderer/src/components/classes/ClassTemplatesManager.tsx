import React, { useState, useEffect } from 'react';
import { useClassTemplates, useCreateClassTemplate, useUpdateClassTemplate, useDeleteClassTemplate } from '../../hooks/useClassTemplates';
import { useClassTypes } from '../../hooks/useClassTypes';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import type { ClassTemplate } from '@preload/index';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { Badge } from '@/components/ui/badge';

const DAYS_OF_WEEK = [
    { value: '0', label: 'Sunday' },
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
];

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
        <Badge variant="outline" className={`${bg} ${text} font-semibold px-1.5 py-0 text-[10px] shrink-0`}>
            {label}
        </Badge>
    );
};

const TemplateRowActions = ({ template, onUpdate, onDelete }: { template: ClassTemplate; onUpdate: (data: Omit<ClassTemplate, 'class_type_name'>) => Promise<unknown>; onDelete: (id: string) => Promise<unknown> }) => {
    const { data: classTypes } = useClassTypes();

    const [editOpen, setEditOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [name, setName] = useState(template.name);
    const [typeId, setTypeId] = useState(template.class_type_id.toString());
    const [dayOfWeek, setDayOfWeek] = useState(template.day_of_week.toString());
    const [startTime, setStartTime] = useState(template.start_time);
    const [duration, setDuration] = useState(template.duration_minutes.toString());
    const [description, setDescription] = useState(template.description || '');
    const [weapon, setWeapon] = useState(template.weapon || 'none');

    useEffect(() => {
        if (!editOpen) return;
        setName(template.name);
        setTypeId(template.class_type_id.toString());
        setDayOfWeek(template.day_of_week.toString());
        setStartTime(template.start_time);
        setDuration(template.duration_minutes.toString());
        setDescription(template.description || '');
        setWeapon(template.weapon || 'none');
    }, [editOpen, template]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        await onUpdate({
            id: template.id,
            class_type_id: typeId,
            name: name,
            description: description || null,
            day_of_week: parseInt(dayOfWeek),
            start_time: startTime,
            duration_minutes: parseInt(duration),
            weapon: weapon === 'none' || !weapon ? null : weapon,
        });
        setEditOpen(false);
    };

    return (
        <>
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title={`Delete "${template.name}"?`}
                description="This will permanently remove this recurring class template."
                confirmLabel="Delete"
                onConfirm={() => onDelete(template.id)}
            />
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DialogTrigger asChild>
                            <DropdownMenuItem className="cursor-pointer">
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                        </DialogTrigger>
                        <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => setConfirmOpen(true)}>
                            <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleUpdate}>
                        <DialogHeader>
                            <DialogTitle>Edit Template</DialogTitle>
                            <DialogDescription>Update the recurring class details.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="tNameEdit" className="text-right">Name</Label>
                                <Input id="tNameEdit" value={name} onChange={e => setName(e.target.value)} className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Class Type</Label>
                                <div className="col-span-3">
                                    <Select value={typeId} onValueChange={setTypeId} required>
                                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                        <SelectContent>
                                            {classTypes?.map(ct => (
                                                <SelectItem key={ct.id} value={ct.id.toString()}>{ct.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Day</Label>
                                <div className="col-span-3">
                                    <Select value={dayOfWeek} onValueChange={setDayOfWeek} required>
                                        <SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger>
                                        <SelectContent>
                                            {DAYS_OF_WEEK.map(day => (
                                                <SelectItem key={day.value} value={day.value}>{day.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Weapon</Label>
                                <div className="col-span-3">
                                    <Select value={weapon} onValueChange={setWeapon}>
                                        <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="foil">Foil</SelectItem>
                                            <SelectItem value="epee">Epee</SelectItem>
                                            <SelectItem value="saber">Saber</SelectItem>
                                            <SelectItem value="all">All-Weapon</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="tTimeEdit" className="text-right">Start Time</Label>
                                <Input id="tTimeEdit" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="tDurEdit" className="text-right">Duration (m)</Label>
                                <Input id="tDurEdit" type="number" step="15" value={duration} onChange={e => setDuration(e.target.value)} className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="tDescEdit" className="text-right pt-2">Description</Label>
                                <Textarea id="tDescEdit" value={description} onChange={e => setDescription(e.target.value)} className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export const ClassTemplatesManager = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;

    const { data: templatesData, isLoading, isError } = useClassTemplates(currentPage, pageSize);
    const templates = templatesData?.items ?? [];
    const totalTemplates = templatesData?.total ?? 0;

    const { data: classTypes } = useClassTypes();
    const createTemplate = useCreateClassTemplate();
    const updateTemplate = useUpdateClassTemplate();
    const deleteTemplate = useDeleteClassTemplate();

    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [typeId, setTypeId] = useState('');
    const [dayOfWeek, setDayOfWeek] = useState('');
    const [startTime, setStartTime] = useState('17:00');
    const [duration, setDuration] = useState('60');
    const [description, setDescription] = useState('');
    const [weapon, setWeapon] = useState('none');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createTemplate.mutateAsync({
            class_type_id: typeId,
            name: name,
            description: description || null,
            day_of_week: parseInt(dayOfWeek),
            start_time: startTime,
            duration_minutes: parseInt(duration),
            weapon: weapon === 'none' || !weapon ? null : weapon,
        });
        setOpen(false);
        // Soft reset
        setName('');
        setDescription('');
        setWeapon('none');
    };

    const totalPages = Math.ceil(totalTemplates / pageSize) || 1;

    return (
        <Card className="h-full flex flex-col shadow-sm border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/20 border-b">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Weekly Class Templates
                    </CardTitle>
                    <CardDescription>Master schedule templates used to generate daily sessions.</CardDescription>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" disabled={!classTypes || classTypes.length === 0}>Add Template</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>Add New Template</DialogTitle>
                                <DialogDescription>Create a recurring class timeblock.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="tName" className="text-right">Name</Label>
                                    <Input id="tName" value={name} onChange={e => setName(e.target.value)} className="col-span-3" placeholder="e.g. Adv. Footwork" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Class Type</Label>
                                    <div className="col-span-3">
                                        <Select value={typeId} onValueChange={setTypeId} required>
                                            <SelectTrigger><SelectValue placeholder="Select type mapping" /></SelectTrigger>
                                            <SelectContent>
                                                {classTypes?.map(ct => (
                                                    <SelectItem key={ct.id} value={ct.id.toString()}>{ct.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Day</Label>
                                    <div className="col-span-3">
                                        <Select value={dayOfWeek} onValueChange={setDayOfWeek} required>
                                            <SelectTrigger><SelectValue placeholder="Select recurring day" /></SelectTrigger>
                                            <SelectContent>
                                                {DAYS_OF_WEEK.map(day => (
                                                    <SelectItem key={day.value} value={day.value}>{day.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Weapon</Label>
                                    <div className="col-span-3">
                                        <Select value={weapon} onValueChange={setWeapon}>
                                            <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                <SelectItem value="foil">Foil</SelectItem>
                                                <SelectItem value="epee">Epee</SelectItem>
                                                <SelectItem value="saber">Saber</SelectItem>
                                                <SelectItem value="all">All-Weapon</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="tTime" className="text-right">Start Time</Label>
                                    <Input id="tTime" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="col-span-3" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="tDur" className="text-right">Duration (m)</Label>
                                    <Input id="tDur" type="number" step="15" value={duration} onChange={e => setDuration(e.target.value)} className="col-span-3" required />
                                </div>
                                <div className="grid grid-cols-4 items-start gap-4">
                                    <Label htmlFor="tDesc" className="text-right pt-2">Description</Label>
                                    <Textarea id="tDesc" value={description} onChange={e => setDescription(e.target.value)} className="col-span-3" placeholder="Optional details..." />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={createTemplate.isPending || !typeId || !dayOfWeek}>
                                    {createTemplate.isPending ? 'Saving...' : 'Save Template'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-auto">
                {isLoading ? (
                    <div className="flex justify-center py-8"><span className="animate-pulse text-muted-foreground text-sm">Loading templates...</span></div>
                ) : isError ? (
                    <p className="text-destructive p-4 text-center text-sm">Failed to load templates.</p>
                ) : !templates || templates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center gap-2">
                        <p className="text-muted-foreground text-sm italic">No class templates exist.</p>
                        {(!classTypes || classTypes.length === 0) && (
                            <p className="text-xs text-amber-600 dark:text-amber-500">You must create a Class Type first.</p>
                        )}
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-muted/30 sticky top-0 backdrop-blur-md">
                            <TableRow>
                                <TableHead>Day</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead className="w-[60px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {templates.map(t => (
                                <TableRow key={t.id} className="hover:bg-muted/10">
                                    <TableCell className="font-medium">{DAYS_OF_WEEK.find(d => d.value === t.day_of_week.toString())?.label}</TableCell>
                                    <TableCell className="text-muted-foreground whitespace-nowrap">
                                        {formatTime(t.start_time)} <br />
                                        <span className="text-xs opacity-70">{t.duration_minutes}m</span>
                                    </TableCell>
                                    <TableCell className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <div className="font-medium text-foreground break-words">{t.name}</div>
                                            {getWeaponBadge(t.weapon)}
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate">{t.class_type_name}</div>
                                    </TableCell>
                                    <TableCell>
                                        <TemplateRowActions
                                            template={t}
                                            onUpdate={(data) => updateTemplate.mutateAsync(data)}
                                            onDelete={(id) => deleteTemplate.mutateAsync(id)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            <div className="border-t bg-muted/20 px-4 py-3 flex items-center justify-between shrink-0">
                <div className="text-xs text-muted-foreground font-medium">
                    Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalTemplates)} of {totalTemplates}
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Page {currentPage} / {totalPages}</span>
                    <div className="flex gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};
