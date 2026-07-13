import hashlib
import hmac
import os
import sqlite3
from typing import Dict, Any, Optional
from app.core.database import connect_db


def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    """Hashes a password with a salt using PBKDF2 with SHA-256."""
    if salt is None:
        salt_bytes = os.urandom(16)
    else:
        salt_bytes = bytes.fromhex(salt)

    # Deriving hash
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt_bytes, 100000)
    return key.hex(), salt_bytes.hex()


def verify_password(password: str, password_hash: str, salt: str) -> bool:
    """Verifies a password against a hash and salt using constant-time comparison."""
    key, _ = hash_password(password, salt)
    # hmac.compare_digest prevents timing oracle attacks — comparison takes
    # the same time regardless of how many characters match.
    return hmac.compare_digest(key, password_hash)


def register_user(username: str, password: str) -> Dict[str, Any]:
    """Registers a new user and returns user info. Raises ValueError if username exists."""
    username = username.strip()
    if not username or not password:
        raise ValueError("Username and password cannot be empty")

    password_hash, salt = hash_password(password)

    conn = connect_db()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (username, password_hash, salt) VALUES (?, ?, ?)",
            (username, password_hash, salt),
        )
        conn.commit()
        user_id = cursor.lastrowid
        return {"id": user_id, "username": username}
    except sqlite3.IntegrityError:
        raise ValueError("Username already exists")
    finally:
        conn.close()


def authenticate_user(username: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticates a user and returns user info, or None if authentication fails."""
    username = username.strip()
    conn = connect_db()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, username, password_hash, salt FROM users WHERE username = ?",
            (username,),
        )
        row = cursor.fetchone()

        if not row:
            # Run a dummy hash so response time is identical whether the user
            # exists or not. Without this, an attacker can enumerate valid
            # usernames by measuring which requests return faster (no DB hit).
            hash_password(password)
            return None

        user_id, username, password_hash, salt = row
        if verify_password(password, password_hash, salt):
            return {"id": user_id, "username": username}
        return None
    finally:
        conn.close()
