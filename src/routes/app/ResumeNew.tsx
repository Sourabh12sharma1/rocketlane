import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TemplatePicker } from "@/components/resume/TemplatePicker";
import { apiFetch } from "@/lib/api";
import type { ResumeContent, ResumeRecord, TemplateId } from "@/lib/resumeTypes";

type ImportResponse = {
  content: ResumeContent;
  warnings: string[];
};

export function ResumeNew() {
  const navigate = useNavigate();
  const [templateId, setTemplateId] = useState<TemplateId>("classic");
  const [mode, setMode] = useState<"choose" | "import">("choose");
  const [pasteText, setPasteText] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function createBlank() {
    setError("");
    setBusy(true);
    try {
      const res = await apiFetch("/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_id: templateId }),
      });
      if (!res.ok) {
        setError("Could not create resume.");
        return;
      }
      const body = (await res.json()) as ResumeRecord;
      navigate(`/app/resume/${body.id}`, { replace: true });
    } catch {
      setError("Could not create resume.");
    } finally {
      setBusy(false);
    }
  }

  async function onImportSubmit(e: FormEvent) {
    e.preventDefault();
    if (!pasteText.trim() && !pdfFile) {
      setError("Paste resume text or choose a PDF.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const formData = new FormData();
      if (pasteText.trim()) formData.append("text", pasteText.trim());
      if (pdfFile) formData.append("file", pdfFile);

      const importRes = await apiFetch("/resumes/import", {
        method: "POST",
        body: formData,
      });
      if (!importRes.ok) {
        setError("Import failed. Check your file or text.");
        return;
      }
      const imported = (await importRes.json()) as ImportResponse;

      const createRes = await apiFetch("/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_id: templateId }),
      });
      if (!createRes.ok) {
        setError("Could not create resume.");
        return;
      }
      const created = (await createRes.json()) as ResumeRecord;

      const updateRes = await apiFetch(`/resumes/${created.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: imported.content }),
      });
      if (!updateRes.ok) {
        setError("Resume created but content could not be saved.");
        return;
      }

      navigate(`/app/resume/${created.id}`, { replace: true });
    } catch {
      setError("Import failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <Link to="/app/resume" className="text-sm font-medium text-muted-foreground hover:underline">
        ← Back to resumes
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">New resume</h1>
      <p className="mt-2 text-muted-foreground">Pick a template, then start blank or import.</p>

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Template
        </h2>
        <div className="mt-3">
          <TemplatePicker value={templateId} onChange={setTemplateId} />
        </div>
      </div>

      {mode === "choose" && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void createBlank()}
            className="press rounded-2xl border bg-primary p-6 text-left font-semibold text-primary-foreground shadow-brutal disabled:opacity-60"
          >
            Fill blank
            <p className="mt-2 text-sm font-normal opacity-80">
              Empty sections you fill in the editor.
            </p>
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setMode("import")}
            className="press rounded-2xl border bg-card p-6 text-left font-semibold shadow-brutal disabled:opacity-60"
          >
            Upload / paste
            <p className="mt-2 text-sm font-normal text-muted-foreground">
              PDF or pasted text—we parse what we can.
            </p>
          </button>
        </div>
      )}

      {mode === "import" && (
        <form onSubmit={onImportSubmit} className="mt-10 space-y-6">
          <div>
            <label className="text-sm font-semibold" htmlFor="resume-pdf">
              PDF (optional)
            </label>
            <input
              id="resume-pdf"
              type="file"
              accept="application/pdf,.pdf"
              className="mt-2 block w-full rounded-xl border bg-card px-4 py-3 text-sm shadow-brutal"
              onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor="resume-paste">
              Paste text (optional)
            </label>
            <textarea
              id="resume-paste"
              rows={8}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste your resume text here…"
              className="mt-2 w-full rounded-xl border bg-card px-4 py-3 text-sm shadow-brutal"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={busy}
              className="press rounded-xl border bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-brutal disabled:opacity-60"
            >
              {busy ? "Importing…" : "Import and open editor"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setMode("choose")}
              className="press rounded-xl border bg-card px-6 py-3 font-semibold shadow-brutal"
            >
              Back
            </button>
          </div>
        </form>
      )}

      {error && (
        <p className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
