-- Create indexes on foreign key columns to optimize JOIN performance and reduce memory usage

-- class_sessions indexes
CREATE INDEX IF NOT EXISTS idx_class_sessions_template_id ON class_sessions(template_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_class_type_id ON class_sessions(class_type_id);

-- class_coaches indexes
CREATE INDEX IF NOT EXISTS idx_class_coaches_class_session_id ON class_coaches(class_session_id);
CREATE INDEX IF NOT EXISTS idx_class_coaches_coach_id ON class_coaches(coach_id);

-- class_attendees indexes
CREATE INDEX IF NOT EXISTS idx_class_attendees_class_session_id ON class_attendees(class_session_id);
CREATE INDEX IF NOT EXISTS idx_class_attendees_fencer_id ON class_attendees(fencer_id);

-- private_lessons indexes
CREATE INDEX IF NOT EXISTS idx_private_lessons_coach_id ON private_lessons(coach_id);
CREATE INDEX IF NOT EXISTS idx_private_lessons_student_id ON private_lessons(student_id);

-- class_templates indexes
CREATE INDEX IF NOT EXISTS idx_class_templates_class_type_id ON class_templates(class_type_id);
