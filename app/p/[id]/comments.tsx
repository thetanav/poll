"use client";

import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  IconDotsVertical,
  IconLoader2,
  IconSend,
  IconMessageCircle,
} from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { IconExclamationCircle, IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery } from "convex/react";

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

    if (diffMins < 1) return "Just now";
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
    <Card className="shadow-xl shadow-neutral-200/50 border-neutral-200 overflow-hidden">
      <div className="p-6 bg-white">
        <div className="flex items-center gap-2 mb-6">
          <IconMessageCircle className="text-neutral-400" size={24} />
          <h3 className="text-xl font-bold text-neutral-900">
            Discussion
            {comments && comments.length > 0 && (
              <span className="ml-2 text-sm font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full align-middle">
                {comments.length}
              </span>
            )}
          </h3>
        </div>

        {/* Input Area */}
        {user ? (
          <form onSubmit={handleAddComment} className="mb-8 group">
            <div className="relative">
              <Textarea
                placeholder="What are your thoughts?"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={isAddingComment}
                rows={3}
                className="resize-none pr-12 text-base bg-neutral-50 border-neutral-200 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all rounded-xl"
              />
              <div className="absolute right-2 bottom-2">
                <Button
                  type="submit"
                  size="icon"
                  disabled={isAddingComment || !commentText.trim()}
                  className="h-9 w-9 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 disabled:shadow-none">
                  {isAddingComment ? (
                    <IconLoader2 className="animate-spin" size={18} />
                  ) : (
                    <IconSend size={18} />
                  )}
                </Button>
              </div>
            </div>
            {commentError && (
              <p className="text-red-600 text-sm mt-2 font-medium animate-in slide-in-from-top-1">
                {commentError}
              </p>
            )}
          </form>
        ) : (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-xl text-center">
            <p className="text-blue-800 text-sm font-medium">
              Sign in to join the conversation
            </p>
          </div>
        )}

        {/* Comments List */}
        {comments && comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map((comment: any) => (
              <div
                key={comment._id}
                className="group animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="shrink-0">
                    {comment.author?.imageUrl ? (
                      <img
                        src={comment.author.imageUrl}
                        className="w-10 h-10 rounded-full border border-neutral-100 shadow-sm object-cover"
                        alt={comment.author.name}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-neutral-200 to-neutral-300 border border-neutral-200" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-neutral-900">
                          {comment.author?.name || "Anonymous"}
                        </span>
                        <span className="text-xs text-neutral-400 font-medium">
                          • {formatCommentDate(comment._creationTime)}
                        </span>
                      </div>
                      
                      {user?.emailAddresses?.[0]?.emailAddress ===
                        comment.author?.email && <Menu commentId={comment._id} />}
                    </div>

                    <div className="text-neutral-700 text-base leading-relaxed break-words">
                      {comment.body}
                    </div>

                    {/* Replies (if any) */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 space-y-3 pl-4 border-l-2 border-neutral-100">
                        {comment.replies.map((reply: any) => (
                          <div key={reply._id} className="flex gap-3">
                            <div className="shrink-0">
                               {reply.author?.imageUrl ? (
                                  <img
                                    src={reply.author.imageUrl}
                                    className="w-6 h-6 rounded-full"
                                  />
                               ) : (
                                  <div className="w-6 h-6 rounded-full bg-neutral-200" />
                               )}
                            </div>
                            <div>
                               <div className="flex items-center gap-2 mb-0.5">
                                  <span className="font-semibold text-xs text-neutral-900">
                                     {reply.author?.name || "Anonymous"}
                                  </span>
                                  <span className="text-[10px] text-neutral-400">
                                     {formatCommentDate(reply._creationTime)}
                                  </span>
                               </div>
                               <p className="text-neutral-600 text-sm">{reply.body}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center flex flex-col items-center justify-center text-neutral-400">
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-3">
              <IconMessageCircle size={32} className="opacity-50" />
            </div>
            <p className="text-neutral-500 font-medium">No comments yet</p>
            <p className="text-sm text-neutral-400">
              Be the first to share your opinion!
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export const Menu = ({ commentId }: { commentId: string }) => {
  const deleteComment = useMutation(api.polls.deleteComment);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 focus:outline-none">
        <IconDotsVertical size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-40 p-1 rounded-xl shadow-xl border-neutral-100 bg-white/95 backdrop-blur-sm">
        <DropdownMenuItem
          className="text-red-600 focus:text-red-700 focus:bg-red-50 rounded-lg cursor-pointer"
          onClick={() =>
            deleteComment({ commentId: commentId as Id<"comment"> })
          }>
          <IconTrash size={16} className="mr-2" />
          Delete
        </DropdownMenuItem>
        <DropdownMenuItem className="text-neutral-600 focus:bg-neutral-50 rounded-lg cursor-pointer">
          <IconExclamationCircle size={16} className="mr-2" />
          Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
