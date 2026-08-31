"use client";

import { useState, useEffect, useCallback } from "react";
import { X, MoreHorizontal, UserPlus, UserCheck, Grid3X3, Heart, Bookmark, Trash2 } from "lucide-react";
import { users as usersApi, videos as videosApi, User, Video, ProfileTab, ApiError } from "@/lib/api-client";
import { useAuth } from "./AuthContext";
import { VideoPlayer } from "./VideoPlayer";
import { EditProfileModal } from "./EditProfileModal";
import { PrivacySettingsModal } from "./PrivacySettingsModal";
import { WatchHistoryModal } from "./WatchHistoryModal";
import { ReportModal } from "./ReportModal";
import { toast } from "./Toast";

interface ProfileModalProps {
  username: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatNumber = (num: number) => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
};

export function ProfileModal({ username, isOpen, onClose }: ProfileModalProps) {
  const { user: me, setUser: setMe } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>("videos");
  const [tabVideos, setTabVideos] = useState<Record<ProfileTab, Video[] | undefined>>({ videos: undefined, liked: undefined, saved: undefined });
  const [tabLoading, setTabLoading] = useState(false);
  const [playing, setPlaying] = useState<Video | null>(null);
  const [muted, setMuted] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showWatchHistory, setShowWatchHistory] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const isCurrentUser = !!me && !!profile && me.username === profile.username;

  useEffect(() => {
    if (!username || !isOpen) return;
    setLoading(true);
    setNotFound(false);
    setActiveTab("videos");
    setTabVideos({ videos: undefined, liked: undefined, saved: undefined });
    usersApi
      .get(username)
      .then((r) => setProfile(r.user))
      .catch((e) => {
        setProfile(null);
        if (e instanceof ApiError && e.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [username, isOpen]);

  // Lazy-load each tab's grid.
  const loadTab = useCallback(
    (tab: ProfileTab) => {
      if (!profile || tabVideos[tab] !== undefined) return;
      setTabLoading(true);
      usersApi
        .videos(profile.username, tab)
        .then((r) => setTabVideos((prev) => ({ ...prev, [tab]: r.videos })))
        .catch(() => setTabVideos((prev) => ({ ...prev, [tab]: [] })))
        .finally(() => setTabLoading(false));
    },
    [profile, tabVideos]
  );

  useEffect(() => {
    if (profile && isOpen) loadTab(activeTab);
  }, [profile, isOpen, activeTab, loadTab]);

  const handleFollowToggle = () => {
    if (!profile) return;
    if (!me) return; // page-level require-auth normally gates this; guard anyway
    const wasFollowing = !!profile.me?.following;
    setProfile((p) =>
      p ? { ...p, me: { following: !wasFollowing }, followers: p.followers + (wasFollowing ? -1 : 1) } : p
    );
    const call = wasFollowing ? usersApi.unfollow(profile.username) : usersApi.follow(profile.username);
    call
      .then((r) => setProfile((p) => (p ? { ...p, followers: r.followers } : p)))
      .catch(() => {
        setProfile((p) =>
          p ? { ...p, me: { following: wasFollowing }, followers: p.followers + (wasFollowing ? 1 : -1) } : p
        );
        toast.error("Couldn't update follow");
      });
  };

  const handleDeleteVideo = async (v: Video) => {
    setTabVideos((prev) => ({ ...prev, videos: (prev.videos || []).filter((x) => x.id !== v.id) }));
    setPlaying(null);
    try {
      await videosApi.delete(v.id);
      toast.success("Video deleted");
    } catch {
      toast.error("Couldn't delete video");
    }
  };

  if (!isOpen) return null;

  if (loading || (!profile && !notFound)) {
    return (
      <div className="absolute inset-0 bg-[#0f0f0f] z-50 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-6 h-6" /></button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="absolute inset-0 bg-[#0f0f0f] z-50 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-6 h-6" /></button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <p className="text-white font-semibold mb-1">User not found</p>
          <p className="text-white/50 text-sm">This account doesn&rsquo;t exist.</p>
        </div>
      </div>
    );
  }

  const grid = tabVideos[activeTab];

  const StatusBadge = ({ status }: { status: Video["status"] }) => {
    if (status === "live") return null;
    const map: Record<string, string> = {
      pending: "bg-yellow-500/80 text-black",
      rejected: "bg-red-600/80 text-white",
      removed: "bg-white/20 text-white",
    };
    return (
      <span className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold capitalize ${map[status] || "bg-white/20 text-white"}`}>
        {status}
      </span>
    );
  };

  const VideoGrid = ({ list, emptyIcon, emptyText }: { list: Video[] | undefined; emptyIcon: React.ReactNode; emptyText: string }) => {
    if (tabLoading && !list) {
      return <div className="flex justify-center py-12"><div className="w-7 h-7 border-[3px] border-white/20 border-t-white rounded-full animate-spin" /></div>;
    }
    if (!list || list.length === 0) {
      return (
        <div className="text-center text-white/40 py-12">
          {emptyIcon}
          <p className="mt-2">{emptyText}</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-3 gap-1">
        {list.map((video) => (
          <button
            key={video.id}
            onClick={() => setPlaying(video)}
            className="aspect-[3/4] bg-gray-800 relative group cursor-pointer overflow-hidden"
          >
            {video.thumbUrl ? (
              <img src={video.thumbUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <video src={video.url} preload="metadata" playsInline muted className="w-full h-full object-cover" />
            )}
            <StatusBadge status={video.status} />
            <div className="absolute bottom-1 left-1 flex items-center gap-1 text-white text-[11px] drop-shadow">
              <Heart className="w-3 h-3 fill-white" />
              {formatNumber(video.likes)}
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="absolute inset-0 bg-black/95 z-50 flex items-end animate-in slide-in-from-bottom duration-300">
      <div className="w-full h-full bg-[#0f0f0f] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0f0f0f]">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
            <span className="text-white font-semibold text-lg">{profile.name}</span>
            {profile.verified && (
              <div className="w-4 h-4 bg-[#20d5ec] rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              </div>
            )}
          </div>
          {!isCurrentUser && (
            <button onClick={() => setShowMoreOptions(true)} className="text-white/60 hover:text-white transition-colors"><MoreHorizontal className="w-6 h-6" /></button>
          )}
        </div>

        {/* Profile Info */}
        <div className="p-3 text-center bg-[#0f0f0f]">
          <img src={profile.avatarUrl} alt={profile.name} className="w-16 h-16 rounded-full bg-gray-700 mx-auto mb-2 border-2 border-white/10" />
          <h2 className="text-white text-base font-bold">{profile.name}</h2>
          <p className="text-white/50 text-xs mb-1">@{profile.username}</p>
          {profile.bio && <p className="text-white/80 text-xs mb-3 max-w-xs mx-auto whitespace-pre-wrap">{profile.bio}</p>}

          <div className="flex justify-center gap-6 mb-3">
            <div className="text-center">
              <div className="text-white font-semibold text-sm">{formatNumber(profile.following)}</div>
              <div className="text-white/50 text-[10px]">Following</div>
            </div>
            <div className="text-center">
              <div className="text-white font-semibold text-sm">{formatNumber(profile.followers)}</div>
              <div className="text-white/50 text-[10px]">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-white font-semibold text-sm">{formatNumber(profile.likes)}</div>
              <div className="text-white/50 text-[10px]">Likes</div>
            </div>
          </div>

          {isCurrentUser ? (
            <div className="flex gap-2 justify-center">
              <button onClick={() => setShowEditProfile(true)} className="bg-white/10 text-white px-6 py-2 rounded-md font-medium text-sm hover:bg-white/20 transition-colors">
                Edit profile
              </button>
              <button onClick={() => setShowMoreOptions(true)} className="bg-white/10 text-white px-3 py-2 rounded-md font-medium text-sm hover:bg-white/20 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleFollowToggle}
              className={`px-6 py-2 rounded-md font-semibold text-sm w-full max-w-[200px] transition-all ${
                profile.me?.following ? "bg-white/10 text-white border border-white/20 hover:bg-white/20" : "bg-[#fe2c55] text-white hover:bg-[#fe2c55]/90"
              }`}
            >
              {profile.me?.following ? (
                <span className="flex items-center justify-center gap-2"><UserCheck className="w-3 h-3" />Following</span>
              ) : (
                <span className="flex items-center justify-center gap-2"><UserPlus className="w-3 h-3" />Follow</span>
              )}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-[#0f0f0f]">
          <button onClick={() => setActiveTab("videos")} className={`flex-1 py-2 text-xs font-medium transition-colors relative ${activeTab === "videos" ? "text-white" : "text-white/50"}`}>
            <Grid3X3 className="w-4 h-4 mx-auto mb-0.5" />Videos
            {activeTab === "videos" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#fe2c55]" />}
          </button>
          <button onClick={() => setActiveTab("liked")} className={`flex-1 py-2 text-xs font-medium transition-colors relative ${activeTab === "liked" ? "text-white" : "text-white/50"}`}>
            <Heart className="w-4 h-4 mx-auto mb-0.5" />Liked
            {activeTab === "liked" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#fe2c55]" />}
          </button>
          {isCurrentUser && (
            <button onClick={() => setActiveTab("saved")} className={`flex-1 py-2 text-xs font-medium transition-colors relative ${activeTab === "saved" ? "text-white" : "text-white/50"}`}>
              <Bookmark className="w-4 h-4 mx-auto mb-0.5" />Saved
              {activeTab === "saved" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#fe2c55]" />}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-[#0f0f0f] scroll-smooth">
          <div className="p-2 pb-20 min-h-full">
            {activeTab === "videos" && <VideoGrid list={grid} emptyIcon={<Grid3X3 className="w-12 h-12 mx-auto opacity-50" />} emptyText="No videos yet" />}
            {activeTab === "liked" && <VideoGrid list={grid} emptyIcon={<Heart className="w-12 h-12 mx-auto opacity-50" />} emptyText="Videos liked will appear here" />}
            {activeTab === "saved" && <VideoGrid list={grid} emptyIcon={<Bookmark className="w-12 h-12 mx-auto opacity-50" />} emptyText="Saved videos will appear here" />}
          </div>
        </div>

        {/* Lightweight player overlay */}
        {playing && (
          <div className="absolute inset-0 bg-black z-[60] flex flex-col animate-in fade-in duration-200">
            <div className="flex items-center justify-between p-4">
              <button onClick={() => setPlaying(null)} className="text-white/80 hover:text-white"><X className="w-6 h-6" /></button>
              {isCurrentUser && (
                <button onClick={() => handleDeleteVideo(playing)} className="text-red-400 hover:text-red-300 flex items-center gap-1 text-sm">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              )}
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
              <p className="text-sm">{playing.caption}</p>
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        <EditProfileModal
          isOpen={showEditProfile}
          user={profile}
          onClose={() => setShowEditProfile(false)}
          onSaved={(updated) => {
            setProfile(updated);
            if (me && me.username === updated.username) setMe(updated);
          }}
        />

        {/* More Options */}
        {showMoreOptions && (
          <div className="absolute inset-0 bg-black/80 z-50 flex items-end animate-in slide-in-from-bottom duration-300">
            <div className="w-full bg-[#1a1a1a] rounded-t-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10"><p className="text-white font-semibold text-center">Options</p></div>
              <div className="divide-y divide-white/10">
                {isCurrentUser ? (
                  <>
                    <button onClick={() => { setShowMoreOptions(false); setShowPrivacySettings(true); }} className="w-full px-4 py-4 text-white text-left hover:bg-white/5 transition-colors">Privacy settings</button>
                    <button onClick={() => { setShowMoreOptions(false); setShowWatchHistory(true); }} className="w-full px-4 py-4 text-white text-left hover:bg-white/5 transition-colors">Watch history</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setShowMoreOptions(false); setShowReportModal(true); }} className="w-full px-4 py-4 text-white text-left hover:bg-white/5 transition-colors">Report</button>
                    <button onClick={() => { toast.success(`Blocked @${profile.username}`); setShowMoreOptions(false); }} className="w-full px-4 py-4 text-white text-left hover:bg-white/5 transition-colors">Block</button>
                  </>
                )}
                <button onClick={() => setShowMoreOptions(false)} className="w-full px-4 py-4 text-white/60 text-left hover:bg-white/5 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        )}

        <PrivacySettingsModal isOpen={showPrivacySettings} onClose={() => setShowPrivacySettings(false)} />
        <WatchHistoryModal isOpen={showWatchHistory} onClose={() => setShowWatchHistory(false)} />
        <ReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} targetType="user" targetId={profile.username} targetName={profile.name} />
      </div>
    </div>
  );
}
