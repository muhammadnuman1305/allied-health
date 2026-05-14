"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Leaf,
  LogOut,
  ChevronDown,
  ChevronRight,
  Settings,
  LayoutDashboard,
  ChevronsUpDown,
  Users,
  ClipboardList,
  CalendarDays,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearAuth } from "@/lib/auth-utils";
import { useAuth } from "@/hooks/use-auth";

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
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Dashboard: true,
  });
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    const segments = pathname.split("/");
    const sectionMap: Record<string, string> = {
      dashboard: "Dashboard",
      tasks: "Task Management",
      "all-tasks": "Task Management",
      "my-tasks": "Task Management",
      patients: "Patient Management",
      "all-patients": "Patient Management",
      "my-patients": "Patient Management",
      schedule: "Schedule",
    };
    const sectionName = segments[2] || segments[1];
    if (sectionName && sectionMap[sectionName]) {
      setOpenSections((prev) => ({ ...prev, [sectionMap[sectionName]]: true }));
    }
  }, [pathname]);

  const toggleSection = (section: string) => {
    if (isCollapsed) return;
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const userSections = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      items: [
        { title: "Overview", href: "/aha/dashboard" },
        { title: "Calendar", href: "/aha/dashboard/calendar" },
      ],
    },
    {
      title: "Task Management",
      icon: <ClipboardList className="h-4 w-4" />,
      items: [
        { title: "All Tasks", href: "/aha/all-tasks" },
        { title: "My Tasks", href: "/aha/my-tasks" },
      ],
    },
    {
      title: "Patient Management",
      icon: <Users className="h-4 w-4" />,
      items: [
        { title: "All Patients", href: "/aha/all-patients" },
        { title: "My Patients", href: "/aha/my-patients" },
      ],
    },
    {
      title: "Schedule",
      icon: <CalendarDays className="h-4 w-4" />,
      items: [
        { title: "Vacation Requests", href: "/aha/schedule/vacation-requests" },
      ],
    },
  ];

  const userInitials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user?.username?.[0]?.toUpperCase() || "U";

  const userName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.username || "User";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex flex-col bg-card border-r transition-all duration-300 ease-in-out",
        "h-screen min-h-0",
        isCollapsed ? "w-[70px]" : "w-72",
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex h-16 flex-shrink-0 items-center border-b px-4">
        <Link
          href="/aha/dashboard"
          className="flex items-center gap-3 min-w-0"
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-4 w-4 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-none truncate">Allied Assistant</p>
              <p className="text-xs text-muted-foreground mt-0.5">Workspace</p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3" style={{ minHeight: 0 }}>
        <div className="space-y-2">
          {userSections.map((section) => {
            const isOpen = !!openSections[section.title];
            const hasActiveItem = section.items.some(
              (item) =>
                pathname === item.href ||
                (pathname.startsWith(item.href + "/") &&
                  item.href !== "/aha/dashboard")
            );

            return (
              <div key={section.title}>
                {/* Collapsed: icon button with right-side dropdown */}
                {isCollapsed ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={cn(
                          "flex w-full items-center justify-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                          hasActiveItem
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        )}
                        title={section.title}
                      >
                        <span className="flex-shrink-0">{section.icon}</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start" className="w-44 ml-1">
                      <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">{section.title}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {section.items.map((item) => {
                        const isActive =
                          pathname === item.href ||
                          (pathname.startsWith(item.href + "/") &&
                            item.href !== "/aha/dashboard");
                        return (
                          <DropdownMenuItem key={item.href} asChild>
                            <Link
                              href={item.href}
                              className={cn(
                                "cursor-pointer",
                                isActive ? "text-primary font-medium" : ""
                              )}
                            >
                              {item.title}
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    {/* Expanded: section header button */}
                    <button
                      onClick={() => toggleSection(section.title)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors justify-between",
                        hasActiveItem && !isOpen
                          ? "text-foreground"
                          : isOpen
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex-shrink-0">{section.icon}</span>
                        <span>{section.title}</span>
                      </div>
                      {isOpen
                        ? <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        : <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      }
                    </button>

                    {/* Sub-items */}
                    {isOpen && (
                      <div className="ml-5 mt-1 mb-1 border-l border-border pl-3 space-y-0.5">
                        {section.items.map((item) => {
                          const isActive =
                            pathname === item.href ||
                            (pathname.startsWith(item.href + "/") &&
                              item.href !== "/aha/dashboard");
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={cn(
                                "block rounded-md px-3 py-2 text-sm transition-colors",
                                isActive
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-foreground"
                              )}
                              aria-current={isActive ? "page" : undefined}
                            >
                              {item.title}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

      </nav>

      {/* Footer — user card with dropdown */}
      <div className="shrink-0 mt-auto border-t p-3 pb-4">
        <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors",
                  isCollapsed ? "justify-center" : ""
                )}
              >
                <div className="h-8 w-8 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">{userInitials}</span>
                </div>
                {!isCollapsed && user && (
                  <>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium leading-none truncate">{userName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {user.email || "No email"}
                      </p>
                    </div>
                    <ChevronsUpDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-44 mb-1">
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/aha/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialogContent className="max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg font-semibold">
                Confirm Logout
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to logout? You will need to sign in again to access your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row justify-start gap-2 mt-2 sm:justify-start">
              <AlertDialogAction
                onClick={() => {
                  clearAuth();
                  router.push("/login");
                }}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Logout
              </AlertDialogAction>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </aside>
  );
}
