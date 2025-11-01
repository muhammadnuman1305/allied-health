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
  departmentId?: string;
  role: number;
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

  const requireAuth = (requiredRole?: number) => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return false;
    }

    if (requiredRole === 1 && !isAdmin()) {
      router.replace("/dashboard");
      return false;
    }

    if (requiredRole === 2 && !isUser()) {
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
