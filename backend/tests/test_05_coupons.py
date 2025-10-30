from datetime import datetime, timedelta

def test_create_coupon(client, business_id):
    now = datetime.utcnow()
    response = client.post("/coupons/", json={
        "business_id": business_id,
        "code": "WELCOME10",
        "description": "10% off for new customers",
        "discount_value": "10%",
        "valid_from": now.isoformat(),
        "valid_until": (now + timedelta(days=30)).isoformat(),
        "terms_conditions": "Valid once per user",
        "is_active": True
    })
    assert response.status_code == 200
