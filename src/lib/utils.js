import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function calculateDays(from, to) {
  const start = new Date(from);
  const end = new Date(to);
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24)) + 1);
}
const LEAVE_TYPE_CONFIG = {
  medical: { label: "Medical", icon: "\u{1F3E5}", color: "text-red-600" },
  personal: { label: "Personal", icon: "\u{1F464}", color: "text-blue-600" },
  academic: { label: "Academic", icon: "\u{1F4DA}", color: "text-purple-600" },
  emergency: { label: "Emergency", icon: "\u{1F6A8}", color: "text-orange-600" },
  other: { label: "Other", icon: "\u{1F4CB}", color: "text-gray-600" }
};
export {
  LEAVE_TYPE_CONFIG,
  calculateDays,
  cn,
  formatDate
};
