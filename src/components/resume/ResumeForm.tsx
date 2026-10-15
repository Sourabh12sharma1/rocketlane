import type { ReactNode } from "react";
import type {
  ResumeCertification,
  ResumeContent,
  ResumeCustomSection,
  ResumeEducation,
  ResumeExperience,
  ResumeLanguage,
  ResumeProject,
} from "@/lib/resumeTypes";

type Props = {
  content: ResumeContent;
  onChange: (content: ResumeContent) => void;
};

const inputClass =
  "mt-1 w-full rounded-xl border bg-card px-3 py-2 text-sm shadow-brutal";
const labelClass = "text-sm font-semibold";

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h2>
  );
}

export function ResumeForm({ content, onChange }: Props) {
  function patch(partial: Partial<ResumeContent>) {
    onChange({ ...content, ...partial });
  }

  function patchContact(field: keyof ResumeContent["contact"], value: string) {
    onChange({ ...content, contact: { ...content.contact, [field]: value } });
  }

  function updateExperience(index: number, exp: ResumeExperience) {
    const experience = [...content.experience];
    experience[index] = exp;
    patch({ experience });
  }

  function addExperience() {
    patch({
      experience: [
        ...content.experience,
        { company: "", title: "", start: "", end: "", bullets: [""] },
      ],
    });
  }

  function removeExperience(index: number) {
    patch({ experience: content.experience.filter((_, i) => i !== index) });
  }

  function updateEducation(index: number, ed: ResumeEducation) {
    const education = [...content.education];
    education[index] = ed;
    patch({ education });
  }

  function addEducation() {
    patch({
      education: [
        ...content.education,
        { school: "", degree: "", start: "", end: "", details: "" },
      ],
    });
  }

  function removeEducation(index: number) {
    patch({ education: content.education.filter((_, i) => i !== index) });
  }

  function updateProject(index: number, proj: ResumeProject) {
    const projects = [...content.projects];
    projects[index] = proj;
    patch({ projects });
  }

  function addProject() {
    patch({
      projects: [
        ...content.projects,
        { name: "", url: "", description: "", bullets: [""] },
      ],
    });
  }

  function removeProject(index: number) {
    patch({ projects: content.projects.filter((_, i) => i !== index) });
  }

  function updateCert(index: number, cert: ResumeCertification) {
    const certifications = [...content.certifications];
    certifications[index] = cert;
    patch({ certifications });
  }

  function addCert() {
    patch({
      certifications: [...content.certifications, { name: "", issuer: "", date: "" }],
    });
  }

  function removeCert(index: number) {
    patch({ certifications: content.certifications.filter((_, i) => i !== index) });
  }

  function updateLanguage(index: number, lang: ResumeLanguage) {
    const languages = [...content.languages];
    languages[index] = lang;
    patch({ languages });
  }

  function addLanguage() {
    patch({ languages: [...content.languages, { name: "", proficiency: "" }] });
  }

  function removeLanguage(index: number) {
    patch({ languages: content.languages.filter((_, i) => i !== index) });
  }

  function updateCustom(index: number, section: ResumeCustomSection) {
    const custom = [...content.custom];
    custom[index] = section;
    patch({ custom });
  }

  function addCustom() {
    patch({ custom: [...content.custom, { title: "", body: "" }] });
  }

  function removeCustom(index: number) {
    patch({ custom: content.custom.filter((_, i) => i !== index) });
  }

  const skillsText = content.skills.join(", ");

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <SectionTitle>Contact</SectionTitle>
        <div>
          <label className={labelClass} htmlFor="contact-name">
            Full name
          </label>
          <input
            id="contact-name"
            className={inputClass}
            value={content.contact.name}
            onChange={(e) => patchContact("name", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="contact-email">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            className={inputClass}
            value={content.contact.email}
            onChange={(e) => patchContact("email", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="contact-phone">
            Phone
          </label>
          <input
            id="contact-phone"
            className={inputClass}
            value={content.contact.phone}
            onChange={(e) => patchContact("phone", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="contact-location">
            Location
          </label>
          <input
            id="contact-location"
            className={inputClass}
            value={content.contact.location}
            onChange={(e) => patchContact("location", e.target.value)}
          />
        </div>
      </section>

      <section className="space-y-3">
        <SectionTitle>Summary</SectionTitle>
        <div>
          <label className={labelClass} htmlFor="resume-summary">
            Summary
          </label>
          <textarea
            id="resume-summary"
            rows={4}
            className={inputClass}
            value={content.summary}
            onChange={(e) => patch({ summary: e.target.value })}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <SectionTitle>Experience</SectionTitle>
          <button
            type="button"
            onClick={addExperience}
            className="text-xs font-semibold underline"
          >
            Add role
          </button>
        </div>
        {content.experience.map((exp, i) => (
          <div key={i} className="space-y-2 rounded-xl border bg-muted/30 p-3">
            <input
              placeholder="Job title"
              className={inputClass}
              value={exp.title}
              onChange={(e) => updateExperience(i, { ...exp, title: e.target.value })}
            />
            <input
              placeholder="Company"
              className={inputClass}
              value={exp.company}
              onChange={(e) => updateExperience(i, { ...exp, company: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Start"
                className={inputClass}
                value={exp.start}
                onChange={(e) => updateExperience(i, { ...exp, start: e.target.value })}
              />
              <input
                placeholder="End"
                className={inputClass}
                value={exp.end}
                onChange={(e) => updateExperience(i, { ...exp, end: e.target.value })}
              />
            </div>
            <textarea
              placeholder="Bullets (one per line)"
              rows={3}
              className={inputClass}
              value={exp.bullets.join("\n")}
              onChange={(e) =>
                updateExperience(i, {
                  ...exp,
                  bullets: e.target.value.split("\n").filter((l) => l.length > 0),
                })
              }
            />
            <button type="button" onClick={() => removeExperience(i)} className="text-xs text-destructive">
              Remove
            </button>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <SectionTitle>Education</SectionTitle>
          <button type="button" onClick={addEducation} className="text-xs font-semibold underline">
            Add school
          </button>
        </div>
        {content.education.map((ed, i) => (
          <div key={i} className="space-y-2 rounded-xl border bg-muted/30 p-3">
            <input
              placeholder="School"
              className={inputClass}
              value={ed.school}
              onChange={(e) => updateEducation(i, { ...ed, school: e.target.value })}
            />
            <input
              placeholder="Degree"
              className={inputClass}
              value={ed.degree}
              onChange={(e) => updateEducation(i, { ...ed, degree: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Start"
                className={inputClass}
                value={ed.start}
                onChange={(e) => updateEducation(i, { ...ed, start: e.target.value })}
              />
              <input
                placeholder="End"
                className={inputClass}
                value={ed.end}
                onChange={(e) => updateEducation(i, { ...ed, end: e.target.value })}
              />
            </div>
            <input
              placeholder="Details"
              className={inputClass}
              value={ed.details}
              onChange={(e) => updateEducation(i, { ...ed, details: e.target.value })}
            />
            <button type="button" onClick={() => removeEducation(i)} className="text-xs text-destructive">
              Remove
            </button>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <SectionTitle>Skills</SectionTitle>
        <textarea
          placeholder="Comma-separated skills"
          rows={2}
          className={inputClass}
          value={skillsText}
          onChange={(e) =>
            patch({
              skills: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <SectionTitle>Projects</SectionTitle>
          <button type="button" onClick={addProject} className="text-xs font-semibold underline">
            Add project
          </button>
        </div>
        {content.projects.map((proj, i) => (
          <div key={i} className="space-y-2 rounded-xl border bg-muted/30 p-3">
            <input
              placeholder="Name"
              className={inputClass}
              value={proj.name}
              onChange={(e) => updateProject(i, { ...proj, name: e.target.value })}
            />
            <input
              placeholder="URL"
              className={inputClass}
              value={proj.url}
              onChange={(e) => updateProject(i, { ...proj, url: e.target.value })}
            />
            <textarea
              placeholder="Description"
              rows={2}
              className={inputClass}
              value={proj.description}
              onChange={(e) => updateProject(i, { ...proj, description: e.target.value })}
            />
            <button type="button" onClick={() => removeProject(i)} className="text-xs text-destructive">
              Remove
            </button>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <SectionTitle>Certifications</SectionTitle>
          <button type="button" onClick={addCert} className="text-xs font-semibold underline">
            Add certification
          </button>
        </div>
        {content.certifications.map((cert, i) => (
          <div key={i} className="grid gap-2 rounded-xl border bg-muted/30 p-3 sm:grid-cols-3">
            <input
              placeholder="Name"
              className={inputClass}
              value={cert.name}
              onChange={(e) => updateCert(i, { ...cert, name: e.target.value })}
            />
            <input
              placeholder="Issuer"
              className={inputClass}
              value={cert.issuer}
              onChange={(e) => updateCert(i, { ...cert, issuer: e.target.value })}
            />
            <input
              placeholder="Date"
              className={inputClass}
              value={cert.date}
              onChange={(e) => updateCert(i, { ...cert, date: e.target.value })}
            />
            <button type="button" onClick={() => removeCert(i)} className="text-xs text-destructive sm:col-span-3">
              Remove
            </button>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <SectionTitle>Languages</SectionTitle>
          <button type="button" onClick={addLanguage} className="text-xs font-semibold underline">
            Add language
          </button>
        </div>
        {content.languages.map((lang, i) => (
          <div key={i} className="grid gap-2 rounded-xl border bg-muted/30 p-3 sm:grid-cols-2">
            <input
              placeholder="Language"
              className={inputClass}
              value={lang.name}
              onChange={(e) => updateLanguage(i, { ...lang, name: e.target.value })}
            />
            <input
              placeholder="Proficiency"
              className={inputClass}
              value={lang.proficiency}
              onChange={(e) => updateLanguage(i, { ...lang, proficiency: e.target.value })}
            />
            <button type="button" onClick={() => removeLanguage(i)} className="text-xs text-destructive sm:col-span-2">
              Remove
            </button>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <SectionTitle>Custom sections</SectionTitle>
          <button type="button" onClick={addCustom} className="text-xs font-semibold underline">
            Add section
          </button>
        </div>
        {content.custom.map((sec, i) => (
          <div key={i} className="space-y-2 rounded-xl border bg-muted/30 p-3">
            <input
              placeholder="Section title"
              className={inputClass}
              value={sec.title}
              onChange={(e) => updateCustom(i, { ...sec, title: e.target.value })}
            />
            <textarea
              placeholder="Body"
              rows={3}
              className={inputClass}
              value={sec.body}
              onChange={(e) => updateCustom(i, { ...sec, body: e.target.value })}
            />
            <button type="button" onClick={() => removeCustom(i)} className="text-xs text-destructive">
              Remove
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
