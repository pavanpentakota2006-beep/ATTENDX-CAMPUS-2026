package com.attendx.campus.leave;

import com.attendx.campus.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/leave")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LeaveController {

    private final LeaveRepository leaveRepository;

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<LeaveRequest>>> getStudentLeaves(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.ok(leaveRepository.findByStudentId(studentId)));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<LeaveRequest>>> getPendingLeaves() {
        return ResponseEntity.ok(ApiResponse.ok(leaveRepository.findByStatus("PENDING")));
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<LeaveRequest>> submitLeave(@RequestBody LeaveRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(leaveRepository.save(request), "Leave request submitted"));
    }

    @PutMapping("/{id}/review")
    public ResponseEntity<ApiResponse<LeaveRequest>> reviewLeave(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        LeaveRequest req = leaveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        req.setStatus(status);
        return ResponseEntity.ok(ApiResponse.ok(leaveRepository.save(req), "Status updated"));
    }
}
