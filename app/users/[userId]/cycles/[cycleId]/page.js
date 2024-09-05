"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 링크를 감지하고 변환하는 함수
const convertLinksToAnchors = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

export default function CycleDetail({ params }) {
  const [cycleData, setCycleData] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [reflection, setReflection] = useState("");
  const router = useRouter();
  const { userId, cycleId } = params;

  useEffect(() => {
    fetchCycleData();
    fetchComments();
  }, [userId, cycleId]);

  const fetchCycleData = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/cycles/${cycleId}`);
      if (response.ok) {
        const data = await response.json();
        setCycleData(data);
        setReflection(data.reflection || "");
      } else {
        console.error("Failed to fetch cycle data");
      }
    } catch (error) {
      console.error("Error fetching cycle data:", error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `/api/users/${userId}/cycles/${cycleId}/comments`
      );
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      } else {
        console.error("Failed to fetch comments");
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch(
        `/api/users/${userId}/cycles/${cycleId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, content: newComment }),
        }
      );

      if (response.ok) {
        const addedComment = await response.json();
        setComments([addedComment, ...comments]);
        setNewComment("");
      } else {
        console.error("Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleSaveReflection = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/cycles/${cycleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reflection }),
      });

      if (response.ok) {
        const updatedCycle = await response.json();
        setCycleData(updatedCycle);
        setIsEditing(false);
      } else {
        throw new Error("Failed to save reflection");
      }
    } catch (error) {
      console.error("Error saving reflection:", error);
      alert("Failed to save reflection. Please try again.");
    }
  };

  if (!cycleData) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 bg-gray-100">
      <div className="mb-4">
        <button
          onClick={() => router.push(`/users/${userId}`)}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          ← 목록으로 돌아가기
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">{cycleData.activity}</h1>
        <div className="space-y-2 mb-4">
          <p>
            <span className="font-semibold">날짜:</span> {cycleData.date}
          </p>
          <p>
            <span className="font-semibold">참여자:</span>{" "}
            {cycleData.participants}
          </p>
          <p>
            <span className="font-semibold">활동:</span> {cycleData.activity}
          </p>
        </div>

        <div className="border-t border-b py-4 my-4">
          <h2 className="text-xl font-bold mb-2">회고</h2>
          {isEditing ? (
            <div>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                className="w-full p-2 border rounded mb-2"
                rows="4"
                placeholder="회고를 작성하세요..."
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveReflection}
                  className="mr-2 px-4 py-2 bg-blue-500 text-white rounded"
                >
                  저장
                </button>
                <button
                  onClick={() => {
                    setReflection(cycleData.reflection || "");
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-2">
                {cycleData.reflection
                  ? convertLinksToAnchors(cycleData.reflection)
                  : "아직 작성된 회고가 없습니다."}
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-500 hover:underline"
              >
                {cycleData.reflection ? "회고 수정" : "회고 작성"}
              </button>
            </div>
          )}
        </div>

        <div className="mt-4">
          <h2 className="text-xl font-bold mb-4">댓글</h2>
          <form onSubmit={handleAddComment} className="flex items-center mb-4">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-grow p-2 border rounded-l"
              placeholder="댓글을 입력하세요..."
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
            >
              추가
            </button>
          </form>
          <ul className="space-y-4">
            {comments.map((comment) => (
              <li key={comment.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="flex-grow">
                  <p>
                    <span className="font-semibold">{comment.username}</span>{" "}
                    {comment.content}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
