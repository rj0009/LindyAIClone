



import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import AgentBuilder from './pages/AgentBuilder';
import Templates from './pages/Templates';
import Integrations from './pages/Integrations';
import { Agent, Template, IntegrationId, StepType, LogEntry } from './types';
import { AGENT_TEMPLATES } from './constants';
import { runAgentWorkflow } from './services/agentExecutor';
import useLocalStorage from './hooks/useLocalStorage';
import TestRunModal from './components/TestRunModal';

type Page = 'dashboard' | 'templates' | 'integrations' | 'builder';

const initialAgents: Agent[] = [
    {
        id: 'agent-dispatcher',
        name: 'Email Dispatcher',
        description: 'Receives any email, uses AI to classify it as "tech" or "sales", then calls the appropriate sub-agent.',
        systemPrompt: 'You are a helpful email classification agent. Your goal is to determine if an email is a "sales" or a "tech" enquiry. Respond with only one word: sales or tech.',
        trigger: { 
            id: 'disp-t-1', 
            type: StepType.TRIGGER, 
            integrationId: 'gmail', 
            name: 'On Any New Email', 
            operation: 'onNewEmail', 
            parameters: { from: '*', subjectContains: '' } 
        },
        actions: [
            [
                { 
                    id: 'disp-a-1', 
                    type: StepType.ACTION, 
                    integrationId: 'ai', 
                    name: 'Classify Email', 
                    operation: 'analyzeText', 
                    parameters: { input: '{{outputs.disp-t-1.body}}', prompt: 'Is this a "sales" or "tech" email? Respond with only one word.' } 
                },
                {
                    id: 'disp-f-1',
                    type: StepType.ACTION,
                    integrationId: 'control',
                    name: 'If Sales...',
                    operation: 'filter',
                    parameters: { input: '{{outputs.disp-a-1.output}}', condition: 'contains', value: 'sales' }
                },
                {
                    id: 'disp-c-1',
                    type: StepType.ACTION,
                    integrationId: 'agent',
                    name: 'Call Sales Team Agent',
                    operation: 'callAgent',
                    parameters: { agentId: 'agent-sales' }
                }
            ],
            [
                { 
                    id: 'disp-a-2', 
                    type: StepType.ACTION, 
                    integrationId: 'ai', 
                    name: 'Classify Email', 
                    operation: 'analyzeText', 
                    parameters: { input: '{{outputs.disp-t-1.body}}', prompt: 'Is this a "sales" or "tech" email? Respond with only one word.' } 
                },
                 {
                    id: 'disp-f-2',
                    type: StepType.ACTION,
                    integrationId: 'control',
                    name: 'If Tech...',
                    operation: 'filter',
                    parameters: { input: '{{outputs.disp-a-2.output}}', condition: 'contains', value: 'tech' }
                },
                {
                    id: 'disp-c-2',
                    type: StepType.ACTION,
                    integrationId: 'agent',
                    name: 'Call Tech Support Agent',
                    operation: 'callAgent',
                    parameters: { agentId: 'agent-tech' }
                }
            ]
        ],
        status: 'active',
        totalRuns: 42,
        successfulRuns: 40,
        lastRun: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
        id: 'agent-sales',
        name: 'Sales Team Agent',
        description: 'Receives a sales lead and posts a notification to the #sales Slack channel.',
        systemPrompt: 'You are an agent responsible for sales notifications.',
        trigger: null,
        actions: [
            [
                {
                    id: 'sales-a-1',
                    type: StepType.ACTION,
                    integrationId: 'slack',
                    name: 'Notify #sales channel',
                    operation: 'sendMessage',
                    parameters: { channel: '#sales', message: 'New sales lead received! Please follow up.' }
                }
            ]
        ],
        status: 'active',
        totalRuns: 18,
        successfulRuns: 18,
        lastRun: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    },
     {
        id: 'agent-tech',
        name: 'Technical Support Agent',
        description: 'Receives a tech support query and posts a notification to the #support Slack channel.',
        systemPrompt: 'You are an agent responsible for technical support notifications.',
        trigger: null,
        actions: [
            [
                 {
                    id: 'tech-a-1',
                    type: StepType.ACTION,
                    integrationId: 'slack',
                    name: 'Notify #support channel',
                    operation: 'sendMessage',
                    parameters: { channel: '#support', message: 'New technical support ticket created.' }
                }
            ]
        ],
        status: 'active',
        totalRuns: 22,
        successfulRuns: 22,
        lastRun: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    },
];

const Sidebar: React.FC<{ currentPage: Page; setPage: (page: Page) => void }> = ({ currentPage, setPage }) => {
  const navItems: { id: Page; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'templates', label: 'Templates' },
    { id: 'integrations', label: 'Integrations' },
  ];

  return (
    <div className="w-64 bg-secondary border-r border-border p-4 flex flex-col">
      <div className="px-2 mb-10">
        <div className="flex items-center space-x-2">
            <img src="data:image/webp;base64,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" alt="GovTech Singapore Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-white">AgenticGov.ai</span>
        </div>
      </div>
      <nav className="flex flex-col space-y-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`px-4 py-2 text-left rounded-lg transition-colors ${
              currentPage === item.id
                ? 'bg-accent text-white'
                : 'text-text-secondary hover:bg-border hover:text-text-primary'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
};


