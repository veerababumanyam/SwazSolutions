import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TemplateMarketplace } from './TemplateMarketplace';

export const TemplateMarketplaceWrapper: React.FC = () => {
  const navigate = useNavigate();

  const handleSelectTemplate = (template: any) => {
    // Navigate to create editor with template data
    navigate('/invites/create', { state: { template } });
  };

  return (
    <TemplateMarketplace
      onClose={() => navigate('/invites')}
      onSelectTemplate={handleSelectTemplate}
    />
  );
};
