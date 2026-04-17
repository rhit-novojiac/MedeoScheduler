import React, { useState, useEffect } from 'react';
import { useClassTypes, useCreateClassType, useUpdateClassType, useDeleteClassType } from '../../hooks/useClassTypes';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import type { ClassType } from '@preload/index';
import { ConfirmDialog } from '../shared/ConfirmDialog';

const ClassTypeRowActions = ({ classType, onUpdate, onDelete }: { classType: ClassType; onUpdate: (ct: ClassType) => Promise<unknown>; onDelete: (id: number) => Promise<unknown> }) => {

    const [editOpen, setEditOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [name, setName] = useState(classType.name);
    const [memberPrice, setMemberPrice] = useState(classType.member_price.toString());
    const [nonMemberPrice, setNonMemberPrice] = useState(classType.non_member_price.toString());

    useEffect(() => {
        if (!editOpen) return;
        setName(classType.name);
        setMemberPrice(classType.member_price.toString());
        setNonMemberPrice(classType.non_member_price.toString());
    }, [editOpen, classType]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        await onUpdate({
            id: classType.id,
            name: name,
            member_price: parseFloat(memberPrice) || 0,
            non_member_price: parseFloat(nonMemberPrice) || 0
        });
        setEditOpen(false);
    };

    return (
        <>
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title={`Delete "${classType.name}"?`}
                description="This might break existing templates referencing this class type."
                confirmLabel="Delete"
                onConfirm={() => onDelete(classType.id)}
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
                            <DialogTitle>Edit Class Type</DialogTitle>
                            <DialogDescription>Update pricing or name below.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="classNameEdit" className="text-right">Name</Label>
                                <Input id="classNameEdit" value={name} onChange={e => setName(e.target.value)} className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="memberPriceEdit" className="text-right">Member $</Label>
                                <Input id="memberPriceEdit" type="number" step="0.01" value={memberPrice} onChange={e => setMemberPrice(e.target.value)} className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="nonMemberPriceEdit" className="text-right">Non-Member $</Label>
                                <Input id="nonMemberPriceEdit" type="number" step="0.01" value={nonMemberPrice} onChange={e => setNonMemberPrice(e.target.value)} className="col-span-3" required />
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

export const ClassTypesManager = () => {
    const { data: classTypes, isLoading, isError } = useClassTypes();
    const createClassType = useCreateClassType();
    const updateClassType = useUpdateClassType();
    const deleteClassType = useDeleteClassType();

    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [memberPrice, setMemberPrice] = useState('');
    const [nonMemberPrice, setNonMemberPrice] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createClassType.mutateAsync({
            name: name,
            member_price: parseFloat(memberPrice) || 0,
            non_member_price: parseFloat(nonMemberPrice) || 0
        });
        setOpen(false);
        setName(''); setMemberPrice(''); setNonMemberPrice('');
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle>Class Types &amp; Pricing</CardTitle>
                    <CardDescription>Manage the foundational categories of classes offered.</CardDescription>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">Add Class Type</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>Add New Class Type</DialogTitle>
                                <DialogDescription>Create a new category for your schedule.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="className" className="text-right">Name</Label>
                                    <Input id="className" value={name} onChange={e => setName(e.target.value)} className="col-span-3" placeholder="e.g. Open Bouting" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="memberPrice" className="text-right">Member $</Label>
                                    <Input id="memberPrice" type="number" step="0.01" value={memberPrice} onChange={e => setMemberPrice(e.target.value)} className="col-span-3" placeholder="25.00" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="nonMemberPrice" className="text-right">Non-Member $</Label>
                                    <Input id="nonMemberPrice" type="number" step="0.01" value={nonMemberPrice} onChange={e => setNonMemberPrice(e.target.value)} className="col-span-3" placeholder="40.00" required />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={createClassType.isPending}>
                                    {createClassType.isPending ? 'Saving...' : 'Save Type'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-4"><span className="animate-pulse text-muted-foreground text-sm">Loading types...</span></div>
                ) : isError ? (
                    <p className="text-destructive p-2 text-sm">Failed to load class types.</p>
                ) : !classTypes || classTypes.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-4 italic">No class types defined yet.</p>
                ) : (
                    <div className="rounded-md border mt-2">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Type Name</TableHead>
                                    <TableHead>Member Price</TableHead>
                                    <TableHead>Non-Member Price</TableHead>
                                    <TableHead className="w-[60px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {classTypes.map(ct => (
                                    <TableRow key={ct.id}>
                                        <TableCell className="font-medium">{ct.name}</TableCell>
                                        <TableCell className="text-muted-foreground">${ct.member_price.toFixed(2)}</TableCell>
                                        <TableCell className="text-muted-foreground">${ct.non_member_price.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <ClassTypeRowActions
                                                classType={ct}
                                                onUpdate={(ct) => updateClassType.mutateAsync(ct)}
                                                onDelete={(id) => deleteClassType.mutateAsync(id)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
