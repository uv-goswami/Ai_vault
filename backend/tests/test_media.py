def test_upload_media(client):
    response = client.post("/media/", json={
        "business_id": "11111111-1111-1111-1111-111111111111",
        "media_type": "image",
        "url": "https://example.com/cafe.jpg",
        "description": "Front view of Alice's Café"
    })
    assert response.status_code == 200
    assert "media_id" in response.json()
