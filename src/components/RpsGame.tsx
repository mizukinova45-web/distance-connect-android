import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

interface RpsGameProps {
  game: {
    _id: Id<"games">;
    player1: Id<"users">;
    player2: Id<"users">;
    currentTurn: Id<"users">;
    gameState: string;
    status: "active" | "won" | "draw";
    winner?: Id<"users">;
    moves: string;
  };
  currentUserId: Id<"users">;
  partnerName: string;
  onBack: () => void;
}

const CHOICES = [
  { id: "rock" as const, emoji: "🪨", label: "Rock" },
  { id: "paper" as const, emoji: "📄", label: "Paper" },
  { id: "scissors" as const, emoji: "✂️", label: "Scissors" },
];

type Choice = "rock" | "paper" | "scissors" | null;

function getWinner(a: Choice, b: Choice): "p1" | "p2" | "draw" {
  if (a === b) return "draw";
  if ((a === "rock" && b === "scissors") || (a === "scissors" && b === "paper") || (a === "paper" && b === "rock")) return "p1";
  return "p2";
}

export function RpsGame({ game, currentUserId, partnerName, onBack }: RpsGameProps) {
  const makeMove = useMutation(api.games.makeMove);
  const [state, setState] = useState(() => JSON.parse(game.gameState) as {
    p1Choice: Choice; p2Choice: Choice; revealed: boolean; round: number; score: { p1: number; p2: number };
  });
  const [pending, setPending] = useState(false);

  useEffect(() => { setState(JSON.parse(game.gameState)); }, [game.gameState]);

  const isP1 = game.player1 === currentUserId;
  const myChoice = isP1 ? state.p1Choice : state.p2Choice;
  const theirChoice = isP1 ? state.p2Choice : state.p1Choice;
  const isMyTurn = game.currentTurn === currentUserId;

  const handleChoose = async (choice: Choice) => {
    if (!isMyTurn || pending || game.status !== "active") return;
    setPending(true);
    const newState = { ...state };
    if (isP1) newState.p1Choice = choice; else newState.p2Choice = choice;
    if (newState.p1Choice && newState.p2Choice) {
      newState.revealed = true;
      const w = getWinner(newState.p1Choice, newState.p2Choice);
      if (w === "p1") newState.score = { ...newState.score, p1: newState.score.p1 + 1 };
      if (w === "p2") newState.score = { ...newState.score, p2: newState.score.p2 + 1 };
    }
    try {
      await makeMove({ gameId: game._id, gameState: JSON.stringify(newState), nextTurn: isP1 ? game.player2 : game.player1, status: game.status, move: `rps:${choice}` });
    } catch { toast.error("Failed to send choice"); }
    setPending(false);
  };

  const nextRound = async () => {
    if (!isMyTurn || pending) return;
    setPending(true);
    const ns = { ...state, p1Choice: null, p2Choice: null, revealed: false, round: state.round + 1 };
    try {
      await makeMove({ gameId: game._id, gameState: JSON.stringify(ns), nextTurn: isP1 ? game.player2 : game.player1, status: game.status, move: "rps:next" });
    } catch { toast.error("Failed"); }
    setPending(false);
  };

  const emoji = (c: Choice) => c === "rock" ? "🪨" : c === "paper" ? "📄" : "✂️";
  const resultText = () => {
    if (!state.revealed || !myChoice || !theirChoice) return "";
    const w = getWinner(myChoice, theirChoice);
    if (w === "draw") return "It's a tie!";
    if ((w === "p1" && isP1) || (w === "p2" && !isP1)) return "You win this round! 🎉";
    return `${partnerName} wins!`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf2f8]">
      <header className="flex items-center gap-4 px-5 py-3.5 bg-white border-b border-pink-100 shrink-0 shadow-sm">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-pink-400 hover:text-pink-500 hover:bg-pink-50" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#3f3043]">Rock Paper Scissors</p>
          <p className="text-xs text-pink-400">Round {state.round} • You {isP1 ? state.score.p1 : state.score.p2} – {isP1 ? state.score.p2 : state.score.p1} {partnerName}</p>
        </div>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        <div className="flex items-center gap-8">
          <div className="text-center"><p className="text-xs text-pink-400">You</p><p className="text-3xl font-bold text-[#3f3043]">{isP1 ? state.score.p1 : state.score.p2}</p></div>
          <div className="w-px h-10 bg-pink-100" />
          <div className="text-center"><p className="text-xs text-pink-400">{partnerName}</p><p className="text-3xl font-bold text-[#3f3043]">{isP1 ? state.score.p2 : state.score.p1}</p></div>
        </div>
        {state.revealed ? (
          <div className="text-center">
            <div className="flex items-center justify-center gap-6 mb-4">
              <div className="text-center"><p className="text-xs text-pink-400 mb-1">You</p><span className="text-5xl">{emoji(myChoice)}</span></div>
              <span className="text-2xl text-pink-300">vs</span>
              <div className="text-center"><p className="text-xs text-pink-400 mb-1">{partnerName}</p><span className="text-5xl">{emoji(theirChoice)}</span></div>
            </div>
            <p className="text-lg font-semibold text-[#3f3043]">{resultText()}</p>
            {isMyTurn && <Button className="mt-4 h-10 text-sm rounded-xl glowup-gradient text-white border-0" onClick={nextRound} disabled={pending}>Next Round →</Button>}
          </div>
        ) : !isMyTurn ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center mx-auto mb-4 animate-pulse"><span className="text-3xl">🤔</span></div>
            <p className="text-sm text-pink-400">Waiting for {partnerName}...</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-pink-400 text-center mb-6 font-medium">Choose your weapon!</p>
            <div className="flex gap-4">
              {CHOICES.map((c) => (
                <button key={c.id} onClick={() => handleChoose(c.id)} disabled={pending}
                  className={`flex flex-col items-center gap-2 w-24 h-28 rounded-2xl border-2 transition-all duration-200 active:scale-95 ${myChoice === c.id ? "border-pink-400 bg-pink-50 shadow-md" : "border-pink-100 bg-white hover:border-pink-200 hover:shadow-sm"}`}>
                  <span className="text-4xl">{c.emoji}</span>
                  <span className="text-xs font-medium text-[#3f3043]">{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
