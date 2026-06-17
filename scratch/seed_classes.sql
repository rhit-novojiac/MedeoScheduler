-- Seed Class Types and Weekly Templates

-- 1. Insert Class Types
INSERT INTO public.class_types (id, name, member_price, non_member_price)
VALUES
  (gen_random_uuid(), 'Youth Open Fencing', 0, 30),
  (gen_random_uuid(), 'Coordination Speed and Agility', 90, 0),
  (gen_random_uuid(), 'Little Musketeers Class', 40, 80),
  (gen_random_uuid(), 'Competitive Youth Epee', 50, 100),
  (gen_random_uuid(), 'Strength Training w. George', 35, 55),
  (gen_random_uuid(), 'Advanced Footwork', 40, 80),
  (gen_random_uuid(), 'Open Fencing', 0, 30),
  (gen_random_uuid(), 'Open Fencing/Bouting', 0, 30),
  (gen_random_uuid(), 'Beginner Competitive Fencing', 50, 100),
  (gen_random_uuid(), 'Strength/Recovery w. Natalia', 35, 55),
  (gen_random_uuid(), 'Int/Adv Sabre', 50, 100),
  (gen_random_uuid(), 'Y-14/Cadet/JR Epee', 40, 80),
  (gen_random_uuid(), 'Post-Class Open Bouting', 0, 30),
  (gen_random_uuid(), 'Youth/Teen Beg/Int Epee', 50, 100),
  (gen_random_uuid(), 'Intermediate Foil', 50, 100),
  (gen_random_uuid(), 'Advanced Foil', 50, 100),
  (gen_random_uuid(), 'Div 1 & Div 3 Epee', 40, 80),
  (gen_random_uuid(), 'Youth Epee Open Fencing', 0, 30),
  (gen_random_uuid(), 'Tech./Tact. FW w. Jon', 25, 0),
  (gen_random_uuid(), 'Footwork', 40, 80),
  (gen_random_uuid(), 'Sabre Footwork', 40, 80),
  (gen_random_uuid(), 'Int/Adv Foil', 0, 0),
  (gen_random_uuid(), 'Intermediate/Advance Teen Epee', 50, 100),
  (gen_random_uuid(), 'Y10/Y12-14 Epee', 50, 100),
  (gen_random_uuid(), 'Beginner-Int Foil', 50, 100),
  (gen_random_uuid(), 'All Weapon Footwork', 40, 80),
  (gen_random_uuid(), 'Intermediate/Advanced Sabre', 50, 100),
  (gen_random_uuid(), 'Div 1 Epee', 50, 100),
  (gen_random_uuid(), 'Intermediate Epee', 50, 100),
  (gen_random_uuid(), 'Beginner Sabre', 40, 80),
  (gen_random_uuid(), 'Open Bouting All Day', 0, 30)
ON CONFLICT (name) DO UPDATE SET
  member_price = EXCLUDED.member_price,
  non_member_price = EXCLUDED.non_member_price;

-- 2. Insert Class Templates
INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Youth Open Fencing',
  'Free for primary Medeo members; Guest fees apply',
  1,
  '16:00:00',
  220,
  'Sabre/Foil/Epee'
FROM public.class_types WHERE name = 'Youth Open Fencing'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Coordination Speed and Agility',
  'Rate for 2-4 students',
  1,
  '16:20:00',
  40,
  'All'
FROM public.class_types WHERE name = 'Coordination Speed and Agility'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Little Musketeers Class',
  '7-9 y.o. ($60 for Beginner Non-Members)',
  1,
  '17:00:00',
  80,
  'All'
FROM public.class_types WHERE name = 'Little Musketeers Class'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Competitive Youth Epee',
  'FW & Situational Fencing ($80 for Beginner Non-Members)',
  1,
  '17:00:00',
  100,
  'Epee'
FROM public.class_types WHERE name = 'Competitive Youth Epee'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Strength Training w. George',
  'Body Strength Development rate',
  1,
  '18:20:00',
  60,
  'All'
FROM public.class_types WHERE name = 'Strength Training w. George'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Advanced Footwork',
  'Y14/Cadet/Junior 1-hr Advanced Footwork rate',
  1,
  '18:40:00',
  60,
  'All'
