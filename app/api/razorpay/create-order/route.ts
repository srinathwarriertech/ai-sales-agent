import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/razorpay-api";

export async function POST(req: NextRequest) {
  try {
    // Note: Authentication is handled by Clerk middleware
    const userId = req.headers.get('x-clerk-auth-userid') || 
                   req.headers.get('x-user-id') ||
                   'user_demo';

    const {
      amount,
      currency = "INR",
      customer_details,
      order_note,
    } = await req.json();

    // Validation
    if (!customer_details || typeof customer_details !== "object") {
      return NextResponse.json(
        { error: "Customer details are required" },
        { status: 400 }
      );
    }

    const orderAmount = typeof amount === "string" ? parseFloat(amount) : amount;

    if (!orderAmount || Number.isNaN(orderAmount) || orderAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid order amount" },
        { status: 400 }
      );
    }

    if (!process.env.RAZORPAY_LIVE_KEY_ID || !process.env.RAZORPAY_LIVE_KEY_SECRET) {
      return NextResponse.json(
        { error: "Razorpay not configured" },
        { status: 500 }
      );
    }

    // Generate unique receipt ID
    const receipt = `receipt_${Date.now()}_${userId.slice(0, 8)}`;

    // Convert amount to paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = Math.round(orderAmount * 100);

    // Prepare order request
    const orderRequest = {
      amount: amountInPaise,
      currency: currency,
      receipt: receipt,
      notes: {
        customer_id: customer_details.customer_id || userId,
        customer_phone: customer_details.customer_phone || "9999999999",
        customer_email: customer_details.customer_email || "",
        customer_name: customer_details.customer_name || "",
        order_note: order_note || "",
      },
    };

    // Create order using REST API
    const order = await createOrder(orderRequest);

    return NextResponse.json({
      success: true,
      order_id: receipt,
      razorpay_order_id: order.id,
      order_amount: orderAmount,
      order_amount_in_paise: order.amount,
      order_currency: order.currency,
      order_status: order.status,
      customer_details: {
        customer_id: customer_details.customer_id || userId,
        customer_phone: customer_details.customer_phone || "9999999999",
        customer_email: customer_details.customer_email || "",
        customer_name: customer_details.customer_name || "",
      },
    });
  } catch (error: any) {
    console.error("Create order error:", error);

    // Determine status code based on error type
    let statusCode = 500;
    if (error.message?.includes('authentication')) {
      statusCode = 401;
    } else if (error.message?.includes('credentials not configured')) {
      statusCode = 503; // Service unavailable
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create order",
        message: error.message || "Unknown error occurred",
        hint: error.message?.includes('authentication') 
          ? "Check your Razorpay credentials in .env.local and restart the server"
          : undefined,
      },
      { status: statusCode }
    );
  }
}

