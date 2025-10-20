import React, { useState, useEffect } from 'react';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  currentApiKey: string | null;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onClose, onSave, currentApiKey }) => {
  const [apiKeyInput, setApiKeyInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setApiKeyInput(currentApiKey || '');
    }
  }, [isOpen, currentApiKey]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(apiKeyInput.trim());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 w-[90vw] h-[90vh] flex flex-col p-6">
        <div className="flex justify-between items-center border-b border-gray-700 pb-4">
          <h2 className="text-2xl font-bold font-orbitron">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto py-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-lg font-medium text-gray-300 mb-2">
                Gemini API Key
              </label>
              <p className="text-sm text-gray-400 mb-2">
                Your API key is stored securely in your browser's local storage and is never sent to any server besides Google's API.
              </p>
              <input
                id="apiKey"
                type="text"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Enter your Google Gemini API Key"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
              />
               <p className="text-xs text-gray-500 mt-2">
                Note: The free tier of the Gemini API has rate limits. If the chat pauses or you see errors, you may have exceeded the number of allowed requests per minute.
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4 border-t border-gray-700 pt-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white font-bold transition-colors"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsDialog;