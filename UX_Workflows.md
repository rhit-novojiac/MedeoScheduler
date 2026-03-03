# Medeo Scheduler - UX Workflows

## Global Application Modes
The software operates in two distinct paradigms: **Admin Mode** and **Fencer Mode (Kiosk)**.

---

## 1. Fencer Mode (The Kiosk Workflow)
*This mode is active when the computer is left unattended at the front desk for students walking into the club.*

**Flow:**
1. **Idle Screen:** The screen displays a highly legible, distraction-free "Today's Classes" view.
2. **Class Selection:** A fencer taps/clicks on the class they are attending (e.g., "5:00 PM Foil").
3. **Sign-In Action:** A modal appears asking "Who is signing in?". The fencer uses a large, touch-friendly search/autocomplete box to find their name. 
4. **Confirmation:** Upon selecting their name, the screen flashes a large, satisfying success message ("Welcome, John! You are signed in.") and automatically returns to the Idle Screen for the next person in line.
5. **Admin Access:** A small, discreet "gear" icon or long-press zone exists in the corner. Clicking it prompts for a 4-digit PIN to unlock Admin Mode.

---

## 2. Admin Mode (Management Workflows)
*This is the full-featured desktop interface for the club manager, featuring a persistent sidebar navigation to jump between hubs.*

### Workflow: Managing the Daily Schedule (The Primary Loop)
*Even though fencers self-sign-in, the manager needs oversight to add people who forgot, or to review the roster.*

1. **Dashboard (Schedule Hub):** The manager lands on the "Today" schedule. They see real-time updates as fencers utilize the Kiosk mode.
2. **Reviewing a Class:** The manager clicks a specific class to view the full roster of signed-up fencers and assigned coaches.
3. **Manual Override:** The manager can use the same search/autocomplete input to manually add a fencer to the attendance list, or click a "Remove" button next to a name if someone signed in by mistake.
4. **Ad-Hoc Class Creation:** A prominent "Create Ad-Hoc Class" button allows the manager to quickly spin up a class instance that doesn't fit standard templates.

### Workflow: Onboarding a New Fencer
*When a new student walks into the club.*

1. **Navigation:** The manager clicks "Fencers" in the sidebar.
2. **Directory View:** They see a data table containing all fencers, sortable and filterable.
3. **Creation:** They click "Add New Fencer".
4. **Form Modal:** A modal requests First Name, Last Name, Sex, Year of Birth, Primary Weapons. The `last_membership_renewal` defaults to today if they are a paying member.
5. **Submission:** Upon saving, the table instantly updates, and the fencer is immediately available in the Kiosk Mode search for self-sign-in.

### Workflow: Generating the Monthly Export
*End of month administrative duties.*

1. **Navigation:** User clicks "Reports" in the sidebar.
2. **Parameter Selection:** A simple form asks for a "Date Range" (e.g., Dec 1 - Dec 31).
3. **Generation:** User clicks "Generate Export". The system generates the required CSV layout and triggers a native OS "Save File" dialog.

---

## Next Steps
With the dual-mode architecture defined, I will begin generating high-fidelity mockups of:
1. The **Fencer Mode (Kiosk) Idle Screen & Sign-in**.
2. The **Admin Mode Schedule Dashboard**.
