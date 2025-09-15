-- Simple seed script - run step by step
-- Step 1: Get your user ID first
SELECT id, username FROM users;

-- Step 2: Replace USER_ID_HERE with your actual user ID and run the inserts below

-- Insert Question Banks (20 banks)
INSERT INTO question_banks (name, description, test_type, skill_type, exam_duration, created_by) VALUES
('APTIS Reading Comprehension - Beginner', 'Basic reading comprehension exercises for APTIS preparation', 'aptis', 'reading', 60, 'USER_ID_HERE'),
('APTIS Reading Comprehension - Intermediate', 'Intermediate level reading passages and questions', 'aptis', 'reading', 75, 'USER_ID_HERE'),
('APTIS Advanced Reading Skills', 'Advanced reading strategies and complex texts', 'aptis', 'reading', 90, 'USER_ID_HERE'),
('APTIS Reading Practice Test 1', 'Full reading practice test in APTIS format', 'aptis', 'reading', 60, 'USER_ID_HERE'),
('APTIS Reading Practice Test 2', 'Additional reading practice with varied topics', 'aptis', 'reading', 60, 'USER_ID_HERE'),
('APTIS Listening Fundamentals', 'Basic listening skills and comprehension', 'aptis', 'listening', 45, 'USER_ID_HERE'),
('APTIS Listening Practice Set A', 'Listening exercises with audio materials', 'aptis', 'listening', 50, 'USER_ID_HERE'),
('APTIS Advanced Listening', 'Complex listening scenarios and dialogues', 'aptis', 'listening', 55, 'USER_ID_HERE'),
('VSTEP Reading Level 3-5', 'Reading comprehension for VSTEP levels 3-5', 'vstep', 'reading', 60, 'USER_ID_HERE'),
('VSTEP Reading Academic Texts', 'Academic reading passages for VSTEP', 'vstep', 'reading', 75, 'USER_ID_HERE'),
('VSTEP Reading Mock Test 1', 'Full reading section practice test', 'vstep', 'reading', 60, 'USER_ID_HERE'),
('VSTEP Reading Mock Test 2', 'Additional reading practice with timer', 'vstep', 'reading', 60, 'USER_ID_HERE'),
('VSTEP Listening Essentials', 'Essential listening skills for VSTEP', 'vstep', 'listening', 40, 'USER_ID_HERE'),
('VSTEP Listening Practice A', 'Comprehensive listening practice set', 'vstep', 'listening', 45, 'USER_ID_HERE'),
('VSTEP Listening Mock Exam', 'Full listening section simulation', 'vstep', 'listening', 40, 'USER_ID_HERE'),
('English Grammar Fundamentals', 'Basic to intermediate grammar rules', 'custom', 'grammar', 30, 'USER_ID_HERE'),
('Advanced English Grammar', 'Complex grammar structures and usage', 'custom', 'grammar', 45, 'USER_ID_HERE'),
('Grammar for Test Preparation', 'Grammar exercises for exam preparation', 'custom', 'grammar', 40, 'USER_ID_HERE'),
('Academic Vocabulary Builder', 'Essential academic vocabulary for tests', 'custom', 'vocabulary', 25, 'USER_ID_HERE'),
('Advanced Vocabulary Practice', 'High-level vocabulary and word usage', 'custom', 'vocabulary', 30, 'USER_ID_HERE');

-- Step 3: Check created question banks
SELECT id, name, test_type, skill_type FROM question_banks ORDER BY created_at DESC LIMIT 20;

-- Step 4: Insert sample questions (run this for each question bank ID)
-- Replace QUESTION_BANK_ID_HERE with actual question bank IDs from step 3

-- Example for first question bank (repeat for each bank with different content):
INSERT INTO questions (question_bank_id, content, options, correct_answer, explanation, difficulty, points, order_index) VALUES
('QUESTION_BANK_ID_HERE', 'According to the passage, what is the main purpose of the APTIS test?', '["To assess English language proficiency", "To evaluate mathematical skills", "To test computer literacy", "To measure general knowledge"]', 'A', 'APTIS is specifically designed to assess English language proficiency across multiple skills.', 'easy', 1, 1),
('QUESTION_BANK_ID_HERE', 'Which of the following best describes the reading section format?', '["Multiple choice only", "Short answer questions", "Multiple choice and short answers", "Essay writing"]', 'C', 'The reading section typically includes both multiple choice and short answer components.', 'medium', 2, 2),
('QUESTION_BANK_ID_HERE', 'What time management strategy is most effective for reading comprehension?', '["Read all questions first", "Skim the passage quickly", "Read passage carefully then questions", "Answer easy questions first"]', 'A', 'Reading questions first helps focus on relevant information while reading the passage.', 'hard', 3, 3);

-- Repeat similar inserts for other question banks with relevant content for each skill type