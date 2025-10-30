from fastapi.testclient import TestClient
from main import app
from uuid import uuid4
import pytest
from db.database import get_db
from db import models

client = TestClient(app)

@pytest.fixture
def business_id():
    db = next(get_db())

    # Create a dummy user first (required for owner_id)
    new_user = models.User(
        user_id=uuid4(),
        name="Test Owner",
        email="owner@example.com",
        password_hash="hashedpassword"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create a business linked to that user
    new_business = models.BusinessProfile(
        business_id=uuid4(),
        owner_id=new_user.user_id,
        name="Test Hair Salon",
        description="Test description",
        business_type="salon"
    )
    db.add(new_business)
    db.commit()
    db.refresh(new_business)
    return str(new_business.business_id)

def test_create_jsonld_feed(business_id):
    response = client.post("/jsonld/", json={
        "business_id": business_id,
        "schema_type": "HairSalon",
        "jsonld_data": "{\"@type\": \"HairSalon\"}",
        "is_valid": True
    })
    print("Response status:", response.status_code)
    print("Response body:", response.json())
    assert response.status_code == 200
