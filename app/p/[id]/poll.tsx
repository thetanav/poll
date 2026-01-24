"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconLoader2, IconCheck, IconX } from "@tabler/icons-react";

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
        <IconLoader2 className="animate-spin text-blue-500" />
        <p className="text-slate-500 font-medium">Loading poll...</p>
      </div>
    );

  const isExpired = poll.expiresAt < Date.now();

  const handleVote = async (optionId: Id<"pollOption">) => {
    if (isExpired) {
      return; // Silent return or maybe a toast in the future
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

  // Find the winner if expired
  const winnerOption = isExpired
    ? poll.pollOptions?.reduce((prev: any, current: any) =>
        (prev?.votes?.length || 0) > (current?.votes?.length || 0)
          ? prev
          : current
      )
    : null;

  return (
    <div className="my-6 space-y-3">
      {poll.pollOptions?.map((option: any, index: number) => {
        if (!option) return null;
        const votes = option.votes?.length || 0;
        const percentage =
          totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
        const isUserVote =
          currentUser && option.votes?.includes(currentUser._id);
        const isWinner =
          isExpired && winnerOption && winnerOption._id === option._id;

        return (
          <button
            key={option._id}
            onClick={() => handleVote(option._id)}
            disabled={isVoting || isExpired}
            className={`w-full relative overflow-hidden rounded-xl border-2 transition-all duration-200 group animate-in fade-in slide-in-from-bottom-2 fill-mode-both
              ${
                isUserVote
                  ? "border-blue-500 bg-blue-50/50"
                  : isWinner
                    ? "border-yellow-400 bg-yellow-50/50"
                    : "border-neutral-100 bg-white hover:border-blue-200 hover:bg-neutral-50"
              }
              ${isExpired && !isWinner && !isUserVote ? "opacity-60 grayscale-[0.5]" : ""}
            `}
            style={{ animationDelay: `${index * 50}ms` }}>
            {/* Progress Bar Background */}
            <div
              className={`absolute top-0 bottom-0 left-0 transition-all duration-700 ease-out opacity-10
                ${isWinner ? "bg-yellow-500" : "bg-blue-500"}
              `}
              style={{
                width: `${percentage}%`,
                backgroundColor:
                  poll.themeColor && !isWinner ? poll.themeColor : undefined,
              }}></div>

            <div className="relative p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3 text-left">
                {/* Custom Checkbox/Radio Indicator */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors
                    ${
                      isUserVote
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-neutral-300 group-hover:border-blue-300"
                    }
                  `}>
                  {isUserVote && <IconCheck size={14} stroke={3} />}
                </div>

                <div className="flex flex-col">
                  <span
                    className={`text-base font-semibold ${isUserVote ? "text-blue-900" : "text-neutral-800"}`}>
                    {option.text}
                  </span>
                  {isWinner && (
                    <span className="text-xs font-bold text-yellow-600 uppercase tracking-wider">
                      Winner
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="block text-lg font-bold text-neutral-900 leading-none">
                  {percentage}%
                </span>
                <span className="text-xs text-neutral-500 font-medium">
                  {votes} vote{votes !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </button>
        );
      })}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2 px-1">
        <p className="text-sm text-neutral-500">
          Total votes: <span className="font-semibold">{totalVotes}</span>
        </p>

        {userVotedOption && !isExpired && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveVote}
            disabled={isVoting}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8">
            {isVoting ? (
              <IconLoader2 className="animate-spin w-4 h-4 mr-2" />
            ) : (
              <IconX className="w-4 h-4 mr-2" />
            )}
            Remove my vote
          </Button>
        )}
      </div>

      {voteError && (
        <p className="text-red-500 text-sm text-center mt-2">{voteError}</p>
      )}
    </div>
  );
};
