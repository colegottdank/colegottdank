"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Home,
  Search,
  PlusSquare,
  MessageSquare,
  User,
  Volume2,
  VolumeX,
  Bookmark
} from "lucide-react";
import { VideoPlayer } from "./components/VideoPlayer";
import { CommentsModal } from "./components/CommentsModal";
import { ProfileModal } from "./components/ProfileModal";
import { DiscoverModal } from "./components/DiscoverModal";
import { InboxModal } from "./components/InboxModal";
import { CreateModal } from "./components/CreateModal";
import { SoundPage } from "./components/SoundPage";
import { HashtagPage } from "./components/HashtagPage";
import { PrivacySettingsModal } from "./components/PrivacySettingsModal";
import { WatchHistoryModal } from "./components/WatchHistoryModal";
import { ReportModal } from "./components/ReportModal";
import { ToastContainer, toast } from "./components/Toast";
import { LongPressMenu } from "./components/LongPressMenu";
import { SkeletonLoader } from "./components/SkeletonLoader";
import { 
  sampleVideos, 
  followingVideos,
  initializeDefaultData,
  isVideoLiked,
  isVideoSaved,
  addLikedVideo,
  removeLikedVideo,
  addSavedVideo,
  removeSavedVideo,
  addViewedVideo
} from "@/lib/data";

