import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Get all games for the current user's partnership. */
export const listByPartnership = query({
  args: { partnershipId: v.id("partnerships") },
  handler: async (ctx, { partnershipId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const partnership = await ctx.db.get(partnershipId);
    if (!partnership) throw new Error("Partnership not found");
    if (partnership.partner1 !== userId && partnership.partner2 !== userId) {
      throw new Error("Not your partnership");
    }

    return await ctx.db
      .query("games")
      .withIndex("by_partnershipId", (q) =>
        q.eq("partnershipId", partnershipId),
      )
      .order("desc")
      .collect();
  },
});

/** Get a single game by ID. */
export const get = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    return await ctx.db.get(gameId);
  },
});

/** Create a new game. */
export const create = mutation({
  args: {
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
  },
  handler: async (ctx, { partnershipId, gameType }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const partnership = await ctx.db.get(partnershipId);
    if (!partnership) throw new Error("Partnership not found");
    if (!partnership.partner2) throw new Error("Partners not yet paired");
    if (partnership.partner1 !== userId && partnership.partner2 !== userId) {
      throw new Error("Not your partnership");
    }

    let gameState: string;
    // Always let the creator go first so they can start playing immediately
    const currentTurn = userId;

    switch (gameType) {
      case "chess":
        gameState = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        break;
      case "tictactoe":
        gameState = JSON.stringify(Array(9).fill(null));
        break;
      case "connect4": {
        const board = Array.from({ length: 6 }, () => Array(7).fill(null));
        gameState = JSON.stringify(board);
        break;
      }
      case "rps":
        gameState = JSON.stringify({ p1Choice: null, p2Choice: null, revealed: false, round: 1, score: { p1: 0, p2: 0 } });
        break;
      case "memory": {
        const symbols = ["\u2665", "\u2666", "\u2660", "\u2663", "\u2605", "\u263E"];
        const pairs = [...symbols, ...symbols];
        for (let i = pairs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
        }
        gameState = JSON.stringify({ cards: pairs.map((s, i) => ({ id: i, symbol: s, flipped: false, matched: false })), flippedIds: [], p1Score: 0, p2Score: 0, lastMatchedBy: null });
        break;
      }
      case "wordscramble": {
        const words = ["love", "heart", "kiss", "baby", "sweet", "darling", "forever", "together", "romance", "passion", "dream", "smile", "hug", "trust", "soul"];
        const shuffled = [...words].sort(() => Math.random() - 0.5).slice(0, 10);
        gameState = JSON.stringify({ words: shuffled, currentIndex: 0, score: { p1: 0, p2: 0 }, answered: [] });
        break;
      }
      case "wyr": {
        const questions = [
          { o1: "Always be late", o2: "Always be underdressed" },
          { o1: "Never use social media again", o2: "Never watch a movie again" },
          { o1: "Live without music", o2: "Live without movies" },
          { o1: "Always say what you think", o2: "Always stay silent" },
          { o1: "Travel the world for free", o2: "Have a dream job for life" },
          { o1: "Be able to fly", o2: "Be able to read minds" },
          { o1: "Never age mentally", o2: "Never age physically" },
          { o1: "Always be too hot", o2: "Always be too cold" },
          { o1: "Live in the mountains", o2: "Live by the sea" },
          { o1: "Only eat sweet food", o2: "Only eat savory food" },
          { o1: "Have unlimited money", o2: "Have unlimited time" },
          { o1: "Be famous forever", o2: "Be unknown forever" },
          { o1: "Relive yesterday", o2: "Fast forward 1 year" },
          { o1: "Be able to teleport", o2: "Be able to time travel" },
          { o1: "Speak all languages", o2: "Play all instruments" },
        ];
        const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, 10);
        gameState = JSON.stringify({ questions: shuffled, currentIndex: 0, p1Answer: null, p2Answer: null, revealed: false, matches: 0, total: shuffled.length });
        break;
      }
      case "trivia": {
        const questions = [
          { q: "What year did we first meet?", a1: "2020", a2: "2021", a3: "2022", correct: 1 },
          { q: "What is the capital of France?", a1: "London", a2: "Paris", a3: "Berlin", correct: 2 },
          { q: "How many days in a leap year?", a1: "365", a2: "366", a3: "364", correct: 2 },
          { q: "What color do you get mixing red and blue?", a1: "Green", a2: "Purple", a3: "Orange", correct: 2 },
          { q: "What planet is closest to the Sun?", a1: "Venus", a2: "Earth", a3: "Mercury", correct: 3 },
          { q: "What is 7 × 8?", a1: "54", a2: "56", a3: "48", correct: 2 },
          { q: "Which ocean is the largest?", a1: "Atlantic", a2: "Indian", a3: "Pacific", correct: 3 },
          { q: "What gas do plants absorb?", a1: "Oxygen", a2: "Nitrogen", a3: "Carbon dioxide", correct: 3 },
          { q: "How many continents are there?", a1: "5", a2: "7", a3: "6", correct: 2 },
          { q: "What is the freezing point of water in Celsius?", a1: "0", a2: "32", a3: "100", correct: 1 },
        ];
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        gameState = JSON.stringify({ questions: shuffled, currentIndex: 0, score: { p1: 0, p2: 0 }, currentAnswerer: "p1" });
        break;
      }
      case "minesweeper": {
        const size = 8;
        const mineCount = 8;
        const board = Array.from({ length: size }, () =>
          Array.from({ length: size }, () => ({ mine: false, revealed: false, adjacent: 0 }))
        );
        let placed = 0;
        while (placed < mineCount) {
          const r = Math.floor(Math.random() * size);
          const c = Math.floor(Math.random() * size);
          if (!board[r][c].mine) {
            board[r][c].mine = true;
            placed++;
          }
        }
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            if (board[r][c].mine) continue;
            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr][nc].mine) count++;
              }
            }
            board[r][c].adjacent = count;
          }
        }
        gameState = JSON.stringify({ board, size, mineCount, revealedSafe: 0, totalSafe: size * size - mineCount });
        break;
      }
      case "guessnumber": {
        const secret = Math.floor(Math.random() * 100) + 1;
        gameState = JSON.stringify({ secret, guesses: [], range: [1, 100], gameOver: false, winner: null });
        break;
      }
    }

    // Creator is always player1 (white in chess, X in tictactoe, P1 in connect4)
    const otherPlayer = userId === partnership.partner1 ? partnership.partner2! : partnership.partner1;

    return await ctx.db.insert("games", {
      partnershipId,
      gameType,
      player1: userId,
      player2: otherPlayer,
      currentTurn: currentTurn as any,
      gameState,
      status: "active",
      moves: "[]",
      createdAt: Date.now(),
    });
  },
});

/** Make a move in a game. Frontend validates; backend saves. */
export const makeMove = mutation({
  args: {
    gameId: v.id("games"),
    gameState: v.string(),
    nextTurn: v.id("users"),
    status: v.union(
      v.literal("active"),
      v.literal("won"),
      v.literal("draw"),
    ),
    winner: v.optional(v.id("users")),
    move: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "active") throw new Error("Game is over");
    if (game.currentTurn !== userId) throw new Error("Not your turn");
    if (game.player1 !== userId && game.player2 !== userId) {
      throw new Error("Not in this game");
    }

    const moves = JSON.parse(game.moves) as string[];
    moves.push(args.move);

    await ctx.db.patch(args.gameId, {
      gameState: args.gameState,
      currentTurn: args.nextTurn,
      status: args.status,
      winner: args.winner,
      moves: JSON.stringify(moves),
    });

    return await ctx.db.get(args.gameId);
  },
});
