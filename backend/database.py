import os
import sys
import sqlite3
import hashlib
import datetime
import jwt

# Detect if running in a test session
IS_TESTING = "pytest" in sys.modules or os.getenv("TESTING") == "1"

if IS_TESTING:
    DB_PATH = os.path.join(os.path.dirname(__file__), "database_test.db")
else:
    DB_PATH = os.path.join(os.path.dirname(__file__), "database.db")

JWT_SECRET = os.getenv("JWT_SECRET_KEY", "vlsi_copilot_super_secure_key_12345!")

def get_db_connection():
    """Establishes and returns a connection to the SQLite database."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the SQLite database tables."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

# Initialize DB on import
init_db()

# Security Helpers
def hash_password(password: str) -> str:
    """Hashes a password securely using PBKDF2 with SHA-256 and a random salt."""
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return salt.hex() + ":" + key.hex()

def verify_password(stored_password_hash: str, provided_password: str) -> bool:
    """Verifies a password against its stored hash."""
    try:
        salt_hex, key_hex = stored_password_hash.split(":", 1)
        salt = bytes.fromhex(salt_hex)
        key = hashlib.pbkdf2_hmac('sha256', provided_password.encode('utf-8'), salt, 100000)
        return key.hex() == key_hex
    except Exception:
        return False

# JWT Helpers
def create_access_token(data: dict) -> str:
    """Generates a secure JWT token that expires in 24 hours."""
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    to_encode.update({"exp": int(expire.timestamp())})
    return jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")

def decode_access_token(token: str) -> dict:
    """Decodes and validates a JWT token."""
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        return None
