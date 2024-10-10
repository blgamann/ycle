import React, { useState, useRef, useEffect, useCallback } from "react";
import { formatFullDate, getRelativeTime } from "../utils/date";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { deleteImage, supabase, uploadImage } from "../lib/supabase";
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
  CircleFadingArrowUp,
  Share2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MiniCycleCard } from "./MiniCycleCard";
import { UserAvatar } from "./UserAvatar";
import { linkifyText } from "../utils/url";
import Image from "next/image";

import { useComments } from "../hooks/useComments";
import { useOriginalCycle } from "../hooks/useOriginalCycle";
import { useLikes } from "../hooks/useLikes";
import Link from "next/link";
import { EventContent } from "./EventContent";
import { useAuth } from "../contexts/AuthContext";
import { FiX } from "react-icons/fi";

// Main CycleCard Component
export function CycleCard({ cycle, currentUser, onDelete, onRecycle }) {
  if (!cycle) return null;

  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedReflection, setEditedReflection] = useState(cycle.reflection);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentContent, setEditedCommentContent] = useState("");
  const [isRecycleDialogOpen, setIsRecycleDialogOpen] = useState(false);
  const [recycleContent, setRecycleContent] = useState("");
  const [recycleMedium, setRecycleMedium] = useState("");
  const [isUpcycleDialogOpen, setIsUpcycleDialogOpen] = useState(false);
  const [upcycleContent, setUpcycleContent] = useState("");
  const [upcycleMedium, setUpcycleMedium] = useState("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");

  const textareaRef = useRef(null);
  const editTextareaRef = useRef(null);

  const { comments, fetchComments } = useComments(cycle.id);
  const originalCycle = useOriginalCycle(
    cycle.recycledFromId || cycle.upcycledFromId
  );
  const { likeCount, isLiked, toggleLike } = useLikes(cycle.id, currentUser.id);

  const { user: loginUser } = useAuth();

  const user = cycle.user || {};
  const username = user.username || "알 수 없는 사용자";

  const isOwner = currentUser.id === cycle.userId;
  const isAlreadyUpcycled = cycle;
  console.log("cycle", isAlreadyUpcycled);

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

    const { error } = await supabase.from("Comment").insert({
      userId: currentUser.id,
      cycleId: cycle.id,
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
      .from("Cycle")
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

    const { error } = await supabase.from("Cycle").delete().eq("id", cycle.id);

    if (error) {
      console.error("Error deleting cycle:", error);
      alert("삭제 중 오류가 발생했습니다.");
    } else {
      if (cycle.imageUrl) {
        await deleteImage(cycle.imageUrl);
      }

      onDelete(cycle.id);
    }
  };

  const handleCommentEdit = async (commentId, newContent) => {
    const trimmed = newContent.trim();
    if (!trimmed) return;

    const { error } = await supabase
      .from("Comment")
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
      .from("Comment")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.error("Error deleting comment:", error);
      alert("댓글 삭제 중 오류가 발생했습니다.");
    } else {
      fetchComments();
    }
  };

  const handleRecycle = async (e, selectedImage) => {
    e.preventDefault();
    if (!recycleContent.trim()) return;

    let imageUrl = null;
    try {
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("이미지 업로드 중 오류가 발생했습니다.");
      return;
    }

    const { error } = await supabase.from("Cycle").insert({
      reflection: recycleContent,
      medium: recycleMedium,
      imageUrl: imageUrl,
      userId: currentUser.id,
      recycledFromId: cycle.id,
      recycledByUserId: currentUser.id,
    });

    if (error) {
      console.error("Error recycling cycle:", error);
      alert("리사이클 중 오류가 발생했습니다.");
    } else {
      setIsRecycleDialogOpen(false);
      setRecycleContent("");
      setRecycleMedium("");
      onRecycle?.();
    }
  };

  const handleUpcycle = async (e, selectedImage) => {
    e.preventDefault();
    if (!upcycleContent.trim()) return;

    let imageUrl = null;
    try {
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("이미지 업로드 중 오류가 발생했습니다.");
      return;
    }

    const { error } = await supabase.from("Cycle").insert({
      reflection: upcycleContent,
      medium: upcycleMedium,
      imageUrl: imageUrl,
      userId: currentUser.id,
      upcycledFromId: cycle.id,
      upcycledByUserId: currentUser.id,
    });

    if (error) {
      console.error("Error upcycling cycle:", error);
      alert("업사이클 중 오류가 발생했습니다.");
    } else {
      setIsUpcycleDialogOpen(false);
      setUpcycleContent("");
      setUpcycleMedium("");
      onRecycle?.();
    }
  };

  const handleImageClick = (url) => {
    setSelectedImageUrl(url);
    setIsImageModalOpen(true);
  };

  return (
    <Card className="mb-6 hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CycleHeader
          username={username}
          cycleId={cycle.id}
          createdAt={cycle.createdAt}
          medium={cycle.medium}
          isOwner={currentUser.id === cycle.userId}
          onEdit={() => setIsEditing(true)}
          onDelete={handleDelete}
        />
      </CardHeader>
      <CardContent>
        {cycle.eventDescription && <EventContent cycle={cycle} />}
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
        {cycle.imageUrl && (
          <div className="mt-4 mb-4">
            <Image
              src={cycle.imageUrl}
              alt="Cycle image"
              width={500}
              height={300}
              layout="responsive"
              objectFit="cover"
              className="rounded-lg cursor-pointer"
              onClick={() => handleImageClick(cycle.imageUrl)}
            />
          </div>
        )}
        {(cycle.recycledFromId || cycle.upcycledFromId) && (
          <div className="mt-4 mb-4">
            <MiniCycleCard cycle={originalCycle} />
          </div>
        )}
        <ActionButtons
          cycleId={cycle.id}
          isOwner={isOwner}
          likeCount={likeCount}
          isLiked={isLiked}
          onToggleLike={toggleLike}
          onOpenRecycleDialog={() => setIsRecycleDialogOpen(true)}
          onOpenUpcycleDialog={() => setIsUpcycleDialogOpen(true)}
        />
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
        <>
          <RecycleDialog
            user={loginUser}
            isOpen={isRecycleDialogOpen}
            onClose={setIsRecycleDialogOpen}
            recycleContent={recycleContent}
            setRecycleContent={setRecycleContent}
            recycleMedium={recycleMedium}
            setRecycleMedium={setRecycleMedium}
            handleRecycle={handleRecycle}
            cycle={cycle}
          />
          <UpcycleDialog
            user={loginUser}
            isOpen={isUpcycleDialogOpen}
            onClose={setIsUpcycleDialogOpen}
            upcycleContent={upcycleContent}
            setUpcycleContent={setUpcycleContent}
            upcycleMedium={upcycleMedium}
            setUpcycleMedium={setUpcycleMedium}
            handleUpcycle={handleUpcycle}
            cycle={cycle}
          />
        </>
      )}
      {isImageModalOpen && (
        <ImageModal
          imageUrl={selectedImageUrl}
          onClose={() => setIsImageModalOpen(false)}
        />
      )}
    </Card>
  );
}

