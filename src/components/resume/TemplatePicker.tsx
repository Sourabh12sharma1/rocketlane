import type { TemplateId } from "@/lib/resumeTypes";

const TEMPLATES: { id: TemplateId; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
  { id: "compact", label: "Compact" },
];

type Props = {
  value: TemplateId;
  onChange: (id: TemplateId) => void;
};

export function TemplatePicker({ value, onChange }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {TEMPLATES.map((t) => {
        const selected = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(t.id)}
            className={`press rounded-2xl border p-6 text-left shadow-brutal transition-colors ${
              selected ? "bg-accent ring-2 ring-primary" : "bg-card hover:bg-muted"
            }`}
          >
            <span className="text-lg font-semibold">{t.label}</span>
            <p className="mt-2 text-sm text-muted-foreground">
              {t.id === "classic" && "Traditional single-column layout."}
              {t.id === "modern" && "Bold headings and accent color."}
              {t.id === "compact" && "Dense layout for one page."}
            </p>
          </button>
        );
      })}
    </div>
  );
}
