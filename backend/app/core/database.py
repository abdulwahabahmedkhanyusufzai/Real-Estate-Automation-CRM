import os
import sqlite3
from app.core.config import BASE_DIR

if os.getenv("TESTING") == "1":
    DB_PATH = os.path.join(BASE_DIR, "test_users.db")
else:
    DB_PATH = os.getenv("DB_PATH", os.path.join(BASE_DIR, "users.db"))

# Determine if we are using PostgreSQL in production
IS_POSTGRES = False
DATABASE_URL = os.getenv("DATABASE_URL")
POSTGRES_HOST = os.getenv("POSTGRES_HOST")

if os.getenv("TESTING") == "1":
    IS_POSTGRES = False
elif DATABASE_URL or POSTGRES_HOST:
    IS_POSTGRES = True


class DbRow:
    def __init__(self, description, row_tuple):
        self._description = description
        self._row = row_tuple
        self._keys = [col[0] for col in description]
        self._dict = dict(zip(self._keys, row_tuple))

    def __getitem__(self, key):
        if isinstance(key, int):
            return self._row[key]
        return self._dict[key]

    def keys(self):
        return self._keys

    def __iter__(self):
        return iter(self._row)

    def __len__(self):
        return len(self._row)


def translate_query(query: str, is_postgres: bool) -> str:
    if not is_postgres:
        return query
    
    # 1. Convert placeholders ? -> %s
    # In SQLite, ? is used. In psycopg2, %s is used.
    translated = query.replace("?", "%s")
    
    # 2. Convert autoincrement definitions for Postgres table creation
    if "INTEGER PRIMARY KEY AUTOINCREMENT" in translated:
        translated = translated.replace("INTEGER PRIMARY KEY AUTOINCREMENT", "SERIAL PRIMARY KEY")
        
    # 3. Convert INSERT OR IGNORE syntax
    # e.g., INSERT OR IGNORE INTO processed_whatsapp_messages (message_id) VALUES (%s)
    # to INSERT INTO processed_whatsapp_messages (message_id) VALUES (%s) ON CONFLICT (message_id) DO NOTHING
    if "INSERT OR IGNORE" in translated:
        if "processed_whatsapp_messages" in translated:
            translated = "INSERT INTO processed_whatsapp_messages (message_id) VALUES (%s) ON CONFLICT (message_id) DO NOTHING"
            
    # 4. Convert table listing queries
    if "sqlite_master" in translated:
        translated = "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
        
    return translated


class PostgresCursorWrapper:
    def __init__(self, cursor):
        self._cursor = cursor
        self._lastrowid = None

    def execute(self, query, params=None):
        import psycopg2
        translated = translate_query(query, is_postgres=True)
        
        # Check if we need to return inserted ID for lastrowid
        # e.g., INSERT INTO users (username, password_hash, salt) VALUES (%s, %s, %s)
        if "INSERT INTO users" in translated and "RETURNING id" not in translated:
            translated += " RETURNING id"
            try:
                self._cursor.execute(translated, params)
                row = self._cursor.fetchone()
                if row:
                    self._lastrowid = row[0]
            except psycopg2.IntegrityError as e:
                # Map to sqlite3.IntegrityError to keep service catch blocks functional
                raise sqlite3.IntegrityError(str(e))
        else:
            try:
                self._cursor.execute(translated, params)
            except psycopg2.IntegrityError as e:
                raise sqlite3.IntegrityError(str(e))
        return self

    def fetchone(self):
        row = self._cursor.fetchone()
        if row is None:
            return None
        return DbRow(self._cursor.description, row)

    def fetchall(self):
        rows = self._cursor.fetchall()
        return [DbRow(self._cursor.description, r) for r in rows]

    def __iter__(self):
        return iter(self.fetchall())

    @property
    def lastrowid(self):
        return self._lastrowid


class DbConnectionWrapper:
    def __init__(self, conn, is_postgres=True):
        self._conn = conn
        self._is_postgres = is_postgres

    def cursor(self):
        cursor = self._conn.cursor()
        if self._is_postgres:
            return PostgresCursorWrapper(cursor)
        return cursor

    def commit(self):
        self._conn.commit()

    def close(self):
        self._conn.close()

    @property
    def row_factory(self):
        return None

    @row_factory.setter
    def row_factory(self, val):
        pass


def connect_db():
    """Returns a database connection. Connects to PostgreSQL if enabled, otherwise SQLite."""
    if IS_POSTGRES:
        import psycopg2
        if DATABASE_URL:
            conn = psycopg2.connect(DATABASE_URL)
        else:
            user = os.getenv("POSTGRES_USER", "postgres")
            password = os.getenv("POSTGRES_PASSWORD", "")
            db = os.getenv("POSTGRES_DB", "postgres")
            host = os.getenv("POSTGRES_HOST", "localhost")
            port = os.getenv("POSTGRES_PORT", "5432")
            conn = psycopg2.connect(
                dbname=db,
                user=user,
                password=password,
                host=host,
                port=port
            )
        return DbConnectionWrapper(conn, is_postgres=True)
    else:
        return sqlite3.connect(DB_PATH)


def init_db():
    """Initializes the database schema if it doesn't exist."""
    conn = connect_db()
    cursor = conn.cursor()

    if not IS_POSTGRES:
        # SQLite-specific optimization settings
        cursor.execute("PRAGMA journal_mode=WAL")
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
    # Idempotency table
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
