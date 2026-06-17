import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate } from '@tanstack/react-router';
import { useClassSessionsByDate } from '../../hooks/useClassSessions';
import { useSpecialEventsByDate } from '../../hooks/useSpecialEvents';
import { useFencers } from '../../hooks/useFencers';
import { useAttendeesForSession, useAddAttendee } from '../../hooks/useClassAttendees';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, Search, Settings } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatTime } from '@/lib/utils';
import type { ClassSession } from '@preload/index';
import { KioskClassCard } from '../kiosk/KioskClassCard';
import { supabase } from '../../lib/supabase';


/** Check whether a session's official duration has elapsed. */
const isSessionExpired = (session: ClassSession, now: Date): boolean => {
    if (!session.start_time) return false;
    const [h, m] = session.start_time.split(':').map(Number);
    const startMinutes = h * 60 + m;
    const endMinutes = startMinutes + (session.duration_minutes || 0);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return nowMinutes >= endMinutes;
};

const isOpenBouting = (sessionName?: string | null, templateName?: string | null): boolean => {
    const name = (sessionName || templateName || '').toLowerCase();
    return name.includes('open fencing') || name.includes('open bouting');
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

const SUCCESS_OVERLAY_DURATION_MS = 2500;

export const KioskLayout = () => {
    const now = useMinuteClock();
    const todayStr = format(now, 'yyyy-MM-dd');
    const { data: sessions, isLoading } = useClassSessionsByDate(todayStr);
    const { data: specialEvents } = useSpecialEventsByDate(todayStr);
    const { data: allFencersData } = useFencers();
    const allFencers = allFencersData?.items || [];
    const addAttendee = useAddAttendee();

    const cancellingEvent = specialEvents?.find(e => e.cancels_classes);

    const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedFencer, setSelectedFencer] = useState<{ id: string; name: string } | null>(null);

    // Soft-login session states
    const [sessionFencer, setSessionFencer] = useState<{ id: string; name: string } | null>(null);
    const [sessionRegistrations, setSessionRegistrations] = useState<{ className: string; fraction: number }[]>([]);
    const [showConfirmView, setShowConfirmView] = useState(false);
    const [registeredSessionIds, setRegisteredSessionIds] = useState<string[]>([]);

    // Success overlay state
    const [successFencerName, setSuccessFencerName] = useState<string | null>(null);
    const [finalSuccessRegistrations, setFinalSuccessRegistrations] = useState<{ className: string; fraction: number }[]>([]);

    // PIN dialog state for Kiosk → Admin transition
    const [pinDialogOpen, setPinDialogOpen] = useState(false);
    const [pinValue, setPinValue] = useState('');
    const [pinError, setPinError] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const navigate = useNavigate();

    // 10-second auto-timeout for active sessions
    useEffect(() => {
        if (!sessionFencer) return;

        let timeoutId: NodeJS.Timeout;

        const resetTimeout = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                // Clear session due to inactivity
                setSessionFencer(null);
                setSessionRegistrations([]);
                setShowConfirmView(false);
                setDialogOpen(false);
                setSelectedSession(null);
                setSelectedFencer(null);
                setRegisteredSessionIds([]);
            }, 10000); // 10 seconds auto-timeout
        };

        // Reset initially
        resetTimeout();

        // Listen for user interactions to keep session alive
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        const handleInteraction = () => resetTimeout();
        
        events.forEach(event => {
            window.addEventListener(event, handleInteraction);
        });

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            events.forEach(event => {
                window.removeEventListener(event, handleInteraction);
            });
        };
    }, [sessionFencer]);

    // Fetch registered sessions for this fencer today to prevent showing them in checkbox list
    useEffect(() => {
        if (!selectedFencer || !sessions) {
            setRegisteredSessionIds([]);
            return;
        }

        const checkRegistrations = async () => {
            try {
                const sessionIds = sessions.map(s => s.id).filter(Boolean);
                if (sessionIds.length === 0) {
                    setRegisteredSessionIds([]);
                    return;
                }
                const { data, error } = await supabase
                    .from('class_attendees')
                    .select('class_session_id')
                    .eq('fencer_id', selectedFencer.id)
                    .in('class_session_id', sessionIds);
                if (error) throw error;
                const registeredIds = (data || []).map(row => row.class_session_id);
                setRegisteredSessionIds(registeredIds);
            } catch (e) {
                console.error("Error checking attendees:", e);
                setRegisteredSessionIds([]);
            }
        };

        checkRegistrations();
    }, [selectedFencer, sessions]);

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
        if (sessionFencer) {
            setSelectedFencer(sessionFencer);
        } else {
            setSelectedFencer(null);
        }
        setShowConfirmView(false);
        setDialogOpen(true);
    };

    const handleSignIn = async (fencerId: string, fencerName: string, fraction: number, customSession?: ClassSession) => {
        const targetSession = customSession || selectedSession;
        if (!targetSession?.id) return;

        await addAttendee.mutateAsync({ sessionId: targetSession.id, fencerId, fraction, date: todayStr });

        const className = targetSession.template_name || targetSession.name || 'Class';
        setSessionRegistrations(prev => [...prev, { className, fraction }]);
        setSessionFencer({ id: fencerId, name: fencerName });
        setRegisteredSessionIds(prev => [...prev, targetSession.id]);
        setShowConfirmView(true);
    };


    // Filter out fencers who already signed in for the active card
    const availableFencers = allFencers?.filter(f => !currentAttendees?.some(a => a.id === f.id)) || [];

    // Filter available sessions for checkbox selection based on weapons
    const fencerDetails = allFencers.find(f => f.id === selectedFencer?.id);
    const eligibleSessions = sessions?.filter(s => {
        if (!s.id || s.id === selectedSession?.id) return false;
        if (registeredSessionIds.includes(s.id)) return false;
        if (isSessionExpired(s, now)) return false;

        if (!s.weapon) return true;
        const w = s.weapon.toLowerCase();
        if (w === 'all' || w === 'all-weapon') return true;

        if (!fencerDetails) return false;
        if (w === 'foil' && fencerDetails.is_foil) return true;
        if (w === 'epee' && fencerDetails.is_epee) return true;
        if (w === 'saber' || w === 'sabre') {
            if (fencerDetails.is_saber) return true;
        }
        return false;
    }) || [];

    // Partition sessions into active and expired
    const activeSessions = sessions?.filter(s => !isSessionExpired(s, now)) || [];
    const expiredSessions = sessions?.filter(s => isSessionExpired(s, now)) || [];

    return (
        <div className="h-screen w-full bg-background flex flex-col relative overflow-hidden selection:bg-primary/20">

            {/* Active Session Banner */}
            {sessionFencer && (
                <div className="bg-primary/10 border-b border-primary/20 py-4 px-8 text-center flex justify-between items-center gap-4 z-20 shadow-md">
                    <span className="text-lg font-semibold text-primary">
                        Signing in as: <span className="font-black text-foreground text-xl ml-1">{sessionFencer.name}</span>
                    </span>
                    <button
                        onClick={() => {
                            setSessionFencer(null);
                            setSessionRegistrations([]);
                            setDialogOpen(false);
                            setShowConfirmView(false);
                            setRegisteredSessionIds([]);
                        }}
                        className="text-sm bg-destructive/10 hover:bg-destructive/20 text-destructive px-4 py-2 rounded-full border border-destructive/20 transition-colors cursor-pointer font-bold"
                    >
                        Log Out (Clear Session)
                    </button>
                </div>
            )}

            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <div className="pt-16 pb-12 px-8 text-center z-10">
                <h1 className="text-6xl font-black tracking-tighter text-foreground drop-shadow-sm mb-4">
                    Welcome to <span className="text-primary">Medeo Fencing</span>
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
                ) : (
                    <div className="space-y-6">
                        {cancellingEvent && (
                            <Card className="p-12 text-center bg-destructive/10 border-destructive/30 border-2">
                                <h2 className="text-3xl font-bold text-foreground mb-4">
                                    {cancellingEvent.name}
                                </h2>
                                <p className="text-xl text-muted-foreground">
                                    Regular classes are cancelled today for this special event.
                                </p>
                            </Card>
                        )}

                        {!sessions || sessions.length === 0 ? (
                            !cancellingEvent && (
                                <Card className="p-16 text-center bg-card/50 backdrop-blur-sm border-dashed">
                                    <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-50" />
                                    <h3 className="text-2xl font-semibold mb-2">No Classes Scheduled</h3>
                                    <p className="text-muted-foreground text-lg">There are no classes actively scheduled for today.</p>
                                </Card>
                            )
                        ) : (
                            <>
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
                            </>
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
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setSelectedFencer(null); setShowConfirmView(false); } }}>
                <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl">
                    <DialogHeader className="p-8 bg-muted/30 border-b">
                        <DialogTitle className="text-3xl font-bold">
                            {showConfirmView 
                                ? 'Registration Confirmed!' 
                                : selectedFencer ? 'Select Participation' : 'Who is signing in?'}
                        </DialogTitle>
                        <DialogDescription className="text-xl mt-2">
                            {showConfirmView 
                                ? `You have signed in for class.`
                                : selectedFencer 
                                    ? `Signing in: ${selectedFencer.name}` 
                                    : `${selectedSession?.template_name || ''} at ${selectedSession?.start_time ? formatTime(selectedSession.start_time) : ''}`}
                        </DialogDescription>
                    </DialogHeader>

                    {showConfirmView ? (
                        <div className="p-8 space-y-6 bg-background">
                            <div className="space-y-3">
                                {sessionRegistrations.map((reg, idx) => (
                                    <div key={idx} className="bg-green-500/10 border border-green-500/25 p-4 rounded-xl flex items-center justify-between">
                                        <span className="text-xl font-bold text-green-600 dark:text-green-400">
                                            Registered: {reg.className}
                                        </span>
                                        <span className="text-sm font-semibold bg-green-500/20 text-green-700 dark:text-green-300 px-3 py-1 rounded-full">
                                            {reg.fraction === 1.0 ? 'Whole Class' : `${reg.fraction} Class`}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {eligibleSessions.length > 0 && (
                                <div className="space-y-3 pt-2">
                                    <h4 className="text-lg font-bold text-muted-foreground uppercase tracking-wider">Other Eligible Classes Today:</h4>
                                    <p className="text-sm text-muted-foreground">Select another class if you also want to sign in for it:</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[35vh] overflow-y-auto pr-1">
                                        {eligibleSessions.map(session => (
                                            <div
                                                key={session.id}
                                                onClick={async () => {
                                                    if (isOpenBouting(session.name, session.template_name) && selectedFencer) {
                                                        await handleSignIn(selectedFencer.id, selectedFencer.name, 1.0, session);
                                                    } else {
                                                        setSelectedSession(session);
                                                        setShowConfirmView(false);
                                                    }
                                                }}
                                                className="p-5 rounded-2xl border border-border/40 hover:border-primary hover:bg-primary/5 transition-all select-none cursor-pointer flex flex-col justify-between h-32"
                                            >
                                                <div>
                                                    <div className="font-extrabold text-lg truncate text-foreground">{session.template_name || session.name}</div>
                                                    <div className="text-sm text-muted-foreground mt-1">
                                                        {formatTime(session.start_time)} ({session.duration_minutes}m)
                                                    </div>
                                                </div>
                                                {session.weapon && (
                                                    <div className="mt-2">
                                                        <span className="uppercase text-[10px] font-extrabold px-1.5 py-0.5 bg-muted rounded border text-muted-foreground">{session.weapon}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-4 border-t">
                                <button
                                    onClick={() => {
                                        setSuccessFencerName(sessionFencer?.name || null);
                                        setFinalSuccessRegistrations(sessionRegistrations);

                                        setTimeout(() => {
                                            setSuccessFencerName(null);
                                            setFinalSuccessRegistrations([]);
                                        }, SUCCESS_OVERLAY_DURATION_MS);

                                        setSessionFencer(null);
                                        setSessionRegistrations([]);
                                        setShowConfirmView(false);
                                        setDialogOpen(false);
                                        setSelectedSession(null);
                                        setSelectedFencer(null);
                                        setRegisteredSessionIds([]);
                                    }}
                                    className="h-16 w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg transition-colors cursor-pointer border border-primary/20 shadow-md"
                                >
                                    Finish & Close
                                </button>
                            </div>
                        </div>
                    ) : !selectedFencer ? (
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
                                            onSelect={async () => {
                                                const fName = `${fencer.first_name} ${fencer.last_name}`;
                                                if (isOpenBouting(selectedSession?.name, selectedSession?.template_name)) {
                                                    await handleSignIn(fencer.id, fName, 1.0);
                                                } else {
                                                    setSelectedFencer({ id: fencer.id, name: fName });
                                                }
                                            }}
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
                    ) : (
                        <div className="p-8 space-y-6 bg-background">
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleSignIn(selectedFencer.id, selectedFencer.name, 1.0)}
                                    className="h-20 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/95 flex flex-col items-center justify-center transition-colors shadow-lg border border-primary/20 cursor-pointer"
                                >
                                    <span className="text-2xl font-black">Whole Class</span>
                                </button>
                                <button
                                    onClick={() => handleSignIn(selectedFencer.id, selectedFencer.name, 0.67)}
                                    className="h-20 rounded-2xl bg-secondary text-secondary-foreground hover:bg-secondary/80 flex flex-col items-center justify-center transition-colors shadow-lg border border-border/50 cursor-pointer"
                                >
                                    <span className="text-2xl font-black">2/3 Class</span>
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <button
                                    onClick={() => handleSignIn(selectedFencer.id, selectedFencer.name, 0.50)}
                                    className="h-14 rounded-xl bg-muted/45 hover:bg-muted/75 text-foreground flex flex-col items-center justify-center transition-colors border border-border/50 cursor-pointer"
                                >
                                    <span className="text-lg font-bold">1/2 Class</span>
                                </button>
                                <button
                                    onClick={() => handleSignIn(selectedFencer.id, selectedFencer.name, 0.33)}
                                    className="h-14 rounded-xl bg-muted/45 hover:bg-muted/75 text-foreground flex flex-col items-center justify-center transition-colors border border-border/50 cursor-pointer"
                                >
                                    <span className="text-lg font-bold">1/3 Class</span>
                                </button>
                            </div>

                            <div className="flex justify-end pt-4 border-t mt-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        if (sessionFencer) {
                                            setShowConfirmView(true);
                                        } else {
                                            setSelectedFencer(null);
                                        }
                                    }}
                                    className="text-lg px-6 h-12"
                                >
                                    Go Back
                                </Button>
                            </div>
                        </div>
                    )}
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
                            <motion.div
                                animate={pinError ? { x: [-10, 10, -10, 10, 0] } : {}}
                                transition={{ duration: 0.4 }}
                            >
                                <Input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={4}
                                    placeholder="••••"
                                    value={pinValue}
                                    onChange={(e) => { setPinValue(e.target.value); setPinError(false); }}
                                    className={`text-center text-3xl tracking-[0.5em] h-16 font-mono ${pinError ? 'border-destructive ring-destructive' : ''}`}
                                    autoFocus
                                />
                            </motion.div>
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
                            className="flex flex-col items-center text-center px-6 w-full max-w-lg"
                        >
                            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                                <CheckCircle className="w-16 h-16 text-green-500" />
                            </div>
                            <h2 className="text-4xl font-black mb-2">You're Signed In!</h2>
                            <p className="text-2xl text-muted-foreground mb-6">
                                Have a great class, <span className="text-foreground font-bold">{successFencerName}</span>.
                            </p>
                            
                            {finalSuccessRegistrations.length > 0 && (
                                <div className="w-full bg-muted/30 border p-4 rounded-2xl space-y-2 text-left">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b pb-2 mb-2">Registrations:</h4>
                                    {finalSuccessRegistrations.map((reg, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm font-medium">
                                            <span>{reg.className}</span>
                                            <span className="text-xs bg-primary/15 text-primary px-2.5 py-0.5 rounded-full font-bold">
                                                {reg.fraction === 1.0 ? 'Whole' : `${reg.fraction}`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};
