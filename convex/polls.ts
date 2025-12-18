import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

export const createPoll = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    options: v.array(v.string()),
    expiresAt: v.number(),
    themeColor: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const user = await getCurrentUser(ctx);
    if (user?._id == null) throw new Error("Please sign in to create a poll");

    // Validate title
    const trimmedTitle = args.title.trim();
    if (!trimmedTitle) {
      throw new Error("Poll title is required");
    }
    if (trimmedTitle.length > 200) {
      throw new Error("Poll title is too long (max 200 characters)");
    }

    // Validate description
    if (args.description && args.description.length > 1000) {
      throw new Error("Poll description is too long (max 1000 characters)");
    }

    // Validate options
    if (args.options.length < 2) {
      throw new Error("At least 2 options are required");
    }

    if (args.options.length > 10) {
      throw new Error("Maximum 10 options allowed");
    }

    const trimmedOptions = args.options.map((opt) => opt.trim());
    if (trimmedOptions.some((opt) => !opt)) {
      throw new Error("Options cannot be empty");
    }

    if (trimmedOptions.some((opt) => opt.length > 200)) {
      throw new Error("Options are too long (max 200 characters)");
    }

    // Check for duplicate options
    const uniqueOptions = new Set(trimmedOptions);
    if (uniqueOptions.size !== trimmedOptions.length) {
      throw new Error("Duplicate options are not allowed");
    }

    // Validate expiration
    if (args.expiresAt <= Date.now()) {
      throw new Error("Poll expiration must be in the future");
    }

    // Create poll options
    const pollOptionIds: any[] = [];
    for (const optionText of trimmedOptions) {
      const optionId = await ctx.db.insert("pollOption", {
        text: optionText,
        votes: [],
      });
      pollOptionIds.push(optionId);
    }

    // Create poll
    const pollId = await ctx.db.insert("poll", {
      title: trimmedTitle,
      description: args.description?.trim(),
      creatorId: user._id,
      option: pollOptionIds,
      expiresAt: args.expiresAt,
      themeColor: args.themeColor || "#3b82f6",
    });

    return pollId;
  },
});

export const getPoll = query({
  args: {
    pollId: v.id("poll"),
  },
  async handler(ctx, args) {
    const poll = await ctx.db.get(args.pollId);
    if (!poll) {
      throw new Error("Poll not found");
    }

    // Fetch poll options with null filtering
    const pollOptions = (
      await Promise.all(poll.option.map((optId) => ctx.db.get(optId)))
    ).filter((opt) => opt !== null);

    // Fetch creator with fallback
    const creator = await ctx.db.get(poll.creatorId);

    return {
      ...poll,
      pollOptions,
      creator: creator || null,
    };
  },
});

export const deletePolls = mutation({
  args: {
    pollId: v.id("poll"),
  },
  async handler(ctx, args) {
    const user = await getCurrentUser(ctx);
    if (user?._id == null) throw new Error("Please sign in to delete polls");

    const poll = await ctx.db.get(args.pollId);
    if (!poll) {
      throw new Error("Poll not found");
    }

    if (poll.creatorId !== user._id) {
      throw new Error("Only the poll creator can delete this poll");
    }

    // Delete all poll options
    for (const optionId of poll.option) {
      await ctx.db.delete(optionId);
    }

    // Delete all comments
    const comments = await ctx.db
      .query("comment")
      .withIndex("by_poll", (q) => q.eq("pollId", args.pollId))
      .collect();
    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // Delete all reactions
    const reactions = await ctx.db
      .query("reaction")
      .withIndex("by_poll", (q) => q.eq("pollId", args.pollId))
      .collect();
    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }

    // Delete the poll itself
    await ctx.db.delete(args.pollId);

    return { success: true };
  },
});

export const listPolls = query({
  args: {},
  async handler(ctx) {
    const polls = await ctx.db
      .query("poll")
      .order("desc")
      .take(50);

    // Fetch options and creator for each poll
    const enrichedPolls = await Promise.all(
      polls.map(async (poll) => {
        const pollOptions = (
          await Promise.all(poll.option.map((optId) => ctx.db.get(optId)))
        ).filter((opt) => opt !== null);
        const creator = await ctx.db.get(poll.creatorId);

        return {
          ...poll,
          pollOptions,
          creator: creator || null,
        };
      })
    );

    return enrichedPolls;
  },
});

export const vote = mutation({
  args: {
    pollId: v.id("poll"),
    optionId: v.id("pollOption"),
  },
  async handler(ctx, args) {
    const user = await getCurrentUser(ctx);
    if (user?._id == null) throw new Error("Please sign in to vote");

    const poll = await ctx.db.get(args.pollId);
    if (!poll) {
      throw new Error("Poll not found");
    }

    if (poll.expiresAt < Date.now()) {
      throw new Error("This poll has expired and is no longer accepting votes");
    }

    // Verify option belongs to this poll
    if (!poll.option.includes(args.optionId)) {
      throw new Error("Invalid option for this poll");
    }

    const option = await ctx.db.get(args.optionId);
    if (!option) {
      throw new Error("Option not found");
    }

    if (option.votes.includes(user._id)) {
      throw new Error("You have already voted for this option");
    }

    // Remove user from other options if they voted before (atomic operation)
    for (const optionId of poll.option) {
      const opt = await ctx.db.get(optionId);
      if (opt && opt.votes.includes(user._id)) {
        await ctx.db.patch(optionId, {
          votes: opt.votes.filter((id) => id !== user._id),
        });
      }
    }

    // Add vote
    await ctx.db.patch(args.optionId, {
      votes: [...option.votes, user._id],
    });

    return { success: true };
  },
});

