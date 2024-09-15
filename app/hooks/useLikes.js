import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useLikes(cycleId, userId) {
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    fetchLikeCount();
    checkIfLiked();
  }, [cycleId, userId]);

  async function fetchLikeCount() {
    const { count, error } = await supabase
      .from("likes")
      .select("*", { count: "exact" })
      .eq("cycle_id", cycleId);

    if (error) {
      console.error("Error fetching like count:", error);
    } else {
      setLikeCount(count);
    }
  }

  async function checkIfLiked() {
    const { data, error } = await supabase
      .from("likes")
      .select("*")
      .eq("cycle_id", cycleId)
      .eq("user_id", userId)
      .single(); // When data is not found (0 row), error is populated

    if (error) {
      console.error("Error checking if liked:", error);
    } else {
      setIsLiked(!!data);
    }
  }

  async function toggleLike() {
    if (isLiked) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("cycle_id", cycleId)
        .eq("user_id", userId);

      if (error) {
        console.error("Error unliking cycle:", error);
      } else {
        setLikeCount((prev) => prev - 1);
        setIsLiked(false);
      }
    } else {
      const { error } = await supabase
        .from("likes")
        .insert({ cycle_id: cycleId, user_id: userId });

      if (error) {
        console.error("Error liking cycle:", error);
      } else {
        setLikeCount((prev) => prev + 1);
        setIsLiked(true);
      }
    }
  }

  return { likeCount, isLiked, toggleLike };
}
