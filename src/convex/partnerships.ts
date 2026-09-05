import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function generatePairingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/** Create a new partnership with a pairing code. */
export const create = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("partnerships")
      .withIndex("by_partner1", (q) => q.eq("partner1", userId))
      .first();

    if (existing) throw new Error("You are already part of a partnership");

    const partnershipId = await ctx.db.insert("partnerships", {
      partner1: userId,
      pairingCode: generatePairingCode(),
      createdAt: Date.now(),
    });

    return await ctx.db.get(partnershipId);
  },
});

/** Join an existing partnership using a pairing code. */
export const join = mutation({
  args: { pairingCode: v.string() },
  handler: async (ctx, { pairingCode }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const partnership = await ctx.db
      .query("partnerships")
      .withIndex("by_pairingCode", (q) => q.eq("pairingCode", pairingCode))
      .first();

    if (!partnership) throw new Error("Invalid pairing code");
    if (partnership.partner2) throw new Error("This couple is already paired");
    if (partnership.partner1 === userId) {
      throw new Error("You can't pair with yourself");
    }

    await ctx.db.patch(partnership._id, { partner2: userId });
    return await ctx.db.get(partnership._id);
  },
});

/** Get the current user's partnership (if any). */
export const getMyPartnership = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const asPartner1 = await ctx.db
      .query("partnerships")
      .withIndex("by_partner1", (q) => q.eq("partner1", userId))
      .first();

    if (asPartner1) return asPartner1;

    const asPartner2 = await ctx.db
      .query("partnerships")
      .withIndex("by_partner2", (q) => q.eq("partner2", userId))
      .first();

    return asPartner2 ?? null;
  },
});

/** Get the partner user (the other user in the partnership). */
export const getPartnerInfo = query({
  args: { partnershipId: v.id("partnerships") },
  handler: async (ctx, { partnershipId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const partnership = await ctx.db.get(partnershipId);
    if (!partnership) return null;

    const partnerId =
      partnership.partner1 === userId
        ? partnership.partner2
        : partnership.partner1;

    if (!partnerId) return null;
    return await ctx.db.get(partnerId);
  },
});