export const removeVote = mutation({
  args: {
    pollId: v.id("poll"),
  },
  async handler(ctx, args) {
    const user = await getCurrentUser(ctx);
    if (user?._id == null) throw new Error("Unauthorized");

    const poll = await ctx.db.get(args.pollId);
    if (!poll) {
      throw new Error("Poll not found");
    }

    // Remove user's vote from all options
    for (const optionId of poll.option) {
      const opt = await ctx.db.get(optionId);
      if (opt && opt.votes.includes(user._id)) {
        await ctx.db.patch(optionId, {
          votes: opt.votes.filter((id) => id !== user._id),
        });
      }
    }

    return { success: true };
  },
});

export const addReaction = mutation({
  args: {
    pollId: v.id("poll"),
    emoji: v.string(),
  },
  async handler(ctx, args) {
    const user = await getCurrentUser(ctx);
    if (user?._id == null) throw new Error("Please sign in to react");

    // Verify poll exists
    const poll = await ctx.db.get(args.pollId);
    if (!poll) {
      throw new Error("Poll not found");
    }

    // Check if user already added emoji reactions using index
    const existingReaction = await ctx.db
      .query("reaction")
      .withIndex("by_poll_and_user", (q) =>
        q.eq("pollId", args.pollId).eq("userId", user._id)
      )
      .first();

    if (existingReaction) {
      // Remove the reaction
      await ctx.db.delete(existingReaction._id);
      return { success: true, removed: true };
    }

    // Create reaction
    await ctx.db.insert("reaction", {
      pollId: args.pollId,
      emoji: args.emoji,
      userId: user._id,
    });

    return { success: true, removed: false };
  },
});

export const getPollReactions = query({
  args: {
    pollId: v.id("poll"),
  },
  async handler(ctx, args) {
    const reactions = await ctx.db
      .query("reaction")
      .withIndex("by_poll", (q) => q.eq("pollId", args.pollId))
      .collect();

    // Group reactions by emoji
    const grouped = reactions.reduce((acc: any, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = [];
      }
      acc[reaction.emoji].push(reaction.userId);
      return acc;
    }, {});

    return Object.entries(grouped).map(([emoji, userIds]: any) => ({
      emoji,
      count: userIds.length,
      userIds,
    }));
  },
});

export const addComment = mutation({
  args: {
    pollId: v.id("poll"),
    body: v.string(),
    authorName: v.optional(v.string()),
    parentId: v.optional(v.id("comment")),
  },
  async handler(ctx, args) {
    const user = await getCurrentUser(ctx);
    if (user?._id == null) throw new Error("Please sign in to comment");

    const trimmedBody = args.body.trim();
    if (!trimmedBody) {
      throw new Error("Comment cannot be empty");
    }

    if (trimmedBody.length > 2000) {
      throw new Error("Comment is too long (max 2000 characters)");
    }

    // Verify poll exists
    const poll = await ctx.db.get(args.pollId);
    if (!poll) {
      throw new Error("Poll not found");
    }

    // Verify parent comment exists if provided
    if (args.parentId) {
      const parentComment = await ctx.db.get(args.parentId);
      if (!parentComment) {
        throw new Error("Parent comment not found");
      }
      if (parentComment.pollId !== args.pollId) {
        throw new Error("Parent comment does not belong to this poll");
      }
    }

    // Create comment
    const commentId = await ctx.db.insert("comment", {
      pollId: args.pollId,
      authorId: user._id,
      authorName: args.authorName,
      body: trimmedBody,
      parentId: args.parentId,
    });

    return commentId;
  },
});

export const deleteComment = mutation({
  args: {
    commentId: v.id("comment"),
  },
  async handler(ctx, args) {
    const user = await getCurrentUser(ctx);
    if (user?._id == null) throw new Error("Unauthorized");

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    if (comment.authorId !== user._id) {
      throw new Error("You are not the author of this comment");
    }

    await ctx.db.delete(args.commentId);
  },
});

export const getPollComments = query({
  args: {
    pollId: v.id("poll"),
  },
  async handler(ctx, args) {
    const comments = await ctx.db
      .query("comment")
      .withIndex("by_poll", (q) => q.eq("pollId", args.pollId))
      .filter((q) => q.eq(q.field("parentId"), undefined))
      .collect();

    // Fetch author info and replies for each comment
    const enrichedComments = await Promise.all(
      comments.map(async (comment) => {
        const author = comment.authorId
          ? await ctx.db.get(comment.authorId)
          : null;

        // Fetch replies using index
        const replies = await ctx.db
          .query("comment")
          .withIndex("by_parent", (q) => q.eq("parentId", comment._id))
          .collect();

        const enrichedReplies = await Promise.all(
          replies.map(async (reply) => {
            const replyAuthor = reply.authorId
              ? await ctx.db.get(reply.authorId)
              : null;
            return {
              ...reply,
              author: replyAuthor,
            };
          })
        );

        return {
          ...comment,
          author,
          replies: enrichedReplies,
        };
      })
    );

    return enrichedComments.sort((a, b) => b._creationTime - a._creationTime);
  },
});
