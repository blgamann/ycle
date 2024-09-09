import React from "react";
import Jazzicon from "react-jazzicon";

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export function UserAvatar({ username, size = 48 }) {
  const seed = hashCode(username || "");

  return (
    <div style={{ width: size, height: size }}>
      <Jazzicon diameter={size} seed={seed} />
    </div>
  );
}
