package com.attendx.campus.faculty;

import com.attendx.campus.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "faculty")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Faculty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, unique = true, length = 50)
    private String employeeCode;

    @Column(nullable = false, length = 100)
    private String designation;

    @Column(length = 150)
    private String specialization;

    @Column(length = 50)
    private String cabinRoom;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
