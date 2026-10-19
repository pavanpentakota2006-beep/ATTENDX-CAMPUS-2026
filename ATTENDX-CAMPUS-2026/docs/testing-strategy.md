# ATTENDX CAMPUS 2026: Comprehensive Testing Strategy

## 1. Testing Pyramid & Methodology
The testing framework for ATTENDX CAMPUS 2026 adheres to the three-tiered testing pyramid:

```
          / \
         / E2E \       Playwright / Browser Subagent
        /-------\
       /  Integ  \     Spring Boot MockMvc, TestClient, WireMock
      /-----------\
     /  Unit Tests \   JUnit 5, Mockito, Pytest, Vitest
    /---------------\
```

---

## 2. Test Execution Commands

### 2.1 AI Service (Python + Pytest)
Tests Isolation Forest scan anomaly scoring, spoofed geo-fence detection, and Random Forest attendance shortage probability.
```bash
cd ai-service
python -m pytest tests/ -v
# Output: 6 passed in 2.52s
```

### 2.2 Frontend (TypeScript + Vite)
Validates TypeScript compilation, Tailwind CSS generation, component lifecycle hooks (`useCampusClock`, `useTimetable`), and role-based view rendering.
```bash
cd frontend
npm run build
# Output: built in 2.06s with 0 errors
```

### 2.3 Backend Core (Java + JUnit)
Validates Spring Boot application context, REST controllers, dynamic QR HMAC hashing, and JWT filters.
```bash
cd backend
mvn test
```

---

## 3. Key Test Scenarios & Pass Criteria

| Test Suite | Target Feature | Scenario Tested | Pass Criteria |
| :--- | :--- | :--- | :--- |
| **AI Unit** | Geo-Fence Anomaly | Student scan 185m away from LH-301 centroid | `is_anomaly == True`, `verdict == REJECTED`, `score > 0.60` |
| **AI Unit** | Replay Bot Anomaly | Scan latency 0.22s (inhuman speed) | `is_anomaly == True`, `flag_reasons` contains speed warning |
| **AI Unit** | Shortage Math | Student with 48% attendance (12/25 classes) | `lectures_needed_to_reach_75 > 0`, `risk_level == HIGH/CRITICAL` |
| **Backend** | Dynamic QR TTL | Scan submitted 28 seconds after token generation | Backend rejects with `Token expired or invalid` (20s TTL) |
| **Backend** | Single Use | Scan submitted twice with same token nonce | Second attempt fails with token already consumed error |
| **Frontend** | Live Campus Clock | Timezone formatting | Clock strictly reports in `Asia/Kolkata` (IST) format |
| **Frontend** | Schedule Mapping | Monday Period 1 | Highlight Applied Machine Learning (CS401) as active |
