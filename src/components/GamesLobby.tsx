import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Crown, Circle, CircleDot, Sparkles, Scissors, Brain, Type, HelpCircle, Bomb, Hash } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { useLanguage } from "@/contexts/LanguageContext";

interface GamesLobbyProps {
  partnershipId: Id<"partnerships">;
  currentUserId: Id<"users">;
  partnerName: string;
  onBack: () => void;
  onStartGame: (gameId: Id<"games">) => void;
}

type GameType = "chess" | "tictactoe" | "connect4" | "rps" | "memory" | "wordscramble" | "wyr" | "trivia" | "minesweeper" | "guessnumber";

const GAMES: { id: GameType; name: string; description: string; icon: typeof Crown; category: string }[] = [
  {
    id: "chess",
    name: "Chess",
    description: "The classic strategy game. Think ahead, outplay your partner.",
    icon: Crown,
    category: "Classic",
  },
  {
    id: "tictactoe",
    name: "Tic Tac Toe",
    description: "Quick rounds of X's and O's. Simple, competitive, fun.",
    icon: Circle,
    category: "Classic",
  },
  {
    id: "connect4",
    name: "Connect Four",
    description: "Drop your pieces, connect four in a row to win.",
    icon: CircleDot,
    category: "Classic",
  },
  {
    id: "rps",
    name: "Rock Paper Scissors",
    description: "Best of rounds — test your luck and read your partner.",
    icon: Scissors,
    category: "Couple",
  },
  {
    id: "wyr",
    name: "Would You Rather",
    description: "Answer, then see if you think alike. How compatible are you?",
    icon: HelpCircle,
    category: "Couple",
  },
  {
    id: "trivia",
    name: "Trivia Quiz",
    description: "Take turns answering fun knowledge questions.",
    icon: Sparkles,
    category: "Couple",
  },
  {
    id: "guessnumber",
    name: "Guess the Number",
    description: "One picks 1–100, the other guesses with higher/lower hints.",
    icon: Hash,
    category: "Couple",
  },
  {
    id: "memory",
    name: "Memory Match",
    description: "Find matching pairs on a 4×4 grid. Train your memory!",
    icon: Brain,
    category: "Puzzle",
  },
  {
    id: "wordscramble",
    name: "Word Scramble",
    description: "Unscramble love-themed words before time runs out.",
    icon: Type,
    category: "Puzzle",
  },
  {
    id: "minesweeper",
    name: "Minesweeper",
    description: "Avoid the mines, reveal the safe squares.",
    icon: Bomb,
    category: "Puzzle",
  },
];

const GAME_TYPE_LABELS: Record<string, string> = {
  chess: "Chess",
  tictactoe: "Tic Tac Toe",
  connect4: "Connect Four",
  rps: "Rock Paper Scissors",
  memory: "Memory Match",
  wordscramble: "Word Scramble",
  wyr: "Would You Rather",
  trivia: "Trivia Quiz",
  minesweeper: "Minesweeper",
  guessnumber: "Guess the Number",
};

export function GamesLobby({
  partnershipId,
  currentUserId,
  partnerName,
  onBack,
  onStartGame,
}: GamesLobbyProps) {
  const [creating, setCreating] = useState<string | null>(null);
  const createGame = useMutation(api.games.create);
  const games = useQuery(api.games.listByPartnership, { partnershipId });

  const activeGames = games?.filter((g) => g.status === "active") ?? [];
  const completedGames = games?.filter((g) => g.status !== "active") ?? [];

  const { t } = useLanguage();
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const categories = ["All", ...Array.from(new Set(GAMES.map((g) => g.category)))];
  const filteredGames = categoryFilter === "All" ? GAMES : GAMES.filter((g) => g.category === categoryFilter);

  const handleCreateGame = async (gameType: GameType) => {
    setCreating(gameType);
    try {
      const game = await createGame({ partnershipId, gameType });
      onStartGame(game);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create game");
    }
    setCreating(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf2f8]">
      {/* Header */}
      <header className="flex items-center gap-4 px-5 py-3.5 bg-white border-b border-pink-100 shrink-0 shadow-sm">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-pink-400 hover:text-pink-500 hover:bg-pink-50" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <p className="text-sm font-semibold text-[#3f3043]">{t("gamesTitle")}</p>
          <p className="text-xs text-pink-400">{t("playTogether")} {partnerName}</p>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="max-w-lg mx-auto px-6 pt-6 pb-32">
          {/* Active games */}
          {activeGames.length > 0 && (
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                Active games
              </p>
              <div className="space-y-2">
                {activeGames.map((game) => (
                  <button
                    key={game._id}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-pink-50 shadow-sm hover:shadow-md transition-shadow text-left"
                    onClick={() => onStartGame(game._id)}
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {GAME_TYPE_LABELS[game.gameType]}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {game.currentTurn === currentUserId
                          ? t("yourTurn")
                          : `${partnerName}${t("partnersTurn")}`}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">→</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category tabs */}
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
              {t("startNewGame")}
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    categoryFilter === cat
                      ? "bg-gradient-to-r from-pink-400 to-fuchsia-400 text-white shadow-sm shadow-pink-200/30"
                      : "bg-white text-gray-500 border border-pink-100 hover:bg-pink-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Game list */}
          <div className="space-y-2">
            {filteredGames.map((game) => (
              <button
                key={game.id}
                className="w-full flex items-center gap-4 px-4 py-4 bg-white rounded-2xl border border-pink-50 shadow-sm hover:shadow-md transition-shadow text-left"
                onClick={() => handleCreateGame(game.id)}
                disabled={creating !== null}
              >
                <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center shrink-0">
                  <game.icon className="w-4 h-4 text-pink-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#3f3043]">{game.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {game.description}
                  </p>
                </div>                  {creating === game.id ? (
                    <span className="text-xs text-pink-400 animate-pulse font-medium">
                      {t("creating")}
                    </span>
                  ) : (
                    <span className="text-xs text-pink-300 font-medium shrink-0">{t("play")}</span>
                )}
              </button>
            ))}
          </div>

          {/* Completed games */}
          {completedGames.length > 0 && (
            <div className="mt-10">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                {t("completed")}
              </p>
              <div className="space-y-1">
                {completedGames.map((game) => (
                  <div
                    key={game._id}
                    className="flex items-center justify-between px-4 py-2.5 text-sm"
                  >
                    <span className="text-muted-foreground">
                      {GAME_TYPE_LABELS[game.gameType]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {game.status === "won"
                        ? game.winner === currentUserId
                          ? t("youWon")
                          : `${partnerName} ${t("partnerWon")}`
                        : t("draw")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {games && games.length === 0 && (
            <div className="text-center py-16">
              <p className="text-sm text-muted-foreground">
                {t("noGames")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
