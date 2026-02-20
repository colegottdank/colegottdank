"use client";

import { useState, useEffect } from "react";
import { X, MoreHorizontal, UserPlus, UserCheck, Grid3X3, Heart, Bookmark } from "lucide-react";
import { UserProfile, sampleVideos, isFollowing, followUser, unfollowUser, getLikedVideos, getSavedVideos, Video, mockLikedVideos, mockSavedVideos, currentUserVideos } from "@/lib/data";
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

export function ProfileModal({ username, isOpen, onClose }: ProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isFollowed, setIsFollowed] = useState(false);
  const [activeTab, setActiveTab] = useState<"videos" | "likes" | "saved">("videos");
  const [followerCount, setFollowerCount] = useState(0);
  const [likedVideos, setLikedVideos] = useState<Video[]>([]);
  const [savedVideos, setSavedVideos] = useState<Video[]>([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showWatchHistory, setShowWatchHistory] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (username && isOpen) {
      // In a real app, fetch from API
      const profiles: Record<string, UserProfile> = {
        sybogames: { username: "sybogames", name: "SYBO Games", bio: "Official Subway Surfers account 🎮", followers: 2500000, following: 45, likes: 89200000, videos: 456, verified: true, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sybogames" },
        subwaygod: { username: "subwaygod", name: "Pro Player", bio: "Speed running mobile games 🏃‍♂️💨", followers: 456000, following: 123, likes: 12300000, videos: 234, verified: false, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=subwaygod" },
        speedking: { username: "speedking", name: "Gamer", bio: "World record attempts daily 📱", followers: 89000, following: 234, likes: 3400000, videos: 189, verified: false, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=speedking" },
        chillgamer: { username: "chillgamer", name: "Casual", bio: "Just playing for fun 😊", followers: 12000, following: 567, likes: 456000, videos: 89, verified: false, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=chillgamer" },
        howtoplay: { username: "howtoplay", name: "Guide", bio: "Gaming tutorials and tips 📚", followers: 234000, following: 89, likes: 7800000, videos: 567, verified: true, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=howtoplay" },
        bestclips: { username: "bestclips", name: "Highlight", bio: "Best gaming moments daily 🎬", followers: 1200000, following: 156, likes: 45600000, videos: 1234, verified: false, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bestclips" },
        currentuser: { username: "currentuser", name: "You", bio: "Just a gamer enjoying life 🎮", followers: 1234, following: 456, likes: 89000, videos: 23, verified: false, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser" }
      };
      
      const userProfile = profiles[username];
      if (userProfile) {
        setProfile(userProfile);
        setFollowerCount(userProfile.followers);
        setIsFollowed(isFollowing(username));
      }
      
      // Load liked and saved videos - use mock data for demo
      if (username === "currentuser") {
        setLikedVideos(mockLikedVideos);
        setSavedVideos(mockSavedVideos);
      } else {
        setLikedVideos(getLikedVideos());
        setSavedVideos(getSavedVideos());
      }
    }
  }, [username, isOpen]);

  const handleFollowToggle = () => {
    if (!profile) return;
    
    if (isFollowed) {
      unfollowUser(profile.username);
      setFollowerCount(prev => prev - 1);
    } else {
      followUser(profile.username);
      setFollowerCount(prev => prev + 1);
    }
    setIsFollowed(!isFollowed);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const userVideos = username === "currentuser" 
    ? currentUserVideos 
    : sampleVideos.filter(v => v.username === username);

  if (!isOpen || !profile) return null;

  const isCurrentUser = username === "currentuser";

  return (
    <div className="absolute inset-0 bg-black/95 z-50 flex items-end animate-in slide-in-from-bottom duration-300">
      <div className="w-full h-full bg-[#0f0f0f] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0f0f0f]">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <span className="text-white font-semibold text-lg">{profile.name}</span>
            {profile.verified && (
              <div className="w-4 h-4 bg-[#20d5ec] rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
            )}
          </div>
          {!isCurrentUser && (
            <button 
              onClick={() => setShowMoreOptions(true)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <MoreHorizontal className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Profile Info */}
        <div className="p-3 text-center bg-[#0f0f0f]">
          <img 
            src={profile.avatar}
            alt={profile.name}
            className="w-16 h-16 rounded-full bg-gray-700 mx-auto mb-2 border-2 border-white/10"
          />
          <h2 className="text-white text-base font-bold">{profile.name}</h2>
          <p className="text-white/50 text-xs mb-1">@{profile.username}</p>
          <p className="text-white/80 text-xs mb-3 max-w-xs mx-auto">{profile.bio}</p>
          
          <div className="flex justify-center gap-6 mb-3">
            <div className="text-center">
              <div className="text-white font-semibold text-sm">{formatNumber(profile.following)}</div>
              <div className="text-white/50 text-[10px]">Following</div>
            </div>
            <div className="text-center">
              <div className="text-white font-semibold text-sm">{formatNumber(followerCount)}</div>
              <div className="text-white/50 text-[10px]">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-white font-semibold text-sm">{formatNumber(profile.likes)}</div>
              <div className="text-white/50 text-[10px]">Likes</div>
            </div>
          </div>

          {isCurrentUser ? (
            <div className="flex gap-2 justify-center">
              <button 
                onClick={() => setShowEditProfile(true)}
                className="bg-white/10 text-white px-6 py-2 rounded-md font-medium text-sm hover:bg-white/20 transition-colors"
              >
                Edit profile
              </button>
              <button 
                onClick={() => setShowMoreOptions(true)}
                className="bg-white/10 text-white px-3 py-2 rounded-md font-medium text-sm hover:bg-white/20 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleFollowToggle}
              className={`px-6 py-2 rounded-md font-semibold text-sm w-full max-w-[200px] transition-all ${
                isFollowed 
                  ? "bg-white/10 text-white border border-white/20 hover:bg-white/20" 
                  : "bg-[#fe2c55] text-white hover:bg-[#fe2c55]/90"
              }`}
            >
              {isFollowed ? (
                <span className="flex items-center justify-center gap-2">
                  <UserCheck className="w-3 h-3" />
                  Following
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <UserPlus className="w-3 h-3" />
                  Follow
                </span>
              )}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-[#0f0f0f]">
          <button 
            onClick={() => setActiveTab("videos")}
            className={`flex-1 py-2 text-xs font-medium transition-colors relative ${
              activeTab === "videos" ? "text-white" : "text-white/50"
            }`}
          >
            <Grid3X3 className="w-4 h-4 mx-auto mb-0.5" />
            Videos
            {activeTab === "videos" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#fe2c55]" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab("likes")}
            className={`flex-1 py-2 text-xs font-medium transition-colors relative ${
              activeTab === "likes" ? "text-white" : "text-white/50"
            }`}
          >
            <Heart className="w-4 h-4 mx-auto mb-0.5" />
            Liked
            {activeTab === "likes" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#fe2c55]" />
            )}
          </button>
          {isCurrentUser && (
            <button 
              onClick={() => setActiveTab("saved")}
              className={`flex-1 py-2 text-xs font-medium transition-colors relative ${
                activeTab === "saved" ? "text-white" : "text-white/50"
              }`}
            >
              <Bookmark className="w-4 h-4 mx-auto mb-0.5" />
              Saved
              {activeTab === "saved" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#fe2c55]" />
              )}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-[#0f0f0f] scroll-smooth">
          <div className="p-2 pb-20 min-h-full">
          {activeTab === "videos" && (
            <div className="grid grid-cols-3 gap-1">
              {userVideos.map((video) => (
                <div key={video.id} className="aspect-[3/4] bg-gray-800 relative group cursor-pointer overflow-hidden">
                  <video 
                    src={video.url}
                    preload="metadata"
                    playsInline
                    muted
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      console.error('Video load error:', video.url);
                      (e.target as HTMLVideoElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex items-center gap-3 text-white text-sm">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4 fill-white" />
                        {(video.likes / 1000).toFixed(1)}K
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === "likes" && (
            likedVideos.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {likedVideos.map((video) => (
                  <div key={video.id} className="aspect-[3/4] bg-gray-800 relative group cursor-pointer overflow-hidden">
                    <video 
                      src={video.url}
                      preload="metadata"
                      playsInline
                      muted
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        console.error('Video load error:', video.url);
                        (e.target as HTMLVideoElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex items-center gap-3 text-white text-sm">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4 fill-white" />
                          {(video.likes / 1000).toFixed(1)}K
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-white/40 py-12">
                <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Videos you liked will appear here</p>
              </div>
            )
          )}
          
          {activeTab === "saved" && (
            savedVideos.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {savedVideos.map((video) => (
                  <div key={video.id} className="aspect-[3/4] bg-gray-800 relative group cursor-pointer overflow-hidden">
                    <video 
                      src={video.url}
                      preload="metadata"
                      playsInline
                      muted
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        console.error('Video load error:', video.url);
                        (e.target as HTMLVideoElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex items-center gap-3 text-white text-sm">
                        <span className="flex items-center gap-1">
                          <Bookmark className="w-4 h-4 fill-white" />
                          {(video.likes / 1000).toFixed(1)}K
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-white/40 py-12">
                <Bookmark className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Saved videos will appear here</p>
              </div>
            )
          )}
          </div>
        </div>

        {/* Edit Profile Modal */}
        <EditProfileModal
          isOpen={showEditProfile}
          onClose={() => setShowEditProfile(false)}
        />

        {/* More Options Menu */}
        {showMoreOptions && (
          <div className="absolute inset-0 bg-black/80 z-50 flex items-end animate-in slide-in-from-bottom duration-300">
            <div className="w-full bg-[#1a1a1a] rounded-t-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <p className="text-white font-semibold text-center">Options</p>
              </div>
              <div className="divide-y divide-white/10">
                {isCurrentUser ? (
                  <>
                    <button 
                      onClick={() => {
                        setShowMoreOptions(false);
                        setShowPrivacySettings(true);
                      }}
                      className="w-full px-4 py-4 text-white text-left hover:bg-white/5 transition-colors"
                    >
                      Privacy settings
                    </button>
                    <button 
                      onClick={() => {
                        setShowMoreOptions(false);
                        setShowWatchHistory(true);
                      }}
                      className="w-full px-4 py-4 text-white text-left hover:bg-white/5 transition-colors"
                    >
                      Watch history
                    </button>
                    <button 
                      onClick={() => {
                        toast.info("QR code feature coming soon!");
                        setShowMoreOptions(false);
                      }}
                      className="w-full px-4 py-4 text-white text-left hover:bg-white/5 transition-colors"
                    >
                      QR code
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        setShowMoreOptions(false);
                        setShowReportModal(true);
                      }}
                      className="w-full px-4 py-4 text-white text-left hover:bg-white/5 transition-colors"
                    >
                      Report
                    </button>
                    <button 
                      onClick={() => {
                        toast.success(`Blocked @${profile?.username}`);
                        setShowMoreOptions(false);
                      }}
                      className="w-full px-4 py-4 text-white text-left hover:bg-white/5 transition-colors"
                    >
                      Block
                    </button>
                    <button 
                      onClick={() => {
                        toast.success(`Muted @${profile?.username}`);
                        setShowMoreOptions(false);
                      }}
                      className="w-full px-4 py-4 text-white text-left hover:bg-white/5 transition-colors"
                    >
                      Mute
                    </button>
                    <button 
                      onClick={() => {
                        toast.info("Message feature coming soon!");
                        setShowMoreOptions(false);
                      }}
                      className="w-full px-4 py-4 text-white text-left hover:bg-white/5 transition-colors"
                    >
                      Send message
                    </button>
                  </>
                )}
                <button 
                  onClick={() => setShowMoreOptions(false)}
                  className="w-full px-4 py-4 text-white/60 text-left hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

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

        {/* Report Modal */}
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          targetType="user"
          targetId={profile?.username || ""}
          targetName={profile?.name}
        />
      </div>
    </div>
  );
}