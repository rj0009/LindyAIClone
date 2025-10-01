import React from 'react';
import { Agent } from '../types';
import IntegrationIcon from '../components/IntegrationIcon';
import Spinner from '../components/Spinner';
import { ICONS } from '../constants';

interface AgentCardProps {
    agent: Agent;
    onEdit: (agent: Agent) => void;
    onToggleStatus: (agentId: string) => void;
    onRun: (agentId: string) => void;
    isRunning: boolean;
    onDelete: (agentId: string) => void;
}

const formatTimeAgo = (isoDateString: string | null): string => {
    if (!isoDateString) {
      return 'Never';
    }
    const date = new Date(isoDateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) {
      return 'Just now'
    }

    let interval = seconds / 31536000;
    if (interval > 1) {
      const years = Math.floor(interval);
      return years + (years > 1 ? " years ago" : " year ago");
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      const months = Math.floor(interval);
      return months + (months > 1 ? " months ago" : " month ago");
    }
    interval = seconds / 86400;
    if (interval > 1) {
        const days = Math.floor(interval);
        return days + (days > 1 ? " days ago" : " day ago");
    }
    interval = seconds / 3600;
    if (interval > 1) {
        const hours = Math.floor(interval);
        return hours + (hours > 1 ? " hours ago" : " hour ago");
    }
    interval = seconds / 60;
    if (interval > 1) {
        const minutes = Math.floor(interval);
        return minutes + (minutes > 1 ? " minutes ago" : " minute ago");
    }
    return Math.floor(seconds) + " seconds ago";
};

const ToggleSwitch: React.FC<{checked: boolean, onChange: () => void}> = ({ checked, onChange }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-secondary focus:ring-accent ${
        checked ? 'bg-green-500' : 'bg-gray-600'
      }`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

const AgentCard: React.FC<AgentCardProps> = ({ agent, onEdit, onToggleStatus, onRun, isRunning, onDelete }) => {
    const successRate = agent.totalRuns > 0 ? (agent.successfulRuns / agent.totalRuns) * 100 : 0;
    const lastRunTime = formatTimeAgo(agent.lastRun);
    const allSteps = [agent.trigger, ...agent.actions.flat()].filter(Boolean);

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete the agent "${agent.name}"? This action cannot be undone.`)) {
            onDelete(agent.id);
        }
    };


    return (
        <div className="bg-secondary p-6 rounded-lg border border-border hover:border-accent transition-colors flex flex-col h-full">
            <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-text-primary pr-2">{agent.name}</h3>
                    <div className="flex items-center space-x-2">
                        <span className={`text-xs font-semibold ${agent.status === 'active' ? 'text-green-400' : 'text-gray-400'}`}>
                            {agent.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                        <ToggleSwitch checked={agent.status === 'active'} onChange={() => onToggleStatus(agent.id)} />
                        <button
                            onClick={handleDelete}
                            className="p-1 text-text-secondary hover:text-red-500 transition-colors"
                            aria-label={`Delete agent ${agent.name}`}
                        >
                            {ICONS.trash}
                        </button>
                    </div>
                </div>
                <p className="text-text-secondary text-sm mb-4 h-10 overflow-hidden">{agent.description}</p>
                
                <div className="space-y-3 text-sm my-4">
                    <div className="flex justify-between items-center">
                        <span className="text-text-secondary">Success Rate</span>
                        <span className="text-text-primary font-medium">{successRate.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-primary rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${successRate}%` }}></div>
                    </div>

                    <div className="flex justify-between items-center text-text-secondary">
                        <span>Total Runs: <span className="text-text-primary font-medium">{agent.totalRuns}</span></span>
                        <span>Last Run: <span className="text-text-primary font-medium">{lastRunTime}</span></span>
                    </div>
                </div>

                <div className="flex items-center pt-2">
                    <span className="text-sm text-text-secondary mr-2">Workflow:</span>
                    <div className="flex space-x-1">
                        {allSteps.slice(0, 5).map(step => (
                            <IntegrationIcon key={step.id} integrationId={step.integrationId} className="w-6 h-6" />
                        ))}
                        {allSteps.length > 5 && <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-primary text-xs text-text-secondary">+{allSteps.length - 5}</div>}
                    </div>
                </div>
            </div>
            <div className="flex space-x-2 mt-6">
                 <button 
                    onClick={() => onRun(agent.id)} 
                    className="flex-1 text-center bg-primary py-2 px-4 rounded-lg border border-border hover:bg-border transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={agent.status === 'inactive' || isRunning}
                    aria-label={`Run agent ${agent.name}`}
                >
                    {isRunning ? <Spinner /> : ICONS.play}
                    <span>{isRunning ? 'Running...' : 'Run Now'}</span>
                </button>
                <button onClick={() => onEdit(agent)} className="flex-1 text-center bg-primary py-2 px-4 rounded-lg border border-border hover:bg-border transition-colors">
                    View / Edit
                </button>
            </div>
        </div>
    );
}

interface DashboardProps {
    agents: Agent[];
    onNewAgent: () => void;
    onEditAgent: (agent: Agent) => void;
    onToggleStatus: (agentId: string) => void;
    onRunAgent: (agentId: string) => void;
    runningAgentId: string | null;
    onDeleteAgent: (agentId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ agents, onNewAgent, onEditAgent, onToggleStatus, onRunAgent, runningAgentId, onDeleteAgent }) => {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Agents</h1>
        <button onClick={onNewAgent} className="bg-accent text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 hover:bg-blue-500 transition-colors">
          {ICONS.plus}
          <span>Create Agent</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {agents.map(agent => (
            <AgentCard 
                key={agent.id} 
                agent={agent} 
                onEdit={onEditAgent} 
                onToggleStatus={onToggleStatus} 
                onRun={onRunAgent}
                isRunning={runningAgentId === agent.id}
                onDelete={onDeleteAgent}
            />
        ))}
        {agents.length === 0 && (
            <div className="col-span-full text-center py-16 border-2 border-dashed border-border rounded-lg">
                <p className="text-text-secondary">You haven't created any agents yet.</p>
                <button onClick={onNewAgent} className="mt-4 text-accent hover:underline">
                    Create your first agent
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;