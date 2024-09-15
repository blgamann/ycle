import React from "react";

export function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export function truncateUrl(url, maxLength = 30) {
  if (url.length <= maxLength) return url;
  return url.substr(0, maxLength - 3) + "...";
}

export function linkifyText(text) {
  const lines = text.split("\n");
  return lines.map((line, lineIndex) => {
    const words = line.split(/(\s+)/);
    return (
      <React.Fragment key={lineIndex}>
        {words.map((word, wordIndex) =>
          isValidUrl(word) ? (
            <a
              key={wordIndex}
              href={word}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {truncateUrl(word)}
            </a>
          ) : (
            word
          )
        )}
        {lineIndex < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}
