"use client";

import { useState, useEffect } from "react";
import { X, Play, Hash, TrendingUp } from "lucide-react";
import { Video, sampleVideos, followingVideos } from "@/lib/data";

interface HashtagPageProps {
  hashtag: string | null;
  isOpen: boolean;
  onClose: () => void;
  onVideoSelect?: (video: Video) => void;
}

export function HashtagPage({ hashtag, isOpen, onClose, onVideoSelect }: HashtagPageProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeTab, setActiveTab] = useState<"top" | "recent">("top");

  useEffect(() => {
    if (isOpen && hashtag) {
      // Filter all videos that contain this hashtag
      const allVideos = [...sampleVideos, ...followingVideos];
      const filtered = allVideos.filter(v => 
        v.hashtags.some(tag => tag.toLowerCase() === hashtag.toLowerCase())
      );
      setVideos(filtered);
    }
  }, [isOpen, hashtag]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  if (!isOpen || !hashtag) return null;

  // Calculate mock view count based on hashtag popularity
  const viewCount = videos.reduce((acc, v) => acc + v.views, 0);

  return (
    <div className="absolute inset-0 bg-black z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-[#0f0f0f]">
        <button onClick={onClose} className="text-white/60 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-[#fe2c55]" />
            <span className="text-white font-semibold text-lg truncate">{hashtag.replace('#', '')}</span>
          </div>
          <p className="text-white/50 text-sm">{formatNumber(viewCount)} views</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-[#0f0f0f]">
        <button
          onClick={() => setActiveTab("top")}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "top" ? "text-white" : "text-white/50"
          }`}
        >
          Top
          {activeTab === "top" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#fe2c55]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("recent")}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "recent" ? "text-white" : "text-white/50"
          }`}
        >
          Recent
          {activeTab === "recent" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#fe2c55]" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#0f0f0f]">
        {videos.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 p-1">
            {videos.map((video) => (
              <div 
                key={video.id} 
                onClick={() => {
                  onVideoSelect?.(video);
                  onClose();
                }}
                className="aspect-[3/4] bg-gray-800 relative group cursor-pointer overflow-hidden"
              >
                <video 
                  src={video.url}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-3 text-white text-sm">
                    <span className="flex items-center gap-1">
                      <Play className="w-4 h-4 fill-white" />
                      {(video.views / 1000).toFixed(1)}K
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-white/40 py-12">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white/40" />
            </div>
            <p>No videos with this hashtag yet</p>
            <p className="text-sm mt-1">Be the first to use it!</p>
          </div>
        )}
      </div>
    </div>
  );
}
