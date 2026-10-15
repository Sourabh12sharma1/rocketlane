import type { ResumeContent } from "@/lib/resumeTypes";
import { ResumeBodySections } from "@/components/resume/ResumeBodySections";
import { formatSkill } from "@/lib/skillUtils";

type Props = { content: ResumeContent };

export function ClassicTemplate({ content }: Props) {
  const { contact } = content;
  const contactLinks = contact.links.filter((l) => l.label || l.url);
  return (
    <article className="space-y-4 text-sm leading-relaxed text-foreground">
      <header className="border-b pb-3 text-center">
        <h1 className="text-2xl font-bold">{contact.name || "Your name"}</h1>
        <p className="mt-1 text-muted-foreground">
          {[contact.email, contact.phone, contact.location].filter(Boolean).join(" · ")}
        </p>
        {contactLinks.length > 0 && (
          <p className="mt-1 text-muted-foreground">
            {contactLinks.map((link, i) => (
              <span key={i}>
                {i > 0 ? " · " : ""}
                {link.url ? (
                  <a href={link.url} className="underline" target="_blank" rel="noreferrer">
                    {link.label || link.url}
                  </a>
                ) : (
                  link.label
                )}
              </span>
            ))}
          </p>
        )}
      </header>
      <ResumeBodySections
        content={content}
        styles={{
          sectionTitle: "mb-1 border-b text-xs font-bold uppercase tracking-wider",
          skillInline: "mt-1",
        }}
        renderSkills={(c) =>
          c.skills.length > 0 ? (
            <p className="mt-1">{c.skills.map(formatSkill).join(", ")}</p>
          ) : null
        }
      />
    </article>
  );
}
