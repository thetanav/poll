import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconArrowLeft, IconClock } from "@tabler/icons-react";
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
      <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/home">
            <Button variant="outline" className="mb-8">
              <IconArrowLeft size={18} />
              Back Home
            </Button>
          </Link>
          <Card className="p-8 text-center">
            <p className="text-lg text-neutral-600">Poll not exist. </p>
          </Card>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalVotes =
    poll.pollOptions?.reduce(
      (sum: number, opt: any) => sum + (opt?.votes?.length || 0),
      0
    ) || 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/home">
            <Button variant="outline">
              <IconArrowLeft size={18} />
              Back Home
            </Button>
          </Link>
          <div className="flex items-center gap-2">
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

        <Card
          className="py-6 px-8 shadow-lg mb-8"
          style={{ borderTop: `4px solid ${poll.themeColor || "#3b82f6"}` }}>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-neutral-900">
              {poll.title}
            </h1>
            {poll.expiresAt < Date.now() && (
              <span className="bg-red-200 rounded-full px-3 py-1 font-xs text-xs text-red-700">
                EXPIRED
              </span>
            )}
          </div>
          {poll.description && (
            <p className="text-neutral-600 text-sm">{poll.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-4">
            {/* Creator */}
            {poll.creator && (
              <div className="flex items-center gap-2">
                {poll.creator.imageUrl && (
                  <img
                    src={poll.creator.imageUrl}
                    className="w-5 h-5 rounded-full"
                  />
                )}
                <span className="text-sm text-neutral-600">
                  {poll.creator.name || "Anonymous"}
                </span>
              </div>
            )}

            {/* Expiration */}
            <div className="flex items-center gap-2">
              <IconClock size={14} className="text-neutral-400" />
              <span className="text-xs text-neutral-600">
                Expires on:{" "}
                <span className="font-semibold">
                  {formatDate(poll.expiresAt)}
                </span>
              </span>
            </div>
          </div>
          <Suspense>
            <Poll pollId={id} />
          </Suspense>
          <Suspense>
            <Reactions pollId={id} />
          </Suspense>
        </Card>

        <Suspense>
          <Comments pollId={id} />
        </Suspense>
      </div>
    </div>
  );
}
