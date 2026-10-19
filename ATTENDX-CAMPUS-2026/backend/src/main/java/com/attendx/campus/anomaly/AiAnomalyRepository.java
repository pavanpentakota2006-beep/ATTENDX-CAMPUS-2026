package com.attendx.campus.anomaly;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiAnomalyRepository extends JpaRepository<AiAnomalyLog, Long> {
    List<AiAnomalyLog> findByResolvedFalseOrderByCreatedAtDesc();
    List<AiAnomalyLog> findBySessionId(String sessionId);
}
