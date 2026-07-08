import os
import sqlite3
from app.core.config import BASE_DIR

if os.getenv("TESTING") == "1":
    DB_PATH = os.path.join(BASE_DIR, "test_users.db")
else:
    DB_PATH = os.path.join(BASE_DIR, "users.db")


def init_db():
    """Initializes the database schema for users if it doesn't exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()
