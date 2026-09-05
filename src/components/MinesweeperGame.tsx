import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

interface MinesweeperGameProps {
  game: {
    _id: Id<"games">; player1: Id<"users">; player2: Id<"users">;
    currentTurn: Id<"users">; gameState: string;
    status: "active" | "won" | "draw"; winner?: Id<"users">; moves: string;
  };
  currentUserId: Id<"users">; partnerName: string; onBack: () => void;
}

interface Cell { mine: boolean; revealed: boolean; adjacent: number; }
interface GameState { board: Cell[][]; size: number; mineCount: number; revealedSafe: number; totalSafe: number; lastRevealer: string | null; }

const COLORS = ["", "text-blue-500", "text-green-600", "text-red-500", "text-purple-600", "text-yellow-600", "text-cyan-600", "text-gray-700", "text-gray-500"];

export function MinesweeperGame({ game, currentUserId, partnerName, onBack }: MinesweeperGameProps) {
  const makeMove = useMutation(api.games.makeMove);
  const [state, setState] = useState<GameState>(() => JSON.parse(game.gameState));
  const [pending, setPending] = useState(false);

  useEffect(() => { setState(JSON.parse(game.gameState)); }, [game.gameState]);

  const isP1 = game.player1 === currentUserId;
  const isMyTurn = game.currentTurn === currentUserId;
  const gameOver = game.status !== "active";

  const handleClick = async (row: number, col: number) => {
    if (pending || !isMyTurn || gameOver) return;
    const cell = state.board[row][col];
    if (cell.revealed) return;

    setPending(true);
    const newBoard = state.board.map((r) => r.map((c) => ({ ...c })));
    newBoard[row][col].revealed = true;

    if (cell.mine) {
      // Hit a mine — other player wins
      const ns: GameState = { ...state, board: newBoard, lastRevealer: isP1 ? "p1" : "p2" };
      const winner = isP1 ? game.player2 : game.player1;
      try {
        await makeMove({ gameId: game._id, gameState: JSON.stringify(ns), nextTurn: isP1 ? game.player2 : game.player1, status: "won", winner, move: `ms:${row},${col}` });
      } catch { toast.error("Failed"); }
      setPending(false);
      return;
    }

    // Flood-fill for empty cells
    const size = state.size;
    const queue: [number, number][] = [[row, col]];
    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      if (r < 0 || r >= size || c < 0 || c >= size) continue;
      if (newBoard[r][c].revealed || newBoard[r][c].mine) continue;
      newBoard[r][c].revealed = true;
      if (newBoard[r][c].adjacent === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            queue.push([r + dr, c + dc]);
          }
        }
      }
    }

    let revealedSafe = 0;
    for (const row of newBoard) for (const cell of row) if (cell.revealed && !cell.mine) revealedSafe++;

    let status: "active" | "won" | "draw" = "active";
    let winner: Id<"users"> | undefined;
    if (revealedSafe >= state.totalSafe) {
      // All safe cells revealed — current player wins (they revealed the last one)
      status = "won";
      winner = currentUserId;
    }

    const ns: GameState = { ...state, board: newBoard, revealedSafe, lastRevealer: isP1 ? "p1" : "p2" };
    try {
      await makeMove({ gameId: game._id, gameState: JSON.stringify(ns), nextTurn: isP1 ? game.player2 : game.player1, status, winner, move: `ms:${row},${col}` });
    } catch { toast.error("Failed"); }
    setPending(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf2f8]">
      <header className="flex items-center gap-4 px-5 py-3.5 bg-white border-b border-pink-100 shrink-0 shadow-sm">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-pink-400 hover:text-pink-500 hover:bg-pink-50" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#3f3043]">Minesweeper</p>
          <p className="text-xs text-pink-400">{state.mineCount} mines • {state.totalSafe - state.revealedSafe} safe cells left</p>
        </div>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-4">
        <div className="w-full max-w-[340px]">
          <div className="bg-white rounded-2xl p-2 border border-pink-100 shadow-sm">
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${state.size}, 1fr)` }}>
              {state.board.map((row, ri) =>
                row.map((cell, ci) => (
                  <button key={`${ri}-${ci}`} onClick={() => handleClick(ri, ci)} disabled={pending || gameOver || cell.revealed}
                    className={`aspect-square rounded-lg text-xs font-bold flex items-center justify-center transition-all duration-100
                      ${cell.revealed
                        ? cell.mine ? "bg-red-400 text-white" : "bg-pink-50 border border-pink-100"
                        : "bg-white border border-pink-100 hover:bg-pink-50 hover:border-pink-200 cursor-pointer active:scale-95"
                      }`}>
                    {cell.revealed ? (cell.mine ? "💣" : cell.adjacent > 0 ? <span className={COLORS[cell.adjacent]}>{cell.adjacent}</span> : "") : ""}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
        {!gameOver && (
          <p className="text-xs text-pink-300 text-center">
            {isMyTurn ? "Tap a cell to reveal it" : `Waiting for ${partnerName}...`}
          </p>
        )}
        {gameOver && (
          <div className="px-6 py-3 bg-white rounded-2xl border border-pink-100 shadow-sm text-center">
            <p className="text-sm font-semibold text-[#3f3043]">
              {game.winner === currentUserId ? "You won! 🎉" : `${partnerName} wins!`}
            </p>
            <Button variant="ghost" className="mt-2 text-sm text-pink-400" onClick={onBack}>← Back to games</Button>
          </div>
        )}
      </div>
    </div>
  );
}
