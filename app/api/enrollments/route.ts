import { NextRequest, NextResponse } from "next/server";
import { SupabaseMCP } from "@/lib/mcp/supabase-mcp";
import { RazorpayMCP } from "@/lib/mcp/razorpay-mcp";

export async function POST(req: NextRequest) {
  try {
    // Note: Authentication is handled by Clerk middleware
    const userId = req.headers.get('x-clerk-auth-userid') || 
                   req.headers.get('x-user-id') ||
                   'user_demo'; // Fallback for development

    const { courseId, orderId, razorpay_order_id, orderAmount } = await req.json();

    // Verify payment using Razorpay order ID
    const orderIdToVerify = razorpay_order_id || orderId;
    const verified = await RazorpayMCP.verifyPayment({
      order_id: orderIdToVerify,
      order_amount: orderAmount,
    });

    if (!verified) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Get course details
    const course = await SupabaseMCP.getCourse(courseId);

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Create enrollment
    const enrollment = await SupabaseMCP.createEnrollment(
      userId,
      courseId,
      orderId,
      course.price
    );

    return NextResponse.json({ enrollment });
  } catch (error) {
    console.error("Enrollment API error:", error);
    return NextResponse.json(
      { error: "Failed to create enrollment" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Note: Authentication is handled by Clerk middleware
    const userId = req.headers.get('x-clerk-auth-userid') || 
                   req.headers.get('x-user-id') ||
                   'user_demo'; // Fallback for development

    const enrollments = await SupabaseMCP.getUserEnrollments(userId);

    return NextResponse.json({ enrollments });
  } catch (error) {
    console.error("Get enrollments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
}

