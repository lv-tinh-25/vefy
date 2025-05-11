"use client";

import useSWR from "swr";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  profileCompleted: boolean;
  authMethods: string[];
}

export function useAuth() {
  const { data: session, isPending } = useSession();

  const { data: profile, mutate } = useSWR<UserProfile>(
    session?.user ? "profile" : null,
    async () => {
      const res = await api.api.profile.me.$get();
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
  );

  return {
    user: session?.user ?? null,
    profile,
    session: session?.session ?? null,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
    isProfileCompleted: profile?.profileCompleted ?? false,
    hasPassword: profile?.authMethods?.includes("credential") ?? false,
    hasGoogle: profile?.authMethods?.includes("google") ?? false,
    mutate,
  };
}
