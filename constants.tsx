import React from 'react';
import { Template, IntegrationId, StepType, Integration } from './types';

// FIX: Replaced JSX.Element with React.ReactElement to resolve namespace issue.
export const ICONS: { [key: string]: React.ReactElement } = {
  dashboard: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
  ),
  templates: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
  ),
  integrations: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
  ),
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
  ),
  x: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  ),
  grip_vertical: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
  ),
  settings: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.4l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2.4l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
  ),
  arrow_down: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
  ),
  arrow_left: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
  ),
  users: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
  ),
  filter: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
  ),
  variable: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
  ),
};

export const INTEGRATIONS: Integration[] = [
  { id: 'gmail', name: 'Gmail', description: 'Read, send, and manage emails.', color: '#EA4335', icon: ICONS.gmail, operations: [
      { id: 'onNewEmail', name: 'On New Email', description: 'Triggers when a new email is received.', parameters: { from: '*', subjectContains: '' }, outputs: [
        { id: 'from', name: 'Sender Email' },
        { id: 'subject', name: 'Email Subject' },
        { id: 'body', name: 'Email Body' },
      ]},
      { id: 'sendEmail', name: 'Send Email', description: 'Compose and send a new email.', parameters: { recipient: '', subject: '', body: '' } },
      { id: 'createDraft', name: 'Create Draft', description: 'Save a new email as a draft.', parameters: { recipient: '', subject: '', body: '' } },
  ]},
  { id: 'ai', name: 'AI Action', description: 'Use AI to generate text or analyze data.', color: '#A371F7', icon: ICONS.zap, operations: [
      { id: 'generateText', name: 'Generate Text', description: 'Generates text content based on a prompt.', parameters: { prompt: '' }, outputs: [
        { id: 'response', name: 'Generated Text' }
      ]},
      { id: 'analyzeText', name: 'Analyze & Decide', description: 'Analyzes text and outputs a structured response.', parameters: { input: '', prompt: 'Analyze the text and categorize it. Example: "Is this a sales or tech question?"' }, outputs: [
        { id: 'output', name: 'Analysis Result' }
      ]},
  ]},
  { id: 'control', name: 'Control', description: 'Add logic like branches and filters.', color: '#FB923C', icon: ICONS.filter, operations: [
      { id: 'filter', name: 'Only continue if...', description: 'Adds a conditional filter to a workflow branch.', parameters: { input: '', condition: 'contains', value: '' } },
  ]},
  { id: 'agent', name: 'Agent', description: 'Trigger another agent to run.', color: '#6366F1', icon: ICONS.users, operations: [
      { id: 'callAgent', name: 'Call Agent', description: 'Executes another agent as part of this workflow.', parameters: { agentId: '' } },
  ]},
  { id: 'slack', name: 'Slack', description: 'Send messages to channels and users.', color: '#4A154B', icon: ICONS.slack, operations: [
      { id: 'sendMessage', name: 'Send Message', description: 'Send a message to a channel or user.', parameters: { channel: '#general', message: '' } },
  ]},
  { id: 'google_calendar', name: 'Google Calendar', description: 'Create and manage calendar events.', color: '#4285F4', icon: ICONS.google_calendar, operations: [
    { id: 'createEvent', name: 'Create Event', description: 'Create a new event in a calendar.', parameters: { title: '', date: '', time: '', description: '' } },
  ]},
  { id: 'hubspot', name: 'HubSpot', description: 'Manage contacts and deals.', color: '#FF7A59', icon: ICONS.hubspot, operations: [
      { id: 'onNewContact', name: 'On New Contact', description: 'Triggers when a new contact is created.', parameters: {}, outputs: [
        { id: 'email', name: 'Contact Email' },
        { id: 'name', name: 'Contact Name' },
        { id: 'id', name: 'Contact ID' },
      ]},
      { id: 'createContact', name: 'Create Contact', description: 'Create a new contact record.', parameters: { email: '', name: '' } },
  ]},
  { id: 'salesforce', name: 'Salesforce', description: 'Update CRM records.', color: '#00A1E0', icon: ICONS.salesforce, operations: [
      { id: 'createRecord', name: 'Create Record', description: 'Create a new record (e.g., Lead, Account).', parameters: { object: 'Lead', fields: {} } },
  ]},
  { id: 'google_drive', name: 'Google Drive', description: 'Manage files and folders.', color: '#4285F4', icon: ICONS.google_drive, operations: [
      { id: 'uploadFile', name: 'Upload File', description: 'Upload a new file to a folder.', parameters: { folder: 'root', fileName: 'file.txt', content: '' } },
  ]},
  { id: 'webhook', name: 'Webhook', description: 'Trigger workflows from external services.', color: '#30363D', icon: ICONS.webhook, operations: [
      { id: 'onWebhook', name: 'On Webhook Call', description: 'Triggers when an HTTP request is received.', parameters: { url: 'https://yourapp.com/webhook/...' }, outputs: [
        { id: 'body', name: 'Request Body' },
        { id: 'headers', name: 'Request Headers' },
      ]},
      { id: 'callWebhook', name: 'Call Webhook', description: 'Send an HTTP POST request to a URL.', parameters: { url: '', data: {} } },
  ]},
];

export const AGENT_TEMPLATES: Template[] = [
  {
    id: 'template-1',
    name: 'Email Triage',
    description: 'Categorize incoming emails and drafts replies for urgent items.',
    trigger: { id: '1', type: StepType.TRIGGER, integrationId: 'gmail', name: 'On new email received', operation: 'onNewEmail', parameters: { from: '*', subjectContains: 'urgent' } },
    actions: [
      [
        { id: '2', type: StepType.ACTION, integrationId: 'slack', name: 'Notify team in #triage channel', operation: 'sendMessage', parameters: { channel: '#triage', message: 'New urgent email received from {{outputs.1.from}}' } },
      ]
    ]
  },
  {
    id: 'template-2',
    name: 'Meeting Summarizer',
    description: 'Generate a summary and action items from a meeting transcript.',
    trigger: { id: '1', type: StepType.TRIGGER, integrationId: 'webhook', name: 'On new transcript uploaded', operation: 'onWebhook', parameters: { url: 'https://yourapp.com/webhook/transcript' } },
    actions: [
      [
        { id: 'ai-1', type: StepType.ACTION, integrationId: 'ai', name: 'Summarize Transcript', operation: 'generateText', parameters: { prompt: 'Summarize the following meeting transcript and list key action items: {{outputs.1.body}}'} },
        { id: '2', type: StepType.ACTION, integrationId: 'google_drive', name: 'Save summary to Google Drive', operation: 'uploadFile', parameters: { fileName: 'summary.txt', content: '{{outputs.ai-1.response}}' } },
        { id: '3', type: StepType.ACTION, integrationId: 'gmail', name: 'Email summary to attendees', operation: 'sendEmail', parameters: { recipient: 'attendees@example.com', subject: 'Meeting Summary', body: 'Please find the summary attached.' } },
      ]
    ]
  },
  {
    id: 'template-3',
    name: 'Sales Outreach',
    description: 'Automatically follow up with new leads from HubSpot.',
    trigger: { id: '1', type: StepType.TRIGGER, integrationId: 'hubspot', name: 'On new contact created', operation: 'onNewContact', parameters: {} },
    actions: [
      [
        { id: '2', type: StepType.ACTION, integrationId: 'gmail', name: 'Send introductory email', operation: 'sendEmail', parameters: { recipient: '{{outputs.1.email}}', subject: 'Following up!', body: 'Hi {{outputs.1.name}}, thanks for your interest!' } },
      ]
    ]
  }
];