import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import AgentBuilder from './pages/AgentBuilder';
import Templates from './pages/Templates';
import Integrations from './pages/Integrations';
import { Agent, Template, IntegrationId, StepType, LogEntry } from './types';
import { AGENT_TEMPLATES, ICONS } from './constants';
import { runAgentWorkflow } from './services/agentExecutor';
import TestRunModal from './components/TestRunModal';
import { supabase } from './services/supabaseClient';
import Spinner from './components/Spinner';

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
    </div>
  );
};


const App: React.FC = () => {
  const [page, setPage] = useState<Page>('dashboard');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [connectedIntegrations, setConnectedIntegrations] = useState<Set<IntegrationId>>(new Set());
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [runningAgentId, setRunningAgentId] = useState<string | null>(null);
  const [agentToTest, setAgentToTest] = useState<Agent | null>(null);
  const [runLogs, setRunLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        setError('Database connection not configured.');
        setAgents(initialAgents);
        setConnectedIntegrations(new Set(['slack', 'ai', 'gmail', 'control', 'agent', 'webhook']));
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
  
      // Fetch Agents
      const { data: fetchedAgents, error: agentsError } = await supabase.from('agents').select('*');
      
      if (agentsError) {
        setError('Failed to fetch agents.');
        console.error("Supabase error fetching agents:", agentsError);
      } else if (fetchedAgents && fetchedAgents.length > 0) {
        setAgents(fetchedAgents);
      } else if (fetchedAgents) {
        // Seed database if empty for this user
        console.log("No agents found, seeding database...");
        const { error: insertError } = await supabase.from('agents').insert(initialAgents as any);
        if (insertError) {
            setError('Failed to seed initial agents.');
            console.error("Supabase error seeding agents:", insertError);
        } else {
            setAgents(initialAgents);
        }
      }
  
      // Fetch Integrations
      const { data: settings, error: settingsError } = await supabase.from('user_settings').select('connected_integrations').single();

      if (settingsError && settingsError.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine for a new user
          setError('Failed to fetch settings.');
          console.error("Supabase error fetching settings:", settingsError);
      } else if (settings?.connected_integrations) {
          setConnectedIntegrations(new Set(settings.connected_integrations as IntegrationId[]));
      } else {
           // Seed with default integrations if none found
          const defaultIntegrations = Array.from(new Set(['slack', 'ai', 'gmail', 'control', 'agent', 'webhook']));
          const { error: insertError } = await supabase.from('user_settings').upsert({ id: 1, connected_integrations: defaultIntegrations });
          if (insertError) {
              setError('Failed to save initial settings.');
              console.error("Supabase error seeding settings:", insertError);
          } else {
              setConnectedIntegrations(new Set(defaultIntegrations));
          }
      }
      setIsLoading(false);
    };
  
    fetchData();
  }, []);

  const handleDeleteAgent = async (agentId: string) => {
    const originalAgents = agents;
    setAgents(prev => prev.filter(a => a.id !== agentId));
    
    if (supabase) {
        const { error } = await supabase.from('agents').delete().match({ id: agentId });
        if (error) {
            console.error('Failed to delete agent:', error);
            setAgents(originalAgents); // Rollback on failure
            alert('Error: Could not delete agent from the database.');
        }
    }
  };

  const handleToggleStatus = async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;
    const newStatus = agent.status === 'active' ? 'inactive' : 'active';

    const originalAgents = agents;
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: newStatus } : a ));

    if (supabase) {
        const { error } = await supabase.from('agents').update({ status: newStatus }).match({ id: agentId });
        if (error) {
            console.error('Failed to toggle agent status:', error);
            setAgents(originalAgents); // Rollback
            alert('Error: Could not update agent status.');
        }
    }
  };

  const handleToggleIntegration = async (id: IntegrationId) => {
    const originalIntegrations = new Set(connectedIntegrations);
    const newSet = new Set(connectedIntegrations);
    if (newSet.has(id)) {
        newSet.delete(id);
    } else {
        newSet.add(id);
    }
    setConnectedIntegrations(newSet);

    if (supabase) {
        const { error } = await supabase.from('user_settings').upsert({ id: 1, connected_integrations: Array.from(newSet) });
        if (error) {
            console.error('Failed to update integrations:', error);
            setConnectedIntegrations(originalIntegrations); // Rollback
            alert('Error: Could not save integration settings.');
        }
    }
  };
  
  const handleInitiateTestRun = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent || runningAgentId) return;

    if (agent.trigger && ['gmail', 'webhook'].includes(agent.trigger.integrationId)) {
        setAgentToTest(agent);
    } else {
        executeRun(agent);
    }
  };

  const executeRun = async (agent: Agent, triggerInput: { [stepId: string]: any } | null = null) => {
    if (runningAgentId) return;

    setRunLogs([]);
    setRunningAgentId(agent.id);
    setAgentToTest(null);

    handleStartEditAgent(agent);
    
    const onLog = (log: LogEntry) => setRunLogs(prev => [...prev, log]);
    const result = await runAgentWorkflow(agent.trigger, agent.actions, onLog, agent.systemPrompt, triggerInput);

    const updatedAgent = { 
      ...agent, 
      totalRuns: agent.totalRuns + 1,
      successfulRuns: agent.successfulRuns + (result.success ? 1 : 0),
      lastRun: new Date().toISOString(),
    };

    setAgents(prev => prev.map(a => a.id === agent.id ? updatedAgent : a));
    
    if (supabase) {
        const { error } = await supabase.from('agents').update({
            totalRuns: updatedAgent.totalRuns,
            successfulRuns: updatedAgent.successfulRuns,
            lastRun: updatedAgent.lastRun,
        }).match({ id: agent.id });

        if (error) {
            console.error('Failed to update agent run stats:', error);
            // The local state is updated, so we don't rollback, just log the error.
        }
    }
    
    setRunningAgentId(null);
  };

  const handleSaveAgent = async (agentToSave: Agent) => {
    const agentExists = agents.some(a => a.id === agentToSave.id);
    
    if (supabase) {
      if (agentExists) {
        const { data, error } = await supabase.from('agents').update(agentToSave as any).match({ id: agentToSave.id }).select();
        if (error || !data) {
          console.error("Failed to update agent:", error);
          alert("Error: Could not save agent.");
          return;
        }
        setAgents(prev => prev.map(a => a.id === agentToSave.id ? data[0] : a));
      } else {
        const { data, error } = await supabase.from('agents').insert(agentToSave as any).select();
        if (error || !data) {
          console.error("Failed to create agent:", error);
          alert("Error: Could not create agent.");
          return;
        }
        setAgents(prev => [...prev, data[0]]);
      }
    } else {
        // Fallback for no DB connection
        if (agentExists) {
            setAgents(prev => prev.map(a => a.id === agentToSave.id ? agentToSave : a));
        } else {
            setAgents(prev => [...prev, agentToSave]);
        }
    }

    setEditingAgent(null);
    setPage('dashboard');
  };

  const handleStartCreateAgent = () => {
    setRunLogs([]);
    setEditingAgent(null);
    setPage('builder');
  };

  const handleStartEditAgent = (agent: Agent) => {
    if (editingAgent?.id !== agent.id) {
        setRunLogs([]);
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
    setRunLogs([]);
    setEditingAgent(agentFromTemplate);
    setPage('builder');
  };

  const handleCancelBuilder = () => {
    setEditingAgent(null);
    setRunLogs([]);
    setPage('dashboard');
  }


  const renderPage = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
            <Spinner />
            <p className="mt-4 text-text-secondary">Loading agents...</p>
        </div>
      );
    }
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <h2 className="text-2xl text-red-400 mb-4">Connection Error</h2>
                <p className="text-text-secondary mb-2">{error}</p>
                <p className="text-xs text-text-secondary">Please ensure Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) are correctly configured and reload the page.</p>
            </div>
        );
    }

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
    </div>
  );
};

export default App;