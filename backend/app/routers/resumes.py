import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.auth import require_phone_verified
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
from app.services.export_pdf import render_resume_pdf
from app.services.import_resume import import_from_inputs

router = APIRouter()

_READ_CHUNK = 64 * 1024


async def _read_upload_bounded(file: UploadFile, max_bytes: int) -> bytes:
    chunks: list[bytes] = []
    total = 0
    while True:
        chunk = await file.read(_READ_CHUNK)
        if not chunk:
            break
        total += len(chunk)
        if total > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                detail="File too large",
            )
        chunks.append(chunk)
    return b"".join(chunks)


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
    user: User = Depends(require_phone_verified),
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
    user: User = Depends(require_phone_verified),
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
    user: User = Depends(require_phone_verified),
    text: str | None = Form(default=None),
    file: UploadFile | None = File(default=None),
    settings: Settings = Depends(get_settings),
):
    has_text = text is not None and text.strip() != ""
    file_bytes: bytes | None = None
    if file is not None:
        file_bytes = await _read_upload_bounded(file, settings.max_upload_bytes)
        if len(file_bytes) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file"
            )
    if not has_text and file_bytes is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide text and/or file",
        )
    content, warnings = import_from_inputs(text if has_text else None, file_bytes)
    return ResumeImportResponse(content=content, warnings=warnings)


@router.get("/{resume_id}/export.pdf")
def export_resume_pdf(
    resume_id: uuid.UUID,
    user: User = Depends(require_phone_verified),
    db: Session = Depends(get_db),
):
    resume = _get_owned_resume(db, user, resume_id)
    pdf_bytes = render_resume_pdf(resume.template_id, resume.content)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="resume.pdf"'},
    )


@router.get("/{resume_id}", response_model=ResumeOut)
def get_resume(
    resume_id: uuid.UUID,
    user: User = Depends(require_phone_verified),
    db: Session = Depends(get_db),
):
    resume = _get_owned_resume(db, user, resume_id)
    return ResumeOut.model_validate(resume)


@router.put("/{resume_id}", response_model=ResumeOut)
def update_resume(
    resume_id: uuid.UUID,
    body: ResumeUpdate,
    user: User = Depends(require_phone_verified),
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
    user: User = Depends(require_phone_verified),
    db: Session = Depends(get_db),
):
    resume = _get_owned_resume(db, user, resume_id)
    db.delete(resume)
    db.commit()
