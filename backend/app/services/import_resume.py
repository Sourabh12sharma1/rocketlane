import re
from io import BytesIO

from pypdf import PdfReader

from app.schemas import (
    CertificationItem,
    ContactSection,
    EducationItem,
    ExperienceItem,
    LanguageItem,
    ProjectItem,
    ResumeContent,
)

SECTION_HEADINGS = (
    "SUMMARY",
    "EXPERIENCE",
    "EDUCATION",
    "SKILLS",
    "PROJECTS",
    "CERTIFICATIONS",
    "LANGUAGES",
)
HEADING_RE = re.compile(
    rf"^({'|'.join(SECTION_HEADINGS)})\s*:?\s*$",
    re.IGNORECASE | re.MULTILINE,
)
EMAIL_RE = re.compile(r"[\w.+-]+@[\w.-]+\.\w+")
PHONE_RE = re.compile(r"(?:\+?\d[\d\s().-]{7,}\d)")


def _split_sections(text: str) -> tuple[list[str], dict[str, str]]:
    matches = list(HEADING_RE.finditer(text))
    if not matches:
        return text.strip().splitlines(), {}

    preamble = text[: matches[0].start()]
    header_lines = [ln for ln in preamble.splitlines() if ln.strip()]
    sections: dict[str, str] = {}
    for i, match in enumerate(matches):
        key = match.group(1).upper()
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        sections[key] = text[start:end].strip()
    return header_lines, sections


def _parse_contact(header_lines: list[str], contact: ContactSection) -> None:
    for line in header_lines:
        if not contact.email:
            email = EMAIL_RE.search(line)
            if email:
                contact.email = email.group(0)
        if not contact.phone:
            phone = PHONE_RE.search(line)
            if phone:
                contact.phone = phone.group(0).strip()

    for line in header_lines:
        stripped = line.strip()
        if not stripped or EMAIL_RE.fullmatch(stripped) or EMAIL_RE.search(stripped):
            if EMAIL_RE.search(stripped) and stripped.strip() == EMAIL_RE.search(stripped).group(0):
                continue
            if EMAIL_RE.search(stripped):
                continue
        if PHONE_RE.search(stripped) and len(re.sub(r"\D", "", stripped)) >= 7:
            if stripped.replace(" ", "") == contact.phone.replace(" ", ""):
                continue
        if not contact.name and len(stripped) < 120 and not stripped.upper() in SECTION_HEADINGS:
            contact.name = stripped
            continue
        if not contact.location and contact.name and stripped != contact.name:
            if not EMAIL_RE.search(stripped) and not (
                PHONE_RE.search(stripped) and len(re.sub(r"\D", "", stripped)) >= 7
            ):
                contact.location = stripped


def _parse_experience(block: str) -> list[ExperienceItem]:
    items: list[ExperienceItem] = []
    current: ExperienceItem | None = None
    for raw in block.splitlines():
        line = raw.strip()
        if not line:
            continue
        if line.startswith(("-", "•", "*", "–")):
            if current is None:
                current = ExperienceItem()
            current.bullets.append(line.lstrip("-•*– ").strip())
            continue
        if "|" in line:
            if current and (current.company or current.title or current.bullets):
                items.append(current)
            parts = [p.strip() for p in line.split("|")]
            current = ExperienceItem()
            if parts:
                current.company = parts[0]
            if len(parts) > 1:
                current.title = parts[1]
            if len(parts) > 2:
                dates = parts[2]
                if " - " in dates or " – " in dates:
                    sep = " - " if " - " in dates else " – "
                    start, _, end = dates.partition(sep)
                    current.start = start.strip()
                    current.end = end.strip()
                else:
                    current.start = dates
            continue
        if current and (current.company or current.title or current.bullets):
            items.append(current)
        current = ExperienceItem(title=line)
    if current and (current.company or current.title or current.bullets):
        items.append(current)
    return items


def _parse_education(block: str) -> list[EducationItem]:
    items: list[EducationItem] = []
    for raw in block.splitlines():
        line = raw.strip()
        if not line:
            continue
        if "|" in line:
            parts = [p.strip() for p in line.split("|")]
            item = EducationItem()
            if parts:
                item.school = parts[0]
            if len(parts) > 1:
                item.degree = parts[1]
            if len(parts) > 2:
                dates = parts[2]
                if " - " in dates or " – " in dates:
                    sep = " - " if " - " in dates else " – "
                    start, _, end = dates.partition(sep)
                    item.start = start.strip()
                    item.end = end.strip()
                else:
                    item.details = dates
            items.append(item)
        else:
            items.append(EducationItem(school=line))
    return items


