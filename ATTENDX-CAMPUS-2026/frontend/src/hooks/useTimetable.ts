import { useState, useMemo } from 'react';
import { TimetableSlot } from '../types';
import { useCampusClock } from './useCampusClock';

export const SAMPLE_TIMETABLE: Record<string, TimetableSlot[]> = {
  MONDAY: [
    { id: 1, dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '09:55', periodNumber: 1, subjectCode: 'CS401', subjectName: 'Applied Machine Learning', facultyName: 'Dr. Sarah Verma', roomNumber: 'LH-301', section: 'A', semester: 6 },
    { id: 2, dayOfWeek: 'MONDAY', startTime: '10:00', endTime: '10:55', periodNumber: 2, subjectCode: 'CS402', subjectName: 'Cloud Computing & Microservices', facultyName: 'Prof. Ananya Roy', roomNumber: 'LH-301', section: 'A', semester: 6 },
    { id: 3, dayOfWeek: 'MONDAY', startTime: '11:15', endTime: '12:10', periodNumber: 3, subjectCode: 'CS403', subjectName: 'Distributed Systems & Blockchain', facultyName: 'Dr. Sarah Verma', roomNumber: 'LH-301', section: 'A', semester: 6 },
    { id: 4, dayOfWeek: 'MONDAY', startTime: '13:00', endTime: '13:55', periodNumber: 4, subjectCode: 'CS404', subjectName: 'Information Security & Cryptography', facultyName: 'Prof. Ananya Roy', roomNumber: 'LH-301', section: 'A', semester: 6 },
    { id: 5, dayOfWeek: 'MONDAY', startTime: '14:00', endTime: '16:00', periodNumber: 5, subjectCode: 'CS405', subjectName: 'Compiler Design Lab', facultyName: 'Dr. Sarah Verma', roomNumber: 'CS-LAB-4', section: 'A', semester: 6, isLab: true }
  ],
  TUESDAY: [
    { id: 6, dayOfWeek: 'TUESDAY', startTime: '09:00', endTime: '09:55', periodNumber: 1, subjectCode: 'CS402', subjectName: 'Cloud Computing & Microservices', facultyName: 'Prof. Ananya Roy', roomNumber: 'LH-301', section: 'A', semester: 6 },
    { id: 7, dayOfWeek: 'TUESDAY', startTime: '10:00', endTime: '10:55', periodNumber: 2, subjectCode: 'CS401', subjectName: 'Applied Machine Learning', facultyName: 'Dr. Sarah Verma', roomNumber: 'LH-301', section: 'A', semester: 6 },
    { id: 8, dayOfWeek: 'TUESDAY', startTime: '11:15', endTime: '12:10', periodNumber: 3, subjectCode: 'CS404', subjectName: 'Information Security', facultyName: 'Prof. Ananya Roy', roomNumber: 'LH-301', section: 'A', semester: 6 },
    { id: 9, dayOfWeek: 'TUESDAY', startTime: '13:00', endTime: '13:55', periodNumber: 4, subjectCode: 'CS403', subjectName: 'Distributed Systems', facultyName: 'Dr. Sarah Verma', roomNumber: 'LH-301', section: 'A', semester: 6 }
  ],
  WEDNESDAY: [
    { id: 10, dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '09:55', periodNumber: 1, subjectCode: 'CS403', subjectName: 'Distributed Systems', facultyName: 'Dr. Sarah Verma', roomNumber: 'LH-301', section: 'A', semester: 6 },
    { id: 11, dayOfWeek: 'WEDNESDAY', startTime: '10:00', endTime: '10:55', periodNumber: 2, subjectCode: 'CS404', subjectName: 'Information Security', facultyName: 'Prof. Ananya Roy', roomNumber: 'LH-301', section: 'A', semester: 6 },
    { id: 12, dayOfWeek: 'WEDNESDAY', startTime: '11:15', endTime: '12:10', periodNumber: 3, subjectCode: 'CS401', subjectName: 'Applied Machine Learning', facultyName: 'Dr. Sarah Verma', roomNumber: 'LH-301', section: 'A', semester: 6 }
  ],
  THURSDAY: [
    { id: 13, dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '09:55', periodNumber: 1, subjectCode: 'CS404', subjectName: 'Information Security', facultyName: 'Prof. Ananya Roy', roomNumber: 'LH-301', section: 'A', semester: 6 },
    { id: 14, dayOfWeek: 'THURSDAY', startTime: '10:00', endTime: '10:55', periodNumber: 2, subjectCode: 'CS402', subjectName: 'Cloud Computing', facultyName: 'Prof. Ananya Roy', roomNumber: 'LH-301', section: 'A', semester: 6 },
    { id: 15, dayOfWeek: 'THURSDAY', startTime: '11:15', endTime: '12:10', periodNumber: 3, subjectCode: 'CS403', subjectName: 'Distributed Systems', facultyName: 'Dr. Sarah Verma', roomNumber: 'LH-301', section: 'A', semester: 6 }
  ],
  FRIDAY: [
    { id: 16, dayOfWeek: 'FRIDAY', startTime: '09:00', endTime: '09:55', periodNumber: 1, subjectCode: 'CS401', subjectName: 'Applied Machine Learning', facultyName: 'Dr. Sarah Verma', roomNumber: 'LH-301', section: 'A', semester: 6 },
    { id: 17, dayOfWeek: 'FRIDAY', startTime: '10:00', endTime: '10:55', periodNumber: 2, subjectCode: 'CS403', subjectName: 'Distributed Systems', facultyName: 'Dr. Sarah Verma', roomNumber: 'LH-301', section: 'A', semester: 6 },
    { id: 18, dayOfWeek: 'FRIDAY', startTime: '11:15', endTime: '12:10', periodNumber: 3, subjectCode: 'CS402', subjectName: 'Cloud Computing', facultyName: 'Prof. Ananya Roy', roomNumber: 'LH-301', section: 'A', semester: 6 }
  ]
};

export function useTimetable(selectedDay?: string) {
  const clock = useCampusClock();
  const activeDay = selectedDay || (SAMPLE_TIMETABLE[clock.dayOfWeek] ? clock.dayOfWeek : 'MONDAY');

  const slots = useMemo(() => {
    return SAMPLE_TIMETABLE[activeDay] || SAMPLE_TIMETABLE.MONDAY;
  }, [activeDay]);

  const currentSlot = useMemo(() => {
    if (!clock.currentPeriod || activeDay !== clock.dayOfWeek) return null;
    return slots.find(s => s.periodNumber === clock.currentPeriod) || null;
  }, [clock.currentPeriod, activeDay, clock.dayOfWeek, slots]);

  const nextSlot = useMemo(() => {
    if (!clock.currentPeriod || activeDay !== clock.dayOfWeek) {
      return slots[0] || null;
    }
    return slots.find(s => s.periodNumber > clock.currentPeriod!) || null;
  }, [clock.currentPeriod, activeDay, clock.dayOfWeek, slots]);

  return {
    activeDay,
    slots,
    currentSlot,
    nextSlot,
    isTodaySelected: activeDay === clock.dayOfWeek
  };
}
