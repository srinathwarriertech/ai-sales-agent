"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Navbar } from "@/components/navbar";
import { ChatWidget } from "@/components/chat-widget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import type { Enrollment } from "@/lib/mcp/supabase-mcp";

export default function MyCoursesPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (isSignedIn) {
      fetchEnrollments();
    }
  }, [isSignedIn, isLoaded]);

  const fetchEnrollments = async () => {
    try {
      const response = await fetch("/api/enrollments");
      const data = await response.json();
      setEnrollments(data.enrollments || []);
    } catch (error) {
      console.error("Failed to fetch enrollments:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !isLoaded) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Courses</h1>
          <p className="text-gray-600">
            Access all your enrolled courses
          </p>
        </div>

        {enrollments.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <BookOpen className="h-16 w-16 mx-auto text-gray-400" />
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  No courses yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start your learning journey by enrolling in a course
                </p>
                <Button onClick={() => router.push("/courses")}>
                  Browse Courses
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Course ID: {enrollment.course_id}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-gray-600">
                    <p>Purchased: {formatDate(enrollment.purchased_at)}</p>
                    <p>Amount: {formatPrice(enrollment.amount_paid)}</p>
                  </div>
                  <Button
                    className="w-full mt-4"
                    onClick={() => router.push(`/courses/${enrollment.course_id}`)}
                  >
                    View Course
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ChatWidget />
    </main>
  );
}

