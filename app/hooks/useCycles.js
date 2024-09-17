// hooks/useCycles.js
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useInView } from "react-intersection-observer";

export function useCycles({ isLoggedIn, user, username }) {
  const [cycles, setCycles] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const pageRef = useRef(0);
  const isFetchingRef = useRef(false);

  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (isLoggedIn) {
      resetCycles();
      fetchCycles(true);
    }
  }, [isLoggedIn, username]); // Include username here

  useEffect(() => {
    if (
      initialLoadComplete &&
      isLoggedIn &&
      inView &&
      hasMore &&
      !isFetchingRef.current
    ) {
      fetchCycles();
    }
  }, [inView, initialLoadComplete, isLoggedIn, hasMore]);

  const resetCycles = () => {
    setCycles([]);
    setHasMore(true);
    setInitialLoadComplete(false);
    pageRef.current = 0;
  };

  const fetchCycles = useCallback(
    async (resetPage = false) => {
      if (isFetchingRef.current) return; // Prevent overlapping calls
      isFetchingRef.current = true;
      setIsLoading(true);

      const pageSize = 10;
      const newPage = resetPage ? 0 : pageRef.current;
      const from = newPage * pageSize;
      const to = from + pageSize - 1;

      console.log("fetching cycles", newPage, from, to);

      try {
        let query = supabase
          .from("cycles")
          .select(
            `
            *,
            users:user_id (id, username, medium)
          `
          )
          .order("created_at", { ascending: false })
          .range(from, to);

        if (username) {
          const decodedUsername = decodeURIComponent(username);

          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("username", decodedUsername)
            .single();

          if (userError) throw userError;

          query = query.eq("user_id", userData.id);
        }

        const { data, error } = await query;

        if (error) throw error;

        setCycles((prevCycles) => {
          const newCycles = resetPage ? data : [...prevCycles, ...data];
          // remove duplicate cycles
          const uniqueCycles = Array.from(
            new Map(newCycles.map((item) => [item.id, item])).values()
          );
          return uniqueCycles;
        });

        setHasMore(data.length === pageSize);
        pageRef.current = newPage + 1;

        if (resetPage) {
          setInitialLoadComplete(true);
        }
      } catch (error) {
        console.error("Error fetching cycles:", error);
        alert("An error occurred while fetching cycles.");
      } finally {
        isFetchingRef.current = false;
        setIsLoading(false);
      }
    },
    [username]
  );

  // add new cycle
  const addCycle = useCallback((newCycle) => {
    setCycles((prevCycles) => [newCycle, ...prevCycles]);
  }, []);

  // submit cycle
  const handleCycleSubmit = async ({ reflection, medium, imgUrl }) => {
    try {
      const { data, error } = await supabase
        .from("cycles")
        .insert({
          user_id: user.id,
          type: "cycle",
          medium,
          reflection,
          img_url: imgUrl,
        })
        .select("*, users:user_id (id, username, medium)");

      if (error) throw error;

      addCycle(data[0]);
    } catch (error) {
      console.error("사이클 작성 오류:", error);
      alert("사이클 작성 오류: " + error.message);
    }
  };

  // delete cycle
  const handleCycleDelete = (cycleId) => {
    setCycles((prevCycles) =>
      prevCycles.filter((cycle) => cycle.id !== cycleId)
    );
  };

  // submit event
  const handleEventSubmit = async (eventData) => {
    try {
      const { data, error } = await supabase
        .from("cycles")
        .insert({
          user_id: user.id,
          type: "event",
          ...eventData,
        })
        .select("*, users:user_id (id, username, medium)");

      if (error) throw error;

      addCycle(data[0]);
    } catch (error) {
      console.error("이벤트 생성 오류:", error);
      alert("이벤트 생성 오류: " + error.message);
    }
  };

  // reload cycle
  const handleRecycle = async () => {
    resetCycles();
    await fetchCycles(true);
  };

  return {
    cycles,
    isLoading,
    hasMore,
    ref,
    handleCycleSubmit,
    handleEventSubmit,
    handleCycleDelete,
    handleRecycle,
    initialLoadComplete,
  };
}
