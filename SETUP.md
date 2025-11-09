# Setup Guide - CourseHub

This guide will walk you through setting up the CourseHub platform from scratch.

## Prerequisites

Before you begin, make sure you have:

- Node.js 18 or higher installed
- A GitHub account (for Vercel deployment)
- npm or yarn package manager

## Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd sales-agent

# Install dependencies
npm install
```

## Step 2: Set Up Clerk Authentication

1. Go to [https://clerk.com](https://clerk.com) and create an account
2. Click "Add Application" and name it (e.g., "CourseHub")
3. Choose your sign-in methods (Email, Google, etc.)
4. Go to "API Keys" in the sidebar
5. Copy your keys and add to `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

## Step 3: Set Up Supabase Database

1. Go to [https://supabase.com](https://supabase.com) and create a project
2. Wait for the project to be ready (2-3 minutes)
3. Go to Settings > API
4. Copy your credentials:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

Add to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

## Step 4: Set Up Cashfree Payments

1. Go to [https://cashfree.com](https://cashfree.com) and create an account
2. Complete the signup process
3. Navigate to **Developers** section in the dashboard
4. Click on **API Keys**
5. Copy your test credentials:
   - App ID → `CASHFREE_APP_ID`
   - Secret Key → `CASHFREE_SECRET_KEY`

Add to `.env.local`:

```bash
# Cashfree Payments (Test Mode)
CASHFREE_APP_ID=your_test_app_id_here
CASHFREE_SECRET_KEY=your_test_secret_key_here
```

⚠️ **Important**: For development, use **test/sandbox** keys. For production, switch to **live** keys.

## Step 5: Set Up Groq AI

1. Go to [https://console.groq.com](https://console.groq.com) and sign up
2. Navigate to API Keys
3. Create a new API key
4. Copy and add to `.env.local`:

```bash
GROQ_API_KEY=gsk_xxxxx
```

## Step 6: Set App URL

Add your app URL to `.env.local`:

```bash
# For local development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# For production, use your actual domain
# NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Step 7: Complete .env.local File

Your final `.env.local` should look like this:

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
GROQ_API_KEY=gsk_xxxxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 8: Set Up Database Schema

Run the automated database setup script:

```bash
npm run setup-db-complete
```

This will:
- Create all necessary tables (courses, enrollments, etc.)
- Insert sample course data
- Set up proper relationships

## Step 9: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 10: Test the Application

1. **Homepage**: Should load with course listings
2. **Sign Up**: Click "Sign In" and create an account via Clerk
3. **Browse**: Navigate through courses
4. **AI Chat**: Click the chat widget and ask about courses
5. **Enroll**: Try enrolling in a course (use Cashfree test mode)
   - Use test card: `4111 1111 1111 1111`
   - Any future expiry date
   - Any CVV
6. **My Courses**: Check your enrolled courses

## 🎉 You're All Set!

Your CourseHub platform is now running locally.

## Next Steps

- Customize the course data in `scripts/insert-sample-data.ts`
- Modify the AI agent's personality in `lib/sales-agent.ts`
- Add more courses via the Supabase dashboard
- Customize the UI in the `components/` directory

## Deployment to Production

### Vercel Deployment

1. Push your code to GitHub
2. Go to [https://vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add all environment variables from `.env.local`
5. **Important for production:**
   - Use **live** Clerk keys
   - Use **production** Supabase project
   - Use **live** Cashfree keys (not test keys)
   - Update `NEXT_PUBLIC_APP_URL` to your production domain
6. Click "Deploy"

## Troubleshooting

### "Cashfree not configured" error
- Double-check your `CASHFREE_APP_ID` and `CASHFREE_SECRET_KEY` in `.env.local`
- Make sure there are no extra spaces
- Restart your dev server after changing `.env.local`

### Database connection fails
- Verify Supabase credentials are correct
- Check that your Supabase project is not paused
- Try running `npm run setup-db-complete` again

### Clerk authentication issues
- Ensure your Clerk keys are correct
- Make sure you've set up at least one sign-in method in Clerk dashboard
- Check that the domain matches in Clerk settings

### Cashfree checkout not opening
- Verify your keys are correct
- Check browser console for errors
- Ensure you're using test mode keys for development
- Make sure the Cashfree script loads (check Network tab)

### Payment verification fails
- Check that the order amount matches
- Verify payment was successful in Cashfree dashboard
- Check server logs for detailed error messages

## Support

If you encounter issues:

1. Check the error messages in the browser console
2. Review server logs in the terminal
3. Verify all environment variables are set correctly
4. Consult the [Cashfree documentation](https://docs.cashfree.com)
5. Check the [troubleshooting section](./README.md#troubleshooting) in README

## Additional Resources

- [Cashfree Integration Guide](https://docs.cashfree.com/docs/payment-gateway)
- [Cashfree Node.js SDK](https://github.com/cashfree/cashfree-pg-sdk-nodejs)
- [Clerk Next.js Setup](https://clerk.com/docs/quickstarts/nextjs)
- [Supabase Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Groq API Documentation](https://console.groq.com/docs)
