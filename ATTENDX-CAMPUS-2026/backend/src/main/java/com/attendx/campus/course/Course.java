package com.attendx.campus.course;

import com.attendx.campus.department.Department;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "courses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String degreeCode; // e.g. BTECH-CSE

    @Column(nullable = false, length = 150)
    private String degreeName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Builder.Default
    private Integer durationYears = 4;
}
