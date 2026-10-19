package com.attendx.campus.timetable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<TimetableSlot, Long> {
    List<TimetableSlot> findByDayOfWeekAndSemesterAndSectionOrderByPeriodNumberAsc(
            String dayOfWeek, Integer semester, String section
    );
    List<TimetableSlot> findByFacultyIdAndDayOfWeekOrderByPeriodNumberAsc(
            Long facultyId, String dayOfWeek
    );
    List<TimetableSlot> findByClassroomIdAndDayOfWeekOrderByPeriodNumberAsc(
            Long classroomId, String dayOfWeek
    );
}
