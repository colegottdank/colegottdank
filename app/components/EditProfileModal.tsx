"use client";

import { useState, useEffect } from "react";
import { X, Camera, Check } from "lucide-react";
import { UserProfile, getUserState, saveUserState } from "@/lib/data";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile>({
    username: "currentuser",
    name: "You",
    bio: "Just a gamer enjoying life 🎮",
    followers: 1234,
    following: 456,
    likes: 89000,
    videos: 23,
    verified: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser&backgroundColor=b6e3f4"
  });
  const [editedName, setEditedName] = useState("");
  const [editedBio, setEditedBio] = useState("");
  const [editedUsername, setEditedUsername] = useState("");

  useEffect(() => {
    if (isOpen) {
      setEditedName(profile.name);
      setEditedBio(profile.bio);
      setEditedUsername(profile.username);
    }
  }, [isOpen, profile]);

  const handleSave = () => {
    // In a real app, this would save to API
    setProfile(prev => ({
      ...prev,
      name: editedName,
      bio: editedBio,
      username: editedUsername
    }));
    onClose();
  };

  if (!isOpen) return null;

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
        <span className="text-white font-semibold text-lg">Edit profile</span>
        <button 
          onClick={handleSave}
          className="text-[#fe2c55] font-semibold text-sm"
        >
          Save
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#0f0f0f] p-6">
        {/* Profile Photo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <img
              src={profile.avatar}
              alt="Profile"
              className="w-24 h-24 rounded-full bg-gray-700 border-2 border-white/10"
            />
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#fe2c55] rounded-full flex items-center justify-center shadow-lg">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          <button className="text-[#fe2c55] text-sm font-medium mt-3">
            Change photo
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="text-white/60 text-sm mb-2 block">Name</label>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full bg-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#fe2c55]/50"
              placeholder="Your name"
            />
            <p className="text-white/40 text-xs mt-1">{editedName.length}/30</p>
          </div>

          {/* Username */}
          <div>
            <label className="text-white/60 text-sm mb-2 block">Username</label>
            <div className="flex items-center">
              <span className="text-white/40 text-sm mr-1">@</span>
              <input
                type="text"
                value={editedUsername}
                onChange={(e) => setEditedUsername(e.target.value)}
                className="flex-1 bg-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#fe2c55]/50"
                placeholder="username"
              />
            </div>
            <p className="text-white/40 text-xs mt-1">www.tiktok.com/@{editedUsername || "username"}</p>
          </div>

          {/* Bio */}
          <div>
            <label className="text-white/60 text-sm mb-2 block">Bio</label>
            <textarea
              value={editedBio}
              onChange={(e) => setEditedBio(e.target.value)}
              placeholder="Add a bio..."
              className="w-full bg-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#fe2c55]/50 resize-none"
              rows={3}
            />
            <p className="text-white/40 text-xs mt-1">{editedBio.length}/80</p>
          </div>

          {/* Private Account Toggle */}
          <div className="flex items-center justify-between py-4 border-t border-white/10">
            <div>
              <p className="text-white font-medium text-sm">Private account</p>
              <p className="text-white/40 text-xs mt-1">Only approved followers can see your videos</p>
            </div>
            <button className="w-12 h-6 bg-white/20 rounded-full relative transition-colors">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
