import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { useAuth, type AuthUser } from "@/lib/auth";

type AuthResponse = {
  access_token: string;
  user: AuthUser;
};

export function Login() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { detail?: string };
        setError(body.detail ?? "Invalid email or password");
        return;
      }
      const body = (await res.json()) as AuthResponse;
      setSession(body.access_token, body.user);
      if (body.user.phone_verified) {
        navigate("/app/resume", { replace: true });
      } else {
        navigate("/app/verify-otp", { replace: true });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border bg-card p-8 shadow-brutal-lg">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Login</h1>
        <p className="mt-2 text-muted-foreground">Sign in to manage your resumes.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border bg-background px-4 py-3 outline-none focus:border-pop"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border bg-background px-4 py-3 outline-none focus:border-pop"
            />
          </label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="press w-full rounded-xl border bg-primary py-3 font-semibold text-primary-foreground shadow-brutal disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/app/signup" className="font-semibold text-foreground hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
