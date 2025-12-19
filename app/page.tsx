import { SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconChartArea, IconChartBar } from "@tabler/icons-react";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { isAuthenticated } = await auth();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <IconChartBar className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-slate-900">Poll</span>
          </Link>

          <div>
            {isAuthenticated ? (
              <UserButton />
            ) : (
              <SignInButton mode="modal">
                <Button>Sign In</Button>
              </SignInButton>
            )}
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="space-y-8">
            <div className="space-y-7 py-24">
              <h1 className="sm:text-5xl text-3xl font-bold text-slate-900 tracking-tight">
                Get Answered.
                <br />
                Create Polls.
              </h1>
              <p className="sm:text-lg text-sm text-slate-600 max-w-sm sm:max-w-md mx-auto">
                Ask your questions and let people vote on your polls in
                real-time
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap- items-center justify-center pt-4">
              {isAuthenticated ? (
                <Link href="/home">
                  <Button
                    size="lg"
                    className="flex items-center gap-2 px-8 py-6 cursor-pointer font-bold text-md shadow-lg shadow-primary/40">
                    <IconChartArea size={20} />
                    Go to Polls
                  </Button>
                </Link>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <SignInButton mode="modal">
                    <Button size="lg" className="flex items-center gap-2 px-8">
                      <IconChartArea size={20} />
                      Get Started
                    </Button>
                  </SignInButton>
                </div>
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
