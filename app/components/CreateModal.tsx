"use client";

import { useState, useRef } from "react";
import { X, Upload, Globe, Users, MessageCircle, Check, ChevronRight, Loader2 } from "lucide-react";
import { videos as videosApi, ApiError } from "@/lib/api-client";

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPosted?: () => void;
}

const MAX_BYTES = 100 * 1024 * 1024; // 100MB
const ALLOWED = ["video/mp4", "video/webm"];

type Visibility = "everyone" | "friends" | "private";

// Grab the first frame of a video File as a JPEG blob (best-effort; resolves null on failure).
function extractThumb(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.src = url;
    const cleanup = () => URL.revokeObjectURL(url);
    const fail = () => { cleanup(); resolve(null); };
    video.onloadeddata = () => {
      try { video.currentTime = Math.min(0.1, video.duration || 0.1); } catch { fail(); }
    };
    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 720;
        canvas.height = video.videoHeight || 1280;
        const ctx = canvas.getContext("2d");
        if (!ctx) return fail();
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((b) => { cleanup(); resolve(b); }, "image/jpeg", 0.8);
      } catch { fail(); }
    };
    video.onerror = fail;
  });
}

export function CreateModal({ isOpen, onClose, onPosted }: CreateModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("everyone");
  const [allowComments, setAllowComments] = useState(true);
  const [showVisibilityPicker, setShowVisibilityPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"compose" | "review">("compose");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setCaption("");
    setVisibility("everyone");
    setAllowComments(true);
    setUploading(false);
    setProgress(0);
    setError(null);
    setPhase("compose");
  };

  const close = () => { reset(); onClose(); };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setError(null);
    if (!ALLOWED.includes(f.type)) {
      setError("Only MP4 or WebM videos are supported.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("Video must be 100MB or smaller.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handlePost = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setError(null);
    try {
      const thumb = await extractThumb(file);
      const hashtags = (caption.match(/#[\w]+/g) || []).join(" ");
      const form = new FormData();
      form.append("file", file);
      if (thumb) form.append("thumb", new File([thumb], "thumb.jpg", { type: "image/jpeg" }));
      form.append("caption", caption.slice(0, 300));
      form.append("hashtags", hashtags);
      form.append("visibility", visibility);
      form.append("allowComments", String(allowComments));
      await videosApi.create(form, setProgress);
      setPhase("review");
      onPosted?.();
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 422) setError(`Blocked: ${e.reason || "failed moderation"}`);
        else if (e.status === 429) setError("Upload limit reached. Try again later.");
        else if (e.status === 401) setError("Log in to upload.");
        else setError(e.message);
      } else {
        setError("Upload failed. Try again.");
      }
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  // Success / "being reviewed" state
  if (phase === "review") {
    return (
      <div className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-full bg-[#fe2c55]/20 flex items-center justify-center mb-5">
          <Check className="w-10 h-10 text-[#fe2c55]" />
        </div>
        <h3 className="text-white text-xl font-semibold mb-2">Your video is being reviewed</h3>
        <p className="text-white/60 text-sm max-w-xs mb-8">
          It&rsquo;ll go live once it passes our automated check. You can see it on your profile with a &ldquo;Pending&rdquo; badge until then.
        </p>
        <button onClick={close} className="px-8 py-3 bg-[#fe2c55] text-white rounded-lg font-semibold text-sm">
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black/95 z-50 flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <button onClick={close} disabled={uploading} className="text-white/60 hover:text-white disabled:opacity-40">
          <X className="w-6 h-6" />
        </button>
        <span className="text-white font-semibold text-lg">Upload</span>
        {file ? (
          <button onClick={handlePost} disabled={uploading} className="text-[#fe2c55] font-semibold text-sm disabled:opacity-40">
            {uploading ? "Posting…" : "Post"}
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {error && <p className="text-[#fe2c55] text-sm mb-3 px-1">{error}</p>}

        {!file ? (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-white/40 transition-colors"
            >
              <div className="w-16 h-16 bg-[#fe2c55]/20 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-[#fe2c55]" />
              </div>
              <p className="text-white font-semibold mb-2">Upload video</p>
              <p className="text-white/40 text-sm text-center">MP4 or WebM<br />Up to 100MB</p>
            </div>
            <input ref={fileInputRef} type="file" accept="video/mp4,video/webm" onChange={handleFileSelect} className="hidden" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview */}
            <div className="aspect-[9/16] max-h-[400px] bg-black rounded-xl overflow-hidden">
              {preview && <video src={preview} className="w-full h-full object-contain" controls muted />}
            </div>

            {/* Upload progress */}
            {uploading && (
              <div className="space-y-1">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#fe2c55] transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-white/50 text-xs text-right">{progress}%</p>
              </div>
            )}

            {/* Caption */}
            <div>
              <label className="text-white/60 text-sm mb-2 block">Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={300}
                placeholder="Describe your video… use #hashtags"
                className="w-full bg-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#fe2c55]/50 resize-none"
                rows={3}
              />
              <p className="text-white/40 text-xs mt-1 text-right">{caption.length}/300</p>
            </div>

            {/* Visibility */}
            <button
              onClick={() => setShowVisibilityPicker(true)}
              className="w-full flex items-center justify-between p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                {visibility === "everyone" ? <Globe className="w-5 h-5 text-white/60" /> :
                 visibility === "friends" ? <Users className="w-5 h-5 text-white/60" /> :
                 <X className="w-5 h-5 text-white/60" />}
                <span className="text-white text-sm">
                  {visibility === "everyone" ? "Everyone" : visibility === "friends" ? "Friends only" : "Only me"}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40" />
            </button>

            {/* Allow comments */}
            <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-white/60" />
                <span className="text-white text-sm">Allow comments</span>
              </div>
              <button
                onClick={() => setAllowComments(!allowComments)}
                className={`w-12 h-6 rounded-full relative transition-colors ${allowComments ? "bg-[#fe2c55]" : "bg-white/20"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${allowComments ? "left-7" : "left-1"}`} />
              </button>
            </div>

            <button
              onClick={() => { if (preview) URL.revokeObjectURL(preview); setFile(null); setPreview(null); setError(null); }}
              disabled={uploading}
              className="w-full py-3 text-[#fe2c55] text-sm font-medium disabled:opacity-40"
            >
              Choose different video
            </button>
          </div>
        )}
      </div>

      {/* Big progress overlay while uploading */}
      {uploading && (
        <div className="absolute inset-0 bg-black/60 z-10 flex flex-col items-center justify-center pointer-events-none">
          <Loader2 className="w-10 h-10 text-white animate-spin mb-3" />
          <p className="text-white text-sm">Uploading {progress}%</p>
        </div>
      )}

      {/* Visibility picker */}
      {showVisibilityPicker && (
        <div className="absolute inset-0 bg-black z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <button onClick={() => setShowVisibilityPicker(false)} className="text-white/60 hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <span className="text-white font-semibold text-lg">Who can view</span>
            <div className="w-10" />
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {([
                { value: "everyone", label: "Everyone", icon: Globe },
                { value: "friends", label: "Friends only", icon: Users },
                { value: "private", label: "Only me", icon: X },
              ] as const).map((option) => (
                <button
                  key={option.value}
                  onClick={() => { setVisibility(option.value); setShowVisibilityPicker(false); }}
                  className="w-full p-4 flex items-center justify-between hover:bg-white/5 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <option.icon className="w-5 h-5 text-white/60" />
                    <span className="text-white">{option.label}</span>
                  </div>
                  {visibility === option.value && <Check className="w-5 h-5 text-[#fe2c55]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
