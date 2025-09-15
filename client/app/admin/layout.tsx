"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/landing-page/navbar";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/sidebar/admin-sidebar";
import { isAuthenticated, isAdmin, clearAuth } from "@/lib/auth-utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Authentication and role checking
  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        // Not authenticated, redirect to admin login
        router.replace("/admin-login");
        return;
      }

      if (!isAdmin()) {
        // User is authenticated but is not an admin, redirect to user dashboard
        router.replace("/dashboard");
        return;
      }

      // User is authenticated and has admin role
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  // Close mobile sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    } else {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <AdminSidebar
        className={`border-r ${
          isSidebarCollapsed ? "lg:w-[70px]" : "lg:w-64"
        } hidden lg:block`}
        isCollapsed={isSidebarCollapsed}
      />

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          {/* Sidebar */}
          <AdminSidebar
            className="absolute left-0 top-0 h-full w-64 border-r bg-background"
            isCollapsed={false}
          />
        </div>
      )}

      <div className="flex flex-col flex-1">
        <Navbar
          onToggleSidebar={toggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
