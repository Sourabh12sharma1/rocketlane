import { useEffect, useState } from "react";
import { MotionBackground } from "@/components/MotionBackground";

const roles = [
  "AI Engineer",
  "Full Stack Dev",
  "Frontend Engineer",
  "Product Designer",
  "Backend Engineer",
  "DevOps",
  "Data Scientist",
  "Cloud Architect",
  "iOS Dev",
  "ML Engineer",
  "UX Researcher",
];
const words = ["autopilot", "cruise mode", "easy mode", "fast-forward"];

const steps = [
  { n: "01", t: "Search", d: "Roles from 10,000+ startups, scored against your resume and GitHub.", c: "bg-accent" },
  { n: "02", t: "Track", d: "We scan Gmail daily and move cards to Applied, Interview, Offer or Rejected.", c: "bg-card" },
  { n: "03", t: "Chat", d: "Ask the career assistant about roles, your resume and what's next.", c: "bg-card" },
  { n: "04", t: "Cold email", d: "The agent drafts founder emails and sends them from your Gmail once you approve.", c: "bg-pop text-pop-foreground" },
];

const board = [
  { col: "Applied", items: ["Linear", "Vercel", "Razorpay"] },
  { col: "Interview", items: ["Notion", "Zepto"] },
  { col: "Offer", items: ["Cred"] },
];

const plans = [
  { name: "Basic", old: 10, price: 5, off: "50% OFF", credits: "500", hot: false },
  { name: "Pro", old: 20, price: 8, off: "60% OFF", credits: "1,500", hot: true },
];

const reviews = [
  { q: "Crazy UI and instantly fast, loved the portfolio from resume. It has a chatbot too .", a: "Ankith", r: "-2deg" },
  { q: "Pretty good \u2014 I don't have to manually track all my applied jobs anymore.", a: "Sanju", r: "1.5deg" },
  { q: "Portfolio looks clean, man. Recruiters actually opened it.", a: "Santhosh", r: "-1deg" },
];

