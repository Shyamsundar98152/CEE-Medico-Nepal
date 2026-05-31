<script type="module">
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://rpudsnrqlhataqfavcjh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdWRzbnJxbGhhdGFxZmF2Y2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NzI0NjgsImV4cCI6MjA5NTU0ODQ2OH0.EEu5t-NPqWARChSAMpEvUPMBkz_JeeNe3bGSCQmH7Xo";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check login
const {
  data: { session }
} = await supabase.auth.getSession();

if (!session) {
  window.location.href = "/login.html";
}

// Show user info
const user = session.user;

const userName = document.getElementById("userName");
if (userName) {
  userName.textContent =
    user.user_metadata?.full_name || user.email;
}

// Logout
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "/login.html";
  });
}
</script>
