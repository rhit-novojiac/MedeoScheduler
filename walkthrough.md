# Medeo Scheduler Walkthrough

This document summarizes the completed architecture, features, and validations for the **Medeo Scheduler** application.

## 1. Architecture and Core Stack
- **Electron Shell:** The application runs as a rapid, offline-first Windows desktop app via Vite.
- **Native SQLite:** Uses `better-sqlite3` strictly within the Node.js Main Process for local data persistence (stored safely in the OS application data directory).
- **React & Tailwind CSS:** Styled using standard modern tools, featuring a suite of beautiful accessible Shadcn UI components.
- **Dark Mode native:** Implemented globally for a distinct, high-contrast, premium experience directly aligned with modern tool aesthetics.

## 2. Completed Application Ecosystem

### Admin Dashboard
- **Daily Schedule Organizer:** Displaying the day's calendar, smartly resolving auto-instantiated template classes against ad-hoc sessions.
- **Attendance Sheet:** A slide-over Drawer utilizing a high-performance Combobox for frictionless checking in of hundreds of club members.
- **Roster Directory:** Full CRUD interactions for Fencers, safely maintaining fields like Weapon type and Membership Renewal dates.
- **CSV Reporter Engine:** Dynamic pivoting of SQLite analytics. Generates spreadsheets of attendees matched against Class Types, evaluating Membership Status retroactively depending on the export window target. Opens natively via the OS Save Dialog.

### Fencer Sign-In Kiosk
- **Self-Service:** Full screen, heavily stylized landing page built for tablets.
- **Framer Motion Elements:** Touch-friendly interfaces providing massive hit-boxes, concluding with a celebratory full screen animated success overlay as fencers sign in.
- **Cross-synchronization:** Instantly updates React Query cache so Admin screens inherently observe the influx of sign-ins across the process.

## 3. Validations Performed
- **IPC Safety:** Verified safe asynchronous bridging between `window.api` logic and the renderer.
- **Compilations:** ESLint zero-warning checks passed over standard TypeScript paths.
- **Native Packaging Build:** Electron Forge successfully linked and built standard system binaries containing the compiled `node-gyp` database drivers.
