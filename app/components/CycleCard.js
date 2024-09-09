import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
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
import { supabase } from "../lib/supabase";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Jazzicon from "react-jazzicon";
import { UserAvatar } from './UserAvatar';

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

export function CycleCard({ cycle, currentUser }) {
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [comments, setComments] = useState([]);

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

  function formatDate(date) {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ko });
  }

  return (
    <Card className="mb-6 hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <UserAvatar username={username} size={48} />
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
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-lg text-gray-700 mb-4">{cycle.reflection}</p>
        <div className="mt-6 space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-semibold text-base">
                  {comment.users.username}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              <p className="text-base text-gray-700">{comment.content}</p>
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
