package com.attendx.campus.attendance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findBySessionId(String sessionId);
    Optional<AttendanceRecord> findBySessionIdAndStudentId(String sessionId, Long studentId);
    List<AttendanceRecord> findByStudentId(Long studentId);

    @Query("SELECT COUNT(r) FROM AttendanceRecord r WHERE r.student.id = :studentId AND r.session.timetableSlot.subject.id = :subjectId AND r.status = 'PRESENT'")
    long countAttendedClassesByStudentAndSubject(@Param("studentId") Long studentId, @Param("subjectId") Long subjectId);

    @Query("SELECT COUNT(DISTINCT s) FROM AttendanceSession s WHERE s.timetableSlot.subject.id = :subjectId AND s.status = 'CLOSED'")
    long countTotalHeldClassesBySubject(@Param("subjectId") Long subjectId);
}
