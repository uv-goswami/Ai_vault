def test_upload_media(client, business_id):
    response = client.post("/media/", json={
        "business_id": business_id,
        "media_type": "image",
        "url": "https://example.com/image.jpg",
        "alt_text": "Salon interior"
    })
    assert response.status_code == 200
