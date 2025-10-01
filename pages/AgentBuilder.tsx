import React, { useState, useEffect } from 'react';
import { Agent, WorkflowStep, StepType, LogEntry, Integration, IntegrationOperation, OperationOutput } from '../types';
import { generateWorkflowFromPrompt } from '../services/geminiService';
import { runAgentWorkflow } from '../services/agentExecutor';
import WorkflowStepCard from '../components/WorkflowStepCard';
import StepInspector from '../components/StepInspector';
import Spinner from '../components/Spinner';
import { ICONS, INTEGRATIONS } from '../constants';
import AddActionButton from '../components/AddActionButton';

interface AgentBuilderProps {
  agent?: Agent | null;
  agents: Agent[]; // All agents for agent-selection dropdown
  onSave: (agent: Agent) => void;
  onCancel: () => void;
}

const DropIndicator = () => (
    <div className="relative h-1 my-2">
        <div className="absolute inset-x-12 bg-accent rounded-full h-full opacity-60"></div>
    </div>
);

// FIX: Add explicit props type for ActionBranch to resolve TypeScript error with 'key' prop.
interface ActionBranchProps {
    branch: WorkflowStep[];
    branchIndex: number;
    onDeleteStep: (branchIndex: number, stepIndex: number) => void;
    onSelectStep: (id: string) => void;
    selectedStepId: string | null;
    onAddStep: (branchIndex: number, integration: Integration, operation: IntegrationOperation) => void;
    onDragStart: (e: React.DragEvent, location: { branchIndex: number; stepIndex: number; }) => void;
    onDragOver: (e: React.DragEvent, location: { branchIndex: number; stepIndex: number; }) => void;
    onDrop: (e: React.DragEvent, targetBranchIndex: number) => void;
    draggedItemId: { branchIndex: number; stepIndex: number; } | null;
    dropTarget: { branchIndex: number; stepIndex: number; } | null;
}

const ActionBranch: React.FC<ActionBranchProps> = ({ branch, branchIndex, onDeleteStep, onSelectStep, selectedStepId, onAddStep, onDragStart, onDragOver, onDrop, draggedItemId, dropTarget }) => {
    return (
        <div className="flex-1 min-w-[300px] bg-primary p-4 rounded-lg border border-border">
            <div 
                className="space-y-4 relative h-full"
                onDrop={(e) => onDrop(e, branchIndex)}
                onDragOver={(e) => e.preventDefault()}
            >
              {branch.map((step, stepIndex) => (
                <div key={step.id} className="relative">
                    {dropTarget?.branchIndex === branchIndex && dropTarget?.stepIndex === stepIndex && <DropIndicator />}
                    <div
                        draggable
                        onDragStart={(e) => onDragStart(e, { branchIndex, stepIndex })}
                        onDragOver={(e) => onDragOver(e, { branchIndex, stepIndex })}
                    >
                        <WorkflowStepCard 
                            step={step} 
                            index={stepIndex + 1}
                            onDelete={() => onDeleteStep(branchIndex, stepIndex)}
                            onClick={() => onSelectStep(step.id)}
                            isSelected={step.id === selectedStepId}
                            isDraggable={true}
                            isDragging={draggedItemId?.branchIndex === branchIndex && draggedItemId?.stepIndex === stepIndex}
                        />
                    </div>
                </div>
              ))}
              {dropTarget?.branchIndex === branchIndex && dropTarget?.stepIndex === branch.length && <DropIndicator />}
             <AddActionButton onAdd={(integration, operation) => onAddStep(branchIndex, integration, operation)} />
            </div>
        </div>
    )
}

