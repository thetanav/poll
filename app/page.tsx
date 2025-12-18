"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconArrowRight, IconPlus, IconSparkles } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" width={40} height={40} alt="Logo" />
            <span className="text-xl font-bold text-slate-900">Poll</span>
          </Link>

          <div>
            {isSignedIn ? (
              <UserButton />
            ) : (
              <SignInButton mode="modal">
                <Button>Sign In</Button>
              </SignInButton>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          {/* Hero Section */}
          <div className="space-y-8">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <IconSparkles size={32} className="text-blue-600" />
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight">
                Get Answers.
                <br />
                Create Polls.
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto">
                Ask your questions and let people vote on your polls in
                real-time
              </p>
            </div>

            {/* Description */}
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Create engaging polls, collect opinions, and share results
              instantly with beautiful visualizations. Perfect for surveys,
              decisions, and fun community engagement.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {isSignedIn ? (
                <Link href="/home">
                  <Button size="lg" className="flex items-center gap-2 px-8">
                    <IconArrowRight size={20} />
                    Go to Polls
                  </Button>
                </Link>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <Button size="lg" className="flex items-center gap-2 px-8">
                      <IconArrowRight size={20} />
                      Get Started
                    </Button>
                  </SignInButton>
                  <Link href="/home">
                    <Button
                      size="lg"
                      variant="outline"
                      className="flex items-center gap-2 px-8">
                      <IconPlus size={20} />
                      Browse Polls
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-20 pt-12 border-t border-slate-200">
            <p className="text-sm font-semibold text-slate-500 mb-8">
              WHY CHOOSE POLL
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Easy to Create",
                  description:
                    "Create polls in seconds with a simple and intuitive interface",
                  icon: "✨",
                },
                {
                  title: "Real-time Results",
                  description:
                    "See voting results update instantly as people respond",
                  icon: "⚡",
                },
                {
                  title: "Share & Engage",
                  description:
                    "Share polls with your audience and collect valuable feedback",
                  icon: "🎯",
                },
              ].map((feature, index) => (
                <div key={index} className="space-y-3">
                  <div className="text-3xl">{feature.icon}</div>
                  <h3 className="font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
