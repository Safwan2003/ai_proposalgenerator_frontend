'use client';

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import MermaidChart from './MermaidChart';

interface InteractiveMermaidProps {
  initialChart: string;
  onSave: (newChart: string) => void;
}

const InteractiveMermaid: React.FC<InteractiveMermaidProps> = ({ initialChart, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [code, setCode] = useState(initialChart);

  useEffect(() => {
    setCode(initialChart);
  }, [initialChart]);

  const handleSave = () => {
    onSave(code);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCode(initialChart);
    setIsEditing(false);
  };

  return (
    <div className="interactive-mermaid border rounded-lg p-4">
      {isEditing ? (
        <div>
          <Editor
            height="400px"
            defaultLanguage="markdown"
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
          />
          <div className="mt-4 flex justify-end space-x-2">
            <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Save</button>
          </div>
        </div>
      ) : (
        <div>
          <MermaidChart chart={code} />
          <button onClick={() => setIsEditing(true)} className="mt-2 px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 shadow-sm">Edit Diagram</button>
        </div>
      )}
    </div>
  );
};

export default InteractiveMermaid;
