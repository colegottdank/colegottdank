"use client";

import { useState, useRef, useEffect } from "react";
import { X, Heart, Bookmark, Share2, Flag, EyeOff, Link2, Gauge } from "lucide-react";
import { Video } from "@/lib/data";
import { toast } from "./Toast";

interface LongPressMenuProps {
  isOpen: boolean;
  onClose: () => void;
  video: Video | null;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
  onReport: () => void;
  onPlaybackRateChange?: (rate: number) => void;
  playbackRate?: number;
  isLiked: boolean;
  isSaved: boolean;
}

export function LongPressMenu({
  isOpen,
  onClose,
  video,
  onLike,
  onSave,
  onShare,
  onReport,
  onPlaybackRateChange,
  playbackRate = 1,
  isLiked,
  isSaved
}: LongPressMenuProps) {
  const [showNotInterestedConfirm, setShowNotInterestedConfirm] = useState(false);
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);

  if (!isOpen || !video) return null;

  const handleNotInterested = () => {
    setShowNotInterestedConfirm(true);
  };

  const confirmNotInterested = () => {
    toast.success("We'll show you fewer videos like this");
    setShowNotInterestedConfirm(false);
    onClose();
  };

  const handleCopyLink = () => {
    const url = `https://tiktok.com/@${video.username}/video/${video.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
    onClose();
  };

  return (
    <div 
      className="absolute inset-0 bg-black/60 z-50 flex items-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full bg-[#1a1a1a] rounded-t-2xl overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Video Preview Header */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-12 h-16 bg-gray-800 rounded-lg overflow-hidden">
            <video src={video.url} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium line-clamp-1">{video.caption}</p>
            <p className="text-white/50 text-sm">@{video.username}</p>
          </div>
        </div>

        {/* Playback Speed Options */}
        {showSpeedOptions ? (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white font-semibold">Playback speed</p>
              <button 
                onClick={() => setShowSpeedOptions(false)}
                className="text-white/60 text-sm"
              >
                Back
              </button>
            </div>
            <div className="space-y-2">
              {[0.5, 1, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => {
                    onPlaybackRateChange?.(rate);
                    toast.success(`Playback speed: ${rate}x`);
                    onClose();
                  }}
                  className="w-full p-3 flex items-center justify-between hover:bg-white/5 rounded-xl transition-colors"
                >
                  <span className="text-white">{rate}x</span>
                  {playbackRate === rate && (
                    <div className="w-5 h-5 bg-[#fe2c55] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : showNotInterestedConfirm ? (
          <div className="p-6 text-center">
            <p className="text-white font-semibold mb-2">Not interested?</p>
            <p className="text-white/60 text-sm mb-4">We'll show you fewer videos like this one.</p>
            <div className="flex gap-3">
              <button 
                onClick={confirmNotInterested}
                className="flex-1 py-3 bg-[#fe2c55] text-white rounded-full font-semibold"
              >
                Yes, hide
              </button>
              <button 
                onClick={() => setShowNotInterestedConfirm(false)}
                className="flex-1 py-3 bg-white/10 text-white rounded-full font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {/* Like */}
            <button 
              onClick={() => { onLike(); onClose(); }}
              className="w-full px-4 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isLiked ? 'bg-[#fe2c55]/20' : 'bg-white/10'}`}>
                <Heart className={`w-5 h-5 ${isLiked ? 'text-[#fe2c55] fill-[#fe2c55]' : 'text-white'}`} />
              </div>
              <span className="text-white font-medium">{isLiked ? 'Unlike' : 'Like'}</span>
            </button>

            {/* Save */}
            <button 
              onClick={() => { onSave(); onClose(); }}
              className="w-full px-4 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSaved ? 'bg-[#fe2c55]/20' : 'bg-white/10'}`}>
                <Bookmark className={`w-5 h-5 ${isSaved ? 'text-[#fe2c55] fill-[#fe2c55]' : 'text-white'}`} />
              </div>
              <span className="text-white font-medium">{isSaved ? 'Remove from saved' : 'Save video'}</span>
            </button>

            {/* Share */}
            <button 
              onClick={() => { onShare(); onClose(); }}
              className="w-full px-4 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-medium">Share</span>
            </button>

            {/* Playback Speed */}
            <button 
              onClick={() => setShowSpeedOptions(true)}
              className="w-full px-4 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Gauge className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <span className="text-white font-medium">Playback speed</span>
                <span className="text-white/50 text-sm ml-2">{playbackRate}x</span>
              </div>
            </button>

            {/* Copy Link */}
            <button 
              onClick={handleCopyLink}
              className="w-full px-4 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-medium">Copy link</span>
            </button>

            {/* Not Interested */}
            <button 
              onClick={handleNotInterested}
              className="w-full px-4 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <EyeOff className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-medium">Not interested</span>
            </button>

            {/* Report */}
            <button 
              onClick={() => { onReport(); onClose(); }}
              className="w-full px-4 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Flag className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-white font-medium">Report</span>
            </button>

            {/* Cancel */}
            <button 
              onClick={onClose}
              className="w-full px-4 py-4 text-center text-white/60 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
