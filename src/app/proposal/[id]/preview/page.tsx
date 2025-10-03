'use client';

import { useState, useEffect } from 'react';
import { getProposalPreviewHtml } from '@/lib/api';
import { useParams } from 'next/navigation';

export default function ProposalPreviewPage() {
  const [proposalHtml, setProposalHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (id) {
      const fetchProposalHtml = async () => {
        try {
          setLoading(true);
          const proposalId = parseInt(id, 10);
          const data = await getProposalPreviewHtml(proposalId);
          setProposalHtml(data);
          setError(null);
        } catch (err) {
          setError('Failed to load proposal preview. Please make sure the proposal ID is correct and the server is running.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchProposalHtml();
    }
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading proposal preview...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  if (!proposalHtml) {
    return <div className="min-h-screen flex items-center justify-center">No proposal data found.</div>;
  }

  return (
    <iframe
      srcDoc={proposalHtml}
      className="w-full h-screen border-none"
      title="Proposal Preview"
      sandbox="allow-same-origin"
    />
  );
}