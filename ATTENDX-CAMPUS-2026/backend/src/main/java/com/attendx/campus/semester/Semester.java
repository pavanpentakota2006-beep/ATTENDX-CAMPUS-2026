package com.attendx.campus.semester;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Semester {
    private Integer semesterNumber;
    private String academicYear;
    private Boolean isCurrent;
}
