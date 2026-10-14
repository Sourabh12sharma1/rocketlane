import { useEffect, useRef, useState } from "react";

export interface PlanSummary {
  name: string;
  price: number;
  credits: string;
}

/**
 * Email capture for a selected plan. There is no backend yet, so submit only
 * sets local state — the on-screen note says so rather than faking success.
 */
export function PlanSignup({
  plan,
  onClose,
}: {
  plan: PlanSummary | null;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!plan) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    inputRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [plan, onClose]);

  useEffect(() => {
    if (!plan) {
      setEmail("");
      setSaved(false);
    }
  }, [plan]);

  if (!plan) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 p-5 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Start ${plan.name}`}
    >
      <div
        className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-brutal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {saved ? (
          <>
            <h2 className="font-display text-3xl font-semibold">You&rsquo;re on the list.</h2>
            <p className="mt-3 text-muted-foreground">
              We&rsquo;ll email <b className="text-foreground">{email}</b> when the{" "}
              {plan.name} plan opens.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="press mt-8 w-full rounded-xl border bg-primary py-3 font-semibold text-primary-foreground shadow-brutal"
            >
              Done
            </button>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSaved(true);
            }}
          >
            <h2 className="font-display text-3xl font-semibold">
              Start {plan.name}
            </h2>
            <p className="mt-2 text-muted-foreground">
              ${plan.price}/mo &middot; {plan.credits} outreach credits
            </p>
            <label className="mt-6 block">
              <span className="text-sm font-semibold">Email</span>
              <input
                ref={inputRef}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="mt-2 w-full rounded-xl border bg-background px-4 py-3 outline-none focus:border-pop"
              />
            </label>
            <button
              type="submit"
              className="press mt-6 w-full rounded-xl border bg-accent py-3 font-semibold shadow-brutal"
            >
              Continue
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Demo &mdash; nothing is sent yet.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
