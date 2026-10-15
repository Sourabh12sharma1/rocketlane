from __future__ import annotations

import html
from typing import Any

from weasyprint import HTML

from app.schemas import ResumeContent, SkillItem, TemplateId

_BASE_CSS = """
@page { size: letter; margin: 0.6in; }
body { font-size: 10pt; line-height: 1.35; color: #111; }
h1 { margin: 0 0 0.15em; font-size: 20pt; }
h2 { margin: 0.85em 0 0.35em; font-size: 11pt; text-transform: uppercase; letter-spacing: 0.04em; }
p { margin: 0.35em 0; }
ul { margin: 0.25em 0 0.4em; padding-left: 1.2em; }
li { margin: 0.15em 0; }
.meta { font-size: 9pt; color: #444; }
.item-head { display: flex; justify-content: space-between; gap: 1em; }
.item-head strong { font-weight: 600; }
.dates { white-space: nowrap; color: #555; font-size: 9pt; }
.section { margin-bottom: 0.5em; }
.skills { display: flex; flex-wrap: wrap; gap: 0.35em 0.75em; }
.skill-pill { display: inline-block; padding: 0.1em 0.45em; border-radius: 3px; font-size: 9pt; }
a { color: inherit; text-decoration: none; }
"""

_TEMPLATE_CSS: dict[TemplateId, str] = {
    "classic": """
body { font-family: Georgia, 'Times New Roman', serif; }
h2 { border-bottom: 1px solid #333; padding-bottom: 0.15em; }
header { text-align: center; margin-bottom: 0.75em; }
.skill-pill { border: 1px solid #ccc; background: #fafafa; }
""",
    "modern": """
body { font-family: Helvetica, Arial, sans-serif; }
header {
  background: #1e3a5f; color: #fff; padding: 0.65em 0.75em; margin: -0.6in -0.6in 0.75em;
  padding-left: calc(0.6in + 0.75em); padding-right: calc(0.6in + 0.75em);
}
header h1, header .meta { color: #fff; }
header .meta { opacity: 0.92; }
h2 { color: #1e3a5f; border-left: 3px solid #1e3a5f; padding-left: 0.4em; }
.skill-pill { background: #e8eef5; color: #1e3a5f; }
""",
    "compact": """
body { font-family: Arial, sans-serif; font-size: 9pt; line-height: 1.25; }
@page { margin: 0.45in; }
h1 { font-size: 16pt; }
h2 { margin-top: 0.55em; font-size: 9.5pt; }
header { margin-bottom: 0.4em; }
.section { margin-bottom: 0.25em; }
ul { margin-bottom: 0.2em; }
.skill-pill { background: #eee; font-size: 8pt; }
""",
}


def _e(value: str | None) -> str:
    return html.escape(value or "", quote=True)


def _skill_label(skill: str | SkillItem | dict[str, Any]) -> str:
    if isinstance(skill, str):
        return skill
    if isinstance(skill, SkillItem):
        name = skill.name
        level = skill.level
    elif isinstance(skill, dict):
        name = str(skill.get("name") or "")
        level = str(skill.get("level") or "")
    else:
        return _e(str(skill))
    if level:
        return f"{name} ({level})"
    return name


def _content_model(content: ResumeContent | dict[str, Any]) -> ResumeContent:
    if isinstance(content, ResumeContent):
        return content
    return ResumeContent.model_validate(content)


def _contact_line(content: ResumeContent) -> str:
    c = content.contact
    parts: list[str] = []
    for val in (c.email, c.phone, c.location):
        if val:
            parts.append(_e(val))
    for link in c.links:
        label = link.label or link.url
        if link.url:
            parts.append(f'<a href="{_e(link.url)}">{_e(label)}</a>')
        elif label:
            parts.append(_e(label))
    return " · ".join(parts)


def _section(title: str, inner: str) -> str:
    if not inner.strip():
        return ""
    return f'<section class="section"><h2>{_e(title)}</h2>{inner}</section>'


def _bullets(items: list[str]) -> str:
    if not items:
        return ""
    lis = "".join(f"<li>{_e(b)}</li>" for b in items if b)
    return f"<ul>{lis}</ul>" if lis else ""


