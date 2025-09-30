import React, { useState } from 'react';
import { INTEGRATIONS } from '../constants';
import IntegrationIcon from '../components/IntegrationIcon';
import { IntegrationId } from '../types';
import IntegrationModal from '../components/IntegrationModal';

interface IntegrationCardProps {
    integration: typeof INTEGRATIONS[0];
    isConnected: boolean;
    onToggle: () => void;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({ integration, isConnected, onToggle }) => {
    return (
        <div className="bg-secondary p-6 rounded-lg border border-border flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
                <IntegrationIcon integrationId={integration.id} className="w-10 h-10" />
                <div className="ml-4">
                    <h3 className="text-lg font-bold text-text-primary">{integration.name}</h3>
                    <p className="text-sm text-text-secondary">{integration.description}</p>
                </div>
            </div>
            <button
                onClick={onToggle}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors w-full md:w-auto ${
                    isConnected ? 'bg-red-500/20 text-red-400 hover:bg-red-500/40' : 'bg-green-500/20 text-green-400 hover:bg-green-500/40'
                }`}
            >
                {isConnected ? 'Disconnect' : 'Connect'}
            </button>
        </div>
    );
};

interface IntegrationsProps {
    connected: Set<IntegrationId>;
    onToggleIntegration: (id: IntegrationId) => void;
}

const Integrations: React.FC<IntegrationsProps> = ({ connected, onToggleIntegration }) => {
    const [selectedIntegrationId, setSelectedIntegrationId] = useState<IntegrationId | null>(null);

    const handleToggleClick = (id: IntegrationId) => {
        if (connected.has(id)) {
            onToggleIntegration(id); // Disconnect directly
        } else {
            setSelectedIntegrationId(id); // Open modal to connect
        }
    };

    const handleConnect = () => {
        if (selectedIntegrationId) {
            onToggleIntegration(selectedIntegrationId);
            setSelectedIntegrationId(null);
        }
    };
    
    const handleCloseModal = () => {
        setSelectedIntegrationId(null);
    };


    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Integrations</h1>
            <div className="space-y-4">
                {INTEGRATIONS.map(integration => (
                    <IntegrationCard 
                        key={integration.id} 
                        integration={integration} 
                        isConnected={connected.has(integration.id)}
                        onToggle={() => handleToggleClick(integration.id)}
                    />
                ))}
            </div>
            {selectedIntegrationId && (
                <IntegrationModal 
                    integrationId={selectedIntegrationId}
                    onConnect={handleConnect}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default Integrations;
