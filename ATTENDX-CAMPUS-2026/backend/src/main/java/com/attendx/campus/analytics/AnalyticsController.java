package com.attendx.campus.analytics;

import com.attendx.campus.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDepartmentAnalytics(@PathVariable Long departmentId) {
        Map<String, Object> data = new HashMap<>();
        data.put("department_code", "CSE");
        data.put("total_students", 380);
        data.put("average_attendance_percentage", 83.4);
        data.put("students_at_risk_count", 24);
        data.put("classes_conducted_this_week", 142);
        data.put("faculty_conduction_rate", 97.2);
        data.put("section_comparisons", List.of(
                Map.of("section", "6-A", "average_attendance", 85.2, "at_risk", 5),
                Map.of("section", "6-B", "average_attendance", 81.8, "at_risk", 9),
                Map.of("section", "6-C", "average_attendance", 83.0, "at_risk", 10)
        ));
        data.put("ai_anomaly_summary", Map.of(
                "total_scans_today", 340,
                "verified_scans", 336,
                "flagged_proxies", 4,
                "fraud_prevention_rate", "98.8%"
        ));
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @GetMapping("/campus/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCampusSummary() {
        Map<String, Object> data = new HashMap<>();
        data.put("active_sessions_now", 14);
        data.put("total_students_enrolled", 1450);
        data.put("present_today_count", 1238);
        data.put("campus_attendance_rate", 85.4);
        data.put("total_anomalies_flagged_this_month", 18);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }
}
