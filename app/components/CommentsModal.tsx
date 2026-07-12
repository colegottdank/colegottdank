"use client";

import { useState, useEffect, useRef } from "react";
import { X, Heart, MessageCircle, Send, Trash2 } from "lucide-react";
import { comments as commentsApi, Comment, ApiError } from "@/lib/api-client";
import { useAuth } from "./AuthContext";

interface CommentsModalProps {
  videoId: number;
  isOpen: boolean;
  onClose: () => void;
  commentCount: number;
  /** Video owner id — owners can delete any comment on their video. */
  videoOwnerId?: number | null;
  onCountChange?: (total: number) => void;
}

const relTime = (iso: string) => {
  const then = new Date(iso).getTime();
  if (isNaN(then)) return "";
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return `${Math.floor(d / 7)}w`;
};

const countAll = (list: Comment[]) => list.reduce((n, c) => n + 1 + (c.replies?.length || 0), 0);

export function CommentsModal({ videoId, isOpen, onClose, commentCount, videoOwnerId, onCountChange }: CommentsModalProps) {
  const { user, requireAuth } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [openReplies, setOpenReplies] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen || !videoId) return;
    setLoading(true);
    setError(null);
    commentsApi
      .list(videoId)
      .then((r) => setComments(r.comments))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [isOpen, videoId]);

  const emitCount = (list: Comment[]) => onCountChange?.(countAll(list));

  const handlePost = async () => {
    if (!requireAuth()) return;
    const text = newComment.trim();
    if (!text) return;
    setPosting(true);
    setError(null);
    try {
      const { comment } = await commentsApi.post(videoId, {
        text,
        parentId: replyingTo?.parentId ?? replyingTo?.id,
      });
      setComments((prev) => {
        let next: Comment[];
        if (comment.parentId) {
          next = prev.map((c) =>
            c.id === comment.parentId ? { ...c, replies: [...(c.replies || []), comment] } : c
          );
          setOpenReplies((s) => new Set(s).add(comment.parentId!));
        } else {
          next = [...prev, comment];
        }
        emitCount(next);
        return next;
      });
      setNewComment("");
      setReplyingTo(null);
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 422) setError(`Comment blocked: ${e.reason || "failed moderation"}`);
        else if (e.status === 403) setError("Comments are turned off for this video.");
        else if (e.status === 429) setError("You're commenting too fast. Slow down.");
        else setError(e.message);
      } else {
        setError("Couldn't post comment.");
      }
    } finally {
      setPosting(false);
    }
  };

  const canDelete = (c: Comment) =>
    !!user && (c.user.id === user.id || user.id === videoOwnerId || user.isAdmin);

  const handleDelete = async (c: Comment) => {
    const prev = comments;
    setComments((list) => {
      let next: Comment[];
      if (c.parentId) {
        next = list.map((p) => (p.id === c.parentId ? { ...p, replies: (p.replies || []).filter((r) => r.id !== c.id) } : p));
      } else {
        next = list.filter((x) => x.id !== c.id);
      }
      emitCount(next);
      return next;
    });
    try {
      await commentsApi.delete(c.id);
    } catch {
      setComments(prev);
      emitCount(prev);
    }
  };

  const handleLike = (c: Comment) => {
    if (!requireAuth()) return;
    const wasLiked = !!c.me?.liked;
    const apply = (liked: boolean, delta: number) => (x: Comment): Comment =>
      x.id === c.id ? { ...x, me: { liked }, likes: x.likes + delta } : x;
    const patch = (fn: (x: Comment) => Comment) =>
      setComments((list) => list.map((p) => ({ ...fn(p), replies: p.replies?.map(fn) })));
    patch(apply(!wasLiked, wasLiked ? -1 : 1));
    const call = wasLiked ? commentsApi.unlike(c.id) : commentsApi.like(c.id);
    call.catch(() => patch(apply(wasLiked, wasLiked ? 1 : -1)));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePost();
    }
  };

  if (!isOpen) return null;

  const total = comments.length ? countAll(comments) : commentCount;

  const CommentRow = ({ c, isReply }: { c: Comment; isReply?: boolean }) => (
    <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <img src={c.user.avatarUrl} alt={c.user.username} className="w-9 h-9 rounded-full bg-gray-700 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm font-medium">{c.user.username}</span>
          <span className="text-white/40 text-xs">{relTime(c.createdAt)}</span>
        </div>
        <p className="text-white text-sm mt-1 break-words">{c.text}</p>
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={() => { setReplyingTo(c); inputRef.current?.focus(); }}
            className="text-white/40 text-xs hover:text-white/60 transition-colors"
          >
            Reply
          </button>
          {canDelete(c) && (
            <button onClick={() => handleDelete(c)} className="text-white/40 text-xs hover:text-red-400 transition-colors flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          )}
        </div>
        {!isReply && c.replies && c.replies.length > 0 && (
          <button
            onClick={() =>
              setOpenReplies((s) => {
                const n = new Set(s);
                if (n.has(c.id)) n.delete(c.id); else n.add(c.id);
                return n;
              })
            }
            className="text-white/50 text-xs mt-2 hover:text-white/70"
          >
            {openReplies.has(c.id) ? "Hide replies" : `View replies (${c.replies.length})`}
          </button>
        )}
        {!isReply && openReplies.has(c.id) && c.replies && (
          <div className="mt-3 space-y-3 pl-2 border-l border-white/10">
            {c.replies.map((r) => <CommentRow key={r.id} c={r} isReply />)}
          </div>
        )}
      </div>
      <button
        onClick={() => handleLike(c)}
        className={`flex flex-col items-center gap-0.5 text-xs transition-colors ${c.me?.liked ? "text-[#fe2c55]" : "text-white/40 hover:text-white/60"}`}
      >
        <Heart className={`w-4 h-4 ${c.me?.liked ? "fill-current" : ""}`} />
        {c.likes > 0 && <span>{c.likes}</span>}
      </button>
    </div>
  );

  return (
    <div className="absolute inset-0 bg-black/80 z-50 flex items-end animate-in slide-in-from-bottom duration-300">
      <div className="w-full bg-[#1a1a1a] rounded-t-2xl max-h-[70%] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="text-white font-semibold">{total} comments</span>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-7 h-7 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-white/40 py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No comments yet</p>
              <p className="text-sm">Be the first to comment!</p>
            </div>
          ) : (
            comments.map((c) => <CommentRow key={c.id} c={c} />)
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-[#1a1a1a]">
          {error && <p className="text-[#fe2c55] text-xs mb-2 px-1">{error}</p>}
          {replyingTo && (
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-white/60 text-xs">
                Replying to <span className="text-[#fe2c55]">@{replyingTo.user.username}</span>
              </span>
              <button onClick={() => setReplyingTo(null)} className="text-white/40 hover:text-white text-xs">
                Cancel
              </button>
            </div>
          )}
          <div className="flex gap-3 items-center">
            <div className="flex-1 flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => { if (!user) requireAuth(); }}
                placeholder={replyingTo ? `Reply to ${replyingTo.user.username}...` : "Add a comment..."}
                className="flex-1 bg-white/10 rounded-full px-4 py-2.5 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#fe2c55]/50"
              />
              <button
                onClick={handlePost}
                disabled={!newComment.trim() || posting}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                  newComment.trim() && !posting ? "text-[#fe2c55] hover:bg-[#fe2c55]/10" : "text-white/30 cursor-not-allowed"
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
