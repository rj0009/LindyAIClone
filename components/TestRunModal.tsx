
import React from 'react';
import { Agent, WorkflowStep, StepType } from '../types';
import { ICONS, INTEGRATIONS } from '../constants';
import IntegrationIcon from './IntegrationIcon';

interface TestRunModalProps {
  agent: Agent;
  onRun: (triggerOutput: { [stepId: string]: any }) => void;
  onClose: () => void;
}

const TestRunModal: React.FC<TestRunModalProps> = ({ agent, onRun, onClose }) => {
  if (!agent.trigger) return null;

  const [formState, setFormState] = React.useState<{ [key: string]: any }>({});

  const integration = INTEGRATIONS.find(i => i.id === agent.trigger?.integrationId);
  // Robust lookup: Try exact match first, then fall back to the first trigger for the integration.
  let operation = integration?.operations.find(o => o.id === agent.trigger?.operation);
  if (!operation) {
    operation = integration?.operations.find(o => o.id.startsWith('on'));
  }


  const handleRun = () => {
    const triggerOutput = {
        [agent.trigger!.id]: formState
    };
    onRun(triggerOutput);
  };

  const renderForm = () => {
      if (!operation?.outputs) {
          return <p className="text-sm text-text-secondary">This trigger does not require any input.</p>;
      }

      return operation.outputs.map(output => (
          <div key={output.id}>
              <label className="block text-sm font-medium text-text-secondary mb-1 capitalize">{output.name}</label>
              <textarea
                rows={output.id === 'body' ? 6 : 2}
                value={formState[output.id] || ''}
                onChange={e => setFormState(prev => ({...prev, [output.id]: e.target.value}))}
                placeholder={`Enter a test value for ${output.name}...`}
                className="w-full bg-primary border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
              />
          </div>
      ));
  };


  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-secondary rounded-lg border border-border w-full max-w-lg p-6 relative m-4 flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary">
          {ICONS.x}
        </button>
        
        <div className="flex items-center mb-4">
            {integration && <IntegrationIcon integrationId={integration.id} />}
            <div className="ml-3">
                <h2 className="text-xl font-bold text-text-primary">Test Trigger: {agent.name}</h2>
                <p className="text-sm text-text-secondary">Provide mock data to run your agent with.</p>
            </div>
        </div>

        <div className="my-4 border-t border-border"></div>

        <div className="space-y-4">
            {renderForm()}
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
             <button
                onClick={handleRun}
                className="w-full bg-accent text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-500 transition-colors"
            >
                {ICONS.play}
                <span>Run Test</span>
            </button>
             <button
                onClick={onClose}
                className="w-full bg-border text-text-primary font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-secondary transition-colors"
            >
                Cancel
            </button>
        </div>
      </div>
    </div>
  );
};

export default TestRunModal;
