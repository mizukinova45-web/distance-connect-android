import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
  Copy,
  LogOut,
  Send,
  Users,
  Check,
  Crown,
  Sparkles,
  Heart,
  Star,
  User,
  MessageCircle,
  Settings,
  Shield,
  Bell,
  ChevronRight,
  LogIn,
  Paperclip,
  Image as ImageIcon,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { useLanguage } from "@/contexts/LanguageContext";
import { GamesLobby } from "@/components/GamesLobby";
import { SettingsView } from "@/components/SettingsView";
import { MemoriesGallery } from "@/components/MemoriesGallery";
import { ChessGame } from "@/components/ChessGame";
import { TicTacToe } from "@/components/TicTacToe";
import { ConnectFour } from "@/components/ConnectFour";
import { RpsGame } from "@/components/RpsGame";
import { MemoryGame } from "@/components/MemoryGame";
import { WordScrambleGame } from "@/components/WordScrambleGame";
import { WouldYouRatherGame } from "@/components/WouldYouRatherGame";
import { TriviaGame } from "@/components/TriviaGame";
import { MinesweeperGame } from "@/components/MinesweeperGame";
import { GuessNumberGame } from "@/components/GuessNumberGame";
import { BottomNav, type BottomNavTab } from "@/components/BottomNav"

/* ------------------------------------------------------------------ */
/*  Partnership step                                                   */
/* ------------------------------------------------------------------ */

