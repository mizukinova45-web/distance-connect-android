import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Couple partnerships – links two users together
    partnerships: defineTable({
      partner1: v.id("users"),
      partner2: v.optional(v.id("users")),
      pairingCode: v.string(),
      createdAt: v.number(),
    })
      .index("by_pairingCode", ["pairingCode"])
      .index("by_partner1", ["partner1"])
      .index("by_partner2", ["partner2"]),

    // Messages between paired partners
    messages: defineTable({
      partnershipId: v.id("partnerships"),
      senderId: v.id("users"),
      content: v.string(),
      timestamp: v.number(),
      mediaUrl: v.optional(v.string()),
      mediaType: v.optional(v.union(v.literal("photo"), v.literal("video"), v.literal("file"))),
      mediaName: v.optional(v.string()),
    })
      .index("by_partnershipId", ["partnershipId"]),

    // Shared memories (photos & videos) between partners
    memories: defineTable({
      partnershipId: v.id("partnerships"),
      userId: v.id("users"),
      type: v.union(v.literal("photo"), v.literal("video")),
      storageId: v.string(),
      caption: v.optional(v.string()),
      timestamp: v.number(),
    })
      .index("by_partnershipId", ["partnershipId"]),

    // Games between paired partners
    games: defineTable({
      partnershipId: v.id("partnerships"),
      gameType: v.union(
        v.literal("chess"),
        v.literal("tictactoe"),
        v.literal("connect4"),
        v.literal("rps"),
        v.literal("memory"),
        v.literal("wordscramble"),
        v.literal("wyr"),
        v.literal("trivia"),
        v.literal("minesweeper"),
        v.literal("guessnumber"),
      ),
      player1: v.id("users"),
      player2: v.id("users"),
      currentTurn: v.id("users"),
      gameState: v.string(),
      status: v.union(
        v.literal("active"),
        v.literal("won"),
        v.literal("draw"),
      ),
      winner: v.optional(v.id("users")),
      moves: v.string(),
      createdAt: v.number(),
    })
      .index("by_partnershipId", ["partnershipId"])
  },
  {
    schemaValidation: false,
  },
);

export default schema;
