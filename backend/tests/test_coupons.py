def test_create_coupon(client):
    response = client.post("/coupons/", json={
        "business_id": "11111111-1111-1111-1111-111111111111",
        "code": "BRUNCH50",
        "description": "50% off brunch buffet",
        "discount_value": "50%",
        "valid_from": "2025-10-01T00:00:00Z",
        "valid_until": "2025-12-31T23:59:59Z",
        "terms_conditions": "Valid once per user"
    })
    assert response.status_code == 200
    assert "coupon_id" in response.json()
