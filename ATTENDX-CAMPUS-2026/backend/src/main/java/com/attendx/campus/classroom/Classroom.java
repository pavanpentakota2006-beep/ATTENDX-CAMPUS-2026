package com.attendx.campus.classroom;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "classrooms")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Classroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String roomNumber;

    @Column(nullable = false, length = 100)
    private String building;

    @Builder.Default
    private Integer capacity = 60;

    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @Builder.Default
    @Column(precision = 6, scale = 2)
    private BigDecimal geoRadiusMeters = new BigDecimal("35.00");

    @Column(length = 100)
    private String wifiBssid;

    @Builder.Default
    private Boolean isSmartRoom = true;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