def _parse_skills(block: str) -> list[str]:
    skills: list[str] = []
    for raw in block.replace("\n", ",").split(","):
        name = raw.strip()
        if name:
            skills.append(name)
    return skills


def _parse_projects(block: str) -> list[ProjectItem]:
    projects: list[ProjectItem] = []
    current: ProjectItem | None = None
    for raw in block.splitlines():
        line = raw.strip()
        if not line:
            continue
        if line.startswith(("-", "•", "*", "–")):
            if current is None:
                current = ProjectItem()
            current.bullets.append(line.lstrip("-•*– ").strip())
            continue
        if current and (current.name or current.description or current.bullets):
            projects.append(current)
        if "—" in line or " - " in line:
            name, _, desc = line.partition("—") if "—" in line else line.partition(" - ")
            current = ProjectItem(name=name.strip(), description=desc.strip())
        else:
            current = ProjectItem(name=line)
    if current and (current.name or current.description or current.bullets):
        projects.append(current)
    return projects


def _parse_certifications(block: str) -> list[CertificationItem]:
    items: list[CertificationItem] = []
    for raw in block.splitlines():
        line = raw.strip()
        if not line:
            continue
        if "|" in line:
            parts = [p.strip() for p in line.split("|")]
            item = CertificationItem()
            if parts:
                item.name = parts[0]
            if len(parts) > 1:
                item.issuer = parts[1]
            if len(parts) > 2:
                item.date = parts[2]
            items.append(item)
        else:
            items.append(CertificationItem(name=line))
    return items


def _parse_languages(block: str) -> list[LanguageItem]:
    items: list[LanguageItem] = []
    for raw in block.splitlines():
        line = raw.strip()
        if not line:
            continue
        for sep in ("—", "–", "|", "-"):
            if sep in line:
                name, _, prof = line.partition(sep)
                items.append(LanguageItem(name=name.strip(), proficiency=prof.strip()))
                break
        else:
            items.append(LanguageItem(name=line))
    return items


def parse_resume_text(text: str) -> tuple[ResumeContent, list[str]]:
    warnings: list[str] = []
    header_lines, sections = _split_sections(text)
    content = ResumeContent()
    _parse_contact(header_lines, content.contact)

    if "SUMMARY" in sections:
        content.summary = " ".join(
            ln.strip() for ln in sections["SUMMARY"].splitlines() if ln.strip()
        )
    if "EXPERIENCE" in sections:
        content.experience = _parse_experience(sections["EXPERIENCE"])
    if "EDUCATION" in sections:
        content.education = _parse_education(sections["EDUCATION"])
    if "SKILLS" in sections:
        content.skills = _parse_skills(sections["SKILLS"])
    if "PROJECTS" in sections:
        content.projects = _parse_projects(sections["PROJECTS"])
    if "CERTIFICATIONS" in sections:
        content.certifications = _parse_certifications(sections["CERTIFICATIONS"])
    if "LANGUAGES" in sections:
        content.languages = _parse_languages(sections["LANGUAGES"])

    if not sections:
        warnings.append("No section headings detected; only contact fields were inferred")
    elif len(sections) < 3:
        warnings.append("Some resume sections may be missing or unrecognized")

    return content, warnings


def extract_text_from_pdf(data: bytes) -> tuple[str, list[str]]:
    warnings: list[str] = []
    try:
        reader = PdfReader(BytesIO(data))
        parts: list[str] = []
        for page in reader.pages:
            parts.append(page.extract_text() or "")
        combined = "\n".join(parts).strip()
        if not combined:
            warnings.append("No text could be extracted from PDF")
        return combined, warnings
    except Exception as exc:
        warnings.append(f"PDF extraction failed: {exc!s}")
        return "", warnings


def import_from_inputs(
    text: str | None, file_bytes: bytes | None
) -> tuple[ResumeContent, list[str]]:
    warnings: list[str] = []
    chunks: list[str] = []
    if text and text.strip():
        chunks.append(text)
    if file_bytes is not None:
        extracted, pdf_warnings = extract_text_from_pdf(file_bytes)
        warnings.extend(pdf_warnings)
        if extracted:
            chunks.append(extracted)
    combined = "\n\n".join(chunks)
    if not combined.strip():
        return ResumeContent(), warnings + ["No parseable text found in input"]
    content, parse_warnings = parse_resume_text(combined)
    warnings.extend(parse_warnings)
    return content, warnings
