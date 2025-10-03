'use client';

import { useState, useEffect } from 'react';

interface ManageSectionsModalProps {
  open: boolean;
  onClose: () => void;
  sections: { id: number; title: string }[];
  onSave: (sections: { id: number; title: string }[]) => void;
}

export default function ManageSectionsModal({ open, onClose, sections: initialSections, onSave }: ManageSectionsModalProps) {
  const [sections, setSections] = useState(initialSections);

  useEffect(() => {
    setSections(initialSections);
  }, [initialSections]);

  if (!open) return null;

  const handleAddSection = () => {
    setSections([...sections, { id: Date.now(), title: 'New Section', image_urls: [] }]);
  };

  const handleDeleteSection = (id: number) => {
    setSections(sections.filter(section => section.id !== id));
  };

  const handleTitleChange = (id: number, newTitle: string) => {
    setSections(sections.map(section => section.id === id ? { ...section, title: newTitle } : section));
  };

  const handleSave = () => {
    onSave(sections);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-1/2">
        <h2 className="text-2xl font-bold mb-4">Manage Proposal Sections</h2>
        <div className="space-y-4">
          {sections.map(section => (
            <div key={section.id} className="flex items-center gap-4">
              <input
                type="text"
                value={section.title}
                onChange={(e) => handleTitleChange(section.id, e.target.value)}
                className="flex-grow mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              />
              <button
                onClick={() => handleDeleteSection(section.id)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          <button
            onClick={handleAddSection}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Section
          </button>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}