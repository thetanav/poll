import { SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  IconChartBar,
  IconArrowRight,
  IconCheck,
  IconBrandGithub,
} from "@tabler/icons-react";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { isAuthenticated } = await auth();

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(#4b5563 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-neutral-100 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg group-hover:rotate-3 transition-transform">
              <IconChartBar className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-neutral-900 tracking-tight">
              Poll
            </span>
          </Link>

          <div>
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link href="/home">
                  <Button variant="ghost" className="font-medium">
                    Dashboard
                  </Button>
                </Link>
                <UserButton />
              </div>
            ) : (
              <SignInButton mode="modal">
                <Button variant="ghost" className="font-medium">
                  Sign In
                </Button>
              </SignInButton>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-20 lg:py-32">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Text */}
          <div className="text-center lg:text-left space-y-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-neutral-900 tracking-tight leading-[1.1]">
              Ask the <span className="text-blue-600">right</span>
              <br />
              questions.
            </h1>

            <p className="text-xl text-neutral-500 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Create instant, real-time polls. Gather feedback, make decisions,
              and see results update live. No friction, just answers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              {isAuthenticated ? (
                <Link href="/home">
                  <Button
                    size="lg"
                    className="h-14 px-8 text-lg rounded-full shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all">
                    Go to Dashboard
                    <IconArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <SignInButton mode="modal">
                  <Button
                    size="lg"
                    className="h-14 px-8 text-lg rounded-full shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all cursor-pointer">
                    Start Creating — It's Free
                    <IconArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </SignInButton>
              )}
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative w-full max-w-md mx-auto lg:max-w-none perspective-1000">
            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-purple-200/50 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob"></div>
            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-blue-200/50 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob animation-delay-2000"></div>

            {/* Mock Poll Card */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-neutral-100 p-6 sm:p-8 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500 ease-out">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    JS
                  </div>
                  <div>
                    <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse mb-1.5"></div>
                    <div className="h-3 w-16 bg-neutral-100 rounded"></div>
                  </div>
                </div>
                <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold uppercase">
                  Live
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-neutral-800">
                  What's your favorite frontend framework?
                </h3>

                <div className="space-y-3">
                  {/* Option 1: Winner */}
                  <div className="relative overflow-hidden rounded-xl border-2 border-blue-500 bg-blue-50/50 p-3">
                    <div
                      className="absolute inset-y-0 left-0 bg-blue-200/50"
                      style={{ width: "70%" }}></div>
                    <div className="relative flex justify-between items-center z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                          <IconCheck size={12} stroke={4} />
                        </div>
                        <span className="font-semibold text-blue-900">
                          React
                        </span>
                      </div>
                      <span className="font-bold text-blue-900">70%</span>
                    </div>
                  </div>

                  {/* Option 2 */}
                  <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-3 opacity-70">
                    <div
                      className="absolute inset-y-0 left-0 bg-neutral-100"
                      style={{ width: "20%" }}></div>
                    <div className="relative flex justify-between items-center z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border border-neutral-300"></div>
                        <span className="font-medium text-neutral-600">
                          Vue
                        </span>
                      </div>
                      <span className="text-neutral-500">20%</span>
                    </div>
                  </div>

                  {/* Option 3 */}
                  <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-3 opacity-70">
                    <div
                      className="absolute inset-y-0 left-0 bg-neutral-100"
                      style={{ width: "10%" }}></div>
                    <div className="relative flex justify-between items-center z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border border-neutral-300"></div>
                        <span className="font-medium text-neutral-600">
                          Svelte
                        </span>
                      </div>
                      <span className="text-neutral-500">10%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between text-sm text-neutral-400">
                  <span>1,234 votes</span>
                  <span>Ends in 2 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-8 bg-neutral-50/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} Poll App. Open Source.
          </p>
          <div className="flex items-center gap-6">
             <Link href="https://github.com" className="text-neutral-400 hover:text-neutral-900 transition-colors">
                <IconBrandGithub size={20} />
             </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
