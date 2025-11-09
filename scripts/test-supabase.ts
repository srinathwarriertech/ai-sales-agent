/**
 * Test Supabase Connection
 * Quick test to verify the chatbot can access courses
 */

import { SupabaseMCP } from "../lib/mcp/supabase-mcp";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function testConnection() {
  console.log("🧪 Testing Supabase Connection...\n");

  try {
    // Test 1: Get all courses
    console.log("Test 1: Fetching all courses...");
    const allCourses = await SupabaseMCP.getCourses();
    console.log(`✅ Found ${allCourses.length} courses\n`);

    if (allCourses.length > 0) {
      console.log("Sample courses:");
      allCourses.slice(0, 3).forEach((course, i) => {
        console.log(`   ${i + 1}. ${course.title}`);
        console.log(`      Category: ${course.category} | Level: ${course.level} | Price: ₹${course.price}`);
      });
      console.log("");
    }

    // Test 2: Search courses
    console.log("Test 2: Searching for 'web' courses...");
    const webCourses = await SupabaseMCP.searchCourses("web");
    console.log(`✅ Found ${webCourses.length} courses matching 'web'\n`);

    if (webCourses.length > 0) {
      webCourses.forEach((course, i) => {
        console.log(`   ${i + 1}. ${course.title}`);
      });
      console.log("");
    }

    // Test 3: Get by category
    console.log("Test 3: Getting 'Programming' courses...");
    const programmingCourses = await SupabaseMCP.getCoursesByCategory("Programming");
    console.log(`✅ Found ${programmingCourses.length} Programming courses\n`);

    if (programmingCourses.length > 0) {
      programmingCourses.forEach((course, i) => {
        console.log(`   ${i + 1}. ${course.title} - ${course.instructor}`);
      });
      console.log("");
    }

    // Test 4: Get by level
    console.log("Test 4: Getting 'beginner' courses...");
    const beginnerCourses = await SupabaseMCP.getCoursesByLevel("beginner");
    console.log(`✅ Found ${beginnerCourses.length} beginner courses\n`);

    if (beginnerCourses.length > 0) {
      beginnerCourses.forEach((course, i) => {
        console.log(`   ${i + 1}. ${course.title} - ₹${course.price}`);
      });
      console.log("");
    }

    console.log("🎉 All tests passed! Supabase is properly connected.");
    console.log("\n✅ The chatbot can now access real course data from your database!");
    console.log("\nNext: Start your app with 'npm run dev' and ask the chatbot about courses.\n");

  } catch (error: any) {
    console.error("\n❌ Connection test failed!");
    console.error("Error:", error.message);
    console.log("\n💡 Troubleshooting:");
    console.log("   1. Check SUPABASE_URL in .env.local");
    console.log("   2. Check SUPABASE_PRIVATE_KEY in .env.local");
    console.log("   3. Verify tables exist in Supabase (run the SQL setup)");
    console.log("   4. Check Supabase project is active\n");
    process.exit(1);
  }
}

testConnection()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error.message);
    process.exit(1);
  });

