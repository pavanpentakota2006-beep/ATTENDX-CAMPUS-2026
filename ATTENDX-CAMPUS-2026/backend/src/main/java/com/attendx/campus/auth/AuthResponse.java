package com.attendx.campus.auth;

import com.attendx.campus.user.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    @Builder.Default
    private String type = "Bearer";
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private Role role;
    private String departmentCode;
}
