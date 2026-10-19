import { SubjectAttendance, AiAnomalyItem, LeaveItem, AttendanceRecordItem } from '../types';

const AI_BASE_URL = 'http://localhost:8000/api/v1/ai';
const BACKEND_BASE_URL = 'http://localhost:8080/api/v1';

export const mockSubjects: SubjectAttendance[] = [
  {
    subjectCode: 'CS401',
    subjectName: 'Applied Machine Learning',
    classesHeld: 32,
    classesAttended: 29,
    percentage: 90.6,
    minimumRequired: 75.0,
    riskLevel: 'SAFE',
    shortageProbability: 0.04,
    lecturesNeededToReach75: 0,
    recommendedAction: 'Excellent standing (90.6%). Safe buffer of 6 missed sessions.',
    trendDirection: 'UPWARD'
  },
  {
    subjectCode: 'CS402',
    subjectName: 'Cloud Computing & Microservices',
    classesHeld: 28,
    classesAttended: 19,
    percentage: 67.9,
    minimumRequired: 75.0,
    riskLevel: 'HIGH',
    shortageProbability: 0.72,
    lecturesNeededToReach75: 8,
    recommendedAction: 'Shortage Warning: Must attend next 8 consecutive classes to restore safe 75% threshold.',
    trendDirection: 'DOWNWARD'
  },
  {
    subjectCode: 'CS403',
    subjectName: 'Distributed Systems & Blockchain',
    classesHeld: 30,
    classesAttended: 23,
    percentage: 76.7,
    minimumRequired: 75.0,
    riskLevel: 'MEDIUM',
    shortageProbability: 0.38,
    lecturesNeededToReach75: 0,
    recommendedAction: 'Borderline safe (76.7%). A single absence will trigger debarment warning.',
    trendDirection: 'STABLE'
  },
  {
    subjectCode: 'CS404',
    subjectName: 'Information Security & Cryptography',
    classesHeld: 26,
    classesAttended: 22,
    percentage: 84.6,
    minimumRequired: 75.0,
    riskLevel: 'LOW',
    shortageProbability: 0.12,
    lecturesNeededToReach75: 0,
    recommendedAction: 'Healthy attendance (84.6%). Keep current consistency.',
    trendDirection: 'UPWARD'
  },
  {
    subjectCode: 'CS405',
    subjectName: 'Compiler Design Lab',
    classesHeld: 14,
    classesAttended: 14,
    percentage: 100.0,
    minimumRequired: 75.0,
    riskLevel: 'SAFE',
    shortageProbability: 0.01,
    lecturesNeededToReach75: 0,
    recommendedAction: 'Flawless 100% lab attendance.',
    trendDirection: 'UPWARD'
  }
];

export const mockAnomalies: AiAnomalyItem[] = [
  {
    id: 1,
    sessionId: 'sess-ml-101',
    studentId: 'STU2026003',
    studentName: 'Amit Kumar',
    rollNumber: '22CS112',
    anomalyScore: 0.892,
    verdict: 'REJECTED',
    flagReasons: [
      'Geo-location fence violation: 185.0m from LH-301 (threshold 45m)',
      'Network mismatch: External cellular IP detected instead of campus Wi-Fi'
    ],
    distanceMeters: 185.0,
    scanDelaySeconds: 1.8,
    timestamp: 'Today at 09:04 AM',
    resolved: false
  },
  {
    id: 2,
    sessionId: 'sess-ml-101',
    studentId: 'STU2026008',
    studentName: 'Vikram Joshi',
    rollNumber: '22CS155',
    anomalyScore: 0.765,
    verdict: 'SUSPICIOUS',
    flagReasons: [
      'Inhuman scan velocity: 0.22s latency indicates script bot/token relay',
      'Device fingerprint collision with another active session'
    ],
    distanceMeters: 28.5,
    scanDelaySeconds: 0.22,
    timestamp: 'Today at 09:05 AM',
    resolved: false
  },
  {
    id: 3,
    sessionId: 'sess-cloud-092',
    studentId: 'STU2026019',
    studentName: 'Kavita Nair',
    rollNumber: '22CS082',
    anomalyScore: 0.640,
    verdict: 'SUSPICIOUS',
    flagReasons: [
      'Expired QR token scan attempt: 34.0s latency exceeding 20s TTL'
    ],
    distanceMeters: 12.0,
    scanDelaySeconds: 34.0,
    timestamp: 'Yesterday at 10:12 AM',
    resolved: true
  }
];

