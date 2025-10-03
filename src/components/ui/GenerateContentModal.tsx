'use client';

import { useState } from 'react';
import { generateContentForSection } from '@/lib/api';

interface GenerateContentModalProps {
  open: boolean;
  onClose: () => void;
  proposalId: number | null;
  sectionId: number | null;
  onContentGenerated: () => void;
}

export default function GenerateContentModal({ open, onClose, proposalId, sectionId, onContentGenerated }: GenerateContentModalProps) {
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleGenerate = async () => {
    if (!proposalId || !sectionId || !keywords.trim()) {
      setError('Please provide keywords and ensure a proposal and section are selected.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await generateContentForSection(proposalId, sectionId, keywords);
      onContentGenerated(); // Notify parent to refresh section content
      onClose();
    } catch (err) {
      console.error('Error generating content:', err);
      setError('Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Generate Content with AI</h2>
        <p className="mb-4">Enter keywords or a brief description to generate content for this section.</p>
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
          rows={5}
          placeholder="e.g., 'Introduction to project management, benefits of agile methodology'"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          disabled={loading}
        ></textarea>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Content'}
          </button>
        </div>
      </div>
    </div>
  );
}