// Icons
const HeartIcon = () => (
  <svg className="w-[40px] h-[40px]" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const FilledHeartIcon = () => (
  <svg className="w-[40px] h-[40px]" viewBox="0 0 24 24" fill="#fe2c55" stroke="#fe2c55" strokeWidth="2">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const FilledBookmarkIcon = () => (
  <svg className="w-[40px] h-[40px]" viewBox="0 0 24 24" fill="#fe2c55" stroke="#fe2c55" strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
  </svg>
);

const CommentIcon = () => (
  <svg className="w-[40px] h-[40px]" viewBox="0 0 24 24" fill="white">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

const ShareIcon = () => (
  <svg className="w-[40px] h-[40px]" viewBox="0 0 24 24" fill="white">
    <path d="M17.707 10.293l-5-5c-.391-.391-1.024-.391-1.414 0s-.391 1.024 0 1.414L14.586 10H7c-.552 0-1 .448-1 1s.448 1 1 1h7.586l-3.293 3.293c-.391.391-.391 1.024 0 1.414.195.195.451.293.707.293s.512-.098.707-.293l5-5c.391-.391.391-1.024 0-1.414z"/>
  </svg>
);

const MusicIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="white">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
  </svg>
);

// Helper to render caption with clickable hashtags
const CaptionWithHashtags = ({ caption, onHashtagClick }: { caption: string; onHashtagClick: (tag: string) => void }) => {
  const parts = caption.split(/(#[\w]+)/g);
  return (
    <span className="text-[14px] mb-[8px] opacity-90 leading-[1.3]">
      {parts.map((part, i) => {
        if (part.startsWith('#')) {
          return (
            <button
              key={i}
              onClick={() => onHashtagClick(part)}
              className="text-[#fe2c55] hover:underline font-medium"
            >
              {part}
            </button>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

function TikTokMobile() {
  // Initialize data
  useEffect(() => {
    initializeDefaultData();
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"foryou" | "following">("foryou");
  const [activeNavTab, setActiveNavTab] = useState<"home" | "discover" | "inbox" | "me">("home");
  const [muted, setMuted] = useState(true);
  const [isPaused, setIsPaused] = useState<Record<number, boolean>>({});
  const [likedVideos, setLikedVideos] = useState<Set<number>>(new Set());
  const [savedVideos, setSavedVideos] = useState<Set<number>>(new Set());
  const [showComments, setShowComments] = useState(false);
  const [commentsVideoId, setCommentsVideoId] = useState<number | null>(null);
  const [showProfile, setShowProfile] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [shareVideoId, setShareVideoId] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showDiscover, setShowDiscover] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showSoundPage, setShowSoundPage] = useState(false);
  const [currentSoundId, setCurrentSoundId] = useState<string | null>(null);
  const [currentSoundName, setCurrentSoundName] = useState<string>("");
  const [floatingHearts, setFloatingHearts] = useState<Array<{id: number, x: number, y: number}>>([]);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showWatchHistory, setShowWatchHistory] = useState(false);
  const [showLongPressMenu, setShowLongPressMenu] = useState(false);
  const [longPressVideo, setLongPressVideo] = useState<typeof sampleVideos[0] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [videoList, setVideoList] = useState(sampleVideos);
  const [followingVideoList, setFollowingVideoList] = useState(followingVideos);
  const [currentHashtag, setCurrentHashtag] = useState<string | null>(null);
  const [showHashtagPage, setShowHashtagPage] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const refreshStartY = useRef<number | null>(null);
  const isScrolling = useRef(false);
  const lastTapRef = useRef<{time: number, x: number, y: number} | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  const videos = activeTab === "foryou" ? videoList : followingVideoList;
  const currentVideo = videos[currentIndex];

  // Load liked/saved states on mount
  useEffect(() => {
    const liked = new Set<number>();
    const saved = new Set<number>();
    videos.forEach(v => {
      if (isVideoLiked(v.id)) liked.add(v.id);
      if (isVideoSaved(v.id)) saved.add(v.id);
    });
    setLikedVideos(liked);
    setSavedVideos(saved);
  }, [videos]);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch(e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          setIsPaused(prev => ({ ...prev, [currentVideo.id]: !prev[currentVideo.id] }));
          break;
        case 'arrowup':
          e.preventDefault();
          if (currentIndex > 0) {
            scrollToVideo(currentIndex - 1);
          }
          break;
        case 'arrowdown':
          e.preventDefault();
          if (currentIndex < videos.length - 1) {
            scrollToVideo(currentIndex + 1);
          }
          break;
        case 'l':
          handleLike(currentVideo.id);
          break;
        case 'm':
          setMuted(!muted);
          break;
        case 's':
          handleSave(currentVideo.id);
          break;
        case 'c':
          setCommentsVideoId(currentVideo.id);
          setShowComments(true);
          break;
        case 'f':
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentVideo, currentIndex, videos, muted]);

  const scrollToVideo = (index: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: index * scrollContainerRef.current.clientHeight,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
      addViewedVideo(videos[index].id);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Double-tap to like
  const handleVideoTap = (e: React.MouseEvent, videoId: number) => {
    const currentTime = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (lastTapRef.current && currentTime - lastTapRef.current.time < 300) {
      // Double tap detected
      const distance = Math.sqrt(
        Math.pow(x - lastTapRef.current.x, 2) + 
        Math.pow(y - lastTapRef.current.y, 2)
      );
      
      if (distance < 50) {
        // Show floating heart
        const heartId = Date.now();
        setFloatingHearts(prev => [...prev, { id: heartId, x, y }]);
        
        // Trigger like if not already liked
        if (!likedVideos.has(videoId)) {
          handleLike(videoId);
        }
        
        // Remove heart after animation
        setTimeout(() => {
          setFloatingHearts(prev => prev.filter(h => h.id !== heartId));
        }, 800);
      }
      
      lastTapRef.current = null;
    } else {
      lastTapRef.current = { time: currentTime, x, y };
    }
  };

  // Long press handlers - support both mouse and touch
  const longPressStartPos = useRef<{x: number, y: number} | null>(null);
  
  const handleLongPressStart = (video: typeof sampleVideos[0], e?: React.TouchEvent | React.MouseEvent) => {
    isLongPress.current = false;
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    
    // Store start position for touch move detection
    if (e) {
      if ('touches' in e) {
        longPressStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else {
        longPressStartPos.current = { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY };
      }
    }
    
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setLongPressVideo(video);
      setShowLongPressMenu(true);
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    longPressStartPos.current = null;
  };
  
  const handleLongPressMove = (e: React.TouchEvent | React.MouseEvent) => {
    // Cancel long press if user moves finger/mouse more than 10px
    if (longPressStartPos.current && longPressTimer.current) {
      let currentX: number, currentY: number;
      
      if ('touches' in e) {
        currentX = e.touches[0].clientX;
        currentY = e.touches[0].clientY;
      } else {
        currentX = (e as React.MouseEvent).clientX;
        currentY = (e as React.MouseEvent).clientY;
      }
      
      const distance = Math.sqrt(
        Math.pow(currentX - longPressStartPos.current.x, 2) + 
        Math.pow(currentY - longPressStartPos.current.y, 2)
      );
      
      if (distance > 10) {
        handleLongPressEnd();
      }
    }
  };
  
  // Prevent context menu on mobile long press
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  // Handle scroll to update current index
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isScrolling.current) return;
      
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const newIndex = Math.round(scrollTop / containerHeight);
      
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < videos.length) {
        setCurrentIndex(newIndex);
        // Mark video as viewed
        if (videos[newIndex]) {
          addViewedVideo(videos[newIndex].id);
        }
      }
      
      // Infinite scroll - load more when near bottom
      const scrollBottom = scrollTop + containerHeight;
      const totalHeight = container.scrollHeight;
      if (scrollBottom > totalHeight - containerHeight * 2 && !isLoading) {
        // Loop the videos for infinite scroll
        if (activeTab === "foryou") {
          setVideoList(prev => [...prev, ...sampleVideos]);
        } else {
          setFollowingVideoList(prev => [...prev, ...followingVideos]);
        }
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [currentIndex, videos, isLoading, activeTab]);

  // Auto-advance to next video when current ends
  const handleVideoEnded = () => {
    if (currentIndex < videos.length - 1) {
      scrollToVideo(currentIndex + 1);
    }
  };

  // Pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const container = scrollContainerRef.current;
    if (container && container.scrollTop === 0) {
      refreshStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (refreshStartY.current !== null) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - refreshStartY.current;
      
      if (diff > 100 && !isRefreshing) {
        setIsRefreshing(true);
        // Simulate refresh
        setTimeout(() => {
          setIsRefreshing(false);
          refreshStartY.current = null;
          toast.success("Feed refreshed!");
        }, 1500);
      }
    }
  };

  const handleTouchEnd = () => {
    refreshStartY.current = null;
  };

  const handleLike = (videoId: number) => {
    setLikedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
        removeLikedVideo(videoId);
      } else {
        newSet.add(videoId);
        addLikedVideo(videoId);
      }
      return newSet;
    });
  };

  const handleSave = (videoId: number) => {
    setSavedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
        removeSavedVideo(videoId);
      } else {
        newSet.add(videoId);
        addSavedVideo(videoId);
      }
      return newSet;
    });
  };

  const handleShare = (platform: string, videoId?: number) => {
    const vid = videoId ? videos.find(v => v.id === videoId) : currentVideo;
    if (!vid) return;

    const url = `https://tiktok.com/@${vid.username}/video/${vid.id}`;
    const text = `Check out this video by @${vid.username}!`;

    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'instagram':
        // Instagram doesn't have a direct web share URL, so we copy to clipboard with a message
        navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
        alert('Link copied! Paste it in Instagram to share.');
        break;
    }
  };

  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());

  // Load following state on mount
  useEffect(() => {
    import("@/lib/data").then(({ isFollowing }) => {
      const following = new Set<string>();
      sampleVideos.forEach(v => {
        if (isFollowing(v.username)) {
          following.add(v.username);
        }
      });
      setFollowingUsers(following);
    });
  }, []);

  const handleQuickFollow = (username: string) => {
    // Quick follow from video feed
    import("@/lib/data").then(({ followUser, isFollowing, unfollowUser }) => {
      if (isFollowing(username)) {
        unfollowUser(username);
        setFollowingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(username);
          return newSet;
        });
        toast.success(`Unfollowed @${username}`);
      } else {
        followUser(username);
        setFollowingUsers(prev => new Set(prev).add(username));
        toast.success(`Following @${username}`);
      }
    });
  };

  const formatNum = (n: number) => n >= 1000 ? (n/1000).toFixed(1) + "K" : n.toString();

  return (
    <div className="w-full h-full min-h-screen bg-white flex items-center justify-center overflow-hidden">
      {/* iPhone Frame - Fixed width like original */}
      <div 
        className="relative w-[340px] h-[700px] bg-black rounded-[45px] p-2.5"
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 2px #333' }}
      >
        {/* Phone Inner */}
        <div className="absolute inset-2.5 bg-black rounded-[38px] overflow-hidden">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140px] h-[30px] bg-black rounded-b-2xl z-50" />
          
          {/* Status Bar */}
          <div className="absolute top-[10px] left-[24px] right-[16px] flex justify-between items-center text-white text-[13px] z-40">
            <span className="font-semibold tracking-wide">9:41</span>
            <div className="flex items-center gap-[4px]">
              <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C7.46 3 3.34 4.78.29 7.67c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l11 11c.39.39 1.02.39 1.41 0l11-11c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71C20.66 4.78 16.54 3 12 3z"/>
              </svg>
              <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 11c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 2c0-3.31-2.69-6-6-6s-6 2.69-6 6c0 2.22 1.21 4.15 3 5.19l1-1.74c-1.19-.7-2-1.97-2-3.45 0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.48-.81 2.75-2 3.45l1 1.74c1.79-1.04 3-2.97 3-5.19zM12 5C6.48 5 2 9.48 2 15c0 2.76 1.12 5.26 2.93 7.07l1.43-1.43C4.9 19.21 4.06 17.24 4.06 15c0-4.39 3.55-7.94 7.94-7.94S19.94 10.61 19.94 15c0 2.24-.84 4.21-2.3 5.64l1.43 1.43C20.88 20.26 22 17.76 22 15c0-5.52-4.48-10-10-10z"/>
              </svg>
              <div className="w-[24px] h-[11px] border border-white/80 rounded-[3px] relative ml-[2px]">
                <div className="absolute inset-[1px] bg-white rounded-[1px] w-[70%]" />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full h-full bg-black flex flex-col overflow-hidden pt-8">
            {/* Video Feed */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto snap-y snap-mandatory scroll-smooth"
            >
              {videos.map((video, index) => (
                <div 
                  key={`${video.id}-${index}`}
                  className="h-full w-full snap-start relative"
                  onClick={(e) => handleVideoTap(e, video.id)}
                  onMouseDown={(e) => handleLongPressStart(video, e)}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressEnd}
                  onMouseMove={handleLongPressMove}
                  onTouchStart={(e) => handleLongPressStart(video, e)}
                  onTouchEnd={handleLongPressEnd}
                  onTouchMove={handleLongPressMove}
                  onContextMenu={handleContextMenu}
                >
                    <VideoPlayer
                    src={video.url}
                    videoId={video.id}
                    isActive={index === currentIndex}
                    isPaused={!!isPaused[video.id]}
                    muted={muted}
                    playbackRate={playbackRate}
                    loop={false}
                    onTogglePause={() => setIsPaused(prev => ({ ...prev, [video.id]: !prev[video.id] }))}
                    onToggleMute={() => setMuted(!muted)}
                    onEnded={handleVideoEnded}
                  />
                  
                  {/* Floating Hearts for Double-Tap Like */}
                  {index === currentIndex && floatingHearts.map((heart) => (
                    <div
                      key={heart.id}
                      className="absolute pointer-events-none animate-float-up"
                      style={{
                        left: heart.x - 25,
                        top: heart.y - 25,
                        animation: 'floatUp 0.8s ease-out forwards'
                      }}
                    >
                      <svg width="50" height="50" viewBox="0 0 24 24" fill="#fe2c55">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </div>
                  ))}
                  
                  {/* UI Overlay */}
                  <>
                    {/* Top Tabs */}
                    <div className="absolute top-[38px] left-0 right-0 flex items-center justify-center gap-[16px] text-white z-30">
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveTab("following"); setCurrentIndex(0); scrollContainerRef.current?.scrollTo({ top: 0 }); }}
                        className="relative active:scale-95 transition cursor-pointer"
                      >
                        <span className={`text-[15px] ${activeTab === "following" ? "font-bold" : "font-normal opacity-70"}`}>Following</span>
                        {activeTab === "following" && <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#fe2c55]" />}
                      </button>
                      <div className="w-[1px] h-[14px] bg-white/40" />
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveTab("foryou"); setCurrentIndex(0); scrollContainerRef.current?.scrollTo({ top: 0 }); }}
                        className="relative active:scale-95 transition cursor-pointer"
                      >
                        <span className={`text-[15px] ${activeTab === "foryou" ? "font-bold" : "font-normal opacity-70"}`}>For You</span>
                        {activeTab === "foryou" && <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#fe2c55]" />}
                      </button>
                    </div>

                    {/* Right Actions */}
                    <div className="absolute right-[10px] bottom-[90px] flex flex-col items-center gap-[8px]">
                      {/* Profile */}
                      <div className="relative mb-[2px]">
                        <button
                          onClick={() => setShowProfile(video.username)}
                          className="active:scale-95 transition"
                        >
                          <div className="w-[44px] h-[44px] rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 p-[2px]">
                            <img
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${video.username}&backgroundColor=b6e3f4`}
                              alt="Profile"
                              className="w-full h-full rounded-full bg-gray-800 border-2 border-white object-cover"
                            />
                          </div>
                        </button>
                        {/* Quick Follow Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickFollow(video.username);
                          }}
                          className={`absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-[16px] h-[16px] rounded-full flex items-center justify-center border-[1.5px] border-black active:scale-90 transition ${
                            followingUsers.has(video.username) 
                              ? "bg-white" 
                              : "bg-[#fe2c55] hover:bg-[#ff3d6a]"
                          }`}
                        >
                          <span className={`text-[9px] font-bold leading-none ${
                            followingUsers.has(video.username) ? "text-black" : "text-white"
                          }`}>
                            {followingUsers.has(video.username) ? "✓" : "+"}
                          </span>
                        </button>
                      </div>

                      {/* Like */}
                      <ActionBtn 
                        icon={likedVideos.has(video.id) ? <FilledHeartIcon /> : <HeartIcon />}
                        label={formatNum(video.likes + (likedVideos.has(video.id) ? 1 : 0))}
                        onClick={() => handleLike(video.id)}
                      />

                      {/* Save */}
                      <ActionBtn 
                        icon={savedVideos.has(video.id) ? <FilledBookmarkIcon /> : <Bookmark className="w-[40px] h-[40px] text-white" />}
                        label={savedVideos.has(video.id) ? "Saved" : "Save"}
                        onClick={() => handleSave(video.id)}
                      />

                      {/* Comment */}
                      <ActionBtn 
                        icon={<CommentIcon />}
                        label={formatNum(video.comments)}
                        onClick={() => {
                          setCommentsVideoId(video.id);
                          setShowComments(true);
                        }}
                      />

                      {/* Share */}
                      <ActionBtn 
                        icon={<ShareIcon />}
                        label={formatNum(video.shares)}
                        onClick={() => {
                          setShareVideoId(video.id);
                          setShowShare(true);
                        }}
                      />
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-[20px] left-[12px] right-[90px] text-white">
                      <div className="flex items-center gap-[6px] mb-[6px]">
                        <button 
                          onClick={() => setShowProfile(video.username)}
                          className="font-semibold text-[15px] hover:underline active:scale-95 transition"
                        >
                          @{video.username}
                        </button>
                        {video.verified && (
                          <div className="w-[14px] h-[14px] bg-[#20d5ec] rounded-full flex items-center justify-center">
                            <svg className="w-[9px] h-[9px] text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <CaptionWithHashtags caption={video.caption} onHashtagClick={(tag) => { setCurrentHashtag(tag); setShowHashtagPage(true); }} />
                      <button 
                        onClick={() => {
                          setCurrentSoundId(video.soundId);
                          setCurrentSoundName(video.soundName);
                          setShowSoundPage(true);
                        }}
                        className="flex items-center gap-[6px] hover:opacity-100 transition"
                      >
                        <MusicIcon />
                        <span className="text-[12px] opacity-80 truncate">{video.soundName}</span>
                      </button>
                    </div>

                    {/* Spinning Record */}
                    <button
                      onClick={() => {
                        setCurrentSoundId(video.soundId);
                        setCurrentSoundName(video.soundName);
                        setShowSoundPage(true);
                      }}
                      className="absolute bottom-[22px] right-[10px] active:scale-95 transition"
                    >
                      <div
                        className="w-[40px] h-[40px] rounded-full bg-gray-900 border-[2px] border-white/20 overflow-hidden relative animate-spin"
                        style={{ animationDuration: '5s' }}
                      >
                        <img 
                          src="https://images.unsplash.com/photo-1493225255756-d9584f8606e8?w=100&h=100&fit=crop" 
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
                        <div className="absolute inset-[12px] rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                          <div className="w-[6px] h-[6px] rounded-full bg-black" />
                        </div>
                      </div>
                    </button>
                  </>
                </div>
              ))}
            </div>

            {/* Bottom Nav */}
            <div className="h-[52px] bg-black flex items-end justify-around px-2 pb-[10px] z-40 relative">
              <NavBtn 
                icon={<Home className="w-[24px] h-[24px]" />} 
                label="Home" 
                active={activeNavTab === "home"}
                onClick={() => {
                  setActiveNavTab("home");
                  scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  setCurrentIndex(0);
                }}
              />
              <NavBtn
                icon={<Search className="w-[24px] h-[24px]" />}
                label="Discover"
                active={activeNavTab === "discover"}
                onClick={() => {
                  setActiveNavTab("discover");
                  setShowDiscover(true);
                }}
              />
              <div className="relative -top-[4px]" onClick={() => setShowCreate(true)}>
                <div className="w-[44px] h-[30px] bg-gradient-to-r from-cyan-400 to-[#fe2c55] rounded-[8px] flex items-center justify-center shadow-lg cursor-pointer active:scale-95 transition">
                  <PlusSquare className="w-[24px] h-[24px] text-white" strokeWidth={2.5} />
                </div>
              </div>
              <NavBtn
                icon={<MessageSquare className="w-[24px] h-[24px]" />}
                label="Inbox"
                active={activeNavTab === "inbox"}
                onClick={() => {
                  setActiveNavTab("inbox");
                  setShowInbox(true);
                }}
              />
              <NavBtn 
                icon={<User className="w-[24px] h-[24px]" />} 
                label="Me"
                active={activeNavTab === "me"}
                onClick={() => setShowProfile("currentuser")}
              />
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full z-50" />
          </div>

          {/* Comments Modal */}
          <CommentsModal
            videoId={commentsVideoId || 0}
            isOpen={showComments}
            onClose={() => {
              setShowComments(false);
              setCommentsVideoId(null);
            }}
            commentCount={commentsVideoId ? videos.find(v => v.id === commentsVideoId)?.comments || 0 : 0}
          />

          {/* Profile Modal */}
          <ProfileModal
            username={showProfile}
            isOpen={!!showProfile}
            onClose={() => setShowProfile(null)}
          />

          {/* Share Modal */}
          {showShare && shareVideoId && (
            <div className="absolute inset-0 bg-black/80 z-50 flex items-end animate-in slide-in-from-bottom duration-300">
              <div className="w-full bg-[#1a1a1a] rounded-t-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-white font-semibold text-lg">Share to</span>
                  <button 
                    onClick={() => {
                      setShowShare(false);
                      setShareVideoId(null);
                    }} 
                    className="text-white/60 hover:text-white"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <button onClick={() => handleShare('twitter', shareVideoId)} className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full bg-[#1DA1F2] flex items-center justify-center">
                      <span className="text-white text-xl font-bold">𝕏</span>
                    </div>
                    <span className="text-white text-xs">Twitter</span>
                  </button>
                  <button onClick={() => handleShare('facebook', shareVideoId)} className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full bg-[#4267B2] flex items-center justify-center">
                      <span className="text-white text-xl font-bold">f</span>
                    </div>
                    <span className="text-white text-xs">Facebook</span>
                  </button>
                  <button onClick={() => handleShare('whatsapp', shareVideoId)} className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <span className="text-white text-xs">WhatsApp</span>
                  </button>
                  <button onClick={() => handleShare('telegram', shareVideoId)} className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full bg-[#0088cc] flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                    </div>
                    <span className="text-white text-xs">Telegram</span>
                  </button>
                  <button onClick={() => handleShare('instagram', shareVideoId)} className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    <span className="text-white text-xs">Instagram</span>
                  </button>
                  <button onClick={() => handleShare('copy', shareVideoId)} className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                      {copiedLink ? <span className="text-green-400 text-xl">✓</span> : <span className="text-white text-xl">🔗</span>}
                    </div>
                    <span className="text-white text-xs">{copiedLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Discover Modal */}
          <DiscoverModal
            isOpen={showDiscover}
            onClose={() => setShowDiscover(false)}
            onHashtagClick={(tag) => {
              setCurrentHashtag(tag);
              setShowHashtagPage(true);
            }}
          />

          {/* Inbox Modal */}
          <InboxModal
            isOpen={showInbox}
            onClose={() => setShowInbox(false)}
          />

          {/* Create Modal */}
          <CreateModal
            isOpen={showCreate}
            onClose={() => setShowCreate(false)}
          />

          {/* Sound Page Modal */}
          <SoundPage
            soundId={currentSoundId}
            soundName={currentSoundName}
            isOpen={showSoundPage}
            onClose={() => {
              setShowSoundPage(false);
              setCurrentSoundId(null);
              setCurrentSoundName("");
            }}
            onUseSound={() => {
              setShowCreate(true);
              toast.success(`Using sound: ${currentSoundName}`);
            }}
          />

          {/* Hashtag Page Modal */}
          <HashtagPage
            hashtag={currentHashtag}
            isOpen={showHashtagPage}
            onClose={() => {
              setShowHashtagPage(false);
              setCurrentHashtag(null);
            }}
          />

          {/* Privacy Settings Modal */}
          <PrivacySettingsModal
            isOpen={showPrivacySettings}
            onClose={() => setShowPrivacySettings(false)}
          />

          {/* Watch History Modal */}
          <WatchHistoryModal
            isOpen={showWatchHistory}
            onClose={() => setShowWatchHistory(false)}
          />

          {/* Long Press Menu */}
          <LongPressMenu
            isOpen={showLongPressMenu}
            onClose={() => {
              setShowLongPressMenu(false);
              setLongPressVideo(null);
            }}
            video={longPressVideo}
            onLike={() => longPressVideo && handleLike(longPressVideo.id)}
            onSave={() => longPressVideo && handleSave(longPressVideo.id)}
            onShare={() => {
              if (longPressVideo) {
                setShareVideoId(longPressVideo.id);
                setShowShare(true);
              }
            }}
            onReport={() => {
              toast.info("Report feature coming soon!");
            }}
            onPlaybackRateChange={setPlaybackRate}
            playbackRate={playbackRate}
            isLiked={longPressVideo ? likedVideos.has(longPressVideo.id) : false}
            isSaved={longPressVideo ? savedVideos.has(longPressVideo.id) : false}
          />
        </div>
      </div>
      
      {/* Toast Container - Global */}
      <ToastContainer />
      
      {/* Floating Heart Animation Styles */}
      <style jsx global>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(0.5);
            opacity: 0;
          }
          20% {
            transform: translateY(-20px) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) scale(1);
            opacity: 0;
          }
        }
        
        .animate-float-up {
          animation: floatUp 0.8s ease-out forwards;
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
}

function ActionBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-[2px] text-white active:scale-90 transition drop-shadow-md">
      <div className="w-[48px] h-[48px] flex items-center justify-center">
        {icon}
      </div>
      <span className="text-[11px] font-medium leading-none">{label}</span>
    </button>
  );
}

function NavBtn({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center min-w-[60px] ${active ? "text-white" : "text-gray-400"} active:scale-95 transition`}
    >
      {icon}
      <span className="text-[10px] mt-[2px] leading-none">{label}</span>
    </button>
  );
}

