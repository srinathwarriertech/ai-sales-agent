"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { ChatWidget } from "@/components/chat-widget";
import { BookOpen, Sparkles, Shield, Zap } from "lucide-react";

export default function Home() {
  const handleChatClick = () => {
    const chatButton = document.querySelector('[class*="fixed bottom-6 right-6"]') as HTMLElement;
    if (chatButton) chatButton.click();
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-600">
              AI-Powered Course Discovery
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Learn Anything with Your AI Course Advisor
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover the perfect courses for your learning journey. Chat with our AI advisor to get personalized recommendations and enroll instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/courses">
              <Button size="lg" className="text-lg px-8">
                Browse Courses
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8"
              onClick={handleChatClick}
            >
              Talk to AI Advisor
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Recommendations</h3>
            <p className="text-gray-600">
              Get personalized course suggestions based on your interests and goals
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Instant Enrollment</h3>
            <p className="text-gray-600">
              Secure payment processing with Razorpay for quick course access
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Quality Courses</h3>
            <p className="text-gray-600">
              Learn from expert instructors across various skill levels
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Chat with our AI advisor now and find your perfect course
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-8"
            onClick={handleChatClick}
          >
            Start Chatting
          </Button>
        </div>
      </section>

      <ChatWidget />
    </main>
  );
}

