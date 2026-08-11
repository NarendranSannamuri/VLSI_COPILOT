import sqlite3
from fastapi import APIRouter, HTTPException, Header, Depends, status
from pydantic import BaseModel, EmailStr
from backend.database import get_db_connection, hash_password, verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

class UserAuthSchema(BaseModel):
    email: EmailStr
    password: str

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_data: UserAuthSchema):
    email = user_data.email.strip().lower()
    password = user_data.password

    if len(password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    pwd_hash = hash_password(password)

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (email, password_hash) VALUES (?, ?)",
            (email, pwd_hash)
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered."
        )

    # Retrieve the new user's ID
    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    user_row = cursor.fetchone()
    conn.close()

    return {
        "message": "User registered successfully.",
        "user": {
            "id": user_row["id"],
            "email": email
        }
    }

@router.post("/login")
def login(user_data: UserAuthSchema):
    email = user_data.email.strip().lower()
    password = user_data.password

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT password_hash FROM users WHERE email = ?", (email,))
    row = cursor.fetchone()
    conn.close()

    if not row or not verify_password(row["password_hash"], password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Valid; create access token
    token = create_access_token({"email": email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "email": email
        }
    }

def get_current_user_email(authorization: str = Header(None)):
    """Dependency helper to get current logged-in user from token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token is missing or malformed."
        )
    token = authorization.split(" ", 1)[1]
    payload = decode_access_token(token)
    if not payload or "email" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token."
        )
    return payload["email"]

@router.get("/me")
def get_me(email: str = Depends(get_current_user_email)):
    return {
        "email": email
    }
