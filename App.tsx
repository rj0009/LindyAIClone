import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import AgentBuilder from './pages/AgentBuilder';
import Templates from './pages/Templates';
import Integrations from './pages/Integrations';
import { Agent, Template, IntegrationId, StepType, LogEntry } from './types';
import { AGENT_TEMPLATES, ICONS } from './constants';
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

const Sidebar: React.FC<{ currentPage: Page; setPage: (page: Page) => void; }> = ({ currentPage, setPage }) => {
  const navItems: { id: Page; label: string; icon: React.ReactElement; }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: ICONS.dashboard },
    { id: 'templates', label: 'Templates', icon: ICONS.templates },
    { id: 'integrations', label: 'Integrations', icon: ICONS.integrations },
  ];

  return (
    <div className="w-64 bg-secondary border-r border-border p-4 flex flex-col">
      <div className="px-2 mb-10">
        <h1 className="text-xl font-bold text-white">AgenticGov.ai</h1>
      </div>
      <nav className="flex flex-col space-y-2 flex-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`px-4 py-2 text-left rounded-lg transition-colors flex items-center ${
              currentPage === item.id
                ? 'bg-accent text-white'
                : 'text-text-secondary hover:bg-border hover:text-text-primary'
            }`}
          >
             {item.icon}
             <span className="ml-3">{item.label}</span>
          </button>
        ))}
      </nav>
      {/* Reverted: Sync settings button removed */}
    </div>
  );
};


const App: React.FC = () => {
  const [page, setPage] = useState<Page>('dashboard');
  
  // Reverted: State management now uses useLocalStorage hook.
  const [agents, setAgents] = useLocalStorage<Agent[]>('agents', initialAgents);
  const [connectedIntegrations, setConnectedIntegrations] = useLocalStorage<Set<IntegrationId>>('connectedIntegrations', new Set(['slack', 'ai', 'gmail', 'control', 'agent', 'webhook']));
  
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [runningAgentId, setRunningAgentId] = useState<string | null>(null);
  const [agentToTest, setAgentToTest] = useState<Agent | null>(null);
  const [runLogs, setRunLogs] = useState<LogEntry[]>([]);

  const handleDeleteAgent = (agentId: string) => {
    setAgents(prev => prev.filter(a => a.id !== agentId));
  };

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
        return <Dashboard agents={agents} onNewAgent={handleStartCreateAgent} onEditAgent={handleStartEditAgent} onToggleStatus={handleToggleStatus} onRunAgent={handleInitiateTestRun} runningAgentId={runningAgentId} onDeleteAgent={handleDeleteAgent} />;
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
        return <Dashboard agents={agents} onNewAgent={handleStartCreateAgent} onEditAgent={handleStartEditAgent} onToggleStatus={handleToggleStatus} onRunAgent={handleInitiateTestRun} runningAgentId={runningAgentId} onDeleteAgent={handleDeleteAgent}/>;
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
      {/* Reverted: SyncModal component removed */}
    </div>
  );
};

export default App;