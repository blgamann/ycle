"use client";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"; // Add this line
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "./components/UserAvatar";

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

  useEffect(() => {
    checkUser();
  }, []);

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
    const { data, error } = await supabase
      .from("cycles")
      .select(
        `
      *,
      users:user_id (id, username, medium)
    `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching cycles:", error);
      return;
    }

    if (data) {
      console.log("Fetched cycles:", data);
      setCycles(data);
    }
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
      setSelectedMedium(""); // Add this line
      localStorage.setItem("user", JSON.stringify(data));
      fetchUsers();
      fetchCycles();
    } else {
      alert("잘못된 사용자 이름 또는 비밀번호입니다.");
    }
  }

  function handleLogout() {
    setIsLoggedIn(false);
    setUser(null);
    setUsers([]);
    setCycles([]);
    setSelectedMedium(""); // Add this line
    setUsername(""); // Add this line
    setPassword(""); // Add this line
    localStorage.removeItem("user");
  }

  async function handleCycleSubmit(e) {
    e.preventDefault();
    const { data, error } = await supabase.from("cycles").insert({
      user_id: user.id,
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

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
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
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center space-x-4 overflow-x-auto pb-2">
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
            variant={selectedUser === user.username ? "default" : "outline"}
            onClick={() => setSelectedUser(user.username)}
            className="whitespace-nowrap"
          >
            {user.username}
          </Button>
        ))}
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
                  {users.find((u) => u.username === selectedUser)?.why ||
                    "Why가 설정되지 않았습니다."}
                </p>
                <div className="flex items-center">
                  <span className="font-semibold mr-2 text-gray-700">
                    Mediums:
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
        <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
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
                <span className="text-3xl" role="img" aria-label="pencil">
                  ✏️
                </span>
                <div className="flex-grow">
                  <p className="text-lg text-gray-700">
                    오늘의 배움이 있으셨나요?
                  </p>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-2xl">기록하기</DialogTitle>
              </DialogHeader>
              <div className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-lg text-gray-700">
                  {user.why || "아직 'Why'를 설정하지 않았습니다."}
                </p>
              </div>
              <form onSubmit={handleCycleSubmit} className="space-y-4">
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
      )}

      <ScrollArea>
        {cycles
          .filter(
            (cycle) =>
              selectedUser === "전체" || cycle.users.username === selectedUser
          )
          .map((cycle, index) => (
            <CycleCard key={index} cycle={cycle} currentUser={user} />
          ))}
      </ScrollArea>

      <Button onClick={handleLogout} className="w-full">
        로그아웃
      </Button>
    </div>
  );
}
