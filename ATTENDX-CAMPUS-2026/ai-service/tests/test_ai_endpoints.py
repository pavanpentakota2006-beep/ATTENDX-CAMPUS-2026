import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/v1/ai/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "ATTENDX CAMPUS 2026" in data["service"]

def test_metrics_endpoint():
    response = client.get("/api/v1/ai/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "anomaly_detector" in data
    assert "shortage_predictor" in data

def test_anomaly_detection_normal_scan():
    # Normal scan: close distance, fast reasonable delay, same IP subnet
    payload = {
        "student_id": "STU2026001",
        "session_id": "sess-uuid-101",
        "scan_delay_seconds": 4.5,
        "distance_meters": 6.2,
        "ip_subnet_match": True,
        "device_id": "dev-hash-87291a",
        "historical_attendance_rate": 0.88,
        "period_slot_index": 2,
        "day_of_week": 1
    }
    response = client.post("/api/v1/ai/anomaly/detect-scan", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_anomaly"] is False
    assert data["verdict"] == "VERIFIED"
    assert data["anomaly_score"] < 0.60

def test_anomaly_detection_geo_spoof():
    # Spoofed scan: 180 meters away from classroom, external cell IP
    payload = {
        "student_id": "STU2026002",
        "session_id": "sess-uuid-101",
        "scan_delay_seconds": 2.1,
        "distance_meters": 185.0,
        "ip_subnet_match": False,
        "device_id": "dev-hash-proxy",
        "historical_attendance_rate": 0.50,
        "period_slot_index": 2,
        "day_of_week": 1
    }
    response = client.post("/api/v1/ai/anomaly/detect-scan", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_anomaly"] is True
    assert data["verdict"] in ["SUSPICIOUS", "REJECTED"]
    assert len(data["flag_reasons"]) > 0

def test_shortage_prediction_safe_student():
    payload = {
        "student_id": "STU2026003",
        "subject_code": "CS401",
        "total_classes_held": 30,
        "classes_attended": 27,
        "total_planned_classes": 60,
        "consecutive_absences": 0,
        "medical_leaves_approved": 0,
        "days_until_exam": 40
    }
    response = client.post("/api/v1/ai/predict/shortage-risk", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["current_percentage"] == 90.0
    assert data["risk_level"] in ["SAFE", "LOW"]
    assert data["lectures_needed_to_reach_75"] == 0

def test_shortage_prediction_critical_student():
    # Student with only 12 out of 25 attended = 48%
    payload = {
        "student_id": "STU2026004",
        "subject_code": "CS402",
        "total_classes_held": 25,
        "classes_attended": 12,
        "total_planned_classes": 60,
        "consecutive_absences": 3,
        "medical_leaves_approved": 0,
        "days_until_exam": 30
    }
    response = client.post("/api/v1/ai/predict/shortage-risk", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["current_percentage"] == 48.0
    assert data["risk_level"] in ["HIGH", "CRITICAL"]
    assert data["lectures_needed_to_reach_75"] > 0
    assert "consecutive classes" in data["recommended_action"] or "shortage" in data["recommended_action"].lower()

def test_vision_scan_valid_student_id_card():
    payload = {
        "scan_mode": "CAMPUS_ID_CARD_OCR_BARCODE",
        "card_payload": {
            "roll_number": "22CS089",
            "full_name": "Priya Patel",
            "department_code": "CSE",
            "semester": 6,
            "section": "A"
        },
        "distance_meters": 5.2
    }
    response = client.post("/api/v1/ai/vision/scan-student-id", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_verified"] is True
    assert data["verdict"] == "VERIFIED"
    assert data["attendance_status"] == "PRESENT"
    assert data["student"]["roll_number"] == "22CS089"
    assert data["student"]["full_name"] == "Priya Patel"
    assert data["match_confidence"] >= 0.85

def test_vision_scan_counterfeit_rejected():
    payload = {
        "scan_mode": "CAMPUS_ID_CARD_OCR_BARCODE",
        "card_payload": {
            "roll_number": "FAKE999",
            "is_counterfeit": True
        },
        "distance_meters": 12.0
    }
    response = client.post("/api/v1/ai/vision/scan-student-id", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_verified"] is False
    assert data["verdict"] == "REJECTED"
    assert data["attendance_status"] == "REJECTED"
    assert len(data["flag_reasons"]) > 0

