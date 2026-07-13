import os
import psycopg2
import psycopg2.extras

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://pixxi:pixxi_secure_pass_99@localhost:5432/pixxi_crm"
)


def connect_db():
    """Returns a PostgreSQL database connection."""
    conn = psycopg2.connect(os.getenv("DATABASE_URL", DATABASE_URL))
    return conn


def init_db():
    """Initializes the PostgreSQL database schema if it doesn't exist."""
    conn = connect_db()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_integrations (
            id SERIAL PRIMARY KEY,
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
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS processed_whatsapp_messages (
            message_id TEXT PRIMARY KEY,
            processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Indices
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_users_username
        ON users (username)
    """)
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_integrations_phone_number_id
        ON user_integrations (whatsapp_phone_number_id)
    """)
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_processed_messages_processed_at
        ON processed_whatsapp_messages (processed_at)
    """)

    conn.commit()
    conn.close()
