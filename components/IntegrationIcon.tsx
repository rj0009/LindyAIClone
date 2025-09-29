
import React from 'react';
import { IntegrationId } from '../types';
import { INTEGRATIONS } from '../constants';

interface IntegrationIconProps {
  integrationId: IntegrationId;
  className?: string;
}

const IntegrationIcon: React.FC<IntegrationIconProps> = ({ integrationId, className = 'w-8 h-8' }) => {
  const integration = INTEGRATIONS.find(i => i.id === integrationId);

  if (!integration) {
    return null;
  }

  return (
    <div
      className={`flex items-center justify-center rounded-lg p-1.5 ${className}`}
      style={{ backgroundColor: integration.color }}
    >
      <div className="text-white">
        {integration.icon}
      </div>
    </div>
  );
};

export default IntegrationIcon;
