package com.attendx.campus.academiccalendar;

import com.attendx.campus.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/academic-calendar")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AcademicCalendarController {

    private final CalendarRepository calendarRepository;
    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTodayCampusStatus() {
        LocalDate today = LocalDate.now(IST_ZONE);
        String dayOfWeek = today.getDayOfWeek().name();

        AcademicCalendar calendarEntry = calendarRepository.findByCalendarDate(today).orElse(null);

        Map<String, Object> response = new HashMap<>();
        response.put("current_date", today.toString());
        response.put("standard_day_of_week", dayOfWeek);
        response.put("timezone", "Asia/Kolkata (IST)");

        if (calendarEntry != null) {
            response.put("day_type", calendarEntry.getDayType());
            response.put("title", calendarEntry.getTitle());
            response.put("description", calendarEntry.getDescription());
            response.put("effective_timetable_day", 
                calendarEntry.getAppliesToWeekday() != null ? calendarEntry.getAppliesToWeekday() : dayOfWeek);
            response.put("is_instructional_day", !"HOLIDAY".equalsIgnoreCase(calendarEntry.getDayType()));
        } else {
            boolean isWeekend = dayOfWeek.equals("SATURDAY") || dayOfWeek.equals("SUNDAY");
            response.put("day_type", isWeekend ? "WEEKEND" : "REGULAR");
            response.put("title", isWeekend ? "Weekend" : "Regular Academic Day");
            response.put("effective_timetable_day", dayOfWeek);
            response.put("is_instructional_day", !isWeekend);
        }

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<AcademicCalendar>>> getAllEvents() {
        return ResponseEntity.ok(ApiResponse.ok(calendarRepository.findAll()));
    }

    @PostMapping("/entry")
    public ResponseEntity<ApiResponse<AcademicCalendar>> createCalendarEntry(@RequestBody AcademicCalendar entry) {
        return ResponseEntity.ok(ApiResponse.ok(calendarRepository.save(entry), "Calendar entry created"));
    }
}
