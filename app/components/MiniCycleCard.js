import React from "react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import Jazzicon from "react-jazzicon";
import Link from "next/link";

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export function MiniCycleCard({ cycle, clickable = true }) {
  const username = cycle.users?.username || "알 수 없는 사용자";
  const seed = hashCode(username);

  function formatDate(date) {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ko });
  }

  const content = (
    <div className={clickable ? "cursor-pointer" : ""}>
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-8 h-8">
            <Jazzicon diameter={32} seed={seed} />
          </div>
          <div>
            <p className="font-semibold">{username}</p>
            <p className="text-sm text-gray-500">
              {formatDate(cycle.created_at)}
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-700 line-clamp-3">{cycle.reflection}</p>
      </div>
    </div>
  );

  if (clickable) {
    return <Link href={`/${cycle.user_id}/${cycle.id}`}>{content}</Link>;
  }

  return content;
}
