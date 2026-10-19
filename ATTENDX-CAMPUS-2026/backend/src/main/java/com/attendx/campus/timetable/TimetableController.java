package com.attendx.campus.timetable;

import com.attendx.campus.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/timetable")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TimetableController {

    private final TimetableRepository timetableRepository;

    @GetMapping("/student")
    public ResponseEntity<ApiResponse<List<TimetableSlot>>> getStudentTimetable(
            @RequestParam String day,
            @RequestParam Integer semester,
            @RequestParam String section
    ) {
        List<TimetableSlot> slots = timetableRepository
                .findByDayOfWeekAndSemesterAndSectionOrderByPeriodNumberAsc(day.toUpperCase(), semester, section);
        return ResponseEntity.ok(ApiResponse.ok(slots));
    }

    @GetMapping("/faculty/{facultyId}")
    public ResponseEntity<ApiResponse<List<TimetableSlot>>> getFacultyTimetable(
            @PathVariable Long facultyId,
            @RequestParam String day
    ) {
        List<TimetableSlot> slots = timetableRepository
                .findByFacultyIdAndDayOfWeekOrderByPeriodNumberAsc(facultyId, day.toUpperCase());
        return ResponseEntity.ok(ApiResponse.ok(slots));
    }
}
