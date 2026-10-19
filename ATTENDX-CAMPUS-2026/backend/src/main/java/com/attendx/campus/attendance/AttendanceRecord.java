package com.attendx.campus.attendance;

import com.attendx.campus.student.Student;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_records")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private AttendanceSession session;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime scanTimestamp = LocalDateTime.now();

    @Builder.Default
    @Column(length = 50)
    private String verificationMode = "DYNAMIC_QR"; // DYNAMIC_QR, MANUAL_FACULTY, DUTY_LEAVE

    @Builder.Default
    @Column(length = 20)
    private String status = "PRESENT"; // PRESENT, ABSENT, LATE, FLAGGED

    @Column(length = 128)
    private String deviceFingerprint;

    @Column(length = 45)
    private String ipAddress;

    @Column(precision = 8, scale = 2)
    private BigDecimal geoDistanceMeters;

    @Builder.Default
    @Column(precision = 5, scale = 4)
    private BigDecimal anomalyScore = BigDecimal.ZERO;

    @Builder.Default
    private Boolean isVerified = true;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
