import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, Plus, Calendar, User, CreditCard, Clock, Check, X } from 'lucide-react';
import type { Fencer, FencerMembership, FencerBilling } from '@preload/index';
import {
    useFencerMemberships,
    useCreateMembership,
    useUpdateMembership,
    useDeleteMembership,
    useFencerClassHistory,
    useFencerBillings,
    useCreateBilling,
    useUpdateBillingStatus,
    useDeleteBilling,
    FencerClassHistoryItem,
} from '../../hooks/useFencerAccount';

// Helper to determine if a fencer was a member on a specific date (YYYY-MM-DD string comparison)
export const isMemberOnDate = (memberships: FencerMembership[], dateStr: string): boolean => {
    return memberships.some(m => dateStr >= m.start_date && dateStr <= m.end_date);
};

interface FencerAccountDialogProps {
    fencer: Fencer;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdateFencer: (fencer: Fencer) => Promise<unknown>;
}

export const FencerAccountDialog = ({ fencer, open, onOpenChange, onUpdateFencer }: FencerAccountDialogProps) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'memberships' | 'history' | 'billings'>('profile');

    // --- Profile Form State ---
    const [firstName, setFirstName] = useState(fencer.first_name);
    const [lastName, setLastName] = useState(fencer.last_name);
    const [yearOfBirth, setYearOfBirth] = useState(fencer.year_of_birth.toString());
    const [usafId, setUsafId] = useState(fencer.usaf_id.toString());
    const [sex, setSex] = useState(fencer.sex || 'M');
    const [isFoil, setIsFoil] = useState(!!fencer.is_foil);
    const [isEpee, setIsEpee] = useState(!!fencer.is_epee);
    const [isSaber, setIsSaber] = useState(!!fencer.is_saber);
    const [coachRole, setCoachRole] = useState<'NONE' | 'TEMPORARY' | 'FULL'>(fencer.coach_role || 'NONE');

    // Sync profile state when open/fencer changes
    useEffect(() => {
        if (!open) return;
        setFirstName(fencer.first_name);
        setLastName(fencer.last_name);
        setYearOfBirth(fencer.year_of_birth.toString());
        setUsafId(fencer.usaf_id.toString());
        setSex(fencer.sex || 'M');
        setIsFoil(!!fencer.is_foil);
        setIsEpee(!!fencer.is_epee);
        setIsSaber(!!fencer.is_saber);
        setCoachRole(fencer.coach_role || 'NONE');
    }, [open, fencer]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        await onUpdateFencer({
            id: fencer.id,
            first_name: firstName,
            last_name: lastName,
            year_of_birth: parseInt(yearOfBirth) || fencer.year_of_birth,
            usaf_id: parseInt(usafId) || fencer.usaf_id,
            sex: sex || null,
            last_membership_renewal: fencer.last_membership_renewal, // preserve
            is_foil: isFoil,
            is_epee: isEpee,
            is_saber: isSaber,
            coach_role: coachRole,
        });
    };

    // --- Memberships Queries & Mutations ---
    const { data: memberships = [], isLoading: membershipsLoading } = useFencerMemberships(fencer.id);
    const createMembership = useCreateMembership();
    const updateMembership = useUpdateMembership();
    const deleteMembership = useDeleteMembership();

    const [membershipFormOpen, setMembershipFormOpen] = useState(false);
    const [editingMembership, setEditingMembership] = useState<FencerMembership | null>(null);
    const [mStartDate, setMStartDate] = useState('');
    const [mEndDate, setMEndDate] = useState('');
    const [mType, setMType] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

    // Auto-calculate end date when start date or type changes
    useEffect(() => {
        if (!mStartDate) return;
        const start = new Date(mStartDate + 'T12:00:00'); // avoid timezone offsets
        if (mType === 'MONTHLY') {
            start.setMonth(start.getMonth() + 1);
        } else {
            start.setFullYear(start.getFullYear() + 1);
        }
        // format back to YYYY-MM-DD
        const yyyy = start.getFullYear();
        const mm = String(start.getMonth() + 1).padStart(2, '0');
        const dd = String(start.getDate()).padStart(2, '0');
        setMEndDate(`${yyyy}-${mm}-${dd}`);
    }, [mStartDate, mType]);

    const openAddMembership = () => {
        setEditingMembership(null);
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        setMStartDate(`${yyyy}-${mm}-${dd}`);
        setMType('MONTHLY');
        setMembershipFormOpen(true);
    };

    const openEditMembership = (m: FencerMembership) => {
        setEditingMembership(m);
        setMStartDate(m.start_date);
        setMEndDate(m.end_date);
        setMType(m.type);
        setMembershipFormOpen(true);
    };

    const handleMembershipSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingMembership) {
            await updateMembership.mutateAsync({
                id: editingMembership.id,
                fencer_id: fencer.id,
                start_date: mStartDate,
                end_date: mEndDate,
                type: mType,
            });
        } else {
            await createMembership.mutateAsync({
                fencer_id: fencer.id,
                start_date: mStartDate,
                end_date: mEndDate,
                type: mType,
            });
        }
        setMembershipFormOpen(false);
    };

    const handleDeleteMembership = async (id: string) => {
        if (confirm('Are you sure you want to delete this membership record?')) {
            await deleteMembership.mutateAsync({ id, fencerId: fencer.id });
        }
    };

    // Check if currently active fencer is a member today
    const todayStr = new Date().toISOString().split('T')[0];
    const isCurrentlyMember = isMemberOnDate(memberships, todayStr);

    // --- Class History & Billings ---
    const { data: classHistory = [], isLoading: historyLoading } = useFencerClassHistory(fencer.id);
    const { data: billings = [], isLoading: billingsLoading } = useFencerBillings(fencer.id);
    const createBilling = useCreateBilling();
    const updateBillingStatus = useUpdateBillingStatus();
    const deleteBilling = useDeleteBilling();

    const [billingDialogOpen, setBillingDialogOpen] = useState(false);
    const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
    const [billingDate, setBillingDate] = useState(todayStr);
    const [billingStatus, setBillingStatus] = useState<'PENDING' | 'PAID' | 'CANCELLED'>('PENDING');

    const unbilledSessions = classHistory.filter(h => !h.billingId);

    // Initialize/toggle selection of unbilled sessions
    const toggleSessionSelection = (sessionId: string) => {
        setSelectedSessionIds(prev =>
            prev.includes(sessionId)
                ? prev.filter(id => id !== sessionId)
                : [...prev, sessionId]
        );
    };

    // Auto-select all unbilled sessions when opening dialog
    useEffect(() => {
        if (billingDialogOpen) {
            setSelectedSessionIds(unbilledSessions.map(s => s.classSessionId));
            setBillingDate(todayStr);
            setBillingStatus('PENDING');
        }
    }, [billingDialogOpen]);

    // Compute cost per selected session based on membership status on that class date
    const computeSessionCost = (item: FencerClassHistoryItem) => {
        const hasMemberStatus = isMemberOnDate(memberships, item.date);
        const basePrice = hasMemberStatus ? item.memberPrice : item.nonMemberPrice;
        return basePrice * item.fraction;
    };

    const computedTotal = selectedSessionIds.reduce((sum, id) => {
        const item = unbilledSessions.find(s => s.classSessionId === id);
        return sum + (item ? computeSessionCost(item) : 0);
    }, 0);

    const handleCreateBilling = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedSessionIds.length === 0) return;
        await createBilling.mutateAsync({
            fencerId: fencer.id,
            amount: computedTotal,
            status: billingStatus,
            billingDate,
            sessionIds: selectedSessionIds,
        });
        setBillingDialogOpen(false);
    };

    const handleDeleteBilling = async (id: string) => {
        if (confirm('Are you sure you want to delete this billing invoice? Attended classes in it will return to unbilled state.')) {
            await deleteBilling.mutateAsync({ id, fencerId: fencer.id });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-2 border-b shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl font-bold">{fencer.first_name} {fencer.last_name}</DialogTitle>
                            <DialogDescription>Fencer Account & Membership Portal</DialogDescription>
                        </div>
                        <div>
                            {isCurrentlyMember ? (
                                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20">Active Member</Badge>
                            ) : (
                                <Badge variant="secondary" className="text-muted-foreground bg-muted">Non-Member / Expired</Badge>
                            )}
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'profile' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                        >
                            <User className="h-3.5 w-3.5" /> Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('memberships')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'memberships' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                        >
                            <Calendar className="h-3.5 w-3.5" /> Memberships
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'history' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                        >
                            <Clock className="h-3.5 w-3.5" /> Class Attendance
                        </button>
                        <button
                            onClick={() => setActiveTab('billings')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'billings' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                        >
                            <CreditCard className="h-3.5 w-3.5" /> Billings
                        </button>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 min-h-0">
                    {/* Tab 1: Profile */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="firstNameAcc">First Name</Label>
                                    <Input id="firstNameAcc" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="lastNameAcc">Last Name</Label>
                                    <Input id="lastNameAcc" value={lastName} onChange={e => setLastName(e.target.value)} required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="usafIdAcc">USAF ID</Label>
                                    <Input id="usafIdAcc" type="number" value={usafId} onChange={e => setUsafId(e.target.value)} required />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="yobAcc">Birth Year</Label>
                                    <Input id="yobAcc" type="number" value={yearOfBirth} onChange={e => setYearOfBirth(e.target.value)} required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 items-center pt-2">
                                <div className="space-y-1.5">
                                    <Label>Sex</Label>
                                    <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-0.5 max-w-[200px]">
                                        <button
                                            type="button"
                                            onClick={() => setSex('M')}
                                            className={`flex-1 py-1 rounded-md text-xs font-medium transition-colors ${sex === 'M' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            Male
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSex('F')}
                                            className={`flex-1 py-1 rounded-md text-xs font-medium transition-colors ${sex === 'F' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            Female
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="coachRoleAcc">Coach Role</Label>
                                    <Select value={coachRole} onValueChange={(val: any) => setCoachRole(val)}>
                                        <SelectTrigger id="coachRoleAcc">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="NONE">Fencer Only</SelectItem>
                                            <SelectItem value="TEMPORARY">Temporary Coach</SelectItem>
                                            <SelectItem value="FULL">Full Coach</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-1.5 pt-2">
                                <Label>Weapons</Label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
                                        <input type="checkbox" checked={isFoil} onChange={e => setIsFoil(e.target.checked)} className="cursor-pointer" /> Foil
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
                                        <input type="checkbox" checked={isEpee} onChange={e => setIsEpee(e.target.checked)} className="cursor-pointer" /> Epee
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
                                        <input type="checkbox" checked={isSaber} onChange={e => setIsSaber(e.target.checked)} className="cursor-pointer" /> Saber
                                    </label>
                                </div>
                            </div>
                            <DialogFooter className="pt-4 border-t shrink-0">
                                <Button type="submit">Save Profile Changes</Button>
                            </DialogFooter>
                        </form>
                    )}

                    {/* Tab 2: Memberships */}
                    {activeTab === 'memberships' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-semibold">Membership Periods</h3>
                                {!membershipFormOpen && (
                                    <Button size="sm" onClick={openAddMembership} className="h-8 text-xs gap-1">
                                        <Plus className="h-3.5 w-3.5" /> Add Membership
                                    </Button>
                                )}
                            </div>

                            {membershipFormOpen && (
                                <form onSubmit={handleMembershipSubmit} className="bg-muted/30 border rounded-lg p-4 space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        {editingMembership ? 'Edit Membership Period' : 'Add Membership Period'}
                                    </h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-1">
                                            <Label htmlFor="mType">Type</Label>
                                            <Select value={mType} onValueChange={(val: any) => setMType(val)}>
                                                <SelectTrigger id="mType" className="h-8 text-xs">
                                                    <SelectValue placeholder="Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                                                    <SelectItem value="YEARLY">Yearly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="mStart">Start Date</Label>
                                            <Input id="mStart" type="date" value={mStartDate} onChange={e => setMStartDate(e.target.value)} className="h-8 text-xs" required />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="mEnd">End Date</Label>
                                            <Input id="mEnd" type="date" value={mEndDate} onChange={e => setMEndDate(e.target.value)} className="h-8 text-xs" required />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button type="button" variant="outline" size="sm" onClick={() => setMembershipFormOpen(false)} className="h-8 text-xs">Cancel</Button>
                                        <Button type="submit" size="sm" className="h-8 text-xs">Save</Button>
                                    </div>
                                </form>
                            )}

                            {membershipsLoading ? (
                                <p className="text-xs text-muted-foreground text-center py-4">Loading memberships...</p>
                            ) : memberships.length === 0 ? (
                                <p className="text-xs text-muted-foreground italic text-center py-8">No memberships recorded.</p>
                            ) : (
                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-muted/40">
                                            <TableRow>
                                                <TableHead className="text-xs">Type</TableHead>
                                                <TableHead className="text-xs">Start Date</TableHead>
                                                <TableHead className="text-xs">End Date</TableHead>
                                                <TableHead className="text-xs">Status</TableHead>
                                                <TableHead className="w-[80px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {memberships.map(m => {
                                                const isActive = todayStr >= m.start_date && todayStr <= m.end_date;
                                                return (
                                                    <TableRow key={m.id} className="hover:bg-muted/5">
                                                        <TableCell className="font-semibold text-xs py-2">{m.type}</TableCell>
                                                        <TableCell className="text-xs py-2">{m.start_date}</TableCell>
                                                        <TableCell className="text-xs py-2">{m.end_date}</TableCell>
                                                        <TableCell className="py-2">
                                                            {isActive ? (
                                                                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20 text-[10px] py-0 px-1.5 h-5">Active</Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-5">Expired</Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="py-2">
                                                            <div className="flex gap-1">
                                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditMembership(m)}>
                                                                    <Pencil className="h-3 w-3" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteMembership(m.id)}>
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 3: Attendance History */}
                    {activeTab === 'history' && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold">Class Attendance Record</h3>
                            {historyLoading ? (
                                <p className="text-xs text-muted-foreground text-center py-4">Loading attendance...</p>
                            ) : classHistory.length === 0 ? (
                                <p className="text-xs text-muted-foreground italic text-center py-8">No class attendances found.</p>
                            ) : (
                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-muted/40">
                                            <TableRow>
                                                <TableHead className="text-xs">Class Name</TableHead>
                                                <TableHead className="text-xs">Date</TableHead>
                                                <TableHead className="text-xs">Class Type</TableHead>
                                                <TableHead className="text-xs">Billing Status</TableHead>
                                                <TableHead className="text-xs text-right">Price Charged</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {classHistory.map((item, idx) => {
                                                const hasMemberStatus = isMemberOnDate(memberships, item.date);
                                                const price = computeSessionCost(item);
                                                return (
                                                    <TableRow key={idx} className="hover:bg-muted/5">
                                                        <TableCell className="font-semibold text-xs py-2">
                                                            <div>{item.className}</div>
                                                            {item.minutesMissed > 0 ? (
                                                                <div className="text-[10px] text-muted-foreground font-normal">
                                                                    Missed {item.minutesMissed}m of {item.durationMinutes}m ({Math.round(item.fraction * 100)}% attended)
                                                                </div>
                                                            ) : (
                                                                <div className="text-[10px] text-muted-foreground font-normal">
                                                                    Attended Full Class ({item.durationMinutes}m)
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-xs py-2">{item.date}</TableCell>
                                                        <TableCell className="text-xs py-2">{item.classTypeName}</TableCell>
                                                        <TableCell className="py-2">
                                                            {item.billingId ? (
                                                                <Badge className="bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 border-sky-500/20 text-[10px] py-0 px-1.5 h-5">Billed</Badge>
                                                            ) : (
                                                                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-5 text-muted-foreground bg-muted">Unbilled</Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right text-xs py-2 font-mono">
                                                            ${price.toFixed(2)}{' '}
                                                            <span className="text-[9px] text-muted-foreground">
                                                                ({hasMemberStatus ? 'Member rate' : 'Non-member rate'})
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 4: Billings */}
                    {activeTab === 'billings' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-semibold">Billing Invoices</h3>
                                <Button size="sm" onClick={() => setBillingDialogOpen(true)} className="h-8 text-xs gap-1" disabled={unbilledSessions.length === 0}>
                                    <Plus className="h-3.5 w-3.5" /> Create Billing
                                </Button>
                            </div>

                            {billingsLoading ? (
                                <p className="text-xs text-muted-foreground text-center py-4">Loading billings...</p>
                            ) : billings.length === 0 ? (
                                <p className="text-xs text-muted-foreground italic text-center py-8">No billing invoices found.</p>
                            ) : (
                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-muted/40">
                                            <TableRow>
                                                <TableHead className="text-xs">Invoice Date</TableHead>
                                                <TableHead className="text-xs">Amount</TableHead>
                                                <TableHead className="text-xs">Status</TableHead>
                                                <TableHead className="w-[120px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {billings.map(b => (
                                                <TableRow key={b.id} className="hover:bg-muted/5">
                                                    <TableCell className="text-xs py-2 font-medium">{b.billing_date}</TableCell>
                                                    <TableCell className="text-xs py-2 font-mono font-bold">${Number(b.amount).toFixed(2)}</TableCell>
                                                    <TableCell className="py-2">
                                                        <Select
                                                            value={b.status}
                                                            onValueChange={(val: any) => updateBillingStatus.mutate({ id: b.id, status: val })}
                                                        >
                                                            <SelectTrigger className="h-7 text-[10px] w-[90px] px-2">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="PENDING">Pending</SelectItem>
                                                                <SelectItem value="PAID">Paid</SelectItem>
                                                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell className="py-2 text-right">
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteBilling(b.id)}>
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>

            {/* Create Billing Dialog */}
            <Dialog open={billingDialogOpen} onOpenChange={setBillingDialogOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col p-6">
                    <DialogHeader className="pb-4 border-b">
                        <DialogTitle>Create New Billing Invoice</DialogTitle>
                        <DialogDescription>Select the fencer's attended classes to include in this bill.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateBilling} className="flex-1 flex flex-col space-y-4 min-h-0 pt-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="bDate">Invoice Date</Label>
                                <Input id="bDate" type="date" value={billingDate} onChange={e => setBillingDate(e.target.value)} required />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="bStatus">Initial Status</Label>
                                <Select value={billingStatus} onValueChange={(val: any) => setBillingStatus(val)}>
                                    <SelectTrigger id="bStatus">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDING">Pending</SelectItem>
                                        <SelectItem value="PAID">Paid</SelectItem>
                                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto border rounded-lg max-h-[30vh]">
                            <Table>
                                <TableHeader className="bg-muted/40 sticky top-0 z-10">
                                    <TableRow>
                                        <TableHead className="w-[40px]"></TableHead>
                                        <TableHead className="text-xs">Class Details</TableHead>
                                        <TableHead className="text-xs text-right">Price</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {unbilledSessions.map(item => {
                                        const isSelected = selectedSessionIds.includes(item.classSessionId);
                                        const price = computeSessionCost(item);
                                        return (
                                            <TableRow key={item.classSessionId} className="hover:bg-muted/5 cursor-pointer" onClick={() => toggleSessionSelection(item.classSessionId)}>
                                                <TableCell className="p-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => {}} // toggled by Row click
                                                        className="cursor-pointer"
                                                    />
                                                </TableCell>
                                                <TableCell className="p-2">
                                                    <div className="font-semibold text-xs">{item.className}</div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        {item.date} • {item.classTypeName}
                                                        {item.minutesMissed > 0 && ` • Missed ${item.minutesMissed}m of ${item.durationMinutes}m`}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="p-2 text-right text-xs font-mono">
                                                    ${price.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex items-center justify-between border-t pt-4">
                            <span className="text-sm font-semibold">Total Invoice Amount:</span>
                            <span className="text-lg font-bold font-mono text-primary">${computedTotal.toFixed(2)}</span>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setBillingDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={selectedSessionIds.length === 0 || createBilling.isPending}>
                                {createBilling.isPending ? 'Generating...' : `Generate Billing (${selectedSessionIds.length})`}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
};
