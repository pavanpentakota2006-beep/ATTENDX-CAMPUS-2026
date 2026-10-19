package com.attendx.campus.faculty;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    Optional<Faculty> findByEmployeeCode(String employeeCode);
    Optional<Faculty> findByUserId(Long userId);
}
