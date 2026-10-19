package com.attendx.campus.student;

import com.attendx.campus.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "students")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, unique = true, length = 50)
    private String rollNumber;

    @Column(nullable = false, unique = true, length = 50)
    private String registrationNo;

    @Column(nullable = false)
    private Integer batchYear;

    @Column(nullable = false)
    private Integer currentSemester;

    @Column(nullable = false, length = 10)
    private String section;

    @Column(unique = true, length = 100)
    private String rfidTagId;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
