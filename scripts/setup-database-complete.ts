/**
 * Complete Database Setup Script
 * Creates tables and inserts sample data using raw SQL
 * 
 * Usage: npm run setup-db-complete
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

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
  process.exit(1);
}

console.log(`✅ Using Supabase URL: ${supabaseUrl}`);
console.log(`✅ Using Supabase Key: ${supabaseKey.substring(0, 20)}...\n`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQL(sql: string, description: string) {
  console.log(`📝 ${description}...`);
  const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });
  
  if (error) {
    console.error(`❌ Error: ${error.message}`);
    // Try alternative method
    return false;
  }
  
  console.log(`✅ ${description} - Done`);
  return true;
}

async function setupDatabaseComplete() {
  console.log("🚀 Starting complete database setup...\n");

  try {
    // Read the SQL file
    const sqlFilePath = path.resolve(process.cwd(), "supabase-complete-setup.sql");
    
    if (!fs.existsSync(sqlFilePath)) {
      console.error("❌ Error: supabase-complete-setup.sql not found");
      console.error("Please make sure the file exists in the project root");
      process.exit(1);
    }

    console.log("📖 Reading SQL setup file...\n");
    const sqlContent = fs.readFileSync(sqlFilePath, "utf-8");

    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    console.log(`Found ${statements.length} SQL statements to execute\n`);
    console.log("⚠️  Note: This might show some errors if tables already exist. That's okay!\n");

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and DO blocks (PostgreSQL doesn't support them via REST API)
      if (statement.startsWith('DO $$') || statement.includes('RAISE NOTICE')) {
        continue;
      }

      try {
        // Execute the statement
        const { error } = await supabase.rpc('query', { query_text: statement + ';' });
        
        if (error) {
          // Check if it's just a "already exists" error, which is fine
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate')) {
            console.log(`ℹ️  Skipping: Object already exists (${i + 1}/${statements.length})`);
          } else {
            console.error(`⚠️  Statement ${i + 1} error: ${error.message}`);
          }
        } else {
          console.log(`✅ Executed statement ${i + 1}/${statements.length}`);
        }
      } catch (err: any) {
        console.error(`⚠️  Error on statement ${i + 1}: ${err.message}`);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📋 Verifying setup...\n");

    // Verify courses
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select("id, title, category, level, price")
      .order("created_at", { ascending: false });

    if (coursesError) {
      console.error("❌ Error verifying courses:", coursesError.message);
      console.log("\n⚠️  Tables might not be created. Please run the SQL manually in Supabase SQL Editor.");
      console.log("   File: supabase-complete-setup.sql\n");
      process.exit(1);
    }

    console.log(`✅ Courses table: ${courses?.length || 0} courses found`);
    
    if (courses && courses.length > 0) {
      console.log("\n📚 Sample courses:");
      courses.slice(0, 5).forEach((course, i) => {
        console.log(`   ${i + 1}. ${course.title}`);
        console.log(`      Category: ${course.category} | Level: ${course.level} | Price: ₹${course.price}`);
      });
    }

    // Verify enrollments table
    const { error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("id")
      .limit(1);

    if (enrollmentsError) {
      console.log("⚠️  Enrollments table check failed");
    } else {
      console.log("✅ Enrollments table: Ready");
    }

    // Verify chat_messages table
    const { error: messagesError } = await supabase
      .from("chat_messages")
      .select("id")
      .limit(1);

    if (messagesError) {
      console.log("⚠️  Chat_messages table check failed");
    } else {
      console.log("✅ Chat_messages table: Ready");
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎉 Database setup complete!\n");
    console.log("🚀 Next steps:");
    console.log("   1. Run 'npm run dev' to start the development server");
    console.log("   2. Open http://localhost:3000 in your browser");
    console.log("   3. Browse courses and test the AI chat");
    console.log("   4. Sign up and try enrolling in a course\n");

  } catch (error: any) {
    console.error("\n❌ Unexpected error:", error.message);
    console.log("\n⚠️  If the automated setup doesn't work, please:");
    console.log("   1. Go to https://app.supabase.com");
    console.log("   2. Select your project");
    console.log("   3. Click 'SQL Editor' → 'New query'");
    console.log("   4. Copy contents of 'supabase-complete-setup.sql'");
    console.log("   5. Paste and click 'Run'\n");
    process.exit(1);
  }
}

// Run the setup
setupDatabaseComplete()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Fatal error:", error.message);
    console.log("\n💡 Try running the SQL file manually in Supabase SQL Editor");
    process.exit(1);
  });

