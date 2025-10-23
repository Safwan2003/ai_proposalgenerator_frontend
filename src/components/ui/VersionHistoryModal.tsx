'use client';

import { useState, useEffect } from 'react';
import { getSectionVersions, revertSection } from '@/lib/api';
import { format } from 'date-fns';

interface VersionHistoryModalProps {
  open: boolean;
  onClose: () => void;
  sectionId: number | null;
  onRevert: () => void;
}

interface Version {
  id: number;
  created_at: string;
  contentHtml: string;
  // Add other properties if they exist and are used
}

export default function VersionHistoryModal({ open, onClose, sectionId, onRevert }: VersionHistoryModalProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && sectionId) {
      setLoading(true);
      setError(null);
      const fetchVersions = async () => {
        try {
          const fetchedVersions = await getSectionVersions(sectionId);
          setVersions(fetchedVersions);
        } catch (err) {
          console.error('Error fetching section versions:', err);
          setError('Failed to load version history.');
        } finally {
          setLoading(false);
        }
      };
      fetchVersions();
    }
  }, [open, sectionId]);

  const handleRevert = async (versionId: number) => {
    if (sectionId && confirm('Are you sure you want to revert to this version? This action cannot be undone.')) {
      try {
        await revertSection(sectionId, versionId);
        onRevert(); // Notify parent to refresh section content
        onClose();
      } catch (err) {
        console.error('Error reverting section:', err);
        setError('Failed to revert to this version.');
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Version History</h2>
        {loading && <p>Loading versions...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && versions.length === 0 && <p>No previous versions found for this section.</p>}
        {!loading && versions.length > 0 && (
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md p-2">
            {versions.map((version) => (
              <div key={version.id} className="p-3 border-b border-gray-100 last:border-b-0 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Version ID: {version.id}</p>
                  <p className="text-sm text-gray-600">Created: {format(new Date(version.created_at), 'PPP p')}</p>
                  <div className="mt-2 p-2 bg-gray-50 rounded-md text-sm text-gray-800 max-h-20 overflow-y-auto" dangerouslySetInnerHTML={{ __html: version.contentHtml }} />
                </div>
                <button
                  onClick={() => handleRevert(version.id)}
                  className="ml-4 bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3 rounded"
                >
                  Revert
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}