import os
import joblib
import numpy as np
from sklearn.ensemble import IsolationForest
from typing import Dict, Any, Tuple, List
from app.features.extractor import FeatureExtractor

MODEL_PATH = os.path.join(os.path.dirname(__file__), "weights", "isolation_forest.joblib")

class AnomalyDetector:
    def __init__(self):
        self.model = None
        self.version = "1.2.0-IForest-CampusShield"
        self._load_or_initialize()

    def _load_or_initialize(self):
        if os.path.exists(MODEL_PATH):
            try:
                self.model = joblib.load(MODEL_PATH)
            except Exception:
                self.train_and_save()
        else:
            self.train_and_save()

    def train_and_save(self):
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        # Synthetic baseline representing 1200 normal campus scans and 120 proxy/spoof attempts
        np.random.seed(42)
        
        # Normal campus scans:
        # scan_delay: 2 to 12s, distance: 1 to 22m, ip_match: 1, hist_rate: 0.75-0.95, period: 1-7, day: 0-4
        n_normal = 1200
        normal_delays = np.random.normal(6.0, 2.5, n_normal).clip(1.0, 18.0)
        normal_distances = np.random.normal(8.0, 4.0, n_normal).clip(0.5, 25.0)
        normal_ip = np.random.choice([1.0, 0.0], p=[0.96, 0.04], size=n_normal)
        normal_hist = np.random.beta(7, 2, n_normal).clip(0.65, 1.0)
        normal_period = np.random.randint(1, 8, n_normal).astype(float)
        normal_day = np.random.randint(0, 5, n_normal).astype(float)
        normal_dist_pen = normal_distances / 50.0
        normal_speed_flag = np.zeros(n_normal)

        X_normal = np.column_stack([
            normal_delays, normal_distances, normal_ip, normal_hist,
            normal_period, normal_day, normal_dist_pen, normal_speed_flag
        ])

        # Outliers / Proxy attempts:
        # 1. Distant spoofing (distance 70m - 500m)
        # 2. Automated replay bot (delay < 0.25s)
        # 3. Off-campus IP cellular sharing
        n_outliers = 120
        out_delays = np.random.choice([0.15, 0.22, 28.0, 45.0], size=n_outliers)
        out_distances = np.random.uniform(55.0, 350.0, n_outliers)
        out_ip = np.random.choice([0.0, 1.0], p=[0.85, 0.15], size=n_outliers)
        out_hist = np.random.beta(3, 4, n_outliers).clip(0.2, 0.75)
        out_period = np.random.randint(1, 8, n_outliers).astype(float)
        out_day = np.random.randint(0, 5, n_outliers).astype(float)
        out_dist_pen = np.minimum(out_distances / 50.0, 5.0)
        out_speed_flag = np.ones(n_outliers)

        X_outliers = np.column_stack([
            out_delays, out_distances, out_ip, out_hist,
            out_period, out_day, out_dist_pen, out_speed_flag
        ])

        X_train = np.vstack([X_normal, X_outliers])

        # Isolation Forest with 100 estimators, 0.09 expected contamination
        clf = IsolationForest(
            n_estimators=100,
            contamination=0.08,
            random_state=42
        )
        clf.fit(X_train)
        self.model = clf
        joblib.dump(clf, MODEL_PATH)

    def detect(self, payload: Dict[str, Any]) -> Tuple[bool, float, str, List[str], float]:
        """
        Returns:
        (is_anomaly, anomaly_score_0_to_1, verdict, flag_reasons, confidence)
        """
        features = FeatureExtractor.extract_scan_features(payload)
        
        # Scikit-learn raw decision score (lower means more abnormal)
        raw_score = self.model.decision_function(features)[0]
        # Normalize into 0.0 (safe) to 1.0 (highly anomalous)
        # raw_score typically falls in [-0.35, 0.25]
        norm_score = float(np.clip(0.5 - (raw_score * 2.5), 0.0, 1.0))

        reasons = []
        delay = float(payload.get("scan_delay_seconds", 5.0))
        dist = float(payload.get("distance_meters", 10.0))
        ip_match = payload.get("ip_subnet_match", True)

        if dist > 45.0:
            reasons.append(f"Geo-location fence violation: {dist:.1f}m from designated classroom (threshold 45m)")
        if delay < 0.35:
            reasons.append(f"Inhuman scan velocity: {delay:.2f}s latency suggests script automation/token replay")
        elif delay > 30.0:
            reasons.append(f"Expired QR token scan attempt: {delay:.1f}s latency exceeding dynamic refresh window")
        if not ip_match:
            reasons.append("Network mismatch: Student connected via external IP/cellular instead of campus Wi-Fi")

        # Flag rule: either isolation forest triggers OR hard security fence broken
        is_anomaly = bool(norm_score > 0.62 or dist > 50.0 or delay < 0.3 or (not ip_match and dist > 30.0))

        if not is_anomaly:
            verdict = "VERIFIED"
            confidence = float(np.clip(1.0 - norm_score, 0.85, 0.99))
        elif norm_score > 0.80 or dist > 100.0 or delay < 0.25:
            verdict = "REJECTED"
            confidence = float(np.clip(norm_score, 0.88, 0.99))
        else:
            verdict = "SUSPICIOUS"
            confidence = float(np.clip(norm_score, 0.70, 0.87))

        if not reasons and is_anomaly:
            reasons.append("Telemetry pattern deviation detected by Isolation Forest AI")

        return is_anomaly, round(norm_score, 4), verdict, reasons, round(confidence, 4)
