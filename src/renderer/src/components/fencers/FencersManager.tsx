import React, { useState, useEffect } from 'react';
import { useFencers, useCreateFencer, useUpdateFencer } from '../../hooks/useFencers';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Fencer } from '@preload/index';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Fencer Row Actions
// ---------------------------------------------------------------------------

const FencerRowActions = ({ fencer, onUpdate }: { fencer: Fencer; onUpdate: (data: Fencer) => Promise<unknown> }) => {
    const [editOpen, setEditOpen] = useState(false);
    const [firstName, setFirstName] = useState(fencer.first_name);
    const [lastName, setLastName] = useState(fencer.last_name);
    const [yearOfBirth, setYearOfBirth] = useState(fencer.year_of_birth.toString());
    const [usafId, setUsafId] = useState(fencer.usaf_id.toString());
    const [sex, setSex] = useState(fencer.sex || 'M');
    const [lastMembershipRenewal, setLastMembershipRenewal] = useState(fencer.last_membership_renewal || '');
    const [isFoil, setIsFoil] = useState(!!fencer.is_foil);
    const [isEpee, setIsEpee] = useState(!!fencer.is_epee);
    const [isSaber, setIsSaber] = useState(!!fencer.is_saber);

    useEffect(() => {
        if (!editOpen) return;
        setFirstName(fencer.first_name);
        setLastName(fencer.last_name);
        setYearOfBirth(fencer.year_of_birth.toString());
        setUsafId(fencer.usaf_id.toString());
        setSex(fencer.sex || 'M');
        setLastMembershipRenewal(fencer.last_membership_renewal || '');
        setIsFoil(!!fencer.is_foil);
        setIsEpee(!!fencer.is_epee);
        setIsSaber(!!fencer.is_saber);
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
            is_foil: isFoil,
            is_epee: isEpee,
            is_saber: isSaber
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
                            <Label htmlFor="renewalEdit" className="text-right">Renewal</Label>
                            <Input id="renewalEdit" type="date" value={lastMembershipRenewal} onChange={e => setLastMembershipRenewal(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4 mt-2">
                            <Label className="text-right">Weapons</Label>
                            <div className="col-span-3 flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" checked={isFoil} onChange={e => setIsFoil(e.target.checked)} className="cursor-pointer" /> Foil
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" checked={isEpee} onChange={e => setIsEpee(e.target.checked)} className="cursor-pointer" /> Epee
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" checked={isSaber} onChange={e => setIsSaber(e.target.checked)} className="cursor-pointer" /> Saber
                                </label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// ---------------------------------------------------------------------------
// Fencers Manager (Main)
// ---------------------------------------------------------------------------

export const FencersManager = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;

    const { data: fencersData, isLoading, isError } = useFencers(currentPage, pageSize);
    const fencers = fencersData?.items ?? [];
    const totalFencers = fencersData?.total ?? 0;

    const createFencer = useCreateFencer();
    const updateFencer = useUpdateFencer();

    // Add Fencer Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [yearOfBirth, setYearOfBirth] = useState('');
    const [usafId, setUsafId] = useState('');
    const [isFoil, setIsFoil] = useState(false);
    const [isEpee, setIsEpee] = useState(true);
    const [isSaber, setIsSaber] = useState(false);
    const [sex, setSex] = useState('M');
    const [lastMembershipRenewal, setLastMembershipRenewal] = useState('');

    const [addOpen, setAddOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        await createFencer.mutateAsync({
            first_name: firstName,
            last_name: lastName,
            year_of_birth: parseInt(yearOfBirth) || 2000,
            usaf_id: parseInt(usafId) || 0,
            sex,
            last_membership_renewal: lastMembershipRenewal || null,
            is_foil: isFoil,
            is_epee: isEpee,
            is_saber: isSaber
        });
        setAddOpen(false);
        // Reset
        setFirstName(''); setLastName(''); setYearOfBirth(''); setUsafId(''); setLastMembershipRenewal('');
    };

    // Filtering logic (client-side filter on current page only for now, 
    // real search would need backend support)
    const filteredFencers = fencers.filter(f => {
        const q = searchTerm.toLowerCase().trim();
        if (!q) return true;
        return (
            f.first_name.toLowerCase().includes(q) ||
            f.last_name.toLowerCase().includes(q) ||
            f.usaf_id.toString().includes(q) ||
            f.year_of_birth.toString().includes(q)
        );
    });

    // Reset pagination on search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const totalPages = Math.ceil(totalFencers / pageSize) || 1;

    return (
        <Card className="h-full flex flex-col shadow-sm border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/20 border-b shrink-0">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-bold tracking-tight">Fencer Registry</CardTitle>
                    <CardDescription>View and manage club members.</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search fencers..."
                            className="pl-9 w-[200px] lg:w-[300px] h-9"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Dialog open={addOpen} onOpenChange={setAddOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">Add Fencer</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <form onSubmit={handleCreate}>
                                <DialogHeader>
                                    <DialogTitle>Add New Fencer</DialogTitle>
                                    <DialogDescription>Create a new record in the database.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="fName" className="text-right">First Name</Label>
                                        <Input id="fName" value={firstName} onChange={e => setFirstName(e.target.value)} className="col-span-3" required />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="lName" className="text-right">Last Name</Label>
                                        <Input id="lName" value={lastName} onChange={e => setLastName(e.target.value)} className="col-span-3" required />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="uId" className="text-right">USAF ID</Label>
                                        <Input id="uId" type="number" value={usafId} onChange={e => setUsafId(e.target.value)} className="col-span-3" required />
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
                                        <Label htmlFor="renew" className="text-right">Renewal</Label>
                                        <Input id="renew" type="date" value={lastMembershipRenewal} onChange={e => setLastMembershipRenewal(e.target.value)} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4 mt-2">
                                        <Label className="text-right">Weapons</Label>
                                        <div className="col-span-3 flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                                <input type="checkbox" checked={isFoil} onChange={e => setIsFoil(e.target.checked)} /> Foil
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                                <input type="checkbox" checked={isEpee} onChange={e => setIsEpee(e.target.checked)} /> Epee
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                                <input type="checkbox" checked={isSaber} onChange={e => setIsSaber(e.target.checked)} /> Saber
                                            </label>
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
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col min-h-0">
                <div className="flex-1 overflow-auto">
                    {isLoading ? (
                        <div className="flex justify-center py-8"><span className="animate-pulse text-muted-foreground text-sm">Working...</span></div>
                    ) : isError ? (
                        <p className="text-destructive p-4 text-sm text-center">Load failed.</p>
                    ) : filteredFencers.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground italic text-sm">No fencers found.</div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-muted/30 sticky top-0 z-10 backdrop-blur-sm">
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Sex</TableHead>
                                    <TableHead>YOB</TableHead>
                                    <TableHead>USAF ID</TableHead>
                                    <TableHead>Renewal</TableHead>
                                    <TableHead>Weapons</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredFencers.map(f => (
                                    <TableRow key={f.id} className="hover:bg-muted/5">
                                        <TableCell className="font-medium">{f.first_name} {f.last_name}</TableCell>
                                        <TableCell>{f.sex || '—'}</TableCell>
                                        <TableCell>{f.year_of_birth}</TableCell>
                                        <TableCell className="font-mono text-xs">{f.usaf_id}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{f.last_membership_renewal || '—'}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                {f.is_foil && <Badge variant="outline" className="px-1 text-[10px] h-4">F</Badge>}
                                                {f.is_epee && <Badge variant="outline" className="px-1 text-[10px] h-4">E</Badge>}
                                                {f.is_saber && <Badge variant="outline" className="px-1 text-[10px] h-4">S</Badge>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <FencerRowActions fencer={f} onUpdate={(data) => updateFencer.mutateAsync(data)} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                <div className="border-t bg-muted/20 px-4 py-3 flex items-center justify-between shrink-0">
                    <div className="text-xs text-muted-foreground font-medium">
                        Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalFencers)} of {totalFencers}
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
            </CardContent>
        </Card>
    );
};
