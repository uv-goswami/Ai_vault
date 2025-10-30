def test_visibility_check(client, business_id):
    response = client.post("/visibility/check", json={
        "business_id": business_id,
        "check_type": "visibility",
        "input_data": "Check homepage visibility"
    })
    assert response.status_code == 200
