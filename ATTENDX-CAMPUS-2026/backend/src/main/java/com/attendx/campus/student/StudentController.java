package com.attendx.campus.student;

import com.attendx.campus.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/student")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StudentController {

    private final StudentRepository studentRepository;

    @GetMapping("/profile/{id}")
    public ResponseEntity<ApiResponse<Student>> getStudentProfile(@PathVariable Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + id));
        return ResponseEntity.ok(ApiResponse.ok(student));
    }

    @GetMapping("/section")
    public ResponseEntity<ApiResponse<List<Student>>> getStudentsBySection(
            @RequestParam Integer semester,
            @RequestParam String section
    ) {
        return ResponseEntity.ok(ApiResponse.ok(studentRepository.findByCurrentSemesterAndSection(semester, section)));
    }
}
