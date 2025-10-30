def test_create_user_alice(client):
    response = client.post("/users/", json={
        "email": "alice@example.com",
        "name": "Alice",
        "auth_provider": "email",
        "password_hash": "hashed_pw_1"
    })
    assert response.status_code in (200, 409)
