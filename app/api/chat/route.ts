import { NextRequest } from "next/server";
import { streamText, tool } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { courseMCPTools, razorpayMCPTools } from "@/lib/mastra-agent";

// Create Groq provider using OpenAI-compatible endpoint
const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY || "",
});

// Removed edge runtime to ensure tool/function calling works properly
// export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    // Check if Groq is configured
    if (!process.env.GROQ_API_KEY) {
      return new Response(
        JSON.stringify({
          message:
            "Hi! 👋 I'm your AI course advisor, but I'm currently not fully configured. To enable the AI chat feature, please add your GROQ_API_KEY to the environment variables. In the meantime, feel free to browse our courses!",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { messages } = await req.json();
    
    console.log("Received chat request with", messages.length, "messages");

    // System message for the AI
    const systemMessage = {
      role: "system",
      content: `You are a helpful and friendly AI sales agent for CourseHub, an online course platform.

Your role:
- Help users discover courses matching their interests and goals
- Provide detailed course information (content, pricing, instructors, duration)
- Answer questions about requirements and learning outcomes
- Guide users through the enrollment and payment process
- Be conversational, helpful, and supportive without being pushy

COURSE DISCOVERY TOOLS (REAL database data):
- searchCourses(query): Search courses by keyword - USE THIS to find courses
- getCourseDetails(courseId): Get detailed course information
- getCoursesByCategory(category): Filter by category (Web Development, Programming, Data Science, Design, Marketing, Mobile Development, Cloud Computing, Cybersecurity, DevOps, Business)
- getCoursesByLevel(level): Filter by difficulty level (beginner, intermediate, advanced)

PAYMENT TOOLS (Razorpay Gateway):
- createOrder: Create a payment order for course enrollment (requires: amount, customer_id, customer_phone, customer_email, customer_name, order_note, course_id)
- getOrder: Check order details and status by order_id
- getPaymentStatus: Verify payment completion (requires: order_id, expected_amount)

CRITICAL RULES:
1. ALWAYS use the tools to get actual course data - NEVER make up course names or details
2. When a user asks about courses, IMMEDIATELY call searchCourses or getCoursesByCategory
3. Only share information returned by the tools
4. If tools return no results, tell the user no matching courses were found
5. Include actual prices (in ₹), instructors, and details from the tool results
6. When a user wants to enroll, use createOrder to initiate payment - ALWAYS include course_id in the order
7. Payment tools may not work if Razorpay credentials aren't configured - handle gracefully
8. When creating orders, ALWAYS extract and include the course_id from the course details

Guidelines:
- Be friendly and conversational
- Ask clarifying questions to understand needs
- Provide specific recommendations with reasons
- Always use real data from the tools
- Suggest related courses for multiple interests
- Encourage learning without aggressive selling
- Redirect non-course topics politely
- Guide users through payment process when they're ready to enroll

Goal: Help users find the RIGHT course and complete enrollment smoothly.`,
    };

    // Convert MCP tools to Vercel AI SDK format with error handling
    const aiTools = {
      searchCourses: tool({
        description: courseMCPTools.searchCourses.description,
        parameters: courseMCPTools.searchCourses.parameters,
        execute: async (params: any) => {
          try {
            console.log("Calling searchCourses with:", params);
            const result = await courseMCPTools.searchCourses.execute(params);
            console.log("searchCourses result:", result.success ? `${result.count} courses found` : result.error);
            return result;
          } catch (error: any) {
            console.error("searchCourses error:", error);
            return { success: false, error: error.message };
          }
        },
      }),
      getCourseDetails: tool({
        description: courseMCPTools.getCourseDetails.description,
        parameters: courseMCPTools.getCourseDetails.parameters,
        execute: async (params: any) => {
          try {
            console.log("Calling getCourseDetails with:", params);
            const result = await courseMCPTools.getCourseDetails.execute(params);
            console.log("getCourseDetails result:", result.success ? "Course found" : result.error);
            return result;
          } catch (error: any) {
            console.error("getCourseDetails error:", error);
            return { success: false, error: error.message };
          }
        },
      }),
      getCoursesByCategory: tool({
        description: courseMCPTools.getCoursesByCategory.description,
        parameters: courseMCPTools.getCoursesByCategory.parameters,
        execute: async (params: any) => {
          try {
            console.log("Calling getCoursesByCategory with:", params);
            const result = await courseMCPTools.getCoursesByCategory.execute(params);
            console.log("getCoursesByCategory result:", result.success ? `${result.count} courses found` : result.error);
            return result;
          } catch (error: any) {
            console.error("getCoursesByCategory error:", error);
            return { success: false, error: error.message };
          }
        },
      }),
      getCoursesByLevel: tool({
        description: courseMCPTools.getCoursesByLevel.description,
        parameters: courseMCPTools.getCoursesByLevel.parameters,
        execute: async (params: any) => {
          try {
            console.log("Calling getCoursesByLevel with:", params);
            const result = await courseMCPTools.getCoursesByLevel.execute(params);
            console.log("getCoursesByLevel result:", result.success ? `${result.count} courses found` : result.error);
            return result;
          } catch (error: any) {
            console.error("getCoursesByLevel error:", error);
            return { success: false, error: error.message };
          }
        },
      }),
      // Razorpay Payment Tools
      createOrder: tool({
        description: razorpayMCPTools.createOrder.description,
        parameters: razorpayMCPTools.createOrder.parameters,
        execute: async (params: any) => {
          try {
            console.log("Calling createOrder with:", params);
            const result = await razorpayMCPTools.createOrder.execute(params);
            console.log("createOrder result:", result.success ? "Order created" : result.error);
            return result;
          } catch (error: any) {
            console.error("createOrder error:", error);
            return { success: false, error: error.message };
          }
        },
      }),
      getOrder: tool({
        description: razorpayMCPTools.getOrder.description,
        parameters: razorpayMCPTools.getOrder.parameters,
        execute: async (params: any) => {
          try {
            console.log("Calling getOrder with:", params);
            const result = await razorpayMCPTools.getOrder.execute(params);
            console.log("getOrder result:", result.success ? "Order fetched" : result.error);
            return result;
          } catch (error: any) {
            console.error("getOrder error:", error);
            return { success: false, error: error.message };
          }
        },
      }),
      getPaymentStatus: tool({
        description: razorpayMCPTools.getPaymentStatus.description,
        parameters: razorpayMCPTools.getPaymentStatus.parameters,
        execute: async (params: any) => {
          try {
            console.log("Calling getPaymentStatus with:", params);
            const result = await razorpayMCPTools.getPaymentStatus.execute(params);
            console.log("getPaymentStatus result:", result.success ? "Status checked" : result.error);
            return result;
          } catch (error: any) {
            console.error("getPaymentStatus error:", error);
            return { success: false, error: error.message };
          }
        },
      }),
    };

    // Use Vercel AI SDK's streamText with Groq and tools
    const result = await streamText({
      model: groq("moonshotai/kimi-k2-instruct-0905"),
      messages: [systemMessage, ...messages],
      tools: aiTools,
      toolChoice: "auto", // Let the model decide when to use tools
      maxSteps: 5, // Limit the number of tool calling rounds to prevent infinite loops
      temperature: 0.7,
      maxTokens: 1024,
      async onFinish({ text, toolCalls, toolResults }) {
        // Log tool usage for debugging
        if (toolCalls && toolCalls.length > 0) {
          console.log("Tools called:", toolCalls.map(tc => tc.toolName).join(", "));
        }
        console.log("Chat completed, text length:", text?.length || 0);
      },
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        message: `I apologize, but I'm having trouble: ${error.message || "Unknown error"}. Please check that your Groq API key is valid.`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
