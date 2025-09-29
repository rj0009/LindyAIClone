
import React from 'react';
import { WorkflowStep, StepType } from '../types';
import IntegrationIcon from './IntegrationIcon';
import { ICONS } from '../constants';

interface WorkflowStepCardProps {
  step: WorkflowStep;
  index: number;
  onDelete: (id: string) => void;
}

const WorkflowStepCard: React.FC<WorkflowStepCardProps> = ({ step, index, onDelete }) => {
  const isTrigger = step.type === StepType.TRIGGER;

  return (
    <div className="flex items-center space-x-4">
      <div className="flex flex-col items-center">
        <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${isTrigger ? 'bg-accent text-white' : 'bg-secondary border-2 border-border'}`}>
          <IntegrationIcon integrationId={step.integrationId} className="w-10 h-10" />
        </div>
        {index > 0 && (
          <div className="absolute h-full w-0.5 bg-border" style={{top: '-50%', transform: 'translateY(1.5rem)'}}></div>
        )}
      </div>
      <div className="flex-1 p-4 bg-secondary rounded-lg border border-border flex justify-between items-center">
        <div>
          <p className="font-bold text-accent text-sm uppercase">{step.type}</p>
          <p className="text-text-primary">{step.description}</p>
          <p className="text-xs text-text-secondary">{step.operation}</p>
        </div>
        {!isTrigger && (
          <button onClick={() => onDelete(step.id)} className="p-2 text-text-secondary hover:text-red-500 transition-colors">
            {ICONS.trash}
          </button>
        )}
      </div>
    </div>
  );
};

export default WorkflowStepCard;
