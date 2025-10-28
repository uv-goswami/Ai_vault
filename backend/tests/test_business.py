def test_create_business_for_alice(client):
    response = client.post("/business/", json={
        "owner_id": "11111111-1111-1111-1111-111111111111",
        "name": "Alice's Café",
        "description": "Cozy café with brunch specials",
        "business_type": "restaurant"
    })
    assert response.status_code == 200
    assert "business_id" in response.json()
