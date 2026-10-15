import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.config import Settings, get_settings
from app.db import get_db
from app.models import Resume, User
from app.schemas import (
    ResumeCreate,
    ResumeImportResponse,
    ResumeListItem,
    ResumeOut,
    ResumeUpdate,
)
from app.services.empty_content import empty_content
from app.services.import_resume import import_from_inputs

router = APIRouter()


def _get_owned_resume(db: Session, user: User, resume_id: uuid.UUID) -> Resume:
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == user.id)
        .first()
    )
    if resume is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return resume


@router.get("", response_model=list[ResumeListItem])
def list_resumes(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(Resume)
        .filter(Resume.user_id == user.id)
        .order_by(Resume.updated_at.desc())
        .all()
    )
    return [ResumeListItem.model_validate(r) for r in rows]


@router.post("", response_model=ResumeOut, status_code=status.HTTP_201_CREATED)
def create_resume(
    body: ResumeCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = Resume(
        user_id=user.id,
        title=body.title if body.title is not None else "Untitled",
        template_id=body.template_id,
        content=empty_content(),
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return ResumeOut.model_validate(resume)


@router.post("/import", response_model=ResumeImportResponse)
async def import_resume(
    user: User = Depends(get_current_user),
    text: str | None = Form(default=None),
    file: UploadFile | None = File(default=None),
    settings: Settings = Depends(get_settings),
):
    has_text = text is not None and text.strip() != ""
    file_bytes: bytes | None = None
    if file is not None:
        file_bytes = await file.read()
        if len(file_bytes) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file"
            )
        if len(file_bytes) > settings.max_upload_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                detail="File too large",
            )
    if not has_text and file_bytes is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide text and/or file",
        )
    content, warnings = import_from_inputs(text if has_text else None, file_bytes)
    return ResumeImportResponse(content=content, warnings=warnings)


@router.get("/{resume_id}", response_model=ResumeOut)
def get_resume(
    resume_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = _get_owned_resume(db, user, resume_id)
    return ResumeOut.model_validate(resume)


@router.put("/{resume_id}", response_model=ResumeOut)
def update_resume(
    resume_id: uuid.UUID,
    body: ResumeUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = _get_owned_resume(db, user, resume_id)
    if body.title is not None:
        resume.title = body.title
    if body.template_id is not None:
        resume.template_id = body.template_id
    if body.content is not None:
        resume.content = body.content.model_dump()
    resume.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(resume)
    return ResumeOut.model_validate(resume)


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(
    resume_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = _get_owned_resume(db, user, resume_id)
    db.delete(resume)
    db.commit()
