"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/landing-page/navbar";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/sidebar/admin-sidebar";
import { isAuthenticated, isAdmin, clearAuth } from "@/lib/auth-utils";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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
        router.replace("/login");
        return;
      }

      if (!isAdmin()) {
        // User is authenticated but is not an admin, redirect to user dashboard
        router.replace("/aha/dashboard");
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
    <div className="theme-purple flex min-h-screen flex-col">
      {/* Desktop Sidebar */}
      <AdminSidebar
        className="hidden lg:flex"
        isCollapsed={isSidebarCollapsed}
      />

      {/* Mobile Sidebar Sheet */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72 lg:hidden">
          <VisuallyHidden>
            <SheetTitle>Navigation Menu</SheetTitle>
          </VisuallyHidden>
          <AdminSidebar isCollapsed={false} />
        </SheetContent>
      </Sheet>

      <div
        className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "lg:ml-[70px]" : "lg:ml-72"
        }`}
      >
        <Navbar
          onToggleSidebar={toggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
