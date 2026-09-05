import { useState, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

interface ChessGameProps {
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

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

const PIECE_UNICODE: Record<string, string> = {
  wK: "♔", wQ: "♕", wR: "♖", wB: "♗", wN: "♘", wP: "♙",
  bK: "♚", bQ: "♛", bR: "♜", bB: "♝", bN: "♞", bP: "♟",
};

export function ChessGame({ game, currentUserId, partnerName, onBack }: ChessGameProps) {
  const makeMove = useMutation(api.games.makeMove);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [board, setBoard] = useState<ReturnType<Chess["board"]>>([]);
  const [legalMoveTargets, setLegalMoveTargets] = useState<Set<string>>(new Set());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [isInCheck, setIsInCheck] = useState(false);
  const chessRef = useRef<Chess | null>(null);

  // Initialize and sync chess instance with game state
  useEffect(() => {
    try {
      const chess = new Chess(game.gameState);
      chessRef.current = chess;
      setBoard(chess.board());
      setMoveHistory(JSON.parse(game.moves));
      setIsInCheck(chess.isCheck());
    } catch (e) {
      console.error("Failed to load chess state:", e);
    }
  }, [game.gameState, game.moves]);

  // Clear selection when game state changes (opponent moved)
  useEffect(() => {
    setSelectedSquare(null);
    setLegalMoveTargets(new Set());
  }, [game.gameState]);

  const myColor = game.player1 === currentUserId ? "w" : "b";
  const isMyTurn = game.currentTurn === currentUserId;

  const handleSquareClick = (square: string) => {
    const chess = chessRef.current;
    if (!chess || game.status !== "active" || !isMyTurn) return;

    // If no piece selected, select own piece
    if (!selectedSquare) {
      const piece = chess.get(square as any);
      if (piece && piece.color === myColor) {
        setSelectedSquare(square);
        // Show legal moves
        const moves = chess.moves({ square: square as any, verbose: true });
        setLegalMoveTargets(new Set(moves.map((m) => m.to)));
      }
      return;
    }

    // Clicking same square deselects
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalMoveTargets(new Set());
      return;
    }

    // Clicking another own piece switches selection
    const piece = chess.get(square as any);
    if (piece && piece.color === myColor) {
      setSelectedSquare(square);
      const moves = chess.moves({ square: square as any, verbose: true });
      setLegalMoveTargets(new Set(moves.map((m) => m.to)));
      return;
    }

    // Try to make the move
    const moveResult = chess.move(`${selectedSquare}${square}`, { promotion: "q" } as any);
    if (!moveResult) {
      toast.error("Invalid move");
      setSelectedSquare(null);
      setLegalMoveTargets(new Set());
      return;
    }

    // Move succeeded locally
    setSelectedSquare(null);
    setLegalMoveTargets(new Set());
    setBoard(chess.board());
    setIsInCheck(chess.isCheck());

    // Determine game status
    let status: "active" | "won" | "draw" = "active";
    let winner: Id<"users"> | undefined;

    if (chess.isGameOver()) {
      if (chess.isCheckmate()) {
        status = "won";
        winner = myColor === "w" ? game.player1 : game.player2;
      } else {
        status = "draw";
      }
    }

    const nextTurn = game.player1 === currentUserId ? game.player2 : game.player1;

    makeMove({
      gameId: game._id,
      gameState: chess.fen(),
      nextTurn,
      status,
      winner,
      move: moveResult.san,
    }).catch(() => {
      // Revert on failure
      chess.load(game.gameState);
      setBoard(chess.board());
      toast.error("Failed to send move");
    });
  };

  const getStatusText = () => {
    if (game.status === "won") {
      return game.winner === currentUserId ? "You won!" : `${partnerName} won!`;
    }
    if (game.status === "draw") return "It's a draw";
    if (isInCheck) return isMyTurn ? "You're in check!" : `${partnerName} is in check!`;
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
          <p className="text-sm font-semibold text-[#3f3043]">Chess</p>
          <p className="text-xs text-pink-400">{getStatusText()}</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-4">
        <div className="w-full max-w-md">
          <p className="text-xs text-pink-400 text-center mb-2 font-medium">
            {partnerName} ({myColor === "w" ? "Black" : "White"})
          </p>

          <div className="aspect-square bg-white border border-pink-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="w-full h-full grid grid-cols-8 grid-rows-8">
              {board.map((row, ri) =>
                row.map((cell, ci) => {
                  const isDark = (ri + ci) % 2 === 1;
                  const square = `${FILES[ci]}${8 - ri}`;
                  const isSelected = selectedSquare === square;
                  const isLegalTarget = legalMoveTargets.has(square);

                  return (
                    <button
                      key={square}
                      type="button"
                      className={`relative flex items-center justify-center text-2xl sm:text-3xl md:text-4xl select-none transition-all duration-100
                        ${isDark ? "bg-[#d4a8c4]" : "bg-[#f0d4e0]"}
                        ${isSelected ? "!bg-[#a4c2e8] ring-2 ring-blue-300 ring-inset" : ""}
                        ${isLegalTarget && !cell ? "after:content-[''] after:absolute after:w-[22%] after:h-[22%] after:rounded-full after:bg-black/20" : ""}
                        ${isLegalTarget && cell ? "after:content-[''] after:absolute after:inset-[2px] after:border-[3px] after:border-red-400/60 after:rounded-full" : ""}
                        ${!gameOver && isMyTurn && cell && cell.color === myColor ? "cursor-pointer hover:brightness-95 active:scale-95" : ""}
                        ${isLegalTarget ? "cursor-pointer hover:brightness-95 active:scale-95" : ""}
                      `}
                      onClick={() => handleSquareClick(square)}
                    >
                      {cell && (
                        <span className={`drop-shadow-sm transition-transform ${cell.color === "w" ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" : "text-[#2a2a2a]"}`}>
                          {PIECE_UNICODE[`${cell.color}${cell.type.toUpperCase()}`]}
                        </span>
                      )}
                    </button>
                  );
                }),
              )}
            </div>
          </div>

          <p className="text-xs text-pink-400 text-center mt-2 font-medium">
            You ({myColor === "w" ? "White" : "Black"})
          </p>
        </div>

        {/* Turn hint */}
        {!gameOver && isMyTurn && !selectedSquare && (
          <p className="text-xs text-pink-300 text-center animate-pulse">
            Tap a piece to select it, then tap where to move
          </p>
        )}
        {!gameOver && isMyTurn && selectedSquare && (
          <p className="text-xs text-pink-300 text-center">
            Tap a highlighted square to move, or tap the piece again to deselect
          </p>
        )}
        {!gameOver && !isMyTurn && (
          <p className="text-xs text-pink-300 text-center">
            Waiting for {partnerName} to move...
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

        {moveHistory.length > 0 && (
          <div className="w-full max-w-md">
            <div className="flex flex-wrap gap-1 justify-center">
              {moveHistory.map((move, i) => (
                <span key={i} className="text-xs font-mono text-pink-400 px-1.5 py-0.5 bg-pink-50 rounded-lg">
                  {i % 2 === 0 && <span className="text-pink-300 mr-0.5">{Math.floor(i / 2) + 1}.</span>}
                  {move}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
