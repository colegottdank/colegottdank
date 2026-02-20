"use client";

import { useState } from "react";
import { X, Trash2, Clock, Play } from "lucide-react";
import { mockWatchHistory, WatchHistoryItem } from "@/lib/data";
import { toast } from "./Toast";

interface WatchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WatchHistoryModal({ isOpen, onClose }: WatchHistoryModalProps) {
  const [history, setHistory] = useState<WatchHistoryItem[]>(mockWatchHistory);

  const clearHistory = () => {
    setHistory([]);
    toast.success("Watch history cleared");
  };

  const removeItem = (index: number) => {
    setHistory(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0f0f0f]">
        <button onClick={onClose} className="text-white/60 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        <span className="text-white font-semibold text-lg">Watch history</span>
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            className="text-[#fe2c55] text-sm font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#0f0f0f]">
        {history.length === 0 ? (
          <div className="text-center text-white/40 py-12">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No watch history</p>
            <p className="text-sm mt-1">Videos you watch will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {history.map((item, index) => (
              <div key={`${item.video.id}-${index}`} className="p-4 flex gap-3">
                {/* Thumbnail */}
                <div className="relative w-24 h-32 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                  <video 
                    src={item.video.url}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Play className="w-8 h-8 text-white opacity-80" />
                  </div>
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div 
                      className="h-full bg-[#fe2c55]"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium line-clamp-2">{item.video.caption}</p>
                  <p className="text-white/50 text-sm mt-1">@{item.video.username}</p>
                  <p className="text-white/40 text-xs mt-1">{item.video.likes >= 1000 ? `${(item.video.likes / 1000).toFixed(1)}K` : item.video.likes} likes</p>
                  <p className="text-white/40 text-xs mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Watched {item.watchedAt}
                  </p>
                </div>

                {/* Remove button */}
                <button 
                  onClick={() => removeItem(index)}
                  className="text-white/40 hover:text-red-400 transition-colors self-center"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
