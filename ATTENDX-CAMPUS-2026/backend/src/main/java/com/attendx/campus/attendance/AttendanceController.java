package com.attendx.campus.attendance;

import com.attendx.campus.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final AttendanceRecordRepository recordRepository;
    private final AttendanceSessionRepository sessionRepository;

    @PostMapping("/session/start")
    public ResponseEntity<ApiResponse<AttendanceSession>> startSession(
            @RequestParam Long timetableSlotId,
            @RequestParam Long facultyId
    ) {
        AttendanceSession session = attendanceService.startSession(timetableSlotId, facultyId);
        return ResponseEntity.ok(ApiResponse.ok(session, "Attendance session started"));
    }

    @GetMapping("/session/{sessionId}/qr-token")
    public ResponseEntity<ApiResponse<Map<String, String>>> getNextQrToken(@PathVariable String sessionId) {
        String token = attendanceService.generateNextQr(sessionId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("token", token, "sessionId", sessionId)));
    }

    @PostMapping("/scan")
    public ResponseEntity<ApiResponse<Map<String, Object>>> submitScan(@RequestBody Map<String, Object> body) {
        String sessionId = (String) body.get("sessionId");
        Long studentId = Long.valueOf(body.get("studentId").toString());
        String token = (String) body.get("token");
        Double lat = body.get("latitude") != null ? Double.valueOf(body.get("latitude").toString()) : null;
        Double lon = body.get("longitude") != null ? Double.valueOf(body.get("longitude").toString()) : null;
        String ip = (String) body.getOrDefault("ipAddress", "192.168.1.105");
        String device = (String) body.getOrDefault("deviceId", "DEVICE-SIM-01");
        Double delay = body.get("scanDelaySeconds") != null ? Double.valueOf(body.get("scanDelaySeconds").toString()) : 4.0;

        Map<String, Object> result = attendanceService.processScan(sessionId, studentId, token, lat, lon, ip, device, delay);
        return ResponseEntity.ok(ApiResponse.ok(result, "Scan processed"));
    }

    @GetMapping("/session/{sessionId}/records")
    public ResponseEntity<ApiResponse<List<AttendanceRecord>>> getSessionRecords(@PathVariable String sessionId) {
        return ResponseEntity.ok(ApiResponse.ok(recordRepository.findBySessionId(sessionId)));
    }

    @GetMapping("/student/{studentId}/history")
    public ResponseEntity<ApiResponse<List<AttendanceRecord>>> getStudentHistory(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.ok(recordRepository.findByStudentId(studentId)));
    }
}
