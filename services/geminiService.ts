import { GoogleGenAI, Type } from "@google/genai";
import { WorkflowStep, StepType } from '../types';
import { INTEGRATIONS } from '../constants';

// Lazily initialize the AI client to prevent app crash if API key is missing.
let ai: GoogleGenAI | null = null;
try {
  // In a browser environment, `process` is not defined. We must check for its existence
  // to avoid a ReferenceError that would crash the application on startup. Build tools
  // like Vite can be configured to replace `process.env.API_KEY` at build time.
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
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
          name: {
            type: Type.STRING,
            description: "A short, user-friendly name for this step, e.g., 'Send Welcome Email'."
          },
          operation: {
            type: Type.STRING,
            description: "A programmatic name for the operation, e.g., 'sendEmail' or 'createEvent'."
          },
          parameters: {
            type: Type.STRING,
            description: "A valid JSON string representing a key-value map of parameters for the operation. For example, for 'sendEmail', this could be \"{\\\"recipient\\\": \\\"test@example.com\\\", \\\"subject\\\": \\\"Hello\\\"}\". Intelligently pre-fill this based on the user's prompt.",
          }
        },
        required: ["type", "integrationId", "name", "operation", "parameters"]
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
        { id: 'error-1', type: StepType.TRIGGER, integrationId: 'webhook', name: 'Error: Gemini API key not configured.', operation: 'apiKeyError', parameters: {} },
        { id: 'error-2', type: StepType.ACTION, integrationId: 'webhook', name: 'The app is running without AI features.', operation: 'apiKeyError', parameters: {} },
    ];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are an expert at creating automated workflows. Based on the user's request, generate a sequence of steps in JSON format according to the provided schema. The first step must be a 'trigger'. The subsequent steps must be 'action's. Make sure the integrationId is one of the available options. The operation should be a camelCase string representing the function to call. For Gmail, a common operation is 'sendEmail'. Intelligently guess and pre-fill the parameters for each step. The 'parameters' field for each step MUST be a valid JSON string.`,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);

    if (parsed.workflow && Array.isArray(parsed.workflow)) {
      return parsed.workflow.map((step: any, index: number) => {
        let parsedParameters = {};
        if (typeof step.parameters === 'string') {
          try {
            parsedParameters = JSON.parse(step.parameters);
          } catch (e) {
            console.error(`Error parsing parameters JSON for step "${step.name}":`, e);
            // Fallback to an empty object if parsing fails
          }
        } else if (typeof step.parameters === 'object' && step.parameters !== null) {
          // Fallback if the model returns an object directly despite the schema
          parsedParameters = step.parameters;
        }

        return {
          ...step,
          id: `step-${Date.now()}-${index}`,
          parameters: parsedParameters,
        };
      });
    }

    return [];
  } catch (error) {
    console.error("Error generating workflow from prompt:", error);
    // Return a sample workflow on error for UI development
    return [
        { id: 'error-1', type: StepType.TRIGGER, integrationId: 'gmail', name: 'Error: Could not generate workflow.', operation: 'apiError', parameters: { details: JSON.stringify(error) } },
        { id: 'error-2', type: StepType.ACTION, integrationId: 'slack', name: 'Please check your API key and network connection.', operation: 'apiError', parameters: {} },
    ];
  }
};

export const generateTextResponse = async (prompt: string): Promise<string> => {
  if (!ai) {
    const errorMsg = "Cannot generate text: Gemini API client is not initialized.";
    console.error(errorMsg);
    return `Error: ${errorMsg}`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating text response:", error);
    return `Error: Could not generate response from AI. Details: ${error}`;
  }
};
