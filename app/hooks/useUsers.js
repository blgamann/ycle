import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useUsers(isLoggedIn) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchUsers();
    }
  }, [isLoggedIn]);

  async function fetchUsers() {
    const { data, error } = await supabase
      .from("users")
      .select("username, medium, why");
    if (data) setUsers(data);
  }

  return { users };
}
