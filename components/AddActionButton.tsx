import React, { useState } from 'react';
import { Integration, IntegrationOperation } from '../types';
import { INTEGRATIONS, ICONS } from '../constants';
import IntegrationIcon from './IntegrationIcon';

interface AddActionButtonProps {
  onAdd: (integration: Integration, operation: IntegrationOperation) => void;
}

const AddActionButton: React.FC<AddActionButtonProps> = ({ onAdd }) => {
    const [view, setView] = useState<'base' | 'operations'>('base');
    const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

    const handleSelectIntegration = (integration: Integration) => {
        setSelectedIntegration(integration);
        setView('operations');
    };

    const handleSelectOperation = (operation: IntegrationOperation) => {
        if (selectedIntegration) {
            onAdd(selectedIntegration, operation);
        }
        reset();
    };

    const reset = () => {
        setView('base');
        setSelectedIntegration(null);
    };

    if (view === 'base') {
        return (
            <div className="bg-secondary p-4 rounded-lg border border-border mt-4">
                <p className="text-sm text-text-secondary mb-3">Select an app to add an action:</p>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {INTEGRATIONS.map(integration => (
                        <button 
                            key={integration.id}
                            onClick={() => handleSelectIntegration(integration)}
                            className="flex flex-col items-center justify-center p-2 space-y-2 bg-primary rounded-lg hover:bg-border transition-colors text-center"
                            aria-label={`Select ${integration.name}`}
                        >
                            <IntegrationIcon integrationId={integration.id} className="w-8 h-8"/>
                            <span className="text-xs text-text-secondary">{integration.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (view === 'operations' && selectedIntegration) {
        return (
            <div className="bg-secondary p-4 rounded-lg border border-border mt-4">
                <div className="flex items-center mb-3">
                    <button onClick={reset} className="p-1 hover:bg-border rounded-full mr-2">
                        {ICONS.arrow_left}
                    </button>
                    <IntegrationIcon integrationId={selectedIntegration.id} className="w-6 h-6"/>
                    <h4 className="font-bold ml-2">{selectedIntegration.name}</h4>
                </div>
                 <div className="space-y-2">
                    {selectedIntegration.operations
                        .filter(op => !op.id.startsWith('on')) // Filter out trigger-like operations
                        .map(op => (
                        <button 
                            key={op.id}
                            onClick={() => handleSelectOperation(op)}
                            className="w-full text-left p-3 bg-primary rounded-lg hover:bg-border transition-colors"
                        >
                           <p className="font-semibold text-sm text-text-primary">{op.name}</p>
                           <p className="text-xs text-text-secondary">{op.description}</p>
                        </button>
                    ))}
                </div>
                 <button onClick={reset} className="w-full text-center mt-3 text-xs text-text-secondary hover:underline">Cancel</button>
            </div>
        );
    }
    
    return (
        <button 
            onClick={() => setView('base')}
            className="w-full flex items-center justify-center space-x-2 p-4 bg-secondary rounded-lg border-2 border-dashed border-border hover:border-accent hover:text-accent text-text-secondary transition-colors mt-4"
        >
            {ICONS.plus}
            <span>Add Action</span>
        </button>
    );
};

export default AddActionButton;
