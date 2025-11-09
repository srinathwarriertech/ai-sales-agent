/**
 * AI Sales Agent
 * Powered by OpenAI with MCP integrations for Supabase and Razorpay
 */

import { SupabaseMCP, Course } from "./mcp/supabase-mcp";
import { RazorpayMCP } from "./mcp/razorpay-mcp";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AgentContext {
  userId?: string;
  userName?: string;
  previousMessages: Message[];
}

export class SalesAgent {
  private systemPrompt = `You are a friendly and knowledgeable AI sales agent for an online course platform. Your role is to:

1. Help users discover courses that match their interests and goals
2. Answer questions about course content, instructors, and pricing
3. Provide personalized course recommendations
4. Assist with the enrollment process
5. Be conversational, helpful, and not pushy

You have access to the following tools via MCP (Model Context Protocol):

**Supabase MCP** - For course data:
- get_courses(): Get all available courses
- search_courses(query): Search courses by keyword
- get_course(courseId): Get specific course details
- get_courses_by_category(category): Filter by category
- get_courses_by_level(level): Filter by level (beginner/intermediate/advanced)
- has_enrolled(userId, courseId): Check if user enrolled
- get_user_enrollments(userId): Get user's enrolled courses

**Razorpay MCP** - For payments (via MCP Server):
- create_payment_link(amount, currency, customer_contact, customer_email, customer_name, description): Create payment links
- create_order(amount, currency, customer_id, customer_phone, customer_email, customer_name): Create payment orders
- fetch_order(order_id): Get order details
- fetch_payment(payment_id): Get payment details
- fetch_order_payments(order_id): Get all payments for an order
- search_docs(query): Search Razorpay documentation

Guidelines:
- Be conversational and friendly
- Ask clarifying questions to understand user needs
- Provide specific course recommendations with details
- Explain course benefits clearly
- When users want to purchase, guide them through the process
- If asked about topics outside of courses, politely redirect to course-related topics
- Never make up course information - always query the database
`;

  /**
   * Process user message and generate response
   */
  async processMessage(
    userMessage: string,
    context: AgentContext
  ): Promise<string> {
    try {
      const messages: Message[] = [
        { role: "system", content: this.systemPrompt },
        ...context.previousMessages.slice(-10), // Keep last 10 messages for context
        { role: "user", content: userMessage },
      ];

      // Call OpenAI API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          userId: context.userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error("Sales agent error:", error);
      return "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.";
    }
  }

  /**
   * Get greeting message for new users
   */
  getGreeting(userName?: string): string {
    const greeting = userName
      ? `Hi ${userName}! 👋`
      : "Hello! 👋";

    return `${greeting} I'm your AI course advisor. I'm here to help you find the perfect courses for your learning journey.

I can help you:
- Discover courses in various topics
- Get detailed information about courses
- Find courses that match your skill level
- Enroll in courses you're interested in

What kind of courses are you interested in, or is there something specific you'd like to learn?`;
  }

  /**
   * Generate course recommendation message
   */
  formatCourseRecommendation(course: Course): string {
    return `**${course.title}**

${course.description}

**Level:** ${course.level}
**Duration:** ${course.duration}
**Instructor:** ${course.instructor}
**Price:** ₹${course.price}

What you'll learn:
${course.what_you_learn.map((item) => `- ${item}`).join("\n")}

Would you like to know more about this course or enroll in it?`;
  }

  /**
   * Format multiple courses for display
   */
  formatCourseListing(courses: Course[]): string {
    if (courses.length === 0) {
      return "I couldn't find any courses matching your criteria. Would you like to explore other topics?";
    }

    const listings = courses.slice(0, 5).map((course) => {
      return `**${course.title}**
${course.description.substring(0, 100)}...
*Level:* ${course.level} | *Duration:* ${course.duration} | *Price:* ₹${course.price}`;
    });

    const message = `I found ${courses.length} course${courses.length > 1 ? "s" : ""} for you:\n\n${listings.join("\n\n")}`;

    if (courses.length > 5) {
      return message + `\n\nShowing 5 of ${courses.length} courses. Would you like to see more or get details about any specific course?`;
    }

    return message + "\n\nWould you like to know more about any of these courses?";
  }
}

export const salesAgent = new SalesAgent();

