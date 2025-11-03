import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Common formatter for optional lastUpdated timestamps
export function formatLastUpdated(lastUpdated?: string | null): string {
  if (!lastUpdated) return "Never";
  try {
    const d = new Date(lastUpdated);
    if (isNaN(d.getTime())) return "Never";
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "Never";
  }
}

// Standard date formatter for tables (MMM dd, yyyy format, e.g., "Jan 15, 2024")
export function formatTableDate(date: string | undefined | null): string {
  if (!date) return "N/A";
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return "N/A";
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
}

// Relative time formatter for "Last Updated" fields (e.g., "2d ago", "5h ago")
export function formatRelativeTime(dateString: string | undefined | null): string {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    // For older dates, use standard date format
    return formatTableDate(dateString);
  } catch {
    return "N/A";
  }
}
