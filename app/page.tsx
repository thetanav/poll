"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconArrowRight, IconChartBar, IconPlus } from "@tabler/icons-react";

export default function Home() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <IconChartBar className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-slate-900">Poll</h1>
          </div>

          <div>
            {user ? (
              <UserButton />
            ) : (
              <SignInButton mode="modal">
                <Button>Sign In</Button>
              </SignInButton>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <div className="mb-12">
          <Card className="p-12 shadow-lg bg-white">
            <div className="space-y-6">
              <div>
                <h2 className="text-4xl font-bold text-slate-900 mb-2">
                  Get answered. Create polls.
                </h2>
                <p className="text-xl text-slate-600">
                  Ask your questions and let people vote on your polls in
                  real-time.
                </p>
              </div>

              <div>
                <p className="text-slate-600 mb-4">
                  Create engaging polls, collect opinions, and share results
                  instantly with beautiful visualizations.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {user ? (
                  <Link href="/create" className="flex-1 sm:flex-none">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto flex items-center gap-2 font-bold cursor-pointer">
                      <IconPlus size={20} />
                      Create a Poll
                    </Button>
                  </Link>
                ) : (
                  <SignInButton mode="modal">
                    <Button size="lg" className="flex items-center gap-2">
                      <IconArrowRight size={20} />
                      Get Started
                    </Button>
                  </SignInButton>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Features Section */}
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
            <Card
              key={index}
              className="p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
