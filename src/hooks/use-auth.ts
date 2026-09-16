import { useState, useEffect, useCallback } from "react";
import { type User, type Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("wasla_auth_user");
        if (cached) return JSON.parse(cached);
      } catch {
        // ignore parse error
      }
    }
    return null;
  });
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1. Get initial session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user && typeof window !== "undefined") {
        localStorage.setItem("wasla_auth_user", JSON.stringify(session.user));
        localStorage.setItem("wasla_auth_session", "true");
      } else if (!session && typeof window !== "undefined") {
        localStorage.removeItem("wasla_auth_user");
        localStorage.removeItem("wasla_auth_session");
      }
      setLoading(false);
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    // 2. Listen for auth changes (sign-in, sign-out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user && typeof window !== "undefined") {
        localStorage.setItem("wasla_auth_user", JSON.stringify(newSession.user));
        localStorage.setItem("wasla_auth_session", "true");
      } else if (!newSession && typeof window !== "undefined") {
        localStorage.removeItem("wasla_auth_user");
        localStorage.removeItem("wasla_auth_session");
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data?.session && typeof window !== "undefined") {
        localStorage.setItem("wasla_auth_user", JSON.stringify(data.session.user));
        localStorage.setItem("wasla_auth_session", "true");
      }
      return data;
    },
    []
  );

  const signUp = useCallback(
    async (email: string, password: string, options: { data?: Record<string, any> } = {}) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options,
      });
      if (error) throw error;
      if (data?.session && typeof window !== "undefined") {
        localStorage.setItem("wasla_auth_user", JSON.stringify(data.session.user));
        localStorage.setItem("wasla_auth_session", "true");
      }
      return data;
    },
    []
  );

  const signOut = useCallback(async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("wasla_auth_user");
      localStorage.removeItem("wasla_auth_session");
      localStorage.removeItem("wasla_remember_me");
    }
    setUser(null);
    setSession(null);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out notice:", err);
    }
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }, []);

  const updateUser = useCallback(
    async (data: Record<string, any>) => {
      const { data: updatedUser, error } = await supabase.auth.updateUser(data);
      if (error) throw error;
      return updatedUser;
    },
    []
  );

  const checkUserStore = useCallback(async (userId?: string) => {
    const targetId = userId || user?.id;
    if (!targetId) return null;
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .eq("user_id", targetId)
      .maybeSingle();
    if (error) {
      console.warn("Could not check user store:", error);
      return null;
    }
    return data;
  }, [user]);

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateUser,
    checkUserStore,
    isAuthenticated: !!user,
  };
}