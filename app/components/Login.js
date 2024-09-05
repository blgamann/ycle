import { useState } from "react";

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.success) {
        onLoginSuccess();
      } else {
        alert("로그인 실패: " + data.error);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("로그인 중 오류가 발생했습니다.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
      <h2 className="text-2xl font-bold mb-4">로그인</h2>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="사용자 이름"
        className="w-full p-2 mb-2 border rounded"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호"
        className="w-full p-2 mb-4 border rounded"
        required
      />
      <button
        type="submit"
        className="w-full p-2 bg-blue-500 text-white rounded"
      >
        로그인
      </button>
    </form>
  );
}
