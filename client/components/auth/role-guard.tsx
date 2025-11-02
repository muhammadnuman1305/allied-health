"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, isAdmin, isUser } from "@/lib/auth-utils";

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: "admin" | "user";
  fallbackPath?: string;
}

export function RoleGuard({
  children,
  requiredRole,
  fallbackPath,
}: RoleGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = () => {
      if (!isAuthenticated()) {
        // Not authenticated, redirect to appropriate login page
        const loginPath = requiredRole === "admin" ? "/admin-login" : "/login";
        router.replace(fallbackPath || loginPath);
        return;
      }

      let roleCheck = false;
      if (requiredRole === "admin") {
        roleCheck = isAdmin();
        if (!roleCheck) {
          // User is authenticated but not admin, redirect to user dashboard
          router.replace(fallbackPath || "/user/dashboard");
          return;
        }
      } else if (requiredRole === "user") {
        roleCheck = isUser();
        if (!roleCheck) {
          // User is authenticated but is admin, redirect to admin dashboard
          router.replace(fallbackPath || "/admin/dashboard");
          return;
        }
      }

      setHasAccess(roleCheck);
      setIsLoading(false);
    };

    checkAccess();
  }, [requiredRole, fallbackPath, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}
