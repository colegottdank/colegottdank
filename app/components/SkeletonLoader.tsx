"use client";

import { useEffect, useState } from "react";

interface SkeletonLoaderProps {
  type: "video" | "profile" | "comment" | "feed";
  count?: number;
}

export function SkeletonLoader({ type, count = 1 }: SkeletonLoaderProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (type === "video") {
    return (
      <div className="h-full w-full bg-black animate-pulse">
        <div className="h-full w-full bg-gray-800" />
      </div>
    );
  }

  if (type === "feed") {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-xl overflow-hidden animate-pulse">
            <div className="aspect-[9/16] bg-gray-700" />
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-600" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-600 rounded w-3/4" />
                  <div className="h-3 bg-gray-600 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-gray-600 rounded w-full" />
              <div className="h-3 bg-gray-600 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "profile") {
    return (
      <div className="animate-pulse">
        {/* Header */}
        <div className="p-6 text-center">
          <div className="w-24 h-24 rounded-full bg-gray-700 mx-auto mb-4" />
          <div className="h-6 bg-gray-700 rounded w-32 mx-auto mb-2" />
          <div className="h-4 bg-gray-700 rounded w-24 mx-auto mb-2" />
          <div className="h-4 bg-gray-700 rounded w-48 mx-auto" />
        </div>
        
        {/* Stats */}
        <div className="flex justify-center gap-8 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center">
              <div className="h-6 bg-gray-700 rounded w-16 mx-auto mb-1" />
              <div className="h-3 bg-gray-700 rounded w-12 mx-auto" />
            </div>
          ))}
        </div>

        {/* Button */}
        <div className="h-10 bg-gray-700 rounded-lg w-full max-w-xs mx-auto mb-6" />

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex-1 py-3">
              <div className="h-5 bg-gray-700 rounded w-16 mx-auto" />
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-1 p-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-gray-700" />
          ))}
        </div>
      </div>
    );
  }

  if (type === "comment") {
    return (
      <div className="space-y-4 p-4 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 bg-gray-700 rounded w-24" />
                <div className="h-3 bg-gray-700 rounded w-12" />
              </div>
              <div className="h-4 bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-700 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

export function ShimmerEffect({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  );
}
