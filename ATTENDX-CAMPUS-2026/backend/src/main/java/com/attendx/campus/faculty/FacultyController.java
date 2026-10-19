package com.attendx.campus.faculty;

import com.attendx.campus.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/faculty")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FacultyController {

    private final FacultyRepository facultyRepository;

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<Faculty>>> getAllFaculty() {
        return ResponseEntity.ok(ApiResponse.ok(facultyRepository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Faculty>> getFacultyById(@PathVariable Long id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Faculty not found with ID: " + id));
        return ResponseEntity.ok(ApiResponse.ok(faculty));
    }
}
