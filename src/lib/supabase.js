import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    global: {
      // Force every Supabase fetch to bypass Next.js Data Cache.
      // Without this, the module-level singleton shares cached HTTP responses
      // across requests, causing the list endpoint to return stale data
      // while the individual endpoint (unique URL per ID) always gets fresh data.
      fetch: (url, options = {}) =>
        fetch(url, { ...options, cache: 'no-store' }),
    },
  }
);
