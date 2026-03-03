import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate } from '@tanstack/react-router';
import { useClassSessionsByDate } from '../../hooks/useClassSessions';
import { useFencers } from '../../hooks/useFencers';
import { useAttendeesForSession, useAddAttendee } from '../../hooks/useClassAttendees';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, Search, UserCheck, Settings } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatTime } from '@/lib/utils';
import type { ClassSession } from '@preload/index';
import { KioskClassCard } from '../kiosk/KioskClassCard';

// Default PIN — in a production build this should come from the database
const ADMIN_PIN = '1234';

/** Check whether a session's official duration has elapsed. */
const isSessionExpired = (session: ClassSession, now: Date): boolean => {
    if (!session.start_time) return false;
    const [h, m] = session.start_time.split(':').map(Number);
    const startMinutes = h * 60 + m;
    const endMinutes = startMinutes + (session.duration_minutes || 0);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return nowMinutes >= endMinutes;
};

/** Custom hook that ticks every 60 s so expired state stays current. */
const useMinuteClock = () => {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(id);
    }, []);
    return now;
};


export const KioskLayout = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const { data: sessions, isLoading } = useClassSessionsByDate(todayStr);
    const { data: allFencers } = useFencers();
    const addAttendee = useAddAttendee();
    const now = useMinuteClock();

    const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Success overlay state
    const [successFencerName, setSuccessFencerName] = useState<string | null>(null);

    // PIN dialog state for Kiosk → Admin transition
    const [pinDialogOpen, setPinDialogOpen] = useState(false);
    const [pinValue, setPinValue] = useState('');
    const [pinError, setPinError] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const navigate = useNavigate();

    // Fetch attendees for the specific session we are looking at to prevent double sign-ins
    const { data: currentAttendees } = useAttendeesForSession(selectedSession?.id || null);

    const handlePinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsVerifying(true);
        setPinError(false);
        try {
            const result = await window.api.verifyAdminPin(pinValue);
            if (result.success) {
                setPinDialogOpen(false);
                navigate({ to: '/admin' });
            } else {
                setPinError(true);
                setPinValue('');
            }
        } catch (err) {
            setPinError(true);
            setPinValue('');
        } finally {
            setIsVerifying(false);
        }
    };

    const openSignIn = (session: ClassSession) => {
        setSelectedSession(session);
        setDialogOpen(true);
    };

    const handleSignIn = async (fencerId: number, fencerName: string) => {
        if (!selectedSession?.id) return;

        await addAttendee.mutateAsync({ sessionId: selectedSession.id, fencerId });

        // Trigger success animation
        setDialogOpen(false);
        setSuccessFencerName(fencerName);

        // Auto-dismiss after 2.5 seconds
        setTimeout(() => {
            setSuccessFencerName(null);
            setSelectedSession(null);
        }, 2500);
    };

    // Filter out fencers who already signed in
    const availableFencers = allFencers?.filter(f => !currentAttendees?.some(a => a.id === f.id)) || [];

    // Partition sessions into active and expired
    const activeSessions = sessions?.filter(s => !isSessionExpired(s, now)) || [];
    const expiredSessions = sessions?.filter(s => isSessionExpired(s, now)) || [];

    return (
        <div className="h-screen w-full bg-background flex flex-col relative overflow-hidden selection:bg-primary/20">

            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <div className="pt-16 pb-12 px-8 text-center z-10">
                <h1 className="text-6xl font-black tracking-tighter text-foreground drop-shadow-sm mb-4">
                    Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Medeo Fencing</span>
                </h1>
                <p className="text-2xl text-muted-foreground font-medium">
                    {format(new Date(), 'EEEE, MMMM do')} &mdash; Select your class to sign in
                </p>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto px-8 pb-32 z-10 w-full max-w-5xl mx-auto">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <span className="text-xl text-muted-foreground animate-pulse">Loading today's schedule...</span>
                    </div>
                ) : !sessions || sessions.length === 0 ? (
                    <Card className="p-16 text-center bg-card/50 backdrop-blur-sm border-dashed">
                        <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-50" />
                        <h3 className="text-2xl font-semibold mb-2">No Classes Scheduled</h3>
                        <p className="text-muted-foreground text-lg">There are no classes actively scheduled for today.</p>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {/* Active / Upcoming Classes */}
                        {activeSessions.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {activeSessions.map(session => (
                                    <KioskClassCard
                                        key={session.id}
                                        session={session}
                                        expired={false}
                                        onClick={() => openSignIn(session)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Expired Classes — collapsed */}
                        {expiredSessions.length > 0 && (
                            <div className="space-y-2">
                                {activeSessions.length > 0 && (
                                    <p className="text-xs text-muted-foreground/60 uppercase tracking-wider font-semibold px-1 pt-2">Earlier Today</p>
                                )}
                                {expiredSessions.map(session => (
                                    <KioskClassCard
                                        key={session.id}
                                        session={session}
                                        expired={true}
                                        onClick={() => openSignIn(session)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Exit to Admin — requires PIN */}
            <div className="fixed bottom-8 right-8 z-50">
                <button
                    onClick={() => { setPinDialogOpen(true); setPinValue(''); setPinError(false); }}
                    className="px-5 py-3 rounded-full border border-border/50 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shadow-sm bg-background/80 backdrop-blur-md flex items-center gap-2"
                >
                    <Settings className="h-4 w-4" />
                    Manager Access
                </button>
            </div>

            {/* Sign In Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl">
                    <DialogHeader className="p-8 bg-muted/30 border-b">
                        <DialogTitle className="text-3xl font-bold">Who is signing in?</DialogTitle>
                        <DialogDescription className="text-xl mt-2">
                            {selectedSession?.template_name} at {selectedSession?.start_time ? formatTime(selectedSession.start_time) : ''}
                        </DialogDescription>
                    </DialogHeader>

                    <Command className="border-0 rounded-none bg-background">
                        <div className="flex items-center border-b px-6 py-4">
                            <Search className="mr-4 h-6 w-6 shrink-0 opacity-50" />
                            <CommandInput
                                placeholder="Type your name to search..."
                                className="h-14 text-2xl outline-none placeholder:text-muted-foreground/50 flex-1 bg-transparent"
                            />
                        </div>
                        <CommandList className="max-h-[50vh] p-2">
                            <CommandEmpty className="p-8 text-center text-lg text-muted-foreground">
                                No fencers found matching that name.
                            </CommandEmpty>
                            <CommandGroup>
                                {availableFencers.map((fencer) => (
                                    <CommandItem
                                        key={fencer.id}
                                        value={`${fencer.last_name} ${fencer.first_name}`}
                                        onSelect={() => handleSignIn(fencer.id, `${fencer.first_name} ${fencer.last_name}`)}
                                        className="cursor-pointer text-2xl py-6 px-6 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors mb-1"
                                    >
                                        <div className="flex justify-between items-center w-full">
                                            <span>
                                                <span className="font-bold">{fencer.last_name}</span>, {fencer.first_name}
                                            </span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </DialogContent>
            </Dialog>

            {/* PIN Dialog for Admin Access */}
            <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
                <DialogContent className="sm:max-w-[340px]">
                    <form onSubmit={handlePinSubmit}>
                        <DialogHeader>
                            <DialogTitle>Manager Access</DialogTitle>
                            <DialogDescription>Enter the 4-digit admin PIN to continue.</DialogDescription>
                        </DialogHeader>
                        <div className="py-6">
                            <Input
                                type="password"
                                inputMode="numeric"
                                maxLength={4}
                                placeholder="••••"
                                value={pinValue}
                                onChange={(e) => { setPinValue(e.target.value); setPinError(false); }}
                                className="text-center text-3xl tracking-[0.5em] h-16 font-mono"
                                autoFocus
                            />
                            {pinError && (
                                <p className="text-destructive text-sm text-center mt-3">Incorrect PIN. Try again.</p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setPinDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={pinValue.length !== 4 || isVerifying}>
                                {isVerifying ? 'Unlocking...' : 'Unlock'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Success Overlay Animation */}
            <AnimatePresence>
                {successFencerName && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
                            className="flex flex-col items-center text-center px-6"
                        >
                            <div className="w-32 h-32 rounded-full bg-green-500/20 flex items-center justify-center mb-8">
                                <CheckCircle className="w-20 h-20 text-green-500" />
                            </div>
                            <h2 className="text-5xl font-black mb-4">You're Signed In!</h2>
                            <p className="text-3xl text-muted-foreground">
                                Have a great class, <span className="text-foreground font-bold">{successFencerName}</span>.
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};
