import { format, formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

export function formatFullDate(date) {
  return format(new Date(date), "PPP", { locale: ko });
}

export function formatTimeOfDay(date) {
  return format(new Date(date), "p", { locale: ko });
}

export function getRelativeTime(date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ko });
}
