import { format, formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

export function formatDate(date) {
  return format(new Date(date), "PPP", { locale: ko });
}

export function formatTime(date) {
  return format(new Date(date), "p", { locale: ko });
}

export function getRelativeTimeString(date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ko });
}
