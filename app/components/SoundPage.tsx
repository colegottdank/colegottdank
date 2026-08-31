"use client";

import { useState, useEffect } from "react";
import { X, Play } from "lucide-react";
import { discover as discoverApi, videos as videosApi, Video } from "@/lib/api-client";
import { VideoPlayer } from "./VideoPlayer";

interface SoundPageProps {
  soundName: string;
  isOpen: boolean;
  onClose: () => void;
  onUseSound?: () => void;
}

const formatNumber = (num: number) => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
};

export function SoundPage({ soundName, isOpen, onClose, onUseSound }: SoundPageProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState<Video | null>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    if (!isOpen || !soundName) return;
    let cancelled = false;
    setLoading(true);
    discoverApi
      .soundVideos(soundName, "top")
      .then((r) => { if (!cancelled) setVideos(r.videos); })
      .catch(() => { if (!cancelled) setVideos([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isOpen, soundName]);

  const playVideo = (video: Video) => {
    videosApi.view(video.id);
    setPlaying(video);
  };

  if (!isOpen || !soundName) return null;

  return (
    <div className="absolute inset-0 bg-black z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-[#0f0f0f]">
        <button onClick={onClose} className="text-white/60 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        <span className="text-white font-semibold text-lg truncate">{soundName}</span>
      </div>

      {/* Sound Info */}
      <div className="p-6 bg-[#0f0f0f] border-b border-white/10">
        <div className="flex items-center gap-4">
          {/* Spinning Record */}
          <div
            className="w-20 h-20 rounded-full bg-gradient-to-br from-[#fe2c55] to-purple-600 border-4 border-white/10 overflow-hidden relative animate-spin flex-shrink-0"
            style={{ animationDuration: "5s" }}
          >
            <div className="absolute inset-0 rounded-full border border-white/10" />
            <div className="absolute inset-[4px] rounded-full border border-white/10" />
            <div className="absolute inset-[8px] rounded-full border border-white/10" />
            <div className="absolute inset-[12px] rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-white/20" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold text-lg line-clamp-2">{soundName}</h2>
            <p className="text-white/60 text-sm">{formatNumber(videos.length)} videos</p>
          </div>
        </div>

        {/* Action */}
        <button
          onClick={() => { onUseSound?.(); onClose(); }}
          className="w-full mt-6 bg-[#fe2c55] text-white py-3 rounded-md font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#fe2c55]/90 transition-colors"
        >
          <Play className="w-4 h-4 fill-white" />
          Use this sound
        </button>
      </div>

      {/* Videos */}
      <div className="flex-1 overflow-y-auto bg-[#0f0f0f] p-2">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-3 gap-1">
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
              <Play className="w-8 h-8 text-white/40" />
            </div>
            <p>No videos with this sound yet</p>
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