function PartnerSetup({ onCreated }: { onCreated: () => void }) {
  const createPartnership = useMutation(api.partnerships.create);
  const joinPartnership = useMutation(api.partnerships.join);
  const [mode, setMode] = useState<"choose" | "join">("choose");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleCreate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await createPartnership();
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create partnership");
      setIsLoading(false);
    }
  };

  const handleJoin = async (e: FormEvent) => {
    e.preventDefault();
    if (code.trim().length < 4) return;
    setIsLoading(true);
    setError(null);
    try {
      await joinPartnership({ pairingCode: code.trim().toUpperCase() });
      toast.success("You're connected!");
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid code");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#fdf2f8] relative overflow-hidden">
      <div className="glowup-blob glowup-blob-pink w-[300px] h-[300px] -top-32 -right-32" />
      <div className="glowup-blob glowup-blob-lavender w-[200px] h-[200px] bottom-20 -left-24" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-full glowup-gradient flex items-center justify-center shadow-lg shadow-pink-200/50">
            <Users className="w-6 h-6 text-white" />
          </div>
        </div>

        {mode === "choose" ? (
          <div className="glowup-card p-7">
            <h1 className="text-xl font-bold text-center text-[#3f3043]">
              {t("connectWithPartner")}
            </h1>
            <p className="text-sm text-muted-foreground text-center mt-1.5 leading-relaxed">
              {t("authDesc")}
            </p>

            <div className="mt-6 space-y-3">
              <Button
                className="w-full h-12 text-sm font-semibold rounded-xl glowup-gradient border-0 shadow-md shadow-pink-200/30 hover:shadow-lg transition-shadow text-white"
                onClick={handleCreate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="animate-pulse">Creating...</span>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t("createPairingCode")}
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-pink-100" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-pink-300 font-medium">
                    or
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full h-12 text-sm rounded-xl border-pink-100 text-pink-500 hover:bg-pink-50"
                onClick={() => setMode("join")}
              >
                {t("enterPairingCode")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="glowup-card p-7">
            <h1 className="text-xl font-bold text-center text-[#3f3043]">
              {t("enterPairingCode")}
            </h1>
            <p className="text-sm text-muted-foreground text-center mt-1.5">
              {t("askPartnerForCode")}
            </p>

            <form onSubmit={handleJoin} className="mt-6">
              <Input
                placeholder={t("enterCode")}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="h-12 text-center text-lg tracking-[0.3em] font-mono bg-pink-50/70 border-pink-100 rounded-xl focus-visible:ring-pink-300"
                maxLength={6}
                autoFocus
              />

              {error && (
                <p className="mt-2 text-sm text-red-400 text-center">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-sm font-semibold mt-4 rounded-xl glowup-gradient border-0 shadow-md shadow-pink-200/30 hover:shadow-lg transition-shadow text-white"
                disabled={isLoading || code.trim().length < 4}
              >
                {isLoading ? "..." : t("connect")}
              </Button>
            </form>

            <Button
              variant="ghost"
              className="w-full mt-3 text-sm text-pink-400 hover:text-pink-500 hover:bg-pink-50"
              onClick={() => {
                setMode("choose");
                setCode("");
                setError(null);
              }}
            >
              ← Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Waiting screen                                                     */
/* ------------------------------------------------------------------ */

function WaitingScreen({
  pairingCode,
  onSignOut,
}: { pairingCode: string; onSignOut: () => void }) {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  const handleCopy = () => {
    navigator.clipboard.writeText(pairingCode);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#fdf2f8] relative overflow-hidden">
      <div className="glowup-blob glowup-blob-pink w-[300px] h-[300px] -top-32 -left-32" />
      <div className="glowup-blob glowup-blob-lavender w-[200px] h-[200px] bottom-24 -right-20" />

      <div className="relative z-10 w-full max-w-sm text-center">
        <div className="glowup-card p-8">
          <div className="w-14 h-14 rounded-full glowup-gradient flex items-center justify-center mx-auto mb-5 shadow-lg shadow-pink-200/50">
            <Heart className="w-6 h-6 text-white" />
          </div>

          <h1 className="text-xl font-bold text-[#3f3043]">
            {t("waitingForPartner")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            {t("shareCode")}
          </p>

          <div className="mt-6 p-5 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border border-pink-100">
            <p className="text-[10px] text-pink-400 uppercase tracking-[0.2em] font-semibold mb-2">
              {t("yourPairingCode")}
            </p>
            <p className="text-3xl font-mono tracking-[0.3em] select-all text-[#3f3043] font-bold">
              {pairingCode}
            </p>
          </div>

          <Button
            variant="outline"
            className="mt-4 h-10 text-sm rounded-xl border-pink-100 text-pink-500 hover:bg-pink-50"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? t("copied") : t("copyCode")}
          </Button>

          <p className="mt-5 text-xs text-muted-foreground leading-relaxed">
            {t("pairingInfo")}
          </p>
        </div>

        <Button
          variant="ghost"
          className="mt-6 text-sm text-pink-400 hover:text-pink-500 hover:bg-pink-50 rounded-xl"
          onClick={onSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Discover view (home feed)                                          */
/* ------------------------------------------------------------------ */

function DiscoverView({
  partnerInfo,
  onGoToChat,
  onGoToGames,
}: {
  partnerInfo?: { name?: string; email?: string };
  onGoToChat: () => void;
  onGoToGames: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-[#fdf2f8] pb-24 pt-4">
      {/* Header */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
          <span className="text-lg font-bold text-[#3f3043]">{t("appTitle")}</span>
        </div>
      </div>

      {/* Partner profile card */}
      <div className="px-5">
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-pink-50">
          {/* Gradient header */}
          <div className="bg-gradient-to-br from-[#f472b6] via-[#ec4899] to-[#e879a6] h-32 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSMzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          </div>

          {/* Avatar overlapping */}
          <div className="flex justify-center -mt-12">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-300 to-fuchsia-300 border-4 border-white shadow-lg flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {partnerInfo?.name?.charAt(0) || "💕"}
              </span>
            </div>
          </div>

          <div className="text-center px-6 pt-3 pb-6">
            <h2 className="text-lg font-bold text-[#3f3043]">
              {partnerInfo?.name || t("yourPartner")}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {partnerInfo?.email || t("connectedWithLove")}
            </p>

            {/* Action buttons */}
            <div className="flex justify-center gap-4 mt-5">
              <button
                onClick={onGoToChat}
                className="w-14 h-14 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center hover:bg-pink-100 transition-colors"
              >
                <MessageCircle className="w-6 h-6 text-pink-500" />
              </button>
              <button className="w-16 h-16 rounded-full glowup-gradient flex items-center justify-center shadow-lg shadow-pink-300/30 hover:shadow-xl transition-shadow">
                <Heart className="w-7 h-7 text-white fill-white" />
              </button>
              <button className="w-14 h-14 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center hover:bg-pink-100 transition-colors">
                <Star className="w-6 h-6 text-pink-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-5 mt-6 space-y-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-pink-400 font-semibold px-1">
          {t("quickActions")}
        </p>
        {[
          {
            icon: MessageCircle,
            label: t("sendMessage"),
            desc: t("sendMessageDesc"),
            color: "bg-pink-50 text-pink-500",
            onClick: onGoToChat,
          },
          {
            icon: Crown,
            label: t("playAGame"),
            desc: t("playAGameDesc"),
            color: "bg-purple-50 text-purple-500",
            onClick: onGoToGames,
          },
          {
            icon: Star,
            label: t("favourites"),
            desc: t("favouritesDesc"),
            color: "bg-amber-50 text-amber-500",
            onClick: () => {},
          },
        ].map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-pink-50 hover:shadow-md transition-shadow text-left"
          >
            <div
              className={`w-11 h-11 rounded-2xl ${item.color} flex items-center justify-center shrink-0`}
            >
              <item.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">{item.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Chat view                                                          */
/* ------------------------------------------------------------------ */

function ChatView({
  partnershipId,
  onGoToGames,
}: {
  partnershipId: Id<"partnerships">;
  onGoToGames: () => void;
}) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const messages = useQuery(api.messages.list, { partnershipId });
  const sendMessage = useMutation(api.messages.send);
  const generateUploadUrl = useMutation(api.messages.generateUploadUrl);
  const partnerInfo = useQuery(api.partnerships.getPartnerInfo, { partnershipId });

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setSending(true);
    try {
      await sendMessage({ partnershipId, content: text });
    } catch {
      toast.error("Failed to send message");
      setInput(text);
    }
    setSending(false);
    inputRef.current?.focus();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    try {
      // Convert to data URL for simplicity
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const mediaType = file.type.startsWith("image/") ? "photo" : file.type.startsWith("video/") ? "video" : "file";
      await sendMessage({
        partnershipId,
        content: mediaType === "photo" ? "📸 Photo" : mediaType === "video" ? "🎥 Video" : `📎 ${file.name}`,
        mediaUrl: dataUrl,
        mediaType,
        mediaName: file.name,
      });
    } catch {
      toast.error("Failed to upload file");
    }
    setUploading(false);
  };

  const getInitial = (name?: string) => {
    if (!name) return "💕";
    return name.charAt(0).toUpperCase();
  };

  if (!messages) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#fdf2f8] pb-20">
        <div className="animate-pulse text-pink-400 text-sm font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#fdf2f8]">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-pink-100 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full glowup-gradient flex items-center justify-center text-xs font-bold text-white shadow-sm">
            {getInitial(partnerInfo?.name)}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#3f3043]">
              {partnerInfo?.name || "Your partner"}
            </p>
            <p className="text-[11px] text-green-400 font-medium">● {t("online")}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-pink-400 hover:text-pink-500 hover:bg-pink-50 gap-1.5 rounded-xl"
            onClick={onGoToGames}
          >
            <Crown className="h-4 w-4" />
            <span className="hidden sm:inline text-sm font-medium">Play</span>
          </Button>
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-5 pb-24">
          {messages.length === 0 && (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-full glowup-gradient flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-200/40">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <p className="text-[#3f3043] font-semibold text-sm">
                {t("sayHello")}
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                {t("startConversation")}
              </p>
            </div>
          )}
          {messages.map((msg) => {
            const isMe = msg.senderId === user?._id;
            return (
              <div
                key={msg._id}
                className={`flex mb-3 ${isMe ? "justify-end" : "justify-start"}`}
              >
                {!isMe && (
                  <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center text-[10px] font-bold text-pink-500 shrink-0 mr-2 mt-1">
                    {getInitial(partnerInfo?.name)}
                  </div>
                )}
                <div className={`max-w-[75%] ${isMe ? "ml-10" : "mr-10"}`}>
                  {/* Media content */}
                  {msg.mediaUrl && msg.mediaType === "photo" && (
                    <div className="mb-1 rounded-2xl overflow-hidden border border-pink-50 shadow-sm">
                      <img src={msg.mediaUrl} alt={msg.mediaName || "Photo"} className="w-full max-h-60 object-cover" loading="lazy" />
                    </div>
                  )}
                  {msg.mediaUrl && msg.mediaType === "video" && (
                    <div className="mb-1 rounded-2xl overflow-hidden border border-pink-50 shadow-sm">
                      <video src={msg.mediaUrl} controls className="w-full max-h-60" preload="metadata" />
                    </div>
                  )}
                  {msg.mediaUrl && msg.mediaType === "file" && (
                    <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer"
                      className="mb-1 flex items-center gap-2 px-4 py-3 bg-white rounded-2xl border border-pink-50 shadow-sm hover:shadow-md transition-shadow">
                      <Paperclip className="w-4 h-4 text-pink-400 shrink-0" />
                      <span className="text-xs text-[#3f3043] truncate">{msg.mediaName || "File"}</span>
                    </a>
                  )}
                  <div
                    className={`px-4 py-2.5 text-sm leading-relaxed ${
                      isMe
                        ? "bg-gradient-to-r from-pink-400 to-fuchsia-400 text-white rounded-2xl rounded-br-md shadow-sm shadow-pink-200/30"
                        : "bg-white text-[#3f3043] rounded-2xl rounded-bl-md border border-pink-50 shadow-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <p
                    className={`text-[10px] text-pink-300 mt-1 ${
                      isMe ? "text-right" : "text-left"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          {uploading && (
            <div className="flex justify-end mb-3">
              <div className="bg-white rounded-2xl px-4 py-2.5 border border-pink-50 shadow-sm">
                <p className="text-xs text-pink-400 animate-pulse">📎 Uploading...</p>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="bg-white border-t border-pink-100 shrink-0 pb-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex gap-2.5 items-center">
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-11 w-11 shrink-0 rounded-full text-pink-400 hover:text-pink-500 hover:bg-pink-50"
            onClick={() => fileRef.current?.click()}
            disabled={sending || uploading}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <form onSubmit={handleSend} className="flex-1 flex gap-2.5">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("typeMessage")}
              className="h-11 flex-1 bg-pink-50/70 border-pink-100 rounded-2xl focus-visible:ring-pink-300 text-sm"
              disabled={sending}
              autoFocus
            />
            <Button
              type="submit"
              size="icon"
              className="h-11 w-11 shrink-0 rounded-full glowup-gradient border-0 shadow-md shadow-pink-200/30 hover:shadow-lg transition-shadow text-white"
              disabled={!input.trim() || sending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Favourites view                                                    */
/* ------------------------------------------------------------------ */

function FavouritesView() {
  const [favourites] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-[#fdf2f8] pb-24 pt-4">
      <div className="px-5 py-4">
        <h1 className="text-lg font-bold text-[#3f3043]">Favourites</h1>
        <p className="text-sm text-gray-400 mt-0.5">Moments you've saved</p>
      </div>

      {favourites.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-24 px-6">
          <div className="w-16 h-16 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center mb-4">
            <Star className="w-7 h-7 text-pink-300" />
          </div>
          <p className="text-sm font-semibold text-[#3f3043]">No favourites yet</p>
          <p className="text-xs text-gray-400 mt-1 text-center leading-relaxed">
            Save your favourite messages and moments here
          </p>
        </div>
      ) : (
        <div className="px-5 mt-2 space-y-3">
          {favourites.map((fav, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 shadow-sm border border-pink-50"
            >
              <p className="text-sm text-[#3f3043]">{fav}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Profile view                                                       */
/* ------------------------------------------------------------------ */

function ProfileView({
  user,
  onSignOut,
  onOpenSettings,
}: {
  user: { name?: string; email?: string; _creationTime?: number } | null | undefined;
  onSignOut: () => void;
  onOpenSettings: () => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#fdf2f8] pb-24 pt-4">
      {/* Profile header */}
      <div className="relative">
        <div className="bg-gradient-to-br from-[#f472b6] via-[#ec4899] to-[#e879a6] px-7 pt-8 pb-16 text-center text-white">
          <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/40 mx-auto flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {user?.name?.charAt(0) || "U"}
            </span>
          </div>
          <p className="mt-3 text-lg font-bold">{user?.name || "Your Name"}</p>
          <p className="text-xs text-white/60">{user?.email || "you@example.com"}</p>
        </div>

        {/* Profile menu */}
        <div className="relative -mt-8 bg-white rounded-t-3xl px-6 py-5 space-y-1 mx-4 shadow-sm">
          {[
            { icon: User, label: t("personalDetail"), action: undefined },
            { icon: Settings, label: t("settings"), action: onOpenSettings },
            { icon: Shield, label: t("termsAndConditions"), action: undefined },
            { icon: Bell, label: t("privacyPolicy"), action: undefined },
            { icon: Heart, label: t("aboutUs"), action: undefined },
          ].map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0 hover:bg-pink-50/50 transition-colors rounded-lg px-1"
              onClick={item.action}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>
          ))}

          <button
            className="w-full mt-4 h-12 rounded-2xl glowup-gradient text-white text-sm font-semibold shadow-md shadow-pink-200/30 hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
            onClick={onSignOut}
          >
            <LogOut className="w-4 h-4" />
            {t("logout")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard root                                                     */
/* ------------------------------------------------------------------ */

type DashboardMode =
  | { view: "chat" }
  | { view: "games-lobby" }
  | { view: "game"; gameId: Id<"games"> }
  | { view: "settings" };

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const partnership = useQuery(api.partnerships.getMyPartnership);
  const partnerInfo = useQuery(
    api.partnerships.getPartnerInfo,
    partnership && partnership.partner2
      ? { partnershipId: partnership._id }
      : "skip",
  );
  const [mode, setMode] = useState<DashboardMode>({ view: "chat" });
  const [activeTab, setActiveTab] = useState<BottomNavTab>("chat");

  const activeGame = useQuery(
    api.games.get,
    mode.view === "game" ? { gameId: mode.gameId } : "skip",
  );

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleTabChange = (tab: BottomNavTab) => {
    setActiveTab(tab);
    if (tab === "games") {
      setMode({ view: "games-lobby" });
    } else {
      if (mode.view === "games-lobby" || mode.view === "game" || mode.view === "settings") {
        setMode({ view: "chat" });
      }
    }
  };

  if (partnership === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf2f8]">
        <div className="animate-pulse text-pink-400 text-sm font-medium">Loading...</div>
      </div>
    );
  }

  if (partnership === null) {
    return <PartnerSetup onCreated={() => {}} />;
  }

  if (!partnership.partner2) {
    return (
      <WaitingScreen
        pairingCode={partnership.pairingCode}
        onSignOut={handleSignOut}
      />
    );
  }

  const partnerName = partnerInfo?.name || "Partner";

  // Full-screen game view (overrides everything, no bottom nav)
  if (mode.view === "game") {
    if (!activeGame) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#fdf2f8]">
          <div className="animate-pulse text-pink-400 text-sm font-medium">Loading game...</div>
        </div>
      );
    }

    const goBackToLobby = () => setMode({ view: "games-lobby" });

    const gameProps = { game: activeGame, currentUserId: user?._id!, partnerName, onBack: goBackToLobby };
    if (activeGame.gameType === "chess") return <ChessGame {...gameProps} />;
    if (activeGame.gameType === "tictactoe") return <TicTacToe {...gameProps} />;
    if (activeGame.gameType === "connect4") return <ConnectFour {...gameProps} />;
    if (activeGame.gameType === "rps") return <RpsGame {...gameProps} />;
    if (activeGame.gameType === "memory") return <MemoryGame {...gameProps} />;
    if (activeGame.gameType === "wordscramble") return <WordScrambleGame {...gameProps} />;
    if (activeGame.gameType === "wyr") return <WouldYouRatherGame {...gameProps} />;
    if (activeGame.gameType === "trivia") return <TriviaGame {...gameProps} />;
    if (activeGame.gameType === "minesweeper") return <MinesweeperGame {...gameProps} />;
    if (activeGame.gameType === "guessnumber") return <GuessNumberGame {...gameProps} />;
  }

  // Main views with bottom nav
  return (
    <div className="min-h-screen bg-[#fdf2f8]">
      {/* Games lobby — can be triggered from chat header or bottom nav */}
      {mode.view === "games-lobby" && (
        <GamesLobby
          partnershipId={partnership._id}
          currentUserId={user?._id!}
          partnerName={partnerName}
          onBack={() => {
            setActiveTab("chat");
            setMode({ view: "chat" });
          }}
          onStartGame={(gameId) => setMode({ view: "game", gameId })}
        />
      )}

      {/* Regular tab views (only when not in games lobby) */}
      {mode.view === "chat" && activeTab === "discover" && (
        <DiscoverView
          partnerInfo={partnerInfo ?? undefined}
          onGoToChat={() => handleTabChange("chat")}
          onGoToGames={() => {
            setActiveTab("games");
            setMode({ view: "games-lobby" });
          }}
        />
      )}
      {mode.view === "chat" && activeTab === "chat" && (
        <ChatView
          partnershipId={partnership._id}
          onGoToGames={() => {
            setActiveTab("games");
            setMode({ view: "games-lobby" });
          }}
        />
      )}
      {mode.view === "chat" && activeTab === "memories" && (
        <MemoriesGallery
          partnershipId={partnership._id}
          currentUserId={user?._id!}
          onBack={() => {
            setActiveTab("discover");
            setMode({ view: "chat" });
          }}
        />
      )}
      {mode.view === "settings" && (
        <SettingsView
          onBack={() => {
            setActiveTab("profile");
            setMode({ view: "chat" });
          }}
          onSignOut={handleSignOut}
        />
      )}
      {mode.view === "chat" && activeTab === "profile" && (
        <ProfileView
          user={user}
          onSignOut={handleSignOut}
          onOpenSettings={() => setMode({ view: "settings" })}
        />
      )}

      <BottomNav active={activeTab} onChange={handleTabChange} />
    </div>
  );
}
