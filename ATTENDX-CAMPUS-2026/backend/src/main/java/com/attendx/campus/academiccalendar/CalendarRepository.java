package com.attendx.campus.academiccalendar;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Optional;
import java.util.List;

@Repository
public interface CalendarRepository extends JpaRepository<AcademicCalendar, Long> {
    Optional<AcademicCalendar> findByCalendarDate(LocalDate calendarDate);
    List<AcademicCalendar> findByCalendarDateBetween(LocalDate start, LocalDate end);
}
