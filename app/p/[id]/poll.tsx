"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconX } from "@tabler/icons-react";

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
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Loading poll...</p>
      </div>
    );

  const isExpired = poll.expiresAt < Date.now();

  if (isExpired) {
    return (
      <div className="mx-auto">
        <span className="text-xs font-semibold px-3 py-1 bg-red-100 text-red-700 rounded-full">
          Expired
        </span>
      </div>
    );
  }

  const handleVote = async (optionId: Id<"pollOption">) => {
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
            disabled={isExpired || isVoting}
            className="w-full text-left group cursor-pointer">
            <div
              className="relative overflow-hidden rounded-xl border-2 border-slate-200 hover:border-blue-400 transition-all duration-200 disabled:opacity-50"
              style={{
                borderColor: isUserVote
                  ? poll.themeColor || "#3b82f6"
                  : undefined,
                borderWidth: isUserVote ? "3px" : "2px",
              }}>
              {/* Progress Bar */}
              <div
                className="absolute inset-0 bg-blue-100 transition-all duration-300 ease-out"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: poll.themeColor
                    ? `${poll.themeColor}20`
                    : undefined,
                }}></div>

              {/* Content */}
              <div className="relative p-4 flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{option.text}</p>
                  {isUserVote && (
                    <span className="text-xs font-semibold text-blue-600">
                      Your vote
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{percentage}%</p>
                  <p className="text-sm text-slate-500">
                    {votes} vote{votes !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          </button>
        );
      })}

      {/* Remove Vote Button */}
      {userVotedOption && !isExpired && (
        <Button
          variant="outline"
          onClick={handleRemoveVote}
          disabled={isVoting}
          className="w-full mt-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <IconX size={18} />
          {isVoting ? "Removing..." : "Remove My Vote"}
        </Button>
      )}

      {/* Error Message */}
      {voteError && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-red-800 text-sm font-medium">{voteError}</p>
        </div>
      )}
    </div>
  );
};
