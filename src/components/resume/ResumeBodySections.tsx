import type { ReactNode } from "react";
import type { ResumeContent, ResumeLink } from "@/lib/resumeTypes";
import { formatSkill } from "@/lib/skillUtils";

export type SectionStyles = {
  sectionTitle: string;
  skillInline?: string;
  skillPill?: string;
  link?: string;
};

type Props = {
  content: ResumeContent;
  styles: SectionStyles;
  renderSkills?: (content: ResumeContent) => ReactNode;
};

function LinkList({ links, className }: { links: ResumeLink[]; className?: string }) {
  const visible = links.filter((l) => l.label || l.url);
  if (visible.length === 0) {
    return null;
  }
  return (
    <ul className={className ?? "mt-1 space-y-0.5"}>
      {visible.map((link, i) => (
        <li key={i}>
          {link.url ? (
            <a href={link.url} className="underline" target="_blank" rel="noreferrer">
              {link.label || link.url}
            </a>
          ) : (
            link.label
          )}
        </li>
      ))}
    </ul>
  );
}

export function ResumeBodySections({ content, styles, renderSkills }: Props) {
  const skillsNode =
    renderSkills?.(content) ??
    (content.skills.length > 0 ? (
      styles.skillPill ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {content.skills.map((s, i) => (
            <span key={i} className={styles.skillPill}>
              {formatSkill(s)}
            </span>
          ))}
        </div>
      ) : (
        <p className={styles.skillInline}>{content.skills.map(formatSkill).join(", ")}</p>
      )
    ) : null);

  return (
    <>
      {content.summary ? (
        <section>
          <h2 className={styles.sectionTitle}>Summary</h2>
          <p className="mt-1">{content.summary}</p>
        </section>
      ) : null}

      {content.experience.length > 0 ? (
        <section className="mt-4">
          <h2 className={styles.sectionTitle}>Experience</h2>
          <ul className="mt-2 space-y-3">
            {content.experience.map((exp, i) => (
              <li key={i}>
                <p className="font-semibold">
                  {exp.title}
                  {exp.company ? ` — ${exp.company}` : ""}
                </p>
                {(exp.start || exp.end) && (
                  <p className="text-xs text-muted-foreground">
                    {[exp.start, exp.end].filter(Boolean).join(" – ")}
                  </p>
                )}
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
      ) : null}

      {content.education.length > 0 ? (
        <section className="mt-4">
          <h2 className={styles.sectionTitle}>Education</h2>
          <ul className="mt-2 space-y-2">
            {content.education.map((ed, i) => (
              <li key={i}>
                <p className="font-semibold">
                  {ed.degree}
                  {ed.school ? ` — ${ed.school}` : ""}
                </p>
                {(ed.start || ed.end) && (
                  <p className="text-xs text-muted-foreground">
                    {[ed.start, ed.end].filter(Boolean).join(" – ")}
                  </p>
                )}
                {ed.details ? <p className="mt-0.5">{ed.details}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {content.skills.length > 0 ? (
        <section className="mt-4">
          <h2 className={styles.sectionTitle}>Skills</h2>
          {skillsNode}
        </section>
      ) : null}

      {content.projects.length > 0 ? (
        <section className="mt-4">
          <h2 className={styles.sectionTitle}>Projects</h2>
          <ul className="mt-2 space-y-2">
            {content.projects.map((proj, i) => (
              <li key={i}>
                <p className="font-semibold">
                  {proj.url ? (
                    <a href={proj.url} className="underline" target="_blank" rel="noreferrer">
                      {proj.name || proj.url}
                    </a>
                  ) : (
                    proj.name
                  )}
                </p>
                {proj.description ? <p className="mt-0.5">{proj.description}</p> : null}
                {proj.bullets.length > 0 && (
                  <ul className="mt-1 list-disc pl-5">
                    {proj.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {content.links.length > 0 ? (
        <section className="mt-4">
          <h2 className={styles.sectionTitle}>Links</h2>
          <LinkList links={content.links} className={styles.link} />
        </section>
      ) : null}

      {content.certifications.length > 0 ? (
        <section className="mt-4">
          <h2 className={styles.sectionTitle}>Certifications</h2>
          <ul className="mt-2 space-y-1">
            {content.certifications.map((cert, i) => (
              <li key={i}>
                {cert.name}
                {cert.issuer ? ` — ${cert.issuer}` : ""}
                {cert.date ? ` (${cert.date})` : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {content.languages.length > 0 ? (
        <section className="mt-4">
          <h2 className={styles.sectionTitle}>Languages</h2>
          <p className="mt-1">
            {content.languages
              .map((lang) =>
                lang.proficiency ? `${lang.name} (${lang.proficiency})` : lang.name,
              )
              .filter(Boolean)
              .join(", ")}
          </p>
        </section>
      ) : null}

      {content.custom.map((sec, i) =>
        sec.title || sec.body ? (
          <section key={i} className="mt-4">
            <h2 className={styles.sectionTitle}>{sec.title || "Additional"}</h2>
            {sec.body ? <p className="mt-1 whitespace-pre-wrap">{sec.body}</p> : null}
          </section>
        ) : null,
      )}
    </>
  );
}
