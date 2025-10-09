'use client';

import { useState } from 'react';

interface AIChartEditModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (prompt: string) => void;
  loading: boolean;
}

export default function AIChartEditModal({ open, onClose, onApply, loading }: AIChartEditModalProps) {
  const [prompt, setPrompt] = useState('');

  if (!open) return null;

  const handleApply = () => {
    if (prompt.trim()) {
      onApply(prompt);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Chart with AI</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-700 mb-1">
              Describe the changes you want to make:
            </label>
            <textarea
              id="ai-prompt"
              rows={5}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Add a new step called Final Review after Integration Tests.'"
            />
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 border border-gray-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm disabled:bg-gray-400"
            disabled={!prompt.trim() || loading}
          >
            {loading ? 'Applying...' : 'Apply Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
