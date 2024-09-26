import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useUsers(isLoggedIn) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      fetchUsers();
    }
  }, [isLoggedIn]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("username, medium, why");

      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      setError(error.message);
    }
  };

  const addMedium = async (user, newMedium) => {
    try {
      if (!user) throw new Error("User not found");
      const updatedMediums = [...(user.medium || []), newMedium];

      const { data, error } = await supabase
        .from("users")
        .update({ medium: updatedMediums })
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === user.id ? data : u))
      );

      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const handleUpdateWhy = async (user, newWhy) => {
    try {
      if (!user) throw new Error("User not found");

      const { data, error } = await supabase
        .from("users")
        .update({ why: newWhy })
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  return { users, addMedium, error, handleUpdateWhy };
}
