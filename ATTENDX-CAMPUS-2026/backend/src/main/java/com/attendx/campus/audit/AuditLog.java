package com.attendx.campus.audit;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String action; // ATTENDANCE_OVERRIDE, SESSION_FORCE_CLOSED, CALENDAR_MODIFIED, ROLE_CHANGED

    @Column(nullable = false, length = 100)
    private String performedBy;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(length = 45)
    private String ipAddress;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
