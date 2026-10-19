package com.attendx.campus.correction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CorrectionRepository extends JpaRepository<AttendanceCorrection, Long> {
    List<AttendanceCorrection> findByStudentId(Long studentId);
    List<AttendanceCorrection> findBySessionFacultyIdAndStatus(Long facultyId, String status);
    List<AttendanceCorrection> findByStatus(String status);
}
