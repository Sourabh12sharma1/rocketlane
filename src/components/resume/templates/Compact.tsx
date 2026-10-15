import type { ResumeContent } from "@/lib/resumeTypes";

type Props = { content: ResumeContent };

export function CompactTemplate({ content }: Props) {
  const { contact } = content;
  return (
    <article className="space-y-2 text-[11px] leading-snug">
      <header>
        <h1 className="text-base font-bold">{contact.name || "Your name"}</h1>
        <p className="text-muted-foreground">
          {[contact.email, contact.phone, contact.location].filter(Boolean).join(" | ")}
        </p>
      </header>
      {content.summary && (
        <section>
          <h2 className="font-bold uppercase">Summary</h2>
          <p>{content.summary}</p>
        </section>
      )}
      {content.experience.length > 0 && (
        <section>
          <h2 className="font-bold uppercase">Experience</h2>
          {content.experience.map((exp, i) => (
            <div key={i} className="mt-1">
              <p>
                <span className="font-semibold">{exp.title}</span>
                {exp.company ? `, ${exp.company}` : ""}
                {(exp.start || exp.end) && (
                  <span className="text-muted-foreground">
                    {" "}
                    ({[exp.start, exp.end].filter(Boolean).join("–")})
                  </span>
                )}
              </p>
              {exp.bullets.map((b, j) => (
                <p key={j} className="pl-2 before:content-['•_']">
                  {b}
                </p>
              ))}
            </div>
          ))}
        </section>
      )}
      {content.skills.length > 0 && (
        <section>
          <h2 className="font-bold uppercase">Skills</h2>
          <p>{content.skills.join(" · ")}</p>
        </section>
      )}
    </article>
  );
}
