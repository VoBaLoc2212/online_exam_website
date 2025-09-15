-- PostgreSQL Seed Data Script for Question Banks and Questions
-- Run this script in your PostgreSQL database

-- First, let's get the user ID to use as created_by
-- Replace this with your actual user ID
-- You can find it by running: SELECT id FROM users LIMIT 1;
DO $$
DECLARE 
    user_id varchar := '64b8ff57-e7c1-4acc-bd13-d040ef96d9d4'; -- Replace with actual user ID
    bank_id varchar;
    counter integer;
    question_counter integer;
BEGIN

-- Delete existing data if needed (optional - uncomment if you want to reset)
-- DELETE FROM questions;
-- DELETE FROM question_banks WHERE created_by = user_id;

-- Insert 20 Question Banks
INSERT INTO question_banks (id, name, description, test_type, skill_type, exam_duration, created_by, created_at) VALUES

-- APTIS Reading Banks (5 banks)
(gen_random_uuid(), 'APTIS Reading Comprehension - Beginner', 'Basic reading comprehension exercises for APTIS preparation', 'aptis', 'reading', 60, user_id, NOW()),
(gen_random_uuid(), 'APTIS Reading Comprehension - Intermediate', 'Intermediate level reading passages and questions', 'aptis', 'reading', 75, user_id, NOW()),
(gen_random_uuid(), 'APTIS Advanced Reading Skills', 'Advanced reading strategies and complex texts', 'aptis', 'reading', 90, user_id, NOW()),
(gen_random_uuid(), 'APTIS Reading Practice Test 1', 'Full reading practice test in APTIS format', 'aptis', 'reading', 60, user_id, NOW()),
(gen_random_uuid(), 'APTIS Reading Practice Test 2', 'Additional reading practice with varied topics', 'aptis', 'reading', 60, user_id, NOW()),

-- APTIS Listening Banks (3 banks)
(gen_random_uuid(), 'APTIS Listening Fundamentals', 'Basic listening skills and comprehension', 'aptis', 'listening', 45, user_id, NOW()),
(gen_random_uuid(), 'APTIS Listening Practice Set A', 'Listening exercises with audio materials', 'aptis', 'listening', 50, user_id, NOW()),
(gen_random_uuid(), 'APTIS Advanced Listening', 'Complex listening scenarios and dialogues', 'aptis', 'listening', 55, user_id, NOW()),

-- VSTEP Reading Banks (4 banks)
(gen_random_uuid(), 'VSTEP Reading Level 3-5', 'Reading comprehension for VSTEP levels 3-5', 'vstep', 'reading', 60, user_id, NOW()),
(gen_random_uuid(), 'VSTEP Reading Academic Texts', 'Academic reading passages for VSTEP', 'vstep', 'reading', 75, user_id, NOW()),
(gen_random_uuid(), 'VSTEP Reading Mock Test 1', 'Full reading section practice test', 'vstep', 'reading', 60, user_id, NOW()),
(gen_random_uuid(), 'VSTEP Reading Mock Test 2', 'Additional reading practice with timer', 'vstep', 'reading', 60, user_id, NOW()),

-- VSTEP Listening Banks (3 banks)
(gen_random_uuid(), 'VSTEP Listening Essentials', 'Essential listening skills for VSTEP', 'vstep', 'listening', 40, user_id, NOW()),
(gen_random_uuid(), 'VSTEP Listening Practice A', 'Comprehensive listening practice set', 'vstep', 'listening', 45, user_id, NOW()),
(gen_random_uuid(), 'VSTEP Listening Mock Exam', 'Full listening section simulation', 'vstep', 'listening', 40, user_id, NOW()),

-- Grammar Banks (3 banks)
(gen_random_uuid(), 'English Grammar Fundamentals', 'Basic to intermediate grammar rules', 'custom', 'grammar', 30, user_id, NOW()),
(gen_random_uuid(), 'Advanced English Grammar', 'Complex grammar structures and usage', 'custom', 'grammar', 45, user_id, NOW()),
(gen_random_uuid(), 'Grammar for Test Preparation', 'Grammar exercises for exam preparation', 'custom', 'grammar', 40, user_id, NOW()),

-- Vocabulary Banks (2 banks)
(gen_random_uuid(), 'Academic Vocabulary Builder', 'Essential academic vocabulary for tests', 'custom', 'vocabulary', 25, user_id, NOW()),
(gen_random_uuid(), 'Advanced Vocabulary Practice', 'High-level vocabulary and word usage', 'custom', 'vocabulary', 30, user_id, NOW());

-- Now insert questions for each question bank
-- We'll create between 20-40 questions per bank

FOR bank_record IN (SELECT id, name FROM question_banks WHERE created_by = user_id ORDER BY created_at DESC LIMIT 20)
LOOP
    bank_id := bank_record.id;
    
    -- Determine number of questions for this bank (between 20-40)
    counter := 20 + floor(random() * 21)::integer; -- Random between 20-40
    
    FOR question_counter IN 1..counter
    LOOP
        INSERT INTO questions (
            id, 
            question_bank_id, 
            content, 
            options, 
            correct_answer, 
            explanation, 
            difficulty, 
            points, 
            order_index, 
            created_at
        ) VALUES (
            gen_random_uuid(),
            bank_id,
            'Question ' || question_counter || ' for ' || bank_record.name || ': What is the main idea of the passage/audio/text presented?',
            '["Option A: First possible answer", "Option B: Second possible answer", "Option C: Third possible answer", "Option D: Fourth possible answer"]'::jsonb,
            CASE (question_counter % 4)
                WHEN 1 THEN 'A'
                WHEN 2 THEN 'B' 
                WHEN 3 THEN 'C'
                ELSE 'D'
            END,
            'This is the explanation for question ' || question_counter || '. The correct answer is based on the key information presented in the material.',
            CASE (question_counter % 3)
                WHEN 0 THEN 'easy'
                WHEN 1 THEN 'medium'
                ELSE 'hard'
            END::difficulty,
            CASE (question_counter % 3)
                WHEN 0 THEN 1
                WHEN 1 THEN 2
                ELSE 3
            END,
            question_counter,
            NOW()
        );
    END LOOP;
    
    RAISE NOTICE 'Created % questions for bank: %', counter, bank_record.name;
    
END LOOP;

RAISE NOTICE 'Seed data creation completed!';
RAISE NOTICE 'Created 20 question banks with questions ranging from 20-40 per bank';

END $$;