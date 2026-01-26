import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckInScanner } from './CheckInScanner';

export const CheckInScannerWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return <div>Invalid invite ID</div>;
  }

  return (
    <CheckInScanner
      inviteId={id}
      onBack={() => navigate('/invites')}
    />
  );
};
