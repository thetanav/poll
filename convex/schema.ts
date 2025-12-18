// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  user: defineTable({
    clerkId: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    email: v.optional(v.string()),
  }).index("by_clerkId", ["clerkId"]),

  poll: defineTable({
    pollId: v.id("poll"),
    title: v.string(),
    description: v.optional(v.string()),
    creatorId: v.id("user"),
    option: v.array(v.id("pollOption")),
    expiresAt: v.number(),
    themeColor: v.optional(v.string()),
  }),

  pollOption: defineTable({
    optionId: v.id("option"),
    option: v.string(),
    votes: v.array(v.id("user")),
  }),

  vote: defineTable({
    voteId: v.id("vote"),
    pollId: v.id("poll"),
    userId: v.id("user"),
  }),

  comment: defineTable({
    pollId: v.id("poll"),
    authorId: v.optional(v.id("user")), // null for anon (or guest name)
    authorName: v.optional(v.string()), // Display name for anon
    body: v.string(),
    parentId: v.optional(v.id("comment")), // For replies
  }),

  reaction: defineTable({
    pollId: v.optional(v.id("poll")),
    emoji: v.string(),
    userId: v.optional(v.id("user")),
  }),
});
