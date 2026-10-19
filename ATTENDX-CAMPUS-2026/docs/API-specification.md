# ATTENDX CAMPUS 2026: REST API Specification

## 1. AI Service Endpoints (FastAPI — Port 8000)

### 1.1 Anomaly Detection: Attendance Scan
- **Method**: `POST`
- **Path**: `/api/v1/ai/anomaly/detect-scan`
- **Request Body**:
```json
{
  "student_id": "22CS045",
  "session_id": "sess-uuid-ml-today-101",
  "scan_delay_seconds": 4.5,
  "distance_meters": 8.2,
  "ip_subnet_match": true,
  "device_id": "dev-hash-88910",
  "historical_attendance_rate": 0.85,
  "period_slot_index": 2,
  "day_of_week": 1
}
```
- **Response (200 OK)**:
```json
{
  "is_anomaly": false,
  "anomaly_score": 0.124,
  "verdict": "VERIFIED",
  "flag_reasons": [],
  "confidence": 0.94,
  "model_version": "1.2.0-IForest-CampusShield"
}
```

### 1.2 Attendance Shortage Risk Prediction
- **Method**: `POST`
- **Path**: `/api/v1/ai/predict/shortage-risk`
- **Request Body**:
```json
{
  "student_id": "22CS112",
  "subject_code": "CS402",
  "total_classes_held": 28,
  "classes_attended": 19,
  "total_planned_classes": 60,
  "consecutive_absences": 2,
  "medical_leaves_approved": 0,
  "days_until_exam": 35
}
```
- **Response (200 OK)**:
```json
{
  "student_id": "22CS112",
  "subject_code": "CS402",
  "current_percentage": 67.9,
  "projected_final_percentage": 69.4,
  "risk_level": "HIGH",
  "shortage_probability": 0.72,
  "lectures_needed_to_reach_75": 8,
  "can_recover": true,
  "recommended_action": "Attendance shortage alert: Must attend at least 8 more classes to restore safe 75% standing.",
  "trend_direction": "DOWNWARD"
}
```

### 1.3 AI Model Performance Metrics
- **Method**: `GET`
- **Path**: `/api/v1/ai/metrics`
- **Response**: Returns ROC-AUC, Precision, Recall, and feature sets for Isolation Forest & Random Forest models.

---

## 2. Core Backend Endpoints (Spring Boot — Port 8080)

### 2.1 Authentication
- `POST /api/v1/auth/login`: Authenticates credentials (BCrypt verification) and returns JWT bearer token + role.

### 2.2 Academic Calendar & Campus Clock
- `GET /api/v1/academic-calendar/today`: Returns current date in IST, active day of the week, holiday/exam flags, and effective timetable day to load.
- `GET /api/v1/academic-calendar/all`: Returns all scheduled calendar overrides.
- `POST /api/v1/academic-calendar/entry`: Admin creates holiday or compensatory working Saturday.

### 2.3 Master Timetable
- `GET /api/v1/timetable/student?day={DAY}&semester={SEM}&section={SEC}`: Returns ordered period slots for student.
- `GET /api/v1/timetable/faculty/{facultyId}?day={DAY}`: Returns faculty lecture allocations.

### 2.4 Live Attendance Sessions & Dynamic QR
- `POST /api/v1/attendance/session/start?timetableSlotId={ID}&facultyId={ID}`: Initiates live lecture attendance window.
- `GET /api/v1/attendance/session/{sessionId}/qr-token`: Mints next rotating SHA-256 HMAC dynamic token (20s TTL).
- `POST /api/v1/attendance/scan`: Student check-in endpoint verifying token, geo-distance, and forwarding to AI service.
- `GET /api/v1/attendance/session/{sessionId}/records`: Returns live classroom check-in roster.

### 2.5 Leaves & Attendance Dispute Corrections
- `GET /api/v1/leave/student/{studentId}`: Student leaves history.
- `POST /api/v1/leave/submit`: Applies for On-Duty or Medical leave.
- `PUT /api/v1/leave/{id}/review?status={APPROVED|REJECTED}`: HOD approval.
- `POST /api/v1/correction/submit`: Files an attendance correction dispute.
- `PUT /api/v1/correction/{id}/review`: Faculty resolution of dispute.
