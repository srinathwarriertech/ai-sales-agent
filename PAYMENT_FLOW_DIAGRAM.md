# Razorpay Payment Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        RAZORPAY PAYMENT INTEGRATION                          │
│                        Sales Agent Chatbot Flow                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌───────────────┐
│  1. User Chat │
│   "Enroll in  │
│   Java Course"│
└───────┬───────┘
        │
        ▼
┌───────────────────────────────────────┐
│  2. AI Agent (chat/route.ts)          │
│                                       │
│  • Calls searchCourses()              │
│  • Gets course details (id, price)    │
│  • Extracts: course_id, amount        │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────┐
│  3. Create Razorpay Order (razorpay-mcp-tools.ts)         │
│                                                           │
│  createOrder({                                            │
│    amount: 4299,                                          │
│    customer_id: "user_abc123",                            │
│    customer_phone: "9876543210",                          │
│    customer_email: "user@example.com",                    │
│    customer_name: "John Doe",                             │
│    order_note: "Java Programming Masterclass",            │
│    course_id: "course_xyz789"  ← NEW!                     │
│  })                                                       │
│                                                           │
│  Returns: {                                               │
│    order_id: "order_RdMXj1s4clXI15",                      │
│    amount: 429900,  // in paise                           │
│    currency: "INR",                                       │
│    status: "created"                                      │
│  }                                                        │
└───────────────────┬───────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Chatbot Displays Order (chat-widget.tsx)                │
│                                                             │
│  "Order created successfully! 🎉                            │
│   Order ID: order_RdMXj1s4clXI15                            │
│   Course: Java Programming Masterclass                      │
│   Amount: ₹4,299                                            │
│   Status: created"                                          │
│                                                             │
│  [Auto-triggers payment after 1.5s]                         │
│  [Shows "💳 Pay Now" button]                                │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Open Razorpay Window (razorpay-checkout.ts)             │
│                                                             │
│  openRazorpayCheckout({                                     │
│    orderId: "order_RdMXj1s4clXI15",                         │
│    amount: 4299,                                            │
│    customerName: "John Doe",                                │
│    customerEmail: "user@example.com",                       │
│    customerPhone: "9876543210",                             │
│    description: "Java Programming Masterclass"              │
│  })                                                         │
│                                                             │
│  ┌─────────────────────────────────────┐                   │
│  │   Razorpay Checkout Window          │                   │
│  │                                     │                   │
│  │  CourseHub                          │                   │
│  │  Java Programming Masterclass       │                   │
│  │  ₹4,299                             │                   │
│  │                                     │                   │
│  │  📧 user@example.com                │                   │
│  │  📱 9876543210                      │                   │
│  │                                     │                   │
│  │  [Card] [UPI] [Netbanking] [Wallet]│                   │
│  │                                     │                   │
│  │  Card Number: ████ ████ ████ ████  │                   │
│  │  Expiry: MM/YY    CVV: ***         │                   │
│  │                                     │                   │
│  │           [Pay ₹4,299]              │                   │
│  └─────────────────────────────────────┘                   │
└────────────────┬──────────────────┬─────────────────────────┘
                 │                  │
        User Pays │                  │ User Cancels
                 │                  │
                 ▼                  ▼
    ┌────────────────────┐  ┌──────────────────┐
    │  6a. Payment       │  │  6b. Cancelled   │
    │      Success       │  │                  │
    └─────────┬──────────┘  └────────┬─────────┘
              │                      │
              │                      ▼
              │             ┌────────────────────┐
              │             │ Toast: "Payment    │
              │             │ Cancelled"         │
              │             │ User can retry     │
              │             └────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│  7. Razorpay Response                                        │
│                                                             │
│  {                                                          │
│    razorpay_order_id: "order_RdMXj1s4clXI15",               │
│    razorpay_payment_id: "pay_abc123xyz",                    │
│    razorpay_signature: "6f83...a42d"                        │
│  }                                                          │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  8. Verify Payment (verify-payment/route.ts)                │
│                                                             │
│  • Verify signature:                                        │
│    generated_sig = HMAC_SHA256(                             │
│      order_id + "|" + payment_id,                           │
│      RAZORPAY_SECRET                                        │
│    )                                                        │
│    if (generated_sig === razorpay_signature) ✅             │
│                                                             │
│  • Fetch order details from Razorpay                        │
│  • Extract course_id and customer_id from notes             │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  9. Create Enrollment (Supabase)                            │
│                                                             │
│  INSERT INTO enrollments (                                  │
│    user_id: "user_abc123",                                  │
│    course_id: "course_xyz789",                              │
│    status: "active",                                        │
│    order_id: "order_RdMXj1s4clXI15",                        │
│    payment_id: "pay_abc123xyz",                             │
│    created_at: NOW()                                        │
│  )                                                          │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  10. Success Feedback (chat-widget.tsx)                     │
│                                                             │
│  • Toast: "Payment Successful! 🎉                           │
│           Your enrollment has been confirmed"               │
│                                                             │
│  • Chat message:                                            │
│    "🎉 Payment successful! Your enrollment is confirmed.    │
│                                                             │
│     Payment ID: pay_abc123xyz                               │
│                                                             │
│     You can now access your course from the                 │
│     'My Courses' section. Happy learning!"                  │
└─────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════
                    KEY COMPONENTS
═══════════════════════════════════════════════════════════════

Client Side:
├── chat-widget.tsx
│   ├── Detects order creation in messages
│   ├── Extracts order details (regex parsing)
│   ├── Auto-triggers payment after 1.5s
│   └── Shows "Pay Now" button
│
├── razorpay-checkout.ts
│   ├── Opens Razorpay window
│   ├── Configures payment options
│   ├── Handles callbacks
│   └── Calls verification API

Server Side:
├── api/chat/route.ts
│   ├── AI Agent system prompt
│   ├── Course search tools
│   └── Razorpay order creation tools
│
├── mcp/razorpay-mcp-tools.ts
│   ├── createOrder() - includes course_id
│   ├── getOrder()
│   └── getPaymentStatus()
│
└── api/razorpay/verify-payment/route.ts
    ├── Signature verification (HMAC SHA256)
    ├── Order details fetching
    └── Enrollment creation


═══════════════════════════════════════════════════════════════
                    SECURITY FEATURES
═══════════════════════════════════════════════════════════════

1. Signature Verification
   • HMAC SHA256 hashing
   • Server-side verification only
   • Prevents payment tampering

2. Environment Variables
   • RAZORPAY_LIVE_KEY_SECRET (server-only)
   • NEXT_PUBLIC_RAZORPAY_KEY_ID (client-safe)
   • Never expose secret key

3. Server-Side Order Creation
   • Orders created via AI agent tools
   • Amount cannot be manipulated from client
   • All order data stored in Razorpay

4. Auto-enrollment
   • Only after successful verification
   • course_id stored in order notes
   • Enrollment record in database


═══════════════════════════════════════════════════════════════
                    ERROR HANDLING
═══════════════════════════════════════════════════════════════

Payment Failure:
• Toast notification with error message
• Chat remains open for retry
• Order remains valid for 24 hours

Payment Cancellation:
• "Payment Cancelled" toast
• User can click "Pay Now" to retry
• No data is lost

Verification Failure:
• Error logged on server
• User notified of verification failure
• Manual verification possible via dashboard

Network Issues:
• Razorpay handles retries automatically
• Error callbacks show user-friendly messages
• User can retry payment anytime
```

