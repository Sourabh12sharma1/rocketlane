import type { ResumeContent, TemplateId } from "@/lib/resumeTypes";
import { ClassicTemplate } from "@/components/resume/templates/Classic";
import { ModernTemplate } from "@/components/resume/templates/Modern";
import { CompactTemplate } from "@/components/resume/templates/Compact";

type Props = {
  templateId: TemplateId;
  content: ResumeContent;
};

export function ResumePreview({ templateId, content }: Props) {
  return (
    <div
      className="min-h-[480px] rounded-2xl border bg-white p-6 shadow-brutal"
      data-testid="resume-preview"
      data-template={templateId}
    >
      {templateId === "classic" && <ClassicTemplate content={content} />}
      {templateId === "modern" && <ModernTemplate content={content} />}
      {templateId === "compact" && <CompactTemplate content={content} />}
    </div>
  );
}
