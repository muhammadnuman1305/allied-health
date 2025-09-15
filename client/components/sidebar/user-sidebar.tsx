"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  Leaf,
  LogOut,
  ChevronDown,
  User,
  ChevronUp,
  MessageSquare,
  Calendar,
  BarChart,
  FileText,
  ArrowRight,
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
  const [openSections, setOpenSections] = useState({
    Dashboard: true,
  });
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Initialize open sections based on current path
  useEffect(() => {
    const segments = pathname.split("/");

    // Map pathname to section
    const sectionMap = {
      dashboard: "Dashboard",
      tasks: "Task Management",
      patients: "Patient Management",
      referrals: "Referral Management",
      feedback: "Feedback Management",
      reports: "Report Management",
      settings: "Account",
      profile: "Account",
      support: "Account",
    };

    if (
      segments.length > 1 &&
      sectionMap[segments[1] as keyof typeof sectionMap]
    ) {
      setOpenSections((prev) => ({
        ...prev,
        [sectionMap[segments[1] as keyof typeof sectionMap]]: true,
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
          href: "/dashboard",
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
          title: "Reports",
          href: "/dashboard/reports",
          icon: <BarChart className="h-5 w-5" />,
        },
        {
          title: "Calendar",
          href: "/dashboard/calendar",
          icon: <Calendar className="h-5 w-5" />,
        },
      ],
    },
    {
      title: "Task Management",
      items: [
        {
          title: "All Tasks",
          href: "/tasks",
          icon: <FileText className="h-5 w-5" />,
        },
        {
          title: "My Tasks",
          href: "/tasks/my-tasks",
          icon: <FileText className="h-5 w-5" />,
        },
      ],
    },
    {
      title: "Patient Management",
      items: [
        {
          title: "All Patients",
          href: "/patients",
          icon: <User className="h-5 w-5" />,
        },
        {
          title: "My Patients",
          href: "/my-patients",
          icon: <User className="h-5 w-5" />,
        },
      ],
    },
    {
      title: "Referral Management",
      items: [
        {
          title: "All Referrals",
          href: "/referrals",
          icon: <ArrowRight className="h-5 w-5" />,
        },
        {
          title: "My Referrals",
          href: "/my-referrals",
          icon: <ArrowRight className="h-5 w-5" />,
        },
      ],
    },
    {
      title: "Feedback Management",
      items: [
        {
          title: "All Feedback",
          href: "/feedback",
          icon: <MessageSquare className="h-5 w-5" />,
        },
        {
          title: "My Feedback",
          href: "/feedback/my-feedback",
          icon: <MessageSquare className="h-5 w-5" />,
        },
      ],
    },
    {
      title: "Report Management",
      items: [
        {
          title: "Task Reports",
          href: "/reports/tasks",
          icon: <BarChart className="h-5 w-5" />,
        },
        {
          title: "Patient Reports",
          href: "/reports/patients",
          icon: <BarChart className="h-5 w-5" />,
        },
        {
          title: "Referral Reports",
          href: "/reports/referrals",
          icon: <BarChart className="h-5 w-5" />,
        },
        {
          title: "Performance Reports",
          href: "/reports/performance",
          icon: <BarChart className="h-5 w-5" />,
        },
      ],
    },
    {
      title: "Account",
      items: [
        // {
        //   title: "Profile",
        //   href: "/profile",
        //   icon: <UserCog className="h-5 w-5" />,
        // },
        // {
        //   title: "Notifications",
        //   href: "/notifications",
        //   icon: <BellRing className="h-5 w-5" />,
        // },
        {
          title: "Settings",
          href: "/settings",
          icon: <Settings className="h-5 w-5" />,
        },
        // {
        //   title: "Support",
        //   href: "/support",
        //   icon: <LifeBuoy className="h-5 w-5" />,
        // },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col bg-card border-r transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[70px]" : "w-64",
        className
      )}
      {...props}
    >
      {/* Header/Logo Section */}
      <div className="flex h-20 items-center justify-center border-b px-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-tight">
              Allied Health
            </span>
          )}
        </Link>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        <div className="space-y-1">
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
                  "space-y-1 mt-1",
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
                      item.href !== "/dashboard");
                  return (
                    <Link
                      key={item.href}
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

      {/* User Info Section */}
      <div className="border-t py-3 px-3">
        <div
          className={cn(
            "flex items-center rounded-md bg-muted/40 px-3 py-2",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium truncate">John Doe</span>
                <span className="text-xs text-muted-foreground">
                  Premium Plan
                </span>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-auto border-t py-4 px-3">
        <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm w-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors",
                isCollapsed ? "justify-center" : "justify-start"
              )}
              title={isCollapsed ? "Logout" : undefined}
            >
              <LogOut className="h-5 w-5" />
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
              <AlertDialogCancel className="w-28">Cancel</AlertDialogCancel>
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
      </div>
    </aside>
  );
}
