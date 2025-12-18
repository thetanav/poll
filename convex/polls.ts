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

    // Validate options
    if (args.options.length < 2) {
      throw new Error("At least 2 options are required");
    }

    if (args.options.some((opt) => !opt.trim())) {
      throw new Error("Options cannot be empty");
    }

    // Create poll options
    const pollOptionIds: any[] = [];
    for (const optionText of args.options) {
      const optionId = await ctx.db.insert("pollOption", {
        text: optionText,
        votes: [],
      });
      pollOptionIds.push(optionId);
    }

    // Create poll
    const pollId = await ctx.db.insert("poll", {
      title: args.title,
      description: args.description,
      creatorId: user?._id!,
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

    // Fetch poll options
    const pollOptions = await Promise.all(
      poll.option.map((optId) => ctx.db.get(optId))
    );

    // Fetch creator
    const creator = await ctx.db.get(poll.creatorId);

    return {
      ...poll,
      pollOptions,
      creator,
    };
  },
});

export const listPolls = query({
  args: {},
  async handler(ctx) {
    const polls = await ctx.db.query("poll").collect();

    // Fetch options and creator for each poll
    const enrichedPolls = await Promise.all(
      polls.map(async (poll) => {
        const pollOptions = await Promise.all(
          poll.option.map((optId) => ctx.db.get(optId))
        );
        const creator = await ctx.db.get(poll.creatorId);

        return {
          ...poll,
          pollOptions,
          creator,
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
    if (user?._id == null) throw new Error("Unauthorized");

    const poll = await ctx.db.get(args.pollId);
    if (!poll) {
      throw new Error("Poll not found");
    }

    if (poll.expiresAt < Date.now()) {
      throw new Error("Poll has expired");
    }

    const option = await ctx.db.get(args.optionId);
    if (!option) {
      throw new Error("Option not found");
    }

    if (option.votes.includes(user?._id!)) {
      throw new Error("You have already voted for this option");
    }

    // Remove user from other options if they voted before
    for (const optionId of poll.option) {
      const opt = await ctx.db.get(optionId);
      if (opt && opt.votes.includes(user?._id!)) {
        // Remove user from this option
        await ctx.db.patch(optionId, {
          votes: opt.votes.filter((id) => id !== user?._id!),
        });
      }
    }

    // Add vote
    await ctx.db.patch(args.optionId, {
      votes: [...option.votes, user?._id!],
    });

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
    if (user?._id == null) throw new Error("Unauthorized");

    // Check if user already added emoji reactions
    const existingReaction = await ctx.db
      .query("reaction")
      .filter((q) => q.eq(q.field("pollId"), args.pollId))
      .filter((q) => q.eq(q.field("userId"), user._id))
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
      .filter((q) => q.eq(q.field("pollId"), args.pollId))
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
    if (user?._id == null) throw new Error("Unauthorized");

    if (!args.body.trim()) {
      throw new Error("Comment cannot be empty");
    }

    // Create comment
    const commentId = await ctx.db.insert("comment", {
      pollId: args.pollId,
      authorId: user._id,
      authorName: args.authorName,
      body: args.body,
      parentId: args.parentId,
    });

    return commentId;
  },
});

export const getPollComments = query({
  args: {
    pollId: v.id("poll"),
  },
  async handler(ctx, args) {
    const comments = await ctx.db
      .query("comment")
      .filter((q) => q.eq(q.field("pollId"), args.pollId))
      .filter((q) => q.eq(q.field("parentId"), undefined))
      .collect();

    // Fetch author info and replies for each comment
    const enrichedComments = await Promise.all(
      comments.map(async (comment) => {
        const author = comment.authorId
          ? await ctx.db.get(comment.authorId)
          : null;

        // Fetch replies
        const replies = await ctx.db
          .query("comment")
          .filter((q) => q.eq(q.field("parentId"), comment._id))
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
