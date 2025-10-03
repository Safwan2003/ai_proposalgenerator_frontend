'use client';

import { exportProposal } from '@/lib/api';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  proposalId: number | null;
}

export default function ExportModal({ open, onClose, proposalId }: ExportModalProps) {
  if (!open) return null;

  const handleExport = async (format: 'docx' | 'pdf') => {
    if (proposalId) {
      const response = await exportProposal(proposalId, format);
      if (response && response.download_url) {
        window.open(`http://localhost:8000${response.download_url}`, '_blank');
      } else {
        alert(`Export initiated, but no download URL received.`);
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Export Proposal</h2>
        <p className="mb-4">Select the format to export your proposal.</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => handleExport('docx')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
          >
            Export as DOCX
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Export as PDF
          </button>
        </div>
      </div>
    </div>
  );
}