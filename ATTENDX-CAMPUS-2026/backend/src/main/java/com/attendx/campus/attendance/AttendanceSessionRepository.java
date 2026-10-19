package com.attendx.campus.attendance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, String> {
    Optional<AttendanceSession> findByTimetableSlotIdAndSessionDateAndStatus(Long timetableSlotId, LocalDate sessionDate, String status);
    List<AttendanceSession> findByFacultyIdAndSessionDate(Long facultyId, LocalDate sessionDate);
    List<AttendanceSession> findByStatus(String status);
}
