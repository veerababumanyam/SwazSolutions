import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnalyticsDashboard } from './AnalyticsDashboard';

export const AnalyticsDashboardWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return <div>Invalid invite ID</div>;
  }

  return (
    <AnalyticsDashboard
      inviteId={id}
      onBack={() => navigate('/invites')}
    />
  );
};
