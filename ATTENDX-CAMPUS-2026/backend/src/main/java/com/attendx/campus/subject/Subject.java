package com.attendx.campus.subject;

import com.attendx.campus.department.Department;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "subjects")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    @Builder.Default
    private Integer credits = 3;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(nullable = false)
    private Integer semester;

    @Builder.Default
    @Column(precision = 5, scale = 2)
    private BigDecimal minimumAttendancePct = new BigDecimal("75.00");

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
