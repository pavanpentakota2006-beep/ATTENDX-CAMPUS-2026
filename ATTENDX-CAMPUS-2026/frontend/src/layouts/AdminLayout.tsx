import React from 'react';
import { UserProfile } from '../types';
import { CampusClockWidget } from '../components/common/CampusClockWidget';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';

interface AdminLayoutProps {
  user: UserProfile;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <CampusClockWidget />
      <AdminDashboard user={user} />
    </div>
  );
};
