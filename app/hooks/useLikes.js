import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useLikes(cycleId, userId) {
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (cycleId) {
      fetchLikeCount();
      if (userId) {
        checkIfLiked();
      }
    }
  }, [cycleId, userId]);

  async function fetchLikeCount() {
    const { count, error } = await supabase
      .from("Like")
      .select("*", { count: "exact" })
      .eq("cycleId", cycleId);

    if (error) {
      console.error("Error fetching like count:", error);
    } else {
      setLikeCount(count);
    }
  }

  async function checkIfLiked() {
    if (!userId) {
      setIsLiked(false);
      return;
    }

    const { data, error } = await supabase
      .from("Like")
      .select("*")
      .eq("cycleId", cycleId)
      .eq("userId", userId);

    if (error) {
      console.error("Error checking if liked:", error);
    } else {
      setIsLiked(data.length > 0);
    }
  }

  async function toggleLike() {
    if (isLiked) {
      const { error } = await supabase
        .from("Like")
        .delete()
        .eq("cycleId", cycleId)
        .eq("userId", userId);

      if (error) {
        console.error("Error unliking cycle:", error);
      } else {
        setLikeCount((prev) => prev - 1);
        setIsLiked(false);
      }
    } else {
      const { error } = await supabase
        .from("Like")
        .insert({ cycleId: cycleId, userId: userId });

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
