import type { ResumeSkill } from "@/lib/resumeTypes";

export function formatSkill(skill: ResumeSkill): string {
  if (typeof skill === "string") {
    return skill;
  }
  const name = skill.name?.trim() ?? "";
  const level = skill.level?.trim() ?? "";
  if (name && level) {
    return `${name} (${level})`;
  }
  return name || level;
}

export function skillsToEditorText(skills: ResumeSkill[]): string {
  return skills.map(formatSkill).join(", ");
}

export function parseSkillsText(text: string): ResumeSkill[] {
  return text
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const paren = part.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
      if (paren) {
        return { name: paren[1].trim(), level: paren[2].trim() };
      }
      return part;
    });
}
