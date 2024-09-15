import React from "react";
import Jazzicon from "react-jazzicon";

const hashCode = (str) =>
  Array.from(str).reduce((hash, char) => {
    hash = (hash << 5) - hash + char.charCodeAt(0);
    return hash & hash;
  }, 0);

export function UserAvatar({ username = "", size = 48 }) {
  const seed = Math.abs(hashCode(username));

  return (
    <div style={{ width: size, height: size }}>
      <Jazzicon diameter={size} seed={seed} />
    </div>
  );
}
