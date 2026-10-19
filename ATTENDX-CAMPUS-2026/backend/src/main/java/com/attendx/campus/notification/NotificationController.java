package com.attendx.campus.notification;

import com.attendx.campus.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getUserNotifications(@PathVariable Long userId) {
        List<Map<String, Object>> alerts = List.of(
                Map.of(
                        "id", 1,
                        "title", "Attendance Shortage Alert: CS402",
                        "message", "Your attendance is at 68.0%. You need 4 consecutive classes to reach the safe 75% threshold.",
                        "type", "WARNING",
                        "time", LocalDateTime.now().minusHours(2).toString(),
                        "read", false
                ),
                Map.of(
                        "id", 2,
                        "title", "Substitute Working Day Declared",
                        "message", "Saturday, 24th October will follow the Tuesday timetable.",
                        "type", "INFO",
                        "time", LocalDateTime.now().minusDays(1).toString(),
                        "read", true
                ),
                Map.of(
                        "id", 3,
                        "title", "Duty Leave Approved",
                        "message", "Your On-Duty leave for HackIndia 2026 was approved by HOD.",
                        "type", "SUCCESS",
                        "time", LocalDateTime.now().minusDays(3).toString(),
                        "read", true
                )
        );
        return ResponseEntity.ok(ApiResponse.ok(alerts));
    }
}
