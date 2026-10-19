package com.attendx.campus.correction;

import com.attendx.campus.attendance.AttendanceSession;
import com.attendx.campus.student.Student;
import com.attendx.campus.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_corrections")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceCorrection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "session_id", nullable = false)
    private AttendanceSession session;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    private String supportingDocumentUrl;

    @Builder.Default
    @Column(length = 20)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(columnDefinition = "TEXT")
    private String reviewComments;

    private LocalDateTime reviewedAt;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
