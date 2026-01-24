import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconPlus,
  IconClock,
  IconLoader2,
  IconChartBar,
  IconTrendingUp,
  IconUsers,
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
  const formatTimeLeft = (expiresAt: number) => {
    const now = Date.now();
    if (now > expiresAt) return "Ended";
    const diff = expiresAt - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d left`;
    if (hours > 0) return `${hours}h left`;
    return "<1h left";
  };

  return (
    <div className="min-h-screen bg-neutral-50/50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-blue-600 text-white p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors">
                <IconChartBar className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-neutral-900 tracking-tight">
                Poll
              </span>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Link href="/create">
                <Button className="hidden sm:flex items-center gap-2 font-semibold shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 transition-all rounded-full px-6">
                  <IconPlus size={18} stroke={3} />
                  New Poll
                </Button>
                <Button size="icon" className="sm:hidden rounded-full">
                  <IconPlus size={20} />
                </Button>
              </Link>
              <div className="h-8 w-px bg-neutral-200 mx-1"></div>
              <UserButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
              Explore Polls
            </h1>
            <p className="text-neutral-500 mt-1">
              Vote on trending topics or create your own.
            </p>
          </div>
          {/* Could add filters here later */}
        </div>

        {/* Content */}
        {polls === undefined ? (
          <div className="flex flex-col items-center justify-center py-32">
            <IconLoader2 className="animate-spin h-10 w-10 text-blue-500 mb-4" />
            <p className="text-neutral-500 font-medium">Loading polls...</p>
          </div>
        ) : sortedPolls.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-neutral-300">
            <div className="bg-neutral-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconChartBar className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No polls yet
            </h3>
            <p className="text-neutral-500 max-w-sm mx-auto mb-6">
              Be the first to ask a question and get answers from the community.
            </p>
            <Link href="/create">
              <Button>Create Poll</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPolls.map((poll: any, index: number) => {
              const expired = isExpired(poll.expiresAt);
              const isTrending = index < 3 && poll.totalVotes > 5; // Simple trending logic

              return (
                <Link key={poll._id} href={`/p/${poll._id}`} className="block group h-full">
                  <article
                    className="relative flex flex-col h-full bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-xl hover:shadow-neutral-200/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    {/* Top Accent Line */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-1.5 bg-neutral-100"
                      style={{ backgroundColor: poll.themeColor || "#3b82f6" }}
                    />

                    <div className="p-6 flex flex-col flex-1">
                      {/* Header Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
                           <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${expired ? 'bg-neutral-100 text-neutral-600' : 'bg-green-100 text-green-700'}`}>
                              <IconClock size={12} />
                              <span>{formatTimeLeft(poll.expiresAt)}</span>
                           </div>
                        </div>
                        {isTrending && (
                          <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                            <IconTrendingUp size={12} />
                            <span>Trending</span>
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-neutral-900 leading-snug mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {poll.title}
                      </h3>

                      {/* Options Preview (Simplified) */}
                      <div className="space-y-2 mb-6 flex-1">
                        {poll.pollOptions?.slice(0, 2).map((option: any) => (
                           <div key={option._id} className="flex items-center gap-2 text-sm text-neutral-600">
                              <div className="w-1.5 h-1.5 rounded-full bg-neutral-300"></div>
                              <span className="truncate">{option.text}</span>
                           </div>
                        ))}
                        {(poll.pollOptions?.length || 0) > 2 && (
                           <div className="text-xs text-neutral-400 pl-3.5">
                              + {(poll.pollOptions?.length || 0) - 2} more options
                           </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-sm text-neutral-500">
                         <div className="flex items-center gap-1.5">
                            <IconUsers size={16} />
                            <span>{poll.totalVotes} votes</span>
                         </div>
                         <div className="font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            Vote Now
                         </div>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
