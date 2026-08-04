"use client";

import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client. Only NEXT_PUBLIC_ prefixed env vars are
// available here, which is safe to expose to the client by design.
// Returns null when credentials are not configured, which is how the
// app knows to fall back to seeded demo mode.
export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey || process.env.NEXT_PUBLIC_FORCE_DEMO_MODE === "true") {
    return null;
  }
  return createBrowserClient(url, anonKey);
}

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
