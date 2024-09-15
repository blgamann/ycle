import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export const useOriginalCycle = (recycledFrom) => {
  const [originalCycle, setOriginalCycle] = useState(null);

  const fetchOriginalCycle = useCallback(async () => {
    if (!recycledFrom) return;

    const { data, error } = await supabase
      .from("cycles")
      .select("*, users:user_id (*)")
      .eq("id", recycledFrom)
      .single();

    if (error) {
      console.error("Error fetching original cycle:", error);
    } else {
      setOriginalCycle(data);
    }
  }, [recycledFrom]);

  useEffect(() => {
    fetchOriginalCycle();
  }, [fetchOriginalCycle]);

  return originalCycle;
};
