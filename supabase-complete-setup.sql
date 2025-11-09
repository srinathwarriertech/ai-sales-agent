-- ================================================================
-- Supabase Complete Database Setup for Course Sales Agent
-- ================================================================
-- Instructions:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Create a new query
-- 4. Copy and paste this entire file
-- 5. Click "Run" to execute
-- ================================================================

-- Clean up existing tables (if you want to start fresh)
-- Uncomment the following lines if you want to drop existing tables
-- DROP TABLE IF EXISTS chat_messages CASCADE;
-- DROP TABLE IF EXISTS enrollments CASCADE;
-- DROP TABLE IF EXISTS courses CASCADE;
-- DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ================================================================
-- SECTION 1: Create Tables
-- ================================================================

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
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
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

-- ================================================================
-- SECTION 2: Create Indexes for Performance
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_price ON courses(price);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- ================================================================
-- SECTION 3: Create Functions and Triggers
-- ================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for courses table
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- SECTION 4: Insert Sample Data
-- ================================================================

-- Insert comprehensive sample courses
INSERT INTO courses (title, description, price, instructor, duration, level, category, what_you_learn, requirements) VALUES
  -- Web Development Courses
  (
    'Complete Web Development Bootcamp',
    'Master web development from scratch. Learn HTML, CSS, JavaScript, React, Node.js, and more in this comprehensive bootcamp. Build real-world projects and launch your career as a full-stack developer.',
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
      'Work with databases and APIs',
      'Master Git version control',
      'Implement responsive design principles'
    ],
    ARRAY[
      'A computer with internet connection',
      'No prior programming experience required',
      'Willingness to learn and practice',
      'Text editor (VS Code recommended)'
    ]
  ),
  (
    'Advanced JavaScript and TypeScript',
    'Deep dive into modern JavaScript and TypeScript. Learn advanced patterns, asynchronous programming, and type-safe development.',
    3799,
    'Sarah Johnson',
    '35 hours',
    'advanced',
    'Web Development',
    ARRAY[
      'Master ES6+ features and modern JavaScript',
      'Build type-safe applications with TypeScript',
      'Understand closures, prototypes, and the event loop',
      'Work with promises, async/await, and generators',
      'Implement design patterns in JavaScript',
      'Configure TypeScript projects',
      'Debug complex JavaScript applications'
    ],
    ARRAY[
      'Strong JavaScript fundamentals',
      'Experience with frontend development',
      'Understanding of basic programming concepts',
      'Familiarity with npm and package management'
    ]
  ),

  -- Programming Courses
  (
    'Advanced Python Programming',
    'Take your Python skills to the next level. Learn advanced concepts, data structures, algorithms, and best practices used by professional Python developers.',
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
      'Build professional Python applications',
      'Optimize Python performance',
      'Use decorators and metaclasses effectively'
    ],
    ARRAY[
      'Basic Python programming knowledge',
      'Understanding of fundamental programming concepts',
      'Familiarity with functions and classes',
      'Experience with pip and virtual environments'
    ]
  ),
  (
    'Java Programming Masterclass',
    'Comprehensive Java course covering from basics to advanced topics. Learn object-oriented programming, design patterns, and Spring framework.',
    4299,
    'Michael Chen',
    '50 hours',
    'intermediate',
    'Programming',
    ARRAY[
      'Master Java programming fundamentals',
      'Understand object-oriented programming principles',
      'Work with collections and generics',
      'Build applications with Spring Boot',
      'Implement design patterns',
      'Work with databases using JDBC and JPA',
      'Write unit tests with JUnit'
    ],
    ARRAY[
      'Basic programming knowledge helpful',
      'Understanding of basic computer operations',
      'JDK installed on your computer',
      'IDE (IntelliJ IDEA or Eclipse)'
    ]
  ),

  -- Data Science Courses
  (
    'Data Science and Machine Learning',
    'Learn data science and machine learning from industry experts. Work with real datasets, build ML models, and deploy them to production.',
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
      'Deploy ML models to production',
      'Perform statistical analysis',
      'Handle big data with PySpark'
    ],
    ARRAY[
      'Python programming basics',
      'Basic statistics knowledge',
      'Understanding of linear algebra (helpful but not required)',
      'Familiarity with Jupyter notebooks'
    ]
  ),
  (
    'Deep Learning and Neural Networks',
    'Master deep learning and build neural networks from scratch. Learn CNN, RNN, GANs, and transformers with PyTorch and TensorFlow.',
    6499,
    'Dr. Emily Roberts',
    '60 hours',
    'advanced',
    'Data Science',
    ARRAY[
      'Build neural networks from scratch',
      'Implement CNNs for computer vision',
      'Work with RNNs and LSTMs for sequence data',
      'Understand and implement transformers',
      'Build generative models with GANs',
      'Deploy deep learning models',
      'Optimize training performance'
    ],
    ARRAY[
      'Strong Python programming skills',
      'Machine learning fundamentals',
      'Linear algebra and calculus knowledge',
      'Understanding of neural network basics'
    ]
  ),

  -- Design Courses
  (
    'UI/UX Design Fundamentals',
    'Master the principles of user interface and user experience design. Create beautiful and functional designs that users love.',
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
      'Use Figma and Adobe XD',
      'Apply color theory and typography',
      'Build design systems'
    ],
    ARRAY[
      'Interest in design',
      'No prior design experience required',
      'A computer with design software installed',
      'Creative mindset'
    ]
  ),
  (
    'Advanced Figma for Product Design',
    'Become a Figma expert. Learn advanced techniques, component systems, auto-layout, and collaborative design workflows.',
    3299,
    'Alex Martinez',
    '30 hours',
    'intermediate',
    'Design',
    ARRAY[
      'Master advanced Figma features',
      'Build scalable component libraries',
      'Use auto-layout effectively',
      'Create interactive prototypes',
      'Collaborate with development teams',
      'Design responsive interfaces',
      'Implement design tokens'
    ],
    ARRAY[
      'Basic Figma knowledge',
      'Understanding of UI/UX principles',
      'Experience with design tools',
      'Familiarity with design systems'
    ]
  ),

  -- Marketing Courses
  (
    'Digital Marketing Masterclass',
    'Learn digital marketing strategies that work. Master SEO, social media marketing, content marketing, and analytics.',
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
      'Build and grow an online presence',
      'Create engaging content',
      'Use marketing automation tools'
    ],
    ARRAY[
      'Basic understanding of online platforms',
      'Interest in marketing',
      'No prior marketing experience required',
      'Familiarity with social media'
    ]
  ),
  (
    'Growth Hacking and User Acquisition',
    'Learn proven growth hacking strategies used by successful startups. Master user acquisition, retention, and viral growth techniques.',
    4199,
    'Jessica Brown',
    '40 hours',
    'advanced',
    'Marketing',
    ARRAY[
      'Implement growth hacking frameworks',
      'Design viral loops and referral systems',
      'Optimize conversion funnels',
      'Run data-driven experiments',
      'Build growth models',
      'Master A/B testing',
      'Scale user acquisition'
    ],
    ARRAY[
      'Basic marketing knowledge',
      'Understanding of metrics and analytics',
      'Experience with digital marketing',
      'Data-driven mindset'
    ]
  ),

  -- Mobile Development Courses
  (
    'Mobile App Development with React Native',
    'Build native mobile apps for iOS and Android using React Native and JavaScript. Learn to create beautiful, performant mobile applications.',
    4499,
    'David Kim',
    '45 hours',
    'intermediate',
    'Mobile Development',
    ARRAY[
      'Build cross-platform mobile apps',
      'Master React Native fundamentals',
      'Integrate native device features',
      'Deploy apps to App Store and Google Play',
      'Implement navigation and state management',
      'Work with mobile APIs',
      'Optimize app performance'
    ],
    ARRAY[
      'JavaScript and React basics',
      'Understanding of mobile app concepts',
      'A Mac for iOS development (optional)',
      'Node.js installed'
    ]
  ),
  (
    'iOS Development with Swift',
    'Master iOS app development with Swift. Learn to build professional iOS applications from scratch and publish to the App Store.',
    4799,
    'David Kim',
    '55 hours',
    'intermediate',
    'Mobile Development',
    ARRAY[
      'Master Swift programming language',
      'Build iOS apps with SwiftUI',
      'Work with UIKit and interface builder',
      'Integrate Core Data and CloudKit',
      'Implement push notifications',
      'Use Core Location and Maps',
      'Publish apps to the App Store'
    ],
    ARRAY[
      'Basic programming knowledge',
      'Mac computer with Xcode',
      'Interest in mobile development',
      'Understanding of OOP concepts'
    ]
  ),

  -- Cloud Computing Courses
  (
    'Cloud Computing with AWS',
    'Master Amazon Web Services and learn to build, deploy, and scale cloud applications. Prepare for AWS certifications.',
    5499,
    'Rachel Green',
    '55 hours',
    'advanced',
    'Cloud Computing',
    ARRAY[
      'Understand AWS core services',
      'Deploy scalable applications',
      'Implement cloud security best practices',
      'Manage databases and storage',
      'Prepare for AWS certification',
      'Use infrastructure as code',
      'Monitor and optimize costs'
    ],
    ARRAY[
      'Basic understanding of web technologies',
      'Linux command line experience',
      'Programming knowledge (any language)',
      'Networking fundamentals'
    ]
  ),
  (
    'Azure Cloud Administration',
    'Learn Microsoft Azure cloud platform. Master Azure services, deployment, and administration for enterprise applications.',
    5299,
    'Rachel Green',
    '50 hours',
    'intermediate',
    'Cloud Computing',
    ARRAY[
      'Navigate Azure portal and CLI',
      'Deploy virtual machines and containers',
      'Manage Azure storage and databases',
      'Implement Azure Active Directory',
      'Monitor and secure Azure resources',
      'Use Azure DevOps',
      'Prepare for Azure certifications'
    ],
    ARRAY[
      'Basic cloud computing concepts',
      'Understanding of networking',
      'Windows or Linux experience',
      'Basic PowerShell knowledge helpful'
    ]
  ),

  -- Cybersecurity Courses
  (
    'Cybersecurity Essentials',
    'Learn the fundamentals of cybersecurity, ethical hacking, and how to protect systems from threats. Build a career in security.',
    3999,
    'James Wilson',
    '40 hours',
    'intermediate',
    'Cybersecurity',
    ARRAY[
      'Understand common security vulnerabilities',
      'Learn ethical hacking techniques',
      'Implement security measures',
      'Conduct security audits',
      'Respond to security incidents',
      'Use penetration testing tools',
      'Secure networks and systems'
    ],
    ARRAY[
      'Basic networking knowledge',
      'Familiarity with Linux/Unix',
      'Understanding of web technologies',
      'Interest in information security'
    ]
  ),
  (
    'Blockchain and Smart Contract Security',
    'Master blockchain security and smart contract auditing. Learn to identify and prevent vulnerabilities in Web3 applications.',
    5799,
    'James Wilson',
    '45 hours',
    'advanced',
    'Cybersecurity',
    ARRAY[
      'Understand blockchain security principles',
      'Audit smart contracts',
      'Identify common vulnerabilities',
      'Use security analysis tools',
      'Perform penetration testing on DApps',
      'Secure blockchain networks',
      'Respond to security incidents'
    ],
    ARRAY[
      'Solid programming background',
      'Understanding of blockchain basics',
      'Solidity programming knowledge',
      'Security fundamentals'
    ]
  ),

  -- DevOps Courses
  (
    'DevOps and CI/CD Masterclass',
    'Master DevOps practices, CI/CD pipelines, and automation. Learn Docker, Kubernetes, Jenkins, and modern deployment strategies.',
    4899,
    'Tom Anderson',
    '48 hours',
    'intermediate',
    'DevOps',
    ARRAY[
      'Master DevOps principles and practices',
      'Build CI/CD pipelines',
      'Work with Docker and containers',
      'Deploy with Kubernetes',
      'Implement infrastructure as code',
      'Monitor applications and infrastructure',
      'Automate deployment workflows'
    ],
    ARRAY[
      'Linux command line experience',
      'Basic programming knowledge',
      'Understanding of web applications',
      'Familiarity with Git'
    ]
  ),

  -- Business Courses
  (
    'Product Management Essentials',
    'Learn product management from experienced PMs. Master product strategy, roadmapping, user research, and stakeholder management.',
    3699,
    'Linda Chen',
    '32 hours',
    'beginner',
    'Business',
    ARRAY[
      'Understand product management role',
      'Develop product strategy',
      'Create and manage roadmaps',
      'Conduct user research',
      'Define product requirements',
      'Work with engineering teams',
      'Measure product success'
    ],
    ARRAY[
      'Interest in product management',
      'Basic understanding of software',
      'No technical experience required',
      'Strong communication skills'
    ]
  ),
  (
    'Startup Fundamentals: From Idea to Launch',
    'Learn how to start and grow a successful startup. Cover ideation, validation, MVP development, fundraising, and scaling.',
    4299,
    'Linda Chen',
    '38 hours',
    'intermediate',
    'Business',
    ARRAY[
      'Validate your startup idea',
      'Build a minimum viable product',
      'Develop business models',
      'Create pitch decks',
      'Understand fundraising',
      'Scale your startup',
      'Build effective teams'
    ],
    ARRAY[
      'Entrepreneurial mindset',
      'Basic business understanding',
      'No specific technical skills required',
      'Passion for building products'
    ]
  )
ON CONFLICT DO NOTHING;

-- ================================================================
-- SECTION 5: Verify Installation
-- ================================================================

-- Check if data was inserted successfully
DO $$
DECLARE
  course_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO course_count FROM courses;
  RAISE NOTICE '✅ Database setup complete!';
  RAISE NOTICE '📚 Total courses in database: %', course_count;
  RAISE NOTICE '🎉 You can now start using the application!';
END $$;

-- Display sample of inserted courses
SELECT 
  title,
  instructor,
  level,
  category,
  price
FROM courses
ORDER BY category, level
LIMIT 10;

