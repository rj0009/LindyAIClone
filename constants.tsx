import React from 'react';
import { Template, IntegrationId, StepType } from './types';

// FIX: Replaced JSX.Element with React.ReactElement to resolve namespace issue.
export const ICONS: { [key: string]: React.ReactElement } = {
  gmail: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
  ),
  google_calendar: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
  ),
  slack: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.83 15.24a2.82 2.82 0 1 1-4.24-3.53 2.82 2.82 0 1 1 4.24 3.53zM15.24 12.83a2.82 2.82 0 1 1 3.53-4.24 2.82 2.82 0 1 1-3.53 4.24zM8.76 11.17a2.82 2.82 0 1 1 3.53 4.24 2.82 2.82 0 1 1-3.53-4.24zM11.17 8.76a2.82 2.82 0 1 1-4.24 3.53 2.82 2.82 0 1 1 4.24-3.53z"></path></svg>
  ),
  hubspot: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.3 14.3 0 0 0-7.8 2.2 14.3 14.3 0 0 0-4 10.3A14.3 14.3 0 0 0 12 22a14.3 14.3 0 0 0 11.8-5.5 14.3 14.3 0 0 0-4-10.3A14.3 14.3 0 0 0 12 2z"></path></svg>
  ),
  salesforce: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 20.5C12.5 22.5 9.5 22.5 7.5 20.5C5.5 18.5 5.5 15.5 7.5 13.5C9.5 11.5 12.5 11.5 14.5 13.5C16.5 15.5 16.5 18.5 14.5 20.5z"></path><path d="M13.5 14.5C11.5 16.5 8.5 16.5 6.5 14.5C4.5 12.5 4.5 9.5 6.5 7.5C8.5 5.5 11.5 5.5 13.5 7.5C15.5 9.5 15.5 12.5 13.5 14.5z"></path><path d="M16.5 3.5C18.5 1.5 21.5 1.5 23.5 3.5C25.5 5.5 25.5 8.5 23.5 10.5C21.5 12.5 18.5 12.5 16.5 10.5C14.5 8.5 14.5 5.5 16.5 3.5z"></path><path d="M10.5 6.5C8.5 4.5 5.5 4.5 3.5 6.5C1.5 8.5 1.5 11.5 3.5 13.5C5.5 15.5 8.5 15.5 10.5 13.5C12.5 11.5 12.5 8.5 10.5 6.5z"></path></svg>
  ),
  google_drive: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
  ),
  webhook: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
  ),
  zap: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
  ),
  plus: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
  ),
  trash: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
  ),
  play: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
  ),
  log: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22h6a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v6"></path><path d="M2 12h10"></path><path d="m2 16 3-3 3 3"></path><path d="M15 6h2"></path><path d="M15 10h5"></path><path d="M15 14h5"></path></svg>
  )
};

export const INTEGRATIONS: {
  id: IntegrationId;
  name: string;
  description: string;
  color: string;
  // FIX: Replaced JSX.Element with React.ReactElement to resolve namespace issue.
  icon: React.ReactElement;
}[] = [
  { id: 'gmail', name: 'Gmail', description: 'Read, send, and manage emails.', color: '#EA4335', icon: ICONS.gmail },
  { id: 'google_calendar', name: 'Google Calendar', description: 'Create and manage calendar events.', color: '#4285F4', icon: ICONS.google_calendar },
  { id: 'slack', name: 'Slack', description: 'Send messages to channels and users.', color: '#4A154B', icon: ICONS.slack },
  { id: 'hubspot', name: 'HubSpot', description: 'Manage contacts and deals.', color: '#FF7A59', icon: ICONS.hubspot },
  { id: 'salesforce', name: 'Salesforce', description: 'Update CRM records.', color: '#00A1E0', icon: ICONS.salesforce },
  { id: 'google_drive', name: 'Google Drive', description: 'Manage files and folders.', color: '#4285F4', icon: ICONS.google_drive },
  { id: 'webhook', name: 'Webhook', description: 'Trigger workflows from external services.', color: '#30363D', icon: ICONS.webhook },
];

export const AGENT_TEMPLATES: Template[] = [
  {
    id: 'template-1',
    name: 'Email Triage',
    description: 'Categorize incoming emails and drafts replies for urgent items.',
    workflow: [
      { id: '1', type: StepType.TRIGGER, integrationId: 'gmail', description: 'On new email received', operation: 'onNewEmail' },
      { id: '2', type: StepType.ACTION, integrationId: 'slack', description: 'Notify team in #triage channel', operation: 'sendMessage' },
    ]
  },
  {
    id: 'template-2',
    name: 'Meeting Summarizer',
    description: 'Generate a summary and action items from a meeting transcript.',
    workflow: [
      { id: '1', type: StepType.TRIGGER, integrationId: 'webhook', description: 'On new transcript uploaded', operation: 'onWebhook' },
      { id: '2', type: StepType.ACTION, integrationId: 'google_drive', description: 'Save summary to Google Drive', operation: 'uploadFile' },
      { id: '3', type: StepType.ACTION, integrationId: 'gmail', description: 'Email summary to attendees', operation: 'sendEmail' },
    ]
  },
  {
    id: 'template-3',
    name: 'Sales Outreach',
    description: 'Automatically follow up with new leads from HubSpot.',
    workflow: [
      { id: '1', type: StepType.TRIGGER, integrationId: 'hubspot', description: 'On new contact created', operation: 'onNewContact' },
      { id: '2', type: StepType.ACTION, integrationId: 'gmail', description: 'Send introductory email', operation: 'sendEmail' },
    ]
  }
];