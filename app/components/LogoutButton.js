"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // 세션 스토리지에서 로그인 상태 제거
    sessionStorage.removeItem("isLoggedIn");
    // 홈 페이지로 리다이렉트
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300"
    >
      로그아웃
    </button>
  );
}
