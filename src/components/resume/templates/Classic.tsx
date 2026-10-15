import type { ResumeContent } from "@/lib/resumeTypes";

type Props = { content: ResumeContent };

export function ClassicTemplate({ content }: Props) {
  const { contact } = content;
  return (
    <article className="space-y-4 text-sm leading-relaxed text-foreground">
      <header className="border-b pb-3 text-center">
        <h1 className="text-2xl font-bold">{contact.name || "Your name"}</h1>
        <p className="mt-1 text-muted-foreground">
          {[contact.email, contact.phone, contact.location].filter(Boolean).join(" · ")}
        </p>
      </header>
      {content.summary && (
        <section>
          <h2 className="mb-1 border-b text-xs font-bold uppercase tracking-wider">Summary</h2>
          <p>{content.summary}</p>
        </section>
      )}
      {content.experience.length > 0 && (
        <section>
          <h2 className="mb-2 border-b text-xs font-bold uppercase tracking-wider">Experience</h2>
          <ul className="space-y-3">
            {content.experience.map((exp, i) => (
              <li key={i}>
                <p className="font-semibold">
                  {exp.title}
                  {exp.company ? ` — ${exp.company}` : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {[exp.start, exp.end].filter(Boolean).join(" – ")}
                </p>
                {exp.bullets.length > 0 && (
                  <ul className="mt-1 list-disc pl-5">
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
        <section>
          <h2 className="mb-1 border-b text-xs font-bold uppercase tracking-wider">Skills</h2>
          <p>{content.skills.join(", ")}</p>
        </section>
      )}
    </article>
  );
}
