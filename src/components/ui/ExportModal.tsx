'use client';

import { useState } from 'react';
import { exportProposal } from '@/lib/api';

interface ExportModalProps {
  proposalId: number;
  onClose: () => void;
}

export default function ExportModal({ proposalId, onClose }: ExportModalProps) {
  const [format, setFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await exportProposal(proposalId, format);
      // The backend returns a URL to the file. We can open it in a new tab to trigger a download.
      window.open(response.download_url, '_blank');
      onClose();
    } catch (error) {
      console.error("Failed to export proposal:", error);
      alert("Failed to export. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Export Proposal</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="format" className="block text-sm font-medium text-gray-700">Format</label>
            <select
              id="format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            >
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
            </select>
          </div>
          <div className="flex justify-end pt-4">
            <button onClick={onClose} className="mr-2 px-4 py-2 text-gray-600">Cancel</button>
            <button
              onClick={handleExport}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
