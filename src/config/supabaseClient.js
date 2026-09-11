const { createClient } = require('@supabase/supabase-js');

// PENTING: pakai SERVICE_ROLE_KEY, dan HANYA dipakai di server (backend ini),
// jangan pernah dikirim/exposed ke frontend/browser.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false },
  }
);

module.exports = supabase;
