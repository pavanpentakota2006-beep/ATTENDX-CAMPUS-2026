package com.attendx.campus.qr;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "dynamic_qr_tokens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DynamicQrToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String sessionId;

    @Column(nullable = false, unique = true, length = 128)
    private String tokenNonce;

    @Builder.Default
    private LocalDateTime generatedAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Builder.Default
    private Boolean isConsumed = false;
}
