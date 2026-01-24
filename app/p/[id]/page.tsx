import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconArrowLeft,
  IconClock,
  IconAlertCircle,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import { Comments } from "./comments";
import { Reactions } from "./reactions";
import { Poll } from "./poll";
import { fetchQuery } from "convex/nextjs";
import { Suspense } from "react";
import { Menu } from "./menu";
import { UserButton } from "@clerk/nextjs";

export default async function PollPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let poll;
  try {
    poll = await fetchQuery(api.polls.getPoll, {
      pollId: id as Id<"poll">,
    });
  } catch {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center shadow-xl border-neutral-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <IconAlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">
            Poll Not Found
          </h2>
          <p className="text-neutral-500 mb-8">
            This poll might have been deleted or the link is invalid.
          </p>
          <Link href="/home">
            <Button className="w-full">
              <IconArrowLeft size={18} className="mr-2" />
              Return to Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  const totalVotes =
    poll.pollOptions?.reduce(
      (sum: number, opt: any) => sum + (opt?.votes?.length || 0),
      0
    ) || 0;

  const isExpired = poll.expiresAt < Date.now();

  return (
    <div className="min-h-screen bg-neutral-50/50">
      {/* Navbar / Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200 mb-8">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/home">
            <Button
              variant="ghost"
              size="sm"
              className="text-neutral-500 hover:text-neutral-900 -ml-2">
              <IconArrowLeft size={18} className="mr-1" />
              Back
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <UserButton />
            <Suspense>
              <Menu
                votes={totalVotes}
                pollAuthor={poll.creator?.email!}
                pollId={id}
              />
            </Suspense>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 pb-12">
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card
            className="shadow-xl shadow-neutral-200/50 border-neutral-200 overflow-hidden"
            style={{
              borderTop: `6px solid ${poll.themeColor || "#3b82f6"}`,
            }}>
            <div className="p-6 sm:p-8">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div className="space-y-4 flex-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 leading-tight">
                    {poll.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {/* Creator */}
                    <div className="flex items-center gap-2 text-neutral-600 bg-neutral-100 px-3 py-1.5 rounded-full">
                      {poll.creator?.imageUrl ? (
                        <img
                          src={poll.creator.imageUrl}
                          className="w-5 h-5 rounded-full"
                          alt="Creator"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-neutral-300 flex items-center justify-center">
                          <IconUser size={12} className="text-white" />
                        </div>
                      )}
                      <span className="font-medium">
                        {poll.creator?.name || "Anonymous"}
                      </span>
                    </div>

                    {/* Expiration */}
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium ${
                        isExpired
                          ? "bg-red-50 text-red-700"
                          : "bg-blue-50 text-blue-700"
                      }`}>
                      <IconClock size={16} />
                      {isExpired ? (
                        <span>Ended on {formatDate(poll.expiresAt)}</span>
                      ) : (
                        <span>Expires {formatDate(poll.expiresAt)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {poll.description && (
                <div className="mb-8 text-neutral-600 leading-relaxed text-lg border-l-4 border-neutral-100 pl-4">
                  {poll.description}
                </div>
              )}

              {/* Poll Interface */}
              <div className="mt-8">
                <Suspense fallback={<div className="h-40 bg-neutral-100 animate-pulse rounded-xl" />}>
                  <Poll pollId={id} />
                </Suspense>
              </div>

              {/* Reactions */}
              <Suspense>
                <Reactions pollId={id} />
              </Suspense>
            </div>
          </Card>

          {/* Comments Section */}
          <Suspense fallback={<div className="h-40 bg-neutral-100 animate-pulse rounded-xl" />}>
            <Comments pollId={id} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
