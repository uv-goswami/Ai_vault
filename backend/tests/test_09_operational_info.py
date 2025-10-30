def test_create_operational_info(client, business_id):
    response = client.post("/operational-info/", json={
        "business_id": business_id,
        "opening_hours": "09:00",
        "closing_hours": "18:00",
        "off_days": "Sunday",
        "delivery_options": "None",
        "reservation_options": "Walk-in",
        "wifi_available": True,
        "accessibility_features": "Ramp",
        "nearby_parking_spot": "Lot A"
    })
    assert response.status_code == 200
