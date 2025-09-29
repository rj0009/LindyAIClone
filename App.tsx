
import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import AgentBuilder from './pages/AgentBuilder';
import Templates from './pages/Templates';
import Integrations from './pages/Integrations';
import { Agent } from './types';
import { AGENT_TEMPLATES } from './constants';

type Page = 'dashboard' | 'templates' | 'integrations' | 'builder';

const initialAgents: Agent[] = [
    {
        id: 'agent-1',
        name: 'Daily Standup Reporter',
        description: 'Summarizes yesterday\'s Slack messages and sends a report.',
        workflow: AGENT_TEMPLATES[0].workflow,
        status: 'active',
    },
    {
        id: 'agent-2',
        name: 'CRM Lead Updater',
        description: 'Updates Salesforce when a new lead comes through HubSpot.',
        workflow: AGENT_TEMPLATES[2].workflow,
        status: 'inactive',
    }
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

  const handleSaveAgent = (agent: Agent) => {
    setAgents(prev => [...prev, agent]);
    setPage('dashboard');
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard agents={agents} onNewAgent={() => setPage('builder')} />;
      case 'builder':
        return <AgentBuilder onSave={handleSaveAgent} onCancel={() => setPage('dashboard')} />;
      case 'templates':
          return <Templates />;
      case 'integrations':
          return <Integrations />;
      default:
        return <Dashboard agents={agents} onNewAgent={() => setPage('builder')} />;
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
