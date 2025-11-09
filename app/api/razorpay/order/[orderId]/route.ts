import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/lib/razorpay-api";

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    if (!process.env.RAZORPAY_LIVE_KEY_ID || !process.env.RAZORPAY_LIVE_KEY_SECRET) {
      return NextResponse.json(
        { error: "Razorpay not configured" },
        { status: 500 }
      );
    }

    const order = await getOrder(orderId);

    return NextResponse.json({
      success: true,
      order: {
        order_id: order.id,
        amount: order.amount / 100, // Convert paise to rupees
        amount_in_paise: order.amount,
        currency: order.currency,
        status: order.status,
        receipt: order.receipt,
        notes: order.notes,
        created_at: new Date(order.created_at * 1000).toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Get order error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch order",
        message: error.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

