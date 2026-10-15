import uuid

from fastapi.testclient import TestClient

from app.main import app
from app.services.empty_content import empty_content
from tests.helpers import auth_headers, register_token, verified_token

client = TestClient(app)


def test_create_resume_with_empty_content(caplog):
    token = verified_token(client, caplog)
    r = client.post(
        "/api/resumes",
        headers=auth_headers(token),
        json={"template_id": "classic"},
    )
    assert r.status_code == 201
    body = r.json()
    assert body["template_id"] == "classic"
    assert body["title"] == "Untitled"
    assert body["content"] == empty_content()
    assert "id" in body
    assert "created_at" in body
    assert "updated_at" in body


def test_create_resume_with_title(caplog):
    token = verified_token(client, caplog)
    r = client.post(
        "/api/resumes",
        headers=auth_headers(token),
        json={"template_id": "modern", "title": "My CV"},
    )
    assert r.status_code == 201
    assert r.json()["title"] == "My CV"


def test_list_resumes(caplog):
    token_a = verified_token(client, caplog, "list-a@example.com")
    token_b = verified_token(client, caplog, "list-b@example.com")
    client.post(
        "/api/resumes",
        headers=auth_headers(token_a),
        json={"template_id": "classic", "title": "A1"},
    )
    client.post(
        "/api/resumes",
        headers=auth_headers(token_a),
        json={"template_id": "compact", "title": "A2"},
    )
    client.post(
        "/api/resumes",
        headers=auth_headers(token_b),
        json={"template_id": "modern", "title": "B1"},
    )

    r = client.get("/api/resumes", headers=auth_headers(token_a))
    assert r.status_code == 200
    items = r.json()
    assert len(items) == 2
    titles = {i["title"] for i in items}
    assert titles == {"A1", "A2"}
    for item in items:
        assert set(item.keys()) == {"id", "title", "template_id", "updated_at"}


def test_get_update_and_delete_resume(caplog):
    token = verified_token(client, caplog)
    created = client.post(
        "/api/resumes",
        headers=auth_headers(token),
        json={"template_id": "classic"},
    ).json()
    resume_id = created["id"]

    r_get = client.get(f"/api/resumes/{resume_id}", headers=auth_headers(token))
    assert r_get.status_code == 200
    assert r_get.json()["content"] == empty_content()

    new_content = empty_content()
    new_content["summary"] = "Engineer with 10 years experience"
    new_content["contact"]["name"] = "Ada Lovelace"
    r_put = client.put(
        f"/api/resumes/{resume_id}",
        headers=auth_headers(token),
        json={"template_id": "modern", "title": "Updated", "content": new_content},
    )
    assert r_put.status_code == 200
    updated = r_put.json()
    assert updated["template_id"] == "modern"
    assert updated["title"] == "Updated"
    assert updated["content"]["summary"] == "Engineer with 10 years experience"
    assert updated["content"]["contact"]["name"] == "Ada Lovelace"

    r_del = client.delete(f"/api/resumes/{resume_id}", headers=auth_headers(token))
    assert r_del.status_code == 204
    r_missing = client.get(f"/api/resumes/{resume_id}", headers=auth_headers(token))
    assert r_missing.status_code == 404


def test_other_user_gets_404(caplog):
    token_owner = verified_token(client, caplog, "owner@example.com")
    token_other = verified_token(client, caplog, "other@example.com")
    resume_id = client.post(
        "/api/resumes",
        headers=auth_headers(token_owner),
        json={"template_id": "classic"},
    ).json()["id"]

    for method, path, kwargs in [
        ("get", f"/api/resumes/{resume_id}", {}),
        ("put", f"/api/resumes/{resume_id}", {"json": {"title": "Hack"}}),
        ("delete", f"/api/resumes/{resume_id}", {}),
    ]:
        fn = getattr(client, method)
        r = fn(path, headers=auth_headers(token_other), **kwargs)
        assert r.status_code == 404, method


def test_resumes_require_auth():
    r = client.get("/api/resumes")
    assert r.status_code == 401


def test_resumes_require_phone_verified():
    token = register_token(client, f"unverified-{uuid.uuid4()}@example.com")
    r = client.get("/api/resumes", headers=auth_headers(token))
    assert r.status_code == 403
    assert r.json()["detail"] == "Phone verification required"
