import React from 'react';
import MermaidChart from '../components/MermaidChart';

const ClassicTemplate = ({ proposal, designTokens }) => {
  if (!proposal) return <div>Loading proposal...</div>;

  const tokens = {
    fonts: {
      heading: designTokens?.fonts?.heading || "'Poppins', sans-serif",
      body: designTokens?.fonts?.body || "'Inter', sans-serif",
    },
    colors: {
      primary: designTokens?.colors?.primary || '#0052cc',
      secondary: designTokens?.colors?.secondary || '#172b4d',
      text: designTokens?.colors?.textPrimary || '#2f2f2f',
      background: designTokens?.colors?.background || '#f8fafc',
      surface: designTokens?.colors?.surface || '#ffffff',
      border: designTokens?.colors?.border || '#e5e7eb',
      accent: designTokens?.colors?.accent || '#38bdf8',
    },
    layout: {
      maxWidth: designTokens?.layout?.proposalMaxWidth || '1000px',
    },
  };

  const styles = `
    .classic-container {
      font-family: ${tokens.fonts.body};
      color: ${tokens.colors.text};
      background: linear-gradient(180deg, ${tokens.colors.background} 0%, ${tokens.colors.surface} 100%);
      min-height: 100vh;
      padding: 3rem 1.5rem;
      display: flex;
      justify-content: center;
    }

    .classic-inner {
      background-color: ${tokens.colors.surface};
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
      border-radius: 24px;
      padding: 3.5rem 3rem;
      width: 100%;
      max-width: ${tokens.layout.maxWidth};
      animation: fadeIn 0.6s ease;
      position: relative;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .classic-header {
      text-align: center;
      margin-bottom: 3rem;
      border-bottom: 2px solid ${tokens.colors.primary};
      padding-bottom: 2rem;
      position: relative;
    }

    .classic-header::after {
      content: "";
      position: absolute;
      bottom: -1px;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 4px;
      background: ${tokens.colors.accent};
      border-radius: 4px;
    }

    .classic-header img {
      max-height: 90px;
      margin-bottom: 1.25rem;
      transition: transform 0.3s ease;
    }

    .classic-header img:hover {
      transform: scale(1.05);
    }

    .classic-h1 {
      font-family: ${tokens.fonts.heading};
      font-size: 2.8rem;
      color: ${tokens.colors.primary};
      font-weight: 700;
      margin: 0.5rem 0;
      letter-spacing: -0.5px;
    }

    .classic-subtitle {
      font-size: 1.15rem;
      color: ${tokens.colors.secondary};
      opacity: 0.85;
      margin-top: 0.3rem;
    }

    .classic-section {
      margin-bottom: 3.5rem;
      padding: 2rem 2.5rem;
      background: ${tokens.colors.background};
      border-radius: 16px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(0,0,0,0.03);
    }

    .classic-section:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.06);
    }

    .classic-h2 {
      font-family: ${tokens.fonts.heading};
      font-size: 1.9rem;
      color: ${tokens.colors.secondary};
      border-left: 5px solid ${tokens.colors.primary};
      padding-left: 0.75rem;
      margin-bottom: 1.25rem;
      font-weight: 600;
    }

    .classic-content {
      line-height: 1.75;
      font-size: 1.1rem;
      color: ${tokens.colors.text};
    }

    .classic-content p {
      margin-bottom: 1rem;
    }

    .classic-content ul, .classic-content ol {
      margin-left: 1.5rem;
      margin-bottom: 1.25rem;
    }

    .classic-content li {
      margin-bottom: 0.5rem;
    }

    .classic-content table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1.5rem;
      margin-bottom: 2rem;
      border-radius: 8px;
      overflow: hidden;
      font-size: 1rem;
    }

    .classic-content th, .classic-content td {
      border: 1px solid ${tokens.colors.border};
      padding: 0.85rem 1rem;
    }

    .classic-content th {
      background-color: ${tokens.colors.surface};
      color: ${tokens.colors.secondary};
      font-weight: 600;
    }

    .classic-content tr:nth-child(even) {
      background-color: ${tokens.colors.background};
    }

    .classic-content img {
      width: 100%;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      margin: 1.5rem 0;
    }

    /* TECH LOGOS */
    .tech-logos-wrapper {
      margin-top: 2rem;
      padding: 1.5rem;
      background-color: ${tokens.colors.surface};
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      text-align: center;
    }

    .tech-logos-title {
      font-family: ${tokens.fonts.heading};
      font-size: 1.5rem;
      color: ${tokens.colors.secondary};
      margin-bottom: 1.5rem;
      font-weight: 600;
    }

    .tech-logos {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      justify-content: center;
      align-items: center;
    }

    .tech-logos img {
      height: 50px;
      filter: grayscale(90%);
      opacity: 0.7;
      transition: all 0.3s ease;
    }

    .tech-logos img:hover {
      filter: grayscale(0%);
      opacity: 1;
      transform: scale(1.1);
    }

    .proposal-footer {
      text-align: center;
      border-top: 1px solid ${tokens.colors.border};
      padding-top: 1.5rem;
      font-size: 0.9rem;
      color: ${tokens.colors.secondary};
      opacity: 0.8;
    }
  `;

  return (
    <div className="classic-container">
      <style>{styles}</style>
      <div className="classic-inner">
        <header className="classic-header">
          {proposal.companyLogoUrl && (
            <img src={proposal.companyLogoUrl} alt="Company Logo" />
          )}
          <h1 className="classic-h1">{proposal.clientName}</h1>
          <div className="classic-subtitle">{proposal.companyName}</div>
        </header>

        <main>
          {proposal.sections
            ?.sort((a, b) => a.order - b.order)
            .map((section) => (
              <section key={section.id} className="classic-section">
                <h2 className="classic-h2">{section.title}</h2>
                <div className="classic-content">
                  {section.image_placement === 'full-width-top' &&
                    section.image_urls?.map((url, index) => (
                      <img key={index} src={url} alt="Section" />
                    ))}
                  <div dangerouslySetInnerHTML={{ __html: section.contentHtml }} />
                  {section.mermaid_chart && (
                    <MermaidChart chart={section.mermaid_chart} />
                  )}
                  {section.image_placement === 'full-width-bottom' &&
                    section.image_urls?.map((url, index) => (
                      <img key={index} src={url} alt="Section" />
                    ))}
                  
                  {/* Render Tech Logos for Technology Stack section */}
                  {section.title.toLowerCase().includes('technology stack') && section.tech_logos && section.tech_logos.length > 0 && (
                    <div className="tech-logos-wrapper">
                      <h3 className="tech-logos-title">Technologies We Use</h3>
                      <div className="tech-logos">
                        {section.tech_logos.map((logo, index) => (
                          <img key={index} src={logo.logo_url} alt={logo.name} title={logo.name} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            ))}
        </main>



        <footer className="proposal-footer">
          © {new Date().getFullYear()} {proposal.companyName} · {proposal.companyContact}
        </footer>
      </div>
    </div>
  );
};

export default ClassicTemplate;
