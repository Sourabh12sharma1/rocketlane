import type { ResumeContent } from "@/lib/resumeTypes";
import { ResumeBodySections } from "@/components/resume/ResumeBodySections";

type Props = { content: ResumeContent };

export function ModernTemplate({ content }: Props) {
  const { contact } = content;
  const contactLinks = contact.links.filter((l) => l.label || l.url);
  return (
    <article className="text-sm leading-relaxed">
      <header className="rounded-lg bg-primary/10 px-4 py-3">
        <h1 className="text-2xl font-bold text-primary">{contact.name || "Your name"}</h1>
        <p className="mt-1 text-muted-foreground">
          {[contact.location, contact.email, contact.phone].filter(Boolean).join(" · ")}
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
          sectionTitle: "text-sm font-bold text-primary",
          skillPill: "rounded-full bg-muted px-2 py-0.5 text-xs font-medium",
        }}
      />
    </article>
  );
}
