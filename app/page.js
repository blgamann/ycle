"use client";

import { useState, useEffect } from "react";
import Login from "./components/Login";
import UserList from "./components/UserList";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = sessionStorage.getItem("isLoggedIn");
      setIsLoggedIn(loggedIn === "true");
    };

    checkLoginStatus();
    window.addEventListener("storage", checkLoginStatus);

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, []);

  const handleLoginSuccess = () => {
    sessionStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
  };

  return (
    <div className="container mx-auto p-4">
      {isLoggedIn ? (
        <UserList />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}
