"use client";

import { useState, useEffect, useRef } from "react";
import { X, Search, TrendingUp, Clock, Music2, Hash } from "lucide-react";
import {
  discover as discoverApi,
  videos as videosApi,
  Video,
  User,
  TrendingHashtag,
  TrendingSound,
} from "@/lib/api-client";
import { getUserState, addToSearchHistory, saveUserState } from "@/lib/data";
import { VideoPlayer } from "./VideoPlayer";

interface DiscoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHashtagClick?: (hashtag: string) => void;
  onSoundClick?: (soundName: string) => void;
  onProfileClick?: (username: string) => void;
}

const formatNumber = (num: number) => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
};

export function DiscoverModal({ isOpen, onClose, onHashtagClick, onSoundClick, onProfileClick }: DiscoverModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [videoResults, setVideoResults] = useState<Video[]>([]);
  const [userResults, setUserResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [trendingTags, setTrendingTags] = useState<TrendingHashtag[]>([]);
  const [trendingSoundsList, setTrendingSoundsList] = useState<TrendingSound[]>([]);
  const [trendingLoaded, setTrendingLoaded] = useState(false);

  const [playing, setPlaying] = useState<Video | null>(null);
  const [muted, setMuted] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSearchHistory(getUserState().searchHistory);
    setTimeout(() => inputRef.current?.focus(), 100);
    // Load trending once.
    if (!trendingLoaded) {
      setTrendingLoaded(true);
      discoverApi.trendingHashtags().then((r) => setTrendingTags(r.hashtags)).catch(() => {});
      discoverApi.trendingSounds().then((r) => setTrendingSoundsList(r.sounds)).catch(() => {});
    }
  }, [isOpen, trendingLoaded]);

  // Debounced search (~300ms).
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setIsSearching(false);
      setVideoResults([]);
      setUserResults([]);
      return;
    }
    setIsSearching(true);
    setSearchLoading(true);
    const handle = setTimeout(() => {
      discoverApi
        .search(q)
        .then((r) => {
          setVideoResults(r.videos);
          setUserResults(r.users);
        })
        .catch(() => {
          setVideoResults([]);
          setUserResults([]);
        })
        .finally(() => setSearchLoading(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  const runSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      addToSearchHistory(query);
      setSearchHistory((prev) => [query, ...prev.filter((q) => q !== query)].slice(0, 10));
    }
  };

  const clearHistory = () => {
    const state = getUserState();
    state.searchHistory = [];
    saveUserState(state);
    setSearchHistory([]);
  };

  const openProfile = (username: string) => {
    onProfileClick?.(username);
    onClose();
  };

  const openSound = (name: string) => {
    onSoundClick?.(name);
    onClose();
  };

  const playVideo = (video: Video) => {
    videosApi.view(video.id);
    setPlaying(video);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-[#0f0f0f]">
        <div className="flex-1 flex items-center gap-3 bg-white/10 rounded-full px-4 py-2.5">
          <Search className="w-5 h-5 text-white/60" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") runSearch(searchQuery); }}
            placeholder="Search"
            className="flex-1 bg-transparent text-white text-sm placeholder:text-white/40 focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-white/60 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button onClick={onClose} className="text-white font-semibold text-sm whitespace-nowrap flex-shrink-0">
          Cancel
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#0f0f0f]">
        {isSearching ? (
          /* Search Results */
          searchLoading && videoResults.length === 0 && userResults.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="w-7 h-7 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : userResults.length === 0 && videoResults.length === 0 ? (
            <div className="text-center text-white/40 py-12">
              <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No results found</p>
            </div>
          ) : (
            <div className="pb-8">
              {/* Users */}
              {userResults.length > 0 && (
                <div className="p-4 border-b border-white/10">
                  <h3 className="text-white/60 text-sm mb-3">Accounts</h3>
                  <div className="space-y-1">
                    {userResults.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => openProfile(u.username)}
                        className="w-full flex items-center gap-3 py-2 px-1 hover:bg-white/5 rounded-lg transition-colors text-left"
                      >
                        <img src={u.avatarUrl} alt="" className="w-11 h-11 rounded-full bg-gray-700 object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="text-white font-medium truncate">{u.name}</p>
                            {u.verified && (
                              <span className="w-3.5 h-3.5 bg-[#20d5ec] rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-2 h-2 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                              </span>
                            )}
                          </div>
                          <p className="text-white/50 text-xs truncate">@{u.username} · {formatNumber(u.followers)} followers</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {videoResults.length > 0 && (
                <div className="p-4">
                  <h3 className="text-white/60 text-sm mb-3">Videos</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {videoResults.map((video) => (
                      <button
                        key={video.id}
                        onClick={() => playVideo(video)}
                        className="text-left bg-gray-900 rounded-lg overflow-hidden cursor-pointer group"
                      >
                        <div className="aspect-[3/4] bg-gray-800 relative overflow-hidden">
                          {video.thumbUrl ? (
                            <img src={video.thumbUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <video src={video.url} preload="metadata" muted playsInline className="w-full h-full object-cover" />
                          )}
                          <div className="absolute bottom-1 left-1 flex items-center gap-1 text-white text-[11px] drop-shadow">
                            <TrendingUp className="w-3 h-3" />
                            {formatNumber(video.views)}
                          </div>
                        </div>
                        <div className="p-2">
                          <p className="text-white text-xs truncate">{video.caption}</p>
                          <p className="text-white/50 text-xs truncate">@{video.user.username}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        ) : (
          <>
            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white/60 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recent
                  </h3>
                  <button onClick={clearHistory} className="text-[#fe2c55] text-sm">
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => runSearch(query)}
                      className="px-3 py-1.5 bg-white/10 rounded-full text-white text-sm hover:bg-white/20 transition-colors"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Hashtags */}
            {trendingTags.length > 0 && (
              <div className="p-4 border-b border-white/10">
                <h3 className="text-white/60 text-sm flex items-center gap-2 mb-3">
                  <Hash className="w-4 h-4" />
                  Trending Hashtags
                </h3>
                <div className="space-y-3">
                  {trendingTags.map((hashtag, index) => (
                    <button
                      key={hashtag.tag}
                      onClick={() => { onHashtagClick?.(hashtag.tag); onClose(); }}
                      className="w-full flex items-center justify-between py-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[#fe2c55] font-bold w-6">{index + 1}</span>
                        <div className="text-left">
                          <p className="text-white font-medium">#{hashtag.tag.replace(/^#/, "")}</p>
                          <p className="text-white/40 text-xs">{formatNumber(hashtag.views)} views · {formatNumber(hashtag.videos)} videos</p>
                        </div>
                      </div>
                      <TrendingUp className="w-4 h-4 text-[#fe2c55]" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Sounds */}
            {trendingSoundsList.length > 0 && (
              <div className="p-4">
                <h3 className="text-white/60 text-sm flex items-center gap-2 mb-3">
                  <Music2 className="w-4 h-4" />
                  Trending Sounds
                </h3>
                <div className="space-y-3">
                  {trendingSoundsList.map((sound, index) => (
                    <button
                      key={sound.name}
                      onClick={() => openSound(sound.name)}
                      className="w-full flex items-center gap-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-left"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Music2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{sound.name}</p>
                        <p className="text-white/40 text-xs">{formatNumber(sound.videos)} videos · {formatNumber(sound.views)} views</p>
                      </div>
                      <span className="text-[#fe2c55] font-bold text-sm">{index + 1}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
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
