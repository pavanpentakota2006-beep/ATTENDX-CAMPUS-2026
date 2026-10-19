package com.attendx.campus;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class CampusAttendanceApplicationTests {

    @Test
    void testApplicationClassExists() {
        CampusAttendanceApplication app = new CampusAttendanceApplication();
        assertNotNull(app);
    }
}
