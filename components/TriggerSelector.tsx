import React, { useState } from 'react';
import { Integration, IntegrationOperation } from '../types';
import { INTEGRATIONS, ICONS } from '../constants';
import IntegrationIcon from './IntegrationIcon';

interface TriggerSelectorProps {
  onAdd: (integration: Integration, operation: IntegrationOperation) => void;
}

const TriggerSelector: React.FC<TriggerSelectorProps> = ({ onAdd }) => {
    const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

    const handleSelectOperation = (operation: IntegrationOperation) => {
        if (selectedIntegration) {
            onAdd(selectedIntegration, operation);
        }
    };

    if (!selectedIntegration) {
        const integrationsWithTriggers = INTEGRATIONS.filter(integ => 
            integ.operations.some(op => op.id.startsWith('on'))
        );

        return (
            <div className="text-center text-text-secondary py-10 border-2 border-dashed border-border rounded-lg">
                <h3 className="text-lg font-bold text-text-primary mb-2">Start your workflow</h3>
                <p className="text-sm mb-6">Select a trigger to begin.</p>
                <div className="px-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {integrationsWithTriggers.map(integration => (
                            <button 
                                key={integration.id}
                                onClick={() => setSelectedIntegration(integration)}
                                className="flex flex-col items-center justify-center p-3 space-y-2 bg-secondary border border-border rounded-lg hover:bg-border hover:border-accent transition-colors text-center"
                                aria-label={`Select ${integration.name}`}
                            >
                                <IntegrationIcon integrationId={integration.id} className="w-10 h-10"/>
                                <span className="text-xs text-text-primary font-semibold">{integration.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const triggerOperations = selectedIntegration.operations.filter(op => op.id.startsWith('on'));
    return (
        <div className="bg-secondary p-4 rounded-lg border border-border">
            <div className="flex items-center mb-4">
                <button onClick={() => setSelectedIntegration(null)} className="p-1 hover:bg-border rounded-full mr-3">
                    {ICONS.arrow_left}
                </button>
                <IntegrationIcon integrationId={selectedIntegration.id} className="w-8 h-8"/>
                <h4 className="text-lg font-bold ml-3 text-text-primary">Select a trigger for {selectedIntegration.name}</h4>
            </div>
            <div className="space-y-2">
                {triggerOperations.length > 0 ? (
                    triggerOperations.map(op => (
                    <button 
                        key={op.id}
                        onClick={() => handleSelectOperation(op)}
                        className="w-full text-left p-3 bg-primary rounded-lg hover:bg-border transition-colors"
                    >
                        <p className="font-semibold text-sm text-text-primary">{op.name}</p>
                        <p className="text-xs text-text-secondary">{op.description}</p>
                    </button>
                ))
                ) : (
                    <p className="text-sm text-text-secondary text-center py-4">No triggers available for this app.</p>
                )}
            </div>
        </div>
    );
};

export default TriggerSelector;
