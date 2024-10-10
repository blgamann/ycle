"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  console.log("1");

  useEffect(() => {
    console.log("2");
    checkUser();
  }, []);

  async function checkUser() {
    console.log("3");
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      console.log("4");
      const parsedUser = JSON.parse(storedUser);
      await updateUser(parsedUser);
      setIsLoggedIn(true);
    }
  }

  async function updateUser(user) {
    const { data, error } = await supabase
      .from("User")
      .select("*")
      .eq("username", user.username)
      .single();

    if (error) {
      alert("사용자 정보 업데이트 오류: " + error.message);
    }

    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));

    return data;
  }

  async function handleLogin(username, password) {
    const { data, error } = await supabase
      .from("User")
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
    } else {
      alert("잘못된 사용자 이름 또는 비밀번호입니다.");
    }
  }

  function handleLogout() {
    router.push("/");
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("user");
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        handleLogin,
        handleLogout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
