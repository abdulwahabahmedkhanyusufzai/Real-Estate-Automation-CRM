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
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_integrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            whatsapp_phone_number_id TEXT,
            whatsapp_access_token TEXT,
            whatsapp_verify_token TEXT,
            imap_host TEXT,
            imap_port INTEGER DEFAULT 993,
            imap_user TEXT,
            imap_password TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)
    conn.commit()
    conn.close()
