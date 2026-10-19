package com.attendx.campus.attendance;

import com.attendx.campus.classroom.Classroom;
import com.attendx.campus.faculty.Faculty;
import com.attendx.campus.faculty.FacultyRepository;
import com.attendx.campus.qr.DynamicQrService;
import com.attendx.campus.student.Student;
import com.attendx.campus.student.StudentRepository;
import com.attendx.campus.timetable.TimetableSlot;
import com.attendx.campus.timetable.TimetableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final TimetableRepository timetableRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final DynamicQrService dynamicQrService;

    @Value("${attendx.ai-service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private static final ZoneId IST = ZoneId.of("Asia/Kolkata");
    private final RestTemplate restTemplate = new RestTemplate();

    @Transactional
    public AttendanceSession startSession(Long timetableSlotId, Long facultyId) {
        TimetableSlot slot = timetableRepository.findById(timetableSlotId)
                .orElseThrow(() -> new RuntimeException("Timetable slot not found: " + timetableSlotId));
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found: " + facultyId));

        String sessionId = UUID.randomUUID().toString();
        String secretSalt = UUID.randomUUID().toString().substring(0, 16);

        AttendanceSession session = AttendanceSession.builder()
                .id(sessionId)
                .timetableSlot(slot)
                .faculty(faculty)
                .sessionDate(LocalDate.now(IST))
                .startTime(LocalDateTime.now(IST))
                .status("ACTIVE")
                .qrRefreshSeconds(20)
                .secretSalt(secretSalt)
                .build();

        return sessionRepository.save(session);
    }

    public String generateNextQr(String sessionId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));
        if (!"ACTIVE".equalsIgnoreCase(session.getStatus())) {
            throw new RuntimeException("Session is not active");
        }
        return dynamicQrService.generateNextQrToken(sessionId, session.getSecretSalt());
    }

    @Transactional
    public Map<String, Object> processScan(
            String sessionId,
            Long studentId,
            String tokenNonce,
            Double studentLat,
            Double studentLon,
            String ipAddress,
            String deviceFingerprint,
            Double scanDelaySeconds
    ) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // 1. Verify dynamic expiring QR nonce
        boolean tokenValid = dynamicQrService.validateAndConsumeToken(sessionId, tokenNonce);
        if (!tokenValid) {
            throw new RuntimeException("QR Token is invalid or has expired. Please rescan the live display.");
        }

        // 2. Geo-fence distance calculation (Haversine formula)
        Classroom classroom = session.getTimetableSlot().getClassroom();
        double distanceMeters = calculateHaversineDistance(
                studentLat != null ? studentLat : classroom.getLatitude().doubleValue(),
                studentLon != null ? studentLon : classroom.getLongitude().doubleValue(),
                classroom.getLatitude().doubleValue(),
                classroom.getLongitude().doubleValue()
        );

        // 3. Connect to AI Service for Anomaly Detection (with graceful fallback)
        boolean isAnomaly = false;
        double anomalyScore = 0.05;
        String verdict = "VERIFIED";
        List<String> flagReasons = new ArrayList<>();

        try {
            Map<String, Object> aiPayload = new HashMap<>();
            aiPayload.put("student_id", student.getRollNumber());
            aiPayload.put("session_id", sessionId);
            aiPayload.put("scan_delay_seconds", scanDelaySeconds != null ? scanDelaySeconds : 4.0);
            aiPayload.put("distance_meters", distanceMeters);
            aiPayload.put("ip_subnet_match", true);
            aiPayload.put("device_id", deviceFingerprint != null ? deviceFingerprint : "BROWSER-SIM");
            aiPayload.put("historical_attendance_rate", 0.85);
            aiPayload.put("period_slot_index", session.getTimetableSlot().getPeriodNumber());
            aiPayload.put("day_of_week", LocalDate.now(IST).getDayOfWeek().getValue() - 1);

            @SuppressWarnings("unchecked")
            Map<String, Object> aiResp = restTemplate.postForObject(
                    aiServiceUrl + "/api/v1/ai/anomaly/detect-scan",
                    aiPayload,
                    Map.class
            );

            if (aiResp != null) {
                isAnomaly = Boolean.TRUE.equals(aiResp.get("is_anomaly"));
                anomalyScore = ((Number) aiResp.getOrDefault("anomaly_score", 0.05)).doubleValue();
                verdict = (String) aiResp.getOrDefault("verdict", "VERIFIED");
                @SuppressWarnings("unchecked")
                List<String> reasons = (List<String>) aiResp.get("flag_reasons");
                if (reasons != null) flagReasons = reasons;
            }
        } catch (Exception ex) {
            // Local fallback heuristic if AI service network is unreachable
            if (distanceMeters > classroom.getGeoRadiusMeters().doubleValue() + 15.0) {
                isAnomaly = true;
                verdict = "SUSPICIOUS";
                flagReasons.add("Geo-distance exceeds classroom boundary limit (" + Math.round(distanceMeters) + "m)");
            }
        }

        // 4. Record attendance
        AttendanceRecord record = AttendanceRecord.builder()
                .session(session)
                .student(student)
                .scanTimestamp(LocalDateTime.now(IST))
                .verificationMode("DYNAMIC_QR")
                .status(isAnomaly ? "FLAGGED" : "PRESENT")
                .deviceFingerprint(deviceFingerprint)
                .ipAddress(ipAddress)
                .geoDistanceMeters(BigDecimal.valueOf(distanceMeters))
                .anomalyScore(BigDecimal.valueOf(anomalyScore))
                .isVerified(!isAnomaly)
                .build();

        recordRepository.save(record);

        Map<String, Object> result = new HashMap<>();
        result.put("status", record.getStatus());
        result.put("is_anomaly", isAnomaly);
        result.put("verdict", verdict);
        result.put("anomaly_score", anomalyScore);
        result.put("flag_reasons", flagReasons);
        result.put("distance_meters", Math.round(distanceMeters * 10.0) / 10.0);
        result.put("student_name", student.getUser().getFirstName() + " " + student.getUser().getLastName());
        result.put("roll_number", student.getRollNumber());
        return result;
    }

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000; // Radius of Earth in meters
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
