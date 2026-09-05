import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

interface MemoryGameProps {
  game: {
    _id: Id<"games">; player1: Id<"users">; player2: Id<"users">;
    currentTurn: Id<"users">; gameState: string;
    status: "active" | "won" | "draw"; winner?: Id<"users">; moves: string;
  };
  currentUserId: Id<"users">; partnerName: string; onBack: () => void;
}

interface Card { id: number; symbol: string; flipped: boolean; matched: boolean; }
interface GameState { cards: Card[]; flippedIds: number[]; p1Score: number; p2Score: number; lastMatchedBy: string | null; }

export function MemoryGame({ game, currentUserId, partnerName, onBack }: MemoryGameProps) {
  const makeMove = useMutation(api.games.makeMove);
  const [state, setState] = useState<GameState>(() => JSON.parse(game.gameState));
  const [pending, setPending] = useState(false);

  useEffect(() => { setState(JSON.parse(game.gameState)); }, [game.gameState]);

  const isP1 = game.player1 === currentUserId;
  const isMyTurn = game.currentTurn === currentUserId;
  const myScore = isP1 ? state.p1Score : state.p2Score;
  const theirScore = isP1 ? state.p2Score : state.p1Score;
  const totalPairs = state.cards.length / 2;
  const matchedCount = state.cards.filter((c) => c.matched).length / 2;
  const gameOver = matchedCount === totalPairs;

  const handleClick = async (cardId: number) => {
    if (pending || !isMyTurn || game.status !== "active") return;
    const card = state.cards.find((c) => c.id === cardId);
    if (!card || card.flipped || card.matched) return;

    const newCards = state.cards.map((c) => c.id === cardId ? { ...c, flipped: true } : c);
    const newFlipped = [...state.flippedIds, cardId];

    if (newFlipped.length === 2) {
      setPending(true);
      const [first, second] = newFlipped;
      const c1 = newCards.find((c) => c.id === first)!;
      const c2 = newCards.find((c) => c.id === second)!;

      const matched = c1.symbol === c2.symbol;
      const finalCards = newCards.map((c) =>
        c.id === first || c.id === second ? { ...c, flipped: false, matched: matched ? true : c.matched } : c
      );

      const newP1Score = state.p1Score + (matched && isP1 ? 1 : 0);
      const newP2Score = state.p2Score + (matched && !isP1 ? 1 : 0);
      const newMatchedCount = finalCards.filter((c) => c.matched).length / 2;
      const isGameOver = newMatchedCount === totalPairs;

      let status: "active" | "won" | "draw" = "active";
      let winner: Id<"users"> | undefined;
      if (isGameOver) {
        if (newP1Score > newP2Score) { status = "won"; winner = game.player1; }
        else if (newP2Score > newP1Score) { status = "won"; winner = game.player2; }
        else status = "draw";
      }

      const ns: GameState = { cards: finalCards, flippedIds: [], p1Score: newP1Score, p2Score: newP2Score, lastMatchedBy: matched ? (isP1 ? "p1" : "p2") : null };
      const nextTurn = matched ? game.currentTurn : (isP1 ? game.player2 : game.player1);

      try {
        await makeMove({ gameId: game._id, gameState: JSON.stringify(ns), nextTurn, status, winner, move: `mem:${cardId}` });
      } catch { toast.error("Failed"); setPending(false); return; }

      if (!matched) {
        // Briefly show non-matching cards then reset
        setTimeout(() => {
          setState(JSON.parse(game.gameState));
        }, 100);
      }
      setPending(false);
    } else {
      // First card of a pair — just flip it locally, wait for Convex sync
      setState({ ...state, cards: newCards, flippedIds: newFlipped });
    }
  };

  const goBackToLobby = onBack;

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf2f8]">
      <header className="flex items-center gap-4 px-5 py-3.5 bg-white border-b border-pink-100 shrink-0 shadow-sm">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-pink-400 hover:text-pink-500 hover:bg-pink-50" onClick={goBackToLobby}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#3f3043]">Memory Match</p>
          <p className="text-xs text-pink-400">{matchedCount}/{totalPairs} pairs found</p>
        </div>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-5">
        <div className="flex items-center gap-8">
          <div className="text-center"><p className="text-xs text-pink-400">You</p><p className="text-2xl font-bold text-[#3f3043]">{myScore}</p></div>
          <div className="w-px h-8 bg-pink-100" />
          <div className="text-center"><p className="text-xs text-pink-400">{partnerName}</p><p className="text-2xl font-bold text-[#3f3043]">{theirScore}</p></div>
        </div>
        <div className="w-full max-w-[340px] grid grid-cols-4 gap-2">
          {state.cards.map((card) => {
            const show = card.flipped || card.matched;
            return (
              <button key={card.id} onClick={() => handleClick(card.id)} disabled={pending}
                className={`aspect-square rounded-2xl text-3xl flex items-center justify-center transition-all duration-300
                  ${card.matched ? "bg-gradient-to-br from-pink-200 to-fuchsia-200 border border-pink-200" : show ? "bg-white border border-pink-200 shadow-md" : "bg-white border border-pink-50 shadow-sm hover:shadow-md active:scale-95 cursor-pointer"}`}>
                {show ? card.symbol : "?"}
              </button>
            );
          })}
        </div>
        {!gameOver && (
          <p className="text-xs text-pink-300 text-center">
            {isMyTurn ? "Tap a card to flip it" : `Waiting for ${partnerName}...`}
          </p>
        )}
        {gameOver && (
          <div className="px-6 py-3 bg-white rounded-2xl border border-pink-100 shadow-sm text-center">
            <p className="text-sm font-semibold text-[#3f3043]">
              {game.status === "draw" ? "It's a draw!" : game.winner === currentUserId ? "You won! 🎉" : `${partnerName} wins!`}
            </p>
            <Button variant="ghost" className="mt-2 text-sm text-pink-400" onClick={goBackToLobby}>← Back to games</Button>
          </div>
        )}
      </div>
    </div>
  );
}
