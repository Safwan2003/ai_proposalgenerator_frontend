'use client';

import { useState, useEffect, useCallback } from 'react';
import { getProposal, applyDesign, liveCustomizeDesign } from '@/lib/api';
import { useParams } from 'next/navigation';
import DesignExplorer from '@/components/ui/DesignExplorer';
import ExportModal from '@/components/ui/ExportModal';
import LiveDesignTuner from '@/components/ui/LiveDesignTuner';
import { Proposal } from '@/types/proposal';

export default function ProposalPreviewPage() {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [liveCss, setLiveCss] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isTuning, setIsTuning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDesignExplorer, setShowDesignExplorer] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const params = useParams();
  const id = params.id as string;
  const proposalId = parseInt(id, 10);

  const fetchProposal = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProposal(proposalId);
      setProposal(data);
      setLiveCss(data.custom_css || '');
      setError(null);
    } catch (err) {
      setError('Failed to load proposal. Please make sure the proposal ID is correct and the server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [proposalId]);

  useEffect(() => {
    if (proposalId) {
      fetchProposal();
    }
  }, [proposalId, fetchProposal]);

  const handleApplyAndRefresh = async (css: string) => {
    setLiveCss(css);
    setShowDesignExplorer(false);
    await applyDesign(proposalId, css);
  };

  const handleTune = async (prompt: string) => {
    setIsTuning(true);
    try {
      const result = await liveCustomizeDesign(proposalId, prompt);
      setLiveCss(result.css);
      await applyDesign(proposalId, result.css); // Persist the change
    } catch (error) {
      console.error("Failed to tune design:", error);
      alert("Failed to apply live changes. The AI might not have been able to understand the request.");
    } finally {
      setIsTuning(false);
    }
  };

  if (loading && !proposal) {
    return <div className="min-h-screen flex items-center justify-center">Loading proposal...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  if (!proposal) {
    return <div className="min-h-screen flex items-center justify-center">No proposal data found.</div>;
  }

  // A simple way to construct the HTML. In a real app, you might get this from the backend.
  const proposalHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>${liveCss}</style>
        <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
        <script>mermaid.initialize({startOnLoad:true});</script>
      </head>
      <body>
        <div class="proposal-container">
          <h1 style="text-align: center; margin-bottom: 2rem;">Proposal for ${proposal.clientName}</h1>
          ${proposal.sections.sort((a, b) => a.order - b.order).map(s => {
            let imagesHtml = '';
            if (s.image_urls && s.image_urls.length > 0) {
              if (s.image_placement === 'full-width') {
                imagesHtml = `
                  <div class="mt-4">
                    ${s.image_urls.map(url => `
                      <div style="margin-top:1rem;">
                        <img src="${url}" alt="Proposal Image" style="width:100%; height:auto; border-radius:8px;" />
                      </div>
                    `).join('')}
                  </div>
                `;
              } else if (s.image_placement === 'inline-left' || s.image_placement === 'inline-right') {
                const imageHtml = `
                  <div class="proposal-image" style="max-width:40%; margin-top:1rem;">
                    <img src="${s.image_urls[0]}" alt="Proposal Image" style="width:100%; height:auto; border-radius:8px;" />
                  </div>
                `;
                const contentHtml = `
                  <div class="proposal-text" style="flex:1; padding-left:1rem;">
                    ${s.contentHtml}
                    ${s.mermaid_chart ? `<div class="mermaid">${s.mermaid_chart}</div>` : ''}
                  </div>
                `;
                if (s.image_placement === 'inline-left') {
                  imagesHtml = `<div class="inline-row" style="display:flex; align-items:flex-start; gap:1rem;">${imageHtml}${contentHtml}</div>`;
                } else {
                  imagesHtml = `<div class="inline-row" style="display:flex; align-items:flex-start; gap:1rem;">${contentHtml}${imageHtml}</div>`;
                }
              } else {
                imagesHtml = `
                  <div class="mt-4 grid grid-cols-2 gap-3">
                    ${s.image_urls.map(url => `
                      <div>
                        <img src="${url}" alt="Proposal Image" style="max-width:100%; height:auto; border-radius:8px;" />
                      </div>
                    `).join('')}
                  </div>
                `;
              }
            }

            if (s.image_placement === 'inline-left' || s.image_placement === 'inline-right') {
              return `
                <div class="proposal-section">
                  <h2>${s.title}</h2>
                  ${imagesHtml}
                </div>
              `;
            } else {
              return `
                <div class="proposal-section">
                  <h2>${s.title}</h2>
                  <div>${s.contentHtml}</div>
                  ${imagesHtml}
                  ${s.mermaid_chart ? `<div class="mermaid">${s.mermaid_chart}</div>` : ''}
                </div>
              `;
            }
          }).join('')}
        </div>
      </body>
    </html>
  `;

  return (
    <div className="relative w-full h-screen bg-gray-200">
      <iframe
        key={liveCss} // Force re-render when CSS changes
        srcDoc={proposalHtml}
        className="w-full h-full border-none shadow-2xl mx-auto max-w-screen-2xl"
        title="Proposal Preview"
        sandbox="allow-scripts allow-same-origin"
      />

      {/* Floating Action Bar */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg">
        <button 
          onClick={() => setShowDesignExplorer(true)}
          className="bg-indigo-600 text-white rounded-full p-3 hover:bg-indigo-700 transition-transform transform hover:scale-110"
          title="Explore Designs"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l.707-.707M6.343 17.657l-.707.707m12.728 0l.707.707M12 21v-1m0-10a5 5 0 00-5 5h10a5 5 0 00-5-5z" /></svg>
        </button>
        <button 
          onClick={() => setShowExportModal(true)}
          className="bg-green-600 text-white rounded-full p-3 hover:bg-green-700 transition-transform transform hover:scale-110"
          title="Export Proposal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        </button>
      </div>

      <LiveDesignTuner isTuning={isTuning} onTune={handleTune} />

      {showDesignExplorer && (
        <DesignExplorer 
          proposalId={proposalId} 
          onApplyDesign={handleApplyAndRefresh} 
          onClose={() => setShowDesignExplorer(false)} 
        />
      )}

      {showExportModal && (
        <ExportModal 
          proposalId={proposalId} 
          onClose={() => setShowExportModal(false)} 
        />
      )}
    </div>
  );
}