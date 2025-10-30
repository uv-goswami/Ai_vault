def test_create_service(client, business_id):
    response = client.post("/services/", json={
        "business_id": business_id,
        "service_type": "salon",
        "name": "Haircut",
        "description": "Basic haircut",
        "price": 499.0
    })
    assert response.status_code == 200
