import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { useAuth, type AuthUser } from "@/lib/auth";

type AuthResponse = {
  access_token: string;
  user: AuthUser;
};

export function Signup() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await apiFetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, phone }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { detail?: string };
        setError(body.detail ?? "Registration failed");
        return;
      }
      const body = (await res.json()) as AuthResponse;
      setSession(body.access_token, body.user);
      navigate("/app/verify-otp", { replace: true });
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border bg-card p-8 shadow-brutal-lg">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Sign up</h1>
        <p className="mt-2 text-muted-foreground">Create an account to build resumes.</p>
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
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border bg-background px-4 py-3 outline-none focus:border-pop"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Phone</span>
            <input
              type="tel"
              required
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+15551234567"
              className="mt-2 w-full rounded-xl border bg-background px-4 py-3 outline-none focus:border-pop"
            />
          </label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="press w-full rounded-xl border bg-accent py-3 font-semibold shadow-brutal disabled:opacity-60"
          >
            {busy ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/app/login" className="font-semibold text-foreground hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
