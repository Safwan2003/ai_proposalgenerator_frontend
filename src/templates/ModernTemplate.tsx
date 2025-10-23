import React from 'react';
import MermaidChart from '../components/MermaidChart';

const ModernTemplate = ({ proposal }) => {
  if (!proposal) return <div>Loading proposal...</div>;

  // Helper to find a specific section by title
  const findSection = (title) => {
    const lowercasedTitle = title.toLowerCase();
    return proposal.sections?.find(s => s.title.toLowerCase().includes(lowercasedTitle));
  };

  const techStackSection = findSection('technology stack');

  return (
    <div className="font-sans bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center p-10 md:p-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Proposal for {proposal.clientName}</h1>
          <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto">{proposal.rfpText}</p>
        </header>

        {/* Main Content */}
        <main className="p-8 md:p-12">
          {proposal.sections
            ?.sort((a, b) => a.order - b.order)
            .map((section) => {
              // Skip rendering the tech stack section in the main loop
              if (section.title.toLowerCase().includes('technology stack')) {
                return null;
              }
              return (
                <section key={section.id} className="mb-12">
                  <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 border-l-4 border-blue-500 pl-4 mb-6">
                    {section.title}
                  </h2>
                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                    {section.image_urls?.map((url, index) => (
                      <img key={index} src={url} alt={`${section.title} visual ${index + 1}`} className="rounded-lg shadow-md my-6" />
                    ))}
                    <div dangerouslySetInnerHTML={{ __html: section.contentHtml }} />
                    {section.mermaid_chart && <MermaidChart chart={section.mermaid_chart} />}
                  </div>
                </section>
              );
            })}

          {/* Dedicated Tech Stack Section */}
          {techStackSection && (
            <section key={techStackSection.id} className="mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 border-l-4 border-blue-500 pl-4 mb-6">
                {techStackSection.title}
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: techStackSection.contentHtml }} />
              
              {/* RENDER THE TECH LOGOS */}
              {techStackSection.tech_logos && techStackSection.tech_logos.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">Technologies We Use</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 text-center">
                    {techStackSection.tech_logos.map((logo, index) => (
                      <div key={index} className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg">
                        <img src={logo.logo_url} alt={logo.name} className="h-16 object-contain" />
                        <p className="text-sm font-medium text-gray-600 mt-2">{logo.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 px-8 py-6 bg-gray-50 border-t">
          <p>© {new Date().getFullYear()} {proposal.companyName} • {proposal.companyContact}</p>
        </footer>
      </div>
    </div>
  );
};

export default ModernTemplate;
