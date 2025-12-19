"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconLoader2, IconX } from "@tabler/icons-react";

export const Poll = ({ pollId }: { pollId: string }) => {
  const poll = useQuery(api.polls.getPoll, {
    pollId: pollId as Id<"poll">,
  });
  const currentUser = useQuery(api.users.current);

  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);

  const voteMutation = useMutation(api.polls.vote);
  const removeVoteMutation = useMutation(api.polls.removeVote);

  if (!poll)
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <IconLoader2 className="animate-spin" />
        <p className="text-slate-500 font-medium">Loading poll...</p>
      </div>
    );

  const isExpired = poll.expiresAt < Date.now();

  const handleVote = async (optionId: Id<"pollOption">) => {
    if (isExpired) {
      alert("Poll has expired");
      return;
    }
    setIsVoting(true);
    setVoteError(null);
    try {
      await voteMutation({
        pollId: pollId as Id<"poll">,
        optionId,
      });
    } catch (err) {
      setVoteError(err instanceof Error ? err.message : "Failed to vote");
    } finally {
      setIsVoting(false);
    }
  };

  const handleRemoveVote = async () => {
    setIsVoting(true);
    setVoteError(null);

    try {
      await removeVoteMutation({
        pollId: pollId as Id<"poll">,
      });
    } catch (err) {
      setVoteError(
        err instanceof Error ? err.message : "Failed to remove vote"
      );
    } finally {
      setIsVoting(false);
    }
  };

  const totalVotes =
    poll.pollOptions?.reduce(
      (sum: number, opt: any) => sum + (opt?.votes?.length || 0),
      0
    ) || 0;

  // Check if current user has voted
  const userVotedOption = currentUser
    ? poll.pollOptions?.find((opt: any) =>
        opt?.votes?.includes(currentUser._id)
      )
    : null;

  return (
    <div className="space-y-4">
      {/* Remove Vote Button */}
      {userVotedOption && !isExpired && (
        <div className="flex items-end justify-end">
          <Button
            variant="outline"
            onClick={handleRemoveVote}
            disabled={isVoting}>
            {isVoting ? (
              <div className="flex items-center gap-2">
                <IconLoader2 className="animate-spin" />
                Loading...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <IconX size={18} />
                {isVoting ? "Removing..." : "Remove My Vote"}
              </div>
            )}
          </Button>
        </div>
      )}

      {poll.pollOptions?.map((option: any) => {
        if (!option) return null;
        const votes = option.votes?.length || 0;
        const percentage =
          totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
        const isUserVote =
          currentUser && option.votes?.includes(currentUser._id);

        return (
          <button
            key={option._id}
            onClick={() => handleVote(option._id)}
            disabled={isVoting}
            className={`w-full text-left relative overflow-hidden rounded-xl border-2 cursor-pointer  transition-all duration-200 hover:scale-[1.01] active:scale-100 disabled:opacity-50 ${isUserVote ? "border-emerald-600" : "border-slate-200"}`}>
            {/* Progress Bar */}
            <div
              className="absolute inset-0 bg-blue-100 transition-all duration-300 ease-out"
              style={{
                width: `${percentage}%`,
                backgroundColor: poll.themeColor
                  ? `${poll.themeColor}10`
                  : undefined,
              }}></div>

            {/* Content */}
            <div className="relative p-4 flex items-center justify-between">
              <div className="flex-1">
                <p className="text-lg font-semibold text-slate-900">
                  {option.text}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900">{percentage}%</p>
                <p className="text-sm text-slate-500">
                  {votes} vote{votes !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
