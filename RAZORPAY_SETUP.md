# Razorpay Payment Integration - Quick Setup

## What Changed

The chatbot now automatically opens the Razorpay payment window when users want to enroll in courses. Here's what was implemented:

### ✅ New Features

1. **Auto-trigger Razorpay Checkout** - Payment window opens automatically 1.5 seconds after order creation
2. **Manual Payment Button** - "Pay Now" button appears in chat for manual triggering
3. **Payment Verification** - Server-side signature verification for security
4. **Auto-enrollment** - Successful payments automatically create enrollment records
5. **Real-time Feedback** - Toast notifications and success messages in chat

### 📁 Files Modified

1. **`app/layout.tsx`**
   - Added Razorpay Checkout script to head

2. **`lib/razorpay-checkout.ts`** (NEW)
   - Client-side utility to open Razorpay payment window
   - Handles payment success, failure, and cancellation
   - Calls verification endpoint

3. **`components/chat-widget.tsx`**
   - Added payment detection and auto-trigger logic
   - Displays "Pay Now" button for orders
   - Handles payment callbacks and shows status

4. **`app/api/razorpay/verify-payment/route.ts`**
   - Updated to verify payment signature using HMAC SHA256
   - Creates enrollment record automatically
   - Returns structured response

5. **`lib/mcp/razorpay-mcp-tools.ts`**
   - Added `course_id` parameter to createOrder
   - Stores course_id in order notes for auto-enrollment

6. **`app/api/chat/route.ts`**
   - Updated system prompt to include course_id in orders

### 📋 Environment Variables

Add to `.env.local`:

```bash
# Razorpay Keys (REQUIRED)
RAZORPAY_LIVE_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_LIVE_KEY_SECRET=your_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
```

**Note:** Use `rzp_test_` prefix for testing, `rzp_live_` for production.

## How It Works

### User Flow

1. User: "I want to enroll in Java Programming"
2. Chatbot searches for course and displays details
3. Chatbot creates Razorpay order with order details
4. **Razorpay payment window opens automatically** 🎉
5. User completes payment
6. Payment is verified server-side
7. Enrollment is created automatically
8. Success message appears in chat

### Payment Window

The Razorpay Checkout window:
- Opens automatically after 1.5 seconds
- Pre-fills customer details (name, email, phone)
- Supports cards, UPI, netbanking, wallets
- Handles payment success/failure/cancellation
- Shows branded UI with your logo and colors

### Security

- ✅ Signature verification using HMAC SHA256
- ✅ Server-side order creation
- ✅ Secret key never exposed to client
- ✅ Amount validation on server

## Testing

### Test Mode

1. Use test API keys (rzp_test_...)
2. Test cards:
   - **Success**: 4111 1111 1111 1111
   - **Failure**: 4000 0000 0000 0002
3. Test UPI: success@razorpay

### Verify Integration

1. Start the dev server: `npm run dev`
2. Open the chatbot
3. Say "I want to enroll in a course"
4. Follow the enrollment flow
5. Payment window should open automatically
6. Test with test card
7. Check enrollment in database

## Customization

### Change Auto-trigger Delay

In `components/chat-widget.tsx`, line ~167:

```tsx
setTimeout(() => {
  handlePayment(orderDetails.orderId, orderDetails.amount, orderDetails.courseName);
}, 1500); // Change to desired milliseconds (e.g., 2000 for 2 seconds)
```

### Disable Auto-trigger

Comment out the auto-trigger useEffect in `components/chat-widget.tsx` (lines ~154-175) to only show manual "Pay Now" button.

### Customize Brand Colors

In `lib/razorpay-checkout.ts`, line ~49:

```tsx
theme: {
  color: '#3B82F6', // Change to your brand color
},
```

### Add Logo

1. Place logo in `public/logo.png`
2. Logo will appear in payment window

## Troubleshooting

### Payment window doesn't open

- ✅ Check `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set in `.env.local`
- ✅ Verify Razorpay script loaded (check browser Network tab)
- ✅ Check browser console for errors

### Payment verification fails

- ✅ Verify `RAZORPAY_LIVE_KEY_SECRET` is correct
- ✅ Check server logs for errors
- ✅ Ensure order_id format is correct (starts with `order_`)

### Enrollment not created

- ✅ Check Supabase credentials
- ✅ Verify `course_id` is included in AI agent prompt
- ✅ Review database schema matches insert query
- ✅ Check server logs

## Next Steps

1. **Setup Environment Variables** - Add Razorpay keys to `.env.local`
2. **Test Integration** - Use test keys and test cards
3. **Customize Branding** - Update colors and add logo
4. **Go Live** - Switch to live keys for production

## Resources

- [Full Documentation](./RAZORPAY_INTEGRATION.md)
- [Razorpay Dashboard](https://dashboard.razorpay.com/)
- [Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)
- [Integration Guide](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/)

## Support

Need help? Check:
1. Browser console for client-side errors
2. Server logs for verification errors
3. Razorpay dashboard for payment logs
4. [RAZORPAY_INTEGRATION.md](./RAZORPAY_INTEGRATION.md) for detailed docs

