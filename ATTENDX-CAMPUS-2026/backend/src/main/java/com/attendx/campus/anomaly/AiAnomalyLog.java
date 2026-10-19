package com.attendx.campus.anomaly;

import com.attendx.campus.student.Student;
import com.attendx.campus.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_anomaly_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAnomalyLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 64)
    private String sessionId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id")
    private Student student;

    @Column(nullable = false, precision = 5, scale = 4)
    private BigDecimal anomalyScore;

    @Column(nullable = false, length = 20)
    private String verdict; // VERIFIED, SUSPICIOUS, REJECTED

    @Column(nullable = false, columnDefinition = "TEXT")
    private String flagReasons;

    @Column(precision = 8, scale = 2)
    private BigDecimal distanceMeters;

    @Column(precision = 6, scale = 2)
    private BigDecimal scanDelaySeconds;

    @Column(length = 100)
    private String deviceId;

    @Builder.Default
    private Boolean resolved = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by")
    private User resolvedBy;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
