import { Agent, IntegrationId } from '../types';

// FIX: The API endpoint for npoint.io was incorrect, causing a 404 error.
// The '/bins' path should not be part of the base URL. This has been corrected
// to point to the root domain for creating bins and the correct path for access.
const API_BASE = 'https://api.npoint.io';

export interface SyncedData {
    agents: Agent[];
    connectedIntegrations: string[]; // Set is not JSON-serializable, so we use an array of strings (IntegrationId[])
}

export const dataSyncService = {
    createBin: async (data: SyncedData): Promise<string | null> => {
        try {
            // POST to the base URL to create a new bin
            const response = await fetch(API_BASE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error(`Failed to create sync bin. Status: ${response.status}`);
            const result = await response.json();
            return result.id || null;
        } catch (error) {
            console.error('Data Sync Error (createBin):', error);
            return null;
        }
    },

    getBin: async (id: string): Promise<SyncedData | null> => {
        try {
            // GET from the base URL + ID to retrieve a bin
            const response = await fetch(`${API_BASE}/${id}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });
            if (!response.ok) throw new Error(`Failed to fetch sync bin with ID ${id}. Status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Data Sync Error (getBin):', error);
            return null;
        }
    },

    updateBin: async (id: string, data: SyncedData): Promise<boolean> => {
        try {
            // PUT to the base URL + ID to update a bin
            const response = await fetch(`${API_BASE}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error(`Failed to update sync bin. Status: ${response.status}`);
            return response.ok;
        } catch (error) {
            console.error('Data Sync Error (updateBin):', error);
            return false;
        }
    },
};
