/**
 * Razorpay MCP Tools for AI Agent
 * Direct integration with Razorpay REST API
 */

import { z } from "zod";
import * as RazorpayAPI from "@/lib/razorpay-api";

/**
 * Check if Razorpay is configured
 */
function isRazorpayConfigured(): boolean {
  return !!(process.env.RAZORPAY_LIVE_KEY_ID && process.env.RAZORPAY_LIVE_KEY_SECRET);
}

/**
 * AI Agent Tools for Razorpay Payment Gateway
 * These tools enable the AI to help users with course payments
 */
export const razorpayPaymentTools = {

  /**
   * Create an order for payment
   */
  createOrder: {
    description: "Create an order to initiate payment for a course",
    parameters: z.object({
      amount: z.number().describe("Order amount in rupees"),
      customer_id: z.string().describe("Unique customer identifier"),
      customer_phone: z.string().describe("Customer phone number (10 digits)"),
      customer_email: z.string().optional().describe("Customer email"),
      customer_name: z.string().optional().describe("Customer name"),
      order_note: z.string().optional().describe("Note for the order (e.g., course name)"),
      course_id: z.string().optional().describe("Course ID for enrollment"),
    }),
    execute: async ({ amount, customer_id, customer_phone, customer_email, customer_name, order_note, course_id }: any) => {
      try {
        if (!isRazorpayConfigured()) {
          return {
            success: false,
            error: 'Razorpay is not configured. Please set RAZORPAY_LIVE_KEY_ID and RAZORPAY_LIVE_KEY_SECRET environment variables.',
          };
        }

        // Convert amount to paise (Razorpay expects amount in smallest currency unit)
        const amountInPaise = Math.round(amount * 100);
        
        const receipt = `receipt_${Date.now()}_${customer_id.slice(0, 8)}`;
        
        const result = await RazorpayAPI.createOrder({
          amount: amountInPaise,
          currency: 'INR',
          receipt,
          notes: {
            customer_id,
            customer_phone,
            customer_email: customer_email || '',
            customer_name: customer_name || '',
            order_note: order_note || '',
            course_id: course_id || '',
          },
        });

        return {
          success: true,
          order_id: result.id,
          amount: result.amount,
          amount_in_rupees: result.amount / 100,
          currency: result.currency,
          order_status: result.status,
          message: `Order created successfully for ₹${amount}. Order ID: ${result.id}`,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to create order',
        };
      }
    },
  },

  /**
   * Get order details
   */
  getOrder: {
    description: "Fetch details of a specific order including payment status",
    parameters: z.object({
      order_id: z.string().describe("The order ID to fetch"),
    }),
    execute: async ({ order_id }: any) => {
      try {
        if (!isRazorpayConfigured()) {
          return {
            success: false,
            error: 'Razorpay is not configured. Please set RAZORPAY_LIVE_KEY_ID and RAZORPAY_LIVE_KEY_SECRET environment variables.',
          };
        }

        const result = await RazorpayAPI.getOrder(order_id);

        return {
          success: true,
          order_id: result.id,
          order_amount: result.amount,
          order_amount_in_rupees: result.amount / 100,
          order_status: result.status,
          order_currency: result.currency,
          created_at: new Date(result.created_at * 1000).toISOString(),
          message: `Order status: ${result.status}`,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to fetch order',
        };
      }
    },
  },

  /**
   * Check payment status
   */
  getPaymentStatus: {
    description: "Check if payment is complete for an order and verify the amount",
    parameters: z.object({
      order_id: z.string().describe("The order ID to check"),
      expected_amount: z.number().describe("Expected payment amount in rupees to verify"),
    }),
    execute: async ({ order_id, expected_amount }: any) => {
      try {
        if (!isRazorpayConfigured()) {
          return {
            success: false,
            error: 'Razorpay is not configured. Please set RAZORPAY_LIVE_KEY_ID and RAZORPAY_LIVE_KEY_SECRET environment variables.',
          };
        }

        const isPaid = await RazorpayAPI.verifyOrderPayment(order_id, expected_amount);

        if (isPaid) {
          return {
            success: true,
            payment_verified: true,
            message: `Payment verified successfully for ₹${expected_amount}`,
          };
        } else {
          const order = await RazorpayAPI.getOrder(order_id);
          return {
            success: true,
            payment_verified: false,
            order_status: order.status,
            message: `Payment not verified. Current order status: ${order.status}`,
          };
        }
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to check payment status',
        };
      }
    },
  },

};

/**
 * Get MCP schema for the AI agent
 */
export function getRazorpayMCPSchema() {
  return {
    name: "razorpay_mcp",
    description: "Razorpay Payment Gateway operations for course purchases",
    tools: [
      {
        name: "create_order",
        description: "Create an order to initiate payment for a course",
      },
      {
        name: "get_order",
        description: "Fetch order details and status",
      },
      {
        name: "get_payment_status",
        description: "Verify if payment is complete and matches expected amount",
      },
    ],
  };
}

