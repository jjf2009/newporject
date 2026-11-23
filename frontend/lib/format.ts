export function formatDate(dateStr?: string | Date): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDateOnly(dateStr?: string | Date): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getStatusBadgeClass(status?: string): string {
  switch (status?.toLowerCase()) {
    case "confirmed":
    case "completed":
    case "present":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20";
    case "upcoming":
      return "bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20";
    case "ongoing":
      return "bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20";
    case "waitlisted":
    case "pending":
      return "bg-purple-50 text-purple-700 border-purple-200 ring-purple-600/20";
    case "cancelled":
    case "absent":
      return "bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200 ring-gray-600/20";
  }
}

export function getCategoryBadgeClass(category?: string): string {
  switch (category?.toLowerCase()) {
    case "technical":
      return "bg-sky-100 text-sky-800";
    case "workshop":
      return "bg-indigo-100 text-indigo-800";
    case "cultural":
      return "bg-pink-100 text-pink-800";
    case "sports":
      return "bg-emerald-100 text-emerald-800";
    case "seminar":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
}
