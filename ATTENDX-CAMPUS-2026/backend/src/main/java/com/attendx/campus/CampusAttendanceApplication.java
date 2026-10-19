package com.attendx.campus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;
import jakarta.annotation.PostConstruct;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties
public class CampusAttendanceApplication {

    @PostConstruct
    public void init() {
        // Enforce India Standard Time (IST, UTC+05:30) for campus clock sync
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
    }

    public static void main(String[] args) {
        SpringApplication.run(CampusAttendanceApplication.class, args);
    }
}
