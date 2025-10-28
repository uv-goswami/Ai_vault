def test_create_service(client):
    response = client.post("/services/", json={
        "business_id": "11111111-1111-1111-1111-111111111111",
        "service_type": "restaurant",
        "name": "Brunch Buffet",
        "description": "Unlimited brunch from 10am–2pm",
        "price": 499.00,
        "currency": "INR"
    })
    assert response.status_code == 200
    assert "service_id" in response.json()
