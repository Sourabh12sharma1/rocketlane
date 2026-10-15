import logging
import re
import uuid

from fastapi.testclient import TestClient

_OTP_RE = re.compile(r"DEV OTP for .+: (\d{6})")


def register_token(client: TestClient, email: str | None = None) -> str:
    if email is None:
        email = f"user-{uuid.uuid4()}@example.com"
    r = client.post(
        "/api/auth/register",
        json={"email": email, "password": "secret123", "phone": "+15551234567"},
    )
    assert r.status_code == 201
    return r.json()["access_token"]


def _latest_otp_from_caplog(caplog, after_index: int) -> str:
    for rec in reversed(caplog.records[after_index:]):
        if rec.name != "app.services.otp":
            continue
        m = _OTP_RE.search(rec.getMessage())
        if m:
            return m.group(1)
    raise AssertionError(f"No OTP log after index {after_index}: {caplog.text}")


def verify_phone(client: TestClient, token: str, caplog) -> None:
    caplog.set_level(logging.INFO)
    start = len(caplog.records)
    r = client.post(
        "/api/auth/otp/request",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    code = _latest_otp_from_caplog(caplog, start)
    r2 = client.post(
        "/api/auth/otp/verify",
        headers={"Authorization": f"Bearer {token}"},
        json={"code": code},
    )
    assert r2.status_code == 200
    assert r2.json()["phone_verified"] is True


def verified_token(client: TestClient, caplog, email: str | None = None) -> str:
    token = register_token(client, email)
    verify_phone(client, token, caplog)
    return token


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}