def _experience_html(content: ResumeContent) -> str:
    blocks: list[str] = []
    for exp in content.experience:
        if not any((exp.company, exp.title, exp.bullets)):
            continue
        dates = ""
        if exp.start or exp.end:
            dates = f'<span class="dates">{_e(exp.start)} – {_e(exp.end)}</span>'
        head = f"""
<div class="item-head">
  <div><strong>{_e(exp.title)}</strong>{f" — {_e(exp.company)}" if exp.company else ""}</div>
  {dates}
</div>"""
        blocks.append(f"<div>{head}{_bullets(exp.bullets)}</div>")
    return "".join(blocks)


def _education_html(content: ResumeContent) -> str:
    blocks: list[str] = []
    for ed in content.education:
        if not any((ed.school, ed.degree, ed.details)):
            continue
        dates = ""
        if ed.start or ed.end:
            dates = f'<span class="dates">{_e(ed.start)} – {_e(ed.end)}</span>'
        degree = _e(ed.degree)
        school = _e(ed.school)
        blocks.append(
            f"""<div class="item-head">
  <div><strong>{degree}</strong>{f", {school}" if school else ""}</div>
  {dates}
</div>{f"<p>{_e(ed.details)}</p>" if ed.details else ""}"""
        )
    return "".join(blocks)


def _skills_html(content: ResumeContent) -> str:
    labels = [_skill_label(s) for s in content.skills if _skill_label(s)]
    if not labels:
        return ""
    pills = "".join(f'<span class="skill-pill">{_e(l)}</span>' for l in labels)
    return f'<div class="skills">{pills}</div>'


def _projects_html(content: ResumeContent) -> str:
    blocks: list[str] = []
    for proj in content.projects:
        if not any((proj.name, proj.description, proj.bullets)):
            continue
        name = _e(proj.name)
        if proj.url:
            name = f'<a href="{_e(proj.url)}">{name}</a>'
        blocks.append(
            f"<div><strong>{name}</strong>"
            f'{f"<p>{_e(proj.description)}</p>" if proj.description else ""}'
            f"{_bullets(proj.bullets)}</div>"
        )
    return "".join(blocks)


def _certifications_html(content: ResumeContent) -> str:
    blocks: list[str] = []
    for cert in content.certifications:
        if not any((cert.name, cert.issuer, cert.date)):
            continue
        line = _e(cert.name)
        if cert.issuer:
            line += f" — {_e(cert.issuer)}"
        if cert.date:
            line += f" ({_e(cert.date)})"
        blocks.append(f"<div>{line}</div>")
    return "".join(blocks)


def _languages_html(content: ResumeContent) -> str:
    parts: list[str] = []
    for lang in content.languages:
        if not lang.name:
            continue
        label = _e(lang.name)
        if lang.proficiency:
            label += f" ({_e(lang.proficiency)})"
        parts.append(label)
    return "<p>" + ", ".join(parts) + "</p>" if parts else ""


def _custom_html(content: ResumeContent) -> str:
    blocks: list[str] = []
    for sec in content.custom:
        if not any((sec.title, sec.body, sec.items)):
            continue
        inner = f"<p>{_e(sec.body)}</p>" if sec.body else ""
        inner += _bullets(sec.items)
        title = sec.title or "Additional"
        blocks.append(
            f'<div class="section"><h2>{_e(title)}</h2>{inner}</div>'
        )
    return "".join(blocks)


def build_resume_html(template_id: TemplateId, content: ResumeContent | dict[str, Any]) -> str:
    model = _content_model(content)
    name = _e(model.contact.name) or "Resume"
    meta = _contact_line(model)
    css = _BASE_CSS + _TEMPLATE_CSS.get(template_id, _TEMPLATE_CSS["classic"])

    meta_html = f'<p class="meta">{meta}</p>' if meta else ""
    header = f"<header><h1>{name}</h1>{meta_html}</header>"

    body_parts = [
        _section("Summary", f"<p>{_e(model.summary)}</p>") if model.summary else "",
        _section("Experience", _experience_html(model)),
        _section("Education", _education_html(model)),
        _section("Skills", _skills_html(model)),
        _section("Projects", _projects_html(model)),
        _section("Certifications", _certifications_html(model)),
        _section("Languages", _languages_html(model)),
        _custom_html(model),
    ]
    body = header + "".join(body_parts)
    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><style>{css}</style></head>
<body>{body}</body></html>"""


def render_resume_pdf(
    template_id: TemplateId,
    content: ResumeContent | dict[str, Any],
) -> bytes:
    html_doc = build_resume_html(template_id, content)
    return HTML(string=html_doc).write_pdf()
