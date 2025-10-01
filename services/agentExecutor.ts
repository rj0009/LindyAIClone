
import { WorkflowStep, LogEntry } from '../types';
import { generateTextResponse } from './geminiService';

type StepOutputs = { [stepId: string]: { [outputId: string]: any } };

const resolvePlaceholders = (text: string, outputs: StepOutputs): string => {
    if (typeof text !== 'string') return text;
    return text.replace(/\{\{outputs\.([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)\}\}/g, (match, stepId, outputId) => {
        return outputs[stepId]?.[outputId] ?? match;
    });
};

const resolveParameters = (params: { [key: string]: any }, outputs: StepOutputs): { [key: string]: any } => {
    const resolved: { [key: string]: any } = {};
    for (const key in params) {
        resolved[key] = resolvePlaceholders(params[key], outputs);
    }
    return resolved;
};

const runBranch = async (
    branch: WorkflowStep[], 
    branchIndex: number,
    onLog: (log: LogEntry) => void,
    outputs: StepOutputs,
    systemPrompt?: string
): Promise<boolean> => {
    let branchSuccess = true;
    for (const [index, step] of branch.entries()) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        
        const resolvedParameters = resolveParameters(step.parameters, outputs);

        onLog({
            timestamp: new Date().toLocaleTimeString(),
            status: 'INFO',
            text: `[Branch ${branchIndex + 1}] Executing step ${index + 1}: "${step.name}"\nwith params: ${JSON.stringify(resolvedParameters, null, 2)}`,
        });
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        let stepSuccess = true;
        let outputMessage = `Executed '${step.operation}'.`;
        let failureReason = `Simulated API connection timed out for operation '${step.operation}'.`;

        try {
            switch (`${step.integrationId}.${step.operation}`) {
                case 'ai.generateText':
                case 'ai.analyzeText': {
                    const prompt = resolvedParameters.prompt || resolvedParameters.input || 'Generate a short creative story.';
                    const aiResponse = await generateTextResponse(prompt, systemPrompt);
                    if (aiResponse.startsWith('Error:')) {
                        stepSuccess = false;
                        failureReason = aiResponse;
                    } else {
                        outputs[step.id] = { response: aiResponse, output: aiResponse }; // Use both for compatibility
                        onLog({ timestamp: new Date().toLocaleTimeString(), status: 'AI_RESPONSE', text: `[Branch ${branchIndex + 1}] AI Response:\n${aiResponse}` });
                        outputMessage = `AI generated text successfully.`;
                    }
                    break;
                }
                case 'control.filter': {
                    const { input, condition, value } = resolvedParameters;
                    let conditionMet = false;
                    switch (condition) {
                        case 'contains': conditionMet = String(input).toLowerCase().includes(String(value).toLowerCase()); break;
                        case 'not_contains': conditionMet = !String(input).toLowerCase().includes(String(value).toLowerCase()); break;
                        case 'equals': conditionMet = input == value; break;
                        case 'not_equals': conditionMet = input != value; break;
                        case 'greater_than': conditionMet = Number(input) > Number(value); break;
                        case 'less_than': conditionMet = Number(input) < Number(value); break;
                        default:
                            failureReason = `Unknown filter condition: ${condition}`;
                            stepSuccess = false;
                    }
                    if (stepSuccess && !conditionMet) {
                        outputMessage = `Filter condition NOT met. Stopping branch. (${input} ${condition} ${value})`;
                        branchSuccess = true; // The branch didn't fail, it just stopped.
                        onLog({ timestamp: new Date().toLocaleTimeString(), status: 'INFO', text: `[Branch ${branchIndex + 1}] ${outputMessage}` });
                        return branchSuccess; // Stop this branch execution cleanly
                    }
                    outputMessage = `Filter condition met. Continuing branch.`;
                    break;
                }
                case 'agent.callAgent': {
                    outputMessage = `Successfully initiated a call to agent with ID: ${resolvedParameters.agentId}.`;
                    break;
                }
                default: {
                    // Simulate other steps
                    stepSuccess = true; // Always succeed for test runs
                }
            }
        } catch (e: any) {
            stepSuccess = false;
            failureReason = e.message || "An unexpected error occurred.";
        }


        if (stepSuccess) {
            onLog({ timestamp: new Date().toLocaleTimeString(), status: 'SUCCESS', text: `[Branch ${branchIndex + 1}] SUCCESS: ${outputMessage}` });
        } else {
            onLog({ timestamp: new Date().toLocaleTimeString(), status: 'FAILURE', text: `[Branch ${branchIndex + 1}] FAILURE: ${failureReason}` });
            branchSuccess = false;
            break; // Stop this branch on failure
        }
    }
    return branchSuccess;
};


export const runAgentWorkflow = async (
    trigger: WorkflowStep | null,
    actions: WorkflowStep[][], 
    onLog: (log: LogEntry) => void,
    systemPrompt?: string,
    triggerInput?: StepOutputs | null
): Promise<{ success: boolean }> => {
    const outputs: StepOutputs = {};

    onLog({
        timestamp: new Date().toLocaleTimeString(),
        status: 'INFO',
        text: 'Starting run...',
    });

    if (!trigger) {
        onLog({ timestamp: new Date().toLocaleTimeString(), status: 'FAILURE', text: 'FAILURE: No trigger defined for this agent.' });
        return { success: false };
    }

    // 1. Execute and Simulate Trigger Output
    onLog({ timestamp: new Date().toLocaleTimeString(), status: 'INFO', text: `Executing trigger: "${trigger.name}"` });
    await new Promise(resolve => setTimeout(resolve, 500));
    const triggerSuccess = true; // Always succeed for test runs

    if (!triggerSuccess) {
        onLog({ timestamp: new Date().toLocaleTimeString(), status: 'FAILURE', text: 'FAILURE: Trigger failed to execute.' });
        onLog({ timestamp: new Date().toLocaleTimeString(), status: 'INFO', text: 'Run finished.' });
        return { success: false };
    }
    
    // Use provided trigger input if available, otherwise use default mock data
    if (triggerInput && triggerInput[trigger.id]) {
        outputs[trigger.id] = triggerInput[trigger.id];
    } else {
        // Simulate dynamic output from the trigger
        if (trigger.integrationId === 'gmail') {
            outputs[trigger.id] = {
                from: 'test-sender@example.com',
                subject: 'Important: Sales Enquiry',
                body: 'Hello, I am interested in your product catalog. Can you send me more information? Thanks!',
            };
        } else {
            outputs[trigger.id] = {
                data: { message: 'This is a test webhook payload' },
                receivedAt: new Date().toISOString(),
            };
        }
    }
    
    onLog({ timestamp: new Date().toLocaleTimeString(), status: 'SUCCESS', text: `SUCCESS: Trigger fired successfully. Output:\n${JSON.stringify(outputs[trigger.id], null, 2)}` });


    // 2. Execute Action Branches in Parallel
    const branchPromises = actions.map((branch, index) => runBranch(branch, index, onLog, outputs, systemPrompt));
    const results = await Promise.all(branchPromises);

    const overallSuccess = results.every(success => success);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    onLog({
        timestamp: new Date().toLocaleTimeString(),
        status: 'INFO',
        text: 'Run finished.',
    });
    
    return { success: overallSuccess };
};
