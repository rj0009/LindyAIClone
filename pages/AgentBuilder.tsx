
import React, { useState } from 'react';
import { Agent, WorkflowStep } from '../types';
import { generateWorkflowFromPrompt } from '../services/geminiService';
import WorkflowStepCard from '../components/WorkflowStepCard';
import Spinner from '../components/Spinner';
import { ICONS, INTEGRATIONS } from '../constants';
import IntegrationIcon from '../components/IntegrationIcon';

interface AgentBuilderProps {
  onSave: (agent: Agent) => void;
  onCancel: () => void;
}

const AgentBuilder: React.FC<AgentBuilderProps> = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [workflow, setWorkflow] = useState<WorkflowStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [runLogs, setRunLogs] = useState<string[]>([]);

  const handleGenerateWorkflow = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setRunLogs([]);
    const generatedWorkflow = await generateWorkflowFromPrompt(prompt);
    setWorkflow(generatedWorkflow);
    setIsLoading(false);
  };

  const handleDeleteStep = (id: string) => {
    setWorkflow(workflow.filter(step => step.id !== id));
  };
  
  const handleSaveAgent = () => {
      const newAgent: Agent = {
          id: `agent-${Date.now()}`,
          name,
          description,
          workflow,
          status: 'active',
      }
      onSave(newAgent);
  }

  const handleTestRun = () => {
    setRunLogs([]);
    let logs: string[] = [];
    workflow.forEach((step, index) => {
        setTimeout(() => {
            const logMessage = `[${new Date().toLocaleTimeString()}] Executing ${step.type}: ${step.description} - SUCCESS`;
            setRunLogs(prev => [...prev, logMessage]);
        }, (index + 1) * 700);
    });
  };

  return (
    <div className="min-h-screen flex flex-col text-text-primary p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Agent</h1>
        <div className="flex space-x-2">
            <button onClick={onCancel} className="bg-secondary text-text-primary px-4 py-2 rounded-lg hover:bg-border transition-colors">Cancel</button>
            <button onClick={handleSaveAgent} disabled={!name || workflow.length === 0} className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">Save Agent</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        {/* Left: Configuration & Prompt */}
        <div className="lg:col-span-1 bg-secondary p-6 rounded-lg border border-border flex flex-col space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Agent Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Sales Lead Follow-up" className="w-full bg-primary border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Briefly describe what this agent does" className="w-full bg-primary border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div className="flex-1 flex flex-col">
            <label className="block text-sm font-medium text-text-secondary mb-1">Describe Workflow in Plain English</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., When a new email arrives in Gmail with 'invoice' in the subject, save the attachment to Google Drive and send a confirmation to the 'billing' Slack channel."
              className="w-full bg-primary border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent flex-1"
              rows={6}
            />
            <button onClick={handleGenerateWorkflow} disabled={isLoading || !prompt} className="mt-4 w-full bg-accent text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center hover:bg-blue-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
              {isLoading ? <Spinner /> : <>{ICONS.zap}<span>Generate Workflow</span></>}
            </button>
          </div>
        </div>

        {/* Center: Visual Workflow */}
        <div className="lg:col-span-1 bg-secondary p-6 rounded-lg border border-border overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Visual Workflow</h2>
          {workflow.length === 0 ? (
            <div className="text-center text-text-secondary py-10 border-2 border-dashed border-border rounded-lg">
                <p>Your workflow will appear here.</p>
                <p className="text-sm">Generate it from a prompt or add steps manually.</p>
            </div>
          ) : (
            <div className="space-y-4 relative">
              {workflow.map((step, index) => (
                <div key={step.id} className="relative">
                  <WorkflowStepCard step={step} index={index} onDelete={handleDeleteStep} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Test & Logs */}
        <div className="lg:col-span-1 bg-secondary p-6 rounded-lg border border-border flex flex-col">
          <h2 className="text-xl font-bold mb-4">Test & Logs</h2>
          <button onClick={handleTestRun} disabled={workflow.length === 0} className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
            {ICONS.play} <span>Test Run</span>
          </button>
          <div className="mt-4 bg-primary p-4 rounded-lg border border-border flex-1 h-64 overflow-y-auto font-mono text-sm">
            {runLogs.length === 0 ? (
                <p className="text-text-secondary">Click 'Test Run' to see execution logs.</p>
            ) : (
                runLogs.map((log, i) => <p key={i} className="whitespace-pre-wrap">{log}</p>)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentBuilder;
