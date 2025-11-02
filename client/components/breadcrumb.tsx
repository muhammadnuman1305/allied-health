"use client";

import {
  ChevronRight,
  Home,
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  BarChart,
  Heart,
  Activity,
  Droplet,
  Pill,
  Apple,
  Utensils,
  Scale,
  LineChart,
  HeartPulse,
  BookOpen,
  MessageSquare,
  User,
  LifeBuoy,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const isAdminRoute = pathname.startsWith("/admin");

  // Icon mapping for common routes
  const iconMapping = {
    // Admin routes
    admin: <LayoutDashboard className="h-4 w-4" />,
    dashboard: <LayoutDashboard className="h-4 w-4" />,
    analytics: <BarChart className="h-4 w-4" />,
    users: <Users className="h-4 w-4" />,
    content: <FileText className="h-4 w-4" />,
    settings: <Settings className="h-4 w-4" />,

    // User routes
    "health-tracking": <Heart className="h-4 w-4" />,
    "glucose-log": <Droplet className="h-4 w-4" />,
    "vital-signs": <HeartPulse className="h-4 w-4" />,
    "weight-tracking": <Scale className="h-4 w-4" />,
    activity: <Activity className="h-4 w-4" />,
    nutrition: <Apple className="h-4 w-4" />,
    "diet-plan": <Utensils className="h-4 w-4" />,
    "food-database": <Apple className="h-4 w-4" />,
    "meal-planner": <Utensils className="h-4 w-4" />,
    "meal-tracking": <Utensils className="h-4 w-4" />,
    medical: <Pill className="h-4 w-4" />,
    medications: <Pill className="h-4 w-4" />,
    "health-stats": <LineChart className="h-4 w-4" />,
    "lab-results": <FileText className="h-4 w-4" />,
    "doctor-visits": <User className="h-4 w-4" />,
    education: <BookOpen className="h-4 w-4" />,
    community: <MessageSquare className="h-4 w-4" />,
    profile: <User className="h-4 w-4" />,
    support: <LifeBuoy className="h-4 w-4" />,
  };

  // Better title formatting
  const formatTitle = (segment: string) => {
    // Handle special cases
    if (segment.toLowerCase() === "admin") return "Admin";

    // Handle acronyms and special terms (can be expanded)
    const specialTerms = {
      bmi: "BMI",
      faq: "FAQ",
      api: "API",
    };

    return segment
      .split("-")
      .map((word: string) => {
        if (specialTerms[word.toLowerCase() as keyof typeof specialTerms]) {
          return specialTerms[word.toLowerCase() as keyof typeof specialTerms];
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  };

  // Generate breadcrumb items with proper labels and icons
  const breadcrumbItems = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    return {
      href,
      label: formatTitle(segment),
      segment: segment.toLowerCase(),
      isLast: index === segments.length - 1,
    };
  });

  // Determine home link
  const homeLink = isAdminRoute ? "/admin/dashboard" : "/user/dashboard";
  const homeLabel = isAdminRoute ? "Admin" : "Home";

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center py-3 overflow-x-auto scrollbar-hide"
    >
      <ol className="flex items-center space-x-1 text-sm">
        {/* <li>
          <Link
            href={homeLink}
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors rounded-md px-2 py-1 hover:bg-muted"
            aria-label={homeLabel}
          >
            {isAdminRoute ? <LayoutDashboard className="h-4 w-4" /> : <Home className="h-4 w-4" />}
          </Link>
        </li> */}

        {breadcrumbItems.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index !== 0 && (
              <ChevronRight
                className="h-4 w-4 text-muted-foreground mx-1 flex-shrink-0"
                aria-hidden="true"
              />
            )}
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors",
                item.isLast
                  ? "text-foreground font-medium pointer-events-none"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              aria-current={item.isLast ? "page" : undefined}
            >
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
