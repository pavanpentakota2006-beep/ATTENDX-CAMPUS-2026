package com.attendx.campus.qr;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DynamicQrService {

    private final QrTokenRepository qrTokenRepository;
    private static final int DEFAULT_TTL_SECONDS = 20;

    @Transactional
    public String generateNextQrToken(String sessionId, String secretSalt) {
        String randomSeed = UUID.randomUUID().toString();
        long epochSecond = System.currentTimeMillis() / 1000;
        String rawData = sessionId + ":" + secretSalt + ":" + epochSecond + ":" + randomSeed;

        String nonce = sha256Hex(rawData);

        DynamicQrToken token = DynamicQrToken.builder()
                .sessionId(sessionId)
                .tokenNonce(nonce)
                .generatedAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusSeconds(DEFAULT_TTL_SECONDS))
                .isConsumed(false)
                .build();

        qrTokenRepository.save(token);
        return nonce;
    }

    @Transactional
    public boolean validateAndConsumeToken(String sessionId, String tokenNonce) {
        return qrTokenRepository.findByTokenNonce(tokenNonce)
                .filter(t -> t.getSessionId().equals(sessionId))
                .filter(t -> !t.getIsConsumed())
                .filter(t -> t.getExpiresAt().isAfter(LocalDateTime.now()))
                .map(t -> {
                    t.setIsConsumed(true);
                    qrTokenRepository.save(t);
                    return true;
                })
                .orElse(false);
    }

    private String sha256Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("SHA-256 algorithm error", e);
        }
    }
}
