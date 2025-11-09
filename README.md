# CourseHub - AI-Powered Course Sales Platform

An intelligent course sales platform powered by AI agents with MCP (Model Context Protocol) integrations for Supabase and Cashfree Payments.

## 🚀 Features

- 🤖 **AI Sales Agent** - Conversational AI assistant powered by Groq (Qwen3-32b)
- 📚 **Course Catalog** - Browse, search, and filter courses by category and level
- 💳 **Cashfree Payments** - Secure payment processing with MCP integration
- 👤 **User Authentication** - Powered by Clerk
- 💾 **Database** - PostgreSQL via Supabase
- 🎨 **Modern UI** - Built with Next.js 15, React 19, and Tailwind CSS

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase PostgreSQL
- **Authentication:** Clerk
- **Payments:** Cashfree Payments (via SDK)
- **AI:** Groq (Qwen3-32b) with MCP integrations
- **UI Components:** Radix UI, Lucide Icons

## 🎯 MCP Architecture

This project implements MCP integrations for Supabase and Cashfree, providing structured APIs that the AI agent can use to:

### Supabase MCP Operations
- Search and filter courses
- Manage enrollments
- Query user data

### Cashfree MCP Operations
- Create payment orders
- Verify payment status
- Process course enrollments

## 📋 Prerequisites

- Node.js 18+ and npm
- A Clerk account ([https://clerk.com](https://clerk.com))
- A Supabase account ([https://supabase.com](https://supabase.com))
- A Cashfree account ([https://cashfree.com](https://cashfree.com))
- A Groq API key ([https://groq.com](https://groq.com))

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd sales-agent
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# Cashfree Payments
CASHFREE_APP_ID=your_app_id_here
CASHFREE_SECRET_KEY=your_secret_key_here

# Groq AI
GROQ_API_KEY=xxxxx

# App URL (for redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set up the database

Run the database setup script:

```bash
npm run setup-db-complete
```

This will create all necessary tables and insert sample course data.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## 📁 Project Structure

```
sales-agent/
├── app/
│   ├── api/
│   │   ├── chat/            # AI chat endpoint
│   │   ├── courses/         # Course CRUD operations
│   │   ├── enrollments/     # Enrollment management
│   │   └── cashfree/        # Payment endpoints
│   ├── courses/             # Course pages
│   ├── my-courses/          # User enrollments
│   └── page.tsx             # Homepage
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── chat-widget.tsx      # AI chat interface
│   └── navbar.tsx           # Navigation
├── lib/
│   ├── mcp/
│   │   ├── supabase-mcp.ts # Supabase MCP wrapper
│   │   └── cashfree-mcp.ts # Cashfree MCP wrapper
│   ├── sales-agent.ts       # AI Sales Agent logic
│   └── mastra-agent.ts      # Agent configuration
└── types/
    └── cashfree.d.ts        # Cashfree types
```

## 🔐 Environment Setup Details

### Clerk Setup

1. Go to [https://clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Copy the publishable key and secret key to `.env.local`

### Supabase Setup

1. Go to [https://supabase.com](https://supabase.com) and create a project
2. Get your project URL and keys from Settings > API
3. Add them to `.env.local`
4. Run `npm run setup-db-complete` to create tables

### Cashfree Setup

1. Go to [https://cashfree.com](https://cashfree.com) and create an account
2. Navigate to Developers > API Keys
3. Get your App ID and Secret Key (use test mode keys for development)
4. Add them to `.env.local`:
   ```
   CASHFREE_APP_ID=your_app_id_here
   CASHFREE_SECRET_KEY=your_secret_key_here
   ```

### Groq Setup

1. Go to [https://groq.com](https://groq.com) and sign up
2. Get your API key from the dashboard
3. Add it to `.env.local`

## 💡 Usage

### For End Users

1. **Browse Courses**: Visit the homepage to see featured courses
2. **Search**: Use the search bar or ask the AI chatbot to find courses
3. **Chat with AI**: Click the chat widget to get personalized recommendations
4. **Enroll**: Sign in and click "Enroll Now" on any course page
5. **Payment**: Complete payment via Cashfree's secure checkout (use test mode for development)
6. **Access**: View your enrolled courses in "My Courses"

### For Developers

#### Using the Cashfree MCP

```typescript
// Example: Cashfree MCP usage
import { CashfreeMCP } from "@/lib/mcp/cashfree-mcp";

// Create a payment order
const order = await CashfreeMCP.createOrder({
  amount: 4999,
  currency: "INR",
  customer_details: {
    customer_id: userId,
    customer_phone: "9999999999",
    customer_email: "user@example.com",
    customer_name: "John Doe"
  }
});

// Verify payment
const verified = await CashfreeMCP.verifyPayment({
  order_id: orderId,
  order_amount: "4999"
});
```

## 🔄 Payment Flow

1. User clicks "Enroll Now" on a course
2. Frontend creates a Cashfree order via API
3. Cashfree Drop-in checkout opens (as modal)
4. User completes payment
5. Payment verification via Cashfree API
6. Enrollment is created in database
7. User is redirected to "My Courses"

## 🌐 API Endpoints

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get specific course

### Enrollments
- `POST /api/enrollments` - Create enrollment (after payment)
- `GET /api/enrollments` - Get user's enrollments

### Cashfree
- `POST /api/cashfree/create-order` - Create payment order
- `POST /api/cashfree/verify-payment` - Verify payment status
- `GET /api/cashfree/order/:orderId` - Get order details

### AI Chat
- `POST /api/chat` - Process chat messages

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add all environment variables
4. Deploy!

**Important for production:**
- Use production Clerk keys
- Use production Supabase project
- Use production Cashfree keys (change to production mode)
- Set `NEXT_PUBLIC_APP_URL` to your production URL

## 🧪 Testing

### Cashfree Test Credentials (Sandbox Mode)

When in test/sandbox mode, you can use these test card details:

- **Card Number:** 4111 1111 1111 1111
- **Expiry:** Any future date
- **CVV:** Any 3 digits
- **OTP:** Any 6 digits

### Recommended Testing Flow

1. Browse courses as a guest
2. Chat with the AI agent
3. Sign up via Clerk
4. Select a course and initiate payment
5. Complete test payment using Cashfree test cards
6. Verify enrollment appears in "My Courses"

## 📖 Documentation

- [Cashfree Documentation](https://docs.cashfree.com)
- [Cashfree Node.js SDK](https://github.com/cashfree/cashfree-pg-sdk-nodejs)
- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Groq Documentation](https://console.groq.com/docs)

## 🐛 Troubleshooting

### Cashfree Checkout Not Opening

- Ensure your Cashfree keys are correct
- Check browser console for errors
- Verify you're using the correct mode (sandbox/production)

### Payment Verification Fails

- Check that order amount matches
- Verify API keys are correct
- Check Cashfree dashboard for order status

### Database Connection Issues

- Verify Supabase credentials in `.env.local`
- Ensure database tables are created (run `npm run setup-db-complete`)
- Check Supabase project is not paused

### AI Chat Not Working

- Verify GROQ_API_KEY is set correctly
- Check API quota limits
- Review server logs for errors

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

Built with ❤️ using Next.js, Clerk, Supabase, Cashfree, and Groq

---

**Need Help?** 

- Check the [Cashfree Documentation](https://docs.cashfree.com)
- Review our [SETUP.md](./SETUP.md) guide
- Open an issue on GitHub
