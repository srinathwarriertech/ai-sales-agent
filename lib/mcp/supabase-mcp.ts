/**
 * Supabase MCP (Model Context Protocol) Integration
 * Provides structured database operations for the AI Sales Agent
 */

import { createClient } from "@supabase/supabase-js";

// Lazy initialization - only create client when needed
let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    // Support multiple naming conventions
    const supabaseUrl = 
      process.env.SUPABASE_URL || 
      process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    const supabaseKey = 
      process.env.SUPABASE_PRIVATE_KEY || 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Supabase configuration missing. Please set either:\n" +
        "  - SUPABASE_URL and SUPABASE_PRIVATE_KEY, or\n" +
        "  - NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
      );
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

export const supabase = {
  get client() {
    return getSupabaseClient();
  },
};

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  instructor: string;
  duration: string;
  level: "beginner" | "intermediate" | "advanced";
  category: string;
  thumbnail_url?: string;
  what_you_learn: string[];
  requirements: string[];
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  purchased_at: string;
  payment_id: string;
  amount_paid: number;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

/**
 * Supabase MCP - Provides structured database operations
 */
export class SupabaseMCP {
  /**
   * Get all available courses
   */
  static async getCourses(): Promise<Course[]> {
    const { data, error } = await supabase.client
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get a specific course by ID
   */
  static async getCourse(courseId: string): Promise<Course | null> {
    const { data, error } = await supabase.client
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Search courses by query
   */
  static async searchCourses(query: string): Promise<Course[]> {
    const { data, error } = await supabase.client
      .from("courses")
      .select("*")
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Filter courses by category
   */
  static async getCoursesByCategory(category: string): Promise<Course[]> {
    const { data, error } = await supabase.client
      .from("courses")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Filter courses by level
   */
  static async getCoursesByLevel(level: string): Promise<Course[]> {
    const { data, error } = await supabase.client
      .from("courses")
      .select("*")
      .eq("level", level)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Check if user has enrolled in a course
   */
  static async hasEnrolled(userId: string, courseId: string): Promise<boolean> {
    const { data, error } = await supabase.client
      .from("enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return !!data;
  }

  /**
   * Get user enrollments
   */
  static async getUserEnrollments(userId: string): Promise<Enrollment[]> {
    const { data, error } = await supabase.client
      .from("enrollments")
      .select("*")
      .eq("user_id", userId)
      .order("purchased_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Create enrollment record after successful payment
   */
  static async createEnrollment(
    userId: string,
    courseId: string,
    paymentId: string,
    amountPaid: number
  ): Promise<Enrollment> {
    const { data, error } = await supabase.client
      .from("enrollments")
      .insert({
        user_id: userId,
        course_id: courseId,
        payment_id: paymentId,
        amount_paid: amountPaid,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Save chat message
   */
  static async saveChatMessage(
    userId: string,
    role: "user" | "assistant",
    content: string
  ): Promise<ChatMessage> {
    const { data, error } = await supabase.client
      .from("chat_messages")
      .insert({
        user_id: userId,
        role,
        content,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get chat history for a user
   */
  static async getChatHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    const { data, error } = await supabase.client
      .from("chat_messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get MCP schema for AI agent
   * This returns available operations the AI can perform
   */
  static getSchema() {
    return {
      name: "supabase_mcp",
      description: "Database operations for course management",
      operations: [
        {
          name: "get_courses",
          description: "Get all available courses",
          parameters: [],
        },
        {
          name: "get_course",
          description: "Get a specific course by ID",
          parameters: [{ name: "courseId", type: "string", required: true }],
        },
        {
          name: "search_courses",
          description: "Search courses by keyword",
          parameters: [{ name: "query", type: "string", required: true }],
        },
        {
          name: "get_courses_by_category",
          description: "Filter courses by category",
          parameters: [{ name: "category", type: "string", required: true }],
        },
        {
          name: "get_courses_by_level",
          description: "Filter courses by difficulty level",
          parameters: [{ name: "level", type: "string", required: true }],
        },
        {
          name: "has_enrolled",
          description: "Check if user has enrolled in a course",
          parameters: [
            { name: "userId", type: "string", required: true },
            { name: "courseId", type: "string", required: true },
          ],
        },
        {
          name: "get_user_enrollments",
          description: "Get all courses a user has enrolled in",
          parameters: [{ name: "userId", type: "string", required: true }],
        },
      ],
    };
  }
}

