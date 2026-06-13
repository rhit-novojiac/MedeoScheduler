# Medeo Scheduler Implementation Plan

This is a living document that tracks the technical plan for building the Medeo Scheduler based on the Architecture.md constraints and the finalized System Specifications.

## Problem Description
Creating a secure, local-first schedule management desktop app for a fencing club using Electron, SQLite, React, and Tailwind CSS. The app will manage club members, coaches, attendances, and provide exports to external tools for record-keeping.

## Proposed Changes

### Database Layer (SQLite via better-sqlite3)
The SQLite engine will exclusively run in the Electron Main process. 

**Database Schema:**

* **`fencers`**
  * `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
  * `first_name` (TEXT NOT NULL)
  * `last_name` (TEXT NOT NULL)
  * `sex` (TEXT)
  * `year_of_birth` (INTEGER NOT NULL) - 4-digit year (YYYY)
  * `usaf_id` (INTEGER NOT NULL DEFAULT 0) - USAF membership ID
  * `last_membership_renewal` (TEXT) - ISO 8601 date string, used to calculate membership status
  * `is_foil` (INTEGER NOT NULL DEFAULT 0) - Boolean (0/1)
  * `is_epee` (INTEGER NOT NULL DEFAULT 0)
  * `is_saber` (INTEGER NOT NULL DEFAULT 0)

* **`class_types`**
  * `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
  * `name` (TEXT NOT NULL UNIQUE) - e.g., Footwork, Open Bouting
  * `member_price` (REAL NOT NULL)
  * `non_member_price` (REAL NOT NULL)

* **`class_templates`** (For recurring classes)
  * `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
  * `class_type_id` (INTEGER FOREIGN KEY)
  * `name` (TEXT NOT NULL)
  * `description` (TEXT)
  * `day_of_week` (INTEGER) - 0-6 for Sunday-Saturday
  * `start_time` (TEXT) - HH:MM format
  * `duration_minutes` (INTEGER)

* **`class_sessions`** (Actual class instances)
  * `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
  * `template_id` (INTEGER FOREIGN KEY) - Nullable if ad-hoc
  * `class_type_id` (INTEGER FOREIGN KEY) - Nullable override
  * `name` (TEXT) - Nullable override
  * `date` (TEXT NOT NULL) - ISO 8601 date string
  * `start_time` (TEXT NOT NULL) - HH:MM format
  * `duration_minutes` (INTEGER NOT NULL)

* **`class_coaches`** (Join table for coaches)
  * `class_session_id` (INTEGER FOREIGN KEY)
  * `coach_id` (INTEGER FOREIGN KEY to `fencers.id`)
  * PRIMARY KEY (`class_session_id`, `coach_id`)

* **`class_attendees`** (Join table for attendance)
  * `class_session_id` (INTEGER FOREIGN KEY)
  * `fencer_id` (INTEGER FOREIGN KEY to `fencers.id`)
  * PRIMARY KEY (`class_session_id`, `fencer_id`)

* **`settings`** (Application settings/security)
  * `key` (TEXT PRIMARY KEY) - e.g., 'admin_pin_hash'
  * `value` (TEXT NOT NULL)

* **`special_events`** (For cancellation rules/holidays)
  * `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
  * `name` (TEXT NOT NULL)
  * `type` (TEXT NOT NULL)
  * `date` (TEXT NOT NULL)
  * `cancels_classes` (INTEGER NOT NULL DEFAULT 0)
  * `is_annual` (INTEGER NOT NULL DEFAULT 0)
  * `excluded_class_ids` (TEXT) - JSON string array of session IDs excluded from cancellation

### Preload & IPC Bridge
* Use `contextBridge` to expose a `window.api` object with typed asynchronous methods.
* **Handlers:**
  * **Fencers:** `getFencers`, `createFencer`, `updateFencer`
  * **Class Types:** `getClassTypes`, `createClassType`, `updateClassType`, `deleteClassType`
  * **Class Templates:** `getClassTemplates`, `createClassTemplate`, `updateClassTemplate`, `deleteClassTemplate`
  * **Class Sessions:** `getOrCreateClassSessionsByDate`, `createClassSession`, `updateClassSession`, `deleteClassSession`
  * **Attendance:** `getAttendeesForSession`, `addAttendee`, `removeAttendee`
  * **Coaches:** `getCoachesForSession`, `addCoach`, `removeCoach`
  * **Reports:** `generateExportCsv`
  * **Admin settings:** `verifyAdminPin`, `updateAdminPin`
  * **Special Events:** `getSpecialEventsByDate`, `createSpecialEvent`, `updateSpecialEvent`, `deleteSpecialEvent`

### Frontend Architecture (React + TanStack Suite)
* **Routing:** `TanStack Router` using memory history. 
  * **Admin Routes:** `/admin` (Dashboard/Schedule), `/admin/fencers` (Mangement), `/admin/reports`.
  * **Fencer Routes:** `/kiosk` (Self sign-in flow).
* **State:** `TanStack Query` to wrap the `window.api` calls, handling caching and optimistic UI updates.
* **Security/Mode Switching:** Implement a basic mechanism (e.g., a simple hardcoded or DB-stored PIN) to switch from Fencer Mode back into Admin Mode to prevent students from accessing management tools.

### UI/UX Design Implementation Details
The UI will be built in dark mode using Tailwind CSS and `shadcn/ui` components.

**1. Fencer Mode (Kiosk) Implementation**
![Fencer Kiosk Mockup](C:\Users\novojiac\.gemini\antigravity\brain\7c69b58d-9cb6-403c-94b2-65fd41331f73\fencer_kiosk_view_1772296832904.png)
* **Layout:** Full screen, no sidebar. Centered, highly legible layout focusing solely on the schedule for "Today".
* **Components to Install (`shadcn`):**
  * `cmdk` / `Command` (for the massive, auto-completing search bar).
  * `Dialog` / `Modal` (for the "Who is signing in?" pop-up).
  * `Card` (To display the classes beautifully, e.g., "5:00 PM Foil Footwork").
* **UX Nuances:** Focus on huge tap targets for quick touch engagement. Implement a full-screen success overlay using `framer-motion` for instant visual feedback upon sign-in.

**2. Admin Dashboard Implementation**
![Admin Dashboard Mockup](C:\Users\novojiac\.gemini\antigravity\brain\7c69b58d-9cb6-403c-94b2-65fd41331f73\admin_dashboard_view_1772296844176.png)
* **Layout:** `SidebarProvider` utilizing a fixed left navigation and a dynamic right-hand main content area.
* **Components to Install (`shadcn`):**
  * `Sidebar`, `Button`, `Input`, `Table` (for the fencer directory).
  * `Sheet` (for the sliding right-hand attendance detail panel when a manager clicks a class).
  * `Avatar` (to visually represent fencers in the sidebar/slider).
  * `Popover` & `Calendar` (for adjusting dates to see past/future schedules).
* **UX Nuances:** The sliding `Sheet` component is critical so the manager does not lose context of the daily schedule when adjusting attendance for a specific class. Add a header search bar for quick fencer lookup.

## Verification Plan

### Automated Tests
* We will verify the configuration of Electron Forge correctly externalizes and unpacks `better-sqlite3` during the build step.

### Manual Verification
* Validate local SQLite database initialization by running `dev` and verifying the `.sqlite` file creation in the app data directory.
* Test CRUD functionality for fencers via the application interface using memory routing.
* Test generating class sessions from templates and manually adding attendance.
* Verify the generated CSV export matches the required structure and correctly calculates 'Member' status based on the `last_membership_renewal` vs target export period.
