# Payment Popup Troubleshooting Guide

## If the Razorpay payment window doesn't open, follow these steps:

### Step 1: Check Browser Console

Open your browser's Developer Tools (F12 or Right-click → Inspect) and go to the **Console** tab. Look for messages starting with `[Payment Debug]` or `[Razorpay]`.

### Step 2: Most Common Issues

#### Issue 1: Environment Variable Not Set ⚠️

**Symptoms:** Console shows:
```
[Razorpay] NEXT_PUBLIC_RAZORPAY_KEY_ID not configured
```

**Solution:**
1. Open `.env.local` file in your project root
2. Add this line (replace with your actual key):
   ```bash
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
   ```
3. **IMPORTANT:** Restart your dev server:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```
4. Refresh the browser

#### Issue 2: Razorpay Script Not Loading

**Symptoms:** Console shows:
```
[Razorpay] Razorpay SDK not loaded on window object
```

**Solution:**
1. Check browser Network tab for `checkout.js` from `checkout.razorpay.com`
2. If it's blocked, check for ad blockers or security extensions
3. Try disabling ad blockers temporarily
4. Verify `app/layout.tsx` has the script tag:
   ```tsx
   <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
   ```

####Issue 3: Order Details Not Detected

**Symptoms:** Console shows:
```
[Payment Debug] No order details found in message
```

**Solution:**
The message format might not match our regex. Check the console log that shows:
```
[Payment Debug] Extracting order details from message: ...
```

The AI agent must respond with a message containing:
- "Order ID: order_xyz123"
- "Amount: ₹4299" or "₹4299"

If the format is different, the regex needs to be updated.

#### Issue 4: User Not Authenticated

**Symptoms:** Console shows:
```
[Payment Debug] User not authenticated
```

**Solution:**
Make sure you're signed in to the application using Clerk authentication.

### Step 3: Debug Output to Check

When everything is working, you should see this sequence in the console:

```
[Payment Debug] Auto-trigger useEffect running: { messagesLength: 3, processingPayment: false, isLoading: false }
[Payment Debug] Checking last message: { role: 'assistant', contentPreview: '...', hasOrderID: true, hasRupee: true }
[Payment Debug] Extracting order details from message: ...
[Payment Debug] Matches: { orderId: 'order_xxx', amount: '4299', course: 'Java Programming' }
[Payment Debug] Extracted order details: { orderId: 'order_xxx', amount: 4299, courseName: 'Java Programming' }
[Payment Debug] Auto-triggering payment in 1.5 seconds...
[Payment Debug] Executing auto-trigger payment
[Payment Debug] handlePayment called: { orderId: '...', amount: 4299, description: '...' }
[Payment Debug] Opening Razorpay checkout...
[Razorpay] openRazorpayCheckout called with options: { ... }
[Razorpay] Environment check: { hasKeyId: true, keyIdPrefix: 'rzp_test' }
[Razorpay] Initializing Razorpay with options: { ... }
[Razorpay] Opening checkout window...
```

### Step 4: Manual Trigger Test

If auto-trigger doesn't work, try clicking the **"💳 Pay Now"** button that appears below the order details message.

This will help determine if the issue is:
- ❌ Auto-trigger logic → If manual button works
- ❌ Razorpay configuration → If neither works

### Step 5: Verify Razorpay Keys

1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to Settings → API Keys
3. For testing, use **Test Mode** keys
4. Copy the **Key Id** (starts with `rzp_test_`)
5. Add to `.env.local`:
   ```bash
   RAZORPAY_LIVE_KEY_ID=rzp_test_your_key_here
   RAZORPAY_LIVE_KEY_SECRET=your_secret_here
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_here
   ```
6. **Must restart server** after changing `.env.local`

### Step 6: Common Mistakes

❌ **Forgot to restart server** after adding environment variables
✅ Always restart: `Ctrl+C` then `npm run dev`

❌ **Used wrong key** (LIVE instead of TEST)
✅ For testing, use `rzp_test_...` keys

❌ **Typo in environment variable name**
✅ Must be exactly: `NEXT_PUBLIC_RAZORPAY_KEY_ID`

❌ **Environment file in wrong location**
✅ `.env.local` must be in project root (same folder as `package.json`)

❌ **Ad blocker blocking Razorpay**
✅ Disable ad blockers or whitelist razorpay.com

### Step 7: Test Message Format

The AI agent should respond with this format:

```
Excellent! Your enrollment order has been created successfully! 🎉

**Order Details:**
- **Order ID:** order_RdMXj1s4clXI15
- **Course:** Java Programming Masterclass
- **Amount:** ₹4,299
- **Status:** created
```

Key requirements:
- ✅ Contains "Order ID:" followed by `order_` prefix
- ✅ Contains "₹" symbol with amount
- ✅ Contains "Course:" with course name

### Step 8: Environment Variable Verification

Run this in your terminal from the project directory:

```bash
# Check if .env.local exists
ls -la .env.local

# Show .env.local (safe - secrets won't show in console)
# Just verify the variable names are correct
grep RAZORPAY .env.local
```

Expected output:
```
RAZORPAY_LIVE_KEY_ID=rzp_test_...
RAZORPAY_LIVE_KEY_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
```

### Step 9: Browser Compatibility

Razorpay works best on:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ❌ May not work in incognito/private mode
- ❌ May not work with strict security settings

### Step 10: Network Issues

If you're behind a corporate firewall or VPN:
- Check if `checkout.razorpay.com` is accessible
- Try disabling VPN temporarily
- Check corporate firewall settings

## Quick Checklist

Before asking for help, verify:

- [ ] Environment variable `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set in `.env.local`
- [ ] Server was restarted after adding the variable
- [ ] Razorpay script loads (check Network tab)
- [ ] User is signed in (Clerk authentication)
- [ ] Console shows `[Payment Debug]` messages
- [ ] Order message contains "Order ID:" and "₹"
- [ ] No ad blockers interfering
- [ ] Using a supported browser

## Still Not Working?

Share these console logs:

1. All messages starting with `[Payment Debug]`
2. All messages starting with `[Razorpay]`
3. Any error messages in red
4. The exact message text from the chatbot
5. Your environment setup:
   - Is `NEXT_PUBLIC_RAZORPAY_KEY_ID` set? (yes/no)
   - Did you restart the server? (yes/no)
   - Which browser are you using?

## Success Indicators

When it works correctly:
1. ✅ Order message appears in chat
2. ✅ "💳 Pay Now" button appears
3. ✅ After 1.5 seconds, Razorpay window opens automatically
4. ✅ Payment form is pre-filled with your details
5. ✅ You can complete payment with test card

## Test Flow

1. Open chatbot
2. Say: "I want to enroll in Java Programming"
3. Wait for order creation message
4. Check console for debug messages
5. Wait 1.5 seconds for auto-trigger
6. Razorpay window should open

If it doesn't open automatically, click the "Pay Now" button.

## Getting Razorpay Test Keys

1. Go to https://dashboard.razorpay.com/signup
2. Create a free account
3. Go to Settings → API Keys
4. Generate Test Keys (free, no credit card needed)
5. Copy the Key ID (starts with `rzp_test_`)
6. Add to `.env.local`
7. Restart server

