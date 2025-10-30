import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure backend is in Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="module")
def business_id(client):
    # Step 1: Create Alice
    response_user = client.post("/users/", json={
        "email": "alice@example.com",
        "name": "Alice",
        "auth_provider": "email",
        "password_hash": "hashed_pw_1"
    })
    assert response_user.status_code in (200, 409)

    # Step 2: Get Alice's user_id (requires this endpoint to exist)
    response_lookup = client.get("/users/by-email/alice@example.com")
    assert response_lookup.status_code == 200
    alice_id = response_lookup.json()["user_id"]

    # Step 3: Create business for Alice
    response_business = client.post("/business/", json={
        "owner_id": alice_id,
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
    assert response_business.status_code == 200
    return response_business.json()["business_id"]
