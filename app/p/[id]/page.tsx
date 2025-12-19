import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconArrowLeft,
  IconClock,
  IconPresentation,
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
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/home">
            <Button variant="outline" className="mb-8">
              <IconArrowLeft size={18} />
              Back Home
            </Button>
          </Link>
          <Card className="p-8 text-center">
            <p className="text-lg text-slate-600">Poll not exist. </p>
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
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-8 px-4">
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
          className="p-8 shadow-lg space-y-0 mb-8"
          style={{ borderTop: `4px solid ${poll.themeColor || "#3b82f6"}` }}>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {poll.title}
            </h1>
            {poll.expiresAt < Date.now() && (
              <span className="bg-red-200 rounded-full px-3 py-1 font-xs text-xs text-red-700">
                EXPIRED
              </span>
            )}
          </div>
          {poll.description && (
            <p className="text-slate-600 mb-4 text-lg">{poll.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 mb-2">
            {/* Creator */}
            {poll.creator && (
              <div className="flex items-center gap-2">
                {poll.creator.imageUrl && (
                  <img
                    src={poll.creator.imageUrl}
                    className="border w-6 h-6 rounded-full"
                  />
                )}
                <span className="text-sm text-slate-600">
                  <span className="font-semibold">
                    {poll.creator.name || "Anonymous"}
                  </span>
                </span>
              </div>
            )}

            {/* Expiration */}
            <div className="flex items-center gap-2">
              <IconClock size={18} className="text-slate-400" />
              <span className="text-sm text-slate-600">
                Expires:{" "}
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
