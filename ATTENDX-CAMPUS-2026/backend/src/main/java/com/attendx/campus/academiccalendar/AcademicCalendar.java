package com.attendx.campus.academiccalendar;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "academic_calendar")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AcademicCalendar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private LocalDate calendarDate;

    @Column(nullable = false, length = 50)
    private String dayType; // REGULAR, HOLIDAY, EXAMINATION, SUBSTITUTE_WORKING_DAY, EVENT

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 20)
    private String appliesToWeekday; // MONDAY, TUESDAY, etc. if substitute working day

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
