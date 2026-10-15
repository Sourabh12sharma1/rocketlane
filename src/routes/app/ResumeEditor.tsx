import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { TemplatePicker } from "@/components/resume/TemplatePicker";
import { ResumeForm } from "@/components/resume/ResumeForm";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { apiFetch } from "@/lib/api";
import { emptyContent, type ResumeContent, type ResumeRecord, type TemplateId } from "@/lib/resumeTypes";

export function ResumeEditor() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [templateId, setTemplateId] = useState<TemplateId>("classic");
  const [content, setContent] = useState<ResumeContent>(emptyContent());
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiFetch(`/resumes/${id}`);
        if (!res.ok) {
          if (!cancelled) setError("Could not load resume.");
          return;
        }
        const data = (await res.json()) as ResumeRecord;
        if (cancelled) return;
        setTitle(data.title);
        setTemplateId(data.template_id);
        setContent(data.content);
      } catch {
        if (!cancelled) setError("Could not load resume.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const save = useCallback(async () => {
    if (!id) return;
    setSaving(true);
    setSaveMessage("");
    setError("");
    try {
      const res = await apiFetch(`/resumes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          template_id: templateId,
          content,
        }),
      });
      if (!res.ok) {
        setError("Could not save resume.");
        return;
      }
      const data = (await res.json()) as ResumeRecord;
      setTitle(data.title);
      setTemplateId(data.template_id);
      setContent(data.content);
      setSaveMessage("Saved.");
    } catch {
      setError("Could not save resume.");
    } finally {
      setSaving(false);
    }
  }, [id, title, templateId, content]);

  if (loading) {
    return <p className="text-muted-foreground">Loading…</p>;
  }

  if (error && !title) {
    return (
      <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error}
      </p>
    );
  }

  return (
    <div>
      <Link to="/app/resume" className="text-sm font-medium text-muted-foreground hover:underline">
        ← Back to resumes
      </Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <input
          aria-label="Resume title"
          className="min-w-[12rem] flex-1 rounded-xl border bg-card px-4 py-2 text-2xl font-semibold shadow-brutal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="press rounded-xl border bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-brutal disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
      {saveMessage && <p className="mt-2 text-sm font-medium text-primary">{saveMessage}</p>}
      {error && (
        <p className="mt-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Template</h2>
        <div className="mt-3">
          <TemplatePicker value={templateId} onChange={setTemplateId} />
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold">Edit</h2>
          <ResumeForm content={content} onChange={setContent} />
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="mb-4 text-lg font-semibold">Preview</h2>
          <ResumePreview templateId={templateId} content={content} />
        </div>
      </div>
    </div>
  );
}
