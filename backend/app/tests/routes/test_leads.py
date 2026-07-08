def test_qualify_lead_api(client):
    payload = {
        "lead_id": 999,
        "message": "hi, looking for 4 bed villa in dxb hills budget 3m urgent",
        "source": "WhatsApp"
    }
    
    response = client.post("/api/v1/qualify-lead", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    
    extracted = data["data"]
    assert extracted["budget"] == "AED 3M"
    assert extracted["area"] == "Dubai Hills"
    assert extracted["property_type"] == "Villa"
    assert extracted["bedrooms"] == 4
    assert extracted["urgency"] == "High"
