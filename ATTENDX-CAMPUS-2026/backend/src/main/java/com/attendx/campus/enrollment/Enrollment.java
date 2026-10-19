package com.attendx.campus.enrollment;

import com.attendx.campus.student.Student;
import com.attendx.campus.subject.Subject;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Builder.Default
    @Column(length = 20)
    private String academicYear = "2025-2026";

    @Builder.Default
    private LocalDateTime enrolledAt = LocalDateTime.now();
}
