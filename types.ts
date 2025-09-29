
export type IntegrationId = 'gmail' | 'google_calendar' | 'slack' | 'hubspot' | 'salesforce' | 'google_drive' | 'webhook';

export enum StepType {
  TRIGGER = 'trigger',
  ACTION = 'action',
}

export interface WorkflowStep {
  id: string;
  type: StepType;
  integrationId: IntegrationId;
  description: string;
  operation: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  workflow: WorkflowStep[];
  status: 'active' | 'inactive';
}

export interface Template {
  id: string;
  name: string;
  description: string;
  workflow: WorkflowStep[];
}
