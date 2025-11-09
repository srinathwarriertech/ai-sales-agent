/**
 * AI Agent Tools Configuration with MCPs
 * Uses Groq with Qwen3-32b via Vercel AI SDK
 */

import Groq from "groq-sdk";
import { z } from "zod";
import { SupabaseMCP } from "./mcp/supabase-mcp";
import { razorpayPaymentTools, getRazorpayMCPSchema } from "./mcp/razorpay-mcp-tools";

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

// MCP Tool Definitions for the AI Agent
export const courseMCPTools = {
  searchCourses: {
    description: "Search for courses by keyword in title, description, or category",
    parameters: z.object({
      query: z.string().describe("Search keyword or phrase"),
    }),
    execute: async ({ query }: { query: string }) => {
      try {
        const courses = await SupabaseMCP.searchCourses(query);
        return {
          success: true,
          count: courses.length,
          courses: courses.map((c) => ({
            id: c.id,
            title: c.title,
            description: c.description.substring(0, 150) + "...",
            price: c.price,
            level: c.level,
            category: c.category,
            instructor: c.instructor,
            duration: c.duration,
          })),
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "Failed to search courses. Supabase may not be configured.",
        };
      }
    },
  },

  getCourseDetails: {
    description: "Get detailed information about a specific course by ID",
    parameters: z.object({
      courseId: z.string().describe("The unique course ID"),
    }),
    execute: async ({ courseId }: { courseId: string }) => {
      try {
        const course = await SupabaseMCP.getCourse(courseId);
        if (!course) {
          return { success: false, error: "Course not found" };
        }
        return {
          success: true,
          course: {
            ...course,
            formatted_price: `₹${course.price}`,
          },
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "Failed to get course details",
        };
      }
    },
  },

  getCoursesByCategory: {
    description: "Filter courses by category (e.g., 'Web Development', 'Data Science', 'Design', 'Marketing', 'Programming')",
    parameters: z.object({
      category: z.string().describe("Course category to filter by"),
    }),
    execute: async ({ category }: { category: string }) => {
      try {
        const courses = await SupabaseMCP.getCoursesByCategory(category);
        return {
          success: true,
          count: courses.length,
          courses: courses.map((c) => ({
            id: c.id,
            title: c.title,
            price: c.price,
            level: c.level,
            duration: c.duration,
          })),
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "Failed to get courses by category",
        };
      }
    },
  },

  getCoursesByLevel: {
    description: "Filter courses by difficulty level (beginner, intermediate, or advanced)",
    parameters: z.object({
      level: z.enum(["beginner", "intermediate", "advanced"]).describe("Course difficulty level"),
    }),
    execute: async ({ level }: { level: "beginner" | "intermediate" | "advanced" }) => {
      try {
        const courses = await SupabaseMCP.getCoursesByLevel(level);
        return {
          success: true,
          count: courses.length,
          courses: courses.map((c) => ({
            id: c.id,
            title: c.title,
            category: c.category,
            price: c.price,
            instructor: c.instructor,
          })),
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "Failed to get courses by level",
        };
      }
    },
  },
};

// Helper function to generate AI response using Groq directly with Qwen
export async function generateGroqResponse(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    const completion = await groq.chat.completions.create({
      model: "moonshotai/kimi-k2-instruct-0905",
      messages: messages as any[],
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
    });

    return completion.choices[0]?.message?.content || "I apologize, I couldn't generate a response.";
  } catch (error: any) {
    console.error("Groq API Error:", error);
    throw new Error(error.message || "Failed to generate response from Groq");
  }
}

// System prompt for the course sales agent
export const courseSalesAgentPrompt = `You are a helpful and friendly AI sales agent for CourseHub, an online course platform powered by Qwen3-32b via Groq.

Your role:
- Help users discover courses that match their interests and learning goals
- Provide detailed information about courses (content, pricing, instructors, duration)
- Answer questions about requirements and what they'll learn
- Guide users through the enrollment process
- Be conversational, helpful, and supportive without being pushy

You have access to these tools:
- search_courses(query): Search courses by keyword
- get_course_details(courseId): Get detailed course information
- get_courses_by_category(category): Filter by category
- get_courses_by_level(level): Filter by difficulty level

Guidelines:
- Be friendly and conversational
- Ask clarifying questions to understand needs better
- Provide specific recommendations with reasons why they match
- When mentioning courses, include key details like price (in ₹), level, and what they'll learn
- If users show interest in multiple topics, suggest related courses
- Encourage learning without aggressive selling
- If asked about topics outside of courses, politely redirect to course-related topics

Remember: Your goal is to help users find the RIGHT course for them, not just ANY course.`;

// Razorpay MCP Tools for AI Agent
export const razorpayMCPTools = {
  createOrder: {
    ...razorpayPaymentTools.createOrder,
  },
  getOrder: {
    ...razorpayPaymentTools.getOrder,
  },
  getPaymentStatus: {
    ...razorpayPaymentTools.getPaymentStatus,
  },
};

// Export MCP schemas for reference
export const mcpSchemas = {
  supabase: SupabaseMCP.getSchema(),
  razorpay: getRazorpayMCPSchema(),
};
