"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { IconSend } from "@tabler/icons-react";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

export const Comments = ({ pollId }: { pollId: string }) => {
  const { user } = useUser();
  const addCommentMutation = useMutation(api.polls.addComment);
  const [commentText, setCommentText] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const comments = useQuery(api.polls.getPollComments, {
    pollId: pollId as Id<"poll">,
  });
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
  return (
    <Card className="p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Comments</h3>

      {user && (
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
      )}

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
  );
};
