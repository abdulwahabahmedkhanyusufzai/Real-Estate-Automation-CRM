def test_api_register_and_login(client):
    username = "route_user"
    password = "route_password"
    
    # Register API
    response = client.post("/register", json={"username": username, "password": password})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["user"]["username"] == username
    
    # Register duplicate username API
    response = client.post("/register", json={"username": username, "password": password})
    assert response.status_code == 400
    assert "Username already exists" in response.json()["detail"]
    
    # Login API success
    response = client.post("/login", json={"username": username, "password": password})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["user"]["username"] == username
    
    # Login API failure
    response = client.post("/login", json={"username": username, "password": "wrongpassword"})
    assert response.status_code == 401
    assert "Invalid username or password" in response.json()["detail"]
