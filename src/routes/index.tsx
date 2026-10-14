import { useEffect, useState } from "react";
import { MotionBackground } from "@/components/MotionBackground";
import { PlanSignup, type PlanSummary } from "@/components/PlanSignup";

const roles = [
  "Founding Engineer",
  "AI Engineer",
  "Product Designer",
  "Full Stack",
  "Backend",
  "Platform",
  "Data",
  "Infra",
  "iOS",
  "ML",
  "Research",
  "DevRel",
];
const words = ["busywork", "the spreadsheet", "the guessing", "the silence"];

const steps = [
  {
    n: "01",
    t: "Find",
    d: "Open roles at companies still small enough that a person reads your email.",
    c: "bg-accent",
  },
  {
    n: "02",
    t: "Watch",
    d: "Your application mail moves the cards. Nothing to log by hand.",
    c: "bg-card",
  },
  {
    n: "03",
    t: "Reach",
    d: "Founder emails drafted from your resume, sent only once you approve.",
    c: "bg-card",
  },
  {
    n: "04",
    t: "Show up",
    d: "A portfolio that answers the questions you keep repeating on calls.",
    c: "bg-pop text-pop-foreground",
  },
];

const board = [
  { col: "Sent", items: ["Series B fintech", "AI infra", "Design tools"] },
  { col: "Replied", items: ["Logistics", "Climate"] },
  { col: "Scheduled", items: ["Dev tools"] },
];

const plans = [
  {
    name: "Starter",
    old: 0,
    price: 0,
    off: "",
    credits: "50",
    hot: false,
  },
  {
    name: "Pro",
    old: 19,
    price: 14,
    off: "Launch price",
    credits: "Unlimited",
    hot: true,
  },
];

const problems = [
  {
    q: "The good roles never get posted.",
    a: "By the time a board lists them, the role is filled or the inbox is a wall.",
  },
  {
    q: "Tracking is its own job.",
    a: "Eleven tabs, one spreadsheet, and no idea which applications went quiet.",
  },
  {
    q: "Cold outreach is a numbers game you lose.",
    a: "One template to three hundred people gets nothing. Ten written properly gets three replies.",
  },
];

