"use client";
import { useState, useEffect } from "react";
import { useCycles } from "../hooks/useCycles";
import { useAuth } from "../contexts/AuthContext";
import { CycleList } from "../components/CycleList";
import { UserCard } from "../components/UserCard";
import { useParams, useRouter } from "next/navigation";
import { RecordDialog } from "../components/RecordDialog";
import { EventDialog } from "../components/EventDialog";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { supabase } from "../lib/supabase";

export default function UserPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username;

  const { isLoggedIn, user } = useAuth();
  const [pageUser, setPageUser] = useState(null);
  const [userNotFound, setUserNotFound] = useState(false);

  const {
    cycles,
    isLoading,
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

  useEffect(() => {
    async function fetchPageUser() {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .single();

      if (error) {
        setUserNotFound(true);
        console.error("Error fetching user:", error);
      } else {
        setUserNotFound(false);
        setPageUser(data);
      }
    }

    fetchPageUser();
  }, [username]);

  if (isLoading) return <div>로딩 중...</div>;

  if (userNotFound) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.push("/")}
          className="mb-4 flex items-center text-blue-500 hover:text-blue-700"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
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
      <UserCard user={pageUser} />
      {user && user.username === username && (
        <div className="flex items-center justify-between mt-4">
          <RecordDialog user={user} onSubmit={handleCycleSubmit} />
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
      {isLoading && <p>더 많은 사이클을 불러오는 중...</p>}
    </div>
  );
}
