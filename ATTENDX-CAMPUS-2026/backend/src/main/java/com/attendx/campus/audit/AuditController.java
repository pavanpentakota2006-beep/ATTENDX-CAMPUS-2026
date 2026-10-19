package com.attendx.campus.audit;

import com.attendx.campus.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/audit")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuditController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getRecentAuditLogs() {
        return ResponseEntity.ok(ApiResponse.ok(auditLogRepository.findTop50ByOrderByTimestampDesc()));
    }
}
