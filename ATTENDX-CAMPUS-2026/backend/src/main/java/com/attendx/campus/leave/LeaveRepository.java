package com.attendx.campus.leave;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByStudentId(Long studentId);
    List<LeaveRequest> findByStatus(String status);
}
