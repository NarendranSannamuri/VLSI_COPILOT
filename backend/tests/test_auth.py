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

    # Premium features must be None for guests
    assert data["metrics"] is None
    assert data["block_diagram_svg"] is None
    assert data["schematic_diagram_svg"] is None
    assert data["bugs"] is None
    assert data["ai_review"] is None

def test_guest_rtl_explorer_and_analysis_succeeds(client):
    verilog = """
    module dummy(input clk, output z);
        assign z = 1'b0;
    endmodule
    """
    file_payload = {"file": ("dummy.v", io.BytesIO(verilog.encode("utf-8")), "text/plain")}
    res = client.post("/upload", files=file_payload)

    assert res.status_code == 200
    data = res.json()

    # RTL Explorer (parsed ports and statements) must succeed
    assert data["parsed_data"]["inputs"] == ["clk"]
    assert data["parsed_data"]["outputs"] == ["z"]
    assert len(data["parsed_data"]["assignments"]) > 0

    # RTL Analysis (warnings and summary) must succeed
    assert "warnings" in data
    assert "analysis" in data
    assert "dummy" in data["analysis"]["rtl_summary"]

def test_premium_endpoints_fail_for_guest(client):
    endpoints = [
        ("/premium/diagrams", "post"),
        ("/premium/metrics", "post"),
        ("/premium/bugs", "post"),
        ("/premium/ai-review", "post"),
        ("/premium/testbench", "post"),
        ("/premium/generate-report", "post"),
        ("/download-report", "get")
    ]

    payload = {"verilog_code": "module t; endmodule"}
    for path, method in endpoints:
        if method == "post":
            res = client.post(path, json=payload)
        else:
            res = client.get(path)
        assert res.status_code == 401

def test_premium_endpoints_succeed_with_jwt(client, auth_header):
    # Test diagrams
    payload = {"verilog_code": "module test_premium(input a, b, output y); assign y = a & b; endmodule"}

    res = client.post("/premium/diagrams", json=payload, headers=auth_header)
    assert res.status_code == 200
    assert "block_diagram_svg" in res.json()
    assert "schematic_diagram_svg" in res.json()

    # Test metrics
    res = client.post("/premium/metrics", json=payload, headers=auth_header)
    assert res.status_code == 200
    assert res.json()["metrics"]["design_type"] == "Combinational"

    # Test testbench
    res = client.post("/premium/testbench", json=payload, headers=auth_header)
    assert res.status_code == 200
    assert "testbench" in res.json()

def test_invalid_password_and_token(client):
    # Invalid Password
    res = client.post("/api/auth/login", json={"email": "nonexistent@test.com", "password": "wrongpassword"})
    assert res.status_code == 401
    assert "Invalid email or password" in res.json()["detail"]

    # Invalid Token
    res = client.post("/premium/diagrams", json={"verilog_code": "module t; endmodule"}, headers={"Authorization": "Bearer invalid_token"})
    assert res.status_code == 401
    assert "Invalid or expired" in res.json()["detail"]
