import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field

TemplateId = Literal["classic", "modern", "compact"]


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    phone: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    id: uuid.UUID
    email: EmailStr
    phone: str
    phone_verified: bool

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class OtpRequestResponse(BaseModel):
    ok: bool
    expires_in: int


class OtpVerifyRequest(BaseModel):
    code: str


class OtpVerifyResponse(BaseModel):
    phone_verified: bool


class ContactLink(BaseModel):
    label: str = ""
    url: str = ""


class ContactSection(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    links: list[ContactLink] = Field(default_factory=list)


class ExperienceItem(BaseModel):
    company: str = ""
    title: str = ""
    start: str = ""
    end: str = ""
    bullets: list[str] = Field(default_factory=list)


class EducationItem(BaseModel):
    school: str = ""
    degree: str = ""
    start: str = ""
    end: str = ""
    details: str = ""


class SkillItem(BaseModel):
    name: str = ""
    level: str = ""


class ProjectItem(BaseModel):
    name: str = ""
    url: str = ""
    description: str = ""
    bullets: list[str] = Field(default_factory=list)


class LinkItem(BaseModel):
    label: str = ""
    url: str = ""


class CertificationItem(BaseModel):
    name: str = ""
    issuer: str = ""
    date: str = ""


class LanguageItem(BaseModel):
    name: str = ""
    proficiency: str = ""


class CustomSection(BaseModel):
    title: str = ""
    body: str = ""
    items: list[str] = Field(default_factory=list)


class ResumeContent(BaseModel):
    contact: ContactSection = Field(default_factory=ContactSection)
    summary: str = ""
    experience: list[ExperienceItem] = Field(default_factory=list)
    education: list[EducationItem] = Field(default_factory=list)
    skills: list[str | SkillItem] = Field(default_factory=list)
    projects: list[ProjectItem] = Field(default_factory=list)
    links: list[LinkItem] = Field(default_factory=list)
    certifications: list[CertificationItem] = Field(default_factory=list)
    languages: list[LanguageItem] = Field(default_factory=list)
    custom: list[CustomSection] = Field(default_factory=list)


class ResumeCreate(BaseModel):
    template_id: TemplateId
    title: str | None = None


class ResumeUpdate(BaseModel):
    title: str | None = None
    template_id: TemplateId | None = None
    content: ResumeContent | None = None


class ResumeListItem(BaseModel):
    id: uuid.UUID
    title: str
    template_id: TemplateId
    updated_at: datetime

    model_config = {"from_attributes": True}


class ResumeOut(BaseModel):
    id: uuid.UUID
    title: str
    template_id: TemplateId
    content: dict
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ResumeImportResponse(BaseModel):
    content: ResumeContent
    warnings: list[str] = Field(default_factory=list)
