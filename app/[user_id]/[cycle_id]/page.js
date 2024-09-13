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

  useEffect(() => {
    async function fetchCycle() {
      const { data, error } = await supabase
        .from("cycles")
        .select(`*, users:user_id (id, username, medium)`)
        .eq("id", params.cycle_id)
        .single();

      if (error) {
        console.error("Error fetching cycle:", error);
      } else {
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
  }, [params.cycle_id]);

  if (!cycle) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
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
