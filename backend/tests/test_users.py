from uuid import UUID

ALICE_ID = UUID("11111111-1111-1111-1111-111111111111")
BOB_ID = UUID("22222222-2222-2222-2222-222222222222")
CHARLIE_ID = UUID("33333333-3333-3333-3333-333333333333")

demo_users = [
    {
        "user_id": str(ALICE_ID),
        "email": "alice@example.com",
        "name": "Alice",
        "auth_provider": "email",
        "password_hash": "hashed_pw_1"
    },
    {
        "user_id": str(BOB_ID),
        "email": "bob@example.com",
        "name": "Bob",
        "auth_provider": "google",
        "password_hash": "hashed_pw_2"
    },
    {
        "user_id": str(CHARLIE_ID),
        "email": "charlie@example.com",
        "name": "Charlie",
        "auth_provider": "sso",
        "password_hash": "hashed_pw_3"
    }
]

def test_create_demo_users(client):
    for user in demo_users:
        response = client.post("/users/", json=user)
        assert response.status_code in (200, 409)
        if response.status_code == 200:
            assert response.json()["email"] == user["email"]
