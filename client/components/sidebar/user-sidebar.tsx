"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Leaf,
  LogOut,
  ChevronDown,
  User,
  ChevronUp,
  MessageSquare,
  Calendar,
  BarChart,
  FileText,
  CalendarDays,
  Clock,
  Settings,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { clearAuth } from "@/lib/auth-utils";
import { useAuth } from "@/hooks/use-auth";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

export function UserSidebar({
  className = "",
  isCollapsed = false,
  ...props
}: {
  className?: string;
  isCollapsed?: boolean;
  [key: string]: any;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [openSections, setOpenSections] = useState({
    Dashboard: true,
  });
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Initialize open sections based on current path
  useEffect(() => {
    const segments = pathname.split("/");

    // Map pathname to section (check segments[2] since /user is segments[1])
    const sectionMap = {
      dashboard: "Dashboard",
      tasks: "Task Management",
      "all-tasks": "Task Management",
      "my-tasks": "Task Management",
      patients: "Patient Management",
      feedback: "Feedback Management",
      schedule: "Schedule Management",
    };

    // Check both segments[1] (if no /user prefix) and segments[2] (if /user prefix exists)
    const sectionName = segments[2] || segments[1];
    if (sectionName && sectionMap[sectionName as keyof typeof sectionMap]) {
      const sectionToOpen = sectionMap[sectionName as keyof typeof sectionMap];
      setOpenSections((prev) => ({
        ...prev,
        [sectionToOpen]: true,
        // Also open Leave & Scheduling when on settings page
        ...(sectionName === "settings" && { "Leave & Scheduling": true }),
      }));
    }
  }, [pathname]);

  const toggleSection = (section: string) => {
    if (isCollapsed) return;
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }));
  };

  const userSections = [
    {
      title: "Dashboard",
      items: [
        {
          title: "Overview",
          href: "/user/dashboard",
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
          title: "Calendar",
          href: "/user/dashboard/calendar",
          icon: <Calendar className="h-5 w-5" />,
        },
      ],
    },
    {
      title: "Task Management",
      items: [
        {
          title: "All Tasks",
          href: "/user/all-tasks",
          icon: <FileText className="h-5 w-5" />,
        },
        {
          title: "My Tasks",
          href: "/user/my-tasks",
          icon: <FileText className="h-5 w-5" />,
        },
      ],
    },
    {
      title: "Patient Management",
      items: [
        {
          title: "All Patients",
          href: "/user/all-patients",
          icon: <User className="h-5 w-5" />,
        },
        {
          title: "My Patients",
          href: "/user/my-patients",
          icon: <User className="h-5 w-5" />,
        },
      ],
    },
    {
      title: "Feedback Management",
      items: [
        {
          title: "Feedbacks",
          href: "/user/feedback",
          icon: <MessageSquare className="h-5 w-5" />,
        },
      ],
    },
    {
      title: "Schedule Management",
      items: [
        {
          title: "Vacation Requests",
          href: "/user/schedule/vacation-requests",
          icon: <CalendarDays className="h-5 w-5" />,
        },
        {
          title: "Reschedule Requests",
          href: "/user/schedule/reschedule-requests",
          icon: <Clock className="h-5 w-5" />,
        },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex flex-col bg-card border-r transition-all duration-300 ease-in-out h-screen overflow-hidden",
        isCollapsed ? "w-[70px]" : "w-72",
        className
      )}
      {...props}
    >
      {/* Header/Logo Section */}
      <div className="flex h-20 flex-shrink-0 items-center justify-center border-b px-3">
        <Link href="/user/dashboard" className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-tight">
              Allied Health
            </span>
          )}
        </Link>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 min-h-0 overflow-y-auto py-4 px-3 scrollbar-thin">
        <div className="space-y-4">
          {userSections.map((section) => (
            <div key={section.title}>
              {!isCollapsed && (
                <button
                  onClick={() => toggleSection(section.title)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    openSections[section.title as keyof typeof openSections]
                      ? "bg-muted text-foreground"
                      : "hover:bg-muted/50 text-muted-foreground"
                  )}
                  aria-expanded={
                    openSections[section.title as keyof typeof openSections]
                  }
                >
                  <span>{section.title}</span>
                  {openSections[section.title as keyof typeof openSections] ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              )}

              <div
                className={cn(
                  "space-y-2 mt-2",
                  isCollapsed ? "pl-0" : "pl-2",
                  isCollapsed
                    ? "block"
                    : openSections[section.title as keyof typeof openSections]
                    ? "block"
                    : "hidden"
                )}
              >
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (pathname.startsWith(item.href + "/") &&
                      item.href !== "/user/dashboard");
                  return (
                    <Link
                      key={`${section.title}-${item.title}`}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        isCollapsed ? "justify-center" : "justify-start",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      title={isCollapsed ? item.title : undefined}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <div
                        className={cn(
                          "flex-shrink-0",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        {item.icon}
                      </div>
                      {!isCollapsed && (
                        <span className="truncate">{item.title}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer Section */}
      <div className="mt-auto flex-shrink-0 flex flex-col border-t">
        <Separator />
        <div className="px-3 py-3 space-y-2">
          {/* Settings Button */}
          <Link
            href="/user/settings"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm w-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
              isCollapsed ? "justify-center" : "justify-start",
              pathname === "/user/settings" &&
                "bg-primary/10 text-primary font-medium"
            )}
            title={isCollapsed ? "Settings" : undefined}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </Link>

          {/* Logout Button */}
          <AlertDialog
            open={logoutDialogOpen}
            onOpenChange={setLogoutDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm w-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors",
                  isCollapsed ? "justify-center" : "justify-start"
                )}
                title={isCollapsed ? "Logout" : undefined}
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span>Logout</span>}
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md p-8">
              <AlertDialogHeader className="items-center">
                <LogOut className="h-8 w-8 text-destructive mb-2" />
                <AlertDialogTitle className="text-center text-lg font-semibold">
                  Are you sure you want to logout?
                </AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-row justify-center gap-3 mt-4 sm:justify-center">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    clearAuth();
                    router.push("/login");
                  }}
                  className="w-28 bg-destructive text-white hover:bg-destructive/90"
                >
                  Logout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Separator before User Info */}
          {!isCollapsed && user && <Separator className="my-2" />}

          {/* User Info Card */}
          {!isCollapsed && user && (
            <Card>
              <CardContent className="px-3 py-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none truncate">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.username || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground leading-none truncate">
                    {user.email || "No email"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          {isCollapsed && user && (
            <div className="mt-2 flex justify-center">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-medium text-primary">
                  {user.firstName && user.lastName
                    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                    : user.username?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