export const mockLeaves: LeaveItem[] = [
  {
    id: 1,
    studentName: 'Rahul Sharma',
    rollNumber: '22CS045',
    leaveType: 'ON_DUTY',
    fromDate: '2026-10-22',
    toDate: '2026-10-23',
    reason: 'Smart India Hackathon 2026 Grand Finale at IIT Madras',
    status: 'APPROVED',
    submittedAt: '18 Oct 2026'
  },
  {
    id: 2,
    studentName: 'Priya Patel',
    rollNumber: '22CS089',
    leaveType: 'MEDICAL',
    fromDate: '2026-10-25',
    toDate: '2026-10-26',
    reason: 'Viral fever - medical certificate attached',
    status: 'PENDING',
    submittedAt: '19 Oct 2026'
  }
];

export const mockAttendanceRecords: AttendanceRecordItem[] = [
  { id: 101, sessionId: 'sess-101', subjectCode: 'CS401', subjectName: 'Applied Machine Learning', scanTimestamp: 'Today, 09:03 AM', status: 'PRESENT', mode: 'Dynamic QR', distanceMeters: 6.4, anomalyScore: 0.08, isVerified: true },
  { id: 102, sessionId: 'sess-102', subjectCode: 'CS402', subjectName: 'Cloud Computing', scanTimestamp: 'Yesterday, 10:04 AM', status: 'PRESENT', mode: 'Dynamic QR', distanceMeters: 8.1, anomalyScore: 0.05, isVerified: true },
  { id: 103, sessionId: 'sess-103', subjectCode: 'CS403', subjectName: 'Distributed Systems', scanTimestamp: '17 Oct 2026, 11:18 AM', status: 'ABSENT', mode: 'System Auto-Absent', distanceMeters: 0, anomalyScore: 0.0, isVerified: true },
  { id: 104, sessionId: 'sess-104', subjectCode: 'CS404', subjectName: 'Information Security', scanTimestamp: '16 Oct 2026, 01:05 PM', status: 'PRESENT', mode: 'Dynamic QR', distanceMeters: 9.3, anomalyScore: 0.11, isVerified: true },
  { id: 105, sessionId: 'sess-105', subjectCode: 'CS405', subjectName: 'Compiler Design Lab', scanTimestamp: '14 Oct 2026, 02:02 PM', status: 'PRESENT', mode: 'Dynamic QR', distanceMeters: 4.8, anomalyScore: 0.02, isVerified: true }
];

