import React, { useState } from 'react';
import { ICONS } from '../constants';
import Spinner from './Spinner';

interface SyncModalProps {
  currentSyncId: string | null;
  onClose: () => void;
  onLoadFromId: (id: string) => Promise<void>;
  onCreateNew: () => Promise<void>;
}

const SyncModal: React.FC<SyncModalProps> = ({ currentSyncId, onClose, onLoadFromId, onCreateNew }) => {
    const [inputId, setInputId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState('');

    const handleLoad = async () => {
        if (!inputId) return;
        setIsLoading(true);
        setError(null);
        try {
            await onLoadFromId(inputId);
            onClose();
        } catch (e: any) {
            setError(e.message || 'Failed to load data. Check the ID and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await onCreateNew();
            // The modal will get a new `currentSyncId` prop and re-render.
        } catch (e: any) {
            setError(e.message || 'Failed to create a new sync session.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (currentSyncId) {
            navigator.clipboard.writeText(currentSyncId).then(() => {
                setCopySuccess('Copied!');
                setTimeout(() => setCopySuccess(''), 2000);
            }, () => {
                setCopySuccess('Failed to copy');
                 setTimeout(() => setCopySuccess(''), 2000);
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" aria-modal="true" role="dialog">
            <div className="bg-secondary rounded-lg border border-border w-full max-w-lg p-6 relative m-4 flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary" aria-label="Close sync settings">
                    {ICONS.x}
                </button>
                <h2 className="text-xl font-bold text-text-primary mb-4">Sync Across Devices</h2>
                <p className="text-sm text-text-secondary mb-6">
                    Use a Sync ID to save and load your agents across different browsers and computers.
                </p>

                {currentSyncId ? (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-text-secondary mb-1">Your Current Sync ID</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                readOnly
                                value={currentSyncId}
                                className="w-full bg-primary border border-border rounded-lg px-3 py-2 text-text-secondary"
                                aria-label="Current Sync ID"
                            />
                            <button onClick={handleCopy} className="bg-border px-4 py-2 rounded-lg text-sm hover:bg-primary transition-colors flex-shrink-0">
                                {copySuccess || 'Copy'}
                            </button>
                        </div>
                        <p className="text-xs text-text-secondary mt-2">Copy this ID and enter it on another device to sync your data.</p>
                    </div>
                ) : (
                    <div className="mb-6 p-4 bg-primary border border-dashed border-border rounded-lg text-center">
                        <p className="text-text-secondary">You are not currently syncing. Your data is only saved locally.</p>
                        <button onClick={handleCreate} disabled={isLoading} className="mt-3 bg-accent text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-500 transition-colors w-full sm:w-auto mx-auto disabled:opacity-50">
                            {isLoading ? <Spinner /> : ICONS.plus}
                            <span>Create New Sync Session</span>
                        </button>
                    </div>
                )}
                
                <div className="my-4 border-t border-border"></div>

                <div>
                    <label htmlFor="sync-id-input" className="block text-sm font-medium text-text-secondary mb-1">Load from an existing Sync ID</label>
                    <div className="flex items-center space-x-2">
                        <input
                            id="sync-id-input"
                            type="text"
                            value={inputId}
                            onChange={(e) => setInputId(e.target.value.trim())}
                            placeholder="Enter Sync ID from another device"
                            className="w-full bg-primary border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                        <button onClick={handleLoad} disabled={isLoading || !inputId} className="bg-accent px-4 py-2 rounded-lg text-sm text-white hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 flex-shrink-0">
                            {isLoading && !inputId ? <Spinner/> : null}
                            <span>Load</span>
                        </button>
                    </div>
                </div>

                {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
                
            </div>
        </div>
    );
};

export default SyncModal;
