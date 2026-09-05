import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import type { Id } from "@/convex/_generated/dataModel";

interface WordScrambleGameProps {
  game: {
    _id: Id<"games">; player1: Id<"users">; player2: Id<"users">;
    currentTurn: Id<"users">; gameState: string;
    status: "active" | "won" | "draw"; winner?: Id<"users">; moves: string;
  };
  currentUserId: Id<"users">; partnerName: string; onBack: () => void;
}

interface GameState {
  words: string[]; currentIndex: number;
  score: { p1: number; p2: number };
  answered: { word: string; correct: boolean; by: string }[];
}

function scramble(word: string): string {
  const arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const result = arr.join("");
  return result === word && word.length > 1 ? scramble(word) : result;
}

export function WordScrambleGame({ game, currentUserId, partnerName, onBack }: WordScrambleGameProps) {
  const makeMove = useMutation(api.games.makeMove);
  const [state, setState] = useState<GameState>(() => JSON.parse(game.gameState));
  const [guess, setGuess] = useState("");
  const [pending, setPending] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);

  useEffect(() => { setState(JSON.parse(game.gameState)); setGuess(""); setShowResult(false); }, [game.gameState]);

  const isP1 = game.player1 === currentUserId;
  const isMyTurn = game.currentTurn === currentUserId;
  const myScore = isP1 ? state.score.p1 : state.score.p2;
  const theirScore = isP1 ? state.score.p2 : state.score.p1;
  const currentWord = state.words[state.currentIndex];
  const scrambledWord = scramble(currentWord);
  const isGameOver = state.currentIndex >= state.words.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMyTurn || pending || !guess.trim() || isGameOver) return;
    setPending(true);
    const correct = guess.trim().toLowerCase() === currentWord.toLowerCase();
    setLastCorrect(correct);
    setShowResult(true);

    const newScore = { ...state.score };
    if (correct && isP1) newScore.p1++;
    if (correct && !isP1) newScore.p2++;

    const newAnswered = [...state.answered, { word: currentWord, correct, by: isP1 ? "p1" : "p2" }];
    const nextIndex = state.currentIndex + 1;
    const isOver = nextIndex >= state.words.length;

    let status: "active" | "won" | "draw" = "active";
    let winner: Id<"users"> | undefined;
    if (isOver) {
      if (newScore.p1 > newScore.p2) { status = "won"; winner = game.player1; }
      else if (newScore.p2 > newScore.p1) { status = "won"; winner = game.player2; }
      else status = "draw";
    }

    const ns: GameState = { ...state, currentIndex: nextIndex, score: newScore, answered: newAnswered };

    await new Promise((r) => setTimeout(r, 1200));

    try {
      await makeMove({ gameId: game._id, gameState: JSON.stringify(ns), nextTurn: isP1 ? game.player2 : game.player1, status, winner, move: `ws:${currentWord}` });
    } catch { toast.error("Failed"); }
    setGuess("");
    setShowResult(false);
    setPending(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf2f8]">
      <header className="flex items-center gap-4 px-5 py-3.5 bg-white border-b border-pink-100 shrink-0 shadow-sm">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-pink-400 hover:text-pink-500 hover:bg-pink-50" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#3f3043]">Word Scramble</p>
          <p className="text-xs text-pink-400">Word {Math.min(state.currentIndex + 1, state.words.length)}/{state.words.length} • You {myScore} – {theirScore} {partnerName}</p>
        </div>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        {!isGameOver ? (
          <>
            <div className="text-center">
              <p className="text-xs text-pink-400 mb-2">{isMyTurn ? "Unscramble this word:" : `${partnerName} is solving...`}</p>
              <p className="text-4xl font-mono font-bold tracking-[0.15em] text-[#3f3043] uppercase">
                {scramble(currentWord)}
              </p>
            </div>
            {isMyTurn && !showResult && (
              <form onSubmit={handleSubmit} className="w-full max-w-xs flex gap-2">
                <Input
                  value={guess} onChange={(e) => setGuess(e.target.value)}
                  placeholder="Your answer..." autoFocus
                  className="h-11 text-center text-lg bg-pink-50/70 border-pink-100 rounded-xl focus-visible:ring-pink-300 uppercase"
                  disabled={pending}
                />
                <Button type="submit" className="h-11 rounded-xl glowup-gradient text-white border-0" disabled={pending || !guess.trim()}>→</Button>
              </form>
            )}
            {showResult && (
              <div className={`px-5 py-3 rounded-2xl border shadow-sm text-center ${lastCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                <p className="text-sm font-semibold text-[#3f3043]">
                  {lastCorrect ? "Correct! 🎉" : `The word was: ${currentWord}`}
                </p>
              </div>
            )}
            {!isMyTurn && !showResult && (
              <p className="text-xs text-pink-300 animate-pulse">Waiting for {partnerName} to unscramble...</p>
            )}
          </>
        ) : (
          <div className="text-center px-6 py-4 bg-white rounded-2xl border border-pink-100 shadow-sm">
            <p className="text-lg font-semibold text-[#3f3043]">
              {game.status === "draw" ? "It's a draw!" : game.winner === currentUserId ? "You won! 🎉" : `${partnerName} wins!`}
            </p>
            <p className="text-sm text-pink-400 mt-1">Final: You {myScore} – {theirScore} {partnerName}</p>
            <Button variant="ghost" className="mt-3 text-sm text-pink-400" onClick={onBack}>← Back to games</Button>
          </div>
        )}
      </div>
    </div>
  );
}
