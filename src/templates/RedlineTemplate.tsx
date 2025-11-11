import React from 'react';

const RedlineTemplate = ({ proposal: rawProposal }: { proposal: any }) => {
  const proposal = rawProposal || {};
  const { clientName, totalAmount, startDate, endDate, companyInfo, sections, tech_stack } = proposal;

  const exportAsPDF = () => {
    // Simple fallback: invoke browser print for now
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div id="redline-template" className="p-10 bg-white" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Inter, sans-serif' }}>
        <header className="flex justify-between items-center pb-8 border-b-2 border-gray-200">
          <div>
            <h1 className="text-5xl font-bold text-gray-900">{companyInfo?.name || 'Your Company'}</h1>
            <p className="text-xl text-gray-600">Proposal for {clientName || 'Client Name'}</p>
          </div>
          {companyInfo?.logoUrl && (
            <img src={companyInfo.logoUrl} alt="Company Logo" className="max-h-24" />
          )}
        </header>

        <main className="mt-10">
          <h2 className="text-4xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-4 mb-8">Proposal Overview</h2>
          <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-xl">
            <div className="p-4 bg-gray-50 rounded-lg"><strong>Client:</strong> {clientName || 'N/A'}</div>
            <div className="p-4 bg-gray-50 rounded-lg"><strong>Total Amount:</strong> ${totalAmount ? totalAmount.toLocaleString() : 'N/A'}</div>
            <div className="p-4 bg-gray-50 rounded-lg"><strong>Start Date:</strong> {startDate ? new Date(startDate).toLocaleDateString() : 'N/A'}</div>
            <div className="p-4 bg-gray-50 rounded-lg"><strong>End Date:</strong> {endDate ? new Date(endDate).toLocaleDateString() : 'N/A'}</div>
          </div>

          {tech_stack && tech_stack.length > 0 && (
            <div className="mt-12">
              <h3 className="text-3xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-3 mb-6">Proposed Technology Stack</h3>
              <div className="flex flex-wrap gap-6 justify-center">
                {tech_stack.map((tech: any, index: number) => (
                  <div key={index} className="flex flex-col items-center">
                    <img src={tech.logo_url} alt={tech.name} className="h-20 w-20 object-contain" />
                    <p className="mt-2 text-md">{tech.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12">
            {sections && sections.sort((a: any, b: any) => b.order - a.order).map((section: any) => {
              if (!section || !section.contentHtml) return null;
              
              const originalContent = section.versions?.[0]?.contentHtml || section.contentHtml;
              
              return (
                <div key={section.id} className="mb-12 break-after-page">
                  <h3 className="text-3xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-gray-200">{section.title}</h3>
                  <div className="prose prose-xl max-w-none" dangerouslySetInnerHTML={{ __html: section.contentHtml }} />
                  
                  {section.mermaid_chart && (
                    <div className="mt-8 flex justify-center">
                      <div className="mermaid" data-mermaid={section.mermaid_chart}>
                        {section.mermaid_chart}
                      </div>
                    </div>
                  )}

                  {section.images && section.images.length > 0 && (
                    <div className="mt-8 grid grid-cols-2 gap-6">
                      {section.images.map((image: any, index: number) => (
                        <img key={index} src={image.url} alt={image.alt || `visual-${index}`} className="max-w-full rounded-lg shadow-md" />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>

        <footer className="mt-20 pt-8 border-t-2 border-gray-200 text-center text-gray-500">
          <p>{companyInfo?.contact || 'Your Contact Info'}</p>
          <p>{companyInfo?.name || 'Your Company'} &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>

      <button
        onClick={exportAsPDF}
        className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition"
      >
        Export as PDF
      </button>

    </div>
  );
};

export default RedlineTemplate;