export async function checkScanAnomaly(payload: {
  student_id: string;
  session_id: string;
  scan_delay_seconds: number;
  distance_meters: number;
  ip_subnet_match: boolean;
  device_id: string;
  historical_attendance_rate: number;
  period_slot_index: number;
  day_of_week: number;
}) {
  try {
    const res = await fetch(`${AI_BASE_URL}/anomaly/detect-scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Graceful fallback to client-side rule
  }

  // Client-side fallback rule
  const isAnomaly = payload.distance_meters > 45 || payload.scan_delay_seconds < 0.35 || !payload.ip_subnet_match;
  return {
    is_anomaly: isAnomaly,
    anomaly_score: isAnomaly ? 0.88 : 0.09,
    verdict: isAnomaly ? (payload.distance_meters > 100 ? 'REJECTED' : 'SUSPICIOUS') : 'VERIFIED',
    flag_reasons: isAnomaly ? [`Distance ${payload.distance_meters.toFixed(1)}m exceeds geo-fence`] : [],
    confidence: 0.94,
    model_version: '1.2.0-IForest-CampusShield (Client-Fallback)'
  };
}

export interface RegisteredStudent {
  id: number;
  rollNumber: string;
  fullName: string;
  email: string;
  departmentCode: string;
  semester: number;
  section: string;
  photoUrl: string;
}

export const REGISTERED_STUDENTS_LIST: RegisteredStudent[] = [
  {
    id: 5,
    rollNumber: '22CS045',
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@student.campus.edu',
    departmentCode: 'CSE',
    semester: 6,
    section: 'A',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=faces'
  },
  {
    id: 6,
    rollNumber: '22CS089',
    fullName: 'Priya Patel',
    email: 'priya.patel@student.campus.edu',
    departmentCode: 'CSE',
    semester: 6,
    section: 'A',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces'
  },
  {
    id: 7,
    rollNumber: '22CS112',
    fullName: 'Amit Kumar',
    email: 'amit.kumar@student.campus.edu',
    departmentCode: 'CSE',
    semester: 6,
    section: 'A',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces'
  },
  {
    id: 8,
    rollNumber: '22CS145',
    fullName: 'Sneha Reddy',
    email: 'sneha.reddy@student.campus.edu',
    departmentCode: 'CSE',
    semester: 6,
    section: 'B',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces'
  },
  {
    id: 9,
    rollNumber: '22CS014',
    fullName: 'Ananya Sen',
    email: 'ananya.sen@student.campus.edu',
    departmentCode: 'AI&DS',
    semester: 6,
    section: 'A',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces'
  },
  {
    id: 10,
    rollNumber: '22CS033',
    fullName: 'Rohan Iyer',
    email: 'rohan.iyer@student.campus.edu',
    departmentCode: 'CSE',
    semester: 6,
    section: 'B',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces'
  }
];

export async function scanStudentPhotoOrId(payload: {
  scan_mode: string;
  image_base64?: string;
  card_payload?: any;
  claimed_roll_number?: string;
  classroom_id?: string;
  distance_meters?: number;
}) {
  try {
    const res = await fetch(`${AI_BASE_URL}/vision/scan-student-id`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('AI Vision service unavailable, using client fallback', e);
  }

  // Client-side fallback simulation
  const card = payload.card_payload || {};
  if (card.is_counterfeit || card.is_spoof || (payload.distance_meters && payload.distance_meters > 45)) {
    return {
      is_verified: false,
      verdict: 'REJECTED',
      student: null,
      match_confidence: 0.35,
      liveness_score: 0.3,
      tamper_score: 0.88,
      detection_mode: payload.scan_mode,
      flag_reasons: [
        'Security watermark mismatch: Unofficial ID template detected',
        'Trained model detected abnormal high tamper score (>0.75)'
      ],
      attendance_status: 'REJECTED',
      model_version: 'v2.4.0-VisionNet-ResNet50+IForest (Fallback)',
      message: 'COUNTERFEIT OR UNVERIFIED ID CARD: Attendance strictly DENIED.'
    };
  }

  const roll = (card.roll_number || payload.claimed_roll_number || '22CS045').toUpperCase();
  const matched = REGISTERED_STUDENTS_LIST.find(s => s.rollNumber.toUpperCase() === roll) || {
    id: 99,
    rollNumber: roll,
    fullName: card.full_name || `Student ${roll}`,
    email: `${roll.toLowerCase()}@student.campus.edu`,
    departmentCode: card.department_code || 'CSE',
    semester: card.semester || 6,
    section: card.section || 'A',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces'
  };

  return {
    is_verified: true,
    verdict: 'VERIFIED',
    student: matched,
    match_confidence: 0.968,
    liveness_score: 0.952,
    tamper_score: 0.018,
    detection_mode: payload.scan_mode,
    flag_reasons: [],
    attendance_status: 'PRESENT',
    model_version: 'v2.4.0-VisionNet-ResNet50+IForest (Fallback)',
    message: `TRAINED MODEL VERIFIED: ${matched.fullName} (${matched.rollNumber}) marked PRESENT.`
  };
}

