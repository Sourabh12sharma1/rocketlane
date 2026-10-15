import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import type { ResumeSummary } from "@/lib/resumeTypes";

export function ResumeList() {
  const [resumes, setResumes] = useState<ResumeSummary[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch("/resumes");
        if (!res.ok) {
          if (!cancelled) setError("Could not load resumes.");
          return;
        }
        const data = (await res.json()) as ResumeSummary[];
        if (!cancelled) setResumes(data);
      } catch {
        if (!cancelled) setError("Could not load resumes.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Your resumes</h1>
        <Link
          to="/app/resume/new"
          className="press rounded-xl border bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-brutal"
        >
          New resume
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {resumes === null && !error && (
        <p className="mt-8 text-muted-foreground">Loading…</p>
      )}

      {resumes !== null && resumes.length === 0 && (
        <p className="mt-8 text-muted-foreground">
          No resumes yet.{" "}
          <Link to="/app/resume/new" className="font-semibold text-foreground underline">
            Create one
          </Link>
          .
        </p>
      )}

      {resumes !== null && resumes.length > 0 && (
        <ul className="mt-8 space-y-3">
          {resumes.map((r) => (
            <li key={r.id}>
              <Link
                to={`/app/resume/${r.id}`}
                className="press flex flex-wrap items-center justify-between gap-2 rounded-2xl border bg-card px-5 py-4 shadow-brutal"
              >
                <span className="font-semibold">{r.title}</span>
                <span className="text-sm text-muted-foreground">
                  {r.template_id} · {new Date(r.updated_at).toLocaleDateString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
