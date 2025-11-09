"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Navbar } from "@/components/navbar";
import { ChatWidget } from "@/components/chat-widget";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Clock, BarChart3, CheckCircle2, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { loadRazorpayScript } from "@/lib/mcp/razorpay-mcp";
import type { Course } from "@/lib/mcp/supabase-mcp";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [params.id]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${params.id}`);
      const data = await response.json();
      setCourse(data.course);
    } catch (error) {
      console.error("Failed to fetch course:", error);
      toast({
        title: "Error",
        description: "Failed to load course details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!isSignedIn) {
      toast({
        title: "Sign in required",
        description: "Please sign in to purchase this course",
      });
      router.push("/sign-in");
      return;
    }

    if (!course) return;

    setPurchasing(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay");
      }

      // Create order
      const orderResponse = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: course.price,
          currency: "INR",
          customer_details: {
            customer_id: user!.id,
            customer_phone: user!.phoneNumbers?.[0]?.phoneNumber || "9999999999",
            customer_email: user!.primaryEmailAddress?.emailAddress || "",
            customer_name: user!.fullName || "",
          },
          order_note: `Course: ${course.title}`,
        }),
      });

      console.log("orderResponse", orderResponse);

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const order = await orderResponse.json();
      
      console.log("Order created:", order);
      
      // Validate that we have a Razorpay order ID
      if (!order.razorpay_order_id) {
        console.error("Order response missing razorpay_order_id:", order);
        throw new Error("Order created but Razorpay order ID is missing");
      }

      // Get Razorpay key from environment
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error("Razorpay key not configured");
      }

      // Initialize Razorpay Checkout
      const options = {
        key: razorpayKey,
        amount: order.order_amount_in_paise,
        currency: order.order_currency,
        name: "Course Purchase",
        description: `Course: ${course.title}`,
        order_id: order.razorpay_order_id,
        prefill: {
          name: user!.fullName || "",
          email: user!.primaryEmailAddress?.emailAddress || "",
          contact: user!.phoneNumbers?.[0]?.phoneNumber || "9999999999",
        },
        theme: {
          color: "#3B82F6",
        },
        handler: async (response: any) => {
          try {
            console.log("Payment successful:", response);

            // Verify payment and create enrollment
            const enrollmentResponse = await fetch("/api/enrollments", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                courseId: course.id,
                orderId: order.order_id,
                razorpay_order_id: order.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderAmount: order.order_amount.toString(),
              }),
            });

            if (!enrollmentResponse.ok) {
              throw new Error("Failed to create enrollment");
            }

            toast({
              title: "Success!",
              description: "You've successfully enrolled in the course",
            });

            router.push("/my-courses");
          } catch (error) {
            console.error("Enrollment error:", error);
            toast({
              title: "Error",
              description: "Payment successful but enrollment failed. Please contact support.",
              variant: "destructive",
            });
          } finally {
            setPurchasing(false);
          }
        },
        modal: {
          ondismiss: () => {
            console.log("Payment modal dismissed");
            setPurchasing(false);
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment",
            });
          },
        },
      };

      // Open Razorpay checkout
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Purchase error:", error);
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive",
      });
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <Button onClick={() => router.push("/courses")}>
            Browse Courses
          </Button>
        </div>
      </main>
    );
  }

  const levelColor = {
    beginner: "text-green-600 bg-green-50",
    intermediate: "text-blue-600 bg-blue-50",
    advanced: "text-purple-600 bg-purple-50",
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`text-sm font-medium px-3 py-1 rounded ${
                    levelColor[course.level]
                  }`}
                >
                  {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                </span>
                <span className="text-sm text-gray-600">{course.category}</span>
              </div>
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-gray-600 mb-4">{course.description}</p>
              <div className="flex items-center gap-6 text-gray-600">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  {course.duration}
                </div>
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  {course.level}
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>What you'll learn</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid md:grid-cols-2 gap-3">
                  {course.what_you_learn.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {course.requirements.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-gray-600">• {item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(course.price)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePurchase}
                  disabled={purchasing}
                >
                  {purchasing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Enroll Now"
                  )}
                </Button>

                <div className="pt-4 border-t space-y-3">
                  <h3 className="font-semibold">This course includes:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Full lifetime access</li>
                    <li>• Access on mobile and desktop</li>
                    <li>• Certificate of completion</li>
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-2">Instructor</h3>
                  <p className="text-gray-600">{course.instructor}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ChatWidget />
    </main>
  );
}

