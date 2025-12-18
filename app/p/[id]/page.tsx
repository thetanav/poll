"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  IconArrowLeft,
  IconClock,
  IconLoader2,
  IconMoodSmile,
  IconSend,
} from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";

const EMOJI_REACTIONS = ["👏", "❤️", "😂", "😡", "😢", "🤯", "💯", "👎"];

export default function PollPage() {
  const params = useParams();
  const pollId = params.id as string;
  const poll = useQuery(api.polls.getPoll, { pollId: pollId as Id<"poll"> });
  const reactions = useQuery(api.polls.getPollReactions, {
    pollId: pollId as Id<"poll">,
  });
  const comments = useQuery(api.polls.getPollComments, {
    pollId: pollId as Id<"poll">,
  });

  const voteMutation = useMutation(api.polls.vote);
  const addReactionMutation = useMutation(api.polls.addReaction);
  const addCommentMutation = useMutation(api.polls.addComment);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isAddingReaction, setIsAddingReaction] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  if (poll === undefined) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <IconLoader2 className="animate-spin rounded-full h-12 w-12 mx-auto mb-4" />
              <p className="text-slate-600">Loading poll...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/">
            <Button variant="outline" className="mb-8">
              <IconArrowLeft size={18} />
              Back Home
            </Button>
          </Link>
          <Card className="p-8 text-center">
            <p className="text-lg text-slate-600">Poll not found</p>
          </Card>
        </div>
      </div>
    );
  }

  const totalVotes =
    poll.pollOptions?.reduce(
      (sum: number, opt: any) => sum + (opt?.votes?.length || 0),
      0
    ) || 0;

  const isExpired = poll.expiresAt < Date.now();

  const handleVote = async (optionId: Id<"pollOption">) => {
    if (isExpired) {
      setVoteError("This poll has expired");
      return;
    }

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

  const handleAddReaction = async (emoji: string) => {
    setIsAddingReaction(true);
    try {
      await addReactionMutation({
        pollId: pollId as Id<"poll">,
        emoji,
      });
      setShowEmojiPicker(false);
    } catch (err) {
      console.error("Failed to add reaction:", err);
    } finally {
      setIsAddingReaction(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError(null);

    if (!commentText.trim()) {
      setCommentError("Comment cannot be empty");
      return;
    }

    setIsAddingComment(true);

    try {
      await addCommentMutation({
        pollId: pollId as Id<"poll">,
        body: commentText.trim(),
      });
      setCommentText("");
    } catch (err) {
      setCommentError(
        err instanceof Error ? err.message : "Failed to add comment"
      );
    } finally {
      setIsAddingComment(false);
    }
  };

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

  const formatCommentDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <Link href="/">
          <Button variant="outline" className="mb-6">
            <IconArrowLeft size={18} />
            Back Home
          </Button>
        </Link>

        {/* Poll Card */}
        <Card
          className="p-8 shadow-lg mb-6"
          style={{ borderTop: `4px solid ${poll.themeColor || "#3b82f6"}` }}>
          {/* Title */}
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {poll.title}
          </h1>

          {/* Description */}
          {poll.description && (
            <p className="text-slate-600 mb-4 text-lg">{poll.description}</p>
          )}

          {/* Poll Info */}
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
            {isExpired && (
              <div className="ml-auto">
                <span className="text-xs font-semibold px-3 py-1 bg-red-100 text-red-700 rounded-full">
                  Expired
                </span>
              </div>
            )}

            <p className="text-sm text-slate-600 ">
              <span className="font-semibold">{totalVotes}</span> vote
              {totalVotes !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-4 mb-8">
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
                        <p className="font-medium text-slate-900">
                          {option.text}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">
                          {percentage}%
                        </p>
                        <p className="text-sm text-slate-500">
                          {votes} vote{votes !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Error Message */}
          {voteError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
              <p className="text-red-800 text-sm font-medium">{voteError}</p>
            </div>
          )}

          {isExpired && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
              <p className="text-yellow-800 text-sm font-medium">
                This poll has expired and is no longer accepting votes
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            {reactions && reactions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {reactions.map((reaction: any) => (
                  <button
                    key={reaction.emoji}
                    onClick={() => handleAddReaction(reaction.emoji)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center gap-1 transition-colors">
                    <span className="text-lg">{reaction.emoji}</span>
                    <span className="text-xs font-medium text-slate-600">
                      {reaction.count}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No reactions yet. Be the first to react!
              </p>
            )}
            <div className="relative ">
              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute right-0 bottom-10 mt-2 p-4 bg-white border border-slate-200 rounded-lg shadow-lg z-10 grid grid-cols-4 gap-2 w-48">
                  {EMOJI_REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleAddReaction(emoji)}
                      className="text-2xl hover:scale-125 transition-transform cursor-pointer select-none">
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={isAddingReaction}
                className="flex items-center gap-2">
                <IconMoodSmile size={18} />
                Add Reaction
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">
            Comments
          </h3>

          {/* Add Comment */}
          <form
            onSubmit={handleAddComment}
            className="mb-6 pb-6 border-b border-slate-200">
            <div className="space-y-3">
              <Textarea
                placeholder="Share your thoughts..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={isAddingComment}
                rows={3}
                className="resize-none"
              />
              {commentError && (
                <p className="text-red-600 text-sm">{commentError}</p>
              )}
              <Button
                type="submit"
                disabled={isAddingComment || !commentText.trim()}
                className="w-full flex items-center justify-center gap-2">
                <IconSend size={18} />
                {isAddingComment ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </form>

          {/* Comments List */}
          {comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment: any) => (
                <div
                  key={comment._id}
                  className="pb-4 border-b border-slate-100 last:border-b-0">
                  {/* Comment Author & Time */}
                  <div className="flex items-center gap-2 mb-2">
                    {comment.author?.imageUrl && (
                      <img
                        src={comment.author.imageUrl}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="font-semibold text-sm text-slate-900">
                      {comment.author?.name || "Anonymous"}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatCommentDate(comment._creationTime)}
                    </span>
                  </div>

                  {/* Comment Body */}
                  <p className="text-slate-700 mb-3">{comment.body}</p>

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-6 space-y-3 pt-3 border-l-2 border-slate-200 pl-4">
                      {comment.replies.map((reply: any) => (
                        <div key={reply._id}>
                          <div className="flex items-center gap-2 mb-1">
                            {reply.author?.imageUrl && (
                              <img
                                src={reply.author.imageUrl}
                                className="w-5 h-5 rounded-full"
                              />
                            )}
                            <span className="font-semibold text-sm text-slate-900">
                              {reply.author?.name || "Anonymous"}
                            </span>
                            <span className="text-xs text-slate-500">
                              {formatCommentDate(reply._creationTime)}
                            </span>
                          </div>
                          <p className="text-slate-700 text-sm">{reply.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500">
              No comments yet. Start the conversation!
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
