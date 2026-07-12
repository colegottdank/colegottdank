"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import { ToastContainer, toast } from "./components/Toast";
import { LongPressMenu } from "./components/LongPressMenu";
import { ReportModal } from "./components/ReportModal";
import { useAuth } from "./components/AuthContext";
import {
  feed as feedApi,
  videos as videosApi,
  users as usersApi,
  notifications as notifsApi,
  Video,
  shareUrl,
} from "@/lib/api-client";
import { getMutedPref, setMutedPref } from "@/lib/data";

/* ---------- TikTok icons (filled, like the real app) ---------- */

const iconShadow = "drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]";

const HeartIcon = ({ liked }: { liked: boolean }) => (
  <svg className={`w-[34px] h-[34px] ${iconShadow}`} viewBox="0 0 48 48" fill={liked ? "#fe2c55" : "#fff"}>
    <path d="M34.6 5.6c-4.6 0-8.5 2.9-10.6 6-2.1-3.1-6-6-10.6-6C6.6 5.6 1.5 11 1.5 18c0 10.3 10.4 16.4 20.4 24.9 1.2 1 2.9 1 4.1 0C36.1 34.4 46.5 28.3 46.5 18c0-7-5.1-12.4-11.9-12.4z"/>
  </svg>
);

const CommentIcon = () => (
  <svg className={`w-[34px] h-[34px] ${iconShadow}`} viewBox="0 0 48 48" fill="#fff">
    <path d="M24 4C12.4 4 3 12.3 3 22.5c0 5.6 2.8 10.6 7.3 14L8.7 43c-.3 1.1.8 2.1 1.9 1.6l8.4-3.6c1.6.3 3.3.5 5 .5 11.6 0 21-8.3 21-18.5S35.6 4 24 4z"/>
    <circle cx="14.5" cy="22.5" r="2.6" fill="rgba(22,24,35,0.55)"/>
    <circle cx="24" cy="22.5" r="2.6" fill="rgba(22,24,35,0.55)"/>
    <circle cx="33.5" cy="22.5" r="2.6" fill="rgba(22,24,35,0.55)"/>
  </svg>
);

const BookmarkIcon = ({ saved }: { saved: boolean }) => (
  <svg className={`w-[32px] h-[32px] ${iconShadow}`} viewBox="0 0 48 48" fill={saved ? "#ffc107" : "#fff"}>
    <path d="M12 4h24a3 3 0 0 1 3 3v36.1c0 1.2-1.4 2-2.4 1.2L24 35.6 11.4 44.3c-1 .7-2.4 0-2.4-1.2V7a3 3 0 0 1 3-3z"/>
  </svg>
);

const ShareArrowIcon = () => (
  <svg className={`w-[34px] h-[34px] ${iconShadow}`} viewBox="0 0 48 48" fill="#fff">
    <path d="M27.5 8.6c0-2 2.4-3 3.8-1.6l14.5 13.5c1 .9 1 2.5 0 3.4L31.3 37.4c-1.4 1.4-3.8.4-3.8-1.6v-6.4c-9 .1-15 2.6-19.9 8.4-.8.9-2.3.3-2.2-.9C6.6 25.4 13.9 17.6 27.5 15.5V8.6z"/>
  </svg>
);

const MusicNoteIcon = () => (
  <svg className="w-[13px] h-[13px] shrink-0" viewBox="0 0 24 24" fill="#fff">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
  </svg>
);

/* Bottom nav icons */
const NavHomeIcon = ({ active }: { active: boolean }) => (
  <svg className="w-[26px] h-[26px]" viewBox="0 0 48 48" fill={active ? "#fff" : "none"} stroke={active ? "none" : "#7a7b82"} strokeWidth="3.4">
    <path d="M23 5.1a1.6 1.6 0 0 1 2 0l17.8 14.7c1.2 1 .5 2.9-1 2.9H38v17.8a2.5 2.5 0 0 1-2.5 2.5H29a1.5 1.5 0 0 1-1.5-1.5V31.6h-7v9.9A1.5 1.5 0 0 1 19 43h-6.5A2.5 2.5 0 0 1 10 40.5V22.7H6.2c-1.5 0-2.2-1.9-1-2.9L23 5.1z"/>
  </svg>
);

const NavDiscoverIcon = ({ active }: { active: boolean }) => (
  <svg className="w-[25px] h-[25px]" viewBox="0 0 48 48" fill="none" stroke={active ? "#fff" : "#7a7b82"} strokeWidth="4" strokeLinecap="round">
    <circle cx="21" cy="21" r="14"/>
    <path d="M31.5 31.5 42 42"/>
  </svg>
);

const NavInboxIcon = ({ active }: { active: boolean }) => (
  <svg className="w-[26px] h-[26px]" viewBox="0 0 48 48" fill={active ? "#fff" : "none"} stroke={active ? "none" : "#7a7b82"} strokeWidth="3.4">
    <path d="M9 6h30a4 4 0 0 1 4 4v21a4 4 0 0 1-4 4H27.2l-8.9 7.1c-1 .8-2.5.1-2.5-1.2V35H9a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4z"/>
  </svg>
);

const NavProfileIcon = ({ active }: { active: boolean }) => (
  <svg className="w-[26px] h-[26px]" viewBox="0 0 48 48" fill={active ? "#fff" : "none"} stroke={active ? "none" : "#7a7b82"} strokeWidth="3.4">
    <circle cx="24" cy="14" r="9"/>
    <path d="M24 27c-9.4 0-17 6.4-17 14.3 0 .9.8 1.7 1.7 1.7h30.6c.9 0 1.7-.8 1.7-1.7C41 33.4 33.4 27 24 27z"/>
  </svg>
);

