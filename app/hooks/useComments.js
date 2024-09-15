import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export const useComments = (cycleId) => {
  const [comments, setComments] = useState([]);

  const fetchComments = useCallback(async () => {
    if (!cycleId) return;

    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        *,
        users:user_id (username)
      `
      )
      .eq("cycle_id", cycleId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
    } else {
      setComments(data);
    }
  }, [cycleId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return { comments, fetchComments };
};
