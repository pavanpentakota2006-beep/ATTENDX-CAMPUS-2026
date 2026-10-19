import React from 'react';
import { UserProfile } from '../types';
import { CampusClockWidget } from '../components/common/CampusClockWidget';
import { HODDashboard } from '../components/dashboard/HODDashboard';

interface HODLayoutProps {
  user: UserProfile;
}

export const HODLayout: React.FC<HODLayoutProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <CampusClockWidget />
      <HODDashboard user={user} />
    </div>
  );
};
