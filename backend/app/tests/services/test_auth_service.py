import pytest
from app.services.auth_service import (
    hash_password,
    verify_password,
    register_user,
    authenticate_user,
)


def test_password_hashing():
    password = "secret_password"
    pwd_hash, salt = hash_password(password)
    assert pwd_hash is not None
    assert salt is not None
    assert len(pwd_hash) > 0
    assert len(salt) > 0

    assert verify_password(password, pwd_hash, salt) is True
    assert verify_password("wrong_password", pwd_hash, salt) is False


def test_register_and_authenticate():
    username = "test_user_unique"
    password = "my_password"

    # Test registration
    user_info = register_user(username, password)
    assert user_info["username"] == username
    assert "id" in user_info

    # Test authenticating registered user
    authenticated = authenticate_user(username, password)
    assert authenticated is not None
    assert authenticated["username"] == username
    assert authenticated["id"] == user_info["id"]

    # Test authenticating with wrong password
    assert authenticate_user(username, "wrong_password") is None

    # Test authenticating non-existent user
    assert authenticate_user("non_existent", password) is None


def test_register_duplicate_username():
    username = "duplicate_user"
    password = "password123"

    # Register once
    register_user(username, password)

    # Register again with same username should raise ValueError
    with pytest.raises(ValueError, match="Username already exists"):
        register_user(username, password)


def test_register_empty_credentials():
    with pytest.raises(ValueError, match="Username and password cannot be empty"):
        register_user("", "pass")
    with pytest.raises(ValueError, match="Username and password cannot be empty"):
        register_user("user", "")
