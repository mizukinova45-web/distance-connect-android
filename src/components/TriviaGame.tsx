import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

interface TriviaGameProps {
  game: {
    _id: Id<"games">; player1: Id<"users">; player2: Id<"users">;
    currentTurn: Id<"users">; gameState: string;
    status: "active" | "won" | "draw"; winner?: Id<"users">; moves: string;
  };
  currentUserId: Id<"users">; partnerName: string; onBack: () => void;
}

interface Question { q: string; a1: string; a2: string; a3: string; correct: number; }
interface GameState { questions: Question[]; currentIndex: number; score: { p1: number; p2: number }; currentAnswerer: string; }

export function TriviaGame({ game, currentUserId, partnerName, onBack }: TriviaGameProps) {
  const makeMove = useMutation(api.games.makeMove);
  const [state, setState] = useState<GameState>(() => JSON.parse(game.gameState));
  const [pending, setPending] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);

  useEffect(() => { setState(JSON.parse(game.gameState)); setSelectedAnswer(null); setShowResult(false); }, [game.gameState]);

  const isP1 = game.player1 === currentUserId;
  const isMyTurn = game.currentTurn === currentUserId;
  const myScore = isP1 ? state.score.p1 : state.score.p2;
  const theirScore = isP1 ? state.score.p2 : state.score.p1;
  const question = state.questions[state.currentIndex];
  const isGameOver = state.currentIndex >= state.questions.length;
  const isMyQuestion = state.currentAnswerer === (isP1 ? "p1" : "p2");

  const handleAnswer = async (answerIndex: number) => {
    if (pending || selectedAnswer !== null || isGameOver || !isMyQuestion) return;
    setSelectedAnswer(answerIndex);
    const correct = answerIndex + 1 === question.correct;
    setLastCorrect(correct);
    setShowResult(true);
    setPending(true);

    const newScore = { ...state.score };
    if (correct && isP1) newScore.p1++;
    if (correct && !isP1) newScore.p2++;

    const nextIndex = state.currentIndex + 1;
    const nextAnswerer = state.currentAnswerer === "p1" ? "p2" : "p1";
    const isOver = nextIndex >= state.questions.length;

    let status: "active" | "won" | "draw" = "active";
    let winner: Id<"users"> | undefined;
    if (isOver) {
      if (newScore.p1 > newScore.p2) { status = "won"; winner = game.player1; }
      else if (newScore.p2 > newScore.p1) { status = "won"; winner = game.player2; }
      else status = "draw";
    }

    await new Promise((r) => setTimeout(r, 1500));

    const ns: GameState = { ...state, currentIndex: nextIndex, score: newScore, currentAnswerer: nextAnswerer };
    try {
      await makeMove({ gameId: game._id, gameState: JSON.stringify(ns), nextTurn: isP1 ? game.player2 : game.player1, status, winner, move: `trivia:${answerIndex}` });
    } catch { toast.error("Failed"); }
    setPending(false);
  };

  const answers = question ? [question.a1, question.a2, question.a3] : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf2f8]">
      <header className="flex items-center gap-4 px-5 py-3.5 bg-white border-b border-pink-100 shrink-0 shadow-sm">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-pink-400 hover:text-pink-500 hover:bg-pink-50" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#3f3043]">Trivia Quiz</p>
          <p className="text-xs text-pink-400">Q{Math.min(state.currentIndex + 1, state.questions.length)}/{state.questions.length} • You {myScore} – {theirScore} {partnerName}</p>
        </div>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        {!isGameOver && question ? (
          <>
            <div className="w-full max-w-sm">
              <p className="text-lg font-semibold text-[#3f3043] text-center mb-6">{question.q}</p>
              <div className="space-y-3">
                {answers.map((ans, i) => {
                  const isCorrect = i + 1 === question.correct;
                  const isSelected = selectedAnswer === i;
                  return (
                    <button key={i} onClick={() => handleAnswer(i)} disabled={pending || selectedAnswer !== null || !isMyQuestion}
                      className={`w-full py-3 px-5 rounded-2xl border-2 text-sm font-medium text-left transition-all duration-200
                        ${showResult && isCorrect ? "border-green-300 bg-green-50" : showResult && isSelected ? "border-red-300 bg-red-50" : isSelected ? "border-pink-400 bg-pink-50" : "border-pink-100 bg-white hover:border-pink-200 hover:shadow-sm"}
                        ${!showResult && isMyQuestion ? "cursor-pointer active:scale-[0.98]" : ""}`}>
                      <span className="text-pink-300 mr-2">{String.fromCharCode(65 + i)}.</span>{ans}
                    </button>
                  );
                })}
              </div>
            </div>
            {showResult && (
              <p className={`text-sm font-medium ${lastCorrect ? "text-green-500" : "text-pink-400"}`}>
                {lastCorrect ? "Correct! 🎉" : `Wrong! The answer was: ${answers[question.correct - 1]}`}
              </p>
            )}
            {!isMyQuestion && !showResult && (
              <p className="text-xs text-pink-300 animate-pulse">It's {partnerName}'s turn to answer...</p>
            )}
          </>
        ) : (
          <div className="text-center px-6 py-4 bg-white rounded-2xl border border-pink-100 shadow-sm">
            <p className="text-3xl mb-3">🧠</p>
            <p className="text-lg font-semibold text-[#3f3043]">Quiz Complete!</p>
            <p className="text-sm text-pink-400 mt-1">Final: You {myScore} – {theirScore} {partnerName}</p>
            <p className="text-sm text-pink-300 mt-0.5">
              {myScore > theirScore ? "You're the trivia champion! 🏆" : theirScore > myScore ? `${partnerName} is the champion! 🏆` : "Perfectly matched! 🤝"}
            </p>
            <Button variant="ghost" className="mt-3 text-sm text-pink-400" onClick={onBack}>← Back to games</Button>
          </div>
        )}
      </div>
    </div>
  );
}
