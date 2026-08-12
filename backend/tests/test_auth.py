import os
import io
import pytest
from fastapi.testclient import TestClient
from backend.main import app

@pytest.fixture(scope="session", autouse=True)
def clean_test_db():
    test_db = os.path.join(os.path.dirname(os.path.dirname(__file__)), "database_test.db")
    if os.path.exists(test_db):
        try:
            os.remove(test_db)
        except Exception:
            pass
    # Reinitialize it
    from backend.database import init_db
    init_db()
    yield
    if os.path.exists(test_db):
        try:
            os.remove(test_db)
        except Exception:
            pass

@pytest.fixture
def client():
    # Set dummy API key for testing
    os.environ['GEMINI_API_KEY'] = 'dummy_key'
    return TestClient(app)

@pytest.fixture
def auth_header(client):
    # Register and login test user
    email = "test_user_auth@test.com"
    password = "password123"

    client.post("/api/auth/register", json={"email": email, "password": password})
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_user_registration_and_login(client):
    email = "new_user@test.com"
    password = "securepassword"

    # Successful Registration
    reg_res = client.post("/api/auth/register", json={"email": email, "password": password})
    assert reg_res.status_code == 201
    assert "User registered successfully." in reg_res.json()["message"]

    # Short Password Validation
    reg_short = client.post("/api/auth/register", json={"email": "short@test.com", "password": "123"})
    assert reg_short.status_code == 400
    assert "Password must be at least 6 characters" in reg_short.json()["detail"]

    # Successful Login
    login_res = client.post("/api/auth/login", json={"email": email, "password": password})
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()
    assert login_res.json()["token_type"] == "bearer"

def test_user_profile_protected(client, auth_header):
    # Authenticated user request
    res = client.get("/api/auth/me", headers=auth_header)
    assert res.status_code == 200
    assert res.json()["email"] == "test_user_auth@test.com"

    # Unauthenticated profile request
    res_unauth = client.get("/api/auth/me")
    assert res_unauth.status_code == 401
    assert "missing or malformed" in res_unauth.json()["detail"]

def test_invalid_password_and_token(client):
    # Invalid Password
    res = client.post("/api/auth/login", json={"email": "nonexistent@test.com", "password": "wrongpassword"})
    assert res.status_code == 401
    assert "Invalid email or password" in res.json()["detail"]

    # Invalid Token
    res_token = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid_token"})
    assert res_token.status_code == 401
    assert "Invalid or expired" in res_token.json()["detail"]

def test_guest_upload_succeeds(client):
    verilog = """
    module test_module(input clk, rst, input a, output z);
        assign z = a;
    endmodule
    """
    file_payload = {"file": ("test_module.v", io.BytesIO(verilog.encode("utf-8")), "text/plain")}
    res = client.post("/upload", files=file_payload)

    assert res.status_code == 200
    data = res.json()
    assert data["filename"] == "test_module.v"
    assert data["syntax_errors"] == []
    assert data["parsed_data"]["module_name"] == "test_module"

def test_premium_endpoints_fail_for_guest(client):
    endpoints = [
        ("/diagram", "post"),
        ("/schematic", "post"),
        ("/metrics", "post"),
        ("/bugs", "post"),
        ("/optimize", "post"),
        ("/chat", "post"),
        ("/report", "post"),
        ("/download-report/invalid_id", "get"),
        ("/testbench", "post")
    ]

    payload = {"rtl": "module t; endmodule"}
    chat_payload = {"rtl": "module t; endmodule", "question": "hello"}

    for path, method in endpoints:
        req_payload = chat_payload if path == "/chat" else payload
        if method == "post":
            res = client.post(path, json=req_payload)
        else:
            res = client.get(path)
        assert res.status_code == 401
        assert "Authorization token is missing or malformed" in res.json()["detail"]

def test_premium_endpoints_succeed_with_jwt(client, auth_header):
    payload = {
        "rtl": "module test_premium(input a, b, output y); assign y = a & b; endmodule"
    }

    # Test diagram
    res = client.post("/diagram", json=payload, headers=auth_header)
    assert res.status_code == 200
    assert "rtl_graph" in res.json()

    # Test schematic
    res = client.post("/schematic", json=payload, headers=auth_header)
    assert res.status_code == 200
    assert "schematic" in res.json()

    # Test metrics
    res = client.post("/metrics", json=payload, headers=auth_header)
    assert res.status_code == 200
    assert "metrics" in res.json()

    # Test testbench
    res = client.post("/testbench", json=payload, headers=auth_header)
    assert res.status_code == 200
    assert "testbench" in res.json()
