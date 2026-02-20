"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  videoId: number;
  isActive: boolean;
  isPaused: boolean;
  muted: boolean;
  playbackRate?: number;
  loop?: boolean;
  onTogglePause: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onSeek?: (time: number) => void;
  onEnded?: () => void;
}

export function VideoPlayer({
  src,
  videoId,
  isActive,
  isPaused,
  muted,
  playbackRate = 1,
  loop = true,
  onTogglePause,
  onTimeUpdate,
  onSeek,
  onEnded,
  onToggleMute
}: VideoPlayerProps & { onToggleMute?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      if (isPaused) {
        video.pause();
      } else {
        // Try to play with better error handling
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log("Autoplay prevented:", error);
            // If autoplay is prevented, show the play button overlay
          });
        }
      }
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isActive, isPaused]);

  // Handle playback rate changes
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Handle video ended for auto-advance
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !onEnded) return;

    const handleEnded = () => {
      onEnded();
    };

    video.addEventListener("ended", handleEnded);
    return () => {
      video.removeEventListener("ended", handleEnded);
    };
  }, [onEnded]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
    };
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);

    // Check if video is already ready
    if (video.readyState >= 3) {
      setIsLoading(false);
    }

    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      const total = video.duration || 1;
      const prog = (current / total) * 100;
      setProgress(prog);
      
      if (onTimeUpdate) {
        onTimeUpdate(current, total);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const bufferedPercent = (bufferedEnd / video.duration) * 100;
        setBuffered(bufferedPercent);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("progress", handleProgress);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("progress", handleProgress);
    };
  }, [onTimeUpdate]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setProgress(percentage * 100);
    }
    
    if (onSeek) {
      onSeek(newTime);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div 
      className="relative w-full h-full bg-black"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover cursor-pointer z-10"
        loop={loop}
        playsInline
        muted={muted}
        onClick={onTogglePause}
        preload={isActive ? "auto" : "metadata"}
        style={{ display: hasError ? 'none' : 'block' }}
      />
      
      {/* Play/Pause Overlay */}
      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Progress Bar - Always visible but subtle */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-white/20 cursor-pointer transition-all duration-200 ${showControls || isPaused ? "h-1.5 opacity-100" : "h-0.5 opacity-60"}`}
        onClick={handleSeek}
      >
        {/* Buffered progress */}
        <div 
          className="absolute top-0 left-0 h-full bg-white/30"
          style={{ width: `${buffered}%` }}
        />
        
        {/* Playback progress */}
        <div 
          className="absolute top-0 left-0 h-full bg-[#fe2c55]"
          style={{ width: `${progress}%` }}
        />
        
        {/* Progress handle */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#fe2c55] rounded-full shadow-lg transform -translate-x-1/2"
          style={{ left: `${progress}%` }}
        />
      </div>

      {/* Time display */}
      {(showControls || isPaused) && duration > 0 && (
        <div className="absolute bottom-3 left-3 text-white text-xs font-medium drop-shadow-md">
          {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
        </div>
      )}

      {/* Volume Button - Clickable */}
      <button
        onClick={onToggleMute}
        className="absolute top-3 right-3 text-white/70 hover:text-white z-20 p-2"
      >
        {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-12 h-12 border-4 border-white/20 border-t-[#fe2c55] rounded-full animate-spin" />
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-2xl">⚠️</span>
            </div>
            <p className="text-white text-sm">Failed to load video</p>
            <button 
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
                videoRef.current?.load();
              }}
              className="mt-3 px-4 py-2 bg-[#fe2c55] text-white rounded-full text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}