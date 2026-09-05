import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import type { Id } from "@/convex/_generated/dataModel";

interface GuessNumberGameProps {
  game: {
    _id: Id<"games">; player1: Id<"users">; player2: Id<"users">;
    currentTurn: Id<"users">; gameState: string;
    status: "active" | "won" | "draw"; winner?: Id<"users">; moves: string;
  };
  currentUserId: Id<"users">; partnerName: string; onBack: () => void;
}

interface Guess { number: number; hint: "higher" | "lower" | "correct"; by: string; }
interface GameState { secret: number; guesses: Guess[]; range: [number, number]; gameOver: boolean; winner: string | null; }

export function GuessNumberGame({ game, currentUserId, partnerName, onBack }: GuessNumberGameProps) {
  const makeMove = useMutation(api.games.makeMove);
  const [state, setState] = useState<GameState>(() => JSON.parse(game.gameState));
  const [pending, setPending] = useState(false);

  useEffect(() => { setState(JSON.parse(game.gameState)); }, [game.gameState]);

  const isP1 = game.player1 === currentUserId;
  const isMyTurn = game.currentTurn === currentUserId;
  const amGuesser = !isP1; // Player 2 (partner2) is always the guesser
  const [guessInput, setGuessInput] = useState("");
  const [hintInput, setHintInput] = useState<"higher" | "lower" | null>(null);

  const handleGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(guessInput);
    if (isNaN(num) || num < state.range[0] || num > state.range[1] || pending) return;
    setPending(true);

    const isCorrect = num === state.secret;
    const guess: Guess = { number: num, hint: isCorrect ? "correct" : "correct", by: "guesser" };
    const ns: GameState = {
      ...state,
      guesses: [...state.guesses, guess],
      gameOver: isCorrect,
      winner: isCorrect ? "guesser" : null,
    };

    try {
      await makeMove({
        gameId: game._id, gameState: JSON.stringify(ns),
        nextTurn: isP1 ? game.player1 : game.player2, // After guess, turn goes to number-setter for hint
        status: isCorrect ? "won" : "active",
        winner: isCorrect ? game.player2 : undefined,
        move: `guess:${num}`,
      });
    } catch { toast.error("Failed"); }
    setGuessInput("");
    setPending(false);
  };

  const handleHint = async (hint: "higher" | "lower") => {
    if (pending) return;
    setPending(true);
    const lastGuess = state.guesses[state.guesses.length - 1];
    const newRange: [number, number] = hint === "higher"
      ? [lastGuess.number + 1, state.range[1]]
      : [state.range[0], lastGuess.number - 1];

    const updatedGuesses = [...state.guesses];
    updatedGuesses[updatedGuesses.length - 1] = { ...lastGuess, hint };

    const ns: GameState = { ...state, guesses: updatedGuesses, range: newRange };
    try {
      await makeMove({
        gameId: game._id, gameState: JSON.stringify(ns),
        nextTurn: isP1 ? game.player2 : game.player1, // Turn goes back to guesser
        status: game.status, move: `hint:${hint}`,
      });
    } catch { toast.error("Failed"); }
    setPending(false);
  };

  const lastGuess = state.guesses[state.guesses.length - 1];
  const needsHint = lastGuess && lastGuess.hint === "correct" && !state.gameOver && lastGuess.by === "guesser";
  const isMyHintTurn = needsHint && isP1; // Player 1 gives hints

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf2f8]">
      <header className="flex items-center gap-4 px-5 py-3.5 bg-white border-b border-pink-100 shrink-0 shadow-sm">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-pink-400 hover:text-pink-500 hover:bg-pink-50" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#3f3043]">Guess the Number</p>
          <p className="text-xs text-pink-400">{state.guesses.length} guesses • Range: {state.range[0]}-{state.range[1]}</p>
        </div>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <div className="text-center mb-2">
          <p className="text-xs text-pink-400 mb-1">{isP1 ? `${partnerName} is guessing` : "Pick a number (your partner doesn't know!)"}</p>
          {isP1 && !state.gameOver && (
            <p className="text-sm text-pink-300">You chose: <span className="font-bold text-[#3f3043]">???</span></p>
          )}
        </div>

        {/* Guess history */}
        <div className="w-full max-w-xs space-y-2 max-h-40 overflow-auto">
          {state.guesses.map((g, i) => (
            <div key={i} className="flex items-center justify-between bg-white rounded-xl px-4 py-2 border border-pink-50 text-sm">
              <span className="font-mono text-[#3f3043] font-medium">{g.number}</span>
              <span className={`text-xs font-medium ${g.hint === "higher" ? "text-blue-500" : g.hint === "lower" ? "text-orange-500" : "text-green-500"}`}>
                {g.hint === "higher" ? "↑ Higher" : g.hint === "lower" ? "↓ Lower" : "✓ Set"}
              </span>
            </div>
          ))}
        </div>

        {/* Input area */}
        {!state.gameOver && (
          <>
            {amGuesser && isMyTurn && !needsHint && (
              <form onSubmit={handleGuess} className="w-full max-w-xs flex gap-2">
                <Input
                  type="number" value={guessInput} onChange={(e) => setGuessInput(e.target.value)}
                  placeholder={`${state.range[0]}-${state.range[1]}`} autoFocus
                  className="h-11 text-center text-lg font-mono bg-pink-50/70 border-pink-100 rounded-xl focus-visible:ring-pink-300"
                  min={state.range[0]} max={state.range[1]} disabled={pending}
                />
                <Button type="submit" className="h-11 rounded-xl glowup-gradient text-white border-0" disabled={pending || !guessInput}>→</Button>
              </form>
            )}

            {isMyHintTurn && !state.gameOver && (
              <div className="text-center">
                <p className="text-sm text-pink-400 mb-3">{partnerName} guessed <span className="font-bold text-[#3f3043]">{lastGuess?.number}</span>. Is it...</p>
                <div className="flex gap-3">
                  <Button variant="outline" className="h-11 rounded-xl border-pink-100 text-pink-500 hover:bg-pink-50" onClick={() => handleHint("higher")} disabled={pending}>↑ Higher</Button>
                  <Button variant="outline" className="h-11 rounded-xl border-pink-100 text-pink-500 hover:bg-pink-50" onClick={() => handleHint("lower")} disabled={pending}>↓ Lower</Button>
                </div>
              </div>
            )}

            {!isMyTurn && !needsHint && (
              <p className="text-xs text-pink-300 animate-pulse">
                {amGuesser ? `Waiting for ${partnerName} to give a hint...` : `${partnerName} is guessing...`}
              </p>
            )}
          </>
        )}

        {state.gameOver && (
          <div className="text-center px-6 py-4 bg-white rounded-2xl border border-pink-100 shadow-sm">
            <p className="text-3xl mb-3">🎉</p>
            <p className="text-lg font-semibold text-[#3f3043]">
              {state.winner === "guesser" ? `${partnerName} guessed it!` : "You got it!"}
            </p>
            <p className="text-sm text-pink-400 mt-1">The number was {state.secret}</p>
            <Button variant="ghost" className="mt-3 text-sm text-pink-400" onClick={onBack}>← Back to games</Button>
          </div>
        )}
      </div>
    </div>
  );
}
