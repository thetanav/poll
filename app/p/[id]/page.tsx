import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconArrowLeft,
  IconClock,
  IconHammer,
  IconMenu2,
} from "@tabler/icons-react";
import Link from "next/link";
import { Comments } from "./comments";
import { Reactions } from "./reactions";
import { Poll } from "./poll";
import { fetchQuery } from "convex/nextjs";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { NavigationMenuIcon } from "@base-ui/react";
import { Menu } from "./menu";

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
        <div className="flex items-center justify-between">
          <Link href="/home">
            <Button variant="outline" className="mb-6">
              <IconArrowLeft size={18} />
              Back Home
            </Button>
          </Link>
          <Suspense>
            <Menu pollAuthor={poll.creator?.email!} pollId={id} />
          </Suspense>
        </div>

        <Card
          className="p-8 shadow-lg space-y-4 mb-8"
          style={{ borderTop: `4px solid ${poll.themeColor || "#3b82f6"}` }}>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {poll.title}
          </h1>
          {poll.description && (
            <p className="text-slate-600 mb-4 text-lg">{poll.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-slate-200">
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

            {/* Status */}

            <p className="text-sm text-slate-600 ">
              <span className="font-semibold">{totalVotes}</span> vote
              {totalVotes !== 1 ? "s" : ""}
            </p>
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
