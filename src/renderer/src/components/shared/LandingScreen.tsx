import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useNavigate } from '@tanstack/react-router';
import { ShieldCheck, UserCircle2, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export const LandingScreen = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    return (
        <div className="h-screen w-full flex items-center justify-center p-8 bg-gradient-to-br from-background to-muted/40 relative overflow-hidden">

            {/* Theme toggle */}
            <button
                onClick={toggleTheme}
                className="absolute top-6 right-6 z-50 p-2.5 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors bg-background/60 backdrop-blur-sm"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Decorative Blur Backdrops */}
            <div className="absolute top-0 right-0 -m-32 w-96 h-96 
                    bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -m-32 w-96 h-96 
                    bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

            <Card className="max-w-xl w-full border-border/60 shadow-xl bg-card/60 backdrop-blur-xl relative z-10 transition-all hover:shadow-2xl hover:border-border/80">
                <CardHeader className="text-center space-y-4 pt-10">
                    <div className="mx-auto w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center shadow-inner">
                        <ShieldCheck className="w-12 h-12 text-primary drop-shadow" />
                    </div>
                    <CardTitle className="text-4xl font-extrabold tracking-tight">Medeo Scheduler</CardTitle>
                    <CardDescription className="text-lg">Select an operating mode to continue</CardDescription>
                </CardHeader>

                <CardContent className="grid grid-cols-2 gap-6 p-8">

                    <div onClick={() => navigate({ to: '/admin' })} className="col-span-1 border rounded-2xl p-6 flex flex-col items-center gap-4 hover:border-primary hover:bg-primary/5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring select-none cursor-pointer">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center shadow-lg shadow-primary/20">
                            <ShieldCheck className="w-8 h-8 text-primary" />
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="font-semibold text-lg text-card-foreground">Admin Mode</h3>
                            <p className="text-sm text-card-foreground/70">Manage schedule & users</p>
                        </div>
                    </div>

                    <div onClick={() => navigate({ to: '/kiosk' })} className="col-span-1 border rounded-2xl p-6 flex flex-col items-center gap-4 hover:border-secondary hover:bg-secondary/5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring select-none cursor-pointer">
                        <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center shadow-lg shadow-secondary/20">
                            <UserCircle2 className="w-8 h-8 text-secondary" />
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="font-semibold text-lg text-card-foreground">Student Kiosk</h3>
                            <p className="text-sm text-card-foreground/70">Self sign-in flow</p>
                        </div>
                    </div>

                </CardContent>
                <CardFooter className="justify-center pb-8">
                    <p className="text-xs text-muted-foreground/60 text-center max-w-sm">
                        Kiosk mode restricts access to administrative tools until unlocked by a manager.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};
