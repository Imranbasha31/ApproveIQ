import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function calculateDays(from: string, to: string): number {
  const start = new Date(from);
  const end = new Date(to);
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

export const LEAVE_TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  medical: { label: 'Medical', icon: '🏥', color: 'text-red-600' },
  personal: { label: 'Personal', icon: '👤', color: 'text-blue-600' },
  academic: { label: 'Academic', icon: '📚', color: 'text-purple-600' },
  emergency: { label: 'Emergency', icon: '🚨', color: 'text-orange-600' },
  other: { label: 'Other', icon: '📋', color: 'text-gray-600' },
};
