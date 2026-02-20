"use client";

import { useState, useEffect, useRef } from "react";
import { X, Search, TrendingUp, Clock, Music2, Hash } from "lucide-react";
import { 
  trendingHashtags, 
  trendingSounds, 
  searchSuggestions,
  getUserState,
  addToSearchHistory,
  Video,
  sampleVideos 
} from "@/lib/data";

interface DiscoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoSelect?: (video: Video) => void;
  onHashtagClick?: (hashtag: string) => void;
}

export function DiscoverModal({ isOpen, onClose, onVideoSelect, onHashtagClick }: DiscoverModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Video[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const state = getUserState();
      setSearchHistory(state.searchHistory);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      // Filter videos based on search query
      const filtered = sampleVideos.filter(video => 
        video.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.hashtags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setSearchResults(filtered);
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      addToSearchHistory(query);
      setSearchHistory(prev => [query, ...prev.filter(q => q !== query)].slice(0, 10));
    }
  };

  const clearHistory = () => {
    const state = getUserState();
    state.searchHistory = [];
    localStorage.setItem('tiktok_clone_data', JSON.stringify(state));
    setSearchHistory([]);
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
            placeholder="Search"
            className="flex-1 bg-transparent text-white text-sm placeholder:text-white/40 focus:outline-none"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button 
          onClick={onClose}
          className="text-white font-semibold text-sm whitespace-nowrap flex-shrink-0"
        >
          Cancel
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#0f0f0f]">
        {isSearching ? (
          /* Search Results */
          <div className="p-4">
            <h3 className="text-white/60 text-sm mb-4">Videos</h3>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {searchResults.map((video) => (
                  <div 
                    key={video.id} 
                    onClick={() => {
                      onVideoSelect?.(video);
                      onClose();
                    }}
                    className="aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden cursor-pointer"
                  >
                    <video 
                      src={video.url}
                      className="w-full h-full object-cover"
                    />
                    <div className="p-2">
                      <p className="text-white text-xs truncate">{video.caption}</p>
                      <p className="text-white/60 text-xs">@{video.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-white/40 py-12">
                <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No results found</p>
              </div>
            )}
          </div>
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
                  <button 
                    onClick={clearHistory}
                    className="text-[#fe2c55] text-sm"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(query)}
                      className="px-3 py-1.5 bg-white/10 rounded-full text-white text-sm hover:bg-white/20 transition-colors"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Hashtags */}
            <div className="p-4 border-b border-white/10">
              <h3 className="text-white/60 text-sm flex items-center gap-2 mb-3">
                <Hash className="w-4 h-4" />
                Trending Hashtags
              </h3>
              <div className="space-y-3">
                {trendingHashtags.map((hashtag, index) => (
                  <button
                    key={hashtag.tag}
                    onClick={() => {
                      onHashtagClick?.(hashtag.tag);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between py-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[#fe2c55] font-bold w-6">{index + 1}</span>
                      <div className="text-left">
                        <p className="text-white font-medium">{hashtag.tag}</p>
                        <p className="text-white/40 text-xs">{hashtag.views} views</p>
                      </div>
                    </div>
                    <TrendingUp className="w-4 h-4 text-[#fe2c55]" />
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Sounds */}
            <div className="p-4">
              <h3 className="text-white/60 text-sm flex items-center gap-2 mb-3">
                <Music2 className="w-4 h-4" />
                Trending Sounds
              </h3>
              <div className="space-y-3">
                {trendingSounds.map((sound, index) => (
                  <button
                    key={sound.id}
                    className="w-full flex items-center gap-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-left"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Music2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{sound.name}</p>
                      <p className="text-white/40 text-xs">{sound.videos.toLocaleString()} videos</p>
                    </div>
                    <span className="text-[#fe2c55] font-bold text-sm">{index + 1}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Suggestions */}
            <div className="p-4 border-t border-white/10">
              <h3 className="text-white/60 text-sm mb-3">You may like</h3>
              <div className="flex flex-wrap gap-2">
                {searchSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSearch(suggestion)}
                    className="px-3 py-1.5 border border-white/20 rounded-full text-white text-sm hover:bg-white/10 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
