import React from 'react';

export type IntegrationId = 'gmail' | 'google_calendar' | 'slack' | 'hubspot' | 'salesforce' | 'google_drive' | 'webhook' | 'ai' | 'agent' | 'control';

export enum StepType {
  TRIGGER = 'trigger',
  ACTION = 'action',
}

export interface OperationOutput {
    id: string;
    name: string;
    description?: string;
}

export interface IntegrationOperation {
  id: string; // e.g., 'sendEmail'
  name: string; // e.g., 'Send Email'
  description: string;
  parameters: { [key: string]: any };
  outputs?: OperationOutput[];
}

export interface Integration {
  id: IntegrationId;
  name: string;
  description: string;
  color: string;
  icon: React.ReactElement;
  operations: IntegrationOperation[];
}

export interface WorkflowStep {
  id: string;
  type: StepType;
  integrationId: IntegrationId;
  name: string; // User-facing name for the step, e.g., "Send Welcome Email"
  operation: string; // Programmatic operation, e.g., "sendEmail"
  parameters: { [key: string]: any }; // The actual data for the operation
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt?: string;
  trigger: WorkflowStep | null;
  actions: WorkflowStep[][];
  status: 'active' | 'inactive';
  totalRuns: number;
  successfulRuns: number;
  lastRun: string | null;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowStep;
  actions: WorkflowStep[][];
}

export interface LogEntry {
  timestamp: string;
  status: 'INFO' | 'SUCCESS' | 'FAILURE' | 'AI_RESPONSE';
  text: string;
}