export function Home() {
  const [i, setI] = useState(0);
  const [plan, setPlan] = useState<PlanSummary | null>(null);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % words.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="#" className="font-display text-2xl font-semibold tracking-tight">
            rocketlane<span className="text-pop">.</span>
          </a>
          <div className="hidden gap-8 text-sm font-medium md:flex">
            {["How it works", "Plans", "Why"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(/\s+/g, "-")}`}
                className="hover:underline underline-offset-4 decoration-2"
              >
                {l}
              </a>
            ))}
          </div>
          <a
            href="#plans"
            className="press rounded-full border bg-accent px-5 py-2 text-sm font-semibold shadow-brutal"
          >
            Start free
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <MotionBackground />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-[1.2fr_1fr] md:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              <span className="h-2 w-2 animate-pulse rounded-full bg-pop" /> Career copilot
            </span>
            <h1 className="mt-6 text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
              The job search,
              <br />
              minus{" "}
              <span
                key={i}
                className="animate-in fade-in slide-in-from-bottom-4 inline-block rounded-xl border bg-accent px-3 shadow-brutal"
              >
                {words[i]}
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Rocketlane finds the roles, watches your inbox, and puts your profile in front of
              the people doing the hiring.{" "}
              <b className="text-foreground">You keep the interviews.</b>
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => setPlan({ name: "Starter", price: 0, credits: "50" })}
                className="press rounded-xl border bg-primary px-7 py-4 font-semibold text-primary-foreground shadow-brutal"
              >
                Start with one search
              </button>
              <a
                href="#how-it-works"
                className="press rounded-xl border bg-card px-7 py-4 font-semibold shadow-brutal"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Floating board */}
          <div className="relative">
            <div
              className="animate-float rounded-2xl border bg-card p-5 shadow-brutal-lg"
              style={{ ["--r" as string]: "1deg" }}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-display font-semibold">Your search</span>
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold">
                  reading your mail
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {board.map((b) => (
                  <div key={b.col} className="rounded-xl bg-muted p-2">
                    <p className="mb-2 text-[11px] font-semibold uppercase text-muted-foreground">
                      {b.col}
                    </p>
                    {b.items.map((it) => (
                      <div
                        key={it}
                        className="mb-2 rounded-lg border bg-card px-2 py-2 text-xs font-semibold"
                      >
                        {it}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 rounded-xl border bg-pop px-4 py-2 text-sm font-semibold text-pop-foreground shadow-brutal">
              3 follow-ups this morning
            </div>
            <div className="absolute -right-3 -top-5 rounded-full border bg-accent px-3 py-1 text-xs font-semibold shadow-brutal">
              89% fit
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden border-b bg-primary py-4 text-primary-foreground">
        <div className="flex w-max animate-marquee gap-8 font-display text-xl font-semibold">
          {[...roles, ...roles].map((r, k) => (
            <span key={k} className="flex items-center gap-8">
              {r}
              <span className="text-accent">&#10022;</span>
            </span>
          ))}
        </div>
      </div>

      {/* Steps */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-5 py-24">
        <p className="text-sm font-semibold uppercase tracking-widest text-pop">How it works</p>
        <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
          Four things you stop doing yourself.
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className={`press rounded-2xl border p-6 shadow-brutal ${s.c}`}>
              <span className="font-display text-4xl font-semibold opacity-30">{s.n}</span>
              <h3 className="mt-6 text-2xl font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm opacity-80">{s.d}</p>
            </div>
          ))}
        </div>

        {/* Bento */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-card p-8 shadow-brutal md:col-span-2">
            <span className="rounded-full border px-3 py-1 text-xs font-semibold">
              yourname.dev
            </span>
            <h3 className="mt-6 text-3xl font-semibold">Your resume, as a site.</h3>
            <p className="mt-2 max-w-md text-muted-foreground">
              Drop in a resume and a repo. You get a live page with an assistant trained on your
              own work &mdash; no template to fight, nothing to deploy.
            </p>
          </div>
          <div className="flex flex-col justify-between rounded-2xl border bg-accent p-8 shadow-brutal">
            <span className="font-display text-6xl font-semibold tracking-tight">2,400</span>
            <p className="font-semibold">startups, checked every night for new roles.</p>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="border-y bg-muted">
        <div className="mx-auto max-w-6xl px-5 py-24 text-center">
          <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Two plans. One is free.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every plan reads your application mail and keeps the board current.
          </p>
          <div className="mx-auto mt-12 grid max-w-3xl gap-8 md:grid-cols-2">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-2xl border p-8 text-left shadow-brutal-lg ${
                  p.hot ? "bg-primary text-primary-foreground" : "bg-card"
                }`}
              >
                {p.off && (
                  <span className="absolute -top-4 right-6 rounded-full border bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                    {p.off}
                  </span>
                )}
                <h3 className="text-xl font-semibold">{p.name}</h3>
                <div className="mt-4 flex items-end gap-2">
                  <span className="font-display text-5xl font-semibold">${p.price}</span>
                  {p.old > 0 && <span className="pb-1 line-through opacity-50">${p.old}</span>}
                  <span className="pb-1 opacity-70">/mo</span>
                </div>
                <span className="mt-2 inline-block rounded bg-pop px-2 text-xs font-semibold text-pop-foreground">
                  {p.credits} outreach credits
                </span>
                <ul className="mt-6 space-y-2 text-sm">
                  {(p.hot
                    ? [
                        "Every open role, unfiltered",
                        "Unlimited outreach drafts",
                        "Portfolio on your own domain",
                        "Weekly digest of what changed",
                        "Priority indexing for new roles",
                        "Everything in Starter",
                      ]
                    : [
                        "Roles across all 2,400 startups",
                        "50 outreach credits a month",
                        "Automatic application tracking",
                        "Portfolio on a shared domain",
                        "Email digest, weekly",
                      ]
                  ).map((f) => (
                    <li key={f}>&#10003; {f}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setPlan({ name: p.name, price: p.price, credits: p.credits })}
                  className={`press mt-8 w-full rounded-xl border py-3 font-semibold shadow-brutal ${
                    p.hot ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"
                  }`}
                >
                  {p.hot ? "Start Pro" : "Start free"}
                </button>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Cancel any time. Your portfolio stays up either way.
          </p>
        </div>
      </section>

      {/* Why */}
      <section id="why" className="mx-auto max-w-6xl px-5 py-24">
        <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
          Three things this exists to fix.
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {problems.map((r) => (
            <figure key={r.q} className="press rounded-2xl border bg-card p-6 shadow-brutal">
              <blockquote className="text-lg font-medium">{r.q}</blockquote>
              <figcaption className="mt-4 text-sm text-muted-foreground">{r.a}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-24">
        <div className="mx-auto max-w-6xl rounded-3xl border bg-accent p-12 text-center shadow-brutal-lg md:p-20">
          <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">
            Run one search tonight.
          </h2>
          <p className="mx-auto mt-4 max-w-md font-medium opacity-80">
            Free plan, no card. If it doesn't find anything worth applying to, close the tab.
          </p>
          <a
            href="#plans"
            className="press mt-8 inline-block rounded-xl border bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-brutal"
          >
            Create a free account
          </a>
        </div>
      </section>

      <PlanSignup plan={plan} onClose={() => setPlan(null)} />

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        &copy; 2026 rocketlane &middot; an independent project
      </footer>
    </div>
  );
}
