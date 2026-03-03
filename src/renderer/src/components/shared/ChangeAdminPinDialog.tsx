import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound } from 'lucide-react';

export const ChangeAdminPinDialog = () => {
    const [open, setOpen] = useState(false);
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (newPin.length !== 4 || confirmPin.length !== 4) {
            setError('New PIN must be exactly 4 digits.');
            return;
        }

        if (newPin !== confirmPin) {
            setError('New PINs do not match.');
            return;
        }

        setIsSaving(true);
        try {
            const result = await window.api.updateAdminPin(currentPin, newPin);
            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    setOpen(false);
                    // Reset state for next time
                    setCurrentPin('');
                    setNewPin('');
                    setConfirmPin('');
                    setSuccess(false);
                }, 1500);
            } else {
                setError(result.error || 'Failed to update PIN.');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
                setCurrentPin(''); setNewPin(''); setConfirmPin(''); setError(null); setSuccess(false);
            }
        }}>
            <DialogTrigger asChild>
                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors self-end sm:self-auto py-1">
                    <KeyRound className="h-4 w-4" />
                    <span>Change PIN</span>
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Change Admin PIN</DialogTitle>
                        <DialogDescription>
                            Update the 4-digit PIN used to access the manager dashboard.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {success ? (
                            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                    <KeyRound className="w-6 h-6" />
                                </div>
                                <p className="font-semibold text-lg text-foreground">PIN Updated Successfully</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="currentPin">Current PIN</Label>
                                    <Input
                                        id="currentPin"
                                        type="password"
                                        inputMode="numeric"
                                        maxLength={4}
                                        value={currentPin}
                                        onChange={(e) => { setCurrentPin(e.target.value); setError(null); }}
                                        required
                                        className="font-mono tracking-widest text-center text-lg"
                                        placeholder="••••"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="newPin">New PIN</Label>
                                        <Input
                                            id="newPin"
                                            type="password"
                                            inputMode="numeric"
                                            maxLength={4}
                                            value={newPin}
                                            onChange={(e) => { setNewPin(e.target.value); setError(null); }}
                                            required
                                            className="font-mono tracking-widest text-center text-lg"
                                            placeholder="••••"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPin">Confirm New</Label>
                                        <Input
                                            id="confirmPin"
                                            type="password"
                                            inputMode="numeric"
                                            maxLength={4}
                                            value={confirmPin}
                                            onChange={(e) => { setConfirmPin(e.target.value); setError(null); }}
                                            required
                                            className="font-mono tracking-widest text-center text-lg"
                                            placeholder="••••"
                                        />
                                    </div>
                                </div>
                                {error && <p className="text-sm font-medium text-destructive mt-1">{error}</p>}
                            </>
                        )}
                    </div>
                    {!success && (
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSaving || currentPin.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4}>
                                {isSaving ? 'Saving...' : 'Update PIN'}
                            </Button>
                        </DialogFooter>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    );
};