const AgentBuilder: React.FC<AgentBuilderProps> = ({ agent, agents, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [trigger, setTrigger] = useState<WorkflowStep | null>(null);
  const [actions, setActions] = useState<WorkflowStep[][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [runLogs, setRunLogs] = useState<LogEntry[]>([]);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [status, setStatus] = useState<'active' | 'inactive'>('inactive');
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'configure' | 'logs'>('configure');

  // Drag and Drop State
  const [draggedItem, setDraggedItem] = useState<{branchIndex: number, stepIndex: number} | null>(null);
  const [dropTarget, setDropTarget] = useState<{branchIndex: number, stepIndex: number} | null>(null);


  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setDescription(agent.description);
      setTrigger(agent.trigger);
      setActions(agent.actions);
      setAgentId(agent.id);
      setStatus(agent.status);
      setPrompt('');
      setSelectedStepId(agent.trigger?.id || agent.actions[0]?.[0]?.id || null);
    } else {
      setName('');
      setDescription('');
      setTrigger(null);
      setActions([]);
      setAgentId(null);
      setStatus('inactive');
      setPrompt('');
      setSelectedStepId(null);
    }
    setRunLogs([]);
    setActiveTab('configure');
  }, [agent]);

  const handleGenerateWorkflow = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setRunLogs([]);
    const generatedWorkflow = await generateWorkflowFromPrompt(prompt);
    if (generatedWorkflow.length > 0) {
        const generatedTrigger = generatedWorkflow.find(step => step.type === StepType.TRIGGER);
        const generatedActions = generatedWorkflow.filter(step => step.type === StepType.ACTION);
        setTrigger(generatedTrigger || null);
        setActions([generatedActions]);
        setSelectedStepId(generatedTrigger?.id || null);
    } else {
        setTrigger(null);
        setActions([]);
        setSelectedStepId(null);
    }
    setActiveTab('configure');
    setIsLoading(false);
  };
  
  const handleSaveAgent = () => {
      const agentData: Agent = {
          id: agentId || `agent-${Date.now()}`,
          name,
          description,
          trigger,
          actions,
          status,
          totalRuns: agent?.totalRuns || 0,
          successfulRuns: agent?.successfulRuns || 0,
          lastRun: agent?.lastRun || null,
      }
      onSave(agentData);
  }

  const handleTestRun = async () => {
    setRunLogs([]);
    setActiveTab('logs');
    await runAgentWorkflow(trigger, actions, (log) => setRunLogs(prev => [...prev, log]));
  };
  
  const handleUpdateStepParameter = (stepId: string, paramKey: string, paramValue: any) => {
    const updater = (step: WorkflowStep) => {
        if (step.id === stepId) {
            return { ...step, parameters: { ...step.parameters, [paramKey]: paramValue } };
        }
        return step;
    };
    if (trigger?.id === stepId) {
        setTrigger(prev => prev ? updater(prev) : null);
        return;
    }
    setActions(currentActions => currentActions.map(branch => branch.map(updater)));
  };

  const handleUpdateStep = (updatedStep: WorkflowStep) => {
    if (trigger?.id === updatedStep.id) {
        setTrigger(updatedStep);
        return;
    }
    setActions(currentActions =>
        currentActions.map(branch =>
            branch.map(step => (step.id === updatedStep.id ? updatedStep : step))
        )
    );
  };
  
  const handleDeleteStep = (branchIndex: number, stepIndex: number) => {
    const stepToDeleteId = actions[branchIndex][stepIndex].id;
    setActions(prev => {
        const newActions = [...prev];
        newActions[branchIndex] = newActions[branchIndex].filter((_, i) => i !== stepIndex);
        return newActions;
    });

    if(selectedStepId === stepToDeleteId){
        setSelectedStepId(trigger?.id || null);
    }
  };

  const handleAddStep = (branchIndex: number, integration: Integration, operation: IntegrationOperation) => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      type: StepType.ACTION,
      integrationId: integration.id,
      name: operation.name,
      operation: operation.id,
      parameters: { ...operation.parameters }
    };
    
    setActions(prev => {
        const newActions = [...prev];
        if(!newActions[branchIndex]) newActions[branchIndex] = [];
        newActions[branchIndex].push(newStep);
        return newActions;
    });

    setSelectedStepId(newStep.id);
    setActiveTab('configure');
  };

  const handleAddBranch = () => {
      setActions(prev => [...prev, []]);
  }

  // --- DND Handlers ---
  const handleDragStart = (e: React.DragEvent, location: { branchIndex: number, stepIndex: number }) => {
    setDraggedItem(location);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, location: { branchIndex: number, stepIndex: number }) => {
    e.preventDefault();
    if (!draggedItem) return;
    setDropTarget(location);
  };

  const handleDrop = (e: React.DragEvent, targetBranchIndex: number) => {
    e.preventDefault();
    if (!draggedItem || !dropTarget) {
      setDraggedItem(null);
      setDropTarget(null);
      return;
    }

    const newActions = [...actions];
    const [removed] = newActions[draggedItem.branchIndex].splice(draggedItem.stepIndex, 1);
    
    // If dropping in the same branch
    if (draggedItem.branchIndex === targetBranchIndex) {
        newActions[targetBranchIndex].splice(dropTarget.stepIndex, 0, removed);
    } else { // If dropping in a different branch
        if(!newActions[targetBranchIndex]) newActions[targetBranchIndex] = [];
        newActions[targetBranchIndex].splice(dropTarget.stepIndex, 0, removed);
    }
    
    // Clean up empty branches after the move
    const finalActions = newActions.filter(b => b.length > 0);
    setActions(finalActions); 
    setDraggedItem(null);
    setDropTarget(null);
  };

  
  let selectedStep: WorkflowStep | null = null;
  let selectedStepBranchIndex: number | null = null;
  if(trigger?.id === selectedStepId) {
      selectedStep = trigger;
  } else {
      for (const [branchIndex, branch] of actions.entries()) {
          const found = branch.find(step => step.id === selectedStepId);
          if (found) {
              selectedStep = found;
              selectedStepBranchIndex = branchIndex;
              break;
          }
      }
  }

  // Calculate available outputs for the selected step
  const getAvailableOutputs = (): { step: WorkflowStep, outputs: OperationOutput[] }[] => {
    if (!selectedStep) return [];

    const available = [];
    if(trigger) {
        const integration = INTEGRATIONS.find(i => i.id === trigger.integrationId);
        const operation = integration?.operations.find(o => o.id === trigger.operation);
        if (operation?.outputs) {
            available.push({ step: trigger, outputs: operation.outputs });
        }
    }
    
    if (selectedStepBranchIndex !== null) {
        const currentBranch = actions[selectedStepBranchIndex];
        const stepIndexInBranch = currentBranch.findIndex(s => s.id === selectedStep.id);
        
        for (let i = 0; i < stepIndexInBranch; i++) {
            const step = currentBranch[i];
            const integration = INTEGRATIONS.find(integ => integ.id === step.integrationId);
            const operation = integration?.operations.find(op => op.id === step.operation);
            if (operation?.outputs) {
                available.push({ step, outputs: operation.outputs });
            }
        }
    }

    return available;
  };

  return (
    <div className="min-h-screen flex flex-col text-text-primary p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{agentId ? 'Edit Agent' : 'Create New Agent'}</h1>
        <div className="flex space-x-2">
            <button onClick={onCancel} className="bg-secondary text-text-primary px-4 py-2 rounded-lg hover:bg-border transition-colors">Cancel</button>
            <button onClick={handleSaveAgent} disabled={!name || !trigger} className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">Save Agent</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        {/* Left: Configuration & Prompt + Inspector/Logs */}
        <div className="lg:col-span-1 flex flex-col gap-8">
            <div className="bg-secondary p-6 rounded-lg border border-border flex flex-col space-y-6">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Agent Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Sales Lead Follow-up" className="w-full bg-primary border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Briefly describe what this agent does" className="w-full bg-primary border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-medium text-text-secondary mb-1">Describe Workflow in Plain English</label>
                    <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., When a new email arrives in Gmail with 'invoice' in the subject, save the attachment to Google Drive and send a confirmation to the 'billing' Slack channel."
                    className="w-full bg-primary border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent flex-1"
                    rows={6}
                    />
                    <button onClick={handleGenerateWorkflow} disabled={isLoading || !prompt} className="mt-4 w-full bg-accent text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                    {isLoading ? <Spinner /> : <>{ICONS.zap}<span>Generate Workflow</span></>}
                    </button>
                </div>
            </div>

            <div className="bg-secondary p-6 rounded-lg border border-border flex flex-col flex-1">
                <div className="flex border-b border-border mb-4">
                    <button onClick={() => setActiveTab('configure')} className={`px-4 py-2 font-medium text-sm flex items-center space-x-2 ${activeTab === 'configure' ? 'border-b-2 border-accent text-text-primary' : 'text-text-secondary'}`}>{ICONS.settings}<span>Configure</span></button>
                    <button onClick={() => setActiveTab('logs')} className={`px-4 py-2 font-medium text-sm flex items-center space-x-2 ${activeTab === 'logs' ? 'border-b-2 border-accent text-text-primary' : 'text-text-secondary'}`}>{ICONS.log}<span>Logs</span></button>
                </div>
            
                <div className="flex-1 overflow-y-auto">
                {activeTab === 'configure' && (
                    <StepInspector 
                        key={selectedStep?.id} // Force re-mount on step change
                        step={selectedStep} 
                        onUpdateParameter={handleUpdateStepParameter}
                        onUpdateStep={handleUpdateStep}
                        availableOutputs={getAvailableOutputs()}
                        agents={agents}
                        currentAgentId={agentId}
                    />
                )}
                {activeTab === 'logs' && (
                    <>
                    <button onClick={handleTestRun} disabled={!trigger} className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed mb-4">
                        {ICONS.play} <span>Test Run</span>
                    </button>
                    <div className="bg-primary p-4 rounded-lg border border-border flex-1 h-full font-mono text-sm max-h-96 overflow-y-auto">
                        {runLogs.length === 0 ? (
                            <p className="text-text-secondary">Click 'Test Run' to see execution logs.</p>
                        ) : (
                            runLogs.map((log, i) => (
                                <div key={i} className="flex items-start">
                                    <span className="text-text-secondary mr-3 w-20 flex-shrink-0">[{log.timestamp}]</span>
                                    <p className={`flex-1 whitespace-pre-wrap break-words ${
                                        log.status === 'SUCCESS' ? 'text-green-400' :
                                        log.status === 'FAILURE' ? 'text-red-400' :
                                        log.status === 'AI_RESPONSE' ? 'text-purple-400' :
                                        'text-text-primary'
                                    }`}>{log.text}</p>
                                </div>
                            ))
                        )}
                    </div>
                    </>
                )}
            </div>
            </div>
        </div>


        {/* Right: Visual Workflow */}
        <div className="lg:col-span-1 bg-secondary p-6 rounded-lg border border-border overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Visual Workflow</h2>
            {!trigger ? (
                <div className="text-center text-text-secondary py-10 border-2 border-dashed border-border rounded-lg">
                    <p>Your workflow will appear here.</p>
                    <p className="text-sm">Generate it from a prompt to get started.</p>
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    {/* Trigger */}
                    <WorkflowStepCard 
                        step={trigger} 
                        index={0} 
                        onDelete={() => {}}
                        onClick={() => setSelectedStepId(trigger.id)}
                        isSelected={trigger.id === selectedStepId}
                    />
                    
                    {/* Connector */}
                    <div className="my-4 text-border">{ICONS.arrow_down}</div>

                    {/* Action Branches */}
                    <div className="w-full flex gap-4 overflow-x-auto pb-4">
                        {actions.map((branch, index) => (
                             <ActionBranch
                                key={index}
                                branch={branch}
                                branchIndex={index}
                                onDeleteStep={handleDeleteStep}
                                onSelectStep={setSelectedStepId}
                                selectedStepId={selectedStepId}
                                onAddStep={handleAddStep}
                                onDragStart={handleDragStart}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                draggedItemId={draggedItem}
                                dropTarget={dropTarget}
                            />
                        ))}
                        <button 
                            onClick={handleAddBranch}
                            className="flex-shrink-0 flex flex-col items-center justify-center bg-primary border-2 border-dashed border-border rounded-lg text-text-secondary hover:border-accent hover:text-accent transition-colors w-24 h-32"
                        >
                            {ICONS.plus}
                            <span className="text-xs mt-1">Add Branch</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AgentBuilder;