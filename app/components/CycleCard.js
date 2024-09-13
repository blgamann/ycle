import React, { useState, useEffect } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "../lib/supabase";
import Jazzicon from "react-jazzicon";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  MoreVertical,
  Edit,
  Trash,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  MapPin as MapPinIcon,
} from "lucide-react";

// Add this function outside of the component
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Add these new functions
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function truncateUrl(url, maxLength = 30) {
  if (url.length <= maxLength) return url;
  return url.substr(0, maxLength - 3) + "...";
}

function linkifyText(text) {
  const lines = text.split("\n");
  return lines.map((line, lineIndex) => {
    const words = line.split(/(\s+)/);
    return (
      <React.Fragment key={lineIndex}>
        {words.map((word, wordIndex) => {
          if (isValidUrl(word)) {
            return (
              <a
                key={wordIndex}
                href={word}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {truncateUrl(word)}
              </a>
            );
          }
          return word;
        })}
        {lineIndex < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

// Add this new function to format the time
function formatTime(timeString) {
  if (!timeString) return "";
  return timeString.slice(0, 5); // This will return the first 5 characters, i.e., HH:mm
}

export function CycleCard({ cycle, currentUser, onDelete }) {
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [comments, setComments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedReflection, setEditedReflection] = useState(cycle.reflection);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentContent, setEditedCommentContent] = useState("");

  useEffect(() => {
    fetchComments();
  }, [cycle.id]);

  function getInitials(name) {
    return name ? name.charAt(0).toUpperCase() : "?";
  }

  const user = cycle.users || {};
  const username = user.username || "알 수 없는 사용자";

  // Generate a seed from the username
  const seed = hashCode(username);

  async function fetchComments() {
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        *,
        users:user_id (username)
      `
      )
      .eq("cycle_id", cycle.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
    } else {
      setComments(data);
    }
  }

  async function handleCommentSubmit(e) {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsCommenting(true);

    const { data, error } = await supabase.from("comments").insert({
      user_id: currentUser.id,
      cycle_id: cycle.id,
      content: newComment.trim(),
    });

    setIsCommenting(false);
    if (error) {
      console.error("Error submitting comment:", error);
      alert("댓글 작성 중 오류가 발생했습니다.");
    } else {
      setNewComment("");
      fetchComments(); // Refresh comments after submitting
    }
  }

  async function handleEditSubmit() {
    const { data, error } = await supabase
      .from("cycles")
      .update({ reflection: editedReflection })
      .eq("id", cycle.id);

    if (error) {
      console.error("Error updating reflection:", error);
      alert("수정 중 오류가 발생했습니다.");
    } else {
      setIsEditing(false);
      // Update the local state to reflect the change
      cycle.reflection = editedReflection;
    }
  }

  async function handleDelete() {
    if (window.confirm("정말로 이 사이클을 삭제하시겠습니까?")) {
      const { error } = await supabase
        .from("cycles")
        .delete()
        .eq("id", cycle.id);

      if (error) {
        console.error("Error deleting cycle:", error);
        alert("삭제 중 오류가 발생했습니다.");
      } else {
        onDelete(cycle.id); // Call the onDelete function passed as prop
      }
    }
  }

  async function handleCommentEdit(commentId, newContent) {
    const { data, error } = await supabase
      .from("comments")
      .update({ content: newContent })
      .eq("id", commentId);

    if (error) {
      console.error("Error updating comment:", error);
      alert("댓글 수정 중 오류가 발생했습니다.");
    } else {
      setEditingCommentId(null);
      fetchComments(); // Refresh comments after editing
    }
  }

  async function handleCommentDelete(commentId) {
    if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) {
        console.error("Error deleting comment:", error);
        alert("댓글 삭제 중 오류가 발생했습니다.");
      } else {
        fetchComments(); // Refresh comments after deleting
      }
    }
  }

  function formatDate(date) {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ko });
  }

  return (
    <Card className="mb-6 hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12">
              <Jazzicon diameter={48} seed={seed} />
            </div>
            <div>
              <CardTitle className="text-xl">{username}</CardTitle>
              <p className="text-sm text-gray-500">
                {formatDate(cycle.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {cycle.medium && (
              <span className="text-base font-semibold bg-blue-100 text-blue-800 px-4 py-2 rounded-full border border-blue-300 shadow-sm">
                {cycle.medium}
              </span>
            )}
            {currentUser.id === cycle.user_id && (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content
                  className="w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  align="end"
                >
                  <DropdownMenu.Item
                    onSelect={() => setIsEditing(true)}
                    className="flex items-center p-2 cursor-pointer hover:bg-gray-100"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    <span>수정</span>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onSelect={handleDelete}
                    className="flex items-center p-2 cursor-pointer hover:bg-gray-100 text-red-600"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    <span>삭제</span>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {cycle.type === "event" ? (
          <div className="bg-gray-100 rounded-lg p-4 mt-4">
            <h4 className="text-xl font-bold mb-2">
              {cycle.event_description}
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center mt-4">
                <CalendarIcon className="w-5 h-5 mr-2" />
                <span>
                  {format(new Date(cycle.event_date), "PPP", { locale: ko })}
                </span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 mr-2" />
                <span>
                  {formatTime(cycle.event_start_time)} -{" "}
                  {formatTime(cycle.event_end_time)}
                </span>
              </div>
              {cycle.event_location && (
                <div className="flex items-center">
                  <MapPinIcon className="w-5 h-5 mr-2" />
                  <span>{cycle.event_location}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {isEditing ? (
              <div className="mb-4">
                <Textarea
                  value={editedReflection}
                  onChange={(e) => setEditedReflection(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={4}
                />
                <div className="mt-2 space-x-2">
                  <Button onClick={handleEditSubmit}>저장</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-lg text-gray-700 whitespace-pre-wrap">
                  {linkifyText(cycle.reflection)}
                </p>
              </div>
            )}
          </>
        )}
        <div className="mt-6 space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-base">
                      {comment.users.username}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  {editingCommentId === comment.id ? (
                    <div className="mt-2">
                      <Textarea
                        value={editedCommentContent}
                        onChange={(e) =>
                          setEditedCommentContent(e.target.value)
                        }
                        className="w-full p-2 border rounded"
                        rows={2}
                      />
                      <div className="mt-2 space-x-2">
                        <Button
                          onClick={() =>
                            handleCommentEdit(comment.id, editedCommentContent)
                          }
                        >
                          저장
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditingCommentId(null)}
                        >
                          취소
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-base text-gray-700 mt-1">
                      {linkifyText(comment.content)}
                    </p>
                  )}
                </div>
                {currentUser.id === comment.user_id && (
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-gray-200 rounded-full"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content
                      className="w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                      align="end"
                    >
                      <DropdownMenu.Item
                        onSelect={() => {
                          setEditingCommentId(comment.id);
                          setEditedCommentContent(comment.content);
                        }}
                        className="flex items-center p-2 cursor-pointer hover:bg-gray-100"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        <span>수정</span>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onSelect={() => handleCommentDelete(comment.id)}
                        className="flex items-center p-2 cursor-pointer hover:bg-gray-100 text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        <span>삭제</span>
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleCommentSubmit} className="w-full flex space-x-2">
          <Input
            type="text"
            placeholder="댓글을 입력하세요..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-grow text-base"
          />
          <Button
            type="submit"
            disabled={isCommenting || !newComment.trim()}
            className="text-base"
          >
            {isCommenting ? "작성 중..." : "댓글"}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
