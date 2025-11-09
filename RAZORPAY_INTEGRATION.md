# Razorpay Payment Integration Guide

This document explains how the Razorpay payment integration works in the Sales Agent chatbot.

## Overview

The chatbot now automatically opens the Razorpay payment window when a user wants to enroll in a course. The payment flow is fully integrated with course enrollment.

## Features

✅ **Auto-trigger Payment Window**: When the AI agent creates an order, the Razorpay Checkout window opens automatically after 1.5 seconds
✅ **Manual Payment Button**: A "Pay Now" button appears in the chat for manual triggering
✅ **Signature Verification**: Server-side verification of payment authenticity using HMAC SHA256
✅ **Auto-enrollment**: Successful payments automatically create enrollment records in the database
✅ **Real-time Feedback**: Toast notifications and chat messages for payment status
✅ **Error Handling**: Graceful handling of payment failures, cancellations, and verification errors

## Architecture

### Client-Side Components

1. **`chat-widget.tsx`**
   - Detects when an order is created in chat messages
   - Extracts order details (order_id, amount, course name)
   - Automatically triggers Razorpay Checkout
   - Displays "Pay Now" button for manual triggering
   - Handles payment success/failure callbacks

2. **`lib/razorpay-checkout.ts`**
   - Utility functions to open Razorpay payment window
   - Configures Razorpay with prefilled customer details
   - Handles payment success, failure, and dismiss events
   - Calls server-side verification endpoint

### Server-Side Components

1. **`app/api/razorpay/verify-payment/route.ts`**
   - Verifies payment signature using HMAC SHA256
   - Creates enrollment record in Supabase database
   - Returns verification status

2. **`lib/mcp/razorpay-mcp-tools.ts`**
   - AI agent tools for creating Razorpay orders
   - Includes course_id in order notes for auto-enrollment
   - Converts amounts from rupees to paise

3. **`app/api/chat/route.ts`**
   - AI agent system prompt with payment instructions
   - Integration of Razorpay tools with AI agent

## Setup Instructions

### 1. Environment Variables

Add the following to your `.env.local` file:

```bash
# Razorpay Configuration
RAZORPAY_LIVE_KEY_ID=rzp_live_your_key_id
RAZORPAY_LIVE_KEY_SECRET=your_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_key_id

# For testing, use test keys:
# RAZORPAY_LIVE_KEY_ID=rzp_test_your_test_key_id
# RAZORPAY_LIVE_KEY_SECRET=your_test_secret_key
# NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_test_key_id
```

**Important Notes:**
- Use `rzp_test_` prefixed keys for development/testing
- Use `rzp_live_` prefixed keys for production
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` is exposed to the client (safe for public use)
- `RAZORPAY_LIVE_KEY_SECRET` must never be exposed to the client

### 2. Razorpay Script

The Razorpay Checkout script is automatically loaded in `app/layout.tsx`:

```tsx
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### 3. Database Schema

Ensure your Supabase `enrollments` table has the following columns:

```sql
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  order_id TEXT,
  payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Payment Flow

### 1. User Interaction

User: "I want to enroll in the Java Programming course"

### 2. AI Agent Response

The AI agent:
1. Searches for the course using course tools
2. Gets course details (id, price, title)
3. Calls `createOrder` tool with:
   - amount (course price)
   - customer_id (user's Clerk ID)
   - customer_phone
   - customer_email
   - customer_name
   - order_note (course name)
   - **course_id** (for auto-enrollment)

### 3. Order Creation

The chatbot displays:
```
Excellent! Your enrollment order has been created successfully! 🎉

