export type UserRole = 'STUDENT' | 'FACULTY' | 'HOD' | 'ADMIN';

export interface UserProfile {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  rollNumber?: string;
  employeeCode?: string;
  departmentCode: string;
  avatarUrl?: string;
  semester?: number;
  section?: string;
}

export interface TimetableSlot {
  id: number;
  dayOfWeek: string;
  startTime: string; // "09:00"
  endTime: string;   // "09:55"
  periodNumber: number;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  roomNumber: string;
  section: string;
  semester: number;
  isLab?: boolean;
}

export interface SubjectAttendance {
  subjectCode: string;
  subjectName: string;
  classesHeld: number;
  classesAttended: number;
  percentage: number;
  minimumRequired: number; // usually 75%
  riskLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  shortageProbability: number;
  lecturesNeededToReach75: number;
  recommendedAction: string;
  trendDirection: 'UPWARD' | 'STABLE' | 'DOWNWARD';
}

export interface AttendanceRecordItem {
  id: number;
  sessionId: string;
  subjectCode: string;
  subjectName: string;
  scanTimestamp: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'FLAGGED';
  mode: string;
  distanceMeters: number;
  anomalyScore: number;
  isVerified: boolean;
}

export interface AiAnomalyItem {
  id: number;
  sessionId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  anomalyScore: number;
  verdict: 'VERIFIED' | 'SUSPICIOUS' | 'REJECTED';
  flagReasons: string[];
  distanceMeters: number;
  scanDelaySeconds: number;
  timestamp: string;
  resolved: boolean;
}

export interface CalendarEvent {
  id: number;
  date: string;
  title: string;
  type: 'REGULAR' | 'HOLIDAY' | 'EXAMINATION' | 'SUBSTITUTE_WORKING_DAY' | 'EVENT';
  appliesToWeekday?: string;
  description: string;
}

export interface LeaveItem {
  id: number;
  studentName: string;
  rollNumber: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
}
