"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, Eye, EyeOff, Download, UserPlus, Globe, Lock } from "lucide-react";
import { 
  PrivacySettings, 
  defaultPrivacySettings,
  mockBlockedUsers,
  mockMutedUsers,
  BlockedUser,
  MutedUser
} from "@/lib/data";
import { toast } from "./Toast";

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacySettingsModal({ isOpen, onClose }: PrivacySettingsModalProps) {
  const [settings, setSettings] = useState<PrivacySettings>(defaultPrivacySettings);
  const [activeSection, setActiveSection] = useState<"main" | "blocked" | "muted">("main");
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>(mockBlockedUsers);
  const [mutedUsers, setMutedUsers] = useState<MutedUser[]>(mockMutedUsers);

  useEffect(() => {
    if (isOpen) {
      // Load settings from localStorage
      const saved = localStorage.getItem('tiktok_privacy_settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    }
  }, [isOpen]);

  const saveSettings = (newSettings: PrivacySettings) => {
    setSettings(newSettings);
    localStorage.setItem('tiktok_privacy_settings', JSON.stringify(newSettings));
    toast.success("Settings saved");
  };

  const unblockUser = (username: string) => {
    setBlockedUsers(prev => prev.filter(u => u.username !== username));
    toast.success(`Unblocked @${username}`);
  };

  const unmuteUser = (username: string) => {
    setMutedUsers(prev => prev.filter(u => u.username !== username));
    toast.success(`Unmuted @${username}`);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-[#0f0f0f]">
        <button onClick={activeSection === "main" ? onClose : () => setActiveSection("main")} className="text-white/60 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        <span className="text-white font-semibold text-lg">
          {activeSection === "main" ? "Privacy" : activeSection === "blocked" ? "Blocked accounts" : "Muted accounts"}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#0f0f0f]">
        {activeSection === "main" && (
          <div className="divide-y divide-white/10">
            {/* Private Account */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Private account</p>
                  <p className="text-white/50 text-sm">Only approved followers can see your content</p>
                </div>
              </div>
              <button 
                onClick={() => saveSettings({ ...settings, privateAccount: !settings.privateAccount })}
                className={`w-12 h-6 rounded-full relative transition-colors ${settings.privateAccount ? "bg-[#fe2c55]" : "bg-white/20"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.privateAccount ? "left-7" : "left-1"}`} />
              </button>
            </div>

            {/* Liked Videos Privacy */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Liked videos</p>
                  <p className="text-white/50 text-sm">Who can see videos you've liked</p>
                </div>
              </div>
              <div className="ml-13 pl-13 space-y-2">
                {[
                  { value: "everyone", label: "Everyone" },
                  { value: "friends", label: "Friends" },
                  { value: "only_me", label: "Only me" }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => saveSettings({ ...settings, likedVideosVisibleTo: option.value as any })}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span className="text-white text-sm">{option.label}</span>
                    {settings.likedVideosVisibleTo === option.value && (
                      <div className="w-5 h-5 bg-[#fe2c55] rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile View History */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <EyeOff className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Profile view history</p>
                  <p className="text-white/50 text-sm">See who viewed your profile</p>
                </div>
              </div>
              <button 
                onClick={() => saveSettings({ ...settings, profileViewsEnabled: !settings.profileViewsEnabled })}
                className={`w-12 h-6 rounded-full relative transition-colors ${settings.profileViewsEnabled ? "bg-[#fe2c55]" : "bg-white/20"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.profileViewsEnabled ? "left-7" : "left-1"}`} />
              </button>
            </div>

            {/* Allow Downloads */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Allow video downloads</p>
                  <p className="text-white/50 text-sm">Others can download your videos</p>
                </div>
              </div>
              <button 
                onClick={() => saveSettings({ ...settings, allowDownloads: !settings.allowDownloads })}
                className={`w-12 h-6 rounded-full relative transition-colors ${settings.allowDownloads ? "bg-[#fe2c55]" : "bg-white/20"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.allowDownloads ? "left-7" : "left-1"}`} />
              </button>
            </div>

            {/* Suggest Account */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Suggest account to others</p>
                  <p className="text-white/50 text-sm">Appear in "Suggested for you"</p>
                </div>
              </div>
              <button 
                onClick={() => saveSettings({ ...settings, suggestAccountToOthers: !settings.suggestAccountToOthers })}
                className={`w-12 h-6 rounded-full relative transition-colors ${settings.suggestAccountToOthers ? "bg-[#fe2c55]" : "bg-white/20"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.suggestAccountToOthers ? "left-7" : "left-1"}`} />
              </button>
            </div>

            {/* Blocked Accounts */}
            <button 
              onClick={() => setActiveSection("blocked")}
              className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Blocked accounts</p>
                  <p className="text-white/50 text-sm">{blockedUsers.length} blocked</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40" />
            </button>

            {/* Muted Accounts */}
            <button 
              onClick={() => setActiveSection("muted")}
              className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <EyeOff className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Muted accounts</p>
                  <p className="text-white/50 text-sm">{mutedUsers.length} muted</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40" />
            </button>
          </div>
        )}

        {activeSection === "blocked" && (
          <div className="divide-y divide-white/10">
            {blockedUsers.length === 0 ? (
              <div className="text-center text-white/40 py-12">
                <Globe className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No blocked accounts</p>
              </div>
            ) : (
              blockedUsers.map((user) => (
                <div key={user.username} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full bg-gray-700" />
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-white/50 text-sm">@{user.username}</p>
                      <p className="text-white/40 text-xs">Blocked {user.blockedAt}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => unblockUser(user.username)}
                    className="px-4 py-2 bg-white/10 text-white rounded-full text-sm font-medium hover:bg-white/20 transition-colors"
                  >
                    Unblock
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeSection === "muted" && (
          <div className="divide-y divide-white/10">
            {mutedUsers.length === 0 ? (
              <div className="text-center text-white/40 py-12">
                <EyeOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No muted accounts</p>
              </div>
            ) : (
              mutedUsers.map((user) => (
                <div key={user.username} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full bg-gray-700" />
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-white/50 text-sm">@{user.username}</p>
                      <p className="text-white/40 text-xs">Muted {user.mutedAt}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => unmuteUser(user.username)}
                    className="px-4 py-2 bg-white/10 text-white rounded-full text-sm font-medium hover:bg-white/20 transition-colors"
                  >
                    Unmute
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
