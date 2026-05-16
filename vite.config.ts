import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Public Lovable Cloud / Supabase values — safe to expose (anon/publishable).
// Used as a build-time fallback when env vars are not injected into the
// published deployment, so the app never boots with an undefined supabaseUrl.
const FALLBACK_SUPABASE_URL = "https://bzwpowlydegvkfixyrfx.supabase.co";
const FALLBACK_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6d3Bvd2x5ZGVndmtmaXh5cmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMTA2MTIsImV4cCI6MjA4NzU4NjYxMn0.paHhxTu7berOnNIgjB80i5F6FpY6y4ZSZZYURW-bulE";
const FALLBACK_SUPABASE_PROJECT_ID = "bzwpowlydegvkfixyrfx";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
        env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL,
      ),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
        env.VITE_SUPABASE_PUBLISHABLE_KEY || FALLBACK_SUPABASE_PUBLISHABLE_KEY,
      ),
      "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(
        env.VITE_SUPABASE_PROJECT_ID || FALLBACK_SUPABASE_PROJECT_ID,
      ),
    },
  };
});
