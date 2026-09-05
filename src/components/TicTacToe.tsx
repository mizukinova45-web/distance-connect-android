import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

interface TicTacToeProps {
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

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function calculateWinner(board: (string | null)[]): { winner: string; line: number[] } | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a]!, line };
    }
  }
  return null;
}

export function TicTacToe({ game, currentUserId, partnerName, onBack }: TicTacToeProps) {
  const makeMove = useMutation(api.games.makeMove);
  const [board, setBoard] = useState<(string | null)[]>([]);
  const [pending, setPending] = useState(false);
  const [winResult, setWinResult] = useState<{ winner: string; line: number[] } | null>(null);

  useEffect(() => {
    const parsed: (string | null)[] = JSON.parse(game.gameState);
    setBoard(parsed);
    setWinResult(calculateWinner(parsed));
  }, [game.gameState]);

  const mySymbol = game.player1 === currentUserId ? "X" : "O";
  const isMyTurn = game.currentTurn === currentUserId;

  const handleCellClick = async (index: number) => {
    if (game.status !== "active" || !isMyTurn || board[index] !== null || pending) return;

    const newBoard = [...board];
    newBoard[index] = mySymbol;

    // Optimistic update
    setBoard(newBoard);
    setPending(true);

    // Check win/draw
    const result = calculateWinner(newBoard);
    let status: "active" | "won" | "draw" = "active";
    let winner: Id<"users"> | undefined;

    if (result) {
      status = "won";
      winner = mySymbol === "X" ? game.player1 : game.player2;
    } else if (newBoard.every((c) => c !== null)) {
      status = "draw";
    }

    const nextTurn = game.player1 === currentUserId ? game.player2 : game.player1;

    try {
      await makeMove({
        gameId: game._id,
        gameState: JSON.stringify(newBoard),
        nextTurn,
        status,
        winner,
        move: `${mySymbol}${index}`,
      });
    } catch {
      // Revert on failure
      setBoard(JSON.parse(game.gameState));
      toast.error("Failed to send move");
    }
    setPending(false);
  };

  const getStatusText = () => {
    if (game.status === "won") {
      return game.winner === currentUserId ? "You won! 🎉" : `${partnerName} won!`;
    }
    if (game.status === "draw") return "It's a draw";
    return isMyTurn ? "Your turn" : `${partnerName}'s turn`;
  };

  const gameOver = game.status !== "active";

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf2f8]">
      <header className="flex items-center gap-4 px-5 py-3.5 bg-white border-b border-pink-100 shrink-0 shadow-sm">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-pink-400 hover:text-pink-500 hover:bg-pink-50" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#3f3043]">Tic Tac Toe</p>
          <p className="text-xs text-pink-400">{getStatusText()}</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-6">
        <p className="text-xs text-pink-400 font-medium">
          {partnerName} ({game.player1 === currentUserId ? "O" : "X"})
        </p>

        <div className="w-full max-w-[280px] grid grid-cols-3 gap-2">
          {board.map((cell, i) => {
            const isWinCell = winResult?.line.includes(i);
            const isEmpty = cell === null;
            const canClick = !gameOver && isMyTurn && isEmpty && !pending;

            return (
              <button
                key={i}
                type="button"
                className={`aspect-square flex items-center justify-center text-5xl font-light rounded-2xl transition-all duration-150
                  ${cell
                    ? isWinCell
                      ? "bg-gradient-to-br from-pink-400 to-fuchsia-400 text-white shadow-md shadow-pink-200/40 scale-105"
                      : "bg-white border border-pink-50 text-[#3f3043]"
                    : "bg-white/60 border border-pink-50"
                  }
                  ${canClick ? "cursor-pointer hover:bg-pink-50 hover:border-pink-200 active:scale-95" : ""}
                `}
                onClick={() => handleCellClick(i)}
              >
                {cell && (
                  <span className={cell === "X" ? "text-[#3f3043]" : "text-pink-400"}>
                    {cell}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-xs text-pink-400 font-medium">
          You ({mySymbol})
        </p>

        {/* Turn hint */}
        {!gameOver && isMyTurn && (
          <p className="text-xs text-pink-300 text-center animate-pulse">
            Tap an empty square to place your {mySymbol}
          </p>
        )}
        {!gameOver && !isMyTurn && (
          <p className="text-xs text-pink-300 text-center">
            Waiting for {partnerName}...
          </p>
        )}
        {gameOver && (
          <div className="px-6 py-3 bg-white rounded-2xl border border-pink-100 shadow-sm text-center">
            <p className="text-sm font-semibold text-[#3f3043]">{getStatusText()}</p>
            <Button
              variant="ghost"
              className="mt-2 text-sm text-pink-400 hover:text-pink-500"
              onClick={onBack}
            >
              ← Back to games
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
