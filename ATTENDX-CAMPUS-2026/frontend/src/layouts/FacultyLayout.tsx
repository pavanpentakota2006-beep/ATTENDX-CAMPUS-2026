import React from 'react';
import { UserProfile } from '../types';
import { CampusClockWidget } from '../components/common/CampusClockWidget';
import { FacultyDashboard } from '../components/dashboard/FacultyDashboard';

interface FacultyLayoutProps {
  user: UserProfile;
}

export const FacultyLayout: React.FC<FacultyLayoutProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <CampusClockWidget />
      <FacultyDashboard user={user} />
    </div>
  );
};
