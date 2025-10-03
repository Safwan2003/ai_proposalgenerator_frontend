'use client';

import React, { useState, useEffect } from 'react';
import { getDesignSuggestions, getProposalPreviewHtml, DesignSuggestion } from '@/lib/api';

interface ApplyDesignModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (css: string) => void;
  proposalId: number | null;
}

const ApplyDesignModal: React.FC<ApplyDesignModalProps> = ({ open, onClose, onApply, proposalId }) => {
  const [designSuggestions, setDesignSuggestions] = useState<DesignSuggestion[]>([]);
  const [proposalHtml, setProposalHtml] = useState<string>('');
  const [selectedDesign, setSelectedDesign] = useState<DesignSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && proposalId) {
      fetchData();
    }
  }, [open, proposalId]);

  const fetchData = async () => {
    if (!proposalId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [suggestions, html] = await Promise.all([
        getDesignSuggestions(proposalId),
        getProposalPreviewHtml(proposalId),
      ]);

      setDesignSuggestions(suggestions);
      setProposalHtml(html);

      if (suggestions.length > 0) {
        setSelectedDesign(suggestions[0]);
      }
    } catch (err: any) {
      console.error('Error fetching design data:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch design data.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyDesign = () => {
    if (selectedDesign) {
      onApply(selectedDesign.css);
      onClose();
    } else {
      alert('Please select a design to apply.');
    }
  };

  const constructPreviewHtml = (css: string) => {
    const style = `<style>${css}</style>`;
    return proposalHtml.replace('</head>', `${style}</head>`);
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-6xl transform transition-all scale-100 opacity-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Apply AI Design</h2>
        <p className="text-center text-gray-600 mb-6">Click on a design to select it, then click 'Apply Design'.</p>

        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <p>Loading design previews...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-96 text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[60vh] overflow-y-auto p-4 bg-gray-50 rounded-lg">
            {designSuggestions.map((suggestion, index) => (
              <div key={index} onClick={() => setSelectedDesign(suggestion)} className={`cursor-pointer rounded-lg overflow-hidden border-4 ${selectedDesign?.prompt === suggestion.prompt ? 'border-indigo-600' : 'border-transparent'}`}>
                <h3 className="p-3 bg-gray-100 text-gray-800 font-semibold text-center">{suggestion.prompt}</h3>
                <iframe
                  srcDoc={constructPreviewHtml(suggestion.css)}
                  className="w-full h-96 bg-white"
                  title={suggestion.prompt}
                  sandbox="allow-same-origin"
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium">
            Cancel
          </button>
          <button onClick={handleApplyDesign} disabled={!selectedDesign || isLoading} className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium shadow-md disabled:bg-gray-400">
            Apply Design
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplyDesignModal;
