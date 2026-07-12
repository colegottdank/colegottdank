"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { ApiError } from "@/lib/api-client";

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: "login" | "signup";
  onClose: () => void;
  onLogin: (username: string, password: string) => Promise<void>;
  onSignup: (username: string, name: string, password: string) => Promise<void>;
}

const USERNAME_RE = /^[a-z0-9_.]{3,24}$/;

export function AuthModal({ isOpen, initialTab = "login", onLogin, onSignup, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "signup">(initialTab);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setError(null);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const switchTab = (t: "login" | "signup") => {
    setTab(t);
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    const u = username.trim().toLowerCase();
    if (!USERNAME_RE.test(u)) {
      setError("Username must be 3-24 chars: lowercase letters, numbers, _ or .");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (tab === "signup" && !name.trim()) {
      setError("Add a display name.");
      return;
    }
    setBusy(true);
    try {
      if (tab === "login") {
        await onLogin(u, password);
      } else {
        await onSignup(u, name.trim(), password);
      }
      setUsername("");
      setName("");
      setPassword("");
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 401) setError("Wrong username or password.");
        else if (e.status === 403) setError("This account is banned.");
        else setError(e.reason || e.message);
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[360px] bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="text-white font-semibold text-lg">
            {tab === "login" ? "Log in" : "Sign up"}
          </span>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {(["login", "signup"] as const).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                tab === t ? "text-white" : "text-white/50"
              }`}
            >
              {t === "login" ? "Log in" : "Sign up"}
              {tab === t && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#fe2c55]" />}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="p-5 space-y-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="username"
            className="w-full bg-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#fe2c55]/50"
          />
          {tab === "signup" && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="display name"
              className="w-full bg-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#fe2c55]/50"
            />
          )}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !busy) handleSubmit();
            }}
            placeholder="password"
            className="w-full bg-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#fe2c55]/50"
          />

          {error && <p className="text-[#fe2c55] text-xs px-1">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={busy}
            className="w-full bg-[#fe2c55] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#fe2c55]/90 transition-colors disabled:opacity-50"
          >
            {busy ? "..." : tab === "login" ? "Log in" : "Sign up"}
          </button>

          <p className="text-white/40 text-xs text-center pt-1">
            {tab === "login" ? (
              <>
                No account?{" "}
                <button onClick={() => switchTab("signup")} className="text-white/70 hover:text-white">
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have one?{" "}
                <button onClick={() => switchTab("login")} className="text-white/70 hover:text-white">
                  Log in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
