import numpy as np
from typing import Dict, Any, List

class FeatureExtractor:
    """
    Transforms raw telemetry and academic attendance data into 
    normalized feature vectors for scikit-learn anomaly and prediction models.
    """

    @staticmethod
    def extract_scan_features(data: Dict[str, Any]) -> np.ndarray:
        """
        Features for Scan Anomaly Detection:
        1. scan_delay_seconds (normal is 2-15 seconds, <0.3s or >35s is suspicious)
        2. distance_meters (within classroom 0-25m is normal, >50m is suspicious)
        3. ip_subnet_match (1 if campus Wi-Fi, 0 if cellular/remote VPN)
        4. historical_attendance_rate (0.0 to 1.0)
        5. period_slot_index (1 to 8)
        6. day_of_week (0 to 6)
        """
        scan_delay = float(data.get("scan_delay_seconds", 5.0))
        distance = float(data.get("distance_meters", 10.0))
        ip_match = 1.0 if data.get("ip_subnet_match", True) else 0.0
        hist_rate = float(data.get("historical_attendance_rate", 0.85))
        period = float(data.get("period_slot_index", 1))
        weekday = float(data.get("day_of_week", 1))

        # Engineered features:
        # Distance penalty: exponential growth above 30m
        distance_penalty = min(distance / 50.0, 5.0)
        # Latency anomaly flag: abnormally fast (<0.4s indicating automated script) or late (>30s)
        speed_flag = 1.0 if (scan_delay < 0.4 or scan_delay > 35.0) else 0.0

        return np.array([[
            scan_delay,
            distance,
            ip_match,
            hist_rate,
            period,
            weekday,
            distance_penalty,
            speed_flag
        ]], dtype=np.float32)

    @staticmethod
    def extract_shortage_features(
        total_held: int, 
        attended: int, 
        total_planned: int = 60,
        consecutive_absences: int = 0,
        days_until_exam: int = 45
    ) -> np.ndarray:
        """
        Features for Attendance Shortage Risk Prediction:
        1. current_attendance_ratio
        2. completion_ratio (held / planned)
        3. consecutive_absences
        4. days_until_exam
        5. attendance_gap_to_75
        6. max_possible_final_ratio
        """
        curr_ratio = attended / max(total_held, 1)
        completion_ratio = min(total_held / max(total_planned, 1), 1.0)
        remaining_classes = max(total_planned - total_held, 0)
        max_possible_attended = attended + remaining_classes
        max_possible_final_ratio = max_possible_attended / max(total_planned, 1)
        gap_to_75 = 0.75 - curr_ratio

        return np.array([[
            curr_ratio,
            completion_ratio,
            float(consecutive_absences),
            float(days_until_exam),
            float(gap_to_75),
            float(max_possible_final_ratio)
        ]], dtype=np.float32)