FROM public.class_types WHERE name = 'Advanced Footwork'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Open Fencing',
  'Free for primary members; Non-members must be HS age or over',
  1,
  '19:30:00',
  150,
  'Epee'
FROM public.class_types WHERE name = 'Open Fencing'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Open Fencing/Bouting',
  'Medeo members only for early open fencing',
  2,
  '16:00:00',
  60,
  'All'
FROM public.class_types WHERE name = 'Open Fencing/Bouting'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Competitive Youth Epee',
  'FW & Situational Fencing ($80 for Beginner Non-Members)',
  2,
  '17:00:00',
  100,
  'Epee'
FROM public.class_types WHERE name = 'Competitive Youth Epee'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Beginner Competitive Fencing',
  'Classes begin Labor Day Week ($80 for Beginner Non-Members)',
  2,
  '17:30:00',
  100,
  'Foil'
FROM public.class_types WHERE name = 'Beginner Competitive Fencing'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Strength/Recovery w. Natalia',
  'Body Strength Development rate',
  2,
  '17:40:00',
  60,
  'All'
FROM public.class_types WHERE name = 'Strength/Recovery w. Natalia'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Advanced Footwork',
  '1-hr Advanced Footwork rate',
  2,
  '18:40:00',
  60,
  'All'
FROM public.class_types WHERE name = 'Advanced Footwork'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Int/Adv Sabre',
  '1hr 40min Class rate',
  2,
  '19:00:00',
  100,
  'Sabre'
FROM public.class_types WHERE name = 'Int/Adv Sabre'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Y-14/Cadet/JR Epee',
  '1hr 20min Class rate',
  2,
  '19:40:00',
  80,
  'Epee'
FROM public.class_types WHERE name = 'Y-14/Cadet/JR Epee'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Post-Class Open Bouting',
  'Medeo members only',
  2,
  '21:00:00',
  60,
  'Epee/Foil/Sabre'
FROM public.class_types WHERE name = 'Post-Class Open Bouting'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Open Fencing',
  'Free for primary members',
  3,
  '16:00:00',
  210,
  'All'
FROM public.class_types WHERE name = 'Open Fencing'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Youth/Teen Beg/Int Epee',
  'Classes begin Labor Day Week ($80 for Beginner Non-Members)',
  3,
  '17:00:00',
  100,
  'Epee'
FROM public.class_types WHERE name = 'Youth/Teen Beg/Int Epee'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Competitive Youth Epee',
  'FW & Situational Fencing ($80 for Beginner Non-Members)',
  3,
  '17:00:00',
  100,
  'Epee'
FROM public.class_types WHERE name = 'Competitive Youth Epee'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Intermediate Foil',
  '1hr 40min Class rate',
  3,
  '17:00:00',
  100,
  'Foil'
FROM public.class_types WHERE name = 'Intermediate Foil'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Advanced Footwork',
  '1-hr Advanced Footwork rate',
  3,
  '18:40:00',
  60,
  'All'
FROM public.class_types WHERE name = 'Advanced Footwork'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Advanced Foil',
  'Situational Fencing',
  3,
  '19:30:00',
  100,
  'Foil'
FROM public.class_types WHERE name = 'Advanced Foil'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Div 1 & Div 3 Epee',
  'Div 1 (A/B/C) / Div 3 rules apply',
  3,
  '19:40:00',
  80,
  'Epee'
FROM public.class_types WHERE name = 'Div 1 & Div 3 Epee'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Post-Class Open Bouting',
  'Medeo members only',
  3,
  '21:00:00',
  60,
  'All'
FROM public.class_types WHERE name = 'Post-Class Open Bouting'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Youth Epee Open Fencing',
  'Members only',
  4,
  '16:00:00',
  60,
  'Epee'
FROM public.class_types WHERE name = 'Youth Epee Open Fencing'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Little Musketeers Class',
  '7-9 y.o. ($60 for Beginner Non-Members)',
  4,
  '17:00:00',
  80,
  'All'
