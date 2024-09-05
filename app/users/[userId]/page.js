"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LogoutButton from "../../components/LogoutButton";
import AddCycleModal from "../../components/AddCycleModal";

export default function UserDetail({ params }) {
  const [userData, setUserData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { userId } = params;

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        console.error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleAddCycle = async (cycleData) => {
    try {
      const response = await fetch("/api/cycles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...cycleData, userId }),
      });

      if (response.ok) {
        fetchUserData(); // 데이터를 다시 불러와 화면을 갱신합니다.
      } else {
        console.error("Failed to add cycle");
      }
    } catch (error) {
      console.error("Error adding cycle:", error);
    }
  };

  if (!userData) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          ← 목록으로 돌아가기
        </button>
        <LogoutButton />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{userData.user.username}</h1>
        <p className="text-gray-600 mb-1">Why: {userData.user.why}</p>
        <p className="text-gray-600">Medium: {userData.user.medium}</p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">사이클 목록</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          새로운 사이클 추가
        </button>
      </div>

      <ul className="space-y-4">
        {userData.cycles.map((cycle) => (
          <li
            key={cycle.id}
            className="bg-white rounded-lg shadow-md p-4 hover:bg-gray-50 transition duration-150 ease-in-out"
          >
            <Link href={`/users/${userId}/cycles/${cycle.id}`}>
              <div>
                <p className="font-semibold">{cycle.date}</p>
                <p className="text-gray-700">활동: {cycle.activity}</p>
                <p className="text-gray-600">참여자: {cycle.participants}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <AddCycleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddCycle}
      />
    </div>
  );
}
