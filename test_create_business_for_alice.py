def test_create_business_for_alice(client):
    # Step 1: Create Alice
    client.post("/users/", json={
        "email": "alice@example.com",
        "name": "Alice",
        "auth_provider": "email",
        "password_hash": "hashed_pw_1"
    })

    # Step 2: Fetch Alice's user_id from DB (optional)
    # Or hardcode if you know it's deterministic

    # Step 3: Create Business for Alice
    response = client.post("/business/", json={
        "owner_id": "1f105e3e-6a7f-49c4-a861-0122d0a1e2d2",  # must match Alice's user_id
        "name": "Alice's Salon",
        "description": "Premium hair and beauty services",
        "business_type": "salon",
        "phone": "9876543210",
        "website": "https://alicesalon.com",
        "address": "123 Beauty Street, Delhi",
        "latitude": 28.6139,
        "LONGITUDDE": 77.2090,
        "timezone": "Asia/Kolkata",
        "quote_slogan": "Elegance in every strand",
        "identification_mark": "Pink storefront",
        "published": True
    })

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Alice's Salon"
