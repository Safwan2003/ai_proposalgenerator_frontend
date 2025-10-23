'use client';

import React, { useState, useEffect } from 'react';
import { getDesignSuggestions, getProposalPreviewHtml, DesignSuggestion } from '@/lib/api';

interface ApiErrorResponse {
  response?: {
    data?: {
      detail?: string;
    };
  };
  message?: string;
}

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
  const [keywords, setKeywords] = useState('');

  useEffect(() => {
    if (open && proposalId) {
      fetchData();
    }
  }, [open, proposalId]);

  const fetchData = async (userKeywords: string = '') => {
    if (!proposalId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [suggestions, html] = await Promise.all([
        getDesignSuggestions(proposalId, userKeywords),
        getProposalPreviewHtml(proposalId),
      ]);

      setDesignSuggestions(suggestions);
      setProposalHtml(html);

      if (suggestions.length > 0) {
        setSelectedDesign(suggestions[0]);
      }
    } catch (err: unknown) {
      console.error('Error fetching design data:', err);
      let errorMessage = 'Failed to fetch design data.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        const apiError = err as ApiErrorResponse;
        if (apiError.response?.data?.detail) {
          errorMessage = apiError.response.data.detail;
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
      }
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
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col transform transition-all scale-100 opacity-100">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Explore & Apply AI Designs</h2>
            <div className="flex items-center gap-4">
                <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="e.g., dark mode, minimalist" className="px-4 py-2 border border-gray-300 rounded-md" />
                <button onClick={() => fetchData(keywords)} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm disabled:bg-gray-400">
                    {isLoading ? 'Generating...' : 'Generate More'}
                </button>
            </div>
        </div>

        <div className="flex-grow grid grid-cols-12 gap-8 overflow-hidden">
            {/* Left Column: Design List */}
            <div className="col-span-4 overflow-y-auto pr-4">
                {isLoading && !designSuggestions.length ? (
                    <p>Loading design suggestions...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : (
                    <div className="space-y-4">
                        {designSuggestions.map((suggestion, index) => (
                            <div key={index} onClick={() => setSelectedDesign(suggestion)} className={`cursor-pointer p-4 rounded-lg border-2 ${selectedDesign?.prompt === suggestion.prompt ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white'}`}>
                                <h3 className="font-bold text-lg text-gray-800">{suggestion.prompt}</h3>
                                <p className="text-sm text-gray-600">{suggestion.metadata.visual_description}</p>
                                <div className="flex items-center flex-wrap gap-2 mt-2">
                                    <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: suggestion.metadata.primary_color }}></span>
                                    <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: suggestion.metadata.secondary_color }}></span>
                                    <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-full">{suggestion.metadata.font}</span>
                                    <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-full">{suggestion.metadata.tone}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Column: Preview */}
            <div className="col-span-8 bg-gray-100 rounded-lg overflow-hidden">
                {selectedDesign ? (
                    <iframe
                        srcDoc={constructPreviewHtml(selectedDesign.css)}
                        className="w-full h-full bg-white"
                        title={selectedDesign.prompt}
                        sandbox="allow-same-origin"
                    />
                ) : (
                    <div className="flex justify-center items-center h-full">
                        <p>Select a design to preview</p>
                    </div>
                )}
            </div>
        </div>

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
