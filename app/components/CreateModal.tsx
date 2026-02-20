"use client";

import { useState, useRef, useEffect } from "react";
import { 
  X, Upload, Camera, Image as ImageIcon, Film, Smile, 
  MapPin, Globe, MessageCircle, Users, Clock, Check,
  ChevronRight, Save
} from "lucide-react";
import { mockLocations, mockDrafts, Draft } from "@/lib/data";
import { toast } from "./Toast";

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateModal({ isOpen, onClose }: CreateModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [showDrafts, setShowDrafts] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>(mockDrafts);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Settings
  const [location, setLocation] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<'everyone' | 'friends' | 'private'>('everyone');
  const [allowComments, setAllowComments] = useState(true);
  const [allowDuet, setAllowDuet] = useState(true);
  const [allowStitch, setAllowStitch] = useState(true);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showVisibilityPicker, setShowVisibilityPicker] = useState(false);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const loadDraft = (draft: Draft) => {
    setPreview(draft.videoUrl);
    setCaption(draft.caption);
    setSelectedFile(new File([], "draft-video.mp4", { type: "video/mp4" }));
    setShowDrafts(false);
    toast.success("Draft loaded");
  };

  const saveDraft = () => {
    const newDraft: Draft = {
      id: `draft-${Date.now()}`,
      videoUrl: preview || '',
      thumbnail: preview || '',
      caption: caption || 'Untitled draft',
      createdAt: 'Just now',
      duration: '0:30',
      hasChanges: true
    };
    setDrafts(prev => [newDraft, ...prev]);
    toast.success("Draft saved");
  };

  const deleteDraft = (id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
    toast.success("Draft deleted");
  };

  const handlePost = () => {
    if (scheduledDate) {
      toast.success(`Video scheduled for ${new Date(scheduledDate).toLocaleString()}`);
    } else {
      toast.success("Video posted successfully!");
    }
    setSelectedFile(null);
    setCaption("");
    setPreview(null);
    setLocation(null);
    setScheduledDate(null);
    onClose();
  };

  if (!isOpen) return null;

  if (showDrafts) {
    return (
      <div className="absolute inset-0 bg-black/95 z-50 flex flex-col animate-in fade-in duration-300">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <button onClick={() => setShowDrafts(false)} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
          <span className="text-white font-semibold text-lg">Drafts</span>
          <div className="w-10" />
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {drafts.length === 0 ? (
            <div className="text-center text-white/40 py-12">
              <Save className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No drafts yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {drafts.map((draft) => (
                <div key={draft.id} className="flex gap-3 p-3 bg-white/5 rounded-xl">
                  <div className="w-24 h-32 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={draft.thumbnail} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium line-clamp-2">{draft.caption}</p>
                    <p className="text-white/50 text-sm mt-1">{draft.createdAt}</p>
                    <p className="text-white/40 text-xs mt-1">{draft.duration}</p>
                    {draft.hasChanges && (
                      <span className="inline-block mt-2 px-2 py-1 bg-[#fe2c55]/20 text-[#fe2c55] text-xs rounded-full">
                        Has unsaved changes
                      </span>
                    )}
                    <div className="flex gap-2 mt-3">
                      <button 
                        onClick={() => loadDraft(draft)}
                        className="px-4 py-2 bg-[#fe2c55] text-white rounded-full text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteDraft(draft.id)}
                        className="px-4 py-2 bg-white/10 text-white rounded-full text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black/95 z-50 flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <button onClick={onClose} className="text-white/60 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        <span className="text-white font-semibold text-lg">Create</span>
        {selectedFile ? (
          <div className="flex items-center gap-2">
            <button onClick={saveDraft} className="text-white/60 hover:text-white">
              <Save className="w-5 h-5" />
            </button>
            <button onClick={handlePost} className="text-[#fe2c55] font-semibold text-sm">
              Post
            </button>
          </div>
        ) : (
          <button onClick={() => setShowDrafts(true)} className="text-white/60 hover:text-white">
            <Save className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!selectedFile ? (
          <div className="space-y-4">
            {/* Upload Options */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-white/40 transition-colors"
            >
              <div className="w-16 h-16 bg-[#fe2c55]/20 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-[#fe2c55]" />
              </div>
              <p className="text-white font-semibold mb-2">Upload video</p>
              <p className="text-white/40 text-sm text-center">MP4 or WebM<br/>Up to 180 seconds</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Quick Options */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => toast.info("Camera feature coming soon!")}
                className="bg-white/10 rounded-xl p-6 flex flex-col items-center gap-3 hover:bg-white/20 transition-colors"
              >
                <Camera className="w-8 h-8 text-white" />
                <span className="text-white text-sm font-medium">Record</span>
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/10 rounded-xl p-6 flex flex-col items-center gap-3 hover:bg-white/20 transition-colors"
              >
                <ImageIcon className="w-8 h-8 text-white" />
                <span className="text-white text-sm font-medium">Templates</span>
              </button>
            </div>

            {/* Tips */}
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-2">Tips</h3>
              <ul className="text-white/60 text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <Film className="w-4 h-4" />
                  Use high quality videos for best results
                </li>
                <li className="flex items-center gap-2">
                  <Smile className="w-4 h-4" />
                  Add trending sounds to go viral
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview */}
            <div className="aspect-[9/16] max-h-[400px] bg-black rounded-xl overflow-hidden">
              {preview && (
                <video src={preview} className="w-full h-full object-contain" controls />
              )}
            </div>

            {/* Caption Input */}
            <div>
              <label className="text-white/60 text-sm mb-2 block">Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Describe your video..."
                className="w-full bg-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#fe2c55]/50 resize-none"
                rows={3}
              />
            </div>

            {/* Location */}
            <button 
              onClick={() => setShowLocationPicker(true)}
              className="w-full flex items-center justify-between p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-white/60" />
                <span className="text-white text-sm">{location || "Add location"}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40" />
            </button>

            {/* Visibility */}
            <button 
              onClick={() => setShowVisibilityPicker(true)}
              className="w-full flex items-center justify-between p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                {visibility === 'everyone' ? <Globe className="w-5 h-5 text-white/60" /> :
                 visibility === 'friends' ? <Users className="w-5 h-5 text-white/60" /> :
                 <X className="w-5 h-5 text-white/60" />}
                <span className="text-white text-sm">
                  {visibility === 'everyone' ? 'Everyone' :
                   visibility === 'friends' ? 'Friends only' : 'Private'}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40" />
            </button>

            {/* Allow Comments Toggle */}
            <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-white/60" />
                <span className="text-white text-sm">Allow comments</span>
              </div>
              <button 
                onClick={() => setAllowComments(!allowComments)}
                className={`w-12 h-6 rounded-full relative transition-colors ${allowComments ? "bg-[#fe2c55]" : "bg-white/20"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${allowComments ? "left-7" : "left-1"}`} />
              </button>
            </div>

            {/* Allow Duet Toggle */}
            <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
              <span className="text-white text-sm">Allow duet</span>
              <button 
                onClick={() => setAllowDuet(!allowDuet)}
                className={`w-12 h-6 rounded-full relative transition-colors ${allowDuet ? "bg-[#fe2c55]" : "bg-white/20"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${allowDuet ? "left-7" : "left-1"}`} />
              </button>
            </div>

            {/* Allow Stitch Toggle */}
            <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
              <span className="text-white text-sm">Allow stitch</span>
              <button 
                onClick={() => setAllowStitch(!allowStitch)}
                className={`w-12 h-6 rounded-full relative transition-colors ${allowStitch ? "bg-[#fe2c55]" : "bg-white/20"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${allowStitch ? "left-7" : "left-1"}`} />
              </button>
            </div>

            {/* Schedule Post */}
            <button 
              onClick={() => setShowSchedulePicker(true)}
              className="w-full flex items-center justify-between p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-white/60" />
                <span className="text-white text-sm">
                  {scheduledDate ? `Scheduled for ${new Date(scheduledDate).toLocaleString()}` : "Schedule post"}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40" />
            </button>

            {/* Change Video */}
            <button 
              onClick={() => {
                setSelectedFile(null);
                setPreview(null);
              }}
              className="w-full py-3 text-[#fe2c55] text-sm font-medium"
            >
              Choose different video
            </button>
          </div>
        )}
      </div>

      {/* Location Picker */}
      {showLocationPicker && (
        <div className="absolute inset-0 bg-black z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <button onClick={() => setShowLocationPicker(false)} className="text-white/60 hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <span className="text-white font-semibold text-lg">Add Location</span>
            <div className="w-10" />
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              <button 
                onClick={() => { setLocation(null); setShowLocationPicker(false); }}
                className="w-full p-4 text-white text-left hover:bg-white/5 rounded-xl"
              >
                No location
              </button>
              {mockLocations.map((loc) => (
                <button 
                  key={loc.id}
                  onClick={() => { setLocation(loc.name); setShowLocationPicker(false); toast.success(`Location: ${loc.name}`); }}
                  className="w-full p-4 text-left hover:bg-white/5 rounded-xl"
                >
                  <p className="text-white font-medium">{loc.name}</p>
                  <p className="text-white/50 text-sm">{loc.country}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Visibility Picker */}
      {showVisibilityPicker && (
        <div className="absolute inset-0 bg-black z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <button onClick={() => setShowVisibilityPicker(false)} className="text-white/60 hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <span className="text-white font-semibold text-lg">Who can view</span>
            <div className="w-10" />
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {[
                { value: 'everyone', label: 'Everyone', icon: Globe },
                { value: 'friends', label: 'Friends only', icon: Users },
                { value: 'private', label: 'Only me', icon: X }
              ].map((option) => (
                <button 
                  key={option.value}
                  onClick={() => { setVisibility(option.value as any); setShowVisibilityPicker(false); toast.success(`Visibility: ${option.label}`); }}
                  className="w-full p-4 flex items-center justify-between hover:bg-white/5 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <option.icon className="w-5 h-5 text-white/60" />
                    <span className="text-white">{option.label}</span>
                  </div>
                  {visibility === option.value && (
                    <Check className="w-5 h-5 text-[#fe2c55]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Picker */}
      {showSchedulePicker && (
        <div className="absolute inset-0 bg-black z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <button onClick={() => setShowSchedulePicker(false)} className="text-white/60 hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <span className="text-white font-semibold text-lg">Schedule Post</span>
            <div className="w-10" />
          </div>
          <div className="flex-1 p-4">
            <input 
              type="datetime-local"
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full bg-white/10 text-white p-4 rounded-xl"
            />
            <button 
              onClick={() => { 
                if (scheduledDate) {
                  setShowSchedulePicker(false); 
                  toast.success(`Post scheduled!`);
                } else {
                  toast.error("Please select a date and time");
                }
              }}
              className="w-full mt-4 py-3 bg-[#fe2c55] text-white rounded-xl font-semibold"
            >
              Confirm Schedule
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
