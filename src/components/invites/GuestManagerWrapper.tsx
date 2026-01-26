import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GuestManager } from './GuestManager';

export const GuestManagerWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return <div>Invalid invite ID</div>;
  }

  return (
    <GuestManager
      inviteId={id}
      onBack={() => navigate('/invites')}
    />
  );
};
