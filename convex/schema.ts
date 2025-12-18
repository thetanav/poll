// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    email: v.optional(v.string()),
  }).index("by_clerkId", ["clerkId"]),

  polls: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    creatorId: v.id("users"),
    isMultipleChoice: v.boolean(),
    expiresAt: v.optional(v.number()),
    isClosed: v.boolean(),
    themeColor: v.optional(v.string()),
  }),
});
