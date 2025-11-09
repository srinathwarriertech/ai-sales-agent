import { NextRequest, NextResponse } from "next/server";
import { SupabaseMCP } from "@/lib/mcp/supabase-mcp";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("query");
    const category = searchParams.get("category");
    const level = searchParams.get("level");

    let courses;

    if (query) {
      courses = await SupabaseMCP.searchCourses(query);
    } else if (category) {
      courses = await SupabaseMCP.getCoursesByCategory(category);
    } else if (level) {
      courses = await SupabaseMCP.getCoursesByLevel(level);
    } else {
      courses = await SupabaseMCP.getCourses();
    }

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Courses API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

