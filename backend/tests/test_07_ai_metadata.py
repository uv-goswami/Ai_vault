def test_create_metadata(client, business_id):
    response = client.post("/metadata/", json={
        "business_id": business_id,
        "extracted_insights": "High engagement",
        "detected_entities": "Haircut, Salon",
        "keywords": "style, beauty",
        "intent_labels": "booking"
    })
    assert response.status_code == 200
