from typing import List, Optional
from pydantic import BaseModel, Field

class ScanAnomalyRequest(BaseModel):
    student_id: str = Field(..., description="Unique student ID (e.g. STU2026001)")
    session_id: str = Field(..., description="Active lecture session UUID")
    scan_delay_seconds: float = Field(..., ge=0.0, description="Seconds elapsed between QR rotation and student scan")
    distance_meters: float = Field(..., ge=0.0, description="Calculated GPS distance between classroom and student device")
    ip_subnet_match: bool = Field(..., description="Whether student device IP matches campus Wi-Fi access point subnet")
    device_id: str = Field(..., description="Client device fingerprint hash")
    historical_attendance_rate: float = Field(..., ge=0.0, le=1.0, description="Current attendance percentage (0.0 - 1.0)")
    period_slot_index: int = Field(default=1, ge=1, le=8, description="Current period (1-8)")
    day_of_week: int = Field(default=1, ge=0, le=6, description="Weekday index (0=Mon, 4=Fri)")

class ScanAnomalyResponse(BaseModel):
    is_anomaly: bool
    anomaly_score: float = Field(..., description="Continuous anomaly score from 0.0 (safe) to 1.0 (severe outlier)")
    verdict: str = Field(..., description="VERIFIED, SUSPICIOUS, or REJECTED")
    flag_reasons: List[str]
    confidence: float
    model_version: str

class ShortageRiskRequest(BaseModel):
    student_id: str
    subject_code: str
    total_classes_held: int = Field(..., ge=1)
    classes_attended: int = Field(..., ge=0)
    total_planned_classes: int = Field(default=60, ge=1)
    consecutive_absences: int = Field(default=0, ge=0)
    medical_leaves_approved: int = Field(default=0, ge=0)
    days_until_exam: int = Field(default=45, ge=0)

class ShortageRiskResponse(BaseModel):
    student_id: str
    subject_code: str
    current_percentage: float
    projected_final_percentage: float
    risk_level: str  # SAFE, LOW, MEDIUM, HIGH, CRITICAL
    shortage_probability: float
    lectures_needed_to_reach_75: int
    can_recover: bool
    recommended_action: str
    trend_direction: str  # UPWARD, STABLE, DOWNWARD

class StudentAttendanceProfile(BaseModel):
    student_id: str
    student_name: str
    subject_code: str
    total_classes: int
    attended_classes: int
    streak: int
    days_to_exam: int

class BatchShortageRiskRequest(BaseModel):
    students: List[StudentAttendanceProfile]

class BatchShortageRiskResponse(BaseModel):
    total_evaluated: int
    at_risk_count: int
    results: List[ShortageRiskResponse]

class TrendDataPoint(BaseModel):
    week_number: int
    actual_or_projected_percentage: float
    is_projected: bool

class AttendanceTrendResponse(BaseModel):
    student_id: str
    subject_code: str
    history_weeks: List[TrendDataPoint]
    momentum: str
    status: str

class StudentIdentity(BaseModel):
    id: int
    roll_number: str
    full_name: str
    email: str
    department_code: str
    semester: int
    section: str
    photo_url: Optional[str] = None

class VisionScanRequest(BaseModel):
    scan_mode: str = Field(default="AUTO", description="LIVE_PHOTO, ID_CARD, or AUTO")
    image_base64: Optional[str] = Field(default=None, description="Captured camera image base64")
    card_payload: Optional[dict] = Field(default=None, description="Simulated or preset ID card payload")
    claimed_roll_number: Optional[str] = Field(default=None, description="Optional target student roll number")
    classroom_id: Optional[str] = Field(default="LH-301", description="Classroom identifier")
    distance_meters: Optional[float] = Field(default=6.5, ge=0.0, description="Measured distance to classroom")

class VisionScanResponse(BaseModel):
    is_verified: bool
    verdict: str  # VERIFIED, REJECTED
    student: Optional[StudentIdentity] = None
    match_confidence: float
    liveness_score: float
    tamper_score: float
    detection_mode: str
    flag_reasons: List[str]
    attendance_status: str  # PRESENT, REJECTED
    model_version: str
    message: str

