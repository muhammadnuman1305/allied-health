"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BarChart,
  Settings,
  Users,
  FileText,
  LogOut,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  BellRing,
  Database,
  LineChart,
  User,
  Building2,
  Bed,
  ClipboardList,
  Plus,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
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

export function AdminSidebar({
  className = "",
  isCollapsed = false,
  ...props
}: {
  className?: string;
  isCollapsed?: boolean;
  [key: string]: any;
}) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState({
    Dashboard: true,
  });
  const router = useRouter();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Initialize open sections based on current path
  useEffect(() => {
    const segments = pathname.split("/");
    if (segments.length > 2) {
      const mainSection = segments[2];

      // Map pathname to section
      const sectionMap = {
        dashboard: "Dashboard",
        analytics: "Dashboard",
        reports: "Dashboard",
        realtime: "Dashboard",
        users: "User Management",
        roles: "User Management",
        permissions: "User Management",
        patients: "Patient Management",
        tasks: "Patient Management",
        content: "Patient Management",
        media: "Patient Management",
        referrals: "Referral Management",
        "create-referral": "Referral Management",
        incoming: "Referral Management",
        outgoing: "Referral Management",
        setup: "Clinical Setup",
        departments: "Clinical Setup",
        wards: "Clinical Setup",
        coverage: "Clinical Setup",
        system: "System Management",
        logs: "System Management",
        security: "System Management",
        settings: "Settings",
        // 'billing': 'Billing',
        // 'subscriptions': 'Billing',
      };

      if (sectionMap[mainSection as keyof typeof sectionMap]) {
        setOpenSections((prev) => ({
          ...prev,
          [sectionMap[mainSection as keyof typeof sectionMap]]: true,
        }));
      }
    }
  }, [pathname]);

  const toggleSection = (section: string) => {
    if (isCollapsed) return;
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }));
  };

  const adminSections = [
    {
      title: "Dashboard",
      items: [
        {
          title: "Overview",
          href: "/admin/dashboard",
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        // {
        //   title: "Analytics",
        //   href: "/admin/analytics",
        //   icon: <BarChart className="h-5 w-5" />,
        // },
        {
          title: "Reports",
          href: "/admin/reports",
          icon: <LineChart className="h-5 w-5" />,
        },
      ],
    },
    {
      title: "User Management",
      items: [
        {
          title: "Users",
          href: "/admin/users",
          icon: <Users className="h-5 w-5" />,
        },
        // {
        //   title: "Roles",
        //   href: "/admin/roles",
        //   icon: <UserCog className="h-5 w-5" />,
        // },
        // {
        //   title: "Permissions",
        //   href: "/admin/permissions",
        //   icon: <ShieldCheck className="h-5 w-5" />,
        // },
      ],
    },
    {
      title: "Patient Management",
      items: [
        {
          title: "Patients",
          href: "/admin/patients",
          icon: <User className="h-5 w-5" />,
        },
        {
          title: "Tasks",
          href: "/admin/tasks",
          icon: <ClipboardList className="h-5 w-5" />,
        },
        // {
        //   title: "Health Resources",
        //   href: "/admin/content",
        //   icon: <FileCog className="h-5 w-5" />,
        // },
      ],
    },
    {
      title: "Referral Management",
      items: [
        {
          title: "Create Referral",
          href: "/admin/referrals/0",
          icon: <Plus className="h-5 w-5" />,
        },
        {
          title: "Incoming Referrals",
          href: "/admin/referrals/incoming",
          icon: <ArrowDown className="h-5 w-5" />,
        },
        {
          title: "Outgoing Referrals",
          href: "/admin/referrals/outgoing",
          icon: <ArrowUp className="h-5 w-5" />,
        },
      ],
    },
    {
      title: "Clinical Setup",
      items: [
        {
          title: "Departments",
          href: "/admin/setup/departments",
          icon: <Building2 className="h-5 w-5" />,
        },
        {
          title: "Wards",
          href: "/admin/setup/wards",
          icon: <Bed className="h-5 w-5" />,
        },
      ],
    },
    // {
    //   title: "System Management",
    //   items: [
    //     {
    //       title: "Logs",
    //       href: "/admin/logs",
    //       icon: <Database className="h-5 w-5" />,
    //     },
    //     {
    //       title: "Roles & Permissions",
    //       href: "/admin/roles",
    //       icon: <ShieldAlert className="h-5 w-5" />,
    //     },
    //   ],
    // },
    // {
    //   title: "Settings",
    //   items: [
    //     {
    //       title: "General",
    //       href: "/admin/settings",
    //       icon: <Settings className="h-5 w-5" />,
    //     },
    //   ],
    // },
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex flex-col bg-card border-r transition-all duration-300 ease-in-out h-screen",
        isCollapsed ? "w-[70px]" : "w-72",
        className
      )}
      {...props}
    >
      {/* Header/Logo Section */}
      <div className="flex h-20 items-center justify-center border-b px-3">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-primary" />
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-tight">
              Allied Health Admin
            </span>
          )}
        </Link>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        <div className="space-y-2">
          {adminSections.map((section) => (
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
                  "space-y-1.5 mt-1",
                  isCollapsed ? "pl-0" : "pl-2",
                  isCollapsed
                    ? "block"
                    : openSections[section.title as keyof typeof openSections]
                    ? "block"
                    : "hidden"
                )}
              >
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
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

      {/* Footer Section */}
      <div className="mt-auto border-t py-4 px-3 space-y-2">
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
                  router.push("/admin-login");
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
