import os
import pytest
from unittest.mock import MagicMock

# Set testing environment variable BEFORE importing any app modules
os.environ["TESTING"] = "1"

# Mock google auth to prevent hanging on metadata server checks during CI/CD
import google.auth

google.auth.default = MagicMock(return_value=(MagicMock(), "dummy-project"))

from fastapi.testclient import TestClient  # noqa: E402
from app.main import app  # noqa: E402
from app.core.database import init_db, DB_PATH  # noqa: E402


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
