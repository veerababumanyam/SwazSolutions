import React from 'react';
import { useParams } from 'react-router-dom';
import { PublicInviteView } from './PublicInviteView';

export const PublicInviteViewWrapper: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return <div>Invalid invite link</div>;
  }

  return <PublicInviteView slug={slug} />;
};
