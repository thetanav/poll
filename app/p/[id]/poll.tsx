"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

export const Poll = ({ pollId }: { pollId: string }) => {
  const poll = useQuery(api.polls.getPoll, {
    pollId: pollId as Id<"poll">,
  });

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);

  const voteMutation = useMutation(api.polls.vote);

  if (!poll)
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">Loading poll...</p>
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
      setSelectedOption(optionId);
    } catch (err) {
      setVoteError(err instanceof Error ? err.message : "Failed to vote");
    } finally {
      setIsVoting(false);
    }
  };

  const totalVotes =
    poll.pollOptions?.reduce(
      (sum: number, opt: any) => sum + (opt?.votes?.length || 0),
      0
    ) || 0;

  return (
    <div>
      {poll.pollOptions?.map((option: any) => {
        if (!option) return null;
        const votes = option.votes?.length || 0;
        const percentage =
          totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

        return (
          <button
            key={option._id}
            onClick={() => handleVote(option._id)}
            disabled={isExpired || isVoting}
            className="w-full text-left group">
            <div
              className="relative overflow-hidden rounded-lg border-2 border-slate-200 hover:border-blue-400 transition-colors disabled:opacity-50"
              style={{
                borderColor:
                  selectedOption === option._id
                    ? poll.themeColor || "#3b82f6"
                    : undefined,
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

      {/* Error Message */}
      {voteError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-red-800 text-sm font-medium">{voteError}</p>
        </div>
      )}
    </div>
  );
};