// CycleHeader Component
const CycleHeader = ({
  username,
  cycleId,
  createdAt,
  medium,
  isOwner,
  onEdit,
  onDelete,
}) => (
  <div className="flex justify-between items-center">
    <div className="flex items-center space-x-3">
      <UserAvatar username={username} size={48} />
      <div>
        <Link href={`/${username}`} className="hover:underline">
          <CardTitle className="text-xl cursor-pointer">{username}</CardTitle>
        </Link>
        <Link href={`/cycles/${cycleId}`} className="hover:underline">
          <p className="text-sm text-gray-500">{getRelativeTime(createdAt)}</p>
        </Link>
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

// Updated ActionButtons Component
const ActionButtons = ({
  cycleId,
  isOwner,
  likeCount,
  isLiked,
  onToggleLike,
  onOpenRecycleDialog,
  onOpenUpcycleDialog,
}) => (
  <div className="mt-12 flex space-x-2">
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
    {!isOwner ? (
      <Button
        variant="outline"
        size="sm"
        onClick={onOpenRecycleDialog}
        className="flex items-center space-x-2 flex-1 justify-center text-green-600 border-green-300 hover:bg-green-50 hover:text-green-700 hover:border-green-400 transition-colors"
      >
        <Repeat className="h-5 w-5" />
        <span>리사이클</span>
      </Button>
    ) : (
      <Button
        variant="outline"
        size="sm"
        onClick={onOpenUpcycleDialog}
        className="flex items-center space-x-2 flex-1 justify-center text-orange-600 border-orange-300 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-400 transition-colors"
      >
        <CircleFadingArrowUp className="h-5 w-5" />
        <span>업사이클</span>
      </Button>
    )}
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        const cycleUrl = `${window.location.origin}/cycles/${cycleId}`;
        navigator.clipboard.writeText(cycleUrl).then(() => {
          alert("사이클 링크가 클립보드에 복사되었습니다.");
        });
      }}
      className="flex items-center space-x-2 flex-1 justify-center text-blue-600 border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400 transition-colors"
    >
      <Share2 className="h-5 w-5" />
      <span>사이클 링크 복사</span>
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
  <div className="mt-4 space-y-4">
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
            {comment.user.username}
          </span>
          <span className="text-sm text-gray-500">
            {getRelativeTime(comment.createdAt)}
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
      {currentUser.id === comment.userId && (
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
  user,
  isOpen,
  onClose,
  recycleContent,
  setRecycleContent,
  recycleMedium,
  setRecycleMedium,
  handleRecycle,
  cycle,
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">리사이클</DialogTitle>
          <DialogDescription className="text-base">
            이 사이클에서 어떤 배움이 발견되었나요?
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => handleRecycle(e, selectedImage)}
          className="mt-2"
        >
          <Textarea
            className="mt-4 text-base"
            placeholder="해당 사이클에서 발견한 배움을 작성해주세요..."
            value={recycleContent}
            onChange={(e) => setRecycleContent(e.target.value)}
            rows={4}
          />
          <div className="mt-4">
            <Select value={recycleMedium} onValueChange={setRecycleMedium}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="미디엄 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="없음">없음</SelectItem>
                {user.mediums?.map((med, index) => (
                  <SelectItem key={index} value={med}>
                    {med}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              이미지 선택
            </Button>
            {selectedImage && (
              <div className="mt-2 relative inline-block">
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Selected"
                  className="max-w-full h-auto rounded-md max-h-40"
                />
                <button
                  type="button"
                  onClick={handleImageRemove}
                  className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                >
                  <FiX className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            )}
          </div>
          <div className="mt-2">
            <MiniCycleCard cycle={cycle} clickable={false} />
          </div>
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
};

// UpcycleDialog Component
const UpcycleDialog = ({
  user,
  isOpen,
  onClose,
  upcycleContent,
  setUpcycleContent,
  upcycleMedium,
  setUpcycleMedium,
  handleUpcycle,
  cycle,
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">업사이클</DialogTitle>
          <DialogDescription className="text-base">
            어떤 새로운 배움이 있으셨나요?
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => handleUpcycle(e, selectedImage)}
          className="mt-2"
        >
          <Textarea
            className="mt-4 text-base"
            placeholder="발견한 배움을 작성해주세요..."
            value={upcycleContent}
            onChange={(e) => setUpcycleContent(e.target.value)}
            rows={4}
          />
          <div className="mt-4">
            <Select value={upcycleMedium} onValueChange={setUpcycleMedium}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="미디엄 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="없음">없음</SelectItem>
                {user.mediums?.map((med, index) => (
                  <SelectItem key={index} value={med}>
                    {med}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              이미지 선택
            </Button>
            {selectedImage && (
              <div className="mt-2 relative inline-block">
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Selected"
                  className="max-w-full h-auto rounded-md max-h-40"
                />
                <button
                  type="button"
                  onClick={handleImageRemove}
                  className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                >
                  <FiX className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            )}
          </div>
          <div className="mt-2">
            <MiniCycleCard cycle={cycle} clickable={false} />
          </div>
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
              업사이클
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ImageModal Component
const ImageModal = ({ imageUrl, onClose }) => (
  <Dialog open={true} onOpenChange={onClose}>
    <DialogContent className="max-w-3xl">
      <div className="flex justify-center">
        <Image
          src={imageUrl}
          alt="Enlarged image"
          width={800}
          height={600}
          objectFit="contain"
          className="rounded-lg"
        />
      </div>
    </DialogContent>
  </Dialog>
);