const App: React.FC = () => {
  const [page, setPage] = useState<Page>('dashboard');
  const [agents, setAgents] = useLocalStorage<Agent[]>('agents', initialAgents);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [connectedIntegrations, setConnectedIntegrations] = useLocalStorage<Set<IntegrationId>>('connectedIntegrations', new Set(['slack', 'ai', 'gmail', 'control', 'agent', 'webhook']));
  const [runningAgentId, setRunningAgentId] = useState<string | null>(null);
  const [agentToTest, setAgentToTest] = useState<Agent | null>(null);
  const [runLogs, setRunLogs] = useState<LogEntry[]>([]);


  const handleToggleStatus = (agentId: string) => {
    setAgents(prev => prev.map(a => 
        a.id === agentId 
            ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } 
            : a
    ));
  };

  const handleToggleIntegration = (id: IntegrationId) => {
    setConnectedIntegrations(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        return newSet;
    });
  };
  
  const handleInitiateTestRun = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent || runningAgentId) return;

    // For agents with triggers that need input, show modal. Otherwise, run directly.
    if (agent.trigger && ['gmail', 'webhook'].includes(agent.trigger.integrationId)) {
        setAgentToTest(agent);
    } else {
        executeRun(agent);
    }
  };

  const executeRun = async (agent: Agent, triggerInput: { [stepId: string]: any } | null = null) => {
    if (runningAgentId) return;

    setRunLogs([]); // Clear logs for the new run
    setRunningAgentId(agent.id);
    setAgentToTest(null); // Close modal if open

    handleStartEditAgent(agent);
    
    const onLog = (log: LogEntry) => setRunLogs(prev => [...prev, log]);

    const result = await runAgentWorkflow(agent.trigger, agent.actions, onLog, agent.systemPrompt, triggerInput);

    setAgents(prev => prev.map(a => 
        a.id === agent.id 
            ? { 
                ...a, 
                totalRuns: a.totalRuns + 1,
                successfulRuns: a.successfulRuns + (result.success ? 1 : 0),
                lastRun: new Date().toISOString(),
              } 
            : a
    ));
    
    setRunningAgentId(null);
  };


  const handleSaveAgent = (agentToSave: Agent) => {
    setAgents(prev => {
        const agentExists = prev.some(a => a.id === agentToSave.id);
        if (agentExists) {
            return prev.map(a => a.id === agentToSave.id ? agentToSave : a);
        } else {
            return [...prev, agentToSave];
        }
    });
    setEditingAgent(null);
    setPage('dashboard');
  };

  const handleStartCreateAgent = () => {
    setRunLogs([]); // Clear any old logs
    setEditingAgent(null);
    setPage('builder');
  };

  const handleStartEditAgent = (agent: Agent) => {
    if (editingAgent?.id !== agent.id) {
        setRunLogs([]); // Clear logs if switching to a different agent
    }
    setEditingAgent(agent);
    setPage('builder');
  };

  const handleUseTemplate = (template: Template) => {
    const agentFromTemplate: Agent = {
        id: `agent-${Date.now()}`,
        name: template.name,
        description: template.description,
        systemPrompt: '',
        trigger: template.trigger,
        actions: template.actions,
        status: 'inactive',
        totalRuns: 0,
        successfulRuns: 0,
        lastRun: null,
    };
    setRunLogs([]); // Clear any old logs
    setEditingAgent(agentFromTemplate);
    setPage('builder');
  };

  const handleCancelBuilder = () => {
    setEditingAgent(null);
    setRunLogs([]);
    setPage('dashboard');
  }


  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard agents={agents} onNewAgent={handleStartCreateAgent} onEditAgent={handleStartEditAgent} onToggleStatus={handleToggleStatus} onRunAgent={handleInitiateTestRun} runningAgentId={runningAgentId} />;
      case 'builder':
        return <AgentBuilder 
                    agent={editingAgent} 
                    agents={agents} 
                    onSave={handleSaveAgent} 
                    onCancel={handleCancelBuilder}
                    initialLogs={runLogs}
                    onClearLogs={() => setRunLogs([])}
                />;
      case 'templates':
          return <Templates onUseTemplate={handleUseTemplate} />;
      case 'integrations':
          return <Integrations connected={connectedIntegrations} onToggleIntegration={handleToggleIntegration} />;
      default:
        return <Dashboard agents={agents} onNewAgent={handleStartCreateAgent} onEditAgent={handleStartEditAgent} onToggleStatus={handleToggleStatus} onRunAgent={handleInitiateTestRun} runningAgentId={runningAgentId}/>;
    }
  };

  return (
    <div className="flex h-screen bg-primary">
      <Sidebar currentPage={page} setPage={setPage} />
      <main className="flex-1 overflow-y-auto">
        {renderPage()}
      </main>
      {agentToTest && (
        <TestRunModal 
            agent={agentToTest}
            onClose={() => setAgentToTest(null)}
            onRun={(triggerOutput) => executeRun(agentToTest, triggerOutput)}
        />
      )}
    </div>
  );
};

export default App;