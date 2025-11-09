-- Supabase Database Schema for Course Sales Agent

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  instructor TEXT NOT NULL,
  duration TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  category TEXT NOT NULL,
  thumbnail_url TEXT,
  what_you_learn TEXT[] NOT NULL DEFAULT '{}',
  requirements TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_id UUID NOT NULL REFERENCES courses(id),
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  payment_id TEXT NOT NULL,
  amount_paid DECIMAL(10, 2) NOT NULL,
  UNIQUE(user_id, course_id)
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for courses table
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample courses
INSERT INTO courses (title, description, price, instructor, duration, level, category, what_you_learn, requirements) VALUES
  (
    'Complete Web Development Bootcamp',
    'Master web development from scratch. Learn HTML, CSS, JavaScript, React, Node.js, and more in this comprehensive bootcamp.',
    4999,
    'Sarah Johnson',
    '40 hours',
    'beginner',
    'Web Development',
    ARRAY[
      'Build modern websites using HTML5 and CSS3',
      'Create interactive web applications with JavaScript',
      'Develop full-stack applications with React and Node.js',
      'Deploy applications to production',
      'Work with databases and APIs'
    ],
    ARRAY[
      'A computer with internet connection',
      'No prior programming experience required',
      'Willingness to learn and practice'
    ]
  ),
  (
    'Advanced Python Programming',
    'Take your Python skills to the next level. Learn advanced concepts, data structures, algorithms, and best practices.',
    3999,
    'Michael Chen',
    '30 hours',
    'advanced',
    'Programming',
    ARRAY[
      'Master advanced Python concepts and patterns',
      'Implement complex algorithms and data structures',
      'Write clean, efficient, and maintainable code',
      'Work with async/await and concurrency',
      'Build professional Python applications'
    ],
    ARRAY[
      'Basic Python programming knowledge',
      'Understanding of fundamental programming concepts',
      'Familiarity with functions and classes'
    ]
  ),
  (
    'Data Science and Machine Learning',
    'Learn data science and machine learning from industry experts. Work with real datasets and build ML models.',
    5999,
    'Dr. Emily Roberts',
    '50 hours',
    'intermediate',
    'Data Science',
    ARRAY[
      'Analyze and visualize data with Python',
      'Build machine learning models',
      'Work with scikit-learn, pandas, and numpy',
      'Implement neural networks with TensorFlow',
      'Deploy ML models to production'
    ],
    ARRAY[
      'Python programming basics',
      'Basic statistics knowledge',
      'Understanding of linear algebra (helpful but not required)'
    ]
  ),
  (
    'UI/UX Design Fundamentals',
    'Master the principles of user interface and user experience design. Create beautiful and functional designs.',
    2999,
    'Alex Martinez',
    '25 hours',
    'beginner',
    'Design',
    ARRAY[
      'Understand UI/UX design principles',
      'Create wireframes and prototypes',
      'Design mobile and web interfaces',
      'Conduct user research and testing',
      'Use Figma and Adobe XD'
    ],
    ARRAY[
      'Interest in design',
      'No prior design experience required',
      'A computer with design software installed'
    ]
  ),
  (
    'Digital Marketing Masterclass',
    'Learn digital marketing strategies that work. Master SEO, social media marketing, content marketing, and more.',
    3499,
    'Jessica Brown',
    '35 hours',
    'intermediate',
    'Marketing',
    ARRAY[
      'Develop effective marketing strategies',
      'Master SEO and content marketing',
      'Run successful social media campaigns',
      'Analyze marketing metrics and ROI',
      'Build and grow an online presence'
    ],
    ARRAY[
      'Basic understanding of online platforms',
      'Interest in marketing',
      'No prior marketing experience required'
    ]
  );

