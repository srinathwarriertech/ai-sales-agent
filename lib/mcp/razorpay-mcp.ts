/**
 * Razorpay MCP (Model Context Protocol) Integration
 * Provides structured payment operations for the AI Sales Agent
 */

export interface CreateOrderParams {
  amount: number;
  currency?: string;
  customer_details: {
    customer_id: string;
    customer_phone: string;
    customer_email?: string;
    customer_name?: string;
  };
  order_note?: string;
}

export interface RazorpayOrder {
  order_id: string;
  order_amount: number;
  order_currency: string;
  order_status: string;
  razorpay_order_id: string;
  created_at?: string;
  customer_details: {
    customer_id: string;
    customer_phone: string;
    customer_email?: string;
    customer_name?: string;
  };
}

export interface VerifyPaymentParams {
  order_id: string;
  order_amount: string;
}

/**
 * Razorpay MCP - Provides structured payment operations
 */
export class RazorpayMCP {
  /**
   * Create a new order for payment
   * This is called server-side to initiate payment
   */
  static async createOrder(params: CreateOrderParams): Promise<RazorpayOrder> {
    const response = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create order");
    }

    return response.json();
  }

  /**
   * Verify payment status after successful payment
   * This ensures the payment is legitimate
   */
  static async verifyPayment(params: VerifyPaymentParams): Promise<boolean> {
    const response = await fetch("/api/razorpay/verify-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.verified;
  }

  /**
   * Get payment details
   */
  static async getPaymentDetails(orderId: string): Promise<any> {
    const response = await fetch(`/api/razorpay/order/${orderId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get payment details");
    }

    return response.json();
  }

  /**
   * Process course enrollment payment
   * High-level function that creates order and returns checkout details
   */
  static async processCoursePayment(
    courseId: string,
    courseTitle: string,
    amount: number,
    userId: string,
    userPhone: string,
    userEmail?: string,
    userName?: string
  ): Promise<{
    orderId: string;
    amount: number;
    currency: string;
    razorpayOrderId: string;
  }> {
    const order = await this.createOrder({
      amount: amount,
      currency: "INR",
      customer_details: {
        customer_id: userId,
        customer_phone: userPhone,
        customer_email: userEmail,
        customer_name: userName,
      },
      order_note: `Course: ${courseTitle}`,
    });

    return {
      orderId: order.order_id,
      amount: order.order_amount,
      currency: order.order_currency,
      razorpayOrderId: order.razorpay_order_id,
    };
  }

  /**
   * Get MCP schema for AI agent
   * This returns available operations the AI can perform
   */
  static getSchema() {
    return {
      name: "razorpay_mcp",
      description: "Payment operations for course purchases",
      operations: [
        {
          name: "create_order",
          description: "Create a payment order for a course",
          parameters: [
            { name: "amount", type: "number", required: true },
            { name: "currency", type: "string", required: false, default: "INR" },
            { name: "customer_details", type: "object", required: true },
            { name: "order_note", type: "string", required: false },
          ],
        },
        {
          name: "verify_payment",
          description: "Verify a payment",
          parameters: [
            { name: "order_id", type: "string", required: true },
            { name: "order_amount", type: "string", required: true },
          ],
        },
        {
          name: "process_course_payment",
          description: "Process payment for course enrollment",
          parameters: [
            { name: "courseId", type: "string", required: true },
            { name: "courseTitle", type: "string", required: true },
            { name: "amount", type: "number", required: true },
            { name: "userId", type: "string", required: true },
            { name: "userPhone", type: "string", required: true },
            { name: "userEmail", type: "string", required: false },
            { name: "userName", type: "string", required: false },
          ],
        },
      ],
    };
  }
}

/**
 * Load Razorpay Checkout script for client-side checkout
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

