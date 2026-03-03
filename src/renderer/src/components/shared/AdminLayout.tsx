import React from 'react';
import { Link, Outlet } from '@tanstack/react-router';
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader } from '@/components/ui/sidebar';
import { Calendar, Users, FileText, ShieldAlert, BookOpen, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

import { ChangeAdminPinDialog } from './ChangeAdminPinDialog';

export const AdminLayout = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <SidebarProvider>
            <div className="flex h-screen w-full overflow-hidden bg-background 
                 text-foreground selection:bg-primary/30">

                {/* Persistent Admin Navigation Sidebar */}
                <Sidebar variant="inset" side="left">
                    <SidebarHeader className="h-16 flex items-center px-4 border-b border-sidebar-border">
                        <h1 className="font-bold text-lg text-primary truncate">Medeo Admin</h1>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild tooltip="Schedule Dashboard">
                                            <Link to="/admin" activeOptions={{ exact: true }} className="[&.active]:font-bold [&.active]:text-primary [&.active]:bg-sidebar-accent">
                                                <Calendar />
                                                <span>Schedule</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>

                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild tooltip="Fencer Directory">
                                            <Link to="/admin/fencers" className="[&.active]:font-bold [&.active]:text-primary [&.active]:bg-sidebar-accent">
                                                <Users />
                                                <span>Fencers</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>

                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild tooltip="Classes & Templates">
                                            <Link to="/admin/classes" className="[&.active]:font-bold [&.active]:text-primary [&.active]:bg-sidebar-accent">
                                                <BookOpen />
                                                <span>Classes</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>

                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild tooltip="Export Reports">
                                            <Link to="/admin/reports" className="[&.active]:font-bold [&.active]:text-primary [&.active]:bg-sidebar-accent">
                                                <FileText />
                                                <span>Reports</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    {/* Bottom actions: theme toggle + kiosk lock */}
                    <div className="mt-auto border-t border-sidebar-border">
                        <div className="p-4 flex flex-col gap-3">
                            <Link to="/kiosk" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1">
                                <ShieldAlert className="h-4 w-4" />
                                <span>Lock to Kiosk</span>
                            </Link>

                            <ChangeAdminPinDialog />

                            <button
                                onClick={toggleTheme}
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors self-start py-1 mt-1"
                                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                            >
                                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                            </button>
                        </div>
                    </div>
                </Sidebar>

                {/* Dynamic Main Content Area */}
                <main className="flex-1 overflow-auto relative">
                    <Outlet />
                </main>
            </div>
        </SidebarProvider>
    );
};
