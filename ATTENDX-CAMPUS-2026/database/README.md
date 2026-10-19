# ATTENDX CAMPUS 2026 — Database Specification

## Database Architecture
- **RDBMS**: MySQL 8.0+
- **Database Name**: `attendx_campus_db`
- **Charset**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci`

## Schema Structure
1. `departments`: Academic faculties (CSE, ECE, ME).
2. `users`: Multi-tenant identity table storing RBAC credentials (STUDENT, FACULTY, HOD, ADMIN).
3. `students`: Extended academic record (Roll Number, Registration No, Batch, Semester, RFID).
4. `faculty`: Employee code, designation, specialization, cabin.
5. `subjects`: Courses with credit values and minimum attendance thresholds (default 75%).
6. `classrooms`: Smart rooms with geofenced GPS centroid coordinates (Latitude/Longitude, boundary radius in meters, Wi-Fi BSSID).
7. `academic_calendar`: Indian calendar tracking holidays, substitute working Saturdays (e.g. Saturday following Tuesday timetable), and exams.
8. `timetable_slots`: Weekly period allocations with period numbers, timings, sections, and assigned professors.
9. `attendance_sessions`: Faculty-triggered live attendance windows with cryptographic HMAC secret salt and dynamic QR refresh timers.
10. `dynamic_qr_tokens`: Short-lived nonces (15-30s TTL) used to prevent screenshot sharing or proxy attendance.
11. `attendance_records`: Real-time scan captures with geo-distance, IP, device fingerprints, and verified status.
12. `attendance_corrections`: Student dispute and correction workflow with faculty/HOD review.
13. `leave_requests`: On-duty and medical leaves with document URL attachments.
14. `ai_anomaly_logs`: Flagged proxy check-ins detected via the Python Isolation Forest engine.

## Initialization & Migration
Execute via MySQL client or Spring Boot Flyway:
```bash
# 1. Apply Schema
mysql -u root -p < schema/attendx_schema.sql

# 2. Populate Seed Data
mysql -u root -p attendx_campus_db < seed/attendx_seed.sql
```
