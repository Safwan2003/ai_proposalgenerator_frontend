'use client';

import { useState, useEffect } from 'react';
import { getDesignSuggestions, applyDesign } from '@/lib/api';
import { DesignSuggestion } from '@/types/proposal';

interface DesignExplorerProps {
  proposalId: number;
  onApplyDesign: (css: string) => void;
  onClose: () => void;
}

export default function DesignExplorer({ proposalId, onApplyDesign, onClose }: DesignExplorerProps) {
  const [suggestions, setSuggestions] = useState<DesignSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const data = await getDesignSuggestions(proposalId);
        setSuggestions(data);
      } catch (error) {
        console.error("Failed to fetch design suggestions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, [proposalId]);

  const handleApply = async (css: string) => {
    setLoading(true);
    try {
      await applyDesign(proposalId, css);
      onApplyDesign(css); // Notify parent to refresh preview
    } catch (error) {
      console.error("Failed to apply design:", error);
      alert("Failed to apply design. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-4xl h-3/4 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Explore Designs</h2>
        {loading && <div className="text-center">Loading designs...</div>}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="border rounded-lg p-2 cursor-pointer hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-100 mb-2 overflow-hidden">
                  {/* This is a simple representation. A better way would be a mini-iframe or an image thumbnail */}
                  <div
                    className="w-full h-full scale-50 origin-top-left border"
                    dangerouslySetInnerHTML={{ __html: `<style>${suggestion.css}</style><div class="p-2"><h1 class="text-lg">${suggestion.prompt}</h1><p>This is a sample text.</p></div>` }}
                  ></div>
                </div>
                <h3 className="font-semibold text-center mb-2">{suggestion.prompt}</h3>
                <button
                  onClick={() => handleApply(suggestion.css)}
                  className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
