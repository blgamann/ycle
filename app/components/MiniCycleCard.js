import React from "react";
import Link from "next/link";
import { UserAvatar } from "./UserAvatar";
import { getRelativeTime } from "../lib/utils";

export function MiniCycleCard({ cycle, clickable = true }) {
  const username = cycle.users?.username || "알 수 없는 사용자";

  const content = (
    <div className={clickable ? "cursor-pointer" : ""}>
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <UserAvatar username={username} size={32} />
          <div>
            <p className="font-semibold">{username}</p>
            <p className="text-sm text-gray-500">
              {getRelativeTime(cycle.created_at)}
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-700 line-clamp-3 whitespace-pre-wrap break-words">
          {cycle.reflection}
        </p>
      </div>
    </div>
  );

  if (clickable) {
    return <Link href={`/${cycle.user_id}/${cycle.id}`}>{content}</Link>;
  }

  return content;
}
