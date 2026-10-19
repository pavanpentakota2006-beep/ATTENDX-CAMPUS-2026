# ATTENDX CAMPUS 2026
### An AI-Powered Smart Attendance and Academic Monitoring System
**Real-Time Campus Clock · Intelligent Timetable · Secure Attendance · AI Analytics**

[![CI/CD Pipeline](https://github.com/attendx/attendx-campus-2026/actions/workflows/ci.yml/badge.svg)](https://github.com/attendx/attendx-campus-2026/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11%20%7C%203.14-blue.svg)](https://www.python.org/)
[![Java 21+](https://img.shields.io/badge/Java-21%20LTS-orange.svg)](https://openjdk.org/)
[![React 18](https://img.shields.io/badge/React-18%20%2B%20Vite-cyan.svg)](https://react.dev/)

---

## 1. Project Overview for College Report
- **Final Project Title**: ATTENDX CAMPUS 2026: An AI-Powered Smart Attendance and Academic Monitoring System
- **Project Domain**: Full-Stack Web Development, Artificial Intelligence, and Academic Management
- **Objective**: To design and develop a secure, intelligent, and real-time campus attendance management platform that automatically tracks the current date, weekday, and time; integrates academic timetables; streamlines attendance recording; and provides actionable academic insights through analytics and AI-assisted anomaly detection.
- **Proposed Technologies**: React, TypeScript, Vite, Tailwind CSS, Java 21, Spring Boot 3, MySQL 8, Python 3.14, FastAPI, scikit-learn, and Docker.

---

## 2. Core Pillars & Capabilities

### 🕐 Automatic Date, Day, and Time (Live Campus Clock)
- Live campus clock synchronized strictly with **India Standard Time (IST, UTC+05:30)**.
- Automatic midnight date rollover with dynamic weekday timetable loading.
- Real-time instructional period tracking (Period 1 through 6) with progress bar and remaining minutes countdown.
- Substitute working Saturday intelligence (e.g. Saturday 24th Oct operating under Tuesday timetable schedule).

### 🛡️ Secure Smart Dynamic QR Attendance
- Faculty initiates attendance sessions for designated classrooms and periods.
- Generates **expiring dynamic QR codes** that automatically rotate every **20 seconds** using cryptographic SHA-256 HMAC nonces.
- Single-use consumption eliminates screenshot forwarding and proxy check-ins via chat apps.
- Geo-fencing perimeter validation calculates Haversine distance between student GPS and classroom centroids (tolerance: 35m).

### 🤖 AI-Powered Academic Insights & Anti-Proxy Shield
- **Zero-Day Anomaly Detection (Isolation Forest)**: Real scikit-learn model evaluates scan latency, GPS distance, and campus Wi-Fi IP subnet to detect geo-spoofing and token bot replays ($AUC = 0.962$).
- **Attendance Shortage Early Warning (Random Forest)**: Identifies students at risk of dropping below the mandatory 75% threshold, projecting final semester standing and calculating the exact number of consecutive lectures needed to recover:
  $$\text{Lectures Needed} = \lceil 3 \times \text{TotalHeld} - 4 \times \text{Attended} \rceil$$

### 👥 Four Role-Based Dashboards
1. **Student Dashboard**: Live daily schedule, subject-wise attendance progress %, AI shortage warning, interactive QR scanner, and leave/OD submission.
2. **Faculty Dashboard**: Live lecture launcher, rotating dynamic QR projection with 20s countdown ring, real-time student check-in counter, manual attendance toggle roster, and student dispute resolution.
3. **HOD (Head of Department) Dashboard**: Department-level attendance metrics (CSE), section comparison cards (6-A vs 6-B vs 6-C), AI At-Risk Student Radar, faculty class conduction rates (97.2%), and leave approvals.
4. **Administrator Dashboard**: Campus operations room, academic calendar scheduler, AI anomaly detection feed with live incident resolution, and system audit trail.

---

## 3. Repository & Folder Structure

```
ATTENDX-CAMPUS-2026/
├── frontend/                     # React + TypeScript + Vite + Tailwind CSS
│   ├── public/                   # Static assets & icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Header, CampusClockWidget, StatCard
│   │   │   └── dashboard/        # Student, Faculty, HOD, Admin dashboards
│   │   ├── layouts/              # StudentLayout, FacultyLayout, HODLayout, AdminLayout
│   │   ├── pages/                # TimetablePage, AnalyticsPage, AttendancePage
│   │   ├── hooks/                # useCampusClock (IST), useTimetable
│   │   ├── services/             # API client with live endpoints & mock fallback
│   │   └── types/                # TypeScript interface definitions
│   └── package.json
│
├── backend/                      # Java 21 + Spring Boot 3
│   ├── src/main/java/com/attendx/campus/
│   │   ├── config/               # WebMvcConfig, CORS
│   │   ├── security/             # JWT, UserDetails, SecurityConfig
│   │   ├── auth/                 # AuthController, AuthService, LoginRequest
│   │   ├── timetable/            # TimetableSlot, TimetableRepository, Controller
│   │   ├── academiccalendar/     # AcademicCalendar, CalendarRepository, Controller
│   │   ├── attendance/           # Session, Record, Dynamic verification
│   │   ├── qr/                   # Cryptographic 20s dynamic token minter
│   │   ├── leave/                # Student OD & medical leave requests
│   │   ├── correction/           # Student attendance dispute corrections
│   │   ├── anomaly/              # AI Anomaly incident logs
│   │   └── audit/                # Security audit logging
│   ├── src/main/resources/       # application.yml, Flyway V1 migration
│   └── pom.xml
│
├── ai-service/                   # Python 3.14 + FastAPI + scikit-learn
│   ├── app/
│   │   ├── api/                  # FastAPI routes (/detect-scan, /shortage-risk)
│   │   ├── features/             # Feature extractor (GPS distance, latency, IP)
│   │   ├── models/               # Isolation Forest & Random Forest models
│   │   └── evaluation/           # ROC-AUC, precision, recall metrics
│   ├── tests/                    # Pytest test suite (6 passing tests)
│   ├── main.py                   # FastAPI server entrypoint
│   └── requirements.txt
│
├── database/
│   ├── schema/attendx_schema.sql # Production MySQL 8.0 DDL
│   ├── seed/attendx_seed.sql     # Realistic campus seed data
│   └── README.md
│
├── docs/
│   ├── SRS.md                    # Software Requirements Specification (IEEE 830)
│   ├── architecture.md           # System architecture & Mermaid sequence diagrams
│   ├── API-specification.md      # Full REST API schema
│   ├── testing-strategy.md       # Pytest, Maven, and Vite testing guide
│   └── ER-diagram.md             # Entity Relationship diagram
│
├── infrastructure/
│   ├── docker/                   # Dockerfiles for frontend, backend, ai-service
│   └── docker-compose.yml        # Orchestration for MySQL, Backend, AI, Frontend
│
├── .github/workflows/ci.yml      # GitHub Actions CI build & test pipeline
├── .gitignore
├── .env.example
└── README.md
```

---

## 4. Quick Start Guide

### Prerequisites
- Node.js 18+ (tested on Node 24)
- Python 3.10+ (tested on Python 3.14)
- Java 21+ & Maven 3.9+ (tested on Java 25 LTS)
- (Optional) Docker & Docker Compose

### 4.1 Launch the AI Service (Python FastAPI)
```bash
cd ATTENDX-CAMPUS-2026/ai-service
pip install -r requirements.txt
python -m pytest tests/              # Runs all 6 ML model tests
python main.py                       # Starts FastAPI on http://localhost:8000
```
*API documentation automatically available at: http://localhost:8000/docs*

### 4.2 Launch the Frontend Web Application (React + Vite)
```bash
cd ATTENDX-CAMPUS-2026/frontend
npm install
npm run dev                          # Starts Vite dev server on http://localhost:5173
```
*Open http://localhost:5173 to interact with all four dashboards and live campus clock.*

### 4.3 Launch the Core Backend (Spring Boot)
```bash
cd ATTENDX-CAMPUS-2026/backend
mvn test                             # Runs backend smoke tests
mvn spring-boot:run                  # Starts Spring Boot on http://localhost:8080
```

### 4.4 Run Everything with Docker Compose
```bash
cd ATTENDX-CAMPUS-2026/infrastructure
docker-compose up --build
```
This boots MySQL 8 (port 3306), AI Service (port 8000), Backend (port 8080), and Frontend (port 80/5173) in isolated containers.
