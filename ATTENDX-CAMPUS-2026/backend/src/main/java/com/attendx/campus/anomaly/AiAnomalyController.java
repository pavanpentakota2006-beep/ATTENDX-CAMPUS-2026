package com.attendx.campus.anomaly;

import com.attendx.campus.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/anomaly")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AiAnomalyController {

    private final AiAnomalyRepository anomalyRepository;

    @GetMapping("/feed")
    public ResponseEntity<ApiResponse<List<AiAnomalyLog>>> getActiveAnomalies() {
        return ResponseEntity.ok(ApiResponse.ok(anomalyRepository.findByResolvedFalseOrderByCreatedAtDesc()));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<AiAnomalyLog>> resolveAnomaly(@PathVariable Long id) {
        AiAnomalyLog log = anomalyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Anomaly log not found"));
        log.setResolved(true);
        return ResponseEntity.ok(ApiResponse.ok(anomalyRepository.save(log), "Anomaly flagged as resolved"));
    }
}
