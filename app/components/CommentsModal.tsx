"use client";

import { useState, useEffect, useRef } from "react";
import { X, Heart, MessageCircle, Send } from "lucide-react";
import { Comment, addComment, getCommentsForVideo, isCommentLiked, likeComment, unlikeComment } from "@/lib/data";

interface CommentsModalProps {
  videoId: number;
  isOpen: boolean;
  onClose: () => void;
  commentCount: number;
}

export function CommentsModal({ videoId, isOpen, onClose, commentCount }: CommentsModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set());
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [showReplies, setShowReplies] = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const videoComments = getCommentsForVideo(videoId);
      setComments(videoComments);
      // Load liked comments from storage
      const likedSet = new Set<number>();
      videoComments.forEach(c => {
        if (isCommentLiked(c.id)) likedSet.add(c.id);
      });
      setLikedComments(likedSet);
      // Focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, videoId]);

  useEffect(() => {
    // Scroll to bottom when new comments added
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  const handlePostComment = () => {
    if (!newComment.trim()) return;

    if (replyingTo) {
      // Post reply
      const reply: Comment = {
        id: Date.now(),
        videoId: videoId,
        username: "currentuser",
        text: `@${replyingTo.username} ${newComment.trim()}`,
        likes: 0,
        time: "Just now"
      };

      addComment(reply);
      setComments(prev => [...prev, reply]);
      setNewComment("");
      setReplyingTo(null);
    } else {
      // Post regular comment
      const comment: Comment = {
        id: Date.now(),
        videoId: videoId,
        username: "currentuser", // Current user
        text: newComment.trim(),
        likes: 0,
        time: "Just now"
      };

      addComment(comment);
      setComments(prev => [...prev, comment]);
      setNewComment("");
    }
  };

  const handleLikeComment = (commentId: number) => {
    setLikedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
        unlikeComment(commentId);
      } else {
        newSet.add(commentId);
        likeComment(commentId);
      }
      return newSet;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePostComment();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/80 z-50 flex items-end animate-in slide-in-from-bottom duration-300">
      <div className="w-full bg-[#1a1a1a] rounded-t-2xl max-h-[70%] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="text-white font-semibold">{comments.length} comments</span>
          <button 
            onClick={onClose} 
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Comments List */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {comments.length === 0 ? (
            <div className="text-center text-white/40 py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No comments yet</p>
              <p className="text-sm">Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.username}`}
                  alt={comment.username}
                  className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 text-sm font-medium">{comment.username}</span>
                    <span className="text-white/40 text-xs">{comment.time}</span>
                  </div>
                  <p className="text-white text-sm mt-1 break-words">{comment.text}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <button 
                      onClick={() => handleLikeComment(comment.id)}
                      className={`flex items-center gap-1 text-xs transition-colors ${
                        likedComments.has(comment.id) 
                          ? "text-[#fe2c55]" 
                          : "text-white/40 hover:text-white/60"
                      }`}
                    >
                      <Heart 
                        className={`w-4 h-4 ${likedComments.has(comment.id) ? "fill-current" : ""}`} 
                      />
                      {comment.likes + (likedComments.has(comment.id) ? 1 : 0)}
                    </button>
                    <button 
                      onClick={() => {
                        setReplyingTo(comment);
                        inputRef.current?.focus();
                      }}
                      className="text-white/40 text-xs hover:text-white/60 transition-colors"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-[#1a1a1a]">
          {replyingTo && (
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-white/60 text-xs">
                Replying to <span className="text-[#fe2c55]">@{replyingTo.username}</span>
              </span>
              <button 
                onClick={() => setReplyingTo(null)}
                className="text-white/40 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>
          )}
          <div className="flex gap-3 items-center">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser&backgroundColor=b6e3f4"
              alt="You"
              className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0"
            />
            <div className="flex-1 flex gap-2">
              <input 
                ref={inputRef}
                type="text" 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={replyingTo ? `Reply to ${replyingTo.username}...` : "Add a comment..."}
                className="flex-1 bg-white/10 rounded-full px-4 py-2.5 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#fe2c55]/50"
              />
              <button 
                onClick={handlePostComment}
                disabled={!newComment.trim()}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                  newComment.trim() 
                    ? "text-[#fe2c55] hover:bg-[#fe2c55]/10" 
                    : "text-white/30 cursor-not-allowed"
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