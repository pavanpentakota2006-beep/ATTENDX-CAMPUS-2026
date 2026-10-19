-- =====================================================================
-- ATTENDX CAMPUS 2026: Comprehensive Seed Data
-- =====================================================================

USE attendx_campus_db;

-- 1. Departments
INSERT INTO departments (id, code, name, building) VALUES
(1, 'CSE', 'Computer Science and Engineering', 'Turing Academic Block A'),
(2, 'ECE', 'Electronics and Communication Engineering', 'Tesla Tech Block B'),
(3, 'ME', 'Mechanical Engineering', 'Newton Mechanical Lab Complex')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Users (Password hashes are bcrypt for 'Password@123')
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, department_id, phone_number) VALUES
(1, 'admin', 'admin@attendx.campus.edu', '$2a$10$wK1mJqgP3zCg87vVfB7KTeY7yUjK9G5EwB0z3u.x9nK6qYvH7Y2g6', 'Admin', 'Office', 'ADMIN', 1, '+91-9876543210'),
(2, 'hod_cse', 'hod.cse@attendx.campus.edu', '$2a$10$wK1mJqgP3zCg87vVfB7KTeY7yUjK9G5EwB0z3u.x9nK6qYvH7Y2g6', 'Prof. K.', 'Ramanathan', 'HOD', 1, '+91-9876543211'),
(3, 'faculty_sarah', 'sarah.verma@attendx.campus.edu', '$2a$10$wK1mJqgP3zCg87vVfB7KTeY7yUjK9G5EwB0z3u.x9nK6qYvH7Y2g6', 'Dr. Sarah', 'Verma', 'FACULTY', 1, '+91-9876543212'),
(4, 'faculty_ananya', 'ananya.roy@attendx.campus.edu', '$2a$10$wK1mJqgP3zCg87vVfB7KTeY7yUjK9G5EwB0z3u.x9nK6qYvH7Y2g6', 'Prof. Ananya', 'Roy', 'FACULTY', 1, '+91-9876543213'),
(5, 'stu_rahul', 'rahul.sharma@student.campus.edu', '$2a$10$wK1mJqgP3zCg87vVfB7KTeY7yUjK9G5EwB0z3u.x9nK6qYvH7Y2g6', 'Rahul', 'Sharma', 'STUDENT', 1, '+91-9876543214'),
(6, 'stu_priya', 'priya.patel@student.campus.edu', '$2a$10$wK1mJqgP3zCg87vVfB7KTeY7yUjK9G5EwB0z3u.x9nK6qYvH7Y2g6', 'Priya', 'Patel', 'STUDENT', 1, '+91-9876543215'),
(7, 'stu_amit', 'amit.kumar@student.campus.edu', '$2a$10$wK1mJqgP3zCg87vVfB7KTeY7yUjK9G5EwB0z3u.x9nK6qYvH7Y2g6', 'Amit', 'Kumar', 'STUDENT', 1, '+91-9876543216'),
(8, 'stu_sneha', 'sneha.reddy@student.campus.edu', '$2a$10$wK1mJqgP3zCg87vVfB7KTeY7yUjK9G5EwB0z3u.x9nK6qYvH7Y2g6', 'Sneha', 'Reddy', 'STUDENT', 1, '+91-9876543217')
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- 3. Student Profiles
INSERT INTO students (id, user_id, roll_number, registration_no, batch_year, current_semester, section, rfid_tag_id) VALUES
(1, 5, '22CS045', 'RA2211003010045', 2022, 6, 'A', 'RFID-88192-A'),
(2, 6, '22CS089', 'RA2211003010089', 2022, 6, 'A', 'RFID-88193-B'),
(3, 7, '22CS112', 'RA2211003010112', 2022, 6, 'A', 'RFID-88194-C'),
(4, 8, '22CS145', 'RA2211003010145', 2022, 6, 'B', 'RFID-88195-D')
ON DUPLICATE KEY UPDATE roll_number=VALUES(roll_number);

-- 4. Faculty Profiles
INSERT INTO faculty (id, user_id, employee_code, designation, specialization, cabin_room) VALUES
(1, 3, 'FAC-CSE-012', 'Associate Professor', 'Machine Learning & Neural Networks', 'A-312'),
(2, 4, 'FAC-CSE-028', 'Assistant Professor', 'Cloud Architecture & Distributed Systems', 'A-315')
ON DUPLICATE KEY UPDATE employee_code=VALUES(employee_code);

