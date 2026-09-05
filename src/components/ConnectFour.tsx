import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

interface ConnectFourProps {
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

type Cell = null | "p1" | "p2";
type Board = Cell[][];

function checkWin(board: Board, row: number, col: number): boolean {
  const player = board[row][col];
  if (!player) return false;

  const directions: [number, number][] = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diag down-right
    [1, -1],  // diag down-left
  ];

  for (const [dr, dc] of directions) {
    let count = 1;
    for (let i = 1; i < 4; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === player) {
        count++;
      } else break;
    }
    for (let i = 1; i < 4; i++) {
      const r = row - dr * i;
      const c = col - dc * i;
      if (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === player) {
        count++;
      } else break;
    }
    if (count >= 4) return true;
  }
  return false;
}

function isBoardFull(board: Board): boolean {
  return board[0].every((cell) => cell !== null);
}

export function ConnectFour({ game, currentUserId, partnerName, onBack }: ConnectFourProps) {
  const makeMove = useMutation(api.games.makeMove);
  const [board, setBoard] = useState<Board>([]);
  const [pending, setPending] = useState(false);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  useEffect(() => {
    setBoard(JSON.parse(game.gameState));
  }, [game.gameState]);

  const myPlayer: Cell = game.player1 === currentUserId ? "p1" : "p2";
  const isMyTurn = game.currentTurn === currentUserId;

  const getDropRow = useCallback((col: number): number | null => {
    for (let row = 5; row >= 0; row--) {
      if (!board[row][col]) return row;
    }
    return null;
  }, [board]);

  const handleColumnClick = async (col: number) => {
    if (game.status !== "active" || !isMyTurn || pending) return;

    const row = getDropRow(col);
    if (row === null) return;

    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = myPlayer;

    // Optimistic update
    setBoard(newBoard);
    setPending(true);

    const won = checkWin(newBoard, row, col);
    const full = !won && isBoardFull(newBoard);
    const status = won ? "won" : full ? "draw" : "active";
    const winner = won ? (myPlayer === "p1" ? game.player1 : game.player2) : undefined;
    const nextTurn = game.player1 === currentUserId ? game.player2 : game.player1;

    try {
      await makeMove({
        gameId: game._id,
        gameState: JSON.stringify(newBoard),
        nextTurn,
        status,
        winner,
        move: `col${col}`,
      });
    } catch {
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
    return isMyTurn ? "Your turn — drop a piece" : `${partnerName}'s turn`;
  };

  const gameOver = game.status !== "active";

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf2f8]">
      <header className="flex items-center gap-4 px-5 py-3.5 bg-white border-b border-pink-100 shrink-0 shadow-sm">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-pink-400 hover:text-pink-500 hover:bg-pink-50" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#3f3043]">Connect Four</p>
          <p className="text-xs text-pink-400">{getStatusText()}</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-6">
        <p className="text-xs text-pink-400 font-medium">
          {partnerName} ({game.player1 === currentUserId ? "P2" : "P1"})
        </p>

        <div className="w-full max-w-[320px]">
          {/* Column hover indicator */}
          <div className="grid grid-cols-7 mb-2 h-6">
            {Array.from({ length: 7 }).map((_, col) => (
              <div key={col} className="flex justify-center">
                {hoveredCol === col && !gameOver && isMyTurn && (
                  <div className={`w-5 h-5 rounded-full ${
                    myPlayer === "p1"
                      ? "bg-gradient-to-br from-pink-400 to-fuchsia-400"
                      : "bg-gradient-to-br from-purple-300 to-purple-400"
                  } shadow-sm animate-bounce`} />
                )}
              </div>
            ))}
          </div>

          {/* Game board */}
          <div className="bg-gradient-to-b from-pink-200 to-pink-300 rounded-2xl p-2.5 shadow-inner">
            <div className="grid grid-cols-7 gap-1.5">
              {board.map((row, ri) =>
                row.map((cell, ci) => {
                  const canDrop = !gameOver && isMyTurn && !cell && !pending && getDropRow(ci) === ri;

                  return (
                    <button
                      key={`${ri}-${ci}`}
                      type="button"
                      className={`aspect-square rounded-full transition-all duration-150
                        ${cell === "p1"
                          ? "bg-gradient-to-br from-pink-400 to-fuchsia-400 shadow-sm shadow-pink-300/30"
                          : cell === "p2"
                            ? "bg-gradient-to-br from-purple-300 to-purple-400 shadow-sm shadow-purple-300/30"
                            : "bg-white/90"
                        }
                        ${canDrop ? "cursor-pointer hover:bg-white hover:scale-105 active:scale-95" : ""}
                        ${!gameOver && !cell ? "cursor-pointer" : ""}
                      `}
                      onClick={() => handleColumnClick(ci)}
                      onMouseEnter={() => setHoveredCol(ci)}
                      onMouseLeave={() => setHoveredCol(null)}
                    />
                  );
                }),
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-pink-400 font-medium">
          You ({myPlayer === "p1" ? "Pink" : "Purple"})
        </p>

        {/* Turn hint */}
        {!gameOver && isMyTurn && (
          <p className="text-xs text-pink-300 text-center animate-pulse">
            Tap a column to drop your piece
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
