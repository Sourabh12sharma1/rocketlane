import type { ResumeContent } from "@/lib/resumeTypes";
import { ResumeBodySections } from "@/components/resume/ResumeBodySections";
import { formatSkill } from "@/lib/skillUtils";

type Props = { content: ResumeContent };

export function CompactTemplate({ content }: Props) {
  const { contact } = content;
  const contactLinks = contact.links.filter((l) => l.label || l.url);
  return (
    <article className="space-y-2 text-[11px] leading-snug">
      <header>
        <h1 className="text-base font-bold">{contact.name || "Your name"}</h1>
        <p className="text-muted-foreground">
          {[contact.email, contact.phone, contact.location].filter(Boolean).join(" | ")}
        </p>
        {contactLinks.length > 0 && (
          <p className="text-muted-foreground">
            {contactLinks.map((link, i) => (
              <span key={i}>
                {i > 0 ? " | " : ""}
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
          sectionTitle: "font-bold uppercase",
          skillInline: "mt-0.5",
        }}
        renderSkills={(c) =>
          c.skills.length > 0 ? (
            <p className="mt-0.5">{c.skills.map(formatSkill).join(" · ")}</p>
          ) : null
        }
      />
    </article>
  );
}
