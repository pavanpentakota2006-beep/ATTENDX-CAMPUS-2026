import React from 'react';
import { UserProfile } from '../types';
import { CampusClockWidget } from '../components/common/CampusClockWidget';
import { StudentDashboard } from '../components/dashboard/StudentDashboard';

interface StudentLayoutProps {
  user: UserProfile;
}

export const StudentLayout: React.FC<StudentLayoutProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <CampusClockWidget />
      <StudentDashboard user={user} />
    </div>
  );
};
