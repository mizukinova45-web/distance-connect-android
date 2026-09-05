import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Generate a signed upload URL for file storage. */
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

/** Send a new message in a partnership. */
export const send = mutation({
  args: {
    partnershipId: v.id("partnerships"),
    content: v.string(),
    mediaUrl: v.optional(v.string()),
    mediaType: v.optional(v.union(v.literal("photo"), v.literal("video"), v.literal("file"))),
    mediaName: v.optional(v.string()),
  },
  handler: async (ctx, { partnershipId, content, mediaUrl, mediaType, mediaName }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const partnership = await ctx.db.get(partnershipId);
    if (!partnership) throw new Error("Partnership not found");
    if (partnership.partner1 !== userId && partnership.partner2 !== userId) {
      throw new Error("You are not part of this partnership");
    }

    return await ctx.db.insert("messages", {
      partnershipId,
      senderId: userId,
      content: content.trim(),
      timestamp: Date.now(),
      ...(mediaUrl ? { mediaUrl, mediaType, mediaName } : {}),
    });
  },
});

/** Get all messages in a partnership, ordered by timestamp. */
export const list = query({
  args: { partnershipId: v.id("partnerships") },
  handler: async (ctx, { partnershipId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const partnership = await ctx.db.get(partnershipId);
    if (!partnership) throw new Error("Partnership not found");
    if (partnership.partner1 !== userId && partnership.partner2 !== userId) {
      throw new Error("You are not part of this partnership");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_partnershipId", (q) =>
        q.eq("partnershipId", partnershipId),
      )
      .order("asc")
      .collect();

    return messages;
  },
});
