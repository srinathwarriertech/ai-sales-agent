/**
 * Razorpay Payment Gateway REST API Client
 * Direct API integration - Next.js 15 compatible
 */

const RAZORPAY_BASE_URL = 'https://api.razorpay.com/v1';

interface RazorpayHeaders extends Record<string, string> {
  'Content-Type': string;
  'Authorization': string;
}

function getRazorpayHeaders(): RazorpayHeaders {
  const keyId = process.env.RAZORPAY_LIVE_KEY_ID;
  const keySecret = process.env.RAZORPAY_LIVE_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured. Please set RAZORPAY_LIVE_KEY_ID and RAZORPAY_LIVE_KEY_SECRET');
  }

  // Create Basic Auth header
  const authString = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  
  // Log masked credentials for debugging (only first/last 4 chars)
  console.log('Razorpay Auth Debug:', {
    keyId: keyId.length > 8 ? `${keyId.slice(0, 4)}...${keyId.slice(-4)}` : '[too short]',
    keySecret: keySecret.length > 8 ? `${keySecret.slice(0, 4)}...${keySecret.slice(-4)}` : '[too short]',
    baseUrl: RAZORPAY_BASE_URL,
    env: process.env.NODE_ENV,
  });

  return {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${authString}`,
  };
}

export interface CreateOrderRequest {
  amount: number; // Amount in paise (e.g., 50000 for ₹500)
  currency: string;
  receipt?: string;
  notes?: {
    [key: string]: string;
  };
  partial_payment?: boolean;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string | null;
  status: string;
  attempts: number;
  notes: {
    [key: string]: string;
  };
  created_at: number;
}

export interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  method: string;
  captured: boolean;
  email: string;
  contact: string;
  created_at: number;
}

/**
 * Create a new order
 */
export async function createOrder(orderData: CreateOrderRequest): Promise<RazorpayOrder> {
  const headers = getRazorpayHeaders();
  const url = `${RAZORPAY_BASE_URL}/orders`;
  
  console.log('Creating Razorpay order:', {
    url,
    orderData: { ...orderData, notes: orderData.notes ? Object.keys(orderData.notes) : [] }
  });

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    console.error('Razorpay API Error:', {
      status: response.status,
      statusText: response.statusText,
      error,
    });
    
    // Better error messages
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        `Razorpay authentication failed. Please verify your credentials:\n` +
        `- Check RAZORPAY_LIVE_KEY_ID is correct\n` +
        `- Check RAZORPAY_LIVE_KEY_SECRET is correct\n` +
        `Error: ${error.error?.description || error.message || 'Authentication failed'}`
      );
    }
    
    throw new Error(error.error?.description || error.message || `Razorpay API error: ${response.status}`);
  }

  const result = await response.json();
  console.log('Razorpay order created successfully:', result.id);
  return result;
}

/**
 * Get order details
 */
export async function getOrder(orderId: string): Promise<RazorpayOrder> {
  const response = await fetch(`${RAZORPAY_BASE_URL}/orders/${orderId}`, {
    method: 'GET',
    headers: getRazorpayHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.error?.description || error.message || `Razorpay API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get payments for an order
 */
export async function getOrderPayments(orderId: string): Promise<{ items: RazorpayPayment[] }> {
  const response = await fetch(`${RAZORPAY_BASE_URL}/orders/${orderId}/payments`, {
    method: 'GET',
    headers: getRazorpayHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.error?.description || error.message || `Razorpay API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get payment details
 */
export async function getPayment(paymentId: string): Promise<RazorpayPayment> {
  const response = await fetch(`${RAZORPAY_BASE_URL}/payments/${paymentId}`, {
    method: 'GET',
    headers: getRazorpayHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.error?.description || error.message || `Razorpay API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Verify order payment status
 */
export async function verifyOrderPayment(orderId: string, expectedAmount: number): Promise<boolean> {
  try {
    const order = await getOrder(orderId);
    
    // Check if order is paid
    const isPaid = order.status === 'paid';
    
    // Verify amount matches (convert expected amount to paise if needed)
    const expectedAmountInPaise = expectedAmount < 1000 ? expectedAmount * 100 : expectedAmount;
    const amountMatches = Math.abs(order.amount - expectedAmountInPaise) < 1;
    
    return isPaid && amountMatches;
  } catch (error) {
    console.error('Payment verification error:', error);
    return false;
  }
}

/**
 * Verify payment signature (webhook/callback verification)
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const crypto = require('crypto');
  const keySecret = process.env.RAZORPAY_LIVE_KEY_SECRET;
  
  if (!keySecret) {
    throw new Error('Razorpay key secret not configured');
  }
  
  const text = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(text)
    .digest('hex');
  
  return expectedSignature === signature;
}

