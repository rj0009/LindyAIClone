
import React from 'react';
import { ICONS, INTEGRATIONS } from '../constants';
import IntegrationIcon from './IntegrationIcon';
import { IntegrationId } from '../types';

interface IntegrationModalProps {
  integrationId: IntegrationId;
  onConnect: () => void;
  onClose: () => void;
}

const MOCK_PERMISSIONS: { [key in IntegrationId]?: string[] } = {
    gmail: [
        'Read, compose, and send emails from your Gmail account',
        'View and manage your contacts',
        'Manage your drafts and attachments'
    ],
    google_calendar: [
        'See, edit, share, and permanently delete all the calendars you can access using Google Calendar',
        'Create, change, and see events on your calendars'
    ],
    slack: [
        'View content and info about channels & conversations',
        'Perform actions in channels & conversations',
        'View content and info about your workspace'
    ],
    hubspot: ['View and manage data about your contacts, companies, and deals'],
    salesforce: ['Access and manage your data'],
    google_drive: ['See, edit, create, and delete all of your Google Drive files'],
    webhook: ['Send data to an external URL']
};

const IntegrationModal: React.FC<IntegrationModalProps> = ({ integrationId, onConnect, onClose }) => {
  const integration = INTEGRATIONS.find(i => i.id === integrationId);

  if (!integration) return null;

  const permissions = MOCK_PERMISSIONS[integration.id] || ['Access basic account information'];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-secondary rounded-lg border border-border w-full max-w-md p-6 relative m-4">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary">
          {ICONS.x}
        </button>
        
        <div className="flex flex-col items-center text-center">
            <IntegrationIcon integrationId={integration.id} className="w-16 h-16" />
            <h2 className="text-2xl font-bold mt-4 text-text-primary">Connect to {integration.name}</h2>
            <p className="mt-2 text-text-secondary">
                AgenticGov.ai is requesting permission to access your {integration.name} account.
            </p>
        </div>

        <div className="my-6 border-t border-border"></div>

        <div className="text-left">
            <h3 className="font-semibold text-text-primary mb-3">This will allow AgenticGov.ai to:</h3>
            <ul className="space-y-2">
                {permissions.map((permission, index) => (
                    <li key={index} className="flex items-start">
                        <span className="text-green-400 mr-2 mt-1">{ICONS.webhook}</span>
                        <span className="text-text-secondary text-sm">{permission}</span>
                    </li>
                ))}
            </ul>
        </div>
        
        <div className="my-6 border-t border-border"></div>

        <p className="text-xs text-text-secondary text-center">
            By clicking "Allow Connection", you agree to AgenticGov.ai's Terms of Service and Privacy Policy. You can revoke access at any time from your account settings.
        </p>
        
        <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
             <button
                onClick={onConnect}
                className="w-full bg-accent text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-500 transition-colors"
            >
                Allow Connection
            </button>
             <button
                onClick={onClose}
                className="w-full bg-border text-text-primary font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-secondary transition-colors"
            >
                Cancel
            </button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationModal;