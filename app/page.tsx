import { SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconChartBar, IconArrowRight } from "@tabler/icons-react";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { isAuthenticated } = await auth();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-neutral-100">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <IconChartBar className="w-6 h-6 text-blue-500" />
            <span className="text-lg font-bold text-neutral-900">Poll</span>
          </Link>

          <div>
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link href="/home">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <UserButton />
              </div>
            ) : (
              <SignInButton mode="modal">
                <Button size="sm" variant="ghost">
                  Sign In
                </Button>
              </SignInButton>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-xl w-full text-center py-20">
          <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight mb-6">
            Create polls.
            <br />
            Get answers.
          </h1>

          <p className="text-lg text-neutral-500 mb-10 max-w-md mx-auto">
            Real-time voting. No sign-up required for voters. Free forever.
          </p>

          {isAuthenticated ? (
            <Link href="/home">
              <Button
                size="lg"
                className="px-8 py-6 text-base font-semibold gap-2">
                Go to Dashboard
                <IconArrowRight size={18} />
              </Button>
            </Link>
          ) : (
            <SignInButton mode="modal">
              <Button
                size="lg"
                className="px-8 py-6 text-base font-semibold gap-2 cursor-pointer">
                Start Creating
                <IconArrowRight size={18} />
              </Button>
            </SignInButton>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-6">
        <div className="max-w-3xl mx-auto px-6 text-center text-sm text-neutral-400">
          Free and open source
        </div>
      </footer>
    </div>
  );
}
