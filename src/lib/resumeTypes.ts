export type TemplateId = "classic" | "modern" | "compact";

export type ResumeLink = { label: string; url: string };

export type ResumeContact = {
  name: string;
  email: string;
  phone: string;
  location: string;
  links: ResumeLink[];
};

export type ResumeExperience = {
  company: string;
  title: string;
  start: string;
  end: string;
  bullets: string[];
};

export type ResumeEducation = {
  school: string;
  degree: string;
  start: string;
  end: string;
  details: string;
};

export type ResumeProject = {
  name: string;
  url: string;
  description: string;
  bullets: string[];
};

export type ResumeCertification = {
  name: string;
  issuer: string;
  date: string;
};

export type ResumeLanguage = {
  name: string;
  proficiency: string;
};

export type ResumeCustomSection = {
  title: string;
  body: string;
};

export type ResumeContent = {
  contact: ResumeContact;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  projects: ResumeProject[];
  links: ResumeLink[];
  certifications: ResumeCertification[];
  languages: ResumeLanguage[];
  custom: ResumeCustomSection[];
};

export type ResumeSummary = {
  id: string;
  title: string;
  template_id: TemplateId;
  updated_at: string;
};

export type ResumeRecord = ResumeSummary & {
  content: ResumeContent;
  created_at: string;
};

export function emptyContent(): ResumeContent {
  return {
    contact: { name: "", email: "", phone: "", location: "", links: [] },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    links: [],
    certifications: [],
    languages: [],
    custom: [],
  };
}
