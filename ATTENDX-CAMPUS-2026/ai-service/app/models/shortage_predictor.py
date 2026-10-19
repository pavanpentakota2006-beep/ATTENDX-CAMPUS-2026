import math
import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from typing import Dict, Any, Tuple
from app.features.extractor import FeatureExtractor

MODEL_PATH = os.path.join(os.path.dirname(__file__), "weights", "shortage_random_forest.joblib")

class ShortagePredictor:
    def __init__(self):
        self.model = None
        self.version = "2.1.0-RF-ShortageAlert"
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
        np.random.seed(101)
        
        # Synthesize realistic semester student profiles
        # total_held: 10 to 55, total_planned: 60
        n_samples = 2500
        held = np.random.randint(15, 52, n_samples)
        
        # Actual attendance rates distributed around 0.78 with variance
        rates = np.random.beta(5, 2, n_samples).clip(0.35, 0.98)
        attended = np.floor(held * rates).astype(int)
        
        consec_abs = np.random.poisson(1.2, n_samples).clip(0, 8)
        days_exam = np.random.randint(5, 60, n_samples)
        
        X = []
        y = []
        for i in range(n_samples):
            h = held[i]
            att = attended[i]
            ca = consec_abs[i]
            de = days_exam[i]
            
            vec = FeatureExtractor.extract_shortage_features(
                total_held=h,
                attended=att,
                total_planned=60,
                consecutive_absences=ca,
                days_until_exam=de
            )[0]
            X.append(vec)
            
            # Ground truth: simulate remaining lectures (future attendance rate slightly degraded if consec_abs is high)
            remaining = 60 - h
            expected_future_rate = max(0.2, (att / h) - (ca * 0.04))
            future_attended = round(remaining * expected_future_rate)
            final_pct = (att + future_attended) / 60.0
            
            # Class 1 = Shortage (Final attendance < 75%), 0 = Safe (>= 75%)
            y.append(1 if final_pct < 0.75 else 0)

        X = np.array(X)
        y = np.array(y)

        clf = RandomForestClassifier(n_estimators=120, max_depth=6, random_state=101)
        clf.fit(X, y)
        self.model = clf
        joblib.dump(clf, MODEL_PATH)

    def predict(
        self,
        student_id: str,
        subject_code: str,
        total_classes_held: int,
        classes_attended: int,
        total_planned_classes: int = 60,
        consecutive_absences: int = 0,
        medical_leaves: int = 0,
        days_until_exam: int = 45
    ) -> Dict[str, Any]:
        """
        Calculates:
        - current_percentage
        - projected_final_percentage
        - risk_level
        - shortage_probability
        - lectures_needed_to_reach_75
        - can_recover
        - recommended_action
        """
        total_held = max(total_classes_held, 1)
        attended = min(classes_attended, total_held)
        current_pct = round((attended / total_held) * 100.0, 1)

        vec = FeatureExtractor.extract_shortage_features(
            total_held=total_held,
            attended=attended,
            total_planned=total_planned_classes,
            consecutive_absences=consecutive_absences,
            days_until_exam=days_until_exam
        )

        # Scikit-learn probability of falling below 75%
        probs = self.model.predict_proba(vec)[0]
        # Class 1 corresponds to shortage risk
        shortage_prob = float(probs[1]) if len(probs) > 1 else (1.0 if current_pct < 75 else 0.0)

        remaining_classes = max(total_planned_classes - total_held, 0)

        # Calculate exact lectures needed to reach >= 75%:
        # Formula: (attended + x) / (total_held + x) >= 0.75
        # attended + x >= 0.75 * total_held + 0.75 * x
        # 0.25 * x >= 0.75 * total_held - attended
        # x >= 3 * total_held - 4 * attended
        if current_pct >= 75.0:
            lectures_needed = 0
            # How many can they miss without dropping below 75%?
            buffer_miss = max(0, math.floor(attended / 0.75 - total_held))
        else:
            required_raw = (3 * total_held) - (4 * attended)
            lectures_needed = max(0, int(math.ceil(required_raw)))

        # Project final percentage assuming historical pace with slight regression
        assumed_future_rate = min(1.0, max(0.4, (attended / total_held)))
        projected_future_attended = remaining_classes * assumed_future_rate
        projected_final_pct = round(((attended + projected_future_attended) / total_planned_classes) * 100.0, 1)

        # Feasibility check: Can student attend enough classes before semester ends?
        max_possible_final_pct = round(((attended + remaining_classes) / total_planned_classes) * 100.0, 1)
        can_recover = max_possible_final_pct >= 75.0

        # Risk level categorization
        if current_pct < 65.0:
            risk_level = "CRITICAL"
        elif current_pct < 75.0 or shortage_prob > 0.65:
            risk_level = "HIGH"
        elif current_pct < 80.0 or shortage_prob > 0.35:
            risk_level = "MEDIUM"
        elif shortage_prob > 0.15:
            risk_level = "LOW"
        else:
            risk_level = "SAFE"

        # Trend direction
        if consecutive_absences >= 2:
            trend = "DOWNWARD"
        elif current_pct >= 85.0:
            trend = "UPWARD"
        else:
            trend = "STABLE"

        # Actionable recommendations
        if risk_level == "CRITICAL":
            if not can_recover:
                action = f"Mathematically unable to reach 75% (Max possible {max_possible_final_pct}%). Apply for medical duty leave or consult HOD immediately."
            else:
                action = f"Urgent: Mandatory attendance required for next {lectures_needed} consecutive classes to avoid debarment."
        elif risk_level == "HIGH":
            action = f"Attendance shortage alert: Must attend at least {lectures_needed} more classes to restore safe 75% standing."
        elif risk_level == "MEDIUM":
            action = f"Caution: Approaching danger zone. Avoid casual leaves over the next 3 weeks."
        else:
            action = f"Good standing ({current_pct}%). You have a safe buffer of ~{max(1, math.floor(attended * 0.25))} missed sessions."

        return {
            "student_id": student_id,
            "subject_code": subject_code,
            "current_percentage": current_pct,
            "projected_final_percentage": min(100.0, projected_final_pct),
            "risk_level": risk_level,
            "shortage_probability": round(shortage_prob, 3),
            "lectures_needed_to_reach_75": lectures_needed,
            "can_recover": can_recover,
            "recommended_action": action,
            "trend_direction": trend
        }
