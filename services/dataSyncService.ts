import { Agent, IntegrationId } from '../types';

const API_BASE = 'https://jsonblob.com/api/jsonBlob';

export interface SyncedData {
    agents: Agent[];
    connectedIntegrations: string[]; // Set is not JSON-serializable, so we use an array of strings (IntegrationId[])
}

export const dataSyncService = {
    createBin: async (data: SyncedData): Promise<string | null> => {
        try {
            const response = await fetch(API_BASE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error(`Failed to create sync bin. Status: ${response.status}`);
            const newBinUrl = response.headers.get('Location');
            if (!newBinUrl) throw new Error('Could not get new bin URL from response.');
            const binId = newBinUrl.split('/').pop();
            return binId || null;
        } catch (error) {
            console.error('Data Sync Error (createBin):', error);
            return null;
        }
    },

    getBin: async (id: string): Promise<SyncedData | null> => {
        try {
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
