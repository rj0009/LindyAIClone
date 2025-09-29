
import { GoogleGenAI, Type } from "@google/genai";
import { WorkflowStep, StepType, IntegrationId } from '../types';
import { INTEGRATIONS } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

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
        { id: 'error-2', type: StepType.ACTION, integrationId: 'slack', description: 'Please check your API key and try again.', operation: 'apiError' },
    ];
  }
};
