import { Link, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export function AppShell() {
  const { token, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/85 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" className="font-display text-2xl font-semibold tracking-tight">
            rocketlane<span className="text-pop">.</span>
          </Link>
          <div className="flex items-center gap-4 text-sm font-medium">
            {token ? (
              <>
                <Link to="/app/resume" className="hover:underline underline-offset-4">
                  Resumes
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="press rounded-full border bg-card px-4 py-2 font-semibold shadow-brutal"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/app/login" className="hover:underline underline-offset-4">
                  Log in
                </Link>
                <Link
                  to="/app/signup"
                  className="press rounded-full border bg-accent px-4 py-2 font-semibold shadow-brutal"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10">
        <Outlet />
      </main>
    </div>
  );
}
