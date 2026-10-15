import type { ResumeContent } from "@/lib/resumeTypes";

type Props = { content: ResumeContent };

export function ModernTemplate({ content }: Props) {
  const { contact } = content;
  return (
    <article className="text-sm leading-relaxed">
      <header className="rounded-lg bg-primary/10 px-4 py-3">
        <h1 className="text-2xl font-bold text-primary">{contact.name || "Your name"}</h1>
        <p className="mt-1 text-muted-foreground">
          {[contact.location, contact.email, contact.phone].filter(Boolean).join(" · ")}
        </p>
      </header>
      {content.summary && (
        <section className="mt-4">
          <h2 className="text-sm font-bold text-primary">About</h2>
          <p className="mt-1">{content.summary}</p>
        </section>
      )}
      {content.experience.length > 0 && (
        <section className="mt-4">
          <h2 className="text-sm font-bold text-primary">Experience</h2>
          <ul className="mt-2 space-y-3">
            {content.experience.map((exp, i) => (
              <li key={i} className="border-l-2 border-primary pl-3">
                <p className="font-semibold">{exp.title}</p>
                <p className="text-xs text-muted-foreground">
                  {exp.company} · {[exp.start, exp.end].filter(Boolean).join(" – ")}
                </p>
                {exp.bullets.length > 0 && (
                  <ul className="mt-1 list-disc pl-4">
                    {exp.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      {content.skills.length > 0 && (
        <section className="mt-4">
          <h2 className="text-sm font-bold text-primary">Skills</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {content.skills.map((s, i) => (
              <span key={i} className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                {s}
              </span>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
