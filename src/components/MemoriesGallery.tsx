import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Image as ImageIcon,
  Film,
  Calendar,
  X,
  Upload,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Id } from "@/convex/_generated/dataModel";
import { MediaViewer, type MediaItem } from "./MediaViewer";

interface MemoriesGalleryProps {
  partnershipId: Id<"partnerships">;
  currentUserId: Id<"users">;
  onBack: () => void;
}

export function MemoriesGallery({
  partnershipId,
  currentUserId,
  onBack,
}: MemoriesGalleryProps) {
  const { t } = useLanguage();
  const memories = useQuery(api.memories.list, { partnershipId });
  const addMemory = useMutation(api.memories.add);
  const removeMemory = useMutation(api.memories.remove);
  const generateUploadUrl = useMutation(api.memories.generateUploadUrl);

  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Id<"memories"> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    // Validate file type
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error("Only images and videos are accepted");
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File too large (max 50MB)");
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setShowUpload(true);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadProgress("Generating upload URL...");

    try {
      const uploadUrl = await generateUploadUrl();
      setUploadProgress("Uploading file...");

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      if (!response.ok) throw new Error("Upload failed");

      const { storageId } = await response.json();
      const mediaType = selectedFile.type.startsWith("image/")
        ? "photo"
        : "video";

      setUploadProgress("Saving memory...");
      await addMemory({
        partnershipId,
        storageId: storageId as string,
        type: mediaType,
        caption: caption.trim() || undefined,
      });

      toast.success("Memory saved! ❤️");
      setShowUpload(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to upload");
    }
    setUploading(false);
    setUploadProgress("");
  };

  const handleDelete = async (memoryId: Id<"memories">) => {
    try {
      await removeMemory({ memoryId });
      toast.success("Memory deleted");
      setConfirmDelete(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const mediaItems: MediaItem[] =
    memories?.map((m) => ({
      url: m.url!,
      type: m.type,
      caption: m.caption,
    })) ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf2f8]">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-pink-100 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl text-pink-400 hover:text-pink-500 hover:bg-pink-50"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <p className="text-sm font-semibold text-[#3f3043]">
              {t("memoriesTitle")}
            </p>
            <p className="text-xs text-pink-400">{t("memoriesSubtitle")}</p>
          </div>
        </div>
        <Button
          size="icon"
          className="h-9 w-9 rounded-full glowup-gradient border-0 shadow-md shadow-pink-200/30 text-white"
          onClick={() => fileRef.current?.click()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </header>

      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-lg mx-auto px-5 pt-6 pb-32">
          {!memories ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-pulse text-pink-400 text-sm font-medium">
                Loading...
              </div>
            </div>
          ) : memories.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-20 px-6">
              <div className="w-20 h-20 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center mb-5">
                <ImageIcon className="w-8 h-8 text-pink-300" />
              </div>
              <p className="text-sm font-semibold text-[#3f3043]">
                {t("memoriesEmpty")}
              </p>
              <p className="text-xs text-gray-400 mt-1 text-center leading-relaxed max-w-[250px]">
                {t("memoriesEmptyDesc")}
              </p>
              <Button
                className="mt-6 h-10 text-sm font-semibold rounded-xl glowup-gradient border-0 shadow-md shadow-pink-200/30 text-white"
                onClick={() => fileRef.current?.click()}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("addMemory")}
              </Button>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="flex gap-3 mb-6">
                <div className="flex-1 bg-white rounded-2xl p-3 border border-pink-50 shadow-sm text-center">
                  <p className="text-lg font-bold text-[#3f3043]">
                    {memories.length}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                    {t("totalMemories")}
                  </p>
                </div>
                <div className="flex-1 bg-white rounded-2xl p-3 border border-pink-50 shadow-sm text-center">
                  <p className="text-lg font-bold text-[#3f3043]">
                    {memories.filter((m) => m.type === "photo").length}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                    📸 {t("photos")}
                  </p>
                </div>
                <div className="flex-1 bg-white rounded-2xl p-3 border border-pink-50 shadow-sm text-center">
                  <p className="text-lg font-bold text-[#3f3043]">
                    {memories.filter((m) => m.type === "video").length}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                    🎥 {t("videos")}
                  </p>
                </div>
              </div>

              {/* Gallery grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {memories.map((memory, idx) => (
                  <div
                    key={memory._id}
                    className="relative group aspect-square rounded-2xl overflow-hidden bg-pink-50 border border-pink-50 shadow-sm cursor-pointer"
                    onClick={() => setViewerIndex(idx)}
                  >
                    {memory.type === "photo" ? (
                      <img
                        src={memory.url!}
                        alt={memory.caption || "Memory"}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
                        <Film className="w-8 h-8 text-pink-300" />
                      </div>
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDelete(memory._id);
                        }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </button>

                      {/* Bottom info */}
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        {memory.caption && (
                          <p className="text-[10px] text-white font-medium truncate">
                            {memory.caption}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-0.5">
                          <Calendar className="w-2.5 h-2.5 text-white/60" />
                          <span className="text-[9px] text-white/60">
                            {formatDate(memory.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Type badge */}
                    <div className="absolute top-2 left-2 bg-black/30 rounded-full px-1.5 py-0.5">
                      <span className="text-[9px] text-white">
                        {memory.type === "photo" ? "📸" : "🎥"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upload modal */}
      {showUpload && (
        <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center">
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 pb-8 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-[#3f3043]">
                {t("addMemory")}
              </h3>
              <button
                onClick={() => {
                  setShowUpload(false);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setCaption("");
                }}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="mb-4 rounded-2xl overflow-hidden border border-pink-50">
                {selectedFile?.type.startsWith("image/") ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full max-h-48 object-cover"
                  />
                ) : (
                  <video
                    src={previewUrl}
                    className="w-full max-h-48 object-cover"
                    preload="metadata"
                  />
                )}
              </div>
            )}

            {/* Caption input */}
            <Input
              placeholder={t("memoryCaptionPlaceholder")}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="h-11 bg-pink-50/70 border-pink-100 rounded-xl mb-4 text-sm"
            />

            {/* Upload button */}
            <Button
              className="w-full h-12 text-sm font-semibold rounded-xl glowup-gradient border-0 shadow-md shadow-pink-200/30 text-white"
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
            >
              {uploading ? (
                <span className="animate-pulse">{uploadProgress}</span>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {t("saveMemory")}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-base font-semibold text-[#3f3043]">
              {t("deleteMemoryTitle")}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {t("deleteMemoryDesc")}
            </p>
            <div className="flex gap-3 mt-5">
              <Button
                variant="outline"
                className="flex-1 h-10 rounded-xl border-pink-100 text-gray-500"
                onClick={() => setConfirmDelete(null)}
              >
                {t("cancel")}
              </Button>
              <Button
                className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white border-0"
                onClick={() => handleDelete(confirmDelete)}
              >
                {t("delete")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Media viewer */}
      {viewerIndex !== null && mediaItems.length > 0 && (
        <MediaViewer
          items={mediaItems}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </div>
  );
}
