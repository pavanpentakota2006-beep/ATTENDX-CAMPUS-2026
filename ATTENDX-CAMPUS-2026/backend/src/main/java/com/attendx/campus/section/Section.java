package com.attendx.campus.section;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Section {
    private String name; // e.g. 'A', 'B'
    private Integer semester;
    private Integer studentCount;
}
