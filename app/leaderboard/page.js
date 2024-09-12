"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "../components/Header";
import { UserAvatar } from "../components/UserAvatar";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkUser();
    fetchLeaderboard();
  }, []);

  async function checkUser() {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setIsLoggedIn(true);
    }
  }

  async function fetchLeaderboard() {
    // 모든 사용자 가져오기
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, username");

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return;
    }

    // medium이 있는 cycle 가져오기
    const { data: cycles, error: cyclesError } = await supabase
      .from("cycles")
      .select(
        `
        user_id,
        medium
      `
      )
      .not("medium", "is", null)
      .not("medium", "eq", "");

    if (cyclesError) {
      console.error("Error fetching cycles:", cyclesError);
      return;
    }

    // 사용자별 medium 사용 횟수 계산
    const userMediumCounts = users.reduce((acc, user) => {
      acc[user.id] = { username: user.username, mediums: {} };
      return acc;
    }, {});

    cycles.forEach((cycle) => {
      if (userMediumCounts[cycle.user_id]) {
        if (!userMediumCounts[cycle.user_id].mediums[cycle.medium]) {
          userMediumCounts[cycle.user_id].mediums[cycle.medium] = 0;
        }
        userMediumCounts[cycle.user_id].mediums[cycle.medium]++;
      }
    });

    const formattedData = Object.values(userMediumCounts).map((user) => ({
      username: user.username,
      mediums: Object.entries(user.mediums).sort((a, b) => b[1] - a[1]),
      total: Object.values(user.mediums).reduce((sum, count) => sum + count, 0),
    }));

    formattedData.sort((a, b) => b.total - a.total);

    setLeaderboard(formattedData);
  }

  function handleLogout() {
    setIsLoggedIn(false);
    localStorage.removeItem("user");
    // Redirect to home page or login page
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <div className="flex-grow flex justify-center">
        <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
          <h1 className="text-3xl font-bold text-center mb-8">Leaderboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {leaderboard.map((user, index) => (
              <Card key={index} className="bg-white shadow-md">
                <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                  <UserAvatar username={user.username} size={48} />
                  <CardTitle className="text-xl font-semibold">
                    {user.username}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-500 mb-2">
                    Total cycles: {user.total}
                  </div>
                  {user.total > 0 ? (
                    <div className="space-y-2">
                      <div className="text-sm font-medium mb-2">
                        Mediums used:
                      </div>
                      {user.mediums.map(([medium, count], idx) => (
                        <div key={idx} className="flex items-center">
                          <div className="w-24 font-medium">{medium}</div>
                          <div className="flex-grow bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{
                                width: `${(count / user.total) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <div className="w-10 text-right text-sm ml-2">
                            {count}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No mediums used yet
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
