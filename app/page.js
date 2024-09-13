"use client";
import { useState, useEffect } from "react";
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

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [reflection, setReflection] = useState("");
  const [cycles, setCycles] = useState([]);
  const [selectedMedium, setSelectedMedium] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    if (isLoggedIn && page === 0) {
      fetchCycles();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (inView && hasMore && !isLoading && isLoggedIn) {
      fetchCycles();
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

  async function fetchCycles() {
    if (isLoading) return;
    setIsLoading(true);

    const pageSize = 10;
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from("cycles")
      .select(
        `
        *,
        users:user_id (id, username, medium)
      `
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching cycles:", error);
      setIsLoading(false);
      return;
    }

    if (data) {
      console.log("Fetched cycles:", data);
      setCycles((prevCycles) => (page === 0 ? data : [...prevCycles, ...data]));
      setHasMore(data.length === pageSize);
      setPage(page + 1); // 현재 page 값을 직접 사용
    }
    setIsLoading(false);
  }

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
      setSelectedMedium("");
      localStorage.setItem("user", JSON.stringify(data));
      fetchUsers();
      setPage(0); // 페이지를 0으로 리셋
      setCycles([]); // 기존 사이클 데이터 초기화
      setHasMore(true);
      // fetchCycles()는 useEffect에서 isLoggedIn이 변경될 때 호출됩니다.
    } else {
      alert("잘못된 사용자 이름 또는 비밀번호입니다.");
    }
  }

  function handleLogout() {
    setIsLoggedIn(false);
    setUser(null);
    setUsers([]);
    setCycles([]);
    setSelectedMedium("");
    setUsername("");
    setPassword("");
    setSelectedUser("전체");
    setPage(0);
    setHasMore(true);
    localStorage.removeItem("user");
  }

  async function handleCycleSubmit(e) {
    e.preventDefault();
    const { data, error } = await supabase.from("cycles").insert({
      user_id: user.id,
      type: "cycle",
      medium: selectedMedium === "없음" ? null : selectedMedium,
      reflection: reflection,
    });

    if (error) {
      alert("사이클 작성 오류: " + error.message);
    } else {
      setReflection("");
      setSelectedMedium("");
      fetchCycles();
      setIsDialogOpen(false);
    }
  }

  function handleCycleDelete(cycleId) {
    setCycles((prevCycles) =>
      prevCycles.filter((cycle) => cycle.id !== cycleId)
    );
  }

  async function handleEventSubmit(e) {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors = {};
    if (!cycleDescription.trim()) {
      newErrors.cycleDescription = "설명을 입력해주세요.";
    }
    if (!newCycleMedium) {
      newErrors.newCycleMedium = "미디엄을 선택해주세요.";
    }
    if (!newCycleDate) {
      newErrors.newCycleDate = "날짜를 선택해주세요.";
    }
    if (!startTime) {
      newErrors.startTime = "시작 시간을 입력해주세요.";
    }
    if (!endTime) {
      newErrors.endTime = "종료 시간을 입력해주세요.";
    }
    if (startTime && endTime && startTime >= endTime) {
      newErrors.time = "종료 시간은 시작 시간 이후여야 합니다.";
    }
    if (!newCycleLocation.trim()) {
      newErrors.newCycleLocation = "장소를 입력해주세요.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const { data, error } = await supabase.from("cycles").insert({
      user_id: user.id,
      type: "event",
      event_description: cycleDescription,
      medium: newCycleMedium,
      event_date: newCycleDate.toISOString().split("T")[0],
      event_location: newCycleLocation,
      event_start_time: startTime,
      event_end_time: endTime,
    });

    if (error) {
      console.error("이벤트 생성 오류:", error.message);
      setErrors({ submit: "이벤트 생성 중 오류가 발생했습니다." });
    } else {
      setCycleDescription("");
      setNewCycleMedium("");
      setNewCycleDate(new Date());
      setNewCycleLocation("");
      setStartTime("09:00");
      setEndTime("17:00");
      setIsNewCycleDialogOpen(false);
      fetchCycles();
    }
  }

  if (!isClient) {
    return null; // or a loading spinner
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
                        <Label htmlFor="password">비밀번호</Label>
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
                  <div className="flex-grow bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
                    <Dialog
                      open={isDialogOpen}
                      onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (open) {
                          setSelectedMedium("");
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <div className="flex items-center space-x-3 p-4 cursor-pointer">
                          <span
                            className="text-3xl"
                            role="img"
                            aria-label="pencil"
                          >
                            ✏️
                          </span>
                          <div className="flex-grow">
                            <p className="text-lg text-gray-700">
                              오늘은 어떤 배움이 있으셨나요?
                            </p>
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle className="text-2xl">
                            기록하기
                          </DialogTitle>
                        </DialogHeader>
                        <div className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                          <p className="text-lg text-gray-700">
                            {user.why || "아직 'Why'를 설정하지 않았습니다."}
                          </p>
                        </div>
                        <form
                          onSubmit={handleCycleSubmit}
                          className="space-y-4"
                        >
                          <Select
                            onValueChange={setSelectedMedium}
                            value={selectedMedium}
                          >
                            <SelectTrigger className="text-base">
                              <SelectValue placeholder="미디엄 선택 (선택사항)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="없음" className="text-base">
                                없음
                              </SelectItem>
                              {user.medium &&
                                user.medium.map((med, index) => (
                                  <SelectItem
                                    key={index}
                                    value={med}
                                    className="text-base"
                                  >
                                    {med}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <Textarea
                            placeholder="오늘의 배움을 적어주세요..."
                            value={reflection}
                            onChange={(e) => setReflection(e.target.value)}
                            className="min-h-[150px] w-full text-base"
                          />
                          <div className="flex justify-end">
                            <Button type="submit" className="text-base">
                              공유
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Dialog
                    open={isNewCycleDialogOpen}
                    onOpenChange={setIsNewCycleDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="ml-4 bg-primary text-white hover:bg-primary/90 rounded-full w-16 h-16 flex items-center justify-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-10 h-10"
                        >
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span className="sr-only">새 사이클 계획</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-full max-w-[95vw] sm:max-w-[450px] h-[90vh] sm:h-auto overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-xl sm:text-2xl">
                          사이클 일정 생성
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleEventSubmit} className="space-y-4">
                        {errors.submit && (
                          <p className="text-red-500 text-sm">
                            {errors.submit}
                          </p>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="cycleDescription">설명</Label>
                          <Textarea
                            id="cycleDescription"
                            value={cycleDescription}
                            onChange={(e) =>
                              setCycleDescription(e.target.value)
                            }
                            placeholder="무엇을 하시나요?"
                            className="min-h-[100px]"
                          />
                          {errors.cycleDescription && (
                            <p className="text-red-500 text-sm">
                              {errors.cycleDescription}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cycleMedium">미디엄 선택</Label>
                          <Select
                            onValueChange={setNewCycleMedium}
                            value={newCycleMedium}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="미디엄 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              {user.medium &&
                                user.medium.map((med, index) => (
                                  <SelectItem key={index} value={med}>
                                    {med}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          {errors.newCycleMedium && (
                            <p className="text-red-500 text-sm">
                              {errors.newCycleMedium}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>일자</Label>
                          <div className="flex justify-center">
                            <Calendar
                              mode="single"
                              selected={newCycleDate}
                              onSelect={setNewCycleDate}
                              className="rounded-md border mx-auto w-full max-w-[300px]"
                            />
                          </div>
                          {errors.newCycleDate && (
                            <p className="text-red-500 text-sm">
                              {errors.newCycleDate}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex flex-col sm:flex-row sm:space-x-4">
                            <div className="flex-1 space-y-2 mb-2 sm:mb-0">
                              <Label htmlFor="startTime">시작 시간</Label>
                              <Input
                                id="startTime"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                              />
                              {errors.startTime && (
                                <p className="text-red-500 text-sm">
                                  {errors.startTime}
                                </p>
                              )}
                            </div>
                            <div className="flex-1 space-y-2">
                              <Label htmlFor="endTime">종료 시간</Label>
                              <Input
                                id="endTime"
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                              />
                              {errors.endTime && (
                                <p className="text-red-500 text-sm">
                                  {errors.endTime}
                                </p>
                              )}
                            </div>
                          </div>
                          {errors.time && (
                            <p className="text-red-500 text-sm">
                              {errors.time}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cycleLocation">장소</Label>
                          <Input
                            id="cycleLocation"
                            value={newCycleLocation}
                            onChange={(e) =>
                              setNewCycleLocation(e.target.value)
                            }
                            placeholder="장소를 입력하세요"
                          />
                          {errors.newCycleLocation && (
                            <p className="text-red-500 text-sm">
                              {errors.newCycleLocation}
                            </p>
                          )}
                        </div>

                        <div className="flex justify-end pt-4">
                          <Button type="submit" className="text-base">
                            만들기
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
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
                        .map((cycle, index) => (
                          <CycleCard
                            key={cycle.id}
                            cycle={cycle}
                            currentUser={user}
                            onDelete={handleCycleDelete}
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
