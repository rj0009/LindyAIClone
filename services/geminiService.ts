
import { GoogleGenAI, Type } from "@google/genai";
import { WorkflowStep, StepType } from '../types';
import { INTEGRATIONS } from '../constants';

// Lazily initialize the AI client to prevent app crash if API key is missing.
let ai: GoogleGenAI | null = null;
try {
  // In a browser environment, `process` is not defined. We must check for its existence
  // to avoid a ReferenceError that would crash the application on startup. Build tools
  // like Vite can be configured to replace `process.env.API_KEY` at build time.
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY ;
  
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  } else {
    console.warn("API_KEY environment variable not set or not accessible in this environment. Gemini API features will be disabled.");
  }
} catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
}

const integrationIds = INTEGRATIONS.map(i => i.id);

const workflowStepSchema = {
  type: Type.OBJECT,
  properties: {
    type: {
      type: Type.STRING,
      enum: [StepType.TRIGGER, StepType.ACTION],
      description: "The type of step."
    },
    integrationId: {
      type: Type.STRING,
      enum: integrationIds,
      description: "The ID of the integration to use. Infer this from the prompt (e.g., 'email' -> 'gmail')."
    },
    name: {
      type: Type.STRING,
      description: "A short, user-friendly name for this step, e.g., 'Send Welcome Email'."
    },
    operation: {
      type: Type.STRING,
      description: "A programmatic name for the operation, e.g., 'sendEmail' or 'createEvent'."
    },
    parameters: {
      type: Type.ARRAY,
      description: "A list of key-value pairs for the operation's parameters. Intelligently pre-fill this based on the user's prompt and the step's purpose.",
      items: {
        type: Type.OBJECT,
        properties: {
          key: {
            type: Type.STRING,
            description: "The parameter name."
          },
          value: {
            type: Type.STRING,
            description: "The parameter value. This can include placeholders like {{outputs.STEP_ID.OUTPUT_ID}}."
          }
        },
        required: ["key", "value"]
      }
    }
  },
  required: ["type", "integrationId", "name", "operation", "parameters"]
};

const agentConfigAndWorkflowSchema = {
  type: Type.OBJECT,
  properties: {
    agentName: {
      type: Type.STRING,
      description: "A concise, descriptive name for the agent, extracted from the prompt.",
    },
    agentDescription: {
      type: Type.STRING,
      description: "A one or two-sentence summary of the agent's purpose, extracted from the prompt.",
    },
    workflow: {
      type: Type.OBJECT,
      properties: {
        trigger: {
          ...workflowStepSchema,
          description: "The single trigger step that starts the workflow. This MUST be of type 'trigger'."
        },
        actionBranches: {
          type: Type.ARRAY,
          description: "An array of action branches. Each branch is an array of action steps. If the user's prompt implies conditional logic (e.g., 'if/else', 'escalate complex cases'), create multiple branches. The first step in a conditional branch should often be a 'control.filter' action.",
          items: {
            type: Type.ARRAY,
            items: workflowStepSchema
          }
        }
      },
      required: ["trigger", "actionBranches"]
    }
  },
  required: ["agentName", "agentDescription", "workflow"]
};


export const generateAgentConfigAndWorkflowFromPrompt = async (prompt: string): Promise<{
    agentName: string;
    agentDescription: string;
    trigger: WorkflowStep | null;
    actions: WorkflowStep[][];
}> => {
  // FIX: Explicitly type `fallbackResponse` to prevent TypeScript from inferring `integrationId`
  // as a generic `string` instead of the specific `IntegrationId` union type. This resolves
  // the type incompatibility error when returning this object.
  const fallbackResponse: {
    agentName: string;
    agentDescription: string;
    trigger: WorkflowStep;
    actions: WorkflowStep[][];
  } = {
    agentName: 'AI Agent',
    agentDescription: 'An agent that performs tasks based on a prompt.',
    trigger: { id: 'error-1', type: StepType.TRIGGER, integrationId: 'webhook', name: 'Error: Gemini API key not configured.', operation: 'apiKeyError', parameters: {} },
    actions: [[{ id: 'error-2', type: StepType.ACTION, integrationId: 'webhook', name: 'The app is running without AI features.', operation: 'apiKeyError', parameters: {} }]],
  };

  if (!ai) {
    console.error("Cannot generate workflow: Gemini API client is not initialized. Make sure API_KEY is set and accessible to your application build process.");
    return fallbackResponse;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are an expert AI workflow architect. Based on the user's request, generate a full agent configuration in JSON format according to the provided schema.
1.  **Extract Metadata**: Determine a suitable 'agentName' and 'agentDescription' from the user's prompt.
2.  **Identify the Trigger**: The first step must be a single 'trigger'. Analyze the prompt for keywords like "when I get an email", "if a webhook is called", "for every new contact" to determine the correct integration and operation.
3.  **Build Action Branches**: Create one or more 'actionBranches'. If the prompt describes a simple, linear process, create a single branch. If it describes conditional logic (e.g., "if it's a sales lead...", "escalate complex cases..."), create multiple branches.
4.  **Use Filters for Logic**: When creating conditional branches, the first step in that branch should almost always be a 'control.filter' action to define the condition.
5.  **Chain Actions**: Subsequent steps in a branch must be 'action's. Intelligently guess and pre-fill the parameters for each step, using placeholders to refer to outputs from previous steps where appropriate (e.g., '{{outputs.trigger-id.body}}').`,
        responseMimeType: "application/json",
        responseSchema: agentConfigAndWorkflowSchema,
      },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);

    const processStep = (step: any): WorkflowStep => {
        const parsedParameters = Array.isArray(step.parameters)
          ? step.parameters.reduce((acc: { [key: string]: any }, param: { key: string, value: any }) => {
              if (param.key) acc[param.key] = param.value;
              return acc;
            }, {})
          : {};
        
        // FIX: If the AI generates a filter step but omits the condition, default it to 'contains'
        // to prevent execution errors.
        if (step.integrationId === 'control' && step.operation === 'filter' && !parsedParameters.condition) {
            parsedParameters.condition = 'contains';
        }

        return { ...step, id: `step-${Math.random().toString(36).substr(2, 9)}`, parameters: parsedParameters };
    };

    const trigger = parsed.workflow.trigger ? processStep(parsed.workflow.trigger) : null;
    const actions = parsed.workflow.actionBranches.map((branch: any[]) => branch.map(processStep));

    return {
      agentName: parsed.agentName,
      agentDescription: parsed.agentDescription,
      trigger,
      actions
    };

  } catch (error) {
    console.error("Error generating workflow from prompt:", error);
    fallbackResponse.trigger.parameters = { details: JSON.stringify(error) };
    return fallbackResponse;
  }
};

export const generateTextResponse = async (prompt: string, systemInstruction?: string): Promise<string> => {
  if (!ai) {
    const errorMsg = "Cannot generate text: Gemini API client is not initialized.";
    console.error(errorMsg);
    return `Error: ${errorMsg}`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating text response:", error);
    return `Error: Could not generate response from AI. Details: ${error}`;
  }
};
