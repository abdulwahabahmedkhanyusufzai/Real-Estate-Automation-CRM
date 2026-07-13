import os
import sqlite3
from app.core.config import BASE_DIR

if os.getenv("TESTING") == "1":
    DB_PATH = os.path.join(BASE_DIR, "test_users.db")
else:
    DB_PATH = os.getenv("DB_PATH", os.path.join(BASE_DIR, "users.db"))


def init_db():
    """Initializes the database schema for users if it doesn't exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # WAL mode allows concurrent reads while a write is in progress.
    # In the default journal mode, any write locks out all readers.
    cursor.execute("PRAGMA journal_mode=WAL")

    # SQLite does not enforce foreign keys by default — enable explicitly.
    cursor.execute("PRAGMA foreign_keys=ON")

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
            whatsapp_disconnected INTEGER DEFAULT 0,
            imap_host TEXT,
            imap_port INTEGER DEFAULT 993,
            imap_user TEXT,
            imap_password TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)
    # Idempotency table: tracks processed WhatsApp message IDs to prevent duplicate replies
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS processed_whatsapp_messages (
            message_id TEXT PRIMARY KEY,
            processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # --- Performance indexes (idempotent — ignored if already exist) ---
    # Login lookup: O(log n) username search instead of full table scan
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_users_username
        ON users (username)
    """)
    # Webhook routing: O(log n) phone_number_id → user_id mapping
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_integrations_phone_number_id
        ON user_integrations (whatsapp_phone_number_id)
    """)
    # Periodic cleanup: find old idempotency records by date efficiently
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_processed_messages_processed_at
        ON processed_whatsapp_messages (processed_at)
    """)

    conn.commit()
    conn.close()
