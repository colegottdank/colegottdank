"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { users as usersApi, User, ApiError } from "@/lib/api-client";

interface EditProfileModalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onSaved: (updated: User) => void;
}

export function EditProfileModal({ isOpen, user, onClose, onSaved }: EditProfileModalProps) {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setBio(user.bio || "");
      setError(null);
    }
  }, [isOpen, user]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const { user: updated } = await usersApi.updateMe({ name: name.trim(), bio: bio.trim() });
      onSaved(updated);
      onClose();
    } catch (e) {
      if (e instanceof ApiError && e.status === 422) setError(`Blocked: ${e.reason || "failed moderation"}`);
      else if (e instanceof ApiError) setError(e.message);
      else setError("Couldn't save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0f0f0f]">
        <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-6 h-6" /></button>
        <span className="text-white font-semibold text-lg">Edit profile</span>
        <button onClick={handleSave} disabled={saving} className="text-[#fe2c55] font-semibold text-sm disabled:opacity-40">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#0f0f0f] p-6">
        <div className="flex flex-col items-center mb-8">
          <img src={user.avatarUrl} alt="Profile" className="w-24 h-24 rounded-full bg-gray-700 border-2 border-white/10" />
          <p className="text-white/40 text-xs mt-3">@{user.username}</p>
        </div>

        {error && <p className="text-[#fe2c55] text-sm mb-4">{error}</p>}

        <div className="space-y-6">
          <div>
            <label className="text-white/60 text-sm mb-2 block">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              className="w-full bg-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#fe2c55]/50"
              placeholder="Your name"
            />
            <p className="text-white/40 text-xs mt-1">{name.length}/30</p>
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={80}
              placeholder="Add a bio…"
              className="w-full bg-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#fe2c55]/50 resize-none"
              rows={3}
            />
            <p className="text-white/40 text-xs mt-1">{bio.length}/80</p>
          </div>
        </div>
      </div>
    </div>
  );
}
