import os
import pytest
from unittest.mock import MagicMock
from urllib.parse import urlparse, urlunparse
import psycopg2

# Set testing environment variable BEFORE importing any app modules
os.environ["TESTING"] = "1"

# Mock google auth to prevent hanging on metadata server checks during CI/CD
import google.auth

google.auth.default = MagicMock(return_value=(MagicMock(), "dummy-project"))

from fastapi.testclient import TestClient  # noqa: E402
from app.main import app  # noqa: E402
from app.core.database import init_db, connect_db  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def test_db():
    # Setup test database
    original_url = os.getenv(
        "DATABASE_URL",
        "postgresql://pixxi:pixxi_secure_pass_99@localhost:5432/pixxi_crm"
    )
    parsed = urlparse(original_url)
    scheme = parsed.scheme
    netloc = parsed.netloc
    
    # We will connect to default database (e.g. "postgres") to create/drop the test DB
    default_db_url = urlunparse((scheme, netloc, "/postgres", "", "", ""))
    test_db_name = "pixxi_crm_test"
    
    # Create test database if not exists
    try:
        conn = psycopg2.connect(default_db_url)
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Check if exists
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (test_db_name,))
        exists = cursor.fetchone()
        if not exists:
            cursor.execute(f"CREATE DATABASE {test_db_name}")
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Warning: Failed to create test database: {e}. Running tests on original DB.")
        test_db_name = parsed.path.lstrip("/")
    
    # Set the test DATABASE_URL in environment variables so app modules use it
    test_db_url = urlunparse((scheme, netloc, f"/{test_db_name}", "", "", ""))
    os.environ["DATABASE_URL"] = test_db_url
    
    # Initialize the test database schema
    init_db()
    
    yield
    
    # Teardown: drop tables in test database to leave it clean
    try:
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("DROP TABLE IF EXISTS processed_whatsapp_messages CASCADE")
        cursor.execute("DROP TABLE IF EXISTS user_integrations CASCADE")
        cursor.execute("DROP TABLE IF EXISTS users CASCADE")
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Warning: Failed to clean up test database: {e}")


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c
