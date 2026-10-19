package com.attendx.campus.correction;

import com.attendx.campus.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/correction")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CorrectionController {

    private final CorrectionRepository correctionRepository;

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<AttendanceCorrection>>> getStudentCorrections(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.ok(correctionRepository.findByStudentId(studentId)));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<AttendanceCorrection>>> getPendingCorrections() {
        return ResponseEntity.ok(ApiResponse.ok(correctionRepository.findByStatus("PENDING")));
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<AttendanceCorrection>> submitCorrection(@RequestBody AttendanceCorrection req) {
        return ResponseEntity.ok(ApiResponse.ok(correctionRepository.save(req), "Correction submitted"));
    }

    @PutMapping("/{id}/review")
    public ResponseEntity<ApiResponse<AttendanceCorrection>> reviewCorrection(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String comments
    ) {
        AttendanceCorrection cor = correctionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Correction not found"));
        cor.setStatus(status);
        cor.setReviewComments(comments);
        cor.setReviewedAt(LocalDateTime.now());
        return ResponseEntity.ok(ApiResponse.ok(correctionRepository.save(cor), "Correction reviewed"));
    }
}