**Order Details:**
- **Order ID:** order_RdMXj1s4clXI15
- **Course:** Java Programming Masterclass
- **Amount:** ₹4,299
- **Status:** created
```

### 4. Razorpay Window Opens

- After 1.5 seconds, the Razorpay Checkout window opens automatically
- Window is pre-filled with customer details
- User can pay using cards, UPI, netbanking, wallets, etc.
- Alternatively, user can click the "Pay Now" button

### 5. Payment Success

On successful payment:
1. Razorpay sends response with:
   - `razorpay_order_id`
   - `razorpay_payment_id`
   - `razorpay_signature`

2. Client calls `/api/razorpay/verify-payment` to verify signature

3. Server verifies signature using:
   ```
   HMAC_SHA256(order_id|payment_id, secret_key)
   ```

4. If valid, server creates enrollment record in database

5. Success message appears in chat:
   ```
   🎉 Payment successful! Your enrollment is confirmed.
   
   Payment ID: pay_abc123xyz
   
   You can now access your course from the "My Courses" section. Happy learning!
   ```

### 6. Payment Failure or Cancellation

- **Failure**: Toast notification with error message
- **Cancellation**: "Payment Cancelled" message, user can retry anytime

## Security Features

1. **Signature Verification**
   - All payments are verified server-side using HMAC SHA256
   - Prevents payment tampering and fraudulent transactions

2. **Environment Variables**
   - Secret key is never exposed to the client
   - Only public key is used in client-side code

3. **Server-Side Order Creation**
   - Orders are created on the server via AI agent tools
   - Prevents amount manipulation from client

## Testing

### Test Cards (Razorpay Test Mode)

**Success:**
- Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

**Failure:**
- Card: 4000 0000 0000 0002

### Test UPI

- UPI ID: success@razorpay
- Enter any 6-digit PIN

## Customization

### Change Payment Window Delay

In `chat-widget.tsx`, modify the timeout:

```tsx
setTimeout(() => {
  handlePayment(orderDetails.orderId, orderDetails.amount, orderDetails.courseName);
}, 1500); // Change 1500 to desired milliseconds
```

### Disable Auto-trigger

Comment out the auto-trigger useEffect in `chat-widget.tsx` to only show the "Pay Now" button.

### Customize Razorpay Theme

In `lib/razorpay-checkout.ts`, modify the theme:

```tsx
theme: {
  color: '#3B82F6', // Change to your brand color
},
```

### Add Logo

Place your logo in the `public` folder and update:

```tsx
image: '/logo.png', // Path to your logo
```

## Troubleshooting

### Payment window doesn't open

1. Check browser console for errors
2. Verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set
3. Ensure Razorpay script is loaded (check Network tab)

### Payment verification fails

1. Check that `RAZORPAY_LIVE_KEY_SECRET` is correctly set
2. Verify the order_id format (should start with `order_`)
3. Check server logs for verification errors

### Enrollment not created

1. Verify Supabase credentials are correct
2. Check that `course_id` is included in order notes
3. Review database schema matches the insert query
4. Check server logs for database errors

## API Reference

### `openRazorpayCheckout(options)`

Opens the Razorpay payment checkout window.

**Parameters:**
- `orderId` (string): Razorpay order ID
- `amount` (number): Amount in rupees
- `currency` (string, optional): Currency code (default: 'INR')
- `customerName` (string, optional): Customer name
- `customerEmail` (string, optional): Customer email
- `customerPhone` (string, optional): Customer phone
- `description` (string, optional): Payment description
- `onSuccess` (function): Callback on payment success
- `onFailure` (function): Callback on payment failure
- `onDismiss` (function): Callback when window is closed

### `verifyPayment(orderId, paymentId, signature)`

Verifies payment on the server.

**Parameters:**
- `orderId` (string): Razorpay order ID
- `paymentId` (string): Razorpay payment ID
- `signature` (string): Razorpay signature

**Returns:**
```typescript
{
  success: boolean;
  message?: string;
  error?: string;
}
```

## Resources

- [Razorpay Checkout Documentation](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/)
- [Payment Verification](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/verify-payment/)
- [Test Credentials](https://razorpay.com/docs/payments/payments/test-card-details/)

## Support

For issues or questions:
1. Check the [Razorpay Dashboard](https://dashboard.razorpay.com/) for payment logs
2. Review server logs for verification errors
3. Check browser console for client-side errors

