import { type FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export function VerifyOtp() {
  const navigate = useNavigate();
  const { token, user, setSession } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [requestBusy, setRequestBusy] = useState(false);
  const [verifyBusy, setVerifyBusy] = useState(false);

  if (!token) {
    return <Navigate to="/app/login" replace />;
  }

  async function requestOtp() {
    setError("");
    setInfo("");
    setRequestBusy(true);
    try {
      const res = await apiFetch("/auth/otp/request", { method: "POST" });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { detail?: string };
        setError(body.detail ?? "Could not send code");
        return;
      }
      setInfo("Code sent — check server logs in dev.");
    } finally {
      setRequestBusy(false);
    }
  }

  async function onVerify(e: FormEvent) {
    e.preventDefault();
    setError("");
    setVerifyBusy(true);
    try {
      const res = await apiFetch("/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { detail?: string };
        setError(body.detail ?? "Invalid code");
        return;
      }
      if (user) {
        setSession(token, { ...user, phone_verified: true });
      }
      navigate("/app/resume", { replace: true });
    } finally {
      setVerifyBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border bg-card p-8 shadow-brutal-lg">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Verify OTP</h1>
        <p className="mt-2 text-muted-foreground">
          Confirm your phone number before editing resumes.
        </p>
        <button
          type="button"
          disabled={requestBusy}
          onClick={() => void requestOtp()}
          className="press mt-6 w-full rounded-xl border bg-background py-3 font-semibold shadow-brutal disabled:opacity-60"
        >
          {requestBusy ? "Sending…" : "Send verification code"}
        </button>
        <form onSubmit={onVerify} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold">6-digit code</span>
            <input
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="mt-2 w-full rounded-xl border bg-background px-4 py-3 tracking-widest outline-none focus:border-pop"
            />
          </label>
          {info ? <p className="text-sm text-muted-foreground">{info}</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <button
            type="submit"
            disabled={verifyBusy}
            className="press w-full rounded-xl border bg-accent py-3 font-semibold shadow-brutal disabled:opacity-60"
          >
            {verifyBusy ? "Verifying…" : "Verify and continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
