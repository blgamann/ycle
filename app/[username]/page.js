"use client";
import { useState, useEffect, useCallback } from "react";
import { useCycles } from "../hooks/useCycles";
import { useAuth } from "../contexts/AuthContext";
import { CycleList } from "../components/CycleList";
import { UserCard } from "../components/UserCard";
import { useParams, useRouter } from "next/navigation";
import { RecordInput } from "../components/RecordInput";
import { EventDialog } from "../components/EventDialog";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { supabase } from "../lib/supabase";
import { useUsers } from "../hooks/useUsers";

export default function UserPage() {
  const params = useParams();
  const router = useRouter();
  const encodedUsername = params.username;
  const username = decodeURIComponent(encodedUsername);

  const { isLoggedIn, user, updateUser } = useAuth();
  const [pageUser, setPageUser] = useState(null);
  const [userNotFound, setUserNotFound] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const {
    cycles,
    isLoading: isLoadingCycles,
    hasMore,
    ref,
    handleCycleSubmit,
    handleEventSubmit,
    handleCycleDelete,
    handleRecycle,
    initialLoadComplete,
  } = useCycles({
    isLoggedIn,
    user,
    username,
  });
  const { addMedium } = useUsers();

  const fetchPageUser = useCallback(async () => {
    setIsLoadingUser(true);
    try {
      const { data, error } = await supabase
        .from("User")
        .select("*")
        .eq("username", username)
        .single();

      if (error || !data) {
        setUserNotFound(true);
        console.error("사용자 정보 가져오기 오류:", error);
      } else {
        setUserNotFound(false);
        setPageUser(data);
      }
    } catch (error) {
      setUserNotFound(true);
      console.error("사용자 정보 가져오기 오류:", error);
    } finally {
      setIsLoadingUser(false);
    }
  }, [username]);

  useEffect(() => {
    fetchPageUser();
  }, [fetchPageUser]);

  const handleAddMedium = async (user, newMedium) => {
    await addMedium(user, newMedium);
    const updatedUser = await updateUser(user);
    setPageUser(updatedUser);
  };

  if (isLoadingUser) return <div>로딩 중...</div>;

  if (userNotFound) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.push("/")}
          className="mb-4 flex items-center text-blue-500 hover:text-blue-700"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          뒤로가기
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">사용자를 찾을 수 없습니다</h1>
          <p>요청하신 사용자 "{username}"은(는) 존재하지 않습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.push("/")}
        className="mb-4 flex items-center text-blue-500 hover:text-blue-700"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back
      </button>
      <UserCard user={pageUser} onAddMedium={handleAddMedium} />
      {user && user.username === username && (
        <div className="flex items-center justify-between mt-4">
          <RecordInput user={user} onSubmit={handleCycleSubmit} />
          <EventDialog user={user} onSubmit={handleEventSubmit} />
        </div>
      )}
      <div className="mt-4">
        <CycleList
          currentUser={user}
          cycles={cycles}
          onDelete={handleCycleDelete}
          onRecycle={handleRecycle}
        />
      </div>
      {hasMore && initialLoadComplete && (
        <div ref={ref} style={{ height: "20px" }}></div>
      )}
      {isLoadingCycles && <p>더 많은 사이클을 불러오는 중...</p>}
    </div>
  );
}
