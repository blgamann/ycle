import React, { useState, useRef, useEffect, useCallback } from "react";
import { getRelativeTime } from "../utils/date";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "../lib/supabase";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  MoreVertical,
  Edit,
  Trash,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  MapPin as MapPinIcon,
  Repeat,
  Heart,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MiniCycleCard } from "./MiniCycleCard";
import { UserAvatar } from "./UserAvatar";
import { linkifyText } from "../utils/url";

import { useComments } from "../hooks/useComments";
import { useOriginalCycle } from "../hooks/useOriginalCycle";
import { useLikes } from "../hooks/useLikes";
// Main CycleCard Component
export function CycleCard({ cycle, currentUser, onDelete, onRecycle }) {
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedReflection, setEditedReflection] = useState(cycle.reflection);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentContent, setEditedCommentContent] = useState("");
  const [isRecycleDialogOpen, setIsRecycleDialogOpen] = useState(false);
  const [recycleContent, setRecycleContent] = useState("");

  const textareaRef = useRef(null);
  const editTextareaRef = useRef(null);

  const { comments, fetchComments } = useComments(cycle.id);
  const originalCycle = useOriginalCycle(cycle.recycled_from);
  const { likeCount, isLiked, toggleLike } = useLikes(cycle.id, currentUser.id);

  const user = cycle.users || {};
  const username = user.username || "알 수 없는 사용자";

  // Adjust textarea height dynamically
  const adjustTextareaHeight = useCallback((ref) => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight(textareaRef);
  }, [newComment, adjustTextareaHeight]);
  useEffect(() => {
    if (editTextareaRef.current) {
      adjustTextareaHeight(editTextareaRef);
    }
  }, [editedCommentContent, adjustTextareaHeight]);

  // Handlers
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const trimmed = newComment.trim();
    if (!trimmed) return;

    setIsCommenting(true);

    const { error } = await supabase.from("comments").insert({
      user_id: currentUser.id,
      cycle_id: cycle.id,
      content: trimmed,
    });

    setIsCommenting(false);
    if (error) {
      console.error("Error submitting comment:", error);
      alert("댓글 작성 중 오류가 발생했습니다.");
    } else {
      setNewComment("");
      fetchComments();
    }
  };

  const handleEditSubmit = async () => {
    const trimmed = editedReflection.trim();
    if (!trimmed) return;

    const { error } = await supabase
      .from("cycles")
      .update({ reflection: trimmed })
      .eq("id", cycle.id);

    if (error) {
      console.error("Error updating reflection:", error);
      alert("수정 중 오류가 발생했습니다.");
    } else {
      setIsEditing(false);
      cycle.reflection = trimmed;
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말로 이 사이클을 삭제하시겠습니까?")) return;

    const { error } = await supabase.from("cycles").delete().eq("id", cycle.id);

    if (error) {
      console.error("Error deleting cycle:", error);
      alert("삭제 중 오류가 발생했습니다.");
    } else {
      onDelete(cycle.id);
    }
  };
  const handleCommentEdit = async (commentId, newContent) => {
    const trimmed = newContent.trim();
    if (!trimmed) return;

    const { error } = await supabase
      .from("comments")
      .update({ content: trimmed })
      .eq("id", commentId);

    if (error) {
      console.error("Error updating comment:", error);
      alert("댓글 수정 중 오류가 발생했습니다.");
    } else {
      setEditingCommentId(null);
      fetchComments();
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) return;

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.error("Error deleting comment:", error);
      alert("댓글 삭제 중 오류가 발생했습니다.");
    } else {
      fetchComments();
    }
  };

  const handleRecycle = async (e) => {
    e.preventDefault();
    const trimmed = recycleContent.trim();
    if (!trimmed) return;

    const { error } = await supabase.from("cycles").insert({
      user_id: currentUser.id,
      reflection: trimmed,
      recycled_from: cycle.id,
      type: "cycle",
    });

    if (error) {
      console.error("Error recycling cycle:", error);
      alert("리사이클 중 오류가 발생했습니다.");
    } else {
      setIsRecycleDialogOpen(false);
      setRecycleContent("");
      onRecycle?.();
    }
  };
  return (
    <Card className="mb-6 hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <Header
          username={username}
          createdAt={cycle.created_at}
          medium={cycle.medium}
          isOwner={currentUser.id === cycle.user_id}
          onEdit={() => setIsEditing(true)}
          onDelete={handleDelete}
        />
      </CardHeader>
      <CardContent>
        {cycle.type === "event" ? (
          <EventContent cycle={cycle} />
        ) : (
          <>
            {originalCycle && (
              <div className="mt-4 mb-4">
                <MiniCycleCard cycle={originalCycle} />
              </div>
            )}
            {isEditing ? (
              <ReflectionEdit
                editedReflection={editedReflection}
                setEditedReflection={setEditedReflection}
                handleEditSubmit={handleEditSubmit}
                setIsEditing={setIsEditing}
              />
            ) : (
              <ReflectionDisplay reflection={cycle.reflection} />
            )}
            <ActionButtons
              likeCount={likeCount}
              isLiked={isLiked}
              onToggleLike={toggleLike}
              onOpenRecycleDialog={() => setIsRecycleDialogOpen(true)}
            />
          </>
        )}
        <CommentsSection
          comments={comments}
          currentUser={currentUser}
          editingCommentId={editingCommentId}
          setEditingCommentId={setEditingCommentId}
          editedCommentContent={editedCommentContent}
          setEditedCommentContent={setEditedCommentContent}
          handleCommentEdit={handleCommentEdit}
          handleCommentDelete={handleCommentDelete}
          adjustTextareaHeight={adjustTextareaHeight}
        />
      </CardContent>
      <CardFooter>
        <CommentForm
          newComment={newComment}
          setNewComment={setNewComment}
          isCommenting={isCommenting}
          handleCommentSubmit={handleCommentSubmit}
          textareaRef={textareaRef}
          adjustTextareaHeight={adjustTextareaHeight}
        />
      </CardFooter>
      {cycle.type !== "event" && (
        <RecycleDialog
          isOpen={isRecycleDialogOpen}
          onClose={setIsRecycleDialogOpen}
          recycleContent={recycleContent}
          setRecycleContent={setRecycleContent}
          handleRecycle={handleRecycle}
          cycle={cycle}
        />
      )}
    </Card>
  );
}
// Header Component
const Header = ({ username, createdAt, medium, isOwner, onEdit, onDelete }) => (
  <div className="flex justify-between items-center">
    <div className="flex items-center space-x-3">
      <UserAvatar username={username} size={48} />
      <div>
        <CardTitle className="text-xl">{username}</CardTitle>
        <p className="text-sm text-gray-500">{getRelativeTime(createdAt)}</p>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      {medium && (
        <span className="text-base font-semibold bg-blue-100 text-blue-800 px-4 py-2 rounded-full border border-blue-300 shadow-sm">
          {medium}
        </span>
      )}
      {isOwner && (
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
              onSelect={onEdit}
              className="flex items-center p-2 cursor-pointer hover:bg-gray-100"
            >
              <Edit className="mr-2 h-4 w-4" />
              <span>수정</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onSelect={onDelete}
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
);

// EventContent Component
const EventContent = ({ cycle }) => (
  <div className="bg-gray-100 rounded-lg p-4 mt-4">
    <h4 className="text-xl font-bold mb-2">{cycle.event_description}</h4>
    <div className="space-y-2 text-sm text-gray-600">
      <div className="flex items-center mt-4">
        <CalendarIcon className="w-5 h-5 mr-2" />
        <span>{getRelativeTime(cycle.event_date)}</span>
      </div>
      <div className="flex items-center">
        <ClockIcon className="w-5 h-5 mr-2" />
        <span>
          {cycle.event_start_time} - {cycle.event_end_time}
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
);

// ReflectionEdit Component
const ReflectionEdit = ({
  editedReflection,
  setEditedReflection,
  handleEditSubmit,
  setIsEditing,
}) => (
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
);
// ReflectionDisplay Component
const ReflectionDisplay = ({ reflection }) => (
  <div className="mb-4">
    <p className="text-lg text-gray-700 whitespace-pre-wrap">
      {linkifyText(reflection)}
    </p>
  </div>
);

// New ActionButtons Component
const ActionButtons = ({
  likeCount,
  isLiked,
  onToggleLike,
  onOpenRecycleDialog,
}) => (
  <div className="mt-4 flex space-x-2">
    <Button
      variant="outline"
      size="sm"
      onClick={onToggleLike}
      className={`flex items-center space-x-2 flex-1 justify-center ${
        isLiked
          ? "text-red-500 border-red-500"
          : "text-gray-500 border-gray-300"
      } hover:bg-gray-100 transition-colors duration-200`}
    >
      <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
      <span>{likeCount} 좋아요</span>
    </Button>
    <Button
      variant="outline"
      size="sm"
      onClick={onOpenRecycleDialog}
      className="flex items-center space-x-2 flex-1 justify-center text-green-600 border-green-300 hover:bg-green-50 hover:text-green-700 hover:border-green-400 transition-colors"
    >
      <Repeat className="h-5 w-5" />
      <span>리사이클</span>
    </Button>
  </div>
);

// CommentsSection Component
const CommentsSection = ({
  comments,
  currentUser,
  editingCommentId,
  setEditingCommentId,
  editedCommentContent,
  setEditedCommentContent,
  handleCommentEdit,
  handleCommentDelete,
  adjustTextareaHeight,
}) => (
  <div className="mt-6 space-y-4">
    {comments.map((comment) => (
      <Comment
        key={comment.id}
        comment={comment}
        currentUser={currentUser}
        isEditing={editingCommentId === comment.id}
        editedCommentContent={editedCommentContent}
        setEditedCommentContent={setEditedCommentContent}
        onEdit={() => {
          setEditingCommentId(comment.id);
          setEditedCommentContent(comment.content);
        }}
        onDelete={() => handleCommentDelete(comment.id)}
        handleCommentEdit={handleCommentEdit}
        adjustTextareaHeight={adjustTextareaHeight}
      />
    ))}
  </div>
);
// Comment Component
const Comment = ({
  comment,
  currentUser,
  isEditing,
  editedCommentContent,
  setEditedCommentContent,
  onEdit,
  onDelete,
  handleCommentEdit,
  adjustTextareaHeight,
}) => (
  <div className="bg-gray-50 p-3 rounded-lg">
    <div className="flex justify-between items-start mb-2">
      <div className="flex flex-col w-full">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-base">
            {comment.users.username}
          </span>
          <span className="text-sm text-gray-500">
            {getRelativeTime(comment.created_at)}
          </span>
        </div>
        {isEditing ? (
          <EditComment
            editedCommentContent={editedCommentContent}
            setEditedCommentContent={setEditedCommentContent}
            handleCommentEdit={handleCommentEdit}
            commentId={comment.id}
            adjustTextareaHeight={adjustTextareaHeight}
            onCancel={() => setEditingCommentId(null)}
          />
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
              onSelect={onEdit}
              className="flex items-center p-2 cursor-pointer hover:bg-gray-100"
            >
              <Edit className="mr-2 h-4 w-4" />
              <span>수정</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onSelect={onDelete}
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
);

// EditComment Component
const EditComment = ({
  editedCommentContent,
  setEditedCommentContent,
  handleCommentEdit,
  commentId,
  adjustTextareaHeight,
  onCancel,
}) => {
  const editTextareaRef = useRef(null);

  useEffect(() => {
    adjustTextareaHeight(editTextareaRef);
  }, [editedCommentContent, adjustTextareaHeight]);

  return (
    <div className="mt-2 w-full">
      <Textarea
        ref={editTextareaRef}
        value={editedCommentContent}
        onChange={(e) => {
          setEditedCommentContent(e.target.value);
          adjustTextareaHeight(editTextareaRef);
        }}
        className="w-full text-base p-2 border rounded resize-none overflow-hidden min-h-[40px]"
        rows={1}
      />
      <div className="mt-2 space-x-2">
        <Button
          onClick={() => handleCommentEdit(commentId, editedCommentContent)}
        >
          저장
        </Button>
        <Button variant="outline" onClick={onCancel}>
          취소
        </Button>
      </div>
    </div>
  );
};

// CommentForm Component
const CommentForm = ({
  newComment,
  setNewComment,
  isCommenting,
  handleCommentSubmit,
  textareaRef,
  adjustTextareaHeight,
}) => {
  useEffect(() => {
    adjustTextareaHeight(textareaRef);
  }, [newComment, adjustTextareaHeight, textareaRef]);

  return (
    <form onSubmit={handleCommentSubmit} className="w-full flex space-x-2">
      <Textarea
        ref={textareaRef}
        placeholder="댓글을 입력하세요..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        className="flex-grow text-base p-2 border rounded resize-none overflow-hidden min-h-[40px]"
        rows={1}
      />
      <Button
        type="submit"
        disabled={isCommenting || !newComment.trim()}
        className="text-base"
      >
        {isCommenting ? "작성 중..." : "댓글"}
      </Button>
    </form>
  );
};
// RecycleDialog Component
const RecycleDialog = ({
  isOpen,
  onClose,
  recycleContent,
  setRecycleContent,
  handleRecycle,
  cycle,
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-[525px]">
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold">리사이클</DialogTitle>
        <DialogDescription className="text-base">
          이 사이클에서 어떤 배움이 발견되었나요?
        </DialogDescription>
      </DialogHeader>
      <div className="mt-2">
        <MiniCycleCard cycle={cycle} clickable={false} />
      </div>
      <form onSubmit={handleRecycle} className="mt-2">
        <Textarea
          className="mt-4 text-base"
          placeholder="해당 사이클에서 발견한 배움을 작성해주세요..."
          value={recycleContent}
          onChange={(e) => setRecycleContent(e.target.value)}
          rows={4}
        />
        <div className="mt-6 flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onClose(false)}
            className="text-base"
          >
            취소
          </Button>
          <Button type="submit" className="text-base">
            리사이클
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
);
