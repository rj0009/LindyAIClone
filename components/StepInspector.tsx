import React, { useState } from 'react';
import { WorkflowStep, OperationOutput, Agent } from '../types';
import { INTEGRATIONS, ICONS } from '../constants';
import IntegrationIcon from './IntegrationIcon';

interface StepInspectorProps {
  step: WorkflowStep | null;
  onUpdateParameter: (stepId: string, key: string, value: any) => void;
  onUpdateStep: (step: WorkflowStep) => void;
  availableOutputs: { step: WorkflowStep, outputs: OperationOutput[] }[];
  agents: Agent[];
  currentAgentId: string | null;
}

const ParameterInput: React.FC<{
    paramKey: string;
    value: any;
    stepId: string;
    onChange: (stepId: string, key: string, value: string) => void;
    availableOutputs: { step: WorkflowStep, outputs: OperationOutput[] }[];
}> = ({ paramKey, value, stepId, onChange, availableOutputs }) => {
    const [showVariables, setShowVariables] = useState(false);
    const isTextarea = ['body', 'message', 'content', 'description', 'prompt', 'input'].includes(paramKey.toLowerCase());
    const InputComponent = isTextarea ? 'textarea' : 'input';

    const handleInsertVariable = (stepId: string, outputId: string) => {
        const variable = `{{outputs.${stepId}.${outputId}}}`;
        const currentValue = value || '';
        onChange(stepId, paramKey, currentValue + variable);
        setShowVariables(false);
    }

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-text-secondary mb-1 capitalize">{paramKey.replace(/_/g, ' ')}</label>
            <div className="relative">
                <InputComponent
                    value={value}
                    onChange={(e) => onChange(stepId, paramKey, e.target.value)}
                    rows={isTextarea ? 4 : undefined}
                    className="w-full bg-primary border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent text-sm pr-10"
                />
                <button 
                    onClick={() => setShowVariables(v => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-text-secondary hover:text-accent"
                    aria-label="Insert dynamic variable"
                >
                    {ICONS.variable}
                </button>
            </div>
            {showVariables && (
                <div className="absolute z-10 mt-1 w-full bg-secondary border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {availableOutputs.length === 0 ? (
                        <p className="p-3 text-xs text-text-secondary">No outputs from previous steps are available.</p>
                    ) : (
                        availableOutputs.map(({ step, outputs }) => (
                            <div key={step.id} className="p-2">
                                <p className="text-xs font-bold text-text-primary px-2">{step.name}</p>
                                <ul className="text-sm">
                                    {outputs.map(output => (
                                        <li key={output.id}>
                                            <button 
                                                onClick={() => handleInsertVariable(step.id, output.id)}
                                                className="w-full text-left px-2 py-1.5 hover:bg-border rounded text-text-secondary hover:text-text-primary"
                                            >
                                                {output.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

const FilterEditor: React.FC<{ step: WorkflowStep, onUpdateParameter: StepInspectorProps['onUpdateParameter'] }> = ({ step, onUpdateParameter }) => {
    const conditions = [
        { id: 'contains', name: 'Text contains' },
        { id: 'not_contains', name: 'Text does not contain' },
        { id: 'equals', name: 'Equals' },
        { id: 'not_equals', name: 'Does not equal' },
        { id: 'greater_than', name: 'Number is greater than' },
        { id: 'less_than', name: 'Number is less than' },
    ];

    return (
        <div className="space-y-4">
            <ParameterInput 
                paramKey="input"
                value={step.parameters.input || ''}
                stepId={step.id}
                onChange={onUpdateParameter}
                availableOutputs={[]} // Simplified for now
            />
             <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Condition</label>
                <select
                    value={step.parameters.condition || 'contains'}
                    onChange={(e) => onUpdateParameter(step.id, 'condition', e.target.value)}
                    className="w-full bg-primary border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                >
                    {conditions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
             <ParameterInput 
                paramKey="value"
                value={step.parameters.value || ''}
                stepId={step.id}
                onChange={onUpdateParameter}
                availableOutputs={[]} // Simplified for now
            />
        </div>
    )
}

const AgentSelector: React.FC<{ step: WorkflowStep, onUpdateParameter: StepInspectorProps['onUpdateParameter'], agents: Agent[], currentAgentId: string | null }> = ({ step, onUpdateParameter, agents, currentAgentId }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Agent to Call</label>
            <select
                value={step.parameters.agentId || ''}
                onChange={(e) => onUpdateParameter(step.id, 'agentId', e.target.value)}
                className="w-full bg-primary border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
            >
                <option value="" disabled>Select an agent</option>
                {agents.filter(a => a.id !== currentAgentId).map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                ))}
            </select>
        </div>
    )
}


const StepInspector: React.FC<StepInspectorProps> = ({ step, onUpdateParameter, onUpdateStep, availableOutputs, agents, currentAgentId }) => {
  if (!step) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary p-4">
        <p>Select a step from the workflow to configure its parameters.</p>
      </div>
    );
  }

  const integration = INTEGRATIONS.find(i => i.id === step.integrationId);

  const renderParameters = () => {
    if (`${step.integrationId}.${step.operation}` === 'control.filter') {
        return <FilterEditor step={step} onUpdateParameter={onUpdateParameter} />
    }
     if (`${step.integrationId}.${step.operation}` === 'agent.callAgent') {
        return <AgentSelector step={step} onUpdateParameter={onUpdateParameter} agents={agents} currentAgentId={currentAgentId} />
    }

    if (Object.keys(step.parameters).length === 0) {
        return <p className="text-sm text-text-secondary text-center py-4">This step has no configurable parameters.</p>
    }

    return Object.entries(step.parameters).map(([key, value]) => (
        <ParameterInput 
            key={key} 
            paramKey={key} 
            value={value} 
            stepId={step.id}
            onChange={onUpdateParameter} 
            availableOutputs={availableOutputs}
        />
    ));
  }

  return (
    <div className="p-1">
        <div className="flex items-center space-x-3 mb-4">
            {integration && <IntegrationIcon integrationId={integration.id} className="w-8 h-8"/>}
            <div>
                <h3 className="text-lg font-bold text-text-primary">{step.name}</h3>
                <p className="text-sm text-text-secondary">{integration?.name} / {step.operation}</p>
            </div>
        </div>
        
        <div className="space-y-4">
            {renderParameters()}
        </div>
    </div>
  );
};

export default StepInspector;