const VerifiedBadge = () => (
  <svg className="w-[14px] h-[14px] shrink-0" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="12" fill="#20d5ec"/>
    <path d="M9.6 16.2 5.8 12.4l1.6-1.6 2.2 2.2 5.9-5.9 1.6 1.6z" fill="#fff"/>
  </svg>
);

/* ---------- helpers ---------- */

const formatNum = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toString();
};

// Caption with clickable hashtags
const CaptionWithHashtags = ({ caption, onHashtagClick }: { caption: string; onHashtagClick: (tag: string) => void }) => {
  const parts = caption.split(/(#[\w]+)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("#")) {
          return (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); onHashtagClick(part); }}
              className="font-semibold hover:underline"
            >
              {part}
            </button>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

interface FeedState {
  videos: Video[];
  cursor: number | null;
  hasMore: boolean;
  loaded: boolean;
  loading: boolean;
}

const emptyFeed = (): FeedState => ({ videos: [], cursor: null, hasMore: true, loaded: false, loading: false });
const PAGE = 10;

function TikTokMobile({ framed, onOpenAbout }: { framed: boolean; onOpenAbout: () => void }) {
  const { user, requireAuth } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"foryou" | "following">("foryou");
  const [activeNavTab, setActiveNavTab] = useState<"home" | "discover" | "inbox" | "me">("home");
  const [muted, setMuted] = useState(true);
  const [isPaused, setIsPaused] = useState<Record<number, boolean>>({});
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
  const [currentSoundName, setCurrentSoundName] = useState<string>("");
  const [floatingHearts, setFloatingHearts] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showWatchHistory, setShowWatchHistory] = useState(false);
  const [showLongPressMenu, setShowLongPressMenu] = useState(false);
  const [longPressVideo, setLongPressVideo] = useState<Video | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportVideoId, setReportVideoId] = useState<number | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentHashtag, setCurrentHashtag] = useState<string | null>(null);
  const [showHashtagPage, setShowHashtagPage] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  const [foryou, setForyou] = useState<FeedState>(emptyFeed);
  const [followingFeed, setFollowingFeed] = useState<FeedState>(emptyFeed);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const refreshStartY = useRef<number | null>(null);
  const isScrolling = useRef(false);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);
  const viewedRef = useRef<Set<number>>(new Set());

  const activeFeed = activeTab === "foryou" ? foryou : followingFeed;
  const setActiveFeed = activeTab === "foryou" ? setForyou : setFollowingFeed;
  const videos = activeFeed.videos;
  const currentVideo = videos[currentIndex];

  // Restore mute device pref
  useEffect(() => { setMuted(getMutedPref()); }, []);
  useEffect(() => { setMutedPref(muted); }, [muted]);

  /* ---------- feed loading ---------- */

  const loadForYou = useCallback(async (reset: boolean) => {
    setForyou((s) => (s.loading ? s : { ...s, loading: true }));
    try {
      const params = new URLSearchParams(window.location.search);
      const pinnedId = reset ? Number(params.get("v")) || null : null;
      let pinned: Video | null = null;
      if (pinnedId) {
        try { pinned = (await videosApi.get(pinnedId)).video; } catch { /* not found / not live */ }
      }
      const cursor = reset ? null : foryou.cursor;
      const { videos: page, nextCursor } = await feedApi.get({ tab: "foryou", cursor, limit: PAGE });
      setForyou((s) => {
        const base = reset ? [] : s.videos;
        const seen = new Set(base.map((v) => v.id));
        let merged = [...base];
        if (pinned && !seen.has(pinned.id)) { merged.unshift(pinned); seen.add(pinned.id); }
        for (const v of page) if (!seen.has(v.id)) { merged.push(v); seen.add(v.id); }
        return { videos: merged, cursor: nextCursor, hasMore: nextCursor != null, loaded: true, loading: false };
      });
    } catch {
      setForyou((s) => ({ ...s, loaded: true, loading: false, hasMore: false }));
    }
  }, [foryou.cursor]);

  const loadFollowing = useCallback(async (reset: boolean) => {
    if (!user) return;
    setFollowingFeed((s) => (s.loading ? s : { ...s, loading: true }));
    try {
      const cursor = reset ? null : followingFeed.cursor;
      const { videos: page, nextCursor } = await feedApi.get({ tab: "following", cursor, limit: PAGE });
      setFollowingFeed((s) => {
        const base = reset ? [] : s.videos;
        const seen = new Set(base.map((v) => v.id));
        const merged = [...base];
        for (const v of page) if (!seen.has(v.id)) { merged.push(v); seen.add(v.id); }
        return { videos: merged, cursor: nextCursor, hasMore: nextCursor != null, loaded: true, loading: false };
      });
    } catch {
      setFollowingFeed((s) => ({ ...s, loaded: true, loading: false, hasMore: false }));
    }
  }, [followingFeed.cursor, user]);

  // Initial For You load (once).
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    loadForYou(true);
  }, [loadForYou]);

  // Lazy-load Following when its tab is first shown while authed.
  useEffect(() => {
    if (activeTab === "following" && user && !followingFeed.loaded && !followingFeed.loading) {
      loadFollowing(true);
    }
  }, [activeTab, user, followingFeed.loaded, followingFeed.loading, loadFollowing]);

  // Notification unread count.
  const refreshUnread = useCallback(() => {
    if (!user) { setUnreadNotifs(0); return; }
    notifsApi.list().then((r) => setUnreadNotifs(r.unread)).catch(() => {});
  }, [user]);
  useEffect(() => { refreshUnread(); }, [refreshUnread]);

  /* ---------- optimistic video mutations ---------- */

  const mapVideo = useCallback((id: number, fn: (v: Video) => Video) => {
    const upd = (arr: Video[]) => arr.map((v) => (v.id === id ? fn(v) : v));
    setForyou((s) => ({ ...s, videos: upd(s.videos) }));
    setFollowingFeed((s) => ({ ...s, videos: upd(s.videos) }));
  }, []);

  const mapVideosByUser = useCallback((username: string, fn: (v: Video) => Video) => {
    const upd = (arr: Video[]) => arr.map((v) => (v.user.username === username ? fn(v) : v));
    setForyou((s) => ({ ...s, videos: upd(s.videos) }));
    setFollowingFeed((s) => ({ ...s, videos: upd(s.videos) }));
  }, []);

  const findVideo = useCallback(
    (id: number) => foryou.videos.find((v) => v.id === id) || followingFeed.videos.find((v) => v.id === id),
    [foryou.videos, followingFeed.videos]
  );

  /* ---------- view counting (once per video per session) ---------- */
  useEffect(() => {
    const v = videos[currentIndex];
    if (v && !viewedRef.current.has(v.id)) {
      viewedRef.current.add(v.id);
      videosApi.view(v.id);
    }
  }, [currentIndex, videos]);

  // Collapse the caption when moving between videos
  useEffect(() => { setCaptionExpanded(false); }, [currentIndex, activeTab]);

  /* ---------- keyboard shortcuts ---------- */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (!currentVideo) return;
      switch (e.key.toLowerCase()) {
        case " ":
          e.preventDefault();
          setIsPaused((prev) => ({ ...prev, [currentVideo.id]: !prev[currentVideo.id] }));
          break;
        case "arrowup":
          e.preventDefault();
          if (currentIndex > 0) scrollToVideo(currentIndex - 1);
          break;
        case "arrowdown":
          e.preventDefault();
          if (currentIndex < videos.length - 1) scrollToVideo(currentIndex + 1);
          break;
        case "l": handleLike(currentVideo.id); break;
        case "m": setMuted((m) => !m); break;
        case "s": handleSave(currentVideo.id); break;
        case "c": setCommentsVideoId(currentVideo.id); setShowComments(true); break;
        case "f": toggleFullscreen(); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVideo, currentIndex, videos]);

  const scrollToVideo = (index: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: index * scrollContainerRef.current.clientHeight, behavior: "smooth" });
      setCurrentIndex(index);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
  };

  /* ---------- double-tap to like ---------- */
  const handleVideoTap = (e: React.MouseEvent, videoId: number) => {
    const currentTime = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (lastTapRef.current && currentTime - lastTapRef.current.time < 300) {
      const distance = Math.sqrt(Math.pow(x - lastTapRef.current.x, 2) + Math.pow(y - lastTapRef.current.y, 2));
      if (distance < 50) {
        const heartId = Date.now();
        setFloatingHearts((prev) => [...prev, { id: heartId, x, y }]);
        const v = findVideo(videoId);
        if (v && !v.me?.liked) handleLike(videoId);
        setTimeout(() => setFloatingHearts((prev) => prev.filter((h) => h.id !== heartId)), 800);
      }
      lastTapRef.current = null;
    } else {
      lastTapRef.current = { time: currentTime, x, y };
    }
  };

  /* ---------- long press ---------- */
  const longPressStartPos = useRef<{ x: number; y: number } | null>(null);
  const handleLongPressStart = (video: Video, e?: React.TouchEvent | React.MouseEvent) => {
    isLongPress.current = false;
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (e) {
      if ("touches" in e) longPressStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      else longPressStartPos.current = { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY };
    }
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setLongPressVideo(video);
      setShowLongPressMenu(true);
    }, 500);
  };
  const handleLongPressEnd = () => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
    longPressStartPos.current = null;
  };
  const handleLongPressMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (longPressStartPos.current && longPressTimer.current) {
      let currentX: number, currentY: number;
      if ("touches" in e) { currentX = e.touches[0].clientX; currentY = e.touches[0].clientY; }
      else { currentX = (e as React.MouseEvent).clientX; currentY = (e as React.MouseEvent).clientY; }
      const distance = Math.sqrt(Math.pow(currentX - longPressStartPos.current.x, 2) + Math.pow(currentY - longPressStartPos.current.y, 2));
      if (distance > 10) handleLongPressEnd();
    }
  };
  const handleContextMenu = (e: React.MouseEvent) => { e.preventDefault(); return false; };

  /* ---------- scroll → index + infinite load ---------- */
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      if (isScrolling.current) return;
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const newIndex = Math.round(scrollTop / containerHeight);
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < videos.length) setCurrentIndex(newIndex);
      const scrollBottom = scrollTop + containerHeight;
      if (scrollBottom > container.scrollHeight - containerHeight * 2 && activeFeed.hasMore && !activeFeed.loading) {
        if (activeTab === "foryou") loadForYou(false);
        else loadFollowing(false);
      }
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [currentIndex, videos, activeTab, activeFeed.hasMore, activeFeed.loading, loadForYou, loadFollowing]);

  const handleVideoEnded = () => {
    if (currentIndex < videos.length - 1) scrollToVideo(currentIndex + 1);
  };

  /* ---------- pull-to-refresh (real refetch of page 1) ---------- */
  const handleTouchStart = (e: React.TouchEvent) => {
    const container = scrollContainerRef.current;
    if (container && container.scrollTop === 0) refreshStartY.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (refreshStartY.current !== null) {
      const diff = e.touches[0].clientY - refreshStartY.current;
      if (diff > 100 && !isRefreshing) {
        setIsRefreshing(true);
        refreshStartY.current = null;
        const p = activeTab === "foryou" ? loadForYou(true) : loadFollowing(true);
        Promise.resolve(p).finally(() => {
          setCurrentIndex(0);
          scrollContainerRef.current?.scrollTo({ top: 0 });
          setIsRefreshing(false);
          toast.success("Feed refreshed");
        });
      }
    }
  };
  const handleTouchEnd = () => { refreshStartY.current = null; };

  /* ---------- engagement handlers (API + optimistic) ---------- */
  const handleLike = (videoId: number) => {
    if (!requireAuth()) return;
    const v = findVideo(videoId);
    if (!v) return;
    const wasLiked = !!v.me?.liked;
    mapVideo(videoId, (x) => ({
      ...x,
      me: { liked: !wasLiked, saved: !!x.me?.saved, following: !!x.me?.following },
      likes: x.likes + (wasLiked ? -1 : 1),
    }));
    const call = wasLiked ? videosApi.unlike(videoId) : videosApi.like(videoId);
    call
      .then((r) => mapVideo(videoId, (x) => ({ ...x, likes: r.likes })))
      .catch(() => {
        mapVideo(videoId, (x) => ({
          ...x,
          me: { liked: wasLiked, saved: !!x.me?.saved, following: !!x.me?.following },
          likes: x.likes + (wasLiked ? 1 : -1),
        }));
        toast.error("Couldn't update like");
      });
  };

  const handleSave = (videoId: number) => {
    if (!requireAuth()) return;
    const v = findVideo(videoId);
    if (!v) return;
    const wasSaved = !!v.me?.saved;
    mapVideo(videoId, (x) => ({
      ...x,
      me: { liked: !!x.me?.liked, saved: !wasSaved, following: !!x.me?.following },
      saves: x.saves + (wasSaved ? -1 : 1),
    }));
    const call = wasSaved ? videosApi.unsave(videoId) : videosApi.save(videoId);
    call
      .then((r) => mapVideo(videoId, (x) => ({ ...x, saves: r.saves })))
      .catch(() => {
        mapVideo(videoId, (x) => ({
          ...x,
          me: { liked: !!x.me?.liked, saved: wasSaved, following: !!x.me?.following },
          saves: x.saves + (wasSaved ? 1 : -1),
        }));
        toast.error("Couldn't update save");
      });
  };

  const handleQuickFollow = (username: string) => {
    if (!requireAuth()) return;
    const v = foryou.videos.find((x) => x.user.username === username) || followingFeed.videos.find((x) => x.user.username === username);
    const wasFollowing = !!v?.me?.following;
    mapVideosByUser(username, (x) => ({
      ...x,
      me: { liked: !!x.me?.liked, saved: !!x.me?.saved, following: !wasFollowing },
    }));
    const call = wasFollowing ? usersApi.unfollow(username) : usersApi.follow(username);
    call
      .then(() => toast.success(wasFollowing ? `Unfollowed @${username}` : `Following @${username}`))
      .catch(() => {
        mapVideosByUser(username, (x) => ({
          ...x,
          me: { liked: !!x.me?.liked, saved: !!x.me?.saved, following: wasFollowing },
        }));
        toast.error("Couldn't update follow");
      });
  };

  /* ---------- share (real URLs) ---------- */
  const handleShare = (platform: string, videoId?: number) => {
    const vid = videoId ? findVideo(videoId) : currentVideo;
    if (!vid) return;
    const url = shareUrl(vid.id);
    const text = `Check out this video by @${vid.user.username}!`;
    switch (platform) {
      case "copy":
        navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
        break;
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank");
        break;
      case "telegram":
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
        break;
      case "instagram":
        navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
        toast.info("Link copied — paste it in Instagram to share");
        break;
    }
  };

  /* ---------- nav gates ---------- */
  const openCreate = () => { if (requireAuth()) setShowCreate(true); };
  const openInbox = () => {
    if (!requireAuth()) return;
    setActiveNavTab("inbox");
    setShowInbox(true);
  };
  const openMe = () => {
    if (!requireAuth()) return;
    setActiveNavTab("me");
    setShowProfile(user!.username);
  };

  const commentsVideo = commentsVideoId ? findVideo(commentsVideoId) : null;

  /* ---------- the screen (identical for framed + full-viewport) ---------- */
  const screen = (
    <div className="relative w-full h-full flex flex-col bg-black">
      {/* ---- Feed area ---- */}
      <div className="relative flex-1 overflow-hidden">
        {activeTab === "following" && !user ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-8">
            <p className="text-white font-semibold mb-2">Log in to see who you follow</p>
            <button onClick={() => requireAuth()} className="mt-2 px-6 py-2.5 bg-[#fe2c55] text-white rounded-md font-semibold text-sm">
              Log in
            </button>
          </div>
        ) : !activeFeed.loaded ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-9 h-9 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : videos.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-8">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
              <MusicNoteIcon />
            </div>
            <p className="text-white font-semibold mb-1">No videos yet</p>
            <p className="text-white/50 text-sm mb-5">Be the first to post.</p>
            <button onClick={openCreate} className="px-6 py-2.5 bg-[#fe2c55] text-white rounded-md font-semibold text-sm">
              Upload a video
            </button>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="h-full overflow-y-auto snap-y snap-mandatory scroll-smooth"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
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
                  onTogglePause={() => setIsPaused((prev) => ({ ...prev, [video.id]: !prev[video.id] }))}
                  onToggleMute={() => setMuted((m) => !m)}
                  onEnded={handleVideoEnded}
                />

                {/* Legibility scrims */}
                <div className="absolute top-0 inset-x-0 h-[100px] bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 h-[130px] bg-gradient-to-t from-black/60 via-black/25 to-transparent pointer-events-none" />

                {/* Floating hearts for double-tap like */}
                {index === currentIndex && floatingHearts.map((heart) => (
                  <div
                    key={heart.id}
                    className="absolute pointer-events-none"
                    style={{ left: heart.x - 25, top: heart.y - 25, animation: "floatUp 0.8s ease-out forwards" }}
                  >
                    <svg width="50" height="50" viewBox="0 0 48 48" fill="#fe2c55">
                      <path d="M34.6 5.6c-4.6 0-8.5 2.9-10.6 6-2.1-3.1-6-6-10.6-6C6.6 5.6 1.5 11 1.5 18c0 10.3 10.4 16.4 20.4 24.9 1.2 1 2.9 1 4.1 0C36.1 34.4 46.5 28.3 46.5 18c0-7-5.1-12.4-11.9-12.4z"/>
                    </svg>
                  </div>
                ))}

                {/* Right action rail */}
                <div className="absolute right-[6px] bottom-[14px] flex flex-col items-center gap-[14px] z-20">
                  <div className="relative mb-[6px]">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowProfile(video.user.username); }}
                      className="block active:scale-95 transition"
                    >
                      <img
                        src={video.user.avatarUrl}
                        alt={`@${video.user.username}`}
                        className="w-[46px] h-[46px] rounded-full border-[1.5px] border-white bg-gray-700 object-cover"
                      />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleQuickFollow(video.user.username); }}
                      className={`absolute -bottom-[8px] left-1/2 -translate-x-1/2 w-[19px] h-[19px] rounded-full flex items-center justify-center active:scale-90 transition ${
                        video.me?.following ? "bg-white" : "bg-[#fe2c55]"
                      }`}
                    >
                      <span className={`text-[12px] font-bold leading-none mt-[-1px] ${video.me?.following ? "text-[#fe2c55]" : "text-white"}`}>
                        {video.me?.following ? "✓" : "+"}
                      </span>
                    </button>
                  </div>

                  <RailBtn icon={<HeartIcon liked={!!video.me?.liked} />} label={formatNum(video.likes)} onClick={() => handleLike(video.id)} />
                  <RailBtn
                    icon={<CommentIcon />}
                    label={formatNum(video.comments)}
                    onClick={() => { setCommentsVideoId(video.id); setShowComments(true); }}
                  />
                  <RailBtn icon={<BookmarkIcon saved={!!video.me?.saved} />} label={formatNum(video.saves)} onClick={() => handleSave(video.id)} />
                  <RailBtn
                    icon={<ShareArrowIcon />}
                    label="Share"
                    onClick={() => { setShareVideoId(video.id); setShowShare(true); }}
                  />

                  {/* Spinning sound disc */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentSoundName(video.soundName); setShowSoundPage(true); }}
                    className="mt-[6px] active:scale-95 transition"
                  >
                    <div
                      className="w-[42px] h-[42px] rounded-full animate-spin"
                      style={{ animationDuration: "6s", background: "conic-gradient(from 45deg, #1b1b1d, #3a3a3e, #1b1b1d, #3a3a3e, #1b1b1d)" }}
                    >
                      <div className="w-full h-full rounded-full flex items-center justify-center">
                        <img src={video.user.avatarUrl} alt="" className="w-[20px] h-[20px] rounded-full object-cover" />
                      </div>
                    </div>
                  </button>
                </div>

                {/* Bottom-left info */}
                <div className="absolute bottom-[14px] left-[12px] right-[64px] z-10 text-white">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowProfile(video.user.username); }}
                    className="flex items-center gap-[5px] mb-[5px] active:scale-95 transition"
                  >
                    <span className="font-bold text-[16px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">@{video.user.username}</span>
                    {video.user.verified && <VerifiedBadge />}
                  </button>
                  <div
                    onClick={(e) => { e.stopPropagation(); setCaptionExpanded((v) => !v); }}
                    className={`text-[13.5px] leading-[1.35] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] cursor-pointer ${
                      index === currentIndex && captionExpanded ? "" : "line-clamp-2"
                    }`}
                  >
                    <CaptionWithHashtags caption={video.caption} onHashtagClick={(tag) => { setCurrentHashtag(tag); setShowHashtagPage(true); }} />
                    {video.caption.length > 80 && (
                      <span className="font-semibold text-white/75">{index === currentIndex && captionExpanded ? "  less" : "  more"}</span>
                    )}
                  </div>
                  {/* Sound marquee */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentSoundName(video.soundName); setShowSoundPage(true); }}
                    className="flex items-center gap-[6px] mt-[7px] max-w-[190px]"
                  >
                    <MusicNoteIcon />
                    <div className="overflow-hidden whitespace-nowrap flex-1">
                      <div className="inline-flex animate-marquee">
                        <span className="text-[13px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] pr-8">{video.soundName}</span>
                        <span className="text-[13px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] pr-8">{video.soundName}</span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Phone chrome — only in the desktop framed view */}
        {framed && (
          <>
            <div className="absolute top-[9px] left-1/2 -translate-x-1/2 w-[100px] h-[27px] bg-black rounded-full z-50" />
            <div className="absolute top-[13px] left-[26px] right-[20px] flex justify-between items-center text-white z-40 pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
              <span className="text-[14px] font-semibold tracking-wide">9:41</span>
              <div className="flex items-center gap-[5px]">
                <svg className="w-[17px] h-[11px]" viewBox="0 0 17 11" fill="#fff">
                  <rect x="0" y="7" width="3" height="4" rx="0.8"/>
                  <rect x="4.5" y="5" width="3" height="6" rx="0.8"/>
                  <rect x="9" y="2.5" width="3" height="8.5" rx="0.8"/>
                  <rect x="13.5" y="0" width="3" height="11" rx="0.8"/>
                </svg>
                <svg className="w-[15px] h-[11px]" viewBox="0 0 16 12" fill="#fff">
                  <path d="M8 2.4c2.6 0 5 .95 6.85 2.53a.6.6 0 0 0 .84-.06l.9-1.03a.6.6 0 0 0-.05-.85A12.4 12.4 0 0 0 8 0C4.85 0 1.97 1.13.46 2.99a.6.6 0 0 0-.05.85l.9 1.03a.6.6 0 0 0 .84.06A10.6 10.6 0 0 1 8 2.4zm0 4.1c1.42 0 2.73.5 3.76 1.33a.6.6 0 0 0 .82-.07l.92-1.05a.6.6 0 0 0-.06-.86A8.3 8.3 0 0 0 8 4.1c-2.05 0-3.93.68-5.44 1.75a.6.6 0 0 0-.06.86l.92 1.05a.6.6 0 0 0 .82.07A6.3 6.3 0 0 1 8 6.5zm2.3 3.35a.6.6 0 0 0-.05-.9A4.2 4.2 0 0 0 8 8.2c-.85 0-1.63.25-2.25.75a.6.6 0 0 0-.05.9l1.87 2a.6.6 0 0 0 .86 0l1.87-2z"/>
                </svg>
                <div className="flex items-center">
                  <div className="w-[22px] h-[11px] rounded-[3px] border border-white/60 p-[1.5px]">
                    <div className="h-full w-[75%] bg-white rounded-[1.5px]" />
                  </div>
                  <div className="w-[1.5px] h-[4px] bg-white/60 rounded-r ml-[1px]" />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Top bar: About (mobile only) + Following / For You tabs */}
        <div
          className="absolute inset-x-0 flex items-center justify-center gap-[20px] z-30"
          style={{ top: framed ? 46 : "calc(env(safe-area-inset-top, 0px) + 14px)" }}
        >
          {(["following", "foryou"] as const).map((tab) => (
            <button
              key={tab}
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab(tab);
                setCurrentIndex(0);
                scrollContainerRef.current?.scrollTo({ top: 0 });
              }}
              className="relative pb-[7px] active:scale-95 transition cursor-pointer drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
            >
              <span className={`text-[16px] text-white ${activeTab === tab ? "font-bold" : "font-medium opacity-60"}`}>
                {tab === "following" ? "Following" : "For You"}
              </span>
              {activeTab === tab && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[30px] h-[3px] bg-white rounded-full" />}
            </button>
          ))}
        </div>

        {/* About Cole pill — mobile full-viewport only */}
        {!framed && (
          <button
            onClick={(e) => { e.stopPropagation(); onOpenAbout(); }}
            className="absolute left-[14px] z-30 flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/35 backdrop-blur-sm border border-white/20 text-white text-[13px] font-semibold active:scale-95 transition"
            style={{ top: "calc(env(safe-area-inset-top, 0px) + 10px)" }}
          >
            About Cole
          </button>
        )}

        {/* Pull-to-refresh spinner */}
        {isRefreshing && (
          <div className="absolute top-[80px] inset-x-0 flex justify-center z-40">
            <div className="w-7 h-7 border-[3px] border-white/25 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* ---- Bottom nav ---- */}
      <div
        className="bg-black border-t border-white/10 relative shrink-0"
        style={{ paddingBottom: framed ? 0 : "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="h-[64px] flex items-start justify-around pt-[7px] px-1">
          <NavBtn
            icon={<NavHomeIcon active={activeNavTab === "home"} />}
            label="Home"
            active={activeNavTab === "home"}
            onClick={() => {
              setActiveNavTab("home");
              scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
              setCurrentIndex(0);
            }}
          />
          <NavBtn
            icon={<NavDiscoverIcon active={activeNavTab === "discover"} />}
            label="Discover"
            active={activeNavTab === "discover"}
            onClick={() => { setActiveNavTab("discover"); setShowDiscover(true); }}
          />
          {/* Create button */}
          <button onClick={openCreate} className="relative w-[46px] h-[30px] mt-[1px] active:scale-95 transition">
            <div className="absolute inset-y-0 left-0 right-[6px] rounded-[8px] bg-[#25f4ee]" />
            <div className="absolute inset-y-0 left-[6px] right-0 rounded-[8px] bg-[#fe2c55]" />
            <div className="absolute inset-y-0 left-[3px] right-[3px] rounded-[8px] bg-white flex items-center justify-center">
              <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="#000">
                <path d="M13.5 3h-3v7.5H3v3h7.5V21h3v-7.5H21v-3h-7.5z"/>
              </svg>
            </div>
          </button>
          <NavBtn
            icon={
              <div className="relative">
                <NavInboxIcon active={activeNavTab === "inbox"} />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-[3px] -right-[5px] min-w-[15px] h-[15px] px-[3px] rounded-full bg-[#fe2c55] text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadNotifs > 99 ? "99+" : unreadNotifs}
                  </span>
                )}
              </div>
            }
            label="Inbox"
            active={activeNavTab === "inbox"}
            onClick={openInbox}
          />
          <NavBtn icon={<NavProfileIcon active={activeNavTab === "me"} />} label="Me" active={activeNavTab === "me"} onClick={openMe} />
        </div>
        {framed && <div className="absolute bottom-[5px] left-1/2 -translate-x-1/2 w-[110px] h-[4px] bg-white/70 rounded-full" />}
      </div>

      {/* ---- Modals (scoped to the screen) ---- */}
      <CommentsModal
        videoId={commentsVideoId || 0}
        isOpen={showComments}
        onClose={() => { setShowComments(false); setCommentsVideoId(null); }}
        commentCount={commentsVideo?.comments || 0}
        videoOwnerId={commentsVideo?.user.id ?? null}
        onCountChange={(n) => { if (commentsVideoId) mapVideo(commentsVideoId, (x) => ({ ...x, comments: n })); }}
      />

      <ProfileModal username={showProfile} isOpen={!!showProfile} onClose={() => setShowProfile(null)} />

      {/* Share Modal */}
      {showShare && shareVideoId && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-end animate-in slide-in-from-bottom duration-300">
          <div className="w-full bg-[#1a1a1a] rounded-t-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-white font-semibold text-lg">Share to</span>
              <button onClick={() => { setShowShare(false); setShareVideoId(null); }} className="text-white/60 hover:text-white">
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <button onClick={() => handleShare("twitter", shareVideoId)} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-[#1DA1F2] flex items-center justify-center">
                  <span className="text-white text-xl font-bold">𝕏</span>
                </div>
                <span className="text-white text-xs">Twitter</span>
              </button>
              <button onClick={() => handleShare("facebook", shareVideoId)} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-[#4267B2] flex items-center justify-center">
                  <span className="text-white text-xl font-bold">f</span>
                </div>
                <span className="text-white text-xs">Facebook</span>
              </button>
              <button onClick={() => handleShare("whatsapp", shareVideoId)} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <span className="text-white text-xs">WhatsApp</span>
              </button>
              <button onClick={() => handleShare("telegram", shareVideoId)} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-[#0088cc] flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </div>
                <span className="text-white text-xs">Telegram</span>
              </button>
              <button onClick={() => handleShare("instagram", shareVideoId)} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <span className="text-white text-xs">Instagram</span>
              </button>
              <button onClick={() => handleShare("copy", shareVideoId)} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                  {copiedLink ? <span className="text-green-400 text-xl">✓</span> : <span className="text-white text-xl">🔗</span>}
                </div>
                <span className="text-white text-xs">{copiedLink ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <DiscoverModal
        isOpen={showDiscover}
        onClose={() => { setShowDiscover(false); setActiveNavTab("home"); }}
        onHashtagClick={(tag) => { setCurrentHashtag(tag); setShowHashtagPage(true); }}
        onSoundClick={(name) => { setCurrentSoundName(name); setShowSoundPage(true); }}
        onProfileClick={(username) => setShowProfile(username)}
      />

      <InboxModal
        isOpen={showInbox}
        onClose={() => { setShowInbox(false); setActiveNavTab("home"); refreshUnread(); }}
        onAllRead={() => setUnreadNotifs(0)}
      />

      <CreateModal isOpen={showCreate} onClose={() => setShowCreate(false)} />

      <SoundPage
        soundName={currentSoundName}
        isOpen={showSoundPage}
        onClose={() => { setShowSoundPage(false); setCurrentSoundName(""); }}
        onUseSound={() => { if (requireAuth()) { setShowCreate(true); toast.success(`Using sound: ${currentSoundName}`); } }}
      />

      <HashtagPage
        hashtag={currentHashtag}
        isOpen={showHashtagPage}
        onClose={() => { setShowHashtagPage(false); setCurrentHashtag(null); }}
      />

      <PrivacySettingsModal isOpen={showPrivacySettings} onClose={() => setShowPrivacySettings(false)} />
      <WatchHistoryModal isOpen={showWatchHistory} onClose={() => setShowWatchHistory(false)} />

      <LongPressMenu
        isOpen={showLongPressMenu}
        onClose={() => { setShowLongPressMenu(false); setLongPressVideo(null); }}
        video={longPressVideo}
        onLike={() => longPressVideo && handleLike(longPressVideo.id)}
        onSave={() => longPressVideo && handleSave(longPressVideo.id)}
        onShare={() => { if (longPressVideo) { setShareVideoId(longPressVideo.id); setShowShare(true); } }}
        onReport={() => { if (longPressVideo) { setReportVideoId(longPressVideo.id); setShowReport(true); } }}
        onPlaybackRateChange={setPlaybackRate}
        playbackRate={playbackRate}
        isLiked={!!longPressVideo?.me?.liked}
        isSaved={!!longPressVideo?.me?.saved}
      />

      <ReportModal
        isOpen={showReport}
        onClose={() => { setShowReport(false); setReportVideoId(null); }}
        targetType="video"
        targetId={reportVideoId || 0}
      />
    </div>
  );

  /* ---------- desktop framed phone ---------- */
  if (framed) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="relative w-[356px] h-[772px] select-none">
          {/* Side buttons */}
          <div className="absolute -left-[2.5px] top-[136px] w-[3px] h-[24px] bg-[#2c2c2e] rounded-l" />
          <div className="absolute -left-[2.5px] top-[180px] w-[3px] h-[44px] bg-[#2c2c2e] rounded-l" />
          <div className="absolute -left-[2.5px] top-[234px] w-[3px] h-[44px] bg-[#2c2c2e] rounded-l" />
          <div className="absolute -right-[2.5px] top-[196px] w-[3px] h-[68px] bg-[#2c2c2e] rounded-r" />
          {/* Body / bezel */}
          <div className="absolute inset-0 rounded-[54px] bg-[#0d0d0f] shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.14),inset_0_0_0_4px_rgba(0,0,0,0.9)]" />
          {/* Screen */}
          <div className="absolute inset-[11px] rounded-[44px] bg-black overflow-hidden">{screen}</div>
        </div>
        <ToastContainer />
        <FloatUpStyle />
      </div>
    );
  }

  /* ---------- mobile full-viewport ---------- */
  return (
    <div className="fixed inset-0 bg-black" style={{ height: "100dvh" }}>
      {screen}
      <ToastContainer />
      <FloatUpStyle />
    </div>
  );
}

function FloatUpStyle() {
  return (
    <style jsx global>{`
      @keyframes floatUp {
        0% { transform: translateY(0) scale(0.5); opacity: 0; }
        20% { transform: translateY(-20px) scale(1.2); opacity: 1; }
        100% { transform: translateY(-100px) scale(1); opacity: 0; }
      }
    `}</style>
  );
}

function RailBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick?.(); }} className="flex flex-col items-center gap-[3px] text-white active:scale-90 transition">
      {icon}
      <span className="text-[12px] font-semibold leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">{label}</span>
    </button>
  );
}

