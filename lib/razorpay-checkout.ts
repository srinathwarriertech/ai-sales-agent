/**
 * Razorpay Checkout Integration
 * Client-side utility to open Razorpay payment window
 */

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  orderId: string;
  amount: number; // in rupees
  currency?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  description?: string;
  onSuccess?: (response: RazorpaySuccessResponse) => void;
  onFailure?: (error: any) => void;
  onDismiss?: () => void;
}

export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/**
 * Open Razorpay payment checkout window
 */
export function openRazorpayCheckout(options: RazorpayOptions) {
  console.log('[Razorpay] openRazorpayCheckout called with options:', {
    orderId: options.orderId,
    amount: options.amount,
    customerName: options.customerName,
    customerEmail: options.customerEmail,
  });

  if (typeof window === 'undefined') {
    console.error('[Razorpay] Window is undefined - not in browser context');
    options.onFailure?.({ error: 'Not in browser context' });
    return;
  }

  if (!window.Razorpay) {
    console.error('[Razorpay] Razorpay SDK not loaded on window object');
    options.onFailure?.({ error: 'Razorpay SDK not loaded' });
    return;
  }

  const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  
  console.log('[Razorpay] Environment check:', {
    hasKeyId: !!razorpayKeyId,
    keyIdPrefix: razorpayKeyId?.substring(0, 8),
  });

  if (!razorpayKeyId) {
    console.error('[Razorpay] NEXT_PUBLIC_RAZORPAY_KEY_ID not configured');
    options.onFailure?.({ error: 'Payment gateway not configured. Please add NEXT_PUBLIC_RAZORPAY_KEY_ID to environment variables.' });
    return;
  }

  const rzpOptions = {
    key: razorpayKeyId,
    order_id: options.orderId,
    amount: Math.round(options.amount * 100), // Convert to paise
    currency: options.currency || 'INR',
    name: 'CourseHub',
    description: options.description || 'Course Purchase',
    image: '/logo.png', // Add your logo path here
    prefill: {
      name: options.customerName || '',
      email: options.customerEmail || '',
      contact: options.customerPhone || '',
    },
    theme: {
      color: '#3B82F6', // Customize your brand color
    },
    handler: function (response: RazorpaySuccessResponse) {
      console.log('[Razorpay] Payment successful:', response);
      options.onSuccess?.(response);
    },
    modal: {
      ondismiss: function () {
        console.log('[Razorpay] Payment window closed by user');
        options.onDismiss?.();
      },
    },
  };

  console.log('[Razorpay] Initializing Razorpay with options:', {
    ...rzpOptions,
    key: rzpOptions.key.substring(0, 8) + '...',
  });

  try {
    const rzp = new window.Razorpay(rzpOptions);
    
    rzp.on('payment.failed', function (response: any) {
      console.error('[Razorpay] Payment failed:', response);
      options.onFailure?.(response);
    });

    console.log('[Razorpay] Opening checkout window...');
    rzp.open();
  } catch (error) {
    console.error('[Razorpay] Error opening Razorpay checkout:', error);
    options.onFailure?.(error);
  }
}

/**
 * Verify payment on server
 */
export async function verifyPayment(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch('/api/razorpay/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        paymentId,
        signature,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return {
      success: false,
      error: error.message || 'Failed to verify payment',
    };
  }
}

