// pages/index.js
"use client";
import { useState, useEffect } from "react";
import { RecordDialog } from "./components/RecordDialog";
import { EventDialog } from "./components/EventDialog";
import { Header } from "./components/Header";
import { LoginForm } from "./components/LoginForm";
import { UserFilter } from "./components/UserFilter";
import { CycleList } from "./components/CycleList";
import { UserCard } from "./components/UserCard";
import { useAuth } from "./hooks/useAuth";
import { useUsers } from "./hooks/useUsers";
import { useCycles } from "./hooks/useCycles";

export default function Home() {
  const [selectedUser, setSelectedUser] = useState("전체");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { isLoggedIn, user, handleLogin, handleLogout } = useAuth();
  const { users } = useUsers(isLoggedIn);
  const {
    cycles,
    isLoading,
    hasMore,
    ref,
    handleCycleSubmit,
    handleEventSubmit,
    handleCycleDelete,
    handleRecycle,
    initialLoadComplete, // Destructure initialLoadComplete
  } = useCycles({ isLoggedIn, user });

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {isLoggedIn && <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />}
      <div className="flex-grow flex justify-center">
        <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-6">
          {!isLoggedIn ? (
            <LoginForm onLogin={handleLogin} />
          ) : (
            <>
              <UserFilter
                users={users}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
              />

              {selectedUser !== "전체" && (
                <UserCard
                  user={users.find((u) => u.username === selectedUser)}
                />
              )}

              {(selectedUser === "전체" || selectedUser === user.username) && (
                <div className="flex items-center justify-between mb-4">
                  {isLoggedIn && user && (
                    <RecordDialog user={user} onSubmit={handleCycleSubmit} />
                  )}
                  <EventDialog user={user} onSubmit={handleEventSubmit} />
                </div>
              )}

              {isLoggedIn && (
                <CycleList
                  cycles={cycles.filter(
                    (cycle) =>
                      selectedUser === "전체" ||
                      cycle.users.username === selectedUser
                  )}
                  currentUser={user}
                  onDelete={handleCycleDelete}
                  onRecycle={handleRecycle}
                />
              )}
              {hasMore && initialLoadComplete && (
                <div ref={ref} style={{ height: "20px" }}></div>
              )}
              {isLoading && <p>더 많은 사이클을 불러오는 중...</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
