import { createClient } from "@supabase/supabase-js";

// Environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "❌ Missing Supabase credentials! Please check your .env file."
  );
  throw new Error("Missing Supabase credentials");
}

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Configuration
export const CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB limit
  allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  storageBucket: "photos",
};
