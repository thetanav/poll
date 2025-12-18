import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconPlus,
  IconClock,
  IconLoader2,
  IconArrowRight,
  IconChartBar,
} from "@tabler/icons-react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { fetchQuery } from "convex/nextjs";

export default async function HomePage() {
  const polls = await fetchQuery(api.polls.listPolls);

  // Sort polls by total votes (descending)
  const sortedPolls =
    polls
      ?.map((poll) => {
        const totalVotes =
          poll.pollOptions?.reduce(
            (sum: number, opt: any) => sum + (opt?.votes?.length || 0),
            0
          ) || 0;
        return { ...poll, totalVotes };
      })
      .sort((a, b) => b.totalVotes - a.totalVotes) || [];

  const isExpired = (expiresAt: number) => expiresAt < Date.now();
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <IconChartBar className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-slate-900">Poll</span>
            </Link>

            {/* Create Poll Button */}
            <div className="flex items-center gap-4">
              <Link href="/create">
                <Button className="flex items-center gap-2 font-bold cursor-pointer">
                  <IconPlus size={20} />
                  Create Poll
                </Button>
              </Link>

              {/* User Button */}
              <UserButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-7 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-slate-600 mb-2">
            Popular Polls
          </h1>
          <p className="text-lg text-slate-400">
            Vote on the most engaging polls from our community
          </p>
        </div>

        {/* Loading State */}
        {polls === undefined ? (
          <div className="flex flex-col items-center justify-center py-20">
            <IconLoader2 className="animate-spin h-16 w-16 text-blue-500 mb-6" />
            <p className="text-slate-600 text-lg font-medium">Loading polls...</p>
          </div>
        ) : sortedPolls.length === 0 ? (
          <Card className="p-12 text-center shadow-lg">
            <p className="text-lg text-slate-600 mb-6">
              No polls yet. Be the first to create one!
            </p>
            <Link href="/create">
              <Button size="lg" className="flex items-center gap-2">
                <IconPlus size={20} />
                Create the First Poll
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPolls.map((poll: any) => {
              const expired = isExpired(poll.expiresAt);

              return (
                <Link key={poll._id} href={`/p/${poll._id}`}>
                  <Card
                    className="h-full p-6 shadow-md hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
                    style={{
                      borderTop: `4px solid ${poll.themeColor || "#3b82f6"}`,
                    }}>
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">
                      {poll.title}
                    </h3>

                    {/* Poll Stats */}
                    <div className="space-y-3 mb-2 pb-6 border-b border-slate-200">
                      {/* Top Option Preview */}
                      {poll.pollOptions && poll.pollOptions.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-slate-500 font-medium">
                            Top Option
                          </p>
                          {poll.pollOptions
                            .filter((opt: any) => opt)
                            .slice(0, 1)
                            .map((option: any) => {
                              const votes = option.votes?.length || 0;
                              const percentage =
                                poll.totalVotes > 0
                                  ? Math.round((votes / poll.totalVotes) * 100)
                                  : 0;
                              return (
                                <div key={option._id}>
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-slate-900 truncate mb-1">
                                      {option.text}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                      {percentage}% ({votes} votes)
                                    </p>
                                  </div>
                                  <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div
                                      className="h-2 rounded-full transition-all duration-300"
                                      style={{
                                        width: `${percentage}%`,
                                        backgroundColor:
                                          poll.themeColor || "#3b82f6",
                                      }}></div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}

                      {/* Total Votes */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">
                          Total Votes:{" "}
                          <span className="font-semibold text-slate-900">
                            {poll.totalVotes}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-slate-500">
                        <IconClock size={14} />
                        <span>
                          {expired
                            ? "Expired"
                            : `Expires ${formatDate(poll.expiresAt)}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600 font-medium">
                        <span>View</span>
                        <IconArrowRight size={14} />
                      </div>
                    </div>

                    {/* Expired Badge */}
                    {expired && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <span className="text-xs font-semibold px-2 py-1 bg-red-100 text-red-700 rounded-full">
                          Closed
                        </span>
                      </div>
                    )}
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
