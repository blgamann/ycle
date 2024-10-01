"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { CycleCard } from "../../components/CycleCard";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

export default function CyclePage() {
  const params = useParams();
  const router = useRouter();
  const [cycle, setCycle] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [cycleNotFound, setCycleNotFound] = useState(false);

  useEffect(() => {
    async function fetchCycle() {
      const { data, error } = await supabase
        .from("Cycle")
        .select(`*, users:userId (id, username, medium)`)
        .eq("id", params.cycleId)
        .single();

      if (error) {
        setCycleNotFound(true);
        console.error("Error fetching cycle:", error);
      } else {
        setCycleNotFound(false);
        setCycle(data);
      }
    }

    async function fetchCurrentUser() {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    }

    fetchCycle();
    fetchCurrentUser();
  }, [params.cycleId]);

  if (cycleNotFound) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.push("/")}
          className="mb-4 flex items-center text-blue-500 hover:text-blue-700"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">사이클을 찾을 수 없습니다</h1>
          <p>요청하신 사이클 "{params.cycleId}"은(는) 존재하지 않습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => router.push("/")}
        className="mb-4 flex items-center text-blue-500 hover:text-blue-700"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back
      </button>
      <CycleCard
        cycle={cycle}
        currentUser={currentUser}
        onDelete={() => {}} // 필요에 따라 구현
        onRecycle={() => {}} // 필요에 따라 구현
      />
    </div>
  );
}
