'use client';

import { useState, useEffect } from 'react';

interface ChartWizardModalProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (description: string, chartType: 'flowchart' | 'gantt' | 'sequence' | 'mindmap' | 'pie' | 'user_journey' | 'c4') => void;
  onFix: (mermaidCode: string) => void;
  loading: boolean;
  suggestedChartType?: string | null;
  currentMermaidCode?: string;
}

export default function ChartWizardModal({ open, onClose, onGenerate, onFix, loading, suggestedChartType, currentMermaidCode }: ChartWizardModalProps) {
  const [description, setDescription] = useState('');
  const [chartType, setChartType] = useState<'flowchart' | 'gantt' | 'sequence' | 'mindmap' | 'pie' | 'user_journey' | 'c4'>('flowchart');

  useEffect(() => {
    if (suggestedChartType) {
      setChartType(suggestedChartType as 'flowchart' | 'gantt' | 'sequence' | 'mindmap' | 'pie' | 'user_journey' | 'c4');
    }
  }, [suggestedChartType]);

  if (!open) return null;

  const handleGenerate = () => {
    if (description.trim()) {
      onGenerate(description, chartType);
    }
  };

  const handleFix = () => {
    if (currentMermaidCode) {
      onFix(currentMermaidCode);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Generate or Fix a Chart</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="chart-description" className="block text-sm font-medium text-gray-700 mb-1">
              Describe the process or data (for new charts):
            </label>
            <textarea
              id="chart-description"
              rows={5}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., 'User logs in, then views the dashboard. Or, for a pie chart: Marketing: 40%, Sales: 60%'"
            />
          </div>
          <div>
            <label htmlFor="chart-type" className="block text-sm font-medium text-gray-700 mb-1">
              Chart Type (for new charts):
            </label>
            <select
              id="chart-type"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={chartType}
              onChange={(e) => setChartType(e.target.value as 'flowchart' | 'gantt' | 'sequence' | 'mindmap' | 'pie' | 'user_journey' | 'c4')}
            >
              <option value="flowchart">Flowchart</option>
              <option value="gantt">Gantt Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="sequence">Sequence Diagram</option>
              <option value="mindmap">Mind Map</option>
              <option value="user_journey">User Journey</option>
              <option value="c4">C4 Diagram</option>
            </select>
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
          {currentMermaidCode && (
            <button
              onClick={handleFix}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 shadow-sm disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'Fixing...' : 'Fix Chart'}
            </button>
          )}
          <button
            onClick={handleGenerate}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm disabled:bg-gray-400"
            disabled={!description.trim() || loading}
          >
            {loading ? 'Generating...' : 'Generate Chart'}
          </button>
        </div>
      </div>
    </div>
  );
}