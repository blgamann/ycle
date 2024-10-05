import React from "react";
import Link from "next/link";
import Image from "next/image";
import { UserAvatar } from "./UserAvatar";
import { getRelativeTime } from "../utils/date";
import { EventContent } from "./EventContent";

export function MiniCycleCard({ cycle, clickable = true }) {
  if (!cycle) {
    return (
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <p className="text-sm text-gray-500">삭제된 사이클입니다.</p>
      </div>
    );
  }

  const username = cycle.user?.username || "알 수 없는 사용자";

  const content = (
    <div className={clickable ? "cursor-pointer" : ""}>
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <UserAvatar username={username} size={32} />
          <div>
            <p className="font-semibold">{username}</p>
            <p className="text-sm text-gray-500">
              {getRelativeTime(cycle.createdAt)}
            </p>
          </div>
        </div>
        {cycle.eventDescription && <EventContent cycle={cycle} />}
        <p className="text-sm text-gray-700 line-clamp-3 whitespace-pre-wrap break-words mb-2">
          {cycle.reflection}
        </p>
        {cycle.imageUrl && (
          <div className="mt-2">
            <Image
              src={cycle.imageUrl}
              alt="Cycle image"
              width={100}
              height={100}
              layout="responsive"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );

  if (clickable) {
    return <Link href={`/cycles/${cycle.id}`}>{content}</Link>;
  }

  return content;
}
