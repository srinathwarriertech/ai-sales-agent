import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getOrder } from "@/lib/razorpay-api";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { orderId, paymentId, signature } = await req.json();

    if (!process.env.RAZORPAY_LIVE_KEY_ID || !process.env.RAZORPAY_LIVE_KEY_SECRET) {
      return NextResponse.json(
        { success: false, error: "Razorpay not configured" },
        { status: 500 }
      );
    }

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Verify signature
    const text = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_LIVE_KEY_SECRET)
      .update(text)
      .digest("hex");

    const isValid = generatedSignature === signature;

    if (!isValid) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid signature" 
      });
    }

    // Fetch order details from Razorpay
    try {
      const order = await getOrder(orderId);
      
      // Extract enrollment details from order notes
      const courseId = order.notes?.course_id;
      const userId = order.notes?.customer_id;

      // Create enrollment record in database if we have the details
      if (courseId && userId) {
        const { error: enrollError } = await supabase
          .from('enrollments')
          .insert({
            user_id: userId,
            course_id: courseId,
            status: 'active',
            order_id: orderId,
            payment_id: paymentId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (enrollError) {
          console.error("Failed to create enrollment:", enrollError);
          // Don't fail the payment verification if enrollment creation fails
        }
      }
    } catch (orderError) {
      console.error("Failed to fetch order details:", orderError);
      // Don't fail payment verification if we can't fetch order details
    }

    return NextResponse.json({ 
      success: true,
      message: "Payment verified successfully" 
    });
  } catch (error: any) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to verify payment",
        message: error.message || "Unknown error occurred"
      },
      { status: 500 }
    );
  }
}

