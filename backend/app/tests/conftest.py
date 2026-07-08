import os
import pytest

# Set testing environment variable BEFORE importing any app modules
os.environ["TESTING"] = "1"

from fastapi.testclient import TestClient
from app.main import app
from app.core.database import init_db, DB_PATH


@pytest.fixture(scope="session", autouse=True)
def test_db():
    # Initialize the test database
    init_db()
    yield
    # Clean up the test database after the test session finishes
    if os.path.exists(DB_PATH):
        try:
            os.remove(DB_PATH)
        except Exception:
            pass


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c
