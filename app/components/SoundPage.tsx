"use client";

import { useState, useEffect } from "react";
import { X, Play, Heart, Bookmark, Share2, UserPlus, UserCheck } from "lucide-react";
import { Video, sampleVideos, isFollowing, followUser, unfollowUser } from "@/lib/data";

interface SoundPageProps {
  soundId: string | null;
  soundName: string;
  isOpen: boolean;
  onClose: () => void;
  onVideoSelect?: (video: Video) => void;
  onUseSound?: () => void;
}

export function SoundPage({ soundId, soundName, isOpen, onClose, onVideoSelect, onUseSound }: SoundPageProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState<"videos" | "favorites">("videos");

  useEffect(() => {
    if (isOpen && soundId) {
      // Filter videos that use this sound
      const videosWithSound = sampleVideos.filter(v => v.soundId === soundId);
      setVideos(videosWithSound);
    }
  }, [isOpen, soundId]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  if (!isOpen || !soundId) return null;

  return (
    <div className="absolute inset-0 bg-black z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0f0f0f]">
        <button 
          onClick={onClose}
          className="text-white/60 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
        <span className="text-white font-semibold text-lg truncate max-w-[200px]">{soundName}</span>
        <button 
          onClick={() => setIsFavorited(!isFavorited)}
          className="text-white/60 hover:text-white"
        >
          <Heart className={`w-6 h-6 ${isFavorited ? "fill-[#fe2c55] text-[#fe2c55]" : ""}`} />
        </button>
      </div>

      {/* Sound Info */}
      <div className="p-6 bg-[#0f0f0f] border-b border-white/10">
        <div className="flex items-center gap-4">
          {/* Spinning Record */}
          <div 
            className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-4 border-white/10 overflow-hidden relative animate-spin"
            style={{ animationDuration: '5s' }}
          >
            <img 
              src="https://images.unsplash.com/photo-1493225255756-d9584f8606e8?w=200&h=200&fit=crop" 
              alt="Album Cover"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement?.classList.add('bg-gradient-to-br', 'from-[#fe2c55]', 'to-purple-600');
              }}
            />
            <div className="absolute inset-0 rounded-full border border-white/10" />
            <div className="absolute inset-[4px] rounded-full border border-white/10" />
            <div className="absolute inset-[8px] rounded-full border border-white/10" />
            <div className="absolute inset-[12px] rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-white/20" />
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-white font-bold text-lg line-clamp-2">{soundName}</h2>
            <p className="text-white/60 text-sm">{formatNumber(videos.length * 1234)} videos</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button 
            onClick={() => {
              onUseSound?.();
              onClose();
            }}
            className="flex-1 bg-[#fe2c55] text-white py-3 rounded-md font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#fe2c55]/90 transition-colors"
          >
            <Play className="w-4 h-4 fill-white" />
            Use this sound
          </button>
          <button 
            onClick={() => setIsFavorited(!isFavorited)}
            className={`px-4 py-3 rounded-md font-semibold text-sm transition-colors ${
              isFavorited 
                ? "bg-white/10 text-[#fe2c55]" 
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isFavorited ? "fill-[#fe2c55]" : ""}`} />
          </button>
          <button 
            onClick={() => {
              const url = `https://tiktok.com/music/${soundId}`;
              navigator.clipboard.writeText(url);
              alert('Sound link copied to clipboard!');
            }}
            className="px-4 py-3 bg-white/10 rounded-md hover:bg-white/20 transition-colors"
          >
            <Share2 className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-[#0f0f0f]">
        <button
          onClick={() => setActiveTab("videos")}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "videos" ? "text-white" : "text-white/50"
          }`}
        >
          Videos
          {activeTab === "videos" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#fe2c55]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("favorites")}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "favorites" ? "text-white" : "text-white/50"
          }`}
        >
          Favorites
          {activeTab === "favorites" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#fe2c55]" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#0f0f0f] p-2">
        {activeTab === "videos" && (
          videos.length > 0 ? (
            <div className="grid grid-cols-3 gap-1">
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
                <Play className="w-8 h-8 text-white/40" />
              </div>
              <p>No videos with this sound yet</p>
              <p className="text-sm mt-1">Be the first to use it!</p>
            </div>
          )
        )}

        {activeTab === "favorites" && (
          <div className="text-center text-white/40 py-12">
            <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Favorite sounds will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
