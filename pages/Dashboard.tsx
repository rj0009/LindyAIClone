
import React from 'react';
import { Agent } from '../types';
import IntegrationIcon from '../components/IntegrationIcon';
import { ICONS } from '../constants';

interface AgentCardProps {
    agent: Agent;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
    return (
        <div className="bg-secondary p-6 rounded-lg border border-border hover:border-accent transition-colors flex flex-col h-full">
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-text-primary mb-2">{agent.name}</h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${agent.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {agent.status}
                    </span>
                </div>
                <p className="text-text-secondary text-sm mb-4">{agent.description}</p>
            </div>
            <div>
                 <div className="flex items-center mb-4">
                    <span className="text-sm text-text-secondary mr-2">Workflow:</span>
                    <div className="flex space-x-1">
                        {agent.workflow.slice(0, 5).map(step => (
                            <IntegrationIcon key={step.id} integrationId={step.integrationId} className="w-6 h-6" />
                        ))}
                         {agent.workflow.length > 5 && <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-primary text-xs text-text-secondary">+{agent.workflow.length - 5}</div>}
                    </div>
                </div>
                <button className="w-full text-center bg-primary py-2 px-4 rounded-lg border border-border hover:bg-border transition-colors">
                    View Details
                </button>
            </div>
        </div>
    );
}

interface DashboardProps {
    agents: Agent[];
    onNewAgent: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ agents, onNewAgent }) => {
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
            <AgentCard key={agent.id} agent={agent} />
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