function NavBtn({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-[3px] min-w-[54px] active:scale-95 transition">
      {icon}
      <span className={`text-[10px] leading-none ${active ? "text-white font-semibold" : "text-[#7a7b82]"}`}>{label}</span>
    </button>
  );
}

/* ---------- Nat-Friedman-style personal site ---------- */

const A = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    className="text-[#0000EE] underline visited:text-[#551A8B]"
    target={href.startsWith("/") ? undefined : "_blank"}
    rel={href.startsWith("/") ? undefined : "noopener noreferrer"}
  >
    {children}
  </a>
);

function NatPortfolio() {
  const blogPosts = [
    { title: "CLI beats MCP.", date: "Feb 2026", slug: "cli-vs-mcp" },
    { title: "GEO is SEO for AI search. It's also fake.", date: "Feb 2026", slug: "geo-is-fake" },
  ];

  return (
    <div className="w-full h-full bg-white overflow-y-auto">
      <div
        className="max-w-[560px] mx-auto lg:mx-0 px-8 py-16 lg:py-24 text-black text-[16px] leading-[1.6]"
        style={{ fontFamily: '"Times New Roman", Times, Georgia, serif' }}
      >
        <h1 className="text-[19px] font-bold mb-7">Cole Gottdank</h1>

        <p className="mb-3">Some things about me:</p>
        <ul className="list-disc pl-10 space-y-[7px] mb-9">
          <li>Learned to code at 14 writing Minecraft plugins</li>
          <li>Started as an engineer, ended up in GTM. These days I do growth engineering at <A href="https://mintlify.com">Mintlify</A></li>
          <li>Before that I helped take <A href="https://helicone.ai">Helicone</A> from zero to $1M ARR in a year</li>
          <li>I build everything with <A href="https://github.com/anthropics/claude-code">Claude Code</A> now, including this site</li>
          <li>Made <A href="https://debateai.org">DebateAI</A> and <A href="https://dailyspud.colegottdank.com">Daily Spud</A></li>
          <li>Learning to cook the way <A href="https://www.kenjilopezalt.com">Kenji</A> does</li>
          <li>Into AI agents and 3D printing. Getting better at basketball, slowly</li>
          <li>Washed up Rocket League grand champ</li>
          <li>The phone on the left is what happens when I stop doing any of the above</li>
        </ul>

        <p className="mb-3">Some things I&rsquo;ve written:</p>
        <ul className="list-disc pl-10 space-y-[7px] mb-9">
          {blogPosts.map((post) => (
            <li key={post.slug}>
              <A href={`/blog/${post.slug}`}>{post.title}</A>{" "}
              <span className="text-black/50">({post.date})</span>
            </li>
          ))}
        </ul>

        <p className="mb-3">Where to find me:</p>
        <ul className="list-disc pl-10 space-y-[7px]">
          <li><A href="https://github.com/colegottdank">GitHub</A></li>
          <li><A href="https://x.com/coleywoleyyy">Twitter</A></li>
          <li><A href="https://linkedin.com/in/colegottdank">LinkedIn</A></li>
        </ul>
      </div>
    </div>
  );
}

