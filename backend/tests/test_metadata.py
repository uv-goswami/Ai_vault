def test_create_metadata(client):
    response = client.post("/metadata/", json={
        "business_id": "11111111-1111-1111-1111-111111111111",
        "extracted_insights": "Popular during brunch hours",
        "detected_entities": "brunch, buffet",
        "keywords": "brunch, buffet, café",
        "intent_labels": "food, dining"
    })
    assert response.status_code == 200
    assert "ai_metadata_id" in response.json()
