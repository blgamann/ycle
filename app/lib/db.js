import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

// Helper functions
export const getUser = async (id) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

export const getCycle = async (id) => {
  const { data, error } = await supabase
    .from("cycles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

export const getComments = async (cycleId) => {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("cycle_id", cycleId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const createUser = async (userData) => {
  const { data, error } = await supabase
    .from("users")
    .insert(userData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Add more helper functions as needed