// Resolve the lg breakpoint on the client to pick one layout (avoids double-mounting the feed).
function useIsDesktop(): boolean | null {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

export default function Page() {
  const isDesktop = useIsDesktop();
  const [showAbout, setShowAbout] = useState(false);

  // Before the breakpoint resolves, render a neutral white screen (matches both layouts' background).
  if (isDesktop === null) {
    return <main className="bg-white" style={{ height: "100dvh" }} />;
  }

  if (isDesktop) {
    return (
      <main className="flex h-screen w-full overflow-hidden bg-white overflow-lock justify-center">
        <div className="flex shrink-0 h-full items-center lg:mr-16 xl:mr-24">
          <TikTokMobile framed onOpenAbout={() => setShowAbout(true)} />
        </div>
        <div className="h-full min-w-0 w-full lg:w-[600px] lg:shrink-0">
          <NatPortfolio />
        </div>
      </main>
    );
  }

  // Mobile: TikTok is the whole page; the bio lives behind the "About Cole" sheet.
  return (
    <>
      <TikTokMobile framed={false} onOpenAbout={() => setShowAbout(true)} />
      {showAbout && (
        <div className="fixed inset-0 z-[150] bg-white animate-in slide-in-from-bottom duration-300" style={{ height: "100dvh" }}>
          <button
            onClick={() => setShowAbout(false)}
            className="absolute z-10 flex items-center justify-center w-9 h-9 rounded-full bg-black/5 text-black active:scale-95 transition"
            style={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)", right: 16 }}
            aria-label="Close"
          >
            <span className="text-2xl leading-none">&times;</span>
          </button>
          <div className="w-full h-full overflow-y-auto" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
            <NatPortfolio />
          </div>
        </div>
      )}
    </>
  );
}