-- 5. Subjects
INSERT INTO subjects (id, code, name, credits, department_id, semester, minimum_attendance_pct) VALUES
(1, 'CS401', 'Applied Machine Learning & Deep Learning', 4, 1, 6, 75.00),
(2, 'CS402', 'Cloud Computing & Microservices', 3, 1, 6, 75.00),
(3, 'CS403', 'Distributed Systems & Blockchain', 4, 1, 6, 75.00),
(4, 'CS404', 'Information Security & Cryptography', 3, 1, 6, 75.00),
(5, 'CS405', 'Compiler Design Lab', 2, 1, 6, 75.00)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 6. Classrooms (Smart rooms with Geo-fence coordinates in campus)
INSERT INTO classrooms (id, room_number, building, capacity, latitude, longitude, geo_radius_meters, wifi_bssid) VALUES
(1, 'LH-301', 'Turing Academic Block A', 70, 12.97160000, 77.59460000, 30.00, 'CAMPUS-WIFI-AP-LH301'),
(2, 'CS-LAB-4', 'Turing Academic Block A', 60, 12.97175000, 77.59470000, 25.00, 'CAMPUS-WIFI-AP-CSL4'),
(3, 'AUD-02', 'Main Campus Auditorium', 250, 12.97210000, 77.59510000, 50.00, 'CAMPUS-WIFI-AP-AUD2')
ON DUPLICATE KEY UPDATE room_number=VALUES(room_number);

-- 7. Academic Calendar (Current 2026 Academic Year)
INSERT INTO academic_calendar (id, calendar_date, day_type, title, description, applies_to_weekday) VALUES
(1, '2026-10-19', 'REGULAR', 'Normal Academic Day', 'Regular classes as per Monday timetable', 'MONDAY'),
(2, '2026-10-24', 'SUBSTITUTE_WORKING_DAY', 'Working Saturday (Follows Tuesday Schedule)', 'Compensatory instructional day for Diwali', 'TUESDAY'),
(3, '2026-11-01', 'HOLIDAY', 'State Formation Day', 'Official campus holiday', NULL),
(4, '2026-11-15', 'EXAMINATION', 'Mid-Term Examinations Phase II', 'Autonomous mid-semester evaluations', NULL)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 8. Timetable Slots (Sample for Monday to Friday, Section A, Semester 6)
INSERT INTO timetable_slots (id, day_of_week, start_time, end_time, period_number, subject_id, faculty_id, classroom_id, section, semester) VALUES
(1, 'MONDAY', '09:00:00', '09:55:00', 1, 1, 1, 1, 'A', 6),
(2, 'MONDAY', '10:00:00', '10:55:00', 2, 2, 2, 1, 'A', 6),
(3, 'MONDAY', '11:15:00', '12:10:00', 3, 3, 1, 1, 'A', 6),
(4, 'MONDAY', '13:00:00', '13:55:00', 4, 4, 2, 1, 'A', 6),
(5, 'MONDAY', '14:00:00', '16:00:00', 5, 5, 1, 2, 'A', 6),
(6, 'TUESDAY', '09:00:00', '09:55:00', 1, 2, 2, 1, 'A', 6),
(7, 'TUESDAY', '10:00:00', '10:55:00', 2, 1, 1, 1, 'A', 6),
(8, 'WEDNESDAY', '09:00:00', '09:55:00', 1, 3, 1, 1, 'A', 6),
(9, 'THURSDAY', '09:00:00', '09:55:00', 1, 4, 2, 1, 'A', 6),
(10, 'FRIDAY', '09:00:00', '09:55:00', 1, 1, 1, 1, 'A', 6)
ON DUPLICATE KEY UPDATE day_of_week=VALUES(day_of_week);

-- 9. Active Attendance Session (Current Live Lecture)
INSERT INTO attendance_sessions (id, timetable_slot_id, faculty_id, session_date, start_time, status, qr_refresh_seconds, secret_salt) VALUES
('sess-uuid-ml-today-101', 1, 1, '2026-10-19', CURRENT_TIMESTAMP, 'ACTIVE', 20, 'SALT_HMAC_791A0B2C98')
ON DUPLICATE KEY UPDATE status='ACTIVE';

-- 10. Sample Attendance Records
INSERT INTO attendance_records (session_id, student_id, verification_mode, status, geo_distance_meters, anomaly_score, is_verified) VALUES
('sess-uuid-ml-today-101', 1, 'DYNAMIC_QR', 'PRESENT', 8.4, 0.1200, TRUE),
('sess-uuid-ml-today-101', 2, 'DYNAMIC_QR', 'PRESENT', 11.2, 0.1400, TRUE),
('sess-uuid-ml-today-101', 3, 'DYNAMIC_QR', 'FLAGGED', 185.0, 0.8920, FALSE)
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 11. AI Anomaly Log (Proxy attempt detected by Isolation Forest)
INSERT INTO ai_anomaly_logs (id, session_id, student_id, anomaly_score, verdict, flag_reasons, distance_meters, scan_delay_seconds, device_id, resolved) VALUES
(1, 'sess-uuid-ml-today-101', 3, 0.8920, 'REJECTED', '["Geo-location fence violation: 185.0m from LH-301", "Network mismatch: External cellular IP detected"]', 185.0, 1.8, 'DEV-SPOOF-003', FALSE)
ON DUPLICATE KEY UPDATE verdict=VALUES(verdict);
