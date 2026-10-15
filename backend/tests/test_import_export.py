import uuid
from pathlib import Path

from fastapi.testclient import TestClient

from app.config import Settings, get_settings
from app.main import app
from app.services.import_resume import parse_resume_text

client = TestClient(app)

FIXTURES = Path(__file__).parent / "fixtures"
SAMPLE_RESUME = (FIXTURES / "sample_resume.txt").read_text()


def _register_token(email: str | None = None) -> str:
    if email is None:
        email = f"import-{uuid.uuid4()}@example.com"
    r = client.post(
        "/api/auth/register",
        json={"email": email, "password": "secret123", "phone": "+15551234567"},
    )
    assert r.status_code == 201
    return r.json()["access_token"]


def _auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_parse_resume_text_fills_sections_from_headings():
    content, warnings = parse_resume_text(SAMPLE_RESUME)
    assert content.contact.name == "Jane Doe"
    assert content.contact.email == "jane.doe@example.com"
    assert "+1" in content.contact.phone or "555" in content.contact.phone
    assert "engineer" in content.summary.lower()
    assert len(content.experience) >= 1
    assert content.experience[0].company or content.experience[0].title
    assert len(content.education) >= 1
    assert len(content.skills) >= 3
    assert len(content.projects) >= 1
    assert len(content.certifications) >= 1
    assert len(content.languages) >= 1
    assert isinstance(warnings, list)


def test_import_paste_returns_content_and_warnings():
    token = _register_token()
    r = client.post(
        "/api/resumes/import",
        headers=_auth_headers(token),
        data={"text": SAMPLE_RESUME},
    )
    assert r.status_code == 200
    body = r.json()
    assert "content" in body
    assert "warnings" in body
    assert body["content"]["contact"]["name"] == "Jane Doe"
    assert body["content"]["contact"]["email"] == "jane.doe@example.com"
    assert len(body["content"]["experience"]) >= 1
    assert len(body["content"]["skills"]) >= 3


def test_import_requires_auth():
    r = client.post("/api/resumes/import", data={"text": "Jane Doe\nSUMMARY\nHi"})
    assert r.status_code == 401


def test_import_rejects_when_neither_text_nor_file():
    token = _register_token()
    r = client.post("/api/resumes/import", headers=_auth_headers(token), data={})
    assert r.status_code == 400


def test_import_rejects_empty_file():
    token = _register_token()
    r = client.post(
        "/api/resumes/import",
        headers=_auth_headers(token),
        files={"file": ("empty.pdf", b"", "application/pdf")},
    )
    assert r.status_code == 400


def test_import_rejects_oversized_file():
    token = _register_token()
    small_limit = 512

    def _settings() -> Settings:
        return Settings(max_upload_bytes=small_limit)

    app.dependency_overrides[get_settings] = _settings
    try:
        r = client.post(
            "/api/resumes/import",
            headers=_auth_headers(token),
            files={"file": ("big.pdf", b"x" * (small_limit + 1), "application/pdf")},
        )
        assert r.status_code == 413
    finally:
        app.dependency_overrides.pop(get_settings, None)
