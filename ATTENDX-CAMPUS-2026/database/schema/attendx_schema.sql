-- =====================================================================
-- ATTENDX CAMPUS 2026: Database Schema (MySQL 8.0+)
-- An AI-Powered Smart Attendance and Academic Monitoring System
-- =====================================================================

CREATE DATABASE IF NOT EXISTS attendx_campus_db 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE attendx_campus_db;

-- 1. Departments
CREATE TABLE IF NOT EXISTS departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    building VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Users & Authentication
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('STUDENT', 'FACULTY', 'HOD', 'ADMIN') NOT NULL,
    department_id BIGINT,
    phone_number VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 3. Student Profiles
CREATE TABLE IF NOT EXISTS students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    roll_number VARCHAR(50) NOT NULL UNIQUE,
    registration_no VARCHAR(50) NOT NULL UNIQUE,
    batch_year INT NOT NULL,
    current_semester INT NOT NULL,
    section VARCHAR(10) NOT NULL,
    rfid_tag_id VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Faculty Profiles
CREATE TABLE IF NOT EXISTS faculty (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    designation VARCHAR(100) NOT NULL,
    specialization VARCHAR(150),
    cabin_room VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Subjects / Courses
CREATE TABLE IF NOT EXISTS subjects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    credits INT NOT NULL DEFAULT 3,
    department_id BIGINT NOT NULL,
    semester INT NOT NULL,
    minimum_attendance_pct DECIMAL(5, 2) DEFAULT 75.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 6. Classrooms & Geo-Fencing
CREATE TABLE IF NOT EXISTS classrooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(50) NOT NULL UNIQUE,
    building VARCHAR(100) NOT NULL,
    capacity INT NOT NULL DEFAULT 60,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    geo_radius_meters DECIMAL(6, 2) NOT NULL DEFAULT 35.00,
    wifi_bssid VARCHAR(100),
    is_smart_room BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 7. Academic Calendar
CREATE TABLE IF NOT EXISTS academic_calendar (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    calendar_date DATE NOT NULL UNIQUE,
    day_type ENUM('REGULAR', 'HOLIDAY', 'EXAMINATION', 'SUBSTITUTE_WORKING_DAY', 'EVENT') NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    applies_to_weekday ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 8. Timetable Slots
CREATE TABLE IF NOT EXISTS timetable_slots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    day_of_week ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    period_number INT NOT NULL,
    subject_id BIGINT NOT NULL,
    faculty_id BIGINT NOT NULL,
    classroom_id BIGINT NOT NULL,
    section VARCHAR(10) NOT NULL,
    semester INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL DEFAULT '2025-2026',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE RESTRICT,
    UNIQUE KEY uq_slot (day_of_week, period_number, classroom_id, semester, section)
) ENGINE=InnoDB;

-- 9. Attendance Sessions (Faculty Initiated)
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id VARCHAR(64) PRIMARY KEY, -- UUID
    timetable_slot_id BIGINT NOT NULL,
    faculty_id BIGINT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    status ENUM('ACTIVE', 'CLOSED', 'CANCELLED') DEFAULT 'ACTIVE',
    qr_refresh_seconds INT DEFAULT 20,
    secret_salt VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (timetable_slot_id) REFERENCES timetable_slots(id) ON DELETE RESTRICT,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 10. Dynamic Expiring QR Tokens
CREATE TABLE IF NOT EXISTS dynamic_qr_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    token_nonce VARCHAR(128) NOT NULL UNIQUE,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_consumed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    INDEX idx_qr_expiry (expires_at, is_consumed)
) ENGINE=InnoDB;

-- 11. Attendance Records
CREATE TABLE IF NOT EXISTS attendance_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    student_id BIGINT NOT NULL,
    scan_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    verification_mode ENUM('DYNAMIC_QR', 'MANUAL_FACULTY', 'BIOMETRIC_PROXY_CHECK', 'DUTY_LEAVE') DEFAULT 'DYNAMIC_QR',
    status ENUM('PRESENT', 'ABSENT', 'LATE', 'ON_LEAVE', 'FLAGGED') DEFAULT 'PRESENT',
    device_fingerprint VARCHAR(128),
    ip_address VARCHAR(45),
    geo_distance_meters DECIMAL(8, 2),
    anomaly_score DECIMAL(5, 4) DEFAULT 0.0000,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY uq_session_student (session_id, student_id)
) ENGINE=InnoDB;

-- 12. Attendance Correction & Dispute Requests
CREATE TABLE IF NOT EXISTS attendance_corrections (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    session_id VARCHAR(64) NOT NULL,
    reason TEXT NOT NULL,
    supporting_document_url VARCHAR(255),
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    reviewed_by BIGINT,
    review_comments TEXT,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 13. Student Leave Requests
CREATE TABLE IF NOT EXISTS leave_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    leave_type ENUM('MEDICAL', 'ON_DUTY', 'OD_SPORTS', 'PERSONAL', 'HACKATHON') NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    reason TEXT NOT NULL,
    document_proof_url VARCHAR(255),
    status ENUM('PENDING', 'APPROVED_BY_FACULTY', 'APPROVED_BY_HOD', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 14. AI Anomaly Audit Logs
CREATE TABLE IF NOT EXISTS ai_anomaly_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64),
    student_id BIGINT,
    anomaly_score DECIMAL(5, 4) NOT NULL,
    verdict ENUM('VERIFIED', 'SUSPICIOUS', 'REJECTED') NOT NULL,
    flag_reasons JSON NOT NULL,
    distance_meters DECIMAL(8, 2),
    scan_delay_seconds DECIMAL(6, 2),
    device_id VARCHAR(100),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Indexes for performance
CREATE INDEX idx_student_user ON students(user_id);
CREATE INDEX idx_faculty_user ON faculty(user_id);
CREATE INDEX idx_timetable_day ON timetable_slots(day_of_week, period_number);
CREATE INDEX idx_att_record_student ON attendance_records(student_id, scan_timestamp);