FROM public.class_types WHERE name = 'Little Musketeers Class'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Competitive Youth Epee',
  'FW & Competitive Fencing ($80 for Beginner Non-Members)',
  4,
  '17:00:00',
  100,
  'Epee'
FROM public.class_types WHERE name = 'Competitive Youth Epee'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Tech./Tact. FW w. Jon',
  '30 min. Tech./Tact. Footwork rate',
  4,
  '18:00:00',
  30,
  'All'
FROM public.class_types WHERE name = 'Tech./Tact. FW w. Jon'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Footwork',
  'Y14/Cadet/JR 1-hr Advanced Footwork rate',
  4,
  '18:40:00',
  60,
  'All'
FROM public.class_types WHERE name = 'Footwork'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Open Fencing',
  'Non-members must be HS age or over',
  4,
  '19:30:00',
  150,
  'Epee'
FROM public.class_types WHERE name = 'Open Fencing'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Coordination Speed and Agility',
  'Rate for 2-4 students',
  5,
  '16:20:00',
  40,
  'All'
FROM public.class_types WHERE name = 'Coordination Speed and Agility'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Competitive Youth Epee',
  'FW & Situational Fencing ($80 for Beginner Non-Members)',
  5,
  '17:00:00',
  100,
  'Epee'
FROM public.class_types WHERE name = 'Competitive Youth Epee'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Sabre Footwork',
  '1-hr Advanced Footwork rate',
  5,
  '18:00:00',
  60,
  'Sabre'
FROM public.class_types WHERE name = 'Sabre Footwork'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Int/Adv Foil',
  'Listed as 2 hours; see desk for exact prorated multi-hour block splits',
  5,
  '18:00:00',
  120,
  'Foil'
FROM public.class_types WHERE name = 'Int/Adv Foil'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Intermediate/Advance Teen Epee',
  'Situational Fencing',
  5,
  '18:40:00',
  100,
  'Epee'
FROM public.class_types WHERE name = 'Intermediate/Advance Teen Epee'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Post-Class Open Bouting',
  'Non-members must be HS aged or over',
  5,
  '20:00:00',
  120,
  'Epee/Foil/Sabre'
FROM public.class_types WHERE name = 'Post-Class Open Bouting'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Y10/Y12-14 Epee',
  '1hr 40min Class rate',
  6,
  '09:00:00',
  100,
  'Epee'
FROM public.class_types WHERE name = 'Y10/Y12-14 Epee'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Beginner-Int Foil',
  'From Beginner-Intermediate Section ($80 for Beginner Non-Members)',
  6,
  '09:00:00',
  100,
  'Foil'
FROM public.class_types WHERE name = 'Beginner-Int Foil'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'All Weapon Footwork',
  '1-hr Advanced Footwork rate',
  6,
  '10:40:00',
  60,
  'All'
FROM public.class_types WHERE name = 'All Weapon Footwork'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Intermediate/Advanced Sabre',
  '1hr 40min Class rate',
  6,
  '10:40:00',
  100,
  'Sabre'
FROM public.class_types WHERE name = 'Intermediate/Advanced Sabre'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Div 1 Epee',
  'Situational Fencing',
  6,
  '11:40:00',
  100,
  'Epee'
FROM public.class_types WHERE name = 'Div 1 Epee'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Intermediate Epee',
  'Situational Fencing',
  6,
  '11:40:00',
  100,
  'Epee'
FROM public.class_types WHERE name = 'Intermediate Epee'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Beginner Sabre',
  'Classes begin Labor Day Week ($60 for Beginner Non-Members)',
  6,
  '13:00:00',
  80,
  'Sabre'
FROM public.class_types WHERE name = 'Beginner Sabre'
ON CONFLICT DO NOTHING;

INSERT INTO public.class_templates (id, class_type_id, name, description, day_of_week, start_time, duration_minutes, weapon)
SELECT 
  gen_random_uuid(),
  id,
  'Open Bouting All Day',
  'When classes aren''t in session; Non-members must be HS age or over',
  6,
  '10:00:00',
  360,
  'All'
FROM public.class_types WHERE name = 'Open Bouting All Day'
ON CONFLICT DO NOTHING;