export function Home() {
  const [i, setI] = useState(0);
  const [count, setCount] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % words.length), 2200);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (count >= 739) return;
    const t = setTimeout(() => setCount((c) => Math.min(739, c + 13)), 16);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="#" className="font-display text-2xl font-semibold tracking-tight">
            rocketlane<span className="text-pop">.</span>
          </a>
          <div className="hidden gap-8 text-sm font-medium md:flex">
            {["Features", "Pricing", "Reviews"].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className="hover:underline underline-offset-4 decoration-2">
                {l}
              </a>
            ))}
          </div>
          <a href="#pricing" className="press rounded-full border bg-accent px-5 py-2 text-sm font-semibold shadow-brutal">
            Get started
          </a>
        </nav>
      </header>

      <section className="relative overflow-hidden border-b">
        <MotionBackground />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-[1.2fr_1fr] md:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              <span className="h-2 w-2 animate-pulse rounded-full bg-pop" /> AI career platform
            </span>
            <h1 className="mt-6 text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
              Your job hunt,
              <br />
              on{" "}
              <span
                key={i}
                className="animate-in fade-in slide-in-from-bottom-4 inline-block rounded-xl border bg-accent px-3 shadow-brutal"
              >
                {words[i]}
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Rocketlane finds jobs, <b className="text-foreground">cold emails founders</b>, tracks every
              application and builds your resume and portfolio. You just show up to interviews.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#pricing" className="press rounded-xl border bg-primary px-7 py-4 font-semibold text-primary-foreground shadow-brutal">
                Start for $5/mo
              </a>
              <a href="#features" className="press rounded-xl border bg-card px-7 py-4 font-semibold shadow-brutal">
                See how it works
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="animate-float rounded-2xl border bg-card p-5 shadow-brutal-lg" style={{ ["--r" as string]: "1deg" }}>
              <div className="mb-4 flex items-center justify-between">
                <span className="font-display font-semibold">Your board</span>
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold">synced w/ Gmail</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {board.map((b) => (
                  <div key={b.col} className="rounded-xl bg-muted p-2">
                    <p className="mb-2 text-[11px] font-semibold uppercase text-muted-foreground">{b.col}</p>
                    {b.items.map((it) => (
                      <div key={it} className="mb-2 rounded-lg border bg-card px-2 py-2 text-xs font-semibold">
                        {it}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 rounded-xl border bg-pop px-4 py-2 text-sm font-semibold text-pop-foreground shadow-brutal">
              12 founders emailed today
            </div>
            <div className="absolute -right-3 -top-5 rounded-full border bg-accent px-3 py-1 text-xs font-semibold shadow-brutal">
              94% match
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-b bg-primary py-4 text-primary-foreground">
        <div className="flex w-max animate-marquee gap-8 font-display text-xl font-semibold">
          {[...roles, ...roles].map((r, k) => (
            <span key={k} className="flex items-center gap-8">
              {r}
              <span className="text-accent">\u2726</span>
            </span>
          ))}
        </div>
      </div>

      <section id="features" className="mx-auto max-w-6xl px-5 py-24">
        <p className="text-sm font-semibold uppercase tracking-widest text-pop">How it works</p>
        <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
          Search, track, chat & cold email founders.
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

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-card p-8 shadow-brutal md:col-span-2">
            <span className="rounded-full border px-3 py-1 text-xs font-semibold">portfolio.dev</span>
            <h3 className="mt-6 text-3xl font-semibold">Resume \u2192 portfolio. Zero code.</h3>
            <p className="mt-2 max-w-md text-muted-foreground">
              Drop in your resume and GitHub. Get a portfolio site with a built-in chatbot that answers
              recruiters for you.
            </p>
          </div>
          <div className="flex flex-col justify-between rounded-2xl border bg-accent p-8 shadow-brutal">
            <span className="font-display text-6xl font-semibold tracking-tight">10k+</span>
            <p className="font-semibold">startups in one place, refreshed daily.</p>
          </div>
        </div>
      </section>

      <section id="pricing" className="border-y bg-muted">
        <div className="mx-auto max-w-6xl px-5 py-24 text-center">
          <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">Simple pricing. Transparent.</h2>
          <p className="mt-4 text-muted-foreground">
            Rocketlane users landed{" "}
            <span className="rounded-md bg-pop px-2 font-display font-semibold text-pop-foreground">{count}</span>{" "}
            interviews in the last 9 days.
          </p>
          <div className="mx-auto mt-12 grid max-w-3xl gap-8 md:grid-cols-2">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-2xl border p-8 text-left shadow-brutal-lg ${
                  p.hot ? "bg-primary text-primary-foreground" : "bg-card"
                }`}
              >
                {p.hot && (
                  <span className="absolute -top-4 right-6 rounded-full border bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                    Limited offer
                  </span>
                )}
                <h3 className="text-xl font-semibold">{p.name}</h3>
                <div className="mt-4 flex items-end gap-2">
                  <span className="font-display text-5xl font-semibold">${p.price}</span>
                  <span className="pb-1 line-through opacity-50">${p.old}</span>
                  <span className="pb-1 opacity-70">/mo</span>
                </div>
                <span className="mt-2 inline-block rounded bg-pop px-2 text-xs font-semibold text-pop-foreground">
                  {p.off}
                </span>
                <ul className="mt-6 space-y-2 text-sm">
                  {[
                    "10,000+ actively hiring startups",
                    `${p.credits} AI credits / month`,
                    "Auto Gmail tracking",
                    "Resume + portfolio builder",
                    "Portfolio chatbot",
                    "Cold email founders",
                  ].map((f) => (
                    <li key={f}>\u2713 {f}</li>
                  ))}
                </ul>
                <button
                  className={`press mt-8 w-full rounded-xl border py-3 font-semibold shadow-brutal ${
                    p.hot ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"
                  }`}
                >
                  Get started
                </button>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">Billed annually \u00b7 2 months free</p>
        </div>
      </section>

      <section id="reviews" className="mx-auto max-w-6xl px-5 py-24">
        <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">Trusted by early-career talent.</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {reviews.map((r) => (
            <figure key={r.a} className="press rounded-2xl border bg-card p-6 shadow-brutal">
              <blockquote className="text-lg font-medium">"{r.q}"</blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-muted-foreground">\u2014 {r.a}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="px-5 pb-24">
        <div className="mx-auto max-w-6xl rounded-3xl border bg-accent p-12 text-center shadow-brutal-lg md:p-20">
          <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">
            Stop applying. Start getting replies.
          </h2>
          <a href="#pricing" className="press mt-8 inline-block rounded-xl border bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-brutal">
            Get started
          </a>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        \u00a9 2026 rocketlane \u00b7 built for ambitious careers
      </footer>
    </div>
  );
}
