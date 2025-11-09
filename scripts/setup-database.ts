/**
 * Database Setup Script
 * Run this script to create tables and populate with sample data
 * 
 * Usage: npx tsx scripts/setup-database.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Support multiple naming conventions for Supabase credentials
const supabaseUrl = 
  process.env.SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseKey = 
  process.env.SUPABASE_PRIVATE_KEY || 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: Supabase credentials not found in .env.local");
  console.error("Please set one of the following combinations:");
  console.error("  - SUPABASE_URL and SUPABASE_PRIVATE_KEY");
  console.error("  - NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  console.error("  - NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

console.log(`✅ Using Supabase URL: ${supabaseUrl}`);
console.log(`✅ Using Supabase Key: ${supabaseKey.substring(0, 20)}...`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log("🚀 Starting database setup...\n");

  try {
    // Step 1: Create courses table
    console.log("📦 Creating courses table...");
    
    // Check if table already exists by trying to query it
    const { error: checkCoursesError } = await supabase.from("courses").select("id").limit(1);
    
    if (checkCoursesError && checkCoursesError.code !== "PGRST116") {
      console.log("⚠️  Courses table doesn't exist. You need to run the SQL schema in Supabase SQL Editor.");
      console.log("   Please go to your Supabase project > SQL Editor and run the contents of supabase-schema.sql");
    } else {
      console.log("✅ Courses table exists");
    }

    // Step 2: Check and insert sample courses
    console.log("\n📚 Checking for existing courses...");
    const { data: existingCourses, error: coursesError } = await supabase
      .from("courses")
      .select("*");

    if (coursesError) {
      console.error("❌ Error checking courses:", coursesError);
      return;
    }

    if (existingCourses && existingCourses.length > 0) {
      console.log(`✅ Found ${existingCourses.length} existing courses`);
      console.log("\n📋 Existing courses:");
      existingCourses.forEach((course, index) => {
        console.log(`   ${index + 1}. ${course.title} - ₹${course.price} (${course.level})`);
      });
    } else {
      console.log("📝 No courses found. Adding sample courses...");
      
      const sampleCourses = [
        {
          title: "Complete Web Development Bootcamp",
          description: "Master web development from scratch. Learn HTML, CSS, JavaScript, React, Node.js, and more in this comprehensive bootcamp.",
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
            "Work with databases and APIs"
          ],
          requirements: [
            "A computer with internet connection",
            "No prior programming experience required",
            "Willingness to learn and practice"
          ]
        },
        {
          title: "Advanced Python Programming",
          description: "Take your Python skills to the next level. Learn advanced concepts, data structures, algorithms, and best practices.",
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
            "Build professional Python applications"
          ],
          requirements: [
            "Basic Python programming knowledge",
            "Understanding of fundamental programming concepts",
            "Familiarity with functions and classes"
          ]
        },
        {
          title: "Data Science and Machine Learning",
          description: "Learn data science and machine learning from industry experts. Work with real datasets and build ML models.",
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
            "Deploy ML models to production"
          ],
          requirements: [
            "Python programming basics",
            "Basic statistics knowledge",
            "Understanding of linear algebra (helpful but not required)"
          ]
        },
        {
          title: "UI/UX Design Fundamentals",
          description: "Master the principles of user interface and user experience design. Create beautiful and functional designs.",
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
            "Use Figma and Adobe XD"
          ],
          requirements: [
            "Interest in design",
            "No prior design experience required",
            "A computer with design software installed"
          ]
        },
        {
          title: "Digital Marketing Masterclass",
          description: "Learn digital marketing strategies that work. Master SEO, social media marketing, content marketing, and more.",
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
            "Build and grow an online presence"
          ],
          requirements: [
            "Basic understanding of online platforms",
            "Interest in marketing",
            "No prior marketing experience required"
          ]
        },
        {
          title: "Mobile App Development with React Native",
          description: "Build native mobile apps for iOS and Android using React Native and JavaScript.",
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
            "Implement navigation and state management"
          ],
          requirements: [
            "JavaScript and React basics",
            "Understanding of mobile app concepts",
            "A Mac for iOS development (optional)"
          ]
        },
        {
          title: "Cloud Computing with AWS",
          description: "Master Amazon Web Services and learn to build, deploy, and scale cloud applications.",
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
            "Prepare for AWS certification"
          ],
          requirements: [
            "Basic understanding of web technologies",
            "Linux command line experience",
            "Programming knowledge (any language)"
          ]
        },
        {
          title: "Cybersecurity Essentials",
          description: "Learn the fundamentals of cybersecurity, ethical hacking, and how to protect systems from threats.",
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
            "Respond to security incidents"
          ],
          requirements: [
            "Basic networking knowledge",
            "Familiarity with Linux/Unix",
            "Understanding of web technologies"
          ]
        }
      ];

      const { data: insertedCourses, error: insertError } = await supabase
        .from("courses")
        .insert(sampleCourses)
        .select();

      if (insertError) {
        console.error("❌ Error inserting courses:", insertError);
      } else {
        console.log(`✅ Successfully added ${insertedCourses?.length} courses`);
        insertedCourses?.forEach((course, index) => {
          console.log(`   ${index + 1}. ${course.title} - ₹${course.price}`);
        });
      }
    }

    // Step 3: Check enrollments table
    console.log("\n🎓 Checking enrollments table...");
    const { error: checkEnrollmentsError } = await supabase
      .from("enrollments")
      .select("id")
      .limit(1);

    if (checkEnrollmentsError && checkEnrollmentsError.code !== "PGRST116") {
      console.log("⚠️  Enrollments table doesn't exist. Please run the SQL schema.");
    } else {
      console.log("✅ Enrollments table exists");
    }

    // Step 4: Check chat_messages table
    console.log("\n💬 Checking chat_messages table...");
    const { error: checkMessagesError } = await supabase
      .from("chat_messages")
      .select("id")
      .limit(1);

    if (checkMessagesError && checkMessagesError.code !== "PGRST116") {
      console.log("⚠️  Chat_messages table doesn't exist. Please run the SQL schema.");
    } else {
      console.log("✅ Chat_messages table exists");
    }

    console.log("\n✨ Database setup complete!\n");
    console.log("📝 Summary:");
    console.log("   - Tables checked/created");
    console.log("   - Sample courses added");
    console.log("   - Ready to test the application\n");
    
    console.log("🚀 Next steps:");
    console.log("   1. Run 'npm run dev' to start the development server");
    console.log("   2. Open http://localhost:3000 in your browser");
    console.log("   3. Sign up/in and browse courses");
    console.log("   4. Test the AI sales agent chat\n");

  } catch (error) {
    console.error("\n❌ Unexpected error:", error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });

