-- Seed Courses
INSERT INTO public.courses (id, title, description, level, image_url, duration, lessons_count)
VALUES 
  ('course-1', 'English for Beginners', 'Start your English journey with fundamental grammar and vocabulary.', 'beginner', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80', '4 weeks', 3),
  ('course-2', 'Business English Mastery', 'Master professional communication for workplace presentations and meetings.', 'intermediate', 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80', '6 weeks', 2),
  ('course-3', 'IELTS Preparation', 'Comprehensive IELTS preparation for all four sections.', 'advanced', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80', '8 weeks', 1)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  level = EXCLUDED.level,
  image_url = EXCLUDED.image_url,
  duration = EXCLUDED.duration,
  lessons_count = EXCLUDED.lessons_count;

-- Seed Lessons for Course 1 (Beginners)
INSERT INTO public.lessons (id, course_id, title, description, order_index, duration, type, content)
VALUES
  ('l1', 'course-1', 'The Alphabet & Pronunciation', 'Learn the English alphabet and basic pronunciation rules.', 1, '10 min', 'video', '{"type": "video", "videoUrl": "https://example.com/alphabet.mp4", "transcript": "Welcome to your first lesson! Today we will learn the English alphabet. A is for Apple, B is for Ball...", "vocabulary": [{"word": "Alphabet", "definition": "The set of letters used in writing a language", "example": "The English alphabet has 26 letters."}]}'),
  ('l2', 'course-1', 'Basic Greetings', 'Master essential greetings and introductions in English.', 2, '8 min', 'text', '{"type": "text", "body": "Greetings are the first step in any conversation. Here are some common greetings:\\n\\nHello - A universal greeting\\nGood morning - Used before noon\\nGood afternoon - Used from noon to evening\\nGood evening - Used in the evening\\n\\nWhen meeting someone for the first time, you can say:\\nNice to meet you.\\nPleasure to meet you.\\n\\nIn informal situations:\\nHey! or Hi!", "vocabulary": [{"word": "Greeting", "definition": "A polite word or sign of welcome", "example": "Hello is a common greeting."}, {"word": "Introduction", "definition": "The act of presenting someone", "example": "Let me make an introduction."}]}'),
  ('l3', 'course-1', 'Quiz: Introduction', 'Test your knowledge of greetings and the alphabet.', 3, '5 min', 'quiz', '{"type": "quiz"}')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  duration = EXCLUDED.duration,
  type = EXCLUDED.type,
  content = EXCLUDED.content;

-- Seed Lessons for Course 2 (Business English)
INSERT INTO public.lessons (id, course_id, title, description, order_index, duration, type, content)
VALUES
  ('l1-business', 'course-2', 'Email Writing Basics', 'Learn professional email structure and etiquette.', 1, '15 min', 'video', '{"type": "video", "videoUrl": "https://example.com/business-email.mp4", "transcript": "Professional emails follow a clear structure. Start with a formal greeting like Dear Mr./Ms. Last Name. State your purpose clearly in the first paragraph. Use professional language throughout.", "vocabulary": [{"word": "Etiquette", "definition": "The customary code of polite behavior", "example": "Email etiquette is important in business."}, {"word": "Formal", "definition": "Following conventional requirements", "example": "Use a formal tone in business emails."}]}'),
  ('l2-business', 'course-2', 'Meeting Vocabulary', 'Essential vocabulary and phrases for professional meetings.', 2, '12 min', 'text', '{"type": "text", "body": "Business meetings require specific vocabulary:\\n\\nStarting a meeting:\\n- Let us begin / Let us get started\\n- Thank you all for coming\\n\\nMaking suggestions:\\n- I would like to propose...\\n- What if we...\\n- How about...\\n\\nAgreeing/Disagreeing:\\n- I agree with that point\\n- I see your point, however...\\n- That is a valid concern\\n\\nConcluding:\\n- To summarize...\\n- In conclusion...\\n- Thank you for your time", "vocabulary": [{"word": "Agenda", "definition": "A list of items to be discussed at a meeting", "example": "What is on the agenda today?"}, {"word": "Minutes", "definition": "A written record of a meeting", "example": "Please review the meeting minutes."}]}')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  duration = EXCLUDED.duration,
  type = EXCLUDED.type,
  content = EXCLUDED.content;

-- Seed Lessons for Course 3 (IELTS)
INSERT INTO public.lessons (id, course_id, title, description, order_index, duration, type, content)
VALUES
  ('l1-ielts', 'course-3', 'Skimming and Scanning', 'Master essential reading strategies for IELTS.', 1, '20 min', 'video', '{"type": "video", "videoUrl": "https://example.com/ielts-reading.mp4", "transcript": "Skimming and scanning are crucial IELTS reading strategies. Skimming means reading quickly to get the main idea. Scanning means searching for specific information. Practice these techniques to improve your reading speed and comprehension.", "vocabulary": [{"word": "Skimming", "definition": "Reading quickly to understand the main idea", "example": "Skim the passage to find the topic."}, {"word": "Scanning", "definition": "Looking for specific information in a text", "example": "Scan for the answer to question 3."}]}')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  duration = EXCLUDED.duration,
  type = EXCLUDED.type,
  content = EXCLUDED.content;

