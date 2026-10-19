package com.attendx.campus.attendance;

import com.attendx.campus.faculty.Faculty;
import com.attendx.campus.timetable.TimetableSlot;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_sessions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSession {

    @Id
    @Column(length = 64)
    private String id; // UUID

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "timetable_slot_id", nullable = false)
    private TimetableSlot timetableSlot;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "faculty_id", nullable = false)
    private Faculty faculty;

    @Column(nullable = false)
    private LocalDate sessionDate;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime startTime = LocalDateTime.now();

    private LocalDateTime endTime;

    @Builder.Default
    @Column(length = 20)
    private String status = "ACTIVE"; // ACTIVE, CLOSED, CANCELLED

    @Builder.Default
    private Integer qrRefreshSeconds = 20;

    @Column(nullable = false, length = 100)
    private String secretSalt;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
