import React, { useState, useEffect } from 'react';
import { useFencers, useCreateFencer, useUpdateFencer } from '../../hooks/useFencers';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil } from 'lucide-react';
import type { Fencer } from '@preload/index';

/** Binary sex toggle — two buttons, Male or Female */
const SexToggle = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <div className="col-span-3 flex gap-1 rounded-lg border border-border bg-muted/30 p-0.5">
        <button
            type="button"
            onClick={() => onChange('M')}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${value === 'M' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
            Male
        </button>
        <button
            type="button"
            onClick={() => onChange('F')}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${value === 'F' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
            Female
        </button>
    </div>
);

// A sub-component to handle per-row edit state
const FencerRowActions = ({ fencer, onUpdate }: { fencer: Fencer; onUpdate: (data: any) => Promise<unknown> }) => {

    const [editOpen, setEditOpen] = useState(false);
    const [firstName, setFirstName] = useState(fencer.first_name);
    const [lastName, setLastName] = useState(fencer.last_name);
    const [yearOfBirth, setYearOfBirth] = useState(fencer.year_of_birth.toString());
    const [usafId, setUsafId] = useState(fencer.usaf_id.toString());
    const [sex, setSex] = useState(fencer.sex || 'M');
    const [lastMembershipRenewal, setLastMembershipRenewal] = useState(fencer.last_membership_renewal || '');
    const [isFoil, setIsFoil] = useState(fencer.is_foil === 1);
    const [isEpee, setIsEpee] = useState(fencer.is_epee === 1);
    const [isSaber, setIsSaber] = useState(fencer.is_saber === 1);

    // Reset when fencer prop changes or modal closes
    useEffect(() => {
        if (!editOpen) return;
        setFirstName(fencer.first_name);
        setLastName(fencer.last_name);
        setYearOfBirth(fencer.year_of_birth.toString());
        setUsafId(fencer.usaf_id.toString());
        setSex(fencer.sex || 'M');
        setLastMembershipRenewal(fencer.last_membership_renewal || '');
        setIsFoil(fencer.is_foil === 1);
        setIsEpee(fencer.is_epee === 1);
        setIsSaber(fencer.is_saber === 1);
    }, [editOpen, fencer]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        await onUpdate({
            id: fencer.id,
            first_name: firstName,
            last_name: lastName,
            year_of_birth: parseInt(yearOfBirth) || fencer.year_of_birth,
            usaf_id: parseInt(usafId) || fencer.usaf_id,
            sex: sex || null,
            last_membership_renewal: lastMembershipRenewal || null,
            is_foil: isFoil ? 1 : 0,
            is_epee: isEpee ? 1 : 0,
            is_saber: isSaber ? 1 : 0
        });
        setEditOpen(false);
    };

    return (
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
                </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleUpdate}>
                    <DialogHeader>
                        <DialogTitle>Edit Fencer</DialogTitle>
                        <DialogDescription>Update the fencer's details below.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="firstNameEdit" className="text-right">First Name</Label>
                            <Input id="firstNameEdit" value={firstName} onChange={e => setFirstName(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lastNameEdit" className="text-right">Last Name</Label>
                            <Input id="lastNameEdit" value={lastName} onChange={e => setLastName(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="usafIdEdit" className="text-right">USAF ID</Label>
                            <Input id="usafIdEdit" type="number" value={usafId} onChange={e => setUsafId(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="yobEdit" className="text-right">Birth Year</Label>
                            <Input id="yobEdit" type="number" value={yearOfBirth} onChange={e => setYearOfBirth(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Sex</Label>
                            <SexToggle value={sex} onChange={setSex} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="renewalEdit" className="text-right">Membership Renewal</Label>
                            <Input id="renewalEdit" type="date" value={lastMembershipRenewal} onChange={e => setLastMembershipRenewal(e.target.value)} className="col-span-3" />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4 mt-2">
                            <Label className="text-right">Weapons</Label>
                            <div className="col-span-3 flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer select-none"><input type="checkbox" checked={isFoil} onChange={(e) => setIsFoil(e.target.checked)} className="cursor-pointer" />Foil</label>
                                <label className="flex items-center gap-2 cursor-pointer select-none"><input type="checkbox" checked={isEpee} onChange={(e) => setIsEpee(e.target.checked)} className="cursor-pointer" />Epee</label>
                                <label className="flex items-center gap-2 cursor-pointer select-none"><input type="checkbox" checked={isSaber} onChange={(e) => setIsSaber(e.target.checked)} className="cursor-pointer" />Saber</label>
                            </div>
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
    );
};

export const FencersManager = () => {
    const { data: fencers, isLoading, isError } = useFencers();
    const createFencer = useCreateFencer();
    const updateFencer = useUpdateFencer();

    // form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [yearOfBirth, setYearOfBirth] = useState('');
    const [usafId, setUsafId] = useState('');
    const [isFoil, setIsFoil] = useState(false);
    const [isEpee, setIsEpee] = useState(false);
    const [isSaber, setIsSaber] = useState(false);
    const [sex, setSex] = useState('M');
    const [lastMembershipRenewal, setLastMembershipRenewal] = useState('');

    const [open, setOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createFencer.mutateAsync({
            first_name: firstName,
            last_name: lastName,
            year_of_birth: parseInt(yearOfBirth) || 2000,
            usaf_id: parseInt(usafId) || 0,
            sex: sex || null,
            last_membership_renewal: lastMembershipRenewal || null,
            is_foil: isFoil ? 1 : 0,
            is_epee: isEpee ? 1 : 0,
            is_saber: isSaber ? 1 : 0
        });
        setOpen(false);
        // reset fields
        setFirstName(''); setLastName(''); setYearOfBirth(''); setUsafId(''); setSex('M'); setLastMembershipRenewal(''); setIsFoil(false); setIsEpee(false); setIsSaber(false);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Fencers Directory</h2>
                    <p className="text-muted-foreground">Manage your club members and fencers.</p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>Add Fencer</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>Add New Fencer</DialogTitle>
                                <DialogDescription>Enter the fencer's details below.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="firstName" className="text-right">First Name</Label>
                                    <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} className="col-span-3" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="lastName" className="text-right">Last Name</Label>
                                    <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} className="col-span-3" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="usafId" className="text-right">USAF ID</Label>
                                    <Input id="usafId" type="number" value={usafId} onChange={e => setUsafId(e.target.value)} className="col-span-3" placeholder="USA Fencing member ID" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="yob" className="text-right">Birth Year</Label>
                                    <Input id="yob" type="number" value={yearOfBirth} onChange={e => setYearOfBirth(e.target.value)} className="col-span-3" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Sex</Label>
                                    <SexToggle value={sex} onChange={setSex} />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="renewal" className="text-right">Membership Renewal</Label>
                                    <Input id="renewal" type="date" value={lastMembershipRenewal} onChange={e => setLastMembershipRenewal(e.target.value)} className="col-span-3" />
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4 mt-2">
                                    <Label className="text-right">Weapons</Label>
                                    <div className="col-span-3 flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer select-none"><input type="checkbox" checked={isFoil} onChange={(e) => setIsFoil(e.target.checked)} className="cursor-pointer" />Foil</label>
                                        <label className="flex items-center gap-2 cursor-pointer select-none"><input type="checkbox" checked={isEpee} onChange={(e) => setIsEpee(e.target.checked)} className="cursor-pointer" />Epee</label>
                                        <label className="flex items-center gap-2 cursor-pointer select-none"><input type="checkbox" checked={isSaber} onChange={(e) => setIsSaber(e.target.checked)} className="cursor-pointer" />Saber</label>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={createFencer.isPending}>
                                    {createFencer.isPending ? 'Saving...' : 'Save Fencer'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Fencers</CardTitle>
                    <CardDescription>A list of everyone registered in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <span className="animate-pulse text-muted-foreground">Loading fencers...</span>
                        </div>
                    ) : isError ? (
                        <p className="text-destructive p-4 text-center">Failed to load fencers.</p>
                    ) : !fencers || fencers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl bg-muted/20 gap-3">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-xl">⚔️</span>
                            </div>
                            <p className="text-muted-foreground font-medium text-lg">No fencers found</p>
                            <p className="text-sm text-muted-foreground mb-4">Add your first fencer to get started.</p>
                            <Button variant="outline" onClick={() => setOpen(true)}>Add Fencer</Button>
                        </div>
                    ) : (
                        <div className="rounded-md border border-border">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>USAF ID</TableHead>
                                        <TableHead>Year of Birth</TableHead>
                                        <TableHead>Sex</TableHead>
                                        <TableHead>Renewal Date</TableHead>
                                        <TableHead>Weapons</TableHead>
                                        <TableHead className="w-[60px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fencers.map(fencer => (
                                        <TableRow key={fencer.id} className="hover:bg-muted/30">
                                            <TableCell className="font-medium text-foreground">{fencer.last_name}, {fencer.first_name}</TableCell>
                                            <TableCell className="text-muted-foreground font-mono text-sm">{fencer.usaf_id || '-'}</TableCell>
                                            <TableCell className="text-muted-foreground">{fencer.year_of_birth}</TableCell>
                                            <TableCell className="text-muted-foreground">{fencer.sex === 'M' ? 'Male' : fencer.sex === 'F' ? 'Female' : fencer.sex || '-'}</TableCell>
                                            <TableCell className="text-muted-foreground">{fencer.last_membership_renewal || '-'}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2 text-xs">
                                                    {fencer.is_foil === 1 && <span className="px-2.5 py-0.5 font-medium bg-blue-100 text-blue-700 border border-blue-200 rounded-full dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800">Foil</span>}
                                                    {fencer.is_epee === 1 && <span className="px-2.5 py-0.5 font-medium bg-red-100 text-red-700 border border-red-200 rounded-full dark:bg-red-900/40 dark:text-red-300 dark:border-red-800">Epee</span>}
                                                    {fencer.is_saber === 1 && <span className="px-2.5 py-0.5 font-medium bg-amber-100 text-amber-700 border border-amber-200 rounded-full dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800">Saber</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <FencerRowActions fencer={fencer} onUpdate={(data) => updateFencer.mutateAsync(data)} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
