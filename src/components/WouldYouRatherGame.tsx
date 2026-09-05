import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

interface WyrGameProps {
  game: {
    _id: Id<"games">; player1: Id<"users">; player2: Id<"users">;
    currentTurn: Id<"users">; gameState: string;
    status: "active" | "won" | "draw"; winner?: Id<"users">; moves: string;
  };
  currentUserId: Id<"users">; partnerName: string; onBack: () => void;
}

interface GameState {
  questions: { o1: string; o2: string }[];
  currentIndex: number;
  p1Answer: number | null;
  p2Answer: number | null;
  revealed: boolean;
  matches: number;
  total: number;
}

export function WouldYouRatherGame({ game, currentUserId, partnerName, onBack }: WyrGameProps) {
  const makeMove = useMutation(api.games.makeMove);
  const [state, setState] = useState<GameState>(() => JSON.parse(game.gameState));
  const [pending, setPending] = useState(false);

  useEffect(() => { setState(JSON.parse(game.gameState)); }, [game.gameState]);

  const isP1 = game.player1 === currentUserId;
  const isMyTurn = game.currentTurn === currentUserId;
  const myAnswer = isP1 ? state.p1Answer : state.p2Answer;
  const theirAnswer = isP1 ? state.p2Answer : state.p1Answer;
  const question = state.questions[state.currentIndex];
  const isGameOver = state.currentIndex >= state.total;
  const isRevealed = state.revealed;

  const handleAnswer = async (answer: number) => {
    if (pending || myAnswer !== null || isGameOver) return;
    setPending(true);
    const ns = { ...state };
    if (isP1) ns.p1Answer = answer; else ns.p2Answer = answer;

    // Both answered → reveal
    if (ns.p1Answer !== null && ns.p2Answer !== null) {
      ns.revealed = true;
      if (ns.p1Answer === ns.p2Answer) ns.matches++;
    }

    const nextTurn = isP1 ? game.player2 : game.player1;
    try {
      await makeMove({ gameId: game._id, gameState: JSON.stringify(ns), nextTurn, status: game.status, move: `wyr:${answer}` });
    } catch { toast.error("Failed"); }
    setPending(false);
  };

  const nextQuestion = async () => {
    if (!isMyTurn || pending) return;
    setPending(true);
    const ns = { ...state, currentIndex: state.currentIndex + 1, p1Answer: null, p2Answer: null, revealed: false };

    let status: "active" | "won" | "draw" = "active";
    if (ns.currentIndex >= state.total) {
      // Game over based on who answered more consistently
      if (ns.matches > Math.floor(state.total / 2)) status = "draw"; // Both matched a lot
      status = "draw"; // WYR doesn't really have a winner — it's about compatibility
    }

    try {
      await makeMove({ gameId: game._id, gameState: JSON.stringify(ns), nextTurn: isP1 ? game.player2 : game.player1, status, move: "wyr:next" });
    } catch { toast.error("Failed"); }
    setPending(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf2f8]">
      <header className="flex items-center gap-4 px-5 py-3.5 bg-white border-b border-pink-100 shrink-0 shadow-sm">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-pink-400 hover:text-pink-500 hover:bg-pink-50" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#3f3043]">Would You Rather</p>
          <p className="text-xs text-pink-400">Question {Math.min(state.currentIndex + 1, state.total)}/{state.total} • {state.matches} matches 💕</p>
        </div>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        {!isGameOver && question ? (
          <>
            <p className="text-sm text-pink-400 text-center font-medium">Would you rather...</p>
            <div className="w-full max-w-sm space-y-3">
              {[question.o1, question.o2].map((opt, i) => {
                const isSelected = myAnswer === i;
                const theirPick = theirAnswer === i && isRevealed;
                const bothPicked = isRevealed && myAnswer === theirAnswer && myAnswer === i;
                return (
                  <button key={i} onClick={() => handleAnswer(i)} disabled={pending || myAnswer !== null || isGameOver}
                    className={`w-full py-4 px-5 rounded-2xl border-2 text-sm font-medium transition-all duration-200 text-left
                      ${isSelected ? "border-pink-400 bg-pink-50 shadow-md" : "border-pink-100 bg-white hover:border-pink-200 hover:shadow-sm"}
                      ${bothPicked ? "!border-green-300 !bg-green-50" : ""}`}>
                    <span>{opt}</span>
                    {isRevealed && (
                      <span className="block text-xs mt-1 text-pink-300">
                        {bothPicked ? "💕 You both chose this!" : theirPick ? `${partnerName} chose this` : ""}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {isRevealed && isMyTurn && (
              <Button className="h-10 text-sm rounded-xl glowup-gradient text-white border-0" onClick={nextQuestion} disabled={pending}>
                Next Question →
              </Button>
            )}
            {!isRevealed && myAnswer !== null && (
              <p className="text-xs text-pink-300 animate-pulse">Waiting for {partnerName} to answer...</p>
            )}
            {!isMyTurn && myAnswer === null && (
              <p className="text-xs text-pink-300 animate-pulse">Waiting for {partnerName} to answer...</p>
            )}
          </>
        ) : (
          <div className="text-center px-6 py-4 bg-white rounded-2xl border border-pink-100 shadow-sm">
            <p className="text-3xl mb-3">💕</p>
            <p className="text-lg font-semibold text-[#3f3043]">Game Complete!</p>
            <p className="text-sm text-pink-400 mt-1">You matched on {state.matches} out of {state.total} questions</p>
            <p className="text-sm text-pink-300 mt-0.5">
              {state.matches >= 7 ? "Perfect match! 🥰" : state.matches >= 5 ? "Great compatibility! 💕" : "So different, yet so perfect! 💖"}
            </p>
            <Button variant="ghost" className="mt-3 text-sm text-pink-400" onClick={onBack}>← Back to games</Button>
          </div>
        )}
      </div>
    </div>
  );
}
