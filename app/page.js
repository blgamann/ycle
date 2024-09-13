"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "./lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CycleCard } from "./components/CycleCard";
import { UserAvatar } from "./components/UserAvatar";
import { Header } from "./components/Header";
import { Calendar } from "@/components/ui/calendar";
import { useInView } from "react-intersection-observer";
import { RecordDialog } from "./components/RecordDialog";
import { EventDialog } from './components/EventDialog';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [selectedUser, setSelectedUser] = useState("전체");
  const [isNewCycleDialogOpen, setIsNewCycleDialogOpen] = useState(false);
  const [cycleDescription, setCycleDescription] = useState("");
  const [newCycleMedium, setNewCycleMedium] = useState("");
  const [newCycleDate, setNewCycleDate] = useState(null);
  const [newCycleLocation, setNewCycleLocation] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0,
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    checkUser();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchCycles(true); // Reset and fetch cycles when logged in
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (inView && hasMore && !isLoading && isLoggedIn) {
      fetchCycles(false); // Fetch more cycles when scrolling
    }
  }, [inView, hasMore, isLoading, isLoggedIn]);

  useEffect(() => {
    if (isClient) {
      setNewCycleDate(new Date());
    }
  }, [isClient]);

  async function checkUser() {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setIsLoggedIn(true);
      setUser(parsedUser);
      fetchUsers();
      fetchCycles();
    }
  }

  async function fetchUsers() {
    const { data, error } = await supabase
      .from("users")
      .select("username, medium, why");
    if (data) setUsers(data);
  }

  const fetchCycles = useCallback(
    async (resetPage = false) => {
      if (isLoading) return;
      setIsLoading(true);

      const pageSize = 10;
      const newPage = resetPage ? 0 : page;
      const from = newPage * pageSize;
      const to = from + pageSize - 1;

      console.log(`Fetching page: ${newPage}, range: ${from}-${to}`);

      try {
        const { data, error } = await supabase
          .from("cycles")
          .select(`*, users:user_id (id, username, medium)`)
          .order("created_at", { ascending: false })
          .range(from, to);

        if (error) throw error;

        console.log("Fetched cycles:", data);

        setCycles((prevCycles) => {
          const newCycles = resetPage ? data : [...prevCycles, ...data];
          // Remove duplicates based on id
          const uniqueCycles = Array.from(
            new Map(newCycles.map((item) => [item.id, item])).values()
          );
          return uniqueCycles;
        });

        setHasMore(data.length === pageSize);
        setPage(newPage + 1);
      } catch (error) {
        console.error("Error fetching cycles:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [page, supabase]
  );

  async function handleLogin(e) {
    e.preventDefault();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error) {
      alert("로그인 오류: " + error.message);
      return;
    }

    if (data && data.password === password) {
      setIsLoggedIn(true);
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      fetchUsers();
      setPage(0);
      setCycles([]);
      setHasMore(true);
    } else {
      alert("잘못된 사용자 이름 또는 비밀번호입니다.");
    }
  }

  function handleLogout() {
    setIsLoggedIn(false);
    setUser(null);
    setUsers([]);
    setCycles([]);
    setSelectedUser("전체");
    setPage(0);
    setHasMore(true);
    localStorage.removeItem("user");
  }

  const addCycle = useCallback((newCycle) => {
    setCycles((prevCycles) => [newCycle, ...prevCycles]);
  }, []);

  const handleCycleSubmit = async ({ reflection, medium }) => {
    const { data, error } = await supabase
      .from("cycles")
      .insert({
        user_id: user.id,
        type: "cycle",
        medium: medium,
        reflection: reflection,
      })
      .select("*, users:user_id (id, username, medium)");

    if (error) {
      alert("사이클 작성 오류: " + error.message);
    } else {
      addCycle(data[0]); // 새로 생성된 cycle을 상태에 추가
    }
  };

  function handleCycleDelete(cycleId) {
    setCycles((prevCycles) =>
      prevCycles.filter((cycle) => cycle.id !== cycleId)
    );
  }

  const handleEventSubmit = async (eventData) => {
    const { data, error } = await supabase
      .from("cycles")
      .insert({
        user_id: user.id,
        type: "event",
        ...eventData,
      })
      .select('*, users:user_id (id, username, medium)');

    if (error) {
      alert("이벤트 생성 오류: " + error.message);
    } else {
      addCycle(data[0]); // 새로 생성된 이벤트를 상태에 추가
    }
  };

  async function handleRecycle() {
    setPage(0);
    setCycles([]);
    setHasMore(true);
    await fetchCycles(true);
  }

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {isLoggedIn && <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />}
      <div className="flex-grow flex justify-center">
        <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-6">
          {!isLoggedIn ? (
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md px-4">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">
                      로그인
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">사용자 이름</Label>
                        <Input
                          id="username"
                          type="text"
                          placeholder="사용자 이름을 입력하세요"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">비밀번</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="비밀번호를 입력하세요"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        로그인
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <>
              <div className="border-t border-b border-gray-200 py-4">
                <div className="flex items-center justify-center space-x-4 overflow-x-auto">
                  <Button
                    variant={selectedUser === "전체" ? "default" : "outline"}
                    onClick={() => setSelectedUser("전체")}
                    className="whitespace-nowrap"
                  >
                    전체
                  </Button>
                  {users.map((user, index) => (
                    <Button
                      key={index}
                      variant={
                        selectedUser === user.username ? "default" : "outline"
                      }
                      onClick={() => setSelectedUser(user.username)}
                      className="whitespace-nowrap"
                    >
                      {user.username}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedUser !== "전체" && (
                <Card className="bg-white border-2 border-primary shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-6">
                      <div className="bg-gray-100 rounded-full p-1">
                        <UserAvatar username={selectedUser} size={80} />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2 text-primary">
                          {selectedUser}
                        </h2>
                        <p className="text-lg mb-4 text-gray-600">
                          {users.find((u) => u.username === selectedUser)
                            ?.why || "Why가 설정되지 않았습니다."}
                        </p>
                        <div className="flex items-center">
                          <span className="font-semibold mr-2 text-gray-700">
                            Medium:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {users
                              .find((u) => u.username === selectedUser)
                              ?.medium?.map((med, index) => (
                                <span
                                  key={index}
                                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
                                >
                                  {med}
                                </span>
                              )) || "설정되지 않음"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                <>
                  {cycles.length > 0 ? (
                    <>
                      {cycles
                        .filter(
                          (cycle) =>
                            selectedUser === "전체" ||
                            cycle.users.username === selectedUser
                        )
                        .map((cycle) => (
                          <CycleCard
                            key={cycle.id}
                            cycle={cycle}
                            currentUser={user}
                            onDelete={handleCycleDelete}
                            onRecycle={handleRecycle}
                          />
                        ))}
                      {hasMore && (
                        <div ref={ref} style={{ height: "20px" }}></div>
                      )}
                      {isLoading && <p>Loading more cycles...</p>}
                    </>
                  ) : (
                    <p>No cycles or events found.</p>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
