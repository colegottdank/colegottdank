"use client";

import { useState, useEffect } from "react";
import { X, Play, Hash, TrendingUp } from "lucide-react";
import { discover as discoverApi, videos as videosApi, Video, DiscoverSort } from "@/lib/api-client";
import { VideoPlayer } from "./VideoPlayer";

interface HashtagPageProps {
  hashtag: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatNumber = (num: number) => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
};

export function HashtagPage({ hashtag, isOpen, onClose }: HashtagPageProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<DiscoverSort>("top");
  const [playing, setPlaying] = useState<Video | null>(null);
  const [muted, setMuted] = useState(true);

  // Reset to Top whenever a new hashtag opens.
  useEffect(() => {
    if (isOpen && hashtag) setActiveTab("top");
  }, [isOpen, hashtag]);

  // Fetch on open and whenever the sort tab changes.
  useEffect(() => {
    if (!isOpen || !hashtag) return;
    let cancelled = false;
    setLoading(true);
    discoverApi
      .hashtagVideos(hashtag, activeTab)
      .then((r) => { if (!cancelled) setVideos(r.videos); })
      .catch(() => { if (!cancelled) setVideos([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isOpen, hashtag, activeTab]);

  const playVideo = (video: Video) => {
    videosApi.view(video.id);
    setPlaying(video);
  };

  if (!isOpen || !hashtag) return null;

  const viewCount = videos.reduce((acc, v) => acc + v.views, 0);
  const tag = hashtag.replace(/^#/, "");

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
            <span className="text-white font-semibold text-lg truncate">{tag}</span>
          </div>
          <p className="text-white/50 text-sm">{formatNumber(videos.length)} videos · {formatNumber(viewCount)} views</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-[#0f0f0f]">
        {(["top", "recent"] as const).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setActiveTab(tabKey)}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative capitalize ${
              activeTab === tabKey ? "text-white" : "text-white/50"
            }`}
          >
            {tabKey}
            {activeTab === tabKey && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#fe2c55]" />}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#0f0f0f]">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 p-1">
            {videos.map((video) => (
              <button
                key={video.id}
                onClick={() => playVideo(video)}
                className="aspect-[3/4] bg-gray-800 relative group cursor-pointer overflow-hidden"
              >
                {video.thumbUrl ? (
                  <img src={video.thumbUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <video src={video.url} preload="metadata" muted playsInline className="w-full h-full object-cover" />
                )}
                <div className="absolute bottom-1 left-1 flex items-center gap-1 text-white text-[11px] drop-shadow">
                  <Play className="w-3 h-3 fill-white" />
                  {formatNumber(video.views)}
                </div>
              </button>
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

      {/* In-modal player overlay */}
      {playing && (
        <div className="absolute inset-0 bg-black z-[60] flex flex-col animate-in fade-in duration-200">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => setPlaying(null)} className="text-white/80 hover:text-white"><X className="w-6 h-6" /></button>
          </div>
          <div className="flex-1 relative" onClick={() => setMuted((m) => !m)}>
            <VideoPlayer
              src={playing.url}
              videoId={playing.id}
              isActive
              isPaused={false}
              muted={muted}
              loop
              onTogglePause={() => {}}
              onToggleMute={() => setMuted((m) => !m)}
            />
          </div>
          <div className="p-4 text-white">
            <p className="text-sm font-semibold">@{playing.user.username}</p>
            <p className="text-sm text-white/80">{playing.caption}</p>
          </div>
        </div>
      )}
    </div>
  );
}
