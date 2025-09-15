"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated, isAdmin, isUser, clearAuth, redirectBasedOnRole } from "@/lib/auth-utils";

interface UserData {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  accessToken: string;
  role: string;
  isAdmin: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = getUser();
    setUser(userData);
    setIsLoading(false);
  }, []);

  const logout = () => {
    clearAuth();
    setUser(null);
    router.push("/login");
  };

  const requireAuth = (requiredRole?: "admin" | "user") => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return false;
    }

    if (requiredRole === "admin" && !isAdmin()) {
      router.replace("/dashboard");
      return false;
    }

    if (requiredRole === "user" && !isUser()) {
      router.replace("/admin/dashboard");
      return false;
    }

    return true;
  };

  return {
    user,
    isLoading,
    isAuthenticated: isAuthenticated(),
    isAdmin: isAdmin(),
    isUser: isUser(),
    logout,
    requireAuth,
    redirectBasedOnRole,
  };
}
