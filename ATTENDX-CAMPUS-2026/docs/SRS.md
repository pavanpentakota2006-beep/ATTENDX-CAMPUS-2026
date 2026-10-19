# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
## ATTENDX CAMPUS 2026: An AI-Powered Smart Attendance and Academic Monitoring System
**Document Version:** 1.0.0  
**Project Domain:** Full-Stack Web Development, Artificial Intelligence, and Academic Management  
**Target Platform:** Web, Mobile-Responsive Runtimes  

---

### 1. INTRODUCTION

#### 1.1 Purpose
This document specifies the software requirements for **ATTENDX CAMPUS 2026**, an enterprise-grade academic platform designed to automate attendance management, synchronize live timetables against India Standard Time (IST), safeguard against proxy check-ins using rotating dynamic QR codes and machine learning, and provide actionable academic monitoring to prevent student debarment.

#### 1.2 Scope
The system spans four primary subsystems:
1. **Frontend Web Application (React + TypeScript + Vite + Tailwind CSS)**: Role-specific portals for Students, Faculty, Heads of Department (HOD), and Administrators.
2. **Backend Core Service (Java 21 + Spring Boot 3 + Spring Security + JWT)**: Business logic, timetable routing, dynamic token minting, and data persistence with MySQL 8.
3. **AI Analytics & Anomaly Detection Service (Python 3.14 + FastAPI + scikit-learn)**: Isolation Forest proxy anomaly detection and Random Forest attendance shortage forecasting.
4. **Database & Infrastructure**: Relational MySQL schema with Flyway migrations and multi-container Docker deployment.

#### 1.3 Key Definitions & Acronyms
- **IST**: India Standard Time (UTC+05:30).
- **TTL**: Time-To-Live (20-second token lifetime for dynamic QR codes).
- **HMAC**: Hash-Based Message Authentication Code.
- **Isolation Forest**: Unsupervised tree-based anomaly detection algorithm for isolating fraudulent check-ins.
- **Random Forest**: Supervised ensemble algorithm for attendance trajectory and shortage risk classification.
- **HOD**: Head of Department.
- **OD**: On-Duty leave (authorized academic/sports leave).

---

### 2. OVERALL DESCRIPTION

#### 2.1 Product Perspective
Traditional manual roll calls and static QR codes suffer from proxy attendance, administrative latency, and lack of real-time visibility. ATTENDX CAMPUS 2026 integrates the campus clock directly with academic timetable schedules and applies machine learning at the point of scan to eliminate proxy check-ins and predict debarment risks before mid-term evaluations.

#### 2.2 User Classes & Characteristics
1. **Student**:
   - Views today's live timetable and active lecture status.
   - Scans dynamic QR codes using mobile browser/camera.
   - Monitors subject-wise attendance percentages and AI shortage warnings.
   - Submits leave requests (Medical/On-Duty) and attendance correction disputes.
2. **Faculty**:
   - Initiates lecture attendance sessions for allocated periods.
   - Displays self-refreshing dynamic QR codes (20s cycle) on classroom projectors.
   - Manages live classroom roster with manual override toggles.
   - Reviews student attendance correction disputes.
3. **Head of Department (HOD)**:
   - Evaluates department-wide attendance benchmarks (target ≥75%).
   - Inspects the AI Shortage Radar to dispatch early warnings to students at risk.
   - Approves student On-Duty and medical leave applications.
   - Audits faculty class conduction compliance.
4. **Administrator**:
   - Manages academic calendar dates, exams, and compensatory working Saturdays (e.g., Saturday follows Tuesday timetable).
   - Resolves security incidents from the real-time AI anomaly detection feed.
   - Oversees campus user provisioning and system audit logs.

---

### 3. FUNCTIONAL REQUIREMENTS

#### 3.1 Live Campus Clock & Calendar Synchronization
- **FR-01**: System shall track the current date, weekday, and time synchronized with India Standard Time (`Asia/Kolkata`).
- **FR-02**: System shall automatically detect date rollovers at midnight and update active weekday timetable routing.
- **FR-03**: System shall map current time against instructional periods (Periods 1 to 6) and display active progress and remaining minutes.
- **FR-04**: System shall support substitute schedule declarations (e.g. Saturday 24th Oct operating under Tuesday timetable).

#### 3.2 Secure Dynamic QR Attendance
- **FR-05**: Faculty can initiate an active attendance session mapped to a designated timetable slot and classroom.
- **FR-06**: System shall generate dynamic QR nonces refreshed every 20 seconds using SHA-256 HMAC encryption with session secret salts.
- **FR-07**: Tokens older than 20 seconds or already consumed shall be rejected by the backend.
- **FR-08**: Geo-fencing validation shall calculate the Haversine distance between student GPS coordinates and classroom centroids (tolerance: 35m).

#### 3.3 AI Anomaly Detection & Fraud Prevention
- **FR-09**: Every student scan payload shall be evaluated in real time by the FastAPI Isolation Forest engine.
- **FR-10**: The model evaluates scan delay, GPS distance, IP subnet match, and historical velocity to return a continuous anomaly score (0.0 to 1.0) and verdict (`VERIFIED`, `SUSPICIOUS`, `REJECTED`).
- **FR-11**: Flagged scans shall be recorded in `ai_anomaly_logs` with specific reason codes.

#### 3.4 AI Attendance Shortage Forecasting
- **FR-12**: System shall calculate attendance percentages per subject and project final semester attendance.
- **FR-13**: When attendance drops below 75%, system shall compute:
  $$\text{Lectures Needed} = \lceil 3 \times \text{TotalHeld} - 4 \times \text{Attended} \rceil$$
- **FR-14**: System shall categorize risk tiers (`SAFE`, `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) and output actionable recovery directives.

#### 3.5 Role-Based Dashboards & Workflows
- **FR-15**: Role-based access control (RBAC) enforced via JWT tokens across Student, Faculty, HOD, and Admin portals.
- **FR-16**: Students can submit dispute tickets with explanatory notes for faculty review.
- **FR-17**: HOD can inspect section comparison distributions (Section 6-A vs 6-B vs 6-C).

---

### 4. NON-FUNCTIONAL REQUIREMENTS

#### 4.1 Performance & Scalability
- Real-time scan verification latency: $< 50\text{ms}$.
- Dynamic QR rotation cycle: 20 seconds.
- Concurrency support: 1,000+ concurrent student check-ins per minute.

#### 4.2 Security Requirements
- Passwords salted and hashed with BCrypt.
- Stateless authentication using JWT tokens with 24-hour expiration.
- Dynamic QR codes are single-use nonces to eliminate screenshot replay attacks.
- Classroom GPS perimeter validation eliminates off-campus proxy check-ins.

#### 4.3 Reliability & Availability
- Database consistency enforced via InnoDB ACID transactions.
- Frontend includes dual-mode data layer: live REST endpoints with intelligent offline fallback.
