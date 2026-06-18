-- Enable the pgcrypto extension for UUID generation (Standard in Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create a reusable function to automatically update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==========================================
-- 1. Fencers (Upgraded with Auth & Booleans)
-- ==========================================
CREATE TABLE IF NOT EXISTS fencers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id), -- Links a coach to their secure login
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    sex TEXT,
    year_of_birth INTEGER NOT NULL,
    usaf_id INTEGER NOT NULL DEFAULT 0,
    last_membership_renewal DATE, -- Upgraded from TEXT
    is_foil BOOLEAN NOT NULL DEFAULT false, -- Upgraded from INTEGER
    is_epee BOOLEAN NOT NULL DEFAULT false,
    is_saber BOOLEAN NOT NULL DEFAULT false,
    coach_role TEXT NOT NULL DEFAULT 'NONE' CHECK (coach_role IN ('NONE', 'TEMPORARY', 'FULL')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_fencers_modtime BEFORE UPDATE ON fencers FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ==========================================
-- 2. Class Types
-- ==========================================
CREATE TABLE IF NOT EXISTS class_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    member_price NUMERIC(10, 2) NOT NULL,
    non_member_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_class_types_modtime BEFORE UPDATE ON class_types FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ==========================================
-- 3. Class Templates
-- ==========================================
CREATE TABLE IF NOT EXISTS class_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_type_id UUID REFERENCES class_types(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    day_of_week INTEGER,
    start_time TIME, -- Upgraded from TEXT
    duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_class_templates_modtime BEFORE UPDATE ON class_templates FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ==========================================
-- 4. Class Sessions
-- ==========================================
CREATE TABLE IF NOT EXISTS class_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES class_templates(id) ON DELETE SET NULL,
    class_type_id UUID REFERENCES class_types(id) ON DELETE SET NULL,
    name TEXT,
    date DATE NOT NULL, -- Upgraded from TEXT
    start_time TIME NOT NULL, -- Upgraded from TEXT
    duration_minutes INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_class_sessions_modtime BEFORE UPDATE ON class_sessions FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ==========================================
-- 5. Junction Tables (Coaches & Attendees)
-- ==========================================
CREATE TABLE IF NOT EXISTS class_coaches (
    class_session_id UUID REFERENCES class_sessions(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES fencers(id) ON DELETE CASCADE,
    PRIMARY KEY (class_session_id, coach_id)
);

CREATE TABLE IF NOT EXISTS class_attendees (
    class_session_id UUID REFERENCES class_sessions(id) ON DELETE CASCADE,
    fencer_id UUID REFERENCES fencers(id) ON DELETE CASCADE,
    fraction REAL NOT NULL DEFAULT 1.0,
    PRIMARY KEY (class_session_id, fencer_id)
);

-- ==========================================
-- 6. Special Events (Upgraded Arrays & Booleans)
-- ==========================================
CREATE TABLE IF NOT EXISTS special_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    date DATE NOT NULL, -- Upgraded from TEXT
    cancels_classes BOOLEAN NOT NULL DEFAULT false, -- Upgraded from INTEGER
    is_annual BOOLEAN NOT NULL DEFAULT false, -- Upgraded from INTEGER
    excluded_class_ids UUID[], -- Upgraded from comma-separated TEXT to native Postgres Array
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_special_events_modtime BEFORE UPDATE ON special_events FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ==========================================
-- 7. NEW: Private Lessons
-- ==========================================
CREATE TABLE IF NOT EXISTS private_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID REFERENCES fencers(id) NOT NULL,
    student_id UUID REFERENCES fencers(id) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'SCHEDULED', -- Expected: 'SCHEDULED', 'COMPLETED', 'CANCELLED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_private_lessons_modtime BEFORE UPDATE ON private_lessons FOR EACH ROW EXECUTE FUNCTION update_modified_column();

ALTER TABLE fencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_lessons ENABLE ROW LEVEL SECURITY;