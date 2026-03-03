import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import React from 'react';
import memoryHistory from '../lib/history';
import { AdminLayout } from '../components/shared/AdminLayout';
import { LandingScreen } from '../components/shared/LandingScreen';
import { KioskLayout } from '../components/shared/KioskLayout';
import { FencersManager } from '../components/fencers/FencersManager';
import { ClassesManagerAdmin } from '../components/classes/ClassesManagerAdmin';
import { DailyScheduleAdmin } from '../components/classes/DailyScheduleAdmin';
import { ReportsAdmin } from '../components/shared/ReportsAdmin';

// --- Routes ---
const rootRoute = createRootRoute({
    component: () => <Outlet />,
});

const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: LandingScreen,
});

const adminRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/admin',
    component: AdminLayout,
});

const adminIndexRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: '/',
    component: DailyScheduleAdmin,
});

const fencersRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: '/fencers',
    component: FencersManager,
});

const classesRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: '/classes',
    component: ClassesManagerAdmin,
});

const reportsRoute = createRoute({
    getParentRoute: () => adminRoute,
    path: '/reports',
    component: ReportsAdmin,
});

const kioskRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/kiosk',
    component: KioskLayout,
});

// --- Tree & Router ---
const routeTree = rootRoute.addChildren([
    indexRoute,
    adminRoute.addChildren([adminIndexRoute, fencersRoute, classesRoute, reportsRoute]),
    kioskRoute,
]);

export const router = createRouter({
    routeTree,
    history: memoryHistory,
});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
