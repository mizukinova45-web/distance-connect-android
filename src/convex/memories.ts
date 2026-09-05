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

/** List all memories for a partnership, newest first. */
export const list = query({
  args: { partnershipId: v.id("partnerships") },
  handler: async (ctx, { partnershipId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const partnership = await ctx.db.get(partnershipId);
    if (!partnership) throw new Error("Partnership not found");
    if (partnership.partner1 !== userId && partnership.partner2 !== userId) {
      throw new Error("Not your partnership");
    }

    const memories = await ctx.db
      .query("memories")
      .withIndex("by_partnershipId", (q) =>
        q.eq("partnershipId", partnershipId),
      )
      .order("desc")
      .collect();

    // Resolve storage URLs for each memory
    const memoriesWithUrls = await Promise.all(
      memories.map(async (memory) => {
        let url: string | null = null;
        try {
          url = await ctx.storage.getUrl(memory.storageId);
        } catch {
          // File may have been deleted
        }
        return { ...memory, url };
      }),
    );

    return memoriesWithUrls.filter((m) => m.url !== null);
  },
});

/** Add a new memory (photo or video). */
export const add = mutation({
  args: {
    partnershipId: v.id("partnerships"),
    storageId: v.string(),
    type: v.union(v.literal("photo"), v.literal("video")),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, { partnershipId, storageId, type, caption }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const partnership = await ctx.db.get(partnershipId);
    if (!partnership) throw new Error("Partnership not found");
    if (partnership.partner1 !== userId && partnership.partner2 !== userId) {
      throw new Error("Not your partnership");
    }

    return await ctx.db.insert("memories", {
      partnershipId,
      userId,
      type,
      storageId,
      caption: caption?.trim() || undefined,
      timestamp: Date.now(),
    });
  },
});

/** Remove a memory (only the uploader or their partner can delete). */
export const remove = mutation({
  args: { memoryId: v.id("memories") },
  handler: async (ctx, { memoryId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const memory = await ctx.db.get(memoryId);
    if (!memory) throw new Error("Memory not found");

    const partnership = await ctx.db.get(memory.partnershipId);
    if (!partnership) throw new Error("Partnership not found");
    if (partnership.partner1 !== userId && partnership.partner2 !== userId) {
      throw new Error("Not your partnership");
    }

    // Delete the file from storage
    try {
      await ctx.storage.delete(memory.storageId);
    } catch {
      // File may already be deleted
    }

    await ctx.db.delete(memoryId);
  },
});
