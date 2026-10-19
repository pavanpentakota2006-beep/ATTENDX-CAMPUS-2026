package com.attendx.campus.leave;

import com.attendx.campus.student.Student;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leave_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false, length = 50)
    private String leaveType; // MEDICAL, ON_DUTY, OD_SPORTS, PERSONAL, HACKATHON

    @Column(nullable = false)
    private LocalDate fromDate;

    @Column(nullable = false)
    private LocalDate toDate;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    private String documentProofUrl;

    @Builder.Default
    @Column(length = 50)
    private String status = "PENDING"; // PENDING, APPROVED_BY_FACULTY, APPROVED_BY_HOD, REJECTED

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
