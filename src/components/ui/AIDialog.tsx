
'use client';

import { useState } from 'react';

export default function AIDialog({ open, onClose, onApply }) {
  const [tone, setTone] = useState('professional');
  const [action, setAction] = useState('rewrite');

  if (!open) return null;

  const handleApply = () => {
    onApply(action, tone);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md transform transition-all scale-100 opacity-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">AI Enhance Section</h2>
        
        <div className="space-y-5">
          <div>
            <label htmlFor="aiAction" className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              id="aiAction"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            >
              <option value="rewrite">Rewrite</option>
              <option value="expand">Expand</option>
              <option value="shorten">Shorten</option>
            </select>
          </div>

          <div>
            <label htmlFor="aiTone" className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
            <select
              id="aiTone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="formal">Formal</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium">
            Cancel
          </button>
          <button onClick={handleApply} className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium shadow-md">
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
