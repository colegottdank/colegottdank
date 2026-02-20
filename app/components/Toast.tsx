"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, X, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

let toastListeners: ((toast: Toast) => void)[] = [];

export function showToast(message: string, type: ToastType = "info", duration: number = 3000) {
  const toast: Toast = {
    id: Math.random().toString(36).substring(7),
    message,
    type,
    duration
  };
  
  toastListeners.forEach(listener => listener(toast));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (toast: Toast) => {
      setToasts(prev => [...prev, toast]);
      
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, toast.duration || 3000);
    };

    toastListeners.push(handleToast);
    return () => {
      toastListeners = toastListeners.filter(l => l !== handleToast);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <Check className="w-5 h-5 text-green-400" />;
      case "error":
        return <X className="w-5 h-5 text-red-400" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBgColor = (type: ToastType) => {
    switch (type) {
      case "success":
        return "bg-green-500/20 border-green-500/50";
      case "error":
        return "bg-red-500/20 border-red-500/50";
      case "warning":
        return "bg-yellow-500/20 border-yellow-500/50";
      default:
        return "bg-blue-500/20 border-blue-500/50";
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border ${getBgColor(toast.type)} backdrop-blur-sm shadow-lg animate-in slide-in-from-top-2 duration-300 min-w-[300px]`}
        >
          {getIcon(toast.type)}
          <span className="text-white text-sm flex-1">{toast.message}</span>
          <button 
            onClick={() => removeToast(toast.id)}
            className="text-white/60 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// Helper functions
export const toast = {
  success: (message: string) => showToast(message, "success"),
  error: (message: string) => showToast(message, "error"),
  info: (message: string) => showToast(message, "info"),
  warning: (message: string) => showToast(message, "warning")
};