// Portfolio Component
function NatPortfolio() {
  const blogPosts = [
    { title: "CLI beats MCP. Here's why.", date: "Feb 2026", slug: "cli-vs-mcp" },
    { title: "GEO is SEO for AI search. It's also fake.", date: "Feb 2026", slug: "geo-is-fake" },
  ];

  return (
    <div className="w-full h-full bg-white overflow-y-auto">
      <div className="max-w-[600px] mx-auto py-20 px-8 md:px-12">
        {/* Name */}
        <h1 className="text-[32px] md:text-[40px] font-normal text-black mb-6 tracking-[-0.02em]" style={{ fontFamily: "Times New Roman, Times, Georgia, serif" }}>
          Cole Gottdank
        </h1>

        {/* Bio */}
        <div className="text-[17px] leading-[1.7] text-black/90" style={{ fontFamily: "Times New Roman, Times, Georgia, serif" }}>
          <p className="mb-6">
            Engineer turned GTM at{" "}
            <a href="https://helicone.ai" className="underline underline-offset-2 decoration-black/30 hover:decoration-black transition-colors">
              Helicone
            </a>
            , where we handle billions of LLM requests. Started coding at 14 building Minecraft plugins.
          </p>

          <p className="mb-6">
            Currently building with{" "}
            <a href="https://github.com/anthropics/claude-code" className="underline underline-offset-2 decoration-black/30 hover:decoration-black transition-colors">
              Claude Code
            </a>
            . Side projects:{" "}
            <a href="https://debateai.org" className="underline underline-offset-2 decoration-black/30 hover:decoration-black transition-colors">
              DebateAI
            </a>
            ,{" "}
            <a href="https://dailyspud.colegottdank.com" className="underline underline-offset-2 decoration-black/30 hover:decoration-black transition-colors">
              Daily Spud
            </a>
            . Interested in AI agents, learning to cook the Kenji way, 3D printing, and getting better at basketball. Washed up Rocket League grand champ.
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-6 mt-8 text-[14px]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
          <a href="https://github.com/colegottdank" className="text-black/60 hover:text-black transition-colors">
            GitHub
          </a>
          <a href="https://x.com/coleywoleyyy" className="text-black/60 hover:text-black transition-colors">
            Twitter
          </a>
          <a href="https://linkedin.com/in/colegottdank" className="text-black/60 hover:text-black transition-colors">
            LinkedIn
          </a>
        </div>

        {/* Divider */}
        <div className="border-t border-black/10 mt-16 pt-12">
          {/* Writing Section */}
          <h2 className="text-[14px] text-black/40 uppercase tracking-[0.1em] mb-6" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
            Writing
          </h2>
          <ul className="space-y-4" style={{ fontFamily: "Times New Roman, Times, Georgia, serif" }}>
            {blogPosts.map((post) => (
              <li key={post.slug}>
                <a
                  href={`/blog/${post.slug}`}
                  className="group flex items-baseline justify-between text-[17px] text-black/90 hover:text-black transition-colors"
                >
                  <span className="group-hover:underline underline-offset-2">{post.title}</span>
                  <span className="text-[14px] text-black/40 ml-4">{post.date}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="text-[13px] text-black/40 mt-20" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
          © 2026
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <main className="flex h-screen w-full overflow-hidden bg-white overflow-lock">
      <div className="w-[380px] shrink-0 h-full"><TikTokMobile /></div>
      <div className="flex-1 h-full"><NatPortfolio /></div>
    </main>
  );
}