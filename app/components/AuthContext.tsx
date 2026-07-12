"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { auth as authApi, User } from "@/lib/api-client";
import { AuthModal } from "./AuthModal";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  /** Replace the cached viewer (after login/signup/profile edit). */
  setUser: (u: User | null) => void;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Returns true if authed. If not, opens the auth modal and returns false. */
  requireAuth: () => boolean;
  openAuth: (tab?: "login" | "signup") => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"login" | "signup">("login");

  useEffect(() => {
    let alive = true;
    authApi
      .me()
      .then((r) => {
        if (alive) setUser(r.user);
      })
      .catch(() => {
        if (alive) setUser(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { user } = await authApi.login({ username, password });
    setUser(user);
    setModalOpen(false);
  }, []);

  const signup = useCallback(async (username: string, name: string, password: string) => {
    const { user } = await authApi.signup({ username, name, password });
    setUser(user);
    setModalOpen(false);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {});
    setUser(null);
  }, []);

  const openAuth = useCallback((tab: "login" | "signup" = "login") => {
    setModalTab(tab);
    setModalOpen(true);
  }, []);

  const requireAuth = useCallback(() => {
    if (user) return true;
    setModalTab("login");
    setModalOpen(true);
    return false;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, loading, setUser, login, signup, logout, requireAuth, openAuth }}
    >
      {children}
      <AuthModal
        isOpen={modalOpen}
        initialTab={modalTab}
        onClose={() => setModalOpen(false)}
        onLogin={login}
        onSignup={signup}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
