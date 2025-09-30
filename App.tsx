import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import AgentBuilder from './pages/AgentBuilder';
import Templates from './pages/Templates';
import Integrations from './pages/Integrations';
import { Agent, Template, IntegrationId, StepType } from './types';
import { AGENT_TEMPLATES } from './constants';
import { runAgentWorkflow } from './services/agentExecutor';

type Page = 'dashboard' | 'templates' | 'integrations' | 'builder';

const initialAgents: Agent[] = [
    {
        id: 'agent-dispatcher',
        name: 'Email Dispatcher',
        description: 'Receives any email, uses AI to classify it as "tech" or "sales", then calls the appropriate sub-agent.',
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
                    parameters: { input: '{{outputs.disp-t-1.body}}', prompt: 'Read this email and determine if it is a "sales" or a "tech" enquiry. Respond with only one word: sales or tech.' } 
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
                    parameters: { input: '{{outputs.disp-t-1.body}}', prompt: 'Read this email and determine if it is a "sales" or a "tech" enquiry. Respond with only one word: sales or tech.' } 
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
      <div className="text-2xl font-bold mb-10 text-white">Lindy.ai</div>
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
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [connectedIntegrations, setConnectedIntegrations] = useState<Set<IntegrationId>>(new Set(['slack', 'ai', 'gmail', 'control', 'agent']));
  const [runningAgentId, setRunningAgentId] = useState<string | null>(null);

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
  
  const handleRunAgent = async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent || runningAgentId) return;

    setRunningAgentId(agentId);

    const result = await runAgentWorkflow(agent.trigger, agent.actions, () => {});

    setAgents(prev => prev.map(a => 
        a.id === agentId 
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
    if (agents.some(a => a.id === agentToSave.id)) {
      setAgents(prev => prev.map(a => a.id === agentToSave.id ? agentToSave : a));
    } else {
      setAgents(prev => [...prev, agentToSave]);
    }
    setEditingAgent(null);
    setPage('dashboard');
  };

  const handleStartCreateAgent = () => {
    setEditingAgent(null);
    setPage('builder');
  };

  const handleStartEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setPage('builder');
  };

  const handleUseTemplate = (template: Template) => {
    const agentFromTemplate: Agent = {
        id: `agent-${Date.now()}`,
        name: template.name,
        description: template.description,
        trigger: template.trigger,
        actions: template.actions,
        status: 'inactive',
        totalRuns: 0,
        successfulRuns: 0,
        lastRun: null,
    };
    setEditingAgent(agentFromTemplate);
    setPage('builder');
  };

  const handleCancelBuilder = () => {
    setEditingAgent(null);
    setPage('dashboard');
  }


  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard agents={agents} onNewAgent={handleStartCreateAgent} onEditAgent={handleStartEditAgent} onToggleStatus={handleToggleStatus} onRunAgent={handleRunAgent} runningAgentId={runningAgentId} />;
      case 'builder':
        return <AgentBuilder agent={editingAgent} agents={agents} onSave={handleSaveAgent} onCancel={handleCancelBuilder} />;
      case 'templates':
          return <Templates onUseTemplate={handleUseTemplate} />;
      case 'integrations':
          return <Integrations connected={connectedIntegrations} onToggleIntegration={handleToggleIntegration} />;
      default:
        return <Dashboard agents={agents} onNewAgent={handleStartCreateAgent} onEditAgent={handleStartEditAgent} onToggleStatus={handleToggleStatus} onRunAgent={handleRunAgent} runningAgentId={runningAgentId}/>;
    }
  };

  return (
    <div className="flex h-screen bg-primary">
      <Sidebar currentPage={page} setPage={setPage} />
      <main className="flex-1 overflow-y-auto">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;