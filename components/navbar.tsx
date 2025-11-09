"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { BookOpen, MessageSquare } from "lucide-react";

export function Navbar() {
  const { isSignedIn } = useUser();

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">CourseHub</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              href="/courses"
              className="text-sm font-medium hover:text-primary"
            >
              Courses
            </Link>
            
            {isSignedIn && (
              <Link
                href="/my-courses"
                className="text-sm font-medium hover:text-primary"
              >
                My Courses
              </Link>
            )}

            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

