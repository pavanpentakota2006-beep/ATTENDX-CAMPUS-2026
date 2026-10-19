package com.attendx.campus.qr;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface QrTokenRepository extends JpaRepository<DynamicQrToken, Long> {
    Optional<DynamicQrToken> findByTokenNonce(String tokenNonce);
    void deleteByExpiresAtBefore(LocalDateTime dateTime);
}
