from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_register_and_login():
    r = client.post(
        "/api/auth/register",
        json={
            "email": "a@example.com",
            "password": "secret123",
            "phone": "+15551234567",
        },
    )
    assert r.status_code == 201
    body = r.json()
    assert "access_token" in body
    assert body["user"]["email"] == "a@example.com"
    assert body["user"]["phone_verified"] is False

    r2 = client.post(
        "/api/auth/login", json={"email": "a@example.com", "password": "secret123"}
    )
    assert r2.status_code == 200
    assert "access_token" in r2.json()


def test_register_duplicate_email():
    payload = {
        "email": "dup@example.com",
        "password": "secret123",
        "phone": "+15559998888",
    }
    r1 = client.post("/api/auth/register", json=payload)
    assert r1.status_code == 201
    r2 = client.post("/api/auth/register", json=payload)
    assert r2.status_code == 409


def test_login_bad_password():
    client.post(
        "/api/auth/register",
        json={
            "email": "b@example.com",
            "password": "secret123",
            "phone": "+15550001111",
        },
    )
    r = client.post(
        "/api/auth/login", json={"email": "b@example.com", "password": "wrong"}
    )
    assert r.status_code == 401
