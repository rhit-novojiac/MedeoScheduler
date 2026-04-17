# Medeo Scheduler - High Level System Specification

## 1. Overview
The Medeo Scheduler is a secure, local-first desktop application built with Electron, SQLite, React, and Tailwind CSS. It is designed for a fencing club to handle schedule management, class tracking, and fencer record-keeping. The system serves as the source of truth for attendance tracking and generates exports for external billing/management systems.

### 1.1. Application Modes
The application operates in two distinct modes:
1. **Admin Mode:** Fully featured management interface. Allows the club manager to create class templates, manage the fencer roster, view all historical data, and generate exports.
2. **Fencer Mode (Kiosk):** A simplified, locked-down interface intended to be left open on a club computer or tablet. It allows fencers to walk up, find their name, and sign themselves into classes happening that specific day. 

## 2. Core Entities & Requirements

### 2.1. Fencer Management
Fencers are the primary individuals tracked in the system. Coaches are not a separate entity; they are simply fencers who are designated as teaching a specific class. All fencers are assumed to be "active" (no soft deletion required).

**Data Points:**
- **Name:** First Name, Last Name.
- **Sex:** Sex/Gender of the fencer.
- **Year of Birth:** Stored as a 4-digit integer to allow age calculations for event and category eligibility without requiring full date collection.
- **Membership Status:** Determined dynamically. Fencers have a `last_membership_renewal` date. They are considered members if the class they are attending falls within 1 year of this renewal date.
- **Weapons:** Stored as 3 independent boolean flags (`is_foil`, `is_epee`, `is_saber`) since most use 1 but some use multiple.

### 2.2. Class Management
Classes are primarily recurring events generated from templates, with the ability to handle ad-hoc signups before, during, or after the class.

**Data Points:**
- **Class Types & Pricing:** Classes belong to a type (Footwork, Situational Bouting, Open Bouting, Conditioning). Pricing is defined at the Class Type level (Member price vs Non-member price) and inherits down.
- **Class Templates:** Recurring schedules (e.g., "Tuesday 5 PM Footwork") form the basis of the calendar to minimize manual data entry.
- **Class Sessions:** Specific instances of a class happening on a specific date. 
- **Coaches:** One or more Fencers attached to a Class Session as the instructor(s).
- **Description:** A paragraph detailing what happens in the class (can default from the template).
- **Participants/Attendance:** Fencers signed up for the class. Students can be added to the attendance list at any time.

### 2.3. Export Functionality
The application does not track billing or payments. It only tracks attendance and acts as an exporter for the external system.

**Export Specification:**
- **Format:** CSV File
- **Required Columns:**
  - Fencer First Name
  - Fencer Last Name
  - Number of instances of each Class Type taken in the period
  - Member Status (Yes/No based on the date of the export vs their renewal date)

## 3. Scope Exclusions
- **Billing:** Handled externally. No tracking of payments or balances.
- **Soft Deletions:** Inactive fencers are simply left in the database to preserve historical attendance. Their membership will naturally expire.

## 4. Next Steps
The database schema has been finalized based on this specification and documented in `implementation_plan.md`. The project is ready to move into the Implementation phase.
