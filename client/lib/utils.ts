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
