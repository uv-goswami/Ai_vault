from uuid import uuid4

def test_visibility_check(client):
    response = client.post("/visibility/check", json={
        "business_id": "11111111-1111-1111-1111-111111111111",
        "platform": "google_maps",
        "check_type": "basic"
    })
    assert response.status_code == 200
    assert "check_id" in response.json()

def test_visibility_result(client):
    response = client.post("/visibility/result", json={
        "check_id": str(uuid4()),
        "status": "completed",
        "visibility_score": 85,
        "issues_found": "Missing photos",
        "recommendations": "Add photos"
    })
    assert response.status_code in (200, 422)

def test_visibility_suggestion(client):
    response = client.post("/visibility/suggestion", json={
        "business_id": "11111111-1111-1111-1111-111111111111",
        "suggestion_text": "Add a virtual tour",
        "priority": "medium"
    })
    assert response.status_code == 200
    assert "suggestion_id" in response.json()
