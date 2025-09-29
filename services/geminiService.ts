import { GoogleGenAI, Type } from "@google/genai";
import { WorkflowStep, StepType, IntegrationId } from '../types';
import { INTEGRATIONS } from '../constants';

// Lazily initialize the AI client to prevent app crash if API key is missing.
let ai: GoogleGenAI | null = null;
try {
  // In a browser environment, `process` is not defined. We must check for its existence
  // to avoid a ReferenceError that would crash the application on startup. Build tools
  // like Vite can be configured to replace `process.env.API_KEY` at build time.
  const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;
  
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  } else {
    console.warn("API_KEY environment variable not set or not accessible in this environment. Gemini API features will be disabled.");
  }
} catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
}

const integrationIds = INTEGRATIONS.map(i => i.id);

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    workflow: {
      type: Type.ARRAY,
      description: "The list of workflow steps.",
      items: {
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
            description: "The ID of the integration to use."
          },
          description: {
            type: Type.STRING,
            description: "A user-friendly description of what this step does."
          },
          operation: {
            type: Type.STRING,
            description: "A programmatic name for the operation, e.g., 'sendEmail' or 'createEvent'."
          }
        },
        required: ["type", "integrationId", "description", "operation"]
      }
    }
  },
  required: ["workflow"]
};

export const generateWorkflowFromPrompt = async (prompt: string): Promise<WorkflowStep[]> => {
  // Check if the AI client was initialized.
  if (!ai) {
    console.error("Cannot generate workflow: Gemini API client is not initialized. Make sure API_KEY is set and accessible to your application build process.");
    return [
        { id: 'error-1', type: StepType.TRIGGER, integrationId: 'webhook', description: 'Error: Gemini API key not configured.', operation: 'apiKeyError' },
        { id: 'error-2', type: StepType.ACTION, integrationId: 'webhook', description: 'The app is running without AI features. Please configure your environment.', operation: 'apiKeyError' },
    ];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are an expert at creating automated workflows. Based on the user's request, generate a sequence of steps in JSON format according to the provided schema. The first step must be a 'trigger'. The subsequent steps must be 'action's. Make sure the integrationId is one of the available options. Create a short, user-friendly description for each step. The operation should be a camelCase string representing the function to call.`,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);

    if (parsed.workflow && Array.isArray(parsed.workflow)) {
      return parsed.workflow.map((step: any, index: number) => ({
        ...step,
        id: `step-${Date.now()}-${index}`,
      }));
    }

    return [];
  } catch (error) {
    console.error("Error generating workflow from prompt:", error);
    // Return a sample workflow on error for UI development
    return [
        { id: 'error-1', type: StepType.TRIGGER, integrationId: 'gmail', description: 'Error: Could not generate workflow.', operation: 'apiError' },
        { id: 'error-2', type: StepType.ACTION, integrationId: 'slack', description: 'Please check your API key and network connection.', operation: 'apiError' },
    ];
  }
};