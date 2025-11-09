"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "ai/react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { loadRazorpayScript } from "@/lib/mcp/razorpay-mcp";
import { useToast } from "@/hooks/use-toast";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [processingPayment, setProcessingPayment] = useState(false);

  // Use Vercel AI SDK's useChat hook for streaming responses
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/chat",
    initialMessages: [],
  });

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message
      const greeting = user?.firstName ? `Hi ${user.firstName}! 👋` : "Hello! 👋";

      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `${greeting} I'm your AI course advisor powered by Llama 3.3 70B via Groq. I'm here to help you find the perfect courses for your learning journey.

I can help you:
- Discover courses in various topics
- Get detailed information about courses
- Find courses that match your skill level
- Enroll in courses you're interested in

What kind of courses are you interested in, or is there something specific you'd like to learn?`,
        },
      ]);
    }
  }, [isOpen, user, messages.length, setMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Extract order details from message
  const extractOrderDetails = (content: string) => {
    console.log('[Payment Debug] Extracting order details from message:', content.substring(0, 200));
    
    const orderIdMatch = content.match(/Order ID[:\s]*([a-zA-Z0-9_]+)/i);
    const amountMatch = content.match(/Amount[:\s]*₹[\s]*([0-9,]+)/i) || 
                        content.match(/₹[\s]*([0-9,]+)/);
    const courseMatch = content.match(/Course[:\s]*([^\n*-]+)/i);

    console.log('[Payment Debug] Matches:', {
      orderId: orderIdMatch?.[1],
      amount: amountMatch?.[1],
      course: courseMatch?.[1]
    });

    if (orderIdMatch && amountMatch) {
      const details = {
        orderId: orderIdMatch[1],
        amount: parseFloat(amountMatch[1].replace(/,/g, '')),
        courseName: courseMatch ? courseMatch[1].trim() : 'Course Enrollment',
      };
      console.log('[Payment Debug] Extracted order details:', details);
      return details;
    }
    console.log('[Payment Debug] No order details found in message');
    return null;
  };

  // Handle payment for an order - Reusing logic from course page
  const handlePayment = async (orderId: string, amount: number, courseName: string) => {
    console.log('[Payment Debug] handlePayment called:', { orderId, amount, courseName });
    
    if (!user) {
      console.error('[Payment Debug] User not authenticated');
      toast({
        title: "Sign in required",
        description: "Please sign in to complete the payment",
        variant: "destructive",
      });
      return;
    }

    setProcessingPayment(true);
    console.log('[Payment Debug] Loading Razorpay script...');

    try {
      // Load Razorpay script (same as course page)
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay");
      }
      console.log('[Payment Debug] Razorpay script loaded successfully');

      // Get Razorpay key from environment
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      console.log('[Payment Debug] Razorpay key check:', {
        hasKey: !!razorpayKey,
        keyPrefix: razorpayKey?.substring(0, 8)
      });
      
      if (!razorpayKey) {
        throw new Error("Razorpay key not configured. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID in .env.local");
      }

      // Fetch the order details from the existing order ID
      console.log('[Payment Debug] Fetching order details for:', orderId);
      const orderResponse = await fetch(`/api/razorpay/order/${orderId}`);
      
      if (!orderResponse.ok) {
        throw new Error("Failed to fetch order details");
      }

      const orderData = await orderResponse.json();
      console.log('[Payment Debug] Order details fetched:', orderData);

      // Initialize Razorpay Checkout (same options as course page)
      const options = {
        key: razorpayKey,
        amount: orderData.order_amount_in_paise || Math.round(amount * 100),
        currency: orderData.order_currency || "INR",
        name: "CourseHub",
        description: courseName,
        order_id: orderData.razorpay_order_id || orderId,
        prefill: {
          name: user.fullName || "",
          email: user.primaryEmailAddress?.emailAddress || "",
          contact: user.primaryPhoneNumber?.phoneNumber || "9999999999",
        },
        theme: {
          color: "#3B82F6",
        },
        handler: async (response: any) => {
          try {
            console.log('[Payment Debug] Payment successful:', response);

            // Verify payment and create enrollment (same as course page)
            const enrollmentResponse = await fetch("/api/enrollments", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                courseId: orderData.course_id || orderData.notes?.course_id,
                orderId: orderData.order_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderAmount: orderData.order_amount?.toString() || amount.toString(),
              }),
            });

            if (!enrollmentResponse.ok) {
              throw new Error("Failed to create enrollment");
            }

            toast({
              title: "Success! 🎉",
              description: "You've successfully enrolled in the course",
            });

            // Add success message to chat
            setMessages([
              ...messages,
              {
                id: `payment-success-${Date.now()}`,
                role: "assistant",
                content: `🎉 Payment successful! Your enrollment is confirmed.\n\nPayment ID: ${response.razorpay_payment_id}\n\nYou can now access your course from the "My Courses" section. Happy learning!`,
              },
            ]);

            // Navigate to my courses
            setTimeout(() => router.push("/my-courses"), 2000);
          } catch (error) {
            console.error('[Payment Debug] Enrollment error:', error);
            toast({
              title: "Error",
              description: "Payment successful but enrollment failed. Please contact support.",
              variant: "destructive",
            });
          } finally {
            setProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            console.log('[Payment Debug] Payment modal dismissed');
            setProcessingPayment(false);
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment. You can retry anytime.",
            });
          },
        },
      };

      console.log('[Payment Debug] Opening Razorpay checkout...');
      // Open Razorpay checkout (same as course page)
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('[Payment Debug] Purchase error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
      setProcessingPayment(false);
    }
  };

  // Auto-trigger payment when order is created
  useEffect(() => {
    console.log('[Payment Debug] Auto-trigger useEffect running:', {
      messagesLength: messages.length,
      processingPayment,
      isLoading,
    });

    if (messages.length > 0 && !processingPayment && !isLoading) {
      const lastMessage = messages[messages.length - 1];
      
      console.log('[Payment Debug] Checking last message:', {
        role: lastMessage.role,
        contentPreview: lastMessage.content.substring(0, 100),
        hasOrderID: lastMessage.content.includes('Order ID'),
        hasRupee: lastMessage.content.includes('₹'),
      });
      
      // Check if the last message is from assistant and contains order details
      if (lastMessage.role === 'assistant' && 
          (lastMessage.content.includes('Order ID:') || lastMessage.content.includes('order_')) &&
          lastMessage.content.includes('₹')) {
        
        const orderDetails = extractOrderDetails(lastMessage.content);
        
        if (orderDetails && !lastMessage.content.includes('Payment successful')) {
          console.log('[Payment Debug] Auto-triggering payment in 1.5 seconds...');
          // Auto-trigger payment after a short delay to let user read the message
          const timer = setTimeout(() => {
            console.log('[Payment Debug] Executing auto-trigger payment');
            handlePayment(orderDetails.orderId, orderDetails.amount, orderDetails.courseName);
          }, 1500);
          
          return () => {
            console.log('[Payment Debug] Cleaning up auto-trigger timer');
            clearTimeout(timer);
          };
        } else {
          console.log('[Payment Debug] No valid order details or already paid');
        }
      } else {
        console.log('[Payment Debug] Last message does not match trigger conditions');
      }
    }
  }, [messages, processingPayment, isLoading]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.closest("form");
      if (form) {
        handleSubmit(e as any);
      }
    }
  };

  return (
    <>
      {/* Chat Widget Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg">AI Course Advisor</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Powered by Qwen3-32b via Groq</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-4 pt-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto pr-2" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => {
                  const orderDetails = message.role === 'assistant' ? extractOrderDetails(message.content) : null;
                  const showPayButton = orderDetails && !message.content.includes('Payment successful');

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex flex-col",
                        message.role === "user" ? "items-end" : "items-start"
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-lg px-4 py-2 max-w-[80%]",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {showPayButton && (
                        <Button
                          onClick={() => handlePayment(orderDetails.orderId, orderDetails.amount, orderDetails.courseName)}
                          disabled={processingPayment}
                          className="mt-2"
                          size="sm"
                        >
                          {processingPayment ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            '💳 Pay Now'
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={onSubmit} className="flex items-center space-x-2 mt-4">
              <textarea
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about courses..."
                className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={2}
                disabled={isLoading}
              />
              <Button type="submit" disabled={!input.trim() || isLoading} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  );
}
