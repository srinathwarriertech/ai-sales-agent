/**
 * Simple Database Setup - Direct Insert
 * Inserts sample course data directly using Supabase client
 * 
 * Note: Tables must be created first via Supabase SQL Editor
 * Usage: npm run setup-data
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Support multiple naming conventions
const supabaseUrl = 
  process.env.SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseKey = 
  process.env.SUPABASE_PRIVATE_KEY || 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: Supabase credentials not found");
  process.exit(1);
}

console.log(`✅ Connected to: ${supabaseUrl}\n`);

const supabase = createClient(supabaseUrl, supabaseKey);

const sampleCourses = [
  {
    title: "Complete Web Development Bootcamp",
    description: "Master web development from scratch. Learn HTML, CSS, JavaScript, React, Node.js, and more in this comprehensive bootcamp. Build real-world projects and launch your career as a full-stack developer.",
    price: 4999,
    instructor: "Sarah Johnson",
    duration: "40 hours",
    level: "beginner",
    category: "Web Development",
    what_you_learn: [
      "Build modern websites using HTML5 and CSS3",
      "Create interactive web applications with JavaScript",
      "Develop full-stack applications with React and Node.js",
      "Deploy applications to production",
      "Work with databases and APIs",
      "Master Git version control",
      "Implement responsive design principles"
    ],
    requirements: [
      "A computer with internet connection",
      "No prior programming experience required",
      "Willingness to learn and practice",
      "Text editor (VS Code recommended)"
    ]
  },
  {
    title: "Advanced JavaScript and TypeScript",
    description: "Deep dive into modern JavaScript and TypeScript. Learn advanced patterns, asynchronous programming, and type-safe development.",
    price: 3799,
    instructor: "Sarah Johnson",
    duration: "35 hours",
    level: "advanced",
    category: "Web Development",
    what_you_learn: [
      "Master ES6+ features and modern JavaScript",
      "Build type-safe applications with TypeScript",
      "Understand closures, prototypes, and the event loop",
      "Work with promises, async/await, and generators",
      "Implement design patterns in JavaScript",
      "Configure TypeScript projects",
      "Debug complex JavaScript applications"
    ],
    requirements: [
      "Strong JavaScript fundamentals",
      "Experience with frontend development",
      "Understanding of basic programming concepts",
      "Familiarity with npm and package management"
    ]
  },
  {
    title: "Advanced Python Programming",
    description: "Take your Python skills to the next level. Learn advanced concepts, data structures, algorithms, and best practices used by professional Python developers.",
    price: 3999,
    instructor: "Michael Chen",
    duration: "30 hours",
    level: "advanced",
    category: "Programming",
    what_you_learn: [
      "Master advanced Python concepts and patterns",
      "Implement complex algorithms and data structures",
      "Write clean, efficient, and maintainable code",
      "Work with async/await and concurrency",
      "Build professional Python applications",
      "Optimize Python performance",
      "Use decorators and metaclasses effectively"
    ],
    requirements: [
      "Basic Python programming knowledge",
      "Understanding of fundamental programming concepts",
      "Familiarity with functions and classes",
      "Experience with pip and virtual environments"
    ]
  },
  {
    title: "Java Programming Masterclass",
    description: "Comprehensive Java course covering from basics to advanced topics. Learn object-oriented programming, design patterns, and Spring framework.",
    price: 4299,
    instructor: "Michael Chen",
    duration: "50 hours",
    level: "intermediate",
    category: "Programming",
    what_you_learn: [
      "Master Java programming fundamentals",
      "Understand object-oriented programming principles",
      "Work with collections and generics",
      "Build applications with Spring Boot",
      "Implement design patterns",
      "Work with databases using JDBC and JPA",
      "Write unit tests with JUnit"
    ],
    requirements: [
      "Basic programming knowledge helpful",
      "Understanding of basic computer operations",
      "JDK installed on your computer",
      "IDE (IntelliJ IDEA or Eclipse)"
    ]
  },
  {
    title: "Data Science and Machine Learning",
    description: "Learn data science and machine learning from industry experts. Work with real datasets, build ML models, and deploy them to production.",
    price: 5999,
    instructor: "Dr. Emily Roberts",
    duration: "50 hours",
    level: "intermediate",
    category: "Data Science",
    what_you_learn: [
      "Analyze and visualize data with Python",
      "Build machine learning models",
      "Work with scikit-learn, pandas, and numpy",
      "Implement neural networks with TensorFlow",
      "Deploy ML models to production",
      "Perform statistical analysis",
      "Handle big data with PySpark"
    ],
    requirements: [
      "Python programming basics",
      "Basic statistics knowledge",
      "Understanding of linear algebra (helpful but not required)",
      "Familiarity with Jupyter notebooks"
    ]
  },
  {
    title: "Deep Learning and Neural Networks",
    description: "Master deep learning and build neural networks from scratch. Learn CNN, RNN, GANs, and transformers with PyTorch and TensorFlow.",
    price: 6499,
    instructor: "Dr. Emily Roberts",
    duration: "60 hours",
    level: "advanced",
    category: "Data Science",
    what_you_learn: [
      "Build neural networks from scratch",
      "Implement CNNs for computer vision",
      "Work with RNNs and LSTMs for sequence data",
      "Understand and implement transformers",
      "Build generative models with GANs",
      "Deploy deep learning models",
      "Optimize training performance"
    ],
    requirements: [
      "Strong Python programming skills",
      "Machine learning fundamentals",
      "Linear algebra and calculus knowledge",
      "Understanding of neural network basics"
    ]
  },
  {
    title: "UI/UX Design Fundamentals",
    description: "Master the principles of user interface and user experience design. Create beautiful and functional designs that users love.",
    price: 2999,
    instructor: "Alex Martinez",
    duration: "25 hours",
    level: "beginner",
    category: "Design",
    what_you_learn: [
      "Understand UI/UX design principles",
      "Create wireframes and prototypes",
      "Design mobile and web interfaces",
      "Conduct user research and testing",
      "Use Figma and Adobe XD",
      "Apply color theory and typography",
      "Build design systems"
    ],
    requirements: [
      "Interest in design",
      "No prior design experience required",
      "A computer with design software installed",
      "Creative mindset"
    ]
  },
  {
    title: "Advanced Figma for Product Design",
    description: "Become a Figma expert. Learn advanced techniques, component systems, auto-layout, and collaborative design workflows.",
    price: 3299,
    instructor: "Alex Martinez",
    duration: "30 hours",
    level: "intermediate",
    category: "Design",
    what_you_learn: [
      "Master advanced Figma features",
      "Build scalable component libraries",
      "Use auto-layout effectively",
      "Create interactive prototypes",
      "Collaborate with development teams",
      "Design responsive interfaces",
      "Implement design tokens"
    ],
    requirements: [
      "Basic Figma knowledge",
      "Understanding of UI/UX principles",
      "Experience with design tools",
      "Familiarity with design systems"
    ]
  },
  {
    title: "Digital Marketing Masterclass",
    description: "Learn digital marketing strategies that work. Master SEO, social media marketing, content marketing, and analytics.",
    price: 3499,
    instructor: "Jessica Brown",
    duration: "35 hours",
    level: "intermediate",
    category: "Marketing",
    what_you_learn: [
      "Develop effective marketing strategies",
      "Master SEO and content marketing",
      "Run successful social media campaigns",
      "Analyze marketing metrics and ROI",
      "Build and grow an online presence",
      "Create engaging content",
      "Use marketing automation tools"
    ],
    requirements: [
      "Basic understanding of online platforms",
      "Interest in marketing",
      "No prior marketing experience required",
      "Familiarity with social media"
    ]
  },
  {
    title: "Growth Hacking and User Acquisition",
    description: "Learn proven growth hacking strategies used by successful startups. Master user acquisition, retention, and viral growth techniques.",
    price: 4199,
    instructor: "Jessica Brown",
    duration: "40 hours",
    level: "advanced",
    category: "Marketing",
    what_you_learn: [
      "Implement growth hacking frameworks",
      "Design viral loops and referral systems",
      "Optimize conversion funnels",
      "Run data-driven experiments",
      "Build growth models",
      "Master A/B testing",
      "Scale user acquisition"
    ],
    requirements: [
      "Basic marketing knowledge",
      "Understanding of metrics and analytics",
      "Experience with digital marketing",
      "Data-driven mindset"
    ]
  },
  {
    title: "Mobile App Development with React Native",
    description: "Build native mobile apps for iOS and Android using React Native and JavaScript. Learn to create beautiful, performant mobile applications.",
    price: 4499,
    instructor: "David Kim",
    duration: "45 hours",
    level: "intermediate",
    category: "Mobile Development",
    what_you_learn: [
      "Build cross-platform mobile apps",
      "Master React Native fundamentals",
      "Integrate native device features",
      "Deploy apps to App Store and Google Play",
      "Implement navigation and state management",
      "Work with mobile APIs",
      "Optimize app performance"
    ],
    requirements: [
      "JavaScript and React basics",
      "Understanding of mobile app concepts",
      "A Mac for iOS development (optional)",
      "Node.js installed"
    ]
  },
  {
    title: "iOS Development with Swift",
    description: "Master iOS app development with Swift. Learn to build professional iOS applications from scratch and publish to the App Store.",
    price: 4799,
    instructor: "David Kim",
    duration: "55 hours",
    level: "intermediate",
    category: "Mobile Development",
    what_you_learn: [
      "Master Swift programming language",
      "Build iOS apps with SwiftUI",
      "Work with UIKit and interface builder",
      "Integrate Core Data and CloudKit",
      "Implement push notifications",
      "Use Core Location and Maps",
      "Publish apps to the App Store"
    ],
    requirements: [
      "Basic programming knowledge",
      "Mac computer with Xcode",
      "Interest in mobile development",
      "Understanding of OOP concepts"
    ]
  },
  {
    title: "Cloud Computing with AWS",
    description: "Master Amazon Web Services and learn to build, deploy, and scale cloud applications. Prepare for AWS certifications.",
    price: 5499,
    instructor: "Rachel Green",
    duration: "55 hours",
    level: "advanced",
    category: "Cloud Computing",
    what_you_learn: [
      "Understand AWS core services",
      "Deploy scalable applications",
      "Implement cloud security best practices",
      "Manage databases and storage",
      "Prepare for AWS certification",
      "Use infrastructure as code",
      "Monitor and optimize costs"
    ],
    requirements: [
      "Basic understanding of web technologies",
      "Linux command line experience",
      "Programming knowledge (any language)",
      "Networking fundamentals"
    ]
  },
  {
    title: "Azure Cloud Administration",
    description: "Learn Microsoft Azure cloud platform. Master Azure services, deployment, and administration for enterprise applications.",
    price: 5299,
    instructor: "Rachel Green",
    duration: "50 hours",
    level: "intermediate",
    category: "Cloud Computing",
    what_you_learn: [
      "Navigate Azure portal and CLI",
      "Deploy virtual machines and containers",
      "Manage Azure storage and databases",
      "Implement Azure Active Directory",
      "Monitor and secure Azure resources",
      "Use Azure DevOps",
      "Prepare for Azure certifications"
    ],
    requirements: [
      "Basic cloud computing concepts",
      "Understanding of networking",
      "Windows or Linux experience",
      "Basic PowerShell knowledge helpful"
    ]
  },
  {
    title: "Cybersecurity Essentials",
    description: "Learn the fundamentals of cybersecurity, ethical hacking, and how to protect systems from threats. Build a career in security.",
    price: 3999,
    instructor: "James Wilson",
    duration: "40 hours",
    level: "intermediate",
    category: "Cybersecurity",
    what_you_learn: [
      "Understand common security vulnerabilities",
      "Learn ethical hacking techniques",
      "Implement security measures",
      "Conduct security audits",
      "Respond to security incidents",
      "Use penetration testing tools",
      "Secure networks and systems"
    ],
    requirements: [
      "Basic networking knowledge",
      "Familiarity with Linux/Unix",
      "Understanding of web technologies",
      "Interest in information security"
    ]
  },
  {
    title: "Blockchain and Smart Contract Security",
    description: "Master blockchain security and smart contract auditing. Learn to identify and prevent vulnerabilities in Web3 applications.",
    price: 5799,
    instructor: "James Wilson",
    duration: "45 hours",
    level: "advanced",
    category: "Cybersecurity",
    what_you_learn: [
      "Understand blockchain security principles",
      "Audit smart contracts",
      "Identify common vulnerabilities",
      "Use security analysis tools",
      "Perform penetration testing on DApps",
      "Secure blockchain networks",
      "Respond to security incidents"
    ],
    requirements: [
      "Solid programming background",
      "Understanding of blockchain basics",
      "Solidity programming knowledge",
      "Security fundamentals"
    ]
  },
  {
    title: "DevOps and CI/CD Masterclass",
    description: "Master DevOps practices, CI/CD pipelines, and automation. Learn Docker, Kubernetes, Jenkins, and modern deployment strategies.",
    price: 4899,
    instructor: "Tom Anderson",
    duration: "48 hours",
    level: "intermediate",
    category: "DevOps",
    what_you_learn: [
      "Master DevOps principles and practices",
      "Build CI/CD pipelines",
      "Work with Docker and containers",
      "Deploy with Kubernetes",
      "Implement infrastructure as code",
      "Monitor applications and infrastructure",
      "Automate deployment workflows"
    ],
    requirements: [
      "Linux command line experience",
      "Basic programming knowledge",
      "Understanding of web applications",
      "Familiarity with Git"
    ]
  },
  {
    title: "Product Management Essentials",
    description: "Learn product management from experienced PMs. Master product strategy, roadmapping, user research, and stakeholder management.",
    price: 3699,
    instructor: "Linda Chen",
    duration: "32 hours",
    level: "beginner",
    category: "Business",
    what_you_learn: [
      "Understand product management role",
      "Develop product strategy",
      "Create and manage roadmaps",
      "Conduct user research",
      "Define product requirements",
      "Work with engineering teams",
      "Measure product success"
    ],
    requirements: [
      "Interest in product management",
      "Basic understanding of software",
      "No technical experience required",
      "Strong communication skills"
    ]
  },
  {
    title: "Startup Fundamentals: From Idea to Launch",
    description: "Learn how to start and grow a successful startup. Cover ideation, validation, MVP development, fundraising, and scaling.",
    price: 4299,
    instructor: "Linda Chen",
    duration: "38 hours",
    level: "intermediate",
    category: "Business",
    what_you_learn: [
      "Validate your startup idea",
      "Build a minimum viable product",
      "Develop business models",
      "Create pitch decks",
      "Understand fundraising",
      "Scale your startup",
      "Build effective teams"
    ],
    requirements: [
      "Entrepreneurial mindset",
      "Basic business understanding",
      "No specific technical skills required",
      "Passion for building products"
    ]
  },
  {
    title: "Kubernetes for Developers",
    description: "Master Kubernetes container orchestration. Learn to deploy, scale, and manage containerized applications in production.",
    price: 4599,
    instructor: "Tom Anderson",
    duration: "42 hours",
    level: "advanced",
    category: "DevOps",
    what_you_learn: [
      "Understand Kubernetes architecture",
      "Deploy applications to Kubernetes",
      "Manage pods, services, and deployments",
      "Configure networking and storage",
      "Implement security best practices",
      "Monitor and troubleshoot clusters",
      "Use Helm for package management"
    ],
    requirements: [
      "Docker experience required",
      "Understanding of containers",
      "Linux command line proficiency",
      "Basic networking knowledge"
    ]
  }
];

async function insertCourses() {
  console.log("🚀 Starting data insert...\n");

  try {
    // Check if courses already exist
    const { data: existing, error: checkError } = await supabase
      .from("courses")
      .select("id");

    if (checkError) {
      console.error("❌ Error: Cannot access courses table");
      console.error("   Message:", checkError.message);
      console.log("\n💡 Make sure you've created the tables first!");
      console.log("   Go to Supabase SQL Editor and run: supabase-complete-setup.sql\n");
      process.exit(1);
    }

    if (existing && existing.length > 0) {
      console.log(`ℹ️  Found ${existing.length} existing courses`);
      console.log("   Do you want to add more? (This won't create duplicates)\n");
    }

    console.log(`📝 Inserting ${sampleCourses.length} courses...\n`);

    // Insert all courses
    const { data, error } = await supabase
      .from("courses")
      .insert(sampleCourses)
      .select();

    if (error) {
      console.error("❌ Error inserting courses:", error.message);
      process.exit(1);
    }

    console.log(`✅ Successfully inserted ${data?.length || 0} courses!\n`);

    // Display inserted courses
    console.log("📚 Courses added:");
    data?.forEach((course, i) => {
      console.log(`   ${i + 1}. ${course.title}`);
      console.log(`      ${course.category} | ${course.level} | ₹${course.price}`);
    });

    // Get totals
    const { data: allCourses } = await supabase
      .from("courses")
      .select("id");

    console.log(`\n✅ Total courses in database: ${allCourses?.length || 0}`);
    console.log("\n🎉 Data setup complete!");
    console.log("\n🚀 Next: Run 'npm run dev' to start the app\n");

  } catch (error: any) {
    console.error("\n❌ Unexpected error:", error.message);
    process.exit(1);
  }
}

insertCourses()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Fatal error:", error.message);
    process.exit(1);
  });

